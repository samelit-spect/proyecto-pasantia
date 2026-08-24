import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Share, Shield, X } from 'lucide-react';
import './InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'sipnam-install-dismissed';
const SHOW_DELAY_MS = 2500;

let deferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });
}

const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (/Macintosh/i.test(window.navigator.userAgent) && 'ontouchend' in document);

const InstallPrompt = () => {
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // localStorage no disponible: mostramos igual
    }

    const timer = setTimeout(() => {
      if (isIOS()) {
        setIosMode(true);
        setVisible(true);
      } else if (deferredPrompt) {
        setVisible(true);
      }
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onInstalled = () => {
      setVisible(false);
      deferredPrompt = null;
      try {
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
      } catch {
        // noop
      }
    };
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // noop
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      dismiss();
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === 'accepted') {
      setVisible(false);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  return (
    <div className="install-prompt" role="dialog" aria-label="Instalar la aplicación">
      <button className="install-prompt__close" onClick={dismiss} aria-label="Cerrar">
        <X size={16} strokeWidth={1.5} />
      </button>

      <div className="install-prompt__icon">
        <Shield size={22} strokeWidth={1.8} />
      </div>

      <div className="install-prompt__body">
        <span className="install-prompt__title">Instalá SIPNAM en tu dispositivo</span>
        {iosMode ? (
          <>
            <p className="install-prompt__text">
              Tocá el botón <Share size={13} strokeWidth={1.5} /> Compartir y elegí "Agregar a
              pantalla de inicio".
            </p>
            <Link viewTransition to="/ayuda" className="install-prompt__link">
              Ver guía completa
            </Link>
          </>
        ) : (
          <p className="install-prompt__text">
            Accedé más rápido y usala como una app, incluso sin conexión.
          </p>
        )}
      </div>

      {!iosMode && (
        <button className="install-prompt__action" onClick={handleInstall}>
          <Download size={15} strokeWidth={2} />
          Instalar
        </button>
      )}
    </div>
  );
};

export default InstallPrompt;
