# 02 — Məhsul Tələbləri Sənədi (PRD)

> Sahib: senior-product-owner · Status: Baseline v1.0

---

## 1. Problem bəyanatı

Reklam istehsalatı şirkəti sifarişləri Excel, WhatsApp və kağız üzərində idarə edir. Nəticədə:
- Təkliflərin qiyməti əl ilə, səhvlərlə hesablanır.
- Sifarişin hansı mərhələdə olduğu bilinmir (dizayn? çap? montaj?).
- Material qalığı və sərfiyyatı izlənmir.
- Hansı sifarişin qazanc/zərər gətirdiyi məlum deyil.
- Rəhbərdə real-vaxt görünürlük yoxdur.

**Həll:** vahid, Azərbaycan dilli, rol-əsaslı ERP — sifarişi lead-dən fakturaya qədər izləyir.

## 2. Personalar (istifadəçi rolları)

| # | Persona | AZ ad | Əsas ehtiyac |
|---|---------|-------|--------------|
| 1 | **Owner / Admin** | Rəhbər | Bütün görünürlük, hesabat, maliyyə, istifadəçi idarəetməsi |
| 2 | **Sales / Account Manager** | Satış meneceri | Lead, müştəri, təklif, sifariş yaratmaq |
| 3 | **Designer** | Dizayner | Ona təyin olunmuş dizayn tapşırıqları, maket yükləmə/təsdiq |
| 4 | **Production Manager** | İstehsalat rəhbəri | Sifarişləri istehsalata salmaq, mərhələ/resurs təyini |
| 5 | **Production Operator** | Usta / Operator | Öz tapşırıqları, status yeniləmə, material sərfi |
| 6 | **Installer** | Quraşdırıcı | Montaj cədvəli, obyekt məlumatı, foto sübut |
| 7 | **Accountant** | Mühasib | Faktura, ödəniş, xərc, rentabellik |
| 8 | **Warehouse** | Anbardar | Material qalığı, mədaxil/məxaric, az qalıq xəbərdarlığı |

