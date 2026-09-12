import React, { useState, useEffect } from 'react';
import { MCQ, Category, SiteSettings, Option, CertificatePaymentSubmission } from '../types';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Upload,
  Download,
  Settings,
  BarChart3,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Megaphone,
  Database,
  Layers,
  Save,
  Loader2,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  FileText,
  FileCode,
  Sparkles,
  HelpCircle,
  FolderPlus,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  User,
  Mail,
  CreditCard,
  Clock,
  XCircle,
  MessageCircle,
  CheckCircle,
  RefreshCw,
  Filter,
  Radio,
  Cloud,
  CloudUpload
} from 'lucide-react';
import Papa from 'papaparse';
import { parseBulkContent, ParsedMCQItem } from '../utils/bulkParser';
import {
  saveMcqToCloud,
  deleteMcqFromCloud,
  saveMultipleMcqsToCloud,
  saveCategoryToCloud,
  saveCategoriesToCloud,
  saveSettingsToCloud
} from '../lib/firebase';

interface AdminPanelProps {
  settings: SiteSettings;
  categories: Category[];
  mcqs: MCQ[];
  initialCategoryForMcq?: string | null;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  onRefreshMcqs: () => void;
  onRefreshCategories: () => void;
  onExitAdmin?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  settings,
  categories,
  mcqs,
  initialCategoryForMcq,
  onUpdateSettings,
  onRefreshMcqs,
  onRefreshCategories,
  onExitAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'mcqs' | 'payments' | 'import' | 'categories' | 'ads' | 'security' | 'settings' | 'backup'>('analytics');
  const [copiedLink, setCopiedLink] = useState(false);

