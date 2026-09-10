import { MCQ, Category, BlogPost, SiteSettings, UserProfile } from '../types';

export const initialSiteSettings: SiteSettings = {
  siteName: 'Future Academy Pro',
  tagline: 'Pakistan’s Largest & Most Trusted MCQ Bank & Exam Preparation Platform',
  metaTitle: 'Future Academy Pro - FPSC, PPSC, NTS, CSS, PMS MCQs & Quiz Preparation',
  metaDescription: 'Solve 50,000+ solved MCQs for FPSC, PPSC, KPPSC, BPSC, SPSC, NTS, CSS, PMS, General Knowledge, Pakistan Affairs, Current Affairs, Everyday Science, Islamic Studies & Computer Science.',
  keywords: 'Future Academy Pro, FPSC MCQs, PPSC MCQs, NTS Test Prep, CSS Exam MCQs, Pakistan Affairs MCQs, Current Affairs 2026, Computer Science MCQs, Islamic Studies MCQs',
  contactEmail: 'support@futureacademypro.com',
  contactPhone: '+92 300 1234567',
  address: 'Constitution Avenue, Sector G-5/1, Islamabad, Pakistan',
  announcementText: '🔥 New FPSC & PPSC Mock Tests 2026 added! Take the Daily Quiz to boost your score.',
  isAnnouncementActive: true,
  adConfig: {
    headerBannerEnabled: true,
    sidebarAdEnabled: true,
    inContentAdEnabled: true,
    stickyBottomAdEnabled: false,
    customHeaderAdHtml: ''
  }
};

