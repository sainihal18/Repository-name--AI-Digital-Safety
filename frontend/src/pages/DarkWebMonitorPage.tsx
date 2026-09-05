import { useState } from 'react';
import { Eye, ShieldAlert, CheckCircle, Search, Terminal, Database, Activity } from 'lucide-react';
import { api } from '@/services/api';
import type { DarkWebScanResult } from '@/types';
import RevealOnScroll from '@/components/RevealOnScroll';
import { motion, AnimatePresence } from 'framer-motion';

export default function DarkWebMonitorPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DarkWebScanResult | null>(null);

  const scan = async () => {
    if (!email.trim() || !email.includes('@')) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.monitorDarkWeb(email);
      setResult(res as any);
    } catch (e) {
      console.error(e);
      alert('Failed to execute dark web sweep.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <RevealOnScroll>
        <div className="flex items-center gap-3 mb-2">
          <Eye className="w-8 h-8 text-danger" />
          <h1 className="text-3xl font-bold">Dark Web Identity Monitor</h1>
        </div>
        <p className="text-slate-400">Sweep global data breaches and known paste-sites to determine if your identity has been compromised.</p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div className="glass-card p-8 bg-[#050A15]/80 border-danger/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Database className="w-32 h-32 text-danger" />
          </div>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
            <Terminal className="w-5 h-5 text-danger" />
            Initialize Sweep
          </h2>

          <div className="flex gap-4 relative z-10">
            <input 
              type="email"
              className="flex-1 bg-black/40 border border-slate-700 focus:border-danger/50 rounded-xl px-4 py-3 text-slate-200 outline-none placeholder-slate-500 font-mono"
              placeholder="Enter email address (e.g. user@example.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && scan()}
            />
            <button
              onClick={scan}
              disabled={loading || !email.includes('@')}
              className="px-8 py-3 rounded-xl font-semibold bg-danger text-white hover:bg-danger/80 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-2"
            >
              {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Sweep
            </button>
          </div>
        </div>
      </RevealOnScroll>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            {result.breach_count > 0 ? (
              <div className="glass-card p-6 border-danger/30 bg-danger/5">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert className="w-8 h-8 text-danger" />
                  <div>
                    <h3 className="text-2xl font-bold text-danger">Identity Compromised</h3>
                    <p className="text-slate-300">Found in <span className="font-bold text-white">{result.breach_count}</span> known data breaches.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {result.breaches.map((breach, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#09090b] border border-slate-800 flex flex-col md:flex-row gap-6 hover:border-danger/30 transition-colors">
                      <div className="md:w-1/4 shrink-0">
                        <div className="font-bold text-lg mb-1">{breach.title}</div>
                        <div className="text-sm font-mono text-slate-500">{breach.date}</div>
                      </div>
                      <div className="md:w-3/4">
                        <p className="text-sm text-slate-300 mb-3">{breach.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {breach.compromised_data.map((item, j) => (
                            <span key={j} className="text-xs px-2 py-1 rounded bg-danger/20 text-danger border border-danger/30 font-mono">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 border-success/30 bg-success/5 flex items-center gap-4">
                <CheckCircle className="w-12 h-12 text-success shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-success mb-1">Clear!</h3>
                  <p className="text-slate-300 text-sm">We did not find any public breach records for <span className="font-bold">{result.email}</span>. Regardless, continue using strong passwords and 2FA.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
