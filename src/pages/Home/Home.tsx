import { useAuth } from '@/context/AuthContext';

const Home = () => {
  const { profile, hasRole } = useAuth();

  return (
    <section>
      <h2>Bienvenido, {profile?.nombre}</h2>
      <p>Rol: {profile?.rol}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {(hasRole('director', 'vice', 'preceptor')) && (
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <h3>Asistencia</h3>
            <p>Registrar asistencia diaria del personal</p>
          </div>
        )}

        {hasRole('director', 'vice') && (
          <>
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <h3>Novedades</h3>
              <p>Registrar novedades de la escuela</p>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <h3>Incidentes</h3>
              <p>Registrar incidentes institucionales</p>
            </div>
          </>
        )}

        {hasRole('supervisor') && (
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <h3>Supervisor</h3>
            <p>Ver todas las escuelas asignadas</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Home;
