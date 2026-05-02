import React, { useState, useEffect } from 'react';
import { Outlet, useLocation }        from 'react-router-dom';
import { Sidebar }                    from './Sidebar';
import { Header }                     from './Header';
import { colors }                     from '../../styles/tokens';

const SIDEBAR_FULL      = 240;
const SIDEBAR_MINI      = 68;
const MOBILE_BREAKPOINT = 768;

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const location                      = useLocation();

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(false);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarWidth = isMobile
    ? 0
    : isCollapsed ? SIDEBAR_MINI : SIDEBAR_FULL;

  return (
    <div style={styles.root}>
      {/* Overlay mobile */}
      {isMobile && mobileOpen && (
        <div
          style={styles.overlay}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onToggle={() => setIsCollapsed(c => !c)}
      />

      {/* Zone principale — décalée de la largeur de la sidebar */}
      <div style={{
        marginLeft:    sidebarWidth,
        flex:          1,
        display:       'flex',
        flexDirection: 'column',
        minHeight:     '100vh',
        minWidth:      0,
        transition:    'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <Header
          isMobile={isMobile}
          onMobileMenuToggle={() => setMobileOpen(o => !o)}
        />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display:    'flex',
    minHeight:  '100vh',
    background: colors.background,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  overlay: {
    position:       'fixed',
    inset:          0,
    background:     'rgba(13,31,51,0.5)',
    zIndex:         40,
    backdropFilter: 'blur(2px)',
  },
  content: {
    flex:      1,
    padding:   'clamp(12px, 3vw, 28px)',  // réduit sur mobile
    overflowY: 'auto',
  }
};