import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Trash2, CalendarClock } from 'lucide-react';
import type { Task, TaskStatus }        from '../../types/task.types';
import { colors, radius }               from '../../styles/tokens';

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO:        'À faire',
  IN_PROGRESS: 'En cours',
  DONE:        'Terminé',
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO:        colors.muted,
  IN_PROGRESS: '#f39c12',
  DONE:        '#27ae60',
};

const PRIORITY_COLORS: Record<string, string> = {
  Critique: '#e74c3c',
  Haute:    '#e67e22',
  Normale:  '#2470BD',
  Faible:   '#27ae60',
};

function getPriorityColor(label: string): string {
  return PRIORITY_COLORS[label] ?? colors.primary;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ─── StatusMenu ───────────────────────────────────────────────────────────────
interface StatusMenuProps {
  currentStatus: TaskStatus;
  onSelect:      (s: TaskStatus) => void;
}

function StatusMenu({ currentStatus, onSelect }: StatusMenuProps) {
  const [hoveredItem, setHoveredItem] = useState<TaskStatus | null>(null);

  return (
    <div style={styles.statusMenu}>
      {(Object.keys(STATUS_LABEL) as TaskStatus[])
        .filter(s => s !== currentStatus)
        .map(s => (
          <button
            key={s}
            onClick={e => { e.stopPropagation(); onSelect(s); }}
            onMouseEnter={() => setHoveredItem(s)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              ...styles.statusMenuItem,
              background: hoveredItem === s ? colors.background : 'transparent',
            }}
          >
            <div style={{
              width:        8,
              height:       8,
              borderRadius: '50%',
              background:   STATUS_COLOR[s],
              flexShrink:   0,
            }} />
            {STATUS_LABEL[s]}
          </button>
        ))}
    </div>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────
interface TaskCardProps {
  task:           Task;
  isMenuOpen:     boolean;
  isPlanned:      boolean;
  onMenuToggle:   (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onDelete:       (id: string) => Promise<void>;
}

export function TaskCard({
  task, isMenuOpen, isPlanned,
  onMenuToggle, onStatusChange, onDelete,
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered,  setIsHovered]  = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const isDone        = task.status === 'DONE';
  const formattedDate = formatDate(task.dueDate);
  const priorityColor = task.priority
    ? getPriorityColor(task.priority.label)
    : colors.border;

  const isOverdue = task.dueDate && !isDone
    && new Date(task.dueDate) < new Date()
    && !isNaN(new Date(task.dueDate).getTime());

  // Affiche l'indicateur uniquement pour les tâches non terminées et non planifiées
  const showUnplannedBadge = !isDone && !isPlanned;

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClickOutside() { onMenuToggle(task.id); }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  async function handleStatusChange(status: TaskStatus) {
    setIsUpdating(true);
    onMenuToggle(task.id);
    try { await onStatusChange(task.id, status); }
    finally { setIsUpdating(false); }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette tâche ?')) return;
    setIsDeleting(true);
    try { await onDelete(task.id); }
    finally { setIsDeleting(false); }
  }

  return (
    <div
      style={{
        ...styles.card,
        zIndex:    isMenuOpen ? 50 : 1,
        boxShadow: isHovered
          ? '0 4px 12px rgba(13,31,51,0.1)'
          : '0 1px 3px rgba(13,31,51,0.06)',
        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Barre priorité ── */}
      <div style={{ ...styles.priorityBar, background: priorityColor }} />

      <div style={styles.content}>

        {/* ── Bouton statut ── */}
        <div style={{ position: 'relative', flexShrink: 0, paddingTop: 2 }}>
          <button
            onClick={e => { e.stopPropagation(); onMenuToggle(task.id); }}
            disabled={isUpdating}
            style={styles.statusBtn}
            title="Changer le statut"
          >
            {isUpdating ? (
              <div style={styles.statusSpinner} />
            ) : isDone ? (
              <CheckCircle2 size={22} color="#27ae60" />
            ) : task.status === 'IN_PROGRESS' ? (
              <Circle size={22} color="#f39c12" strokeWidth={2.5} />
            ) : (
              <Circle size={22} color={colors.border} />
            )}
          </button>

          {isMenuOpen && (
            <StatusMenu
              currentStatus={task.status}
              onSelect={handleStatusChange}
            />
          )}
        </div>

        {/* ── Infos ── */}
        <div style={styles.info}>
          <span style={{
            ...styles.title,
            textDecoration: isDone ? 'line-through' : 'none',
            color:          isDone ? colors.muted : colors.dark,
          }}>
            {task.title}
          </span>

          {task.description && (
            <span style={styles.description}>{task.description}</span>
          )}

          <div style={styles.meta}>
            <span style={{
              ...styles.badge,
              color:      STATUS_COLOR[task.status],
              background: `${STATUS_COLOR[task.status]}15`,
            }}>
              {STATUS_LABEL[task.status]}
            </span>

            {task.priority && (
              <span style={{
                ...styles.badge,
                color:      priorityColor,
                background: `${priorityColor}15`,
              }}>
                {task.priority.label}
              </span>
            )}

            {task.category && (
              <span style={{
                ...styles.badge,
                color:      task.category.color || colors.primary,
                background: `${task.category.color || colors.primary}15`,
              }}>
                {task.category.name}
              </span>
            )}

            {formattedDate && (
              <span style={{
                ...styles.date,
                color: isOverdue ? '#e74c3c' : colors.muted,
              }}>
                🕐 {formattedDate}
                {isOverdue && ' · En retard'}
              </span>
            )}

            {/* ── Badge non planifiée ── */}
            {showUnplannedBadge && (
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <span
                  style={styles.unplannedBadge}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <CalendarClock size={11} />
                  Non planifiée
                </span>

                {showTooltip && (
                  <div style={styles.tooltip}>
                    Cette tâche n'est assignée à aucun bloc dans le calendrier
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={styles.actions}>
          <span style={styles.xp}>+{task.xpReward} XP</span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              ...styles.deleteBtn,
              opacity:   isHovered ? 1 : 0,
              transform: isHovered ? 'scale(1)' : 'scale(0.8)',
            }}
          >
            <Trash2 size={15} />
          </button>
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
    overflow:     'visible',
    transition:   'box-shadow 0.2s ease, transform 0.2s ease',
    position:     'relative',
  },
  priorityBar: {
    width:        4,
    flexShrink:   0,
    borderRadius: `${radius.md}px 0 0 ${radius.md}px`,
  },
  content: {
    flex:       1,
    display:    'flex',
    alignItems: 'flex-start',
    gap:        12,
    padding:    '14px 16px',
    minWidth:   0,
  },
  statusBtn: {
    background: 'none',
    border:     'none',
    padding:    0,
    cursor:     'pointer',
    display:    'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  statusSpinner: {
    width:        20,
    height:       20,
    border:       `2px solid ${colors.border}`,
    borderTop:    `2px solid ${colors.primary}`,
    borderRadius: '50%',
    animation:    'spin 0.6s linear infinite',
  },
  statusMenu: {
    position:      'absolute',
    top:           '110%',
    left:          0,
    zIndex:        500,
    background:    colors.white,
    borderRadius:  radius.sm,
    border:        `1px solid ${colors.border}`,
    boxShadow:     '0 8px 24px rgba(13,31,51,0.14)',
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
    minWidth:      140,
  },
  statusMenuItem: {
    display:    'flex',
    alignItems: 'center',
    gap:        10,
    padding:    '10px 14px',
    background: 'transparent',
    border:     'none',
    cursor:     'pointer',
    fontSize:   13,
    fontWeight: 500,
    color:      colors.dark,
    fontFamily: 'inherit',
    textAlign:  'left',
    whiteSpace: 'nowrap',
  },
  info: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
    minWidth:      0,
  },
  title: {
    fontSize:     14,
    fontWeight:   600,
    lineHeight:   1.4,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  },
  description: {
    fontSize:        12,
    color:           colors.muted,
    lineHeight:      1.4,
    overflow:        'hidden',
    display:         '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
  },
  meta: {
    display:    'flex',
    flexWrap:   'wrap',
    gap:        6,
    marginTop:  2,
    alignItems: 'center',
  },
  badge: {
    fontSize:     11,
    fontWeight:   600,
    padding:      '2px 8px',
    borderRadius: 20,
    whiteSpace:   'nowrap',
  },
  date: {
    display:    'flex',
    alignItems: 'center',
    gap:        3,
    fontSize:   11,
    fontWeight: 500,
  },
  unplannedBadge: {
    display:      'inline-flex',
    alignItems:   'center',
    gap:          4,
    fontSize:     11,
    fontWeight:   600,
    color:        '#9b59b6',
    background:   '#9b59b615',
    padding:      '2px 8px',
    borderRadius: 20,
    cursor:       'default',
    whiteSpace:   'nowrap',
    border:       '1px dashed #9b59b640',
  },
  tooltip: {
    position:     'absolute',
    bottom:       '120%',
    left:         '50%',
    transform:    'translateX(-50%)',
    background:   colors.dark,
    color:        'white',
    fontSize:     11,
    padding:      '6px 10px',
    borderRadius: radius.sm,
    whiteSpace:   'nowrap',
    zIndex:       200,
    boxShadow:    '0 4px 12px rgba(0,0,0,0.2)',
    pointerEvents: 'none',
  },
  actions: {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'flex-end',
    gap:           8,
    flexShrink:    0,
  },
  xp: {
    fontSize:   11,
    fontWeight: 700,
    color:      colors.primary,
    whiteSpace: 'nowrap',
  },
  deleteBtn: {
    background:   'none',
    border:       'none',
    cursor:       'pointer',
    color:        '#e74c3c',
    padding:      4,
    borderRadius: 6,
    display:      'flex',
    alignItems:   'center',
    transition:   'opacity 0.2s, transform 0.2s',
  },
};