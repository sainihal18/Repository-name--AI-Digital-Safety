import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, RefreshCw, Wifi, WifiOff, Shield, AlertTriangle } from 'lucide-react';
import { api } from '@/services/api';
import type { ThreatIntelResult } from '@/types';

export default function ThreatIntelPage() {
  const [sources, setSources] = useState<ThreatIntelResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getThreatIntelStatus();
      setSources(data.sources || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch threat intelligence status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  function getStatusColor(status: string) {
    const s = status?.toUpperCase();
    if (s === 'ACTIVE' || s === 'COMPLETED' || s === 'AVAILABLE') return '#00FF9D';
    if (s === 'DEGRADED') return '#FBBF24';
    return '#94A3B8';
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Threat Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">External intelligence source status and availability</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            bg-surface-alt border border-border text-slate-400 hover:text-slate-200
            hover:border-primary/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </div>

      {/* Info banner */}
      <div className="glass-card p-5 flex items-start gap-4">
        <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">About Threat Intelligence</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The platform queries multiple external threat intelligence databases during URL analysis.
            These sources contribute a 20% weight to the final risk score through the weighted
            fusion engine. If sources are unavailable, the risk engine automatically renormalizes
            weights between the Rule Engine and ML Model.
          </p>
        </div>
      </div>

      {error && (
        <div className="glass-card p-5 border border-danger/20">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Sources grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6 h-[180px] shimmer" />
          ))}
        </div>
      ) : sources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source, i) => {
            const color = getStatusColor(source.query_status);
            const isAvailable = ['ACTIVE', 'COMPLETED', 'AVAILABLE'].includes(source.query_status?.toUpperCase());
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card glow-border p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      {isAvailable ? (
                        <Wifi className="w-5 h-5" style={{ color }} />
                      ) : (
                        <WifiOff className="w-5 h-5" style={{ color }} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">{source.source}</h3>
                      <p className="text-[10px] uppercase tracking-wider font-bold mt-0.5" style={{ color }}>
                        {source.query_status}
                      </p>
                    </div>
                  </div>
                  <span className="relative flex h-2.5 w-2.5">
                    {isAvailable && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ backgroundColor: color }}
                    />
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {source.reputation && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reputation</span>
                      <span className="text-slate-300">{source.reputation}</span>
                    </div>
                  )}
                  {source.threat_type && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Threat Type</span>
                      <span className="text-warning">{source.threat_type}</span>
                    </div>
                  )}
                  {source.timestamp && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Checked</span>
                      <span className="text-slate-400">{source.timestamp}</span>
                    </div>
                  )}
                  {source.error_status && (
                    <div className="flex items-center gap-1 mt-2 text-danger">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{source.error_status}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Shield className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No threat intelligence sources configured.</p>
        </div>
      )}

      {/* Architecture note */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Intelligence Sources</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { name: 'URLhaus', desc: 'Abuse.ch malware URL database', icon: Globe, color: '#00F0FF' },
            { name: 'Safe Browsing', desc: 'Google Safe Browsing API', icon: Shield, color: '#00FF9D' },
            { name: 'PhishTank', desc: 'Community phishing database', icon: AlertTriangle, color: '#FBBF24' },
          ].map(({ name, desc, icon: Icon, color }, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt">
              <Icon className="w-4 h-4 shrink-0" style={{ color }} />
              <div>
                <p className="text-xs font-medium text-slate-300">{name}</p>
                <p className="text-[10px] text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
