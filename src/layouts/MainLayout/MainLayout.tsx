import { Outlet } from 'react-router-dom';
import Navbar from '@/components/common/Navbar/Navbar';

const MainLayout = () => {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
