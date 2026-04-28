import React              from 'react';
import { Skeleton }       from '../ui/Skeleton';
import { colors, radius } from '../../styles/tokens';

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1200 }}>

      {/* ── KPI Cards ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap:                 12,
      }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton width={60}  height={10} radius={4} />
              <Skeleton width={32}  height={32} radius={8} />
            </div>
            <Skeleton width={50}  height={28} radius={6} />
            <Skeleton width={100} height={10} radius={4} />
          </div>
        ))}
      </div>

      {/* ── Contenu principal ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: '1fr 340px',
        gap:                 16,
        alignItems:          'start',
      }}>
        {/* Tâches du jour */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width={120} height={18} radius={6} />
            <Skeleton width={40}  height={24} radius={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={styles.taskRow}>
                <Skeleton width={22} height={22} radius={11} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton width="55%" height={13} radius={4} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Skeleton width={55} height={18} radius={20} />
                    <Skeleton width={65} height={18} radius={20} />
                  </div>
                </div>
                <Skeleton width={40} height={11} radius={4} />
              </div>
            ))}
          </div>
        </div>

        {/* Panel progression */}
        <div style={styles.card}>
          {/* Niveau */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width={70}  height={13} radius={4} />
              <Skeleton width={50}  height={13} radius={4} />
            </div>
            <Skeleton width="100%" height={8}  radius={4} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width={50}  height={10} radius={4} />
              <Skeleton width={80}  height={10} radius={4} />
            </div>
          </div>

          {/* Achievement */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width={90}  height={13} radius={4} />
            <div style={{
              display:      'flex',
              alignItems:   'center',
              gap:          12,
              padding:      '12px',
              borderRadius: radius.sm,
              background:   colors.background,
            }}>
              <Skeleton width={36} height={36} radius={8}  />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Skeleton width="60%" height={12} radius={4} />
                <Skeleton width="80%" height={10} radius={4} />
              </div>
            </div>
          </div>

          {/* Activité */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width={140} height={13} radius={4} />
            <div style={{ display: 'flex', gap: 6, height: 72, alignItems: 'flex-end' }}>
              {[60, 80, 40, 100, 70, 20, 50].map((h, i) => (
                <div key={i} style={{
                  flex:          1,
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  gap:           4,
                  height:        '100%',
                  justifyContent: 'flex-end',
                }}>
                  <Skeleton
                    width="70%"
                    height={`${h}%` as any}
                    radius={3}
                    style={{ minHeight: 4 }}
                  />
                  <Skeleton width={8} height={8} radius={4} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background:    colors.white,
    borderRadius:  radius.lg,
    padding:       '16px 18px',
    border:        `1px solid ${colors.border}`,
    boxShadow:     '0 1px 4px rgba(13,31,51,0.07)',
    display:       'flex',
    flexDirection: 'column',
    gap:           14,
  },
  taskRow: {
    display:    'flex',
    alignItems: 'flex-start',
    gap:        12,
    padding:    '10px 8px',
  },
};