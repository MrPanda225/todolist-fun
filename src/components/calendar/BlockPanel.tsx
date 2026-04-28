import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { TimeBlock }     from '../../api/timeBlocks.api';
import type { Task }          from '../../types/task.types';
import { colors, radius }     from '../../styles/tokens';

const PRIORITY_COLORS: Record<string, string> = {
  Critique: '#e74c3c',
  Haute:    '#e67e22',
  Normale:  '#2470BD',
  Faible:   '#27ae60',
};

function formatTime(isoOrTime: string): string {
  if (!isoOrTime) return '';
  if (/^\d{2}:\d{2}$/.test(isoOrTime)) return isoOrTime;
  const date = new Date(isoOrTime);
  if (isNaN(date.getTime())) return isoOrTime;
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long',
  });
}

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ─── AnimatedTaskRow — monte avec fadeInUp ────────────────────────────────────
function AnimatedTaskRow({
  children, animKey,
}: { children: React.ReactNode; animKey: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(8px)';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    });
  }, [animKey]);

  return <div ref={ref}>{children}</div>;
}

interface BlockPanelProps {
  block:          TimeBlock | null;
  selectedDay:    Date | null;
  unplannedTasks: Task[];
  isCreating:     boolean;
  onClose:        () => void;
  onCreate:       (payload: {
    title: string; startTime: string; endTime: string; date: string;
  }) => Promise<void>;
  onDelete:       (id: string) => Promise<void>;
  onAssignTask:   (blockId: string, taskId: string) => Promise<void>;
  onUnassignTask: (blockId: string, taskId: string) => Promise<void>;
}

