import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/custom/useOnlineStatus';
import './ConnectionBanner.css';

const ConnectionBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="connection-banner" role="status">
      <WifiOff size={16} strokeWidth={1.5} />
      Sin conexión — Los cambios se guardarán y sincronizarán cuando haya internet.
    </div>
  );
};

export default ConnectionBanner;
