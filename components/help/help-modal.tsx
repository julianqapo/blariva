// components/help/help-modal.tsx
'use client';

import { useEffect } from 'react';
import { Info, X } from 'lucide-react';
import type { HelpEntry } from './help-content';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: HelpEntry | undefined;
}

export function HelpModal({ isOpen, onClose, content }: HelpModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
              <Info size={20} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {content.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors shrink-0 ml-2"
            aria-label="Close guide"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {content.description}
          </p>
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Key Features
            </h3>
            <ul className="space-y-3">
              {content.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold text-sm shadow-[0_4px_15px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}