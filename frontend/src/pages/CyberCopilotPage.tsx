import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Activity, Shield, Sparkles } from 'lucide-react';
import { api } from '@/services/api';
import RevealOnScroll from '@/components/RevealOnScroll';
import type { ChatMessage } from '@/types';
import { motion } from 'framer-motion';

export default function CyberCopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your AI Cyber Copilot. I can explain forensic concepts, summarize your threat profile, or assist with incident response. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      // Just passing a generic context for simulation
      const res = await api.copilotChat(userMsg.content, history, "User is currently viewing the Copilot interface.");
      setMessages([...history, { role: 'assistant', content: res.reply }]);
    } catch (e) {
      console.error(e);
      setMessages([...history, { role: 'assistant', content: 'Connection error: Unable to reach the Copilot neural core.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <RevealOnScroll>
        <div className="flex items-center gap-3 mb-2">
          <Bot className="w-8 h-8 text-[#00FF9D]" />
          <h1 className="text-3xl font-bold">Cyber Copilot</h1>
        </div>
        <p className="text-slate-400 mb-6">Your on-call contextual AI forensic assistant.</p>
      </RevealOnScroll>

      <div className="flex-1 glass-card border-[#00FF9D]/20 overflow-hidden flex flex-col relative">
        {/* Subtle background glow */}
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-[#00FF9D]/5 to-transparent pointer-events-none" />

        {/* Message View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-[#00FF9D]/20 text-[#00FF9D]'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary/20 border border-primary/30 text-white rounded-tr-none' 
                  : 'glass-card border-[#00FF9D]/20 text-slate-200 rounded-tl-none relative overflow-hidden'
              }`}>
                {msg.role === 'assistant' && (
                   <Sparkles className="w-24 h-24 absolute -right-4 -bottom-4 opacity-5 text-[#00FF9D] pointer-events-none" />
                )}
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-4 flex-row">
              <div className="w-10 h-10 rounded-full bg-[#00FF9D]/20 text-[#00FF9D] flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="glass-card border-[#00FF9D]/20 text-slate-200 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Activity className="w-4 h-4 animate-spin text-[#00FF9D]" />
                <span className="text-xs font-mono text-[#00FF9D] opacity-80">Consulting threat intelligence...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/40 border-t border-[#00FF9D]/20 backdrop-blur-md">
          <div className="flex gap-3 relative max-w-3xl mx-auto">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <input 
              type="text"
              className="flex-1 bg-surface/50 border border-slate-700 focus:border-[#00FF9D]/50 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 outline-none placeholder-slate-500 font-mono text-sm transition-colors shadow-inner"
              placeholder="Ask Copilot about an analysis result, a security concept, or threat..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-12 rounded-xl bg-[#00FF9D]/20 text-[#00FF9D] border border-[#00FF9D]/40 hover:bg-[#00FF9D]/30 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
