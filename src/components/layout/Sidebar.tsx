import React, { useEffect, useRef }  from 'react';
import { NavLink, useNavigate }      from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar,
  Trophy, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import { useAuth }   from '../../hooks/useAuth';
import { colors }    from '../../styles/tokens';

const SIDEBAR_FULL = 240;
const SIDEBAR_MINI = 68;

interface NavItem {
  path:  string;
  label: string;
  icon:  React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',    label: 'Dashboard',  icon: <LayoutDashboard size={20} /> },
  { path: '/tasks',        label: 'Tâches',      icon: <CheckSquare     size={20} /> },
  { path: '/calendar',     label: 'Calendrier',  icon: <Calendar        size={20} /> },
  { path: '/gamification', label: 'Progression', icon: <Trophy          size={20} /> },
];

interface SidebarProps {
  isCollapsed: boolean;
  isMobile:    boolean;
  mobileOpen:  boolean;
  onToggle:    () => void;
}

export function Sidebar({ isCollapsed, isMobile, mobileOpen, onToggle }: SidebarProps) {
  const { logout, user } = useAuth();
  const navigate         = useNavigate();
  const labelsRef        = useRef<(HTMLSpanElement | null)[]>([]);
  const logoTextRef      = useRef<HTMLSpanElement>(null);

  // Animation CSS pure — plus fiable que animejs v3 avec Vite
  useEffect(() => {
    if (isMobile) return;

    const labels = labelsRef.current.filter(Boolean) as HTMLSpanElement[];

    if (isCollapsed) {
      labels.forEach((el) => {
        el.style.transition = `opacity 0.15s ease, transform 0.15s ease`;
        el.style.opacity    = '0';
        el.style.transform  = 'translateX(-10px)';
      });
      if (logoTextRef.current) {
        logoTextRef.current.style.transition = 'opacity 0.15s ease';
        logoTextRef.current.style.opacity    = '0';
      }
    } else {
      labels.forEach((el, i) => {
        el.style.transition = `opacity 0.25s ease ${120 + i * 40}ms, transform 0.25s ease ${120 + i * 40}ms`;
        el.style.opacity    = '1';
        el.style.transform  = 'translateX(0)';
      });
      if (logoTextRef.current) {
        logoTextRef.current.style.transition = 'opacity 0.25s ease 100ms';
        logoTextRef.current.style.opacity    = '1';
      }
    }
  }, [isCollapsed, isMobile]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const translateX = isMobile
    ? mobileOpen ? '0' : '-100%'
    : '0';

  return (
    <div style={{
      ...styles.sidebar,
      width:     isMobile ? SIDEBAR_FULL : isCollapsed ? SIDEBAR_MINI : SIDEBAR_FULL,
      transform: `translateX(${translateX})`,
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      position:  'fixed',
      zIndex:    isMobile ? 50 : 30,
    }}>

      {/* ── Logo ── */}
      <div style={styles.logoRow}>
        <div style={styles.logoIcon}>
          <CheckSquare size={22} color={colors.primary} strokeWidth={2.5} />
        </div>

        <span
          ref={logoTextRef}
          style={{
            ...styles.logoText,
            display:  isCollapsed && !isMobile ? 'none' : 'block',
          }}
        >
          Questly
        </span>

        {!isMobile && (
          <button onClick={onToggle} style={styles.toggleBtn} aria-label="Toggle sidebar">
            {isCollapsed
              ? <ChevronRight size={16} color={colors.muted} />
              : <ChevronLeft  size={16} color={colors.muted} />}
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              background:     isActive ? `${colors.primary}18` : 'transparent',
              color:          isActive ? colors.primary : colors.muted,
              justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ color: isActive ? colors.primary : 'rgba(255,255,255,0.45)', flexShrink: 0 }}>
                  {item.icon}
                </span>

                <span
                  ref={el => { labelsRef.current[index] = el; }}
                  style={{
                    ...styles.navLabel,
                    display: isCollapsed && !isMobile ? 'none' : 'block',
                    color:   isActive ? colors.primary : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {item.label}
                </span>

                {isActive && !isCollapsed && (
                  <div style={styles.activeIndicator} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div style={styles.footer}>
        {(!isCollapsed || isMobile) && (
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user?.username?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user?.username}</span>
              <span style={styles.userEmail}>{user?.email}</span>
            </div>
          </div>
        )}

        {isCollapsed && !isMobile && (
          <div style={{ ...styles.avatar, margin: '0 auto 8px' }}>
            {user?.username?.charAt(0).toUpperCase() ?? 'U'}
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            ...styles.logoutBtn,
            justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
          }}
          aria-label="Se déconnecter"
        >
          <LogOut size={18} />
          {(!isCollapsed || isMobile) && (
            <span>Se déconnecter</span>
          )}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
    sidebar: {
    top:           0,
    left:          0,
    height:        '100dvh', // dynamic viewport height pour mobile
    background:    colors.dark,
    display:       'flex',
    flexDirection: 'column',
    overflowX:     'hidden',
    overflowY:     'auto',   // scroll si contenu trop long
    },
  logoRow: {
    display:      'flex',
    alignItems:   'center',
    gap:          10,
    padding:      '0 16px',
    height:       64,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    position:     'relative',
    flexShrink:   0,
  },
  logoIcon: {
    width:          36,
    height:         36,
    borderRadius:   10,
    background:     `${colors.primary}25`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  logoText: {
    fontSize:      18,
    fontWeight:    800,
    color:         'white',
    letterSpacing: '-0.03em',
    flex:          1,
    whiteSpace:    'nowrap',
  },
  toggleBtn: {
    position:       'absolute',
    right:          -12,
    top:            '50%',
    transform:      'translateY(-50%)',
    width:          24,
    height:         24,
    borderRadius:   '50%',
    background:     colors.background,
    border:         `1px solid ${colors.border}`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    cursor:         'pointer',
    zIndex:         10,
    boxShadow:      '0 2px 8px rgba(0,0,0,0.15)',
    padding:        0,
  },
  nav: {
    flex:          1,
    padding:       '12px 8px',
    display:       'flex',
    flexDirection: 'column',
    gap:           2,
  },
  navItem: {
    display:        'flex',
    alignItems:     'center',
    gap:            12,
    padding:        '10px 12px',
    borderRadius:   10,
    textDecoration: 'none',
    fontWeight:     500,
    fontSize:       14,
    transition:     'background 0.15s ease, color 0.15s ease',
    position:       'relative',
    cursor:         'pointer',
    whiteSpace:     'nowrap',
    overflow:       'hidden',
    minHeight:      44,
  },
  navLabel: {
    flex:       1,
    whiteSpace: 'nowrap',
    fontWeight: 500,
    fontSize:   14,
  },
  activeIndicator: {
    position:     'absolute',
    right:        10,
    width:        6,
    height:       6,
    borderRadius: '50%',
    background:   colors.primary,
  },
  footer: {
    padding:       '12px 8px',
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
    borderTop:     '1px solid rgba(255,255,255,0.06)',
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
    flexShrink:    0,  // ← ne rétrécit jamais
  },
  userInfo: {
    display:    'flex',
    alignItems: 'center',
    gap:        10,
    padding:    '8px 12px',
  },
  avatar: {
    width:          32,
    height:         32,
    borderRadius:   '50%',
    background:     colors.primary,
    color:          'white',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       13,
    fontWeight:     700,
    flexShrink:     0,
  },
  userDetails: {
    display:       'flex',
    flexDirection: 'column',
    gap:           1,
    overflow:      'hidden',
    flex:          1,
  },
  userName: {
    fontSize:     13,
    fontWeight:   600,
    color:        'white',
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize:     11,
    color:        'rgba(255,255,255,0.35)',
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    display:      'flex',
    alignItems:   'center',
    gap:          10,
    padding:      '9px 12px',
    background:   'none',
    border:       'none',
    borderRadius: 10,
    color:        'rgba(255,255,255,0.4)',
    cursor:       'pointer',
    width:        '100%',
    fontSize:     13,
    fontWeight:   500,
    fontFamily:   'inherit',
    transition:   'background 0.15s, color 0.15s',
  },
};