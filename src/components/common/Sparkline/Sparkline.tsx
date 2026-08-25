import './Sparkline.css';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

const Sparkline = ({ data, color = 'var(--primary-light)', height = 32, width = 80 }: SparklineProps) => {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 2;

  const points = data
    .map((value, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2);
  const lastY = height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2);

  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline
        className="sparkline__line"
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        className="sparkline__dot"
        cx={lastX}
        cy={lastY}
        r="3"
        fill={color}
      />
    </svg>
  );
};

export default Sparkline;
