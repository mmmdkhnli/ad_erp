"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "overview", label: "Ümumi baxış" },
  { key: "concepts", label: "Anlayışlar" },
  { key: "workflow", label: "İş axını" },
  { key: "modules", label: "Modullar" },
  { key: "relations", label: "Əlaqələr & tələblər" },
  { key: "roles", label: "Rollar" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ---------- köməkçi komponentlər ---------- */

function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface p-5">
      {title && (
        <h3 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function Term({ name, tag, children }: { name: string; tag?: string; children: ReactNode }) {
  return (
    <div className="border-l-2 border-brand-soft pl-4">
      <div className="flex items-center gap-2">
        <span className="font-medium text-ink">{name}</span>
        {tag && (
          <span className="rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-muted">
            {tag}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{children}</p>
    </div>
  );
}

function Callout({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  const Icon = tone === "warn" ? TriangleAlert : CircleCheck;
  const cls =
    tone === "warn"
      ? "border-warning/40 bg-warning-soft text-warning"
      : "border-brand/30 bg-brand-soft text-brand";
  return (
    <div className={cn("flex items-start gap-2 rounded-lg border p-3 text-sm", cls)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="text-ink">{children}</div>
    </div>
  );
}

const FLOW = [
  "Lead",
  "Müştəri",
  "Təklif",
  "Sifariş",
  "İstehsalat",
  "Quraşdırma",
  "Faktura",
  "Ödəniş",
];

/* ---------- tab məzmunları ---------- */

function Overview() {
  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm leading-relaxed text-ink">
          <span className="font-medium">AdErp</span> — reklam istehsalatı şirkəti üçün vahid
          idarəetmə sistemidir. Bir sifarişi ilk müraciətdən (lead) son ödənişə qədər bütün
          mərhələlərdə izləyir: dizayn, istehsalat, quraşdırma və maliyyə — hamısı bir yerdə,
          Excel və WhatsApp-a ehtiyac olmadan.
        </p>
      </Card>

      <Card title="Sifarişin həyat dövrü">
        <div className="flex flex-wrap items-center gap-2">
          {FLOW.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-md border border-hairline bg-surface-sunken px-3 py-1.5 text-sm font-medium text-ink">
                {step}
              </span>
              {i < FLOW.length - 1 && <ArrowRight className="h-4 w-4 text-ink-faint" />}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          Hər addım əvvəlkindən yaranır və status dəyişiklikləri avtomatik qeydə alınır
          (audit jurnalı). Nömrələr avtomatik verilir: təklif <b>QUO-2026-0001</b>, sifariş{" "}
          <b>ORD-2026-0001</b>, faktura <b>INV-2026-0001</b>.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="10 modul">
          <ul className="space-y-1.5 text-sm text-ink-muted">
            <li>📊 <b className="text-ink">Dashboard</b> — ümumi vəziyyət, KPI-lar</li>
            <li>👥 <b className="text-ink">CRM</b> — müştərilər, leadlər, əlaqələr</li>
            <li>📄 <b className="text-ink">Təkliflər</b> — qiymət kalkulyatoru</li>
            <li>📦 <b className="text-ink">Sifarişlər</b> — job bag, rentabellik</li>
            <li>🏭 <b className="text-ink">İstehsalat</b> — Kanban lövhə</li>
            <li>🚚 <b className="text-ink">Quraşdırma</b> — montaj planı</li>
            <li>🗃️ <b className="text-ink">Anbar</b> — material qalığı</li>
            <li>💰 <b className="text-ink">Maliyyə</b> — faktura, ödəniş, xərc</li>
            <li>📈 <b className="text-ink">Hesabatlar</b> — analitika, CSV</li>
            <li>⚙️ <b className="text-ink">Parametrlər</b> — kataloq, istifadəçi (admin)</li>
          </ul>
        </Card>
        <Card title="Demo hesablar (parol: demo1234)">
          <ul className="space-y-1.5 text-sm text-ink-muted">
            <li><b className="text-ink">admin@admedia.az</b> — Rəhbər (hər şey)</li>
            <li><b className="text-ink">sales@admedia.az</b> — Satış (CRM, təkliflər)</li>
            <li><b className="text-ink">production@admedia.az</b> — İstehsalat</li>
            <li><b className="text-ink">finance@admedia.az</b> — Mühasib</li>
          </ul>
          <p className="mt-3 text-xs text-ink-faint">
            Hər rol yalnız icazəli menyuları görür və yalnız icazəli əməliyyatları edə bilir.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Concepts() {
  return (
    <div className="space-y-6">
      <Callout tone="warn">
        <b>Lead və Müştəri fərqi</b> — ən çox qarışdırılan iki anlayış:
        <span className="mt-1 block">
          <b>Lead</b> = hələ iş verməmiş <i>potensial</i> müştəri (maraq göstərən). <b>Müştəri</b> =
          real, qeydiyyatlı tərəf-müqabil (rekvizitləri olan). Lead uğurlu olduqda “Müştəriyə çevir”
          düyməsi ilə müştəriyə çevrilir və artıq təklif/sifariş ona bağlanır.
        </span>
      </Callout>

      <Card title="Əsas anlayışlar">
        <div className="space-y-4">
          <Term name="Lead" tag="CRM">
            Potensial müştəri. Mənbə (sayt, zəng, sərgi, tövsiyə) və status (Yeni → Əlaqə →
            Təklif verilib → Uğurlu / İtirilmiş) ilə izlənir.
          </Term>
          <Term name="Müştəri" tag="CRM">
            Real müştəri: ad, tip (fiziki/hüquqi), VÖEN, əlaqə şəxsi, telefon, ünvan. Bütün
            təkliflər, sifarişlər və dövriyyə ona bağlanır.
          </Term>
          <Term name="Əlaqə (interaction)" tag="CRM">
            Müştəri ilə zəng/görüş/email qeydi — müştəri kartının içində saxlanır.
          </Term>
          <Term name="Kommersial təklif" tag="Təkliflər">
            Müştəriyə verilən qiymət. Hər sətir 5 komponentə bölünür: <b>material + işçilik +
            daşınma + quraşdırma</b>, üstünə <b>marja %</b>, sonra <b>ƏDV 18%</b> → yekun.
          </Term>
          <Term name="Marja" tag="Qiymət">
            Xərcin üzərinə əlavə olunan qazanc faizi. Məs. 1000₼ xərc + 30% marja = 1300₼.
          </Term>
          <Term name="ƏDV" tag="Vergi">
            Əlavə Dəyər Vergisi (18%). Qiymətə əlavə olunur, müştəridən yığılıb dövlətə ödənilir —
            şirkətin qazancı deyil. Parametrlərdən dəyişdirilə bilər.
          </Term>
          <Term name="Sifariş (job bag)" tag="Sifarişlər">
            Təsdiqlənmiş təklifdən yaranan iş. Bütün istehsalat, quraşdırma, faktura və xərclər
            ona bağlanır. Status: Yeni → İcrada → Quraşdırmada → Təhvil → Bağlı.
          </Term>
          <Term name="İstehsalat tapşırığı" tag="İstehsalat">
            Sifarişin bir hissəsinin hazırlanması. Kanban lövhədə mərhələlərlə (Gözləyir → Dizayn →
            İstehsalat → Yoxlama → Hazır) sürüklənir.
          </Term>
          <Term name="Material / Anbar hərəkəti" tag="Anbar">
            Material = anbardakı xammal (vinil, akril, LED...). Hərəkət = mədaxil (alış), məxaric
            (sifarişə sərf) və ya düzəliş. Qalıq avtomatik yenilənir.
          </Term>
          <Term name="Faktura / Ödəniş / Xərc" tag="Maliyyə">
            Faktura = sifariş üçün hesab. Ödəniş = fakturaya daxil olan pul (status avtomatik:
            ödənilməyib → qismən → ödənilib). Xərc = sifariş üzrə çəkilən məsrəf.
          </Term>
          <Term name="Rentabellik" tag="Maliyyə">
            Sifariş üzrə <b>gəlir − xərc = mənfəət</b> (və marja %). Hansı işin qazanc, hansının
            zərər gətirdiyini göstərir.
          </Term>
          <Term name="Status & Audit" tag="Sistem">
            Hər obyektin mərhələsi rəngli “badge” ilə göstərilir. Bütün dəyişikliklər audit
            jurnalına yazılır (kim, nə vaxt, nə etdi).
          </Term>
        </div>
      </Card>
    </div>
  );
}

function Step({
  n,
  title,
  who,
  where,
  children,
}: {
  n: number;
  title: string;
  who: string;
  where: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand font-[family-name:var(--font-display)] text-sm font-semibold text-white">
        {n}
      </div>
      <div className="flex-1 pb-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-ink">{title}</span>
          <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-medium text-brand">
            {who}
          </span>
          <span className="text-xs text-ink-faint">{where}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{children}</p>
      </div>
    </div>
  );
}

function Workflow() {
  return (
    <div className="space-y-6">
      <Card title="Addım-addım iş axını">
        <div className="relative border-l border-hairline pl-1">
          <Step n={1} title="Lead əlavə et" who="Satış" where="CRM › Leadlər › + Yeni lead">
            Yeni maraq göstərən üçün lead yarat: ad, telefon, mənbə. Hələ müştəri deyil.
          </Step>
          <Step n={2} title="Müştəriyə çevir" who="Satış" where="Leadlər › Müştəriyə çevir">
            Lead iş verməyə hazır olduqda çevir — avtomatik müştəri kartı yaranır. (Və ya birbaşa
            CRM › Müştərilər-dən əlavə et.)
          </Step>
          <Step n={3} title="Təklif yarat" who="Satış" where="Təkliflər › + Yeni təklif">
            Müştərini seç, sətirləri əlavə et (xidmət kataloqundan). Hər sətrin xərclərini yaz —
            marja və ƏDV avtomatik hesablanır. <b>Tələb: müştəri + xidmət kataloqu olmalıdır.</b>
          </Step>
          <Step n={4} title="Göndər və təsdiqlə" who="Satış" where="Təklif › status düymələri">
            Təklifi “Göndər”, müştəri razılaşdıqda “Təsdiqlə”. Yalnız <b>təsdiqlənmiş</b> təklif
            sifarişə çevrilə bilər.
          </Step>
          <Step n={5} title="Sifarişə çevir" who="Satış" where="Təklif › Sifarişə çevir">
            Bir düymə ilə sifariş yaranır, sətirlər kopyalanır. Sifariş — işin mərkəzi (job bag).
          </Step>
          <Step n={6} title="İstehsalata sal" who="İstehsalat" where="İstehsalat › + Yeni tapşırıq">
            Sifariş üçün istehsalat tapşırıqları yarat, dəzgah və məsul təyin et, Kanban-da
            mərhələləri sürüklə.
          </Step>
          <Step n={7} title="Material sərf et" who="İstehsalat / Anbar" where="Anbar › Hərəkət">
            İstifadə olunan materialı “Məxaric” kimi qeyd et — qalıq avtomatik azalır.
          </Step>
          <Step n={8} title="Quraşdırma planla" who="İstehsalat" where="Quraşdırma › + Yeni quraşdırma">
            Obyekt ünvanı, tarix, komanda ilə montaj tapşırığı yarat; sahədə status yenilə.
          </Step>
          <Step n={9} title="Faktura və ödəniş" who="Mühasib" where="Maliyyə › + Yeni faktura">
            Sifarişdən faktura yarat, ödənişləri qeyd et — status avtomatik yenilənir. Sifariş
            xərclərini də əlavə et.
          </Step>
          <Step n={10} title="Rentabelliyi izlə" who="Rəhbər / Mühasib" where="Sifariş › Maliyyə · Hesabatlar">
            Hər sifarişin gəlir − xərc = mənfəətini gör; ümumi analitika Hesabatlar-da.
          </Step>
        </div>
      </Card>
    </div>
  );
}

const MODULES: { title: string; href: string; add: string; fields: string; rel: string }[] = [
  {
    title: "CRM — Müştərilər / Leadlər",
    href: "/crm/customers",
    add: "CRM › Müştərilər / Leadlər › + düyməsi",
    fields: "Ad, tip, VÖEN, telefon, email, ünvan (lead üçün: mənbə, status)",
    rel: "Müştəri müstəqildir; lead → müştəriyə çevrilir",
  },
  {
    title: "Təkliflər",
    href: "/quotes",
    add: "Təkliflər › + Yeni təklif (tam səhifə redaktor)",
    fields: "Müştəri, sətirlər (xidmət, say, 5 xərc komponenti, marja), ƏDV",
    rel: "Müştəri + Xidmət kataloqu tələb olunur",
  },
  {
    title: "Sifarişlər",
    href: "/orders",
    add: "Təklif səhifəsində “Sifarişə çevir” (əl ilə yaradılmır)",
    fields: "Avtomatik: nömrə, müştəri, sətirlər, məbləğ; əl ilə: deadline, status",
    rel: "Təsdiqlənmiş təklifdən yaranır",
  },
  {
    title: "İstehsalat",
    href: "/production",
    add: "İstehsalat › + Yeni tapşırıq",
    fields: "Sifariş, başlıq, mərhələ, dəzgah, məsul, deadline",
    rel: "Sifarişə bağlanır",
  },
  {
    title: "Quraşdırma",
    href: "/installations",
    add: "Quraşdırma › + Yeni quraşdırma",
    fields: "Sifariş, tip, ünvan, xəritə linki, vaxt, komanda qeydi",
    rel: "Sifarişə bağlanır",
  },
  {
    title: "Anbar",
    href: "/inventory",
    add: "Anbar › + Yeni material; sətirdə “Hərəkət”",
    fields: "Material: ad, vahid, min həd, orta maya. Hərəkət: tip, miqdar",
    rel: "Məxaric opsional olaraq sifarişə bağlanır",
  },
  {
    title: "Maliyyə",
    href: "/finance",
    add: "Maliyyə › + Yeni faktura; faktura içində “Ödəniş”; Xərclər › + Yeni xərc",
    fields: "Faktura: sifariş, məbləğ. Ödəniş: məbləğ, üsul. Xərc: kateqoriya, məbləğ",
    rel: "Faktura → sifariş; ödəniş → faktura; xərc → sifariş (opsional)",
  },
  {
    title: "Hesabatlar",
    href: "/reports",
    add: "Hesabatlar (yaratma yoxdur — yalnız analitika)",
    fields: "Tarix filtri; rentabellik, konversiya, top müştərilər; CSV export",
    rel: "Bütün modullardan oxuyur",
  },
  {
    title: "Parametrlər",
    href: "/settings/services",
    add: "Parametrlər (yalnız Rəhbər)",
    fields: "Xidmət kataloqu, istifadəçilər/rollar, audit, şirkət rekvizitləri",
    rel: "Xidmət kataloqu təkliflərdə istifadə olunur",
  },
];

function Modules() {
  return (
    <div className="space-y-3">
      {MODULES.map((m) => (
        <div key={m.title} className="rounded-lg border border-hairline bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-ink">{m.title}</h3>
            <Link href={m.href} className="text-xs text-brand hover:underline">
              Aç →
            </Link>
          </div>
          <dl className="mt-2 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[130px_1fr]">
            <dt className="text-ink-muted">Haradan əlavə</dt>
            <dd className="text-ink">{m.add}</dd>
            <dt className="text-ink-muted">Nə doldurulur</dt>
            <dd className="text-ink">{m.fields}</dd>
            <dt className="text-ink-muted">Əlaqə</dt>
            <dd className="text-ink">{m.rel}</dd>
          </dl>
        </div>
      ))}
    </div>
  );
}

const RELATIONS: { create: string; needs: string }[] = [
  { create: "Müştəri", needs: "Heç nə (birbaşa əlavə olunur) — və ya lead-dən çevrilir" },
  { create: "Təklif", needs: "① Müştəri  ② Xidmət kataloqu (ən azı 1 xidmət)" },
  { create: "Sifariş", needs: "Təsdiqlənmiş (APPROVED) təklif" },
  { create: "İstehsalat tapşırığı", needs: "Mövcud sifariş" },
  { create: "Quraşdırma", needs: "Mövcud sifariş" },
  { create: "Faktura", needs: "Mövcud sifariş" },
  { create: "Ödəniş", needs: "Mövcud faktura" },
  { create: "Material məxaric", needs: "Anbarda material (+ opsional sifariş)" },
  { create: "Xərc", needs: "Heç nə (sifariş bağlantısı opsional)" },
];

function Relations() {
  return (
    <div className="space-y-6">
      <Card title="“Əlaqə” (relation) nədir?">
        <p className="text-sm leading-relaxed text-ink-muted">
          Sistemdəki obyektlər bir-birinə bağlıdır. Məsələn, təklif <b>bir müştəriyə</b> aiddir,
          sifariş <b>bir təklifdən</b> yaranır, faktura <b>bir sifarişə</b> aiddir. Bu bağlantılara
          “əlaqə” deyilir. Ona görə obyektləri <b>düzgün ardıcıllıqla</b> yaratmaq lazımdır — əvvəl
          asılı olduğu obyekt mövcud olmalıdır.
        </p>
      </Card>

      <Card title="Nəyi yaratmaq üçün əvvəlcədən nə lazımdır?">
        <div className="overflow-hidden rounded-lg border border-hairline">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-[11px] uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-2.5 text-left">Yaratmaq istəyirsən</th>
                <th className="px-4 py-2.5 text-left">Əvvəlcədən lazımdır</th>
              </tr>
            </thead>
            <tbody>
              {RELATIONS.map((r) => (
                <tr key={r.create} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-2.5 font-medium text-ink">{r.create}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{r.needs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Callout>
        <b>Praktik məsləhət:</b> ilk dəfə işə başlayanda ardıcıllıq belədir — əvvəl{" "}
        <b>Parametrlər › Xidmət kataloqu</b>-nu doldur, sonra <b>Müştəri</b> əlavə et, yalnız bundan
        sonra <b>Təklif</b> yarat. Demo bazasında bunlar artıq hazırdır.
      </Callout>
    </div>
  );
}

const ROLES: { role: string; can: string }[] = [
  { role: "Rəhbər (admin)", can: "Hər şey + Parametrlər (kataloq, istifadəçi, audit, şirkət)" },
  { role: "Satış meneceri", can: "CRM (müştəri/lead), təkliflər (yaratma), sifarişə baxış" },
  { role: "İstehsalat rəhbəri", can: "Sifariş statusu, İstehsalat (Kanban), Anbar, Quraşdırma" },
  { role: "Mühasib", can: "Maliyyə (faktura/ödəniş/xərc), Hesabatlar, sifarişə baxış" },
];

function Roles() {
  return (
    <div className="space-y-6">
      <Card title="Rollar və icazələr (RBAC)">
        <p className="mb-4 text-sm leading-relaxed text-ink-muted">
          Hər istifadəçinin bir rolu var. Rol həm görünən menyunu, həm də edilə bilən əməliyyatları
          müəyyən edir. İcazə <b>server tərəfdə</b> yoxlanır — yəni menyunu gizlətmək kifayət deyil,
          icazəsiz əməliyyat serverdə də bloklanır.
        </p>
        <div className="overflow-hidden rounded-lg border border-hairline">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-[11px] uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-2.5 text-left">Rol</th>
                <th className="px-4 py-2.5 text-left">Nə edə bilir</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r.role} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-2.5 font-medium text-ink">{r.role}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{r.can}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Callout tone="warn">
        Digər rollar da mövcuddur (Dizayner, Quraşdırıcı, Anbardar) — onlar istehsalat/quraşdırma/
        anbar üzrə daha məhdud icazələrə malikdir və Parametrlər-dən yaradıla bilər.
      </Callout>
    </div>
  );
}

/* ---------- əsas komponent ---------- */

export function InfoGuide() {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1 border-b border-hairline">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm transition-colors",
              tab === t.key
                ? "border-brand font-medium text-brand"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview />}
      {tab === "concepts" && <Concepts />}
      {tab === "workflow" && <Workflow />}
      {tab === "modules" && <Modules />}
      {tab === "relations" && <Relations />}
      {tab === "roles" && <Roles />}
    </div>
  );
}
