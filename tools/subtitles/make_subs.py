"""Elocia: membuat subtitle untuk video kursus yang belum punya.

- English: transkripsi offline dengan Whisper (faster-whisper, model distil-large-v3) di laptop.
- Indonesia: terjemahan natural dari teks English memakai Gemini (hanya teks yang dikirim, bukan video).

File disimpan di sebelah videonya sebagai "<nama video> (English).srt" dan "<nama video> (Indonesian).srt",
sehingga Elocia langsung memakainya. Video yang sudah punya subtitle bahasa itu dilewati, jadi skrip ini
aman dijalankan ulang kapan saja dan melanjutkan dari yang belum selesai.

Pemakaian (dari folder proyek):
  python tools/subtitles/make_subs.py --dry-run          # lihat antrean dan perkiraan waktu
  python tools/subtitles/make_subs.py                    # proses semua batch, urut sesuai rencana belajar
  python tools/subtitles/make_subs.py --batches 1        # hanya Batch 1
  python tools/subtitles/make_subs.py --only id          # hanya terjemahan Indonesia

Kunci Gemini dibaca dari elocia.local.json (tidak ikut Git) atau variabel GEMINI_API_KEY.
"""

import argparse
import ctypes
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path

APP_DIR = Path(__file__).resolve().parents[2]
STATUS_FILE = Path(os.environ.get("LOCALAPPDATA", str(Path.home()))) / "Elocia" / "subs-status.json"
VIDEO_EXT = {".mp4", ".m4v", ".mov", ".mkv", ".webm"}
SUB_EXT = {".srt", ".vtt"}
API = "https://generativelanguage.googleapis.com/v1beta"
# Video berbahasa Indonesia atau bukan materi belajar: tidak perlu subtitle buatan.
SKIP_PATHS = ("Tenses Simplified", "App Tutorials", "› Tips", "Your Questions")

MAX_LINE = 42
MAX_CHARS = 84
MAX_DUR = 6.5
MIN_DUR = 1.0
GAP_BREAK = 0.8

sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)


def log(msg):
    print(time.strftime("%H:%M:%S"), msg, flush=True)


# ---------- Mencari video sesuai rencana (sama dengan media.js) ----------
def norm(s):
    s = unicodedata.normalize("NFKC", s).replace("А", "A").replace("‘", "'").replace("’", "'")
    return re.sub(r"\s+", " ", s).strip().lower()


def child_dir(d, name):
    direct = d / name
    if direct.is_dir():
        return direct
    want = norm(name)
    for e in d.iterdir():
        if e.is_dir() and norm(e.name) == want:
            return e
    return None


def resolve(course, session_path):
    d = course
    for seg in session_path.split(" › "):
        d = child_dir(d, seg)
        if d is None:
            return None
    return d


def walk(d, depth, prefix=""):
    videos, subs = [], []
    for e in sorted(d.iterdir(), key=lambda p: p.name):
        if e.is_file():
            ext = e.suffix.lower()
            if ext in VIDEO_EXT:
                videos.append((prefix + e.name, e))
            elif ext in SUB_EXT:
                subs.append((prefix + e.name, e))
        elif e.is_dir() and depth > 0 and not re.match(r"^(__MACOSX|\.)", e.name):
            v, s = walk(e, depth - 1, f"{prefix}{e.name}/")
            videos += v
            subs += s
    return videos, subs


def leading_number(name):
    m = re.match(r"^\s*(\d+)", name)
    return int(m.group(1)) if m else None


def apply_pick(videos, pick):
    if not pick:
        return videos
    if pick.get("range"):
        a, b = pick["range"]
        return [v for v in videos if (n := leading_number(v[0].split("/")[-1])) is not None and a <= n <= b]
    if pick.get("names"):
        keys = [k.lower() for k in pick["names"]]
        return [v for v in videos if any(k in v[0].lower() for k in keys)]
    return videos


def stem(name):
    return re.sub(r"\.[^./]+$", "", name)


def lang_of(name):
    n = stem(name).lower()
    if re.search(r"indonesian|indonesia|bahasa|(^|[\s\-_.(])(id|ind|indo)(\)|$|[\s\-_.])", n):
        return "id", True
    if re.search(r"english|(^|[\s\-_.(])(en|eng)(\)|$|[\s\-_.])", n):
        return "en", True
    return "en", False


