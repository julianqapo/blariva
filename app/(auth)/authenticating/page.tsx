// app/(auth)/authenticating/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { label: 'Verifying identity',       duration: 1200 },
  { label: 'Loading your workspace',   duration: 1000 },
  { label: 'Applying access rules',    duration: 900  },
  { label: 'Almost there',             duration: 700  },
];

export default function AuthenticatingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress,    setProgress]    = useState(0);
  const [done,        setDone]        = useState(false);

  // Step ticker
  useEffect(() => {
    let stepIndex = 0;
    let elapsed   = 0;
    const total   = STEPS.reduce((s, st) => s + st.duration, 0);

    const tick = () => {
      if (stepIndex >= STEPS.length) return;
      const step = STEPS[stepIndex];

      const interval = setInterval(() => {
        elapsed += 50;
        setProgress(Math.min((elapsed / total) * 100, 100));
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        stepIndex++;
        if (stepIndex < STEPS.length) {
          setCurrentStep(stepIndex);
          tick();
        } else {
          setProgress(100);
          setDone(true);
          setTimeout(() => router.push('/dashboard'), 600);
        }
      }, step.duration);
    };

    tick();
  }, [router]);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center gap-10 px-6 w-full max-w-sm mx-auto text-center">

      {/* Animated logo */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulsing ring */}
        <span
          className="absolute inline-flex h-20 w-20 rounded-full opacity-20 animate-ping"
          style={{ background: 'var(--primary)', animationDuration: '1.8s' }}
        />
        {/* Inner glow ring */}
        <span
          className="absolute inline-flex h-16 w-16 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, var(--primary), transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        {/* Logo mark */}
        <div
          className="logo-mark relative z-10 shadow-lg"
          style={{
            width: 56, height: 56, borderRadius: 16,
            boxShadow: '0 0 32px rgba(245,158,11,0.35)',
          }}
        >
          <span className="logo-b" style={{ fontSize: '1.5rem', color: '#0A0A0A' }}>B</span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2 animate-fade-in-up">
        <h1
          className="font-display text-2xl font-black tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          {done ? 'You\'re in.' : 'One moment…'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9375rem' }}>
          {done ? 'Redirecting to your dashboard' : 'Setting up your workspace'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full space-y-3">
        <div
          className="w-full h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--primary), var(--primary-hover))',
              boxShadow: '0 0 12px rgba(245,158,11,0.4)',
            }}
          />
        </div>

        {/* Step labels */}
        <div className="space-y-1.5">
          {STEPS.map((step, i) => {
            const state =
              i < currentStep  ? 'done'
              : i === currentStep ? 'active'
              : 'pending';

            return (
              <div
                key={step.label}
                className="flex items-center gap-2.5 transition-all duration-300"
                style={{
                  opacity: state === 'pending' ? 0.3 : 1,
                  transform: state === 'active' ? 'translateX(4px)' : 'translateX(0)',
                }}
              >
                {/* Status icon */}
                <div
                  className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      state === 'done'   ? 'var(--primary)' :
                      state === 'active' ? 'rgba(245,158,11,0.15)' :
                      'var(--border)',
                    border:
                      state === 'active' ? '1.5px solid var(--primary)' : 'none',
                  }}
                >
                  {state === 'done' && (
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {state === 'active' && (
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: 'var(--primary)' }}
                    />
                  )}
                </div>

                <span
                  className="text-sm font-medium"
                  style={{
                    color: state === 'done' ? 'var(--muted)' :
                           state === 'active' ? 'var(--text)' : 'var(--muted)',
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}