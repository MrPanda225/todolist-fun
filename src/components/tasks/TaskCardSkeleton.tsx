import React           from 'react';
import { Skeleton }    from '../ui/Skeleton';
import { colors, radius } from '../../styles/tokens';

/** Skeleton d'une TaskCard pendant le chargement. */
export function TaskCardSkeleton() {
  return (
    <div style={styles.card}>
      <div style={styles.bar} />
      <div style={styles.content}>
        <Skeleton width={22} height={22} radius={11} />
        <div style={styles.info}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={11} style={{ marginTop: 6 }} />
          <div style={styles.badges}>
            <Skeleton width={60}  height={20} radius={20} />
            <Skeleton width={50}  height={20} radius={20} />
            <Skeleton width={80}  height={20} radius={20} />
          </div>
        </div>
        <div style={styles.actions}>
          <Skeleton width={40} height={14} />
          <Skeleton width={20} height={20} radius={6} />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background:   colors.white,
    borderRadius: radius.md,
    border:       `1px solid ${colors.border}`,
    display:      'flex',
    overflow:     'hidden',
  },
  bar: {
    width:      4,
    background: '#f0f0f0',
    flexShrink: 0,
  },
  content: {
    flex:       1,
    display:    'flex',
    alignItems: 'flex-start',
    gap:        12,
    padding:    '14px 16px',
  },
  info: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
  },
  badges: {
    display:   'flex',
    gap:       6,
    marginTop: 6,
  },
  actions: {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'flex-end',
    gap:           8,
  },
};