export function BlockPanel({
  block, selectedDay, unplannedTasks, isCreating,
  onClose, onCreate, onDelete, onAssignTask, onUnassignTask,
}: BlockPanelProps) {
  const isOpen   = block !== null || selectedDay !== null;
  const panelRef = useRef<HTMLDivElement>(null);

  const [form, setForm]                   = useState({ title: '', startTime: '09:00', endTime: '10:00' });
  const [isDeleting, setIsDeleting]       = useState(false);
  const [assigningId, setAssigningId]     = useState<string | null>(null);
  const [unassigningId, setUnassigningId] = useState<string | null>(null);

  // Reset form quand on change de jour
  useEffect(() => {
    if (selectedDay) setForm({ title: '', startTime: '09:00', endTime: '10:00' });
  }, [selectedDay?.toISOString()]);

  // Animation panel entrée/sortie
  useEffect(() => {
    if (!panelRef.current) return;
    const el = panelRef.current;
    if (isOpen) {
      el.style.transform  = 'translateX(100%)';
      el.style.opacity    = '0';
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease';
        el.style.transform  = 'translateX(0)';
        el.style.opacity    = '1';
      });
    } else {
      el.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease';
      el.style.transform  = 'translateX(100%)';
      el.style.opacity    = '0';
    }
  }, [isOpen]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDay || !form.title.trim()) return;
    const dateStr  = toLocalDateStr(selectedDay);
    const startISO = new Date(`${dateStr}T${form.startTime}:00`).toISOString();
    const endISO   = new Date(`${dateStr}T${form.endTime}:00`).toISOString();
    await onCreate({ title: form.title.trim(), startTime: startISO, endTime: endISO, date: dateStr });
    onClose();
  }

  async function handleDelete() {
    if (!block || !confirm('Supprimer ce bloc ?')) return;
    setIsDeleting(true);
    try { await onDelete(block.id); onClose(); }
    finally { setIsDeleting(false); }
  }

  async function handleAssign(taskId: string) {
    if (!block) return;
    setAssigningId(taskId);
    try { await onAssignTask(block.id, taskId); }
    finally { setAssigningId(null); }
  }

  async function handleUnassign(taskId: string) {
    if (!block) return;
    setUnassigningId(taskId);
    try { await onUnassignTask(block.id, taskId); }
    finally { setUnassigningId(null); }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          ...styles.overlay,
          opacity:       isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition:    'opacity 0.3s ease',
        }}
      />

      {/* Panel */}
      <div ref={panelRef} style={styles.panel}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerInfo}>
            {block ? (
              <>
                <span style={styles.headerMode}>Bloc planifié</span>
                <h2 style={styles.headerTitle}>{block.title}</h2>
                <div style={styles.headerTime}>
                  <Clock size={13} color={colors.primary} />
                  <span style={{ fontSize: 13, color: colors.primary, fontWeight: 600 }}>
                    {formatTime(block.startTime)} → {formatTime(block.endTime)}
                  </span>
                </div>
              </>
            ) : selectedDay ? (
              <>
                <span style={styles.headerMode}>Nouveau bloc</span>
                <h2 style={styles.headerTitle}>{formatDay(selectedDay)}</h2>
              </>
            ) : null}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {block && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={styles.deletePanelBtn}
              >
                <Trash2 size={15} />
              </button>
            )}
            <button onClick={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.muted} />
            </button>
          </div>
        </div>

        <div style={styles.body}>

          {/* ── Mode création ── */}
          {!block && selectedDay && (
            <form onSubmit={handleCreate} style={styles.createForm} noValidate>
              <div style={styles.field}>
                <label style={styles.label}>Titre du bloc *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Session de travail"
                  style={styles.input}
                  autoFocus
                  required
                />
              </div>

              <div style={styles.timeRow}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Début</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    style={styles.input}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
                  <span style={{ color: colors.muted, fontSize: 16, fontWeight: 700 }}>→</span>
                </div>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Fin</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    style={styles.input}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating || !form.title.trim()}
                style={{ ...styles.submitBtn, opacity: isCreating || !form.title.trim() ? 0.6 : 1 }}
              >
                {isCreating ? 'Création...' : 'Créer le bloc'}
              </button>
            </form>
          )}

          {/* ── Mode bloc existant ── */}
          {block && (
            <>
              {/* Tâches assignées */}
              <div style={styles.section}>
                <p style={styles.sectionLabel}>
                  Tâches assignées
                  {block.tasks.length > 0 && (
                    <span style={styles.sectionCount}>{block.tasks.length}</span>
                  )}
                </p>

                {block.tasks.length === 0 ? (
                  <AnimatedTaskRow animKey="empty-assigned">
                    <div style={styles.emptyAssigned}>
                      <span style={{ fontSize: 11, color: colors.muted }}>
                        Aucune tâche assignée à ce bloc
                      </span>
                    </div>
                  </AnimatedTaskRow>
                ) : (
                  <div style={styles.assignedList}>
                    {block.tasks.map(t => (
                      <AnimatedTaskRow key={t.id} animKey={`assigned-${t.id}`}>
                        <AssignedTaskRow
                          task={t}
                          isRemoving={unassigningId === t.id}
                          onRemove={() => handleUnassign(t.id)}
                        />
                      </AnimatedTaskRow>
                    ))}
                  </div>
                )}
              </div>

              {/* Tâches disponibles */}
              <div style={styles.section}>
                <p style={styles.sectionLabel}>
                  Assigner une tâche
                  {unplannedTasks.length > 0 && (
                    <span style={styles.sectionCount}>{unplannedTasks.length}</span>
                  )}
                </p>

                {unplannedTasks.length === 0 ? (
                  <AnimatedTaskRow animKey="empty-unplanned">
                    <div style={styles.emptyUnplanned}>
                      <span style={{ fontSize: 28 }}>🎯</span>
                      <p style={{ fontSize: 12, color: colors.muted, margin: 0, textAlign: 'center' }}>
                        Toutes les tâches sont déjà planifiées !
                      </p>
                    </div>
                  </AnimatedTaskRow>
                ) : (
                  <div style={styles.unplannedList}>
                    {unplannedTasks.map((task) => (
                      <AnimatedTaskRow key={task.id} animKey={`unplanned-${task.id}`}>
                        <UnplannedTaskRow
                          task={task}
                          isAssigning={assigningId === task.id}
                          onAssign={() => handleAssign(task.id)}
                        />
                      </AnimatedTaskRow>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── AssignedTaskRow ──────────────────────────────────────────────────────────
function AssignedTaskRow({ task, isRemoving, onRemove }: {
  task:       { id: string; title: string; status: string };
  isRemoving: boolean;
  onRemove:   () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isDone = task.status === 'DONE';

  return (
    <div
      style={{
        ...styles.assignedRow,
        background: hovered ? '#fff5f5' : colors.background,
        borderColor: hovered ? '#fca5a5' : colors.border,
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ flexShrink: 0 }}>
        {isDone
          ? <CheckCircle2 size={16} color="#27ae60" />
          : <Circle       size={16} color={colors.border} />}
      </div>
      <span style={{
        flex:           1,
        fontSize:       13,
        fontWeight:     500,
        color:          isDone ? colors.muted : colors.dark,
        textDecoration: isDone ? 'line-through' : 'none',
        overflow:       'hidden',
        textOverflow:   'ellipsis',
        whiteSpace:     'nowrap',
      }}>
        {task.title}
      </span>
      <button
        onClick={onRemove}
        disabled={isRemoving}
        style={{
          ...styles.removeBtn,
          color:      hovered ? '#e74c3c' : colors.muted,
          background: hovered ? '#fee2e2' : 'transparent',
          opacity:    isRemoving ? 0.5 : 1,
        }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ─── UnplannedTaskRow ─────────────────────────────────────────────────────────
function UnplannedTaskRow({ task, isAssigning, onAssign }: {
  task:        Task;
  isAssigning: boolean;
  onAssign:    () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const priorityColor = task.priority
    ? PRIORITY_COLORS[task.priority.label] ?? colors.primary
    : colors.border;

  return (
    <button
      onClick={onAssign}
      disabled={isAssigning}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.unplannedRow,
        background:  hovered ? `${colors.primary}08` : colors.white,
        borderColor: hovered ? colors.primary : colors.border,
        opacity:     isAssigning ? 0.6 : 1,
        transform:   hovered ? 'translateX(3px)' : 'translateX(0)',
      }}
    >
      <div style={{
        width:        3,
        alignSelf:    'stretch',
        borderRadius: 2,
        background:   priorityColor,
        flexShrink:   0,
      }} />

      <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
        <span style={{
          display:      'block',
          fontSize:     13,
          fontWeight:   600,
          color:        colors.dark,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}>
          {task.title}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
          {task.priority && (
            <span style={{ fontSize: 10, fontWeight: 700, color: priorityColor }}>
              {task.priority.label}
            </span>
          )}
          {task.category && (
            <span style={{ fontSize: 10, color: colors.muted }}>
              · {task.category.name}
            </span>
          )}
        </div>
      </div>

      <div style={{
        width:          26,
        height:         26,
        borderRadius:   '50%',
        background:     hovered ? colors.primary : `${colors.primary}15`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
        transition:     'background 0.2s, transform 0.2s',
        transform:      hovered ? 'scale(1.1)' : 'scale(1)',
      }}>
        <Plus size={14} color={hovered ? 'white' : colors.primary} />
      </div>
    </button>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position:       'fixed',
    inset:          0,
    background:     'rgba(13,31,51,0.2)',
    zIndex:         40,
    backdropFilter: 'blur(1px)',
  },
  panel: {
    position:      'fixed',
    top:           0,
    right:         0,
    bottom:        0,
    width:         380,
    maxWidth:      '100vw',
    background:    colors.white,
    boxShadow:     '-4px 0 32px rgba(13,31,51,0.14)',
    zIndex:        50,
    display:       'flex',
    flexDirection: 'column',
    transform:     'translateX(100%)',
    opacity:       0,
  },
  header: {
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    padding:        '20px 20px 16px',
    borderBottom:   `1px solid ${colors.border}`,
    flexShrink:     0,
    gap:            12,
  },
  headerInfo: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
    minWidth:      0,
  },
  headerMode: {
    fontSize:      11,
    fontWeight:    700,
    color:         colors.primary,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  headerTitle: {
    fontSize:      17,
    fontWeight:    800,
    color:         colors.dark,
    margin:        0,
    overflow:      'hidden',
    textOverflow:  'ellipsis',
    whiteSpace:    'nowrap',
    letterSpacing: '-0.02em',
  },
  headerTime: {
    display:    'flex',
    alignItems: 'center',
    gap:        5,
  },
  deletePanelBtn: {
    background:   'none',
    border:       `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    cursor:       'pointer',
    padding:      '6px 8px',
    display:      'flex',
    alignItems:   'center',
    color:        '#e74c3c',
  },
  closeBtn: {
    background:   'none',
    border:       'none',
    cursor:       'pointer',
    padding:      6,
    borderRadius: 8,
    display:      'flex',
    alignItems:   'center',
  },
  body: {
    flex:          1,
    overflowY:     'auto',
    padding:       '16px 20px',
    display:       'flex',
    flexDirection: 'column',
    gap:           20,
  },
  createForm: {
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
  },
  field: {
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
  },
  timeRow: {
    display:    'flex',
    gap:        8,
    alignItems: 'flex-start',
  },
  label: {
    fontSize:   12,
    fontWeight: 600,
    color:      colors.dark,
  },
  input: {
    padding:      '10px 12px',
    border:       `1.5px solid ${colors.border}`,
    borderRadius: radius.sm,
    fontSize:     14,
    color:        colors.dark,
    background:   colors.white,
    outline:      'none',
    fontFamily:   'inherit',
    width:        '100%',
    boxSizing:    'border-box',
  },
  submitBtn: {
    padding:      '12px',
    background:   colors.primary,
    color:        'white',
    border:       'none',
    borderRadius: radius.md,
    fontSize:     14,
    fontWeight:   600,
    cursor:       'pointer',
    fontFamily:   'inherit',
    marginTop:    4,
  },
  section: {
    display:       'flex',
    flexDirection: 'column',
    gap:           10,
  },
  sectionLabel: {
    display:       'flex',
    alignItems:    'center',
    gap:           8,
    fontSize:      11,
    fontWeight:    700,
    color:         colors.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin:        0,
  },
  sectionCount: {
    background:   `${colors.primary}15`,
    color:        colors.primary,
    fontSize:     10,
    fontWeight:   700,
    padding:      '1px 7px',
    borderRadius: 20,
  },
  emptyAssigned: {
    padding:      '12px 14px',
    background:   colors.background,
    borderRadius: radius.sm,
    border:       `1px dashed ${colors.border}`,
    textAlign:    'center',
  },
  assignedList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
  },
  assignedRow: {
    display:      'flex',
    alignItems:   'center',
    gap:          10,
    padding:      '10px 12px',
    borderRadius: radius.sm,
    border:       '1px solid',
  },
  removeBtn: {
    border:       'none',
    cursor:       'pointer',
    padding:      '4px 6px',
    borderRadius: 6,
    display:      'flex',
    alignItems:   'center',
    flexShrink:   0,
    transition:   'color 0.15s, background 0.15s',
  },
  emptyUnplanned: {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           10,
    padding:       '24px',
    background:    colors.background,
    borderRadius:  radius.md,
    border:        `1px dashed ${colors.border}`,
  },
  unplannedList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
  },
  unplannedRow: {
    display:      'flex',
    alignItems:   'center',
    gap:          10,
    padding:      '10px 12px',
    borderRadius: radius.sm,
    border:       '1.5px solid',
    cursor:       'pointer',
    width:        '100%',
    fontFamily:   'inherit',
    transition:   'background 0.15s, border-color 0.15s, transform 0.15s',
  },
};