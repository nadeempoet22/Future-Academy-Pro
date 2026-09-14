import { Category, MCQ } from '../types';

/**
 * Normalizes text for resilient category matching (stripping punctuation and filler words)
 */
function normalizeCategoryString(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(mcqs|mcq|test|tests|exam|exams|preparation|prep|paper|papers|notes)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if an MCQ belongs to a specific category with high-precision matching
 */
export function isMcqInCategory(m: MCQ, categoryName: string): boolean {
  if (!m || !categoryName) return false;
  const targetRaw = (categoryName || '').trim().toLowerCase();
  const catRaw = (m.category || '').trim().toLowerCase();
  const subRaw = (m.subject || '').trim().toLowerCase();

  // 1. Direct or substring matches
  if (catRaw === targetRaw || subRaw === targetRaw) return true;
  if (catRaw.includes(targetRaw) || targetRaw.includes(catRaw)) return true;
  if (subRaw && (subRaw.includes(targetRaw) || targetRaw.includes(subRaw))) return true;

  // 2. Normalized matching (e.g., 'English' vs 'English MCQs', 'Pakistan Affairs' vs 'Pakistan Studies')
  const normTarget = normalizeCategoryString(targetRaw);
  const normCat = normalizeCategoryString(catRaw);
  const normSub = normalizeCategoryString(subRaw);

  if (normTarget && normCat && (normTarget === normCat || normCat.includes(normTarget) || normTarget.includes(normCat))) {
    return true;
  }

  if (normTarget && normSub && (normTarget === normSub || normSub.includes(normTarget) || normTarget.includes(normSub))) {
    return true;
  }

  // 3. Special historical/synonym aliases
  if (normTarget.includes('pakistan') && (normCat.includes('pak') || normCat.includes('pakistan'))) return true;
  if (normTarget.includes('current affairs') && normCat.includes('current')) return true;
  if (normTarget.includes('islam') && normCat.includes('islam')) return true;
  if (normTarget.includes('general knowledge') && (normCat.includes('gk') || normCat.includes('general'))) return true;
  if (normTarget.includes('computer') && (normCat.includes('cs') || normCat.includes('it') || normCat.includes('computer'))) return true;

  return false;
}

/**
 * Accurately calculates real-time count of questions matching a category
 */
export function countMcqsForCategory(categoryName: string, mcqPool: MCQ[]): number {
  if (!Array.isArray(mcqPool) || mcqPool.length === 0) return 0;
  return mcqPool.filter(m => isMcqInCategory(m, categoryName)).length;
}

/**
 * Dynamically enriches categories with their real-time question counts from the active MCQ pool.
 * Also auto-discovers any new categories introduced by user-added MCQs so they appear everywhere!
 */
export function enrichCategoriesWithLiveCounts(baseCategories: Category[], mcqPool: MCQ[]): Category[] {
  const pool = Array.isArray(mcqPool) && mcqPool.length > 0 ? mcqPool : [];
  
  // 1. Update existing categories with live real-time counts
  const updated: Category[] = (baseCategories || []).map(cat => {
    const liveCount = countMcqsForCategory(cat.name, pool);
    
    // Also compute live subcategory counts
    const updatedSubs = (cat.subcategories || []).map(sub => {
      const subLower = (sub.name || '').trim().toLowerCase();
      const subCount = pool.filter(m => {
        const mSub = (m.subcategory || '').trim().toLowerCase();
        return mSub && (mSub === subLower || mSub.includes(subLower) || subLower.includes(mSub));
      }).length;
      return {
        ...sub,
        questionCount: subCount
      };
    });

    return {
      ...cat,
      questionCount: liveCount,
      subcategories: updatedSubs
    };
  });

  // 2. Discover any custom categories added in MCQs that aren't in baseCategories yet
  const existingNames = new Set(updated.map(c => c.name.toLowerCase().trim()));
  const extraCategoriesMap = new Map<string, number>();

  pool.forEach(m => {
    if (m.category && m.category.trim()) {
      const catName = m.category.trim();
      const catLower = catName.toLowerCase();
      // Check if this category matches any existing category
      const matchesExisting = updated.some(c => isMcqInCategory(m, c.name));
      if (!matchesExisting && !existingNames.has(catLower)) {
        extraCategoriesMap.set(catName, (extraCategoriesMap.get(catName) || 0) + 1);
      }
    }
  });

  extraCategoriesMap.forEach((count, catName) => {
    updated.push({
      id: `cat-auto-${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: catName,
      slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: `${catName} preparation MCQs`,
      iconName: 'BookOpen',
      questionCount: count,
      subcategories: []
    });
    existingNames.add(catName.toLowerCase());
  });

  return updated;
}
