import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, ShieldCheck, Eye, EyeOff, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '@/services/api';

interface PasswordResult {
  score: number;
  entropy: number;
  crack_time_display: string;
  character_classes: Record<string, boolean>;
  length: number;
  breach_count: number;
  suggestions: string[];
  verdict: string;
}

const VERDICT_CONFIG: Record<string, { color: string; glow: string; bg: string }> = {
  'VERY WEAK': { color: '#FF0055', glow: 'rgba(255,0,85,0.3)', bg: 'rgba(255,0,85,0.1)' },
  'WEAK': { color: '#F97316', glow: 'rgba(249,115,22,0.3)', bg: 'rgba(249,115,22,0.1)' },
  'FAIR': { color: '#FBBF24', glow: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.1)' },
  'STRONG': { color: '#00FF9D', glow: 'rgba(0,255,157,0.3)', bg: 'rgba(0,255,157,0.1)' },
  'VERY STRONG': { color: '#00F0FF', glow: 'rgba(0,240,255,0.3)', bg: 'rgba(0,240,255,0.1)' },
};

export default function PasswordCheckerPage() {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [result, setResult] = useState<PasswordResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(async (pw: string) => {
    if (!pw) { setResult(null); return; }
    setLoading(true);
    try {
      const data = await api.analyzePassword(pw);
      setResult(data);
    } catch {
      // Fallback: offline mode — very basic local check
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced live analysis
  useEffect(() => {
    const timeout = setTimeout(() => analyze(password), 300);
    return () => clearTimeout(timeout);
  }, [password, analyze]);

  const cfg = result ? VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG['FAIR'] : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#FF0055] flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          Password Strength & Breach Checker
        </h1>
        <p className="text-sm text-slate-500 mt-1">Real-time entropy analysis, crack-time estimation, and simulated breach lookup</p>
      </div>

      {/* Input Card */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="scan-line-h opacity-30" />
        <label className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 block">
          Enter password to analyze
        </label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type a password..."
            autoComplete="off"
            className="w-full bg-surface-alt/80 border border-border rounded-xl px-4 py-3.5 pr-12 text-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all font-mono"
          />
          <button
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Strength Bar */}
        <div className="mt-4 h-2 bg-surface-alt rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{
              width: result ? `${result.score}%` : '0%',
              backgroundColor: cfg?.color || '#334155',
              boxShadow: cfg ? `0 0 20px ${cfg.glow}` : 'none',
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
        {result && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">Score: <span className="font-mono font-bold text-slate-300">{result.score}/100</span></span>
            <motion.span
              key={result.verdict}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color: cfg?.color, backgroundColor: cfg?.bg }}
            >
              {result.verdict}
            </motion.span>
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Entropy & Crack Time */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Cryptographic Analysis
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-alt/60">
                  <div className="text-xs text-slate-500 mb-1">Entropy</div>
                  <div className="text-xl font-bold font-mono" style={{ color: cfg?.color }}>
                    {result.entropy}<span className="text-xs text-slate-500 ml-1">bits</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-alt/60">
                  <div className="text-xs text-slate-500 mb-1">Length</div>
                  <div className="text-xl font-bold font-mono text-slate-200">
                    {result.length}<span className="text-xs text-slate-500 ml-1">chars</span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface-alt/60">
                <div className="text-xs text-slate-500 mb-1">Estimated Crack Time (10B guesses/sec)</div>
                <div className="text-lg font-bold font-mono" style={{ color: cfg?.color }}>
                  {result.crack_time_display}
                </div>
              </div>
            </div>

            {/* Character Classes */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Character Classes</h3>
              <div className="space-y-2">
                {Object.entries(result.character_classes).map(([cls, present]) => (
                  <div key={cls} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-alt/60">
                    <span className="text-sm text-slate-400 capitalize">{cls.replace('_', ' ')}</span>
                    {present ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Breach Check */}
            <div className={`glass-card p-5 md:col-span-2 relative overflow-hidden ${result.breach_count > 0 ? 'border-danger/30' : 'border-success/20'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${result.breach_count > 0 ? 'bg-danger/10' : 'bg-success/10'}`}>
                  {result.breach_count > 0 ? (
                    <ShieldAlert className="w-6 h-6 text-danger" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-success" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">Breach Database Check</h3>
                  {result.breach_count > 0 ? (
                    <div>
                      <p className="text-danger font-bold text-lg">
                        Found in {result.breach_count.toLocaleString()} breaches!
                      </p>
                      <p className="text-xs text-slate-500 mt-1">This password has been exposed in known data breaches. Change it immediately.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-success font-bold">No breaches found</p>
                      <p className="text-xs text-slate-500 mt-1">This password was not found in known breach databases.</p>
                    </div>
                  )}
                </div>
              </div>
              {result.breach_count > 0 && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ backgroundColor: 'rgba(255,0,85,0.05)' }}
                />
              )}
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="glass-card p-5 md:col-span-2">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {result.suggestions.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-400 p-2 rounded-lg hover:bg-surface-alt/40 transition-colors">
                      <span className="text-primary mt-0.5">▸</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!password && (
        <div className="glass-card p-10 text-center">
          <Lock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Start typing a password to see real-time strength analysis</p>
        </div>
      )}
    </div>
  );
}
