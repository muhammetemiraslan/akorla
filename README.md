# akorla — Gitar Akorları Sitesi

## Dosyalar
| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Site şablonu (tüm sayfalar bundan üretilir) |
| `views.js` | Sayfaların içeriği (şarkı, sanatçı, yasal sayfalar…) |
| `chords.js` | Akor diyagramı, transpoze, söz render |
| `db.js` | Supabase bağlantısı |
| `admin.html` | Yönetim paneli (şarkılar, sanatçılar, **mesajlar**) |
| `config.js` | **Ayarlar: buradaki boşlukları doldur** |
| `build.mjs` | Google için her şarkıya ayrı sayfa üretir → `dist/` |
| `.github/workflows/deploy.yml` | GitHub'a yükleyince otomatik yayınlar |

---

## Yayına alma (bir kere yapılır)

### 1. config.js'i doldur
- `SITE_URL` (**mutlaka doldur**): alan adın varsa `https://akorla.com/`, yoksa `https://KULLANICIADIN.github.io/akorla/`
- `OWNER_NAME`: adın soyadın (KVKK metninde "veri sorumlusu" olarak geçer)
- `CONTACT_EMAIL`: sitede görünecek iletişim e-postası

### 2. Supabase'de 2 ayar (yapmadıysan)
- Authentication → Users → **Add user** (kendi e-posta/şifren, Auto Confirm ✓)
- Authentication → Sign In / Providers → **Allow new users to sign up: KAPALI**

### 3. GitHub
1. Yeni repo aç (adı `akorla`, **public**: ücretsiz Pages ve Actions için).
2. Bu klasördeki her şeyi yükle (`.github` klasörü dahil, `dist` hariç).
3. Repo → Settings → Pages → **Source: GitHub Actions**.
4. Actions sekmesinde "Siteyi yayınla" çalışır, 1–2 dk sonra site yayında.

### 4. Alan adı (isteğe bağlı ama önerilir)
- Alan adını al (ör. akorla.com), DNS'e GitHub Pages kayıtlarını gir:
  `A` kayıtları → 185.199.108.153 / 109.153 / 110.153 / 111.153, `www` için `CNAME` → KULLANICIADIN.github.io
- `config.js`'te `SITE_URL`'i alan adınla değiştir, push et. `CNAME` dosyası otomatik üretilir.
- Settings → Pages → **Enforce HTTPS** ✓

### 5. Google
- search.google.com/search-console → siteni ekle → **Sitemaps** → `sitemap.xml` gönder.

---

## Günlük kullanım
- Şarkıları `admin.html`'den ekle/düzenle → site **anında** günceller (ziyaretçi tarayıcıdan okur).
- Google'ın göreceği statik sayfalar **her saat başı** otomatik yeniden üretilir. Hemen istersen: GitHub → Actions → "Siteyi yayınla" → **Run workflow**.
- **Mesajlar**: iletişim formu, hata bildirimleri ve **telif talepleri** panelde düşer. Telif talebi gelirse haklı ise şarkıyı kaldır, kişiye e-postayla dön.
- Not: GitHub, repoda 60 gün hiç değişiklik olmazsa saatlik çalışmayı durdurur; Actions sekmesinden tekrar açabilirsin.

## Yayından önce
- Demo şarkıları ve sanatçıları admin panelinden sil (hayali içerik).
- `gizlilik` sayfası şablon metindir; hukuki danışmanlık değildir. İçeriğini kendi durumuna göre kontrol et.

## Bilgisayarında denemek
- **En kolayı:** VS Code'da klasörü aç → `index.html` → **Open with Live Server**. Site içinde gezinme çalışır; sadece `/sarki/...` sayfasındayken **F5** yaparsan 404 alırsın (bu yayında olmaz, ana sayfadan tekrar gir).
- **Yayındaki haliyle aynısı:**
```
node build.mjs
npx serve dist
```

## Şarkı formatı
```
#Nakarat
[Am]Sabah yine [F]geç kaldım
[C] [G] [Am]        ← sadece akor satırı
```
