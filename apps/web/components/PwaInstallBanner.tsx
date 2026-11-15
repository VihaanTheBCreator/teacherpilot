'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, CheckCircle2 } from 'lucide-react';
import GemsCrest from './GemsCrest';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if dismissed
    const dismissed = localStorage.getItem('teacherpilot_pwa_dismissed');
    if (dismissed) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS and not running standalone
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (isIosDevice && !isStandalone) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        setTimeout(() => setIsVisible(false), 2000);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('teacherpilot_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-4 inset-x-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-600/40 flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-3 min-w-0">
          <GemsCrest size={34} />
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-white truncate">Install TeacherPilot App</h4>
            <p className="text-[10px] text-emerald-200">
              {isIos ? 'Tap Share ⎋ then "Add to Home Screen"' : 'Fast offline access & instant alert dispatch'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {installed ? (
            <span className="text-emerald-400 text-xs font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Installed</span>
            </span>
          ) : deferredPrompt ? (
            <button
              type="button"
              onClick={handleInstallClick}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          ) : isIos ? (
            <span className="text-[10px] font-mono bg-emerald-900/70 border border-emerald-600/60 text-emerald-200 px-2 py-1 rounded-lg flex items-center space-x-1">
              <Share className="w-3 h-3 text-amber-300" />
              <span>Share &rarr; Add</span>
            </span>
          ) : null}

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
