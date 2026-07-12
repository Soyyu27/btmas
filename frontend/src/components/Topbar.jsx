import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const roleLabel = {
  admin: 'Administrator',
  cabang: 'Cabang',
  auditor: 'Auditor',
};

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <nav
      className="d-flex align-items-center justify-content-between px-4"
      style={{
        height: '60px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #E2E5EB',
      }}
    >
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{today}</div>

      <div className="dropdown">
        <button
          className="btn d-flex align-items-center gap-3 border-0"
          data-bs-toggle="dropdown"
          style={{ backgroundColor: 'transparent' }}
        >
          <div className="text-end">
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-dark)' }}>
              {user?.full_name || user?.username}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {roleLabel[user?.role] || user?.role}
            </div>
          </div>
          <div
            style={{
              width: '1px',
              height: '28px',
              backgroundColor: '#E2E5EB',
            }}
          />
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--navy-950)',
              color: 'var(--gold)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            {(user?.full_name || user?.username || '?').charAt(0).toUpperCase()}
          </div>
        </button>
        <ul className="dropdown-menu dropdown-menu-end shadow-sm mt-2">
          <li><a className="dropdown-item" href="/profil">Profil</a></li>
          <li><a className="dropdown-item" href="/pengaturan">Pengaturan</a></li>
          <li><hr className="dropdown-divider" /></li>
          <li><button className="dropdown-item text-danger" onClick={handleLogout}>Keluar</button></li>
        </ul>
      </div>
    </nav>
  );
};

export default Topbar;