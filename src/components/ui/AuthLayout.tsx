import React from 'react';
import { colors } from '../../styles/tokens';

interface AuthLayoutProps {
  /** Contenu illustratif côté gauche */
  left:  React.ReactNode;
  /** Formulaire côté droit */
  right: React.ReactNode;
}

/** Layout split-screen partagé par toutes les pages d'authentification. */
export function AuthLayout({ left, right }: AuthLayoutProps) {
  return (
    <div style={styles.page}>
      <div style={styles.left}>{left}</div>
      <div style={styles.right}>{right}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:  { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", background: colors.background },
  left:  { flex: '0 0 45%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
};