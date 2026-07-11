# 06 — Dizayn Sistemi (Design System)

> Sahib: senior-ui-ux-designer · Prinsip mənbəyi: `frontend-design` skill.
> Bu **daxili əməliyyat aləti (ERP)** üçün dizayn dilidir — aydınlıq və sürət prioritetdir, amma şablon görünməməlidir.

---

## 1. Konsepsiya / thesis: "Precision Workshop" (Dəqiq emalatxana)

Şirkət ekranda deyil, **fiziki dünyada** dəyər yaradır: lazer/CNC kəsim, genişformatlı çap, akril/metal hərf, LED işıqlandırma. Dizayn dili bu dünyadan gəlir — **ölçmə, texniki cizgi, material dürüstlüyü** və istehsalatın dəqiqliyi. Generik "dashboard mavi + Inter + kart" yolundan qəsdən çəkilirik.

Üç qərar bizi klişedən ayırır:
1. **Brend rəngi = çap prosesindən (CMYK) götürülmüş cyan** — mavi deyil, çap dünyasına aid *process cyan*. (Reserv olunmuş status rəngləri — yaşıl/qırmızı/amber — brend rənginə düşmür ki, qarışmasın.)
2. **Rəqəmlər üçün mono şrift** — pul (₼), miqdar, sifariş nömrələri tabular monospace ilə — həm funksional (sütunlar düzülür), həm texniki-cizgi estetikasına sadiq.
3. **İmza elementi: "ölçü xətti" (tick-rule)** — bölmə ayırıcıları və KPI kartlarında rulet/lineyka tik-işarələri; status "kəsilmiş künc" (cut-corner) plitə kimi. Cəsarəti bir yerdə xərcləyirik; qalan hər şey sakit qalır.

---

## 2. Rəng (Color tokens)

### Neytral / səth
| Token | Hex | İstifadə |
|-------|-----|----------|
| `--canvas` | `#F4F6F8` | Səhifə fonu (soyuq "alüminium", ağ deyil, krem deyil) |
| `--surface` | `#FFFFFF` | Kart, panel, cədvəl |
| `--surface-sunken` | `#EDF0F3` | Input fonu, ikinci dərəcəli zolaq |
| `--ink` | `#16191D` | Əsas mətn (dərin qrafit, saf qara deyil) |
| `--ink-muted` | `#5B6470` | İkinci dərəcəli mətn, label |
| `--ink-faint` | `#9AA3AE` | Placeholder, disabled |
| `--hairline` | `#E1E5EA` | Sərhəd, ayırıcı (texniki cizgi xətti) |

### Brend (process cyan)
| Token | Hex | İstifadə |
|-------|-----|----------|
| `--brand` | `#0E7490` | Əsas: düymə, aktiv link, seçili |
| `--brand-hover` | `#0B5E75` | Hover |
| `--brand-soft` | `#E0F2F7` | Fon (seçili sətir, badge fonu) |
| `--brand-glow` | `#22B8D9` | Fokus halqası, vurğu (LED "işıq" hissi) |

### Semantik status (ERP-də çox statuslu — sərt tərif)
| Token | Hex | Fon (soft) | Məna |
|-------|-----|-----------|------|
| `--success` | `#15803D` | `#E6F4EA` | Təsdiq, ödənilib, hazır |
| `--warning` | `#B45309` | `#FBF0E2` | Gözləyir, qismən, deadline yaxın |
| `--danger` | `#BE123C` | `#FCE8EC` | Rədd, ləğv, gecikib, ödənilməyib |
| `--info` | `#1D4ED8` | `#E7EDFD` | Göndərilib, məlumat |
| `--neutral` | `#5B6470` | `#EDF0F3` | Qaralama, yeni, bağlanıb |
| `--accent-2` | `#6D28D9` | `#F0E9FD` | İstehsalat/xüsusi mərhələ (bənövşəyi) |

### Status → rəng xəritəsi (bütün enumlar)
```
Quote:   DRAFT→neutral  SENT→info  APPROVED→success  REJECTED→danger  EXPIRED→warning
Order:   NEW→neutral  IN_PROGRESS→brand  INSTALLING→accent-2  DELIVERED→success  CLOSED→neutral  CANCELLED→danger
Prod:    PENDING→neutral  DESIGN→info  PRODUCTION→brand  QC→warning  DONE→success
Invoice: UNPAID→danger  PARTIAL→warning  PAID→success
Install: PLANNED→neutral  EN_ROUTE→info  IN_PROGRESS→brand  DONE→success
Lead:    NEW→neutral  CONTACTED→info  QUOTED→warning  WON→success  LOST→danger
```
> Bütün status göstərişləri **StatusBadge** komponenti ilə (aşağıda). Heç vaxt "sərbəst" rəng.

**Dark mode:** MVP-də yalnız açıq tema. Tokenlər CSS dəyişəni kimi qurulur ki, sonra dark əlavə edilə bilsin.

---

## 3. Tipografiya

| Rol | Şrift | Çəki | İstifadə |
|-----|-------|------|----------|
| Display | **Space Grotesk** | 600/700 | Səhifə başlığı, KPI rəqəmi, login hero |
| Body / UI | **Inter** | 400/500/600 | Bütün interfeys mətni, form, menyu |
| Data / Mono | **IBM Plex Mono** | 400/500 | Pul (₼), miqdar, sifariş№, tarix — tabular |

