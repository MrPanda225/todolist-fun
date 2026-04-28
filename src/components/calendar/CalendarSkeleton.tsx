import React                  from 'react';
import { Skeleton }           from '../ui/Skeleton';
import { colors, radius }     from '../../styles/tokens';

const VISIBLE_DAYS   = 5;
const BLOCKS_PER_DAY = [2, 3, 1, 2, 0, 1, 2];

export function CalendarSkeleton() {
  return (
    <div style={styles.grid}>
      {Array.from({ length: VISIBLE_DAYS }).map((_, i) => (
        <div key={i} style={styles.dayCol}>

          {/* En-tête jour */}
          <div style={styles.dayHeader}>
            <Skeleton width={28} height={10} radius={4} />
            <Skeleton width={20} height={22} radius={4} />
          </div>

          {/* Zone blocs */}
          <div style={styles.blocksArea}>
            {Array.from({ length: BLOCKS_PER_DAY[i] ?? 1 }).map((_, bi) => (
              <div key={bi} style={styles.blockSkeleton}>
                <Skeleton width="70%" height={11} radius={4} />
                <Skeleton width="50%" height={9}  radius={4} style={{ marginTop: 4 }} />
                {bi === 1 && (
                  <Skeleton width="60%" height={9} radius={4} style={{ marginTop: 4 }} />
                )}
              </div>
            ))}

            {/* Bouton ajouter skeleton */}
            <div style={styles.addSkeleton}>
              <Skeleton width={60} height={9} radius={4} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display:             'grid',
    gridTemplateColumns: `repeat(${VISIBLE_DAYS}, 1fr)`,
    gap:                 8,
    flex:                1,
    minHeight:           0,
  },
  dayCol: {
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
    minWidth:      0,
  },
  dayHeader: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            4,
    padding:        '8px 4px',
    background:     colors.white,
    borderRadius:   radius.sm,
    border:         `1px solid ${colors.border}`,
    flexShrink:     0,
  },
  blocksArea: {
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
    flex:          1,
    background:    colors.white,
    borderRadius:  radius.sm,
    border:        `1px solid ${colors.border}`,
    padding:       8,
    minHeight:     100,
  },
  blockSkeleton: {
    padding:      '8px 10px',
    borderRadius: 6,
    background:   `${colors.border}40`,
    borderLeft:   `3px solid ${colors.border}`,
    flexShrink:   0,
  },
  addSkeleton: {
    display:        'flex',
    justifyContent: 'center',
    padding:        '8px',
    marginTop:      'auto',
    border:         `1.5px dashed ${colors.border}`,
    borderRadius:   6,
    flexShrink:     0,
  },
};