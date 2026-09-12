import { MCQ, Category, BlogPost, SiteSettings, UserProfile } from '../types';
import { mcqBank1 } from './mcqBank1';
import { mcqBank2 } from './mcqBank2';

export const initialSiteSettings: SiteSettings = {
  siteName: 'Future Academy Pro',
  tagline: 'Pakistan’s Largest & Most Trusted MCQ Bank & Exam Preparation Platform',
  metaTitle: 'Future Academy Pro - FPSC, PPSC, NTS, CSS, PMS MCQs & Quiz Preparation',
  metaDescription: 'Solve 50,000+ solved MCQs for FPSC, PPSC, KPPSC, BPSC, SPSC, NTS, CSS, PMS, General Knowledge, Pakistan Affairs, Current Affairs, Everyday Science, Islamic Studies & Computer Science.',
  keywords: 'Future Academy Pro, FPSC MCQs, PPSC MCQs, NTS Test Prep, CSS Exam MCQs, Pakistan Affairs MCQs, Current Affairs 2026, Computer Science MCQs, Islamic Studies MCQs',
  contactEmail: 'support@futureacademypro.com',
  contactPhone: '+92 326 3624500',
  address: 'Agriculture Work Shop, Dadu, Sindh, Pakistan',
  announcementText: '🔥 New FPSC & PPSC Mock Tests 2026 added! Take the Daily Quiz to boost your score.',
  isAnnouncementActive: true,
  adConfig: {
    headerBannerEnabled: true,
    sidebarAdEnabled: true,
    inContentAdEnabled: true,
    stickyBottomAdEnabled: false,
    customHeaderAdHtml: ''
  },
  certificatePayment: {
    feeAmount: 200,
    currency: 'PKR',
    accountTitle: 'Future Academy Pro / Engr Nadeem Ali',
    bankName: 'NAYA PAY',
    accountNumber: '03482640086',
    instructions: 'Please send RS 200 to our official NAYA PAY account: 03482640086. After transferring, enter your Transaction ID (TID) or sender mobile number below to verify and instantly unlock your official verified certificate.',
    isPaymentRequired: true
  }
};

