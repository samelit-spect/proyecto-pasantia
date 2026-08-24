import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, UserPlus, X, Power, Pencil, RotateCcw } from 'lucide-react';
import {
  getSchools,
  getAllUsers,
  addUserProfile,
  setUserActive,
  updateUserProfile,
} from '@/services/api/firestore';
import { createUserAccount, sendPasswordReset } from '@/services/api/auth';
import { getAuthErrorMessage } from '@/utils/authErrors';
import { useAuth } from '@/context/AuthContext';
import SchoolSelect from '@/components/common/SchoolSelect/SchoolSelect';
import type { School, UserProfile } from '@/types';
import Button from '@/components/common/Button/Button';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import { useToast } from '@/context/ToastContext';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';
import { SupervisorUsersSkeleton } from './SupervisorSkeleton';
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
  const { addToast } = useToast();
  const { profile } = useAuth();

  const actor = () => (profile ? { uid: profile.uid, nombre: profile.nombre } : undefined);

  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSchoolId, setFilterSchoolId] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'toggle' | 'reset';
    user: UserProfile;
  } | null>(null);

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
    loadUsers();
  }, []);

  const handleCreate = async (data: CreateUserFormData) => {
    try {
      const uid = await createUserAccount(data.email, data.password);
      await addUserProfile(
        {
          uid,
          nombre: data.nombre,
          email: data.email,
          rol: data.rol,
          escuelaId: data.escuelaId,
          cargo: data.rol,
        },
        actor()
      );
      addToast('success', 'Usuario creado correctamente.');
      createForm.reset();
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      addToast('error', getAuthErrorMessage(err));
    }
  };

  const handleEdit = async (data: EditUserFormData) => {
    if (!editingUser) return;
    try {
      await updateUserProfile(
        editingUser.uid,
        {
          nombre: data.nombre,
          email: data.email,
          rol: data.rol,
          escuelaId: data.escuelaId,
        },
        actor()
      );
      addToast('success', 'Usuario actualizado correctamente.');
      setEditingUser(null);
      await loadUsers();
    } catch {
      addToast('error', 'No se pudo actualizar el usuario. Intentá de nuevo.');
    }
  };

  const startEditing = (user: UserProfile) => {
    setEditingUser(user);
    setShowForm(false);
    editForm.reset({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      escuelaId: user.escuelaId,
    });
  };

  const handleToggleActive = async (user: UserProfile) => {
    if (togglingId) return;
    setTogglingId(user.uid);
    try {
      await setUserActive(user.uid, !(user.activo ?? true), actor());
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid
            ? {
                ...u,
                activo: !(u.activo ?? true),
                editadoPor: profile?.uid,
                editadoPorNombre: profile?.nombre,
              }
            : u
        )
      );
    } catch {
      addToast('error', 'No se pudo actualizar el usuario. Intentá de nuevo.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleResetPassword = async (user: UserProfile) => {
    if (resettingId) return;
    setResettingId(user.uid);
    try {
      await sendPasswordReset(user.email);
      addToast('success', `Email de restablecimiento enviado a ${user.email}.`);
    } catch (err) {
      addToast('error', getAuthErrorMessage(err));
    } finally {
      setResettingId(null);
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'toggle') {
      handleToggleActive(confirmAction.user);
    } else {
      handleResetPassword(confirmAction.user);
    }
    setConfirmAction(null);
  };

  const schoolNameById = (schoolId: string) =>
    schools.find((s) => s.id === schoolId)?.nombre ?? 'Sin escuela';

  const filteredUsers = filterSchoolId
    ? users.filter((u) => u.escuelaId === filterSchoolId)
    : users;

  return (
    <>
      <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Usuarios' }]} />
      <div className="supervisor__header">
        <button
          className="supervisor__header-back"
          onClick={() => navigate('/supervisor', { viewTransition: true })}
        >
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

          <Button
            type="submit"
            loading={createForm.formState.isSubmitting}
            className="supervisor-users__submit"
          >
            Crear usuario
          </Button>
        </form>
      )}

      {editingUser && (
        <form className="supervisor-users__form" onSubmit={editForm.handleSubmit(handleEdit)}>
          <h3 className="supervisor-users__form-title">Editar usuario — {editingUser.nombre}</h3>

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

          <div className="supervisor-users__form-actions">
            <Button
              type="submit"
              loading={editForm.formState.isSubmitting}
              className="supervisor-users__submit"
            >
              Guardar cambios
            </Button>
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

      {!error && isLoading && <SupervisorUsersSkeleton />}

      {!error && !isLoading && (
        <div className="supervisor-users__section">
          <h3 className="supervisor__section-title">Usuarios ({filteredUsers.length})</h3>

          {filteredUsers.length === 0 ? (
            <EmptyState
              icon="users"
              title="No hay usuarios"
              description="Creá el primer usuario para asignarlo a una escuela."
              action={{ label: 'Crear usuario', onClick: () => setShowForm(true) }}
            />
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
                        {user.creadoPorNombre && (
                          <>
                            <span>·</span>
                            <span>Creado por {user.creadoPorNombre}</span>
                          </>
                        )}
                        {user.editadoPorNombre && user.editadoEn && (
                          <>
                            <span>·</span>
                            <span>
                              Editado por {user.editadoPorNombre} ·{' '}
                              {user.editadoEn.toDate().toLocaleDateString('es-AR')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {user.rol !== 'supervisor' && (
                      <div className="supervisor-users__item-actions">
                        <button
                          className="supervisor-users__action-btn"
                          data-tooltip="Editar nombre, email, rol o escuela"
                          onClick={() => startEditing(user)}
                        >
                          <Pencil size={14} strokeWidth={1.5} />
                          <span className="supervisor-users__action-label">Editar</span>
                        </button>
                        <button
                          className="supervisor-users__action-btn"
                          data-tooltip="Enviar email para restablecer la contraseña"
                          onClick={() => setConfirmAction({ type: 'reset', user })}
                          disabled={resettingId === user.uid}
                        >
                          <RotateCcw size={14} strokeWidth={1.5} />
                          <span className="supervisor-users__action-label">Contraseña</span>
                        </button>
                        <button
                          className="supervisor-users__toggle"
                          data-tooltip={
                            isActive
                              ? 'Desactivar acceso del usuario'
                              : 'Activar acceso del usuario'
                          }
                          onClick={() => setConfirmAction({ type: 'toggle', user })}
                          disabled={togglingId === user.uid}
                        >
                          <Power size={16} strokeWidth={1.5} />
                          <span className="supervisor-users__toggle-text">
                            {togglingId === user.uid ? '...' : isActive ? 'Desactivar' : 'Activar'}
                          </span>
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

      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === 'toggle'
            ? `${confirmAction?.user.activo === false ? 'Activar' : 'Desactivar'} usuario`
            : 'Restablecer contraseña'
        }
        message={
          confirmAction?.type === 'toggle'
            ? `¿Seguro que querés ${confirmAction?.user.activo === false ? 'activar' : 'desactivar'} a ${confirmAction?.user.nombre}?`
            : `¿Enviar email de restablecimiento a ${confirmAction?.user.email}?`
        }
        confirmLabel={confirmAction?.type === 'toggle' ? 'Sí, continuar' : 'Enviar email'}
        variant={confirmAction?.type === 'toggle' ? 'warning' : 'warning'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
};

export default SupervisorUsers;