export const initialCategories: Category[] = [
  {
    id: 'cat-pak-affairs',
    name: 'Pakistan Affairs',
    slug: 'pakistan-affairs',
    description: 'History of Pakistan, Movement, Constitution, Foreign Policy & Current Affairs',
    iconName: 'Landmark',
    questionCount: 420,
    subcategories: [
      { id: 'sub-pre-1947', name: 'Pre 1947 History', slug: 'pre-1947-history', questionCount: 150 },
      { id: 'sub-post-1947', name: 'Post 1947 History', slug: 'post-1947-history', questionCount: 180 },
      { id: 'sub-constitution', name: 'Constitutional History', slug: 'constitutional-history', questionCount: 90 }
    ]
  },
  {
    id: 'cat-current-affairs',
    name: 'Current Affairs',
    slug: 'current-affairs',
    description: 'Latest Pakistan & International Current Affairs 2025-2026',
    iconName: 'Globe2',
    questionCount: 380,
    subcategories: [
      { id: 'sub-pak-ca', name: 'Pakistan Current Affairs', slug: 'pakistan-current-affairs', questionCount: 220 },
      { id: 'sub-intl-ca', name: 'World Current Affairs', slug: 'world-current-affairs', questionCount: 160 }
    ]
  },
  {
    id: 'cat-english',
    name: 'English MCQs',
    slug: 'english-mcqs',
    description: 'Grammar, Synonyms, Antonyms, Prepositions, Analogies & Sentence Structure',
    iconName: 'BookOpen',
    questionCount: 650,
    subcategories: [
      { id: 'sub-prepositions', name: 'Prepositions', slug: 'prepositions', questionCount: 200 },
      { id: 'sub-synonyms', name: 'Synonyms & Antonyms', slug: 'synonyms-antonyms', questionCount: 250 },
      { id: 'sub-grammar', name: 'Grammar Correction', slug: 'grammar-correction', questionCount: 200 }
    ]
  },
  {
    id: 'cat-cs',
    name: 'Computer Science',
    slug: 'computer-science',
    description: 'MS Office, Networking, Data Structures, Web Development, Programming & AI',
    iconName: 'Laptop',
    questionCount: 510,
    subcategories: [
      { id: 'sub-ms-office', name: 'MS Office (Word, Excel, PPT)', slug: 'ms-office', questionCount: 210 },
      { id: 'sub-networking', name: 'Networking & Security', slug: 'networking-security', questionCount: 150 },
      { id: 'sub-programming', name: 'Programming Fundamentals', slug: 'programming-fundamentals', questionCount: 150 }
    ]
  },
  {
    id: 'cat-islamic-studies',
    name: 'Islamic Studies',
    slug: 'islamic-studies',
    description: 'Quran, Seerah, Hadith, Ghazwat, Companions, Islamic History & Pillars',
    iconName: 'Moon',
    questionCount: 480,
    subcategories: [
      { id: 'sub-quran', name: 'Holy Quran', slug: 'holy-quran', questionCount: 160 },
      { id: 'sub-seerah', name: 'Seerah of Prophet (PBUH)', slug: 'seerah-prophet', questionCount: 180 },
      { id: 'sub-ghazwat', name: 'Islamic History & Battles', slug: 'islamic-history-battles', questionCount: 140 }
    ]
  },
  {
    id: 'cat-general-science',
    name: 'Everyday Science',
    slug: 'everyday-science',
    description: 'Human Physiology, Solar System, Vitamins, Physics & Chemistry Basics',
    iconName: 'Microscope',
    questionCount: 390,
    subcategories: [
      { id: 'sub-vitamins', name: 'Vitamins & Health', slug: 'vitamins-health', questionCount: 110 },
      { id: 'sub-astronomy', name: 'Solar System & Earth', slug: 'solar-system-earth', questionCount: 140 },
      { id: 'sub-env-sci', name: 'Environmental Science', slug: 'environmental-science', questionCount: 140 }
    ]
  },
  {
    id: 'cat-gk',
    name: 'General Knowledge',
    slug: 'general-knowledge',
    description: 'World Capitals, Organs, Boundaries, Famous Places, Discoveries & Oceans',
    iconName: 'Compass',
    questionCount: 720,
    subcategories: [
      { id: 'sub-capitals', name: 'Capitals & Currencies', slug: 'capitals-currencies', questionCount: 250 },
      { id: 'sub-intl-orgs', name: 'International Organizations', slug: 'international-organizations', questionCount: 200 },
      { id: 'sub-geography', name: 'World Geography', slug: 'world-geography', questionCount: 270 }
    ]
  },
  {
    id: 'cat-math',
    name: 'Mathematics',
    slug: 'mathematics-mcqs',
    description: 'Algebra, Arithmetic, Geometry, Percentages, Ratios, Averages & Equations',
    iconName: 'Calculator',
    questionCount: 340,
    subcategories: [
      { id: 'sub-ratios', name: 'Ratios & Percentages', slug: 'ratios-percentages', questionCount: 140 },
      { id: 'sub-algebra', name: 'Algebra & Equations', slug: 'algebra-equations', questionCount: 100 },
      { id: 'sub-geometry', name: 'Geometry & Angles', slug: 'geometry-angles', questionCount: 100 }
    ]
  },
  {
    id: 'cat-fpsc-ppsc',
    name: 'FPSC & PPSC Preparation',
    slug: 'fpsc-ppsc-preparation',
    description: 'Previous Papers Questions for Inspector, Tehsildar, Lecturer & Assistant',
    iconName: 'Award',
    questionCount: 890,
    subcategories: [
      { id: 'sub-fpsc', name: 'FPSC Past Papers', slug: 'fpsc-past-papers', questionCount: 450 },
      { id: 'sub-ppsc', name: 'PPSC Past Papers', slug: 'ppsc-past-papers', questionCount: 440 }
    ]
  },
  {
    id: 'cat-nts-tests',
    name: 'NTS / OTS / PTS Tests',
    slug: 'nts-ots-pts-tests',
    description: 'GAT General, NAT, Educators, Analytical Reasoning & Quantitative',
    iconName: 'FileCheck2',
    questionCount: 530,
    subcategories: [
      { id: 'sub-gat', name: 'GAT General', slug: 'gat-general', questionCount: 260 },
      { id: 'sub-nat', name: 'NAT Test Prep', slug: 'nat-test-prep', questionCount: 270 }
    ]
  },
  {
    id: 'cat-css-pms',
    name: 'CSS & PMS Exams',
    slug: 'css-pms-exams',
    description: 'Compulsory Subjects, MPT Screening Test, International Relations & Essay',
    iconName: 'GraduationCap',
    questionCount: 610,
    subcategories: [
      { id: 'sub-mpt', name: 'CSS MPT Screening', slug: 'css-mpt-screening', questionCount: 310 },
      { id: 'sub-ir', name: 'International Relations', slug: 'international-relations', questionCount: 300 }
    ]
  },
  {
    id: 'cat-physics',
    name: 'Physics MCQs',
    slug: 'physics-mcqs',
    description: 'Mechanics, Electricity, Magnetism, Optics, Thermodynamics & Modern Physics',
    iconName: 'Atom',
    questionCount: 280,
    subcategories: [
      { id: 'sub-mechanics', name: 'Mechanics', slug: 'mechanics', questionCount: 140 },
      { id: 'sub-optics', name: 'Optics & Waves', slug: 'optics-waves', questionCount: 140 }
    ]
  },
  {
    id: 'cat-chemistry',
    name: 'Chemistry MCQs',
    slug: 'chemistry-mcqs',
    description: 'Organic, Inorganic, Physical Chemistry, Periodic Table & Chemical Bonding',
    iconName: 'FlaskConical',
    questionCount: 260,
    subcategories: [
      { id: 'sub-organic', name: 'Organic Chemistry', slug: 'organic-chemistry', questionCount: 130 },
      { id: 'sub-inorganic', name: 'Inorganic Chemistry', slug: 'inorganic-chemistry', questionCount: 130 }
    ]
  },
  {
    id: 'cat-biology',
    name: 'Biology MCQs',
    slug: 'biology-mcqs',
    description: 'Cell Biology, Genetics, Botany, Zoology, Human Anatomy & Biotechnology',
    iconName: 'Dna',
    questionCount: 310,
    subcategories: [
      { id: 'sub-cell-bio', name: 'Cell Biology & Genetics', slug: 'cell-biology-genetics', questionCount: 160 },
      { id: 'sub-human-anatomy', name: 'Human Anatomy', slug: 'human-anatomy', questionCount: 150 }
    ]
  },
  {
    id: 'cat-defense',
    name: 'Army, Navy & Air Force',
    slug: 'army-navy-airforce-tests',
    description: 'ISSB, Initial Test, Academic Test, Intelligence Test (Verbal/Non-Verbal)',
    iconName: 'ShieldAlert',
    questionCount: 410,
    subcategories: [
      { id: 'sub-issb', name: 'ISSB Preparation', slug: 'issb-preparation', questionCount: 200 },
      { id: 'sub-verbal', name: 'Verbal Intelligence', slug: 'verbal-intelligence', questionCount: 210 }
    ]
  },
  {
    id: 'cat-urdu',
    name: 'Urdu MCQs',
    slug: 'urdu-mcqs',
    description: 'Urdu Literature, Grammar, Poets, Books, Idioms & Famous Quotes',
    iconName: 'BookMarked',
    questionCount: 220,
    subcategories: [
      { id: 'sub-urdu-lit', name: 'Urdu Literature', slug: 'urdu-literature', questionCount: 110 },
      { id: 'sub-urdu-grammar', name: 'Urdu Qawaid', slug: 'urdu-qawaid', questionCount: 110 }
    ]
  }
];

