import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, Building2, Calendar, Briefcase, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSchoolById } from '@/services/api/firestore';
import { sendPasswordReset } from '@/services/api/auth';
import type { School } from '@/types/models/school';
import './Profile.css';

const ROL_LABELS: Record<string, string> = {
  director: 'Director/a',
  vice: 'Vice-director/a',
  preceptor: 'Preceptor/a',
  secretario: 'Secretario/a',
  conserje: 'Conserje',
  supervisor: 'Supervisor/a',
};

const Profile = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (profile?.escuelaId) {
      getSchoolById(profile.escuelaId).then(setSchool);
    }
  }, [profile?.escuelaId]);

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    setResetLoading(true);
    setResetError('');
    try {
      await sendPasswordReset(profile.email);
      setResetSent(true);
    } catch {
      setResetError('No se pudo enviar el email. Intentá de nuevo.');
    } finally {
      setResetLoading(false);
    }
  };

  if (!profile) return null;

  const fechaCreacion = profile.fechaCreacion
    ? new Date(profile.fechaCreacion).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const userInitial = profile.nombre?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <div className="supervisor__header">
        <button
          className="supervisor__back"
          onClick={() => navigate('/', { viewTransition: true })}
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="supervisor__title">Mi Perfil</h2>
      </div>

      <div className="profile">
        <div className="profile__card profile__card--header">
          <div className="profile__avatar">{userInitial}</div>
          <h3 className="profile__name">{profile.nombre}</h3>
          <span className="profile__role-badge">{ROL_LABELS[profile.rol] || profile.rol}</span>
        </div>

        <div className="profile__card">
          <div className="profile__field">
            <span className="profile__field-icon"><Mail size={16} strokeWidth={1.5} /></span>
            <div className="profile__field-content">
              <span className="profile__field-label">Email</span>
              <span className="profile__field-value">{profile.email}</span>
            </div>
          </div>

          <div className="profile__field">
            <span className="profile__field-icon"><Shield size={16} strokeWidth={1.5} /></span>
            <div className="profile__field-content">
              <span className="profile__field-label">Rol</span>
              <span className="profile__field-value">{ROL_LABELS[profile.rol] || profile.rol}</span>
            </div>
          </div>

          <div className="profile__field">
            <span className="profile__field-icon"><Briefcase size={16} strokeWidth={1.5} /></span>
            <div className="profile__field-content">
              <span className="profile__field-label">Cargo</span>
              <span className="profile__field-value">{profile.cargo || '—'}</span>
            </div>
          </div>

          {profile.rol !== 'supervisor' && (
            <div className="profile__field">
              <span className="profile__field-icon"><Building2 size={16} strokeWidth={1.5} /></span>
              <div className="profile__field-content">
                <span className="profile__field-label">Escuela</span>
                <span className="profile__field-value">{school?.nombre || 'Cargando...'}</span>
                {school?.direccion && (
                  <span className="profile__field-sub">{school.direccion}</span>
                )}
              </div>
            </div>
          )}

          <div className="profile__field">
            <span className="profile__field-icon"><Calendar size={16} strokeWidth={1.5} /></span>
            <div className="profile__field-content">
              <span className="profile__field-label">Fecha de alta</span>
              <span className="profile__field-value">{fechaCreacion}</span>
            </div>
          </div>
        </div>

        <div className="profile__card">
          <h4 className="profile__section-title">
            <KeyRound size={16} strokeWidth={1.5} />
            Seguridad
          </h4>
          <p className="profile__section-text">
            Si querés cambiar tu contraseña, te enviaremos un email con las instrucciones.
          </p>
          {resetSent ? (
            <div className="profile__success">
              <CheckCircle2 size={16} strokeWidth={1.5} />
              Email enviado. Revisá tu bandeja de entrada.
            </div>
          ) : (
            <button
              className="profile__reset-btn"
              onClick={handlePasswordReset}
              disabled={resetLoading}
            >
              {resetLoading ? 'Enviando...' : 'Cambiar contraseña'}
            </button>
          )}
          {resetError && <p className="profile__error">{resetError}</p>}
        </div>

        {user && (
          <p className="profile__uid">UID: {user.uid}</p>
        )}
      </div>
    </>
  );
};

export default Profile;
