import Skeleton from '@/components/common/Skeleton/Skeleton';
import './FotosSkeleton.css';

const FotosSkeleton = () => (
  <div className="fotos-skeleton">
    <Skeleton variant="title" width="240px" />
    <Skeleton variant="text" width="300px" />

    <div className="fotos-skeleton__form">
      <div className="fotos-skeleton__form-row">
        <div className="fotos-skeleton__school">
          <Skeleton variant="text" width="50px" height="10px" />
          <Skeleton variant="text" width="140px" />
        </div>
        <Skeleton variant="rect" height="38px" />
      </div>
      <div className="fotos-skeleton__form-actions">
        <Skeleton variant="rect" height="38px" width="100%" />
        <Skeleton variant="rect" height="38px" width="100px" />
      </div>
    </div>

    <div className="fotos-skeleton__grid">
      <div className="fotos-skeleton__photo">
        <Skeleton variant="rect" height="180px" />
        <div className="fotos-skeleton__photo-meta">
          <Skeleton variant="text" width="100px" height="12px" />
          <Skeleton variant="text" width="60px" height="12px" />
        </div>
      </div>
      <div className="fotos-skeleton__photo">
        <Skeleton variant="rect" height="180px" />
        <div className="fotos-skeleton__photo-meta">
          <Skeleton variant="text" width="110px" height="12px" />
          <Skeleton variant="text" width="60px" height="12px" />
        </div>
      </div>
      <div className="fotos-skeleton__photo">
        <Skeleton variant="rect" height="180px" />
        <div className="fotos-skeleton__photo-meta">
          <Skeleton variant="text" width="90px" height="12px" />
          <Skeleton variant="text" width="60px" height="12px" />
        </div>
      </div>
    </div>
  </div>
);

export default FotosSkeleton;
