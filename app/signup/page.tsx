// ============================================================
// FILE LOCATION: app/signup/page.tsx
// (Create a folder called "signup" inside app/, then put this file inside it)
// ============================================================

"use client";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <div className="fixed inset-0 pointer-events-none">
        <div className="mesh-blob blob-1" style={{ opacity: 0.08 }} />
        <div className="mesh-blob blob-2" style={{ opacity: 0.06 }} />
        <div className="grid-overlay" />
      </div>

      <div className="auth-card animate-fade-in-up" style={{ maxWidth: 480 }}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="logo-mark">
            <span className="logo-b">B</span>
          </div>
          <span className="font-display text-lg font-bold">BlaRiva</span>
        </div>

        <h1 className="font-display text-2xl font-black mb-1">
          Start for free
        </h1>
        <p className="text-sm text-white/40 mb-8">
          Set up your workspace in under 2 minutes
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="auth-label">Organization</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Acme Corp"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="auth-label">Work Email</label>
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
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {/* Strength meter */}
            {password.length > 0 && (
              <div className="mt-2 flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-0.5 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        password.length > i * 3
                          ? password.length < 6
                            ? "#ef4444"
                            : password.length < 10
                            ? "#f59e0b"
                            : "#10b981"
                          : "rgba(255,255,255,0.1)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
            style={{ padding: "0.875rem", fontSize: "1rem" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating workspace…
              </span>
            ) : (
              "Create Free Account"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/20 mt-6 leading-relaxed">
          By signing up, you agree to our{" "}
          <a href="#" className="text-gold/50 hover:text-gold/80">Terms</a> and{" "}
          <a href="#" className="text-gold/50 hover:text-gold/80">Privacy Policy</a>.
        </p>

        <p className="text-center text-sm text-white/30 mt-5">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-gold/80 hover:text-gold transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}