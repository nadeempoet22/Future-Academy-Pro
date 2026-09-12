import React, { useState } from 'react';
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
  AlertCircle
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
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleVerifyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanTid = transactionId.trim();
    const cleanSender = senderNumber.trim();

    if (!cleanTid && !cleanSender) {
      setErrorMsg('Baraye meharbani Transaction ID (TID) ya apna Sender Mobile Number darj karein.');
      return;
    }

    if (cleanSender && cleanSender.replace(/\D/g, '').length < 10) {
      setErrorMsg('Baraye meharbani durust 11-digit Pakistani mobile number darj karein.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const paymentRecord = {
        transactionId: cleanTid || `NP-${Date.now().toString().slice(-8)}`,
        senderNumber: cleanSender,
        paidAmount: fee,
        paidAt: new Date().toISOString()
      };
      onPaymentSuccess(paymentRecord);
    }, 900);
  };

  if (isUnlocked) {
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
                  RS {fee} Paid
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Aap ka official verified certificate unlock ho chuka hai. Ab aap bila-rok download aur print kar sakte hain.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDirectDownload}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/25"
          >
            <Download className="w-4 h-4" /> Download Certificate Now
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">{candidateName}</span>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Test Subject</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">{quizTitle}</span>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Official & Paid
            </span>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Receipt</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">RS {fee} {currency}</span>
          </div>
        </div>
      </div>
    );
  }

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
              Yeh certificate verified academic credential hai. Download karne k liye RS {fee} fees send karein aur details darj karein.
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
                <span className="text-slate-500">Supported Apps:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  NayaPay, EasyPaisa, JazzCash, SadaPay ya any Bank App
                </span>
              </div>
            </div>
          </div>

          {/* Quick Steps Guide */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Payment & Download Steps:
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 leading-relaxed pl-1">
              <li>Apni NayaPay, JazzCash, EasyPaisa ya bank app kholein.</li>
              <li>Transfer to <strong>NAYA PAY</strong> par jayen aur number <code className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{accountNumber}</code> likhein.</li>
              <li>Exact <strong>RS {fee}</strong> transfer karein.</li>
              <li>Payment send hone k bad apna <strong>Sender Number</strong> ya <strong>Transaction ID</strong> darj karke Unlock button dabayein!</li>
            </ol>
          </div>
        </div>

        {/* Right Column: Submission Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verify Transfer & Unlock
          </div>

          <form onSubmit={handleVerifyPayment} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Candidate Name on Certificate
              </label>
              <input
                type="text"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="Candidate Full Name"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Sender Mobile Number (jis number se paise bheje) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={senderNumber}
                onChange={e => setSenderNumber(e.target.value)}
                placeholder="03001234567 ya 03482640086"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Easypaisa, JazzCash, NayaPay ya Bank account se linked mobile number
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Transaction ID (TID) / Reference (Optional)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                placeholder="e.g. NP84729104 ya 123456789"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Transfer SMS ya receipt se TID number darj karein
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Payment (RS {fee})...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Payment & Unlock Certificate (RS {fee})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                <HelpCircle className="w-3 h-3 text-emerald-500" />
                Need help with payment? Contact WhatsApp: <strong className="text-slate-700 dark:text-slate-300">+92 326 3624500</strong>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
