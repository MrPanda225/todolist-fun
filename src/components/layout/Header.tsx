import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, LogOut }            from 'lucide-react';
import { useAuth }                             from '../../hooks/useAuth';
import { useNavigate }                         from 'react-router-dom';
import { useQueryClient }                      from '@tanstack/react-query';
import { colors }                              from '../../styles/tokens';

interface HeaderProps {
  isMobile:           boolean;
  onMobileMenuToggle: () => void;
}

export function Header({ isMobile, onMobileMenuToggle }: HeaderProps) {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const queryClient         = useQueryClient();
  const [open, setOpen]     = useState(false);
  const dropdownRef         = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await logout();          // vide token + store Zustand + cookie serveur
    queryClient.clear();     // vide tout le cache TanStack Query
    navigate('/login');
  }

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        {isMobile && (
          <button onClick={onMobileMenuToggle} style={styles.iconBtn} aria-label="Ouvrir le menu">
            <Menu size={22} color={colors.dark} />
          </button>
        )}
        <span style={styles.greetingText}>
          {getGreeting()}, <strong>{user?.username}</strong> 👋
        </span>
      </div>

      <div style={styles.right}>
        <button style={styles.iconBtn} aria-label="Notifications">
          <Bell size={20} color={colors.muted} />
        </button>

        {/* Avatar + dropdown */}
        <div ref={dropdownRef} style={styles.avatarWrapper}>
          <button
            style={styles.avatar}
            onClick={() => setOpen(v => !v)}
            aria-label="Menu utilisateur"
            aria-expanded={open}
          >
            {user?.username?.charAt(0).toUpperCase() ?? 'U'}
          </button>

          {open && (
            <div style={styles.dropdown}>
              {/* Infos user */}
              <div style={styles.dropdownHeader}>
                <div style={styles.dropdownAvatar}>
                  {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div>
                  <div style={styles.dropdownName}>{user?.username}</div>
                  <div style={styles.dropdownEmail}>{user?.email}</div>
                </div>
              </div>

              <div style={styles.divider} />

              <button
                style={styles.dropdownItem}
                onClick={() => { setOpen(false); navigate('/profile'); }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.background)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <User size={15} color={colors.muted} />
                Mon profil
              </button>

              <div style={styles.divider} />

              <button
                style={{ ...styles.dropdownItem, color: '#e74c3c' }}
                onClick={handleLogout}
                onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={15} color="#e74c3c" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    height:         64,
    background:     colors.white,
    borderBottom:   `1px solid ${colors.border}`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '0 24px',
    position:       'sticky',
    top:            0,
    zIndex:         20,
    boxShadow:      '0 1px 3px rgba(13,31,51,0.06)',
  },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  greetingText: { fontSize: 15, color: colors.muted },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 8, display: 'flex', alignItems: 'center', borderRadius: 8,
  },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: colors.primary, color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    border: 'none',
  },
  dropdown: {
    position:     'absolute',
    top:          'calc(100% + 10px)',
    right:        0,
    width:        220,
    background:   colors.white,
    borderRadius: 12,
    border:       `1px solid ${colors.border}`,
    boxShadow:    '0 8px 24px rgba(13,31,51,0.12)',
    overflow:     'hidden',
    zIndex:       100,
  },
  dropdownHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 16px',
  },
  dropdownAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: colors.primary, color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, flexShrink: 0,
  },
  dropdownName:  { fontSize: 13, fontWeight: 600, color: colors.dark },
  dropdownEmail: { fontSize: 11, color: colors.muted, marginTop: 1 },
  divider:       { height: 1, background: colors.border },
  dropdownItem: {
    width: '100%', background: 'transparent', border: 'none',
    cursor: 'pointer', padding: '10px 16px',
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 13, color: colors.dark, textAlign: 'left',
    transition: 'background 0.1s',
  },
};