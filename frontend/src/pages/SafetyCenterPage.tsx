import RevealOnScroll from '@/components/RevealOnScroll';
import CyberBackground from '@/components/CyberBackground';
import { ShieldCheck, Network, Lock, BookOpen } from 'lucide-react';

export default function SafetyCenterPage() {
  return (
    <div className="relative min-h-screen text-slate-200 overflow-x-hidden pt-24 pb-32">
      <CyberBackground />
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        <RevealOnScroll direction="down" className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Safety Center</h1>
          <p className="text-lg text-slate-400 max-w-2xl">Educational resources and live advisories to keep your enterprise and personal data safe from emerging vectors.</p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 gap-8">
          
          <RevealOnScroll delay={0.1}>
            <div className="glass-card p-8 h-full">
              <ShieldCheck className="w-8 h-8 text-success mb-4" />
              <h2 className="text-2xl font-bold text-slate-200 mb-4">Latest Advisories</h2>
              <ul className="space-y-4">
                <li className="p-4 bg-surface-alt rounded-lg border-l-2 border-danger">
                  <span className="text-xs text-danger font-mono font-bold">CRITICAL</span>
                  <p className="text-sm text-slate-300 mt-1">Massive surge in fake USPS package delivery SMS phishing targeting US numbers.</p>
                </li>
                <li className="p-4 bg-surface-alt rounded-lg border-l-2 border-warning">
                  <span className="text-xs text-warning font-mono font-bold">ELEVATED</span>
                  <p className="text-sm text-slate-300 mt-1">New wave of crypto-wallet impersonation sites bypassing standard visual checks.</p>
                </li>
              </ul>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <div className="glass-card p-8 h-full">
              <BookOpen className="w-8 h-8 text-primary mb-4" />
              <h2 className="text-2xl font-bold text-slate-200 mb-4">Educational Resources</h2>
              <div className="space-y-4">
                {[
                  "Understanding Scam DNA: The 12 Psychological Dimensions",
                  "Why OTP Phishing is the Fastest Growing Threat in 2026",
                  "Anatomy of a URL: Spotting Punycode and Subdomain Spoofing"
                ].map((title, i) => (
                  <a key={i} href="#" className="block p-4 bg-surface-alt rounded-lg hover:border-primary/50 border border-transparent transition-colors group">
                    <p className="text-sm text-slate-300 group-hover:text-primary transition-colors">{title}</p>
                  </a>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.3} className="md:col-span-2">
            <div className="glass-card p-8 bg-[rgba(11,19,43,0.8)] border-primary/20">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <Network className="w-8 h-8 text-secondary mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-4">API Documentation & Integration</h2>
                  <p className="text-sm text-slate-400 mb-6">Integrate our highly accurate AI Digital Safety engine directly into your enterprise messaging platform or email gateway using our RESTful API endpoints.</p>
                  <button className="px-5 py-2.5 rounded-lg bg-surface-alt border border-slate-600 hover:border-slate-400 text-sm font-semibold transition-all">View API Docs</button>
                </div>
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="w-32 h-32 rounded-full border border-secondary border-dashed animate-[spin_20s_linear_infinite] flex items-center justify-center">
                    <Lock className="w-8 h-8 text-secondary animate-[spin_20s_linear_infinite_reverse]" />
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

        </div>
      </div>
    </div>
  );
}
