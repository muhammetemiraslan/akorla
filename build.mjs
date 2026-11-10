// akorla — statik sayfa üretici
// Kullanım:  node build.mjs            → Supabase'den veriyi çeker, dist/ klasörüne siteyi üretir
//            node build.mjs --local    → Supabase yerine data.js'teki verilerle üretir (deneme için)
// Node 18+ gerekir, ek paket gerekmez.

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "dist");
const LOCAL = process.argv.includes("--local");

/* --- tarayıcı dosyalarını Node içinde çalıştır --- */
const sandbox = { console };
sandbox.window = sandbox;
const ctx = vm.createContext(sandbox);
for (const f of ["config.js", "data.js", "chords.js", "views.js"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f });
}
const get = expr => vm.runInContext(expr, ctx);
const C = get("window.AKORLA_CONFIG");
const V = get("V");
const esc = get("esc");

let SITE_URL = (process.env.SITE_URL || C.SITE_URL || "").trim();
if (SITE_URL && !SITE_URL.endsWith("/")) SITE_URL += "/";
const BASE = SITE_URL ? new URL(SITE_URL).pathname : "/";
if (!SITE_URL) console.warn("⚠  config.js'te SITE_URL boş: canonical, sitemap ve paylaşım görselleri tam adres içermeyecek.");

/* --- veri --- */
async function loadData() {
  if (LOCAL || !C.SUPABASE_URL) {
    console.log("• Veri: data.js (yerel)");
    return { artists: get("DEFAULT_ARTISTS"), songs: get("DEFAULT_SONGS") };
  }
  console.log("• Veri: Supabase");
  const h = { apikey: C.SUPABASE_ANON_KEY };
  const q = async t => {
    const r = await fetch(`${C.SUPABASE_URL}/rest/v1/${t}?select=*`, { headers: h });
    if (!r.ok) throw new Error(`${t}: ${r.status} ${await r.text()}`);
    return r.json();
  };
  const [artists, songs] = await Promise.all([q("artists"), q("songs")]);
  return { artists, songs };
}

/* --- yardımcılar --- */
const abs = p => (SITE_URL || "/") + p;
function head(v, p) {
  const url = abs(p);
  const og = abs("og.png");
  const lines = [
    `<title>${esc(v.title)}</title>`,
    `<meta name="description" content="${esc(v.desc || "")}">`,
    v.noindex ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${url}">`,
    `<meta property="og:site_name" content="${esc(C.SITE_NAME || "akorla")}">`,
    `<meta property="og:locale" content="tr_TR">`,
    `<meta property="og:type" content="${v.type || "website"}">`,
    `<meta property="og:title" content="${esc(v.title)}">`,
    `<meta property="og:description" content="${esc(v.desc || "")}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${og}">`,
    `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ];
  if (v.jsonld) lines.push(`<script type="application/ld+json">${JSON.stringify({ ...v.jsonld, url }).replace(/</g, "\\u003c")}</script>`);
  return lines.join("\n");
}
function relBase(p) {
  const depth = p.split("/").filter(Boolean).length;
  return depth ? "../".repeat(depth) : "./";
}
// 404 sayfası her adreste açılabilir: kök klasörü tarayıcıda bul
const BASE404 = `<script>(function(){var b=${JSON.stringify(SITE_URL ? BASE : "")};if(!b){var s=location.pathname.split("/");b=/\\.github\\.io$/.test(location.hostname)&&s[1]?"/"+s[1]+"/":"/";}document.write('<base href="'+b+'">');})()</script>`;
function page(tpl, v, p, is404) {
  return tpl
    .replace('<base href="./">', is404 ? BASE404 : `<base href="${relBase(p)}">`)
    .replace(/<!--meta-->[\s\S]*?<!--\/meta-->/, head(v, p))
    .replace(/<!--app-->[\s\S]*?<!--\/app-->/, v.html);
}
function write(rel, content) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
}

/* --- üret --- */
const D = await loadData();
fs.rmSync(OUT, { recursive: true, force: true });
const tpl = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const urls = [];

for (const p of V.STATIC_PATHS) {
  const rel = p ? p + "/" : "";
  write(rel + "index.html", page(tpl, V.resolve(D, p), rel));
  if (!["gizlilik", "cerez"].includes(p)) urls.push({ loc: rel, pr: p ? "0.5" : "1.0" });
}
for (const s of D.songs) {
  const rel = `sarki/${s.id}/`;
  write(rel + "index.html", page(tpl, V.resolve(D, rel), rel));
  urls.push({ loc: rel, lastmod: String(s.updated_at || s.added || "").slice(0, 10), pr: "0.8" });
}
for (const a of D.artists) {
  const rel = `sanatci/${a.id}/`;
  write(rel + "index.html", page(tpl, V.resolve(D, rel), rel));
  urls.push({ loc: rel, pr: "0.6" });
}
// bilinmeyen adresler (ör. yeni eklenen ama henüz üretilmemiş şarkı) için: tarayıcı içinde yüklenir
write("404.html", page(tpl, { title: `${C.SITE_NAME || "akorla"}`, desc: "", noindex: true, html: '<div class="wrap pagehead"><p>Yükleniyor…</p></div>' }, "", true));

for (const f of ["config.js", "data.js", "chords.js", "views.js", "db.js", "admin.html",
  "favicon.svg", "favicon-32.png", "apple-touch-icon.png", "og.png"]) {
  if (fs.existsSync(path.join(ROOT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
  else console.warn("⚠  eksik dosya:", f);
}
write(".nojekyll", "");
write("robots.txt", `User-agent: *\nDisallow: ${BASE}admin.html\n${SITE_URL ? `Sitemap: ${abs("sitemap.xml")}\n` : ""}`);
if (SITE_URL) {
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u =>
    `  <url><loc>${abs(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}<priority>${u.pr}</priority></url>`).join("\n")}\n</urlset>\n`);
  const host = new URL(SITE_URL).hostname;
  if (!host.endsWith("github.io")) write("CNAME", host + "\n");
}

console.log(`✓ ${D.songs.length} şarkı, ${D.artists.length} sanatçı, ${V.STATIC_PATHS.length} sabit sayfa → dist/`);
