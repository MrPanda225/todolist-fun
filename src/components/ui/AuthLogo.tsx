import React from 'react';
import { CheckSquare } from 'lucide-react';
import { colors } from '../../styles/tokens';

export function AuthLogo() {
  return (
    <div style={styles.logo}>
      <CheckSquare size={32} color={colors.primary} strokeWidth={2.5} />
      <span style={styles.name}>Questly-SY</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
  name: { fontSize: 22, fontWeight: 800, color: colors.dark, letterSpacing: '-0.03em' },
};