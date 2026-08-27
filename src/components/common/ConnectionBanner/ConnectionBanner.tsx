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
  const [pendingCount, setPendingCount] = useState(0);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      return;
    }

    if (!wasOfflineRef.current && !hasOfflineWrites()) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    waitForPendingWrites(db)
      .then(() => {
        if (cancelled) return;
        if (hasOfflineWrites()) {
          clearOfflineWrites();
          setPendingCount(0);
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
      <div className="connection-banner connection-banner--offline" role="status">
        <WifiOff size={16} strokeWidth={1.5} className="connection-banner__icon--pulse" />
        <span>Sin conexión — Los cambios se guardarán y sincronizarán cuando haya internet.</span>
        {pendingCount > 0 && (
          <span className="connection-banner__badge">{pendingCount}</span>
        )}
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
