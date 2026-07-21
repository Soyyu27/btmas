import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const roleLabel = {
  admin: 'Administrator',
  cabang: 'Cabang',
  auditor: 'Auditor',
};

const Topbar = ({ onToggleSidebar }) => {
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
      className="d-flex align-items-center justify-content-between px-3 px-md-4"
      style={{
        height: '60px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #E2E5EB',
      }}
    >
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-sm border-0 p-1 d-lg-none"
          onClick={onToggleSidebar}
          style={{ color: 'var(--navy-950)' }}
          aria-label="Toggle Menu"
        >
          <i className="bi bi-list" style={{ fontSize: '24px' }} />
        </button>
        <div className="d-none d-sm-block" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {today}
        </div>
        <div className="d-sm-none fw-bold" style={{ fontSize: '15px', color: 'var(--navy-950)' }}>
          BTMS
        </div>
      </div>

      <div className="dropdown">
        <button
          className="btn d-flex align-items-center gap-2 gap-md-3 border-0 p-1 p-md-2"
          data-bs-toggle="dropdown"
          style={{ backgroundColor: 'transparent' }}
        >
          <div className="text-end d-none d-sm-block">
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-dark)' }}>
              {user?.full_name || user?.username}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {roleLabel[user?.role] || user?.role} {user?.role === 'cabang' && user?.kode_cabang ? `(${user.kode_cabang})` : ''}
            </div>
          </div>
          <div
            className="d-none d-sm-block"
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