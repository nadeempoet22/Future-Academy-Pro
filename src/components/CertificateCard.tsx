import React, { useRef } from 'react';
import { CertificateData, getPerformanceGrade, formatDuration, downloadCertificatePdf } from '../utils/certificateGenerator';
import {
  Download,
  Printer,
  Award,
  ShieldCheck
} from 'lucide-react';
import { PakistanFlagCircle } from './PakistanFlagCircle';

interface CertificateCardProps {
  data: CertificateData;
  onClosePreview?: () => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ data }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const certId = data.certificateId || `FAP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const issueDate = data.issueDate || new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const { grade, remark } = getPerformanceGrade(data.scorePercentage);

  const handleDownload = () => {
    downloadCertificatePdf({
      ...data,
      certificateId: certId,
      issueDate: issueDate
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">
              Official Future Academy Pro Certificate
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Verified Digital Credential • Ready for download and printing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-sm"
            title="Print Certificate"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF Certificate
          </button>
        </div>
      </div>

      {/* Certificate Frame Preview */}
      <div className="overflow-x-auto pb-2">
        <div
          ref={certificateRef}
          id="futureacademy-official-certificate"
          className="relative min-w-[720px] max-w-4xl mx-auto text-slate-900 p-8 sm:p-10 rounded-2xl shadow-2xl border-[6px] border-[#0a192f] select-none font-serif"
          style={{
            backgroundColor: '#faf5ea',
            backgroundImage: 'radial-gradient(ellipse at 50% 45%, #fffdf8 0%, #faf4e6 50%, #f1e7d2 100%)'
          }}
        >
          {/* Subtle Security Guilloché Pattern Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.035] rounded-xl"
            style={{
              backgroundImage: `radial-gradient(#b45309 1px, transparent 1px), radial-gradient(#065f46 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px'
            }}
          />

          {/* Central Watermark Security Seal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] overflow-hidden">
            <div className="w-96 h-96 rounded-full border-[12px] border-emerald-900 flex items-center justify-center">
              <div className="w-80 h-80 rounded-full border-4 border-amber-700 border-dashed flex flex-col items-center justify-center text-center p-6">
                <span className="text-4xl font-black text-emerald-950 font-sans">FA</span>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-900 font-sans mt-2">
                  Future Academy Pro
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-950 font-sans">
                  Verified Academic Credential
                </span>
              </div>
            </div>
          </div>

          {/* Inner Golden & Emerald Decorative Borders */}
          <div className="relative border-2 border-amber-600/70 p-1.5 rounded-xl">
            <div className="border border-[#01411c]/40 p-6 sm:p-8 rounded-lg relative overflow-hidden bg-white/40 backdrop-blur-[1px]">
              
              {/* Corner Ornaments (Gold & Navy) */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-600" />
              <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 bg-amber-600 rotate-45" />

              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-600" />
              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-amber-600 rotate-45" />

              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-600" />
              <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 bg-amber-600 rotate-45" />

              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-600" />
              <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 bg-amber-600 rotate-45" />

              {/* Top Header Section: Left Logo, Center Title, Right Pakistan Flag */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-600/20">
                
                {/* Left Side: Future Academy Pro Official Crest Logo */}
                <div className="flex flex-col items-center flex-shrink-0 w-24 sm:w-28 text-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl ring-2 ring-amber-400/50 overflow-hidden flex items-center justify-center">
                    <img
                      src="/future_academy_logo.jpg"
                      alt="Future Academy Pro Logo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full shadow-inner"
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-sans font-bold text-slate-700 uppercase tracking-wider mt-1.5 leading-tight">
                    Academy Crest
                  </span>
                </div>

                {/* Center: Official Title and Certification Authority */}
                <div className="flex-1 text-center px-1 sm:px-3">
                  {/* Five Golden Stars */}
                  <div className="flex items-center justify-center gap-1.5 text-amber-500 text-xs sm:text-sm mb-1">
                    <span>★</span>
                    <span>★</span>
                    <span className="text-base sm:text-lg">★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#0a192f] uppercase leading-tight">
                    Future Academy Pro
                  </h1>
                  <p className="font-sans text-[10px] sm:text-xs font-bold tracking-widest text-amber-800 uppercase mt-1">
                    National Digital Examination & Academic Certification Authority
                  </p>

                  {/* Ornamental divider with center diamond */}
                  <div className="flex items-center justify-center gap-3 my-2.5">
                    <div className="h-[1.5px] w-16 sm:w-28 bg-gradient-to-r from-transparent via-amber-500 to-amber-600" />
                    <div className="w-2.5 h-2.5 rotate-45 bg-amber-600 shadow-sm" />
                    <div className="h-[1.5px] w-16 sm:w-28 bg-gradient-to-l from-transparent via-amber-500 to-amber-600" />
                  </div>
                </div>

                {/* Right Side: Circular Pakistan Flag Logo */}
                <div className="flex flex-col items-center flex-shrink-0 w-24 sm:w-28 text-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                    <PakistanFlagCircle className="w-full h-full drop-shadow-xl" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-sans font-bold text-[#01411c] uppercase tracking-wider mt-1.5 leading-tight">
                    Islamic Republic of Pakistan
                  </span>
                </div>

              </div>

              {/* Certificate Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide text-[#0a192f] uppercase">
                  Certificate of Achievement
                </h2>
                <p className="font-sans text-xs tracking-wider text-slate-600 uppercase mt-1 font-semibold">
                  This official credential is proudly conferred upon
                </p>
              </div>

              {/* Candidate Name */}
              <div className="text-center mb-5">
                <div className="inline-block relative">
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-[#047857] tracking-tight italic font-serif px-6">
                    {data.candidateName.trim() || 'Candidate'}
                  </h3>
                  <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-600 to-transparent mt-1.5" />
                </div>

                {data.candidateEmail && (
                  <p className="font-sans text-xs text-slate-700 font-medium mt-1.5">
                    Candidate Email: <strong className="text-slate-900">{data.candidateEmail}</strong> • Status: <span className="text-[#047857] font-bold">Verified Candidate</span>
                  </p>
                )}
              </div>

              {/* Citation Body */}
              <div className="text-center max-w-2xl mx-auto mb-6 space-y-1.5">
                <p className="font-sans text-xs sm:text-sm text-slate-700">
                  For successfully qualifying the comprehensive examination in
                </p>
                <p className="font-sans text-base sm:text-lg font-bold text-[#0a192f]">
                  {data.quizTitle} <span className="text-[#047857] font-semibold">({data.categoryName})</span>
                </p>
                <p className="text-xs text-slate-600 italic">
                  "{remark}"
                </p>
              </div>

              {/* Performance Score Badge */}
              <div className="max-w-xl mx-auto mb-8 bg-amber-50/80 border border-amber-300/80 rounded-xl p-3 font-sans flex flex-wrap items-center justify-around gap-2 text-center text-xs shadow-sm">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Verified Score</span>
                  <span className="text-base font-black text-[#047857]">{data.scorePercentage}%</span>
                </div>
                <div className="h-6 w-px bg-amber-200 hidden sm:block" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Correct / Total</span>
                  <span className="text-base font-black text-slate-800">{data.correctAnswers} / {data.totalQuestions}</span>
                </div>
                <div className="h-6 w-px bg-amber-200 hidden sm:block" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Performance Grade</span>
                  <span className="text-base font-black text-amber-700">{grade}</span>
                </div>
                <div className="h-6 w-px bg-amber-200 hidden sm:block" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Time Taken</span>
                  <span className="text-base font-black text-slate-800">{formatDuration(data.timeSeconds)}</span>
                </div>
              </div>

              {/* Bottom Authority & Seal Section */}
              <div className="grid grid-cols-3 items-end pt-4 border-t border-slate-300/80">
                {/* Left: Gold Rosette Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-amber-600/50">
                    <div className="w-12 h-12 rounded-full bg-[#0a192f] flex flex-col items-center justify-center text-center p-1">
                      <span className="text-[6px] font-black tracking-widest text-amber-300 uppercase leading-tight font-sans">
                        OFFICIAL
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 my-0.5" />
                      <span className="text-[5px] font-black tracking-widest text-white uppercase leading-none font-sans">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-sans font-bold text-amber-800 uppercase mt-1">
                    Authentic Credential
                  </span>
                </div>

                {/* Center: Founder & CEO Signature */}
                <div className="text-center">
                  {/* Handwritten Calligraphy Signature */}
                  <div className="h-10 flex flex-col items-center justify-center relative -mb-1">
                    <span 
                      className="text-2xl sm:text-[26px] text-[#0d254c] tracking-wide select-none leading-none -rotate-2"
                      style={{ fontFamily: "'Alex Brush', 'Great Vibes', 'Dancing Script', 'Brush Script MT', cursive" }}
                    >
                      Engr Nadeem Ali
                    </span>
                    <svg className="w-28 sm:w-32 h-3.5 text-[#0d254c] -mt-1" viewBox="0 0 120 14" fill="none">
                      <path d="M6 5 C 35 12, 75 2, 102 7 C 107 8, 110 5, 106 3 C 102 1, 90 6, 96 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <circle cx="108" cy="8" r="1.2" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="w-32 mx-auto border-t border-slate-400 my-1" />
                  <p className="font-sans text-[10px] font-bold text-slate-900 leading-tight">
                    Engr Nadeem Ali
                  </p>
                  <p className="font-sans text-[8px] font-semibold text-amber-700 leading-tight">
                    Founder & CEO
                  </p>
                  <p className="font-sans text-[7.5px] text-slate-500 leading-tight">
                    Future Academy Pro
                  </p>
                </div>

                {/* Right: Controller of Examination Signature */}
                <div className="text-center">
                  {/* Handwritten Calligraphy Signature */}
                  <div className="h-10 flex flex-col items-center justify-center relative -mb-1">
                    <span 
                      className="text-2xl sm:text-[26px] text-[#0d254c] tracking-wide select-none leading-none -rotate-1"
                      style={{ fontFamily: "'Alex Brush', 'Great Vibes', 'Dancing Script', 'Brush Script MT', cursive" }}
                    >
                      Dr. S. A. Rehman
                    </span>
                    <svg className="w-28 sm:w-32 h-3.5 text-[#0d254c] -mt-1" viewBox="0 0 120 14" fill="none">
                      <path d="M10 7 C 40 2, 75 11, 100 6 C 106 5, 109 8, 106 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <circle cx="109" cy="9" r="1.2" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="w-32 mx-auto border-t border-slate-400 my-1" />
                  <p className="font-sans text-[10px] font-bold text-slate-900 leading-tight">
                    Dr. S. A. Rehman
                  </p>
                  <p className="font-sans text-[8px] font-semibold text-amber-700 leading-tight">
                    Controller of Examinations
                  </p>
                  <p className="font-sans text-[7.5px] text-slate-500 leading-tight">
                    Future Academy Pro Certification Board
                  </p>
                </div>
              </div>

              {/* Certificate Footer Verification Info */}
              <div className="mt-6 pt-3 border-t border-slate-300/60 flex flex-wrap items-center justify-between text-[9px] font-sans text-slate-600">
                <div>
                  <span>Credential ID: <strong className="text-slate-800">{certId}</strong></span>
                  <span className="mx-2">•</span>
                  <span>Issued: <strong className="text-slate-800">{issueDate}</strong></span>
                </div>
                <div className="text-[#047857] font-semibold">
                  <span>Verify Authenticity: futureacademypro.com/verify/{certId}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
