# Elocia

Teman belajar bahasa Inggris untuk akhir pekan: 4 batch (sekitar 1 tahun) dari fondasi listening dan reading sampai siap tes IELTS untuk LPDP.

## Membuka di laptop (dengan video kursus)

Klik dua kali **`Buka Elocia.cmd`** (atau shortcut **Elocia** di Desktop). Elocia terbuka di `http://127.0.0.1:8765`
dan langsung terhubung ke folder `Downloads\World-Class English and Professional Skills`, jadi video, audio, dan PDF
tiap sesi bisa diputar tanpa memilih folder. Butuh Node.js. Server hanya mendengarkan di 127.0.0.1.

Folder kursus di tempat lain: `node serve.js "D:\path\ke\folder kursus"`.

Progres di versi laptop terpisah dari versi online (beda alamat). Pindahkan dengan **Pengaturan → Unduh cadangan / Pulihkan dari file**.

## Struktur

- `index.html` — kerangka halaman
- `styles.css` — tampilan
- `data.js` — rencana 4 batch dan lokasi file kursus
- `app.js` — progres, kunci batch, streak, XP, level, pencapaian
- `serve.js` — server lokal untuk mode laptop: menyajikan aplikasi dan folder kursus (dengan dukungan Range untuk video)
- `media.js` — memutar video, audio, dan PDF kursus langsung dari folder di laptop (File System Access API, Chrome/Edge desktop); tidak ada file yang diunggah
- `chat.js` — Elocia AI: chat dengan Gemini API memakai kunci milik pengguna (disimpan di `localStorage` perangkat, tidak pernah di repo)

Progres disimpan di `localStorage` browser masing-masing perangkat. Gunakan **Pengaturan → Unduh cadangan** dan **Pulihkan dari file** untuk memindahkan progres antarperangkat.

## Deploy

Situs statis tanpa build, di-hosting lewat GitHub Pages dari branch `main` (root). Setiap push ke `main` otomatis memperbarui situs dalam 1–2 menit.

## Subtitle buatan

Video kursus yang belum punya subtitle diberi subtitle English (Whisper, offline di laptop) dan Indonesia
(terjemahan Gemini, hanya teks yang dikirim) lewat `tools/subtitles/make_subs.py`. Hasilnya disimpan di sebelah
video sebagai `<nama video> (English).srt` dan `<nama video> (Indonesian).srt`, dan Elocia memakainya otomatis.
Skripnya bisa dijalankan ulang kapan saja; yang sudah ada dilewati. Lihat `--help` untuk pilihannya.

`tools/subtitles/Pasang otomatis.cmd` memasang tugas Task Scheduler "Elocia Subtitle" yang menjalankan skrip ini
tanpa jendela saat masuk Windows dan tiap jam, hanya saat charger tercolok. Tugas itu, lingkungan Whisper, dan
modelnya terhapus sendiri setelah semua subtitle lengkap. Progres: `%LOCALAPPDATA%\Elocia\subs.log`.
