import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Search, Filter, AlertTriangle, ShieldCheck, HelpCircle, Skull, X } from 'lucide-react';
import { api } from '@/services/api';
import type { AnalysisReport, Verdict } from '@/types';
import RiskGauge from '@/components/RiskGauge';
import VerdictBanner from '@/components/VerdictBanner';
import ScamDNARadar from '@/components/ScamDNARadar';
import AttackChainFlow from '@/components/AttackChainFlow';
import EvidencePanel from '@/components/EvidencePanel';

const verdictIcon: Record<Verdict, typeof ShieldCheck> = {
  'SAFE': ShieldCheck,
  'LOW RISK': ShieldCheck,
  'UNKNOWN': HelpCircle,
  'SUSPICIOUS': AlertTriangle,
  'HIGH RISK': AlertTriangle,
  'CRITICAL': Skull,
};

const verdictColor: Record<Verdict, string> = {
  'SAFE': '#00FF9D',
  'LOW RISK': '#22D3EE',
  'UNKNOWN': '#94A3B8',
  'SUSPICIOUS': '#FBBF24',
  'HIGH RISK': '#F97316',
  'CRITICAL': '#FF0055',
};

// We now pull history directly from the backend


export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<Verdict | ''>('');
  const [selected, setSelected] = useState<AnalysisReport | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getHistory();
        setAnalyses(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = analyses.filter(a => {
    const matchesSearch = !search || a.analysis_id.includes(search) || a.input_type.toLowerCase().includes(search.toLowerCase());
    const matchesVerdict = !filterVerdict || a.verdict === filterVerdict;
    return matchesSearch && matchesVerdict;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analysis History</h1>
        <p className="text-sm text-slate-500 mt-1">Browse past threat analysis reports</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or type..."
            className="w-full bg-surface-alt border border-border rounded-xl pl-10 pr-4 py-2.5
              text-sm text-slate-200 placeholder:text-slate-600
              focus:outline-none focus:border-primary/30 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
          <select
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value as Verdict | '')}
            className="bg-surface-alt border border-border rounded-xl pl-9 pr-8 py-2.5
              text-sm text-slate-300 appearance-none cursor-pointer
              focus:outline-none focus:border-primary/30 transition-colors"
          >
            <option value="">All Verdicts</option>
            <option value="SAFE">Safe</option>
            <option value="LOW RISK">Low Risk</option>
            <option value="UNKNOWN">Unknown</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="HIGH RISK">High Risk</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        <span className="text-xs text-slate-500">{filtered.length} results</span>
      </div>

      {/* Selected detail panel */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">
              Report Detail — <span className="text-primary font-mono">{selected.analysis_id}</span>
            </h3>
            <button
              onClick={() => setSelected(null)}
              className="p-1 rounded-lg hover:bg-surface-hover text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <VerdictBanner verdict={selected.verdict} category={selected.category} riskScore={selected.risk_score} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RiskGauge score={selected.risk_score} confidence={selected.confidence} verdict={selected.verdict} size={180} />
            <ScamDNARadar dna={selected.scam_dna} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AttackChainFlow steps={selected.attack_chain} />
            <EvidencePanel evidence={selected.evidence} suspiciousTerms={selected.suspicious_terms} extractedUrls={selected.extracted_urls} />
          </div>
        </motion.div>
      )}

      {/* History list */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="glass-card p-5 border border-danger/20 text-center">
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-400">No analyses found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {analyses.length === 0
              ? 'Run your first analysis in the Analyzer tab.'
              : 'No results match your current filters.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((analysis, i) => {
            const Icon = verdictIcon[analysis.verdict] || HelpCircle;
            const color = verdictColor[analysis.verdict] || '#94A3B8';
            return (
              <motion.button
                key={analysis.analysis_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(selected?.analysis_id === analysis.analysis_id ? null : analysis)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left
                  ${selected?.analysis_id === analysis.analysis_id
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border hover:border-primary/15 hover:bg-surface-hover/30'
                  }`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-300">{analysis.input_type}</span>
                    <span
                      className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                      style={{ color, backgroundColor: `${color}15` }}
                    >
                      {analysis.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">{analysis.analysis_id}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono font-semibold" style={{ color }}>{analysis.risk_score}</p>
                  <p className="text-[10px] text-slate-600">{new Date(analysis.timestamp).toLocaleDateString()}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
