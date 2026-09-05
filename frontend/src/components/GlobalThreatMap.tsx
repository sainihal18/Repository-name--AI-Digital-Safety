import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

// Generates random threat nodes on a simplified dotted map logic
export default function GlobalThreatMap() {
  const [threats, setThreats] = useState<{ id: number, x: number, y: number, severity: 'high' | 'critical' }[]>([]);

  useEffect(() => {
    // Periodically spawn new threats
    const interval = setInterval(() => {
      setThreats(prev => {
        const next = [...prev].slice(-10); // keep max 10
        next.push({
          id: Date.now(),
          x: 10 + Math.random() * 80, // % width
          y: 20 + Math.random() * 60, // % height
          severity: Math.random() > 0.8 ? 'critical' : 'high'
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full h-[30px] flex justify-between items-start mb-2 z-10">
        <div>
          <h3 className="text-[#FF0055] text-xs font-bold tracking-widest uppercase mb-1">THREAT INTELLIGENCE</h3>
          <h2 className="text-lg font-bold text-white mb-4">Global Threat Overview</h2>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-white">Top Threat Categories</div>
          <div className="text-xs text-slate-400">Phishing (42%) | Malware (25%)</div>
        </div>
      </div>
      
      <div className="flex-1 w-full relative bg-[#050A15]/50 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
        {/* Abstract World Map Dotted Pattern (Simplified) */}
        <div className="absolute inset-0 opacity-20"
             style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
        
        {threats.map(t => (
          <motion.div
            key={t.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.2] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            className={`absolute rounded-full flex flex-col items-center justify-center`}
            style={{ left: `${t.x}%`, top: `${t.y}%`, width: '40px', height: '40px', transform: 'translate(-50%, -50%)' }}
          >
            <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${t.severity === 'critical' ? 'bg-[#FF0055]' : 'bg-[#00F0FF]'}`} />
            <div className={`w-2 h-2 rounded-full ${t.severity === 'critical' ? 'bg-[#FF0055] shadow-[0_0_10px_#FF0055]' : 'bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]'}`} />
          </motion.div>
        ))}

        <div className="absolute bottom-4 left-4 flex gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#FF0055]" /> Critical Node
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#00F0FF]" /> Active Monitor
          </div>
        </div>
      </div>
    </div>
  );
}
