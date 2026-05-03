import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getDriverSession, driverLogout } from '../store/reviewsStore';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/driver/overview', icon: 'grid_view',   label: 'Overview'    },
  { to: '/driver/reviews',  icon: 'rate_review', label: 'My Reviews'  },
  { to: '/driver/qrcode',   icon: 'qr_code_2',   label: 'My QR Code'  },
  { to: '/driver/help',     icon: 'help_outline', label: 'Help'        },
];

export default function DriverLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [session, setSession] = useState(() => getDriverSession());
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/signin');
    }
  }, [session, navigate]);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  function handleSignOut() {
    driverLogout();
    navigate('/signin');
  }

  function handleToggle() {
    if (window.innerWidth <= 900) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => !c);
    }
  }

  if (!session) return null;

  const sidebarClass = [
    styles.sidebar,
    collapsed    ? styles.sidebarCollapsed : '',
    mobileOpen   ? styles.sidebarMobileOpen : '',
  ].filter(Boolean).join(' ');

  const contentClass = [
    styles.contentArea,
    collapsed ? styles.contentAreaCollapsed : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={sidebarClass}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <span className="material-icons-round" style={{ fontSize: 20, color: '#2563EB' }}>
              directions_car
            </span>
          </div>
          {!collapsed && (
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>Revanta</span>
              <span className={styles.brandSub}>{session.corporationName}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Driver navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-icons-outlined">{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className={styles.sidebarBottom}>
          <button
            className={styles.bottomItem}
            onClick={toggleTheme}
            title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            <span className="material-icons-outlined">
              {theme === 'dark' ? 'wb_sunny' : 'dark_mode'}
            </span>
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <button
            className={styles.bottomItem}
            onClick={handleSignOut}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <span className="material-icons-outlined">logout</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Content area ─────────────────────────────────── */}
      <div className={contentClass}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <button
            className={styles.collapseBtn}
            onClick={handleToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-icons-round" style={{ fontSize: 20 }}>
              {collapsed ? 'menu_open' : 'menu'}
            </span>
          </button>

          {/* User info */}
          <div 
            className={styles.topbarUser} 
            onClick={(e) => { 
              e.stopPropagation(); 
              setDropdownOpen((o) => !o); 
            }}
          >
            <div className={styles.userAvatar}>
              <span className="material-icons-round" style={{ fontSize: 20, color: '#2563EB' }}>
                account_circle
              </span>
            </div>
            <span className={styles.userName}>{session.name}</span>
            <span className="material-icons-outlined" style={{ fontSize: 16, color: 'var(--color-text-muted)' }}>
              expand_more
            </span>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownName}>{session.name}</div>
                  <div className={styles.dropdownRole}>Driver · {session.driverId}</div>
                </div>
                <div className={styles.dropdownDivider} />
                <button className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); toggleTheme(); }}>
                  <span className="material-icons-outlined">{theme === 'dark' ? 'wb_sunny' : 'dark_mode'}</span>
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <div className={styles.dropdownDivider} />
                <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleSignOut}>
                  <span className="material-icons-outlined">logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
