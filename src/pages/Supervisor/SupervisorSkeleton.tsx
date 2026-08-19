import Skeleton from '@/components/common/Skeleton/Skeleton';
import './SupervisorSkeleton.css';

const SupervisorSchoolsSkeleton = () => (
  <div className="supervisor-skeleton">
    <div className="supervisor-skeleton__header">
      <Skeleton variant="title" width="200px" />
      <div className="supervisor-skeleton__actions">
        <Skeleton variant="rect" width="120px" height="36px" />
        <Skeleton variant="rect" width="110px" height="36px" />
      </div>
    </div>
    <div className="supervisor-skeleton__summary">
      <Skeleton variant="card" />
      <Skeleton variant="card" />
      <Skeleton variant="card" />
    </div>
    <Skeleton variant="text" width="100px" height="10px" />
    <div className="supervisor-skeleton__grid">
      <Skeleton variant="rect" height="140px" />
      <Skeleton variant="rect" height="140px" />
      <Skeleton variant="rect" height="140px" />
      <Skeleton variant="rect" height="140px" />
    </div>
  </div>
);

const SupervisorDetailSkeleton = () => (
  <div className="supervisor-skeleton">
    <div className="supervisor-skeleton__header">
      <Skeleton variant="rect" width="36px" height="36px" />
      <Skeleton variant="title" width="250px" />
    </div>
    <div className="supervisor-skeleton__tabs">
      <Skeleton variant="rect" width="80px" height="32px" />
      <Skeleton variant="rect" width="90px" height="32px" />
    </div>
    <div className="supervisor-skeleton__grid">
      <Skeleton variant="card" />
      <Skeleton variant="card" />
      <Skeleton variant="card" />
      <Skeleton variant="card" />
    </div>
    <Skeleton variant="text" width="140px" height="10px" />
    <Skeleton variant="rect" height="200px" />
  </div>
);

const SupervisorUsersSkeleton = () => (
  <div className="supervisor-skeleton">
    <div className="supervisor-skeleton__header">
      <Skeleton variant="title" width="180px" />
      <Skeleton variant="rect" width="120px" height="36px" />
    </div>
    <Skeleton variant="rect" height="48px" />
    <Skeleton variant="rect" height="48px" />
    <Skeleton variant="rect" height="48px" />
  </div>
);

export { SupervisorSchoolsSkeleton, SupervisorDetailSkeleton, SupervisorUsersSkeleton };
