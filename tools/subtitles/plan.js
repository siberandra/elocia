// Mengekspor urutan sesi Elocia (Batch 1 sampai 4) sebagai JSON, untuk antrean pembuatan subtitle.
// Pemakaian: node tools/subtitles/plan.js > plan.json
const path = require("path");

global.window = {};
require(path.join(__dirname, "..", "..", "data.js"));

// "sat" = tanggal Sabtu minggu itu menurut kalender rencana (dipakai untuk mode akhir pekan).
const [y, mo, d] = window.PLAN.start;
const satOf = (n) => new Date(Date.UTC(y, mo, d + 7 * n)).toISOString().slice(0, 10);

const out = [];
let overall = 0;
window.PLAN.batches.forEach((b, bi) => {
  let week = 0;
  b.months.forEach((m) =>
    m.weeks.forEach((w) => {
      week++;
      const sat = satOf(overall++);
      ["sat", "sun"].forEach((k) => {
        const s = w[k];
        out.push({ batch: bi + 1, week, sat, day: k, what: s.what, path: s.path, pick: s.pick || null });
      });
    })
  );
});
process.stdout.write(JSON.stringify(out, null, 1));
