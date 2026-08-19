import { ShieldCheck } from 'lucide-react';
import './LoadingScreen.css';

const LoadingScreen = () => (
  <div className="splash">
    <div className="splash__content">
      <div className="splash__logo">
        <ShieldCheck size={56} strokeWidth={1.5} />
      </div>
      <h1 className="splash__title">SIPNAM</h1>
      <p className="splash__subtitle">Sistema Integrado de Partes de Novedades y Asistencias Móvil</p>
      <div className="splash__progress">
        <div className="splash__progress-bar" />
      </div>
    </div>
  </div>
);

export default LoadingScreen;
