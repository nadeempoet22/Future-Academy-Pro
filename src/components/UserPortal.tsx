import React from 'react';
import { UserProfile, MCQ } from '../types';
import { MCQCard } from './MCQCard';
import {
  Trophy,
  Flame,
  Award,
  Bookmark,
  History,
  CheckCircle,
  Clock,
  Play,
  UserCheck,
  Star
} from 'lucide-react';

interface UserPortalProps {
  user: UserProfile;
  allMcqs: MCQ[];
  onStartBookmarkQuiz: (bookmarkedMcqs: MCQ[]) => void;
  onBookmarkToggle: (mcqId: string) => void;
}

export const UserPortal: React.FC<UserPortalProps> = ({
  user,
  allMcqs,
  onStartBookmarkQuiz,
  onBookmarkToggle
}) => {
  const [activeTab, setActiveTab] = React.useState<'bookmarks' | 'history' | 'achievements' | 'leaderboard'>('bookmarks');

  const bookmarkedMcqList = allMcqs.filter(m => user.bookmarkedMcqIds.includes(m.id));

  return (
    <div className="py-8 space-y-8">
      {/* User Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-emerald-500 shadow-lg object-cover"
            />
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {user.rank}
                </span>
                <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> {user.streakDays} Days Streak
                </span>
              </div>
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl">
            <div className="text-center px-4 border-r border-slate-700">
              <span className="text-2xl font-black text-amber-400">{user.points}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Scholar Points</span>
            </div>
            <div className="text-center px-4">
              <span className="text-2xl font-black text-emerald-400">{user.quizHistory.length}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Quizzes Taken</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'bookmarks'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" /> Bookmarked MCQs ({bookmarkedMcqList.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Quiz History ({user.quizHistory.length})
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'achievements'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" /> Badges ({user.achievements.length})
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'leaderboard'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" /> Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Your Saved Bookmarks ({bookmarkedMcqList.length})
            </h3>

            {bookmarkedMcqList.length > 0 && (
              <button
                onClick={() => onStartBookmarkQuiz(bookmarkedMcqList)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Practice Bookmark Quiz
              </button>
            )}
          </div>

          {bookmarkedMcqList.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-8 text-center text-slate-400 text-xs">
              No bookmarked MCQs yet. Click the bookmark icon on any question to save it for revision!
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarkedMcqList.map(mcq => (
                <MCQCard
                  key={mcq.id}
                  mcq={mcq}
                  isBookmarked={true}
                  onBookmarkToggle={onBookmarkToggle}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Past Test Results
          </h3>

          <div className="space-y-3">
            {user.quizHistory.map(res => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                    {res.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {res.quizTitle}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Completed on {new Date(res.completedAt).toLocaleDateString()} • {res.mode} Mode
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">
                    {res.scorePercentage}%
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {res.correctAnswers} / {res.totalQuestions} Correct
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {user.achievements.map(ach => (
            <div
              key={ach.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4"
            >
              <div className="text-3xl p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                {ach.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {ach.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {ach.description}
                </p>
                {ach.unlockedAt && (
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-2">
                    Unlocked: {ach.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Top Scholar Leaderboard
          </h3>

          <div className="space-y-3">
            {[
              { rank: 1, name: 'Muhammad Rizwan', points: 3420, rankTitle: 'Master Scholar' },
              { rank: 2, name: 'Fatima Zohra', points: 2890, rankTitle: 'Senior Scholar' },
              { rank: 3, name: 'Ahmad Raza (You)', points: user.points, rankTitle: user.rank },
              { rank: 4, name: 'Usman Ghani', points: 1180, rankTitle: 'Gold Scholar' },
              { rank: 5, name: 'Sanaullah', points: 940, rankTitle: 'Silver Scholar' }
            ].map(usr => (
              <div
                key={usr.rank}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  usr.rank === 3
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold">
                    #{usr.rank}
                  </span>
                  <div>
                    <span className="block font-bold">{usr.name}</span>
                    <span className="text-[10px] text-slate-400">{usr.rankTitle}</span>
                  </div>
                </div>
                <span className="font-bold text-amber-500">{usr.points} Points</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
