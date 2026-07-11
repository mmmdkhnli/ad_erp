# 08 — Backlog (Epik → Tapşırıq)

> Format: `[ID] Başlıq — ölçü(S/M/L) · prioritet(Must/Should/Could) · faza`
> Ölçü: S≈yarım gün, M≈1-2 gün, L≈3+ gün. Prioritet MoSCoW ([02-prd.md]).

---

## EPIC-0 · Təməl & infrastruktur
- [ ] `E0-1` Next.js+TS+Tailwind+shadcn quraşdırma, qovluq strukturu — S · Must · F0
- [ ] `E0-2` TypeORM DataSource singleton + MySQL bağlantı + `.env` — S · Must · F0
- [ ] `E0-3` tsconfig dekorator (`experimentalDecorators`, `emitDecoratorMetadata`) + `reflect-metadata` — S · Must · F0
- [ ] `E0-4` Entity-lər (bütün model [04-data-model.md]) + ilk migrasiya — L · Must · F0
- [ ] `E0-5` Auth.js credentials + bcrypt + `middleware.ts` qoruma — M · Must · F0
- [ ] `E0-6` `rbac.ts` + `requirePermission` + rol→icazə matrisi — M · Must · F0
- [ ] `E0-7` App shell: sidebar (rola görə menyu) + topbar + PageHeader — M · Must · F0
- [ ] `E0-8` Dizayn tokenləri (CSS vars) + şrift (`next/font`) + ortaq komponentlər (Button, StatusBadge, DataTable, StatCard, EmptyState) — L · Must · F0
- [ ] `E0-9` `lib/calc.ts`, `lib/format.ts` (₼/tarix), `constants.ts` (enum AZ etiket) — M · Must · F0

## EPIC-1 · CRM ✅ (əsas hissə tamamlandı)
- [x] `E1-1` Müştəri siyahısı (DataTable + axtarış) — M · Must · F1
- [x] `E1-2` Müştəri yarat/redaktə (Sheet form, RHF + server Zod) — M · Must · F1
- [x] `E1-3` Müştəri detal səhifəsi (məlumat + əlaqə tarixçəsi) — M · Must · F1
- [x] `E1-4` Lead siyahısı + status + "müştəriyə çevir" — M · Must · F1
- [x] `E1-5` Əlaqə (interaction) loqu — S · Should · F1

## EPIC-2 · Təkliflər (nüvə) ✅ (nüvə tamamlandı)
- [x] `E2-1` Təklif siyahısı (status filtr) — M · Must · F1
- [x] `E2-2` Təklif redaktoru: başlıq + sətir əlavə/sil (useFieldArray) — L · Must · F1
- [x] `E2-3` **5-komponentli kalkulyator** (real-vaxt, server-authoritative) — L · Must · F1 ✓ riyaziyyat verify edildi
- [x] `E2-4` Status axını (qaralama→göndər→təsdiq/rədd) + audit — M · Must · F1
- [ ] `E2-5` Versiyalama (dublikat+redaktə) — S · Should · F1
- [x] `E2-6` "Sifarişə çevir" (təsdiqdə) — M · Must · F1 ✓
- [ ] `E2-7` PDF export — M · Should · F2

## EPIC-3 · Sifarişlər (job bag) ✅ (nüvə tamamlandı)
- [x] `E3-1` Sifariş siyahısı + status filtr — M · Must · F1
- [x] `E3-2` Sifariş detalı (job bag) — məlumat + sətirlər + status zolağı; İstehsalat/Quraşdırma/Maliyyə bölmələri placeholder — L · Must · F1
- [x] `E3-3` Avto nömrə generatoru (`ORD-YYYY-NNNN`) — S · Must · F1
- [x] `E3-4` Status axını (NEW→İcrada→Quraşdırma→Təhvil→Bağlı) + audit — S · Must · F1

## EPIC-4 · İstehsalat ✅ (nüvə tamamlandı)
- [x] `E4-1` Kanban lövhə (5 sütun) + HTML5 drag-drop (optimistik) — L · Must · F1
- [x] `E4-2` İstehsalat tapşırığı: məsul/dəzgah/deadline (create sheet) — M · Must · F1
- [x] `E4-3` Material sərfi qeydi → StockMovement(OUT, sifarişə bağlı) — M · Must · F1 ✓
- [ ] `E4-4` List görünüşü (alternativ, filtr) — S · Should · F2

