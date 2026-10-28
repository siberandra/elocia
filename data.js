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
  const MOCK_NOTE = "Kerjakan dengan timer seperti tes sungguhan. Cek jawaban di bagian answer key, lalu catat skor dan jenis soal yang paling sering salah.";

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
                sat: { kind: "grammar", what: "Tenses Simplified: Introduction + Cara Memahami Tenses", path: P.tenses, min: 45, note: "Berbahasa Indonesia. Cukup tangkap gambaran besarnya, tidak perlu hafal." },
                sun: { kind: "listening", what: "Daily Conversations: Talking about Hobbies + Catching up at a Mall", path: P.dc + " › Personal › With Friends", min: 20, note: "Pakai cara 4 langkah. Transkripnya ada di PDF dengan nama yang sama." },
              },
              {
                sat: { kind: "grammar", what: "Tenses Simplified: Video 1 sampai 4", path: P.tenses, min: 50, note: "Empat video, masing-masing sekitar 10 menit." },
                sun: { kind: "listening", what: "Daily Conversations: dua obrolan rencana liburan", path: P.dc + " › Personal", min: 20, note: "A Family Conversation (With Family) dan 3 Friends Talking (With Friends)." },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 1 sampai 7", path: P.a2, min: 50, note: "Questions, stative verbs, which/who/that, past simple." },
                sun: { kind: "listening", what: "Learn English Grammar 08: Past simple", path: P.leg + " › 08 Past simple", min: 30, note: LEG_NOTE + " Tambahkan Daily Conversation: Talking about the Movie." },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 8 sampai 14", path: P.a2, min: 55, note: "Past continuous, pertanyaan, so/because/but/although." },
                sun: { kind: "listening", what: "Learn English Grammar 12: Relative clauses", path: P.leg + " › 12 Relative clauses", min: 30, note: LEG_NOTE + " Tambahkan dua dialog di Daily Conversations › Professional." },
              },
            ],
          },
          {
            name: "Waktu & Kebiasaan",
            theme: "Future, present perfect, modals",
            weeks: [
              {
                sat: { kind: "grammar", what: "Grammar A2: video 15 sampai 20", path: P.a2, min: 40, note: "Semua bentuk future: present continuous, going to, will." },
                sun: { kind: "listening", what: "Learn English Grammar 10 + 11: Going to dan Will", path: P.leg, min: 40, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 21 sampai 27", path: P.a2, min: 55, note: "Present perfect: just, yet, already, for, since." },
                sun: { kind: "listening", what: "Learn English Grammar 09: Present perfect", path: P.leg + " › 09 Present perfect", min: 35, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 28 sampai 35", path: P.a2, min: 55, note: "Perbandingan, to + verb, verb + ing." },
                sun: { kind: "listening", what: "Learn English Grammar 13: Verb -ing", path: P.leg + " › 13 Verb -ing", min: 30, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 36 sampai 43", path: P.a2, min: 50, note: "Must, have to, may/might, conditional 1 dan 2." },
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
                sat: { kind: "buffer", what: "Minggu cadangan: kejar sesi yang tertinggal", path: P.pron, min: 15, note: "Kalau tidak ada yang tertinggal, tonton Pronunciation Session 13 (Phrase Reduction) supaya ucapan cepat lebih mudah ditangkap." },
                sun: { kind: "test", what: "Tes kecil: dua Daily Conversations tanpa transkrip", path: P.dc + " › Personal › With Friends", min: 25, note: "Two Friends Talking about Books dan Talking about Politics. Dengar dulu tanpa teks, lalu cek seberapa banyak yang dipahami." },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 44 sampai 49", path: P.a2, min: 40, note: "Used to dan passive." },
                sun: { kind: "reading", what: "Market Leader Pre-Intermediate: Unit 1", path: P.ml, min: 45, note: "Bagian Reading dan Listening. Teks di Course Book PDF, audio di folder Audio Course, kunci jawaban dan transkrip di Teachers Book." },
              },
              {
                sat: { kind: "grammar", what: "Grammar A2: video 50 sampai 55", path: P.a2, min: 40, note: "Something/anyone, so/neither, past perfect. Level A2 selesai." },
                sun: { kind: "listening", what: "Learn English Grammar 14: Both, neither, either", path: P.leg + " › 14 Both neither and either", min: 35, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B1: video 1 sampai 5", path: P.b1, min: 45, note: "Ringkasan semua tenses. Cocok untuk mengulang." },
                sun: { kind: "reading", what: "Market Leader Pre-Intermediate: Unit 2", path: P.ml, min: 45, note: "Kalau terasa terlalu berat, pindah ke versi Elementary di folder sebelahnya." },
              },
            ],
          },
          {
            name: "Naik ke B1",
            theme: "Grammar B1 dan uji akhir",
            weeks: [
              {
                sat: { kind: "grammar", what: "Grammar B1: video 6 sampai 11", path: P.b1, min: 45, note: "Future clauses, present perfect continuous, adjective vs adverb." },
                sun: { kind: "listening", what: "Learn English Grammar 15: Even", path: P.leg + " › 15 Even", min: 30, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B1: video 12 sampai 20", path: P.b1, min: 60, note: "Modals dan semua conditional. Sesi paling padat, boleh dibagi dua hari." },
                sun: { kind: "listening", what: "Learn English Grammar 16: Phrasal verbs in & out", path: P.leg + " › 16 Phrasal verbs with in and out", min: 30, note: LEG_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B1: video 21 sampai 29", path: P.b1, min: 60, note: "Reported speech, relative clauses, question tags. Boleh dibagi: 21–25 hari ini, 26–29 besok." },
                sun: { kind: "reading", what: "Book Summary: The 7 Habits", path: P.book, min: 40, note: "Baca PDF sambil mendengarkan MP3-nya. Tidak harus selesai sekali duduk." },
              },
              {
                sat: { kind: "test", what: "Uji akhir: TOEFL ITP Reading Test 1 + SWET 1", path: P.itp, min: 45, note: "Reading Section › TOEFL Reading Tests 1.pdf dan Structure Section › SWET 1.pdf. Soalnya level tes, jadi beberapa salah itu wajar." },
                sun: { kind: "test", what: "Uji akhir: semua Daily Conversations tanpa transkrip", path: P.dc, min: 30, note: "Kalau sekitar 90% sudah paham, Batch 2 siap dibuka." },
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
                sun: { kind: "speaking", what: "Speaking practice: Present simple, Past simple, Present perfect", path: P.leg, min: 30, note: SPEAK_NOTE + " Ketiganya ada di topik 07, 08, dan 09." },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Nouns Set 1", path: P.vocab + " › 03 Nouns Set 1", min: 40, note: VOCAB_NOTE },
                sun: { kind: "writing", what: "Write to Score High: Common Errors Made in Writing", path: P.wtsh + " › 01 Common Errors Made in Writing", min: 45, note: "Setelah menonton, tulis 5 kalimat tentang diri Anda dan cek kesalahan yang sama." },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Verbs Set 1", path: P.vocab + " › 04 Verbs Set 1", min: 40, note: VOCAB_NOTE },
                sun: { kind: "speaking", what: "Speaking practice: Going to, Will, Relative clauses + rekam 1 menit", path: P.leg, min: 30, note: SPEAK_NOTE + " Topik rekaman: rencana akhir pekan depan. " + REC_NOTE },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Adjectives Set 2", path: P.vocab + " › 05 Adjectives Set 2", min: 40, note: VOCAB_NOTE },
                sun: { kind: "writing", what: "Market Leader Pre-Intermediate: tugas Writing Unit 1", path: P.ml, min: 40, note: "Kerjakan tugas menulis di akhir unit, lalu bandingkan dengan contoh di Teachers Book." },
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
                sun: { kind: "speaking", what: "Speaking practice: Verb -ing, Both/neither, Even + rekam 1 menit", path: P.leg, min: 30, note: SPEAK_NOTE + " Topik rekaman: pekerjaan atau kuliah Anda. " + REC_NOTE },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Adjectives Set 3", path: P.vocab + " › 08 Adjectives Set 3", min: 40, note: VOCAB_NOTE },
                sun: { kind: "writing", what: "Market Leader Pre-Intermediate: tugas Writing Unit 2", path: P.ml, min: 40, note: "Biasanya berupa email singkat. Tulis, baca keras sekali, lalu perbaiki." },
              },
              {
                sat: { kind: "speaking", what: "Vocabulary: Nouns Set 3", path: P.vocab + " › 09 Nouns Set 3", min: 40, note: VOCAB_NOTE },
                sun: { kind: "speaking", what: "Speaking practice: Phrasal verbs in & out, Must + shadowing", path: P.leg, min: 30, note: SPEAK_NOTE + " Lanjutkan dengan shadowing satu Daily Conversation: tirukan kalimat per kalimat." },
              },
            ],
          },
          {
            name: "Ngobrol Beneran",
            theme: "Pengucapan dan percakapan pertama",
            weeks: [
              {
                sat: { kind: "speaking", what: "Vocabulary: Verbs Set 3", path: P.vocab + " › 10 Verbs Set 3", min: 40, note: VOCAB_NOTE },
                sun: { kind: "speaking", what: "Pronunciation: Word Endings + TH", path: P.pron, min: 40, note: "Session 6 (Word Endings) dan Session 3 (TH, Voiced T). Ikuti latihannya dengan suara keras." },
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
                sat: { kind: "test", what: "Uji Batch 2: rekam 2 menit + tulis 200 kata", path: P.dc, min: 45, note: "Topik: perkenalkan diri dan rencana Anda. Bandingkan rekaman ini dengan rekaman di minggu ke-3." },
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
                sat: { kind: "grammar", what: "Grammar B2: video 1 sampai 7", path: P.b2, min: 50, note: "Pause di setiap EXERCISE dan tulis jawabannya." },
                sun: { kind: "speaking", what: "Vocabulary: Verbs Set 4", path: P.vocab + " › 13 Verbs Set 4", min: 40, note: VOCAB_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B2: video 8 sampai 14", path: P.b2, min: 50, note: "Buat satu contoh kalimat sendiri untuk tiap aturan baru." },
                sun: { kind: "speaking", what: "Vocabulary: Adjectives Set 5", path: P.vocab + " › 14 Adjectives Set 5", min: 40, note: VOCAB_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B2: video 15 sampai 21", path: P.b2, min: 50, note: "Pause di setiap EXERCISE dan tulis jawabannya." },
                sun: { kind: "speaking", what: "Vocabulary: Nouns Set 5", path: P.vocab + " › 15 Nouns Set 5", min: 40, note: VOCAB_NOTE },
              },
              {
                sat: { kind: "grammar", what: "Grammar B2: video 22 sampai 27", path: P.b2, min: 45, note: "Level B2 selesai. Ini fondasi grammar untuk writing IELTS." },
                sun: { kind: "speaking", what: "Vocabulary: Verbs Set 5", path: P.vocab + " › 16 Verbs Set 5", min: 40, note: VOCAB_NOTE + " Ini set terakhir." },
              },
            ],
          },
          {
            name: "Bahasa Sehari-hari",
            theme: "Phrasal verbs dan idioms",
            weeks: [
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 1 + Set 2", path: P.pv, min: 55, note: "Folder 2 dan 3. Ikuti bagian latihan bicaranya dengan suara keras." },
                sun: { kind: "listening", what: "Real World English Idioms: A–E", path: P.idioms + " › 02 A - E", min: 45, note: "Lima video panjang. Boleh dicicil, catat idiom yang paling berguna saja." },
              },
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 3 + Set 4", path: P.pv, min: 55, note: "Folder 4 dan 5." },
                sun: { kind: "listening", what: "Real World English Idioms: F–J", path: P.idioms + " › 03 F - J", min: 45, note: "Catat maksimal 5 idiom per sesi." },
              },
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 5 + Set 6", path: P.pv, min: 55, note: "Folder 6 dan 7." },
                sun: { kind: "listening", what: "Real World English Idioms: K–O", path: P.idioms + " › 04 K - O", min: 45, note: "Catat maksimal 5 idiom per sesi." },
              },
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 7 + Set 8", path: P.pv, min: 55, note: "Folder 8 dan 9." },
                sun: { kind: "listening", what: "Real World English Idioms: P–T", path: P.idioms + " › 05 P - T", min: 45, note: "Catat maksimal 5 idiom per sesi." },
              },
            ],
          },
          {
            name: "Bahasa Akademik",
            theme: "Kosakata topik IELTS",
            weeks: [
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 9 + Set 10", path: P.pv, min: 55, note: "Folder 10 dan 11." },
                sun: { kind: "listening", what: "Real World English Idioms: U–Z", path: P.idioms + " › 06 U - Z", min: 45, note: "Bagian terakhir kursus idioms." },
              },
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 11 + Set 12", path: P.pv, min: 55, note: "Folder 12 dan 13." },
                sun: { kind: "reading", what: "IELTS Vocabulary: Education + Environment", path: P.ieltsVocab, min: 50, note: "Folder 30 dan 6. Topik yang sangat sering muncul di IELTS." },
              },
              {
                sat: { kind: "speaking", what: "Phrasal Verbs Launch: Set 13 sampai 15", path: P.pv, min: 60, note: "Folder 14, 15, dan 16. Kursus phrasal verbs selesai." },
                sun: { kind: "reading", what: "IELTS Vocabulary: Business + Social Issues", path: P.ieltsVocab, min: 50, note: "Folder 16 dan 13." },
              },
              {
                sat: { kind: "test", what: "Uji Batch 3: Market Leader Upper-Intermediate Unit 1", path: P.mlUp, min: 50, note: "Bagian Reading dan Listening. Kalau sebagian besar paham, Anda sudah di sekitar level B2." },
                sun: { kind: "reading", what: "IELTS Vocabulary: Giving Opinions + Describing Trends", path: P.ieltsVocab, min: 50, note: "Folder 22 dan 26. Langsung dipakai di Writing Task 1 dan 2." },
              },
            ],
          },
        ],
      },
      {
        id: "b4",
        name: "Persiapan IELTS",
        level: "Target band 6.5",
        goal: "Paham format tes, punya strategi, dan lulus 3 simulasi.",
        points: ["Strategi Magoosh tiap bagian", "Latihan soal Cambridge 1–6", "3 simulasi tes penuh"],
        months: [
          {
            name: "Kenal Tesnya",
            theme: "Format, skor awal, reading",
            weeks: [
              {
                sat: { kind: "test", what: "Magoosh: Introduction to the IELTS + rencana belajar", path: P.mag + " › 1. Introduction to the IELTS", min: 50, note: "Sebelas video singkat. Lanjutkan dengan membaca 3-Month Study Plan di folder IELTS Study Plans." },
                sun: { kind: "test", what: "Tes diagnostik: Cambridge 1 Test 1 (Listening + Reading)", path: P.cam + " › Cambridge 1", min: 100, note: "Kerjakan tanpa persiapan, dengan timer. Catat skor ini sebagai titik awal. Boleh dibagi dua hari." },
              },
              {
                sat: { kind: "reading", what: "Magoosh: IELTS Skills (skimming, scanning, paraphrasing)", path: P.mag + " › 2. IELTS Skills", min: 45, note: "Tujuh video. Paraphrasing dipakai di semua bagian tes." },
                sun: { kind: "reading", what: "Magoosh Reading: video 1 sampai 6", path: P.mag + " › 3. Reading", min: 45, note: "SUN Method dan jenis soal matching." },
              },
              {
                sat: { kind: "reading", what: "Magoosh Reading: video 7 sampai 13", path: P.mag + " › 3. Reading", min: 50, note: "True/False/Not Given dan soal completion." },
                sun: { kind: "test", what: "Latihan: Cambridge 2 Test 1, Reading saja", path: P.cam + " › Cambridge 2", min: 60, note: MOCK_NOTE },
              },
              {
                sat: { kind: "listening", what: "Magoosh Listening: video 1 sampai 7", path: P.mag + " › 4. Listening", min: 45, note: "APT Method dan pengenalan Part 1–4." },
                sun: { kind: "listening", what: "Magoosh Listening 8 sampai 13 + Cambridge 2 Test 1 Listening", path: P.mag + " › 4. Listening", min: 70, note: "Tonton jenis soalnya dulu, lalu kerjakan Listening Cambridge 2 Test 1. " + MOCK_NOTE },
              },
            ],
          },
          {
            name: "Writing & Speaking",
            theme: "Task 1, Task 2, dan wawancara",
            weeks: [
              {
                sat: { kind: "writing", what: "Magoosh Writing: video 1 sampai 9 (Task 1)", path: P.mag + " › 6. Writing", min: 55, note: "Cara mendeskripsikan grafik, tabel, dan proses." },
                sun: { kind: "writing", what: "Tulis Writing Task 1 dari Cambridge 3 Test 1", path: P.cam + " › Cambridge 3", min: 40, note: "Batas 20 menit dan minimal 150 kata. Lalu bandingkan dengan contoh jawaban." },
              },
              {
                sat: { kind: "writing", what: "Magoosh Writing: video 10 sampai 15 (struktur Task 2)", path: P.mag + " › 6. Writing", min: 50, note: "Introduction, thesis, body paragraph, conclusion." },
                sun: { kind: "writing", what: "Write to Score High 03–04 + tulis satu essay Task 2", path: P.wtsh, min: 60, note: "Tonton bab 03 dan 04, lalu tulis essay dalam 40 menit, minimal 250 kata." },
              },
              {
                sat: { kind: "writing", what: "Magoosh Writing: video 16 sampai 20 (jenis essay)", path: P.mag + " › 6. Writing", min: 45, note: "Advantages/disadvantages, agree/disagree, cause/solution." },
                sun: { kind: "writing", what: "Tulis Writing Task 2 dari Cambridge 3 Test 2", path: P.cam + " › Cambridge 3", min: 50, note: "Batas 40 menit. Cek ulang articles dan kesalahan umum dari Batch 2." },
              },
              {
                sat: { kind: "speaking", what: "Magoosh Speaking: video 1 sampai 7", path: P.mag + " › 5. Speaking", min: 50, note: "Part 1, Part 2, Part 3, dan struktur jawaban." },
                sun: { kind: "speaking", what: "Latihan Speaking Part 1–3 dengan soal Cambridge 4 Test 1", path: P.cam + " › Cambridge 4", min: 40, note: "Rekam semua jawaban. Part 2: siapkan 1 menit, bicara 2 menit." },
              },
            ],
          },
          {
            name: "Simulasi",
            theme: "Tes penuh dan daftar",
            weeks: [
              {
                sat: { kind: "speaking", what: "Magoosh Speaking: video 8 sampai 14", path: P.mag + " › 5. Speaking", min: 55, note: "Cara menaikkan band score dan 3 contoh wawancara." },
                sun: { kind: "speaking", what: "Contoh Speaking resmi + rekam Part 2", path: P.ocg + " › IELTS Speaking Section Examples", min: 40, note: "Tonton contohnya, lalu rekam jawaban Anda untuk topik yang sama dan bandingkan." },
              },
              {
                sat: { kind: "test", what: "Simulasi #1: Cambridge 5 Test 1 (Listening, Reading, Writing)", path: P.cam + " › Cambridge 5", min: 170, note: MOCK_NOTE + " Sesi panjang, boleh dibagi Sabtu–Minggu." },
                sun: { kind: "test", what: "Simulasi #1: Speaking + review kesalahan", path: P.cam + " › Cambridge 5", min: 45, note: "Rekam Speaking Test 1, lalu tulis 3 kesalahan terbesar dari simulasi ini." },
              },
              {
                sat: { kind: "test", what: "Simulasi #2: Cambridge 6 Test 1 (Listening + Reading)", path: P.cam + " › Cambridge 6", min: 120, note: MOCK_NOTE },
                sun: { kind: "test", what: "Simulasi #2: Writing Cambridge 6 Test 1 + review", path: P.cam + " › Cambridge 6", min: 70, note: "Task 1 dan Task 2 dalam 60 menit, persis seperti tes." },
              },
              {
                sat: { kind: "test", what: "Simulasi #3: Cambridge 6 Test 2 penuh", path: P.cam + " › Cambridge 6", min: 180, note: MOCK_NOTE + " Kalau skornya sudah dekat target, Anda siap daftar tes." },
                sun: { kind: "test", what: "Evaluasi dan pilih tanggal tes IELTS", path: P.plans, min: 30, note: "Bandingkan skor diagnostik dengan simulasi #3. Cek syarat LPDP terbaru, lalu pilih tanggal tes resmi." },
              },
            ],
          },
        ],
      },
    ],
  };
})();
