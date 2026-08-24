import { useAmbientMotion } from '@/hooks/useAmbientMotion';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const enabled = useAmbientMotion();

  if (!enabled) return null;

  return (
    <div className="animated-bg" aria-hidden="true">
      <span className="animated-bg__orb animated-bg__orb--1" />
      <span className="animated-bg__orb animated-bg__orb--2" />
      <span className="animated-bg__orb animated-bg__orb--3" />
    </div>
  );
};

export default AnimatedBackground;
