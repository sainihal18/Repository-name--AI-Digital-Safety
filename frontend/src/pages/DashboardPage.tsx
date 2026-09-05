import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, Shield, AlertTriangle, HelpCircle, Search,
  TrendingUp, Activity, Scan
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import StatCard from '@/components/StatCards';
import { api } from '@/services/api';
import type { StatisticsResponse } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  PHISHING: '#FF0055',
  FINANCIAL_SCAM: '#F97316',
  MALWARE: '#A855F7',
  SPAM: '#FBBF24',
  SAFE: '#00FF9D',
  UNCATEGORIZED: '#94A3B8',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getSystemStats();
        setStats(data);
      } catch {
        // API might be offline
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryData = stats?.top_categories
    ? Object.entries(stats.top_categories).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
        color: CATEGORY_COLORS[name] || '#64748B',
      }))
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Bento Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time modular threat intelligence (Press Cmd+K to navigate)</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/analyze')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-primary to-secondary text-background
            shadow-lg shadow-primary/20 group"
        >
          <Search className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          New Analysis
        </motion.button>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min relative">

        {/* Huge Hero Stat (Spans 2 cols, 2 rows) */}
        {loading ? (
             <div className="glass-card md:col-span-2 lg:col-span-2 md:row-span-2 p-8 shimmer min-h-[240px]" />
        ) : stats ? (
          <div className="glass-card md:col-span-2 lg:col-span-2 md:row-span-2 p-8 relative overflow-hidden flex flex-col justify-between min-h-[240px] group border-primary/20">
            <div className="scan-line-h group-hover:opacity-100 opacity-50" />
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-slate-400 font-medium mb-1 flex items-center gap-2">
                  <Scan className="w-4 h-4 text-primary" /> Total Scanned Vectors
                </h2>
                <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tighter">
                  {stats.total_scans.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 p-4 rounded-xl bg-surface-alt/50">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold block mb-1">SMS Models</span>
                <span className="text-xl font-bold text-slate-200">{stats.sms_scans}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold block mb-1">URL Models</span>
                <span className="text-xl font-bold text-slate-200">{stats.url_scans}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card md:col-span-2 md:row-span-2 p-8 text-center" />
        )}

        {/* Small Stats (Span 1) */}
        {stats && (
          <>
            <div className="glass-card p-5 relative overflow-hidden group">
              <div className="scan-line-v opacity-30 group-hover:opacity-80" />
              <AlertTriangle className="w-6 h-6 text-[#FF0055] mb-4" />
              <div className="text-3xl font-black text-slate-200">{stats.high_risk_count}</div>
              <div className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Critical Threats</div>
            </div>
            
            <div className="glass-card p-5 relative overflow-hidden group">
              <Shield className="w-6 h-6 text-[#FBBF24] mb-4" />
              <div className="text-3xl font-black text-slate-200">{stats.suspicious_count}</div>
              <div className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Suspicious</div>
            </div>
  
            <div className="glass-card p-5 lg:col-span-2 flex flex-row items-center justify-between border-secondary/20 bg-secondary/5 relative overflow-hidden">
               <div className="scan-line-v opacity-50" style={{ animationDuration: '6s' }} />
               <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-1">Global Fusion Risk Average</h3>
                  <div className="text-4xl font-extrabold text-[#A855F7] tracking-tighter drop-shadow-md">
                    {stats.average_risk_score.toFixed(1)} <span className="text-lg text-slate-600 font-mono">/ 100</span>
                  </div>
               </div>
               <TrendingUp className="w-12 h-12 text-[#A855F7]/30" />
            </div>
          </>
        )}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category breakdown (Span 2) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 md:col-span-3 lg:col-span-2 flex flex-col sm:flex-row items-center"
        >
          {categoryData.length > 0 ? (
            <>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(11,19,43,0.95)',
                      border: '1px solid #1E293B',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-3 sm:mt-0 flex-1 ml-0 sm:ml-4 flex flex-col justify-center">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Threat Typology</h3>
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-surface-alt/60 hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}` }} />
                      <span className="text-slate-300 font-medium">{cat.name}</span>
                    </div>
                    <span className="text-slate-200 font-mono">{cat.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 mt-4">No category data yet.</p>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 lg:col-span-1"
        >
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Analyze SMS', desc: 'Check a suspicious text message', icon: Search, color: '#00F0FF', to: '/analyze' },
              { label: 'Analyze URL', desc: 'Inspect a suspicious link', icon: BarChart3, color: '#A855F7', to: '/analyze' },
              { label: 'View History', desc: 'Browse past analysis reports', icon: Activity, color: '#00FF9D', to: '/history' },
              { label: 'Threat Intel', desc: 'Check intelligence source status', icon: Shield, color: '#FBBF24', to: '/threat-intel' },
            ].map(({ label, desc, icon: Icon, color, to }, i) => (
              <button
                key={i}
                onClick={() => navigate(to)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border
                  hover:border-primary/20 hover:bg-surface-hover/50 transition-all text-left group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-300">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* System status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5 lg:col-span-1"
        >
          <h3 className="text-sm font-semibold text-slate-300 mb-4">System Info</h3>
          <div className="space-y-3">
            {[
              { label: 'Platform Version', value: '2.0.0', color: '#00F0FF' },
              { label: 'Risk Engine', value: 'v3.0 weighted fusion', color: '#A855F7' },
              { label: 'SMS Model', value: 'TF-IDF + LogReg', color: '#00FF9D' },
              { label: 'URL Model', value: 'Random Forest', color: '#FBBF24' },
              { label: 'Scam DNA', value: '12 dimensions', color: '#FF0055' },
            ].map(({ label, value, color }, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-xs font-mono font-medium" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>

          {stats && (
            <div className="mt-4 p-3 rounded-xl bg-surface-alt">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <HelpCircle className="w-3 h-3" />
                Feedback Summary
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">False Positive</span>
                  <p className="text-warning font-mono font-semibold">{stats.false_positive_feedback}</p>
                </div>
                <div>
                  <span className="text-slate-500">False Negative</span>
                  <p className="text-danger font-mono font-semibold">{stats.false_negative_feedback}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
