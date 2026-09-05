import { motion } from 'framer-motion';
import type { Verdict } from '@/types';
import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX, AlertTriangle, Skull } from 'lucide-react';

interface VerdictBannerProps {
  verdict: Verdict;
  category: string;
  riskScore: number;
}

const config: Record<Verdict, {
  icon: typeof ShieldCheck;
  gradient: string;
  bg: string;
  border: string;
  text: string;
  glow: string;
}> = {
  'SAFE': {
    icon: ShieldCheck,
    gradient: 'from-emerald-500/20 to-cyan-500/10',
    bg: 'bg-success/10',
    border: 'border-success/30',
    text: 'text-success',
    glow: '0 0 40px rgba(0,255,157,0.15)',
  },
  'LOW RISK': {
    icon: ShieldCheck,
    gradient: 'from-cyan-500/20 to-blue-500/10',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
    text: 'text-cyan-400',
    glow: '0 0 40px rgba(34,211,238,0.15)',
  },
  'UNKNOWN': {
    icon: ShieldQuestion,
    gradient: 'from-slate-500/20 to-slate-600/10',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/30',
    text: 'text-slate-400',
    glow: '0 0 40px rgba(148,163,184,0.1)',
  },
  'SUSPICIOUS': {
    icon: AlertTriangle,
    gradient: 'from-amber-500/20 to-yellow-500/10',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning',
    glow: '0 0 40px rgba(251,191,36,0.15)',
  },
  'HIGH RISK': {
    icon: ShieldAlert,
    gradient: 'from-orange-500/20 to-red-500/10',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    text: 'text-orange-400',
    glow: '0 0 40px rgba(249,115,22,0.2)',
  },
  'CRITICAL': {
    icon: Skull,
    gradient: 'from-red-500/20 to-pink-500/10',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    text: 'text-danger',
    glow: '0 0 60px rgba(255,0,85,0.25)',
  },
};

export default function VerdictBanner({ verdict, category, riskScore }: VerdictBannerProps) {
  const c = config[verdict] || config['UNKNOWN'];
  const Icon = c.icon;
  const isCritical = verdict === 'HIGH RISK' || verdict === 'CRITICAL';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        relative overflow-hidden rounded-2xl border ${c.border}
        bg-gradient-to-r ${c.gradient} p-5
      `}
      style={{ boxShadow: c.glow }}
    >
      {/* Pulse background for critical */}
      {isCritical && (
        <motion.div
          className="absolute inset-0 bg-danger/5 rounded-2xl"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative flex items-center gap-4">
        <motion.div
          animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${c.text}`} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold ${c.text}`}>{verdict}</h3>
          <p className="text-sm text-slate-400">
            {category.replace(/_/g, ' ')} • Risk Score: {riskScore}/100
          </p>
        </div>
      </div>
    </motion.div>
  );
}
