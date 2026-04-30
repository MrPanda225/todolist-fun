import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate }                from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar,
  Trophy, ChevronLeft, ChevronRight, User,
} from 'lucide-react';
import { useAuth }  from '../../hooks/useAuth';
import { colors }   from '../../styles/tokens';

const SIDEBAR_FULL = 240;
const SIDEBAR_MINI = 68;

interface NavItem {
  path:  string;
  label: string;
  icon:  React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',    label: 'Dashboard',  icon: <LayoutDashboard size={20} /> },
  { path: '/tasks',        label: 'Tâches',     icon: <CheckSquare     size={20} /> },
  { path: '/calendar',     label: 'Calendrier', icon: <Calendar        size={20} /> },
  { path: '/gamification', label: 'Progression',icon: <Trophy          size={20} /> },
];

interface SidebarProps {
  isCollapsed: boolean;
  isMobile:    boolean;
  mobileOpen:  boolean;
  onToggle:    () => void;
}

export function Sidebar({ isCollapsed, isMobile, mobileOpen, onToggle }: SidebarProps) {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const labelsRef   = useRef<(HTMLSpanElement | null)[]>([]);
  const logoTextRef = useRef<HTMLSpanElement>(null);
  const [toggleHovered, setToggleHovered] = useState(false);

  useEffect(() => {
    if (isMobile) return;
    const labels = labelsRef.current.filter(Boolean) as HTMLSpanElement[];
    if (isCollapsed) {
      labels.forEach(el => {
        el.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
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

  const translateX = isMobile ? (mobileOpen ? '0' : '-100%') : '0';

  return (
    <div style={{
      ...styles.sidebar,
      width:      isMobile ? SIDEBAR_FULL : isCollapsed ? SIDEBAR_MINI : SIDEBAR_FULL,
      transform:  `translateX(${translateX})`,
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      position:   'fixed',
      zIndex:     isMobile ? 50 : 30,
    }}>

      {/* ── Logo + Toggle ── */}
      <div style={styles.logoRow}>
        <div style={styles.logoIcon}>
          <CheckSquare size={22} color={colors.primary} strokeWidth={2.5} />
        </div>
        <span
          ref={logoTextRef}
          style={{
            ...styles.logoText,
            display: isCollapsed && !isMobile ? 'none' : 'block',
          }}
        >
          Questly
        </span>

        {/* Bouton toggle — visible et bien contrasté */}
        {!isMobile && (
          <button
            onClick={onToggle}
            onMouseEnter={() => setToggleHovered(true)}
            onMouseLeave={() => setToggleHovered(false)}
            style={{
              ...styles.toggleBtn,
              background: toggleHovered ? colors.primary : 'rgba(255,255,255,0.12)',
              borderColor: toggleHovered ? colors.primary : 'rgba(255,255,255,0.15)',
              transform: `translateY(-50%) ${toggleHovered ? 'scale(1.1)' : 'scale(1)'}`,
            }}
            aria-label="Réduire la sidebar"
            title={isCollapsed ? 'Agrandir' : 'Réduire'}
          >
            {isCollapsed
              ? <ChevronRight size={14} color="white" strokeWidth={2.5} />
              : <ChevronLeft  size={14} color="white" strokeWidth={2.5} />}
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
              background:     isActive ? `${colors.primary}22` : 'transparent',
              justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{
                  color:     isActive ? colors.primary : 'rgba(255,255,255,0.45)',
                  flexShrink: 0,
                  transition: 'color 0.15s',
                }}>
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

      {/* ── Footer profil ── */}
      <div style={styles.footer}>
        <button
          onClick={() => navigate('/profile')}
          style={{
            ...styles.profileBtn,
            justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
          }}
          aria-label="Mon profil"
          title="Mon profil"
        >
          <div style={styles.avatar}>
            {user?.username?.charAt(0).toUpperCase() ?? 'U'}
          </div>

          {(!isCollapsed || isMobile) && (
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user?.username}</span>
              <span style={styles.userEmail}>{user?.email}</span>
            </div>
          )}

          {(!isCollapsed || isMobile) && (
            <User size={14} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }} />
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
    height:        '100dvh',
    background:    colors.dark,
    display:       'flex',
    flexDirection: 'column',
    overflowX:     'hidden',
    overflowY:     'auto',
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
    width:          28,
    height:         28,
    borderRadius:   '50%',
    border:         '1.5px solid',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    cursor:         'pointer',
    zIndex:         100,
    padding:        0,
    transition:     'background 0.2s, border-color 0.2s, transform 0.2s',
    boxShadow:      '0 2px 8px rgba(0,0,0,0.3)',
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
    transition:     'background 0.15s ease',
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
    transition: 'color 0.15s',
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
    padding:       '8px',
    paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
    borderTop:     '1px solid rgba(255,255,255,0.06)',
    flexShrink:    0,
  },
  profileBtn: {
    display:      'flex',
    alignItems:   'center',
    gap:          10,
    padding:      '8px 12px',
    background:   'none',
    border:       'none',
    borderRadius: 10,
    cursor:       'pointer',
    width:        '100%',
    transition:   'background 0.15s',
    minHeight:    44,
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
    textAlign:     'left',
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
};