def number_key(name):
    m = re.match(r"^\D*\d+", stem(name).lower())
    return m.group(0).strip() if m else None


def subs_for(video_rel, subs):
    """Subtitle yang sudah ada untuk video, per bahasa: {lang: path}."""
    base = stem(video_rel).lower()
    found = [s for s in subs if s[0].lower().startswith(base)]
    if not found:
        key = number_key(video_rel.split("/")[-1])
        if key:
            found = [s for s in subs if lang_of(s[0].split("/")[-1])[1] and number_key(s[0].split("/")[-1]) == key]
    out = {}
    for rel, p in found:
        lang, _ = lang_of(rel.split("/")[-1])
        out.setdefault(lang, p)
    return out


def build_queue(course, batches):
    plan = json.loads(subprocess.run(["node", str(APP_DIR / "tools" / "subtitles" / "plan.js")], capture_output=True, text=True, encoding="utf-8", check=True).stdout)
    seen, queue = set(), []
    for s in plan:
        if s["batch"] not in batches or any(k in s["path"] for k in SKIP_PATHS):
            continue
        d = resolve(course, s["path"])
        if d is None:
            continue
        videos, subs = walk(d, 2)
        for rel, p in apply_pick(videos, s["pick"]):
            if p in seen:
                continue
            seen.add(p)
            have = subs_for(rel, subs)
            queue.append({"video": p, "batch": s["batch"], "week": s["week"], "have": have})
    return queue


def duration(p):
    try:
        import av

        with av.open(str(p)) as c:
            return (c.duration or 0) / 1_000_000
    except Exception:
        return 0


# ---------- Membuat potongan subtitle yang enak dibaca ----------
def fmt_ts(t):
    t = max(0, t)
    h, rem = divmod(int(round(t * 1000)), 3_600_000)
    m, rem = divmod(rem, 60_000)
    s, ms = divmod(rem, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def wrap(text):
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= MAX_LINE:
        return text
    mid = len(text) // 2
    spaces = [i for i, ch in enumerate(text) if ch == " "]
    if not spaces:
        return text
    cut = min(spaces, key=lambda i: abs(i - mid))
    return text[:cut] + "\n" + text[cut + 1 :]


def join_words(words):
    return re.sub(r"\s+", " ", "".join(w.word for w in words)).strip()


def build_cues(words):
    cues, cur = [], []

    def flush():
        if cur:
            text = join_words(cur)
            if text:
                cues.append([cur[0].start, cur[-1].end, text])
            cur.clear()

    for w in words:
        if cur:
            gap = w.start - cur[-1].end
            if gap > GAP_BREAK or len(join_words(cur + [w])) > MAX_CHARS or (w.end - cur[0].start) > MAX_DUR:
                flush()
        cur.append(w)
        token = w.word.strip()
        span = cur[-1].end - cur[0].start
        if token.endswith((".", "?", "!")) and span >= 1.2:
            flush()
        elif token.endswith((",", ";", ":")) and len(join_words(cur)) >= 55:
            flush()
    flush()

    # Buang pengulangan beruntun (kadang muncul di bagian hening) dan rapikan waktu tampil.
    cleaned = []
    for c in cues:
        if cleaned and c[2] == cleaned[-1][2]:
            cleaned[-1][1] = c[1]
            continue
        cleaned.append(c)
    for i, c in enumerate(cleaned):
        nxt = cleaned[i + 1][0] if i + 1 < len(cleaned) else c[1] + 2
        c[1] = min(max(c[1] + 0.2, c[0] + MIN_DUR), nxt - 0.05)
    return cleaned


def write_srt(path, cues):
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8", newline="\n") as f:
        for i, (a, b, text) in enumerate(cues, 1):
            f.write(f"{i}\n{fmt_ts(a)} --> {fmt_ts(b)}\n{wrap(text)}\n\n")
    os.replace(tmp, path)


def read_subs(path):
    """Membaca SRT/VTT menjadi [start, end, text]."""
    text = path.read_text(encoding="utf-8", errors="replace").replace("﻿", "").replace("\r", "")
    cues = []
    ts = r"(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{3})"

    def secs(m, off):
        h = int(m.group(off) or 0)
        return h * 3600 + int(m.group(off + 1)) * 60 + int(m.group(off + 2)) + int(m.group(off + 3)) / 1000

    for block in re.split(r"\n\s*\n", text):
        lines = [l for l in block.split("\n") if l.strip()]
        for i, line in enumerate(lines):
            m = re.match(ts + r"\s*-->\s*" + ts, line.strip())
            if m:
                body = " ".join(re.sub(r"<[^>]+>|\{[^}]+\}", "", l).strip() for l in lines[i + 1 :]).strip()
                if body:
                    cues.append([secs(m, 1), secs(m, 5), body])
                break
    return cues


# ---------- Whisper ----------
_model = None


def whisper(model_name, threads):
    global _model
    if _model is None:
        from faster_whisper import WhisperModel

        log(f"Memuat model Whisper {model_name} (pertama kali akan diunduh)...")
        _model = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=threads)
    return _model


