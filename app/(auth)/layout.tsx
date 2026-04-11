// app/(auth)/layout.tsx
import { PublicNavbar } from '@/components/public-navbar';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-bg h-screen overflow-hidden flex flex-col">
                  {/* ↑ was min-h-screen — changed to h-screen + overflow-hidden */}

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="mesh-blob blob-1" style={{ opacity: 0.08 }} />
        <div className="mesh-blob blob-2" style={{ opacity: 0.06 }} />
        <div className="grid-overlay" />
      </div>

      <PublicNavbar />

      <main className="relative z-10 flex-1 flex items-center justify-center overflow-hidden">
                                                              {/* ↑ overflow-hidden added */}
        {children}
      </main>
    </div>
  );
}