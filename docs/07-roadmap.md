# 07 — Yol Xəritəsi (Roadmap)

> Strategiya: **demo-first**. Ən qısa yolla canlı, doldurulmuş, uçtan-uca işləyən preview link. Sonra tam məhsula genişlənmə. Fazalar ardıcıldır; hər fazanın sonunda deploy edilə bilən vəziyyət.

---

## Kritik yol (demo üçün mütləq minimum)

```
Setup ─▶ Auth+Shell ─▶ CRM ─▶ Təklif+Kalkulyator ─▶ Sifariş ─▶ İstehsalat(Kanban) ─▶ Faktura ─▶ Seed+Dashboard ─▶ Deploy
```
Bu zəncir tamamlananda müştəriyə göstəriləcək **canlı preview link** hazırdır.

---

## Faza 0 — Təməl (Foundation) ✅ TAMAMLANDI
**Məqsəd:** işləyən skelet.
- [x] Next.js 16 + TypeScript + Tailwind v4 quraşdırma (+ hand-rolled UI primitivlər).
- [x] TypeORM DataSource + MySQL (XAMPP `admedia_erp`); `tsconfig` dekorator; `reflect-metadata`.
- [x] Entity-lərin ilk dəsti (User, Role, Customer, ServiceCatalog, AuditLog) + ilk migrasiya (tətbiq edilib).
- [x] Custom JWT auth (jose) + `middleware.ts` + RBAC (rol→icazə, server tərəf).
- [x] App shell: sidebar (rola görə menyu) + topbar + PageHeader (dizayn tokenləri, fontlar).
- [x] Dashboard + 10 modul route (placeholder) + seed (7 rol, 4 demo istifadəçi).
- [x] **Verify:** login/redirect/RBAC/TypeORM oxu uçtan-uca keçdi.
- **Çıxış:** ✅ login → dashboard (canlı DB sayğacları) işləyir; `dev` webpack ilə.

## Faza 1 — MVP (Must — pitch nüvəsi)
**Məqsəd:** uçtan-uca sifariş axını + doldurulmuş demo.
- **CRM:** müştəri + lead CRUD, əlaqə tarixçəsi.
- **Təkliflər:** sətirli təklif + 5-komponentli kalkulyator + ƏDV + statuslar + "sifarişə çevir".
- **Sifarişlər:** job səhifəsi (tablar), avto nömrə, deadline.
- **İstehsalat:** Kanban lövhə + tapşırıq təyini + status keçidi.
- **Quraşdırma:** montaj tapşırığı + foto yükləmə (sadə).
- **Anbar:** material kataloqu + qalıq + sifariş sərfiyyatı.
- **Maliyyə:** faktura + ödəniş + sifariş rentabelliyi.
- **Dashboard:** KPI kartları + qrafiklər.
- **Seed:** real AZ xidmət kataloqu + 15-20 müştəri + 30+ sifariş.
- **Deploy:** canlı preview link.
- **Çıxış:** ✅ müştəriyə göndəriləcək demo hazır.

## Faza 2 — Tam məhsul (Should)
**Məqsəd:** satışdan sonra tam istismar.
- Hesabatlar (satış/istehsalat/maliyyə/rentabellik) + CSV export.
- İstifadəçi/rol idarəetmə UI.
- PDF export (təklif + faktura).
- In-app bildirişlər (tapşırıq təyini, deadline).
- Fayl/şəkil əlavələri.
- Audit log görünüşü.

## Faza 3 — Genişlənmə (Could)
- İşçilik vaxt izləmə (time tracking).
- Müştəri portalı (online təklif təsdiqi).
- Dəzgah tutumu planlaması.
- Çoxdilli UI (AZ/RU/EN).
- Dark mode.

---

## Rol üzrə iş bölgüsü (subagentlər)

| Faza | senior-product-owner | senior-ui-ux-designer | senior-fullstack-developer |
|------|----------------------|------------------------|-----------------------------|
| 0 | Acceptance criteria dəqiqləşdir | Shell + token setup | Skelet, auth, entity, migrasiya |
| 1 | Story prioriteti, demo ssenarisi | Ekran dizaynları, komponentlər | Modullar, kalkulyator, seed, deploy |
| 2 | Feedback → backlog | Hesabat/PDF layout | Hesabat, bildiriş, RBAC UI |
| 3 | Yeni tələb | Yeni ekranlar | Genişlənmə |

---

## "Definition of Done" (hər story üçün)
- [ ] Funksiya PRD acceptance criteria-ya uyğun.
- [ ] RBAC server tərəf yoxlanır.
- [ ] Dizayn sistemi tokenləri ilə (ad-hoc rəng yox).
- [ ] Responsive + boş/loading/xəta halları.
- [ ] Mutasiya audit log-a yazılır.
- [ ] Seed data ilə real görünür.
- [ ] Manual smoke test keçir.
