# 00 — Layihə İcmalı (Project Overview)

> **Məhsul adı (işçi):** `AdErp` — Reklam istehsalatı şirkəti üçün ERP
> **Sənəd versiyası:** 1.0 · **Tarix:** 2026-07-11 · **Status:** Planlama

---

## 1. Biznes konteksti

Müştəri — Azərbaycan bazarında fəaliyyət göstərən **reklam istehsalatı** şirkətidir. Bu tip şirkətlər klassik "kreativ agentlik"dən fərqli olaraq üç fəaliyyəti birləşdirir:

1. **Dizayn / kreativ** — 3D maket, texniki layihələndirmə, brend dizayn.
2. **İstehsalat (production)** — lazer/CNC kəsim, genişformatlı çap, hərf/qutu/konstruksiya hazırlanması, LED montajı.
3. **Quraşdırma və servis (installation)** — montaj/demontaj, fasad işləri, texniki xidmət.

Yəni ERP-nin nüvəsi **sifariş → dizayn → istehsalat → quraşdırma → maliyyə** dövriyyəsidir. Bu, sadəcə task-tracker deyil, **istehsalat idarəetmə sistemidir**.

## 2. Layihənin məqsədi və fürsət

- **Müştərinin ilkin istəyi:** sadəcə demo / preview link.
- **Bizim strategiyamız:** demonu tam işlək məhsula çevirmək — belədə müştəri "demo"nu görəndə real dəyər görüb tam layihəyə keçir. Fürsəti bir demo ilə məhdudlaşdırmırıq.
- **Nəticə:** clickable demo deyil, **real verilənlər bazası ilə işləyən, çoxrollu, seed data ilə dolu, canlı preview link verilə bilən MVP**.

## 3. Uğur meyarları (demo/pitch üçün)

| Meyar | Hədəf |
|-------|-------|
| Real login + rollar | 3-4 rol ilə demo hesabları işləyir |
| Uçtan-uca axın | Lead → təklif → sifariş → istehsalat → quraşdırma → faktura tam gedir |
| Doldurulmuş data | Ən azı 15-20 müştəri, 30+ sifariş, real AZ xidmət kataloqu ilə seed |
| Görünüş | Şablon görünməyən, peşəkar, Azərbaycan dilli UI |
| Preview | Vercel/VPS üzərində canlı link, mobil-uyğun |
| Sürət | İlk mənalı ekran < 2 san yüklənir |

## 4. Əhatə dairəsi (scope) — yüksək səviyyə

**Daxildir (MVP + tam məhsul):**
- CRM (müştərilər, leadlər, əlaqələr)
- Kommersial təkliflər / qiymətləndirmə (material+işçilik+daşınma+quraşdırma+marja+ƏDV)
- Sifariş / iş idarəetməsi (job management)
- İstehsalat axını (Kanban, mərhələlər, resurs/dəzgah təyinatı)
- Quraşdırma planlaması (montaj/demontaj, foto sübut)
- Anbar / material idarəetməsi
- Maliyyə (faktura, ödəniş, xərc, sifariş rentabelliyi)
- İşçilər / komandalar + rol-əsaslı icazələr (RBAC)
- Hesabatlar və dashboard

**Daxil deyil (bu mərhələdə):**
- Onlayn ödəniş inteqrasiyası (yalnız qeydiyyat)
- Rəsmi mühasibat/vergi inteqrasiyası (e-qaimə, 1C) — gələcək faza
- Media buying / kampaniya idarəetməsi (bu şirkət tipində əsas deyil)
- Mobil native app (responsive web kifayətdir)

## 5. Texniki qərarlar (xülasə)

| Sahə | Seçim | Səbəb |
|------|-------|-------|
| Framework | **Next.js (App Router), monolit** | Tələb; SSR + API bir yerdə, sadə deploy |
| DB | **MySQL** | Tələb |
| ORM | **TypeORM** | Tələb; entity-əsaslı, migrasiya, MySQL ilə tam uyğun |
| Auth | **Auth.js (credentials)** | Daxili sistem, email/parol kifayətdir |
| UI | **Tailwind CSS + shadcn/ui** | Sürətli, tutarlı, özəlləşdirilə bilən |
| Dil | **Azərbaycan dili (UI)** | Hədəf bazar |
| Valyuta / vergi | **AZN (₼), ƏDV 18%** | Yerli |

Ətraflı: [05-architecture.md](05-architecture.md).

## 6. Sənəd xəritəsi

| Sənəd | Məzmun | Kimə |
|-------|--------|------|
| [01-market-research.md](01-market-research.md) | AZ + qlobal bazar araşdırması | PO, biznes |
| [02-prd.md](02-prd.md) | Məhsul tələbləri, personalar, user story | PO, komanda |
| [03-modules.md](03-modules.md) | Hər modulun detallı funksiyaları | Developer, PO |
| [04-data-model.md](04-data-model.md) | MySQL cədvəlləri, əlaqələr | Developer |
| [05-architecture.md](05-architecture.md) | Texniki arxitektura, qovluq strukturu | Developer |
| [06-design-system.md](06-design-system.md) | Vizual dil, komponentlər, UX | Designer, developer |
| [07-roadmap.md](07-roadmap.md) | Fazalar, ardıcıllıq | Hamısı |
| [08-backlog.md](08-backlog.md) | Epik → tapşırıq bölgüsü | Developer, PO |

## 7. Komanda (subagentlər)

Bu layihə üç ixtisaslaşmış AI subagent ilə icra olunur (`.claude/agents/`):
- **senior-product-owner** — tələb, prioritet, acceptance criteria.
- **senior-ui-ux-designer** — vizual dil, ekran dizaynı, komponent UX.
- **senior-fullstack-developer** — Next.js + MySQL implementasiya.
