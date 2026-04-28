import React, { useState }       from 'react';
import { Plus }                  from 'lucide-react';
import { useTasks }              from '../hooks/useTasks';
import { usePlannedTaskIds }     from '../hooks/usePlannedTaskIds';
import { TaskFilters }           from '../components/tasks/TaskFilters';
import { TaskCard }              from '../components/tasks/TaskCard';
import { TaskCardSkeleton }      from '../components/tasks/TaskCardSkeleton';
import { CreateTaskPanel }       from '../components/tasks/CreateTaskPanel';
import { colors, radius }        from '../styles/tokens';

const SKELETON_COUNT = 4;

export default function TasksPage() {
  const {
    tasks, isLoading, priorities,
    statusFilter,   setStatusFilter,
    priorityFilter, setPriorityFilter,
    search,         setSearch,
    createTask,     isCreating,
    updateStatus,   deleteTask,
  } = useTasks();

  const plannedIds               = usePlannedTaskIds();
  const [panelOpen,  setPanelOpen]  = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Compte les tâches non planifiées non terminées
  const unplannedCount = tasks.filter(
    t => t.status !== 'DONE' && !plannedIds.has(t.id)
  ).length;

  function handleMenuToggle(id: string) {
    setOpenMenuId(prev => prev === id ? null : id);
  }

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Tâches</h1>
          <div style={styles.headerSub}>
            <span style={styles.subtitle}>
              {isLoading ? '...' : `${tasks.length} tâche${tasks.length !== 1 ? 's' : ''}`}
            </span>
            {unplannedCount > 0 && !isLoading && (
              <span style={styles.unplannedCount}>
                {unplannedCount} non planifiée{unplannedCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setPanelOpen(true)} style={styles.addBtn}>
          <Plus size={18} />
          Nouvelle tâche
        </button>
      </div>

      {/* ── Filtres ── */}
      <div style={styles.filtersWrapper}>
        <TaskFilters
          search={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatus={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriority={setPriorityFilter}
          priorities={priorities}
        />
      </div>

      {/* ── Liste ── */}
      {isLoading ? (
        <div style={styles.list}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>Aucune tâche trouvée</p>
          <p style={styles.emptyHint}>
            {search ? 'Modifie ta recherche' : 'Crée ta première tâche'}
          </p>
          {!search && (
            <button onClick={() => setPanelOpen(true)} style={styles.emptyBtn}>
              <Plus size={16} />
              Créer une tâche
            </button>
          )}
        </div>
      ) : (
        <div
          style={styles.list}
          onClick={() => setOpenMenuId(null)}
        >
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isMenuOpen={openMenuId === task.id}
              isPlanned={plannedIds.has(task.id)}
              onMenuToggle={handleMenuToggle}
              onStatusChange={(id, status) => updateStatus({ id, status })}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}

      {/* ── Panel création ── */}
      <CreateTaskPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onCreate={createTask}
        isCreating={isCreating}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
    width:         '100%',
    minHeight:     'calc(100vh - 64px - 48px)',
  },
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            12,
    flexWrap:       'wrap',
  },
  title: {
    fontSize:      24,
    fontWeight:    800,
    color:         colors.dark,
    margin:        0,
    letterSpacing: '-0.02em',
  },
  headerSub: {
    display:    'flex',
    alignItems: 'center',
    gap:        10,
    marginTop:  4,
  },
  subtitle: {
    fontSize: 13,
    color:    colors.muted,
  },
  unplannedCount: {
    fontSize:     11,
    fontWeight:   700,
    color:        '#9b59b6',
    background:   '#9b59b615',
    padding:      '2px 10px',
    borderRadius: 20,
    border:       '1px dashed #9b59b640',
  },
  addBtn: {
    display:      'flex',
    alignItems:   'center',
    gap:          8,
    padding:      '10px 18px',
    background:   colors.primary,
    color:        'white',
    border:       'none',
    borderRadius: radius.md,
    fontSize:     14,
    fontWeight:   600,
    cursor:       'pointer',
    fontFamily:   'inherit',
    flexShrink:   0,
  },
  filtersWrapper: {
    background:   colors.white,
    borderRadius: radius.md,
    padding:      '14px 16px',
    border:       `1px solid ${colors.border}`,
    boxShadow:    '0 1px 3px rgba(13,31,51,0.06)',
  },
  list: {
    display:       'flex',
    flexDirection: 'column',
    gap:           8,
    flex:          1,
    overflow:      'visible',
  },
  empty: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '80px 24px',
    background:     colors.white,
    borderRadius:   radius.lg,
    border:         `1px solid ${colors.border}`,
    gap:            10,
    flex:           1,
  },
  emptyTitle: {
    fontSize:   16,
    fontWeight: 700,
    color:      colors.dark,
    margin:     0,
  },
  emptyHint: {
    fontSize: 13,
    color:    colors.muted,
    margin:   0,
  },
  emptyBtn: {
    display:      'flex',
    alignItems:   'center',
    gap:          6,
    marginTop:    8,
    padding:      '9px 18px',
    background:   colors.primary,
    color:        'white',
    border:       'none',
    borderRadius: radius.md,
    fontSize:     13,
    fontWeight:   600,
    cursor:       'pointer',
    fontFamily:   'inherit',
  },
};