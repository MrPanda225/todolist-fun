import { createContext, useEffect } from 'react';
import type { ReactNode }           from 'react';
import { authService }              from '../services/auth.service';
import { useAuthStore }             from '../store/auth.store';

const AuthContext = createContext<null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isRestoring = useAuthStore(s => s.isRestoring);

  useEffect(() => {
    authService.tryRestoreSession();
  }, []);

  if (isRestoring) {
    return (
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        height:         '100vh',
        background:     '#F5F5F5',
        color:          '#0D1F33',
        fontSize:       '1rem',
        fontFamily:     'Inter, system-ui, sans-serif',
        letterSpacing:  '0.05em',
      }}>
        Chargement...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={null}>
      {children}
    </AuthContext.Provider>
  );
}