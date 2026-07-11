"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CircleCheck, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; type: ToastType; message: string };
type ToastCtx = { toast: (t: { type?: ToastType; message: string }) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function useToast(): ToastCtx {
  return useContext(Ctx) ?? { toast: () => {} };
}

let seq = 0;

const TONE: Record<ToastType, { color: string; Icon: typeof Info }> = {
  success: { color: "var(--success)", Icon: CircleCheck },
  error: { color: "var(--danger)", Icon: CircleAlert },
  info: { color: "var(--info)", Icon: Info },
};

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { color, Icon } = TONE[item.type];
  return (
    <div
      className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-hairline bg-surface p-3"
      style={{ boxShadow: "0 6px 20px rgba(16,25,40,.14)", borderLeft: `3px solid ${color}` }}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
      <p className="flex-1 text-sm text-ink">{item.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Bağla"
        className="shrink-0 text-ink-muted transition-colors hover:text-ink"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback<ToastCtx["toast"]>(
    ({ type = "info", message }) => {
      const id = ++seq;
      setItems((prev) => [...prev, { id, type, message }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div
        className={cn(
          "pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2",
        )}
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}
