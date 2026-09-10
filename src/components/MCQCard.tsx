import React, { useState } from 'react';
import { MCQ } from '../types';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Bookmark,
  Share2,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MessageSquare,
  HelpCircle,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  ExternalLink
} from 'lucide-react';
import jsPDF from 'jspdf';

interface MCQCardProps {
  mcq: MCQ;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: string) => void;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const MCQCard: React.FC<MCQCardProps> = ({
  mcq,
  isBookmarked = false,
  onBookmarkToggle,
  onLike,
  onDislike,
  onSelectCategory
}) => {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likes, setLikes] = useState(mcq.likes);
  const [dislikes, setDislikes] = useState(mcq.dislikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Explanation state
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAiBox, setShowAiBox] = useState(false);

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [commentList, setCommentList] = useState(mcq.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  const handleOptionClick = (optionId: 'A' | 'B' | 'C' | 'D') => {
    setSelectedOption(optionId);
    setShowAnswer(true);
  };

  const handleToggleBookmark = () => {
    setBookmarked(!bookmarked);
    if (onBookmarkToggle) onBookmarkToggle(mcq.id);
  };

  const handleLike = async () => {
    if (hasLiked) return;
    setLikes(prev => prev + 1);
    setHasLiked(true);
    try {
      await fetch(`/api/mcqs/${mcq.id}/like`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDislike = async () => {
    if (hasDisliked) return;
    setDislikes(prev => prev + 1);
    setHasDisliked(true);
    try {
      await fetch(`/api/mcqs/${mcq.id}/dislike`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAskGemini = async () => {
    setShowAiBox(true);
    if (aiExplanation) return; // already fetched

    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: mcq.question,
          options: mcq.options,
          correctAnswer: mcq.correctAnswer
        })
      });
      const data = await res.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation('Unable to generate AI explanation at this time.');
      }
    } catch (err) {
      console.error(err);
      setAiExplanation('Error connecting to Gemini AI Service.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#mcq-${mcq.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `*Q:* ${mcq.question}\n\n*Options:*\nA) ${mcq.options[0]?.text}\nB) ${mcq.options[1]?.text}\nC) ${mcq.options[2]?.text}\nD) ${mcq.options[3]?.text}\n\n*Solve on Future Academy Pro:* ${window.location.origin}/#mcq-${mcq.id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      await fetch(`/api/mcqs/${mcq.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason })
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSubmitted(false);
        setReportReason('');
      }, 1800);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch(`/api/mcqs/${mcq.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newCommentText,
          authorName: commentAuthor || 'Candidate'
        })
      });
      const added = await res.json();
      setCommentList([...commentList, added]);
      setNewCommentText('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Future Academy Pro - Question Sheet', 14, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Subject: ${mcq.subject} | Category: ${mcq.category}`, 14, 30);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const questionLines = doc.splitTextToSize(`Q: ${mcq.question}`, 180);
    doc.text(questionLines, 14, 42);

    let yPos = 42 + questionLines.length * 7;
    mcq.options.forEach(opt => {
      const isCorrectText = opt.id === mcq.correctAnswer ? ' (CORRECT ANSWER)' : '';
      doc.setFont('helvetica', opt.id === mcq.correctAnswer ? 'bold' : 'normal');
      doc.text(`${opt.id}) ${opt.text}${isCorrectText}`, 20, yPos);
      yPos += 8;
    });

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Explanation:', 14, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const expLines = doc.splitTextToSize(mcq.explanation, 180);
    doc.text(expLines, 14, yPos);

    yPos += expLines.length * 6 + 10;
    doc.setFontSize(9);
    doc.text(`Downloaded from Future Academy Pro - https://futureacademypro.com`, 14, yPos);

    doc.save(`FutureAcademyPro-${mcq.id}.pdf`);
  };

  const difficultyColor =
    mcq.difficulty === 'Easy'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      : mcq.difficulty === 'Medium'
      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';

  return (
    <div
      id={`mcq-${mcq.id}`}
      className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 p-5 sm:p-6 mb-6"
    >
      {/* Top Header Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {onSelectCategory ? (
            <button
              onClick={() => onSelectCategory(mcq.category)}
              className="font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2.5 py-1 rounded-md transition"
            >
              {mcq.category}
            </button>
          ) : (
            <span className="font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md">
              {mcq.category}
            </span>
          )}

          {mcq.subcategory && (
            <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {mcq.subcategory}
            </span>
          )}

          <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${difficultyColor}`}>
            {mcq.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {mcq.views.toLocaleString()} views
          </span>
          <button
            onClick={handleToggleBookmark}
            className={`p-1 rounded-md transition ${
              bookmarked
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title={bookmarked ? 'Remove Bookmark' : 'Bookmark MCQ'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-5">
        {mcq.question}
      </h3>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {mcq.options.map(option => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === mcq.correctAnswer;

          let optionStyle =
            'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200';

          if (showAnswer) {
            if (isCorrect) {
              optionStyle =
                'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-medium';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-200';
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={`relative flex items-center justify-between p-3.5 rounded-xl border text-left text-sm transition-all duration-150 ${optionStyle}`}
            >
              <div className="flex items-start gap-3 pr-2">
                <span
                  className={`flex shrink-0 items-center justify-center w-6 h-6 rounded-lg font-semibold text-xs ${
                    showAnswer && isCorrect
                      ? 'bg-emerald-600 text-white'
                      : showAnswer && isSelected && !isCorrect
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {option.id}
                </span>
                <span className="mt-0.5 leading-relaxed">{option.text}</span>
              </div>

              {showAnswer && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
              )}
              {showAnswer && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer & Explanation Box */}
      {showAnswer && (
        <div className="mb-5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 p-4 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-200/50 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
              Correct Answer: {mcq.correctAnswer}
            </span>
            {mcq.reference && (
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
                Ref: {mcq.reference}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {mcq.explanation}
          </p>
        </div>
      )}

      {/* AI Gemini Explanation Output Box */}
      {showAiBox && (
        <div className="mb-5 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/20 border border-indigo-200 dark:border-indigo-800/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Gemini AI Deep Tutor Explanation
              </span>
            </div>
            <button
              onClick={() => setShowAiBox(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          {loadingAi ? (
            <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Analyzing question, facts, and mnemonic memory tricks...</span>
            </div>
          ) : (
            <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {aiExplanation}
            </div>
          )}
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>

          <button
            onClick={handleAskGemini}
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition flex items-center gap-1.5"
            title="Get instant AI deep breakdown & memory tricks"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Ask Gemini AI
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <button
            onClick={handleLike}
            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition ${
              hasLiked ? 'text-emerald-600 font-bold' : ''
            }`}
            title="Like this question"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{likes}</span>
          </button>

          <button
            onClick={handleDislike}
            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition ${
              hasDisliked ? 'text-rose-600 font-bold' : ''
            }`}
            title="Dislike"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{dislikes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition"
            title="Comments"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{commentList.length}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 transition"
            title="Share on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Copy Direct Link"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied && <span className="text-[10px] text-emerald-600 ml-1">Copied!</span>}
          </button>

          <button
            onClick={handleDownloadPdf}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Download PDF Sheet"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 transition"
            title="Report Error"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Discussion & Answers ({commentList.length})
          </h4>

          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
            {commentList.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No comments yet. Be the first to start the discussion!</p>
            ) : (
              commentList.map(c => (
                <div key={c.id} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    <span>{c.authorName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentAuthor}
              onChange={e => setCommentAuthor(e.target.value)}
              placeholder="Your Name (optional)"
              className="w-1/3 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
            <input
              type="text"
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder="Write a discussion comment..."
              className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg text-xs font-medium flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              Report Issue in MCQ
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Help us maintain 100% accurate questions. Let us know if there is a typo, wrong key, or outdated option.
            </p>

            {reportSubmitted ? (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg text-center font-medium">
                ✅ Report submitted to editorial team! Thank you.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <textarea
                  rows={3}
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="e.g. Option C is correct instead of B because..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="text-xs px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-xs px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
