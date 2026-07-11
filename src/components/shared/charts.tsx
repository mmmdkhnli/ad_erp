import type { Tone } from "@/lib/constants";

/** Şaquli sütun qrafiki (asılılıqsız, SVG/div). */
export function MiniBars({
  data,
  format,
}: {
  data: { label: string; value: number }[];
  format: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-3" style={{ height: 160 }}>
      {data.map((d, i) => {
        const h = Math.round((d.value / max) * 130);
        return (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div className="tabular text-[10px] text-ink-muted">
              {d.value > 0 ? format(d.value) : ""}
            </div>
            <div
              className="w-full rounded-t bg-brand transition-all"
              style={{ height: Math.max(h, d.value > 0 ? 4 : 0) }}
              title={format(d.value)}
            />
            <div className="text-[11px] text-ink-muted">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/** Üfüqi paylanma zolaqları (status bölgüsü). */
export function DistBars({
  data,
}: {
  data: { label: string; value: number; tone: Tone }[];
}) {
  const total = Math.max(1, data.reduce((s, d) => s + d.value, 0));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-ink-muted">{d.label}</span>
            <span className="tabular text-ink">{d.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(d.value / total) * 100}%`,
                background: `var(--${d.tone})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
