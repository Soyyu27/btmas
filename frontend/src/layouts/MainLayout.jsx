import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{ minWidth: 0, height: '100vh', overflow: 'hidden' }}
      >
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div
          className="p-3 p-md-4 flex-grow-1"
          style={{ backgroundColor: 'var(--bg-app)', overflowY: 'auto' }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;