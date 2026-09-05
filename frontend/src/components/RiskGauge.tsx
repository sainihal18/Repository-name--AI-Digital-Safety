import { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import type { Verdict } from '@/types';

interface RiskGaugeProps {
  score: number;
  confidence: number;
  verdict: Verdict;
  size?: number;
}

const VERDICT_COLORS: Record<Verdict, string> = {
  'SAFE': '#00FF9D',
  'LOW RISK': '#22D3EE',
  'UNKNOWN': '#94A3B8',
  'SUSPICIOUS': '#FBBF24',
  'HIGH RISK': '#F97316',
  'CRITICAL': '#FF0055',
};

const VERDICT_GLOW: Record<Verdict, string> = {
  'SAFE': 'rgba(0,255,157,0.3)',
  'LOW RISK': 'rgba(34,211,238,0.3)',
  'UNKNOWN': 'rgba(148,163,184,0.2)',
  'SUSPICIOUS': 'rgba(251,191,36,0.3)',
  'HIGH RISK': 'rgba(249,115,22,0.4)',
  'CRITICAL': 'rgba(255,0,85,0.5)',
};

export default function RiskGauge({ score, confidence, verdict, size = 220 }: RiskGaugeProps) {
  const springScore = useSpring(0, { stiffness: 60, damping: 20 });
  const displayScore = useTransform(springScore, (v) => Math.round(v));
  const scoreRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    springScore.set(score);
  }, [score, springScore]);

  useEffect(() => {
    const unsub = displayScore.on('change', (v) => {
      if (scoreRef.current) scoreRef.current.textContent = String(v);
    });
    return unsub;
  }, [displayScore]);

  const color = VERDICT_COLORS[verdict] || '#94A3B8';
  const glow = VERDICT_GLOW[verdict] || 'rgba(148,163,184,0.2)';
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size / 2 - 18;
  const circumference = Math.PI * r;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-6 flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 40 }}>
        <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`}>
          {/* Background arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#1E293B"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <motion.path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
          />
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = Math.PI - (tick / 100) * Math.PI;
            const x1 = cx + (r + 6) * Math.cos(angle);
            const y1 = cy - (r + 6) * Math.sin(angle);
            const x2 = cx + (r + 12) * Math.cos(angle);
            const y2 = cy - (r + 12) * Math.sin(angle);
            return (
              <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="1.5" />
            );
          })}
        </svg>
        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span ref={scoreRef} className="text-5xl font-bold font-mono" style={{ color }}>
            0
          </span>
          <span className="text-xs text-slate-500 mt-1">/ 100</span>
        </div>
      </div>

      {/* Verdict & Confidence */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-center"
      >
        <div
          className="inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider"
          style={{
            color,
            backgroundColor: `${color}15`,
            boxShadow: `0 0 20px ${glow}`,
          }}
        >
          {verdict}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-surface-hover overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <span className="text-xs text-slate-400">{confidence}% confidence</span>
        </div>
      </motion.div>
    </div>
  );
}
