import './EmptyState.css';

interface EmptyStateProps {
  icon?: 'clipboard' | 'news' | 'alert' | 'folder' | 'users' | 'camera' | 'school';
  title: string;
  description?: string;
}

const icons = {
  clipboard: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="16"
        y="8"
        width="32"
        height="48"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect
        x="22"
        y="4"
        width="20"
        height="8"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="24"
        y1="24"
        x2="40"
        y2="24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="32"
        x2="36"
        y2="32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="40"
        x2="32"
        y2="40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  news: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="10"
        y="12"
        width="36"
        height="40"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M46 20H52C53.1 20 54 20.9 54 22V48C54 49.1 53.1 50 52 50H18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <line
        x1="18"
        y1="22"
        x2="38"
        y2="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="30"
        x2="34"
        y2="30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="38"
        x2="30"
        y2="38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  alert: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M32 8L56 52H8L32 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="32"
        y1="24"
        x2="32"
        y2="36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="32" cy="44" r="2" fill="currentColor" />
    </svg>
  ),
  folder: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 16C8 13.79 9.79 12 12 12H24L28 18H52C54.21 18 56 19.79 56 22V48C56 50.21 54.21 52 52 52H12C9.79 52 8 50.21 8 48V16Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),
  users: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="20" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        d="M10 48C10 38.06 18.06 32 24 32C29.94 32 38 38.06 38 48"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="42" cy="18" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        d="M42 30C46.42 30 52 33.58 52 40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
  camera: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 20C8 17.79 9.79 16 12 16H20L24 12H40L44 16H52C54.21 16 56 17.79 56 20V48C56 50.21 54.21 52 52 52H12C9.79 52 8 50.21 8 48V20Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="32" cy="34" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="32" cy="34" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  school: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M32 8L4 24V28H60V24L32 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="10" y="30" width="8" height="20" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="28" y="30" width="8" height="20" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="46" y="30" width="8" height="20" stroke="currentColor" strokeWidth="2" fill="none" />
      <line
        x1="4"
        y1="50"
        x2="60"
        y2="50"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="54"
        x2="60"
        y2="54"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const EmptyState = ({ icon = 'folder', title, description }: EmptyStateProps) => (
  <div className="empty-state">
    <div className="empty-state__icon">{icons[icon]}</div>
    <p className="empty-state__title">{title}</p>
    {description && <p className="empty-state__desc">{description}</p>}
  </div>
);

export default EmptyState;
