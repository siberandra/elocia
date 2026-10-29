// Jalur belajar 4 batch, dari fondasi input sampai siap tes IELTS untuk LPDP.
// Path dihitung dari folder kursus "World-Class English and Professional Skills".
(function () {
  const ES = "1. English Skills";
  const P = {
    tenses: "5. Peter's Class › Peter's Class › Tenses Simplified",
    dc: "5. Peter's Class › Daily Conversations",
    a2: `${ES} › 2. Grammar › The Complete English Grammar Course › 3. А2 level`,
    b1: `${ES} › 2. Grammar › The Complete English Grammar Course › 4. B1 level`,
    b2: `${ES} › 2. Grammar › The Complete English Grammar Course › 5. B2 level`,
    leg: `${ES} › 2. Grammar › Learn English Grammar-Upgrade your speaking and listening`,
    vocab: `${ES} › 3. Vocabulary › English Vocabulary-Upgrade Your English Speaking Grammar`,
    pv: `${ES} › 4. Idioms and Phrasal Verbs › English Phrasal Verbs Launch Upgrade your speaking`,
    idioms: `${ES} › 4. Idioms and Phrasal Verbs › Real World English Idioms`,
    ml: `${ES} › 6. Business English › Business English - PreIntermediate`,
    mlUp: `${ES} › 6. Business English › Business English - UpperIntermediate`,
    pron: `${ES} › 1. Pronunciation › Speaking English with an American Accent`,
    book: "5. Peter's Class › Peter's Class › Book Summaries › The 7 Habits of Highly Effective People",
    itp: `${ES} › 5. TOEFL and IELTS › The TOEFL ITP`,
    wtsh: `${ES} › 5. TOEFL and IELTS › The TOEFL iBT › Write to Score High on the IELTS and TOEFL`,
    ieltsVocab: `${ES} › 5. TOEFL and IELTS › The IELTS › IELTS Vocabulary`,
    mag: `${ES} › 5. TOEFL and IELTS › The IELTS › Magoosh IELTS Preparation`,
    cam: `${ES} › 5. TOEFL and IELTS › The IELTS › Cambridge Practice Tests for IELTS`,
    ocg: `${ES} › 5. TOEFL and IELTS › The IELTS › The Official Cambridge Guide to IELTS`,
    plans: `${ES} › 5. TOEFL and IELTS › The IELTS › IELTS Study Plans`,
  };
  const LEG_NOTE = "Tonton Learn, Things to Note, lalu listening practice dengan cara 4 langkah. Bagian speaking practice disimpan untuk Batch 2.";
  const SPEAK_NOTE = "Di bagian speaking practice, jawab dengan suara keras sebelum jawaban contoh muncul. Jangan dijawab dalam hati.";
  const VOCAB_NOTE = "Tonton keenam videonya berurutan. Di Pronunciation Training dan Speaking Practice, ikuti dan jawab dengan suara keras.";
  const REC_NOTE = "Rekam suara pakai HP, cukup 1 menit. Dengarkan ulang sekali, lalu simpan untuk dibandingkan nanti.";
  const ML_EXIT = (parts) => ({ test: "mlExit", type: "ml", label: "Exit Test Market Leader", parts });
  const EXAM_NOTE = "Buka Mode Ujian di bawah: nyalakan timer tiap bagian, tulis jawaban di Sample Answer Sheets (buku hal. 397), cek di Answer Key (hal. 366), lalu masukkan jumlah jawaban benar.";
  const DVD_NOTE = "Audionya ada di DVD: klik dua kali file .iso di folder yang sama, lalu buka folder Audio atau jalankan Cambridge IELTS.exe. Nomor trek tertulis di buku di samping ikon audio.";

  window.PLAN = {
    start: [2026, 9, 31], // Sabtu, 31 Oktober 2026 (bulan 0-based)
    destination: {
      title: "Tes IELTS resmi, lalu daftar LPDP dalam atau luar negeri",
      note: "Satu skor IELTS bisa dipakai untuk kampus dalam maupun luar negeri. Batas skor minimumnya bisa berubah tiap tahun, jadi cek ketentuan terbaru di situs resmi LPDP sebelum memilih tanggal tes.",
    },
    batches: [
      {
        id: "b1",
        name: "Fondasi Input",
        level: "A2 → B1",
        goal: "Paham saat mendengar dan membaca, grammar inti rapi.",
        points: ["Tenses dan Grammar A2–B1", "Listening dengan cara 4 langkah", "Reading pertama: Market Leader"],
        months: [
          {
            name: "Fondasi",
            theme: "Peta tenses dan melatih telinga",
            weeks: [
              {
                sat: { kind: "grammar", what: "Tenses Simplified: Cara Memahami Tenses + Introduction", pick: { names: ["Cara Memahami", "Introduction"] }, path: P.tenses, min: 45, note: "Berbahasa Indonesia. Tonton Cara Memahami Tenses dulu untuk gambaran besar, lalu Introduction sebagai pembuka seri Video 1–4 minggu depan. Cukup tangkap gambaran besarnya, tidak perlu hafal." },
                sun: { kind: "listening", what: "Daily Conversations: Talking about Hobbies + Catching up at a Mall", pick: { names: ["Hobbies", "Catching up"] }, path: P.dc + " › Personal › With Friends", min: 20, note: "Pakai cara 4 langkah. Transkripnya ada di PDF dengan nama yang sama." },
              },
              {
                sat: { kind: "grammar", what: "Tenses Simplified: Video 1 sampai 4", pick: { names: ["(Video 1)", "(Video 2)", "(Video 3)", "(Video 4)"] }, path: P.tenses, min: 50, note: "Empat video, masing-masing sekitar 10 menit." },
                sun: { kind: "listening", what: "Daily Conversations: dua obrolan rencana liburan", pick: { names: ["Holiday"] }, path: P.dc + " › Personal", min: 20, note: "A Family Conversation (With Family) dan 3 Friends Talking (With Friends)." },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 1 sampai 7", pick: { range: [1, 7] }, path: P.a2, min: 50, note: "Questions, stative verbs, which/who/that, past simple." },
                sun: { kind: "listening", what: "Learn English Grammar 08: Past simple", path: P.leg + " › 08 Past simple", min: 30, note: LEG_NOTE + " Tambahkan Daily Conversation: Talking about the Movie." },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 8 sampai 14", pick: { range: [8, 14] }, path: P.a2, min: 55, note: "Past continuous, pertanyaan, so/because/but/although." },
                sun: { kind: "listening", what: "Learn English Grammar 12: Relative clauses", path: P.leg + " › 12 Relative clauses", min: 30, note: LEG_NOTE + " Tambahkan dua dialog di Daily Conversations › Professional." },
              },
            ],
          },
          {
            name: "Waktu & Kebiasaan",
            theme: "Future, present perfect, modals",
            weeks: [
              {
                sat: { kind: "grammar", what: "Grammar A2: video 15 sampai 20", pick: { range: [15, 20] }, path: P.a2, min: 40, note: "Semua bentuk future: present continuous, going to, will." },
                sun: { kind: "listening", what: "Learn English Grammar 10 + 11: Going to dan Will", pick: { names: ["10 Going to/", "11 Will/"] }, path: P.leg, min: 40, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 21 sampai 27", pick: { range: [21, 27] }, path: P.a2, min: 55, note: "Present perfect: just, yet, already, for, since." },
                sun: { kind: "listening", what: "Learn English Grammar 09: Present perfect", path: P.leg + " › 09 Present perfect", min: 35, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 28 sampai 35", pick: { range: [28, 35] }, path: P.a2, min: 55, note: "Perbandingan, to + verb, verb + ing." },
                sun: { kind: "listening", what: "Learn English Grammar 13: Verb -ing", path: P.leg + " › 13 Verb -ing", min: 30, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 36 sampai 43", pick: { range: [36, 43] }, path: P.a2, min: 50, note: "Must, have to, may/might, conditional 1 dan 2." },
                sun: { kind: "listening", what: "Learn English Grammar 17: Must", path: P.leg + " › 17 Must", min: 30, note: LEG_NOTE },
              },
            ],
          },
          {
            name: "Mulai Membaca",
            theme: "Libur, passive, reading pertama",
            weeks: [
              {
                buffer: true,
                sat: { kind: "buffer", what: "Minggu cadangan: kejar sesi yang tertinggal", pick: { names: ["Session 13"] }, path: P.pron, min: 15, note: "Kalau tidak ada yang tertinggal, tonton Pronunciation Session 13 (Phrase Reduction) supaya ucapan cepat lebih mudah ditangkap." },
                sun: { kind: "test", what: "Tes kecil: dua Daily Conversations tanpa transkrip", pick: { names: ["Books", "Politics"] }, path: P.dc + " › Personal › With Friends", min: 25, note: "Two Friends Talking about Books dan Talking about Politics. Dengar dulu tanpa teks, lalu cek seberapa banyak yang dipahami." },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 44 sampai 49", pick: { range: [44, 49] }, path: P.a2, min: 40, note: "Used to dan passive." },
                sun: { kind: "reading", what: "Market Leader Pre-Intermediate: Unit 1", pick: { names: ["Course Book", "Teachers Book"] }, path: P.ml, min: 45, note: "Bagian Reading dan Listening. Teks di Course Book PDF, audio di folder Audio Course, kunci jawaban dan transkrip di Teachers Book." },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 50 sampai 55", pick: { range: [50, 55] }, path: P.a2, min: 40, note: "Something/anyone, so/neither, past perfect. Level A2 selesai." },
                sun: { kind: "listening", what: "Learn English Grammar 14: Both, neither, either", path: P.leg + " › 14 Both neither and either", min: 35, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B1: video 1 sampai 5", pick: { range: [1, 5] }, path: P.b1, min: 45, note: "Ringkasan semua tenses. Cocok untuk mengulang." },
                sun: { kind: "reading", what: "Market Leader Pre-Intermediate: Unit 2", pick: { names: ["Course Book", "Teachers Book"] }, path: P.ml, min: 45, note: "Kalau terasa terlalu berat, pindah ke versi Elementary di folder sebelahnya." },
              },
            ],
          },
          {
            name: "Naik ke B1",
            theme: "Grammar B1 dan uji akhir",
            weeks: [
              {
                sat: { kind: "grammar", what: "Grammar B1: video 6 sampai 11", pick: { range: [6, 11] }, path: P.b1, min: 45, note: "Future clauses, present perfect continuous, adjective vs adverb." },
                sun: { kind: "listening", what: "Learn English Grammar 15: Even", path: P.leg + " › 15 Even", min: 30, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B1: video 12 sampai 20", pick: { range: [12, 20] }, path: P.b1, min: 60, note: "Modals dan semua conditional. Sesi paling padat, boleh dibagi dua hari." },
                sun: { kind: "listening", what: "Learn English Grammar 16: Phrasal verbs in & out", path: P.leg + " › 16 Phrasal verbs with in and out", min: 30, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B1: video 21 sampai 29", pick: { range: [21, 29] }, path: P.b1, min: 60, note: "Reported speech, relative clauses, question tags. Boleh dibagi: 21–25 hari ini, 26–29 besok." },
                sun: { kind: "reading", what: "Book Summary: The 7 Habits", path: P.book, min: 40, note: "Baca PDF sambil mendengarkan MP3-nya. Tidak harus selesai sekali duduk." },
              },
              {
                sat: { kind: "test", what: "Uji akhir Batch 1: Exit Test Market Leader (Listening, Language, Reading)", pick: { names: ["exit_test"] }, path: P.ml + " › Test Master", min: 60, note: "Buka exit_test.doc untuk soal, lalu putar exit_test_part_a.mp3 dan part_b.mp3 untuk Listening. Kerjakan soal 1–60 dengan timer di Mode Ujian. Kunci jawabannya tidak tersedia, jadi minta Elocia AI memeriksa jawaban Anda. Skor 60% ke atas berarti Batch 1 sudah dikuasai.", exam: ML_EXIT(["L", "G", "R"]) },
                sun: { kind: "test", what: "Uji akhir: Daily Conversations tanpa transkrip", path: P.dc, min: 30, note: "Kalau sekitar 90% sudah paham, telinga Anda siap untuk Batch 2. Opsional: kerjakan juga Writing dan Speaking dari Exit Test sebagai titik awal, lalu catat nilainya di Mode Ujian. Hasilnya dibandingkan lagi di akhir Batch 2.", exam: ML_EXIT(["W", "S"]) },
              },
            ],
          },
        ],
      },
      {
        id: "b2",
        name: "Mulai Bicara & Menulis",
        level: "B1 aktif",
        goal: "Berani menjawab dan menulis kalimat sendiri.",
        points: ["Kosakata + latihan bicara (12 set)", "Kesalahan umum dalam menulis", "Ngobrol 1-on-1 pertama"],
        months: [
          {
            name: "Membuka Mulut",
            theme: "Kosakata aktif dan suara sendiri",
            weeks: [
              {
                sat: { kind: "speaking", what: "Vocabulary: Adjectives Set 1", path: P.vocab + " › 02 Adjectives Set 1", min: 40, note: VOCAB_NOTE },
                sun: { kind: "speaking", what: "Speaking practice: Present simple, Past simple, Present perfect", pick: { names: ["024 Present simple speaking", "028 Past simple speaking", "032 Present perfect speaking"] }, path: P.leg, min: 30, note: SPEAK_NOTE + " Ketiganya ada di topik 07, 08, dan 09." },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Nouns Set 1", path: P.vocab + " › 03 Nouns Set 1", min: 40, note: VOCAB_NOTE },
                sun: { kind: "writing", what: "Write to Score High: Common Errors Made in Writing", path: P.wtsh + " › 01 Common Errors Made in Writing", min: 45, note: "Setelah menonton, tulis 5 kalimat tentang diri Anda dan cek kesalahan yang sama." },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Verbs Set 1", path: P.vocab + " › 04 Verbs Set 1", min: 40, note: VOCAB_NOTE },
                sun: { kind: "speaking", what: "Speaking practice: Going to, Will, Relative clauses + rekam 1 menit", pick: { names: ["036 Going to speaking", "040 Will speaking", "044 Relative clauses speaking"] }, path: P.leg, min: 30, note: SPEAK_NOTE + " Topik rekaman: rencana akhir pekan depan. " + REC_NOTE },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Adjectives Set 2", path: P.vocab + " › 05 Adjectives Set 2", min: 40, note: VOCAB_NOTE },
                sun: { kind: "writing", what: "Market Leader Pre-Intermediate: tugas Writing Unit 1", pick: { names: ["Course Book", "Teachers Book"] }, path: P.ml, min: 40, note: "Kerjakan tugas menulis di akhir unit, lalu bandingkan dengan contoh di Teachers Book." },
              },
            ],
          },
          {
            name: "Menulis Rapi",
            theme: "Articles, email, dan kalimat utuh",
            weeks: [
              {
                sat: { kind: "speaking", what: "Vocabulary: Nouns Set 2", path: P.vocab + " › 06 Nouns Set 2", min: 40, note: VOCAB_NOTE },
                sun: { kind: "writing", what: "Write to Score High: Articles (a, an, the)", path: P.wtsh + " › 02 Part 2 Articles", min: 45, note: "Kesalahan articles paling sering muncul di tulisan orang Indonesia. Tulis ulang 5 kalimat minggu lalu dengan articles yang benar." },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Verbs Set 2", path: P.vocab + " › 07 Verbs Set 2", min: 40, note: VOCAB_NOTE },
                sun: { kind: "speaking", what: "Speaking practice: Verb -ing, Both/neither, Even + rekam 1 menit", pick: { names: ["048 Verb -ing speaking", "052 Both neither and either speaking", "056 Even speaking"] }, path: P.leg, min: 30, note: SPEAK_NOTE + " Topik rekaman: pekerjaan atau kuliah Anda. " + REC_NOTE },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Adjectives Set 3", path: P.vocab + " › 08 Adjectives Set 3", min: 40, note: VOCAB_NOTE },
                sun: { kind: "writing", what: "Market Leader Pre-Intermediate: tugas Writing Unit 2", pick: { names: ["Course Book", "Teachers Book"] }, path: P.ml, min: 40, note: "Biasanya berupa email singkat. Tulis, baca keras sekali, lalu perbaiki." },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Nouns Set 3", path: P.vocab + " › 09 Nouns Set 3", min: 40, note: VOCAB_NOTE },
                sun: { kind: "speaking", what: "Speaking practice: Phrasal verbs in & out, Must + shadowing", pick: { names: ["060 Phrasal verbs with in and out speaking", "064 Must speaking"] }, path: P.leg, min: 30, note: SPEAK_NOTE + " Lanjutkan dengan shadowing satu Daily Conversation: tirukan kalimat per kalimat." },
              },
            ],
          },
          {
            name: "Ngobrol Beneran",
            theme: "Pengucapan dan percakapan pertama",
            weeks: [
              {
                sat: { kind: "speaking", what: "Vocabulary: Verbs Set 3", path: P.vocab + " › 10 Verbs Set 3", min: 40, note: VOCAB_NOTE },
                sun: { kind: "speaking", what: "Pronunciation: Word Endings + TH", pick: { names: ["Session 6.", "Session 3."] }, path: P.pron, min: 40, note: "Session 6 (Word Endings) dan Session 3 (TH, Voiced T). Ikuti latihannya dengan suara keras." },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Adjectives Set 4", path: P.vocab + " › 11 Adjectives Set 4", min: 40, note: VOCAB_NOTE },
                sun: { kind: "writing", what: "Tulis 150 kata: hobi saya, lalu baca keras", path: P.wtsh, min: 35, note: "Pakai kosakata dari set yang sudah dipelajari. Setelah itu baca keras dan rekam." },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Nouns Set 4", path: P.vocab + " › 12 Nouns Set 4", min: 40, note: VOCAB_NOTE },
                sun: { kind: "speaking", what: "Percakapan 1-on-1 pertama, 20 menit", path: P.dc, min: 30, note: "Dengan tutor online atau teman yang bisa berbahasa Inggris. Siapkan 3 topik: diri sendiri, pekerjaan, hobi. Gugup itu wajar." },
              },
              {
                sat: { kind: "test", what: "Uji Batch 2: Writing + Speaking Exit Test, lalu bandingkan", pick: { names: ["exit_test"] }, path: P.ml + " › Test Master", min: 45, note: "Kerjakan lagi Writing dan Speaking dari Exit Test Market Leader, minta Elocia AI menilai (0–10), lalu bandingkan dengan nilai titik awal di akhir Batch 1. Dengarkan juga rekaman Anda di minggu ke-3: bedanya akan terasa.", exam: { test: "b2Output", type: "ml", label: "Uji Batch 2: Writing + Speaking", parts: ["W", "S"] } },
                sun: { kind: "speaking", what: "Percakapan 1-on-1 kedua, 20 menit", path: P.dc, min: 30, note: "Coba topik baru: film atau buku terakhir yang Anda nikmati." },
              },
            ],
          },
        ],
      },
      {
        id: "b3",
        name: "Naik ke B2",
        level: "B1 → B2",
        goal: "Kosakata dan grammar setara B2, modal utama IELTS.",
        points: ["Grammar B2 lengkap", "15 set phrasal verbs + idioms", "Kosakata akademik IELTS"],
        months: [
          {
            name: "Grammar B2",
            theme: "Struktur kalimat tingkat lanjut",
            weeks: [
              {
                sat: { kind: "grammar", what: "Grammar B2: video 1 sampai 7", pick: { range: [1, 7] }, path: P.b2, min: 50, note: "Pause di setiap EXERCISE dan tulis jawabannya." },
                sun: { kind: "speaking", what: "Vocabulary: Verbs Set 4", path: P.vocab + " › 13 Verbs Set 4", min: 40, note: VOCAB_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B2: video 8 sampai 14", pick: { range: [8, 14] }, path: P.b2, min: 50, note: "Buat satu contoh kalimat sendiri untuk tiap aturan baru." },
                sun: { kind: "speaking", what: "Vocabulary: Adjectives Set 5", path: P.vocab + " › 14 Adjectives Set 5", min: 40, note: VOCAB_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B2: video 15 sampai 21", pick: { range: [15, 21] }, path: P.b2, min: 50, note: "Pause di setiap EXERCISE dan tulis jawabannya." },
                sun: { kind: "speaking", what: "Vocabulary: Nouns Set 5", path: P.vocab + " › 15 Nouns Set 5", min: 40, note: VOCAB_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B2: video 22 sampai 27", pick: { range: [22, 27] }, path: P.b2, min: 45, note: "Level B2 selesai. Ini fondasi grammar untuk writing IELTS." },
                sun: { kind: "speaking", what: "Vocabulary: Verbs Set 5", path: P.vocab + " › 16 Verbs Set 5", min: 40, note: VOCAB_NOTE + " Ini set terakhir." },
              },
            ],
          },
          {
            name: "Bahasa Sehari-hari",
            theme: "Phrasal verbs dan idioms",
            weeks: [
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 1 + Set 2", pick: { names: ["2. Phrasal Verbs Set 1/", "3. Phrasal Verbs Set 2/"] }, path: P.pv, min: 55, note: "Folder 2 dan 3. Ikuti bagian latihan bicaranya dengan suara keras." },
                sun: { kind: "listening", what: "Real World English Idioms: A–E", path: P.idioms + " › 02 A - E", min: 45, note: "Lima video panjang. Boleh dicicil, catat idiom yang paling berguna saja." },
              },
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 3 + Set 4", pick: { names: ["4. Phrasal Verbs Set 3/", "5. Phrasal Verbs Set 4/"] }, path: P.pv, min: 55, note: "Folder 4 dan 5." },
                sun: { kind: "listening", what: "Real World English Idioms: F–J", path: P.idioms + " › 03 F - J", min: 45, note: "Catat maksimal 5 idiom per sesi." },
              },
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 5 + Set 6", pick: { names: ["6. Phrasal Verbs Set 5/", "7. Phrasal Verbs Set 6/"] }, path: P.pv, min: 55, note: "Folder 6 dan 7." },
                sun: { kind: "listening", what: "Real World English Idioms: K–O", path: P.idioms + " › 04 K - O", min: 45, note: "Catat maksimal 5 idiom per sesi." },
              },
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 7 + Set 8", pick: { names: ["8. Phrasal Verbs Set 7/", "9. Phrasal Verbs Set 8/"] }, path: P.pv, min: 55, note: "Folder 8 dan 9." },
                sun: { kind: "listening", what: "Real World English Idioms: P–T", path: P.idioms + " › 05 P - T", min: 45, note: "Catat maksimal 5 idiom per sesi." },
              },
            ],
          },
          {
            name: "Bahasa Akademik",
            theme: "Kosakata topik IELTS",
            weeks: [
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 9 + Set 10", pick: { names: ["10. Phrasal Verbs Set 9/", "11. Phrasal Verbs Set 10/"] }, path: P.pv, min: 55, note: "Folder 10 dan 11." },
                sun: { kind: "listening", what: "Real World English Idioms: U–Z", path: P.idioms + " › 06 U - Z", min: 45, note: "Bagian terakhir kursus idioms." },
              },
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 11 + Set 12", pick: { names: ["12. Phrasal Verbs Set 11/", "13. Phrasal Verbs Set 12/"] }, path: P.pv, min: 55, note: "Folder 12 dan 13." },
                sun: { kind: "reading", what: "IELTS Vocabulary: Education + Environment", pick: { names: ["30. Education/", "6. Environment/"] }, path: P.ieltsVocab, min: 50, note: "Folder 30 dan 6. Topik yang sangat sering muncul di IELTS." },
              },
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 13 sampai 15", pick: { names: ["14. Phrasal Verbs Set 13/", "15. Phrasal Verbs Set 14/", "16. Phrasal Verbs Set 15/"] }, path: P.pv, min: 60, note: "Folder 14, 15, dan 16. Kursus phrasal verbs selesai." },
                sun: { kind: "reading", what: "IELTS Vocabulary: Business + Social Issues", pick: { names: ["16. Business/", "13. Social Issues/"] }, path: P.ieltsVocab, min: 50, note: "Folder 16 dan 13." },
              },
              {
                sat: { kind: "test", what: "Uji Batch 3: Market Leader Upper-Intermediate Unit 1", pick: { names: ["Course Book", "Resource Book"] }, path: P.mlUp, min: 50, note: "Bagian Reading dan Listening. Kalau sebagian besar paham, Anda sudah di sekitar level B2." },
                sun: { kind: "reading", what: "IELTS Vocabulary: Giving Opinions + Describing Trends", pick: { names: ["22. Giving Opinions", "26. Describing Trends"] }, path: P.ieltsVocab, min: 50, note: "Folder 22 dan 26. Langsung dipakai di Writing Task 1 dan 2." },
              },
            ],
          },
        ],
      },
      {
        id: "b4",
        name: "Persiapan IELTS",
        level: "Target band 6.5",
        goal: "Paham format tes, punya strategi, dan berlatih dengan 8 tes resmi.",
        points: ["Official Cambridge Guide: 4 skill", "8 practice test resmi + Mode Ujian", "Skor band tiap simulasi"],
        months: [
          {
            name: "Kenal Tesnya",
            theme: "Format, skor awal, listening, reading",
            weeks: [
              {
                sat: { kind: "test", what: "Magoosh: Introduction to the IELTS + IELTS Summary", path: P.mag + " › 1. Introduction to the IELTS", min: 50, note: "Sebelas video singkat, lalu baca bagian IELTS Summary di buku Official Cambridge Guide (hal. 7–12)." },
                sun: { kind: "test", what: "Tes diagnostik: Practice Test 1 (Listening + Reading)", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 110, note: "Buku hal. 154. Test 1 berisi petunjuk dan tips, cocok untuk percobaan pertama. " + EXAM_NOTE + " Skor ini jadi titik awal, berapa pun hasilnya tidak apa-apa.", exam: { test: "ocg1", label: "Practice Test 1", parts: ["L", "R"] } },
              },
              {
                sat: { kind: "listening", what: "Official Guide Listening: Unit 1–4", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 60, note: "Buku hal. 15–28: konteks, ejaan, angka, paraphrase, peta dan arah. " + DVD_NOTE },
                sun: { kind: "listening", what: "Official Guide Listening: Unit 5–8", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 60, note: "Buku hal. 29–41: proses, opini, lecture, dan kata penanda. " + DVD_NOTE },
              },
              {
                sat: { kind: "reading", what: "Official Guide Reading: Unit 1–4", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 60, note: "Buku hal. 44–63: skimming, scanning, ide utama, dan matching information." },
                sun: { kind: "reading", what: "Official Guide Reading: Unit 5–7", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 60, note: "Buku hal. 64–77: teks argumentatif, pilihan ganda, dan Yes/No/Not Given. Unit 8 khusus General Training, boleh dilewati." },
              },
              {
                sat: { kind: "listening", what: "Magoosh: IELTS Skills + strategi Listening", pick: { names: ["2. IELTS Skills/", "4. Listening/1. How", "4. Listening/2. General", "4. Listening/3. APT"] }, path: P.mag, min: 55, note: "Folder 2. IELTS Skills (7 video), lalu 4. Listening video 1–3: cara latihan, tips, dan APT Method." },
                sun: { kind: "test", what: "Practice Test 2: Listening + Reading", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 100, note: "Buku hal. 173. " + EXAM_NOTE, exam: { test: "ocg2", label: "Practice Test 2", parts: ["L", "R"] } },
              },
            ],
          },
          {
            name: "Writing & Speaking",
            theme: "Task 1, Task 2, dan wawancara",
            weeks: [
              {
                sat: { kind: "writing", what: "Official Guide Writing: Unit 1–2 (grafik dan tabel)", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 60, note: "Buku hal. 93–105: membaca dan membandingkan data untuk Task 1." },
                sun: { kind: "writing", what: "Official Guide Writing: Unit 3–4 + tulis satu Task 1", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 60, note: "Buku hal. 106–112: diagram, proses, dan peta. Tulis satu Task 1 (20 menit, minimal 150 kata), lalu minta Elocia AI menilainya." },
              },
              {
                sat: { kind: "writing", what: "Official Guide Writing: Unit 6–8 (Task 2)", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 60, note: "Buku hal. 119–133: merencanakan, menghubungkan ide, dan mengecek kesalahan. Unit 5 khusus General Training, boleh dilewati." },
                sun: { kind: "writing", what: "Magoosh Writing 10–20 + tulis satu essay Task 2", pick: { range: [10, 20] }, path: P.mag + " › 6. Writing", min: 70, note: "Struktur dan jenis essay, lalu tulis essay 40 menit, minimal 250 kata. Tempel ke Elocia AI (Tanya bebas) dan minta perkiraan band beserta alasannya." },
              },
              {
                sat: { kind: "speaking", what: "Official Guide Speaking: Unit 1–2 + video contoh", path: P.ocg, min: 55, note: "Buku hal. 136–144: Part 1 dan Part 2. Tonton video Speaking di DVD atau di folder IELTS Speaking Section Examples." },
                sun: { kind: "speaking", what: "Official Guide Speaking: Unit 3–4 + latihan dengan Elocia AI", path: P.ocg, min: 50, note: "Buku hal. 145–153: Part 3, pengucapan, dan menilai diri. Lalu coba mode Penguji IELTS di Elocia AI." },
              },
              {
                sat: { kind: "test", what: "Practice Test 3: Listening, Reading, Writing", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 170, note: "Buku hal. 190. " + EXAM_NOTE + " Sesi panjang, boleh dibagi Sabtu–Minggu.", exam: { test: "ocg3", label: "Practice Test 3", parts: ["L", "R", "W"] } },
                sun: { kind: "test", what: "Practice Test 3: Speaking dengan Elocia AI + review", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 45, note: "Pakai soal Speaking Test 3 di buku dan mode Penguji IELTS di Elocia AI. Masukkan band Speaking dari Elocia AI di Mode Ujian, supaya Overall band Test 3 terhitung.", exam: { test: "ocg3", label: "Practice Test 3", parts: ["S"] } },
              },
            ],
          },
          {
            name: "Simulasi",
            theme: "Tes penuh, skor band, dan daftar",
            weeks: [
              {
                sat: { kind: "test", what: "Practice Test 4: tes penuh", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 180, note: "Buku hal. 207. " + EXAM_NOTE + " Speaking dengan mode Penguji IELTS di Elocia AI.", exam: { test: "ocg4", label: "Practice Test 4", parts: ["L", "R", "W", "S"] } },
                sun: { kind: "speaking", what: "Magoosh Speaking: contoh wawancara + review Test 4", pick: { range: [8, 14] }, path: P.mag + " › 5. Speaking", min: 50, note: "Video 8–14: cara menaikkan band dan 3 contoh wawancara. Lalu tulis 3 kesalahan terbesar dari Test 4." },
              },
              {
                sat: { kind: "test", what: "Practice Test 5: Listening, Reading, Writing", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 170, note: "Buku hal. 226. " + EXAM_NOTE, exam: { test: "ocg5", label: "Practice Test 5", parts: ["L", "R", "W"] } },
                sun: { kind: "test", what: "Practice Test 5: Speaking + review", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 45, note: "Speaking dengan mode Penguji IELTS di Elocia AI, lalu bandingkan band Test 5 dengan Test 3.", exam: { test: "ocg5", label: "Practice Test 5", parts: ["S"] } },
              },
              {
                sat: { kind: "test", what: "Practice Test 6: tes penuh", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 180, note: "Buku hal. 246. " + EXAM_NOTE, exam: { test: "ocg6", label: "Practice Test 6", parts: ["L", "R", "W", "S"] } },
                sun: { kind: "test", what: "Practice Test 7: Listening + Reading", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 100, note: "Buku hal. 266. " + EXAM_NOTE, exam: { test: "ocg7", label: "Practice Test 7", parts: ["L", "R"] } },
              },
              {
                sat: { kind: "test", what: "Simulasi akhir: Practice Test 8 penuh", pick: { names: ["Guide to IELTS.pdf"] }, path: P.ocg, min: 180, note: "Buku hal. 300. Simulasi terakhir, kerjakan persis seperti hari tes. " + EXAM_NOTE, exam: { test: "ocg8", label: "Practice Test 8", parts: ["L", "R", "W", "S"] } },
                sun: { kind: "test", what: "Evaluasi dan pilih tanggal tes IELTS", path: P.plans, min: 30, note: "Bandingkan skor Practice Test 1 dengan Practice Test 8 di Mode Ujian. Cek syarat LPDP terbaru, lalu pilih tanggal tes resmi. Sambil menunggu hari tes, Cambridge IELTS 1–6 bisa jadi latihan tambahan." },
              },
            ],
          },
        ],
      },
    ],
  };
})();
