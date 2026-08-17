import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, UserPlus, X, Power } from 'lucide-react';
import { getSchools, getAllUsers, addUserProfile, setUserActive } from '@/services/api/firestore';
import { createUserAccount } from '@/services/api/auth';
import { getAuthErrorMessage } from '@/utils/authErrors';
import { FEEDBACK_AUTO_CLEAR_MS } from '@/utils/constants';
import SchoolSelect from '@/components/common/SchoolSelect/SchoolSelect';
import type { School, UserProfile } from '@/types';
import './SupervisorUsers.css';

const ROLES = ['director', 'vice', 'preceptor', 'secretario', 'conserje'] as const;

const createUserSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('El email no es válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(ROLES),
  escuelaId: z.string().min(1, 'Seleccioná una escuela'),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const SupervisorUsers = () => {
  const navigate = useNavigate();
  const initialized = useRef(false);

  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSchoolId, setFilterSchoolId] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      rol: 'director',
      escuelaId: '',
    },
  });

  const loadUsers = async () => {
    try {
      const [schoolsData, usersData] = await Promise.all([getSchools(), getAllUsers()]);
      setSchools(schoolsData);
      setUsers(usersData);
    } catch {
      setError('No se pudieron cargar los usuarios. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadUsers();
  }, []);

  const onSubmit = async (data: CreateUserFormData) => {
    setFeedback(null);

    try {
      const uid = await createUserAccount(data.email, data.password);
      await addUserProfile({
        uid,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        escuelaId: data.escuelaId,
        cargo: data.rol,
      });

      setFeedback({ type: 'success', message: 'Usuario creado correctamente.' });
      reset();
      setShowForm(false);
      await loadUsers();
      setTimeout(() => setFeedback(null), FEEDBACK_AUTO_CLEAR_MS);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setFeedback({ type: 'error', message });
    }
  };

  const handleToggleActive = async (user: UserProfile) => {
    const isActive = user.activo ?? true;
    const action = isActive ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Seguro que querés ${action} a ${user.nombre}?`)) return;

    if (togglingId) return;
    setTogglingId(user.uid);
    setFeedback(null);

    try {
      await setUserActive(user.uid, !(user.activo ?? true));
      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, activo: !(u.activo ?? true) } : u))
      );
    } catch {
      setFeedback({
        type: 'error',
        message: 'No se pudo actualizar el usuario. Intentá de nuevo.',
      });
      setTimeout(() => setFeedback(null), FEEDBACK_AUTO_CLEAR_MS);
    } finally {
      setTogglingId(null);
    }
  };

  const schoolNameById = (schoolId: string) =>
    schools.find((s) => s.id === schoolId)?.nombre ?? 'Sin escuela';

  const filteredUsers = filterSchoolId
    ? users.filter((u) => u.escuelaId === filterSchoolId)
    : users;

  return (
    <>
      <div className="supervisor__header">
        <button className="supervisor__back" onClick={() => navigate('/supervisor')}>
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <h2 className="supervisor__title">Configuración de Usuarios</h2>
      </div>
      <p className="supervisor__subtitle">Crear, editar y administrar los usuarios del sistema.</p>

      {error && <div className="supervisor__loading supervisor__loading--error">{error}</div>}

      {!error && (
        <div className="supervisor-users__actions">
          <button
            className="supervisor-users__add-btn"
            onClick={() => {
              reset();
              setFeedback(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? (
              <X size={16} strokeWidth={1.5} />
            ) : (
              <UserPlus size={16} strokeWidth={1.5} />
            )}
            {showForm ? 'Cancelar' : 'Nuevo usuario'}
          </button>

          <label className="supervisor-users__filter">
            <span className="supervisor-users__filter-label">Escuela</span>
            <select
              className="supervisor-users__filter-select"
              value={filterSchoolId}
              onChange={(e) => setFilterSchoolId(e.target.value)}
            >
              <option value="">Todas</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {showForm && (
        <form className="supervisor-users__form" onSubmit={handleSubmit(onSubmit)}>
          <h3 className="supervisor-users__form-title">Crear usuario</h3>

          <div className="supervisor-users__form-row">
            <label className="supervisor-users__label">
              Nombre completo *
              <input
                className="supervisor-users__input"
                type="text"
                placeholder="Ej: Juan Pérez"
                {...register('nombre')}
              />
              {errors.nombre && (
                <span className="supervisor-users__error">{errors.nombre.message}</span>
              )}
            </label>

            <label className="supervisor-users__label">
              Rol *
              <select className="supervisor-users__select" {...register('rol')}>
                {ROLES.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
              {errors.rol && <span className="supervisor-users__error">{errors.rol.message}</span>}
            </label>
          </div>

          <div className="supervisor-users__form-row">
            <label className="supervisor-users__label">
              Email *
              <input
                className="supervisor-users__input"
                type="email"
                placeholder="tu@email.com"
                autoComplete="off"
                {...register('email')}
              />
              {errors.email && (
                <span className="supervisor-users__error">{errors.email.message}</span>
              )}
            </label>

            <label className="supervisor-users__label">
              Contraseña *
              <input
                className="supervisor-users__input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <span className="supervisor-users__error">{errors.password.message}</span>
              )}
            </label>
          </div>

          <Controller
            name="escuelaId"
            control={control}
            render={({ field }) => (
              <div className="supervisor-users__form-school">
                <SchoolSelect value={field.value} onChange={field.onChange} />
                {errors.escuelaId && (
                  <span className="supervisor-users__error">{errors.escuelaId.message}</span>
                )}
              </div>
            )}
          />

          {feedback && (
            <div
              className={`supervisor-users__feedback supervisor-users__feedback--${feedback.type}`}
              role="alert"
            >
              {feedback.message}
            </div>
          )}

          <button type="submit" className="supervisor-users__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      )}

      {!error && isLoading && <div className="supervisor__loading">Cargando usuarios...</div>}

      {!error && !isLoading && (
        <div className="supervisor-users__section">
          <h3 className="supervisor__section-title">Usuarios ({filteredUsers.length})</h3>

          {filteredUsers.length === 0 ? (
            <div className="supervisor__empty">No hay usuarios registrados.</div>
          ) : (
            <div className="supervisor-users__list">
              {filteredUsers.map((user) => {
                const isActive = user.activo ?? true;
                return (
                  <div
                    key={user.uid}
                    className={`supervisor-users__item ${isActive ? '' : 'supervisor-users__item--inactive'}`}
                  >
                    <div className="supervisor-users__item-info">
                      <div className="supervisor-users__item-header">
                        <span className="supervisor-users__item-name">{user.nombre}</span>
                        <span className="supervisor-users__item-role">{user.rol}</span>
                        {!isActive && (
                          <span className="supervisor-users__item-badge">Desactivado</span>
                        )}
                      </div>
                      <div className="supervisor-users__item-meta">
                        <span>{user.email}</span>
                        <span>·</span>
                        <span>{schoolNameById(user.escuelaId)}</span>
                      </div>
                    </div>

                    {user.rol !== 'supervisor' && (
                      <button
                        className="supervisor-users__toggle"
                        onClick={() => handleToggleActive(user)}
                        disabled={togglingId === user.uid}
                        title={isActive ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        <Power size={16} strokeWidth={1.5} />
                        {togglingId === user.uid ? '...' : isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SupervisorUsers;