export const initialCategories: Category[] = [
  {
    id: 'cat-pak-affairs',
    name: 'Pakistan Affairs',
    slug: 'pakistan-affairs',
    description: 'History of Pakistan, Movement, Constitution, Foreign Policy & Current Affairs',
    iconName: 'Landmark',
    questionCount: 10,
    subcategories: [
      { id: 'sub-pre-1947', name: 'Pre 1947 History', slug: 'pre-1947-history', questionCount: 5 },
      { id: 'sub-post-1947', name: 'Post 1947 History', slug: 'post-1947-history', questionCount: 5 }
    ]
  },
  {
    id: 'cat-current-affairs',
    name: 'Current Affairs',
    slug: 'current-affairs',
    description: 'Latest Pakistan & International Current Affairs 2025-2026',
    iconName: 'Globe2',
    questionCount: 10,
    subcategories: [
      { id: 'sub-pak-ca', name: 'Pakistan Current Affairs', slug: 'pakistan-current-affairs', questionCount: 5 },
      { id: 'sub-intl-ca', name: 'World Current Affairs', slug: 'world-current-affairs', questionCount: 5 }
    ]
  },
  {
    id: 'cat-english',
    name: 'English MCQs',
    slug: 'english-mcqs',
    description: 'Grammar, Synonyms, Antonyms, Prepositions, Analogies & Sentence Structure',
    iconName: 'BookOpen',
    questionCount: 10,
    subcategories: [
      { id: 'sub-prepositions', name: 'Prepositions', slug: 'prepositions', questionCount: 4 },
      { id: 'sub-synonyms', name: 'Synonyms & Antonyms', slug: 'synonyms-antonyms', questionCount: 6 }
    ]
  },
  {
    id: 'cat-cs',
    name: 'Computer Science',
    slug: 'computer-science',
    description: 'MS Office, Networking, Data Structures, Web Development, Programming & AI',
    iconName: 'Laptop',
    questionCount: 10,
    subcategories: [
      { id: 'sub-ms-office', name: 'MS Office (Word, Excel, PPT)', slug: 'ms-office', questionCount: 5 },
      { id: 'sub-networking', name: 'Networking & Hardware', slug: 'networking-hardware', questionCount: 5 }
    ]
  },
  {
    id: 'cat-islamic-studies',
    name: 'Islamic Studies',
    slug: 'islamic-studies',
    description: 'Quran, Seerah, Hadith, Ghazwat, Companions, Islamic History & Pillars',
    iconName: 'Moon',
    questionCount: 10,
    subcategories: [
      { id: 'sub-quran', name: 'Holy Quran', slug: 'holy-quran', questionCount: 4 },
      { id: 'sub-seerah', name: 'Seerah & Islamic History', slug: 'seerah-history', questionCount: 6 }
    ]
  },
  {
    id: 'cat-general-science',
    name: 'Everyday Science',
    slug: 'everyday-science',
    description: 'Human Physiology, Solar System, Vitamins, Physics & Chemistry Basics',
    iconName: 'Microscope',
    questionCount: 10,
    subcategories: [
      { id: 'sub-vitamins', name: 'Vitamins & Health', slug: 'vitamins-health', questionCount: 5 },
      { id: 'sub-astronomy', name: 'Solar System & Earth', slug: 'solar-system-earth', questionCount: 5 }
    ]
  },
  {
    id: 'cat-gk',
    name: 'General Knowledge',
    slug: 'general-knowledge',
    description: 'World Capitals, Organs, Boundaries, Famous Places, Discoveries & Oceans',
    iconName: 'Compass',
    questionCount: 10,
    subcategories: [
      { id: 'sub-capitals', name: 'Capitals & Geography', slug: 'capitals-geography', questionCount: 6 },
      { id: 'sub-intl-orgs', name: 'International Organizations', slug: 'international-organizations', questionCount: 4 }
    ]
  },
  {
    id: 'cat-math',
    name: 'Mathematics',
    slug: 'mathematics-mcqs',
    description: 'Algebra, Arithmetic, Geometry, Percentages, Ratios, Averages & Equations',
    iconName: 'Calculator',
    questionCount: 10,
    subcategories: [
      { id: 'sub-ratios', name: 'Ratios & Percentages', slug: 'ratios-percentages', questionCount: 5 },
      { id: 'sub-geometry', name: 'Geometry & Series', slug: 'geometry-series', questionCount: 5 }
    ]
  },
  {
    id: 'cat-fpsc-ppsc',
    name: 'FPSC & PPSC Preparation',
    slug: 'fpsc-ppsc-preparation',
    description: 'Previous Papers Questions for Inspector, Tehsildar, Lecturer & Assistant',
    iconName: 'Award',
    questionCount: 10,
    subcategories: [
      { id: 'sub-fpsc', name: 'FPSC Past Papers', slug: 'fpsc-past-papers', questionCount: 5 },
      { id: 'sub-ppsc', name: 'PPSC Past Papers', slug: 'ppsc-past-papers', questionCount: 5 }
    ]
  },
  {
    id: 'cat-nts-tests',
    name: 'NTS / OTS / PTS Tests',
    slug: 'nts-ots-pts-tests',
    description: 'GAT General, NAT, Educators, Analytical Reasoning & Quantitative',
    iconName: 'FileCheck2',
    questionCount: 10,
    subcategories: [
      { id: 'sub-gat', name: 'GAT Analytical Reasoning', slug: 'gat-analytical', questionCount: 5 },
      { id: 'sub-nat', name: 'Quantitative & Verbal', slug: 'quantitative-verbal', questionCount: 5 }
    ]
  },
  {
    id: 'cat-css-pms',
    name: 'CSS & PMS Exams',
    slug: 'css-pms-exams',
    description: 'Compulsory Subjects, MPT Screening Test, International Relations & Essay',
    iconName: 'GraduationCap',
    questionCount: 10,
    subcategories: [
      { id: 'sub-mpt', name: 'CSS MPT Screening', slug: 'css-mpt-screening', questionCount: 5 },
      { id: 'sub-ir', name: 'International Relations', slug: 'international-relations', questionCount: 5 }
    ]
  },
  {
    id: 'cat-physics',
    name: 'Physics MCQs',
    slug: 'physics-mcqs',
    description: 'Mechanics, Electricity, Magnetism, Optics, Thermodynamics & Modern Physics',
    iconName: 'Atom',
    questionCount: 10,
    subcategories: [
      { id: 'sub-mechanics', name: 'Mechanics & Units', slug: 'mechanics-units', questionCount: 5 },
      { id: 'sub-optics', name: 'Optics & Waves', slug: 'optics-waves', questionCount: 5 }
    ]
  },
  {
    id: 'cat-chemistry',
    name: 'Chemistry MCQs',
    slug: 'chemistry-mcqs',
    description: 'Organic, Inorganic, Physical Chemistry, Periodic Table & Chemical Bonding',
    iconName: 'FlaskConical',
    questionCount: 10,
    subcategories: [
      { id: 'sub-periodic-table', name: 'Periodic Table & Bonding', slug: 'periodic-table-bonding', questionCount: 5 },
      { id: 'sub-physical-chem', name: 'Physical & Everyday Chem', slug: 'physical-everyday-chem', questionCount: 5 }
    ]
  },
  {
    id: 'cat-biology',
    name: 'Biology MCQs',
    slug: 'biology-mcqs',
    description: 'Cell Biology, Genetics, Botany, Zoology, Human Anatomy & Biotechnology',
    iconName: 'Dna',
    questionCount: 10,
    subcategories: [
      { id: 'sub-cell-bio', name: 'Cell Biology & Genetics', slug: 'cell-biology-genetics', questionCount: 5 },
      { id: 'sub-human-anatomy', name: 'Human Anatomy', slug: 'human-anatomy', questionCount: 5 }
    ]
  },
  {
    id: 'cat-defense',
    name: 'Army, Navy & Air Force',
    slug: 'army-navy-airforce-tests',
    description: 'ISSB, Initial Test, Academic Test, Intelligence Test (Verbal/Non-Verbal)',
    iconName: 'ShieldAlert',
    questionCount: 10,
    subcategories: [
      { id: 'sub-issb', name: 'ISSB Preparation', slug: 'issb-preparation', questionCount: 5 },
      { id: 'sub-defense-knowledge', name: 'Defense Knowledge & Ranks', slug: 'defense-knowledge-ranks', questionCount: 5 }
    ]
  },
  {
    id: 'cat-urdu',
    name: 'Urdu MCQs',
    slug: 'urdu-mcqs',
    description: 'Urdu Literature, Grammar, Poets, Books, Idioms & Famous Quotes',
    iconName: 'BookMarked',
    questionCount: 10,
    subcategories: [
      { id: 'sub-urdu-lit', name: 'Urdu Literature', slug: 'urdu-literature', questionCount: 6 },
      { id: 'sub-urdu-grammar', name: 'Urdu Qawaid', slug: 'urdu-qawaid', questionCount: 4 }
    ]
  }
];

