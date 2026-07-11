# 03 — Modul Spesifikasiyaları (Modules Spec)

> Hər modul üçün: məqsəd, əsas ekranlar, funksiyalar, əlaqəli data. Route-lar `/(app)/...` altında.

---

## 0. Naviqasiya strukturu (sidebar)

```
📊 Dashboard            /dashboard
👥 CRM                  /crm            (Müştərilər · Leadlər · Əlaqələr)
📄 Təkliflər            /quotes
📦 Sifarişlər           /orders
🏭 İstehsalat           /production     (Kanban)
🚚 Quraşdırma           /installations
🗃️ Anbar                /inventory
💰 Maliyyə              /finance        (Fakturalar · Ödənişlər · Xərclər)
📈 Hesabatlar           /reports
⚙️ Parametrlər          /settings       (İstifadəçilər · Kataloq · Şirkət)
```

Menyu istifadəçinin roluna görə filtrlənir (bax RBAC → [05-architecture.md](05-architecture.md)).

---

## 1. Dashboard `/dashboard`
**Məqsəd:** rola görə vəziyyət xülasəsi.

- **KPI kartları:** Aktiv sifarişlər · Bu ay gəlir (₼) · Gözləyən təkliflər · Gecikən sifarişlər · İstehsalat yükü.
- **Qrafiklər:** aylıq gəlir trendi (bar), sifariş statusu bölgüsü (donut), top 5 müştəri.
- **Siyahılar:** son sifarişlər, yaxınlaşan deadline-lar, az qalıqlı materiallar.
- **Rol fərqi:** Satış → təklif/lead widget; İstehsalat → Kanban xülasə; Maliyyə → gəlir/borc.

## 2. CRM `/crm`
**Məqsəd:** müştəri və potensial müştəri (lead) bazası.

- **Müştərilər (Customers):** ad, tip (fiziki/hüquqi), VÖEN, əlaqə şəxsi, telefon, email, ünvan, qeyd. Müştəri səhifəsi → onun təklifləri, sifarişləri, ödəniş tarixçəsi, ümumi dövriyyə.
- **Leadlər:** mənbə (referral/sayt/zəng/sərgi), status (yeni → əlaqə → təklif → udu/itki), məsul menecer. Lead → müştəriyə çevirmə düyməsi.
- **Əlaqələr (Interactions):** zəng/görüş/email loqu, sonrakı addım tarixi.

## 3. Təkliflər (Quotes) `/quotes`
**Məqsəd:** kommersial təklif hazırlamaq — sistemin qəlbi.

- **Təklif başlığı:** müştəri, tarix, etibarlılıq müddəti, məsul, status.
- **Sətirlər (line items):** hər sətir = xidmət (kataloqdan) + təsvir + ölçü/miqdar + vahid.
- **5-komponentli kalkulyator** (hər sətir və ya bütün təklif üzrə):
  - Material xərci (₼)
  - İşçilik xərci (₼)
  - Daşınma xərci (₼)
  - Quraşdırma xərci (₼)
  - **Marja (%)** → mənfəət
  - **Aralıq cəm** → **ƏDV 18%** → **Yekun (₼)**
- **Statuslar:** Qaralama → Göndərilib → Təsdiqlənib → Rədd edilib / Vaxtı keçib.
- **Əməliyyatlar:** versiyalama (dublikat + redaktə), PDF export, "Sifarişə çevir" (təsdiqlənəndə).
- **Audit:** kim, nə vaxt, hansı statusa keçirdi.

## 4. Sifarişlər (Orders / Jobs) `/orders`
**Məqsəd:** "job bag" — sifarişlə bağlı hər şeyin mərkəzi.

- **Sifariş başlığı:** avto nömrə (`ORD-2026-0001`), müştəri, mənbə təklif, başlama/deadline, ümumi məbləğ, status.
- **Tablar (sifariş səhifəsində):**
  - **Ümumi:** əsas məlumat, sətirlər, deadline.
  - **İstehsalat:** əlaqəli istehsalat tapşırıqları və mərhələsi.
  - **Quraşdırma:** montaj tapşırıqları, obyekt, foto.
  - **Materiallar:** bu sifarişə sərf olunan materiallar.
  - **Maliyyə:** faktura(lar), ödənişlər, xərclər, **rentabellik**.
  - **Fayllar:** dizayn, sənəd, foto.
  - **Tarixçə:** audit log.
