import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Info, ShieldX } from 'lucide-react';
import type { Evidence, Severity } from '@/types';

interface EvidencePanelProps {
  evidence: Evidence[];
  suspiciousTerms: string[];
  extractedUrls: string[];
}

const severityConfig: Record<Severity, {
  icon: typeof AlertTriangle;
  color: string;
  bg: string;
  border: string;
}> = {
  LOW: {
    icon: Info,
    color: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/20',
  },
  MEDIUM: {
    icon: AlertCircle,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
  },
  HIGH: {
    icon: AlertTriangle,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
  },
  CRITICAL: {
    icon: ShieldX,
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/20',
  },
};

function EvidenceItem({ item, index }: { item: Evidence; index: number }) {
  const [open, setOpen] = useState(false);
  const c = severityConfig[item.severity] || severityConfig.LOW;
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border ${c.border} rounded-xl overflow-hidden`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover/50 transition-colors"
      >
        <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${c.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm text-slate-200">{item.type}</span>
          <span className={`ml-2 text-[10px] uppercase tracking-wider font-bold ${c.color}`}>
            {item.severity}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pl-14 text-xs text-slate-400 leading-relaxed">
              {item.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function EvidencePanel({ evidence, suspiciousTerms, extractedUrls }: EvidencePanelProps) {
  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-300">Evidence & Indicators</h3>

      {evidence.length === 0 ? (
        <p className="text-xs text-slate-500">No evidence indicators found.</p>
      ) : (
        <div className="space-y-2">
          {evidence.map((item, i) => (
            <EvidenceItem key={i} item={item} index={i} />
          ))}
        </div>
      )}

      {/* Suspicious terms */}
      {suspiciousTerms.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-slate-400 mb-2">Suspicious Terms</h4>
          <div className="flex flex-wrap gap-1.5">
            {suspiciousTerms.map((term, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-warning/10 border border-warning/20 text-warning text-[11px] font-mono"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Extracted URLs */}
      {extractedUrls.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-slate-400 mb-2">Extracted URLs</h4>
          <div className="space-y-1">
            {extractedUrls.map((url, i) => (
              <div
                key={i}
                className="px-3 py-1.5 rounded-lg bg-danger/5 border border-danger/10 text-xs text-danger font-mono truncate"
              >
                {url}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
