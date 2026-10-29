#!/usr/bin/env node
// Elocia versi laptop: menyajikan aplikasi dan folder kursus di http://127.0.0.1:8765
// supaya video, audio, dan PDF bisa langsung diputar tanpa memilih folder.
// Hanya mendengarkan di 127.0.0.1, jadi tidak bisa diakses dari perangkat lain.
//
// Pemakaian: node serve.js ["C:\path\ke\World-Class English and Professional Skills"]
// Tanpa argumen, dipakai folder Downloads\World-Class English and Professional Skills milik pengguna.

const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { exec } = require("child_process");

const APP_DIR = __dirname;
const COURSE_DIR = path.resolve(
  process.argv.slice(2).find((a) => !a.startsWith("--")) ||
    process.env.ELOCIA_COURSE ||
    path.join(os.homedir(), "Downloads", "World-Class English and Professional Skills")
);
const PORT = Number(process.env.ELOCIA_PORT || 8765);
const HOST = "127.0.0.1";
const URL_BASE = `http://${HOST}:${PORT}/`;
const OPEN_BROWSER = !process.argv.includes("--no-open");
const MAX_FILES = 600;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".pdf": "application/pdf",
  ".vtt": "text/vtt; charset=utf-8",
  ".srt": "text/plain; charset=utf-8",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".epub": "application/epub+zip",
};
const KINDS = {
  video: [".mp4", ".webm", ".m4v", ".mov", ".mkv"],
  audio: [".mp3", ".m4a", ".wav", ".ogg"],
  pdf: [".pdf"],
  doc: [".doc", ".docx", ".epub"],
};
const kindOf = (name) => {
  const ext = path.extname(name).toLowerCase();
  return Object.keys(KINDS).find((k) => KINDS[k].includes(ext)) || null;
};

// Pencocokan nama folder yang toleran: huruf besar/kecil, spasi ganda, dan "А" Cyrillic.
const norm = (s) =>
  s
    .normalize("NFKC")
    .replace(/\u0410/g, "A")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

function childDir(dir, name) {
  const direct = path.join(dir, name);
  try {
    if (fs.statSync(direct).isDirectory()) return direct;
  } catch (e) {}
  const want = norm(name);
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && norm(e.name) === want) return path.join(dir, e.name);
  }
  return null;
}

// URL file kursus: setiap bagian path di-encode terpisah, relatif terhadap folder kursus.
const courseUrl = (abs) => "/course/" + path.relative(COURSE_DIR, abs).split(path.sep).map(encodeURIComponent).join("/");

function walk(dir, prefix, depth, out, subs) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (out.length >= MAX_FILES) return;
    const abs = path.join(dir, e.name);
    if (e.isFile()) {
      const kind = kindOf(e.name);
      if (kind) out.push({ name: e.name, rel: prefix + e.name, kind, url: courseUrl(abs) });
      else if (/\.(vtt|srt)$/i.test(e.name)) subs.push({ rel: prefix + e.name, url: courseUrl(abs) });
    } else if (e.isDirectory() && depth > 0 && !/^(__MACOSX|\.)/.test(e.name)) {
      walk(abs, `${prefix}${e.name}/`, depth - 1, out, subs);
    }
  }
}

function listSession(sessionPath) {
  let dir = COURSE_DIR;
  for (const seg of sessionPath.split(" › ")) {
    const next = childDir(dir, seg);
    if (!next) return { status: "missing", missing: seg };
    dir = next;
  }
  const files = [];
  const subs = [];
  walk(dir, "", 2, files, subs);
  files.forEach((f) => {
    if (f.kind !== "video") return;
    const base = f.rel.replace(/\.[^./]+$/, "").toLowerCase();
    const sub = subs.find((s) => s.rel.toLowerCase().startsWith(base));
    if (sub) f.subtitle = sub.url;
  });
  return { status: "granted", files };
}

