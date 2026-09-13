import { MCQ, Option } from '../types';

/**
 * High-entropy Fisher-Yates (Knuth) Shuffle Algorithm
 * Guarantees uniform distribution and true randomness for each quiz run.
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    // Generate high-quality pseudo-random index
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Optionally shuffle options for an MCQ while strictly maintaining the correct answer
 */
export function shuffleMcqOptions(mcq: MCQ): MCQ {
  if (!mcq.options || mcq.options.length < 2) return mcq;

  // Find the text of the correct answer
  const correctOptionObj = mcq.options.find(o => o.id === mcq.correctAnswer);
  if (!correctOptionObj) return mcq;
  const correctText = correctOptionObj.text;

  // Shuffle the options
  const shuffledOptionsTexts = fisherYatesShuffle(mcq.options.map(o => o.text));

  const letterIds: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const newOptions: Option[] = shuffledOptionsTexts.slice(0, 4).map((text, idx) => ({
    id: letterIds[idx],
    text
  }));

  // Find where the correct text ended up
  const newCorrectOption = newOptions.find(o => o.text === correctText);
  const newCorrectAnswer = newCorrectOption ? newCorrectOption.id : mcq.correctAnswer;

  return {
    ...mcq,
    options: newOptions,
    correctAnswer: newCorrectAnswer
  };
}

/**
 * Get recently seen questions from session to avoid repeating the exact same questions back-to-back
 */
function getRecentSeenIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem('futureacademy_recent_quiz_ids');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

/**
 * Save recently seen questions into session
 */
function saveRecentSeenIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    // Keep max 150 recent IDs
    const recent = Array.from(getRecentSeenIds());
    const combined = Array.from(new Set([...ids, ...recent])).slice(0, 150);
    sessionStorage.setItem('futureacademy_recent_quiz_ids', JSON.stringify(combined));
  } catch {}
}

export interface QuizGenerationOptions {
  pool: MCQ[];
  count?: number;
  category?: string;
  shuffleOptionsOrder?: boolean;
  forceFreshRandom?: boolean;
}

/**
 * Automatic Quiz Randomizer:
 * Generates a truly random, non-repetitive set of 50 (or requested count) MCQs every single time.
 */
export function generateRandomQuiz({
  pool,
  count = 50,
  category,
  shuffleOptionsOrder = false,
  forceFreshRandom = true
}: QuizGenerationOptions): { questions: MCQ[]; actualCount: number; categoryName: string } {
  if (!pool || pool.length === 0) {
    return { questions: [], actualCount: 0, categoryName: category || 'General' };
  }

  // 1. Filter by category if specified
  let candidatePool = [...pool];
  let isCategorySpecific = false;

  if (category && category !== 'General' && category !== 'All' && category !== 'Daily') {
    const catLower = category.toLowerCase();
    const catFiltered = pool.filter(
      m =>
        m.category.toLowerCase() === catLower ||
        m.category.toLowerCase().includes(catLower) ||
        catLower.includes(m.category.toLowerCase()) ||
        (m.subject && m.subject.toLowerCase().includes(catLower))
    );
    if (catFiltered.length > 0) {
      candidatePool = catFiltered;
      isCategorySpecific = true;
    }
  }

  // 2. Separate into fresh questions vs recently seen questions
  const recentIds = forceFreshRandom ? getRecentSeenIds() : new Set<string>();
  const freshList = candidatePool.filter(m => !recentIds.has(m.id));
  const seenList = candidatePool.filter(m => recentIds.has(m.id));

  // 3. Shuffle both lists with Fisher-Yates
  const shuffledFresh = fisherYatesShuffle(freshList);
  const shuffledSeen = fisherYatesShuffle(seenList);

  // Combine fresh first, then fallback to seen questions
  let combinedCandidates = [...shuffledFresh, ...shuffledSeen];

  // 4. If category-specific test needs more questions to reach 50, supplement from general pool
  if (isCategorySpecific && combinedCandidates.length < count) {
    const existingIds = new Set(combinedCandidates.map(m => m.id));
    const otherPool = pool.filter(m => !existingIds.has(m.id));
    const shuffledOthers = fisherYatesShuffle(otherPool);
    const needed = count - combinedCandidates.length;
    combinedCandidates = [...combinedCandidates, ...shuffledOthers.slice(0, needed)];
  }

  // 5. Slice to requested count (e.g. 50 MCQs)
  const targetCount = Math.min(count, combinedCandidates.length);
  let selected = combinedCandidates.slice(0, targetCount);

  // Final high-entropy shuffle so category questions and supplement questions are intermingled
  selected = fisherYatesShuffle(selected);

  // 6. Optionally shuffle options order (A, B, C, D)
  if (shuffleOptionsOrder) {
    selected = selected.map(m => shuffleMcqOptions(m));
  }

  // 7. Record selected IDs to ensure next random run is completely fresh
  const selectedIds = selected.map(m => m.id);
  saveRecentSeenIds(selectedIds);

  return {
    questions: selected,
    actualCount: selected.length,
    categoryName: isCategorySpecific ? (category || 'General') : 'General FPSC / PPSC'
  };
}
