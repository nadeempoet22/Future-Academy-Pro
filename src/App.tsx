import React, { useState, useEffect, useRef } from 'react';
import { MCQ, Category, SiteSettings, UserProfile, BlogPost, QuizResult } from './types';
import {
  initialSiteSettings,
  initialCategories,
  initialMcqs,
  initialUserProfile,
  initialBlogPosts
} from './data/seedData';
import {
  subscribeToCloudMcqs,
  saveMultipleMcqsToCloud,
  subscribeToCloudCategories,
  subscribeToCloudSettings
} from './lib/firebase';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdBanner } from './components/AdBanner';
import { MCQCard } from './components/MCQCard';
import { CategoryGrid } from './components/CategoryGrid';
import { QuizModal } from './components/QuizModal';
import { AISearchModal } from './components/AISearchModal';
import { AdminPanel } from './components/AdminPanel';
import { BlogSection } from './components/BlogSection';
import { LegalModals } from './components/LegalModals';
import { generateRandomQuiz } from './utils/quizRandomizer';
import { enrichCategoriesWithLiveCounts, isMcqInCategory } from './utils/categoryHelper';
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
  Users,
  Sun,
  Moon,
  Radio,
  RefreshCw
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
  // Global Theme Mode with localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('futureacademy_theme');
        if (savedTheme !== null) {
          return savedTheme === 'dark';
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch {}
    }
    return false;
  });

  // App Navigation & Selected Category - Always starts on 'home' when refreshed
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'blog' | 'user' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [adminCategoryForAdd, setAdminCategoryForAdd] = useState<string | null>(null);

  // Data State with resilient local defaults (instant load & offline/Vercel support)
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('futureacademy_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          let updated = false;
          if (parsed && (parsed.contactPhone === '+92 300 1234567' || !parsed.contactPhone)) {
            parsed.contactPhone = '+92 326 3624500';
            updated = true;
          }
          if (parsed && (parsed.address === 'Constitution Avenue, Sector G-5/1, Islamabad, Pakistan' || !parsed.address)) {
            parsed.address = 'Agriculture Work Shop, Dadu, Sindh, Pakistan';
            updated = true;
          }
          if (parsed && !parsed.certificatePayment) {
            parsed.certificatePayment = initialSiteSettings.certificatePayment;
            updated = true;
          }
          if (updated) {
            localStorage.setItem('futureacademy_settings', JSON.stringify(parsed));
          }
          return parsed;
        }
      } catch {}
    }
    return initialSiteSettings;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('futureacademy_categories');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return initialCategories;
  });

  const [allLocalMcqs, setAllLocalMcqs] = useState<MCQ[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('futureacademy_mcqs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Smart sync: merge any new initialMcqs by ID so every category gets its 10 questions
            const existingIds = new Set(parsed.map((m: MCQ) => m.id));
            const missing = initialMcqs.filter(m => !existingIds.has(m.id));
            if (missing.length > 0) {
              const merged = [...parsed, ...missing];
              localStorage.setItem('futureacademy_mcqs', JSON.stringify(merged));
              return merged;
            }
            return parsed;
          }
        }
      } catch {}
    }
    return initialMcqs;
  });

  const [mcqs, setMcqs] = useState<MCQ[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('futureacademy_mcqs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 10);
        }
      } catch {}
    }
    return initialMcqs.slice(0, 10);
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('futureacademy_user_profile');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialUserProfile;
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('futureacademy_blog_posts');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialBlogPosts;
  });

  // Dynamic Real-Time Category State: Automatically calculates live question count for every category based on current MCQs pool
  const liveCategories = React.useMemo(() => {
    return enrichCategoriesWithLiveCounts(categories, allLocalMcqs);
  }, [categories, allLocalMcqs]);

  // Keep localStorage categories synchronized with live dynamic question counts
  useEffect(() => {
    if (liveCategories && liveCategories.length > 0) {
      try {
        localStorage.setItem('futureacademy_categories', JSON.stringify(liveCategories));
      } catch {}
    }
  }, [liveCategories]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(() => Math.max(1, Math.ceil(initialMcqs.length / 10)));
  const [totalMcqsCount, setTotalMcqsCount] = useState(() => initialMcqs.length);

  // Modals
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Daily Practice Quiz');
  const [quizCategory, setQuizCategory] = useState('General');
  const [quizMcqList, setQuizMcqList] = useState<MCQ[]>([]);
  const [legalModalTitle, setLegalModalTitle] = useState<string | null>(null);

  // Real-Time Cross-Device Synchronization State (Mobile, Laptop, PC)
  const [syncVersion, setSyncVersion] = useState<number>(0);
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<{ title: string; detail: string } | null>(null);
  const syncVersionRef = useRef<number>(0);

  // Apply dark mode class to html and body element and persist in localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      if (document.body) document.body.classList.add('dark');
      try {
        localStorage.setItem('futureacademy_theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      if (document.body) document.body.classList.remove('dark');
      try {
        localStorage.setItem('futureacademy_theme', 'light');
      } catch {}
    }
  }, [darkMode]);

  // URL route monitoring: ensure refresh returns to Home page, while preserving Ctrl+Shift+A or Alt+A shortcut
  useEffect(() => {
    // When the page refreshes, clear any leftover hash/subroute to land squarely on Home
    if (typeof window !== 'undefined') {
      if (window.location.hash || window.location.pathname === '/admin') {
        window.history.replaceState(null, '', window.location.pathname === '/admin' ? '/' : window.location.pathname + window.location.search);
      }
    }

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

  // Initial Data Fetching with safe error recovery
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data && data.siteName) {
          setSettings(data);
          localStorage.setItem('futureacademy_settings', JSON.stringify(data));
        }
      }
    } catch {
      // Use local settings gracefully
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          localStorage.setItem('futureacademy_categories', JSON.stringify(data));
        }
      }
    } catch {
      // Use local categories gracefully
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
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data && Array.isArray(data.mcqs) && (data.total >= allLocalMcqs.length || !allLocalMcqs.length)) {
          setMcqs(data.mcqs);
          setTotalPages(data.totalPages || 1);
          setTotalMcqsCount(data.total || data.mcqs.length);
          return;
        }
      }
    } catch {
      // Use local MCQs filtering fallback
    }

    // Local Fallback Filter Engine (works 100% offline & on static Vercel)
    let currentPool = [...allLocalMcqs];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('futureacademy_mcqs');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentPool = parsed;
          }
        } catch {}
      }
    }

    let filtered = [...currentPool];
    if (selectedCategory) {
      filtered = filtered.filter(m => isMcqInCategory(m, selectedCategory));
    }
    if (difficultyFilter !== 'All') {
      filtered = filtered.filter(m => m.difficulty.toLowerCase() === difficultyFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const qClean = q.replace(/[^a-z0-9\s]/g, ' ');
      const stopWords = new Set(['who', 'is', 'the', 'of', 'in', 'and', 'what', 'which', 'was', 'were', 'to', 'for', 'a', 'an', 'are', 'how']);
      const tokens = qClean.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));

      filtered = filtered.filter(m => {
        const qText = m.question.toLowerCase();
        const expText = (m.explanation || '').toLowerCase();
        const catText = (m.category || '').toLowerCase();
        const tagsText = (m.tags || []).join(' ').toLowerCase();
        const optionsText = (m.options || []).map(o => o.text).join(' ').toLowerCase();

        // Exact phrase
        if (qText.includes(q) || expText.includes(q) || catText.includes(q) || tagsText.includes(q)) {
          return true;
        }

        // Acronym match: pm -> prime minister
        if (tokens.includes('pm') && (qText.includes('prime minister') || tagsText.includes('prime minister') || expText.includes('prime minister'))) {
          return true;
        }

        // Token match: at least one core token matches
        if (tokens.length > 0) {
          const matchCount = tokens.filter(t =>
            qText.includes(t) ||
            expText.includes(t) ||
            catText.includes(t) ||
            tagsText.includes(t) ||
            optionsText.includes(t)
          ).length;
          return matchCount > 0;
        }

        return false;
      });
    }

    if (sortBy === 'most_viewed') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'most_liked') {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      // newest
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const limit = 10;
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const startIdx = (currentPage - 1) * limit;
    const paged = filtered.slice(startIdx, startIdx + limit);

    setMcqs(paged);
    setTotalPages(pages);
    setTotalMcqsCount(total);
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data && data.name) {
          setUserProfile(data);
          localStorage.setItem('futureacademy_user_profile', JSON.stringify(data));
        }
      }
    } catch {
      // Use local user profile
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBlogPosts(data);
          localStorage.setItem('futureacademy_blog_posts', JSON.stringify(data));
        }
      }
    } catch {
      // Use local blog posts
    }
  };

  // Fetch full set of MCQs to guarantee sync with offline cache & quizzes
  const fetchAllMcqs = async () => {
    try {
      const res = await fetch(`/api/mcqs/all?t=${Date.now()}`);
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data && Array.isArray(data.mcqs) && data.mcqs.length > 0) {
          setAllLocalMcqs(data.mcqs);
          localStorage.setItem('futureacademy_mcqs', JSON.stringify(data.mcqs));
        }
      }
    } catch {
      // Use local MCQs
    }
  };

  // Real-Time Cross-Device Sync Engine: Checks server version and pulls updates immediately
  const checkLiveSync = async (force: boolean = false) => {
    try {
      setIsLiveSyncing(true);
      const res = await fetch(`/api/sync/status?t=${Date.now()}`);
      if (!res.ok) return;
      const status = await res.json();
      if (!status || typeof status.version !== 'number') return;

      const serverVer = status.version;
      const currentVer = syncVersionRef.current;

      // Initial check on page boot
      if (currentVer === 0) {
        syncVersionRef.current = serverVer;
        setSyncVersion(serverVer);
        fetchAllMcqs();
        return;
      }

      // If server version increased or forced by user/admin
      if (serverVer > currentVer || force) {
        syncVersionRef.current = serverVer;
        setSyncVersion(serverVer);

        // Fetch fresh state across all systems
        await Promise.all([
          fetchSettings(),
          fetchCategories(),
          fetchMcqs(),
          fetchAllMcqs(),
          fetchBlogPosts()
        ]);

        const actionNote = status.lastAction || 'Admin ne website settings aur questions update kiye hain';
        setSyncNotice({
          title: '⚡ Real-Time Update Synced!',
          detail: `${actionNote} (تمام ڈیوائسز: Mobile & PC پر اپڈیٹ ہوچکا ہے)`
        });

        setTimeout(() => {
          setSyncNotice(null);
        }, 5000);
      }
    } catch {
      // Ignore transient network errors
    } finally {
      setIsLiveSyncing(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCategories();
    fetchUserProfile();
    fetchBlogPosts();
    fetchAllMcqs();
    checkLiveSync(false);

    // 1. Subscribe to real-time Cloud Firestore MCQs across all devices (Mobile & PC)
    const unsubCloudMcqs = subscribeToCloudMcqs(async (cloudList) => {
      if (cloudList && cloudList.length > 0) {
        let localSaved: MCQ[] = [];
        try {
          const raw = localStorage.getItem('futureacademy_mcqs');
          if (raw) localSaved = JSON.parse(raw);
        } catch {}

        const cloudIdSet = new Set(cloudList.map(m => m.id));
        const missingInCloud = localSaved.filter(m => !cloudIdSet.has(m.id));

        if (missingInCloud.length > 0) {
          // Push any locally created questions (e.g. 50 new questions added by admin) to Cloud Firestore
          await saveMultipleMcqsToCloud(missingInCloud);
          const combined = [...missingInCloud, ...cloudList];
          setAllLocalMcqs(combined);
          localStorage.setItem('futureacademy_mcqs', JSON.stringify(combined));
        } else {
          setAllLocalMcqs(cloudList);
          localStorage.setItem('futureacademy_mcqs', JSON.stringify(cloudList));
        }
      } else {
        // First-time Cloud Firestore seeding: upload all local MCQs to Cloud so all devices get them
        let toSeed = allLocalMcqs.length > 0 ? allLocalMcqs : initialMcqs;
        try {
          const raw = localStorage.getItem('futureacademy_mcqs');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > toSeed.length) toSeed = parsed;
          }
        } catch {}
        if (toSeed.length > 0) {
          await saveMultipleMcqsToCloud(toSeed);
        }
      }
    });

    // 2. Subscribe to real-time Cloud Categories
    const unsubCloudCats = subscribeToCloudCategories((cloudCats) => {
      if (cloudCats && cloudCats.length > 0) {
        setCategories(cloudCats);
        localStorage.setItem('futureacademy_categories', JSON.stringify(cloudCats));
      }
    });

    // 3. Subscribe to real-time Cloud Site Settings
    const unsubCloudSettings = subscribeToCloudSettings((cloudSettings) => {
      if (cloudSettings) {
        setSettings(cloudSettings);
        localStorage.setItem('futureacademy_site_settings', JSON.stringify(cloudSettings));
      }
    });

    // Heartbeat every 4 seconds: detects new questions or settings added by admin on any device
    const syncInterval = setInterval(() => {
      checkLiveSync(false);
    }, 4000);

    // Instant update when user switches back to browser or unlocks mobile screen
    const onScreenActive = () => {
      if (document.visibilityState === 'visible') {
        checkLiveSync(false);
      }
    };

    window.addEventListener('focus', onScreenActive);
    document.addEventListener('visibilitychange', onScreenActive);

    return () => {
      unsubCloudMcqs();
      unsubCloudCats();
      unsubCloudSettings();
      clearInterval(syncInterval);
      window.removeEventListener('focus', onScreenActive);
      document.removeEventListener('visibilitychange', onScreenActive);
    };
  }, []);

  useEffect(() => {
    fetchMcqs();
  }, [selectedCategory, difficultyFilter, sortBy, currentPage, searchQuery, allLocalMcqs]);

  const handlePageChange = (newPage: number) => {
    const targetPage = Math.max(1, Math.min(totalPages, newPage));
    setCurrentPage(targetPage);
    setTimeout(() => {
      const el = document.getElementById('mcq-feed-top');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }
    }, 50);
  };

  // Launch Daily Quiz (Generates 50 fresh random MCQs)
  const handleLaunchDailyQuiz = async () => {
    try {
      const res = await fetch('/api/quiz/daily');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuizTitle('Daily FPSC/PPSC Quiz (50 MCQs)');
          setQuizCategory('General');
          setQuizMcqList(data.questions);
          setQuizModalOpen(true);
          return;
        }
      }
    } catch {
      // Local fallback
    }

    const pool = allLocalMcqs.length > 0 ? allLocalMcqs : initialMcqs;
    const randomBatch = generateRandomQuiz({ pool, count: 50, forceFreshRandom: true });
    setQuizTitle('Daily FPSC/PPSC Quiz (50 MCQs)');
    setQuizCategory('General');
    setQuizMcqList(randomBatch.questions);
    setQuizModalOpen(true);
  };

  // Launch Category Quiz (Generates 50 fresh random MCQs for category)
  const handleLaunchCategoryQuiz = async (catName: string) => {
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: catName, count: 50 })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuizTitle(`${catName} Test (50 MCQs)`);
          setQuizCategory(catName);
          setQuizMcqList(data.questions);
          setQuizModalOpen(true);
          return;
        }
      }
    } catch {
      // Local fallback
    }

    const pool = allLocalMcqs.length > 0 ? allLocalMcqs : initialMcqs;
    const randomBatch = generateRandomQuiz({
      pool,
      count: 50,
      category: catName,
      forceFreshRandom: true
    });
    setQuizTitle(`${catName} Test (50 MCQs)`);
    setQuizCategory(catName);
    setQuizMcqList(randomBatch.questions);
    setQuizModalOpen(true);
  };

  // Launch Custom Bookmark Quiz
  const handleLaunchBookmarkQuiz = (bookmarkedMcqs: MCQ[]) => {
    setQuizTitle('Saved Bookmarks Revision Test');
    setQuizCategory('Bookmarks');
    setQuizMcqList(bookmarkedMcqs);
    setQuizModalOpen(true);
  };

  const handleBookmarkToggle = async (mcqId: string) => {
    let currentBookmarks = [...(userProfile?.bookmarkedMcqIds || [])];
    if (currentBookmarks.includes(mcqId)) {
      currentBookmarks = currentBookmarks.filter(id => id !== mcqId);
    } else {
      currentBookmarks.push(mcqId);
    }

    const updatedProfile = { ...userProfile, bookmarkedMcqIds: currentBookmarks };
    setUserProfile(updatedProfile);
    localStorage.setItem('futureacademy_user_profile', JSON.stringify(updatedProfile));

    try {
      await fetch('/api/user/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcqId })
      });
    } catch {}
  };

  const handleQuizComplete = (resultObj: QuizResult) => {
    const updatedHistory = [resultObj, ...(userProfile.quizHistory || [])];
    const updatedPoints = (userProfile.points || 0) + 50;
    const updatedProfile: UserProfile = {
      ...userProfile,
      points: updatedPoints,
      quizHistory: updatedHistory
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('futureacademy_user_profile', JSON.stringify(updatedProfile));
    fetchUserProfile();
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col`}>
      {/* Header Navbar */}
      <Header
        settings={settings}
        categories={liveCategories}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenDailyQuiz={handleLaunchDailyQuiz}
        isLiveSyncing={isLiveSyncing}
        onForceSync={() => checkLiveSync(true)}
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
                      onKeyDown={e => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          setShowSearchModal(true);
                        }
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
                <div id="mcq-feed-top" className="scroll-mt-24" />

                {/* Category Header or Filter Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedCategory ? `Category: ${selectedCategory}` : `All Questions (${totalMcqsCount})`}
                    </span>
                    {selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold underline cursor-pointer"
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
                        className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
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
                        className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <option value="newest">Newest</option>
                        <option value="most-viewed">Most Viewed</option>
                        <option value="most-liked">Most Liked</option>
                        <option value="oldest">Oldest</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Top Pagination Bar: Instantly accessible on mobile and desktop without scrolling */}
                {totalPages > 1 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 px-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 text-xs shadow-sm">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 transition font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-sm min-h-[38px]"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1.5 sm:gap-2 text-center">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Page <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{currentPage}</span> of {totalPages}
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        ({totalMcqsCount} MCQs)
                      </span>
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 transition font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-sm min-h-[38px]"
                      title="Next Page"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                )}

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
                      className="text-xs text-emerald-600 font-bold underline cursor-pointer"
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

                {/* Bottom Pagination Controls */}
                {totalPages > 1 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm mb-12 sm:mb-6">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 disabled:opacity-40 transition font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed text-xs sm:text-sm min-h-[44px] shadow-sm"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-4 h-4 shrink-0" />
                        <span>Previous</span>
                      </button>

                      <div className="text-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm block">
                          Page <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{currentPage}</span> of {totalPages}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {totalMcqsCount} Solved MCQs Available
                        </span>
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 disabled:opacity-40 transition font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed text-xs sm:text-sm min-h-[44px] shadow-sm"
                        title="Next Page"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </button>
                    </div>

                    {/* Quick Page Jump Pills (1, 2, 3...) */}
                    <div className="flex items-center justify-center gap-1.5 flex-wrap pt-3 border-t border-slate-100 dark:border-slate-800">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 7 && currentPage > 4) {
                          pageNum = currentPage - 3 + i;
                          if (pageNum > totalPages) pageNum = totalPages - (6 - i);
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`min-w-[34px] h-[34px] px-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                              currentPage === pageNum
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
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
                    {liveCategories.slice(0, 8).map(cat => (
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
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold">
                          {cat.questionCount}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTab('categories')}
                    className="w-full mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center block hover:underline"
                  >
                    View All {liveCategories.length} Categories →
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
            categories={liveCategories}
            onSelectCategory={catName => {
              setSelectedCategory(catName);
              handleTabChange('home');
            }}
            onStartCategoryQuiz={handleLaunchCategoryQuiz}
          />
        )}

        {/* Tab: Exam Guides Blog */}
        {activeTab === 'blog' && <BlogSection posts={blogPosts} />}

        {/* Tab: Admin Dashboard */}
        {activeTab === 'admin' && (
          <AdminPanel
            settings={settings}
            categories={liveCategories}
            mcqs={allLocalMcqs}
            initialCategoryForMcq={adminCategoryForAdd}
            onUpdateSettings={setSettings}
            onUpdateAllMcqs={(updatedList) => {
              setAllLocalMcqs(updatedList);
              localStorage.setItem('futureacademy_mcqs', JSON.stringify(updatedList));
            }}
            onRefreshMcqs={async () => {
              try {
                const raw = localStorage.getItem('futureacademy_mcqs');
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    setAllLocalMcqs(parsed);
                  }
                }
              } catch {}
              await Promise.all([fetchMcqs(), fetchAllMcqs()]);
              await checkLiveSync(true);
            }}
            onRefreshCategories={async () => {
              await fetchCategories();
              await checkLiveSync(true);
            }}
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
        allQuestions={allLocalMcqs.length > 0 ? allLocalMcqs : initialMcqs}
        onQuizComplete={handleQuizComplete}
        paymentConfig={settings.certificatePayment}
      />

      {/* AI Smart Search Modal */}
      <AISearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        allMcqs={allLocalMcqs}
        initialQuery={searchQuery}
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

      {/* Real-Time Cross-Device Synchronization Toast Alert */}
      {syncNotice && (
        <div
          role="alert"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/50 backdrop-blur-md flex items-start gap-3 transition-all animate-bounce"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1 pr-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{syncNotice.title}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{syncNotice.detail}</p>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile Sticky Quick Pagination Bar - Guaranteed visible on all mobile devices when viewing questions */}
      {activeTab === 'home' && totalPages > 1 && (
        <div
          id="mobile-sticky-pagination-bar"
          className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 shadow-2xl flex items-center justify-between gap-2"
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 disabled:opacity-30 border border-slate-200 dark:border-slate-700 min-h-[40px] cursor-pointer disabled:cursor-not-allowed active:scale-95 transition"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" /> Previous
          </button>

          <div className="text-center px-1">
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
              Page {currentPage} of {totalPages}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              {totalMcqsCount} Solved MCQs
            </span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 disabled:opacity-30 border border-slate-200 dark:border-slate-700 min-h-[40px] cursor-pointer disabled:cursor-not-allowed active:scale-95 transition"
            title="Next Page"
          >
            Next <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      )}

      {/* Floating Dark / Light Mode Toggle Button (Fixed Bottom-Right, elevated above mobile bar) */}
      <aside aria-label="Theme switcher">
        <button
          id="floating-theme-toggle"
          onClick={() => setDarkMode(prev => !prev)}
          className={`fixed right-4 sm:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 border border-slate-200/90 dark:border-slate-700 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 group backdrop-blur-sm cursor-pointer ${
            activeTab === 'home' && totalPages > 1 ? 'bottom-16 sm:bottom-6' : 'bottom-5 sm:bottom-6'
          }`}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700 transition-transform duration-300 group-hover:-rotate-12" />
          )}
        </button>
      </aside>
    </div>
  );
}
