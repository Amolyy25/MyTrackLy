import React, { useState, useEffect, useCallback } from "react";
import { X, Download, Share, Plus, Smartphone } from "lucide-react";

const DISMISSED_KEY = "mytrackly_install_dismissed";

/**
 * Detects if the app is running in standalone (installed) mode.
 */
function isInstalledPWA(): boolean {
  // iOS standalone
  if ((navigator as any).standalone === true) return true;
  // Android / desktop installed
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  return false;
}

function wasDismissed(): boolean {
  return localStorage.getItem(DISMISSED_KEY) === "true";
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

/**
 * Full-screen modal shown once to suggest installing the app.
 */
function InstallModal({ onClose, onInstall, deferredPrompt }: {
  onClose: () => void;
  onInstall: () => void;
  deferredPrompt: any;
}) {
  const ios = isIOS();

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 sm:mx-4 overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
        </button>

        {/* Header with logo on white background */}
        <div className="bg-white px-6 pt-10 pb-8 text-center">
          <div className="w-24 h-24 rounded-3xl bg-white mx-auto flex items-center justify-center mb-5 shadow-xl shadow-slate-200/60 border border-slate-100">
            <img src="/logo.png" alt="MyTrackLy" className="w-20 h-20 rounded-2xl object-contain" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Installer MyTrackLy</h2>
          <p className="text-slate-500 text-sm mt-2">
            Accedez a votre carnet d'entrainement directement depuis votre ecran d'accueil
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-5 space-y-3">
          {[
            { icon: <Smartphone className="w-4 h-4" />, text: "Acces rapide comme une vraie app" },
            { icon: <Download className="w-4 h-4" />, text: "Fonctionne meme hors-ligne" },
            { icon: <Share className="w-4 h-4" />, text: "Plein ecran, sans barre de navigation" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                {item.icon}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="px-6 pb-6 space-y-3">
          {ios ? (
            /* iOS: manual instructions */
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Comment installer sur iPhone
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Appuyez sur <Share className="w-4 h-4 inline text-indigo-500" /> <span className="font-bold">Partager</span> en bas de Safari
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Selectionnez <Plus className="w-4 h-4 inline text-indigo-500" /> <span className="font-bold">Sur l'ecran d'accueil</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Appuyez sur <span className="font-bold">Ajouter</span>
                  </p>
                </div>
              </div>
            </div>
          ) : deferredPrompt ? (
            /* Android/Desktop: native install */
            <button
              onClick={onInstall}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              <Download className="w-5 h-5" />
              Installer l'application
            </button>
          ) : (
            /* Fallback */
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Comment installer
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Utilisez le menu de votre navigateur et cherchez "Installer" ou "Ajouter a l'ecran d'accueil".
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Plus tard
          </button>
        </div>

        {/* Safe area for mobile */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}

/**
 * Small banner/button shown in the dashboard when the modal was dismissed
 * but the app is still not installed.
 */
export function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isInstalledPWA()) {
      setVisible(false);
      return;
    }
    // Only show if modal was dismissed
    if (wasDismissed()) {
      setVisible(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Listen for app installed
  useEffect(() => {
    const handler = () => setVisible(false);
    window.addEventListener("appinstalled", handler);
    const mql = window.matchMedia("(display-mode: standalone)");
    const mqlHandler = (e: MediaQueryListEvent) => { if (e.matches) setVisible(false); };
    mql.addEventListener("change", mqlHandler);
    return () => {
      window.removeEventListener("appinstalled", handler);
      mql.removeEventListener("change", mqlHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setVisible(false);
        localStorage.removeItem(DISMISSED_KEY);
      }
      setDeferredPrompt(null);
    }
  };

  if (!visible) return null;

  const ios = isIOS();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800">
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100">
        <img src="/logo.png" alt="MyTrackLy" className="w-8 h-8 rounded-lg object-contain" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Installer MyTrackLy</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {ios ? "Safari > Partager > Ecran d'accueil" : "Ajoutez l'app a votre ecran d'accueil"}
        </p>
      </div>
      {!ios && deferredPrompt ? (
        <button
          onClick={handleInstall}
          className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors flex-shrink-0 active:scale-95"
        >
          Installer
        </button>
      ) : (
        <Download className="w-5 h-5 text-indigo-500 flex-shrink-0" />
      )}
    </div>
  );
}

/**
 * Main install prompt component. Shows the modal on first visit,
 * then converts to a banner after dismissal.
 */
const InstallPrompt: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    if (isInstalledPWA()) {
      setInstalled(true);
      return;
    }

    // If not dismissed yet, show the modal after a short delay
    if (!wasDismissed()) {
      const timer = setTimeout(() => setShowModal(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Capture beforeinstallprompt (Chrome/Edge/Android)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Listen for actual installation
  useEffect(() => {
    const handler = () => {
      setInstalled(true);
      setShowModal(false);
      localStorage.removeItem(DISMISSED_KEY);
    };
    window.addEventListener("appinstalled", handler);
    const mql = window.matchMedia("(display-mode: standalone)");
    const mqlHandler = (e: MediaQueryListEvent) => { if (e.matches) { setInstalled(true); setShowModal(false); } };
    mql.addEventListener("change", mqlHandler);
    return () => {
      window.removeEventListener("appinstalled", handler);
      mql.removeEventListener("change", mqlHandler);
    };
  }, []);

  const handleDismiss = () => {
    setShowModal(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setInstalled(true);
        setShowModal(false);
        localStorage.removeItem(DISMISSED_KEY);
      }
      setDeferredPrompt(null);
    }
  };

  // Don't render anything if installed
  if (installed) return null;

  return (
    <>
      {showModal && (
        <InstallModal
          onClose={handleDismiss}
          onInstall={handleInstall}
          deferredPrompt={deferredPrompt}
        />
      )}
    </>
  );
};

export default InstallPrompt;
