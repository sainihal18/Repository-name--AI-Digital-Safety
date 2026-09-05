import { motion } from 'framer-motion';
import { ArrowRight, Circle } from 'lucide-react';
import type { AttackChainStep } from '@/types';

interface AttackChainFlowProps {
  steps: AttackChainStep[];
}

const stageColors: Record<string, string> = {
  delivery: '#3B82F6',
  'social engineering': '#A855F7',
  'credential request': '#F97316',
  'data exfiltration': '#FF0055',
  'account takeover': '#FF0055',
  default: '#00F0FF',
};

function getColor(stage: string): string {
  const s = stage.toLowerCase();
  for (const [key, color] of Object.entries(stageColors)) {
    if (s.includes(key)) return color;
  }
  return stageColors.default;
}

export default function AttackChainFlow({ steps }: AttackChainFlowProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Attack Chain</h3>
        <p className="text-xs text-slate-500">No attack chain stages detected.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Attack Chain</h3>

      <div className="space-y-1">
        {steps.map((step, i) => {
          const color = getColor(step.stage);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
            >
              <div className="flex items-start gap-3">
                {/* Timeline */}
                <div className="flex flex-col items-center mt-1">
                  <div
                    className="w-3 h-3 rounded-full border-2 shrink-0"
                    style={{ borderColor: color, backgroundColor: `${color}30` }}
                  />
                  {i < steps.length - 1 && (
                    <div className="w-px h-8 mt-1" style={{ backgroundColor: `${color}30` }} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-3 min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color }}
                    >
                      Stage {i + 1}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-medium text-slate-300 truncate">{step.stage}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Threat progression arrow */}
      {steps.length > 1 && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-slate-600">
          <Circle className="w-2 h-2 text-info" fill="currentColor" />
          <span>Initial Contact</span>
          <ArrowRight className="w-3 h-3" />
          <Circle className="w-2 h-2 text-danger" fill="currentColor" />
          <span>Objective</span>
        </div>
      )}
    </motion.div>
  );
}
