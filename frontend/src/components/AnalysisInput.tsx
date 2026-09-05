import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Link, Loader2, Send, Clipboard, Image as ImageIcon, UploadCloud } from 'lucide-react';

type TabType = 'sms' | 'url' | 'image';

interface AnalysisInputProps {
  onSubmit: (type: TabType, value: string | File) => void;
  loading: boolean;
}

export default function AnalysisInput({ onSubmit, loading }: AnalysisInputProps) {
  const [tab, setTab] = useState<TabType>('sms');
  const [value, setValue] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (tab === 'image' && file) {
      onSubmit(tab, file);
    } else if (tab !== 'image' && value.trim()) {
      onSubmit(tab, value.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setValue(text);
    } catch { /* ignore */ }
  };

  const maxLen = tab === 'sms' ? 2000 : 2048;

  return (
    <div className="glass-card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {([
          { key: 'sms' as TabType, icon: MessageSquare, label: 'SMS Message' },
          { key: 'url' as TabType, icon: Link, label: 'URL' },
          { key: 'image' as TabType, icon: ImageIcon, label: 'Screenshot' },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setTab(key); setValue(''); setFile(null); }}
            className={`
              relative flex-1 flex items-center justify-center gap-2 px-4 py-3.5
              text-sm font-medium transition-colors
              ${tab === key ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
            {tab === key && (
              <motion.div
                layoutId="input-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === 'sms' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === 'sms' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'sms' ? (
              <div className="relative">
                <textarea
                  id="sms-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Paste a suspicious SMS message here for analysis..."
                  maxLength={maxLen}
                  rows={5}
                  className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3
                    text-sm text-slate-200 placeholder:text-slate-600 resize-none
                    focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20
                    transition-all font-mono"
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono">
                  {value.length}/{maxLen}
                </span>
              </div>
            ) : tab === 'url' ? (
              <div className="relative">
                <input
                  id="url-input"
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="https://suspicious-link.example.com/..."
                  maxLength={maxLen}
                  className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3
                    text-sm text-slate-200 placeholder:text-slate-600
                    focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20
                    transition-all font-mono"
                />
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl bg-surface-alt/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px]"
                   onClick={() => document.getElementById('file-upload')?.click()}>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <UploadCloud className="w-8 h-8 text-slate-500 mb-3" />
                {file ? (
                  <p className="text-sm font-medium text-primary">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-300">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF</p>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500
              hover:text-slate-300 hover:bg-surface-hover transition-all"
          >
            <Clipboard className="w-3.5 h-3.5" />
            Paste from clipboard
          </button>

          <motion.button
            type="submit"
            disabled={!value.trim() || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
              bg-gradient-to-r from-primary to-secondary text-background
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-primary/20 hover:shadow-primary/30
              transition-shadow"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Analyze {tab === 'sms' ? 'Message' : tab === 'url' ? 'URL' : 'Image'}
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
