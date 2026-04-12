"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { PublicNavbar } from "@/components/public-navbar";

/* ───────────────────────────────────────────
   DATA
   ─────────────────────────────────────────── */

const STATS = [
  { value: "∞", label: "Questions / day" },
  { value: "0", label: "Training hours" },
  { value: "24/7", label: "Always available" },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: "Department Isolation",
    description:
      "Each department gets its own knowledge silo. IT staff only see IT docs. HR only sees HR content. Role-based access enforced at every level.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Instant Answers",
    description:
      "Staff ask in plain language. BlaRiva finds the answer from your documents in seconds — with source citations so they know exactly where to look.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    title: "Public Question Answering",
    description:
      "Share a public URL or QR code so clients can ask questions 24/7. No staff needed. Handle unlimited simultaneous inquiries — never lose a client again.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Duplicate Detection",
    description:
      "Upload a document and BlaRiva flags if conflicting instructions already exist elsewhere. Keep your knowledge base clean and authoritative.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "One-Click Staff Onboarding",
    description:
      "Add a staff member by email. They sign in and immediately access their authorized departments. Zero training. Zero delay. Start contributing day one.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Analytics & Search Gaps",
    description:
      "Track thumbs-up/down ratings. See unanswered questions. Know exactly which documents need updating and which departments rely on BlaRiva most.",
  },
];

const USE_CASES = [
  {
    icon: "🏢",
    title: "Corporations & Enterprises",
    body: "New hires get up to speed instantly. IT knows how to configure every system. HR policies are always at hand. Sales knows every product spec. No more knowledge locked in senior employees' heads.",
  },
  {
    icon: "🎓",
    title: "Universities & Colleges",
    body: "Students ask about enrollment, financial aid, and course requirements. Staff answer policy questions without digging through binders. Public agents handle prospective student inquiries around the clock.",
  },
  {
    icon: "🔐",
    title: "IT & Security Firms",
    body: 'Technicians ask "how to configure VPN for Client X" and get step-by-step instructions from your internal runbooks. No more senior engineers being interrupted. Faster resolution, happier clients.',
  },
  {
    icon: "🏥",
    title: "Healthcare & Clinics",
    body: "Nurses and admin staff get protocol answers instantly. Reception desks handle patient FAQs without interrupting clinical staff. Compliance documents always accessible and audit-ready.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Your Organization",
    description: "Sign up as an admin, name your organization, and define your departments in under a minute.",
  },
  {
    step: "02",
    title: "Upload Your Documents",
    description: "Drag and drop Word docs, text files, or PDFs into each department. BlaRiva processes and indexes them instantly.",
  },
  {
    step: "03",
    title: "Invite Your Team",
    description: "Add staff by email. Assign department access. They sign in and start asking questions immediately — zero training required.",
  },
  {
    step: "04",
    title: "Go Public (Optional)",
    description: "Generate a public URL and QR code so clients and visitors can ask questions 24/7 without needing an account.",
  },
];

const SIDEBAR_ITEMS = ["IT Dept", "HR", "Sales", "Legal", "Public"];

const PREVIEW_STATS = [
  { label: "Queries Today", val: "1,247", up: true },
  { label: "Satisfaction", val: "94.2%", up: true },
  { label: "Unanswered", val: "12", up: false },
];

/* ───────────────────────────────────────────
   COMPONENTS
   ─────────────────────────────────────────── */

