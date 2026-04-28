import React         from 'react';
import { Skeleton }  from '../ui/Skeleton';
import { colors, radius } from '../../styles/tokens';

export function GamificationSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>

      {/* Streak Hero skeleton */}
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Skeleton width={64} height={64} radius={32} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width={80}  height={48} radius={8} />
            <Skeleton width={140} height={14} radius={6} />
            <Skeleton width={120} height={12} radius={6} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <Skeleton width={12} height={12} radius={6} />
              <Skeleton width={8}  height={8}  radius={4} />
            </div>
          ))}
        </div>
      </div>

      {/* Level + Stats skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}>
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: 10 }}>
            <Skeleton width={120} height={32} radius={20} />
            <Skeleton width={60}  height={16} radius={8}  style={{ alignSelf: 'center' }} />
          </div>
          <Skeleton width={120} height={40} radius={8} />
          <Skeleton width="100%" height={12} radius={6} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width={40} height={10} radius={4} />
            <Skeleton width={30} height={10} radius={4} />
            <Skeleton width={40} height={10} radius={4} />
          </div>
          <Skeleton width="100%" height={40} radius={8} />
        </div>

        <div style={{ ...styles.card, minWidth: 200, gap: 0 }}>
          <Skeleton width={100} height={16} radius={6} style={{ marginBottom: 12 }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              display:      'flex',
              alignItems:   'center',
              gap:          12,
              padding:      '10px 0',
              borderBottom: i < 2 ? `1px solid ${colors.border}` : 'none',
            }}>
              <Skeleton width={40} height={40} radius={8} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton width={60}  height={10} radius={4} />
                <Skeleton width={40}  height={20} radius={4} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements skeleton */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Skeleton width={20}  height={20} radius={4} />
            <Skeleton width={120} height={18} radius={6} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Skeleton width={130} height={32} radius={20} />
            <Skeleton width={110} height={32} radius={20} />
          </div>
        </div>

        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap:                 12,
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           8,
              padding:       '18px 12px',
              borderRadius:  radius.md,
              border:        `1px solid ${colors.border}`,
              background:    colors.background,
            }}>
              <Skeleton width={56}  height={56} radius={28} />
              <Skeleton width={80}  height={12} radius={4}  />
              <Skeleton width={100} height={10} radius={4}  />
              <Skeleton width={50}  height={16} radius={20} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background:    colors.white,
    borderRadius:  8,
    padding:       '24px',
    border:        `1px solid ${colors.border}`,
    boxShadow:     '0 1px 4px rgba(13,31,51,0.07)',
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
  },
};