**Type scale** (1.250 — major third):
| Token | px / line | İstifadə |
|-------|-----------|----------|
| `display` | 32 / 38 | Login hero, böyük KPI |
| `h1` | 25 / 32 | Səhifə başlığı |
| `h2` | 20 / 28 | Bölmə |
| `h3` | 16 / 24 | Kart başlığı |
| `body` | 14 / 22 | Əsas |
| `small` | 13 / 18 | Label, köməkçi |
| `caption` | 11 / 16 | Eyebrow, cədvəl başlıq (uppercase, letter-spacing 0.06em) |

Qaydalar:
- Rəqəmlər (pul/miqdar/№) həmişə mono + `font-variant-numeric: tabular-nums`.
- Cədvəl başlıqları: `caption`, uppercase, `--ink-muted`.
- Şriftlər `next/font` ilə lokal yüklənir (CDN yox → CSP/performans).

---

## 4. Layout & interval

- **Spacing base:** 4px. Şkala: 4·8·12·16·24·32·48.
- **Radius:** `--r-sm 4px` (input, badge), `--r-md 8px` (kart, düymə), `--r-lg 12px` (modal). Pill/yumşaq yox — kəsilmiş akril/metal plitə hissi.
- **Kölgə:** minimal, hairline-a güvən. `--shadow-1: 0 1px 2px rgba(16,25,40,.06)`; modal üçün `--shadow-2`.
- **App shell:**
```
┌────────────────────────────────────────────────────────┐
│ [☰ logo]                    axtarış…      [🔔] [istifadəçi]│  ← topbar (56px)
├──────────┬─────────────────────────────────────────────┤
│ sidebar  │  PageHeader: başlıq ┊┊┊┊┊ + [Əməliyyat]     │  ← tick-rule ayırıcı
│ (240px)  │                                               │
│ menyu    │  ┌── kart ──┐ ┌── kart ──┐ ┌── kart ──┐       │
│ rola     │  KPI + tick  │             │             │       │
│ görə     │  └──────────┘                             │       │
│          │  DataTable / Kanban …                        │
└──────────┴─────────────────────────────────────────────┘
```
- Sidebar rola görə filtrlənən qruplar; aktiv element `--brand-soft` fon + sol `--brand` zolaq.
- Content max-en 1440px, responsive → tablet-də sidebar collapse (icon-only), telefon-da drawer.

---

## 5. Əsas komponentlər (spec)

| Komponent | Qaydalar |
|-----------|----------|
| **Button** | Primary (`--brand` dolu, ağ mətn) · Secondary (hairline, ink) · Ghost · Danger. Hündürlük 36px. Loading = spinner + disabled. |
| **StatusBadge** | Kəsilmiş-künc çip; `soft` fon + tünd mətn; ikon opsional. Rəng status xəritəsindən. |
| **DataTable** | Sticky başlıq (`caption` stil), zebra yox — hairline sətir ayırıcı; sağ-düzülmüş mono rəqəm sütunları; sətir hover `--surface-sunken`; boş halda EmptyState; server pagination/sort/filter. |
| **StatCard** | KPI rəqəm (Space Grotesk display) + label (`caption`) + delta (↑/↓ semantik rəng) + üstdə tik-rule aksesuarı. |
| **Kanban** | Sütun başlığı sayğacla; kart = sifariş№(mono) + başlıq + məsul avatar + deadline (gecikən → `--danger`); drag = kölgə qalxır. |
| **Form** | Label üstdə (`small`, ink-muted); input hündürlük 36px, `--surface-sunken` fon, fokus `--brand-glow` halqa; xəta mətni `--danger` inputun altında; RHF+Zod. |
| **MoneyInput** | Mono, sağ-düzülmüş, `₼` prefiks, min-qrup ayırıcı. |
| **Modal / Sheet** | Modal (kiçik təsdiq) · Sheet (sağdan, redaktə formaları). Fokus tələsi, Esc bağlayır. |
| **Toast** | Server action nəticəsi; semantik rəng + ikon; 4 san. |
| **EmptyState** | Blueprint-grid fon + qısa mətn + primary əməliyyat ("İlk təklifi yarat"). Dəvətkar, boş qutu deyil. |

---

## 6. Yazı (UI copy) qaydaları
- İstifadəçinin dilində: "Bildirişlər", "webhook konfiqurasiyası" yox.
- Düymə = baş verən iş: **"Təklifi göndər"**, "Submit" yox. Axın boyu eyni söz: "Göndər" → toast "Göndərildi".
- Xəta: nə baş verdi + necə düzəlt. Üzr istəməz, qeyri-müəyyən olmaz.
- Boş ekran = hərəkətə dəvət.
- Cümlə registri (Sentence case), doldurucu söz yox.

---

## 7. Keyfiyyət döşəməsi (quality floor)
- Tam responsive (masaüstü/tablet/telefon).
- Görünən klaviatura fokusu (`--brand-glow` halqa) hər interaktiv elementdə.
- `prefers-reduced-motion` gözlənilir; animasiya minimal və məqsədli (status keçidi, sheet açılışı, KPI sayğac).
- Kontrast AA: mətn ≥ 4.5:1 (bütün ink tokenləri canvas/surface üstündə keçir).
- Skeleton/loading halları; heç vaxt "boş sıçrayış".

---

## 8. İmza elementinin tətbiqi (bir yerdə cəsarət)
- **Tick-rule** (ölçü xətti): PageHeader altında, StatCard üstündə, bölmə ayırıcılarında incə tik-işarə cərgəsi. Login ekranında blueprint-grid + böyük tik-rule hero.
- Qalan hər şey **sakit**: neytral canvas, hairline, ölçülü interval. Chanel qaydası — bir aksesuarı çıxar.
