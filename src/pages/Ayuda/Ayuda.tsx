import { useState } from 'react';
import { HelpCircle, WifiOff, BookOpen, Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import type { UserRole } from '@/types';
import './Ayuda.css';

interface FaqItem {
  q: string;
  a: string;
  roles?: UserRole[];
}

type SectionKey = 'faq' | 'offline' | 'install' | 'glosario';

const FAQS: FaqItem[] = [
  {
    q: '¿Tengo que seleccionar mi escuela al cargar un registro?',
    a: 'No. La escuela se asigna automáticamente según tu usuario. Solo el supervisor trabaja con todas las escuelas de la jurisdicción.',
  },
  {
    q: '¿Cada cuánto puedo cargar la asistencia de gestión?',
    a: 'El director y el vice-director pueden cargar un formulario por día. Los preceptores pueden cargar varios formularios por día (uno por cada uno).',
    roles: ['director', 'vice', 'preceptor'],
  },
  {
    q: '¿Quién puede registrar novedades e incidentes?',
    a: 'Solo el director y el vice-director. Las novedades son informaciones institucionales del día; los incidentes son problemas edilicios que luego sigue el supervisor.',
    roles: ['director', 'vice'],
  },
  {
    q: '¿Puedo eliminar una foto de planilla que subí?',
    a: 'Sí. Cada preceptor puede eliminar sus propias fotos desde la sección Foto Diaria. El supervisor también puede eliminarlas.',
    roles: ['preceptor'],
  },
  {
    q: '¿Qué significa que una asistencia está "verificada"?',
    a: 'Significa que el supervisor la revisó y confirmó. Podés ver quién verificó y cuándo en el detalle de tu escuela.',
    roles: ['director', 'vice', 'preceptor'],
  },
  {
    q: '¿Cómo hago para verificar asistencias?',
    a: 'Entrá al Panel de Supervisión, abrí la escuela y usá el botón "Verificar" en cada asistencia de la vista Hoy o Histórico.',
    roles: ['supervisor'],
  },
  {
    q: '¿Cómo cambio el estado de un incidente?',
    a: 'En el detalle de cada escuela, abrí la sección Incidentes y elegí el nuevo estado (en análisis, en gestión, resuelto, pendiente). Cada cambio queda registrado con fecha y responsable.',
    roles: ['supervisor'],
  },
  {
    q: '¿Cómo sigo el avance de un incidente que cargué?',
    a: 'En la sección Historial vas a ver tus incidentes con su historial de estados: quién cambió cada estado y cuándo.',
    roles: ['director', 'vice'],
  },
];

const GLOSARIO: { termino: string; definicion: string }[] = [
  {
    termino: 'Asistencia de gestión',
    definicion:
      'Registro diario de presencia del personal no docente: director, vice-director, preceptores, secretarios y conserjes.',
  },
  {
    termino: 'Asistencia de docentes',
    definicion:
      'Registro diario de presencia del cuerpo docente, acompañado de la foto de la planilla firmada.',
  },
  {
    termino: 'Novedad institucional',
    definicion:
      'Información relevante del día de la escuela (visitas, eventos, situaciones destacadas) que la cargan director o vice-director.',
  },
  {
    termino: 'Incidente edilicio',
    definicion:
      'Problema de infraestructura (roturas, filtraciones, fallas de servicios) que se informa al supervisor para su seguimiento.',
  },
  {
    termino: 'Planilla firmada',
    definicion:
      'Foto diaria de la planilla de asistencia firmada, subida por el preceptor como respaldo del registro.',
  },
  {
    termino: 'Verificación',
    definicion:
      'Revisión que hace el supervisor sobre una asistencia cargada. Queda registrado quién verificó y cuándo.',
  },
  {
    termino: 'Historial de estados',
    definicion:
      'Registro de cada cambio de estado de un incidente: estado anterior, nuevo estado, responsable y fecha.',
  },
];

const Ayuda = () => {
  const { hasRole } = useAuth();
  const [openSection, setOpenSection] = useState<SectionKey | null>('faq');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = FAQS.filter((f) => !f.roles || f.roles.some((r) => hasRole(r)));

  const toggleSection = (key: SectionKey) => setOpenSection((prev) => (prev === key ? null : key));

  const sections: { key: SectionKey; icon: React.ReactNode; title: string }[] = [
    { key: 'faq', icon: <HelpCircle size={16} strokeWidth={1.5} />, title: 'Preguntas frecuentes' },
    { key: 'offline', icon: <WifiOff size={16} strokeWidth={1.5} />, title: 'Uso sin conexión' },
    { key: 'install', icon: <Smartphone size={16} strokeWidth={1.5} />, title: 'Instalar la app' },
    { key: 'glosario', icon: <BookOpen size={16} strokeWidth={1.5} />, title: 'Glosario' },
  ];

  return (
    <section className="ayuda">
      <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: 'Ayuda' }]} />
      <h2 className="ayuda__title">Ayuda</h2>
      <p className="ayuda__subtitle">Guías rápidas para usar SIPNAM en tu día a día.</p>

      <div className="ayuda__sections">
        {sections.map(({ key, icon, title }) => (
          <div key={key} className="ayuda__section">
            <button className="ayuda__section-header" onClick={() => toggleSection(key)}>
              <span className="ayuda__section-title">
                {icon}
                {title}
              </span>
              <span className={`ayuda__arrow ${openSection === key ? 'ayuda__arrow--open' : ''}`}>
                ▾
              </span>
            </button>

            {openSection === key && (
              <div className="ayuda__section-body">
                {key === 'faq' && (
                  <div className="ayuda__faq">
                    {faqs.map((f, i) => (
                      <details
                        key={f.q}
                        className="ayuda__faq-item"
                        open={openFaq === i}
                        onToggle={(e) => {
                          if ((e.target as HTMLDetailsElement).open) setOpenFaq(i);
                          else if (openFaq === i) setOpenFaq(null);
                        }}
                      >
                        <summary>{f.q}</summary>
                        <p>{f.a}</p>
                      </details>
                    ))}
                  </div>
                )}

                {key === 'offline' && (
                  <div className="ayuda__prose">
                    <p>
                      La app funciona aunque no haya internet. Lo que crees sin conexión se guarda
                      en tu dispositivo y se sincroniza automáticamente cuando vuelve la red.
                    </p>
                    <p className="ayuda__prose-label">Podés hacer sin conexión:</p>
                    <ul>
                      <li>Cargar asistencia de gestión y de docentes</li>
                      <li>Registrar novedades e incidentes</li>
                      <li>Subir la foto de la planilla</li>
                      <li>Consultar los datos recientes de tu escuela</li>
                    </ul>
                    <p className="ayuda__prose-label">Requiere conexión:</p>
                    <ul>
                      <li>Verificar asistencias y cambiar el estado de incidentes (supervisor)</li>
                      <li>Ver datos de escuelas que no visitaste recientemente</li>
                    </ul>
                    <p>
                      Cuando vuelvas a tener internet vas a ver el aviso verde{' '}
                      <strong>"Registros pendientes sincronizados"</strong>.
                    </p>
                  </div>
                )}

                {key === 'install' && (
                  <div className="ayuda__prose">
                    <p>
                      SIPNAM se puede instalar como una aplicación en tu celular o computadora, sin
                      pasar por la tienda de apps.
                    </p>
                    <p className="ayuda__prose-label">En Android (Chrome):</p>
                    <ol>
                      <li>Tocá el menú ⋮ de la esquina superior derecha.</li>
                      <li>Elegí "Agregar a pantalla de inicio" o "Instalar aplicación".</li>
                      <li>Confirmá tocando "Instalar".</li>
                    </ol>
                    <p className="ayuda__prose-label">En iPhone o iPad (Safari):</p>
                    <ol>
                      <li>Tocá el botón Compartir (cuadrado con flecha hacia arriba).</li>
                      <li>Elegí "Agregar a pantalla de inicio".</li>
                      <li>Confirmá tocando "Agregar".</li>
                    </ol>
                    <p>
                      Va a aparecer un ícono de SIPNAM en tu pantalla de inicio, como cualquier otra
                      app.
                    </p>
                  </div>
                )}

                {key === 'glosario' && (
                  <dl className="ayuda__glosario">
                    {GLOSARIO.map((g) => (
                      <div key={g.termino} className="ayuda__glosario-item">
                        <dt>{g.termino}</dt>
                        <dd>{g.definicion}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Ayuda;
