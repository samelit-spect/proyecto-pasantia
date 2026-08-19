import './Skeleton.css';

interface SkeletonProps {
  variant?: 'text' | 'title' | 'rect' | 'circle' | 'card';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}: SkeletonProps) => {
  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton skeleton--${variant} ${className}`}
      style={{ width, height }}
    />
  ));

  return <>{items}</>;
};

export default Skeleton;
