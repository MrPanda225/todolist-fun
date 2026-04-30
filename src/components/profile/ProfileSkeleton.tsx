import React              from 'react';
import { Skeleton }       from '../ui/Skeleton';

const COLOR = {
  surface: '#F8FAFC',
  border:  '#E2E8F0',
  dark:    '#0D1F33',
};

export function ProfileSkeleton() {
  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton width={120} height={24} radius={6} />
          <Skeleton width={180} height={13} radius={4} />
        </div>
      </div>

      <div style={styles.grid}>

        {/* ── Colonne gauche ── */}
        <div style={styles.leftCol}>

          {/* Hero card */}
          <div style={{ ...styles.card, background: COLOR.dark, padding: 24 }}>
            <div style={styles.heroTop}>
              {/* Avatar */}
              <div style={{
                width:        88,
                height:       88,
                borderRadius: '50%',
                background:   'rgba(255,255,255,0.08)',
                flexShrink:   0,
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <Skeleton width={120} height={16} radius={6}  style={{ background: 'rgba(255,255,255,0.12)' }} />
                <Skeleton width={80}  height={12} radius={4}  style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>
            </div>

            {/* Stat pills */}
            <div style={styles.statRow}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} width={70} height={26} radius={999}
                  style={{ background: 'rgba(255,255,255,0.10)' }} />
              ))}
            </div>
          </div>

          {/* Meta card */}
          <div style={{ ...styles.card, padding: '12px 16px', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
              <Skeleton width={14} height={14} radius={4} />
              <Skeleton width={160} height={12} radius={4} />
            </div>
            <div style={{ height: 1, background: COLOR.border }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
              <Skeleton width={14} height={14} radius={4} />
              <Skeleton width={140} height={12} radius={4} />
            </div>
          </div>
        </div>

        {/* ── Colonne droite ── */}
        <div style={{ ...styles.card, padding: 'clamp(16px, 3vw, 28px)' }}>

          {/* Form header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Skeleton width={110} height={16} radius={6} />
            <Skeleton width={80}  height={32} radius={10} />
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Prénom + Nom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <Skeleton width={50}   height={10} radius={4} />
                  <Skeleton width="100%" height={40} radius={10} />
                </div>
              ))}
            </div>

            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Skeleton width={110}  height={10} radius={4} />
              <Skeleton width="100%" height={40} radius={10} />
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Skeleton width={40}   height={10} radius={4} />
              <Skeleton width="100%" height={40} radius={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding:    'clamp(16px, 4vw, 40px)',
    maxWidth:   900,
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  },
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   24,
  },
  grid: {
    display:             'grid',
    gridTemplateColumns: 'minmax(220px, 280px) 1fr',
    gap:                 16,
    alignItems:          'start',
  },
  leftCol: {
    display:       'flex',
    flexDirection: 'column',
    gap:           12,
  },
  heroTop: {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           14,
    marginBottom:  20,
  },
  statRow: {
    display:        'flex',
    justifyContent: 'center',
    gap:            8,
  },
  card: {
    background:    COLOR.surface,
    borderRadius:  20,
    border:        `1px solid ${COLOR.border}`,
    display:       'flex',
    flexDirection: 'column',
    gap:           12,
  },
};