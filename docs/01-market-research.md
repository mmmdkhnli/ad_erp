# 01 — Bazar Araşdırması (Market Research)

> Məqsəd: reklam istehsalatı şirkətinin real fəaliyyətini və ERP-nin əhatə etməli olduğu domeni müəyyən etmək. AZ bazarından real şirkətlər + qlobal agentlik ERP yanaşmaları.

---

## A. Azərbaycan bazarı — real xidmət kataloqu

Üç yerli şirkətin (BrandEX, ReklamAz, Admedia) saytlarından toplanan xidmətlər. Bu, ERP-də **xidmət/məhsul kataloqunun (service catalog)** əsasını təşkil edir.

### A.1 Çöl və daxili reklam (Outdoor & Indoor)
- Qabarıq hərflər (3D letters) — işıqlı / işıqsız, akril / metal / neon
- İşıqlı qutu reklamlar (lightbox / laytboks)
- Fasad işləri (facade)
- Pilonlar, totemlər, meqabordlar, bilbordlar, skrollerlər
- Neon reklamlar
- Nerj (paslanmayan polad) və dəmir hərflər
- LED monitorlar / ekranlar
- Elektrik dirəklərində reklam
- Yönləndirmə lövhələri, qapı lövhələri, təhlükəsizlik nişanları

### A.2 Genişformatlı çap (Wide-format printing)
- Vinil, baner, setka (mesh) vinil, backlit, kətan, fleks, onevision, frosted vinil çap

### A.3 Avtobrendinq (Vehicle branding)
- Standart brendinq / tam brendinq
- Montaj / demontaj
- UV və yuyulmaya davamlı vinil

### A.4 Stendlər və mebel (Displays & fixtures)
- Sərgi stendləri (modul + fərdi, açar-təhvil)
- Roll-up / pop-up mobil stendlər
- Məhsul stendləri, mağaza mebeli, vitrinlər, brend zonalar, stellajlar

### A.5 POS materiallar
- Vobler, topper, stopper, orqsteklo (akril) məhsullar, dönkart, standee

### A.6 Kəsim və material emalı (Cutting)
- Lazer və CNC kəsim: orqsteklo, alkopon, PVC, MDF, laminat, foreks

### A.7 Dizayn və layihələndirmə
- 3D dizayn, interyer/eksteryer, texniki layihələndirmə (AutoCAD, CorelDraw), maket (klassik/interaktiv/AR)

### A.8 Quraşdırma və servis
- Hündür bina montajı, LED modul dəyişimi, texniki xidmət və təmir

### A.9 Qiymətləndirmə modeli (kritik tapıntı)
BrandEX açıq şəkildə qeyd edir:
> "Qiymətlər əsasən **material, işçilik, daşınma, quraşdırma xərclərinə və vergiyə əlavə marja** əsasında formalaşır."

**ERP nəticəsi:** təklif/qiymətləndirmə kalkulyatoru bu 5 komponenti ayrı-ayrı hesablamalıdır:
`Material + İşçilik + Daşınma + Quraşdırma + (Marja %) → Aralıq → +ƏDV 18% → Yekun`

### A.10 Tipik iş axını (yerli şirkətlərdən)
1. Müştəri müraciəti + obyektin ölçülməsi (site measurement)
2. Dizayn təklifi (3D render, texniki cizgi)
3. Qiymət təklifi (kommersial təklif)
4. İstehsalat (dəzgahlar: Roland, Mimaki, Maxima, CNC, lazer)
5. Quraşdırma və təhvil

> Bu 5 addım birbaşa ERP-nin **sifariş həyat dövrü (order lifecycle)** oldu.

---

## B. Qlobal yanaşmalar (AZ bazarına uyğunlaşdırılmış)

Qlobal agentlik/istehsalat ERP həlləri (Workamajig, NetSuite, Scoro, Deltek, Function Point, Productive) araşdırıldı. Ortaq modul dəsti:

