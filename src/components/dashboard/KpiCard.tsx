import React, { useEffect, useRef } from 'react';
import { colors, radius }           from '../../styles/tokens';

interface KpiCardProps {
  label:    string;
  value:    string | number;
  icon:     React.ReactNode;
  sub?:     string;
  trend?:   number;
  accent?:  string;
  animate?: boolean;
}

export function KpiCard({
  label, value, icon, sub, trend,
  accent = colors.primary, animate = true,
}: KpiCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || !cardRef.current) return;
    const el       = cardRef.current;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(16px)';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    });
  }, [animate]);

  const trendColor = trend === undefined ? colors.muted
    : trend > 0 ? '#27ae60'
    : trend < 0 ? '#e74c3c'
    : colors.muted;

  const trendLabel = trend === undefined ? null
    : trend > 0 ? `↑ ${trend} vs hier`
    : trend < 0 ? `↓ ${Math.abs(trend)} vs hier`
    : '→ stable';

  return (
    <div ref={cardRef} style={styles.card}>
      <div style={styles.top}>
        <span style={styles.label}>{label}</span>
        <div style={{ ...styles.iconBox, background: `${accent}15`, color: accent }}>
          {icon}
        </div>
      </div>

      <div style={styles.value}>{value}</div>

      <div style={styles.bottom}>
        {sub && <span style={styles.sub}>{sub}</span>}
        {trendLabel && (
          <span style={{ ...styles.trend, color: trendColor }}>{trendLabel}</span>
        )}
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
  iconBox: {
    width:          32,
    height:         32,
    borderRadius:   radius.sm,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  value: {
    fontSize:      24,
    fontWeight:    800,
    color:         colors.dark,
    letterSpacing: '-0.03em',
    lineHeight:    1,
  },
  bottom: {
    display:    'flex',
    alignItems: 'center',
    gap:        8,
    flexWrap:   'wrap',
  },
  sub: {
    fontSize: 11,
    color:    colors.muted,
    flex:     1,
  },
  trend: {
    fontSize:   11,
    fontWeight: 600,
  },
};