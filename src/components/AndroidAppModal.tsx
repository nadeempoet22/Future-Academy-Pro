import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  RefreshCw, 
  Wifi, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  Layers, 
  Sparkles,
  HelpCircle,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'features' | 'apkGuide'>('install');
  const [copiedLink, setCopiedLink] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      const result = await install();
      if (result) {
        onClose();
      }
    } finally {
      setInstalling(false);
    }
  };

  const copyAppUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <img 
              src="/pwa-192x192.png" 
              alt="Future Academy Pro Icon" 
              className="w-full h-full object-cover rounded-[14px]"
              onError={(e) => {
                // Fallback to favicon if image fails
                (e.target as HTMLImageElement).src = '/favicon.svg';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                Official Android App
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Auto-Sync
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Future Academy Pro App
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time synchronization ke sath har mobile par install karein.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 mb-5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'install'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Install</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'features'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Auto-Sync Kaise Kaam Karta Hai?</span>
          </button>
          <button
            onClick={() => setActiveTab('apkGuide')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apkGuide'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Play Store / APK Export</span>
          </button>
        </div>

        {/* TAB 1: Mobile Install */}
        {activeTab === 'install' && (
          <div className="space-y-4">
            {/* Status Card */}
            {isInstalled ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                    App Pehle Se Installed Hai!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Aap is waqt Future Academy Pro ki standalone application use kar rahe hain. Har naya MCQ foran live update hoga.
                  </p>
                </div>
              </div>
            ) : isInstallable ? (
              <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>One-Click Fast Install Available</span>
                </div>
                <p className="text-xs text-emerald-50 leading-relaxed mb-4">
                  Apne Android device par bina Play Store ke ek click mein install karein. Yeh direct app drawer aur home screen par add ho jayegi.
                </p>
                <button
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="w-full py-3 px-4 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>{installing ? 'Installing App...' : 'Install Android App Now'}</span>
                </button>
              </div>
            ) : isIOS ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-500" /> iPhone / iPad Users ke liye:
                </h4>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Safari browser ke neechay <strong>Share button</strong> (box with arrow) dabayein.</li>
                  <li>List ko scroll karein aur <strong>"Add to Home Screen"</strong> par click karein.</li>
                  <li>Upar <strong>"Add"</strong> dabayein — App foran home screen par native icon ke sath add ho jayegi!</li>
                </ol>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-500" /> Android Chrome Browser se Direct Install:
                </h4>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Apne Android mobile par Chrome browser mein website open karein.</li>
                  <li>Upar right corner mein <strong>3 dots (⋮)</strong> menu dabayein.</li>
                  <li>Menu mein se <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> select karein.</li>
                  <li><strong>"Install"</strong> par click karein — App aapke phone mein install ho kar home screen par aa jayegi!</li>
                </ol>
              </div>
            )}

            {/* Quick Share Link */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mobile par kholne ke liye Link:
                </span>
                <button
                  onClick={copyAppUrl}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 break-all font-mono">
                {typeof window !== 'undefined' ? window.location.origin : 'https://futureacademypro.vercel.app'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Live Auto-Sync Architecture */}
        {activeTab === 'features' && (
          <div className="space-y-3.5">
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-1.5">
                <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
                <span>Real-Time Cloud Synchronization Enabled</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Aap website ke Admin Panel se jab bhi koi naya MCQ, Category, Test Series, ya Quiz add/edit karenge, woh tamam Android devices par <strong>foran aur automatic</strong> update ho jayega!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>No Re-install Needed</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Students ko nayi update lene ke liye dobara APK download karne ki bilkul zaroorat nahi.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Offline Exam Support</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Service worker cached MCQs ko internet na hone par bhi bina rukawat chalata hai.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Native Fullscreen Feel</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Browser address bar gayab ho jati hai aur app 100% native Android app ki tarah chalti hai.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ultra-Lightweight</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Phone ki storage sirf 2-3 MB use karti hai, heavy APKs ki tarah storage fill nahi karti.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Standalone APK & Play Store Guide */}
        {activeTab === 'apkGuide' && (
          <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>Play Store ke liye Standalone .APK / .AAB File:</span>
              </h4>
              <p className="leading-relaxed text-[11px]">
                Kyunke aapki website PWA compliant ban chuki hai, aap <strong>PWABuilder.com</strong> ya <strong>Google Bubblewrap (TWA)</strong> ke zariye sirf 2 minute mein direct Google Play Store ready <code>.apk</code> aur <code>.aab</code> bana sakte hain:
              </p>
            </div>

            <ol className="p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2.5 list-decimal list-inside leading-relaxed text-[11px]">
              <li>
                <strong>PWABuilder par jayein:</strong>{' '}
                <a 
                  href="https://www.pwabuilder.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold underline"
                >
                  pwabuilder.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Apni website ka URL (maslan <code>https://futureacademypro.vercel.app</code>) paste karein aur <strong>"Start"</strong> click karein.
              </li>
              <li>
                Future Academy Pro ka manifest, icons aur service worker automatically verify ho jayega (Score 100/100).
              </li>
              <li>
                <strong>"Package For Stores"</strong> par click karein aur <strong>"Android"</strong> select karein.
              </li>
              <li>
                <strong>"Generate APK / Bundle"</strong> dabayein — aapko signed <code>.apk</code> aur <code>.aab</code> file mil jayegi jise aap direct Google Play Store par publish kar sakte hain ya WhatsApp/Drive par share kar sakte hain!
              </li>
            </ol>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
              <strong>Sabse bada faida:</strong> Yeh TWA/PWA APK banne ke baad bhi aap jab bhi website par naye MCQs add karenge, users ke phone mein APK update kiye baghair foran sab kuch update hota rahega!
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Future Academy Pro v3.0 • Mobile Suite</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
