import { Component, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <h1 className="error-boundary__title">Algo salió mal</h1>
            <p className="error-boundary__message">
              Ocurrió un error inesperado. Podés intentar recargar la página.
            </p>
            {this.state.error && (
              <p className="error-boundary__detail">{this.state.error.message}</p>
            )}
            <div className="error-boundary__actions">
              <button
                className="error-boundary__btn"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </button>
              <button
                className="error-boundary__btn error-boundary__btn--secondary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
              >
                <ArrowLeft size={16} strokeWidth={1.5} />
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
