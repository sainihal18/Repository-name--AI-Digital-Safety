import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, Lock, Database, Globe, Command, Zap } from 'lucide-react';

export default function CmdK() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      // Close on Escape
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { name: 'Analyze Threat (SMS, URL, Image)', action: () => navigate('/analyze'), icon: Search },
    { name: 'View Live Dashboard', action: () => navigate('/dashboard'), icon: Activity },
    { name: 'Password Strength & Breach Check', action: () => navigate('/password-checker'), icon: Lock },
    { name: 'Live Honeypot Visualizer', action: () => navigate('/honeypot'), icon: Globe },
    { name: 'Vulnerability Port Scanner', action: () => navigate('/scanner'), icon: Zap },
    { name: 'Secure E2EE Vault', action: () => navigate('/vault'), icon: Database },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
          />
          
          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[15%] left-[50%] translate-x-[-50%] w-full max-w-lg z-[101] shadow-2xl shadow-primary/20"
          >
            <div className="glass-card overflow-hidden border-primary/30">
              <div className="flex items-center px-4 py-3 border-b border-border gap-3 bg-surface-alt/50">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type a command or search..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent border-none text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-0 text-lg"
                />
                <div className="hidden sm:flex gap-1 text-[10px] text-slate-500 font-mono">
                  <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border">esc</kbd>
                  to close
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {filteredCommands.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No results found for "{input}"
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        cmd.action();
                        setOpen(false);
                        setInput('');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 hover:text-primary text-slate-300 text-left transition-colors group"
                    >
                      <cmd.icon className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                      <span className="font-medium text-sm flex-1">{cmd.name}</span>
                      <Command className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                )}
              </div>
              
              <div className="border-t border-border bg-surface-alt/80 px-4 py-2 text-xs text-slate-500 flex justify-between">
                <span>AI Digital Safety Command Palette</span>
                <span>Powered by React & Framer Motion</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