export const initialMcqs: MCQ[] = [
  {
    id: 'mcq-1',
    question: 'Who was the first Governor-General of Pakistan after independence in 1947?',
    options: [
      { id: 'A', text: 'Liaquat Ali Khan' },
      { id: 'B', text: 'Quaid-e-Azam Muhammad Ali Jinnah' },
      { id: 'C', text: 'Khawaja Nazimuddin' },
      { id: 'D', text: 'Malik Ghulam Muhammad' }
    ],
    correctAnswer: 'B',
    explanation: 'Quaid-e-Azam Muhammad Ali Jinnah sworn in as the first Governor-General of Pakistan on 15th August 1947, administered by Chief Justice Mian Abdul Rashid.',
    reference: 'Government of Pakistan Historical Records / FPSC Past Paper 2021',
    subject: 'Pakistan Affairs',
    category: 'Pakistan Affairs',
    subcategory: 'Post 1947 History',
    difficulty: 'Easy',
    tags: ['Governor General', 'Jinnah', '1947 History', 'FPSC'],
    author: 'Prof. Tariq Mahmood',
    views: 14250,
    likes: 382,
    dislikes: 12,
    createdAt: '2026-01-10T10:00:00Z',
    isFeatured: true,
    comments: [
      {
        id: 'c1',
        authorName: 'Usman Ali',
        text: 'Very helpful question! Admin please also add questions about Liaquat Ali Khan’s tenure.',
        createdAt: '2026-02-01T14:20:00Z',
        likes: 15
      }
    ]
  },
  {
    id: 'mcq-2',
    question: 'Which country borders Pakistan to the South West?',
    options: [
      { id: 'A', text: 'China' },
      { id: 'B', text: 'Afghanistan' },
      { id: 'C', text: 'Iran' },
      { id: 'D', text: 'India' }
    ],
    correctAnswer: 'C',
    explanation: 'Pakistan shares a 909 km long border with Iran situated in the South-West direction (Balochistan province side).',
    reference: 'Survey of Pakistan Map Archives',
    subject: 'Pakistan Affairs',
    category: 'Pakistan Affairs',
    subcategory: 'Geography of Pakistan',
    difficulty: 'Easy',
    tags: ['Geography', 'Borders', 'Iran', 'PPSC'],
    author: 'Editorial Team',
    views: 9810,
    likes: 210,
    dislikes: 4,
    createdAt: '2026-01-12T11:30:00Z',
    isFeatured: true,
    comments: []
  },
  {
    id: 'mcq-3',
    question: 'What is the full shortcut key to open the "Find and Replace" dialog box in Microsoft Word?',
    options: [
      { id: 'A', text: 'Ctrl + F' },
      { id: 'B', text: 'Ctrl + H' },
      { id: 'C', text: 'Ctrl + R' },
      { id: 'D', text: 'Alt + F4' }
    ],
    correctAnswer: 'B',
    explanation: 'While Ctrl + F opens the Find navigation pane, Ctrl + H directly launches the Find & Replace dialog box in MS Word.',
    reference: 'MS Office Official Keyboard Shortcuts',
    subject: 'Computer Science',
    category: 'Computer Science',
    subcategory: 'MS Office (Word, Excel, PPT)',
    difficulty: 'Medium',
    tags: ['MS Word', 'Shortcuts', 'Computer MCQs', 'NTS'],
    author: 'Engr. Ayesha Malik',
    views: 18400,
    likes: 540,
    dislikes: 8,
    createdAt: '2026-01-15T09:00:00Z',
    isFeatured: true,
    comments: [
      {
        id: 'c2',
        authorName: 'Sajid Mehmood',
        text: 'This was asked in PPSC Assistant Computer Operator exam 2024!',
        createdAt: '2026-02-10T18:05:00Z',
        likes: 24
      }
    ]
  },
  {
    id: 'mcq-4',
    question: 'In which Surah of the Holy Quran is the commandment of Zakat mentioned alongside Namaz most frequently?',
    options: [
      { id: 'A', text: 'Surah Al-Baqarah' },
      { id: 'B', text: 'Surah Al-Imran' },
      { id: 'C', text: 'Surah Al-Tawbah' },
      { id: 'D', text: 'Surah Yaseen' }
    ],
    correctAnswer: 'A',
    explanation: 'In Surah Al-Baqarah, Zakat and Namaz (Salat) are commanded together in multiple verses, emphasizing their co-equal importance as pillars of Islam.',
    reference: 'Quranic Sciences & Tafseer Al-Qurtubi',
    subject: 'Islamic Studies',
    category: 'Islamic Studies',
    subcategory: 'Holy Quran',
    difficulty: 'Medium',
    tags: ['Quran', 'Zakat', 'Salat', 'CSS MPT'],
    author: 'Dr. Muhammad Saeed',
    views: 22100,
    likes: 890,
    dislikes: 11,
    createdAt: '2026-01-18T14:00:00Z',
    isFeatured: true,
    comments: []
  },
  {
    id: 'mcq-5',
    question: 'Which Vitamin is chemically known as "Ascorbic Acid" and deficiency of which causes Scurvy?',
    options: [
      { id: 'A', text: 'Vitamin A' },
      { id: 'B', text: 'Vitamin B12' },
      { id: 'C', text: 'Vitamin C' },
      { id: 'D', text: 'Vitamin D' }
    ],
    correctAnswer: 'C',
    explanation: 'Vitamin C is ascorbic acid. It is water-soluble, found abundantly in citrus fruits (oranges, lemons), and deficiency causes bleeding gums known as Scurvy.',
    reference: 'General Science Textbook Grade 10',
    subject: 'Everyday Science',
    category: 'Everyday Science',
    subcategory: 'Vitamins & Health',
    difficulty: 'Easy',
    tags: ['Vitamins', 'Ascorbic Acid', 'Everyday Science', 'FPSC'],
    author: 'Dr. Farhan Qureshi',
    views: 12890,
    likes: 412,
    dislikes: 5,
    createdAt: '2026-01-20T16:20:00Z',
    isFeatured: false,
    comments: []
  },
  {
    id: 'mcq-6',
    question: 'Choose the correct preposition: "He is senior _____ me in service."',
    options: [
      { id: 'A', text: 'than' },
      { id: 'B', text: 'to' },
      { id: 'C', text: 'from' },
      { id: 'D', text: 'with' }
    ],
    correctAnswer: 'B',
    explanation: 'Adjectives ending in "-ior" like senior, junior, superior, inferior, prior take the preposition "to" instead of "than".',
    reference: 'Wren & Martin High School English Grammar',
    subject: 'English',
    category: 'English MCQs',
    subcategory: 'Prepositions',
    difficulty: 'Medium',
    tags: ['Grammar', 'Prepositions', 'PPSC English', 'NTS'],
    author: 'Prof. Hassan Raza',
    views: 31200,
    likes: 1120,
    dislikes: 19,
    createdAt: '2026-01-22T08:15:00Z',
    isFeatured: true,
    comments: [
      {
        id: 'c3',
        authorName: 'Zainab Bibi',
        text: 'Great tip! Many students make the mistake of using "than" here.',
        createdAt: '2026-02-12T11:40:00Z',
        likes: 31
      }
    ]
  },
  {
    id: 'mcq-7',
    question: 'What is the capital city of Australia?',
    options: [
      { id: 'A', text: 'Sydney' },
      { id: 'B', text: 'Melbourne' },
      { id: 'C', text: 'Canberra' },
      { id: 'D', text: 'Brisbane' }
    ],
    correctAnswer: 'C',
    explanation: 'Canberra was selected as the capital of Australia in 1908 as a compromise between rival cities Sydney and Melbourne.',
    reference: 'World Geography & Atlas 2025',
    subject: 'General Knowledge',
    category: 'General Knowledge',
    subcategory: 'Capitals & Currencies',
    difficulty: 'Easy',
    tags: ['Capitals', 'World GK', 'Australia', 'FPSC'],
    author: 'Editorial Team',
    views: 15900,
    likes: 490,
    dislikes: 15,
    createdAt: '2026-01-25T12:00:00Z',
    isFeatured: false,
    comments: []
  },
  {
    id: 'mcq-8',
    question: 'If 15 men can complete a project in 20 days, how many days will 25 men take to complete the same project working at the same pace?',
    options: [
      { id: 'A', text: '10 days' },
      { id: 'B', text: '12 days' },
      { id: 'C', text: '14 days' },
      { id: 'D', text: '16 days' }
    ],
    correctAnswer: 'B',
    explanation: 'This is an inverse proportion: Men1 × Days1 = Men2 × Days2. Therefore: 15 × 20 = 25 × X  =>  300 = 25X  =>  X = 12 days.',
    reference: 'Quantitative Aptitude for Competitive Exams',
    subject: 'Mathematics',
    category: 'Mathematics MCQs',
    subcategory: 'Ratios & Percentages',
    difficulty: 'Medium',
    tags: ['Math', 'Proportion', 'GAT General', 'NTS'],
    author: 'Prof. Kamran Shah',
    views: 19800,
    likes: 670,
    dislikes: 14,
    createdAt: '2026-01-28T15:30:00Z',
    isFeatured: true,
    comments: []
  },
  {
    id: 'mcq-9',
    question: 'Under which Constitution of Pakistan was the country first declared an "Islamic Republic"?',
    options: [
      { id: 'A', text: '1956 Constitution' },
      { id: 'B', text: '1962 Constitution' },
      { id: 'C', text: '1973 Constitution' },
      { id: 'D', text: 'Legal Framework Order 1970' }
    ],
    correctAnswer: 'A',
    explanation: 'The 1956 Constitution (promulgated on 23rd March 1956) officially designated Pakistan as the "Islamic Republic of Pakistan".',
    reference: 'Constitutional Development of Pakistan - G.W. Choudhury',
    subject: 'Pakistan Affairs',
    category: 'Pakistan Affairs',
    subcategory: 'Constitutional History',
    difficulty: 'Medium',
    tags: ['1956 Constitution', 'Islamic Republic', 'FPSC Inspector', 'CSS'],
    author: 'Advocate Bilal Khan',
    views: 24500,
    likes: 780,
    dislikes: 9,
    createdAt: '2026-02-01T09:10:00Z',
    isFeatured: true,
    comments: []
  },
  {
    id: 'mcq-10',
    question: 'Which layer of the Earth’s atmosphere contains the Ozone layer that protects us from ultraviolet radiation?',
    options: [
      { id: 'A', text: 'Troposphere' },
      { id: 'B', text: 'Stratosphere' },
      { id: 'C', text: 'Mesosphere' },
      { id: 'D', text: 'Thermosphere' }
    ],
    correctAnswer: 'B',
    explanation: 'The Ozone layer is situated in the Stratosphere layer of the atmosphere, approximately 15 to 35 km above Earth’s surface.',
    reference: 'NCERT & Everyday Science Guide',
    subject: 'Everyday Science',
    category: 'Everyday Science',
    subcategory: 'Environmental Science',
    difficulty: 'Easy',
    tags: ['Atmosphere', 'Ozone Layer', 'Stratosphere', 'KPPSC'],
    author: 'Dr. Farhan Qureshi',
    views: 11400,
    likes: 310,
    dislikes: 3,
    createdAt: '2026-02-03T17:00:00Z',
    isFeatured: false,
    comments: []
  },
  {
    id: 'mcq-11',
    question: 'What is the SI unit of Electric Current?',
    options: [
      { id: 'A', text: 'Volt' },
      { id: 'B', text: 'Ohm' },
      { id: 'C', text: 'Ampere' },
      { id: 'D', text: 'Watt' }
    ],
    correctAnswer: 'C',
    explanation: 'Ampere (symbol: A) is the base SI unit of electric current, defined by the flow of one Coulomb of charge per second.',
    reference: 'Physics Fundamentals Class 11',
    subject: 'Physics',
    category: 'Physics MCQs',
    subcategory: 'Mechanics',
    difficulty: 'Easy',
    tags: ['SI Unit', 'Electric Current', 'Physics', 'ECAT'],
    author: 'Engr. Saad Tanveer',
    views: 8900,
    likes: 275,
    dislikes: 2,
    createdAt: '2026-02-05T13:40:00Z',
    isFeatured: false,
    comments: []
  },
  {
    id: 'mcq-12',
    question: 'Which organelle is famously referred to as the "Powerhouse of the Cell"?',
    options: [
      { id: 'A', text: 'Ribosome' },
      { id: 'B', text: 'Lysosome' },
      { id: 'C', text: 'Mitochondria' },
      { id: 'D', text: 'Golgi Body' }
    ],
    correctAnswer: 'C',
    explanation: 'Mitochondria generate energy for cellular functions through aerobic respiration in the form of ATP molecules.',
    reference: 'Campbell Biology 11th Edition',
    subject: 'Biology',
    category: 'Biology MCQs',
    subcategory: 'Cell Biology & Genetics',
    difficulty: 'Easy',
    tags: ['Mitochondria', 'Cell Biology', 'Biology', 'MDCAT'],
    author: 'Dr. Mahnoor Fatima',
    views: 16700,
    likes: 530,
    dislikes: 6,
    createdAt: '2026-02-08T10:20:00Z',
    isFeatured: false,
    comments: []
  }
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