- **Statuslar:** Yeni → İcrada → Quraşdırmada → Təhvil verilib → Bağlanıb / Ləğv.

## 5. İstehsalat (Production) `/production`
**Məqsəd:** istehsalat axınının vizual idarəsi.

- **Kanban lövhə:** sütunlar = Gözləyir · Dizayn · İstehsalat · QC · Hazır. Kart = istehsalat tapşırığı (sifariş № + xidmət + məsul + deadline).
- **Sürüklə-burax** ilə status keçidi (audit + bildiriş).
- **Tapşırıq detalı:** məsul işçi/komanda, dəzgah (Roland/CNC/lazer), sərf olunan material, qeyd.
- **Filtrlər:** rola/komandaya/deadline-a görə.
- **List görünüşü** (alternativ): cədvəl + filtr.

## 6. Quraşdırma (Installations) `/installations`
**Məqsəd:** montaj/demontaj işlərinin planlaması (əsasən mobil istifadə).

- **Quraşdırma tapşırığı:** sifariş, obyekt ünvanı (+ xəritə linki), tarix/saat, komanda, tip (montaj/demontaj/servis).
- **Sahə statusu:** Planlanıb → Yolda → İcrada → Tamamlandı.
- **Foto sübut:** əvvəl/sonra şəkil yükləmə (mobil kameradan).
- **Təqvim görünüşü:** həftəlik montaj cədvəli.

## 7. Anbar (Inventory) `/inventory`
**Məqsəd:** material qalığı və sərfiyyatı.

- **Material kataloqu:** ad (vinil, akril, foreks, LED lent, profil...), vahid (m², metr, ədəd, kq), cari qalıq, minimum həd, orta maya.
- **Hərəkətlər:** mədaxil (alış), məxaric (sifarişə sərf), düzəliş (inventarizasiya).
- **Az qalıq xəbərdarlığı:** minimum həddən aşağı materiallar dashboard-da.
- **Sifarişlə bağlantı:** istehsalat tapşırığından material sərfi avtomatik məxaric yaradır.

## 8. Maliyyə (Finance) `/finance`
**Məqsəd:** pul axını və rentabellik.

- **Fakturalar:** sifarişdən faktura, nömrə, məbləğ, ƏDV, ödəmə statusu (ödənilməyib/qismən/tam), ödəmə tarixi.
- **Ödənişlər:** faktura üzrə daxilolma qeydi (nağd/köçürmə), qismən ödəniş.
- **Xərclər:** sifarişə və ya ümumi (material alışı, əməkhaqqı, icarə...), kateqoriya.
- **Rentabellik:** sifariş üzrə gəlir − xərc = mənfəət, marja %. Ümumi/aylıq görünüş.
- **Borclar:** ödənilməmiş fakturalar (accounts receivable).

## 9. Hesabatlar (Reports) `/reports`
**Məqsəd:** idarəetmə qərarları üçün analitika.

- **Satış hesabatı:** dövr üzrə təklif→sifariş konversiyası, menecer performansı.
- **İstehsalat hesabatı:** tamamlanma vaxtı, gecikmələr, dəzgah yükü.
- **Maliyyə hesabatı:** gəlir/xərc/mənfəət, ƏDV, debitor borc.
- **Rentabellik:** sifariş/müştəri/xidmət üzrə mənfəətlilik reytinqi.
- Tarix filtri + CSV export.

## 10. Parametrlər (Settings) `/settings`
**Məqsəd:** sistem konfiqurasiyası (yalnız Admin).

- **İstifadəçilər və rollar:** CRUD, rol təyini, aktiv/deaktiv.
- **Xidmət kataloqu:** [01-market-research.md](01-market-research.md) əsasında xidmət/məhsul növləri, vahid, standart marja.
- **Şirkət məlumatı:** ad, VÖEN, logo, faktura rekvizitləri, ƏDV dərəcəsi (default 18%).
- **Sabitlər:** vahidlər, lead mənbələri, xərc kateqoriyaları.

---

## Modul asılılıq matrisi

| Modul | Asılı olduğu |
|-------|--------------|
| Təkliflər | CRM (müştəri), Kataloq (xidmət) |
| Sifarişlər | Təkliflər |
| İstehsalat | Sifarişlər, Anbar (material), İşçilər |
| Quraşdırma | Sifarişlər, İşçilər |
| Anbar | — (əsas), İstehsalat (sərfiyyat) |
| Maliyyə | Sifarişlər |
| Hesabatlar | Hamısı (oxu) |
