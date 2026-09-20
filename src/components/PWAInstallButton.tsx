import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { AndroidAppModal } from './AndroidAppModal';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'hero' | 'floating' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'navbar',
  className = '' 
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (variant === 'floating') {
    if (isInstalled) return null;
    return (
      <>
        <button
          onClick={handleClick}
          className={`fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-2xl shadow-xl shadow-emerald-600/30 border border-emerald-400/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${className}`}
          title="Install Future Academy Pro on Android"
        >
          <div className="relative">
            <Smartphone className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
          </div>
          <span className="hidden sm:inline">Get Android App</span>
          <span className="sm:hidden">App</span>
        </button>

        <AndroidAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  if (variant === 'hero') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer ${
            isInstalled 
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
          } ${className}`}
        >
          {isInstalled ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>App Installed • Auto-Sync Active</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4" />
              <span>Download / Install Android App</span>
            </>
          )}
        </button>

        <AndroidAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  if (variant === 'banner') {
    if (isInstalled) return null;
    return (
      <>
        <div className={`w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs ${className}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <span className="font-bold">Android App Available: </span>
              <span className="opacity-90">Install Future Academy Pro for real-time updates and offline preparation!</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={handleClick}
              className="px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-lg shadow-sm transition active:scale-95"
            >
              Install App
            </button>
          </div>
        </div>

        <AndroidAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // Default navbar variant
  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition border cursor-pointer ${
          isInstalled
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-sm shadow-emerald-600/20'
        } ${className}`}
        title="Install Android App with Real-Time Auto-Sync"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden md:inline">{isInstalled ? 'App Active' : 'Android App'}</span>
      </button>

      <AndroidAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl shadow-amber-900/20 border border-amber-400/40 animate-pulse">
      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
      <span>Offline Mode — Cached MCQs available for practice.</span>
    </div>
  );
};
