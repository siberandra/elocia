# Elocia

Teman belajar bahasa Inggris untuk akhir pekan: 4 batch (sekitar 1 tahun) dari fondasi listening dan reading sampai siap tes IELTS untuk LPDP.

## Membuka di laptop

Klik dua kali `index.html`. Tidak perlu install apa pun.

## Struktur

- `index.html` — kerangka halaman
- `styles.css` — tampilan
- `data.js` — rencana 4 batch dan lokasi file kursus
- `app.js` — progres, kunci batch, streak, XP, level, pencapaian
- `media.js` — memutar video, audio, dan PDF kursus langsung dari folder di laptop (File System Access API, Chrome/Edge desktop); tidak ada file yang diunggah
- `chat.js` — Elocia AI: chat dengan Gemini API memakai kunci milik pengguna (disimpan di `localStorage` perangkat, tidak pernah di repo)

Progres disimpan di `localStorage` browser masing-masing perangkat. Gunakan **Pengaturan → Unduh cadangan** dan **Pulihkan dari file** untuk memindahkan progres antarperangkat.

## Deploy

Situs statis tanpa build, di-hosting lewat GitHub Pages dari branch `main` (root). Setiap push ke `main` otomatis memperbarui situs dalam 1–2 menit.
