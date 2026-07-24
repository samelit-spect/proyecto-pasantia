import { Outlet } from 'react-router-dom';
import './Supervisor.css';

const Supervisor = () => {
  return (
    <section className="supervisor">
      <Outlet />
    </section>
  );
};

export default Supervisor;