function HeroStats() {
  return (
    <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto animate-fade-in-up animation-delay-400">
      {STATS.map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="font-display text-3xl font-black text-gold mb-1">{value}</div>
          <div className="text-xs text-white/40 uppercase tracking-widest">{label}</div>
        </div>
      ))}
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mt-20 w-full max-w-5xl mx-auto animate-float">
      <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50">
        {/* Title bar */}
        <div className="bg-card-dark px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-white/[0.05] rounded-md px-3 py-1 text-xs text-white/30 text-left">
              app.blariva.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard grid */}
        <div className="p-6 gap-4 grid grid-cols-12">
          {/* Sidebar */}
          <div className="col-span-2 space-y-2">
            <div className="h-8 rounded-lg bg-white/[0.06] shimmer" />
            {SIDEBAR_ITEMS.map((d, i) => (
              <div
                key={d}
                className={`h-7 rounded-md flex items-center px-2 gap-2 ${
                  i === 0 ? "bg-gold/10 border border-gold/20" : "bg-white/[0.03]"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-gold" : "bg-white/20"}`} />
                <div className={`h-1.5 rounded flex-1 ${i === 0 ? "bg-gold/40" : "bg-white/10"}`} />
              </div>
            ))}
          </div>

          {/* Chat area */}
          <div className="col-span-7 flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-white/10 shrink-0" />
              <div className="bg-white/[0.05] rounded-xl rounded-tl-sm p-3 flex-1">
                <div className="h-1.5 bg-white/20 rounded w-4/5 mb-2" />
                <div className="h-1.5 bg-white/15 rounded w-full mb-2" />
                <div className="h-1.5 bg-white/15 rounded w-3/5" />
                <div className="mt-3 flex gap-2">
                  <div className="h-5 rounded-full bg-sapphire/20 border border-sapphire/30 px-2 w-24" />
                  <div className="w-5 h-5 rounded bg-white/5" />
                  <div className="w-5 h-5 rounded bg-white/5" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="bg-gold/10 border border-gold/20 rounded-xl rounded-tr-sm p-3 max-w-[70%]">
                <div className="h-1.5 bg-gold/30 rounded w-full mb-2" />
                <div className="h-1.5 bg-gold/20 rounded w-2/3" />
              </div>
              <div className="w-7 h-7 rounded-full bg-gold/20 shrink-0" />
            </div>
            <div className="mt-auto flex gap-2 items-center bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
              <div className="flex-1 h-1.5 bg-white/10 rounded" />
              <div className="w-6 h-6 rounded-lg bg-gold/20 border border-gold/30" />
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="col-span-3 space-y-3">
            {PREVIEW_STATS.map(({ label, val, up }) => (
              <div key={label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
                <div className="text-[10px] text-white/30 mb-1">{label}</div>
                <div className="font-display text-lg font-bold text-white">{val}</div>
                <div className={`text-[10px] mt-0.5 ${up ? "text-emerald-400" : "text-amber-400"}`}>
                  {up ? "▲ 8% this week" : "▼ needs attention"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -inset-x-20 -bottom-10 h-40 bg-gold/5 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: (typeof FEATURES)[number]; index: number }) {
  return (
    <div className="feature-card group" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="icon-wrap mb-5 text-gold">{feature.icon}</div>
      <h3 className="font-display text-xl font-bold mb-3 group-hover:text-gold transition-colors duration-300">
        {feature.title}
      </h3>
      <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
    </div>
  );
}

function UseCaseCard({ useCase }: { useCase: (typeof USE_CASES)[number] }) {
  return (
    <div className="use-case-card group">
      <div className="flex items-start gap-5">
        <div className="use-case-icon text-2xl">{useCase.icon}</div>
        <div>
          <h3 className="font-display text-xl font-bold mb-2">{useCase.title}</h3>
          <p className="text-sm text-white/40 leading-relaxed">{useCase.body}</p>
        </div>
      </div>
    </div>
  );
}

function HowItWorksStep({ step }: { step: (typeof HOW_IT_WORKS)[number] }) {
  return (
    <div className="relative flex gap-6 group">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center font-display text-lg font-black text-gold group-hover:bg-gold/20 group-hover:border-gold/40 transition-all duration-300">
          {step.step}
        </div>
        <div className="w-px flex-1 bg-white/[0.06] mt-3" />
      </div>
      <div className="pb-12">
        <h3 className="font-display text-lg font-bold mb-2 group-hover:text-gold transition-colors duration-300">
          {step.title}
        </h3>
        <p className="text-sm text-white/40 leading-relaxed max-w-md">{step.description}</p>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   PAGE
   ─────────────────────────────────────────── */

export default function Home() {
  return (
    <main className="min-h-screen bg-obsidian text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
        <div className="grid-overlay" />
      </div>

      <PublicNavbar />

      {/* ── Hero ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-8 animate-fade-in-up">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-xs font-medium text-gold/90 tracking-widest uppercase">
            Enterprise Knowledge Intelligence
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.92] mb-6 animate-fade-in-up animation-delay-100">
          Your Organization&apos;s
          <br />
          <span className="text-gradient">Brain, Unleashed.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-2xl leading-relaxed mb-10 animate-fade-in-up animation-delay-200">
          Upload documents. Define departments. Let staff and clients ask
          questions in plain language and get instant, accurate answers — all
          from your existing knowledge base.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in-up animation-delay-300">
          <Link href="/admin" className="btn-primary btn-lg group">
            Get Started
            <svg
              className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a href="#how-it-works" className="btn-ghost btn-lg">
            See How It Works
          </a>
        </div>

        <HeroStats />
        <DashboardPreview />
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative z-10 py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70 mb-4">
              How It Works
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight">
              Up and running in
              <br />
              <span className="text-gradient">four simple steps.</span>
            </h2>
          </div>

          <div className="ml-4">
            {HOW_IT_WORKS.map((step) => (
              <HowItWorksStep key={step.step} step={step} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70 mb-4">
              Why BlaRiva
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight">
              Everything your organization needs.
              <br />
              <span className="text-white/30">Nothing it doesn&apos;t.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section id="use-cases" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70 mb-4">
              Built For
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight">
              Every organization that <span className="text-gradient">values knowledge.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {USE_CASES.map((uc) => (
              <UseCaseCard key={uc.title} useCase={uc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="cta-glass rounded-3xl p-16 border border-gold/20 relative overflow-hidden">
            <div className="cta-glow" />
            <p className="text-xs uppercase tracking-[0.3em] text-gold/70 mb-6">
              Ready to transform?
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-6">
              Stop losing clients.
              <br />
              Start using BlaRiva.
            </h2>
            <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">
              Join hundreds of organizations that eliminated training delays,
              answered every question, and grew faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin" className="btn-primary btn-lg">
                Get Started
              </Link>
              <a href="mailto:hello@blariva.com" className="btn-ghost btn-lg">
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="logo-mark logo-mark-sm">
              <span className="logo-b text-sm">B</span>
            </div>
            <span className="font-display font-bold text-white">BlaRiva</span>
            <span className="text-white/20 text-sm ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-8 text-sm text-white/30">
            {["Privacy", "Terms", "Contact", "Status"].map((l) => (
              <a key={l} href="#" className="hover:text-white transition-colors duration-200">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