def load_audio(path, rate=16000):
    """Audio mono 16 kHz sebagai float32. Dibaca sendiri karena pembaca bawaan faster-whisper
    memakai parameter PyAV lama yang tidak ada lagi di PyAV versi baru."""
    import av
    import numpy as np

    chunks = []
    with av.open(str(path)) as container:
        stream = next(s for s in container.streams if s.type == "audio")
        resampler = av.AudioResampler(format="s16", layout="mono", rate=rate)
        for frame in container.decode(stream):
            for out in resampler.resample(frame):
                chunks.append(out.to_ndarray().reshape(-1))
        for out in resampler.resample(None):
            chunks.append(out.to_ndarray().reshape(-1))
    if not chunks:
        return np.zeros(0, dtype=np.float32)
    return np.concatenate(chunks).astype(np.float32) / 32768.0


def transcribe(video, model_name, threads):
    segments, _ = whisper(model_name, threads).transcribe(
        load_audio(video),
        language="en",
        beam_size=5,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 500},
        word_timestamps=True,
        condition_on_previous_text=False,
    )
    words = [w for seg in segments for w in (seg.words or [])]
    return build_cues(words)


# ---------- Gemini ----------
TRANSLATE_RULES = """You translate English subtitles into Indonesian for an English-learning course whose viewers are Indonesian learners (level A2–B1).
Write the Indonesian the way a skilled subtitle translator would for a good film or YouTube video: natural, warm, conversational, easy to read at a glance. Never word-for-word, never stiff or overly formal.
Rules:
- Return a JSON array of strings with exactly the same number of items as "lines", one translation per line, in the same order. Do not merge or split lines.
- Keep grammar terms in English (present perfect, past simple, phrasal verb, noun, adjective, modal verb, etc.).
- Keep the English words, phrases and example sentences that are being taught or analysed in English, in quotes, because they are the lesson. Do translate the teacher's explanation around them.
- When the teacher speaks to the viewer, use "kamu".
- Keep names, numbers and punctuation sensible. Keep each item short enough to read quickly (ideally under 84 characters).
- Do not add explanations, notes or anything that is not in the line.
"context_before" is only for understanding; do not translate it."""


def gemini_key():
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"]
    try:
        return json.loads((APP_DIR / "elocia.local.json").read_text(encoding="utf-8")).get("geminiKey", "")
    except Exception:
        return ""


def http_json(url, body=None, timeout=120):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"} if data else {})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def gemini_models(key):
    j = http_json(f"{API}/models?pageSize=200&key={key}")
    names = [m["name"].split("/")[-1] for m in j.get("models", []) if "generateContent" in m.get("supportedGenerationMethods", [])]
    names = [n for n in names if re.match(r"^gemini-[\d.]+-flash", n) and not re.search(r"image|tts|live|audio|thinking|exp|embedding|native|vision|8b|preview", n)]
    ver = lambda n: float(re.match(r"^gemini-([\d.]+)", n).group(1))
    full = sorted([n for n in names if "lite" not in n], key=lambda n: (-ver(n), len(n)))
    lite = sorted([n for n in names if "lite" in n], key=lambda n: (-ver(n), len(n)))
    return full + lite or ["gemini-flash-latest"]


