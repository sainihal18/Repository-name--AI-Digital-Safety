import RevealOnScroll from '@/components/RevealOnScroll';
import CyberBackground from '@/components/CyberBackground';
import { Rocket, Shield, AlertTriangle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen text-slate-200 overflow-x-hidden pt-24 pb-32">
      <CyberBackground />
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
        
        <RevealOnScroll direction="down">
          <Shield className="w-16 h-16 text-primary mb-6 mx-auto" />
          <h1 className="text-5xl font-extrabold mb-6">About AI Digital Safety</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-12">
            Our mission is simple: <strong className="text-primary font-mono glow-border px-2">Analyze Before You Trust.</strong><br/><br/>
            In an era where scams, phishing, and social engineering are weaponized with artificial intelligence, traditional defenses fail. We built a platform that fights fire with fire.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2} direction="up">
          <div className="glass-card p-8 md:p-12 text-left mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Rocket className="w-6 h-6 text-secondary" />
              The Technology
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The AI Digital Safety platform leverages a multi-modal analysis pipeline. Text is processed via state-of-the-art NLP models combining TF-IDF extraction with robust Logistic Regression trained on thousands of confirmed scam patterns. URLs are sandbox-simulated and cross-checked against live intelligence from URLhaus and PhishTank. Images and screenshots pass through rigorous OCR and computer vision analysis.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every signal is then fused in our proprietary Risk Engine, outputting a highly calibrated Risk Score and a 12-dimensional Scam DNA map, revealing the exact psychological triggers attackers are attempting to use against you.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.3} direction="up">
          <div className="glass-card p-8 border-warning/30 bg-warning/5 text-left w-full">
            <h2 className="text-xl font-bold text-warning mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Enterprise Grade Reliability
            </h2>
            <p className="text-slate-400 text-sm">
              Engineered with FastAPI, React, and strict Pydantic parsing at its core. Our platform guarantees millisecond latencies, 100% test coverage on accuracy boundaries, and immutable defense pipelines.
            </p>
          </div>
        </RevealOnScroll>

      </div>
    </div>
  );
}
