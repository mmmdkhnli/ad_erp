# 05 — Texniki Arxitektura (Architecture)

> Prinsip: **monolit, sadə, standart**. Heç bir mikroservis, message queue, ayrı backend yox. Next.js App Router bütün UI + API-ni daşıyır.

---

## 1. Texnologiya seçimi

| Sahə | Seçim | Versiya |
|------|-------|---------|
| Framework | Next.js (App Router) | 16.x |
| Dil | TypeScript | 5.x |
| DB | MySQL (XAMPP/MariaDB) | 8.x |
| ORM | TypeORM | 1.x |
| Auth | **Custom JWT** (jose HS256) + bcryptjs | — |
| UI | Tailwind CSS + shadcn/ui | latest |
| Form/validasiya | React Hook Form + Zod | latest |
| Cədvəl/qrafik | TanStack Table + Recharts | latest |
| İkonlar | lucide-react | latest |
| PDF | @react-pdf/renderer (S3-də) | latest |

**Niyə TypeORM?** Tələb olunub. Entity-əsaslı model (dekorator ilə), MySQL ilə tam uyğun, migrasiya + repository pattern. Data source tək yerdə (`server/data-source.ts`) qurulur.

> ⚠️ **Next.js qeydi:** TypeORM dekoratorlarla işləyir → `tsconfig.json`-da `experimentalDecorators` + `emitDecoratorMetadata` aktiv olmalı. `reflect-metadata` bir dəfə (`instrumentation.ts` və ya `data-source` giriş nöqtəsində) import edilir. Entity-lər yalnız server tərəfdə istifadə olunur (server actions / server components) — client bundle-a düşmür.

## 2. Qovluq strukturu

```
erp/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (app)/             # qorunan layout (auth tələb olunur)
│   │   │   ├── layout.tsx     # sidebar + topbar
│   │   │   ├── dashboard/
│   │   │   ├── crm/
│   │   │   ├── quotes/
│   │   │   ├── orders/
│   │   │   ├── production/
│   │   │   ├── installations/
│   │   │   ├── inventory/
│   │   │   ├── finance/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── api/               # yalnız lazım olanda route handler
│   │   └── layout.tsx         # root
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitivləri
│   │   └── shared/            # DataTable, PageHeader, StatCard, StatusBadge...
│   ├── server/
│   │   ├── entities/          # TypeORM entity-lər: User.ts, Quote.ts, Order.ts...
│   │   ├── migrations/        # TypeORM migrasiyaları
│   │   ├── actions/           # server actions (modul üzrə): quotes.ts, orders.ts...
│   │   ├── data-source.ts     # TypeORM DataSource (singleton, initialize)
│   │   ├── auth.ts            # Auth.js konfiqurasiyası
│   │   └── rbac.ts            # icazə yoxlama
│   ├── scripts/
│   │   └── seed.ts            # AZ xidmət kataloqu + demo data
│   ├── lib/
│   │   ├── calc.ts            # təklif/rentabellik hesablamaları
│   │   ├── format.ts          # ₼, tarix, nömrə formatı
│   │   └── constants.ts       # enum etiketləri (AZ)
│   └── types/
├── docs/                      # bu sənədlər
├── .claude/agents/            # subagentlər
├── .env
└── package.json
```

## 3. Data axını (pattern)

```
Server Component (səhifə)  ──oxu──▶  TypeORM repository  ──▶  DB
        │
        └─ Client Component (form) ──▶ Server Action ──▶ rbac check ──▶ repository ──▶ AuditLog
                                              │
                                          revalidatePath
```

- **Oxu:** Server Component `getDataSource()` → `repository.find(...)` (SSR, sürətli).
- **Yazı:** Server Action → RBAC yoxlama → Zod validasiya → repository/transaction → audit log → `revalidatePath`.
- **DataSource singleton:** dev-də hot-reload zamanı təkrar initialize olmamaq üçün `globalThis`-də keşlənir (Prisma-nın məşhur pattern-inin TypeORM ekvivalenti).
- API route yalnız: file upload, PDF, webhook kimi hallar üçün.

