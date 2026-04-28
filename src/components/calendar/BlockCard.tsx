import React, { useRef, useEffect, useState } from 'react';
import { CheckCircle2, Circle, Edit3 }         from 'lucide-react';
import type { TimeBlock }                       from '../../api/timeBlocks.api';
import { colors, radius }                       from '../../styles/tokens';

const BLOCK_COLORS = [colors.primary, '#27ae60', '#e67e22', '#9b59b6', '#e74c3c'];

function formatTime(isoOrTime: string): string {
  if (!isoOrTime) return '';
  if (/^\d{2}:\d{2}$/.test(isoOrTime)) return isoOrTime;
  const date = new Date(isoOrTime);
  if (isNaN(date.getTime())) return isoOrTime;
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

interface BlockCardProps {
  block:    TimeBlock;
  colorIdx: number;
  isActive: boolean;
  onClick:  () => void;
}

export function BlockCard({ block, colorIdx, isActive, onClick }: BlockCardProps) {
  const cardRef    = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const color      = BLOCK_COLORS[colorIdx % BLOCK_COLORS.length];
  const startStr   = formatTime(block.startTime);
  const endStr     = formatTime(block.endTime);
  const doneCount  = block.tasks.filter(t => t.status === 'DONE').length;
  const totalTasks = block.tasks.length;

  // Animation entrée
  useEffect(() => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(8px)';
    const timer = setTimeout(() => {
      el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    }, colorIdx * 60);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.block,
        background:  isActive || hovered ? `${color}20` : `${color}10`,
        borderLeft:  `3px solid ${color}`,
        boxShadow:   isActive
          ? `0 4px 14px ${color}35, 0 0 0 1px ${color}25`
          : hovered
          ? `0 2px 8px ${color}20`
          : '0 1px 2px rgba(13,31,51,0.04)',
        transform: hovered && !isActive ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      {/* Titre + icône édition au hover */}
      <div style={styles.titleRow}>
        <span style={{ ...styles.blockTitle, color }}>
          {block.title}
        </span>
        {hovered && (
          <Edit3 size={11} color={color} style={{ flexShrink: 0, opacity: 0.7 }} />
        )}
      </div>

      {/* Heure */}
      <span style={styles.blockTime}>
        {startStr} → {endStr}
      </span>

      {/* Tâches + badge progression */}
      {totalTasks > 0 && (
        <div style={styles.tasksRow}>
          {block.tasks.slice(0, 2).map(t => (
            <div key={t.id} style={styles.taskChip}>
              {t.status === 'DONE'
                ? <CheckCircle2 size={10} color="#27ae60" />
                : <Circle       size={10} color={`${color}80`} />}
              <span style={{
                ...styles.taskChipText,
                textDecoration: t.status === 'DONE' ? 'line-through' : 'none',
                color:          t.status === 'DONE' ? colors.muted : colors.dark,
              }}>
                {t.title}
              </span>
            </div>
          ))}
          {totalTasks > 2 && (
            <span style={{ ...styles.taskMore, color }}>
              +{totalTasks - 2}
            </span>
          )}

          {/* Badge progression si tâches */}
          <div style={{
            ...styles.progressBadge,
            background:   doneCount === totalTasks ? '#27ae6020' : `${color}15`,
            color:        doneCount === totalTasks ? '#27ae60'   : color,
            marginLeft:   'auto',
          }}>
            {doneCount}/{totalTasks}
          </div>
        </div>
      )}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  block: {
    borderRadius:  radius.sm,
    padding:       '8px 10px',
    display:       'flex',
    flexDirection: 'column',
    gap:           3,
    flexShrink:    0,
    cursor:        'pointer',
    border:        'none',
    width:         '100%',
    textAlign:     'left',
    transition:    'background 0.2s, box-shadow 0.2s, transform 0.15s',
    fontFamily:    'inherit',
  },
  titleRow: {
    display:    'flex',
    alignItems: 'center',
    gap:        4,
  },
  blockTitle: {
    fontSize:     12,
    fontWeight:   700,
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    flex:         1,
  },
  blockTime: {
    fontSize:   10,
    color:      colors.muted,
    fontWeight: 500,
  },
  tasksRow: {
    display:    'flex',
    alignItems: 'center',
    gap:        4,
    flexWrap:   'wrap',
    marginTop:  2,
  },
  taskChip: {
    display:    'flex',
    alignItems: 'center',
    gap:        3,
  },
  taskChipText: {
    fontSize:     10,
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    maxWidth:     90,
  },
  taskMore: {
    fontSize:   9,
    fontWeight: 700,
  },
  progressBadge: {
    fontSize:     9,
    fontWeight:   700,
    padding:      '1px 6px',
    borderRadius: 20,
    whiteSpace:   'nowrap',
  },
};