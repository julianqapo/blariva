// app/(auth)/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BlaRiva — Sign In',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <AuthNavbar />
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}

// ── Inline auth navbar ──
import Link from 'next/link';

function AuthNavbar() {
  return (
    <nav className="w-full h-16 flex items-center justify-between px-6 md:px-12 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl sticky top-0 z-50">

      {/* Logo */}
      {/* Logo */}

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="logo-mark">
            <span className="logo-b" style={{ color: '#0A0A0A' }}>B</span>
          </div>
          <span className="font-display text-lg font-bold text-white">BlaRiva</span>

        </Link>

      {/* Nav links */}
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white shadow-[0_0_16px_rgba(245,158,11,0.3)] hover:shadow-[0_0_24px_rgba(245,158,11,0.45)] transition-all duration-200"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}