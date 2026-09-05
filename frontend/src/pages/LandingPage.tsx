import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Activity, ArrowRight, Zap, Target, Lock, Shield, Database, Terminal, Scan, Globe, Mail } from 'lucide-react';
import RevealOnScroll from '@/components/RevealOnScroll';
import CyberBackground from '@/components/CyberBackground';
import CyberResourcesSection from '@/components/CyberResourcesSection';

const slides = [
  { id: 'hero', title: 'Home' },
  { id: 'threats', title: 'Threat Landscape' },
  { id: 'features', title: 'Platform Features' },
  { id: 'demo', title: 'How It Works' },
  { id: 'darkllm', title: 'Dark LLMs & AI Attacks' },
  { id: 'resources', title: 'Resources & Open Source' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  // Set cyber-layout to html/body for full screen snap behavior
  useEffect(() => {
    document.documentElement.classList.add('cyber-layout');
    document.body.classList.add('cyber-layout');
    return () => {
      document.documentElement.classList.remove('cyber-layout');
      document.body.classList.remove('cyber-layout');
    };
  }, []);

  // Sync scroll position with active slide dot
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const slideHeight = window.innerHeight;
    const scrollY = e.currentTarget.scrollTop;
    const newSlide = Math.round(scrollY / slideHeight);
    if (newSlide !== activeSlide && newSlide >= 0 && newSlide < slides.length) {
      setActiveSlide(newSlide);
    }
  };

  const scrollToSlide = (index: number) => {
    const container = document.getElementById('slides-container');
    if (container) {
      container.scrollTo({ top: index * window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen w-full text-slate-200 overflow-hidden bg-background">
      <CyberBackground />
      
      {/* Background layer 2: Hero Background image blending */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 mix-blend-screen bg-cover bg-center pointer-events-none opacity-20`}
        style={{ backgroundImage: 'url(/src/assets/cyber-hero-bg.png)' }}
      />
      
      {/* Navbar overlay */}
      <nav className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-12 z-50 bg-background/60 backdrop-blur-xl border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF0055] to-[#00F0FF] flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-wider text-white">AI DIGITAL SAFETY</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
          <button onClick={() => scrollToSlide(0)} className="hover:text-white transition-colors">Home</button>
          <button onClick={() => scrollToSlide(1)} className="hover:text-white transition-colors">Analyze</button>
          <button onClick={() => scrollToSlide(2)} className="hover:text-white transition-colors">Threat Intelligence</button>
          <button onClick={() => scrollToSlide(3)} className="hover:text-white transition-colors">Safety Center</button>
          <button onClick={() => scrollToSlide(5)} className="hover:text-white transition-colors">Reports</button>
          <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-lg text-sm font-bold bg-[#FF0055] text-white hover:bg-[#FF0055]/80 transition-colors shadow-[0_0_15px_rgba(255,0,85,0.3)]">Get Started</button>
        </div>
      </nav>

      {/* Side Navigation Dots */}
      <div className="slide-dots hidden md:flex">
        {slides.map((slide, idx) => (
          <div 
            key={idx}
            className={`slide-dot ${activeSlide === idx ? 'active' : ''}`}
            onClick={() => scrollToSlide(idx)}
            title={slide.title}
          />
        ))}
      </div>

      {/* Main Slides Container */}
      <div 
        id="slides-container"
        className="cyber-slides-container absolute inset-0 z-10"
        onScroll={handleScroll}
      >
        {/* ── SLIDE 1: HERO (SOC HACKER HUD) ── */}
        <section className="cyber-slide flex flex-col justify-between px-6 pt-24 pb-12 relative overflow-hidden">
          {/* Custom SOC Hacker Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center pointer-events-none mix-blend-screen opacity-100" 
            style={{ backgroundImage: 'url(/src/assets/hacker_hero_bg.png)' }} 
          />
          {/* Gradient masking for the text on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />

          {/* Floating Threat Markers */}
          <div className="absolute inset-0 pointer-events-none">
            <RevealOnScroll delay={0.5} duration={1}>
              <div className="absolute top-[25%] left-[40%] text-[#FF0055] text-xs font-bold tracking-widest uppercase cyber-text-glow bg-[#FF0055]/10 px-2 py-1 rounded border border-[#FF0055]/20 animate-pulse">
                PHISHING DETECTED
              </div>
              <div className="absolute top-[35%] right-[25%] text-[#FF0055] text-xs font-bold tracking-widest uppercase cyber-text-glow bg-[#FF0055]/10 px-2 py-1 rounded border border-[#FF0055]/20 animate-pulse delay-100">
                MALICIOUS URL
              </div>
              <div className="absolute bottom-[40%] left-[35%] text-[#FF0055] text-xs font-bold tracking-widest uppercase cyber-text-glow bg-[#FF0055]/10 px-2 py-1 rounded border border-[#FF0055]/20 animate-pulse delay-200">
                SCAM SMS
              </div>
              <div className="absolute bottom-[30%] right-[30%] text-[#FF0055] text-xs font-bold tracking-widest uppercase cyber-text-glow bg-[#FF0055]/10 px-2 py-1 rounded border border-[#FF0055]/20 animate-pulse delay-300">
                OTP FRAUD
              </div>
            </RevealOnScroll>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="max-w-xl">
              <RevealOnScroll direction="right" duration={0.8}>
                <div className="text-secondary text-sm font-bold tracking-wider uppercase mb-6 opacity-80">
                  AI-Powered Scam Detection & Threat Intelligence Platform
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={0.1} duration={0.8} direction="right">
                <h1 className="text-6xl md:text-[5rem] font-extrabold tracking-tight mb-8 leading-[1]">
                  ANALYZE <br />
                  BEFORE YOU <br />
                  <span className="text-[#FF0055] cyber-text-glow">TRUST.</span>
                </h1>
              </RevealOnScroll>

              <RevealOnScroll delay={0.2} duration={0.8} direction="right">
                <p className="text-lg text-slate-400 mb-10 max-w-md">
                  Detect scams, phishing, and malicious threats before they cause harm.
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={0.3} direction="up" className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/analyze')}
                  className="px-8 py-3 rounded-md text-sm font-bold bg-[#FF0055] text-white hover:bg-[#FF0055]/80 transition-colors shadow-[0_0_20px_rgba(255,0,85,0.4)]"
                >
                  Analyze Now
                </button>
                <button 
                  onClick={() => scrollToSlide(2)}
                  className="px-8 py-3 rounded-md text-sm font-bold border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition-colors"
                >
                  How It Works
                </button>
              </RevealOnScroll>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="relative z-10 max-w-7xl mx-auto w-full pb-8">
            <RevealOnScroll delay={0.4} direction="up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Activity, val: '10,000+', lbl: 'Tests Completed Successfully', col: 'text-[#00F0FF]' },
                  { icon: Scan, val: '847', lbl: 'Suspicious URLs Flagged', col: 'text-[#00F0FF]' },
                  { icon: Mail, val: '1,290', lbl: 'Scam Messages Identified', col: 'text-[#FF0055]' },
                  { icon: Zap, val: '98.7%', lbl: 'Detection Accuracy AI Model', col: 'text-[#00FF9D]' },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-4 flex items-center gap-4 bg-[#0B132B]/80 hover:bg-[#0B132B] transition-colors border border-slate-800">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 shrink-0">
                      <stat.icon className={`w-5 h-5 ${stat.col}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stat.val}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest">{stat.lbl}</div>
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ── SLIDE 2: THREAT LANDSCAPE ── */}
        <section className="cyber-slide flex flex-col justify-center items-center px-6 relative">
           <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-screen" style={{ backgroundImage: 'url(/src/assets/cyber-threat-pattern.png)', backgroundSize: '150px' }} />
           
           <RevealOnScroll className="text-center mb-16 z-10 w-full max-w-5xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">The Global Threat Landscape</h2>
            <p className="text-slate-400 text-lg">Cyber attacks happen every 39 seconds. Trusting a single link can cost everything.</p>
           </RevealOnScroll>

           <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full z-10">
              {[
                { label: 'Phishing Attacks', stat: '83%', desc: 'of organizations experienced a successful email-based phishing attack.', color: 'text-warning' },
                { label: 'Credential Theft', stat: '1.2B', desc: 'records exposed in data breaches annually.', color: 'text-danger' },
                { label: 'AI-Driven Fraud', stat: 'x2.5', desc: 'increase in AI-generated social engineering scams.', color: 'text-primary' },
              ].map((item, i) => (
                <RevealOnScroll key={i} delay={i * 0.2} direction="up">
                  <div className="glass-card p-8 h-full cyber-border-scan text-center">
                    <div className={`text-5xl font-bold ${item.color} mb-4 cyber-text-glow`}>{item.stat}</div>
                    <div className="text-xl font-semibold mb-2">{item.label}</div>
                    <div className="text-slate-400">{item.desc}</div>
                  </div>
                </RevealOnScroll>
              ))}
           </div>
        </section>

        {/* ── SLIDE 3: FEATURES ── */}
        <section className="cyber-slide flex flex-col justify-center items-center px-6 relative pt-20">
           <RevealOnScroll className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4 text-white">God-Tier Protection Systems</h2>
            <p className="text-slate-400">Six primary subsystems working in concert to detect, block, and mitigate digital threats.</p>
           </RevealOnScroll>

           <div className="grid md:grid-cols-3 gap-4 max-w-6xl w-full mb-10">
             {[
               { icon: Target, name: 'SMS Scam DNA', desc: 'TF-IDF & Logistic Regression NLP analysis of urgency patterns' },
               { icon: Globe, name: 'URL Intelligence', desc: 'ML Phishing detection + URLhaus/PhishTank global threat intel' },
               { icon: Lock, name: 'Password Auditor', desc: 'Entropy analysis & HaveIBeenPwned k-anonymity breach checks' },
               { icon: Scan, name: 'Local Port Scanner', desc: 'Active vulnerability scanning of critical localhost services' },
               { icon: Terminal, name: 'Honeypot Live', desc: 'Real-time simulated SSH brute-force attack telemetry streams' },
               { icon: Database, name: 'E2EE Secure Vault', desc: 'Zero-knowledge AES-256-GCM client-side encrypted storage' },
             ].map((feat, i) => (
               <RevealOnScroll key={i} delay={i * 0.1}>
                 <div className="glass-card p-6 flex flex-col justify-center group hover:bg-white/5 transition-colors cursor-default border-primary/20">
                    <feat.icon className="w-8 h-8 text-primary mb-4 threat-float group-hover:text-secondary transition-colors" />
                    <h3 className="text-lg font-bold mb-2">{feat.name}</h3>
                    <p className="text-sm text-slate-400">{feat.desc}</p>
                 </div>
               </RevealOnScroll>
             ))}
           </div>
        </section>

        {/* ── SLIDE 4: HOW TO PROTECT YOURSELF ── */}
        <section className="cyber-slide flex flex-col justify-center items-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center pointer-events-none mix-blend-screen opacity-15" style={{ backgroundImage: 'url(/src/assets/hacker_hero_bg.png)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />

          <RevealOnScroll className="text-center mb-12 relative z-10">
            <div className="text-[#FF0055] text-xs font-bold tracking-widest uppercase mb-3">ATTACK CHAIN</div>
            <h2 className="text-4xl font-bold mb-4 text-white">Potential Attack Path</h2>
            <p className="text-slate-400">Understanding the scam lifecycle to protect yourself at every stage.</p>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full relative z-10">
            <RevealOnScroll delay={0.1}>
              <div className="glass-card p-6 space-y-4">
                {[
                  { step: '1', title: 'Message Received', desc: 'Initial contact via SMS/WhatsApp/email claiming urgency.' },
                  { step: '2', title: 'Social Engineering', desc: 'Attacker builds trust or creates urgency to bypass rational thinking.' },
                  { step: '3', title: 'Malicious Link', desc: 'Victim clicks on a suspicious link embedded in the message.' },
                  { step: '4', title: 'Fake Website', desc: 'Victim lands on counterfeited site mimicking a bank or service.' },
                  { step: '5', title: 'Credential Theft', desc: 'Login details or OTP captured through the fake interface.' },
                  { step: '6', title: 'Financial / Account Loss', desc: 'Attacker misuses information for fraud or identity theft.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-[#FF0055]/20 text-[#FF0055] flex items-center justify-center font-bold text-sm shrink-0 border border-[#FF0055]/30">{item.step}</div>
                    <div>
                      <div className="text-white font-semibold">{item.title}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2} direction="left">
              <div className="glass-card p-6">
                <div className="text-[#00FF9D] text-xs font-bold tracking-widest uppercase mb-3">PROTECTION GUIDE</div>
                <h3 className="text-xl font-bold text-white mb-4">How to Stay Safe</h3>
                <div className="space-y-3">
                  {[
                    'Never click links from unknown senders. Always verify the sender identity.',
                    'Enable 2FA on all accounts. Use app-based authenticators, not SMS OTPs.',
                    'Check URLs carefully: Look for misspellings like paypa1.com vs paypal.com.',
                    'Never share OTP, CVV, or passwords with anyone — banks will NEVER ask.',
                    'Use AI Digital Safety to scan any suspicious message or URL before trusting it.',
                    'Report scam numbers to your telecom provider and national cyber crime portal.',
                    'Regularly check if your email has been breached using our Dark Web Monitor.',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <Shield className="w-4 h-4 text-[#00FF9D] mt-0.5 shrink-0" />
                      <span className="text-slate-300">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ── SLIDE 5: DARK LLMs & AGENTIC AI THREATS ── */}
        <section className="cyber-slide flex flex-col justify-center items-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-screen" style={{ backgroundImage: 'url(/src/assets/cyber-threat-pattern.png)', backgroundSize: '150px' }} />
          
          <RevealOnScroll className="text-center mb-12">
            <div className="text-[#FF0055] text-xs font-bold tracking-widest uppercase mb-3">EMERGING THREATS 2025</div>
            <h2 className="text-4xl font-bold mb-4 text-white">Dark LLMs & Agentic AI Attacks</h2>
            <p className="text-slate-400 max-w-3xl mx-auto">Criminals now use customized, uncensored AI models to create scam materials at scale. Understanding these threats is critical to defense.</p>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full">
            {[
              { title: 'Voice Cloning & Deepfakes', desc: 'AI can now clone a person\'s voice from just 3 seconds of audio. Scammers use deepfake voices to impersonate family members or executives, demanding urgent money transfers.', color: '#FF0055', icon: Activity },
              { title: 'Dark LLM Content Factories', desc: 'Uncensored AI models ("Dark LLMs") generate thousands of convincing phishing emails, fake login pages, and counterfeit mobile apps without any safeguards — as reported by Group-IB.', color: '#A855F7', icon: Terminal },
              { title: 'Automated Credential Attacks', desc: 'AI-powered systems conduct password spraying and credential stuffing that adapts in real-time, targeting session tokens and MFA consents to breach networks — sourced from SOC Prime.', color: '#FBBF24', icon: Lock },
              { title: 'AI-Generated Phishing Kits', desc: 'Criminals sell fine-tuned AI models on dark web forums that produce phishing kits, scam scripts, and malicious code cheaply and quickly at industrial scale.', color: '#00F0FF', icon: Globe },
              { title: 'Agentic AI Threat Defense', desc: 'The latest cutting-edge technology uses Agentic AI for automated threat detection and proactive vulnerability patching — AI that hunts threats autonomously before they strike.', color: '#00FF9D', icon: Shield },
              { title: 'Social Engineering at Scale', desc: 'AI chatbots are deployed as fake customer support agents designed to steal data. Automated systems detect and exploit human psychological vulnerabilities in real-time.', color: '#F97316', icon: Target },
            ].map((item, i) => (
              <RevealOnScroll key={i} delay={i * 0.1}>
                <div className="glass-card p-6 h-full group hover:bg-white/5 transition-colors border-slate-700 cyber-border-scan">
                  <item.icon className="w-8 h-8 mb-4 threat-float" style={{ color: item.color }} />
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* ── SLIDE 6: CYBER RESOURCES ── */}
        <section className="cyber-slide flex flex-col justify-between items-center relative overflow-y-auto">
          <div className="w-full">
            <CyberResourcesSection />
          </div>
          
          <div className="w-full text-center pb-20 pt-10 border-t border-border/50 bg-background/50 backdrop-blur-md">
            <RevealOnScroll>
              <h2 className="text-3xl font-bold mb-6">Ready to secure your digital footprint?</h2>
              <button 
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold bg-primary text-background shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.6)] hover:bg-white hover:text-black transition-all"
              >
                Access Dashboard
              </button>
            </RevealOnScroll>
          </div>
        </section>

      </div>
    </div>
  );
}
