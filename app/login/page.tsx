// ============================================================
// FILE LOCATION: app/login/page.tsx
// (Create a folder called "login" inside app/, then put this file inside it)
// ============================================================

"use client";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: wire up Supabase auth
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      {/* background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="mesh-blob blob-1" style={{ opacity: 0.08 }} />
        <div className="mesh-blob blob-2" style={{ opacity: 0.06 }} />
        <div className="grid-overlay" />
      </div>

      <div className="auth-card animate-fade-in-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="logo-mark">
            <span className="logo-b">B</span>
          </div>
          <span className="font-display text-lg font-bold">BlaRiva</span>
        </div>

        <h1 className="font-display text-2xl font-black mb-1">Welcome back</h1>
        <p className="text-sm text-white/40 mb-8">
          Sign in to your workspace
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="auth-label">Email address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="auth-label" style={{ marginBottom: 0 }}>
                Password
              </label>
              <a
                href="#"
                className="text-xs text-gold/70 hover:text-gold transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <button
              type="button"
              role="switch"
              aria-checked={remember}
              onClick={() => setRemember(!remember)}
              className={`relative w-9 h-5 rounded-full border transition-all duration-200 flex items-center ${
                remember
                  ? "bg-gold border-gold"
                  : "bg-transparent border-white/20"
              }`}
            >
              <span
                className={`absolute left-0.5 w-4 h-4 rounded-full transition-transform duration-200 ${
                  remember
                    ? "translate-x-4 bg-obsidian"
                    : "translate-x-0 bg-white/30"
                }`}
              />
            </button>
            <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
              Remember me for 30 days
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 relative overflow-hidden"
            style={{ padding: "0.875rem", fontSize: "1rem" }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-gold/80 hover:text-gold transition-colors font-medium">
            Create one free
          </Link>
        </p>

        {/* Help hint */}
        <p className="text-center text-xs text-white/20 mt-4">
          Added by your admin? Just sign in — your access is already configured.
        </p>
      </div>
    </div>
  );
}