> **MVP sadələşdirmə:** rollar 8-dir, amma icazə sistemi 4 əsas qrup ətrafında qurulur: **Admin, Sales, Production, Finance**. Digərləri bu qrupların alt-icazələridir (bax [05-architecture.md](05-architecture.md#rbac)).

## 3. Sifariş həyat dövrü (əsas axın)

```
Lead ──▶ Müştəri ──▶ Brief/Sorğu ──▶ Kommersial təklif ──▶ [Təsdiq]
                                                              │
        ┌─────────────────────────────────────────────────────┘
        ▼
     Sifariş (Job) ──▶ Dizayn ──▶ İstehsalat ──▶ QC ──▶ Quraşdırma ──▶ Təhvil
                                                                          │
                                                    Faktura ──▶ Ödəniş ──▶ Bağlandı
```

Hər keçid status dəyişikliyi + audit log yaradır.

## 4. Funksional tələblər (MoSCoW)

### Must (MVP — pitch üçün mütləq)
- **M1** Auth: email/parol login, rol-əsaslı menyu və icazə.
- **M2** CRM: müştəri və lead CRUD, əlaqə tarixçəsi.
- **M3** Kommersial təklif: sətir-sətir, 5-komponentli kalkulyator (material+işçilik+daşınma+quraşdırma+marja), ƏDV 18%, versiyalar, status (qaralama/göndərilib/təsdiqlənib/rədd).
- **M4** Sifariş: təsdiqlənmiş təklifdən sifariş yaratmaq, avtomatik nömrə, deadline, məsul.
- **M5** İstehsalat: Kanban lövhə (Gözləyir → Dizayn → İstehsalat → QC → Hazır), tapşırıq təyinatı.
- **M6** Quraşdırma: montaj tapşırığı, cədvəl, foto yükləmə.
- **M7** Anbar: material kataloqu, qalıq, sifariş üzrə sərfiyyat.
- **M8** Maliyyə: faktura yaratmaq, ödəniş qeydi, xərc, **sifariş rentabelliyi**.
- **M9** Dashboard: aktiv sifariş, aylıq gəlir, gözləyən təklif, istehsalat yükü, gecikən sifariş.
- **M10** Seed data: real AZ xidmət kataloqu + demo müştəri/sifarişlərlə dolu.

### Should (tam məhsul — demo sonrası yaxın)
- **S1** Hesabatlar: satış, istehsalat, maliyyə, rentabellik (tarix filtri, export CSV).
- **S2** İstifadəçi/rol idarəetməsi UI.
- **S3** PDF export (təklif + faktura).
- **S4** Bildirişlər (in-app): tapşırıq təyin edildi, deadline yaxınlaşır.
- **S5** Fayl/şəkil əlavələri (sifarişə sənəd, dizayn faylı).

### Could (gələcək)
- **C1** İşçilik vaxt izləmə (time tracking).
- **C2** Müştəri portalı (təklif online təsdiq).
- **C3** Dəzgah tutumu planlaması (capacity planning).
- **C4** Çoxdilli UI (AZ/RU/EN).

### Won't (bu mərhələdə yox)
- Onlayn ödəniş şlyuzu, e-qaimə/vergi orqanı inteqrasiyası, native mobil app, media buying.

## 5. Seçmə user story-lər (acceptance criteria ilə)

> Tam siyahı: [08-backlog.md](08-backlog.md). Burada nümunə format.

**US-QUOTE-01 — Təklif kalkulyatoru**
> *Satış meneceri olaraq* müştəriyə təklif hazırlayarkən material, işçilik, daşınma və quraşdırma xərclərini daxil etmək və marja + ƏDV avtomatik hesablanmaq istəyirəm ki, qiyməti sürətli və səhvsiz verim.

Acceptance:
- [ ] Sətir əlavə edərkən xidmət kataloqundan seçim + miqdar + vahid qiymət.
- [ ] Hər sətir üçün 5 xərc komponenti ayrıca daxil edilir.
- [ ] Sistem aralıq cəmi, marja (%), ƏDV (18%) və yekunu real-vaxt hesablayır.
- [ ] Təklif yadda saxlanır, versiyalanır, PDF-ə çıxır.
- [ ] Status dəyişikliyi audit log-a düşür.

**US-PROD-01 — İstehsalat Kanban**
> *İstehsalat rəhbəri olaraq* sifarişləri mərhələlərə görə lövhədə görmək və məsul təyin etmək istəyirəm.

Acceptance:
- [ ] Kanban sütunları: Gözləyir / Dizayn / İstehsalat / QC / Hazır.
- [ ] Kartı sürükləyəndə status və audit log yenilənir.
- [ ] Karta məsul işçi və deadline təyin olunur; gecikən kart qırmızı işarələnir.

**US-FIN-01 — Sifariş rentabelliyi**
> *Mühasib/Rəhbər olaraq* hər sifariş üzrə planlanan vs faktiki gəlir və xərci görmək istəyirəm.

Acceptance:
- [ ] Sifariş səhifəsində: gəlir (faktura), xərc (material+işçilik+digər), mənfəət, marja %.
- [ ] Dashboard-da aylıq ümumi rentabellik.

## 6. Qeyri-funksional tələblər (NFR)

| Kod | Tələb |
|-----|-------|
| NFR-1 | İlk mənalı ekran < 2 san (seed data ilə). |
| NFR-2 | Tam responsive (masaüstü + tablet + telefon; quraşdırıcı telefondan istifadə edir). |
| NFR-3 | Azərbaycan dili, AZN (₼), tarix formatı `gg.aa.iiii`. |
| NFR-4 | Parollar bcrypt ilə hash; rol-əsaslı server-tərəf yoxlama. |
| NFR-5 | Bütün kritik əməliyyatlar audit log-a yazılır. |
| NFR-6 | Kod bazası tək monolit, sadə deploy (Vercel və ya VPS). |

## 7. Risklər və fərziyyələr

- **Fərziyyə:** müştəri detallı tələb verməyib → biz sənaye-standart axını təklif edirik; demo-dan sonra dəqiqləşdiriləcək.
- **Risk:** scope böyüyə bilər → MoSCoW ilə MVP sərt saxlanır; "Could/Won't" demo-dan sonraya.
- **Risk:** real qiymət düsturu şirkətə görə dəyişir → kalkulyator konfiqurasiya edilə bilən marja/ƏDV ilə qurulur.
