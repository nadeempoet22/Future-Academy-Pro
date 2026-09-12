import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  initialSiteSettings,
  initialCategories,
  initialMcqs,
  initialBlogPosts,
  initialUserProfile
} from './src/data/seedData.js';
import { MCQ, Category, BlogPost, SiteSettings, UserProfile, QuizResult, Comment } from './src/types.js';
import { resolveCorrectAnswer } from './src/utils/bulkParser.js';
import { findQuickFact } from './src/data/knowledgeBase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database Store
let siteSettings: SiteSettings = JSON.parse(JSON.stringify(initialSiteSettings));
let categories: Category[] = JSON.parse(JSON.stringify(initialCategories));
let mcqs: MCQ[] = JSON.parse(JSON.stringify(initialMcqs));
let blogPosts: BlogPost[] = JSON.parse(JSON.stringify(initialBlogPosts));
let userProfile: UserProfile = JSON.parse(JSON.stringify(initialUserProfile));
let reports: { id: string; mcqId: string; reason: string; createdAt: string }[] = [];

// Admin Authentication Store (Default credentials: admin / admin)
let adminCredentials = {
  username: 'admin',
  email: 'admin@futureacademypro.com',
  password: 'admin',
  updatedAt: new Date().toISOString()
};

// Initialize Gemini Client Lazily/Safely on Server
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // ===================================
  // REST API ENDPOINTS
  // ===================================

  // Admin Authentication APIs (Default: admin / admin)
  app.post('/api/admin/login', (req, res) => {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username/Email aur Password dono darkar hain.' });
    }

    const trimmedInput = String(usernameOrEmail).trim().toLowerCase();
    const isUserMatch =
      trimmedInput === adminCredentials.username.toLowerCase() ||
      trimmedInput === adminCredentials.email.toLowerCase();
    const isPassMatch = String(password) === adminCredentials.password;

    if (isUserMatch && isPassMatch) {
      return res.json({
        success: true,
        token: `admin-token-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        user: {
          username: adminCredentials.username,
          email: adminCredentials.email,
          role: 'Super Admin'
        },
        message: 'Admin login kamyab!'
      });
    }

    return res.status(401).json({
      error: 'Ghalat Username/Email ya Password. Baraye meharbani durust credentials darj karein.'
    });
  });

  app.get('/api/admin/credentials-info', (req, res) => {
    res.json({
      username: adminCredentials.username,
      email: adminCredentials.email,
      updatedAt: adminCredentials.updatedAt
    });
  });

  app.post('/api/admin/change-credentials', (req, res) => {
    const { currentPassword, newUsername, newEmail, newPassword } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ error: 'Mojooda (Current) Password enter karna lazmi hai.' });
    }
    if (String(currentPassword) !== adminCredentials.password) {
      return res.status(401).json({ error: 'Mojooda (Current) password ghalat hai. Baraye meharbani durust password darj karein.' });
    }

    if (newUsername && newUsername.trim().length >= 3) {
      adminCredentials.username = newUsername.trim();
    }
    if (newEmail && newEmail.trim().includes('@')) {
      adminCredentials.email = newEmail.trim();
    }
    if (newPassword && newPassword.trim().length >= 3) {
      adminCredentials.password = newPassword.trim();
    }
    adminCredentials.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: 'Admin credentials kamyabi se update ho gaye hain!',
      user: {
        username: adminCredentials.username,
        email: adminCredentials.email
      }
    });
  });

  // 1. Site Settings & Stats
  app.get('/api/settings', (req, res) => {
    res.json(siteSettings);
  });

  app.put('/api/settings', (req, res) => {
    siteSettings = { ...siteSettings, ...req.body };
    res.json({ status: 'success', settings: siteSettings });
  });

  app.get('/api/stats', (req, res) => {
    const totalMcqs = mcqs.length;
    const totalCategories = categories.length;
    const totalQuizzesTaken = userProfile.quizHistory.length + 12800; // Realistic platform baseline
    res.json({
      totalMcqs,
      totalCategories,
      totalQuizzesTaken,
      activeUsersToday: 1420,
      topContributorsCount: 48
    });
  });

  // 2. MCQs APIs
  app.get('/api/mcqs', (req, res) => {
    const { category, subcategory, search, difficulty, tag, sort, page = '1', limit = '15' } = req.query;

    let filtered = [...mcqs];

    if (category) {
      const catLower = String(category).toLowerCase();
      filtered = filtered.filter(
        m => m.category.toLowerCase() === catLower || m.category.toLowerCase().includes(catLower)
      );
    }

    if (subcategory) {
      const subLower = String(subcategory).toLowerCase();
      filtered = filtered.filter(
        m => m.subcategory && m.subcategory.toLowerCase().includes(subLower)
      );
    }

    if (difficulty && difficulty !== 'All') {
      filtered = filtered.filter(m => m.difficulty.toLowerCase() === String(difficulty).toLowerCase());
    }

    if (tag) {
      const tagLower = String(tag).toLowerCase();
      filtered = filtered.filter(m => m.tags.some(t => t.toLowerCase() === tagLower));
    }

    if (search) {
      const query = String(search).toLowerCase();
      filtered = filtered.filter(
        m =>
          m.question.toLowerCase().includes(query) ||
          m.options.some(opt => opt.text.toLowerCase().includes(query)) ||
          m.explanation.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query) ||
          m.subject.toLowerCase().includes(query) ||
          m.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Sorting
    if (sort === 'most-viewed') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sort === 'most-liked') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // default: newest
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 15;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      mcqs: paginated,
      total: filtered.length,
      page: pageNum,
      totalPages: Math.ceil(filtered.length / limitNum)
    });
  });

  app.get('/api/mcqs/:id', (req, res) => {
    const mcq = mcqs.find(m => m.id === req.params.id);
    if (!mcq) {
      return res.status(404).json({ error: 'MCQ not found' });
    }
    // Increment views
    mcq.views += 1;

    // Find related MCQs
    const related = mcqs
      .filter(m => m.id !== mcq.id && (m.category === mcq.category || m.subject === mcq.subject))
      .slice(0, 4);

    res.json({ mcq, related });
  });

  app.post('/api/mcqs', (req, res) => {
    const { question, options, correctAnswer, explanation, category, subcategory, difficulty, subject, tags, reference } = req.body;

    if (!question || !options || !correctAnswer || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMcq: MCQ = {
      id: `mcq-${Date.now()}`,
      question,
      options,
      correctAnswer,
      explanation: explanation || 'Answer verified by subject expert.',
      reference: reference || 'Future Academy Pro Verified Collection',
      subject: subject || category,
      category,
      subcategory: subcategory || '',
      difficulty: difficulty || 'Medium',
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
      author: 'Admin',
      views: 1,
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString(),
      comments: []
    };

    mcqs.unshift(newMcq);

    // Update category count
    const catObj = categories.find(c => c.name.toLowerCase() === category.toLowerCase());
    if (catObj) {
      catObj.questionCount += 1;
    }

    res.status(201).json(newMcq);
  });

  app.put('/api/mcqs/:id', (req, res) => {
    const idx = mcqs.findIndex(m => m.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'MCQ not found' });
    }
    mcqs[idx] = { ...mcqs[idx], ...req.body };
    res.json(mcqs[idx]);
  });

  app.delete('/api/mcqs/:id', (req, res) => {
    mcqs = mcqs.filter(m => m.id !== req.params.id);
    res.json({ status: 'success' });
  });

  app.post('/api/mcqs/:id/like', (req, res) => {
    const mcq = mcqs.find(m => m.id === req.params.id);
    if (mcq) {
      mcq.likes += 1;
      return res.json({ likes: mcq.likes, dislikes: mcq.dislikes });
    }
    res.status(404).json({ error: 'MCQ not found' });
  });

  app.post('/api/mcqs/:id/dislike', (req, res) => {
    const mcq = mcqs.find(m => m.id === req.params.id);
    if (mcq) {
      mcq.dislikes += 1;
      return res.json({ likes: mcq.likes, dislikes: mcq.dislikes });
    }
    res.status(404).json({ error: 'MCQ not found' });
  });

  app.post('/api/mcqs/:id/report', (req, res) => {
    const { reason } = req.body;
    reports.push({
      id: `rep-${Date.now()}`,
      mcqId: req.params.id,
      reason: reason || 'Inaccurate options or answer',
      createdAt: new Date().toISOString()
    });
    res.json({ message: 'Report submitted successfully. Thank you for making Future Academy Pro better!' });
  });

  app.post('/api/mcqs/:id/comments', (req, res) => {
    const { text, authorName } = req.body;
    const mcq = mcqs.find(m => m.id === req.params.id);
    if (!mcq) return res.status(404).json({ error: 'MCQ not found' });

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorName: authorName || 'Scholar User',
      text,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    mcq.comments.push(newComment);
    res.json(newComment);
  });

  // Bulk Import MCQs (CSV & JSON)
  app.post('/api/mcqs/bulk-import', (req, res) => {
    const { items, targetCategory } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array' });
    }

    let addedCount = 0;
    items.forEach((item: any) => {
      const question = item.question || item.Question;
      const finalCategory = targetCategory || item.category || item.Category || 'General Knowledge';

      let options = item.options;
      if (!Array.isArray(options) || options.length === 0) {
        options = [
          { id: 'A', text: item.optionA || item.OptionA || item.A || item.optA || '' },
          { id: 'B', text: item.optionB || item.OptionB || item.B || item.optB || '' },
          { id: 'C', text: item.optionC || item.OptionC || item.C || item.optC || '' },
          { id: 'D', text: item.optionD || item.OptionD || item.D || item.optD || '' }
        ];
      }

      const rawAnswer = item.correctAnswer || item.CorrectAnswer || item.correct_answer || item.correctOption || item.correct_option || item.answer || item.Answer || item.ans || item.key;
      const validCorrectAnswer = resolveCorrectAnswer(rawAnswer, options);

      if (question && options.length >= 2) {
        mcqs.unshift({
          id: `mcq-bulk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          question: question.trim(),
          options,
          correctAnswer: validCorrectAnswer,
          explanation: item.explanation || item.Explanation || 'Verified question.',
          reference: item.reference || item.Reference || 'Bulk Import Collection',
          subject: item.subject || finalCategory,
          category: finalCategory,
          subcategory: item.subcategory || item.Subcategory || '',
          difficulty: item.difficulty || item.Difficulty || 'Medium',
          tags: Array.isArray(item.tags)
            ? item.tags
            : (item.tags || '').toString().split(',').map((t: string) => t.trim()).filter(Boolean),
          author: item.author || 'Admin Import',
          views: 10,
          likes: 0,
          dislikes: 0,
          createdAt: new Date().toISOString(),
          comments: []
        });
        addedCount++;
      }
    });

    res.json({
      message: `Successfully imported ${addedCount} MCQs into "${targetCategory || 'designated categories'}"!`,
      addedCount,
      totalMcqs: mcqs.length
    });
  });

  // Export Data
  app.get('/api/mcqs/export', (req, res) => {
    res.json(mcqs);
  });

  // 3. Categories & Subcategories API
  app.get('/api/categories', (req, res) => {
    const categoriesWithCount = categories.map(cat => {
      const catLower = cat.name.toLowerCase();
      const count = mcqs.filter(
        m =>
          m.category?.toLowerCase() === catLower ||
          m.category?.toLowerCase().includes(catLower) ||
          catLower.includes(m.category?.toLowerCase())
      ).length;
      return {
        ...cat,
        questionCount: count > 0 ? count : cat.questionCount
      };
    });
    res.json(categoriesWithCount);
  });

  app.post('/api/categories', (req, res) => {
    const { name, description, iconName } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description || '',
      iconName: iconName || 'BookOpen',
      questionCount: 0,
      subcategories: []
    };

    categories.push(newCat);
    res.status(201).json(newCat);
  });

  // 4. Quiz Generator & Submission
  app.get('/api/quiz/daily', (req, res) => {
    // Return 10 random MCQs for Daily Quiz
    const shuffled = [...mcqs].sort(() => 0.5 - Math.random());
    res.json({
      title: 'Daily Practice Quiz',
      questions: shuffled.slice(0, 10)
    });
  });

  app.post('/api/quiz/generate', (req, res) => {
    const { category, subcategory, difficulty, count = 10 } = req.body;

    let pool = [...mcqs];
    if (category && category !== 'All') {
      pool = pool.filter(m => m.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (subcategory) {
      pool = pool.filter(m => m.subcategory && m.subcategory.toLowerCase().includes(subcategory.toLowerCase()));
    }
    if (difficulty && difficulty !== 'All') {
      pool = pool.filter(m => m.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    const shuffled = pool.sort(() => 0.5 - Math.random());
    const countNum = parseInt(String(count), 10) || 10;
    const selected = shuffled.slice(0, Math.min(countNum, pool.length));

    res.json({
      title: `${category || 'Custom'} Quiz`,
      questions: selected.length > 0 ? selected : mcqs.slice(0, countNum)
    });
  });

  app.post('/api/quiz/submit', (req, res) => {
    const { quizTitle, category, score, totalQuestions, correctAnswers, wrongAnswers, skippedQuestions, timeTakenSeconds, mode, candidateName, candidateEmail } = req.body;

    const result: QuizResult = {
      id: `qres-${Date.now()}`,
      quizTitle: quizTitle || 'Practice Quiz',
      category: category || 'General',
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      skippedQuestions,
      scorePercentage: Math.round((correctAnswers / totalQuestions) * 100),
      timeTakenSeconds,
      completedAt: new Date().toISOString(),
      mode: mode || 'Practice',
      candidateName: candidateName || 'Candidate',
      candidateEmail: candidateEmail || ''
    };

    userProfile.quizHistory.unshift(result);
    userProfile.points += correctAnswers * 10;

    res.json({ result, updatedProfile: userProfile });
  });

  // 5. User Profile & Bookmarks API
  app.get('/api/user/profile', (req, res) => {
    res.json(userProfile);
  });

  app.post('/api/user/bookmark', (req, res) => {
    const { mcqId } = req.body;
    const idx = userProfile.bookmarkedMcqIds.indexOf(mcqId);
    if (idx > -1) {
      userProfile.bookmarkedMcqIds.splice(idx, 1);
    } else {
      userProfile.bookmarkedMcqIds.push(mcqId);
    }
    res.json({ bookmarkedMcqIds: userProfile.bookmarkedMcqIds });
  });

  // 6. Gemini AI Features (Server Side)
  // AI MCQ Explanation
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { question, options, correctAnswer, userContext } = req.body;
      const ai = getGeminiClient();

      const prompt = `Act as an expert exam coach and subject master for Pakistan competitive exams (FPSC, PPSC, NTS, CSS). 
Provide a clear, engaging, step-by-step detailed breakdown for this question:

Question: ${question}
Options: ${JSON.stringify(options)}
Correct Answer Option: ${correctAnswer}

Please structure your response in clean Markdown with:
1. **Core Concept Explained**: Why option ${correctAnswer} is 100% correct in simple, memorable terms.
2. **Why Other Options are Incorrect**: Brief 1-line reason for each incorrect option.
3. **Mnemonic / Memory Trick (if applicable)**: A quick trick or acronym to never forget this answer in exams.
4. **Exam Pro Tip**: A key related fact or frequently asked follow-up question in FPSC/PPSC.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
      });

      res.json({ explanation: response.text });
    } catch (err: any) {
      console.error('Gemini AI Explain Error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate AI explanation' });
    }
  });

  // AI Smart Concept Search
  app.post('/api/ai/smart-search', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: 'Query is required' });

      // Match MCQs with token and acronym intelligence
      const qClean = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      const stopWords = new Set(['who', 'is', 'the', 'of', 'in', 'and', 'what', 'which', 'was', 'were', 'to', 'for', 'a', 'an', 'are', 'how']);
      const tokens = qClean.split(/\s+/).filter((w: string) => w.length > 1 && !stopWords.has(w));

      const scoredMcqs: { mcq: MCQ; score: number }[] = [];
      mcqs.forEach(m => {
        const qText = m.question.toLowerCase();
        const expText = (m.explanation || '').toLowerCase();
        const catText = (m.category || '').toLowerCase();
        const tagsText = (m.tags || []).join(' ').toLowerCase();

        let score = 0;
        if (qText.includes(qClean)) score += 20;
        if (expText.includes(qClean)) score += 12;

        tokens.forEach((t: string) => {
          if (qText.includes(t)) score += 5;
          if (expText.includes(t)) score += 3;
          if (tagsText.includes(t)) score += 4;
          if (catText.includes(t)) score += 2;
        });

        if (tokens.includes('pm') && (qText.includes('prime minister') || tagsText.includes('prime minister') || expText.includes('prime minister'))) {
          score += 15;
        }

        if (score > 0) scoredMcqs.push({ mcq: m, score });
      });

      scoredMcqs.sort((a, b) => b.score - a.score);
      const topMatches = scoredMcqs.slice(0, 8).map(s => s.mcq);

      // Check knowledge base fact
      const fact = findQuickFact(query);

      // Try Gemini API if key is available
      try {
        const ai = getGeminiClient();
        const prompt = `A student preparing for Pakistan competitive exams searched for: "${query}".
Provide a concise 3-bullet concept summary directly answering this search topic, followed by key exam memory pointers.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt
        });

        if (response.text) {
          return res.json({
            summary: response.text,
            mcqs: topMatches.length > 0 ? topMatches : mcqs.slice(0, 3)
          });
        }
      } catch (aiErr) {
        // Fall back gracefully to built-in knowledge base if Gemini key is missing
      }

      // Fallback response using built-in knowledge base & matched MCQs
      let fallbackSummary = '';
      if (fact) {
        fallbackSummary = `**${fact.title}**\n\n${fact.answer}\n\nKey exam facts:\n` +
          fact.pointers.map(p => `• ${p}`).join('\n');
      } else if (topMatches.length > 0) {
        const categories = Array.from(new Set(topMatches.map(m => m.category))).join(', ');
        fallbackSummary = `Found ${topMatches.length} verified exam question${topMatches.length > 1 ? 's' : ''} for "${query}" across: ${categories}.`;
      } else {
        fallbackSummary = `No direct questions found for "${query}". Try searching for core topics like Pakistan Affairs, Current Affairs, Islamic Studies, or General Knowledge.`;
      }

      res.json({
        summary: fallbackSummary,
        mcqs: topMatches
      });
    } catch (err: any) {
      console.error('Smart search error:', err);
      res.status(500).json({ error: err.message || 'Smart search unavailable' });
    }
  });

  // AI Dynamic MCQ Generator for Custom Quiz
  app.post('/api/ai/generate-quiz', async (req, res) => {
    try {
      const { topic = 'Pakistan History', count = 5 } = req.body;
      const ai = getGeminiClient();

      const prompt = `Generate ${count} high-quality Multiple Choice Questions (MCQs) for Pakistani competitive exams (FPSC/PPSC/NTS) on topic: "${topic}".
Output ONLY valid JSON array with format:
[
  {
    "question": "string",
    "options": [
      {"id": "A", "text": "string"},
      {"id": "B", "text": "string"},
      {"id": "C", "text": "string"},
      {"id": "D", "text": "string"}
    ],
    "correctAnswer": "A",
    "explanation": "string",
    "subject": "${topic}",
    "category": "${topic}",
    "difficulty": "Medium"
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const generatedQuestions = JSON.parse(response.text || '[]');
      const formatted = generatedQuestions.map((q: any, i: number) => ({
        ...q,
        id: `ai-gen-${Date.now()}-${i}`,
        tags: ['AI Generated', topic],
        author: 'Gemini AI Coach',
        views: 10,
        likes: 5,
        dislikes: 0,
        createdAt: new Date().toISOString(),
        comments: []
      }));

      res.json({ questions: formatted });
    } catch (err: any) {
      console.error('Gemini AI Generate Quiz Error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate AI quiz' });
    }
  });

  // 7. Blog Section API
  app.get('/api/blog', (req, res) => {
    res.json(blogPosts);
  });

  app.get('/api/blog/:slug', (req, res) => {
    const post = blogPosts.find(p => p.slug === req.params.slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  });

  // 8. Admin Database Backup & Restore API
  app.get('/api/admin/backup', (req, res) => {
    res.json({
      siteSettings,
      categories,
      mcqs,
      blogPosts,
      userProfile,
      exportedAt: new Date().toISOString()
    });
  });

  app.post('/api/admin/restore', (req, res) => {
    const backup = req.body;
    if (backup.mcqs && backup.categories) {
      if (backup.siteSettings) siteSettings = backup.siteSettings;
      if (backup.categories) categories = backup.categories;
      if (backup.mcqs) mcqs = backup.mcqs;
      if (backup.blogPosts) blogPosts = backup.blogPosts;
      res.json({ message: 'Database restored successfully!' });
    } else {
      res.status(400).json({ error: 'Invalid backup JSON file' });
    }
  });

  // 9. SEO Sitemap & Robots.txt
  app.get('/sitemap.xml', (req, res) => {
    const host = req.get('host') || 'futureacademypro.com';
    const baseUrl = `https://${host}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;

    categories.forEach(cat => {
      xml += `  <url><loc>${baseUrl}/category/${cat.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    });

    mcqs.slice(0, 50).forEach(mcq => {
      xml += `  <url><loc>${baseUrl}/mcq/${mcq.id}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
    });

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.send(xml);
  });

  app.get('/robots.txt', (req, res) => {
    const host = req.get('host') || 'futureacademypro.com';
    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *\nAllow: /\nSitemap: https://${host}/sitemap.xml`);
  });

  app.get('/favicon.ico', (req, res) => {
    res.redirect(301, '/favicon.svg');
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Future Academy Pro Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
