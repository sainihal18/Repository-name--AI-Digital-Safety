import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Shield, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/services/api';

interface PortResult {
  port: number;
  service: string;
  state: 'open' | 'closed';
  risk_level: string;
}

interface ScanResponse {
  target: string;
  scanned_at: string;
  total_scanned: number;
  open_count: number;
  results: PortResult[];
}

const RISK_COLORS: Record<string, { text: string; bg: string; glow: string }> = {
  CRITICAL: { text: '#FF0055', bg: 'rgba(255,0,85,0.1)', glow: '0 0 15px rgba(255,0,85,0.3)' },
  HIGH: { text: '#F97316', bg: 'rgba(249,115,22,0.1)', glow: '0 0 15px rgba(249,115,22,0.2)' },
  MEDIUM: { text: '#FBBF24', bg: 'rgba(251,191,36,0.1)', glow: '0 0 10px rgba(251,191,36,0.15)' },
  LOW: { text: '#00FF9D', bg: 'rgba(0,255,157,0.08)', glow: 'none' },
  NONE: { text: '#64748B', bg: 'transparent', glow: 'none' },
};

export default function PortScannerPage() {
  const [target] = useState('127.0.0.1');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const [showClosed, setShowClosed] = useState(false);

  const runScan = async () => {
    setScanning(true);
    setResult(null);
    setProgress(0);

    // Simulate progress animation
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 200);

    try {
      const data = await api.scanPorts(target);
      setResult(data);
      setProgress(100);
    } catch (err: any) {
      console.error('Scan failed:', err);
    } finally {
      clearInterval(interval);
      setScanning(false);
    }
  };

  const openPorts = result?.results.filter(r => r.state === 'open') || [];
  const closedPorts = result?.results.filter(r => r.state === 'closed') || [];
  const displayed = showClosed ? result?.results || [] : openPorts;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#7000FF] flex items-center justify-center">
            <Scan className="w-5 h-5 text-white" />
          </div>
          Vulnerability Port Scanner
        </h1>
        <p className="text-sm text-slate-500 mt-1">Scan localhost ports to identify open services and potential vulnerabilities</p>
      </div>

      {/* Scan Control */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="scan-line-h opacity-30" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2 block">Target</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-surface-alt/80 border border-border rounded-xl">
              <span className="text-sm font-mono text-primary">{target}</span>
              <span className="text-xs text-slate-600">(localhost only — external scanning disabled)</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={runScan}
            disabled={scanning}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold
              bg-gradient-to-r from-primary to-secondary text-background
              shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {scanning ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</>
            ) : (
              <><Scan className="w-4 h-4" /> Start Scan</>
            )}
          </motion.button>
        </div>

        {/* Progress Bar */}
        {scanning && (
          <div className="mt-4">
            <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
                style={{ boxShadow: '0 0 20px rgba(0,240,255,0.4)' }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 text-right font-mono">{Math.round(progress)}%</p>
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Scanned', value: result.total_scanned, color: '#00F0FF' },
                { label: 'Open Ports', value: result.open_count, color: result.open_count > 0 ? '#F97316' : '#00FF9D' },
                { label: 'Closed Ports', value: result.total_scanned - result.open_count, color: '#00FF9D' },
                { label: 'Target', value: result.target, color: '#A855F7', mono: true },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-4"
                >
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className={`text-2xl font-bold ${stat.mono ? 'text-sm mt-1' : ''} font-mono`} style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">
                {showClosed ? 'All Ports' : `Open Ports (${openPorts.length})`}
              </h3>
              <button
                onClick={() => setShowClosed(!showClosed)}
                className="text-xs text-slate-500 hover:text-primary transition-colors px-3 py-1 rounded-lg border border-border hover:border-primary/30"
              >
                {showClosed ? 'Show Only Open' : `Show All (${result.total_scanned})`}
              </button>
            </div>

            {/* Port Results */}
            <div className="glass-card overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-surface-alt/50 border-b border-border text-xs text-slate-500 uppercase tracking-wider font-semibold">
                <span>Port</span>
                <span>Service</span>
                <span>Status</span>
                <span>Risk Level</span>
              </div>
              {/* Data Rows */}
              <div className="max-h-[400px] overflow-y-auto">
                {displayed.map((port, i) => {
                  const risk = RISK_COLORS[port.risk_level] || RISK_COLORS.NONE;
                  return (
                    <motion.div
                      key={port.port}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-border/50 hover:bg-surface-hover/30 transition-colors"
                      style={port.state === 'open' ? { backgroundColor: risk.bg } : {}}
                    >
                      <span className="font-mono text-sm text-slate-300">{port.port}</span>
                      <span className="text-sm text-slate-400">{port.service}</span>
                      <span className="flex items-center gap-1.5">
                        {port.state === 'open' ? (
                          <><AlertTriangle className="w-3.5 h-3.5" style={{ color: risk.text }} /><span className="text-sm font-medium" style={{ color: risk.text }}>Open</span></>
                        ) : (
                          <><CheckCircle className="w-3.5 h-3.5 text-slate-600" /><span className="text-sm text-slate-600">Closed</span></>
                        )}
                      </span>
                      <span>
                        {port.state === 'open' && port.risk_level !== 'NONE' ? (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ color: risk.text, backgroundColor: risk.bg, boxShadow: risk.glow }}
                          >
                            {port.risk_level}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Scan Timestamp */}
            <p className="text-xs text-slate-600 text-right font-mono">
              Scanned at {new Date(result.scanned_at).toLocaleTimeString()}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!result && !scanning && (
        <div className="glass-card p-10 text-center">
          <Scan className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Click "Start Scan" to probe common ports on localhost</p>
          <p className="text-xs text-slate-600 mt-1">Scans 26 well-known ports • SSH, HTTP, MySQL, Redis, and more</p>
        </div>
      )}
    </div>
  );
}
