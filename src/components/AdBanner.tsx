import React, { useEffect, useRef, useState } from 'react';
import { AdConfig } from '../types';
import { ExternalLink, Info, Sparkles, X, ShieldCheck } from 'lucide-react';

interface AdBannerProps {
  type: 'header' | 'sidebar' | 'inContent' | 'quiz' | 'sticky';
  adConfig?: AdConfig;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({ type, adConfig, className = '' }) => {
  const [dismissed, setDismissed] = useState(false);
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  // Check enablement from settings if provided
  if (dismissed) return null;

  if (adConfig) {
    if (type === 'header' && adConfig.headerBannerEnabled === false) return null;
    if (type === 'sidebar' && adConfig.sidebarAdEnabled === false) return null;
    if (type === 'inContent' && adConfig.inContentAdEnabled === false) return null;
    if (type === 'quiz' && adConfig.quizAdEnabled === false) return null;
    if (type === 'sticky' && !adConfig.stickyBottomAdEnabled) return null;
  }

  const isAdsenseActive = Boolean(
    adConfig?.adsenseEnabled &&
    adConfig?.publisherId &&
    adConfig.publisherId.trim().length > 5
  );

  const isLiveMode = isAdsenseActive && !adConfig?.testMode;

  // Ad Slot IDs based on placement
  const slotId = (() => {
    switch (type) {
      case 'header':
        return adConfig?.headerSlotId?.trim();
      case 'sidebar':
        return adConfig?.sidebarSlotId?.trim();
      case 'inContent':
        return adConfig?.inContentSlotId?.trim();
      case 'quiz':
        return adConfig?.quizSlotId?.trim();
      case 'sticky':
        return adConfig?.stickyBottomSlotId?.trim();
      default:
        return undefined;
    }
  })() || '7523650189';

  const formatAdClient = (raw?: string) => {
    if (!raw) return '';
    const clean = raw.trim();
    if (clean.startsWith('ca-pub-')) return clean;
    if (clean.startsWith('pub-')) return `ca-${clean}`;
    return `ca-pub-${clean}`;
  };

  const formattedPubClient = formatAdClient(adConfig?.publisherId);

  // Dynamically load AdSense script and push ads in Live Mode
  useEffect(() => {
    if (!isLiveMode || !formattedPubClient) return;

    try {
      const existingScript = document.querySelector(`script[src*="pagead2.googlesyndication.com"]`);
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${formattedPubClient}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      if (adRef.current && !pushedRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (err) {
      console.debug('[AdSense] Push notification:', err);
    }
  }, [isLiveMode, formattedPubClient, slotId]);

  // LIVE ADSENSE MODE (Real Earning Commercial Ads)
  if (isLiveMode) {
    return (
      <div className={`adsense-wrapper my-4 text-center overflow-hidden ${className}`}>
        <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          <span>Ad</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          <span>Google AdSense (Live Earning)</span>
        </div>
        <div className="min-h-[90px] w-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl overflow-hidden">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={formattedPubClient}
            data-ad-slot={slotId || undefined}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // TEST / SANDBOX PREVIEW MODE
  // Authentically mirrors Google AdSense layout with AdChoices tag and educational sponsor content
  if (type === 'header') {
    return (
      <div id="ad-header-banner" className={`my-4 mx-auto max-w-7xl px-4 ${className}`}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-teal-950/20 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-teal-950/40 border border-emerald-500/25 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-200 transition p-1 rounded-lg hover:bg-slate-800/40"
            title="Dismiss preview banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start sm:items-center gap-3.5 w-full sm:w-auto">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Google AdSense {adConfig?.testMode ? '(Test Mode)' : 'Ready'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  Slot: {slotId || '728x90 Leaderboard'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                🎯 FPSC, PPSC & NTS 2026 Solved Past Papers Book
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                50,000+ authentic solved MCQs with subject-wise explanations & syllabus coverage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <a
              href="#daily-quiz"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              Start Free Quiz <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div
        id="ad-sidebar-banner"
        className={`relative my-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-4 text-center bg-slate-50/70 dark:bg-slate-900/70 overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-400 mb-2 font-semibold">
          <span>Google AdSense Display Unit</span>
          <span className="text-emerald-500 font-bold">300x250</span>
        </div>

        <div className="min-h-[220px] rounded-xl bg-gradient-to-br from-emerald-500/10 via-slate-800/30 to-teal-500/10 border border-emerald-500/20 flex flex-col items-center justify-center p-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            CSS MPT & PMS Screening 2026
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-[240px]">
            Pakistan Affairs, Islamic Studies & Everyday Science high-scoring mock test series.
          </p>
          <a
            href="#categories"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow shadow-emerald-600/25"
          >
            Explore Syllabus
          </a>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
          Ad Slot: {slotId || 'Sidebar Responsive'}
        </p>
      </div>
    );
  }

  if (type === 'inContent') {
    return (
      <div
        id="ad-incontent-banner"
        className={`my-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-slate-900/30 to-emerald-950/20 border border-emerald-500/20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                Sponsored AdSense In-Feed
              </span>
              <span className="text-[10px] text-slate-400">
                Slot: {slotId || 'In-Feed Fluid'}
              </span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 font-semibold">
              Official FPSC & PPSC Solved Model Papers & Roll No Slips 2026
            </p>
          </div>
        </div>

        <a
          href="#blog"
          className="shrink-0 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition"
        >
          Check Notifications →
        </a>
      </div>
    );
  }

  if (type === 'quiz') {
    return (
      <div
        id="ad-quiz-banner"
        className={`my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-semibold">
          <span>Google AdSense Quiz Results Unit</span>
          <span className="text-emerald-500 font-bold">Auto Responsive</span>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-800/20 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              💡 Top Exam Preparation Tip
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Retake quizzes daily to improve retention by up to 75% for FPSC & PPSC exams.
            </p>
          </div>
          <a
            href="#daily-quiz"
            className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
          >
            Practice Next Subject
          </a>
        </div>
      </div>
    );
  }

  return null;
};
