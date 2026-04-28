import React, { useState }          from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { Task }                from '../../api/tasks.api';
import { tasksApi }                 from '../../api/tasks.api';
import { useQueryClient }           from '@tanstack/react-query';
import { colors, radius }           from '../../styles/tokens';

interface TodayTasksProps {
  tasks: Task[];
}

const STATUS_COLORS: Record<string, string> = {
  TODO:        colors.muted,
  IN_PROGRESS: '#f39c12',
  DONE:        '#27ae60',
};

/** Liste des tâches du jour avec toggle de statut inline. */
export function TodayTasks({ tasks }: TodayTasksProps) {
  const queryClient        = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleTask(task: Task) {
    if (loading) return;
    setLoading(task.id);
    try {
      const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
      await tasksApi.updateStatus(task.id, nextStatus);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Tâches du jour</h2>
        <span style={styles.count}>
          {tasks.filter(t => t.status === 'DONE').length}/{tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div style={styles.empty}>
          <Clock size={32} color={colors.border} />
          <p style={styles.emptyText}>Aucune tâche pour aujourd'hui</p>
          <p style={styles.emptyHint}>Ajoute une tâche avec une date d'échéance aujourd'hui</p>
        </div>
      ) : (
        <div style={styles.list}>
          {tasks.map(task => (
            <div key={task.id} style={styles.taskRow}>
              <button
                onClick={() => toggleTask(task)}
                style={styles.checkBtn}
                disabled={loading === task.id}
                aria-label={task.status === 'DONE' ? 'Marquer comme à faire' : 'Marquer comme terminé'}
              >
                {task.status === 'DONE'
                  ? <CheckCircle2 size={22} color="#27ae60" />
                  : <Circle       size={22} color={colors.border} />}
              </button>

              <div style={styles.taskInfo}>
                <span style={{
                  ...styles.taskTitle,
                  textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                  color:          task.status === 'DONE' ? colors.muted : colors.dark,
                }}>
                  {task.title}
                </span>
                {task.priority && (
                  <span style={{
                    ...styles.priorityBadge,
                    color:      STATUS_COLORS[task.status],
                    background: `${STATUS_COLORS[task.status]}15`,
                  }}>
                    {task.priority.label}
                  </span>
                )}
              </div>

              <span style={styles.xp}>+{task.xpReward} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background:    colors.white,
    borderRadius:  radius.lg,
    padding:       '20px 24px',
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
    boxShadow:     '0 1px 4px rgba(13,31,51,0.07)',
    border:        `1px solid ${colors.border}`,
    flex:          1,
  },
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize:   16,
    fontWeight: 700,
    color:      colors.dark,
    margin:     0,
  },
  count: {
    fontSize:     13,
    fontWeight:   700,
    color:        colors.primary,
    background:   `${colors.primary}15`,
    padding:      '3px 10px',
    borderRadius: 20,
  },
  empty: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            8,
    padding:        '32px 0',
    color:          colors.muted,
  },
  emptyText: {
    fontSize:   14,
    fontWeight: 600,
    color:      colors.muted,
    margin:     0,
  },
  emptyHint: {
    fontSize: 12,
    color:    colors.border,
    margin:   0,
  },
  list: {
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
  },
  taskRow: {
    display:     'flex',
    alignItems:  'center',
    gap:         12,
    padding:     '10px 8px',
    borderRadius: radius.sm,
    transition:  'background 0.15s',
    cursor:      'default',
  },
  checkBtn: {
    background: 'none',
    border:     'none',
    padding:    0,
    cursor:     'pointer',
    display:    'flex',
    alignItems: 'center',
    flexShrink: 0,
    transition: 'transform 0.15s',
  },
  taskInfo: {
    flex:       1,
    display:    'flex',
    alignItems: 'center',
    gap:        8,
    minWidth:   0,
  },
  taskTitle: {
    fontSize:     14,
    fontWeight:   500,
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    flex:         1,
    transition:   'color 0.2s, text-decoration 0.2s',
  },
  priorityBadge: {
    fontSize:     11,
    fontWeight:   600,
    padding:      '2px 8px',
    borderRadius: 20,
    whiteSpace:   'nowrap',
    flexShrink:   0,
  },
  xp: {
    fontSize:   11,
    fontWeight: 700,
    color:      colors.primary,
    flexShrink: 0,
  },
};