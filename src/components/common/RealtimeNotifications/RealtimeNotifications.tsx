import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  subscribeTodayIncidents,
  subscribeTodayAttendances,
  subscribeTodayNews,
} from '@/services/api/firestore';

export default function RealtimeNotifications() {
  const { hasRole } = useAuth();
  const { addToast } = useToast();
  const initialRef = useRef({ att: false, news: false, inc: false });

  useEffect(() => {
    if (!hasRole('supervisor')) return;

    const unsubIncidents = subscribeTodayIncidents((data) => {
      if (!initialRef.current.inc) {
        initialRef.current.inc = true;
        return;
      }
      if (data.length > 0) {
        const latest = data[0];
        addToast('warning', `Nuevo incidente: ${latest.descripcion.slice(0, 60)}...`);
      }
    });

    const unsubAttendances = subscribeTodayAttendances((data) => {
      if (!initialRef.current.att) {
        initialRef.current.att = true;
        return;
      }
      if (data.length > 0) {
        const latest = data[0];
        addToast('info', `Asistencia cargada por ${latest.cargadoPorNombre}`);
      }
    });

    const unsubNews = subscribeTodayNews((data) => {
      if (!initialRef.current.news) {
        initialRef.current.news = true;
        return;
      }
      if (data.length > 0) {
        const latest = data[0];
        addToast('info', `Novedad cargada por ${latest.cargadoPorNombre}`);
      }
    });

    return () => {
      unsubIncidents();
      unsubAttendances();
      unsubNews();
    };
  }, [hasRole, addToast]);

  return null;
}
