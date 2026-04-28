const STATS = [
  { value: '14',  label: 'tâches complétées' },
  { value: '7🔥', label: 'jours de streak'   },
] as const;

/** Statistiques affichées dans le panneau gauche de Login. */
export function LoginStats() {
  return (
    <>
      {STATS.map((stat, index) => (
        <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {index > 0 && (
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.2)' }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ color: 'white', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
              {stat.value}
            </span>
            <span style={{
              color:         'rgba(255,255,255,0.7)',
              fontSize:      11,
              fontWeight:    500,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {stat.label}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}