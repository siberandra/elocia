// Elocia AI: chat dengan Gemini API memakai kunci milik pengguna sendiri.
// Kunci hanya disimpan di localStorage perangkat ini dan dikirim langsung ke Google.
(function () {
  "use strict";

  const KEY_STORE = "elocia:gemini-key";
  const MODEL_STORE = "elocia:gemini-model";
  const API = "https://generativelanguage.googleapis.com/v1beta";
  const MAX_TURNS = 24;

  const MODES = {
    tanya: {
      label: "Tanya bebas",
      hint: "Tanya apa saja: grammar, arti kata, contoh kalimat, cara belajar.",
      mic: "id-ID",
      speak: false,
      chips: ["Bedanya since dan for?", "Kapan pakai a, an, the?", "Arti \"look forward to\"?"],
      prompt:
        "Mode: tanya jawab bebas. Jawab pertanyaan apa pun tentang bahasa Inggris (grammar, kosakata, pengucapan, strategi belajar, IELTS). Jelaskan dalam bahasa Indonesia sederhana dan beri contoh kalimat bahasa Inggris beserta artinya. Untuk pertanyaan di luar bahasa Inggris, tetap bantu dengan singkat.",
    },
    kuis: {
      label: "Kuis sesi ini",
      hint: "Ringkasan inti sesi yang sedang dikerjakan, lalu 5 soal latihan satu per satu.",
      mic: "id-ID",
      speak: false,
      chips: ["Mulai kuisnya", "Jelaskan dulu materinya"],
      prompt:
        "Mode: kuis materi sesi. Mulai dengan ringkasan 3–5 poin inti materi sesi saat ini dalam bahasa Indonesia, lalu beri SATU soal latihan. Tunggu jawaban, katakan benar atau salah dengan penjelasan singkat, lalu beri soal berikutnya. Setelah 5 soal, beri skor dan satu saran.",
    },
    ngobrol: {
      label: "Teman ngobrol",
      hint: "Ngobrol santai dalam bahasa Inggris. Tekan mikrofon untuk bicara.",
      mic: "en-US",
      speak: true,
      chips: ["Hi! Let's talk about hobbies.", "Let's talk about my weekend.", "Ask me about my job."],
      prompt:
        "Mode: teman ngobrol. Bicara dalam bahasa Inggris sederhana (level A2–B1) dengan kalimat pendek, satu pertanyaan per giliran, tentang topik sehari-hari. Kalau pengguna membuat kesalahan, lanjutkan obrolan dulu, lalu di akhir balasan tambahkan baris yang diawali 'Koreksi:' berisi maksimal 2 perbaikan singkat dengan penjelasan bahasa Indonesia. Kalau pengguna menulis dalam bahasa Indonesia, bantu dia mengatakannya dalam bahasa Inggris.",
    },
    ielts: {
      label: "Penguji IELTS",
      hint: "Simulasi IELTS Speaking Part 1–3, lalu perkiraan band. Ketik \"selesai\" untuk hasil.",
      mic: "en-US",
      speak: true,
      chips: ["I'm ready for the speaking test."],
      prompt:
        "Mode: simulasi penguji IELTS Speaking. Berperan sebagai penguji: Part 1 (4–5 pertanyaan umum), Part 2 (kartu topik, minta bicara 1–2 menit), Part 3 (diskusi). Ajukan satu pertanyaan per giliran dalam bahasa Inggris dan jangan mengoreksi di tengah tes. Setelah Part 3, atau kalau pengguna mengetik 'selesai', beri perkiraan band untuk Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy (Pronunciation tidak bisa dinilai dari teks, sebutkan itu), lalu 3 saran perbaikan dalam bahasa Indonesia.",
    },
  };

  // ---------- Util ----------
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k) {
      try {
        return localStorage.getItem(k) || "";
      } catch (e) {
        return "";
      }
    },
    set(k, v) {
      try {
        if (v) localStorage.setItem(k, v);
        else localStorage.removeItem(k);
      } catch (e) {}
    },
  };

  // Markdown sederhana yang aman: semua teks di-escape dulu, baru diberi format.
  function inline(t) {
    return t
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>");
  }
  function md(text) {
    const lines = esc(text).split("\n");
    let html = "";
    let list = null;
    const close = () => {
      if (list) html += `</${list}>`;
      list = null;
    };
    lines.forEach((raw) => {
      const line = raw.trimEnd();
      let m;
      if ((m = line.match(/^\s*[-*•]\s+(.*)/))) {
        if (list !== "ul") {
          close();
          html += "<ul>";
          list = "ul";
        }
        html += `<li>${inline(m[1])}</li>`;
      } else if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) {
        if (list !== "ol") {
          close();
          html += "<ol>";
          list = "ol";
        }
        html += `<li>${inline(m[1])}</li>`;
      } else if ((m = line.match(/^#{1,4}\s+(.*)/))) {
        close();
        html += `<p><b>${inline(m[1])}</b></p>`;
      } else if (!line.trim()) {
        close();
      } else {
        close();
        html += `<p>${inline(line)}</p>`;
      }
    });
    close();
    return html;
  }
  const plain = (t) => t.replace(/[*`#>_]/g, "").replace(/\n+/g, " ").trim();

  // ---------- Gemini ----------
  async function apiError(res) {
    let message = "";
    try {
      const j = await res.json();
      message = (j.error && j.error.message) || "";
    } catch (e) {}
    const err = new Error(message);
    err.status = res.status;
    return err;
  }

  function friendlyError(err) {
    if (err.name === "AbortError") return "Dihentikan.";
    if (err.status === 400 && /api key/i.test(err.message)) return "Kunci API tidak valid. Periksa lagi kuncinya lewat tombol Kunci.";
    if (err.status === 401 || err.status === 403) return "Kunci API ditolak. Pastikan kuncinya benar dan Gemini API aktif di Google AI Studio.";
    if (err.status === 429) return "Batas pemakaian gratis sedang habis. Tunggu sebentar (biasanya 1 menit, atau besok untuk batas harian), lalu coba lagi.";
    if (err.status >= 500) return "Server Gemini sedang bermasalah. Coba lagi beberapa saat lagi.";
    if (!navigator.onLine) return "Tidak ada koneksi internet.";
    return `Gagal menghubungi Gemini${err.message ? `: ${err.message}` : "."}`;
  }

  // Pilih model Flash stabil terbaru yang tersedia untuk kunci ini, supaya tidak usang saat model baru rilis.
  async function pickModel(key, force) {
    const cached = store.get(MODEL_STORE);
    if (cached && !force) return cached;
    const res = await fetch(`${API}/models?pageSize=200&key=${encodeURIComponent(key)}`);
    if (!res.ok) throw await apiError(res);
    const j = await res.json();
    const names = (j.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => m.name.replace(/^models\//, ""))
      .filter((n) => /^gemini-[\d.]+-flash/.test(n) && !/(lite|image|tts|live|audio|thinking|exp|embedding|native|vision|8b)/.test(n));
    const ver = (n) => parseFloat((n.match(/^gemini-([\d.]+)/) || [])[1] || 0);
    const stable = names.filter((n) => !/preview/.test(n));
    const pool = (stable.length ? stable : names).sort((a, b) => ver(b) - ver(a) || a.length - b.length);
    const model = pool[0] || "gemini-2.0-flash";
    store.set(MODEL_STORE, model);
    return model;
  }

  async function* stream(key, model, body, signal) {
    const res = await fetch(`${API}/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) throw await apiError(res);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        try {
          const j = JSON.parse(line.slice(5));
          const parts = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [];
          const text = parts.filter((p) => !p.thought).map((p) => p.text || "").join("");
          if (text) yield text;
        } catch (e) {}
      }
    }
  }

  function systemPrompt(mode) {
    const ctx = (window.ElociaApp && window.ElociaApp.context()) || {};
    const name = ctx.name || "pengguna";
    const session = ctx.session ? `Sesi yang sedang dikerjakan: "${ctx.session.what}" (${ctx.session.kind}). Catatan sesi: ${ctx.session.note}` : "Semua sesi sudah selesai.";
    return [
      `Kamu adalah Elocia, teman belajar bahasa Inggris untuk ${name}, pelajar Indonesia level A2/B1 yang introvert, belajar di akhir pekan, dan menargetkan IELTS untuk beasiswa LPDP.`,
      "Gaya: hangat, sabar, menyemangati tanpa berlebihan, ringkas (maksimal sekitar 150 kata kecuali diminta lebih), memakai markdown sederhana (paragraf pendek, daftar, **tebal**).",
      "Jangan pernah meminta data pribadi seperti alamat, nomor identitas, atau kata sandi.",
      `Posisi perjalanan: ${ctx.batch || "-"}. ${session}`,
      MODES[mode].prompt,
    ].join("\n");
  }

  // ---------- Status ----------
  const history = { tanya: [], kuis: [], ngobrol: [], ielts: [] };
  let mode = "tanya";
  let busy = false;
  let controller = null;
  let speakOn = true;
  let view = "chat";

  const dialog = $("chat");
  const body = $("chatBody");
  const form = $("chatForm");
  const input = $("chatInput");
  const sendBtn = $("chatSend");
  const micBtn = $("chatMic");
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canSpeak = "speechSynthesis" in window;

  // ---------- Render ----------
  function renderModes() {
    $("chatModes").innerHTML = Object.entries(MODES)
      .map(([k, m]) => `<button type="button" role="tab" aria-selected="${k === mode}" class="chat-mode${k === mode ? " on" : ""}" data-mode="${k}">${esc(m.label)}</button>`)
      .join("");
    $("chatSpeak").hidden = !canSpeak;
    $("chatSpeak").setAttribute("aria-pressed", String(speakOn));
    $("chatSpeak").classList.toggle("on", speakOn);
    micBtn.hidden = !SR;
  }

  function bubble(role, text, i) {
    const who = role === "user" ? "me" : "ai";
    const speakBtn = role === "model" && canSpeak && text ? `<button type="button" class="msg-speak" data-i="${i}" aria-label="Dengarkan">${ICON_SPEAK}</button>` : "";
    return `<div class="msg ${who}"><div class="msg-text">${role === "user" ? `<p>${esc(text).replace(/\n/g, "<br>")}</p>` : md(text)}</div>${speakBtn}</div>`;
  }

  function renderChat() {
    view = "chat";
    form.hidden = false;
    const h = history[mode];
    if (!h.length) {
      const ctx = (window.ElociaApp && window.ElociaApp.context()) || {};
      const sessionLine = mode === "kuis" && ctx.session ? `<p class="chat-ctx">Sesi: <b>${esc(ctx.session.what)}</b></p>` : "";
      body.innerHTML = `
        <div class="chat-empty">
          <span class="chat-empty-icon">${ICON_SPARK}</span>
          <p><b>${esc(MODES[mode].label)}</b></p>
          <p class="muted">${esc(MODES[mode].hint)}</p>
          ${sessionLine}
          <div class="chat-chips">${MODES[mode].chips.map((c) => `<button type="button" class="chat-chip" data-chip="${esc(c)}">${esc(c)}</button>`).join("")}</div>
        </div>`;
      return;
    }
    body.innerHTML = h.map((m, i) => bubble(m.role, m.parts[0].text, i)).join("");
    body.scrollTop = body.scrollHeight;
  }

  function renderSetup(message, isError) {
    view = "setup";
    form.hidden = true;
    const has = !!store.get(KEY_STORE);
    const model = store.get(MODEL_STORE);
    body.innerHTML = `
      <div class="chat-setup">
        <span class="chat-empty-icon">${ICON_KEY}</span>
        <h3>${has ? "Kunci Gemini tersimpan" : "Aktifkan Elocia AI, gratis"}</h3>
        <p class="muted">Elocia AI memakai Gemini API dari Google dengan kunci milik Anda sendiri. Kuncinya hanya disimpan di perangkat ini dan tidak pernah masuk ke GitHub.</p>
        <ol class="setup-steps">
          <li>Buka <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> dan login dengan akun Google.</li>
          <li>Tekan <b>Create API key</b>, lalu salin kuncinya.</li>
          <li>Tempel di bawah, lalu tekan <b>Simpan &amp; tes</b>.</li>
        </ol>
        <label class="field" for="geminiKey">
          <span>Kunci Gemini API</span>
          <input id="geminiKey" type="password" autocomplete="off" spellcheck="false" placeholder="${has ? "•••••••• tersimpan, tempel kunci baru untuk mengganti" : "Tempel kunci di sini"}">
        </label>
        <p class="setup-msg${isError ? " bad" : ""}" id="setupMsg" role="status">${message ? esc(message) : model ? `Model aktif: ${esc(model)}` : ""}</p>
        <div class="row">
          <button type="button" class="btn btn-primary" id="keySave">Simpan &amp; tes</button>
          ${has ? '<button type="button" class="btn btn-ghost" id="keyBack">Kembali ke chat</button><button type="button" class="btn btn-danger" id="keyDelete">Hapus kunci</button>' : ""}
        </div>
        <p class="setup-note">Di paket gratis, Google bisa memakai percakapan untuk melatih modelnya. Jangan mengetik data pribadi di chat.</p>
      </div>`;
    $("keySave").addEventListener("click", saveKey);
    const back = $("keyBack");
    if (back) back.addEventListener("click", renderChat);
    const del = $("keyDelete");
    if (del)
      del.addEventListener("click", () => {
        store.set(KEY_STORE, "");
        store.set(MODEL_STORE, "");
        renderSetup("Kunci dihapus dari perangkat ini.");
      });
    setTimeout(() => $("geminiKey").focus(), 50);
  }

  async function saveKey() {
    const field = $("geminiKey");
    const msg = $("setupMsg");
    const key = field.value.trim() || store.get(KEY_STORE);
    msg.classList.remove("bad");
    if (!key) {
      msg.textContent = "Tempel kuncinya dulu.";
      msg.classList.add("bad");
      return;
    }
    msg.textContent = "Mengetes kunci…";
    $("keySave").disabled = true;
    try {
      const model = await pickModel(key, true);
      store.set(KEY_STORE, key);
      msg.textContent = `Berhasil. Model: ${model}`;
      setTimeout(renderChat, 600);
    } catch (err) {
      msg.textContent = friendlyError(err);
      msg.classList.add("bad");
    } finally {
      $("keySave").disabled = false;
    }
  }

  // ---------- Kirim ----------
  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    const key = store.get(KEY_STORE);
    if (!key) return renderSetup();
    const h = history[mode];
    h.push({ role: "user", parts: [{ text }] });
    if (h.length > MAX_TURNS) h.splice(0, h.length - MAX_TURNS);
    while (h.length && h[0].role !== "user") h.shift();
    input.value = "";
    autosize();
    renderChat();

    const reply = { role: "model", parts: [{ text: "" }] };
    body.insertAdjacentHTML("beforeend", `<div class="msg ai pending"><div class="msg-text"><span class="typing"><i></i><i></i><i></i></span></div></div>`);
    body.scrollTop = body.scrollHeight;
    const pendingEl = body.lastElementChild;
    setBusy(true);
    controller = new AbortController();
    const activeMode = mode;
    try {
      const model = await pickModel(key);
      const payload = {
        systemInstruction: { parts: [{ text: systemPrompt(activeMode) }] },
        contents: h.slice(),
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      };
      for await (const chunk of stream(key, model, payload, controller.signal)) {
        reply.parts[0].text += chunk;
        if (mode === activeMode && pendingEl.isConnected) {
          pendingEl.querySelector(".msg-text").innerHTML = md(reply.parts[0].text);
          body.scrollTop = body.scrollHeight;
        }
      }
      if (!reply.parts[0].text) reply.parts[0].text = "Maaf, tidak ada jawaban. Coba ulangi dengan kalimat lain.";
      history[activeMode].push(reply);
      if (mode === activeMode) renderChat();
      if (speakOn && MODES[activeMode].speak) speak(reply.parts[0].text);
    } catch (err) {
      if (err.status === 404) store.set(MODEL_STORE, "");
      if (pendingEl.isConnected) {
        pendingEl.classList.remove("pending");
        pendingEl.classList.add("error");
        pendingEl.querySelector(".msg-text").innerHTML = `<p>${esc(friendlyError(err))}</p>`;
      }
      if (reply.parts[0].text) history[activeMode].push(reply);
      else history[activeMode].pop();
      if (err.status === 400 || err.status === 401 || err.status === 403) setTimeout(() => renderSetup(friendlyError(err), true), 1200);
    } finally {
      setBusy(false);
      controller = null;
    }
  }

  function setBusy(b) {
    busy = b;
    sendBtn.innerHTML = b ? ICON_STOP : ICON_SEND;
    sendBtn.setAttribute("aria-label", b ? "Hentikan" : "Kirim");
  }

  // ---------- Suara ----------
  function speak(text) {
    if (!canSpeak) return;
    const main = text.split(/\n?\s*\**Koreksi:?\**/i)[0];
    const u = new SpeechSynthesisUtterance(plain(main));
    const lang = MODES[mode].mic;
    u.lang = lang;
    const voice = speechSynthesis.getVoices().find((v) => v.lang && v.lang.replace("_", "-").startsWith(lang.slice(0, 2)));
    if (voice) u.voice = voice;
    u.rate = lang === "en-US" ? 0.95 : 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  let rec = null;
  function toggleMic() {
    if (!SR) return;
    if (rec) {
      rec.stop();
      return;
    }
    rec = new SR();
    rec.lang = MODES[mode].mic;
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    micBtn.classList.add("on");
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      input.value = (finalText + interim).trim();
      autosize();
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") input.placeholder = "Izin mikrofon ditolak. Aktifkan di pengaturan browser.";
    };
    rec.onend = () => {
      micBtn.classList.remove("on");
      rec = null;
      if (finalText.trim() && MODES[mode].speak) send(finalText);
    };
    if (canSpeak) speechSynthesis.cancel();
    rec.start();
  }

  function autosize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  }

  // ---------- Event ----------
  function open(m) {
    if (m && MODES[m]) mode = m;
    renderModes();
    if (store.get(KEY_STORE)) renderChat();
    else renderSetup();
    if (!dialog.open) dialog.showModal();
    if (view === "chat") setTimeout(() => input.focus(), 60);
  }

  $("chatFab").addEventListener("click", () => open());
  $("chatClose").addEventListener("click", () => dialog.close());
  $("chatKey").addEventListener("click", () => (view === "setup" && store.get(KEY_STORE) ? renderChat() : renderSetup()));
  $("chatSpeak").addEventListener("click", () => {
    speakOn = !speakOn;
    if (!speakOn && canSpeak) speechSynthesis.cancel();
    renderModes();
  });
  $("chatReset").addEventListener("click", () => {
    if (controller) controller.abort();
    history[mode] = [];
    renderChat();
  });
  $("chatModes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode]");
    if (!b || busy) return;
    mode = b.dataset.mode;
    renderModes();
    if (view === "chat") renderChat();
  });
  body.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-chip]");
    if (chip) return send(chip.dataset.chip);
    const sp = e.target.closest(".msg-speak");
    if (sp) {
      const m = history[mode][Number(sp.dataset.i)];
      if (m) speak(m.parts[0].text);
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (busy) {
      if (controller) controller.abort();
      return;
    }
    send(input.value);
  });
  input.addEventListener("input", autosize);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  micBtn.addEventListener("click", toggleMic);
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (canSpeak) speechSynthesis.cancel();
    if (rec) rec.stop();
  });

  window.EloChat = { open };

  // ---------- Ikon ----------
  var ICON_SEND, ICON_STOP, ICON_SPEAK, ICON_SPARK, ICON_KEY;
  function icon(body) {
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }
  ICON_SEND = icon('<path d="M5 12h14M13 6l6 6-6 6"/>');
  ICON_STOP = icon('<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/>');
  ICON_SPEAK = icon('<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>');
  ICON_SPARK = icon('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/>');
  ICON_KEY = icon('<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3"/>');
  setBusy(false);
})();
