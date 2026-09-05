import { ExternalLink, Database, Shield, BookOpen } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

export default function CyberResourcesSection() {
  const categories = [
    {
      title: 'Standards & Frameworks',
      icon: BookOpen,
      links: [
        { name: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' },
        { name: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework' },
        { name: 'MITRE ATT&CK', url: 'https://attack.mitre.org/' },
        { name: 'NIST SP 800-63B (Passwords)', url: 'https://pages.nist.gov/800-63-3/sp800-63b.html' },
      ],
    },
    {
      title: 'Threat Intelligence APIs',
      icon: Database,
      links: [
        { name: 'URLhaus (Malware)', url: 'https://urlhaus.abuse.ch/' },
        { name: 'PhishTank', url: 'https://phishtank.org/' },
        { name: 'Google Safe Browsing', url: 'https://safebrowsing.google.com/' },
        { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/API/v3' },
      ],
    },
    {
      title: 'Research Datasets',
      icon: Shield,
      links: [
        { name: 'PhiUSIIL Phishing Dataset', url: 'https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset' },
        { name: 'UCI SMS Spam Collection', url: 'https://archive.ics.uci.edu/dataset/228/sms+spam+collection' },
        { name: 'CISA Free Cybersecurity Services', url: 'https://www.cisa.gov/free-cybersecurity-services-and-tools' },
      ],
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-16 text-slate-200">
      <RevealOnScroll className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Powered by Global Intelligence</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          AI Digital Safety is built on top of leading open-source datasets, global threat intelligence feeds, and enterprise security frameworks.
        </p>
      </RevealOnScroll>

      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((category, idx) => (
          <RevealOnScroll key={idx} delay={idx * 0.15} direction="up" className="h-full">
            <div className="glass-card p-6 h-full flex flex-col hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{category.title}</h3>
              </div>
              <ul className="space-y-4 flex-1">
                {category.links.map((link, lidx) => (
                  <li key={lidx}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                    >
                      <ExternalLink className="w-4 h-4 mt-0.5 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                      <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                        {link.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}
