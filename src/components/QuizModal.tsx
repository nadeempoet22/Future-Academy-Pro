import React, { useState, useEffect } from 'react';
import { MCQ, QuizResult } from '../types';
import {
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Award,
  Download,
  RotateCcw,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [quizMode, setQuizMode] = useState<'Practice' | 'Exam'>(mode);
  const [enableNegativeMarking, setEnableNegativeMarking] = useState(false);

  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const timer = setInterval(() => {
      setTimeSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isCompleted]);

  if (!isOpen || questions.length === 0) return null;

  const currentMcq = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

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
      mode: quizMode
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
    const doc = new jsPDF('landscape');

    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('CERTIFICATE OF ACCOMPLISHMENT', 148, 45, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('This is proudly awarded to', 148, 65, { align: 'center' });

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Ahmad Raza (Scholar Candidate)', 148, 85, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `For successfully completing the ${title} (${categoryName}) Test with an overall score of ${scoreData.percentage}%.`,
      148,
      105,
      { align: 'center' }
    );

    doc.setFontSize(11);
    doc.text(`Total Questions: ${questions.length} | Correct: ${scoreData.correct} | Time Taken: ${formatTime(timeSeconds)}`, 148, 125, { align: 'center' });

    doc.text(`Issued by Future Academy Pro Examination Board - Date: ${new Date().toLocaleDateString()}`, 148, 155, { align: 'center' });

    doc.save(`FutureAcademyPro-Certificate-${title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
              {quizMode} Mode ({categoryName})
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">{title}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-400 border border-slate-700">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeSeconds)}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        {!isCompleted ? (
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
                  Practice (Instant Answer)
                </button>
                <button
                  onClick={() => setQuizMode('Exam')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    quizMode === 'Exam'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Timed Exam Mode
                </button>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={enableNegativeMarking}
                  onChange={e => setEnableNegativeMarking(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Negative Marking (-0.25)</span>
              </label>
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
          /* Quiz Result Screen */
          <div className="p-6 text-center">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
              Quiz Completed!
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Here is your overall performance scorecard in {title}.
            </p>

            {(() => {
              const res = calculateScore();
              return (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setIsCompleted(false);
                        setCurrentIndex(0);
                        setUserAnswers({});
                        setTimeSeconds(0);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-4 h-4" /> Retake Test
                    </button>

                    <button
                      onClick={handleDownloadCertificate}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
                    >
                      <Download className="w-4 h-4" /> Download Certificate PDF
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
