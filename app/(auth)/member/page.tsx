"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, UserCircle } from "lucide-react";
import { sendOtp } from "../auth_actions";

export default function StaffAuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlErrorMsg = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const response = await sendOtp(email, "member");

    if (response.success) {
      router.push(`/verify?email=${encodeURIComponent(email)}&role=member`);
      return;
    }

    setError(response.message || "We couldn't send the verification code. Please try again.");
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
        <div className="flex items-center gap-3 mb-8">
          <div className="logo-mark">
            <span className="logo-b">B</span>
          </div>
          <span className="font-display text-lg font-bold">BlaRiva</span>
        </div>

        <h1 className="font-display text-2xl font-black mb-1">Welcome to BlaRiva</h1>
        <p className="text-sm text-white/40 mb-8">
          Enter your work email to sign in to your workspace
        </p>

        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-8 border"
          style={{ background: "rgba(99,102,241,0.06)", borderColor: "rgba(99,102,241,0.2)" }}
        >
          <UserCircle className="w-5 h-5 shrink-0" style={{ color: "#818cf8" }} />
          <div>
            <p className="text-sm font-bold" style={{ color: "#818cf8" }}>Organization Member</p>
            <p className="text-xs text-white/40">
              Sign in to access your organization's knowledge base.
            </p>
          </div>
        </div>

        {urlErrorMsg && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 shadow-lg shadow-red-500/5 backdrop-blur-md animate-fade-in-up">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">{urlErrorMsg}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 shadow-lg shadow-red-500/5 backdrop-blur-md animate-fade-in-up">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="auth-label">Work Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              autoComplete="email"
            />
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
                Sending verification code…
              </span>
            ) : (
              "Continue with Email"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/20 mt-6 leading-relaxed">
          Your organization added you by email — just sign in and your access is ready.
        </p>

        <p className="text-center text-sm text-white/30 mt-5">
          Are you an organization admin?{" "}
          <Link href="/admin" className="text-gold/80 hover:text-gold transition-colors font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}