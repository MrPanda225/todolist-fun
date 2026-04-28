import React                        from 'react';
import { Search }                   from 'lucide-react';
import type { StatusFilter, PriorityFilter } from '../../hooks/useTasks';
import type { Priority }            from '../../api/priorities.api';
import { colors, radius }           from '../../styles/tokens';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL',         label: 'Tout'     },
  { value: 'TODO',        label: 'À faire'  },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'DONE',        label: 'Terminé'  },
];

const PRIORITY_COLORS: Record<string, string> = {
  Critique: '#e74c3c',
  Haute:    '#e67e22',
  Normale:  '#2470BD',
  Faible:   '#27ae60',
};

interface TaskFiltersProps {
  search:         string;
  onSearch:       (v: string) => void;
  statusFilter:   StatusFilter;
  onStatus:       (v: StatusFilter) => void;
  priorityFilter: PriorityFilter;
  onPriority:     (v: PriorityFilter) => void;
  priorities:     Priority[];
}

export function TaskFilters({
  search, onSearch,
  statusFilter,   onStatus,
  priorityFilter, onPriority,
  priorities,
}: TaskFiltersProps) {
  return (
    <div style={styles.wrapper}>
      {/* ── Recherche ── */}
      <div style={styles.searchBox}>
        <Search size={15} color={colors.muted} style={styles.searchIcon} />
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Rechercher une tâche..."
          style={styles.searchInput}
        />
      </div>

      {/* ── Filtres statut + priorité ── */}
      <div style={styles.pillsRow}>
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onStatus(opt.value)}
            style={{
              ...styles.pill,
              background: statusFilter === opt.value ? colors.primary : colors.white,
              color:      statusFilter === opt.value ? 'white' : colors.muted,
              border:     `1.5px solid ${statusFilter === opt.value ? colors.primary : colors.border}`,
            }}
          >
            {opt.label}
          </button>
        ))}

        {/* Séparateur */}
        {priorities.length > 0 && (
          <div style={styles.separator} />
        )}

        {/* Pills priorité */}
        {priorities.length > 0 && (
          <>
            <button
              onClick={() => onPriority('ALL')}
              style={{
                ...styles.pill,
                background: priorityFilter === 'ALL' ? colors.dark : colors.white,
                color:      priorityFilter === 'ALL' ? 'white' : colors.muted,
                border:     `1.5px solid ${priorityFilter === 'ALL' ? colors.dark : colors.border}`,
              }}
            >
              Toutes
            </button>

            {priorities
              .slice()
              .sort((a, b) => b.level - a.level)
              .map(p => {
                const color   = PRIORITY_COLORS[p.label] ?? colors.primary;
                const active  = priorityFilter === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onPriority(p.id)}
                    style={{
                      ...styles.pill,
                      background: active ? color : colors.white,
                      color:      active ? 'white' : color,
                      border:     `1.5px solid ${color}`,
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display:       'flex',
    flexDirection: 'column',
    gap:           10,
  },
  searchBox: {
    position: 'relative',
  },
  searchIcon: {
    position:      'absolute',
    left:          12,
    top:           '50%',
    transform:     'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    width:        '100%',
    padding:      '9px 12px 9px 36px',
    border:       `1.5px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize:     14,
    color:        colors.dark,
    background:   colors.white,
    outline:      'none',
    boxSizing:    'border-box',
    fontFamily:   'inherit',
    transition:   'border-color 0.2s',
  },
  pillsRow: {
    display:    'flex',
    flexWrap:   'wrap',
    gap:        6,
    alignItems: 'center',
  },
  pill: {
    padding:      '6px 14px',
    borderRadius: radius.full,
    fontSize:     12,
    fontWeight:   600,
    cursor:       'pointer',
    transition:   'all 0.15s ease',
    fontFamily:   'inherit',
    whiteSpace:   'nowrap',
  },
  separator: {
    width:      1,
    height:     20,
    background: colors.border,
    margin:     '0 4px',
  },
};