class Translator:
    def __init__(self, key):
        self.key = key
        self.models = gemini_models(key)
        self.preferred = None
        self.last_call = 0

    def _call(self, model, lines, context):
        wait = 4.5 - (time.time() - self.last_call)
        if wait > 0:
            time.sleep(wait)
        self.last_call = time.time()
        body = {
            "systemInstruction": {"parts": [{"text": TRANSLATE_RULES}]},
            "contents": [{"role": "user", "parts": [{"text": json.dumps({"context_before": context, "lines": lines}, ensure_ascii=False)}]}],
            "generationConfig": {"temperature": 0.3, "responseMimeType": "application/json", "maxOutputTokens": 8192},
        }
        j = http_json(f"{API}/models/{model}:generateContent?key={self.key}", body)
        parts = j["candidates"][0]["content"]["parts"]
        out = json.loads("".join(p.get("text", "") for p in parts if not p.get("thought")))
        if not isinstance(out, list) or len(out) != len(lines):
            raise ValueError(f"jumlah baris tidak cocok ({len(out) if isinstance(out, list) else '?'} vs {len(lines)})")
        return [re.sub(r"\s+", " ", str(x)).strip() for x in out]

    def translate(self, lines, context):
        order = ([self.preferred] if self.preferred else []) + [m for m in self.models if m != self.preferred]
        last = None
        for model in order[:5]:
            for attempt in range(3):
                try:
                    out = self._call(model, lines, context)
                    self.preferred = model
                    return out
                except urllib.error.HTTPError as e:
                    last = e
                    if e.code == 429:
                        time.sleep(30 * (attempt + 1))
                        continue
                    if e.code in (400, 401, 403):
                        raise RuntimeError(f"Kunci Gemini ditolak ({e.code}).") from e
                    break  # 404/500/503: coba model berikutnya
                except (ValueError, KeyError, json.JSONDecodeError, TimeoutError, urllib.error.URLError) as e:
                    last = e
                    time.sleep(3)
        raise RuntimeError(f"Terjemahan gagal: {last}")


def translate_cues(tr, cues, chunk=30):
    out = []
    for i in range(0, len(cues), chunk):
        part = cues[i : i + chunk]
        context = [c[2] for c in cues[max(0, i - 4) : i]]
        texts = tr.translate([c[2] for c in part], context)
        out += [[c[0], c[1], t] for c, t in zip(part, texts)]
    return out


# ---------- Utama ----------
def below_normal_priority():
    if os.name == "nt":
        try:
            k32 = ctypes.windll.kernel32
            # HANDLE 64-bit: tanpa restype/argtypes, pseudo-handle -1 terpotong menjadi 32-bit dan panggilan gagal.
            k32.GetCurrentProcess.restype = ctypes.c_void_p
            k32.SetPriorityClass.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
            k32.SetPriorityClass(k32.GetCurrentProcess(), 0x4000)  # BELOW_NORMAL_PRIORITY_CLASS
        except Exception:
            pass


