import React, { useState, useEffect } from 'react';
import { MCQ, Category, SiteSettings, UserProfile, BlogPost, QuizResult } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdBanner } from './components/AdBanner';
import { MCQCard } from './components/MCQCard';
import { CategoryGrid } from './components/CategoryGrid';
import { QuizModal } from './components/QuizModal';
import { AISearchModal } from './components/AISearchModal';
import { UserPortal } from './components/UserPortal';
import { AdminPanel } from './components/AdminPanel';
import { BlogSection } from './components/BlogSection';
import { LegalModals } from './components/LegalModals';
import {
  Search,
  Sparkles,
  Flame,
  CheckCircle2,
  BookOpen,
  Award,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Zap,
  Star,
  Users
} from 'lucide-react';

const checkIsAdminRoute = () => {
  if (typeof window === 'undefined') return false;
  const hash = (window.location.hash || '').toLowerCase();
  const path = (window.location.pathname || '').toLowerCase();
  const search = (window.location.search || '').toLowerCase();
  return (
    hash === '#admin' ||
    hash.startsWith('#admin') ||
    path === '/admin' ||
    path.startsWith('/admin') ||
    search.includes('admin=true') ||
    search.includes('tab=admin')
  );
};

export default function App() {
  // Global Theme Mode
  const [darkMode, setDarkMode] = useState(false);

  // App Navigation & Selected Category
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'blog' | 'user' | 'admin'>(() => {
    return checkIsAdminRoute() ? 'admin' : 'home';
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [adminCategoryForAdd, setAdminCategoryForAdd] = useState<string | null>(null);

  // Data State
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMcqsCount, setTotalMcqsCount] = useState(0);

  // Modals
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Daily Practice Quiz');
  const [quizCategory, setQuizCategory] = useState('General');
  const [quizMcqList, setQuizMcqList] = useState<MCQ[]>([]);
  const [legalModalTitle, setLegalModalTitle] = useState<string | null>(null);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // URL route monitoring: #admin or /admin opens admin panel
  useEffect(() => {
    const handleUrlRoute = () => {
      if (checkIsAdminRoute()) {
        setActiveTab('admin');
        setSelectedCategory(null);
      }
    };

    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);

    // Secret shortcut: Ctrl+Shift+A or Alt+A opens Admin Panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
        (e.altKey && (e.key === 'a' || e.key === 'A'))
      ) {
        e.preventDefault();
        window.location.hash = 'admin';
        setActiveTab('admin');
        setSelectedCategory(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    const nextTab = tab as 'home' | 'categories' | 'blog' | 'user' | 'admin';
    setActiveTab(nextTab);
    if (nextTab !== 'admin') {
      if (window.location.hash.toLowerCase().includes('admin')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      if (window.location.pathname.toLowerCase() === '/admin') {
        window.history.replaceState(null, '', '/');
      }
    }
  };

  const handleExitAdmin = () => {
    setActiveTab('home');
    if (window.location.hash.toLowerCase().includes('admin')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (window.location.pathname.toLowerCase() === '/admin') {
      window.history.replaceState(null, '', '/');
    }
  };

  // Initial Data Fetching
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMcqs = async () => {
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '10',
        sort: sortBy
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (difficultyFilter !== 'All') params.append('difficulty', difficultyFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/mcqs?${params.toString()}`);
      const data = await res.json();
      setMcqs(data.mcqs || []);
      setTotalPages(data.totalPages || 1);
      setTotalMcqsCount(data.total || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setUserProfile(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      setBlogPosts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCategories();
    fetchUserProfile();
    fetchBlogPosts();
  }, []);

  useEffect(() => {
    fetchMcqs();
  }, [selectedCategory, difficultyFilter, sortBy, currentPage, searchQuery]);

  // Launch Daily Quiz
  const handleLaunchDailyQuiz = async () => {
    try {
      const res = await fetch('/api/quiz/daily');
      const data = await res.json();
      setQuizTitle('Daily FPSC/PPSC Quiz');
      setQuizCategory('General');
      setQuizMcqList(data.questions || []);
      setQuizModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Launch Category Quiz
  const handleLaunchCategoryQuiz = async (catName: string) => {
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: catName, count: 10 })
      });
      const data = await res.json();
      setQuizTitle(`${catName} Test`);
      setQuizCategory(catName);
      setQuizMcqList(data.questions || []);
      setQuizModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Launch Custom Bookmark Quiz
  const handleLaunchBookmarkQuiz = (bookmarkedMcqs: MCQ[]) => {
    setQuizTitle('Saved Bookmarks Revision Test');
    setQuizCategory('Bookmarks');
    setQuizMcqList(bookmarkedMcqs);
    setQuizModalOpen(true);
  };

  const handleBookmarkToggle = async (mcqId: string) => {
    try {
      const res = await fetch('/api/user/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcqId })
      });
      const data = await res.json();
      if (userProfile) {
        setUserProfile({ ...userProfile, bookmarkedMcqIds: data.bookmarkedMcqIds });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Loading Future Academy Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">
      {/* Header Navbar */}
      <Header
        settings={settings}
        categories={categories}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenDailyQuiz={handleLaunchDailyQuiz}
      />

      {/* Top Banner Ad Place */}
      <AdBanner type="header" adConfig={settings.adConfig} />

      {/* Main Page Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6">
        {activeTab === 'home' && (
          <div className="py-6 space-y-10">
            {/* Hero Section */}
            {!selectedCategory && (
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-3xl space-y-5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" /> Pakistan’s #1 MCQ & Exam Prep Engine
                  </span>

                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    Prepare for FPSC, PPSC, NTS, CSS & Defense Tests with 50,000+ Solved MCQs
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Access verified subject-wise MCQs, instant answers with detailed explanations, AI concept tutors, and timed exam practice tests.
                  </p>

                  {/* Main Search Bar */}
                  <div className="relative max-w-xl">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search questions e.g. 'Pakistan Affairs', 'Prepositions', 'MS Word'..."
                      className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => setShowSearchModal(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1 shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> AI Search
                    </button>
                  </div>

                  {/* Quick Category Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                    <span className="text-slate-400 font-semibold">Popular:</span>
                    {[
                      'Pakistan Affairs',
                      'Current Affairs',
                      'English MCQs',
                      'Computer Science',
                      'Islamic Studies',
                      'Everyday Science'
                    ].map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCurrentPage(1);
                        }}
                        className="bg-slate-800/80 hover:bg-emerald-600 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animated Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 text-center text-xs">
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 block">50,000+</span>
                    <span className="text-slate-400 font-medium">Solved MCQs</span>
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 block">100%</span>
                    <span className="text-slate-400 font-medium">FPSC / PPSC Verified</span>
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-indigo-400 block">12,800+</span>
                    <span className="text-slate-400 font-medium">Quizzes Solved</span>
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-teal-400 block">30+</span>
                    <span className="text-slate-400 font-medium">Subject Categories</span>
                  </div>
                </div>
              </div>
            )}

            {/* Layout: Main Feed + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: MCQ Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Category Header or Filter Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedCategory ? `Category: ${selectedCategory}` : `All Questions (${totalMcqsCount})`}
                    </span>
                    {selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold underline"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-slate-500">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Difficulty:</span>
                      <select
                        value={difficultyFilter}
                        onChange={e => setDifficultyFilter(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 font-semibold text-slate-700 dark:text-slate-200"
                      >
                        <option value="All">All</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Sort:</span>
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 font-semibold text-slate-700 dark:text-slate-200"
                      >
                        <option value="newest">Newest</option>
                        <option value="most-viewed">Most Viewed</option>
                        <option value="most-liked">Most Liked</option>
                        <option value="oldest">Oldest</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* MCQs List */}
                {mcqs.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                    <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      No questions found matching your criteria.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchQuery('');
                        setDifficultyFilter('All');
                      }}
                      className="text-xs text-emerald-600 font-bold underline"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  mcqs.map((mcq, idx) => (
                    <React.Fragment key={mcq.id}>
                      <MCQCard
                        mcq={mcq}
                        isBookmarked={userProfile?.bookmarkedMcqIds.includes(mcq.id)}
                        onBookmarkToggle={handleBookmarkToggle}
                        onSelectCategory={cat => {
                          setSelectedCategory(cat);
                          setCurrentPage(1);
                        }}
                      />
                      {/* In-Content Sponsored Ad after 2nd question */}
                      {idx === 2 && <AdBanner type="inContent" adConfig={settings.adConfig} />}
                    </React.Fragment>
                  ))
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 disabled:opacity-40 transition font-semibold flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <span className="font-bold text-slate-500">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 disabled:opacity-40 transition font-semibold flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Daily Quiz Card */}
                <div id="daily-quiz" className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
                      Featured Challenge
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    ⚡ Today’s FPSC / PPSC Practice Quiz
                  </h3>
                  <p className="text-xs text-emerald-100 mb-4 leading-relaxed">
                    Test your preparation with 10 random mixed questions. Instant feedback & scorecard download.
                  </p>
                  <button
                    onClick={handleLaunchDailyQuiz}
                    className="w-full bg-white text-emerald-900 font-extrabold text-xs py-3 rounded-2xl hover:bg-emerald-50 transition shadow flex items-center justify-center gap-1.5"
                  >
                    Start Daily Quiz Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Categories List Widget */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                    Top Subject Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.slice(0, 8).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                          selectedCategory === cat.name
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                          {cat.questionCount}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTab('categories')}
                    className="w-full mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center block hover:underline"
                  >
                    View All {categories.length} Categories →
                  </button>
                </div>

                {/* Sidebar Ad Placement */}
                <AdBanner type="sidebar" adConfig={settings.adConfig} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: All Categories Page */}
        {activeTab === 'categories' && (
          <CategoryGrid
            categories={categories}
            onSelectCategory={catName => {
              setSelectedCategory(catName);
              handleTabChange('home');
            }}
            onStartCategoryQuiz={handleLaunchCategoryQuiz}
          />
        )}

        {/* Tab: Exam Guides Blog */}
        {activeTab === 'blog' && <BlogSection posts={blogPosts} />}

        {/* Tab: Scholar User Portal */}
        {activeTab === 'user' && userProfile && (
          <UserPortal
            user={userProfile}
            allMcqs={mcqs}
            onStartBookmarkQuiz={handleLaunchBookmarkQuiz}
            onBookmarkToggle={handleBookmarkToggle}
          />
        )}

        {/* Tab: Admin Dashboard */}
        {activeTab === 'admin' && (
          <AdminPanel
            settings={settings}
            categories={categories}
            mcqs={mcqs}
            initialCategoryForMcq={adminCategoryForAdd}
            onUpdateSettings={setSettings}
            onRefreshMcqs={fetchMcqs}
            onRefreshCategories={fetchCategories}
            onExitAdmin={handleExitAdmin}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenLegalModal={title => setLegalModalTitle(title)}
        onSelectCategory={catName => {
          setSelectedCategory(catName);
          handleTabChange('home');
        }}
      />

      {/* Interactive Quiz Modal */}
      <QuizModal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        title={quizTitle}
        categoryName={quizCategory}
        questions={quizMcqList}
        onQuizComplete={res => fetchUserProfile()}
      />

      {/* AI Smart Search Modal */}
      <AISearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectMcq={mcqId => {
          setActiveTab('home');
          setTimeout(() => {
            const el = document.getElementById(`mcq-${mcqId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }}
      />

      {/* Legal Information Modals */}
      <LegalModals
        pageTitle={legalModalTitle}
        onClose={() => setLegalModalTitle(null)}
        settings={settings}
      />
    </div>
  );
}
