import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  UserPlus,
  X,
  Power,
  Pencil,
  RotateCcw,
} from 'lucide-react';
import {
  getSchools,
  getAllUsers,
  addUserProfile,
  setUserActive,
  updateUserProfile,
} from '@/services/api/firestore';
import { createUserAccount, sendPasswordReset } from '@/services/api/auth';
import { getAuthErrorMessage } from '@/utils/authErrors';
import { FEEDBACK_AUTO_CLEAR_MS } from '@/utils/constants';
import SchoolSelect from '@/components/common/SchoolSelect/SchoolSelect';
import type { School, UserProfile } from '@/types';
import './SupervisorUsers.css';

const ROLES = ['director', 'vice', 'preceptor', 'secretario', 'conserje', 'supervisor'] as const;

const createUserSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('El email no es válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(ROLES),
  escuelaId: z.string().min(1, 'Seleccioná una escuela'),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const editUserSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('El email no es válido'),
  rol: z.enum(ROLES),
  escuelaId: z.string().min(1, 'Seleccioná una escuela'),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

const SupervisorUsers = () => {
  const navigate = useNavigate();
  const initialized = useRef(false);

  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSchoolId, setFilterSchoolId] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      rol: 'director',
      escuelaId: '',
    },
  });

  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
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

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), FEEDBACK_AUTO_CLEAR_MS);
  };

  const handleCreate = async (data: CreateUserFormData) => {
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
      showFeedback('success', 'Usuario creado correctamente.');
      createForm.reset();
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      showFeedback('error', getAuthErrorMessage(err));
    }
  };

  const handleEdit = async (data: EditUserFormData) => {
    if (!editingUser) return;
    setFeedback(null);
    try {
      await updateUserProfile(editingUser.uid, {
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        escuelaId: data.escuelaId,
      });
      showFeedback('success', 'Usuario actualizado correctamente.');
      setEditingUser(null);
      await loadUsers();
    } catch {
      showFeedback('error', 'No se pudo actualizar el usuario. Intentá de nuevo.');
    }
  };

  const startEditing = (user: UserProfile) => {
    setEditingUser(user);
    setShowForm(false);
    setFeedback(null);
    editForm.reset({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      escuelaId: user.escuelaId,
    });
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
      showFeedback('error', 'No se pudo actualizar el usuario. Intentá de nuevo.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleResetPassword = async (user: UserProfile) => {
    if (!window.confirm(`¿Enviar email de restablecimiento a ${user.email}?`)) return;

    if (resettingId) return;
    setResettingId(user.uid);
    setFeedback(null);

    try {
      await sendPasswordReset(user.email);
      showFeedback('success', `Email de restablecimiento enviado a ${user.email}.`);
    } catch (err) {
      showFeedback('error', getAuthErrorMessage(err));
    } finally {
      setResettingId(null);
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
              createForm.reset();
              setEditingUser(null);
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
        <form className="supervisor-users__form" onSubmit={createForm.handleSubmit(handleCreate)}>
          <h3 className="supervisor-users__form-title">Crear usuario</h3>

          <div className="supervisor-users__form-row">
            <label className="supervisor-users__label">
              Nombre completo *
              <input
                className="supervisor-users__input"
                type="text"
                placeholder="Ej: Juan Pérez"
                {...createForm.register('nombre')}
              />
              {createForm.formState.errors.nombre && (
                <span className="supervisor-users__error">
                  {createForm.formState.errors.nombre.message}
                </span>
              )}
            </label>

            <label className="supervisor-users__label">
              Rol *
              <select className="supervisor-users__select" {...createForm.register('rol')}>
                {ROLES.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
              {createForm.formState.errors.rol && (
                <span className="supervisor-users__error">
                  {createForm.formState.errors.rol.message}
                </span>
              )}
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
                {...createForm.register('email')}
              />
              {createForm.formState.errors.email && (
                <span className="supervisor-users__error">
                  {createForm.formState.errors.email.message}
                </span>
              )}
            </label>

            <label className="supervisor-users__label">
              Contraseña *
              <input
                className="supervisor-users__input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                {...createForm.register('password')}
              />
              {createForm.formState.errors.password && (
                <span className="supervisor-users__error">
                  {createForm.formState.errors.password.message}
                </span>
              )}
            </label>
          </div>

          <Controller
            name="escuelaId"
            control={createForm.control}
            render={({ field }) => (
              <div className="supervisor-users__form-school">
                <SchoolSelect value={field.value} onChange={field.onChange} />
                {createForm.formState.errors.escuelaId && (
                  <span className="supervisor-users__error">
                    {createForm.formState.errors.escuelaId.message}
                  </span>
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

          <button type="submit" className="supervisor-users__submit" disabled={createForm.formState.isSubmitting}>
            {createForm.formState.isSubmitting ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      )}

      {editingUser && (
        <form className="supervisor-users__form" onSubmit={editForm.handleSubmit(handleEdit)}>
          <h3 className="supervisor-users__form-title">
            Editar usuario — {editingUser.nombre}
          </h3>

          <div className="supervisor-users__form-row">
            <label className="supervisor-users__label">
              Nombre completo *
              <input
                className="supervisor-users__input"
                type="text"
                {...editForm.register('nombre')}
              />
              {editForm.formState.errors.nombre && (
                <span className="supervisor-users__error">
                  {editForm.formState.errors.nombre.message}
                </span>
              )}
            </label>

            <label className="supervisor-users__label">
              Rol *
              <select className="supervisor-users__select" {...editForm.register('rol')}>
                {ROLES.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
              {editForm.formState.errors.rol && (
                <span className="supervisor-users__error">
                  {editForm.formState.errors.rol.message}
                </span>
              )}
            </label>
          </div>

          <label className="supervisor-users__label">
            Email *
            <input
              className="supervisor-users__input"
              type="email"
              {...editForm.register('email')}
            />
            {editForm.formState.errors.email && (
              <span className="supervisor-users__error">
                {editForm.formState.errors.email.message}
              </span>
            )}
          </label>

          <Controller
            name="escuelaId"
            control={editForm.control}
            render={({ field }) => (
              <div className="supervisor-users__form-school">
                <SchoolSelect value={field.value} onChange={field.onChange} />
                {editForm.formState.errors.escuelaId && (
                  <span className="supervisor-users__error">
                    {editForm.formState.errors.escuelaId.message}
                  </span>
                )}
              </div>
            )}
          />

          <p className="supervisor-users__hint">
            Para cambiar la contraseña, usá el botón "Restablecer" en la lista de usuarios.
          </p>

          {feedback && (
            <div
              className={`supervisor-users__feedback supervisor-users__feedback--${feedback.type}`}
              role="alert"
            >
              {feedback.message}
            </div>
          )}

          <div className="supervisor-users__form-actions">
            <button type="submit" className="supervisor-users__submit" disabled={editForm.formState.isSubmitting}>
              {editForm.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              className="supervisor-users__cancel"
              onClick={() => setEditingUser(null)}
            >
              Cancelar
            </button>
          </div>
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
                      <div className="supervisor-users__item-actions">
                        <button
                          className="supervisor-users__action-btn"
                          onClick={() => startEditing(user)}
                          title="Editar usuario"
                        >
                          <Pencil size={14} strokeWidth={1.5} />
                        </button>
                        <button
                          className="supervisor-users__action-btn"
                          onClick={() => handleResetPassword(user)}
                          disabled={resettingId === user.uid}
                          title="Restablecer contraseña"
                        >
                          <RotateCcw size={14} strokeWidth={1.5} />
                        </button>
                        <button
                          className="supervisor-users__toggle"
                          onClick={() => handleToggleActive(user)}
                          disabled={togglingId === user.uid}
                          title={isActive ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          <Power size={16} strokeWidth={1.5} />
                          {togglingId === user.uid ? '...' : isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
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
