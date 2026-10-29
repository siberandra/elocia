// Elocia Media: memutar video, audio, dan PDF kursus langsung dari folder di laptop.
// Memakai File System Access API (Chrome/Edge desktop). Tidak ada file yang diunggah;
// browser hanya membaca folder yang dipilih pengguna, dan izinnya bisa dicabut kapan saja.
(function () {
  "use strict";

  const DB_NAME = "elocia";
  const STORE = "handles";
  const KEY = "course";
  const MAX_FILES = 600;
  const EXT = {
    video: ["mp4", "webm", "m4v", "mov", "mkv"],
    audio: ["mp3", "m4a", "wav", "ogg"],
    pdf: ["pdf"],
    doc: ["doc", "docx", "epub"],
  };
  const kindOf = (name) => {
    const ext = (name.split(".").pop() || "").toLowerCase();
    return Object.keys(EXT).find((k) => EXT[k].includes(ext)) || null;
  };

  // Mode laptop: Elocia dibuka lewat serve.js di 127.0.0.1, folder kursus sudah tersedia tanpa memilih folder.
  const serverMode = /^(127\.0\.0\.1|localhost)$/.test(location.hostname) && location.protocol === "http:";
  const supported = serverMode || typeof window.showDirectoryPicker === "function";

  // ---------- IndexedDB untuk menyimpan handle folder ----------
  function idb(mode, fn) {
    return new Promise((resolve, reject) => {
      const open = indexedDB.open(DB_NAME, 1);
      open.onupgradeneeded = () => open.result.createObjectStore(STORE);
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const tx = open.result.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(req && req.result);
        tx.onerror = () => reject(tx.error);
      };
    });
  }
  // Batas waktu supaya halaman tidak menunggu selamanya kalau IndexedDB tidak merespons (misalnya dibuka dari file lokal).
  const withTimeout = (p, ms) => Promise.race([p, new Promise((resolve) => setTimeout(() => resolve(null), ms))]);
  const loadHandle = () => withTimeout(idb("readonly", (s) => s.get(KEY)), 3000).catch(() => null);
  const saveHandle = (h) => idb("readwrite", (s) => s.put(h, KEY));
  const clearHandle = () => idb("readwrite", (s) => s.delete(KEY));

  let root = null;
  let rootName = "";
  let permission = "none"; // none | prompt | granted

  async function refreshStatus() {
    if (!supported) return "unsupported";
    if (serverMode) {
      try {
        const info = await (await fetch("/api/course", { cache: "no-store" })).json();
        rootName = info.folder || "";
        return info.ok ? "granted" : "noroot";
      } catch (e) {
        return "error";
      }
    }
    if (!root) root = await loadHandle();
    if (!root) {
      permission = "none";
      return "none";
    }
    rootName = root.name;
    try {
      permission = await root.queryPermission({ mode: "read" });
    } catch (e) {
      permission = "prompt";
    }
    return permission === "granted" ? "granted" : "prompt";
  }

  async function connect() {
    const handle = await window.showDirectoryPicker({ id: "elocia-course", mode: "read" });
    root = handle;
    rootName = handle.name;
    permission = "granted";
    await saveHandle(handle);
    let looksRight = false;
    try {
      await handle.getDirectoryHandle("1. English Skills");
      looksRight = true;
    } catch (e) {}
    return { name: handle.name, looksRight };
  }

  async function allow() {
    if (!root) return false;
    const res = await root.requestPermission({ mode: "read" });
    permission = res;
    return res === "granted";
  }

  async function disconnect() {
    root = null;
    rootName = "";
    permission = "none";
    await clearHandle();
  }

  // ---------- Mencari folder sesi ----------
  const norm = (s) =>
    s
      .normalize("NFKC")
      .replace(/А/g, "A")
      .replace(/[‘’]/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  async function childDir(dir, name) {
    try {
      return await dir.getDirectoryHandle(name);
    } catch (e) {}
    const want = norm(name);
    for await (const [entryName, entry] of dir.entries()) {
      if (entry.kind === "directory" && norm(entryName) === want) return entry;
    }
    return null;
  }

  async function resolveDir(path) {
    let dir = root;
    const missing = [];
    for (const seg of path.split(" › ")) {
      const next = await childDir(dir, seg);
      if (!next) {
        missing.push(seg);
        break;
      }
      dir = next;
    }
    return missing.length ? { dir: null, missing: missing[0] } : { dir };
  }

  async function walk(dir, prefix, depth, out, subs) {
    const entries = [];
    for await (const [name, entry] of dir.entries()) entries.push([name, entry]);
    for (const [name, entry] of entries) {
      if (out.length >= MAX_FILES) return;
      if (entry.kind === "file") {
        const kind = kindOf(name);
        if (kind) out.push({ name, rel: prefix + name, kind, handle: entry });
        else if (/\.(vtt|srt)$/i.test(name)) subs.push({ rel: prefix + name, handle: entry });
      } else if (depth > 0 && !/^(__MACOSX|\.)/.test(name)) {
        await walk(entry, `${prefix}${name}/`, depth - 1, out, subs);
      }
    }
  }

  // Subtitle pasangan video: nama dasarnya sama, misalnya "002 Words.mp4" dan "002 Words-subtitle-en.srt".
  function attachSubtitles(files, subs) {
    files.forEach((f) => {
      if (f.kind !== "video") return;
      const base = f.rel.replace(/\.[^./]+$/, "").toLowerCase();
      const sub = subs.find((s) => s.rel.toLowerCase().startsWith(base));
      if (sub) f.subtitle = sub.handle;
    });
  }

  // Browser hanya memahami WebVTT; file SRT diubah sedikit supaya bisa dipakai.
  async function subtitleUrl(handle) {
    // Di mode laptop subtitle berupa URL; server sudah mengubah SRT menjadi WebVTT.
    if (typeof handle === "string") return /\.srt$/i.test(handle) ? `${handle}?vtt=1` : handle;
    const text = await (await handle.getFile()).text();
    const vtt = /^WEBVTT/.test(text.trimStart()) ? text : "WEBVTT\n\n" + text.replace(/\r/g, "").replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, "$1.$2");
    return URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
  }

  const leadingNumber = (name) => {
    const m = name.match(/^\s*(\d+)/);
    return m ? Number(m[1]) : null;
  };

  // Menyaring file sesuai sesi: rentang nomor video, atau potongan nama file/folder.
  function applyPick(files, pick) {
    if (!pick) return files;
    if (pick.range) {
      const [a, b] = pick.range;
      return files.filter((f) => {
        const n = leadingNumber(f.name);
        return n !== null && n >= a && n <= b;
      });
    }
    if (pick.names) {
      const keys = pick.names.map((n) => n.toLowerCase());
      return files.filter((f) => keys.some((k) => f.rel.toLowerCase().includes(k)));
    }
    return files;
  }

  // Urutan: jenis file (video, audio, PDF, dokumen), lalu urutan nama di pick.names
  // (urutan belajar yang ditetapkan per sesi), lalu urutan alami nama file.
  function finish(files, pick) {
    const collator = new Intl.Collator("id", { numeric: true, sensitivity: "base" });
    const order = { video: 0, audio: 1, pdf: 2, doc: 3 };
    const keys = pick && pick.names ? pick.names.map((n) => n.toLowerCase()) : [];
    const rank = (f) => {
      const i = keys.findIndex((k) => f.rel.toLowerCase().includes(k));
      return i === -1 ? keys.length : i;
    };
    const picked = applyPick(files, pick).sort((x, y) => order[x.kind] - order[y.kind] || rank(x) - rank(y) || collator.compare(x.rel, y.rel));
    return { status: "granted", files: picked, total: files.length };
  }

  async function listFor(session) {
    const status = await refreshStatus();
    if (status !== "granted") return { status };
    if (serverMode) {
      const res = await (await fetch(`/api/course/list?path=${encodeURIComponent(session.path)}`, { cache: "no-store" })).json();
      if (res.status !== "granted") return res;
      return finish(res.files, session.pick);
    }
    const { dir, missing } = await resolveDir(session.path);
    if (!dir) return { status: "missing", missing };
    const files = [];
    const subs = [];
    await walk(dir, "", 2, files, subs);
    attachSubtitles(files, subs);
    return finish(files, session.pick);
  }

  window.EloMedia = {
    supported,
    serverMode,
    refreshStatus,
    connect,
    allow,
    disconnect,
    listFor,
    subtitleUrl,
    get folderName() {
      return rootName;
    },
  };
})();
