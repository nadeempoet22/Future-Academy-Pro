import React from 'react';
import { AdConfig } from '../types';
import { ExternalLink, Info, X } from 'lucide-react';

interface AdBannerProps {
  type: 'header' | 'sidebar' | 'inContent' | 'sticky';
  adConfig?: AdConfig;
}

export const AdBanner: React.FC<AdBannerProps> = ({ type, adConfig }) => {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  // Check enablement from settings if provided
  if (adConfig) {
    if (type === 'header' && !adConfig.headerBannerEnabled) return null;
    if (type === 'sidebar' && !adConfig.sidebarAdEnabled) return null;
    if (type === 'inContent' && !adConfig.inContentAdEnabled) return null;
    if (type === 'sticky' && !adConfig.stickyBottomAdEnabled) return null;
  }

  if (type === 'header') {
    return (
      <div id="ad-header-banner" className="my-4 mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-slate-900/10 dark:from-emerald-500/10 dark:via-teal-500/10 dark:to-slate-900/30 border border-emerald-500/20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            title="Close advertisement"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
              Advertisement
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                🎯 FPSC & PPSC Exam Crackers 2026 Test Series
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get 500+ solved past papers with step-by-step video solutions.
              </p>
            </div>
          </div>
          <a
            href="#daily-quiz"
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-1.5"
          >
            Start Practice <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div id="ad-sidebar-banner" className="relative my-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center bg-slate-50/50 dark:bg-slate-900/50">
        <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-2 font-medium">
          Sponsored AD
        </span>
        <div className="h-48 rounded-lg bg-gradient-to-br from-teal-500/10 to-emerald-500/10 flex flex-col items-center justify-center p-4">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            NTS & CSS MPT Masterclass
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            98% Success rate in CSS Screening Test 2025.
          </p>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition shadow">
            Learn More
          </button>
        </div>
      </div>
    );
  }

  if (type === 'inContent') {
    return (
      <div id="ad-incontent-banner" className="my-6 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 sm:p-4 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span><strong>Sponsored:</strong> Download Official FPSC Syllabus & Syllabus PDFs for all 2026 tests.</span>
        </div>
        <button className="underline text-amber-700 dark:text-amber-300 font-semibold shrink-0 ml-2">
          Download PDF
        </button>
      </div>
    );
  }

  return null;
};