## 4. Auth axını (custom JWT)
> Auth.js əvəzinə yüngül custom JWT seçildi: Next 16 + React 19 bleeding-edge, Auth.js v5 hələ beta → sadə və versiya-davamlı həll.
- **Login:** email + parol → `authenticate()` DB-dən istifadəçini tapır, `bcryptjs.compare` ilə yoxlayır.
- **Session:** `jose` ilə HS256 JWT imzalanır (`userId, name, email, role, permissions`), **httpOnly cookie** (`aderp_session`, 7 gün) kimi saxlanır.
- **Fayllar:** `lib/session.ts` (jose imza/yoxlama — edge-safe, DB yox), `server/auth.ts` (login, cookie, bcrypt — Node), `server/actions/auth.ts` (`loginAction`/`logoutAction`).
- **`middleware.ts`:** cookie-dəki JWT-ni `jose` ilə yoxlayır (DB-yə toxunmadan); girişsizi `/login`-ə, girişlini login səhifəsindən `/dashboard`-a yönləndirir.
  - ⚠️ Next 16-da `middleware.ts` deprecated → `proxy.ts`-ə köçürülməli (hələ işləyir).

### 4.1 Development server
`npm run dev` = `next dev --webpack` (**Turbopack yox**). Bu maşında Turbopack `.next` altında `EPERM: rename` verir (korporativ antivirus `.tmp` fayllarını kilidləyir). Webpack keçir. Migration/seed əmrləri: `npm run migration:run`, `npm run seed`.

## 5. RBAC (rol-əsaslı icazə) {#rbac}

İcazələr `Role.permissions` JSON massivində (`"quotes:write"`, `"finance:read"` və s.). Yoxlama `server/rbac.ts`-də mərkəzləşir.

| Rol | İcazələr (xülasə) |
|-----|-------------------|
| **ADMIN** | hamısı (`*`) |
| **SALES** | crm:*, quotes:*, orders:read, dashboard:read |
| **PRODUCTION** | orders:read, production:*, inventory:read, installations:* |
| **FINANCE** | orders:read, finance:*, reports:read |
| **DESIGNER** | production:read/write (öz tapşırıqları) |
| **INSTALLER** | installations:read/write (öz işləri) |
| **WAREHOUSE** | inventory:* |

- Server action-ın əvvəlində `requirePermission("quotes:write")`.
- Sidebar menyusu icazəyə görə filtrlənir (UI + server ikiqat qoruma).

## 6. Ümumi komponentlər (təkrar istifadə)
- `DataTable` — filtr/sort/pagination (TanStack).
- `PageHeader` — başlıq + əməliyyat düymələri.
- `StatCard`, `StatusBadge`, `Kanban`, `MoneyInput`, `EmptyState`, `ConfirmDialog`.
- Bax dizayn sistemi: [06-design-system.md](06-design-system.md).

## 7. Seed strategiyası (demo üçün kritik)
`src/scripts/seed.ts` (`ts-node`/`tsx` ilə işə salınır, DataSource → repository.save):
1. Rollar + demo istifadəçilər (hər rol üçün 1, parol `demo1234`).
2. **ServiceCatalog** — [01-market-research.md]-dəki bütün real AZ xidmətlər.
3. **Material** — vinil, akril, foreks, LED, profil və s. (real qalıqlarla).
4. 15-20 müştəri + leadlər.
5. 30+ təklif → bir hissəsi sifarişə çevrilmiş (müxtəlif statuslarda).
6. İstehsalat tapşırıqları (Kanban dolu), quraşdırma, faktura, ödəniş.
> Məqsəd: preview link açılanda sistem "canlı" görünsün.

## 8. Deploy
- **Variant A (sürətli demo):** Vercel + idarə olunan MySQL (Railway / Aiven / DigitalOcean). ⚠️ PlanetScale-dən qaçın — FK constraint dəstəyi məhduddur, TypeORM əlaqələri ilə problem yaradır.
- **Variant B (müştəri VPS):** Docker (Next.js + MySQL), Nginx reverse proxy.
- `.env`: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`.
- Preview link → müştəriyə göndərilir.

## 9. Konvensiyalar
- **Dil:** UI 100% Azərbaycan; kod (dəyişən/funksiya/cədvəl) İngilis.
- **Pul:** `decimal`, göstərişdə `₼` (`format.ts`).
- **Tarix:** `gg.aa.iiii`.
- **Enum etiketləri:** DB-də İngilis (enum), UI-da AZ (`constants.ts` map).
- **Commit:** kiçik, mənalı; feature branch.
- **Error handling:** server action `{ ok, data?, error? }` qaytarır; UI toast göstərir.