function sendJSON(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, { "Content-Type": TYPES[".json"], "Cache-Control": "no-store", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

// Mengirim file dengan dukungan Range, supaya video bisa dimajukan dan dimundurkan.
function sendFile(req, res, file, extraHeaders) {
  let stat;
  try {
    stat = fs.statSync(file);
    if (!stat.isFile()) throw new Error("not a file");
  } catch (e) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("File tidak ditemukan.");
  }
  const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
  const headers = Object.assign({ "Content-Type": type, "Accept-Ranges": "bytes" }, extraHeaders);
  const size = stat.size;
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
  if (range && (range[1] || range[2])) {
    let start = range[1] === "" ? Math.max(0, size - Number(range[2])) : Number(range[1]);
    let end = range[1] === "" || range[2] === "" ? size - 1 : Math.min(Number(range[2]), size - 1);
    if (start > end || start >= size) {
      res.writeHead(416, { "Content-Range": `bytes */${size}` });
      return res.end();
    }
    res.writeHead(206, Object.assign(headers, { "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 }));
    if (req.method === "HEAD") return res.end();
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, Object.assign(headers, { "Content-Length": size }));
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(file).pipe(res);
}

// Menolak path yang keluar dari folder dasarnya (misalnya lewat "..").
function safeJoin(base, parts) {
  const abs = path.resolve(base, ...parts);
  return abs === base || abs.startsWith(base + path.sep) ? abs : null;
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    return res.end();
  }
  const url = new URL(req.url, URL_BASE);
  let parts;
  try {
    parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch (e) {
    res.writeHead(400);
    return res.end();
  }

  if (url.pathname === "/api/course") {
    const exists = fs.existsSync(COURSE_DIR) && fs.statSync(COURSE_DIR).isDirectory();
    return sendJSON(res, 200, { ok: exists, folder: path.basename(COURSE_DIR) });
  }
  if (url.pathname === "/api/course/list") {
    try {
      return sendJSON(res, 200, listSession(url.searchParams.get("path") || ""));
    } catch (e) {
      return sendJSON(res, 500, { status: "error", message: String(e.message || e) });
    }
  }
  if (parts[0] === "course") {
    const file = safeJoin(COURSE_DIR, parts.slice(1));
    if (!file) {
      res.writeHead(403);
      return res.end();
    }
    if (url.searchParams.get("vtt") === "1" && /\.srt$/i.test(file)) {
      try {
        const text = fs.readFileSync(file, "utf8");
        const vtt = "WEBVTT\n\n" + text.replace(/\r/g, "").replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, "$1.$2");
        res.writeHead(200, { "Content-Type": TYPES[".vtt"] });
        return res.end(vtt);
      } catch (e) {
        res.writeHead(404);
        return res.end();
      }
    }
    return sendFile(req, res, file);
  }

  // File aplikasi Elocia.
  const rel = parts.length ? parts : ["index.html"];
  const file = safeJoin(APP_DIR, rel);
  const ext = file ? path.extname(file).toLowerCase() : "";
  if (!file || ![".html", ".js", ".css", ".svg", ".json", ".png", ".jpg"].includes(ext) || /node_modules|\.git/.test(file)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Tidak ditemukan.");
  }
  sendFile(req, res, file, { "Cache-Control": "no-store" });
});

function openBrowser() {
  if (!OPEN_BROWSER) return;
  const cmd = process.platform === "win32" ? `start "" "${URL_BASE}"` : process.platform === "darwin" ? `open "${URL_BASE}"` : `xdg-open "${URL_BASE}"`;
  exec(cmd, () => {});
}

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    // Elocia sudah berjalan dari sebelumnya; cukup buka browsernya.
    console.log(`Elocia sudah berjalan di ${URL_BASE}`);
    openBrowser();
    setTimeout(() => process.exit(0), 500);
  } else {
    console.error("Elocia gagal berjalan:", err.message);
    process.exit(1);
  }
});

server.listen(PORT, HOST, () => {
  const ok = fs.existsSync(COURSE_DIR);
  console.log("");
  console.log("  Elocia berjalan di " + URL_BASE);
  console.log("  Folder kursus: " + COURSE_DIR + (ok ? "" : "  (TIDAK DITEMUKAN)"));
  console.log("");
  console.log("  Biarkan jendela ini terbuka selama belajar. Tutup jendela ini untuk menghentikan Elocia.");
  openBrowser();
});
