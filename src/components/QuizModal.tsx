import React, { useState, useEffect } from 'react';
import { MCQ, QuizResult } from '../types';
import {
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RotateCcw,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trophy,
  User,
  Mail,
  Play,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Award,
  ListFilter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CertificateCard } from './CertificateCard';
import { downloadCertificatePdf, CertificateData } from '../utils/certificateGenerator';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categoryName?: string;
  questions: MCQ[];
  mode?: 'Practice' | 'Exam';
  onQuizComplete?: (result: QuizResult) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  title,
  categoryName = 'General',
  questions,
  mode = 'Practice',
  onQuizComplete
}) => {
  const [candidateName, setCandidateName] = useState<string>(() => {
    try {
      return localStorage.getItem('futureacademy_candidate_name') || '';
    } catch {
      return '';
    }
  });

  const [candidateEmail, setCandidateEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('futureacademy_candidate_email') || '';
    } catch {
      return '';
    }
  });

  const [quizStarted, setQuizStarted] = useState(false);
  const [candidateError, setCandidateError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [quizMode, setQuizMode] = useState<'Practice' | 'Exam'>(mode);
  const [enableNegativeMarking, setEnableNegativeMarking] = useState(false);
  const [resultTab, setResultTab] = useState<'certificate' | 'review'>('certificate');

  // When modal is reopened, reload stored candidate info and show candidate entry screen
  useEffect(() => {
    if (isOpen) {
      try {
        const savedName = localStorage.getItem('futureacademy_candidate_name');
        const savedEmail = localStorage.getItem('futureacademy_candidate_email');
        if (savedName) setCandidateName(savedName);
        if (savedEmail) setCandidateEmail(savedEmail);
      } catch {}

      setQuizStarted(false);
      setIsCompleted(false);
      setCurrentIndex(0);
      setUserAnswers({});
      setTimeSeconds(0);
      setCandidateError('');
      setQuizMode(mode);
      setResultTab('certificate');
    }
  }, [isOpen, mode]);

  // Quiz timer starts ONLY after candidate fills Name & Email and clicks "Start Quiz Now"
  useEffect(() => {
    if (!isOpen || !quizStarted || isCompleted) return;

    const timer = setInterval(() => {
      setTimeSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, quizStarted, isCompleted]);

  if (!isOpen || questions.length === 0) return null;

  const currentMcq = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = candidateName.trim();
    const trimmedEmail = candidateEmail.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setCandidateError('Baraye meharbani apna mukammal naam darj karein (kam az kam 2 huroof).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setCandidateError('Baraye meharbani durust email address darj karein (maslan: name@gmail.com).');
      return;
    }

    try {
      localStorage.setItem('futureacademy_candidate_name', trimmedName);
      localStorage.setItem('futureacademy_candidate_email', trimmedEmail);
    } catch {}

    setCandidateError('');
    setTimeSeconds(0);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsCompleted(false);
    setQuizStarted(true);
  };

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    if (isCompleted) return;
    setUserAnswers(prev => ({ ...prev, [currentIndex]: optionId }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    questions.forEach((q, i) => {
      const ans = userAnswers[i];
      if (!ans) {
        skipped++;
      } else if (ans === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    let finalScore = correct;
    if (enableNegativeMarking) {
      finalScore = Math.max(0, correct - wrong * 0.25);
    }

    const percentage = Math.round((correct / questions.length) * 100);

    return { correct, wrong, skipped, finalScore, percentage };
  };

  const handleSubmitQuiz = async () => {
    setIsCompleted(true);
    const scoreData = calculateScore();

    if (scoreData.percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const resultObj: QuizResult = {
      id: `qres-${Date.now()}`,
      quizTitle: title,
      category: categoryName,
      totalQuestions: questions.length,
      correctAnswers: scoreData.correct,
      wrongAnswers: scoreData.wrong,
      skippedQuestions: scoreData.skipped,
      scorePercentage: scoreData.percentage,
      timeTakenSeconds: timeSeconds,
      completedAt: new Date().toISOString(),
      mode: quizMode,
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim()
    };

    if (onQuizComplete) {
      onQuizComplete(resultObj);
    }

    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultObj)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownloadCertificate = () => {
    const scoreData = calculateScore();
    downloadCertificatePdf({
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim(),
      quizTitle: title,
      categoryName: categoryName,
      scorePercentage: scoreData.percentage,
      correctAnswers: scoreData.correct,
      totalQuestions: questions.length,
      timeSeconds: timeSeconds,
      quizMode: quizMode
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className={`bg-white dark:bg-slate-900 rounded-3xl ${isCompleted ? 'max-w-4xl' : 'max-w-3xl'} w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto transition-all`}>
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full inline-block">
                {quizStarted ? `${quizMode} Mode (${categoryName})` : 'Candidate Exam Verification'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-1">{title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {quizStarted && (
              <>
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/90 text-slate-300 px-3 py-1.5 rounded-xl text-xs border border-slate-700 max-w-[170px] truncate">
                  <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{candidateName}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-400 border border-slate-700">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(timeSeconds)}
                </div>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Close Quiz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        {!quizStarted ? (
          /* 1. CANDIDATE REGISTRATION / QUIZ START SCREEN */
          <div className="p-6 sm:p-8 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <FileCheck className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                FPSC & PPSC Candidate Verification
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                Quiz Entry Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Quiz shuru karne ke liye apna <b>Naam</b> aur <b>Email</b> darj karein. Yeh details aapke scorecard aur completion certificate par darj hongi.
              </p>
            </div>

            <form onSubmit={handleStartQuiz} className="space-y-4">
              {/* Candidate Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Candidate Full Name (پورا نام) *</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Required</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={e => {
                      setCandidateName(e.target.value);
                      if (candidateError) setCandidateError('');
                    }}
                    placeholder="e.g. Muhammad Ali / Sarah Khan"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Candidate Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Email Address (ای میل ایڈریس) *</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Required</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={e => {
                      setCandidateEmail(e.target.value);
                      if (candidateError) setCandidateError('');
                    }}
                    placeholder="e.g. candidate@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Quiz Configuration (Mode & Negative marking) */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Test Mode:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizMode('Practice')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition text-left flex flex-col gap-0.5 ${
                        quizMode === 'Practice'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Practice Mode
                      </span>
                      <span className={`text-[10px] ${quizMode === 'Practice' ? 'text-emerald-100' : 'text-slate-400'}`}>
                        Instant answer & explanation
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuizMode('Exam')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition text-left flex flex-col gap-0.5 ${
                        quizMode === 'Exam'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Timed Exam Mode
                      </span>
                      <span className={`text-[10px] ${quizMode === 'Exam' ? 'text-emerald-100' : 'text-slate-400'}`}>
                        Real test simulation
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={enableNegativeMarking}
                      onChange={e => setEnableNegativeMarking(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Negative Marking (-0.25)</span>
                  </label>

                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    {questions.length} Questions
                  </span>
                </div>
              </div>

              {/* Validation Error Banner */}
              {candidateError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{candidateError}</span>
                </div>
              )}

              {/* Start Quiz CTA */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
              >
                <Play className="w-4 h-4 fill-white" /> Start Quiz Now →
              </button>
            </form>
          </div>
        ) : !isCompleted ? (
          /* 2. ACTIVE QUIZ TEST QUESTIONS */
          <div className="p-5 sm:p-6">
            {/* Mode & Options Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Mode:</span>
                <button
                  onClick={() => setQuizMode('Practice')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    quizMode === 'Practice'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Practice
                </button>
                <button
                  onClick={() => setQuizMode('Exam')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    quizMode === 'Exam'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Exam
                </button>
              </div>

              <div className="flex items-center gap-3">
                {enableNegativeMarking && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    Negative Marking Active (-0.25)
                  </span>
                )}
                <span className="text-slate-500 font-medium">
                  Candidate: <strong className="text-slate-800 dark:text-slate-200">{candidateName}</strong>
                </span>
              </div>
            </div>

            {/* Question Progress Indicator */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-3">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>
                Attempted: {Object.keys(userAnswers).length} / {questions.length}
              </span>
            </div>

            {/* Question Card */}
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-snug">
                {currentMcq.question}
              </h3>

              <div className="space-y-3">
                {currentMcq.options.map(opt => {
                  const isSelected = userAnswers[currentIndex] === opt.id;
                  const isCorrectAnswer = opt.id === currentMcq.correctAnswer;
                  const showFeedback = quizMode === 'Practice' && userAnswers[currentIndex] !== undefined;

                  let optClass =
                    'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200';

                  if (showFeedback) {
                    if (isCorrectAnswer) {
                      optClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrectAnswer) {
                      optClass = 'bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-200';
                    }
                  } else if (isSelected) {
                    optClass = 'bg-emerald-600 text-white border-emerald-600 font-semibold';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-sm transition ${optClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected && quizMode === 'Exam'
                              ? 'bg-white text-emerald-800'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>

                      {showFeedback && isCorrectAnswer && (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {showFeedback && isSelected && !isCorrectAnswer && (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizMode === 'Practice' && userAnswers[currentIndex] !== undefined && (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                    Explanation:
                  </span>
                  {currentMcq.explanation}
                </div>
              )}
            </div>

            {/* Bottom Question Grid & Navigation */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 max-w-xs overflow-x-auto">
                {questions.map((_, idx) => {
                  const isAns = userAnswers[idx] !== undefined;
                  const isCurr = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                        isCurr
                          ? 'ring-2 ring-emerald-500 font-bold'
                          : isAns
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
                  >
                    Submit Test & Score
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* 3. QUIZ RESULT & SCORECARD SCREEN */
          <div className="p-5 sm:p-7 text-center space-y-6">
            <div>
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2 shadow-inner">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Examination Completed!
              </h3>

              {/* Candidate Name and Email display */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 max-w-fit mx-auto mt-2">
                <User className="w-3.5 h-3.5" />
                <span>{candidateName}</span>
                <span className="text-slate-400">|</span>
                <Mail className="w-3.5 h-3.5" />
                <span>{candidateEmail}</span>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                Verified candidate assessment record in {title} ({categoryName}).
              </p>
            </div>

            {(() => {
              const res = calculateScore();
              const certData: CertificateData = {
                candidateName: candidateName.trim() || 'Candidate',
                candidateEmail: candidateEmail.trim(),
                quizTitle: title,
                categoryName: categoryName,
                scorePercentage: res.percentage,
                correctAnswers: res.correct,
                totalQuestions: questions.length,
                timeSeconds: timeSeconds,
                quizMode: quizMode
              };

              return (
                <div className="space-y-6">
                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Score
                      </span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {res.percentage}%
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
                        Correct
                      </span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {res.correct} / {questions.length}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold block">
                        Wrong
                      </span>
                      <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                        {res.wrong}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Time
                      </span>
                      <span className="text-xl font-black text-slate-800 dark:text-slate-200">
                        {formatTime(timeSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Tab Navigation: Certificate vs Review */}
                  <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl max-w-sm mx-auto border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setResultTab('certificate')}
                      className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
                        resultTab === 'certificate'
                          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" /> Official Certificate
                    </button>
                    <button
                      type="button"
                      onClick={() => setResultTab('review')}
                      className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
                        resultTab === 'review'
                          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <ListFilter className="w-3.5 h-3.5" /> Review Questions
                    </button>
                  </div>

                  {/* Tab 1: Certificate Preview & Download */}
                  {resultTab === 'certificate' && (
                    <div className="pt-2">
                      <CertificateCard data={certData} />
                    </div>
                  )}

                  {/* Tab 2: Detailed Question Review */}
                  {resultTab === 'review' && (
                    <div className="space-y-3.5 text-left max-h-[460px] overflow-y-auto pr-2">
                      {questions.map((q, idx) => {
                        const userAns = userAnswers[idx];
                        const isCorrect = userAns === q.correctAnswer;
                        const isSkipped = !userAns;

                        return (
                          <div
                            key={q.id || idx}
                            className={`p-4 rounded-2xl border transition-colors ${
                              isCorrect
                                ? 'bg-emerald-500/5 border-emerald-500/30'
                                : isSkipped
                                ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                                : 'bg-rose-500/5 border-rose-500/30'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <span className="text-xs font-bold text-slate-500">
                                Question {idx + 1}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isCorrect
                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                    : isSkipped
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {isCorrect ? '✓ Correct' : isSkipped ? '○ Skipped' : '✗ Incorrect'}
                              </span>
                            </div>

                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                              {q.question}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                              {q.options.map(opt => {
                                const isSelected = userAns === opt.id;
                                const isRight = opt.id === q.correctAnswer;
                                let optStyle =
                                  'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                                if (isRight) {
                                  optStyle =
                                    'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold';
                                } else if (isSelected && !isRight) {
                                  optStyle =
                                    'bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-300';
                                }
                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-2 rounded-xl border flex items-center gap-2 ${optStyle}`}
                                  >
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border">
                                      {opt.id}
                                    </span>
                                    <span className="truncate">{opt.text}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-xl mt-2">
                                💡 <strong>Explanation:</strong> {q.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Retake & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompleted(false);
                        setCurrentIndex(0);
                        setUserAnswers({});
                        setTimeSeconds(0);
                        setQuizStarted(false);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-4 h-4" /> Retake Quiz
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadCertificate}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                      <Download className="w-4 h-4" /> Download PDF Certificate
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
