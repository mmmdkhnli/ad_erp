/** Input masking köməkçiləri (Azərbaycan formatları). */

/** Azərbaycan telefon: +994 XX XXX XX XX */
export function formatAzPhone(raw: string): string {
  let d = (raw ?? "").replace(/\D/g, "");
  if (d.startsWith("994")) d = d.slice(3);
  else if (d.startsWith("0")) d = d.slice(1);
  d = d.slice(0, 9); // ölkə kodundan sonra 9 rəqəm
  if (d.length === 0) return "";
  let out = "+994";
  if (d.length > 0) out += " " + d.slice(0, 2);
  if (d.length > 2) out += " " + d.slice(2, 5);
  if (d.length > 5) out += " " + d.slice(5, 7);
  if (d.length > 7) out += " " + d.slice(7, 9);
  return out;
}

/** VÖEN — 10 rəqəm (yalnız rəqəm). */
export function formatTaxId(raw: string): string {
  return (raw ?? "").replace(/\D/g, "").slice(0, 10);
}

/** Yalnız rəqəm (ümumi). */
export function formatDigits(raw: string, maxLen?: number): string {
  const d = (raw ?? "").replace(/\D/g, "");
  return maxLen ? d.slice(0, maxLen) : d;
}
