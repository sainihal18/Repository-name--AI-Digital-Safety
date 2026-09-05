import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Globe, Wifi, WifiOff, Terminal, AlertTriangle, Shield, Users } from 'lucide-react';

interface HoneypotLog {
  timestamp: string;
  source_ip: string;
  source_port: number;
  protocol: string;
  username: string;
  auth_method: string;
  success: boolean;
  severity: string;
  geo: {
    country: string;
    city: string;
    isp: string;
  };
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#FF0055',
  HIGH: '#F97316',
  MEDIUM: '#FBBF24',
  LOW: '#00FF9D',
};

export default function HoneypotPage() {
  const [logs, setLogs] = useState<HoneypotLog[]>([]);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pausedRef = useRef(false);

  // Keep ref in sync
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const connect = useCallback(() => {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://127.0.0.1:8000/api/v1/honeypot/stream`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      // Auto-reconnect after 3s
      setTimeout(connect, 3000);
    };
    ws.onerror = () => ws.close();
    ws.onmessage = (event) => {
      if (pausedRef.current) return;
      try {
        const log: HoneypotLog = JSON.parse(event.data);
        setLogs(prev => [...prev.slice(-199), log]); // Keep last 200
      } catch { /* ignore parse errors */ }
    };

    return ws;
  }, []);

  useEffect(() => {
    const ws = connect();
    return () => { ws.close(); };
  }, [connect]);

  // Auto-scroll
  useEffect(() => {
    if (!paused) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, paused]);

  // Stats
  const uniqueIPs = new Set(logs.map(l => l.source_ip)).size;
  const topUsername = logs.length > 0
    ? Object.entries(
        logs.reduce((acc, l) => { acc[l.username] = (acc[l.username] || 0) + 1; return acc; }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
    : '—';
  const criticalCount = logs.filter(l => l.severity === 'CRITICAL').length;

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF0055] to-[#F97316] flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            Live Honeypot Visualizer
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time simulated SSH brute-force attack stream</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaused(!paused)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${paused ? 'border-warning/40 text-warning bg-warning/5' : 'border-border text-slate-500 hover:border-primary/30 hover:text-primary'}`}
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            onClick={() => setLogs([])}
            className="text-xs text-slate-500 hover:text-danger transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-danger/30"
          >
            Clear
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${connected ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connected ? 'Connected' : 'Reconnecting...'}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {[
          { icon: Terminal, label: 'Total Attacks', value: logs.length, color: '#00F0FF' },
          { icon: Users, label: 'Unique IPs', value: uniqueIPs, color: '#A855F7' },
          { icon: Shield, label: 'Top Target', value: topUsername, color: '#FBBF24' },
          { icon: AlertTriangle, label: 'Critical', value: criticalCount, color: '#FF0055' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-3 flex items-center gap-3">
            <stat.icon className="w-5 h-5 shrink-0" style={{ color: stat.color }} />
            <div className="min-w-0">
              <div className="text-xs text-slate-500">{stat.label}</div>
              <div className="text-sm font-bold font-mono truncate" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Terminal */}
      <div className="glass-card flex-1 flex flex-col overflow-hidden border-slate-700/30 relative">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-alt/80 border-b border-border shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28CA42]" />
          </div>
          <span className="text-xs text-slate-500 font-mono ml-2">honeypot-stream — bash</span>
          {connected && (
            <motion.div
              className="ml-auto w-2 h-2 rounded-full bg-success"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>

        {/* Log Feed */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-0.5 bg-[#0a0e1a]">
          {logs.length === 0 ? (
            <div className="text-slate-600 text-center py-10">
              {connected ? 'Waiting for attack data...' : 'Connecting to honeypot stream...'}
            </div>
          ) : (
            logs.map((log, i) => {
              const sevColor = SEVERITY_COLORS[log.severity] || '#64748B';
              const time = new Date(log.timestamp).toLocaleTimeString();
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-wrap gap-x-2 py-0.5 hover:bg-white/[0.02] px-1 rounded"
                >
                  <span className="text-slate-600">{time}</span>
                  <span style={{ color: sevColor }}>[{log.severity}]</span>
                  <span className="text-[#A855F7]">{log.protocol}</span>
                  <span className="text-slate-500">from</span>
                  <span className="text-[#00F0FF]">{log.source_ip}:{log.source_port}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-[#FBBF24]">{log.username}</span>
                  <span className="text-slate-600">({log.auth_method})</span>
                  <span className="text-danger">REJECTED</span>
                  <span className="text-slate-600 hidden sm:inline">| {log.geo.city}, {log.geo.country}</span>
                </motion.div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
