import React from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { colors, radius, spacing } from '../../styles/tokens';

interface AuthFieldProps {
  id:           string;
  label:        string;
  type:         string;
  value:        string;
  placeholder:  string;
  onChange:     (value: string) => void;
  autoComplete?: string;
  required?:    boolean;
  icon?:        React.ReactNode;
  rightSlot?:   React.ReactNode;
}

export function AuthField({
  id, label, type, value, placeholder,
  onChange, autoComplete, required = false,
  icon, rightSlot,
}: AuthFieldProps) {
  return (
    <div style={styles.group}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <div style={styles.wrapper}>
        {icon && <div style={styles.iconSlot}>{icon}</div>}
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          onChange={e => onChange(e.target.value)}
          style={{
            ...styles.input,
            paddingLeft:  icon      ? 44 : spacing.md,
            paddingRight: rightSlot ? 48 : spacing.md,
          }}
        />
        {rightSlot && <div style={styles.rightSlot}>{rightSlot}</div>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  group:    { display: 'flex', flexDirection: 'column', gap: 6 },
  label:    { fontSize: 13, fontWeight: 600, color: colors.dark, letterSpacing: '0.01em' },
  wrapper:  { position: 'relative', display: 'flex', alignItems: 'center' },
  iconSlot: {
    position: 'absolute', left: 14, top: '50%',
    transform: 'translateY(-50%)', pointerEvents: 'none',
    display: 'flex', alignItems: 'center', color: colors.primary,
  },
  input: {
    width: '100%', padding: '13px 14px',
    border: `1.5px solid ${colors.border}`,
    borderRadius: radius.md, fontSize: 15, color: colors.dark,
    background: colors.white, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  },
  rightSlot: {
    position: 'absolute', right: 12, top: '50%',
    transform: 'translateY(-50%)', display: 'flex', alignItems: 'center',
  },
};

export { Mail, Lock, User };