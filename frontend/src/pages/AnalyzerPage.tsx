import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, Lightbulb, MessageSquare } from 'lucide-react';
import AnalysisInput from '@/components/AnalysisInput';
import RiskGauge from '@/components/RiskGauge';
import VerdictBanner from '@/components/VerdictBanner';
import ScamDNARadar from '@/components/ScamDNARadar';
import AttackChainFlow from '@/components/AttackChainFlow';
import EvidencePanel from '@/components/EvidencePanel';
import ThreatIntelCards from '@/components/ThreatIntelCards';
import ExplainabilityBreakdown from '@/components/ExplainabilityBreakdown';
import ReportExport from '@/components/ReportExport';
import FeedbackModal from '@/components/FeedbackModal';
import { api } from '@/services/api';
import type { AnalysisReport } from '@/types';

export default function AnalyzerPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleSubmit = async (type: 'sms' | 'url' | 'image', value: string | File) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      let result;
      if (type === 'sms') {
        result = await api.analyzeSms(value as string);
      } else if (type === 'url') {
        result = await api.analyzeUrl(value as string);
      } else if (type === 'image') {
        result = await api.analyzeImage(value as File);
      }
      setReport(result as AnalysisReport);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Threat Analyzer</h1>
        <p className="text-sm text-slate-500 mt-1">Submit an SMS or URL for deep analysis</p>
      </div>

      {/* Input */}
      <AnalysisInput onSubmit={handleSubmit} loading={loading} />

      {/* Loading animation */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-10 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary mb-4"
            />
            <p className="text-sm text-slate-400">Running analysis pipeline...</p>
            <p className="text-xs text-slate-600 mt-1">Rule Engine → ML Model → Threat Intel → Risk Fusion</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 border border-danger/20"
        >
          <p className="text-sm text-danger">{error}</p>
          <p className="text-xs text-slate-500 mt-1">
            Please check your network connection or try again later.
          </p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {report && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Action bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-primary" />
                Analysis ID: <span className="text-slate-400 font-mono">{report.analysis_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <ReportExport report={report} />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFeedbackOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-surface-alt border border-border text-slate-400 hover:text-slate-200
                    hover:border-secondary/30 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Feedback
                </motion.button>
              </div>
            </div>

            {/* Verdict + Gauge row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <VerdictBanner
                  verdict={report.verdict}
                  category={report.category}
                  riskScore={report.risk_score}
                />
              </div>
              <div className="lg:col-span-1">
                <RiskGauge
                  score={report.risk_score}
                  confidence={report.confidence}
                  verdict={report.verdict}
                  size={200}
                />
              </div>
            </div>

            {/* Scam DNA + Attack Chain */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ScamDNARadar dna={report.scam_dna} />
              <AttackChainFlow steps={report.attack_chain} />
            </div>

            {/* Evidence + Explainability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <EvidencePanel
                evidence={report.evidence}
                suspiciousTerms={report.suspicious_terms}
                extractedUrls={report.extracted_urls}
              />
              {report.explainability && (
                <ExplainabilityBreakdown data={report.explainability} />
              )}
            </div>

            {/* Threat Intel */}
            {report.threat_intelligence?.length > 0 && (
              <ThreatIntelCards results={report.threat_intelligence} />
            )}

            {/* Recommendations */}
            {report.recommended_actions?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  <h3 className="text-sm font-semibold text-slate-300">Recommended Actions</h3>
                </div>
                <div className="space-y-2">
                  {report.recommended_actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Limitations */}
            {report.limitations?.length > 0 && (
              <div className="px-4 py-3 rounded-xl bg-surface-alt border border-border text-xs text-slate-500">
                <strong className="text-slate-400">Limitations:</strong>{' '}
                {report.limitations.join(' · ')}
              </div>
            )}

            {/* Model provenance */}
            <div className="flex flex-wrap gap-3 text-[10px] text-slate-600">
              <span>Model: {report.model.name} {report.model.version}</span>
              <span>•</span>
              <span>Type: {report.model.type}</span>
              <span>•</span>
              <span>Features: {report.feature_version}</span>
              <span>•</span>
              <span>Risk Engine: {report.risk_engine_version}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback modal */}
      <AnimatePresence>
        {feedbackOpen && report && (
          <FeedbackModal
            analysisId={report.analysis_id}
            onClose={() => setFeedbackOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
