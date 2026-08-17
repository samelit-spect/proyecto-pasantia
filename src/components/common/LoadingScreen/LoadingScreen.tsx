import './LoadingScreen.css';

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-screen__spinner" />
    <span className="loading-screen__text">Cargando...</span>
  </div>
);

export default LoadingScreen;
