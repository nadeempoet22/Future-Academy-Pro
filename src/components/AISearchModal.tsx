import React, { useState } from 'react';
import { MCQ } from '../types';
import { Search, Mic, Sparkles, X, Loader2, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { findQuickFact, QuickFact } from '../data/knowledgeBase';

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMcq?: (mcqId: string) => void;
  allMcqs?: MCQ[];
  initialQuery?: string;
}

export const AISearchModal: React.FC<AISearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMcq,
  allMcqs = [],
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [quickFact, setQuickFact] = useState<QuickFact | null>(null);
  const [matchedMcqs, setMatchedMcqs] = useState<MCQ[]>([]);
  const [isListening, setIsListening] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (initialQuery && initialQuery.trim()) {
        setQuery(initialQuery);
        handleSearch(initialQuery);
      } else if (query && query.trim() && !aiSummary) {
        handleSearch(query);
      }
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleSearch = async (searchQuery: string) => {
    const raw = searchQuery.trim();
    if (!raw) return;
    setLoading(true);
    setQuickFact(null);

    // 1. Try server-side Gemini AI smart search first
    try {
      const res = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: raw })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data && (data.summary || (Array.isArray(data.mcqs) && data.mcqs.length > 0))) {
          setAiSummary(data.summary || null);
          setMatchedMcqs(data.mcqs || []);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Offline / static host (Vercel) fallback
    } finally {
      setLoading(false);
    }

    // 2. Intelligent Offline/Vercel Search Engine
    // Check built-in GK Knowledge Base for instant accurate answer (e.g. PM, President, CJP, Capital, etc.)
    const fact = findQuickFact(raw);
    if (fact) {
      setQuickFact(fact);
    }

    // Comprehensive token-based MCQ matching
    const qClean = raw.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const stopWords = new Set(['who', 'is', 'the', 'of', 'in', 'and', 'what', 'which', 'was', 'were', 'to', 'for', 'a', 'an', 'are', 'how']);
    const tokens = qClean.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));

    const scoredMcqs: { mcq: MCQ; score: number }[] = [];

    allMcqs.forEach(m => {
      const qText = m.question.toLowerCase();
      const expText = (m.explanation || '').toLowerCase();
      const catText = (m.category || '').toLowerCase();
      const tagsText = (m.tags || []).join(' ').toLowerCase();
      const optionsText = (m.options || []).map(o => o.text).join(' ').toLowerCase();

      let score = 0;

      // Exact phrase match
      if (qText.includes(qClean)) score += 20;
      if (expText.includes(qClean)) score += 12;

      // Token matching
      tokens.forEach(token => {
        if (qText.includes(token)) score += 5;
        if (expText.includes(token)) score += 3;
        if (tagsText.includes(token)) score += 4;
        if (catText.includes(token)) score += 2;
        if (optionsText.includes(token)) score += 2;
      });

      // Special acronyms (e.g. PM -> Prime Minister)
      if (tokens.includes('pm') && (qText.includes('prime minister') || tagsText.includes('prime minister') || expText.includes('prime minister'))) {
        score += 15;
      }

      if (score > 0) {
        scoredMcqs.push({ mcq: m, score });
      }
    });

    scoredMcqs.sort((a, b) => b.score - a.score);
    const topMatches = scoredMcqs.slice(0, 8).map(s => s.mcq);
    setMatchedMcqs(topMatches);

    // Generate smart contextual AI summary
    if (fact) {
      setAiSummary(
        `**${fact.title}**\n\n${fact.answer}\n\nKey exam facts:\n` +
        fact.pointers.map(p => `• ${p}`).join('\n')
      );
    } else if (topMatches.length > 0) {
      const matchedCategories = Array.from(new Set(topMatches.map(m => m.category))).join(', ');
      setAiSummary(
        `Found ${topMatches.length} verified exam question${topMatches.length > 1 ? 's' : ''} related to "${raw}". Topics covered across: ${matchedCategories}.\n\nReview the questions below for detailed explanations and exam references.`
      );
    } else {
      // Friendly helpful fallback
      setAiSummary(
        `We searched all exam questions for "${raw}". While an exact question wasn't found in current question banks, you can explore related subjects like Pakistan Affairs, Current Affairs, Islamic Studies, or General Knowledge, or try simpler keywords like "Prime Minister", "Jinnah", or "1973 Constitution".`
      );
    }
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
                      <span>{m.category} • {m.difficulty}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {m.question}
                    </p>

                    {/* Quick Answer Preview */}
                    <div className="flex items-start gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                      <span>
                        <strong>Answer ({m.correctAnswer}):</strong> {m.options.find(o => o.id === m.correctAnswer)?.text || m.correctAnswer}
                      </span>
                    </div>

                    {m.explanation && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {m.explanation}
                      </p>
                    )}
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
