import RevealOnScroll from '@/components/RevealOnScroll';
import CyberBackground from '@/components/CyberBackground';
import { Download, PieChart, Activity, ExternalLink } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="relative min-h-screen text-slate-200 pt-8 pb-10">
      {/* Intentionally using less intense background for "dashboard" areas, but we keep the theme consistent */}
      <CyberBackground />
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        <RevealOnScroll direction="down" className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Aggregate Reports</h1>
          <p className="text-sm text-slate-400">Generate and export platform intelligence data.</p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { tag: "PDF", title: "Monthly Executive Summary", date: "August 2026", icon: Download },
            { tag: "CSV", title: "Raw Threat Indicators (IoCs)", date: "Last 30 Days", icon: ExternalLink },
            { tag: "JSON", title: "Model Accuracy & Calibration", date: "Last Quarter", icon: Activity }
          ].map((report, i) => (
            <RevealOnScroll key={i} delay={i * 0.1}>
              <div className="glass-card p-6 flex flex-col items-start hover:border-primary/40 transition-colors group cursor-pointer">
                <span className="px-2 py-1 bg-surface-alt rounded text-[10px] font-mono font-bold text-slate-400 mb-4">{report.tag}</span>
                <h3 className="text-base font-bold text-slate-200 mb-1">{report.title}</h3>
                <p className="text-xs text-slate-400 mb-6">{report.date}</p>
                <div className="mt-auto w-full flex justify-end">
                  <report.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={0.3}>
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-bold">Threat Vector Distribution</h2>
            </div>
            
            <div className="h-64 w-full bg-surface-alt/50 rounded-xl border border-border flex items-center justify-center">
              {/* Placeholder for complex aggregate chart */}
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">Detailed visualization requires premium access.</p>
                <button className="px-4 py-2 rounded bg-primary/10 text-primary text-xs font-semibold border border-primary/20">Upgrade Plan</button>
              </div>
            </div>
          </div>
        </RevealOnScroll>

      </div>
    </div>
  );
}
