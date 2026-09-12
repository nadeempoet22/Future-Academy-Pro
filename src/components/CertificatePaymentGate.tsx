import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  ArrowRight,
  HelpCircle,
  Clock,
  Download,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { CertificatePaymentConfig } from '../types';

interface CertificatePaymentGateProps {
  paymentConfig?: CertificatePaymentConfig;
  candidateName: string;
  candidateEmail?: string;
  quizTitle: string;
  categoryName?: string;
  onPaymentSuccess: (paymentRecord: {
    transactionId: string;
    senderNumber: string;
    paidAmount: number;
    paidAt: string;
  }) => void;
  onDirectDownload: () => void;
  isUnlocked: boolean;
}

export const CertificatePaymentGate: React.FC<CertificatePaymentGateProps> = ({
  paymentConfig,
  candidateName,
  candidateEmail,
  quizTitle,
  categoryName,
  onPaymentSuccess,
  onDirectDownload,
  isUnlocked
}) => {
  const fee = paymentConfig?.feeAmount ?? 200;
  const currency = paymentConfig?.currency || 'PKR';
  const accountNumber = paymentConfig?.accountNumber || '03482640086';
  const bankName = paymentConfig?.bankName || 'NAYA PAY';
  const accountTitle = paymentConfig?.accountTitle || 'Future Academy Pro / Engr Nadeem Ali';

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [senderName, setSenderName] = useState(candidateName || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Status: 'idle' | 'pending' | 'approved' | 'rejected'
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle');
  const [submittedTid, setSubmittedTid] = useState<string>('');
  const [submittedSender, setSubmittedSender] = useState<string>('');
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const pollTimerRef = useRef<any>(null);

  const storageKey = `fap_cert_submission_${candidateName.trim().toLowerCase()}_${quizTitle.trim().toLowerCase()}`;

  // Restore any previous pending submission from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.transactionId && parsed.status === 'pending') {
          setPaymentStatus('pending');
          setSubmittedTid(parsed.transactionId);
          setSubmittedSender(parsed.senderNumber || '');
          setTransactionId(parsed.transactionId);
          setSenderNumber(parsed.senderNumber || '');
          // Immediately check current status on server
          checkVerificationStatus(parsed.transactionId);
        }
      }
    } catch {}
  }, [candidateName, quizTitle]);

  // Polling loop when in 'pending' status
  useEffect(() => {
    if (paymentStatus === 'pending' && submittedTid && !isUnlocked) {
      pollTimerRef.current = setInterval(() => {
        checkVerificationStatus(submittedTid, true);
      }, 5000);

      return () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      };
    }
  }, [paymentStatus, submittedTid, isUnlocked]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const checkVerificationStatus = async (tidToCheck: string, isAutoPoll: boolean = false) => {
    if (!tidToCheck) return;
    if (!isAutoPoll) setIsCheckingStatus(true);

    try {
      const res = await fetch(
        `/api/certificate-payments/check?transactionId=${encodeURIComponent(tidToCheck)}&candidateName=${encodeURIComponent(candidateName)}&quizTitle=${encodeURIComponent(quizTitle)}`
      );
      if (res.ok) {
        const data = await res.json();
        setLastCheckTime(new Date().toLocaleTimeString());

        if (data.status === 'approved') {
          setPaymentStatus('approved');
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);

          const record = {
            transactionId: tidToCheck,
            senderNumber: submittedSender || senderNumber,
            paidAmount: fee,
            paidAt: new Date().toISOString()
          };

          try {
            localStorage.setItem(storageKey, JSON.stringify({ ...record, status: 'approved' }));
          } catch {}

          onPaymentSuccess(record);
        } else if (data.status === 'rejected') {
          setPaymentStatus('rejected');
          setErrorMsg('Aap ki Transaction ID reject kar di gayi hai. Baraye meharbani durust Transaction ID darj karein ya WhatsApp par rabta karein.');
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        }
      }
    } catch (err) {
      console.error('Status check error:', err);
    } finally {
      if (!isAutoPoll) setIsCheckingStatus(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanTid = transactionId.trim().toUpperCase();
    const cleanSender = senderNumber.trim().replace(/\s+/g, '');
    const cleanDigits = cleanSender.replace(/\D/g, '');

    // 1. Strict Validation: Candidate Name
    if (!senderName.trim()) {
      setErrorMsg('Baraye meharbani apna Candidate Name darj karein.');
      return;
    }

    // 2. Strict Validation: Sender Mobile Number
    if (!cleanSender || cleanDigits.length < 10 || !cleanSender.startsWith('03')) {
      setErrorMsg('Ghalat Sender Mobile Number! Baraye meharbani 11-digit Pakistani mobile number darj karein (e.g. 03482640086 ya 03001234567).');
      return;
    }

    // 3. Strict Validation: Transaction ID (MANDATORY)
    if (!cleanTid || cleanTid.length < 6) {
      setErrorMsg('Transaction ID (TID) darj karna lazmi hai! NayaPay ya Bank transfer SMS se 6-12 huroof ki Transaction ID darj karein.');
      return;
    }

    // Check against obvious fake/trivial inputs
    const fakePatterns = [
      '123456', '000000', '111111', '222222', '333333', '444444', '555555',
      '666666', '777777', '888888', '999999', '1234567', 'TEST', 'FAKE',
      'WRONG', 'PAYMENT', 'NAYAPAY', 'DEMO', 'DUMMY', 'ASDF', 'QWERTY', 'ABCDEF'
    ];
    if (fakePatterns.some(p => cleanTid.includes(p)) || /^(\w)\1+$/.test(cleanTid)) {
      setErrorMsg('Yeh Transaction ID ghalat / fake hai. Baraye meharbani apni NayaPay app SMS receipt se asli 6-12 digits ki Transaction ID darj karein.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/certificate-payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: senderName.trim(),
          candidateEmail: candidateEmail?.trim() || '',
          quizTitle,
          categoryName,
          senderNumber: cleanSender,
          transactionId: cleanTid,
          amount: fee
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Payment submit karne mein masla aya. Baraye meharbani dobara koshish karein.');
        setIsSubmitting(false);
        return;
      }

      setSubmittedTid(cleanTid);
      setSubmittedSender(cleanSender);

      if (data.status === 'approved') {
        // Pre-approved TID or already authorized by Admin
        setPaymentStatus('approved');
        const paymentRecord = {
          transactionId: cleanTid,
          senderNumber: cleanSender,
          paidAmount: fee,
          paidAt: new Date().toISOString()
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify({ ...paymentRecord, status: 'approved' }));
        } catch {}
        onPaymentSuccess(paymentRecord);
      } else {
        // Pending Admin verification
        setPaymentStatus('pending');
        setLastCheckTime(new Date().toLocaleTimeString());
        try {
          localStorage.setItem(storageKey, JSON.stringify({
            candidateName: senderName.trim(),
            quizTitle,
            transactionId: cleanTid,
            senderNumber: cleanSender,
            amount: fee,
            status: 'pending',
            submittedAt: new Date().toISOString()
          }));
        } catch {}
      }
    } catch (err: any) {
      setErrorMsg('Network masla aya. Baraye meharbani internet connection check karein.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setPaymentStatus('idle');
    setErrorMsg('');
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  // Pre-filled WhatsApp message link for direct screenshot verification
  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum Sir Engr Nadeem Ali! Maine Future Academy Pro par Quiz Certificate ki fees (RS ${fee} PKR) NayaPay account (03482640086) par bhej di hai.\n\n` +
    `Candidate Name: ${senderName || candidateName}\n` +
    `Quiz Subject: ${quizTitle}\n` +
    `Sender Number: ${submittedSender || senderNumber}\n` +
    `Transaction ID (TID): ${submittedTid || transactionId}\n` +
    `Amount Paid: RS ${fee} PKR\n\n` +
    `Baraye meharbani payment verify karke mera certificate approve aur unlock karein. Shukriya!`
  );
  const whatsappUrl = `https://wa.me/923263624500?text=${whatsappMessage}`;

  // ========================================================
  // STATE 1: UNLOCKED / APPROVED
  // ========================================================
  if (isUnlocked || paymentStatus === 'approved') {
    return (
      <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 text-left space-y-4 shadow-lg shadow-emerald-500/5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Payment Verified Successfully!
                </h4>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                  RS {fee} Verified & Paid
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Aap ki Transaction ID verify ho chuki hai. Aap ka official certificate unlock hai aur download k liye tayar hai.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDirectDownload}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Certificate Now
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">{senderName || candidateName}</span>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Test Subject</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">{quizTitle}</span>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Verified
            </span>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">TID Verified</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate block">{submittedTid || transactionId || 'VERIFIED'}</span>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // STATE 2: PENDING ADMIN VERIFICATION
  // ========================================================
  if (paymentStatus === 'pending') {
    return (
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 text-left space-y-6 shadow-xl shadow-amber-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Payment Submitted — Pending Admin Verification
                </h3>
                <span className="text-[11px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full animate-pulse">
                  Under Review
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Aap ki Transaction ID <code className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-amber-500/20">{submittedTid}</code> receive ho chuki hai. Admin NayaPay app se verify kar raha hai.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => checkVerificationStatus(submittedTid)}
              disabled={isCheckingStatus}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
              <span>{isCheckingStatus ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>
        </div>

        {/* Verification Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Name</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{senderName || candidateName}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sender Mobile Number</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{submittedSender}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Submitted TID (Fee: RS {fee})</span>
            <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm tracking-wide">{submittedTid}</span>
          </div>
        </div>

        {/* Instant Approval via WhatsApp Box */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Want Instant 2-Minute Approval?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Agar aap ko foran certificate download karna hai, to apni NayaPay / Bank transfer ki receipt ya SMS screenshot WhatsApp par send karein:
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 shrink-0"
            >
              <MessageCircle className="w-4 h-4" /> Send Proof on WhatsApp
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-2 border-t border-emerald-500/20">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Auto-refreshing status every 5 seconds... {lastCheckTime && `(Last checked: ${lastCheckTime})`}</span>
          </div>
        </div>

        {/* Change details / Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Ghalat TID darj ho gaya tha?
          </span>
          <button
            type="button"
            onClick={handleResetForm}
            className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Re-enter Different TID
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // STATE 3: PAYMENT FORM (DEFAULT)
  // ========================================================
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/30 dark:border-amber-500/20 rounded-3xl p-5 sm:p-7 text-left space-y-6 shadow-xl shadow-amber-500/5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                Official Certificate Download Gate
              </h3>
              <span className="text-xs font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Fee: RS {fee}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Yeh verified academic certificate hai. Download k liye real payment RS {fee} send karke asli Transaction ID darj karein.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0 text-center sm:text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Certificate Fee</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            RS {fee} <span className="text-xs font-semibold text-slate-500">{currency}</span>
          </span>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Account Details & Instructions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Payment Transfer Details
          </div>

          {/* Account Box Highlight */}
          <div className="bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50/50 dark:from-slate-800/90 dark:via-slate-800/60 dark:to-slate-800/90 rounded-2xl p-4 sm:p-5 border-2 border-emerald-500/30 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-orange-500 text-white font-black text-xs tracking-wider uppercase shadow-sm">
                  {bankName}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Instant Account Transfer
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Active 24/7
              </span>
            </div>

            {/* Account Number with Copy Button */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-inner">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                  NayaPay Mobile Account Number
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white tracking-wider">
                  {accountNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(accountNumber)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                title="Copy NayaPay Number"
              >
                {copiedAccount ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>

            {/* Account Title & Info */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Account Title:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{accountTitle}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Payment Amount:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">RS {fee} {currency}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Receiver Account:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  NAYA PAY ONLY
                </span>
              </div>
            </div>
          </div>

          {/* Quick Steps Guide */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Real Payment Instructions (RS 200):
            </h5>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-400 leading-relaxed pl-1">
              <li>Apni koi bhi app (NayaPay, EasyPaisa, JazzCash, ya Bank App) open karein.</li>
              <li>Transfer option mein <strong>NAYA PAY</strong> muntakhib karein.</li>
              <li>Receiver NayaPay Account Number: <code className="font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-slate-800 px-1 py-0.5 rounded border border-emerald-500/20">{accountNumber}</code> ({accountTitle}) darj karein.</li>
              <li>Sirf NayaPay account par exact <strong>RS {fee}</strong> transfer karein (Receiver sirf NayaPay hai).</li>
              <li>Transfer hone ke baad SMS / receipt se asli <strong>Transaction ID (TID)</strong> aur apna sender mobile number yahan darj karein.</li>
            </ol>
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 p-2 rounded-xl mt-2">
              ⚠️ Note: Ghalat ya farzi Transaction ID enter karne se certificate open nahi hoga. Asli RS {fee} NayaPay payment verify hone par hi download unlock hoga.
            </div>
          </div>
        </div>

        {/* Right Column: Submission Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verify Transfer & Unlock
          </div>

          <form onSubmit={handleSubmitPayment} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Candidate Name on Certificate <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="Candidate Full Name"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Sender Mobile Number (jis number se RS {fee} bheje) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={senderNumber}
                onChange={e => setSenderNumber(e.target.value)}
                placeholder="03482640086 ya 03001234567"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Apna 11-digit Pakistani mobile number darj karein
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Transaction ID (TID) from SMS Receipt <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                placeholder="e.g. NP84729104 ya 948271038"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Payment receipt SMS mein likhi asli Transaction ID (TID) darj karein
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Real Transaction...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Transaction ID & Verify (RS {fee})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                <HelpCircle className="w-3 h-3 text-emerald-500" />
                Payment help ya proof bhejne k liye WhatsApp: <strong className="text-slate-700 dark:text-slate-300">+92 326 3624500</strong>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
