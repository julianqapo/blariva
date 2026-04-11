// components/public-navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home',       href: '/' },
  { label: 'Features',   href: '/#features' },
  { label: 'Use Cases',  href: '/#use-cases' },
  { label: 'Pricing',    href: '/#pricing' },
  { label: 'About',      href: '/about' },
  { label: 'Docs',       href: '/docs' },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href.replace('/#', '/'));

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || menuOpen
          ? 'bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.08]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="logo-mark">
            <span className="logo-b" style={{ color: '#0A0A0A' }}>B</span>
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            BlaRiva
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`px-3.5 py-2 rounded-lg text-sm transition-all duration-200 ${
                isActive(href)
                  ? 'text-white font-medium bg-white/[0.06]'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link href="/login"  className="btn-ghost text-sm">Sign In</Link>
          <Link href="/signup" className="btn-primary text-sm">Get Started</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0A0A0A]/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/[0.06]">
            <Link href="/login"  className="btn-ghost text-sm text-center">Sign In</Link>
            <Link href="/signup" className="btn-primary text-sm text-center">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}