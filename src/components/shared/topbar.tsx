import { Search, LogOut } from "lucide-react";
import { logoutAction } from "@/server/actions/auth";
import { ROLE_LABELS } from "@/lib/constants";
import type { SessionPayload } from "@/lib/session";

export function Topbar({ user }: { user: SessionPayload }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-hairline bg-surface px-5">
      <div className="relative hidden max-w-sm flex-1 items-center sm:flex">
        <Search className="absolute left-3 h-4 w-4 text-ink-faint" />
        <input
          placeholder="Axtarış…"
          className="h-9 w-full rounded-md border border-hairline bg-surface-sunken pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-glow)]"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="text-right leading-tight">
          <div className="text-sm font-medium text-ink">{user.name}</div>
          <div className="text-xs text-ink-muted">
            {ROLE_LABELS[user.role] ?? user.role}
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft font-[family-name:var(--font-display)] text-sm font-semibold text-brand">
          {user.name.charAt(0)}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Çıxış"
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sunken hover:text-danger"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </form>
      </div>
    </header>
  );
}
