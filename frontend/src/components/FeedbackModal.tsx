import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ThumbsUp, ThumbsDown, MessageSquare, Send, Loader2 } from 'lucide-react';
import { api } from '@/services/api';

interface FeedbackModalProps {
  analysisId: string;
  onClose: () => void;
}

export default function FeedbackModal({ analysisId, onClose }: FeedbackModalProps) {
  const [label, setLabel] = useState<'correct' | 'false_positive' | 'false_negative' | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!label) return;
    setLoading(true);
    try {
      await api.submitFeedback({ analysis_id: analysisId, label, comment: comment || undefined });
      setDone(true);
      setTimeout(onClose, 1500);
    } catch {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md p-6"
      >
        {done ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="w-7 h-7 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Thank you!</h3>
            <p className="text-sm text-slate-400 mt-1">Your feedback helps improve our models.</p>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-200">Report Feedback</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-surface-hover text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">Was this analysis accurate?</p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {([
                { key: 'correct' as const, icon: ThumbsUp, label: 'Correct', color: 'success' },
                { key: 'false_positive' as const, icon: ThumbsDown, label: 'Not a scam', color: 'warning' },
                { key: 'false_negative' as const, icon: ThumbsDown, label: 'Missed scam', color: 'danger' },
              ]).map(({ key, icon: Icon, label: lbl, color }) => (
                <button
                  key={key}
                  onClick={() => setLabel(key)}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-xs
                    ${label === key
                      ? `border-${color}/40 bg-${color}/10 text-${color}`
                      : 'border-border text-slate-500 hover:border-border-light hover:text-slate-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {lbl}
                </button>
              ))}
            </div>

            <div className="relative mb-4">
              <MessageSquare className="absolute top-3 left-3 w-3.5 h-3.5 text-slate-600" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional comment..."
                maxLength={500}
                rows={3}
                className="w-full bg-surface-alt border border-border rounded-xl pl-9 pr-4 py-2.5
                  text-xs text-slate-200 placeholder:text-slate-600 resize-none
                  focus:outline-none focus:border-primary/30 transition-colors"
              />
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={!label || loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                bg-gradient-to-r from-primary to-secondary text-background
                disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Feedback
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
