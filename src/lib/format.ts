/** Pul formatı: "1 234,56 ₼" (AZN). */
export function formatMoney(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : value ?? 0;
  const safe = Number.isFinite(n) ? n : 0;
  return (
    new Intl.NumberFormat("az-AZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe) + " ₼"
  );
}

/** Tarix formatı: gg.aa.iiii */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

/** Ədəd formatı (qruplaşdırma ilə). */
export function formatNumber(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : value ?? 0;
  return new Intl.NumberFormat("az-AZ").format(Number.isFinite(n) ? n : 0);
}