def save_status(**kw):
    try:
        STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
        STATUS_FILE.write_text(json.dumps(dict(kw, updated=time.strftime("%Y-%m-%d %H:%M:%S")), ensure_ascii=False, indent=1), encoding="utf-8")
    except Exception:
        pass


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--course", default=str(Path.home() / "Downloads" / "World-Class English and Professional Skills"))
    ap.add_argument("--batches", default="1,2,3,4")
    ap.add_argument("--only", choices=["en", "id"])
    ap.add_argument("--model", default="distil-large-v3")
    ap.add_argument("--threads", type=int, default=max(2, (os.cpu_count() or 4) - 2))
    ap.add_argument("--limit", type=int, default=0, help="berhenti setelah N video (untuk uji)")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--cleanup-when-done", action="store_true", help="hapus lingkungan Whisper dan modelnya kalau semua subtitle sudah lengkap")
    args = ap.parse_args()

    course = Path(args.course)
    queue = build_queue(course, {int(b) for b in args.batches.split(",")})
    need_en = [q for q in queue if "en" not in q["have"]] if args.only != "id" else []
    need_id = [q for q in queue if "id" not in q["have"]] if args.only != "en" else []
    todo = [q for q in queue if q in need_en or q in need_id]
    if args.limit:
        todo = todo[: args.limit]

    total_min = sum(duration(q["video"]) for q in need_en if q in todo) / 60
    log(f"Antrean: {len(todo)} video | butuh English: {sum(q in todo for q in need_en)} (±{total_min:.0f} menit audio) | butuh Indonesia: {sum(q in todo for q in need_id)}")
    if args.dry_run:
        for q in todo[:15]:
            log(f"  B{q['batch']} M{q['week']}: {q['video'].relative_to(course)} | ada: {','.join(q['have']) or '-'}")
        return

    below_normal_priority()
    key = gemini_key() if need_id else ""
    tr = Translator(key) if key else None
    if need_id and not tr:
        log("Kunci Gemini tidak ditemukan; terjemahan Indonesia dilewati.")

    # Terjemahan (jaringan) berjalan di thread terpisah sementara Whisper (CPU) mengerjakan video berikutnya.
    from concurrent.futures import ThreadPoolExecutor

    pool = ThreadPoolExecutor(max_workers=1)
    stop_translation = {"reason": None}
    counts = {"en": 0, "id": 0}

    def translate_job(idx, v, name, en_path):
        if stop_translation["reason"]:
            return
        try:
            cues = read_subs(Path(en_path))
            if cues:
                id_cues = translate_cues(tr, cues)
                write_srt(v.with_name(f"{v.stem} (Indonesian).srt"), id_cues)
                counts["id"] += 1
                log(f"[{idx}/{len(todo)}] ID {len(id_cues)} baris ({tr.preferred}): {name}")
        except RuntimeError as e:
            log(f"[{idx}/{len(todo)}] Terjemahan berhenti: {e}")
            if "Kunci" in str(e):
                stop_translation["reason"] = str(e)
        except Exception as e:
            log(f"[{idx}/{len(todo)}] Terjemahan gagal, dilewati: {name} ({type(e).__name__}: {e})")

    started = time.time()
    for idx, q in enumerate(todo, 1):
        v = q["video"]
        name = v.relative_to(course)
        save_status(state="berjalan", english=counts["en"], indonesia=counts["id"], total=len(todo), current=str(name))
        try:
            en_path = q["have"].get("en")
            if q in need_en:
                t0 = time.time()
                cues = transcribe(v, args.model, args.threads)
                if not cues:
                    log(f"[{idx}/{len(todo)}] Tidak ada ucapan terdeteksi: {name}")
                    continue
                en_path = v.with_name(f"{v.stem} (English).srt")
                write_srt(en_path, cues)
                counts["en"] += 1
                log(f"[{idx}/{len(todo)}] EN {len(cues)} baris, {time.time() - t0:.0f} dtk: {name}")
            if q in need_id and tr and en_path:
                pool.submit(translate_job, idx, v, name, en_path)
        except Exception as e:
            log(f"[{idx}/{len(todo)}] Gagal, dilewati: {name} ({type(e).__name__}: {e})")
    log("Transkripsi selesai, menunggu terjemahan yang tersisa...")
    pool.shutdown(wait=True)
    minutes = round((time.time() - started) / 60)
    save_status(state="selesai", english=counts["en"], indonesia=counts["id"], total=len(todo), minutes=minutes)
    log(f"Selesai dalam {minutes} menit: {counts['en']} subtitle English dan {counts['id']} subtitle Indonesia dibuat.")

    if args.cleanup_when_done:
        remaining = build_queue(course, {int(b) for b in args.batches.split(",")})
        left = [q for q in remaining if "en" not in q["have"] or "id" not in q["have"]]
        if left:
            log(f"{len(left)} video belum lengkap; alat Whisper tidak dihapus supaya bisa dijalankan ulang.")
        else:
            cleanup(args.model)


def cleanup(model_name):
    """Menghapus lingkungan Whisper dan modelnya setelah semua selesai. Dijalankan lewat proses cmd terpisah
    yang menunggu sebentar, karena python.exe dari lingkungan itu masih berjalan saat ini."""
    venv = Path(sys.executable).resolve().parents[1]
    targets = []
    if (venv / "pyvenv.cfg").exists() and venv.name == "whisper":
        targets.append(venv)
    try:
        from huggingface_hub import constants

        repo = {"distil-large-v3": "Systran--faster-distil-whisper-large-v3"}.get(model_name)
        if repo:
            targets.append(Path(constants.HF_HUB_CACHE) / f"models--{repo}")
    except Exception:
        pass
    targets = [t for t in targets if t.exists()]
    if not targets or os.name != "nt":
        return
    rm = " & ".join(f'rmdir /s /q "{t}"' for t in targets)
    subprocess.Popen(f"cmd /c timeout /t 15 /nobreak >nul & {rm}", creationflags=0x00000008 | 0x00000200, close_fds=True)
    log("Semua subtitle lengkap. Alat Whisper dan modelnya akan dihapus dalam 15 detik: " + ", ".join(str(t) for t in targets))


if __name__ == "__main__":
    main()