## EPIC-5 · Quraşdırma ✅ (nüvə tamamlandı)
- [x] `E5-1` Quraşdırma tapşırığı yarat (obyekt/tarix/tip/xəritə/qeyd) — M · Must · F1
- [x] `E5-2` Sahə status axını (Planlanıb→Yolda→İcrada→Tamamlanıb) — M · Must · F1 · *foto yükləmə → storage infra lazımdır (F2)*
- [ ] `E5-3` Təqvim görünüşü (həftəlik) — M · Should · F2

## EPIC-6 · Anbar ✅ (tamamlandı)
- [x] `E6-1` Material kataloqu CRUD + qalıq + dəyər — M · Must · F1
- [x] `E6-2` Stok hərəkəti (mədaxil/məxaric/düzəliş) + çəkili orta maya — M · Must · F1
- [x] `E6-3` Az qalıq xəbərdarlığı (anbar səhifəsində banner) — S · Must · F1

## EPIC-7 · Maliyyə ✅ (nüvə tamamlandı)
- [x] `E7-1` Faktura yarat (sifarişdən) + `INV-YYYY-NNNN` + ƏDV ayrılması — M · Must · F1
- [x] `E7-2` Ödəniş qeydi (tam/qismən) + avtomatik status — M · Must · F1
- [x] `E7-3` Xərc qeydi (sifariş/ümumi, kateqoriya) — M · Must · F1
- [x] `E7-4` **Sifariş rentabelliyi** (gəlir−xərc, marja%) — M · Must · F1
- [ ] `E7-5` Faktura PDF — S · Should · F2

## EPIC-8 · Dashboard & Hesabatlar
- [x] `E8-1` KPI kartları (aktiv sifariş/daxilolma/təklif/gecikən/istehsalat yükü/borc) — M · Must · F1
- [x] `E8-2` Qrafiklər (aylıq daxilolma barları, status bölgüsü, son sifarişlər, deadline-lar) — M · Must · F1
- [x] `E8-3` Hesabat: satış (təklif→sifariş konversiya, top müştərilər) — M · Should · F2
- [x] `E8-4` Hesabat: istehsalat (mərhələ bölgüsü) — M · Should · F2
- [x] `E8-5` Hesabat: maliyyə + **sifariş rentabelliyi** (tarix filtri) — M · Should · F2
- [x] `E8-6` CSV export (rentabellik, client-side) — S · Should · F2

## EPIC-9 · Parametrlər & Admin ✅ (tamamlandı, yalnız ADMIN)
- [x] `E9-1` Xidmət kataloqu CRUD — M · Must · F1
- [x] `E9-2` Şirkət parametrləri (rekvizit/ƏDV dərəcəsi) — S · Should · F2
- [x] `E9-3` İstifadəçi/rol idarəetmə UI (parol dəyişmə daxil) — M · Should · F2
- [x] `E9-4` Audit log görünüşü — S · Should · F2

## EPIC-10 · Seed & Deploy (demo blocker)
- [ ] `E10-1` Seed: rollar + demo istifadəçilər (hər rol) — S · Must · F1
- [ ] `E10-2` Seed: real AZ xidmət kataloqu + material — M · Must · F1
- [ ] `E10-3` Seed: 15-20 müştəri, 30+ təklif/sifariş, Kanban/faktura dolu — L · Must · F1
- [ ] `E10-4` Deploy (Vercel + idarə olunan MySQL) + preview link — M · Must · F1
- [ ] `E10-5` Demo ssenari sənədi (müştəriyə göstəriş axını) — S · Must · F1

---

## Xülasə (say)
- **Must / Faza 0-1:** ~40 tapşırıq → demo hazır preview link.
- **Should / Faza 2:** ~14 tapşırıq → tam istismar.
- **Could / Faza 3:** ayrıca planlanacaq.

## İş qaydası (subagentlər üçün)
1. `senior-product-owner` tapşırığı seçir, acceptance criteria təsdiqləyir.
2. `senior-ui-ux-designer` ekran/komponent dizaynını verir (yeni UI-dırsa).
3. `senior-fullstack-developer` implementasiya edir, DoD ([07-roadmap.md]) yoxlayır.
4. Tapşırıq `[x]` işarələnir, audit/commit edilir.
