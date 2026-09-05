import RevealOnScroll from '@/components/RevealOnScroll';
import CyberBackground from '@/components/CyberBackground';
import { Database, Filter, Cpu, Target, FileText } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Database,
      title: '1. Multi-Modal Ingestion',
      desc: 'Users submit raw text messages, suspicious URLs, or upload screenshots. Data is normalized instantaneously for pipeline processing.',
      color: 'text-primary'
    },
    {
      icon: Filter,
      title: '2. Feature Extraction',
      desc: 'Our engine strips out noise, defanges active links, extracts sender domains, and uses OCR on images to isolate threats.',
      color: 'text-secondary'
    },
    {
      icon: Cpu,
      title: '3. Machine Learning & Rules',
      desc: 'Data flows concurrently through an advanced TF-IDF/Logistic Regression model and a 50+ heuristic rule engine looking for urgent psychological triggers.',
      color: 'text-warning'
    },
    {
      icon: Target,
      title: '4. External Intelligence',
      desc: 'In milliseconds, URLs are cross-checked against global live databases like URLhaus, Google Safe Browsing, and PhishTank.',
      color: 'text-danger'
    },
    {
      icon: FileText,
      title: '5. Fusion Risk Engine',
      desc: 'A weighted fusion algorithm combines all signals to generate a final Risk Score (0-100), Verdict, and 12-dimensional Scam DNA map.',
      color: 'text-success'
    }
  ];

  return (
    <div className="relative min-h-screen text-slate-200 overflow-x-hidden pt-24 pb-32">
      <CyberBackground />
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        
        <RevealOnScroll direction="down" className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-border p-2 inline-block bg-background">The Architecture of Protection</h1>
          <p className="text-lg text-slate-400">Discover the 5-stage pipeline that secures your digital life.</p>
        </RevealOnScroll>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <RevealOnScroll key={i} delay={i * 0.15} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div className="glass-card p-8 flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-border group-hover:bg-primary transition-colors" />
                <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center bg-surface-alt border border-border group-hover:border-primary/50 transition-colors`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-2">{step.title}</h3>
                  <p className="text-base text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </div>
  );
}
