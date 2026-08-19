import Skeleton from '@/components/common/Skeleton/Skeleton';
import './HomeSkeleton.css';

const HomeSkeleton = ({ isSupervisor }: { isSupervisor: boolean }) => (
  <div className="home-skeleton">
    <div className="home-skeleton__header">
      <div className="home-skeleton__header-text">
        <Skeleton variant="title" width="220px" />
        <Skeleton variant="text" width="160px" />
      </div>
      <Skeleton variant="text" width="70px" height="22px" />
    </div>

    {isSupervisor ? (
      <>
        <div className="home-skeleton__section">
          <Skeleton variant="text" width="100px" height="10px" />
          <div className="home-skeleton__stats">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        </div>
        <div className="home-skeleton__section">
          <Skeleton variant="text" width="120px" height="10px" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
        <div className="home-skeleton__section">
          <Skeleton variant="text" width="110px" height="10px" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </>
    ) : (
      <>
        <div className="home-skeleton__section">
          <Skeleton variant="text" width="80px" height="10px" />
          <Skeleton variant="card" />
        </div>
        <div className="home-skeleton__section">
          <Skeleton variant="text" width="130px" height="10px" />
          <div className="home-skeleton__activity">
            <Skeleton variant="rect" height="44px" />
            <Skeleton variant="rect" height="44px" />
          </div>
        </div>
        <div className="home-skeleton__section">
          <Skeleton variant="text" width="90px" height="10px" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </>
    )}
  </div>
);

export default HomeSkeleton;
