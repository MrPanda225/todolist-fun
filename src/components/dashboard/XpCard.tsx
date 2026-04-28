import React, { useEffect, useRef } from 'react';
import { colors, radius }           from '../../styles/tokens';

interface XpCardProps {
  xp:        number;
  level:     number;
  nextLevel: { xpToNextLevel: number; progressPct: number } | undefined;
}

export function XpCard({ xp, level, nextLevel }: XpCardProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const pct    = nextLevel?.progressPct ?? 0;

  useEffect(() => {
    if (!barRef.current) return;
    const el       = barRef.current;
    el.style.width = '0%';
    const timer    = setTimeout(() => {
      el.style.transition = 'width 1s cubic-bezier(0.4,0,0.2,1)';
      el.style.width      = `${pct}%`;
    }, 300);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <span style={styles.label}>XP · Niveau</span>
        <div style={{ ...styles.badge, background: `${colors.primary}15`, color: colors.primary }}>
          Niv. {level}
        </div>
      </div>

      <div style={styles.value}>{xp.toLocaleString()} XP</div>

      <div style={styles.barTrack}>
        <div ref={barRef} style={styles.barFill} />
      </div>

      <div style={styles.bottom}>
        <span style={styles.sub}>
          {nextLevel
            ? `${nextLevel.xpToNextLevel} XP pour niveau ${level + 1}`
            : 'Niveau max atteint 🎉'}
        </span>
        <span style={{ ...styles.sub, color: colors.primary, fontWeight: 600 }}>
          {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background:    colors.white,
    borderRadius:  radius.lg,
    padding:       '16px 18px',
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
    boxShadow:     '0 1px 4px rgba(13,31,51,0.07)',
    border:        `1px solid ${colors.border}`,
    flex:          1,
    minWidth:      0,
  },
  top: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize:      11,
    fontWeight:    600,
    color:         colors.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  badge: {
    padding:      '3px 10px',
    borderRadius: 20,
    fontSize:     12,
    fontWeight:   700,
  },
  value: {
    fontSize:      24,
    fontWeight:    800,
    color:         colors.dark,
    letterSpacing: '-0.03em',
    lineHeight:    1,
  },
  barTrack: {
    height:       6,
    borderRadius: 3,
    background:   colors.border,
    overflow:     'hidden',
  },
  barFill: {
    height:       '100%',
    borderRadius: 3,
    background:   `linear-gradient(90deg, ${colors.primary}, #63ADFF)`,
    width:        '0%',
  },
  bottom: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  sub: {
    fontSize: 11,
    color:    colors.muted,
  },
};