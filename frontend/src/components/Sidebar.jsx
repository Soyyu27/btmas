import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuConfig } from '../config/menuConfig';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div
      className="d-flex flex-column vh-100 flex-shrink-0"
      style={{
        width: '272px',
        backgroundColor: 'var(--navy-950)',
        borderRight: '1px solid var(--navy-border)',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--navy-border)' }}>
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--gold)',
            fontWeight: 600,
            marginBottom: '4px',
          }}
        >
          BANK RIAU KEPRI
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-light)', lineHeight: 1.2 }}>
          BTMAS
        </div>
      </div>

      {/* Menu groups */}
      <div className="flex-grow-1 px-3 py-3">
        {menuConfig.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(user?.role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.group} className="mb-4">
              <div
                className="px-2 mb-2"
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  letterSpacing: '1.5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                {group.group}
              </div>
              <ul className="nav nav-pills flex-column gap-1">
                {visibleItems.map((item) => (
                  <li className="nav-item" key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `sidebar-link d-flex align-items-center gap-2${isActive ? ' sidebar-link-active' : ''}`
                      }
                    >
                      {item.icon && <i className={`bi ${item.icon}`} style={{ fontSize: '14px', opacity: 0.85 }} />}
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer kecil */}
      <div
        className="px-4 py-3"
        style={{
          borderTop: '1px solid var(--navy-border)',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        BTMS v1.0
      </div>
    </div>
  );
};

export default Sidebar;