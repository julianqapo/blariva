"use client";

import Link from "next/link";
import { ArrowRight, Lock, Mail, Shield, Sparkles } from "lucide-react";

export default function LoginScreenThemed() {
  return (
    <div className="min-h-screen overflow-hidden bg-[rgb(var(--bg))] text-[rgb(var(--text))] transition-colors duration-500">
      <div className="relative flex min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(var(--primary),0.14),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(var(--primary),0.08),transparent_20%)]" />
        <div className="pointer-events-none absolute top-[-160px] left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[rgba(var(--primary),0.12)] blur-[120px]" />

        <section className="relative hidden w-[46%] flex-col justify-between border-r border-[rgba(var(--border),0.18)] bg-[rgba(var(--surface),0.62)] px-10 py-10 backdrop-blur-2xl lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(var(--primary),0.78),rgba(var(--primary),1))] shadow-[0_6px_24px_rgba(0,0,0,0.18)]">
                <span className="text-lg font-bold tracking-tighter text-[rgb(var(--primary-foreground))]">
                  B
                </span>
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight text-[rgb(var(--text))]">
                  BlaRiva
                </div>
                <div className="text-xs font-medium uppercase tracking-[0.22em] text-[rgba(var(--text-muted),0.9)]">
                  Enterprise Intelligence
                </div>
              </div>
            </div>

            <div className="mt-20 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--primary),0.24)] bg-[rgba(var(--primary),0.12)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--primary))] shadow-sm backdrop-blur-md">
                <Sparkles size={13} /> Trusted by regulated teams
              </div>
              <h1 className="mt-8 text-5xl font-semibold leading-[1.02] tracking-tight text-[rgb(var(--text))]">
                Secure access for operators, analysts, and executive teams.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[rgb(var(--text-muted))]">
                Enter the BlaRiva workspace with a premium enterprise experience designed for governance, speed, and confidence.
              </p>
            </div>

            <div className="mt-12 grid gap-4">
              <FeatureCard
                icon={<Shield size={18} />}
                title="Governed access"
                text="Role-aware authentication with enterprise controls and audit-ready session handling."
              />
              <FeatureCard
                icon={<Lock size={18} />}
                title="Protected by design"
                text="Subtle security cues, calm hierarchy, and a luxurious interface that stays aligned with your app theme."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[rgba(var(--border),0.16)] bg-[rgba(var(--surface),0.74)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[rgba(var(--text-muted),0.85)]">
                  Security posture
                </p>
                <p className="mt-2 text-sm font-semibold text-[rgb(var(--text))]">
                  Enterprise Secure
                </p>
              </div>
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                All systems nominal
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <MiniStat label="SSO" value="Enabled" />
              <MiniStat label="MFA" value="Required" />
              <MiniStat label="Logs" value="Active" />
            </div>
          </div>
        </section>

        <section className="relative flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(var(--primary),0.78),rgba(var(--primary),1))] shadow-[0_6px_24px_rgba(0,0,0,0.18)]">
                  <span className="text-lg font-bold tracking-tighter text-[rgb(var(--primary-foreground))]">
                    B
                  </span>
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-tight text-[rgb(var(--text))]">
                    BlaRiva
                  </div>
                  <div className="text-xs font-medium uppercase tracking-[0.22em] text-[rgba(var(--text-muted),0.9)]">
                    Enterprise Intelligence
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[rgba(var(--border),0.16)] bg-[rgba(var(--surface),0.8)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.16)] backdrop-blur-2xl sm:p-8">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--border),0.16)] bg-[rgba(var(--surface-2),0.65)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[rgba(var(--text-muted),0.95)]">
                  <Lock size={12} className="text-[rgb(var(--primary))]" /> Private workspace access
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[rgb(var(--text))]">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm leading-6 text-[rgb(var(--text-muted))]">
                  Sign in to continue into your governed AI workspace.
                </p>
              </div>

              <form className="space-y-4">
                <InputField
                  label="Work email"
                  type="email"
                  placeholder="jane@company.com"
                  icon={<Mail size={16} />}
                />
                <InputField
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  icon={<Lock size={16} />}
                />

                <div className="flex items-center justify-between gap-3 pt-1 text-sm">
                  <label className="flex items-center gap-2 text-[rgb(var(--text-muted))]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border border-[rgba(var(--border),0.4)] bg-transparent text-[rgb(var(--primary))] focus:ring-4 focus:ring-[rgba(var(--primary),0.14)]"
                    />
                    <span>Remember me</span>
                  </label>

                  <Link
                    href="#"
                    className="font-semibold text-[rgb(var(--text))] transition-colors hover:text-[rgb(var(--primary))]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[rgb(var(--primary))] px-4 py-3.5 text-sm font-semibold text-[rgb(var(--primary-foreground))] shadow-[0_14px_32px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:brightness-110"
                >
                  Sign in
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[rgba(var(--border),0.24)]" />
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-[rgba(var(--text-muted),0.9)]">
                  Or continue with
                </span>
                <div className="h-px flex-1 bg-[rgba(var(--border),0.24)]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="rounded-2xl border border-[rgba(var(--border),0.16)] bg-[rgba(var(--surface),0.7)] px-4 py-3 text-sm font-semibold text-[rgb(var(--text))] shadow-sm transition-colors hover:bg-[rgba(var(--surface-2),0.9)]">
                  Continue with Google
                </button>
                <button className="rounded-2xl border border-[rgba(var(--border),0.16)] bg-[rgba(var(--surface),0.7)] px-4 py-3 text-sm font-semibold text-[rgb(var(--text))] shadow-sm transition-colors hover:bg-[rgba(var(--surface-2),0.9)]">
                  Continue with SSO
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-[rgb(var(--text-muted))]">
                Need access?{" "}
                <Link
                  href="#"
                  className="font-semibold text-[rgb(var(--text))] transition-colors hover:text-[rgb(var(--primary))]"
                >
                  Contact your administrator
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
};

function InputField({ label, type, placeholder, icon }: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[rgb(var(--text))]">
        {label}
      </label>
      <div className="group relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] transition-colors group-focus-within:text-[rgb(var(--primary))]">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-[rgba(var(--border),0.18)] bg-[rgba(var(--surface-2),0.72)] py-3 pl-11 pr-4 text-sm font-medium text-[rgb(var(--text))] outline-none transition-all placeholder:text-[rgba(var(--text-muted),0.8)] focus:border-[rgba(var(--primary),0.42)] focus:bg-[rgba(var(--surface),0.96)] focus:ring-4 focus:ring-[rgba(var(--primary),0.10)]"
        />
      </div>
    </div>
  );
}

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
};

function FeatureCard({ icon, title, text }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-[rgba(var(--border),0.16)] bg-[rgba(var(--surface),0.68)] p-5 shadow-sm backdrop-blur-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(var(--primary),0.24)] bg-[rgba(var(--primary),0.12)] text-[rgb(var(--primary))]">
        {icon}
      </div>
      <div className="text-sm font-semibold text-[rgb(var(--text))]">{title}</div>
      <p className="mt-2 text-sm leading-6 text-[rgb(var(--text-muted))]">{text}</p>
    </div>
  );
}

type MiniStatProps = {
  label: string;
  value: string;
};

function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="rounded-xl border border-[rgba(var(--border),0.14)] bg-[rgba(var(--surface-2),0.62)] px-3 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[rgba(var(--text-muted),0.9)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[rgb(var(--text))]">{value}</div>
    </div>
  );
}
