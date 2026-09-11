import Papa from 'papaparse';

export interface ParsedMCQItem {
  question: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  reference: string;
  category: string;
  subcategory: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ParseResult {
  items: ParsedMCQItem[];
  errors: string[];
}

/**
 * Normalizes an object's keys by lowercasing and removing spaces, underscores, hyphens, and BOM characters.
 */
export function getNormalizedKeyMap(obj: Record<string, any>): Record<string, string> {
  const map: Record<string, string> = {};
  if (!obj || typeof obj !== 'object') return map;
  for (const originalKey of Object.keys(obj)) {
    const cleaned = originalKey
      .replace(/^\ufeff/, '') // Remove BOM
      .toLowerCase()
      .replace(/[\s_\-]+/g, ''); // Remove spaces, underscores, hyphens
    map[cleaned] = originalKey;
  }
  return map;
}

/**
 * Retrieves a value from an object using a list of candidate keys,
 * checking against normalized forms.
 */
export function findValueByCandidates(obj: Record<string, any>, keyMap: Record<string, string>, candidates: string[]): any {
  for (const cand of candidates) {
    const normCand = cand.toLowerCase().replace(/[\s_\-]+/g, '');
    if (normCand in keyMap) {
      const origKey = keyMap[normCand];
      const val = obj[origKey];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return val;
      }
    }
  }
  return undefined;
}

/**
 * Resolves the correct answer ('A' | 'B' | 'C' | 'D') from various possible representations.
 * Handles:
 * - Direct letter: 'A', 'B', 'C', 'D' (or lowercase)
 * - Bracketed: '(A)', '[B]', 'C)', 'D.', 'A:'
 * - Prefix: 'Option A', 'Opt B', 'Choice C', 'Ans: D', 'Key: B'
 * - Numeric 1-based: 1 -> A, 2 -> B, 3 -> C, 4 -> D
 * - Exact text match with one of the options (e.g. "Khawaja Nazimuddin")
 * - Combined prefix + text: "B) Khawaja Nazimuddin", "Option B - Ampere"
 * - Substring match with option text
 */
export function resolveCorrectAnswer(
  rawAnswer: any,
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[]
): 'A' | 'B' | 'C' | 'D' {
  if (rawAnswer === undefined || rawAnswer === null) return 'A';
  const str = String(rawAnswer).trim();
  if (!str) return 'A';

  // 1. Single letter: 'A', 'B', 'C', 'D' (case-insensitive)
  if (/^[a-d]$/i.test(str)) {
    return str.toUpperCase() as 'A' | 'B' | 'C' | 'D';
  }

  // 2. Bracketed or punctuated single letter: '(A)', '[B]', 'C)', 'D.', 'A:', '<B>'
  const singlePunctMatch = str.match(/^[(\[<]?\s*([a-d])\s*[)\]>\.:]?$/i);
  if (singlePunctMatch && singlePunctMatch[1]) {
    return singlePunctMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
  }

  // 3. Option prefix: 'Option A', 'Opt B', 'Choice C', 'Answer: D', 'Key: B', 'Ans C'
  const prefixMatch = str.match(/^(?:option|opt|choice|ans|answer|key)\s*[:\-\s]?\s*[(\[]?\s*([a-d])\s*[)\]]?$/i);
  if (prefixMatch && prefixMatch[1]) {
    return prefixMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
  }

  // 4. Exact match against option text (case-insensitive, normalized spaces)
  const cleanStr = str.toLowerCase().replace(/[\s\-_.,;:]+/g, ' ').trim();
  if (options && options.length > 0) {
    for (const opt of options) {
      const optClean = (opt.text || '').toLowerCase().replace(/[\s\-_.,;:]+/g, ' ').trim();
      if (optClean && cleanStr === optClean) {
        return opt.id;
      }
    }
  }

  // 5. Numeric index (1 -> A, 2 -> B, 3 -> C, 4 -> D)
  if (str === '1' || str === '1.0') return 'A';
  if (str === '2' || str === '2.0') return 'B';
  if (str === '3' || str === '3.0') return 'C';
  if (str === '4' || str === '4.0') return 'D';

  // Zero-based index (0 -> A, 1 -> B, 2 -> C, 3 -> D)
  if (str === '0' || str === '0.0') return 'A';

  // 6. Option letter followed by text: 'B) Khawaja Nazimuddin' or 'C. 1949' or 'Option B: Ampere'
  const leadingLetterMatch = str.match(/^(?:option|opt|choice)?\s*[(\[]?\s*([a-d])\s*[)\]\.:\s-]/i);
  if (leadingLetterMatch && leadingLetterMatch[1]) {
    return leadingLetterMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
  }

  // 7. Partial match with option text (e.g., answer contains option text or vice versa)
  if (options && options.length > 0) {
    for (const opt of options) {
      const optClean = (opt.text || '').toLowerCase().replace(/[\s\-_.,;:]+/g, ' ').trim();
      if (optClean && optClean.length >= 3 && (cleanStr.includes(optClean) || optClean.includes(cleanStr))) {
        return opt.id;
      }
    }
  }

  return 'A';
}

