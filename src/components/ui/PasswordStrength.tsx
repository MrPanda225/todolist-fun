interface PasswordStrengthProps {
  password:  string;
  minLength: number;
}

const STRENGTH_LEVELS = [
  { threshold: 4,  color: '#e74c3c', label: 'Faible' },
  { threshold: 8,  color: '#f39c12', label: 'Moyen'  },
  { threshold: 12, color: '#27ae60', label: 'Fort'   },
] as const;

function getStrengthLevel(length: number) {
  return [...STRENGTH_LEVELS].reverse().find(l => length >= l.threshold) ?? null;
}

/** Indicateur visuel de la force du mot de passe. */
export function PasswordStrength({ password, minLength }: PasswordStrengthProps) {
  if (password.length === 0) return null;

  const level  = getStrengthLevel(password.length);
  const isWeak = password.length < minLength;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
      {STRENGTH_LEVELS.map(l => (
        <div
          key={l.label}
          style={{
            height:     3,
            flex:       1,
            borderRadius: 2,
            background: password.length >= l.threshold ? l.color : '#dde3ea',
            transition: 'background 0.3s ease',
          }}
        />
      ))}
      <span style={{ fontSize: 11, color: '#7a8a9a', marginLeft: 4, whiteSpace: 'nowrap' }}>
        {isWeak ? `${minLength - password.length} car. manquants` : level?.label}
      </span>
    </div>
  );
}