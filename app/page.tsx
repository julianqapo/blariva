// app/page.tsx
import { MessageSquare, Bot, Library, AlertTriangle, Zap } from 'lucide-react';

const KpiCard = ({ title, value, trend, trendUp, icon, subtext, alert }: any) => (
  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.04] backdrop-blur-sm hover:border-slate-300 dark:hover:border-white/10 hover:-translate-y-1 transition-all duration-300 group shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          trendUp ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200' : 'bg-red-50 dark:bg-red-500/10 text-red-600 border-red-200'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className={`text-3xl font-bold tracking-tight ${alert ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </span>
      {subtext && <span className="text-sm font-medium text-slate-400">{subtext}</span>}
    </div>
  </div>
);

export default function OverviewScreen() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-2">Welcome back, Operator.</h1>
          <p className="text-slate-500 text-lg font-medium">System health is nominal. 3 agents require review.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm font-semibold">Generate Report</button>
          <button className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 flex items-center gap-2">
            <Zap size={16} /> Deploy Agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Queries" value="2.4M" trend="+12.5%" trendUp icon={<MessageSquare size={18} />} />
        <KpiCard title="Active Agents" value="18" subtext="4 in staging" icon={<Bot size={18} />} />
        <KpiCard title="Knowledge Coverage" value="94.2%" trend="+2.1%" trendUp icon={<Library size={18} />} />
        <KpiCard title="Unresolved Issues" value="12" alert icon={<AlertTriangle size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.04] p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-6">Agent Adoption & Usage</h3>
          <div className="h-64 flex items-end justify-between gap-2 pb-4 border-b border-slate-100 dark:border-white/5">
            {[40, 65, 45, 80, 55, 90, 70, 100, 85, 110, 95, 130].map((h, i) => (
              <div key={i} className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 dark:hover:bg-amber-500 transition-all rounded-t-md" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-4 uppercase">
            <span>Jan 01</span>
            <span>Today</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.04] p-6">
          <h3 className="text-lg font-semibold mb-6">Governance Alerts</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-500/5 dark:border-amber-500/20 text-amber-800 dark:text-amber-500 text-sm">
              <p className="font-bold">Stale Documents</p>
              <p className="text-xs opacity-80">HR Policy v2.1 not synced in 90 days.</p>
            </div>
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/5 dark:border-red-500/20 text-red-800 dark:text-red-500 text-sm">
              <p className="font-bold">Escalation Threshold</p>
              <p className="text-xs opacity-80">'Support Bot' escalated 45% today.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}