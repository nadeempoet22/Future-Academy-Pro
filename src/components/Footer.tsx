import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { BookOpen, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  onOpenLegalModal: (page: string) => void;
  onSelectCategory: (categoryName: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenLegalModal,
  onSelectCategory
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                {settings.siteName}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              {settings.tagline} {settings.siteName} is Pakistan’s leading free portal for solved MCQs, online practice quizzes, past papers, and competitive examination preparation for FPSC, PPSC, KPPSC, BPSC, SPSC, NTS, CSS, and PMS.
            </p>

            <div className="space-y-2 pt-2 text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{settings.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{settings.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{settings.address}</span>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Popular Categories
            </h4>
            <ul className="space-y-2 text-slate-400">
              {[
                'Pakistan Affairs',
                'Current Affairs',
                'English MCQs',
                'Computer Science',
                'Islamic Studies',
                'Everyday Science',
                'General Knowledge',
                'Mathematics'
              ].map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-emerald-400 transition"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Test Preparation */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Exam Testing Agencies
            </h4>
            <ul className="space-y-2 text-slate-400">
              {[
                'FPSC & PPSC Preparation',
                'NTS / OTS / PTS Tests',
                'CSS & PMS Exams',
                'Army, Navy & Air Force',
                'Physics MCQs',
                'Chemistry MCQs',
                'Biology MCQs',
                'Urdu MCQs'
              ].map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-emerald-400 transition"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Legal Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Newsletter & Updates
            </h4>
            <p className="text-slate-400 text-xs">
              Subscribe to receive weekly FPSC/PPSC past papers and latest Current Affairs updates.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" /> Subscribe Free
              </button>
            </form>

            {subscribed && (
              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed successfully!
              </p>
            )}
          </div>
        </div>

        {/* Footer Legal Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4">
            {['About Us', 'Privacy Policy', 'Terms & Conditions', 'Disclaimer', 'DMCA', 'Contact Us'].map(page => (
              <button
                key={page}
                onClick={() => onOpenLegalModal(page)}
                className="hover:text-emerald-400 transition"
              >
                {page}
              </button>
            ))}
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