| Qlobal modul | AZ istehsalat şirkətinə uyğunluğu | Bizim MVP-də? |
|--------------|-----------------------------------|:---:|
| Project / Job management | ✅ Sifariş = job bag | ✅ |
| Quoting / Estimating | ✅ Kommersial təklif + kalkulyator | ✅ |
| CRM | ✅ Müştəri/lead idarəetməsi | ✅ |
| Production workflow / traffic | ✅ İstehsalat mərhələləri (Kanban) | ✅ |
| Resource / machine scheduling | ✅ Dəzgah + komanda yükü | ✅ (sadə) |
| Inventory / materials | ✅ Anbar (vinil, akril, LED...) | ✅ |
| Finance / invoicing | ✅ Faktura, ödəniş, xərc | ✅ |
| Time tracking | ⚠️ İşçilik saatları (opsional) | 🔶 Faza 2 |
| Media buying / planning | ❌ Bu şirkət tipində əsas deyil | ❌ |
| BI / dashboards | ✅ KPI dashboard + hesabatlar | ✅ |
| Proofing / approval | ✅ Dizayn təsdiqi (sadə) | ✅ (sadə) |

### B.1 Qlobaldan götürülən ən vacib prinsiplər
1. **"Job bag" konsepti** — hər sifariş bütün sənədləri (təklif, dizayn, material, faktura, foto) bir yerdə saxlayan mərkəzi obyektdir.
2. **Sifariş rentabelliyi (job profitability)** — hər sifariş üzrə planlanan vs faktiki xərc/gəlir. AZ şirkətləri bunu adətən Excel-də edir → ERP-nin ən böyük dəyər təklifi.
3. **Vahid platforma** — CRM + istehsalat + maliyyə ayrı-ayrı sistemlərdə deyil, bir yerdə (data ikiqat daxil edilmir).

### B.2 AZ bazarına uyğunlaşdırma
- **Dil:** tam Azərbaycan dilli UI.
- **Valyuta/vergi:** AZN, ƏDV 18%.
- **Sadəlik:** qlobal həllər çox ağırdır; AZ KOB (kiçik-orta biznes) üçün sadələşdirilmiş, sürətli, minimal təlim tələb edən sistem.
- **Offline reallıq:** quraşdırma komandası çöldədir → mobil-uyğun status/foto yükləmə vacibdir.

---

## C. Rəqabət mövqeyi / dəyər təklifi

AZ reklam istehsalatı şirkətlərinin əksəriyyəti hazırda **Excel + WhatsApp + kağız** ilə işləyir. Bizim ERP-nin fərqləndirici dəyəri:

1. **Uçtan-uca izlənə bilən sifariş** — təklifdən fakturaya qədər tək axın.
2. **Avtomatik qiymət kalkulyatoru** — material+işçilik+daşınma+quraşdırma+marja+ƏDV.
3. **Real rentabellik** — hansı sifariş qazanc gətirir, hansı zərər.
4. **İstehsalat şəffaflığı** — hansı iş hansı mərhələdədir, kim məsuldur, deadline nə vaxtdır.

---

## Mənbələr
- [BrandEX — Reklam şirkətləri](https://brandex.az/az/xidmetler/azerbaycanda-reklam-sirketleri)
- [ReklamAz](https://reklamaz.az/reklam-sirketi-baku/reklamaz)
- [Admedia — Reklam istehsalı](https://admedia.az/az/service/reklam-istehsali-107)
- [NetSuite — ERP for Advertising & Marketing Agencies](https://www.netsuite.com/portal/industries/advertising.shtml)
- [Workamajig — Advertising agency management software](https://www.workamajig.com/blog/advertising-agency-management-software)
- [Scoro — Agency management software](https://www.scoro.com/industries/agency-management-software/)
- [HashMicro — ERP for Advertising Agency](https://www.hashmicro.com/blog/erp-for-advertising-agency/)