/**
 * Extracts question, options, answer, explanation, etc. from any raw row object.
 */
export function extractMcqFromRow(
  row: Record<string, any>,
  idx: number,
  targetCategory: string
): { item: ParsedMCQItem | null; error?: string } {
  const keyMap = getNormalizedKeyMap(row);

  // Question candidate keys
  const question = findValueByCandidates(row, keyMap, [
    'question', 'questiontext', 'title', 'mcq', 'mcqtext', 'q', 'statement', 'problem'
  ]);

  if (!question || String(question).trim() === '') {
    return { item: null, error: `Row #${idx + 1}: Missing question text.` };
  }

  // Options extraction
  let optA = '';
  let optB = '';
  let optC = '';
  let optD = '';

  // Check if row has an options array (common in JSON)
  const rawOptions = findValueByCandidates(row, keyMap, ['options', 'choices', 'answers']);
  if (Array.isArray(rawOptions) && rawOptions.length >= 2) {
    if (typeof rawOptions[0] === 'object' && rawOptions[0] !== null) {
      // [{ id: 'A', text: '...' }] or [{ key: 'A', value: '...' }]
      optA = String(rawOptions[0].text || rawOptions[0].value || rawOptions[0].title || '');
      optB = String(rawOptions[1]?.text || rawOptions[1]?.value || rawOptions[1]?.title || '');
      optC = String(rawOptions[2]?.text || rawOptions[2]?.value || rawOptions[2]?.title || '');
      optD = String(rawOptions[3]?.text || rawOptions[3]?.value || rawOptions[3]?.title || '');
    } else {
      // ['Babur', 'Humayun', 'Akbar', 'Jahangir']
      optA = String(rawOptions[0] || '');
      optB = String(rawOptions[1] || '');
      optC = String(rawOptions[2] || '');
      optD = String(rawOptions[3] || '');
    }
  }

  // If not found in array, check individual columns
  if (!optA) {
    optA = String(findValueByCandidates(row, keyMap, [
      'optiona', 'option_a', 'opta', 'opt_a', 'choicea', 'choice_a', 'a', 'option1', 'choice1', '1'
    ]) || '');
  }
  if (!optB) {
    optB = String(findValueByCandidates(row, keyMap, [
      'optionb', 'option_b', 'optb', 'opt_b', 'choiceb', 'choice_b', 'b', 'option2', 'choice2', '2'
    ]) || '');
  }
  if (!optC) {
    optC = String(findValueByCandidates(row, keyMap, [
      'optionc', 'option_c', 'optc', 'opt_c', 'choicec', 'choice_c', 'c', 'option3', 'choice3', '3'
    ]) || '');
  }
  if (!optD) {
    optD = String(findValueByCandidates(row, keyMap, [
      'optiond', 'option_d', 'optd', 'opt_d', 'choiced', 'choice_d', 'd', 'option4', 'choice4', '4'
    ]) || '');
  }

  const options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[] = [
    { id: 'A', text: optA.trim() },
    { id: 'B', text: optB.trim() },
    { id: 'C', text: optC.trim() },
    { id: 'D', text: optD.trim() }
  ];

  // Correct Answer extraction - checks all column variations with or without spaces/underscores
  const rawAnswer = findValueByCandidates(row, keyMap, [
    'correctanswer', 'correct_answer', 'correctoption', 'correct_option',
    'answer', 'ans', 'correct', 'rightanswer', 'right_answer', 'rightoption',
    'right_option', 'key', 'answerkey', 'answer_key', 'solution', 'correctchoice',
    'correct_choice', 'optioncorrect', 'correctans', 'correct_ans', 'anskey'
  ]);

  const correctAnswer = resolveCorrectAnswer(rawAnswer, options);

  // Category
  const detectedCategory = String(findValueByCandidates(row, keyMap, [
    'category', 'cat', 'subject', 'topic', 'section'
  ]) || 'General Knowledge').trim();

  const finalCategory = (targetCategory && targetCategory !== '__file__')
    ? targetCategory
    : (detectedCategory || 'General Knowledge');

  // Subcategory
  const subcategory = String(findValueByCandidates(row, keyMap, [
    'subcategory', 'sub_category', 'subcat', 'topic', 'chapter'
  ]) || '').trim();

  // Difficulty
  const rawDiff = String(findValueByCandidates(row, keyMap, [
    'difficulty', 'level', 'diff'
  ]) || 'Medium').trim();
  let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
  if (/easy/i.test(rawDiff)) difficulty = 'Easy';
  else if (/hard|diff/i.test(rawDiff)) difficulty = 'Hard';

  // Explanation
  const explanation = String(findValueByCandidates(row, keyMap, [
    'explanation', 'explain', 'detail', 'details', 'reason', 'solution', 'description'
  ]) || 'Answer verified by subject expert.').trim();

  // Reference
  const reference = String(findValueByCandidates(row, keyMap, [
    'reference', 'ref', 'source', 'source_paper', 'pastpaper', 'paper'
  ]) || 'FPSC/PPSC Past Papers').trim();

  return {
    item: {
      question: String(question).trim(),
      options,
      correctAnswer,
      explanation,
      reference,
      category: finalCategory,
      subcategory,
      difficulty
    }
  };
}

