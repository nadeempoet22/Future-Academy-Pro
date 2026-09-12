export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface Option {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Comment {
  id: string;
  authorName: string;
  avatar?: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface MCQ {
  id: string;
  question: string;
  options: Option[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  reference?: string;
  subject: string;
  category: string;
  subcategory?: string;
  difficulty: DifficultyLevel;
  tags: string[];
  author: string;
  views: number;
  likes: number;
  dislikes: number;
  createdAt: string;
  comments: Comment[];
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  questionCount: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  questionCount: number;
}

export interface QuizQuestion {
  mcq: MCQ;
  userAnswer?: 'A' | 'B' | 'C' | 'D';
  isCorrect?: boolean;
  timeSpentSeconds?: number;
}

export interface QuizResult {
  id: string;
  quizTitle: string;
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  scorePercentage: number;
  timeTakenSeconds: number;
  completedAt: string;
  mode: 'Practice' | 'Exam';
  candidateName?: string;
  candidateEmail?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  rank: string;
  streakDays: number;
  quizHistory: QuizResult[];
  bookmarkedMcqIds: string[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
  }[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: string;
  imageUrl: string;
}

export interface AdConfig {
  headerBannerEnabled: boolean;
  sidebarAdEnabled: boolean;
  inContentAdEnabled: boolean;
  stickyBottomAdEnabled: boolean;
  customHeaderAdHtml?: string;
}

export interface CertificatePaymentConfig {
  feeAmount: number;
  currency: string;
  accountTitle: string;
  bankName: string;
  accountNumber: string;
  instructions: string;
  isPaymentRequired: boolean;
}

export interface CertificatePaymentSubmission {
  id: string;
  candidateName: string;
  candidateEmail?: string;
  quizTitle: string;
  categoryName?: string;
  amount: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  senderNumber: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  adminNote?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  announcementText: string;
  isAnnouncementActive: boolean;
  adConfig: AdConfig;
  certificatePayment?: CertificatePaymentConfig;
}

export interface SystemStats {
  totalMcqs: number;
  totalCategories: number;
  totalQuizzesTaken: number;
  activeUsersToday: number;
  topContributorsCount: number;
}
