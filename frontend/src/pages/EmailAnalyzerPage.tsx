import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, AlertTriangle, ShieldCheck, Search, Activity, AlignLeft, ShieldAlert } from 'lucide-react';
import { api } from '@/services/api';
import type { EmailAnalysisResult } from '@/types';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function EmailAnalyzerPage() {
  const [rawEmail, setRawEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailAnalysisResult | null>(null);

  const analyze = async () => {
    if (!rawEmail.trim()) return;
    setLoading(true);
    try {
      const res = await api.analyzeEmail(rawEmail);
      setResult(res as any);
    } catch (e) {
      console.error(e);
      alert('Failed to analyze email headers. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'PASS') return 'text-success bg-success/10 border-success/20';
    if (status === 'FAIL') return 'text-danger bg-danger/10 border-danger/20';
    return 'text-slate-400 bg-slate-800 border-slate-700';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <RevealOnScroll>
        <div className="flex items-center gap-3 mb-2">
          <Mail className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Email Header Forensics</h1>
        </div>
        <p className="text-slate-400">Parse raw `.eml` contents or MIME headers to trace origins, detect spoofing, and verify DKIM/SPF signatures.</p>
      </RevealOnScroll>

      <div className="grid lg:grid-cols-2 gap-6">
        <RevealOnScroll delay={0.1}>
          <div className="glass-card p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-primary" />
              Input Raw Headers
            </h2>
            <textarea
              className="flex-1 w-full bg-[#0B132B]/50 border border-border rounded-xl p-4 text-sm font-mono text-slate-300 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all min-h-[300px]"
              placeholder="Paste raw email headers here...&#10;&#10;Received: from mail.example.com (mail.example.com. [192.0.2.1])&#10;Authentication-Results: mx.google.com; spf=pass...&#10;From: sender@example.com&#10;To: you@example.com&#10;Subject: Urgent Update"
              value={rawEmail}
              onChange={(e) => setRawEmail(e.target.value)}
            />
            <button
              onClick={analyze}
              disabled={loading || !rawEmail.trim()}
              className="mt-4 w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-secondary text-background hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {loading ? (
                <Activity className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Extract & Analyze
                </>
              )}
            </button>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2} direction="left">
          <div className="glass-card p-6 h-full min-h-[400px] flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Forensic Report
            </h2>

            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                <Mail className="w-12 h-12 opacity-20" />
                <p>Paste headers and run analysis to view the report.</p>
              </div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 overflow-y-auto pr-2"
              >
                {/* Meta details */}
                <div className="p-4 rounded-xl bg-surface/50 border border-border space-y-2">
                  <div className="text-sm"><span className="text-slate-500 w-20 inline-block font-mono">From:</span> {result.sender}</div>
                  <div className="text-sm"><span className="text-slate-500 w-20 inline-block font-mono">To:</span> {result.recipient}</div>
                  <div className="text-sm"><span className="text-slate-500 w-20 inline-block font-mono">Subject:</span> <span className="font-semibold text-primary">{result.subject}</span></div>
                </div>

                {/* Auth Badges */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Authentication Signatures</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${getStatusColor(result.spf_status)}`}>
                      <span className="text-xs font-bold font-mono">SPF</span>
                      {result.spf_status === 'PASS' ? <ShieldCheck className="w-5 h-5" /> : (result.spf_status === 'FAIL' ? <ShieldAlert className="w-5 h-5" /> : <span className="text-xs">{result.spf_status}</span>)}
                    </div>
                    <div className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${getStatusColor(result.dkim_status)}`}>
                      <span className="text-xs font-bold font-mono">DKIM</span>
                      {result.dkim_status === 'PASS' ? <ShieldCheck className="w-5 h-5" /> : (result.dkim_status === 'FAIL' ? <ShieldAlert className="w-5 h-5" /> : <span className="text-xs">{result.dkim_status}</span>)}
                    </div>
                    <div className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${getStatusColor(result.dmarc_status)}`}>
                      <span className="text-xs font-bold font-mono">DMARC</span>
                      {result.dmarc_status === 'PASS' ? <ShieldCheck className="w-5 h-5" /> : (result.dmarc_status === 'FAIL' ? <ShieldAlert className="w-5 h-5" /> : <span className="text-xs">{result.dmarc_status}</span>)}
                    </div>
                  </div>
                </div>

                {/* Anomalies */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Anomalies Detected</h3>
                  {result.anomalies.length > 0 ? (
                    <div className="space-y-2">
                      {result.anomalies.map((anom, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                          <span className="text-sm text-yellow-200">{anom}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-border text-sm text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-success" />
                      No obvious header anomalies detected.
                    </div>
                  )}
                </div>

                {/* Routing Hops */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Routing Hops ({result.received_hops.length})</h3>
                  <div className="space-y-2 border-l-2 border-primary/20 ml-2 pl-4 py-1">
                    {result.received_hops.length > 0 ? (
                      result.received_hops.map((hop, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                          <p className="text-xs font-mono text-slate-400 break-all bg-[#050A15]/50 p-2 rounded border border-border">
                            {hop.length > 150 ? hop.substring(0, 150) + '...' : hop}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No hop trace parsed.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
