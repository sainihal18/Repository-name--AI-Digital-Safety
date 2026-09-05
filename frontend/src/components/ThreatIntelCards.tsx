import { motion } from 'framer-motion';
import { Wifi, WifiOff, Shield, AlertCircle, Clock } from 'lucide-react';
import type { ThreatIntelResult } from '@/types';

interface ThreatIntelCardsProps {
  results: ThreatIntelResult[];
}

function getStatusConfig(result: ThreatIntelResult) {
  const status = result.query_status?.toUpperCase();

  if (status === 'COMPLETED' || status === 'FOUND' || status === 'ACTIVE') {
    if (result.known_malicious) {
      return {
        icon: AlertCircle,
        color: '#FF0055',
        bg: 'bg-danger/10',
        border: 'border-danger/20',
        status: 'MALICIOUS',
        pulse: true,
      };
    }
    return {
      icon: Shield,
      color: '#00FF9D',
      bg: 'bg-success/10',
      border: 'border-success/20',
      status: 'CLEAN',
      pulse: false,
    };
  }

  if (status === 'UNAVAILABLE' || status === 'ERROR') {
    return {
      icon: WifiOff,
      color: '#94A3B8',
      bg: 'bg-slate-400/10',
      border: 'border-slate-400/20',
      status: 'UNAVAILABLE',
      pulse: false,
    };
  }

  return {
    icon: Wifi,
    color: '#00F0FF',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    status: status || 'PENDING',
    pulse: false,
  };
}

export default function ThreatIntelCards({ results }: ThreatIntelCardsProps) {
  if (!results || results.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Threat Intelligence</h3>
        <p className="text-xs text-slate-500">No threat intelligence data available.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Threat Intelligence</h3>
      <div className="grid gap-3">
        {results.map((result, i) => {
          const c = getStatusConfig(result);
          const Icon = c.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${c.border} ${c.bg}`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" style={{ color: c.color }} />
                {c.pulse && (
                  <motion.span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-danger"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-300">{result.source}</p>
                {result.threat_type && (
                  <p className="text-xs text-slate-500">Threat: {result.threat_type}</p>
                )}
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                style={{ color: c.color, backgroundColor: `${c.color}15` }}
              >
                {c.status}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
