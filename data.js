/* ---------- DATA ---------- */
const DEFAULT_ARTISTS = [
  {id:"liman-isiklari", name:"Liman Işıkları", genre:"Indie Rock", color:"#2c6e8f"},
  {id:"defne-yalin", name:"Defne Yalın", genre:"Pop", color:"#c2416b"},
  {id:"kuzey-ekspresi", name:"Kuzey Ekspresi", genre:"Rock", color:"#3f4a3c"},
  {id:"selim-ayaz", name:"Selim Ayaz", genre:"Halk", color:"#9a5b1e"},
  {id:"mavi-tren", name:"Mavi Tren", genre:"Pop Rock", color:"#3c5bd6"},
  {id:"ece-toprak", name:"Ece Toprak", genre:"Akustik", color:"#5b8a3a"},
];

const DEFAULT_SONGS = [
{id:"sonbahar-duragi", title:"Sonbahar Durağı", artist:"liman-isiklari", key:"Am", capo:0, diff:"Kolay", genre:"Indie Rock", views:48210, strum:"↓ ↓↑ ↑↓↑", added:"2026-11-08",
body:`#Giriş
[Am] [F] [C] [G]
#1. Kıta
[Am]Sabah yine [F]geç kaldım
[C]Otobüs gitti, [G]ben kaldım
[Am]Elimde soğuk [F]bir çay
[C]Bekliyorum bir [E]haber
#Nakarat
[F]Sonbahar [G]durağında
[C]Yapraklar [Am]ayağımda
[F]Sen gelmez[G]sen bu akşam
[E]Ben de gitmem bir [Am]yere
#2. Kıta
[Am]Saatler [F]işlemiyor
[C]Şehir bile [G]dinlemiyor
[Am]Cebimde iki [F]bilet
[C]Biri senin, [E]biri benim`},
{id:"gece-vardiyasi", title:"Gece Vardiyası", artist:"kuzey-ekspresi", key:"Em", capo:0, diff:"Orta", genre:"Rock", views:39870, strum:"↓ ↓ ↓↑ ↓↑", added:"2026-11-06",
body:`#Giriş
[Em] [C] [G] [D]
#1. Kıta
[Em]Neon ışık, [C]boş koridor
[G]Herkes uyur, [D]ben uyanık
[Em]Kasada bir [C]yorgun yüz
[G]Aynada bir [D]yabancı
#Nakarat
[C]Gece vardi[G]yası
[D]Bitmez bu [Em]sabah
[C]Bir kahve, bir [G]sigara molası
[D]Bir de senin [B7]hayalin
#2. Kıta
[Em]Raflar dolu, [C]kalbim boş
[G]Fiyat etiketi [D]yapıştırdım
[Em]Bütün dertle[C]rime
[G]Yine de satıl[D]madılar`},
{id:"kum-saati", title:"Kum Saati", artist:"defne-yalin", key:"C", capo:0, diff:"Kolay", genre:"Pop", views:61540, strum:"↓ ↓↑ ↓↑", added:"2026-11-02",
body:`#Giriş
[C] [G] [Am] [F]
#1. Kıta
[C]Bir avuç kum [G]bıraktın
[Am]Avucumun i[F]çine
[C]Ne kadar sıkı [G]tuttuysam
[F]Aktı gitti [G]yine
#Nakarat
[C]Kum saati [G]dönüyor
[Am]Biz hep aynı [F]yerdeyiz
[C]Zaman bize [G]gülüyor
[F]Biz hâlâ bek[G]lerdeyiz
#Köprü
[Am]Çevir beni [Em]tersine
[F]Baştan başla[G]yalım
[Am]Belki bu sefer [Em]zaman
[F]Bizden yana [G]olur`},
{id:"dere-boyu", title:"Dere Boyu", artist:"selim-ayaz", key:"Dm", capo:0, diff:"Orta", genre:"Halk", views:22105, strum:"↓ ↓↑↓ ↑↓↑", added:"2026-10-29",
body:`#Giriş
[Dm] [C] [A7] [Dm]
#1. Kıta
[Dm]Dere boyu [C]yürüdüm
[A7]Taşlar bana [Dm]küstü
[Dm]Söğüt dalı [C]eğilmiş
[A7]Bir sır verip [Dm]düştü
#Nakarat
[F]Aman aman [C]dere boyu
[Gm]Ne söylesem [A7]az olur
[Dm]Gidenin ar[C]dından
[A7]Bahar bile [Dm]güz olur
#2. Kıta
[Dm]Köprü başı [C]ıssız
[A7]Değirmen dur[Dm]muş
[Dm]Bir türkü ka[C]lmış geriye
[A7]O da sesi[Dm]ni yormuş`},
{id:"mavi-pencere", title:"Mavi Pencere", artist:"mavi-tren", key:"G", capo:0, diff:"Kolay", genre:"Pop Rock", views:53300, strum:"↓ ↓↑ ↑↓↑", added:"2026-11-09",
body:`#Giriş
[G] [D] [Em] [C]
#1. Kıta
[G]Mavi bir pen[D]cere
[Em]Sabahın [C]yedisinde
[G]Kuşlar konar [D]durur
[Em]Ellerinin [C]izinde
#Nakarat
[G]Aç perdeyi, [D]aç
[Em]Güneş de[C]ğsin bize
[G]Bütün şehir [D]uyusun
[C]Biz uyanık [D]kalalım
#2. Kıta
[G]Duvarda eski [D]bir saat
[Em]Bizi çoktan [C]unutmuş
[G]Masada iki [D]bardak
[Em]Biri hep [C]soğumuş`},
{id:"eski-fotograf", title:"Eski Fotoğraf", artist:"ece-toprak", key:"D", capo:2, diff:"Kolay", genre:"Akustik", views:30480, strum:"↓ ↓↑ ↑ ↑↓↑", added:"2026-10-25",
body:`#Giriş
[D] [A] [Bm] [G]
#1. Kıta
[D]Çekmecede bir [A]fotoğraf
[Bm]Kenarları [G]sararmış
[D]Gülüyoruz i[A]kimiz de
[G]Rüzgâr saçla[A]rı dağıtmış
#Nakarat
[G]Neredesin [D]şimdi
[A]Hangi şehirde [Bm]sabah
[G]Ben hâlâ o [D]kumsalda
[A]Bekliyorum [D]sana
#2. Kıta
[D]Arkasına [A]yazmışsın
[Bm]Tarih ile bir [G]söz
[D]Silinmiş mü[A]rekkep
[G]Kalmış bir tek [A]göz`},
{id:"yokus", title:"Yokuş", artist:"kuzey-ekspresi", key:"Bm", capo:0, diff:"Zor", genre:"Rock", views:18990, strum:"↓ ↓↑ ↓↑ ↓↑↓↑", added:"2026-10-20",
body:`#Giriş
[Bm] [G] [D] [F#m]
#1. Kıta
[Bm]Bu yokuş hiç [G]bitmiyor
[D]Dizlerim ar[F#m]tık dinlemiyor
[Bm]Sırtımda koca [G]bir şehir
[D]Kimse yükü[A]mü görmüyor
#Nakarat
[G]Tırman, tır[D]man
[A]Tepede bir [Bm]ışık var
[G]Düşsen de [D]kalk
[Em]Sabah olur [F#m]elbet
#Solo
[Bm] [G] [D] [A] [Em] [F#m]`},
{id:"telassiz", title:"Telaşsız", artist:"defne-yalin", key:"A", capo:0, diff:"Orta", genre:"Pop", views:44720, strum:"↓ ↓↑ ↑↓↑", added:"2026-11-04",
body:`#Giriş
[A] [E] [F#m] [D]
#1. Kıta
[A]Yavaş yürü [E]benimle
[F#m]Acelemiz [D]yok bugün
[A]Bulutlar da [E]durmuş
[D]Bizi izle[E]mek için
#Nakarat
[D]Telaşsız, [A]telaşsız
[E]Bir pazar gibi [F#m]sev beni
[D]Saatleri [A]bırak
[E]Cebimde unut [A]beni`},
{id:"ayna", title:"Ayna", artist:"liman-isiklari", key:"Em", capo:0, diff:"Kolay", genre:"Indie Rock", views:27650, strum:"↓ ↓↑ ↓↑", added:"2026-10-15",
body:`#Giriş
[Em] [G] [D] [A]
#1. Kıta
[Em]Aynada [G]biri var
[D]Bana benze[A]miyor
[Em]Gözlerinde [G]kış
[D]Bir şey söyle[A]miyor
#Nakarat
[C]Kırma beni [G]ayna
[D]Zaten ince[Em]yim
[C]Bir gün düze[G]lirim
[D]Bekle, gelece[Em]ğim`},
{id:"liman", title:"Liman", artist:"selim-ayaz", key:"Am", capo:0, diff:"Kolay", genre:"Halk", views:15320, strum:"↓ ↓↑↓ ↑↓↑", added:"2026-10-10",
body:`#1. Kıta
[Am]Gemiler gelir [G]gider
[Am]Liman hep [E]aynı yerde
[Am]Bir mendil sal[G]lanır
[F]Bir ses ka[E]lır geride
#Nakarat
[Dm]Dalga dalga [Am]vurur
[E]Hasret kıyı[Am]ya
[Dm]Kim demiş [Am]unutulur
[E]Söyle deni[Am]ze`},
{id:"pazar-sabahi", title:"Pazar Sabahı", artist:"mavi-tren", key:"C", capo:3, diff:"Kolay", genre:"Pop Rock", views:20110, strum:"↓ ↓↑ ↓↑", added:"2026-11-01",
body:`#Giriş
[C] [Am] [F] [G]
#1. Kıta
[C]Simit kokusu [Am]sokakta
[F]Martılar ça[G]tıda
[C]Sen uyurken [Am]ben
[F]Çay demledim [G]yavaşça
#Nakarat
[F]Pazar saba[C]hı
[G]Hiçbir yere [Am]gitmeyelim
[F]Dünya bekle[C]sin
[G]Biz biraz eğle[C]nelim`},
{id:"kuzey-yildizi", title:"Kuzey Yıldızı", artist:"ece-toprak", key:"G", capo:0, diff:"Orta", genre:"Akustik", views:25840, strum:"↓ ↓↑ ↑↓↑", added:"2026-10-31",
body:`#Giriş
[G] [Cmaj7] [Em] [D]
#1. Kıta
[G]Kaybolduğum [Cmaj7]gecelerde
[Em]Bir yıldız sor[D]dum yolu
[G]Gülümsedi [Cmaj7]uzaktan
[Em]Gösterdi sa[D]na doğru
#Nakarat
[C]Kuzey yıldı[G]zı
[D]Yanıp sönme [Em]sakın
[C]Ben geliyo[G]rum
[Am]Biraz daha [D]bekle`},
];

