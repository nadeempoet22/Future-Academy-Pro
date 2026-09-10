import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { X, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface LegalModalsProps {
  pageTitle: string | null;
  onClose: () => void;
  settings: SiteSettings;
}

export const LegalModals: React.FC<LegalModalsProps> = ({
  pageTitle,
  onClose,
  settings
}) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  if (!pageTitle) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-auto max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          {pageTitle}
        </h2>

        {pageTitle === 'Contact Us' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Mail className="w-4 h-4 text-emerald-500 mb-1" />
                <span className="font-bold block text-slate-800 dark:text-slate-200">Email</span>
                <span className="text-slate-500">{settings.contactEmail}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Phone className="w-4 h-4 text-emerald-500 mb-1" />
                <span className="font-bold block text-slate-800 dark:text-slate-200">Phone</span>
                <span className="text-slate-500">{settings.contactPhone}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <MapPin className="w-4 h-4 text-emerald-500 mb-1" />
                <span className="font-bold block text-slate-800 dark:text-slate-200">Address</span>
                <span className="text-slate-500">{settings.address}</span>
              </div>
            </div>

            {contactSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs text-center font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Your message has been sent to our editorial support team!
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="Your Full Name"
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="Email Address"
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
                <textarea
                  rows={4}
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  placeholder="How can we help you with FPSC/PPSC exam preparation?"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Send className="w-4 h-4" /> Send Inquiry
                </button>
              </form>
            )}
          </div>
        ) : pageTitle === 'About Us' ? (
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              <strong>{settings.siteName}</strong> is Pakistan’s most reliable digital repository for solved Multiple Choice Questions (MCQs), current affairs, and competitive exam preparation.
            </p>
            <p>
              Founded by educationists and CSS merit holders, our mission is to empower candidates across Pakistan — from FPSC and PPSC to NTS and defense tests — with high-quality, verified practice material completely free of cost.
            </p>
          </div>
        ) : pageTitle === 'Privacy Policy' ? (
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              Your privacy is extremely important to us. {settings.siteName} does not sell, rent, or trade user personal information to third parties.
            </p>
            <p>
              We use standard cookies and analytics to improve test practice performance, remember user bookmarks, and serve non-intrusive Google AdSense advertisements.
            </p>
          </div>
        ) : pageTitle === 'Disclaimer' ? (
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              {settings.siteName} is an independent educational prep platform and is NOT officially affiliated with or endorsed by Federal Public Service Commission (FPSC), Punjab Public Service Commission (PPSC), or National Testing Service (NTS).
            </p>
            <p>
              All trademarks and logos belong to their respective statutory authorities. Questions are compiled for candidate revision purposes.
            </p>
          </div>
        ) : (
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              {settings.siteName} respects intellectual property rights. If you believe any question or material posted on our platform infringes your copyright, please submit a DMCA request to {settings.contactEmail}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
