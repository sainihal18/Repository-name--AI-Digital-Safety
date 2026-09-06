import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Cpu, Database, Globe, Key, Server,
  RefreshCw, CheckCircle, XCircle
} from 'lucide-react';
import { api } from '@/services/api';
import type { ModelInfoResponse, HealthResponse } from '@/types';

export default function SettingsPage() {
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mi, h] = await Promise.allSettled([
        api.getModelInfo(),
        api.health(),
      ]);
      if (mi.status === 'fulfilled') setModelInfo(mi.value);
      if (h.status === 'fulfilled') setHealth(h.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">System configuration and model information</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            bg-surface-alt border border-border text-slate-400 hover:text-slate-200
            hover:border-primary/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Server className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-slate-300">System Health</h2>
        </div>

        {health ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'API Status',
                ok: health.status === 'ok' || health.status === 'degraded',
                value: health.status,
              },
              { label: 'Database', ok: health.database_ok, value: health.database_ok ? 'Connected' : 'Offline' },
              { label: 'ML Models', ok: health.models_loaded, value: health.models_loaded ? 'Loaded' : 'Not Loaded' },
              { label: 'Version', ok: true, value: health.version },
            ].map(({ label, ok, value }, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-alt text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  {ok ? (
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-danger" />
                  )}
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
                <p className={`text-sm font-mono font-semibold ${ok ? 'text-success' : 'text-danger'}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            {loading ? 'Loading health status...' : 'Cannot connect to backend API.'}
          </p>
        )}
      </motion.div>

      {/* Model Information */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* SMS Model */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Cpu className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-slate-300">SMS Model</h2>
          </div>
          {modelInfo ? (
            <div className="space-y-3">
              {[
                { label: 'Name', value: modelInfo.sms_model.name },
                { label: 'Version', value: modelInfo.sms_model.version },
                { label: 'Type', value: modelInfo.sms_model.type },
                { label: 'Device', value: modelInfo.sms_model.device || 'CPU' },
              ].map(({ label, value }, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs text-primary font-mono">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">{loading ? 'Loading...' : 'Unavailable'}</p>
          )}
        </motion.div>

        {/* URL Model */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-semibold text-slate-300">URL Model</h2>
          </div>
          {modelInfo ? (
            <div className="space-y-3">
              {[
                { label: 'Name', value: modelInfo.url_model.name },
                { label: 'Version', value: modelInfo.url_model.version },
                { label: 'Type', value: modelInfo.url_model.type },
                { label: 'Device', value: modelInfo.url_model.device || 'CPU' },
              ].map(({ label, value }, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs text-accent font-mono">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">{loading ? 'Loading...' : 'Unavailable'}</p>
          )}
        </motion.div>
      </div>

      {/* Risk Engine & Features */}
      {modelInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <SettingsIcon className="w-4 h-4 text-warning" />
            <h2 className="text-sm font-semibold text-slate-300">Engine Configuration</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-xl bg-surface-alt">
              <p className="text-xs text-slate-500 mb-1">Risk Engine Version</p>
              <p className="text-sm text-warning font-mono font-semibold">{modelInfo.risk_engine_version}</p>
            </div>
            {Object.entries(modelInfo.feature_versions).map(([key, version], i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-alt">
                <p className="text-xs text-slate-500 mb-1">{key} Features</p>
                <p className="text-sm text-primary font-mono font-semibold">{version}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* API Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Key className="w-4 h-4 text-success" />
          <h2 className="text-sm font-semibold text-slate-300">API Configuration</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-xs text-slate-500">API Base URL</span>
            <span className="text-xs text-success font-mono">
              {import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-xs text-slate-500">Weight: Rules</span>
            <span className="text-xs text-accent font-mono">25%</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-xs text-slate-500">Weight: ML Model</span>
            <span className="text-xs text-primary font-mono">55%</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-xs text-slate-500">Weight: Threat Intel</span>
            <span className="text-xs text-warning font-mono">20%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
