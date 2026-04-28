import React          from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth }    from '../../hooks/useAuth';
import { colors }     from '../../styles/tokens';

interface HeaderProps {
  isMobile:           boolean;
  onMobileMenuToggle: () => void;
}

export function Header({ isMobile, onMobileMenuToggle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        {isMobile && (
          <button
            onClick={onMobileMenuToggle}
            style={styles.menuBtn}
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} color={colors.dark} />
          </button>
        )}
        <div style={styles.greeting}>
          <span style={styles.greetingText}>
            {getGreeting()}, <strong>{user?.username}</strong> 👋
          </span>
        </div>
      </div>

      <div style={styles.right}>
        <button style={styles.iconBtn} aria-label="Notifications">
          <Bell size={20} color={colors.muted} />
        </button>
        <div style={styles.avatar}>
          {user?.username?.charAt(0).toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    height:          64,
    background:      colors.white,
    borderBottom:    `1px solid ${colors.border}`,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between',
    padding:         '0 24px',
    position:        'sticky',
    top:             0,
    zIndex:          20,
    boxShadow:       '0 1px 3px rgba(13,31,51,0.06)',
  },
  left: {
    display:    'flex',
    alignItems: 'center',
    gap:        12,
  },
  greeting: {
    display: 'flex',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 15,
    color:    colors.muted,
  },
  right: {
    display:    'flex',
    alignItems: 'center',
    gap:        12,
  },
  menuBtn: {
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    padding:    8,
    display:    'flex',
    alignItems: 'center',
    borderRadius: 8,
  },
  iconBtn: {
    background:   'none',
    border:       'none',
    cursor:       'pointer',
    padding:      8,
    display:      'flex',
    alignItems:   'center',
    borderRadius: 8,
    transition:   'background 0.15s',
  },
  avatar: {
    width:           34,
    height:          34,
    borderRadius:    '50%',
    background:      colors.primary,
    color:           'white',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    fontSize:        13,
    fontWeight:      700,
    cursor:          'pointer',
  },
};