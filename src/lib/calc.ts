/**
 * Təklif kalkulyatoru (client + server ortaq, təmiz funksiyalar).
 * Qayda: (material + işçilik + daşınma + quraşdırma) × (1 + marja%) → sətir cəmi.
 * subtotal = Σ sətir cəmi → +ƏDV → yekun.
 */

export type LineCosts = {
  materialCost: number;
  laborCost: number;
  transportCost: number;
  installCost: number;
  marginPct: number;
};

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Sətrin xərc cəmi (marjasız). */
export function lineCost(l: LineCosts): number {
  return (
    (l.materialCost || 0) +
    (l.laborCost || 0) +
    (l.transportCost || 0) +
    (l.installCost || 0)
  );
}

/** Sətrin marja ilə yekun məbləği. */
export function lineTotal(l: LineCosts): number {
  return round2(lineCost(l) * (1 + (l.marginPct || 0) / 100));
}

export type QuoteTotals = {
  subtotal: number;
  costTotal: number;
  marginAmount: number;
  vatAmount: number;
  total: number;
};

/** Bütün təklifin cəmləri. */
export function quoteTotals(lines: LineCosts[], vatRate: number): QuoteTotals {
  const subtotal = round2(lines.reduce((s, l) => s + lineTotal(l), 0));
  const costTotal = round2(lines.reduce((s, l) => s + lineCost(l), 0));
  const marginAmount = round2(subtotal - costTotal);
  const vatAmount = round2((subtotal * (vatRate || 0)) / 100);
  const total = round2(subtotal + vatAmount);
  return { subtotal, costTotal, marginAmount, vatAmount, total };
}
