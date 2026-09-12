import React, { useState } from 'react';
import { Category, SiteSettings } from '../types';
import {
  BookOpen,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Trophy,
  Sparkles,
  ShieldCheck,
  User,
  ChevronDown,
  Volume2,
  FileText,
  Flame,
  RefreshCw
} from 'lucide-react';

interface HeaderProps {
  settings: SiteSettings;
  categories: Category[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenSearch: () => void;
  onOpenDailyQuiz: () => void;
  isLiveSyncing?: boolean;
  onForceSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  darkMode,
  setDarkMode,
  onOpenSearch,
  onOpenDailyQuiz,
  isLiveSyncing = false,
  onForceSync
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Top Announcement Bar */}
      {settings.isAnnouncementActive && settings.announcementText && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
          <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          <span className="truncate">{settings.announcementText}</span>
          <button
            onClick={onOpenDailyQuiz}
            className="underline font-bold text-amber-200 hover:text-white shrink-0 ml-1"
          >
            Take Quiz Now →
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('home');
              setSelectedCategory(null);
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white block leading-none">
                {settings.siteName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase block mt-0.5">
                Exam Prep Portal
              </span>
            </div>
          </button>
        </div>

        {/* Center Search Launcher & Nav */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => {
              setActiveTab('home');
              setSelectedCategory(null);
            }}
            className={`transition hover:text-emerald-600 dark:hover:text-emerald-400 ${
              activeTab === 'home' && !selectedCategory
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : ''
            }`}
          >
            Home
          </button>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center gap-1 transition hover:text-emerald-600 dark:hover:text-emerald-400 py-2"
            >
              <span>Categories</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {categoryDropdownOpen && (
              <div
                className="absolute top-full left-0 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 grid grid-cols-1 gap-1 z-50 max-h-96 overflow-y-auto animate-fadeIn"
                onMouseLeave={() => setCategoryDropdownOpen(false)}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  All Exam Subjects ({categories.length})
                </div>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setActiveTab('categories');
                      setCategoryDropdownOpen(false);
                    }}
                    className="flex items-center justify-between text-left text-xs px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {cat.questionCount}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenDailyQuiz}
            className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Daily Quiz
          </button>

          <button
            onClick={() => {
              setActiveTab('blog');
              setSelectedCategory(null);
            }}
            className={`transition hover:text-emerald-600 dark:hover:text-emerald-400 ${
              activeTab === 'blog' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
            }`}
          >
            Exam Guides
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSearch}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-2 transition"
            title="Search MCQs or ask AI"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Search MCQs / AI...</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title="Toggle Dark/Light Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Cross-device live sync button */}
          {onForceSync && (
            <button
              onClick={onForceSync}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Click to sync all questions & settings across all devices"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isLiveSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {isLiveSyncing ? 'Syncing...' : 'Live Sync'}
              </span>
            </button>
          )}

          {activeTab === 'admin' && (
            <button
              onClick={() => {
                setActiveTab('home');
                setSelectedCategory(null);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold transition shadow-sm"
              title="Exit Admin and return to website"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Exit Admin
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-fadeIn">
          <button
            onClick={() => {
              setActiveTab('home');
              setSelectedCategory(null);
              setMobileMenuOpen(false);
            }}
            className="w-full text-left font-medium py-2 text-sm text-slate-800 dark:text-slate-200"
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveTab('categories');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left font-medium py-2 text-sm text-slate-800 dark:text-slate-200"
          >
            All Categories ({categories.length})
          </button>
          <button
            onClick={() => {
              onOpenDailyQuiz();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left font-semibold py-2 text-sm text-emerald-600"
          >
            ⚡ Daily Quiz Practice
          </button>
          <button
            onClick={() => {
              setActiveTab('blog');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left font-medium py-2 text-sm text-slate-800 dark:text-slate-200"
          >
            Exam Preparation Blog
          </button>
          {activeTab === 'admin' && (
            <button
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left font-bold py-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" /> Exit Admin Panel
            </button>
          )}
        </div>
      )}
    </header>
  );
};
