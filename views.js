/* ---------- VIEWS ----------
   Sayfaların HTML'ini üreten saf fonksiyonlar.
   Hem tarayıcıda (index.html) hem de build.mjs'te (statik sayfa üretimi) kullanılır.
   Her fonksiyon {title, desc, html, ...} döndürür. */

const V = (() => {
  const C = () => window.AKORLA_CONFIG || {};
  const SITE = () => C().SITE_NAME || "akorla";
  const fmt = n => (+n || 0).toLocaleString("tr-TR");
  const initials = n => String(n || "").split(" ").map(w => w[0] || "").join("").slice(0, 2);
  const trSort = (a, b) => String(a).localeCompare(String(b), "tr");
  const songUrl = id => `sarki/${id}/`;
  const artistUrl = id => `sanatci/${id}/`;

  function ctx(D) {
    const artistOf = id => D.artists.find(a => a.id === id) || { id, name: "Bilinmeyen", color: "#888", genre: "" };
    return { artistOf };
  }

  function songCard(D, s, i) {
    const a = ctx(D).artistOf(s.artist);
    return `<a class="card" href="${songUrl(s.id)}">${i != null ? `<span class="rank">${i + 1}</span>` : ""}<div><div class="t">${esc(s.title)}</div><div class="a">${esc(a.name)}</div></div><span class="keypill">${esc(s.key)}</span></a>`;
  }
  function artistCard(D, a) {
    const n = D.songs.filter(s => s.artist === a.id).length;
    return `<a class="artist" href="${artistUrl(a.id)}"><div class="avatar" style="background:${esc(a.color)}">${esc(initials(a.name))}</div><b>${esc(a.name)}</b><small>${n} şarkı${a.genre ? " · " + esc(a.genre) : ""}</small></a>`;
  }
  function table(D, list) {
    const { artistOf } = ctx(D);
    if (!list.length) return `<div class="table"><div class="empty">Şarkı yok</div></div>`;
    return `<div class="table"><div class="th"><span>Şarkı</span><span>Sanatçı</span><span>Ton</span><span>Seviye</span></div>
    ${list.map(s => `<a href="${songUrl(s.id)}"><b>${esc(s.title)}</b><span style="color:var(--muted)">${esc(artistOf(s.artist).name)}</span><span class="keypill" style="margin:0;justify-self:start">${esc(s.key)}</span><span class="diff ${esc(s.diff)}">${esc(s.diff)}</span></a>`).join("")}</div>`;
  }

  /* ---- Ana sayfa ---- */
  function home(D) {
    const pop = [...D.songs].sort((a, b) => b.views - a.views);
    const recent = [...D.songs].sort((a, b) => String(b.added).localeCompare(String(a.added))).slice(0, 6);
    const genres = ["Tümü", ...new Set(D.songs.map(s => s.genre).filter(Boolean))];
    return {
      title: `${SITE()} — Gitar Akorları ve Şarkı Sözleri`,
      desc: `${D.songs.length} şarkının gitar akorları ve sözleri. Tek tıkla ton değiştir, otomatik kaydır, akor diyagramlarını gör.`,
      html: `
  <div class="wrap">
    <div class="hero">
      <div>
        <h1>Çal, söyle,<br><em>akorla</em>.</h1>
        <p>Akorlar sözlerin tam üstünde. Tek tıkla ton değiştir, otomatik kaydır, akorun parmak pozisyonunu gör.</p>
        <div class="stats">
          <div><b>${D.songs.length}</b><span>şarkı</span></div>
          <div><b>${D.artists.length}</b><span>sanatçı</span></div>
          <div><b>${Object.keys(OPEN).length}+</b><span>akor diyagramı</span></div>
        </div>
      </div>
      <div class="fretboard">
        <h4>Başlangıç için 6 temel akor</h4>
        <div class="row">${["Am", "C", "D", "Em", "G", "E"].map(c => chordCard(c)).join("")}</div>
      </div>
    </div>
    <div id="favs"></div>
    <section class="block">
      <div class="shead"><h2>En çok bakılanlar</h2><a href="tum-sarkilar/">Tümünü gör →</a></div>
      <div class="cats" id="cats">${genres.map((g, i) => `<button class="cat ${i ? "" : "on"}" data-g="${esc(g)}">${esc(g)}</button>`).join("")}</div>
      <div class="grid" id="popgrid">${pop.slice(0, 9).map((s, i) => songCard(D, s, i)).join("")}</div>
    </section>
    <section class="block">
      <div class="shead"><h2>Yeni eklenenler</h2></div>
      <div class="grid">${recent.map(s => songCard(D, s)).join("")}</div>
    </section>
    <section class="block">
      <div class="shead"><h2>Sanatçılar</h2><a href="sanatcilar/">Tümü →</a></div>
      <div class="artists">${[...D.artists].sort((a, b) => trSort(a.name, b.name)).map(a => artistCard(D, a)).join("")}</div>
    </section>
  </div>`
    };
  }
  function popGrid(D, genre) {
    const pop = [...D.songs].sort((a, b) => b.views - a.views).filter(s => genre === "Tümü" || s.genre === genre).slice(0, 9);
    return pop.map((s, i) => songCard(D, s, i)).join("");
  }
  function favs(D, ids) {
    const l = D.songs.filter(s => ids.includes(s.id));
    return l.length ? `<section class="block"><div class="shead"><h2>Favorilerim</h2></div><div class="grid">${l.map(s => songCard(D, s)).join("")}</div></section>` : "";
  }

  /* ---- Şarkı ---- */
  function song(D, id) {
    const s = D.songs.find(x => x.id === id);
    if (!s) return null;
    const { artistOf } = ctx(D);
    const a = artistOf(s.artist);
    const others = D.songs.filter(x => x.artist === s.artist && x.id !== s.id);
    const similar = D.songs.filter(x => x.genre === s.genre && x.artist !== s.artist).slice(0, 4);
    const { html, used } = renderLyrics(s.body || "", 0);
    return {
      title: `${s.title} Akor — ${a.name} | ${SITE()}`,
      desc: `${s.title} (${a.name}) gitar akorları ve sözleri. Ton: ${s.key}${s.capo ? `, capo ${s.capo}. perde` : ""}, seviye: ${s.diff}. Akorlar: ${used.slice(0, 8).join(", ")}.`,
      type: "music.song",
      jsonld: { "@context": "https://schema.org", "@type": "MusicComposition", name: s.title, composer: { "@type": "MusicGroup", name: a.name }, musicalKey: s.key, genre: s.genre || undefined },
      song: s,
      html: `
  <div class="wrap">
    <div class="songhead">
      <div>
        <nav class="crumb"><a href="./">Ana Sayfa</a> / <a href="${artistUrl(a.id)}">${esc(a.name)}</a> / ${esc(s.title)}</nav>
        <h1>${esc(s.title)} <span class="h1sub">akorları</span></h1>
        <a href="${artistUrl(a.id)}">${esc(a.name)}</a>
        <div class="meta">
          <span>Ton: <b id="mkey">${esc(s.key)}</b></span>
          <span>Capo: <b>${s.capo ? s.capo + ". perde" : "Yok"}</b></span>
          <span>Seviye: <b class="diff ${esc(s.diff)}">${esc(s.diff)}</b></span>
          <span><span id="mviews">${fmt(s.views)}</span> görüntülenme</span>
        </div>
      </div>
      <button class="favbtn" id="fav"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.3 5 6.6 5c2 0 3.5 1.1 4.4 2.5h2C14 6.1 15.4 5 17.4 5 20.7 5 23 8.3 21.5 11.8 19.5 16.4 12 21 12 21z"/></svg><span>Favorilere ekle</span></button>
    </div>
    <div class="toolbar">
      <div class="tg"><label>Ton</label><button class="tb" id="trd" aria-label="Ton düşür">−</button><span class="tv" id="trv">0</span><button class="tb" id="tru" aria-label="Ton yükselt">+</button><button class="tb" id="trr" title="Orijinal ton">↺</button></div>
      <div class="tg"><label>Yazı</label><button class="tb" id="fsd">A−</button><button class="tb" id="fsu">A+</button></div>
      <div class="tg"><label>Kaydır</label><button class="tb" id="scd" aria-label="Yavaşlat">−</button><span class="tv" id="scv">0</span><button class="tb" id="scu" aria-label="Hızlandır">+</button></div>
      <div class="tg"><button class="tb on" id="tch">Akorlar</button></div>
    </div>
    <div class="songlayout">
      <article class="sheet">
        <div class="usedchords" id="used">${used.map(c => chordCard(c)).join("")}</div>
        <div class="lyrics" id="lyr">${html}</div>
      </article>
      <aside class="side">
        ${s.strum ? `<div class="box"><h3>Ritim</h3><div class="strum">${esc(s.strum)}</div><p style="margin-top:6px">↓ aşağı · ↑ yukarı vuruş</p></div>` : ""}
        ${others.length ? `<div class="box"><h3>${esc(a.name)} — diğer şarkılar</h3><ul>${others.map(o => `<li><a href="${songUrl(o.id)}">${esc(o.title)}<span class="keypill">${esc(o.key)}</span></a></li>`).join("")}</ul></div>` : ""}
        ${similar.length ? `<div class="box"><h3>Benzer şarkılar</h3><ul>${similar.map(o => `<li><a href="${songUrl(o.id)}">${esc(o.title)}<small style="color:var(--muted)">${esc(artistOf(o.artist).name)}</small></a></li>`).join("")}</ul></div>` : ""}
        <div class="box"><h3>Hata mı var?</h3><p>Yanlış akor ya da söz gördüysen <a href="iletisim/?tur=hata&sarki=${encodeURIComponent(s.id)}" style="color:var(--accent);font-weight:600">bildir</a>.</p></div>
      </aside>
    </div>
  </div>`
    };
  }

  /* ---- Sanatçı ---- */
  function artist(D, id) {
    const a = D.artists.find(x => x.id === id);
    if (!a) return null;
    const list = D.songs.filter(s => s.artist === id).sort((x, y) => y.views - x.views);
    return {
      title: `${a.name} Akorları — ${list.length} Şarkı | ${SITE()}`,
      desc: `${a.name} şarkılarının gitar akorları ve sözleri: ${list.slice(0, 6).map(s => s.title).join(", ")}.`,
      html: `<div class="wrap">
    <div class="pagehead" style="display:flex;gap:20px;align-items:center">
      <div class="avatar" style="background:${esc(a.color)};width:96px;height:96px;font-size:34px;margin:0">${esc(initials(a.name))}</div>
      <div><nav class="crumb"><a href="sanatcilar/">Sanatçılar</a> / ${esc(a.name)}</nav><h1>${esc(a.name)} akorları</h1><p>${esc(a.genre || "")} · ${list.length} şarkı</p></div>
    </div>
    ${table(D, list)}
  </div>`
    };
  }

  /* ---- Listeler ---- */
  const LETTERS = "ABCÇDEFGHIİJKLMNOÖPRSŞTUÜVYZ".split("");
  const first = t => String(t || " ")[0].toLocaleUpperCase("tr");
  function allSongs(D, letter) {
    const firsts = new Set(D.songs.map(s => first(s.title)));
    const list = D.songs.filter(s => !letter || first(s.title) === letter).sort((a, b) => trSort(a.title, b.title));
    return {
      title: `Tüm Şarkılar A–Z — ${SITE()}`,
      desc: `${SITE()} üzerindeki tüm ${D.songs.length} şarkının akorları, alfabetik sırayla.`,
      html: `<div class="wrap"><div class="pagehead"><h1>Tüm Şarkılar</h1><p>Alfabetik sırayla ${D.songs.length} şarkı</p></div>
  <div class="az"><button data-l="" class="${letter ? "" : "on"}" style="width:auto;padding:0 12px">Tümü</button>${LETTERS.map(l => `<button data-l="${l}" class="${l === letter ? "on" : ""}" ${firsts.has(l) ? "" : "disabled"}>${l}</button>`).join("")}</div>
  <div id="tlist">${table(D, list)}</div></div>`,
      list: () => table(D, list)
    };
  }
  function artists(D) {
    return {
      title: `Sanatçılar — ${SITE()}`,
      desc: `${D.artists.length} sanatçının şarkı akorları: ${D.artists.slice(0, 8).map(a => a.name).join(", ")}.`,
      html: `<div class="wrap"><div class="pagehead"><h1>Sanatçılar</h1><p>${D.artists.length} sanatçı</p></div>
  <div class="artists">${[...D.artists].sort((a, b) => trSort(a.name, b.name)).map(a => artistCard(D, a)).join("")}</div></div>`
    };
  }

  /* ---- Akor sözlüğü ---- */
  const DICT = { "Majör": "", "Minör": "m", "7'li": "7", "Minör 7": "m7", "Maj7": "maj7", "Sus4": "sus4" };
  function dictGrid(g) { return NOTES.map(n => chordCard(n + DICT[g], 1.2)).join(""); }
  function dict() {
    return {
      title: `Gitar Akor Sözlüğü — Tüm Akorlar ve Basış Şekilleri | ${SITE()}`,
      desc: "12 notanın majör, minör, 7'li, minör 7, maj7 ve sus4 akorlarının gitar diyagramları. Barre akorlar dahil.",
      html: `<div class="wrap"><div class="pagehead"><h1>Akor Sözlüğü</h1><p>12 nota, 6 akor tipi. Turuncu çubuk = barre (tüm telleri işaret parmağıyla bas).</p></div>
  <div class="tabs">${Object.keys(DICT).map((k, i) => `<button class="cat ${i ? "" : "on"}" data-g="${k}">${k}</button>`).join("")}</div>
  <div class="dict" id="dict">${dictGrid("Majör")}</div></div>`
    };
  }

  /* ---- Formlar ---- */
  function form(kind, pre = {}) {
    const telif = kind === "telif";
    const types = { iletisim: "Genel", hata: "Hata bildirimi", oneri: "Şarkı önerisi" };
    return `<form class="cform" id="cform" data-kind="${kind}">
      ${telif ? `<input type="hidden" name="type" value="telif">` :
        `<label class="f">Konu türü<select name="type">${Object.entries(types).map(([k, v]) => `<option value="${k}" ${pre.type === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>`}
      <div class="r2">
        <label class="f">${telif ? "Hak sahibi / temsilci adı" : "Adın"} *<input name="name" required maxlength="100"></label>
        <label class="f">E-posta *<input name="email" type="email" required maxlength="200"></label>
      </div>
      <label class="f">${telif ? "İçeriğin bulunduğu sayfa adresi *" : "İlgili şarkı (varsa)"}<input name="song_url" ${telif ? "required" : ""} maxlength="300" value="${esc(pre.song || "")}" placeholder="${telif ? "https://…/sarki/…" : "Şarkı adı ya da adresi"}"></label>
      ${telif ? `<label class="f">Eserin adı ve hak sahipliğiniz *<input name="subject" required maxlength="200" placeholder="Örn: X şarkısının söz yazarı / yapımcısı / avukatıyım"></label>` : `<label class="f">Konu<input name="subject" maxlength="200"></label>`}
      <label class="f">${telif ? "Talebiniz *" : "Mesajın *"}<textarea name="body" required maxlength="5000" rows="6"></textarea></label>
      ${telif ? `<label class="chk"><input type="checkbox" required> Verdiğim bilgilerin doğru olduğunu ve bu eser üzerinde hak sahibi ya da yetkili temsilci olduğumu beyan ederim.</label>` : ""}
      <label class="chk"><input type="checkbox" required> <span><a href="gizlilik/" target="_blank">Aydınlatma metnini</a> okudum.</span></label>
      <div class="hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>
      <button class="favbtn on" type="submit" style="justify-content:center">Gönder</button>
      <div class="fmsg" id="fmsg"></div>
    </form>`;
  }

  /* ---- Yasal sayfalar ---- */
  function legal(title, body, desc) {
    return { title: `${title} — ${SITE()}`, desc, html: `<div class="wrap"><div class="pagehead"><h1>${title}</h1></div><div class="prose">${body}</div></div>` };
  }
  function contactLine() {
    const e = C().CONTACT_EMAIL;
    return e ? `<b>${esc(e)}</b> adresinden ya da <a href="iletisim/">iletişim formundan</a>` : `<a href="iletisim/">iletişim formundan</a>`;
  }
  function privacy() {
    const owner = C().OWNER_NAME || "[Ad Soyad]";
    const date = C().LEGAL_DATE || "";
    return legal("Gizlilik ve KVKK Aydınlatma Metni", `
<p>Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, <b>${esc(SITE())}</b> ("Site") ziyaretçilerinin kişisel verilerinin nasıl işlendiğini açıklamak için hazırlanmıştır.${date ? ` Son güncelleme: ${esc(date)}.` : ""}</p>
<h2>1. Veri sorumlusu</h2>
<p>Veri sorumlusu <b>${esc(owner)}</b>'dır. Bize ${contactLine()} ulaşabilirsin.</p>
<h2>2. Hangi verileri işliyoruz?</h2>
<ul>
<li><b>İletişim formu verileri:</b> Formu doldurursan adın, e-posta adresin, mesajın ve varsa ilgili sayfa adresi.</li>
<li><b>Teknik veriler:</b> Siteye erişirken barındırma ve veritabanı hizmet sağlayıcılarımızın sunucularında, güvenlik amacıyla IP adresi, tarayıcı bilgisi ve erişim zamanı gibi kayıtlar otomatik olarak tutulabilir.</li>
<li><b>Tarayıcında tutulan tercihler:</b> Tema seçimin, favori şarkıların ve bu bildirimi kapattığın bilgisi yalnızca kendi tarayıcında (localStorage) saklanır, bize gönderilmez.</li>
</ul>
<p>Siteyi kullanmak için üyelik gerekmez. Reklam ya da takip amaçlı çerez kullanmıyoruz.</p>
<h2>3. Hangi amaçla ve hukuki sebeple?</h2>
<ul>
<li>Mesajlarına, hata bildirimlerine ve telif taleplerine cevap vermek (KVKK m.5/2-f, meşru menfaat; telif talepleri için m.5/2-e, bir hakkın tesisi, kullanılması veya korunması),</li>
<li>Sitenin güvenliğini sağlamak ve kötüye kullanımı önlemek (KVKK m.5/2-f).</li>
</ul>
<h2>4. Veriler kime aktarılıyor?</h2>
<p>Veriler satılmaz, reklam amacıyla paylaşılmaz. Site, hizmet aldığımız altyapı sağlayıcıları üzerinde çalışır: veritabanı için <b>Supabase</b> (sunucular Almanya/Frankfurt, AB) ve barındırma için <b>GitHub Pages</b>. Bu hizmetlerin kullanımı nedeniyle verilerin yurt dışındaki sunucularda saklanması söz konusudur; aktarım KVKK m.9'daki şartlara uygun olarak yapılır. Yasal bir zorunluluk olduğunda yetkili kamu kurumlarıyla paylaşılabilir.</p>
<h2>5. Ne kadar süre saklanıyor?</h2>
<p>İletişim mesajları, talebin sonuçlanmasından itibaren en fazla 2 yıl saklanır, sonra silinir.</p>
<h2>6. Hakların</h2>
<p>KVKK m.11 uyarınca; verilerinin işlenip işlenmediğini öğrenme, bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini, silinmesini ya da yok edilmesini isteme, itiraz etme ve zarara uğraman halinde tazminat talep etme hakların vardır. Taleplerini ${contactLine()} iletebilirsin; en geç 30 gün içinde cevaplanır.</p>`,
      "Kişisel verilerin nasıl işlendiği, saklandığı ve KVKK kapsamındaki hakların.");
  }
  function cookies() {
    return legal("Çerez Politikası", `
<p><b>${esc(SITE())}</b> reklam, analiz ya da takip çerezi <b>kullanmaz</b>.</p>
<h2>Tarayıcında sakladıklarımız</h2>
<table class="ltable"><tr><th>Ne</th><th>Neden</th><th>Süre</th></tr>
<tr><td>Tema tercihi (açık/koyu)</td><td>Siteyi seçtiğin temada açmak</td><td>Sen silene kadar</td></tr>
<tr><td>Favori şarkılar</td><td>Favorilerini ana sayfada göstermek</td><td>Sen silene kadar</td></tr>
<tr><td>Bildirim kapatıldı bilgisi</td><td>Bu bildirimi tekrar göstermemek</td><td>Sen silene kadar</td></tr>
<tr><td>Görüntülenme işareti</td><td>Aynı şarkıyı aynı oturumda iki kez saymamak</td><td>Sekme kapanınca silinir</td></tr></table>
<p>Bunlar yalnızca senin tarayıcında (localStorage / sessionStorage) tutulur, bize gönderilmez ve seni tanımlamak için kullanılmaz. Tarayıcı ayarlarından site verilerini silerek hepsini temizleyebilirsin.</p>
<p>Yönetim paneline giriş yapan site yöneticisi için oturumu açık tutmak amacıyla zorunlu bir oturum kaydı kullanılır; ziyaretçileri etkilemez.</p>
<p>İleride analiz aracı eklenirse bu sayfa güncellenecek ve onayın istenecektir.</p>`,
      "akorla hangi tarayıcı verilerini neden saklar: reklam veya takip çerezi kullanılmaz.");
  }
  function copyright() {
    return legal("Telif Hakkı ve İçerik Kaldırma", `
<p>${esc(SITE())}, müzisyenlerin şarkıları çalmayı öğrenmesine yardımcı olmak amacıyla gitar akorlarını paylaşan, ticari olmayan bir platformdur. Şarkı sözleri ve besteler hak sahiplerine aittir.</p>
<p>Sitede yer alan bir içeriğin size ait hakları ihlal ettiğini düşünüyorsanız, 5846 sayılı Fikir ve Sanat Eserleri Kanunu ve 5651 sayılı Kanun kapsamında aşağıdaki formla bildirimde bulunabilirsiniz. Talepler en kısa sürede incelenir ve haklı bulunan içerik yayından kaldırılır.</p>
<h2>Bildirimde bulunması gerekenler</h2>
<ul><li>İçeriğin bulunduğu sayfanın adresi</li><li>Eserin adı ve hak sahipliğinizi gösteren bilgi (söz yazarı, besteci, yapımcı, meslek birliği veya bunların vekili)</li><li>İletişim bilgileriniz</li></ul>
${form("telif")}`,
      "Telif hakkı politikası ve içerik kaldırma talebi formu.");
  }
  function contact(pre) {
    const e = C().CONTACT_EMAIL;
    return legal("İletişim", `
<p>Soru, şarkı önerisi ya da hatalı akor bildirimi için formu kullanabilirsin.${e ? ` E-posta: <b>${esc(e)}</b>` : ""}</p>
<p>Telif hakkı talepleri için lütfen <a href="telif/">telif sayfasındaki</a> formu kullan.</p>
${form("iletisim", pre)}`,
      `${SITE()} iletişim: şarkı önerisi, hata bildirimi ve sorular.`);
  }
  function notFound() {
    return { title: `Sayfa bulunamadı — ${SITE()}`, desc: "", html: `<div class="wrap pagehead"><h1>Sayfa bulunamadı</h1><p>Aradığın sayfa yok ya da taşınmış. <a href="./" style="color:var(--accent)">Ana sayfaya dön</a></p></div>`, noindex: true };
  }

  /* ---- Rota çözücü ---- */
  function resolve(D, path, q = {}) {
    const p = path.replace(/^\/+|\/+$/g, "");
    let m;
    if (!p) return { r: "home", ...home(D) };
    if ((m = p.match(/^sarki\/([^/]+)$/))) { const v = song(D, m[1]); return v ? { r: "song", ...v } : { r: "404", ...notFound() }; }
    if ((m = p.match(/^sanatci\/([^/]+)$/))) { const v = artist(D, m[1]); return v ? { r: "sanatcilar", ...v } : { r: "404", ...notFound() }; }
    if (p === "tum-sarkilar") return { r: "tumu", ...allSongs(D) };
    if (p === "sanatcilar") return { r: "sanatcilar", ...artists(D) };
    if (p === "akor-sozlugu") return { r: "sozluk", ...dict() };
    if (p === "gizlilik") return { r: "legal", ...privacy() };
    if (p === "cerez") return { r: "legal", ...cookies() };
    if (p === "telif") return { r: "legal", ...copyright() };
    if (p === "iletisim") return { r: "legal", ...contact(q) };
    return { r: "404", ...notFound() };
  }
  const STATIC_PATHS = ["", "tum-sarkilar", "sanatcilar", "akor-sozlugu", "gizlilik", "cerez", "telif", "iletisim"];

  return { resolve, popGrid, favs, allSongs, dictGrid, songUrl, artistUrl, fmt, STATIC_PATHS };
})();
