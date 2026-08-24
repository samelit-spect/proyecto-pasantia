import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, WifiOff } from 'lucide-react';
import { waitForPendingWrites } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useOnlineStatus } from '@/hooks/custom/useOnlineStatus';
import { hasOfflineWrites, clearOfflineWrites } from '@/utils/offlineQueue';
import './ConnectionBanner.css';

const SYNC_FEEDBACK_MS = 4000;

const ConnectionBanner = () => {
  const isOnline = useOnlineStatus();
  const [justSynced, setJustSynced] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      return;
    }

    // Al montar ya online con marcador (ej: se cerró la pestaña offline y
    // volvió con conexión), también corresponde confirmar el sync.
    if (!wasOfflineRef.current && !hasOfflineWrites()) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    waitForPendingWrites(db)
      .then(() => {
        if (cancelled) return;
        if (hasOfflineWrites()) {
          clearOfflineWrites();
          setJustSynced(true);
          timeoutId = setTimeout(() => setJustSynced(false), SYNC_FEEDBACK_MS);
        }
      })
      .catch((error) => {
        console.warn('[ConnectionBanner] No se pudieron sincronizar escrituras pendientes:', error);
      });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOnline]);

  if (!isOnline) {
    return (
      <div className="connection-banner" role="status">
        <WifiOff size={16} strokeWidth={1.5} />
        Sin conexión — Los cambios se guardarán y sincronizarán cuando haya internet.
      </div>
    );
  }

  if (justSynced) {
    return (
      <div className="connection-banner connection-banner--synced" role="status">
        <CheckCircle2 size={16} strokeWidth={1.5} />
        Conexión restablecida — Registros pendientes sincronizados correctamente.
      </div>
    );
  }

  return null;
};

export default ConnectionBanner;
