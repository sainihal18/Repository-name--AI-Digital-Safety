import { useState } from 'react';
import { Shield, Mail, Link as LinkIcon, Camera, Phone, QrCode, ArrowRight, Activity, Globe, Database, Bug, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CircularRiskScore from '@/components/CircularRiskScore';
import ScamDNARadar from '@/components/ScamDNARadar';
import GlobalThreatMap from '@/components/GlobalThreatMap';

type AnalyzeTab = 'SMS' | 'URL' | 'Screenshot' | 'Email' | 'Phone' | 'QR';
const tabs: { id: AnalyzeTab; icon: React.FC<any>; label: string }[] = [
  { id: 'SMS', icon: Mail, label: 'SMS / Message' },
  { id: 'URL', icon: LinkIcon, label: 'URL' },
  { id: 'Screenshot', icon: Camera, label: 'Screenshot' },
  { id: 'Email', icon: FileText, label: 'Email' },
  { id: 'Phone', icon: Phone, label: 'Phone / Call' },
  { id: 'QR', icon: QrCode, label: 'QR Code' },
];

const mockRecent = [
  { id: 1, type: 'SMS', summary: '+91 81234 56789 (OTP 652341...)', risk: 87, verdict: 'HIGH' },
  { id: 2, type: 'URL', summary: 'http://secure-update.com/login', risk: 92, verdict: 'HIGH' },
  { id: 3, type: 'Screenshot', summary: 'WhatsApp Screenshot', risk: 85, verdict: 'HIGH' },
];

export default function DashboardHomePage() {
  const [activeTab, setActiveTab] = useState<AnalyzeTab>('SMS');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskScore, setRiskScore] = useState(0); // Start at 0

  const handleAnalyze = () => {
    if (!inputText) return;
    setIsAnalyzing(true);
    // Simulate complex analysis
    setTimeout(() => {
      setRiskScore(Math.floor(Math.random() * 40) + 55); // Random high score for demo
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      
      {/* ── TOP SECTION ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Analyze Widget */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between border-slate-700 bg-[#0B132B]/90 shadow-2xl">
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#FF0055]" />
              Analyze
            </h2>
            <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === tab.id 
                      ? 'text-[#FF0055] font-semibold border-b-2 border-[#FF0055] bg-[#FF0055]/5' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your message, URL, or data here..."
                className="w-full h-[150px] bg-[#050A15]/80 border border-slate-800 rounded-xl p-4 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[#FF0055]/50 transition-colors resize-none font-mono text-sm"
              />
              <div className="absolute bottom-4 left-4 text-xs font-mono text-slate-600">{inputText.length} / 1600</div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText}
                className="absolute bottom-4 right-4 bg-[#FF0055] hover:bg-[#FF0055]/80 text-white px-6 py-2 rounded font-bold shadow-[0_0_15px_rgba(255,0,85,0.4)] disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isAnalyzing ? <Activity className="w-4 h-4 animate-spin" /> : 'Analyze Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Risk Score Panel */}
        <div className="glass-card p-6 flex flex-col items-center justify-center border-slate-700 bg-[#0B132B]/90 relative overflow-hidden">
          <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF0055] to-transparent animate-pulse opacity-50" />
          <CircularRiskScore score={riskScore > 0 ? riskScore : 12} size={220} />
          <div className="mt-6 text-center max-w-[200px]">
            <p className="text-[10px] text-slate-500 font-mono tracking-widest">
              Risk score is an AI estimate based on analysis and threat intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION ── */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Recent Analyses */}
        <div className="lg:col-span-2 glass-card p-6 border-slate-700 bg-[#0B132B]/90">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Recent Analyses</h3>
            <button className="text-xs text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {mockRecent.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-[#050A15] border border-slate-800 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-800 text-slate-400">
                    {item.type === 'SMS' && <Mail className="w-4 h-4" />}
                    {item.type === 'URL' && <LinkIcon className="w-4 h-4" />}
                    {item.type === 'Screenshot' && <Camera className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{item.summary}</div>
                    <div className="text-xs text-slate-500">{item.type} Analysis</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#FF0055] uppercase">{item.verdict}</span>
                  <span className="text-lg font-bold text-white">{item.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Intelligence Stats */}
        <div className="lg:col-span-2 glass-card p-6 border-slate-700 bg-[#0B132B]/90 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
            <h3 className="font-bold flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Threat Intelligence</h3>
            <ArrowRight className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>
          <div className="grid grid-cols-2 gap-4 h-full pt-2">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-slate-400">Active Threats</div>
              <div className="text-3xl font-bold text-white">2,341</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm text-slate-400">New Threats (24H)</div>
              <div className="text-3xl font-bold text-primary">187</div>
            </div>
             <div className="flex flex-col gap-2">
              <div className="text-sm text-slate-400">Scam Campaigns</div>
              <div className="text-3xl font-bold text-[#FF0055]">53</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Abstract Attack Chain Nodes */}
        <div className="glass-card p-6 border-slate-700 bg-[#0B132B]/90 flex flex-col items-center">
          <h3 className="text-[#00F0FF] text-xs font-bold tracking-widest uppercase mb-1">HOW IT WORKS</h3>
          <h2 className="text-lg font-bold text-white mb-6">AI-Powered Detection</h2>
          
          <div className="flex flex-col items-center gap-[1px] w-full max-w-[200px] my-auto">
            {[
              { label: 'Input', d: 'Message, URL...', icon: CheckCircle2 },
              { label: 'Extraction', d: 'AI extracts entities', icon: Database },
              { label: 'AI Analysis', d: 'ML models analyze', icon: Bug },
              { label: 'Threat Intel', d: 'Check threat DB', icon: Globe },
              { label: 'Risk Engine', d: 'Calculate risk score', icon: Shield },
            ].map((node, i) => (
              <div key={i} className="flex items-center w-full relative">
                <div className="w-10 h-10 rounded-full border border-[#00F0FF]/50 bg-[#00F0FF]/10 flex items-center justify-center shrink-0 z-10 shadow-[0_0_15px_rgba(0,240,255,0.2)] text-[#00F0FF]">
                  <node.icon className="w-5 h-5" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-bold text-white">{node.label}</div>
                  <div className="text-[10px] text-slate-400">{node.d}</div>
                </div>
                {i < 4 && <div className="absolute left-[19px] top-[40px] w-[2px] h-[30px] bg-gradient-to-b from-[#00F0FF] to-transparent z-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Scam DNA Radar */}
        <div className="glass-card p-0 border-slate-700 bg-[#0B132B]/90 overflow-hidden">
          <ScamDNARadar />
        </div>

        {/* Attack Path & Global Map */}
        <div className="glass-card p-0 border-slate-700 bg-[#0B132B]/90 flex flex-col overflow-hidden">
          <GlobalThreatMap />
        </div>
      </div>
    </div>
  );
}
