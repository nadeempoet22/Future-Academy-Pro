import React, { useState } from 'react';
import { MCQ } from '../types';
import { Search, Mic, Sparkles, X, Loader2, ArrowRight, BookOpen } from 'lucide-react';

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMcq?: (mcqId: string) => void;
  allMcqs?: MCQ[];
}

export const AISearchModal: React.FC<AISearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMcq,
  allMcqs = []
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [matchedMcqs, setMatchedMcqs] = useState<MCQ[]>([]);
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setAiSummary(data.summary || null);
        setMatchedMcqs(data.mcqs || []);
        return;
      }
    } catch {
      // Local smart search fallback
    } finally {
      setLoading(false);
    }

    // Local smart matching fallback
    const q = searchQuery.toLowerCase().trim();
    const matches = allMcqs.filter(m =>
      m.question.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.explanation.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    ).slice(0, 8);

    setMatchedMcqs(matches);
    setAiSummary(
      matches.length > 0
        ? `Found ${matches.length} highly relevant question${matches.length > 1 ? 's' : ''} matching "${searchQuery}". Key concepts found across ${Array.from(new Set(matches.map(m => m.category))).join(', ')}.`
        : `No direct matches found for "${searchQuery}". Try searching for core topics like "Islamic Studies", "General Knowledge", "Pakistan Affairs", or "Computer Science".`
    );
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.start();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 pt-16 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn">
        {/* Search Bar Input Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
              placeholder="Ask anything e.g. 'Who was first PM of Pakistan?' or 'Speed of light'"
              className="w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <button
              onClick={handleVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleSearch(query)}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-2xl transition shadow-md shadow-emerald-600/20 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'AI Search'}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
              <p className="text-xs font-semibold">Gemini AI is analyzing millions of MCQs...</p>
            </div>
          )}

          {!loading && aiSummary && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/30 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20 border border-indigo-200 dark:border-indigo-800/40">
              <div className="flex items-center gap-2 mb-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>AI Concept Overview</span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {aiSummary}
              </div>
            </div>
          )}

          {!loading && matchedMcqs.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Matched Exam MCQs ({matchedMcqs.length})
              </h4>

              <div className="space-y-3">
                {matchedMcqs.map(m => (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (onSelectMcq) onSelectMcq(m.id);
                      onClose();
                    }}
                    className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/50 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                      <span>{m.category}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                      {m.question}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !aiSummary && matchedMcqs.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Try searching for topics like "Pakistan Constitution 1973", "Ozone Layer", "MS Word shortcuts", or "Prepositions".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
