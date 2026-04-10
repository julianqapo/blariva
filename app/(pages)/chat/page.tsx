// app/chat/page.tsx
import { Bot, ChevronDown, CheckCircle2, RefreshCcw, FileText, Send } from 'lucide-react';

export default function ChatScreen() {
  return (
    <div className="h-[calc(100vh-5rem)] flex p-6 gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex-1 flex flex-col rounded-2xl bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/[0.04] backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="h-14 border-b border-slate-200 dark:border-white/[0.04] bg-slate-50/80 dark:bg-slate-900/80 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 shadow-sm">
              <Bot size={16} className="text-amber-500" />
              <span className="text-sm font-bold">Legal & Compliance Agent</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
            <span className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Grounded mode active
            </span>
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-2 text-sm font-semibold">
            <RefreshCcw size={14} /> Clear Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex gap-4 justify-end">
            <div className="max-w-[75%] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 rounded-2xl rounded-tr-sm p-4 text-sm font-medium">
              What are our current data retention policies for EU customers?
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">JQ</div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white"><Bot size={18} /></div>
            <div className="max-w-[85%] space-y-4">
              <span className="text-sm font-bold">BlaRiva AI</span>
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.04] rounded-2xl rounded-tl-sm p-6 shadow-md text-sm leading-relaxed">
                PII must be deleted within <span className="text-amber-600 font-bold">30 days</span> of account closure. Transaction records must be kept for 5 years.
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold border border-slate-200 dark:border-white/5 flex items-center gap-2">
                  <FileText size={12} /> EU_Privacy_Policy_Q3.pdf
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-white/[0.04]">
          <div className="relative">
            <textarea rows={1} placeholder="Ask the knowledge base..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-4 pr-14 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none" />
            <button className="absolute right-2 bottom-2 w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center"><Send size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}