// ============================================================
// FILE LOCATION: (auth)/staff/page.tsx
// ============================================================

"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// Adjust this import path to point to your actual server action file
import { signupWithMagicLink } from "../admin/db_service";

export default function StaffAuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  
  // Catch errors coming back from the /auth/callback route
  const searchParams = useSearchParams();
  const urlErrorMsg = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Pass only the email and the 'staff' role
    const response = await signupWithMagicLink(email, 'staff');

    if (response.success) {
      router.push('/verify');
    } else {
      // Catch errors that happen immediately when clicking "Send"
      alert(`Error: ${response.message}`);
      setLoading(false);
    }
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
          Sign in to your staff workspace
        </p>

        {/* Render the URL error beautifully if the callback rejected them */}
        {urlErrorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md mb-6 text-sm">
            {urlErrorMsg}
          </div>
        )}

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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 relative overflow-hidden"
            style={{ padding: "0.875rem", fontSize: "1rem" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending secure link…
              </span>
            ) : (
              "Continue with Email"
            )}
          </button>
        </form>

        {/* Help hint */}
        <p className="text-center text-xs text-white/20 mt-6">
          Added by your admin? Just sign in — your access is already configured.
        </p>

        <p className="text-center text-sm text-white/30 mt-6">
          Are you an organization admin?{" "}
          <Link href="/admin" className="text-gold/80 hover:text-gold transition-colors font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}