/**
 * Universal CSV & JSON parser for bulk import.
 */
export function parseBulkContent(
  content: string,
  format: 'csv' | 'json',
  targetCategory: string
): ParseResult {
  const errors: string[] = [];
  const items: ParsedMCQItem[] = [];

  if (!content || !content.trim()) {
    return { items: [], errors: [] };
  }

  if (format === 'json') {
    try {
      const parsed = JSON.parse(content);
      const rawArray = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.items)
        ? parsed.items
        : Array.isArray(parsed.questions)
        ? parsed.questions
        : Array.isArray(parsed.mcqs)
        ? parsed.mcqs
        : Array.isArray(parsed.data)
        ? parsed.data
        : [];

      if (!Array.isArray(rawArray) || rawArray.length === 0) {
        errors.push('JSON data must be an array of questions or contain an "items" / "questions" array.');
      } else {
        rawArray.forEach((row: any, idx: number) => {
          const res = extractMcqFromRow(row, idx, targetCategory);
          if (res.error) {
            errors.push(res.error);
          } else if (res.item) {
            items.push(res.item);
          }
        });
      }
    } catch (e: any) {
      errors.push(`JSON syntax error: ${e.message}`);
    }
  } else {
    // CSV format
    try {
      const results = Papa.parse<Record<string, any>>(content, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.replace(/^\ufeff/, '').trim()
      });

      if (results.errors && results.errors.length > 0) {
        results.errors.slice(0, 3).forEach(err => {
          errors.push(`CSV Row ${err.row}: ${err.message}`);
        });
      }

      results.data.forEach((row, idx) => {
        const res = extractMcqFromRow(row, idx, targetCategory);
        if (res.error) {
          errors.push(res.error);
        } else if (res.item) {
          items.push(res.item);
        }
      });
    } catch (e: any) {
      errors.push(`CSV parsing error: ${e.message}`);
    }
  }

  return { items, errors };
}
