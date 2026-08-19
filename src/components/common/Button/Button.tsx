import { useState, useEffect } from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
}

const Button = ({
  variant = 'primary',
  loading = false,
  success = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const classes = [
    'btn',
    `btn--${variant}`,
    loading ? 'btn--loading' : '',
    showSuccess ? 'btn--success' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      <span className="btn__content">
        {showSuccess ? (
          <span className="btn__check">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8.5L6.5 12L13 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : loading ? (
          <span className="btn__spinner" />
        ) : icon ? (
          <span className="btn__icon">{icon}</span>
        ) : null}
        <span className="btn__text">{children}</span>
      </span>
    </button>
  );
};

export default Button;
