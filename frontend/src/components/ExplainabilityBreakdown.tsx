import { motion } from 'framer-motion';
import { Cpu, BookOpen, Zap } from 'lucide-react';
import type { Explainability } from '@/types';

interface ExplainabilityBreakdownProps {
  data: Explainability;
}

export default function ExplainabilityBreakdown({ data }: ExplainabilityBreakdownProps) {
  const bars = [
    { label: 'Rule Engine', value: data.rule_score, color: '#A855F7', icon: BookOpen },
    { label: 'ML Model', value: data.ml_score, color: '#00F0FF', icon: Cpu },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Score Breakdown</h3>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
          {data.fusion_method.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Score bars */}
      <div className="space-y-3">
        {bars.map(({ label, value, color, icon: Icon }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
              <span className="text-xs font-mono font-semibold" style={{ color }}>{value}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-active overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Threat Intel badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-alt">
        <Zap className={`w-3.5 h-3.5 ${data.threat_intel_contributed ? 'text-warning' : 'text-slate-600'}`} />
        <span className="text-xs text-slate-400">
          Threat Intel: {data.threat_intel_contributed ? (
            <span className="text-warning font-medium">Contributing</span>
          ) : (
            <span className="text-slate-600">Not available</span>
          )}
        </span>
      </div>

      {/* Flagged reasons */}
      {data.flagged_reasons.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-slate-400 mb-2">Flagged Reasons</h4>
          <div className="flex flex-wrap gap-1.5">
            {data.flagged_reasons.map((reason, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20 text-accent text-[11px]"
              >
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top ML features */}
      {data.top_ml_features.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-slate-400 mb-2">Top ML Features</h4>
          <div className="flex flex-wrap gap-1.5">
            {data.top_ml_features.map((feat, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[11px] font-mono"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
