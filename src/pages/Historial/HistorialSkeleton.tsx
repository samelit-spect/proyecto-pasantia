import Skeleton from '@/components/common/Skeleton/Skeleton';
import './HistorialSkeleton.css';

const HistorialSkeleton = () => (
  <div className="historial-skeleton">
    <Skeleton variant="rect" width="80px" height="32px" />
    <Skeleton variant="title" width="200px" />
    <Skeleton variant="text" width="300px" />
    <div className="historial-skeleton__filters">
      <Skeleton variant="rect" width="140px" height="36px" />
      <Skeleton variant="rect" width="140px" height="36px" />
      <Skeleton variant="rect" width="120px" height="36px" />
      <Skeleton variant="rect" width="120px" height="36px" />
    </div>
    <Skeleton variant="rect" height="48px" />
    <Skeleton variant="rect" height="48px" />
    <Skeleton variant="rect" height="48px" />
    <Skeleton variant="rect" height="48px" />
  </div>
);

export default HistorialSkeleton;
