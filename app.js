(function () {
  "use strict";

  const PLAN = window.PLAN;
  const START = new Date(PLAN.start[0], PLAN.start[1], PLAN.start[2]);
  const KEY = "jalur-inggris:v1"; // nama lama aplikasi; tetap dipakai supaya progres yang sudah tersimpan tidak hilang
  const DAY_MS = 86400000;
  const XP = { full: 100, min: 40 };
  const XP_PER_LEVEL = 400;
  const LEVELS_PER_TIER = 3;
  const TIERS = [
    "Pemula",
    "Penangkap Kata",
    "Pembaca Tekun",
    "Telinga Tajam",
    "Mulai Bicara",
    "Penulis Rapi",
    "Penjelajah B2",
    "Kosakata Akademik",
    "Pejuang IELTS",
    "Siap LPDP",
  ];
  const KIND_LABEL = { grammar: "Grammar", listening: "Listening", reading: "Reading", speaking: "Speaking", writing: "Writing", test: "Uji", buffer: "Cadangan" };
  const A2_SESSIONS = ["w3-sat", "w4-sat", "w5-sat", "w6-sat", "w7-sat", "w8-sat", "w10-sat", "w11-sat"];

  const svg = (body, extra = "") =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;
  const ICON = {
    flame: svg('<path d="M12 2c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.6 1.2 2.5 2 2.5 0-3 0-5.5 1-8Z" fill="currentColor" stroke="none"/>'),
    bolt: svg('<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="currentColor" stroke="none"/>'),
    check: svg('<path d="M5 12.5 10 17l9-10"/>'),
    copy: svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>'),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    play: svg('<path d="M7 4v16l13-8Z"/>'),
    heart: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>'),
    lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    unlock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>'),
    flag: svg('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
    award: svg('<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>'),
    rotate: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
    trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>'),
    mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
    book: svg('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>'),
    flameLine: svg('<path d="M12 2c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.6 1.2 2.5 2 2.5 0-3 0-5.5 1-8Z"/>'),
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    spark: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" fill="currentColor"/>'),
  };

  const CHEERS = [
    "Mantap! Satu langkah lagi di jalur.",
    "Kerja bagus. Istirahat dulu, Anda pantas.",
    "Telinga Anda makin tajam.",
    "Konsisten itu kuncinya. Sampai jumpa di sesi berikutnya.",
    "Sesi beres. Progres kecil, tapi nyata.",
  ];

  // ---------- Tanggal ----------
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromYmd = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => {
    const x = startOfDay(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));
  const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS);
  // Sabtu terdekat untuk memulai batch: hari ini kalau Sabtu, kemarin kalau Minggu.
  const weekendStart = (d) => (d.getDay() === 6 ? startOfDay(d) : d.getDay() === 0 ? addDays(d, -1) : addDays(d, 6 - d.getDay()));
  const fmtShort = (d) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const fmtMonth = (d) => d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const fmtLong = (d) => d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });

  // ---------- Rencana ----------
  const BATCHES = PLAN.batches.map((b, bi) => {
    const batch = Object.assign({}, b, { index: bi, weeks: [], sessions: [] });
    b.months.forEach((month, mi) => {
      month.weeks.forEach((w) => {
        const no = batch.weeks.length + 1;
        const week = { no, month: mi, buffer: !!w.buffer, sessions: [] };
        [["sat", "Sabtu", 0], ["sun", "Minggu", 1]].forEach(([k, day, offset]) => {
          const id = bi === 0 ? `w${no}-${k}` : `${b.id}-w${no}-${k}`;
          const s = Object.assign({}, w[k], { id, day, offset: (no - 1) * 7 + offset, week: no, month: mi, batch: bi });
          week.sessions.push(s);
          batch.sessions.push(s);
        });
        batch.weeks.push(week);
      });
    });
    return batch;
  });
  const ALL = BATCHES.flatMap((b) => b.sessions);
  const BY_ID = Object.fromEntries(ALL.map((s) => [s.id, s]));

  // ---------- Penyimpanan ----------
  function emptyState() {
    return { done: {}, log: [], basePath: "", batchStart: {}, name: "Vicky", scores: {}, media: {} };
  }
  function isValid(s) {
    return s && typeof s === "object" && s.done && typeof s.done === "object" && Array.isArray(s.log);
  }
  function normalize(s) {
    const n = Object.assign(emptyState(), s);
    if (!n.batchStart || typeof n.batchStart !== "object") n.batchStart = {};
    if (!n.scores || typeof n.scores !== "object") n.scores = {};
    if (!n.media || typeof n.media !== "object") n.media = {};
    return n;
  }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (isValid(raw)) return normalize(raw);
    } catch (e) {}
    return emptyState();
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      toast("Progres gagal disimpan di browser ini. Unduh cadangan lewat Pengaturan.");
    }
  }
  let state = load();
  let viewBatch = null;

  // ---------- Status batch ----------
  const batchDoneCount = (bi) => BATCHES[bi].sessions.filter((s) => state.done[s.id]).length;
  const batchDone = (bi) => batchDoneCount(bi) === BATCHES[bi].sessions.length;
  const isUnlocked = (bi) => bi === 0 || batchDone(bi - 1);
  function activeBatch() {
    const i = BATCHES.findIndex((b) => isUnlocked(b.index) && !batchDone(b.index));
    return i === -1 ? BATCHES.length - 1 : i;
  }
  const allDone = () => BATCHES.every((b) => batchDone(b.index));

  // Batch yang baru terbuka mulai di akhir pekan terdekat; batch yang terkunci lagi melepas tanggalnya.
  function syncBatchStarts() {
    let changed = false;
    BATCHES.forEach((b) => {
      if (b.index === 0) return;
      if (isUnlocked(b.index) && !state.batchStart[b.id]) {
        state.batchStart[b.id] = ymd(weekendStart(new Date()));
        changed = true;
      } else if (!isUnlocked(b.index) && state.batchStart[b.id]) {
        delete state.batchStart[b.id];
        changed = true;
      }
    });
    if (changed) save();
  }

  // Tanggal mulai: nyata untuk batch yang terbuka, perkiraan untuk yang masih terkunci.
  function batchStart(bi) {
    if (bi === 0) return START;
    const b = BATCHES[bi];
    if (state.batchStart[b.id]) return fromYmd(state.batchStart[b.id]);
    const prev = BATCHES[bi - 1];
    const planned = addDays(batchStart(bi - 1), prev.weeks.length * 7);
    if (isUnlocked(bi - 1)) {
      const remainingWeeks = Math.ceil((prev.sessions.length - batchDoneCount(bi - 1)) / 2);
      const projected = addDays(weekendStart(new Date()), remainingWeeks * 7);
      return projected > planned ? projected : planned;
    }
    return planned;
  }
  const sessionDate = (s) => addDays(batchStart(s.batch), s.offset);
  const batchEnd = (bi) => addDays(batchStart(bi), BATCHES[bi].weeks.length * 7 - 6);

  // ---------- Statistik ----------
  function stats() {
    const today = new Date();
    const doneCount = ALL.filter((s) => state.done[s.id]).length;
    const minCount = state.log.filter((e) => e.kind === "min").length;
    const xp = state.log.reduce((sum, e) => sum + (XP[e.kind] || 0), 0);
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const tier = TIERS[Math.min(TIERS.length - 1, Math.floor((level - 1) / LEVELS_PER_TIER))];
    const intoLevel = xp - (level - 1) * XP_PER_LEVEL;

    const weeks = new Set(state.log.map((e) => ymd(mondayOf(fromYmd(e.date)))));
    const thisWeek = mondayOf(today);
    const activeThisWeek = weeks.has(ymd(thisWeek));
    let cursor = activeThisWeek ? thisWeek : addDays(thisWeek, -7);
    let streak = 0;
    while (weeks.has(ymd(cursor))) {
      streak++;
      cursor = addDays(cursor, -7);
    }
    let best = 0;
    let run = 0;
    let prev = null;
    [...weeks].sort().forEach((k) => {
      const d = fromYmd(k);
      run = prev && daysBetween(prev, d) === 7 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = d;
    });
    const recentWeeks = Array.from({ length: 8 }, (_, i) => weeks.has(ymd(addDays(thisWeek, -7 * (7 - i)))));

    const dates = [...new Set(state.log.map((e) => e.date))].sort();
    let comeback = false;
    for (let i = 1; i < dates.length; i++) {
      if (daysBetween(fromYmd(dates[i - 1]), fromYmd(dates[i])) >= 14) comeback = true;
    }

    const active = activeBatch();
    const ab = BATCHES[active];
    const abStart = batchStart(active);
    const expected = ab.sessions.filter((s) => sessionDate(s) <= startOfDay(today)).length;
    const currentWeek = today < abStart ? 0 : Math.min(ab.weeks.length, Math.floor(daysBetween(abStart, today) / 7) + 1);

    return {
      doneCount, minCount, xp, level, tier, intoLevel, streak, best, activeThisWeek, recentWeeks, comeback,
      active, activeDone: batchDoneCount(active), expected, currentWeek,
    };
  }

  const BADGES = [
    { id: "first", name: "Langkah Pertama", desc: "Selesaikan sesi pertama", icon: "play", test: (s) => s.doneCount >= 1 },
    { id: "min", name: "Tetap Hadir", desc: "Pakai versi minimum saat sedang malas", icon: "heart", test: (s) => s.minCount >= 1 },
    { id: "streak4", name: "4 Pekan Beruntun", desc: "Belajar 4 akhir pekan berturut-turut", icon: "flameLine", test: (s) => s.best >= 4 },
    { id: "a2", name: "Lulus A2", desc: "Semua video Grammar A2 selesai", icon: "award", test: () => A2_SESSIONS.every((id) => state.done[id]) },
    { id: "b1", name: "Input Tuntas", desc: "Batch 1 selesai", icon: "book", test: () => batchDone(0) },
    { id: "b2", name: "Berani Bicara", desc: "Batch 2 selesai", icon: "mic", test: () => batchDone(1) },
    { id: "comeback", name: "Bangkit Lagi", desc: "Kembali belajar setelah absen 2 minggu", icon: "rotate", test: (s) => s.comeback },
    { id: "ielts", name: "Siap Tes IELTS", desc: "Semua 4 batch selesai", icon: "trophy", test: () => allDone() },
  ];

  // ---------- Util ----------
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nextSession = () => (allDone() ? null : BATCHES[activeBatch()].sessions.find((s) => !state.done[s.id]));
  const hasPartial = (id) => state.log.some((e) => e.id === id && e.kind === "min");
  const tag = (kind) => `<span class="tag tag-${kind}">${KIND_LABEL[kind]}</span>`;
  const sized = (icon, size) => icon.replace("<svg", `<svg width="${size}" height="${size}"`);

  function fullPath(s) {
    const rel = s.path.split(" › ").join("\\");
    const base = (state.basePath || "").trim().replace(/[\\/]+$/, "");
    return base ? `${base}\\${rel}` : rel;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.append(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (err) {}
      ta.remove();
      return ok;
    }
  }

  async function copyPath(s) {
    const ok = await copyText(fullPath(s));
    if (!ok) return toast("Gagal menyalin. Salin lokasi secara manual dari kotak di atas.");
    toast(state.basePath ? "Lokasi disalin. Tempel di address bar File Explorer." : "Lokasi disalin. Atur lokasi folder kursus di Pengaturan agar bisa langsung dibuka.");
  }

  // ---------- Render ----------
  function render() {
    syncBatchStarts();
    const st = stats();
    if (viewBatch === null || !isUnlocked(viewBatch)) viewBatch = st.active;
    renderTop(st);
    renderGreeting(st);
    renderHero(st);
    renderStats(st);
    renderInsights(st);
    renderRoadmap(st);
    renderJourney(st);
    renderBadges(st);
  }

  function renderTop(st) {
    const chipStreak = $("chipStreak");
    chipStreak.innerHTML = `${ICON.flame}<span>${st.streak}</span>`;
    chipStreak.classList.toggle("cold", st.streak === 0);
    chipStreak.title = `Streak: ${st.streak} pekan berturut-turut`;
    $("chipXp").innerHTML = `${ICON.bolt}<span>Lv ${st.level}</span><span class="xp-num">· ${st.xp} XP</span>`;
  }

  // ---------- Sapaan ----------
  const PHRASES = [
    { en: "Little by little, a little becomes a lot.", id: "Sedikit demi sedikit, lama-lama menjadi banyak.", word: "little by little", mean: "sedikit demi sedikit" },
    { en: "Slow progress is still progress.", id: "Kemajuan yang lambat tetap sebuah kemajuan.", word: "progress", mean: "kemajuan" },
    { en: "Don't wait for motivation. Start, and it will follow.", id: "Jangan menunggu motivasi. Mulai saja, nanti motivasi menyusul.", word: "follow", mean: "mengikuti, menyusul" },
    { en: "Every expert was once a beginner.", id: "Setiap ahli dulunya juga seorang pemula.", word: "once", mean: "dulu, pernah" },
    { en: "Mistakes are proof that you are trying.", id: "Kesalahan adalah bukti bahwa kamu sedang berusaha.", word: "proof", mean: "bukti" },
    { en: "Consistency beats intensity.", id: "Konsisten mengalahkan belajar keras sesekali.", word: "beat", mean: "mengalahkan" },
    { en: "Done is better than perfect.", id: "Selesai lebih baik daripada sempurna.", word: "better than", mean: "lebih baik daripada" },
    { en: "Small steps every weekend add up.", id: "Langkah kecil tiap akhir pekan akan terkumpul jadi besar.", word: "add up", mean: "terkumpul, bertambah banyak" },
    { en: "Learning a language is a marathon, not a sprint.", id: "Belajar bahasa itu maraton, bukan lari cepat.", word: "sprint", mean: "lari cepat jarak pendek" },
    { en: "Listen more, and the words will come.", id: "Lebih banyak mendengar, nanti kata-katanya datang sendiri.", word: "will come", mean: "akan datang" },
    { en: "Keep going. You are closer than you think.", id: "Terus jalan. Kamu lebih dekat dari yang kamu kira.", word: "keep going", mean: "terus berjalan, jangan berhenti" },
    { en: "The best time to start was yesterday. The next best time is now.", id: "Waktu terbaik untuk mulai adalah kemarin. Waktu terbaik berikutnya adalah sekarang.", word: "the next best", mean: "terbaik berikutnya" },
    { en: "You don't have to be fast. You just have to keep showing up.", id: "Tidak harus cepat. Cukup terus hadir.", word: "show up", mean: "hadir, datang" },
    { en: "Your future self will thank you.", id: "Dirimu di masa depan akan berterima kasih.", word: "future self", mean: "diri di masa depan" },
    { en: "It always seems impossible until it's done.", id: "Selalu tampak mustahil sampai akhirnya berhasil.", word: "seem", mean: "tampak, kelihatannya" },
    { en: "One page, one video, one step.", id: "Satu halaman, satu video, satu langkah.", word: "step", mean: "langkah" },
    { en: "Today's effort is tomorrow's confidence.", id: "Usaha hari ini adalah rasa percaya diri esok hari.", word: "effort", mean: "usaha" },
    { en: "Don't compare your chapter one to someone else's chapter twenty.", id: "Jangan bandingkan bab satumu dengan bab dua puluh milik orang lain.", word: "compare", mean: "membandingkan" },
    { en: "Every day is a chance to get better.", id: "Setiap hari adalah kesempatan untuk menjadi lebih baik.", word: "get better", mean: "menjadi lebih baik" },
    { en: "Fall seven times, stand up eight.", id: "Jatuh tujuh kali, bangkit delapan kali.", word: "stand up", mean: "berdiri, bangkit" },
    { en: "A journey of a thousand miles begins with a single step.", id: "Perjalanan seribu mil dimulai dengan satu langkah.", word: "journey", mean: "perjalanan" },
    { en: "Practice makes progress, not perfection.", id: "Latihan membawa kemajuan, bukan kesempurnaan.", word: "perfection", mean: "kesempurnaan" },
    { en: "The more you listen, the more you understand.", id: "Makin banyak mendengar, makin banyak yang kamu pahami.", word: "the more…, the more…", mean: "makin…, makin…" },
    { en: "Rest if you must, but don't quit.", id: "Istirahatlah kalau perlu, tapi jangan berhenti.", word: "quit", mean: "berhenti, menyerah" },
    { en: "Learning is a treasure that follows its owner everywhere.", id: "Ilmu adalah harta yang mengikuti pemiliknya ke mana pun.", word: "treasure", mean: "harta karun" },
    { en: "Courage doesn't always roar.", id: "Keberanian tidak selalu bersuara keras.", word: "roar", mean: "mengaum" },
    { en: "Quiet people have the loudest minds.", id: "Orang pendiam punya pikiran yang paling ramai.", word: "loud", mean: "keras, ramai" },
    { en: "Believe you can, and you're halfway there.", id: "Percayalah kamu bisa, dan kamu sudah setengah jalan.", word: "halfway", mean: "setengah jalan" },
    { en: "Small daily improvements lead to big results.", id: "Perbaikan kecil setiap hari membawa hasil besar.", word: "lead to", mean: "membawa ke, menghasilkan" },
    { en: "A new language is a new life.", id: "Bahasa baru adalah kehidupan baru.", word: "language", mean: "bahasa" },
    { en: "Don't be afraid to make mistakes. That's how you learn.", id: "Jangan takut salah. Begitulah caranya belajar.", word: "be afraid to", mean: "takut untuk" },
    { en: "Your only competition is who you were yesterday.", id: "Sainganmu hanyalah dirimu yang kemarin.", word: "competition", mean: "persaingan, saingan" },
    { en: "Start where you are. Use what you have.", id: "Mulai dari tempatmu sekarang. Pakai apa yang kamu punya.", word: "use", mean: "memakai, menggunakan" },
    { en: "Good things take time.", id: "Hal baik butuh waktu.", word: "take time", mean: "butuh waktu" },
    { en: "Practice in silence, and let your progress speak.", id: "Berlatihlah dalam diam, biarkan kemajuanmu yang berbicara.", word: "silence", mean: "keheningan, diam" },
    { en: "Every word you learn opens a new door.", id: "Setiap kata yang kamu pelajari membuka pintu baru.", word: "open a door", mean: "membuka pintu (kesempatan)" },
    { en: "Be patient with yourself.", id: "Bersabarlah dengan dirimu sendiri.", word: "patient", mean: "sabar" },
    { en: "You are braver than you believe.", id: "Kamu lebih berani daripada yang kamu kira.", word: "brave", mean: "berani" },
    { en: "Weekends are for growing, too.", id: "Akhir pekan juga waktu untuk bertumbuh.", word: "grow", mean: "tumbuh, berkembang" },
    { en: "Speak, even if your voice shakes.", id: "Bicaralah, meskipun suaramu bergetar.", word: "shake", mean: "bergetar, gemetar" },
  ];
  const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const salamFor = (h) => (h >= 4 && h < 11 ? "Selamat pagi" : h >= 11 && h < 15 ? "Selamat siang" : h >= 15 && h < 18 ? "Selamat sore" : "Selamat malam");
  const fmtTime = (d) => `${pad(d.getHours())}.${pad(d.getMinutes())}`;
  const fmtDuration = (m) => (m < 60 ? `${m} mnt` : `${Math.floor(m / 60)} jam${m % 60 ? ` ${m % 60} mnt` : ""}`);
  const nameOf = () => (state.name || "").trim();

  function greetingMessage(st, now) {
    const name = nameOf();
    const h = now.getHours();
    const wd = now.getDay();
    const weekend = wd === 6 || wd === 0;
    const today = ymd(now);
    const next = nextSession();
    const ab = BATCHES[st.active];
    const remaining = ab.sessions.length - st.activeDone;
    const behind = st.expected - st.activeDone;
    const studiedToday = state.log.some((e) => e.date === today);
    const abStart = batchStart(st.active);
    const daysToSat = (6 - wd + 7) % 7;

    if (allDone()) return `Semua ${ALL.length} sesi selesai${name ? `, ${name}` : ""}. Tinggal satu langkah: pilih tanggal tes IELTS resmi.`;
    if (startOfDay(now) < START) {
      const left = daysBetween(now, START);
      return `Perjalanan dimulai ${fmtLong(START)}, ${left === 1 ? "besok" : `${left} hari lagi`}. Mau curi start? Kartu di bawah sudah siap.`;
    }
    if (studiedToday) return `Sesi hari ini sudah tercatat. Mantap${name ? `, ${name}` : ""}! Nikmati sisa harinya, atau lanjut satu sesi lagi kalau masih semangat.`;
    if (st.active > 0 && st.activeDone === 0 && daysBetween(abStart, now) < 7) return `Batch ${st.active + 1}: ${ab.name} baru saja terbuka. Babak baru dimulai, ${ab.goal.charAt(0).toLowerCase()}${ab.goal.slice(1)}`;
    if (h >= 22 || h < 4) return weekend ? "Sudah larut. Kalau masih mau, cukup satu video saja, lalu istirahat." : "Sudah larut. Istirahat dulu, Sabtu nanti kita lanjut lagi.";
    if (weekend) {
      if (behind >= 2) return `Tertinggal ${behind} sesi, dan itu tidak apa-apa. Satu sesi hari ini sudah membuat jaraknya lebih dekat.`;
      if (remaining <= 4) return `Tinggal ${remaining} sesi lagi menuju akhir Batch ${st.active + 1}. Hampir sampai!`;
      if (st.streak >= 2) return `Streak ${st.streak} pekan sedang menyala. Satu sesi hari ini menjaganya tetap hidup.`;
      if (st.best > 0 && st.streak === 0) return "Streak sempat putus, tapi hari ini saat yang pas untuk mulai lagi.";
      return `Hari belajar! Satu sesi saja sudah cukup${next ? `, kira-kira ${next.min} menit` : ""}.`;
    }
    if (wd === 5) return next ? `Besok Sabtu. Sesi besok: ${next.what}, sekitar ${next.min} menit.` : "Besok Sabtu, hari belajar.";
    if (st.activeThisWeek) return `Pekan ini sudah ada sesi yang tercatat. Hari kerja, santai dulu. ${daysToSat} hari lagi ke Sabtu.`;
    return `Hari kerja, santai dulu. ${daysToSat} hari lagi ke Sabtu. Kalau sempat, putar ulang satu Daily Conversation selama 2 menit.`;
  }

  function dayChip(now) {
    const wd = now.getDay();
    if (wd === 6 || wd === 0) return { text: "Hari belajar", cls: "on" };
    if (wd === 5) return { text: "Besok Sabtu", cls: "soon" };
    const d = 6 - wd;
    return { text: `${d} hari lagi ke Sabtu`, cls: "" };
  }

  function renderGreeting(st) {
    const now = new Date();
    const name = nameOf();
    const chip = dayChip(now);
    $("today").textContent = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    $("clock").textContent = fmtTime(now);
    $("dayChip").textContent = chip.text;
    $("dayChip").className = `day-chip ${chip.cls}`;
    $("greet").textContent = `${salamFor(now.getHours())}${name ? `, ${name}` : ""}.`;
    $("greetSub").textContent = greetingMessage(st, now);
    renderStrip(st);
  }

  function renderStrip(st) {
    const total = ALL.length;
    const pct = (st.doneCount / total) * 100;
    const name = nameOf();
    const segs = BATCHES.map((b) => {
      const n = batchDoneCount(b.index);
      const cls = batchDone(b.index) ? "done" : isUnlocked(b.index) ? "active" : "locked";
      return `<div class="strip-seg ${cls}" style="flex:${b.sessions.length}">
          <span class="strip-fill" style="width:${(n / b.sessions.length) * 100}%"></span>
          <span class="strip-label" title="${esc(b.name)}">Batch ${b.index + 1}</span>
        </div>`;
    }).join("");
    const ab = BATCHES[st.active];
    const where = allDone() ? "Semua batch selesai" : `Batch ${st.active + 1} · minggu ${Math.max(st.currentWeek, 1)} dari ${ab.weeks.length}`;
    $("journeyStrip").innerHTML = `
      <div class="strip-head">
        <span><b>Perjalanan${name ? ` ${esc(name)}` : ""}</b> · ${st.doneCount} dari ${total} sesi (${Math.round(pct)}%)</span>
        <span class="strip-where">${esc(where)}</span>
      </div>
      <div class="strip-track">
        ${segs}
        <span class="strip-goal" title="Tes IELTS">${sized(ICON.flag, 14)}</span>
        <span class="strip-pin" style="left:calc((100% - 34px) * ${(pct / 100).toFixed(4)})" aria-hidden="true"></span>
      </div>
      <div class="strip-foot">
        <span>Mulai ${esc(fmtShort(START))}</span>
        <span>Perkiraan siap tes: <b>${esc(fmtMonth(batchEnd(BATCHES.length - 1)))}</b></span>
      </div>`;
  }

  function renderInsights(st) {
    const now = new Date();
    const dayIndex = Math.floor(startOfDay(now) / DAY_MS);
    const p = PHRASES[((dayIndex % PHRASES.length) + PHRASES.length) % PHRASES.length];

    const minutes = state.log.reduce((sum, e) => sum + (e.kind === "full" ? (BY_ID[e.id] ? BY_ID[e.id].min : 0) : 10), 0);
    const dayCount = {};
    state.log.forEach((e) => {
      const d = fromYmd(e.date).getDay();
      dayCount[d] = (dayCount[d] || 0) + 1;
    });
    const favDay = Object.keys(dayCount).sort((a, b) => dayCount[b] - dayCount[a])[0];
    const kindCount = {};
    ALL.filter((s) => state.done[s.id]).forEach((s) => (kindCount[s.kind] = (kindCount[s.kind] || 0) + 1));
    const topKind = Object.keys(kindCount).sort((a, b) => kindCount[b] - kindCount[a])[0];
    const ab = BATCHES[st.active];
    const remaining = ab.sessions.length - st.activeDone;
    const remainingMin = ab.sessions.filter((s) => !state.done[s.id]).reduce((sum, s) => sum + s.min, 0);

    const items = [
      { label: "Total waktu belajar", value: minutes ? fmtDuration(minutes) : "0 mnt", foot: minutes ? `dari ${state.log.length} catatan sesi` : "Mulai dari sesi pertama" },
      { label: "Hari paling rajin", value: favDay !== undefined ? DAY_NAMES[favDay] : "Belum ada", foot: favDay !== undefined ? `${dayCount[favDay]} sesi di hari ${DAY_NAMES[favDay]}` : "Terlihat setelah beberapa sesi" },
      { label: `Sisa Batch ${st.active + 1}`, value: allDone() ? "Selesai" : `${remaining} sesi`, foot: allDone() ? "Semua batch tuntas" : `±${fmtDuration(remainingMin)} · ±${Math.ceil(remaining / 2)} akhir pekan` },
      (() => {
        const sc = latestScore();
        if (!sc) return { label: "Paling banyak dipelajari", value: topKind ? KIND_LABEL[topKind] : "Belum ada", foot: topKind ? `${kindCount[topKind]} sesi selesai` : "Terlihat setelah sesi pertama" };
        const { result, parts, type } = scoreSummary(sc);
        const isMl = type === EXAM_TYPES.ml;
        const value = result.value !== null ? (isMl ? result.text : `Band ${result.text}`) : `${parts.length} bagian tercatat`;
        const foot = result.value !== null && isMl ? `${sc.label} · ${mlVerdict(result.value)}` : `${sc.label} · ${parts.join(" · ")}`;
        return { label: "Skor tes terakhir", value, foot };
      })(),
    ];

    $("phrase").innerHTML = `
      <span class="eyebrow">Kalimat hari ini</span>
      <p class="phrase-en">“${esc(p.en)}”</p>
      <p class="phrase-id">${esc(p.id)}</p>
      <p class="phrase-word"><b>${esc(p.word)}</b> = ${esc(p.mean)}</p>`;
    $("insights").innerHTML = items
      .map((i) => `
        <div class="insight">
          <span class="stat-label">${esc(i.label)}</span>
          <span class="insight-value">${esc(i.value)}</span>
          <span class="stat-foot">${esc(i.foot)}</span>
        </div>`)
      .join("");
  }

  function renderHero(st) {
    const hero = $("hero");
    const s = nextSession();
    if (!s) {
      hero.innerHTML = `
        <span class="hero-sticker">${ICON.trophy} Perjalanan tuntas</span>
        <h2><span class="hl">${ALL.length} dari ${ALL.length} sesi selesai. Luar biasa.</span></h2>
        <p class="hero-note">${esc(PLAN.destination.note)}</p>`;
      return;
    }
    const date = sessionDate(s);
    const late = date < startOfDay(new Date());
    hero.innerHTML = `
      <span class="hero-sticker">${ICON.play} Sesi berikutnya</span>
      <div class="hero-top">
        ${tag(s.kind)}
        <span class="pill">Batch ${s.batch + 1} · Minggu ${s.week} · ${s.day}</span>
        ${hasPartial(s.id) ? '<span class="pill warm">Lanjutan</span>' : ""}
      </div>
      <h2><span class="hl">${esc(s.what)}</span></h2>
      <div class="hero-meta">
        <span>${ICON.clock} ±${s.min} menit</span>
        <span>${ICON.calendar} ${late ? "Jadwal awal" : "Target"} ${esc(fmtLong(date))}</span>
      </div>
      <div class="hero-path">
        <code>${esc(s.path)}</code>
        <button type="button" id="heroCopy">${ICON.copy} Salin lokasi</button>
      </div>
      <p class="hero-note">${esc(s.note)}</p>
      ${state.basePath ? "" : '<p class="hero-hint">Tip: <button type="button" id="heroSetPath">atur lokasi folder kursus</button> supaya lokasi bisa langsung ditempel di File Explorer.</p>'}
      <div class="hero-actions">
        <button type="button" class="btn btn-primary" id="heroDone">${ICON.check} Selesai</button>
        ${window.EloMedia && window.EloMedia.supported ? `<button type="button" class="btn btn-ghost" id="heroMedia">${ICON.play} Buka materi</button>` : ""}
        <button type="button" class="btn btn-ghost" id="heroMin">Cuma sempat 1 video</button>
        ${s.exam ? `<button type="button" class="btn btn-ghost" id="heroExam">${ICON.clock} Mode Ujian</button>` : ""}
      </div>
      <button type="button" class="hero-ask" id="heroAsk">${sized(ICON.spark, 16)} Bingung? Tanya Elocia tentang sesi ini</button>`;
    $("heroAsk").addEventListener("click", () => window.EloChat && window.EloChat.open("kuis"));
    if ($("heroExam")) $("heroExam").addEventListener("click", () => openSession(s.id));
    if ($("heroMedia")) $("heroMedia").addEventListener("click", () => openSession(s.id, true));
    $("heroCopy").addEventListener("click", () => copyPath(s));
    $("heroDone").addEventListener("click", () => complete(s.id, "full"));
    $("heroMin").addEventListener("click", () => complete(s.id, "min"));
    const setPath = $("heroSetPath");
    if (setPath) setPath.addEventListener("click", openSettings);
  }

  function renderStats(st) {
    const ab = BATCHES[st.active];
    const total = ab.sessions.length;
    const C = 2 * Math.PI * 23;
    const behind = st.expected - st.activeDone;
    const pace = st.currentWeek === 0 ? "Belum dimulai" : behind <= 0 ? "Sesuai jadwal" : `Tertinggal ${behind} sesi, santai saja`;
    $("stats").innerHTML = `
      <div class="stat">
        <span class="stat-label">Progres Batch ${st.active + 1}</span>
        <div class="stat-ring">
          <svg class="ring" viewBox="0 0 54 54" aria-hidden="true">
            <circle class="track" cx="27" cy="27" r="23"/>
            <circle class="fill" cx="27" cy="27" r="23" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - st.activeDone / total)}"/>
          </svg>
          <span class="stat-value">${st.activeDone}<small>/${total}</small></span>
        </div>
        <span class="stat-foot">${Math.round((st.activeDone / total) * 100)}% batch ini</span>
      </div>
      <div class="stat">
        <span class="stat-label">Streak akhir pekan</span>
        <span class="stat-value">${st.streak} <small>pekan</small></span>
        <div class="flame-dots" aria-label="Aktivitas 8 pekan terakhir">${st.recentWeeks.map((on) => `<i class="${on ? "on" : ""}"></i>`).join("")}</div>
        <span class="stat-foot">Terbaik: ${st.best} pekan</span>
      </div>
      <div class="stat">
        <span class="stat-label">Level ${st.level}</span>
        <span class="stat-value text">${esc(st.tier)}</span>
        <div class="meter"><span style="width:${(st.intoLevel / XP_PER_LEVEL) * 100}%"></span></div>
        <span class="stat-foot">${st.xp} XP · ${XP_PER_LEVEL - st.intoLevel} XP lagi ke level berikutnya</span>
      </div>
      <div class="stat">
        <span class="stat-label">Minggu Batch ${st.active + 1}</span>
        <span class="stat-value">${st.currentWeek}<small>/${ab.weeks.length}</small></span>
        <span class="stat-foot">${pace}</span>
      </div>`;
  }

  function renderRoadmap(st) {
    const cards = BATCHES.map((b) => {
      const bi = b.index;
      const done = batchDone(bi);
      const unlocked = isUnlocked(bi);
      const n = batchDoneCount(bi);
      const status = done ? "done" : unlocked ? "active" : "locked";
      const chip = done
        ? `<span class="rm-chip done">${sized(ICON.check, 14)} Selesai</span>`
        : unlocked
        ? '<span class="rm-chip active">Aktif</span>'
        : `<span class="rm-chip locked">${sized(ICON.lock, 13)} Terkunci</span>`;
      const foot = unlocked
        ? `<div class="rm-progress"><div class="stage-bar"><span style="width:${(n / b.sessions.length) * 100}%"></span></div><span>${n}/${b.sessions.length} sesi</span></div>`
        : `<p class="rm-unlock">Terbuka setelah Batch ${bi} selesai · perkiraan mulai ${esc(fmtMonth(batchStart(bi)))}</p>`;
      const tagName = unlocked ? "button" : "div";
      return `
        <${tagName} ${unlocked ? `type="button" data-batch="${bi}"` : 'aria-disabled="true"'} class="rm-card ${status}${viewBatch === bi ? " viewing" : ""}${justUnlocked === bi ? " just-unlocked" : ""}">
          <div class="rm-top"><span class="rm-num">Batch ${bi + 1}</span>${chip}</div>
          <h3>${esc(b.name)}</h3>
          <p class="rm-meta">${b.weeks.length} minggu · ${esc(b.level)}</p>
          <p class="rm-goal">${esc(b.goal)}</p>
          <ul class="rm-points">${b.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
          ${foot}
        </${tagName}>`;
    }).join("");
    const last = BATCHES.length - 1;
    $("roadmap").innerHTML = `
      <div class="rm-grid">${cards}</div>
      <div class="rm-dest">
        <span class="rm-dest-icon">${ICON.flag}</span>
        <div>
          <b>Tujuan: ${esc(PLAN.destination.title)}</b>
          <p>Perkiraan siap tes: ${esc(fmtMonth(batchEnd(last)))}. ${esc(PLAN.destination.note)}</p>
        </div>
      </div>`;
  }

  function renderJourney(st) {
    const b = BATCHES[viewBatch];
    const next = nextSession();
    const start = batchStart(viewBatch);
    $("journeyTitle").textContent = `Isi Batch ${viewBatch + 1}: ${b.name}`;
    $("journeySub").textContent = `${b.weeks.length} minggu · ${b.sessions.length} sesi · mulai ${fmtShort(start)}`;
    $("journey").innerHTML = b.months
      .map((m, mi) => {
        const weeks = b.weeks.filter((w) => w.month === mi);
        const all = weeks.flatMap((w) => w.sessions);
        const n = all.filter((s) => state.done[s.id]).length;
        const complete = n === all.length;
        const first = weeks[0].sessions[0];
        const last = weeks[weeks.length - 1].sessions[1];
        return `
        <section class="stage${complete ? " complete" : ""}">
          <div class="stage-head">
            <span class="stage-num">${complete ? sized(ICON.check, 22).replace('stroke-width="2"', 'stroke-width="3"') : mi + 1}</span>
            <div class="stage-title">
              <h3>Bulan ${mi + 1}: ${esc(m.name)}</h3>
              <p>${esc(m.theme)} · ${fmtShort(sessionDate(first))} – ${fmtShort(sessionDate(last))}</p>
            </div>
            <span class="stage-count">${n}/${all.length}</span>
          </div>
          <div class="stage-bar"><span style="width:${(n / all.length) * 100}%"></span></div>
          <div class="weeks">
            ${weeks
              .map((w) => {
                const isNow = viewBatch === st.active && w.no === st.currentWeek;
                return `
              <div class="week${isNow ? " now" : ""}">
                <div class="week-label">
                  <b>Minggu ${w.no}</b>
                  <span>${isNow ? '<span class="week-now">Minggu ini</span>' : fmtShort(sessionDate(w.sessions[0]))}</span>
                </div>
                <div class="sessions">
                  ${w.sessions
                    .map((s) => {
                      const cls = state.done[s.id] ? "done" : next && next.id === s.id ? "next" : hasPartial(s.id) ? "partial" : "";
                      return `
                    <button type="button" class="session ${cls}" data-id="${s.id}">
                      <span class="dot">${ICON.check}</span>
                      <span class="session-body">
                        <span class="session-day">${tag(s.kind)} ${s.day} · ±${s.min} mnt</span>
                        <span class="session-what">${esc(s.what)}</span>
                      </span>
                    </button>`;
                    })
                    .join("")}
                </div>
              </div>`;
              })
              .join("")}
          </div>
        </section>`;
      })
      .join("");
  }

  function renderBadges(st) {
    const got = BADGES.filter((b) => b.test(st)).length;
    $("badgeCount").textContent = `${got} dari ${BADGES.length} terbuka`;
    $("badges").innerHTML = BADGES.map((b) => {
      const ok = b.test(st);
      return `
        <div class="badge ${ok ? "got" : "locked"}">
          <span class="badge-icon">${ICON[b.icon]}</span>
          <b>${esc(b.name)}</b>
          <span>${esc(b.desc)}</span>
        </div>`;
    }).join("");
  }

  // ---------- Aksi ----------
  function complete(id, kind) {
    if (kind === "full" && state.done[id]) return;
    const before = stats();
    const unlockedBefore = new Set(BADGES.filter((b) => b.test(before)).map((b) => b.id));
    const batch = BY_ID[id].batch;
    const batchWasDone = batchDone(batch);
    const today = ymd(new Date());
    if (kind === "full") state.done[id] = today;
    state.log.push({ id, date: today, kind });
    save();
    render();

    const after = stats();
    const fresh = BADGES.filter((b) => !unlockedBefore.has(b.id) && b.test(after));
    const batchFinished = !batchWasDone && batchDone(batch);
    const parts = [];
    if (kind === "full") {
      parts.push(`${CHEERS[Math.floor(Math.random() * CHEERS.length)]} +${XP.full} XP`);
      confetti(batchFinished ? 320 : after.level > before.level || fresh.length ? 220 : 120);
      if (batchFinished) setTimeout(() => celebrate(batch), 650);
    } else {
      parts.push(`Tetap dihitung hadir, streak aman. +${XP.min} XP`);
    }
    if (batchFinished && batch + 1 < BATCHES.length) parts.push(`Batch ${batch + 1} tuntas! Batch ${batch + 2}: ${BATCHES[batch + 1].name} terbuka.`);
    if (after.level > before.level) parts.push(`Naik ke level ${after.level}: ${after.tier}!`);
    if (fresh.length) parts.push(`Pencapaian baru: ${fresh.map((b) => b.name).join(", ")}`);
    toast(parts.join(" "), { label: "Urungkan", run: () => undoLast(id, kind) });
  }

  // ---------- Perayaan batch ----------
  let justUnlocked = null;
  const celeDialog = $("celebrate");

  function batchSummary(sessions) {
    const ids = new Set(sessions.map((s) => s.id));
    const logs = state.log.filter((e) => ids.has(e.id));
    const minutes = logs.reduce((sum, e) => sum + (e.kind === "full" ? BY_ID[e.id].min : 10), 0);
    const weekends = new Set(logs.map((e) => ymd(mondayOf(fromYmd(e.date))))).size;
    return { sessions: sessions.length, minutes, weekends };
  }

  function celebrate(bi) {
    const name = nameOf();
    const b = BATCHES[bi];
    const isFinal = bi === BATCHES.length - 1;
    const sum = batchSummary(isFinal ? ALL : b.sessions);
    const st = stats();
    const statsRow = `
      <div class="cele-stats">
        <div><b>${sum.sessions}</b><span>sesi</span></div>
        <div><b>${sum.minutes >= 60 ? `${Math.round(sum.minutes / 60)} jam` : `${sum.minutes} mnt`}</b><span>belajar</span></div>
        <div><b>${sum.weekends}</b><span>akhir pekan</span></div>
        <div><b>${st.best}</b><span>streak terbaik</span></div>
      </div>`;
    let content;
    if (isFinal) {
      content = `
        <div class="cele-medal final">${sized(ICON.trophy, 46)}</div>
        <p class="eyebrow">Semua ${BATCHES.length} batch tuntas</p>
        <h2 id="celeTitle">Perjalanan selesai${name ? `, ${esc(name)}` : ""}!</h2>
        <p class="cele-lead">Dari fondasi listening sampai simulasi IELTS, semuanya sudah Anda tempuh di akhir pekan. Itu bukan hal kecil.</p>
        ${statsRow}
        <ol class="cele-next">
          <li>Cek syarat skor bahasa LPDP terbaru di situs resmi LPDP.</li>
          <li>Pilih tanggal tes IELTS resmi, idealnya 2–4 minggu dari sekarang.</li>
          <li>Seminggu sebelum tes, ulang satu simulasi Cambridge untuk pemanasan.</li>
        </ol>
        <div class="cele-actions"><button type="button" class="btn btn-primary" data-cele="close">${ICON.check} Terima kasih, Elocia</button></div>`;
    } else {
      const nb = BATCHES[bi + 1];
      content = `
        <div class="cele-medal"><span>${bi + 1}</span></div>
        <p class="eyebrow">Batch ${bi + 1} tuntas · ${esc(b.name)}</p>
        <h2 id="celeTitle">Selamat${name ? `, ${esc(name)}` : ""}!</h2>
        <p class="cele-lead">${esc(b.goal)} Satu babak besar sudah selesai.</p>
        ${statsRow}
        <div class="unlock-card">
          <span class="unlock-lock" aria-hidden="true">
            <span class="lk closed">${sized(ICON.lock, 22)}</span>
            <span class="lk open">${sized(ICON.unlock, 22)}</span>
          </span>
          <div class="unlock-body">
            <span class="unlock-tag">Terbuka</span>
            <b>Batch ${bi + 2}: ${esc(nb.name)}</b>
            <span>${nb.weeks.length} minggu · ${esc(nb.level)} · ${esc(nb.goal)}</span>
          </div>
        </div>
        <div class="cele-actions">
          <button type="button" class="btn btn-primary" data-cele="next">Lihat Batch ${bi + 2} ${sized(ICON.arrow, 18)}</button>
          <button type="button" class="btn btn-ghost" data-cele="close">Nanti dulu</button>
        </div>`;
      justUnlocked = bi + 1;
      render();
      setTimeout(() => (justUnlocked = null), 5000);
    }
    $("celeBody").innerHTML = content;
    $("celeBody").querySelectorAll("[data-cele]").forEach((btn) =>
      btn.addEventListener("click", () => {
        celeDialog.close();
        if (btn.dataset.cele === "next") {
          viewBatch = bi + 1;
          render();
          $("roadmap").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        }
      })
    );
    celeDialog.showModal();
    if (isFinal) fireworks();
  }

  function fireworks() {
    [[0.5, 0.3], [0.2, 0.4], [0.8, 0.4], [0.35, 0.25], [0.65, 0.25], [0.5, 0.45]].forEach(([x, y], i) =>
      setTimeout(() => confetti(160, x, y), 300 + i * 650)
    );
  }

  function undoLast(id, kind) {
    for (let i = state.log.length - 1; i >= 0; i--) {
      if (state.log[i].id === id && state.log[i].kind === kind) {
        state.log.splice(i, 1);
        break;
      }
    }
    if (kind === "full") delete state.done[id];
    save();
    render();
    toast("Dibatalkan.");
  }

  // ---------- Detail sesi ----------
  const sheet = $("sheet");
  function openSession(id, focusMaterials) {
    const s = BY_ID[id];
    if (!s) return;
    const done = state.done[s.id];
    const partial = hasPartial(s.id);
    const status = done
      ? `<p class="status-line ok">${sized(ICON.check, 18)} Selesai pada ${esc(fmtLong(fromYmd(done)))}</p>`
      : partial
      ? `<p class="status-line part">${sized(ICON.flame, 18)} Sudah dicicil dengan versi minimum</p>`
      : "";
    $("sheetBody").innerHTML = `
      <div class="sheet-head">
        <div style="display:grid;gap:10px;min-width:0">
          <div class="row" style="gap:8px;align-items:center">${tag(s.kind)}<span class="muted">Batch ${s.batch + 1} · Minggu ${s.week} · ${s.day}, ${esc(fmtShort(sessionDate(s)))} · ±${s.min} menit</span></div>
          <h2 id="sheetTitle">${esc(s.what)}</h2>
        </div>
        <button class="icon-btn" value="close" aria-label="Tutup">${ICON.close}</button>
      </div>
      <p class="muted">${esc(s.note)}</p>
      <div class="path-box">${esc(s.path)}</div>
      ${status}
      ${window.EloMedia && window.EloMedia.supported ? '<section class="materials" id="materials" aria-live="polite"><p class="muted">Memuat materi…</p></section>' : ""}
      ${s.exam ? examPanel(s) : ""}
      <div class="row">
        <button type="button" class="btn btn-ghost" data-act="copy">${ICON.copy} Salin lokasi</button>
        ${
          done
            ? '<button type="button" class="btn btn-ghost" data-act="undo">Batalkan tanda selesai</button>'
            : `<button type="button" class="btn btn-primary" data-act="full">${ICON.check} Tandai selesai</button>
               <button type="button" class="btn btn-ghost" data-act="min">Cuma sempat 1 video</button>`
        }
      </div>`;
    $("sheetBody").querySelectorAll("[data-act]").forEach((b) => {
      b.addEventListener("click", () => {
        const act = b.dataset.act;
        if (act === "copy") return copyPath(s);
        if (act === "score") return saveScore(s);
        sheet.close();
        if (act === "undo") undoLast(s.id, "full");
        else complete(s.id, act);
      });
    });
    if (s.exam) bindExamPanel(s);
    sheet.showModal();
    if ($("materials")) loadMaterials(s, focusMaterials);
  }

  // ---------- Materi dari folder kursus (media.js) ----------
  let materials = { sid: null, files: [] };
  const prettyName = (name) => name.replace(/(\.(pdf|mp4|mp3|webm|m4v|mov|mkv|m4a|wav|ogg|docx?|epub))+$/i, "");
  const isWatched = (sid, rel) => !!(state.media && state.media[sid] && state.media[sid][rel]);
  const MAT_ICON = { video: ICON.play, audio: ICON.mic, pdf: ICON.book, doc: ICON.book };

  async function loadMaterials(s, focus) {
    const box = $("materials");
    if (!box) return;
    let res;
    try {
      res = await window.EloMedia.listFor(s);
    } catch (e) {
      res = { status: "error" };
    }
    if ($("materials") !== box) return;
    const head = (extra) => `<div class="mat-head"><span class="mat-title">${sized(ICON.play, 16)} Materi sesi ini</span>${extra || ""}</div>`;
    if (res.status === "none") {
      box.innerHTML = `${head()}
        <p class="mat-msg">Putar video, audio, dan PDF langsung di Elocia. Pilih folder <b>World-Class English and Professional Skills</b> di laptop, cukup sekali. Tidak ada file yang diunggah ke mana pun.</p>
        <button type="button" class="btn btn-ghost" data-mat="connect">Hubungkan folder kursus</button>`;
    } else if (res.status === "prompt") {
      box.innerHTML = `${head()}
        <p class="mat-msg">Browser meminta izin ulang untuk membaca folder <b>${esc(window.EloMedia.folderName)}</b>.</p>
        <button type="button" class="btn btn-ghost" data-mat="allow">Izinkan akses folder</button>`;
    } else if (res.status === "missing") {
      box.innerHTML = `${head()}
        <p class="mat-msg">Folder <b>${esc(res.missing)}</b> tidak ketemu di folder yang terhubung (<b>${esc(window.EloMedia.folderName)}</b>). Pastikan yang dipilih adalah folder <b>World-Class English and Professional Skills</b>.</p>
        <button type="button" class="btn btn-ghost" data-mat="connect">Pilih ulang folder</button>`;
    } else if (res.status === "noroot") {
      box.innerHTML = `${head()}<p class="mat-msg">Folder kursus <b>${esc(window.EloMedia.folderName)}</b> tidak ditemukan di laptop. Pastikan foldernya ada di Downloads, lalu jalankan ulang Elocia.</p>`;
    } else if (res.status === "error") {
      box.innerHTML = `${head()}<p class="mat-msg">Folder kursus tidak bisa dibaca. Coba hubungkan ulang lewat Pengaturan.</p>`;
    } else {
      materials = { sid: s.id, files: res.files };
      renderMaterialList(s);
    }
    box.querySelectorAll("[data-mat]").forEach((b) => b.addEventListener("click", () => materialAction(s, b.dataset.mat)));
    if (focus) box.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function renderMaterialList(s) {
    const box = $("materials");
    if (!box || materials.sid !== s.id) return;
    const files = materials.files;
    if (!files.length) {
      box.innerHTML = `<div class="mat-head"><span class="mat-title">${sized(ICON.play, 16)} Materi sesi ini</span></div><p class="mat-msg">Tidak ada video, audio, atau PDF yang cocok di folder sesi ini.</p>`;
      return;
    }
    const playable = files.filter((f) => f.kind === "video" || f.kind === "audio");
    const watched = playable.filter((f) => isWatched(s.id, f.rel)).length;
    box.innerHTML = `
      <div class="mat-head">
        <span class="mat-title">${sized(ICON.play, 16)} Materi sesi ini</span>
        ${playable.length ? `<span class="mat-count">${watched}/${playable.length} ditonton</span>` : ""}
      </div>
      <div class="mat-list">
        ${files
          .map((f, i) => {
            const dir = f.rel.includes("/") ? f.rel.split("/").slice(0, -1).join(" › ") : "";
            return `
          <button type="button" class="mat ${isWatched(s.id, f.rel) ? "seen" : ""}" data-open="${i}">
            <span class="mat-icon mat-${f.kind}">${isWatched(s.id, f.rel) ? sized(ICON.check, 16) : sized(MAT_ICON[f.kind], 16)}</span>
            <span class="mat-name"><b>${esc(prettyName(f.name))}</b>${dir ? `<small>${esc(dir)}</small>` : ""}</span>
            ${f.subtitles ? `<span class="mat-cc" title="Subtitle: ${f.subtitles.map((x) => x.label).join(", ")}">${f.subtitles.map((x) => x.lang.toUpperCase()).join(" · ")}</span>` : ""}
          </button>`;
          })
          .join("")}
      </div>`;
    box.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openViewer(s, Number(b.dataset.open))));
  }

  async function materialAction(s, act) {
    try {
      if (act === "connect") {
        const r = await window.EloMedia.connect();
        if (!r.looksRight) toast(`Folder "${r.name}" terhubung, tapi sepertinya bukan folder kursus. Pilih folder World-Class English and Professional Skills.`);
        else toast("Folder kursus terhubung.");
      } else if (act === "allow") {
        await window.EloMedia.allow();
      }
    } catch (e) {
      if (e && e.name !== "AbortError") toast("Folder tidak bisa dibuka. Coba lagi.");
      return;
    }
    loadMaterials(s);
  }

  // ---------- Pemutar materi ----------
  const viewer = $("viewer");
  let viewerUrls = [];
  let viewerAt = null;
  const releaseViewer = () => {
    viewerUrls.forEach((u) => URL.revokeObjectURL(u));
    viewerUrls = [];
  };

  async function openViewer(s, index) {
    const f = materials.files[index];
    if (!f) return;
    viewerAt = { s, index };
    releaseViewer();
    const where = f.rel.includes("/") ? f.rel.split("/").slice(0, -1).join(" › ") : s.what;
    $("viewerCount").textContent = `${index + 1} dari ${materials.files.length} · ${where}`;
    $("viewerTitle").textContent = prettyName(f.name);
    $("viewerPrev").disabled = index === 0;
    $("viewerNext").disabled = index === materials.files.length - 1;
    const body = $("viewerBody");
    body.innerHTML = '<p class="viewer-msg">Membuka…</p>';
    $("subSwitch").innerHTML = "";
    updateViewerMark();
    if (!viewer.open) viewer.showModal();
    // Mode laptop: file disajikan serve.js lewat URL. Mode pilih folder: dibaca dari handle jadi blob.
    let url = f.url || null;
    if (!url) {
      try {
        url = URL.createObjectURL(await f.handle.getFile());
        viewerUrls.push(url);
      } catch (e) {
        body.innerHTML = '<p class="viewer-msg">File tidak bisa dibaca. Coba hubungkan ulang folder kursus lewat Pengaturan.</p>';
        return;
      }
    }
    if (!viewerAt || viewerAt.index !== index) return;
    if (f.kind === "doc") {
      const where = s.path.split(" › ").join("\\") + "\\" + f.rel.split("/").join("\\");
      body.innerHTML = `<div class="viewer-msg"><p>File .${esc(f.name.split(".").pop())} tidak bisa ditampilkan di browser. ${f.url ? "Unduh salinannya lalu buka dengan Word, atau buka" : "Buka"} lewat File Explorer:</p><code>${esc(where)}</code>${f.url ? `<p><a class="btn btn-primary" href="${f.url}" download="${esc(f.name)}">Unduh dan buka</a></p>` : ""}</div>`;
      return;
    }
    if (f.kind === "pdf") {
      body.innerHTML = `<iframe class="viewer-pdf" src="${url}" title="${esc(f.name)}"></iframe>`;
      return;
    }
    const tag = f.kind === "video" ? "video" : "audio";
    body.innerHTML = f.kind === "video"
      ? `<video id="viewerMedia" class="viewer-video" controls autoplay playsinline preload="metadata" src="${url}"></video>`
      : `<div class="viewer-audio"><span class="viewer-audio-icon">${sized(ICON.mic, 40)}</span><audio id="viewerMedia" controls autoplay src="${url}"></audio></div>`;
    const media = $("viewerMedia");
    if (tag === "video") {
      for (const sub of f.subtitles || []) {
        try {
          const subUrl = await window.EloMedia.subtitleUrl(sub.src);
          if (subUrl.startsWith("blob:")) viewerUrls.push(subUrl);
          const track = document.createElement("track");
          Object.assign(track, { kind: "subtitles", srclang: sub.lang, label: sub.label, src: subUrl });
          media.append(track);
        } catch (e) {}
      }
    }
    renderSubSwitch(f, media);
    media.addEventListener("timeupdate", () => {
      if (media.duration && media.currentTime / media.duration >= 0.9) markWatched(s, f.rel);
    });
    media.addEventListener("ended", () => markWatched(s, f.rel));
    media.addEventListener("error", () => {
      body.innerHTML = '<p class="viewer-msg">Format file ini tidak bisa diputar di browser. Buka lewat File Explorer.</p>';
    });
  }

  // ---------- Pilihan subtitle: Mati / English / Indonesia ----------
  const SUB_PREF = "elocia:subtitle";
  const subPref = () => {
    try {
      return localStorage.getItem(SUB_PREF) || "off";
    } catch (e) {
      return "off";
    }
  };
  const applySub = (media, lang) => Array.from(media.textTracks).forEach((t) => (t.mode = t.language === lang ? "showing" : "disabled"));

  function renderSubSwitch(f, media) {
    const box = $("subSwitch");
    const subs = f.subtitles || [];
    if (f.kind !== "video") {
      box.innerHTML = "";
      return;
    }
    if (!subs.length) {
      const pdf = materials.files.some((x) => x.kind === "pdf");
      box.innerHTML = `<span class="sub-none">Video ini tidak punya subtitle.${pdf ? " Transkrip atau catatannya ada di PDF pada daftar materi." : ""}</span>`;
      return;
    }
    let lang = subPref();
    if (lang !== "off" && !subs.some((s) => s.lang === lang)) lang = "off";
    const opts = [{ lang: "off", label: "Mati" }].concat(subs);
    box.innerHTML =
      `<span class="sub-label" title="Metode 4 langkah: tonton tanpa subtitle dulu, lalu nyalakan">Subtitle</span>` +
      opts.map((o) => `<button type="button" class="sub-opt" data-sub="${o.lang}" aria-pressed="false">${esc(o.label)}</button>`).join("");
    const set = (l) => {
      lang = l;
      applySub(media, l);
      box.querySelectorAll(".sub-opt").forEach((b) => {
        const on = b.dataset.sub === l;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", String(on));
      });
    };
    box.querySelectorAll(".sub-opt").forEach((b) =>
      b.addEventListener("click", () => {
        try {
          localStorage.setItem(SUB_PREF, b.dataset.sub);
        } catch (e) {}
        set(b.dataset.sub);
      })
    );
    set(lang);
    // Track baru siap setelah metadata video dimuat; terapkan ulang pilihan saat itu.
    media.addEventListener("loadedmetadata", () => applySub(media, lang));
  }

  function updateViewerMark() {
    if (!viewerAt) return;
    const f = materials.files[viewerAt.index];
    const seen = f && isWatched(viewerAt.s.id, f.rel);
    const btn = $("viewerMark");
    btn.innerHTML = seen ? `${sized(ICON.check, 16)} Sudah ditandai` : "Tandai sudah dipelajari";
    btn.classList.toggle("on", !!seen);
  }

  function markWatched(s, rel, toggle) {
    state.media = state.media || {};
    state.media[s.id] = state.media[s.id] || {};
    if (state.media[s.id][rel]) {
      if (!toggle) return;
      delete state.media[s.id][rel];
    } else state.media[s.id][rel] = ymd(new Date());
    save();
    updateViewerMark();
    renderMaterialList(s);
    const playable = materials.files.filter((f) => f.kind === "video" || f.kind === "audio");
    if (!toggle && playable.length && playable.every((f) => isWatched(s.id, f.rel)) && !state.done[s.id]) {
      toast("Semua video dan audio sesi ini sudah ditonton. Tandai sesi selesai?", { label: "Tandai selesai", run: () => complete(s.id, "full") });
    }
  }

  $("viewerPrev").addEventListener("click", () => viewerAt && openViewer(viewerAt.s, viewerAt.index - 1));
  $("viewerNext").addEventListener("click", () => viewerAt && openViewer(viewerAt.s, viewerAt.index + 1));
  $("viewerMark").addEventListener("click", () => {
    if (!viewerAt) return;
    markWatched(viewerAt.s, materials.files[viewerAt.index].rel, true);
  });
  $("viewerClose").addEventListener("click", () => viewer.close());
  viewer.addEventListener("close", () => {
    const m = $("viewerMedia");
    if (m) m.pause();
    $("viewerBody").innerHTML = "";
    releaseViewer();
    viewerAt = null;
  });

  // ---------- Mode Ujian ----------
  // Dua format: IELTS (band 0–9) dan Exit Test Market Leader (poin dan persentase).
  const EXAM_TYPES = {
    ielts: {
      order: ["L", "R", "W", "S"],
      resultLabel: "Overall",
      parts: {
        L: { name: "Listening", min: 30, info: "30 menit + 10 menit memindahkan jawaban · 40 soal", kind: "raw", max: 40 },
        R: { name: "Reading", min: 60, info: "60 menit · 40 soal", kind: "raw", max: 40 },
        W: { name: "Writing", min: 60, info: "60 menit · Task 1 + Task 2 · band dari Elocia AI", kind: "band" },
        S: { name: "Speaking", min: 14, info: "11–14 menit · band dari mode Penguji IELTS", kind: "band" },
      },
      note: "Listening dan Reading dikonversi dengan tabel perkiraan IELTS Academic. Writing dan Speaking: minta Elocia AI menilai, lalu isi band-nya. Overall muncul setelah keempat bagian terisi.",
    },
    ml: {
      order: ["L", "G", "R", "W", "S"],
      resultLabel: "Total",
      parts: {
        L: { name: "Listening", min: 20, info: "Soal 1–25 · audio part A dan B", kind: "points", max: 25 },
        G: { name: "Language", min: 20, info: "Soal 26–50 · grammar dan kosakata", kind: "points", max: 25 },
        R: { name: "Reading", min: 15, info: "Soal 51–60 · benar atau salah", kind: "points", max: 10 },
        W: { name: "Writing", min: 20, info: "Laporan 140–160 kata · nilai 0–10 dari Elocia AI", kind: "points", max: 10 },
        S: { name: "Speaking", min: 15, info: "5 menit persiapan + 10 menit bicara · nilai 0–10", kind: "points", max: 10 },
      },
      note: "Kunci jawaban level ini tidak ada di folder kursus. Minta Elocia AI memeriksa jawaban Listening, Language, dan Reading, lalu menilai Writing dan Speaking dengan rubrik guidelines.doc (maksimal 10). Total dihitung dari bagian yang sudah diisi.",
    },
  };
  const typeOf = (x) => EXAM_TYPES[(x && x.type) || "ielts"];

  // Perkiraan umum konversi jumlah benar (dari 40) ke band, IELTS Academic.
  const BAND_TABLE = {
    L: [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [1, 2]],
    R: [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [1, 2]],
  };
  const rawToBand = (part, raw) => {
    for (const [min, band] of BAND_TABLE[part]) if (raw >= min) return band;
    return 0;
  };
  const fmtBand = (b) => (b === null || b === undefined ? "–" : b.toFixed(1).replace(".", ","));

  // Pembulatan Overall ala IELTS: rata-rata dibulatkan ke 0,5 terdekat; ,25 naik ke ,5 dan ,75 naik ke bilangan bulat.
  function overallBand(rec) {
    const bands = EXAM_TYPES.ielts.order.map((p) => (rec && rec[p] ? rec[p].band : null));
    if (bands.some((b) => b === null || b === undefined)) return null;
    const avg = bands.reduce((a, b) => a + b, 0) / 4;
    const whole = Math.floor(avg);
    const frac = avg - whole;
    return frac < 0.25 ? whole : frac < 0.75 ? whole + 0.5 : whole + 1;
  }
  // Persentase dari bagian yang sudah dikerjakan saja, karena Writing dan Speaking di akhir Batch 1 bersifat opsional.
  function totalPercent(rec) {
    const t = EXAM_TYPES.ml;
    const done = t.order.filter((p) => rec && rec[p]);
    if (!done.length) return null;
    const got = done.reduce((a, p) => a + rec[p].raw, 0);
    const max = done.reduce((a, p) => a + t.parts[p].max, 0);
    return Math.round((got / max) * 100);
  }
  const mlVerdict = (pct) =>
    pct >= 80 ? "Sangat siap untuk Batch 2" : pct >= 60 ? "Siap lanjut, perkuat bagian terlemah" : "Ulangi materi bagian terlemah dulu, lalu lanjut";

  // Hasil akhir satu tes: band Overall (IELTS) atau persentase total (Market Leader).
  function examResult(type, rec) {
    if (type === EXAM_TYPES.ml) {
      const pct = totalPercent(rec);
      return { value: pct, text: pct === null ? "–" : `${pct}%` };
    }
    const band = overallBand(rec);
    return { value: band, text: fmtBand(band) };
  }
  function partText(cfg, v) {
    if (!v) return "–";
    if (cfg.kind === "points") return `${Math.round((v.raw / cfg.max) * 100)}%`;
    return fmtBand(v.band);
  }

  function examPanel(s) {
    const type = typeOf(s.exam);
    const rec = state.scores[s.exam.test] || {};
    const rows = s.exam.parts
      .map((p) => {
        const cfg = type.parts[p];
        const saved = rec[p];
        const value = saved ? (cfg.kind === "band" ? saved.band : saved.raw) : "";
        const input =
          cfg.kind === "band"
            ? `<input type="number" inputmode="decimal" min="0" max="9" step="0.5" id="exam-${p}" value="${value}" placeholder="0–9" aria-label="Band ${cfg.name}"><span class="exam-of">band</span>`
            : `<input type="number" inputmode="numeric" min="0" max="${cfg.max}" step="1" id="exam-${p}" value="${value}" placeholder="0–${cfg.max}" aria-label="Nilai ${cfg.name}"><span class="exam-of">/${cfg.max}</span>`;
        return `
          <div class="exam-row">
            <div class="exam-part"><b>${cfg.name}</b><span>${cfg.info}</span></div>
            <button type="button" class="btn btn-ghost exam-timer-btn" data-timer="${p}">${sized(ICON.clock, 16)} ${cfg.min}:00</button>
            <div class="exam-score">${input}<span class="exam-band" id="examOut-${p}">${partText(cfg, saved)}</span></div>
          </div>`;
      })
      .join("");
    const result = examResult(type, rec);
    return `
      <section class="exam" aria-label="Mode Ujian">
        <div class="exam-head">
          <span class="exam-title">${sized(ICON.clock, 18)} Mode Ujian · ${esc(s.exam.label)}</span>
          <span class="exam-overall">${type.resultLabel} <b id="examOverall">${result.text}</b></span>
        </div>
        ${rows}
        <div class="exam-foot">
          <p id="examVerdict" class="exam-verdict"${type === EXAM_TYPES.ml && result.value !== null ? "" : " hidden"}>${result.value !== null && type === EXAM_TYPES.ml ? esc(mlVerdict(result.value)) : ""}</p>
          <p>${esc(type.note)}</p>
          <button type="button" class="btn btn-primary" data-act="score">Simpan skor</button>
        </div>
      </section>`;
  }

  function readExamInputs(s) {
    const type = typeOf(s.exam);
    const out = {};
    s.exam.parts.forEach((p) => {
      const cfg = type.parts[p];
      const el = $(`exam-${p}`);
      if (!el || el.value === "") return;
      let v = Number(el.value);
      if (!Number.isFinite(v)) return;
      if (cfg.kind === "band") {
        out[p] = { band: Math.max(0, Math.min(9, Math.round(v * 2) / 2)) };
      } else {
        v = Math.max(0, Math.min(cfg.max, Math.round(v)));
        out[p] = cfg.kind === "raw" ? { raw: v, band: rawToBand(p, v) } : { raw: v };
      }
    });
    return out;
  }

  function showExamResult(s, rec) {
    const type = typeOf(s.exam);
    const result = examResult(type, rec);
    $("examOverall").textContent = result.text;
    const verdict = $("examVerdict");
    if (type === EXAM_TYPES.ml && result.value !== null) {
      verdict.textContent = mlVerdict(result.value);
      verdict.hidden = false;
    } else verdict.hidden = true;
  }

  function bindExamPanel(s) {
    const type = typeOf(s.exam);
    const refresh = () => {
      const now = readExamInputs(s);
      s.exam.parts.forEach((p) => ($(`examOut-${p}`).textContent = partText(type.parts[p], now[p])));
      showExamResult(s, Object.assign({}, state.scores[s.exam.test], now));
    };
    $("sheetBody").querySelectorAll(".exam input").forEach((el) => el.addEventListener("input", refresh));
    $("sheetBody").querySelectorAll("[data-timer]").forEach((b) =>
      b.addEventListener("click", () => startTimer(type.parts[b.dataset.timer].name, type.parts[b.dataset.timer].min))
    );
  }

  function saveScore(s) {
    const type = typeOf(s.exam);
    const now = readExamInputs(s);
    if (!Object.keys(now).length) return toast("Isi dulu nilainya.");
    const rec = Object.assign({}, state.scores[s.exam.test], now, { label: s.exam.label, type: s.exam.type || "ielts", date: ymd(new Date()) });
    state.scores[s.exam.test] = rec;
    save();
    render();
    const parts = s.exam.parts.filter((p) => now[p]).map((p) => `${type.parts[p].name} ${partText(type.parts[p], now[p])}`);
    const result = examResult(type, rec);
    toast(`Skor tersimpan: ${parts.join(", ")}${result.value !== null ? `. ${type.resultLabel} ${result.text}` : ""}.`);
    if ($("examOverall")) showExamResult(s, rec);
  }

  function latestScore() {
    const recs = Object.values(state.scores || {}).filter((r) => r && r.date);
    if (!recs.length) return null;
    return recs.sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  }

  // Ringkasan satu rekaman skor untuk insight dan Elocia AI.
  function scoreSummary(rec) {
    const type = typeOf(rec);
    const result = examResult(type, rec);
    const parts = type.order.filter((p) => rec[p]).map((p) => `${type.parts[p].name} ${partText(type.parts[p], rec[p])}`);
    return { result, parts, type };
  }

  // Timer ujian tetap berjalan walaupun panel ditutup; tampil sebagai pil kecil di pojok kiri bawah.
  let timer = null;
  function startTimer(label, minutes) {
    stopTimer(true);
    const end = Date.now() + minutes * 60000;
    const pill = $("examTimer");
    const tick = () => {
      const left = Math.max(0, end - Date.now());
      const m = Math.floor(left / 60000);
      const sec = Math.floor((left % 60000) / 1000);
      $("examTimerText").textContent = `${label} ${pad(m)}:${pad(sec)}`;
      pill.classList.toggle("warn", left <= 5 * 60000);
      if (left <= 0) {
        stopTimer(true);
        beep();
        toast(`Waktu ${label} habis. Berhenti menulis, lalu cek jawaban.`);
      }
    };
    timer = { id: setInterval(tick, 1000), label };
    pill.hidden = false;
    tick();
    toast(`Timer ${label} ${minutes} menit dimulai. Semangat!`);
  }
  function stopTimer(silent) {
    if (timer) clearInterval(timer.id);
    timer = null;
    $("examTimer").hidden = true;
    if (!silent) toast("Timer dihentikan.");
  }
  $("examTimerStop").addEventListener("click", () => stopTimer(false));
  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35, 0.7].forEach((t) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.25, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + t);
        o.stop(ctx.currentTime + t + 0.3);
      });
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
  }

  $("journey").addEventListener("click", (e) => {
    const btn = e.target.closest(".session");
    if (btn) openSession(btn.dataset.id);
  });

  $("roadmap").addEventListener("click", (e) => {
    const card = e.target.closest("button.rm-card");
    if (!card) return;
    viewBatch = Number(card.dataset.batch);
    render();
    $("journeyHead").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });

  // ---------- Pengaturan ----------
  const settings = $("settings");
  function openSettings() {
    $("basePath").value = state.basePath || "";
    $("nickname").value = state.name || "";
    disarmReset();
    refreshFolderStatus();
    settings.showModal();
  }

  async function refreshFolderStatus() {
    const M = window.EloMedia;
    if (!M || !M.supported) {
      $("folderStatus").textContent = "Browser ini belum mendukung fitur folder. Buka Elocia di Chrome atau Edge di laptop.";
      $("btnFolder").hidden = true;
      $("btnFolderOff").hidden = true;
      return;
    }
    const status = await M.refreshStatus();
    if (M.serverMode) {
      $("folderStatus").textContent = status === "granted" ? `Mode laptop: terhubung otomatis ke ${M.folderName}.` : `Mode laptop: folder ${M.folderName} tidak ditemukan.`;
      $("btnFolder").hidden = true;
      $("btnFolderOff").hidden = true;
      return;
    }
    $("folderStatus").textContent =
      status === "granted" ? `Terhubung: ${M.folderName}` : status === "prompt" ? `Terhubung ke ${M.folderName}, perlu izin ulang saat membuka materi.` : "Belum terhubung.";
    $("btnFolder").textContent = status === "none" ? "Hubungkan folder kursus" : "Ganti folder";
    $("btnFolderOff").hidden = status === "none";
  }
  $("btnFolder").addEventListener("click", async () => {
    try {
      const r = await window.EloMedia.connect();
      toast(r.looksRight ? "Folder kursus terhubung." : `Folder "${r.name}" terhubung, tapi sepertinya bukan folder kursus.`);
    } catch (e) {
      if (e && e.name !== "AbortError") toast("Folder tidak bisa dibuka. Coba lagi.");
    }
    refreshFolderStatus();
  });
  $("btnFolderOff").addEventListener("click", async () => {
    await window.EloMedia.disconnect();
    toast("Folder kursus diputuskan.");
    refreshFolderStatus();
  });
  $("btnSettings").addEventListener("click", openSettings);
  settings.addEventListener("close", () => {
    if (settings.returnValue !== "save") return;
    state.basePath = $("basePath").value.trim();
    state.name = $("nickname").value.trim().slice(0, 30);
    save();
    render();
    toast("Pengaturan disimpan.");
  });

  $("btnExport").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `elocia-${ymd(new Date())}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Cadangan diunduh.");
  });

  $("importFile").addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!isValid(data)) throw new Error("format");
      state = normalize(data);
      viewBatch = null;
      save();
      render();
      settings.close();
      toast("Progres dipulihkan dari cadangan.");
    } catch (err) {
      toast("File itu bukan cadangan Elocia. Pilih file .json hasil Unduh cadangan.");
    }
  });

  let resetTimer = null;
  function disarmReset() {
    clearTimeout(resetTimer);
    $("btnReset").classList.remove("armed");
    $("btnReset").textContent = "Hapus semua progres";
    $("resetHint").textContent = "Tekan dua kali untuk memastikan.";
  }
  $("btnReset").addEventListener("click", () => {
    const btn = $("btnReset");
    if (!btn.classList.contains("armed")) {
      btn.classList.add("armed");
      btn.textContent = "Yakin? Tekan lagi";
      $("resetHint").textContent = "Semua centang, XP, dan streak akan hilang.";
      resetTimer = setTimeout(disarmReset, 4000);
      return;
    }
    const { basePath, name } = state;
    state = emptyState();
    state.basePath = basePath;
    state.name = name;
    viewBatch = null;
    save();
    render();
    disarmReset();
    settings.close();
    toast("Progres dihapus. Mulai lagi dari awal.");
  });

  [sheet, settings, celeDialog, viewer].forEach((d) =>
    d.addEventListener("click", (e) => {
      if (e.target === d) d.close();
    })
  );

  // ---------- Toast ----------
  let toastTimer = null;
  function toast(message, action) {
    const el = $("toast");
    el.innerHTML = `<span>${esc(message)}</span>`;
    if (action) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = action.label;
      b.addEventListener("click", () => {
        el.hidden = true;
        action.run();
      });
      el.append(b);
    }
    el.hidden = false;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), action ? 6000 : 3500);
  }

  // ---------- Confetti ----------
  const canvas = $("confetti");
  const ctx = canvas.getContext("2d");
  const LIFE_MS = 2400;
  const COLORS = ["#0b7a5a", "#ffe15a", "#f25c2a", "#2d55d8", "#c12f63", "#11935f"];
  let particles = [];
  let running = false;

  // Kanvas dibuka sebagai popover supaya tampil di atas dialog modal (perayaan) dan tidak terpotong olehnya.
  function showLayer() {
    if (typeof canvas.showPopover === "function") {
      try {
        if (canvas.matches(":popover-open")) canvas.hidePopover();
        canvas.showPopover();
        return;
      } catch (e) {}
    }
    const host = document.querySelector("dialog[open]") || document.body;
    if (canvas.parentNode !== host) host.append(canvas);
  }
  function hideLayer() {
    try {
      if (typeof canvas.hidePopover === "function" && canvas.matches(":popover-open")) canvas.hidePopover();
    } catch (e) {}
  }

  function confetti(count, originX = 0.5, originY = 0.35) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    showLayer();
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== innerWidth * dpr || canvas.height !== innerHeight * dpr) {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const born = performance.now();
    for (let i = 0; i < count; i++) {
      particles.push({
        born,
        x: innerWidth * originX + (Math.random() - 0.5) * 160,
        y: innerHeight * originY,
        vx: (Math.random() - 0.5) * 13,
        vy: -Math.random() * 13 - 4,
        size: Math.random() * 7 + 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: Math.random() < 0.5 ? "rect" : "circle",
      });
    }
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  // Satu siklus animasi untuk semua ledakan, supaya ledakan beruntun tidak saling menghapus.
  function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles = particles.filter((p) => t - p.born < LIFE_MS);
    particles.forEach((p) => {
      p.vy += 0.35;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - (t - p.born) / LIFE_MS);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    if (particles.length) requestAnimationFrame(frame);
    else {
      running = false;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      hideLayer();
    }
  }

  // Konteks untuk Elocia AI (chat.js): siapa pengguna dan sesi apa yang sedang dikerjakan.
  window.ElociaApp = {
    context() {
      const st = stats();
      const b = BATCHES[st.active];
      const s = nextSession();
      return {
        name: nameOf(),
        batch: `Batch ${st.active + 1} dari ${BATCHES.length}: ${b.name} (${b.level}), ${st.activeDone} dari ${b.sessions.length} sesi selesai`,
        session: s ? { what: s.what, kind: KIND_LABEL[s.kind], note: s.note } : null,
        scores: Object.values(state.scores || {})
          .filter((r) => r && r.date)
          .map((r) => {
            const { result, parts, type } = scoreSummary(r);
            return `${r.label}: ${parts.join(", ")}${result.value !== null ? ` (${type.resultLabel} ${result.text})` : ""}`;
          })
          .join("; "),
      };
    },
  };

  render();

  // Jam dan kalimat sapaan ikut berganti tanpa perlu memuat ulang halaman.
  let lastDay = ymd(new Date());
  setInterval(() => {
    const today = ymd(new Date());
    if (today !== lastDay) {
      lastDay = today;
      render();
    } else {
      renderGreeting(stats());
    }
  }, 30000);
})();
