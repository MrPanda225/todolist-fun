import React from 'react';
import { Loader2 } from 'lucide-react';
import { colors, radius } from '../../styles/tokens';

interface AuthButtonProps {
  label:     string;
  isLoading: boolean;
  disabled?: boolean;
}

export function AuthButton({ label, isLoading, disabled = false }: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      style={{ ...styles.button, opacity: isLoading || disabled ? 0.7 : 1 }}
    >
      {isLoading
        ? <Loader2 size={20} color="white" style={{ animation: 'spin 1s linear infinite' }} />
        : label}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    width: '100%', padding: '14px', background: colors.primary,
    color: colors.white, border: 'none', borderRadius: radius.md,
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 50, letterSpacing: '0.01em', marginTop: 4, fontFamily: 'inherit',
  },
};