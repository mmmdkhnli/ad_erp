"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Sol: brend hero (blueprint grid + ölçü xətti) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand font-[family-name:var(--font-display)] font-bold">
            A
          </div>
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
            AdErp
          </span>
        </div>

        <div className="relative">
          <div
            className="mb-6 h-2 w-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, rgba(255,255,255,.5) 0, rgba(255,255,255,.5) 1px, transparent 1px, transparent 10px)",
            }}
          />
          <h1 className="max-w-md font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight tracking-tight">
            Sifarişdən quraşdırmaya — bir sistemdə.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            Reklam istehsalatı üçün ERP: lead, təklif, sifariş, istehsalat,
            quraşdırma və maliyyə — dəqiq və izlənə bilən.
          </p>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} AdErp · Precision Workshop
        </p>
      </div>

      {/* Sağ: giriş formu */}
      <div className="flex items-center justify-center p-6">
        <form action={formAction} className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-ink">
              Daxil ol
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Hesabınıza daxil olmaq üçün məlumatları daxil edin.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@admedia.az"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>

            {state.error && (
              <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Yoxlanılır…" : "Daxil ol"}
            </Button>
          </div>

          <div className="mt-8 rounded-md border border-hairline bg-surface-sunken p-3 text-xs text-ink-muted">
            <p className="mb-1 font-medium text-ink">Demo hesablar (parol: demo1234)</p>
            admin@admedia.az · sales@admedia.az · production@admedia.az ·
            finance@admedia.az
          </div>
        </form>
      </div>
    </main>
  );
}
