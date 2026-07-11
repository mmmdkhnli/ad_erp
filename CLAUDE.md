# CLAUDE.md — AdErp

Reklam istehsalatı şirkəti üçün ERP (Azərbaycan bazarı). Bu fayl gələcək Claude Code sessiyalarını istiqamətləndirir.

## Layihə nədir
Sifarişi **lead → təklif → sifariş → istehsalat → quraşdırma → faktura** dövrü boyu idarə edən daxili ERP. Şirkət tipi: signage/çap/LED/konstruksiya istehsalı + dizayn + quraşdırma. İlk hədəf: müştəriyə **canlı, doldurulmuş demo preview link**.

## Texnologiya (dəyişməz)
- **Next.js (App Router), monolit** + TypeScript
- **MySQL + TypeORM** — ⚠️ **Prisma YOX**. Dekorator-əsaslı entity; `experimentalDecorators` + `emitDecoratorMetadata`; `reflect-metadata`.
- **Custom JWT auth** (jose HS256, httpOnly cookie) + bcryptjs + `middleware.ts` + RBAC — Auth.js əvəzinə: Next 16 + React 19 bleeding-edge olduğundan sadə və versiya-davamlı seçim
- **Tailwind + shadcn/ui**, RHF + Zod
- Dil: **Azərbaycan** (UI) · Valyuta: **AZN ₼** · Vergi: **ƏDV 18%**
- Prinsip: **monolit, sadə, standart — mürəkkəb heç nə yox**

## Sənədlər (`docs/`) — işə başlamazdan oxu
| Fayl | Məzmun |
|------|--------|
| `docs/00-overview.md` | İcmal, uğur meyarları |
| `docs/01-market-research.md` | AZ + qlobal bazar, xidmət kataloqu |
| `docs/02-prd.md` | Personalar, MoSCoW, user story |
| `docs/03-modules.md` | 10 modul, route-lar, naviqasiya |
| `docs/04-data-model.md` | TypeORM entity-lər, əlaqələr |
| `docs/05-architecture.md` | Stack, qovluq, data axını, RBAC, deploy |
| `docs/06-design-system.md` | "Precision Workshop" dizayn dili, tokenlər |
| `docs/07-roadmap.md` | Fazalar (0→3), kritik yol, DoD |
| `docs/08-backlog.md` | Epik → tapşırıq (ID ilə) |

## Subagentlər (`.claude/agents/`)
- **senior-product-owner** — tələb, prioritet, acceptance criteria, demo ssenarisi.
- **senior-ui-ux-designer** — ekran/komponent dizaynı, dizayn sistemi, UI copy.
- **senior-fullstack-developer** — TypeORM + Next.js implementasiya, seed, deploy.

İş axını: PO tapşırığı dəqiqləşdirir → (UI-dırsa) designer spec verir → developer qurur və real axını verify edir.

## Əsas domen qaydaları
- **Təklif kalkulyatoru:** `(material + işçilik + daşınma + quraşdırma) × (1 + marja%) → subtotal → +ƏDV 18% → yekun`.
- **Sifariş rentabelliyi:** `gəlir(faktura) − xərc(material sərfi + expense) = mənfəət`.
- Bütün statuslar dizayn sistemindəki rəng xəritəsi + StatusBadge ilə.
- Bütün kritik mutasiyalar **AuditLog**-a; RBAC **server tərəf** yoxlanır.
- Nömrələr: `QUO/ORD/INV-YYYY-NNNN`.

## Cari status
**Faza 1 (MVP) TAMAMLANDI** ✅ — bütün 10 modul işləyir və verify edilib. Tam uçtan-uca axın:
**Lead → Müştəri → Təklif (5-komponentli kalkulyator) → Sifariş (job bag) → İstehsalat (Kanban drag-drop) → Quraşdırma → Faktura → Ödəniş → Rentabellik + Dashboard.**
- **Bütün 10 modul işləkdir** (placeholder yoxdur): CRM (E1), Təkliflər (E2), Sifarişlər (E3), İstehsalat (E4), Quraşdırma (E5), Anbar (E6), Maliyyə (E7), Dashboard (E8), **Hesabatlar (E8-3..6: tarix filtri + rentabellik + CSV)**, **Parametrlər (E9: xidmət kataloqu / istifadəçi / audit / şirkət, ADMIN-only)**.
- 19 TypeORM entity, hamısı migrasiya + seed ilə dolu. `tsc --noEmit` təmiz. Hər modul canlı DB ilə verify edilib.
- Bütün mutasiyalar RBAC (server-tərəf) + AuditLog ilə.
Növbəti (F2/deploy): PDF (təklif/faktura), foto yükləmə (storage), təqvim görünüşü, **deploy → preview link (E10)**. Bax `docs/08-backlog.md`.

## İşə salma (development)
```
npm install
npm run migration:run     # sxemi admedia_erp-ə tətbiq et
npm run seed              # rollar + demo istifadəçilər (parol: demo1234)
npm run dev               # webpack (bax aşağıdakı qeyd) → http://localhost:3000
```
Demo login: `admin@admedia.az` / `demo1234` (həmçinin sales/production/finance).
DB: XAMPP MySQL, `admedia_erp`, localhost, user `root`, parolsuz (`.env`-də konfiqurasiya).

### ⚠️ Windows / Turbopack qeydi
`dev` skripti **webpack** işlədir (`next dev --webpack`), Turbopack **yox**. Səbəb: bu maşında (Desktop + korporativ antivirus/EDR) Turbopack `.next` altında `.tmp` faylları rename edərkən `EPERM` verir. Webpack bu problemi keçir. Turbopack lazım olsa, layihəni AV-dən istisna edilmiş qovluğa köçürmək lazımdır.

## TypeORM inteqrasiya dərsləri (Next 16)
- Entity-lərdə **açıq sütun tipləri** yaz (`@Column({ type: "varchar" })`) — `tsx`/esbuild decorator metadata emit etmir.
- Dövri relation-larda **string target** + `import type` işlət — TDZ/circular import xətasının qarşısını alır.
- ⚠️ **getRepository və relation target-lərində CƏDVƏL ADI işlət** (`ds.getRepository("customers")`, `@ManyToOne("orders", ...)`), class/entity adı YOX. Səbəb: (1) dev HMR class identity-ni dəyişir; (2) `next build` production-da class adlarını minify edir (`User`→`h`) → "Entity metadata for h#users not found". `@Entity({name:"..."})`-dəki cədvəl adı string literaldır, minify olunmur → həm dev, həm production işləyir. Köməkçilərə (`sumOf`) də cədvəl adı ötür.
- DataSource-da `migrations` glob-u yalnız CLI üçün (`NEXT_RUNTIME` yoxlaması) — Next runtime glob require edə bilmir.
- `next.config.ts`: `serverExternalPackages: ["typeorm", "mysql2"]`.

## Mühit
- Windows · PowerShell (əsas shell) / Bash (POSIX skript).
- Kod (dəyişən/cədvəl/route) İngilis; UI mətni Azərbaycan.
- `middleware.ts` Next 16-da deprecated (`proxy.ts`-ə köçürülməli) — hələ işləyir, sonrakı təmizləmə.
