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
    return { done: {}, log: [], basePath: "", batchStart: {}, name: "Vicky" };
  }
  function isValid(s) {
    return s && typeof s === "object" && s.done && typeof s.done === "object" && Array.isArray(s.log);
  }
  function normalize(s) {
    const n = Object.assign(emptyState(), s);
    if (!n.batchStart || typeof n.batchStart !== "object") n.batchStart = {};
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
          <span class="strip-label">B${b.index + 1}</span>
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
      { label: "Paling banyak dipelajari", value: topKind ? KIND_LABEL[topKind] : "Belum ada", foot: topKind ? `${kindCount[topKind]} sesi selesai` : "Terlihat setelah sesi pertama" },
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
        <button type="button" class="btn btn-ghost" id="heroMin">Cuma sempat 1 video</button>
      </div>
      <button type="button" class="hero-ask" id="heroAsk">${sized(ICON.spark, 16)} Bingung? Tanya Elocia tentang sesi ini</button>`;
    $("heroAsk").addEventListener("click", () => window.EloChat && window.EloChat.open("kuis"));
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
        <${tagName} ${unlocked ? `type="button" data-batch="${bi}"` : 'aria-disabled="true"'} class="rm-card ${status}${viewBatch === bi ? " viewing" : ""}">
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
    } else {
      parts.push(`Tetap dihitung hadir, streak aman. +${XP.min} XP`);
    }
    if (batchFinished && batch + 1 < BATCHES.length) parts.push(`Batch ${batch + 1} tuntas! Batch ${batch + 2}: ${BATCHES[batch + 1].name} terbuka.`);
    if (after.level > before.level) parts.push(`Naik ke level ${after.level}: ${after.tier}!`);
    if (fresh.length) parts.push(`Pencapaian baru: ${fresh.map((b) => b.name).join(", ")}`);
    toast(parts.join(" "), { label: "Urungkan", run: () => undoLast(id, kind) });
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
  function openSession(id) {
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
        sheet.close();
        if (act === "undo") undoLast(s.id, "full");
        else complete(s.id, act);
      });
    });
    sheet.showModal();
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
    settings.showModal();
  }
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

  [sheet, settings].forEach((d) =>
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
  function confetti(count) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ["#0b7a5a", "#ffe15a", "#f25c2a", "#2d55d8", "#c12f63", "#11935f"];
    const parts = Array.from({ length: count }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 160,
      y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 13,
      vy: -Math.random() * 13 - 4,
      size: Math.random() * 7 + 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() < 0.5 ? "rect" : "circle",
    }));
    const t0 = performance.now();
    function frame(t) {
      const elapsed = t - t0;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.vy += 0.35;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 2400);
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
      if (elapsed < 2400) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
    requestAnimationFrame(frame);
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