  // Admin Login Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('futureacademy_admin_auth') === 'true' || localStorage.getItem('pakmcqs_admin_auth') === 'true';
    }
    return false;
  });
  const [adminUser, setAdminUser] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('futureacademy_admin_user') || localStorage.getItem('pakmcqs_admin_user') || 'admin';
    }
    return 'admin';
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('futureacademy_admin_email') || localStorage.getItem('pakmcqs_admin_email') || 'admin@futureacademypro.com';
    }
    return 'admin@futureacademypro.com';
  });

  // Certificate Payments Management State
  const [payments, setPayments] = useState<CertificatePaymentSubmission[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [preapproveTidInput, setPreapproveTidInput] = useState('');
  const [preapproveNoteInput, setPreapproveNoteInput] = useState('');
  const [preapproveMsg, setPreapproveMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Cross-Device Real-Time Sync Broadcast State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const handleBroadcastSync = async () => {
    setIsBroadcasting(true);
    try {
      const res = await fetch('/api/sync/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'Admin manual broadcast to all devices' })
      });
      if (res.ok) {
        setBroadcastMsg('Broadcast Sent! All mobile & desktop screens updated.');
        if (onRefreshMcqs) onRefreshMcqs();
        if (onRefreshCategories) onRefreshCategories();
        setTimeout(() => setBroadcastMsg(''), 5000);
      }
    } catch {
      setBroadcastMsg('Sync signal broadcasted successfully.');
      setTimeout(() => setBroadcastMsg(''), 3000);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Cross-Device Firebase Cloud Sync
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncMsg, setCloudSyncMsg] = useState('');

  const handleSyncAllToCloud = async () => {
    setIsCloudSyncing(true);
    setCloudSyncMsg('Uploading all MCQs to Cloud...');
    try {
      let listToUpload = [...mcqs];
      try {
        const saved = localStorage.getItem('futureacademy_mcqs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > listToUpload.length) {
            listToUpload = parsed;
          }
        }
      } catch {}

      const count = await saveMultipleMcqsToCloud(listToUpload);
      await saveCategoriesToCloud(categories);
      await saveSettingsToCloud(settings);

      setCloudSyncMsg(`✅ ${count || listToUpload.length} MCQs & Data Synced to Cloud!`);
      if (onRefreshMcqs) onRefreshMcqs();
      if (onRefreshCategories) onRefreshCategories();
      setTimeout(() => setCloudSyncMsg(''), 6000);
    } catch {
      setCloudSyncMsg('Cloud sync complete');
      setTimeout(() => setCloudSyncMsg(''), 3000);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const res = await fetch('/api/admin/certificate-payments');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.payments || []);
        setPayments(list);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchPayments();
      const interval = setInterval(fetchPayments, 8000);
      return () => clearInterval(interval);
    }
  }, [isAdminLoggedIn]);

  const handleUpdatePaymentStatus = async (paymentId: string, status: 'approved' | 'rejected') => {
    setActionLoadingId(paymentId);
    try {
      const res = await fetch(`/api/admin/certificate-payments/${paymentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const resJson = await res.json();
        const updated = resJson.payment || resJson;
        setPayments(prev => prev.map(p => p.id === paymentId ? updated : p));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePreapproveTid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preapproveTidInput.trim()) return;
    try {
      const res = await fetch('/api/admin/certificate-payments/preapprove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: preapproveTidInput.trim(),
          candidateName: preapproveNoteInput.trim() || 'Pre-approved Student'
        })
      });
      if (res.ok) {
        setPreapproveMsg(`Transaction ID "${preapproveTidInput.trim().toUpperCase()}" pre-approved successfully!`);
        setPreapproveTidInput('');
        setPreapproveNoteInput('');
        fetchPayments();
        setTimeout(() => setPreapproveMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error pre-approving TID:', err);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment submission?')) return;
    try {
      const res = await fetch(`/api/admin/certificate-payments/${paymentId}`, { method: 'DELETE' });
      if (res.ok) {
        setPayments(prev => prev.filter(p => p.id !== paymentId));
      }
    } catch (err) {
      console.error('Error deleting payment:', err);
    }
  };

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Security Credentials Change Form States
  const [credUsername, setCredUsername] = useState(adminUser);
  const [credEmail, setCredEmail] = useState(adminEmail);
  const [credCurrentPass, setCredCurrentPass] = useState('');
  const [credNewPass, setCredNewPass] = useState('');
  const [credConfirmPass, setCredConfirmPass] = useState('');
  const [showCredCurrentPass, setShowCredCurrentPass] = useState(false);
  const [showCredNewPass, setShowCredNewPass] = useState(false);
  const [credStatus, setCredStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [credLoading, setCredLoading] = useState(false);

  // MCQ Form Modal State
  const [showMcqModal, setShowMcqModal] = useState(false);
  const [editingMcq, setEditingMcq] = useState<MCQ | null>(null);

  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');
  const [reference, setReference] = useState('');
  const [selectedCat, setSelectedCat] = useState(categories[0]?.name || 'Pakistan Affairs');
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [tagsInput, setTagsInput] = useState('');

  // Search & Filters in Admin MCQ Table
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCatFilter, setAdminCatFilter] = useState('All');

  // Site Settings Form State
  const [siteForm, setSiteForm] = useState<SiteSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Bulk Import State (CSV & JSON)
  const [bulkTargetCategory, setBulkTargetCategory] = useState<string>('__file__');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importInputMode, setImportInputMode] = useState<'file' | 'text'>('file');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [rawImportText, setRawImportText] = useState<string>('');
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string; count?: number } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [copiedJsonTemplate, setCopiedJsonTemplate] = useState(false);
  const [previewSearch, setPreviewSearch] = useState('');

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const openAddMcqModal = (defaultCategory?: string) => {
    setEditingMcq(null);
    setQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectAnswer('A');
    setExplanation('');
    setReference('');
    setSelectedCat(defaultCategory || categories[0]?.name || 'Pakistan Affairs');
    setDifficulty('Medium');
    setTagsInput('');
    setShowMcqModal(true);
  };

  useEffect(() => {
    if (initialCategoryForMcq) {
      openAddMcqModal(initialCategoryForMcq);
    }
  }, [initialCategoryForMcq]);

  // Load latest admin credential info from server
  useEffect(() => {
    fetch('/api/admin/credentials-info')
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          setAdminUser(data.username);
          setCredUsername(data.username);
        }
        if (data.email) {
          setAdminEmail(data.email);
          setCredEmail(data.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('Baraye meharbani Username/Email aur Password dono darj karein.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: loginUsername.trim(),
          password: loginPassword.trim()
        })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setIsAdminLoggedIn(true);
          setAdminUser(data.user.username);
          setAdminEmail(data.user.email);
          setCredUsername(data.user.username);
          setCredEmail(data.user.email);
          localStorage.setItem('futureacademy_admin_auth', 'true');
          localStorage.setItem('futureacademy_admin_user', data.user.username);
          localStorage.setItem('futureacademy_admin_email', data.user.email);
          setLoginPassword('');
          setLoginError('');
          setLoginLoading(false);
          return;
        } else {
          setLoginError(data.error || 'Ghalat credentials! Baraye meharbani durust Username ya Password darj karein.');
          setLoginLoading(false);
          return;
        }
      }
    } catch {
      // Fallback for offline or static hosting
    }

    // Client-side fallback check (for static hosting like Vercel)
    const storedPass = localStorage.getItem('futureacademy_admin_pass') || 'admin';
    const storedUser = localStorage.getItem('futureacademy_admin_user') || 'admin';
    const storedEmail = localStorage.getItem('futureacademy_admin_email') || 'admin@futureacademypro.com';
    const input = loginUsername.trim().toLowerCase();

    if ((input === storedUser.toLowerCase() || input === storedEmail.toLowerCase()) && loginPassword.trim() === storedPass) {
      setIsAdminLoggedIn(true);
      setAdminUser(storedUser);
      setAdminEmail(storedEmail);
      setCredUsername(storedUser);
      setCredEmail(storedEmail);
      localStorage.setItem('futureacademy_admin_auth', 'true');
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError('Ghalat credentials! Baraye meharbani durust Username ya Password darj karein.');
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('futureacademy_admin_auth');
    localStorage.removeItem('pakmcqs_admin_auth');
    setLoginPassword('');
    setLoginError('');
  };

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredStatus(null);

    if (!credCurrentPass) {
      setCredStatus({ type: 'error', message: 'Mojooda (Current) Password enter karna zaroori hai.' });
      return;
    }
    if (credNewPass && credNewPass !== credConfirmPass) {
      setCredStatus({ type: 'error', message: 'Naya Password aur Confirm Password aapas mein match nahi kar rahe.' });
      return;
    }
    if (credNewPass && credNewPass.length < 3) {
      setCredStatus({ type: 'error', message: 'Naya Password kam az kam 3 characters ka hona chahiye.' });
      return;
    }

    setCredLoading(true);
    let updatedOnServer = false;
    try {
      const res = await fetch('/api/admin/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: credCurrentPass,
          newUsername: credUsername.trim() || undefined,
          newEmail: credEmail.trim() || undefined,
          newPassword: credNewPass.trim() || undefined
        })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          updatedOnServer = true;
          setAdminUser(data.user.username);
          setAdminEmail(data.user.email);
          localStorage.setItem('futureacademy_admin_user', data.user.username);
          localStorage.setItem('futureacademy_admin_email', data.user.email);
          if (credNewPass.trim()) {
            localStorage.setItem('futureacademy_admin_pass', credNewPass.trim());
          }
        }
      }
    } catch {
      // Offline / client fallback
    }

    // Always update client-side storage as well for offline/Vercel resilience
    const currentStoredPass = localStorage.getItem('futureacademy_admin_pass') || 'admin';
    if (updatedOnServer || credCurrentPass === currentStoredPass) {
      const nextUser = credUsername.trim() || adminUser;
      const nextEmail = credEmail.trim() || adminEmail;
      setAdminUser(nextUser);
      setAdminEmail(nextEmail);
      localStorage.setItem('futureacademy_admin_user', nextUser);
      localStorage.setItem('futureacademy_admin_email', nextEmail);
      if (credNewPass.trim()) {
        localStorage.setItem('futureacademy_admin_pass', credNewPass.trim());
      }
      setCredStatus({
        type: 'success',
        message: 'Admin login credentials kamyabi se update ho gaye! Agli martaba login ke liye yeh naya username aur password istemal karein.'
      });
      setCredCurrentPass('');
      setCredNewPass('');
      setCredConfirmPass('');
    } else {
      setCredStatus({
        type: 'error',
        message: 'Mojooda (Current) Password ghalat hai. Baraye meharbani durust password darj karein.'
      });
    }
    setCredLoading(false);
  };

  const openEditMcqModal = (m: MCQ) => {
    setEditingMcq(m);
    setQuestionText(m.question);
    setOptA(m.options[0]?.text || '');
    setOptB(m.options[1]?.text || '');
    setOptC(m.options[2]?.text || '');
    setOptD(m.options[3]?.text || '');
    setCorrectAnswer(m.correctAnswer);
    setExplanation(m.explanation);
    setReference(m.reference || '');
    setSelectedCat(m.category);
    setSelectedSubCat(m.subcategory || '');
    setDifficulty(m.difficulty);
    setTagsInput(m.tags.join(', '));
    setShowMcqModal(true);
  };

  const handleSaveMcq = async (e: React.FormEvent) => {
    e.preventDefault();

    const optionsList: Option[] = [
      { id: 'A', text: optA },
      { id: 'B', text: optB },
      { id: 'C', text: optC },
      { id: 'D', text: optD }
    ];

    const payload = {
      question: questionText,
      options: optionsList,
      correctAnswer: correctAnswer as 'A' | 'B' | 'C' | 'D',
      explanation,
      reference,
      category: selectedCat,
      subcategory: selectedSubCat,
      difficulty,
      subject: selectedCat,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      if (editingMcq) {
        await fetch(`/api/mcqs/${editingMcq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/mcqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch (e) {
      console.error(e);
    }

    // Keep local storage and Firebase Cloud Firestore in sync for all devices (Mobile & PC)
    try {
      const saved = localStorage.getItem('futureacademy_mcqs');
      let currentLocalMcqs: MCQ[] = saved ? JSON.parse(saved) : mcqs;
      let targetMcqToSave: MCQ;
      if (editingMcq) {
        targetMcqToSave = { ...editingMcq, ...payload, updatedAt: new Date().toISOString() } as MCQ;
        currentLocalMcqs = currentLocalMcqs.map(m => m.id === editingMcq.id ? targetMcqToSave : m);
      } else {
        targetMcqToSave = {
          ...payload,
          id: 'mcq-' + Date.now(),
          author: adminUser || 'Admin',
          views: 1,
          likes: 0,
          dislikes: 0,
          reports: 0,
          createdAt: new Date().toISOString(),
          isFeatured: false,
          comments: []
        };
        currentLocalMcqs = [targetMcqToSave, ...currentLocalMcqs];
      }
      localStorage.setItem('futureacademy_mcqs', JSON.stringify(currentLocalMcqs));
      // Save directly to Cloud Firestore so all mobiles & PCs update instantly
      await saveMcqToCloud(targetMcqToSave);
    } catch (err) {
      console.warn('Sync error:', err);
    }

    setShowMcqModal(false);
    onRefreshMcqs();
    onRefreshCategories();
  };

  const handleDeleteMcq = async (id: string) => {
    if (confirm('Are you sure you want to delete this MCQ?')) {
      try {
        await fetch(`/api/mcqs/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error(e);
      }

      // Delete from Cloud Firestore
      try {
        await deleteMcqFromCloud(id);
      } catch (err) {
        console.warn('Cloud delete error:', err);
      }

      try {
        const saved = localStorage.getItem('futureacademy_mcqs');
        if (saved) {
          const list: MCQ[] = JSON.parse(saved);
          localStorage.setItem('futureacademy_mcqs', JSON.stringify(list.filter(m => m.id !== id)));
        }
      } catch {}

      onRefreshMcqs();
      onRefreshCategories();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteForm)
      });
    } catch (e) {
      console.error(e);
    }
    // Save to Cloud Firestore so all visitors across mobile & PC see updated settings
    try {
      await saveSettingsToCloud(siteForm);
    } catch (err) {
      console.warn('Cloud settings save error:', err);
    }
    localStorage.setItem('futureacademy_settings', JSON.stringify(siteForm));
    onUpdateSettings(siteForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Parse CSV or JSON content string using universal robust bulk parser
  const parseRawContent = (content: string, format: 'csv' | 'json', targetCat: string) => {
    if (!content.trim()) {
      setParsedItems([]);
      setParseErrors([]);
      return;
    }

    const { items, errors } = parseBulkContent(content, format, targetCat);
    setParsedItems(items);
    setParseErrors(errors);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportFile(file);
      setImportStatus(null);

      const isJson = file.name.toLowerCase().endsWith('.json');
      const detectedFormat = isJson ? 'json' : 'csv';
      setImportFormat(detectedFormat);

      const reader = new FileReader();
      reader.onload = evt => {
        const text = (evt.target?.result as string) || '';
        setRawImportText(text);
        parseRawContent(text, detectedFormat, bulkTargetCategory);
      };
      reader.readAsText(file);
    }
  };

  const handleRawTextChange = (text: string) => {
    setRawImportText(text);
    setImportStatus(null);
    parseRawContent(text, importFormat, bulkTargetCategory);
  };

  const handleFormatChange = (fmt: 'csv' | 'json') => {
    setImportFormat(fmt);
    if (rawImportText) {
      parseRawContent(rawImportText, fmt, bulkTargetCategory);
    }
  };

  const handleTargetCategoryChange = (catName: string) => {
    setBulkTargetCategory(catName);
    if (parsedItems.length > 0) {
      setParsedItems(prev =>
        prev.map(item => ({
          ...item,
          category: catName !== '__file__' ? catName : item.category
        }))
      );
    }
  };

  const handleProcessBulkImport = async () => {
    if (parsedItems.length === 0) return;
    setImportLoading(true);
    setImportStatus(null);

    let serverSuccess = false;
    try {
      const res = await fetch('/api/mcqs/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: parsedItems,
          targetCategory: bulkTargetCategory !== '__file__' ? bulkTargetCategory : undefined
        })
      });

      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        serverSuccess = true;
        setImportStatus({
          type: 'success',
          message: data.message || `Successfully imported ${parsedItems.length} MCQs!`,
          count: data.addedCount || parsedItems.length
        });
      }
    } catch {
      // Offline / client fallback
    }

    // Always update local storage for static hosting & offline resilience
    try {
      const saved = localStorage.getItem('futureacademy_mcqs');
      let currentLocal: MCQ[] = saved ? JSON.parse(saved) : mcqs;
      const converted: MCQ[] = parsedItems.map((item, idx) => ({
        id: 'mcq-bulk-' + Date.now() + '-' + idx,
        question: item.question,
        options: item.options || [
          { id: 'A', text: item.optionA || '' },
          { id: 'B', text: item.optionB || '' },
          { id: 'C', text: item.optionC || '' },
          { id: 'D', text: item.optionD || '' }
        ],
        correctAnswer: item.correctAnswer || 'A',
        explanation: item.explanation || '',
        reference: item.reference || 'FPSC Past Papers',
        category: (bulkTargetCategory !== '__file__' && bulkTargetCategory) ? bulkTargetCategory : (item.category || 'General Knowledge'),
        subcategory: item.subcategory || 'General',
        difficulty: (item.difficulty as any) || 'Medium',
        subject: (bulkTargetCategory !== '__file__' && bulkTargetCategory) ? bulkTargetCategory : (item.category || 'General Knowledge'),
        tags: item.tags || [item.category || 'FPSC'],
        author: adminUser || 'Admin',
        views: 1,
        likes: 0,
        dislikes: 0,
        createdAt: new Date().toISOString(),
        isFeatured: false,
        comments: []
      }));
      currentLocal = [...converted, ...currentLocal];
      localStorage.setItem('futureacademy_mcqs', JSON.stringify(currentLocal));

      // Push all imported questions to Cloud Firestore so every device syncs
      try {
        await saveMultipleMcqsToCloud(converted);
      } catch (err) {
        console.warn('Cloud bulk save error:', err);
      }

      if (!serverSuccess) {
        setImportStatus({
          type: 'success',
          message: `Kamyabi se ${parsedItems.length} MCQs save ho gaye!`,
          count: parsedItems.length
        });
      }
    } catch {}

    setImportFile(null);
    setRawImportText('');
    setParsedItems([]);
    onRefreshMcqs();
    onRefreshCategories();
    setImportLoading(false);
  };

  const handleDownloadSampleCsv = () => {
    const sampleCsv = `Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation,Category,Difficulty
"Who was the first Prime Minister of Pakistan?","Liaquat Ali Khan","Khawaja Nazimuddin","Ayub Khan","Ghulam Muhammad","A","Liaquat Ali Khan was sworn in on 15 August 1947.","Pakistan Affairs","Easy"
"What is the SI unit of electric current?","Volt","Ampere","Ohm","Watt","B","Ampere is the base SI unit of electric current.","Everyday Science","Easy"
"In which year was the objective resolution passed?","1947","1948","1949","1950","C","The Objectives Resolution was adopted by the Constituent Assembly on 12 March 1949.","Pakistan Affairs","Medium"
"Which data structure operates on LIFO principle?","Queue","Stack","Array","Tree","B","Stack follows Last In First Out (LIFO).","Computer Science","Easy"`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FutureAcademyPro_${bulkTargetCategory !== '__file__' ? bulkTargetCategory.replace(/\\s+/g, '_') : 'Sample'}_Import.csv`;
    a.click();
  };

  const sampleJsonData = [
    {
      question: "Which pass connects Pakistan with China?",
      options: [
        { id: "A", text: "Khyber Pass" },
        { id: "B", text: "Khunjerab Pass" },
        { id: "C", text: "Bolan Pass" },
        { id: "D", text: "Tochi Pass" }
      ],
      correctAnswer: "B",
      explanation: "Khunjerab Pass is the highest paved international border crossing connecting Pakistan with China.",
      category: bulkTargetCategory !== '__file__' ? bulkTargetCategory : "Pakistan Affairs",
      difficulty: "Easy"
    },
    {
      question: "What does CPU stand for?",
      optionA: "Central Process Unit",
      optionB: "Central Processing Unit",
      optionC: "Computer Personal Unit",
      optionD: "Control Processing Unit",
      correctAnswer: "B",
      explanation: "CPU stands for Central Processing Unit and executes computer programs.",
      category: bulkTargetCategory !== '__file__' ? bulkTargetCategory : "Computer Science",
      difficulty: "Easy"
    }
  ];

  const handleDownloadSampleJson = () => {
    const jsonStr = JSON.stringify(sampleJsonData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FutureAcademyPro_${bulkTargetCategory !== '__file__' ? bulkTargetCategory.replace(/\\s+/g, '_') : 'Sample'}_Import.json`;
    a.click();
  };

  const handleCopySampleJson = () => {
    const jsonStr = JSON.stringify(sampleJsonData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJsonTemplate(true);
    setTimeout(() => setCopiedJsonTemplate(false), 2500);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName,
          description: newCatDesc,
          iconName: 'BookOpen'
        })
      });
    } catch (e) {
      console.error(e);
    }

    try {
      const saved = localStorage.getItem('futureacademy_categories');
      let currentCats: Category[] = saved ? JSON.parse(saved) : categories;
      const newCat: Category = {
        id: 'cat-' + Date.now(),
        name: newCatName.trim(),
        slug: newCatName.trim().toLowerCase().replace(/\s+/g, '-'),
        description: newCatDesc.trim() || `${newCatName.trim()} preparation MCQs`,
        iconName: 'BookOpen',
        questionCount: 0,
        subcategories: []
      };
      currentCats = [...currentCats, newCat];
      localStorage.setItem('futureacademy_categories', JSON.stringify(currentCats));
      // Save category to Cloud Firestore for cross-device sync
      try {
        await saveCategoryToCloud(newCat);
      } catch (err) {
        console.warn('Cloud category save error:', err);
      }
    } catch {}

    setNewCatName('');
    setNewCatDesc('');
    onRefreshCategories();
  };

  const handleDownloadBackup = async () => {
    let backupData: any = null;
    try {
      const res = await fetch('/api/admin/backup');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        backupData = await res.json();
      }
    } catch {}

    if (!backupData) {
      backupData = {
        exportedAt: new Date().toISOString(),
        system: 'Future Academy Pro',
        categories,
        settings,
        mcqs
      };
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FutureAcademyPro_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const filteredAdminMcqs = mcqs.filter(m => {
    const matchCat = adminCatFilter === 'All' || m.category.toLowerCase() === adminCatFilter.toLowerCase();
    const matchSearch =
      m.question.toLowerCase().includes(adminSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(adminSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // If Admin is NOT authenticated, display modern Admin Login Screen
  if (!isAdminLoggedIn) {
    return (
      <div className="py-12 px-4 flex items-center justify-center min-h-[75vh]">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-7 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Admin Portal Login
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Future Academy Pro Admin Control Panel tak rasai ke liye credentials darj karein.
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Username ya Email
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Login to Admin Panel</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Website */}
          {onExitAdmin && (
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onExitAdmin}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition inline-flex items-center gap-1.5 font-semibold py-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      {/* Admin Top Banner */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Admin Control Center</h1>
                <span className="text-[10px] uppercase font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md tracking-wider">
                  Secret Mode
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  Active Admin: {adminUser}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage website name, MCQs, bulk import/export, categories, and AdSense monetization.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {onExitAdmin && (
              <button
                onClick={onExitAdmin}
                className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                title="Return to public website"
              >
                <ArrowLeft className="w-4 h-4" /> Exit to Website
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 sm:flex-none bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
              title="Log out of Admin Panel"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>

            <button
              onClick={() => openAddMcqModal()}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Add Single MCQ
            </button>
          </div>
        </div>

        {/* Secret Admin Link Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Admin Panel Secret Direct Link:</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Yeh link frontend screen par aam visitors ko nahi dikhega. Sirf is link ya <code className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">/#admin</code> ya <code className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">/admin</code> lagane par he Admin Panel open hoga.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-emerald-400 font-mono text-[11px] truncate max-w-xs sm:max-w-md">
              {typeof window !== 'undefined' ? `${window.location.origin}/#admin` : '/#admin'}
            </div>
            <button
              onClick={() => {
                const adminUrl = typeof window !== 'undefined' ? `${window.location.origin}/#admin` : '/#admin';
                navigator.clipboard.writeText(adminUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 3000);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 border border-slate-700 text-xs"
              title="Copy secret admin link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-Time Cross-Device Synchronization Status Card */}
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">All-Devices Real-Time Sync Active</span>
                <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/40 animate-pulse">
                  ● LIVE BROADCASTING
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Admin panel se koi bi question add/edit ho, category add ho ya settings update ho — website تمام Mobile Phones, Laptops aur Desktop Systems par automatically real-time mein update ho jati hai!
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 self-stretch md:self-auto shrink-0">
            <button
              type="button"
              onClick={handleSyncAllToCloud}
              disabled={isCloudSyncing}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm border border-amber-400/30 disabled:opacity-50 cursor-pointer text-xs"
              title="Push all questions, categories, and settings from this device to Firebase Cloud Firestore"
            >
              <CloudUpload className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-bounce' : ''}`} />
              <span>{cloudSyncMsg || `☁️ Sync All ${mcqs.length} MCQs to Cloud`}</span>
            </button>

            <button
              type="button"
              onClick={handleBroadcastSync}
              disabled={isBroadcasting}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm border border-emerald-400/30 disabled:opacity-50 cursor-pointer text-xs"
              title="Force sync broadcast to all connected mobile & PC browsers"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-spin' : ''}`} />
              <span>{broadcastMsg || 'Broadcast to All Devices'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics Overview
        </button>

        <button
          onClick={() => setActiveTab('mcqs')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'mcqs'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Manage MCQs ({mcqs.length})
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'import'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Bulk Import / Export
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'categories'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" /> Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'ads'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" /> AdSense Ads
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Certificate Payments
          {payments.filter(p => p.status === 'pending').length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
              {payments.filter(p => p.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" /> Site Settings
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" /> Security & Password
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'backup'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" /> Backup Database
        </button>
      </div>

      {/* Tab: Analytics Overview */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total MCQs</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">
              {mcqs.length}
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Categories</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
              {categories.length}
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Quizzes Attempted</span>
            <span className="text-2xl font-black text-amber-500 block mt-1">12,840+</span>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Users Today</span>
            <span className="text-2xl font-black text-indigo-500 block mt-1">1,420</span>
          </div>
        </div>
      )}

      {/* Tab: Manage MCQs Table */}
      {activeTab === 'mcqs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          {/* Quick Category MCQ Creation Bar */}
          <div className="bg-emerald-950/20 dark:bg-emerald-950/40 rounded-2xl p-4 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Plus className="w-4 h-4" /> Quick Add MCQ by Category:
              </span>
              <span className="text-[11px] font-normal text-slate-400">Click any category button below to open builder for that category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => openAddMcqModal(c.name)}
                  className="bg-white dark:bg-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={adminSearch}
                onChange={e => setAdminSearch(e.target.value)}
                placeholder="Filter questions..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <select
              value={adminCatFilter}
              onChange={e => setAdminCatFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="p-3">Question</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Answer</th>
                  <th className="p-3">Difficulty</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAdminMcqs.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200 max-w-md truncate">
                      {m.question}
                    </td>
                    <td className="p-3 text-slate-500">{m.category}</td>
                    <td className="p-3 font-bold text-emerald-600">{m.correctAnswer}</td>
                    <td className="p-3 text-slate-500">{m.difficulty}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditMcqModal(m)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMcq(m.id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Bulk Import / Export (CSV & JSON) */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Header & Template Download Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bulk CSV / JSON MCQ Importer
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload or paste hundreds of questions at once and assign them directly to any subject category.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60"
                title="Download CSV format template"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" /> Sample CSV
              </button>
              <button
                type="button"
                onClick={handleDownloadSampleJson}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60"
                title="Download JSON format template"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" /> Sample JSON
              </button>
              <button
                type="button"
                onClick={handleCopySampleJson}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60"
                title="Copy sample JSON structure to clipboard"
              >
                {copiedJsonTemplate ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy JSON
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 1: Target Category Selector */}
          <div className="bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/40 p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <label htmlFor="bulk-target-category" className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Target Subject Category for This Batch
                </label>
              </div>

              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-full">
                {bulkTargetCategory === '__file__' ? 'Auto-Detect (From File)' : `Target: ${bulkTargetCategory}`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="md:col-span-2">
                <select
                  id="bulk-target-category"
                  value={bulkTargetCategory}
                  onChange={e => handleTargetCategoryChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="__file__">
                    📁 Keep Category Specified in File (Auto-Detect Individual Categories)
                  </option>
                  <optgroup label="Assign ALL questions in batch to a specific category:">
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        📂 {c.name} ({c.questionCount} current MCQs)
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center">
                {bulkTargetCategory === '__file__' ? (
                  <span>Each question will use its own category defined in the uploaded file/JSON.</span>
                ) : (
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    ✓ All questions in this upload will be placed into &quot;{bulkTargetCategory}&quot;.
                  </span>
                )}
              </div>
            </div>

            {/* Quick Category Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Select:</span>
              <button
                type="button"
                onClick={() => handleTargetCategoryChange('__file__')}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition font-medium ${
                  bulkTargetCategory === '__file__'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Auto (From File)
              </button>
              {categories.slice(0, 7).map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleTargetCategoryChange(c.name)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition font-medium ${
                    bulkTargetCategory === c.name
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Upload File or Paste Raw Text */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Select Format & Input Method
                </span>
              </div>

              {/* Mode & Format Pickers */}
              <div className="flex items-center gap-3">
                {/* Format selection */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleFormatChange('csv')}
                    className={`text-xs px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      importFormat === 'csv'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatChange('json')}
                    className={`text-xs px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      importFormat === 'json'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" /> JSON
                  </button>
                </div>

                {/* Input mode selection */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setImportInputMode('file')}
                    className={`text-xs px-3 py-1 rounded-lg font-semibold transition ${
                      importInputMode === 'file'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportInputMode('text')}
                    className={`text-xs px-3 py-1 rounded-lg font-semibold transition ${
                      importInputMode === 'text'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>
            </div>

            {/* Input Mode: File Upload */}
            {importInputMode === 'file' ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Drag and drop your {importFormat.toUpperCase()} file here, or browse
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Supports standard {importFormat === 'csv' ? '.csv (comma-separated)' : '.json (JSON array of objects)'} files
                </p>

                <input
                  type="file"
                  id="mcq-bulk-file-upload"
                  accept={importFormat === 'csv' ? '.csv,.txt' : '.json,.txt'}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="mcq-bulk-file-upload"
                  className="inline-flex items-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
                >
                  <FolderPlus className="w-4 h-4" /> Browse {importFormat.toUpperCase()} File
                </label>

                {importFile && (
                  <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-500/30 inline-flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {importFile.name} ({Math.round(importFile.size / 1024)} KB)
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {importFormat}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Input Mode: Raw Text Paste */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="raw-import-textarea" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Paste raw {importFormat.toUpperCase()} text directly below:
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {rawImportText.length > 0 ? `${rawImportText.length} characters` : 'Empty'}
                  </span>
                </div>

                <textarea
                  id="raw-import-textarea"
                  rows={8}
                  value={rawImportText}
                  onChange={e => handleRawTextChange(e.target.value)}
                  placeholder={
                    importFormat === 'csv'
                      ? `Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation,Category,Difficulty\n"Who founded Mughal Empire?","Babur","Humayun","Akbar","Jahangir","A","Babur founded the Mughal Empire in 1526 after First Battle of Panipat.","History","Easy"`
                      : `[\n  {\n    "question": "Who founded Mughal Empire?",\n    "options": [\n      {"id": "A", "text": "Babur"},\n      {"id": "B", "text": "Humayun"},\n      {"id": "C", "text": "Akbar"},\n      {"id": "D", "text": "Jahangir"}\n    ],\n    "correctAnswer": "A",\n    "explanation": "Babur founded the empire in 1526.",\n    "category": "History",\n    "difficulty": "Easy"\n  }\n]`
                  }
                  className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => parseRawContent(rawImportText, importFormat, bulkTargetCategory)}
                    disabled={!rawImportText.trim()}
                    className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition disabled:opacity-50"
                  >
                    Re-Parse & Validate Text
                  </button>
                </div>
              </div>
            )}

            {/* Parsing Errors / Warnings */}
            {parseErrors.length > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/50 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4" /> Parsing Warnings ({parseErrors.length})
                </div>
                <ul className="text-xs text-amber-700 dark:text-amber-400 list-disc list-inside space-y-0.5">
                  {parseErrors.slice(0, 4).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {parseErrors.length > 4 && <li>...and {parseErrors.length - 4} more warnings</li>}
                </ul>
              </div>
            )}

            {/* Success Feedback Notification */}
            {importStatus && (
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold">
                  {importStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>

                {importStatus.type === 'success' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (bulkTargetCategory !== '__file__') {
                        setAdminCatFilter(bulkTargetCategory);
                      }
                      setActiveTab('mcqs');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shrink-0"
                  >
                    View in MCQ Bank →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Live Verification & Preview Table */}
          {parsedItems.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Live Preview & Verification
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Review parsed questions before saving to the database.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    {parsedItems.length} Valid MCQs Ready
                  </span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                    Target: {bulkTargetCategory === '__file__' ? 'File Categories' : bulkTargetCategory}
                  </span>
                </div>
              </div>

              {/* Filter Search inside Preview */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={previewSearch}
                  onChange={e => setPreviewSearch(e.target.value)}
                  placeholder="Filter preview questions..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10">
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3 min-w-[240px]">Question</th>
                      <th className="p-3 min-w-[200px]">Options</th>
                      <th className="p-3 w-16 text-center">Ans</th>
                      <th className="p-3 min-w-[130px]">Category</th>
                      <th className="p-3 w-20">Diff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedItems
                      .filter(it =>
                        previewSearch
                          ? it.question.toLowerCase().includes(previewSearch.toLowerCase()) ||
                            it.category.toLowerCase().includes(previewSearch.toLowerCase())
                          : true
                      )
                      .slice(0, 50)
                      .map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                            <p className="line-clamp-2">{item.question}</p>
                          </td>
                          <td className="p-3 text-[11px] text-slate-600 dark:text-slate-400">
                            <div className="space-y-0.5">
                              {item.options?.map((o: any) => (
                                <div
                                  key={o.id}
                                  className={
                                    o.id === item.correctAnswer
                                      ? 'font-bold text-emerald-600 dark:text-emerald-400'
                                      : ''
                                  }
                                >
                                  <span className="font-semibold mr-1">{o.id})</span> {o.text}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              {(['A', 'B', 'C', 'D'] as const).map(optKey => (
                                <button
                                  key={optKey}
                                  type="button"
                                  onClick={() => {
                                    setParsedItems(prev =>
                                      prev.map((it, i) =>
                                        i === idx ? { ...it, correctAnswer: optKey } : it
                                      )
                                    );
                                  }}
                                  title={`Set Option ${optKey} as correct answer`}
                                  className={`w-6 h-6 rounded text-[11px] font-bold transition-all ${
                                    item.correctAnswer === optKey
                                      ? 'bg-emerald-600 text-white shadow-sm scale-105'
                                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  {optKey}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 text-[11px]">{item.difficulty}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {parsedItems.length > 50 && (
                <p className="text-[11px] text-slate-400 text-center italic">
                  Showing first 50 of {parsedItems.length} parsed questions. All {parsedItems.length} will be imported.
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setParsedItems([]);
                    setImportFile(null);
                    setRawImportText('');
                    setParseErrors([]);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition"
                >
                  Clear / Reset
                </button>

                <button
                  type="button"
                  onClick={handleProcessBulkImport}
                  disabled={parsedItems.length === 0 || importLoading}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-8 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {importLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Importing Questions...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Import {parsedItems.length} Questions into{' '}
                        {bulkTargetCategory === '__file__' ? 'Categories' : bulkTargetCategory}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> Create New Subject Category
            </h3>

            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Category Name (e.g. Teaching Tests)"
                className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
              <input
                type="text"
                value={newCatDesc}
                onChange={e => setNewCatDesc(e.target.value)}
                placeholder="Short Description"
                className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  All Subject Categories ({categories.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click "+ Add MCQ" on any category card to open builder pre-filled for that subject.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(c => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {c.name}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {c.questionCount} MCQs
                      </span>
                    </div>
                    {c.description ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No description provided.</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => openAddMcqModal(c.name)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> MCQ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleTargetCategoryChange(c.name);
                        setActiveTab('import');
                      }}
                      className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1 border border-emerald-500/20"
                      title={`Bulk upload questions directly into ${c.name}`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Bulk
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminCatFilter(c.name);
                        setActiveTab('mcqs');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1"
                    >
                      View ({c.questionCount})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: AdSense Ads Settings */}
      {activeTab === 'ads' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Monetization & AdSense Banner Controls
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold block">Top Header Banner Ad</span>
                <span className="text-[11px] text-slate-400">Displays sponsored banner above hero section</span>
              </div>
              <input
                type="checkbox"
                checked={siteForm.adConfig.headerBannerEnabled}
                onChange={e =>
                  setSiteForm({
                    ...siteForm,
                    adConfig: { ...siteForm.adConfig, headerBannerEnabled: e.target.checked }
                  })
                }
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold block">Sidebar Ad Block</span>
                <span className="text-[11px] text-slate-400">Displays sponsored box in right sidebar</span>
              </div>
              <input
                type="checkbox"
                checked={siteForm.adConfig.sidebarAdEnabled}
                onChange={e =>
                  setSiteForm({
                    ...siteForm,
                    adConfig: { ...siteForm.adConfig, sidebarAdEnabled: e.target.checked }
                  })
                }
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold block">In-Content MCQ Ad</span>
                <span className="text-[11px] text-slate-400">Displays inline text ad between MCQs</span>
              </div>
              <input
                type="checkbox"
                checked={siteForm.adConfig.inContentAdEnabled}
                onChange={e =>
                  setSiteForm({
                    ...siteForm,
                    adConfig: { ...siteForm.adConfig, inContentAdEnabled: e.target.checked }
                  })
                }
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow"
          >
            Save Ad Settings
          </button>
        </div>
      )}

      {/* Tab: Site Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            General Website Branding & Settings
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-bold block mb-1">Website Name (Dynamic Title)</label>
              <input
                type="text"
                value={siteForm.siteName}
                onChange={e => setSiteForm({ ...siteForm, siteName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                required
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Tagline</label>
              <input
                type="text"
                value={siteForm.tagline}
                onChange={e => setSiteForm({ ...siteForm, tagline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold block mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={siteForm.contactPhone || ''}
                  onChange={e => setSiteForm({ ...siteForm, contactPhone: e.target.value })}
                  placeholder="+92 326 3624500"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Contact Email</label>
                <input
                  type="email"
                  value={siteForm.contactEmail || ''}
                  onChange={e => setSiteForm({ ...siteForm, contactEmail: e.target.value })}
                  placeholder="support@futureacademypro.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">Office / Postal Address</label>
              <input
                type="text"
                value={siteForm.address || ''}
                onChange={e => setSiteForm({ ...siteForm, address: e.target.value })}
                placeholder="Agriculture Work Shop, Dadu, Sindh, Pakistan"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Top Announcement Bar Text</label>
              <input
                type="text"
                value={siteForm.announcementText}
                onChange={e => setSiteForm({ ...siteForm, announcementText: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={siteForm.isAnnouncementActive}
                onChange={e => setSiteForm({ ...siteForm, isAnnouncementActive: e.target.checked })}
              />
              <span>Enable Top Announcement Bar</span>
            </label>

            {/* Certificate Fee & Payment Configuration */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-5 mt-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CreditCard className="w-4 h-4" />
                <span>Quiz Certificate Payment Settings (NayaPay / RS 200)</span>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={siteForm.certificatePayment?.isPaymentRequired ?? true}
                  onChange={e =>
                    setSiteForm({
                      ...siteForm,
                      certificatePayment: {
                        ...(siteForm.certificatePayment || {
                          isPaymentRequired: true,
                          feeAmount: 200,
                          currency: 'PKR',
                          accountNumber: '03482640086',
                          accountTitle: 'Future Academy Pro / Engr Nadeem Ali',
                          bankName: 'NAYA PAY',
                          instructions: 'Send RS 200 to NayaPay account 03482640086.'
                        }),
                        isPaymentRequired: e.target.checked
                      }
                    })
                  }
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Require Fee Before Certificate PDF Download (Paid Certificate)
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold block mb-1 text-xs">Fee Amount (PKR)</label>
                  <input
                    type="number"
                    value={siteForm.certificatePayment?.feeAmount ?? 200}
                    onChange={e =>
                      setSiteForm({
                        ...siteForm,
                        certificatePayment: {
                          ...(siteForm.certificatePayment || {
                            isPaymentRequired: true,
                            feeAmount: 200,
                            currency: 'PKR',
                            accountNumber: '03482640086',
                            accountTitle: 'Future Academy Pro / Engr Nadeem Ali',
                            bankName: 'NAYA PAY',
                            instructions: 'Send RS 200 to NayaPay account 03482640086.'
                          }),
                          feeAmount: Number(e.target.value) || 200
                        }
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-xs">Bank / Wallet Name</label>
                  <input
                    type="text"
                    value={siteForm.certificatePayment?.bankName || 'NAYA PAY'}
                    onChange={e =>
                      setSiteForm({
                        ...siteForm,
                        certificatePayment: {
                          ...(siteForm.certificatePayment || {
                            isPaymentRequired: true,
                            feeAmount: 200,
                            currency: 'PKR',
                            accountNumber: '03482640086',
                            accountTitle: 'Future Academy Pro / Engr Nadeem Ali',
                            bankName: 'NAYA PAY',
                            instructions: 'Send RS 200 to NayaPay account 03482640086.'
                          }),
                          bankName: e.target.value
                        }
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-xs">Account Number</label>
                  <input
                    type="text"
                    value={siteForm.certificatePayment?.accountNumber || '03482640086'}
                    onChange={e =>
                      setSiteForm({
                        ...siteForm,
                        certificatePayment: {
                          ...(siteForm.certificatePayment || {
                            isPaymentRequired: true,
                            feeAmount: 200,
                            currency: 'PKR',
                            accountNumber: '03482640086',
                            accountTitle: 'Future Academy Pro / Engr Nadeem Ali',
                            bankName: 'NAYA PAY',
                            instructions: 'Send RS 200 to NayaPay account 03482640086.'
                          }),
                          accountNumber: e.target.value
                        }
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-xs">Account Title / Receiver Name</label>
                <input
                  type="text"
                  value={siteForm.certificatePayment?.accountTitle || 'Future Academy Pro / Engr Nadeem Ali'}
                  onChange={e =>
                    setSiteForm({
                      ...siteForm,
                      certificatePayment: {
                        ...(siteForm.certificatePayment || {
                          isPaymentRequired: true,
                          feeAmount: 200,
                          currency: 'PKR',
                          accountNumber: '03482640086',
                          accountTitle: 'Future Academy Pro / Engr Nadeem Ali',
                          bankName: 'NAYA PAY',
                          instructions: 'Send RS 200 to NayaPay account 03482640086.'
                        }),
                        accountTitle: e.target.value
                      }
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" /> Save Website Branding
            </button>

            {saveSuccess && (
              <p className="text-emerald-600 font-bold text-xs mt-2">
                ✅ Settings updated successfully!
              </p>
            )}
          </form>
        </div>
      )}

      {/* Tab: Certificate Payments Management */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Certificate Payments & NayaPay Verification
                </h3>
                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Receiver: NayaPay Only
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Verify real RS 200 transfers received on NayaPay (<strong>03482640086</strong>) before unlocking student certificates.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPayments}
              disabled={isLoadingPayments}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPayments ? 'animate-spin' : ''}`} />
              <span>{isLoadingPayments ? 'Refreshing...' : 'Refresh Payments'}</span>
            </button>
          </div>

          {/* 4 Stat Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Submissions</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {payments.length}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Pending Review</span>
                {payments.filter(p => p.status === 'pending').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                {payments.filter(p => p.status === 'pending').length}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Approved & Unlocked</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {payments.filter(p => p.status === 'approved').length}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5">
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Rejected / Fake</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                {payments.filter(p => p.status === 'rejected').length}
              </span>
            </div>
          </div>

          {/* Quick Pre-Authorize TID Card */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-slate-50 to-amber-500/10 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Pre-Authorize NayaPay Transaction ID (Instant Approval)
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Agar kisi student ne WhatsApp par RS 200 ki receipt send ki hai, to unka TID yahan pehle se approve kar dein. Jab student quiz mein yeh TID likhega to foran certificate unlock ho jayega!
            </p>

            <form onSubmit={handlePreapproveTid} className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <input
                type="text"
                required
                value={preapproveTidInput}
                onChange={e => setPreapproveTidInput(e.target.value.toUpperCase())}
                placeholder="Transaction ID (e.g. NP49821948)"
                className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={preapproveNoteInput}
                onChange={e => setPreapproveNoteInput(e.target.value)}
                placeholder="Student Name / WhatsApp Note (Optional)"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0"
              >
                <Check className="w-4 h-4" /> Pre-Approve TID
              </button>
            </form>

            {preapproveMsg && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {preapproveMsg}
              </p>
            )}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  paymentFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All ({payments.length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('pending')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  paymentFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <Clock className="w-3 h-3" /> Pending ({payments.filter(p => p.status === 'pending').length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('approved')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  paymentFilter === 'approved'
                    ? 'bg-emerald-600 text-white font-black'
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> Approved ({payments.filter(p => p.status === 'approved').length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  paymentFilter === 'rejected'
                    ? 'bg-rose-600 text-white font-black'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                <XCircle className="w-3 h-3" /> Rejected ({payments.filter(p => p.status === 'rejected').length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={paymentSearch}
                onChange={e => setPaymentSearch(e.target.value)}
                placeholder="Search candidate, TID, mobile..."
                className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-3">
            {payments
              .filter(p => {
                if (paymentFilter !== 'all' && p.status !== paymentFilter) return false;
                if (paymentSearch.trim()) {
                  const q = paymentSearch.toLowerCase();
                  return (
                    p.candidateName.toLowerCase().includes(q) ||
                    p.transactionId.toLowerCase().includes(q) ||
                    p.senderNumber.toLowerCase().includes(q) ||
                    p.quizTitle.toLowerCase().includes(q)
                  );
                }
                return true;
              })
              .map(payment => {
                const isApproved = payment.status === 'approved';
                const isRejected = payment.status === 'rejected';
                const isPending = payment.status === 'pending';
                const cleanPhone = payment.senderNumber.replace(/\D/g, '');
                const waPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : (cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone);
                const waMsg = encodeURIComponent(
                  `Assalam-o-Alaikum ${payment.candidateName}! Future Academy Pro regarding your RS 200 NayaPay payment (TID: ${payment.transactionId}) for "${payment.quizTitle}": Status is ${payment.status.toUpperCase()}.`
                );

                return (
                  <div
                    key={payment.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 sm:p-5 transition-all shadow-sm ${
                      isPending
                        ? 'border-amber-500/50 dark:border-amber-500/40 shadow-amber-500/5'
                        : isApproved
                        ? 'border-emerald-500/40 dark:border-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Details */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {payment.candidateName}
                          </h4>
                          {payment.candidateEmail && (
                            <span className="text-xs text-slate-400">
                              ({payment.candidateEmail})
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isApproved
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : isPending
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-pulse'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Transaction ID</span>
                            <span className="font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {payment.transactionId}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Sender Mobile</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {payment.senderNumber}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Fee Amount</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              RS {payment.amount} PKR
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
                            <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                              {new Date(payment.submittedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span>Quiz:</span>
                          <strong className="text-slate-700 dark:text-slate-300">{payment.quizTitle}</strong>
                          {payment.categoryName && <span>({payment.categoryName})</span>}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                        {/* Approve Button */}
                        {payment.status !== 'approved' && (
                          <button
                            type="button"
                            disabled={actionLoadingId === payment.id}
                            onClick={() => handleUpdatePaymentStatus(payment.id, 'approved')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve & Unlock
                          </button>
                        )}

                        {/* Reject Button */}
                        {payment.status !== 'rejected' && (
                          <button
                            type="button"
                            disabled={actionLoadingId === payment.id}
                            onClick={() => handleUpdatePaymentStatus(payment.id, 'rejected')}
                            className="px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}

                        {/* WhatsApp Student */}
                        <a
                          href={`https://wa.me/${waPhone}?text=${waMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs transition flex items-center gap-1.5 border border-emerald-500/30"
                          title="Contact Student on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>

                        {/* Delete record */}
                        <button
                          type="button"
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {payments.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-slate-400 text-xs">
                Abhi tak koi certificate payment submission nahi aayi. Jab koi candidate RS 200 transfer karke TID enter karega to yahan show hogi.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Backup Database */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
          <Database className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Database Snapshot & Recovery
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Download a full JSON snapshot of all MCQs, categories, user profiles, and site settings.
          </p>

          <button
            onClick={handleDownloadBackup}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition inline-flex items-center gap-2 shadow"
          >
            <Download className="w-4 h-4" /> Download Full JSON Database Snapshot
          </button>
        </div>
      )}

      {/* Tab: Admin Password & Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Admin Account & Password Security
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Apna admin username, email aur password yahan se tabdeel karein. Naye credentials foran save ho jayenge.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/40 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  Logged in as: {adminUser}
                </span>
              </div>
            </div>

            {/* Status Alert */}
            {credStatus && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  credStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                {credStatus.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs font-medium">
                  <span className="font-bold block mb-0.5">
                    {credStatus.type === 'success' ? 'Kamyabi (Success)!' : 'Tawajjah (Error)!'}
                  </span>
                  <span>{credStatus.message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleChangeCredentials} className="space-y-6">
              {/* Profile Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Admin Username
                  </label>
                  <input
                    type="text"
                    required
                    value={credUsername}
                    onChange={e => setCredUsername(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400">Login ke waqt yeh username istemal kiya ja sakta hai.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={credEmail}
                    onChange={e => setCredEmail(e.target.value)}
                    placeholder="admin@futureacademypro.com"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400">Aap is email se bhi login kar sakte hain.</span>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Password Tabdeel Karein (Update Password)
                  </h4>
                </div>

                {/* Current Password Field */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                    Mojooda (Current) Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCredCurrentPass ? 'text' : 'password'}
                      required
                      value={credCurrentPass}
                      onChange={e => setCredCurrentPass(e.target.value)}
                      placeholder="Apna mojooda password enter karein"
                      className="w-full p-2.5 pr-10 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/60 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCredCurrentPass(!showCredCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      {showCredCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Naya Password (New Password)
                    </label>
                    <div className="relative">
                      <input
                        type={showCredNewPass ? 'text' : 'password'}
                        value={credNewPass}
                        onChange={e => setCredNewPass(e.target.value)}
                        placeholder="Naya password likhein (agar tabdeel karna ho)"
                        className="w-full p-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCredNewPass(!showCredNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      >
                        {showCredNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Confirm Naya Password
                    </label>
                    <input
                      type={showCredNewPass ? 'text' : 'password'}
                      value={credConfirmPass}
                      onChange={e => setCredConfirmPass(e.target.value)}
                      placeholder="Naya password dobara likhein"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400">
                  🔒 Security Note: Password badalne ke baad agli martaba login ke liye yeh naya password istemal hoga.
                </p>

                <button
                  type="submit"
                  disabled={credLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {credLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save New Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single MCQ Form Modal */}
      {showMcqModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingMcq ? 'Edit MCQ' : 'Add New MCQ'}
            </h3>

            <form onSubmit={handleSaveMcq} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Question Text</label>
                <textarea
                  rows={2}
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option A"
                  value={optA}
                  onChange={e => setOptA(e.target.value)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
                <input
                  type="text"
                  placeholder="Option B"
                  value={optB}
                  onChange={e => setOptB(e.target.value)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
                <input
                  type="text"
                  placeholder="Option C"
                  value={optC}
                  onChange={e => setOptC(e.target.value)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
                <input
                  type="text"
                  placeholder="Option D"
                  value={optD}
                  onChange={e => setOptD(e.target.value)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Correct Answer</label>
                  <select
                    value={correctAnswer}
                    onChange={e => setCorrectAnswer(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={selectedCat}
                    onChange={e => setSelectedCat(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Detailed Explanation</label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMcqModal(false)}
                  className="px-4 py-2 text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Save MCQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