export const initialMcqs: MCQ[] = [
  ...mcqBank1,
  ...mcqBank2
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'FPSC Inspector Investigation 2026: Complete Syllabus & Preparation Strategy',
    slug: 'fpsc-inspector-investigation-2026-syllabus-preparation',
    summary: 'A step-by-step master plan to pass the FPSC Inspector Investigation & FIA screening test with top merit.',
    content: `
# FPSC Inspector Investigation 2026 Preparation Guide

Federal Public Service Commission (FPSC) has announced key positions for FIA Inspector Investigation. To secure top marks, candidates must cover:

### Phase 1: MPT & Screening Test Pattern (100 Marks)
1. **English Vocabulary & Grammar**: 20 Marks
2. **General Knowledge & Every Day Science**: 20 Marks
3. **Pakistan Affairs & Islamic Studies**: 20 Marks
4. **Basic Mathematics & Arithmetic**: 20 Marks
5. **FIA Act 1974 & Investigation Rules**: 20 Marks

### Recommended Daily Schedule
- Spend 2 hours daily practicing past MCQs on Future Academy Pro.
- Take at least 1 Timed Exam Quiz per day to improve speed and accuracy under pressure.
- Focus on prepositions, vocabulary antonyms/synonyms, and dates of Pakistan History.
    `,
    category: 'FPSC Exam Guides',
    tags: ['FPSC', 'FIA Inspector', 'Syllabus', 'Test Prep'],
    author: 'Admin Team',
    publishedAt: '2026-02-15',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'
  },
  {
    id: 'post-2',
    title: 'Top 100 Most Repeated Prepositions in PPSC & FPSC Exams',
    slug: 'top-100-repeated-prepositions-ppsc-fpsc',
    summary: 'Master fixed prepositions like "Senior to", "Abide by", "Accused of", and "Conform to" to score 100% in English sections.',
    content: `
# 100 Most Repeated Prepositions in Competitive Exams

Fixed prepositions form the core of English MCQs in PPSC, FPSC, NTS, and CSS exams.

### 10 Critical Preposition Rules:
1. **Senior / Junior / Superior**: Always use **TO** (e.g., He is senior to me).
2. **Abide**: Use **BY** (e.g., You must abide by the rules).
3. **Accused**: Use **OF** (e.g., He was accused of theft).
4. **Prevent**: Use **FROM** (e.g., Prevented him from going).
5. **Comply**: Use **WITH** (e.g., Comply with regulations).
    `,
    category: 'English Grammar Tips',
    tags: ['Prepositions', 'PPSC', 'English MCQs'],
    author: 'Prof. Hassan Raza',
    publishedAt: '2026-02-20',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80'
  }
];

export const initialUserProfile: UserProfile = {
  id: 'usr-guest-001',
  name: 'Ahmad Raza',
  email: 'ahmad.raza@example.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  points: 1250,
  rank: 'Gold Scholar',
  streakDays: 7,
  quizHistory: [
    {
      id: 'qres-101',
      quizTitle: 'Daily Mixed Quiz - 10 Qs',
      category: 'General',
      totalQuestions: 10,
      correctAnswers: 9,
      wrongAnswers: 1,
      skippedQuestions: 0,
      scorePercentage: 90,
      timeTakenSeconds: 240,
      completedAt: '2026-02-26T18:30:00Z',
      mode: 'Practice'
    }
  ],
  bookmarkedMcqIds: ['mcq-1', 'mcq-3', 'mcq-6', 'mcq-9'],
  achievements: [
    { id: 'ach-1', title: 'First Steps', description: 'Completed your first 5 MCQs quiz', icon: '🎯', unlockedAt: '2026-01-10' },
    { id: 'ach-2', title: 'Weekly Warrior', description: '7 Days active streak achieved', icon: '🔥', unlockedAt: '2026-02-20' },
    { id: 'ach-3', title: 'Precision Master', description: 'Scored 90%+ in an Exam Mode Quiz', icon: '🏆', unlockedAt: '2026-02-26' }
  ]
};
