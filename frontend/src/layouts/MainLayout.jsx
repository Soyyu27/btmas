import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const MainLayout = () => {
  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{ minWidth: 0, height: '100vh', overflow: 'hidden' }}
      >
        <Topbar />
        <div
          className="p-4 flex-grow-1"
          style={{ backgroundColor: 'var(--bg-app)', overflowY: 'auto' }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;