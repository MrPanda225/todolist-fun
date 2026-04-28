import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, CalendarPlus } from 'lucide-react';
import { useCalendar }      from '../hooks/useCalendar';
import { BlockCard }        from '../components/calendar/BlockCard';
import { BlockPanel }       from '../components/calendar/BlockPanel';
import { CalendarSkeleton } from '../components/calendar/CalendarSkeleton';
import type { TimeBlock }   from '../api/timeBlocks.api';
import { colors, radius }   from '../styles/tokens';

const DAY_LABELS        = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 900;

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate()     === b.getDate()     &&
    a.getMonth()    === b.getMonth()    &&
    a.getFullYear() === b.getFullYear()
  );
}

function formatHeaderDate(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
  return `${start.toLocaleDateString('fr-FR', opts)} – ${end.toLocaleDateString('fr-FR', opts)}`;
}

// ─── DayColumn ────────────────────────────────────────────────────────────────
interface DayColumnProps {
  day:             Date;
  dayLabel:        string;
  isToday:         boolean;
  isDaySelected:   boolean;
  blocks:          TimeBlock[];
  selectedBlockId: string | null;
  visibleCount:    number;
  onDayClick:      () => void;
  onBlockClick:    (block: TimeBlock) => void;
  onAddClick:      () => void;
}

function DayColumn({
  day, dayLabel, isToday, isDaySelected,
  blocks, selectedBlockId, visibleCount,
  onDayClick, onBlockClick, onAddClick,
}: DayColumnProps) {
  const [colHovered, setColHovered] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const isEmpty = blocks.length === 0;

  return (
    <div
      style={styles.dayCol}
      onMouseEnter={() => setColHovered(true)}
      onMouseLeave={() => setColHovered(false)}
    >
      {/* ── En-tête jour cliquable ── */}
      <button
        onClick={onDayClick}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        style={{
          ...styles.dayHeader,
          background:  isToday
            ? colors.primary
            : headerHovered
            ? `${colors.primary}10`
            : colors.white,
          border: `1px solid ${
            isToday
              ? colors.primary
              : headerHovered
              ? colors.primary
              : colors.border
          }`,
          cursor:     'pointer',
          transition: 'background 0.2s, border-color 0.2s',
        }}
        aria-label={`Ajouter un bloc le ${dayLabel}`}
      >
        <span style={{
          ...styles.dayName,
          color: isToday ? 'white' : headerHovered ? colors.primary : colors.muted,
        }}>
          {dayLabel}
        </span>
        <span style={{
          ...styles.dayNum,
          color: isToday ? 'white' : headerHovered ? colors.primary : colors.dark,
        }}>
          {day.getDate()}
        </span>
        {/* Icône "+" au hover sur le header */}
        {headerHovered && !isToday && (
          <div style={{
            position:   'absolute',
            bottom:     4,
            right:      4,
            opacity:    0.6,
          }}>
            <Plus size={10} color={colors.primary} />
          </div>
        )}
      </button>

      {/* ── Zone blocs ── */}
      <div style={{
        ...styles.blocksArea,
        borderColor: isDaySelected
          ? colors.primary
          : colHovered
          ? `${colors.primary}40`
          : colors.border,
        background: isDaySelected
          ? `${colors.primary}04`
          : colors.white,
      }}>

        {/* Message si colonne vide */}
        {isEmpty && colHovered && (
          <div style={styles.emptyHint}>
            <CalendarPlus size={16} color={`${colors.primary}60`} />
            <span style={{ fontSize: 10, color: `${colors.primary}80` }}>
              Cliquer pour planifier
            </span>
          </div>
        )}

        {/* Blocs */}
        {blocks.map((block, bi) => (
          <BlockCard
            key={block.id}
            block={block}
            colorIdx={bi}
            isActive={selectedBlockId === block.id}
            onClick={() => onBlockClick(block)}
          />
        ))}

        {/* Bouton ajouter — visible au hover ou si jour sélectionné */}
        <button
          onClick={onAddClick}
          style={{
            ...styles.addBtn,
            borderColor: isDaySelected || colHovered
              ? colors.primary
              : colors.border,
            color:       isDaySelected || colHovered
              ? colors.primary
              : colors.muted,
            opacity:     colHovered || isDaySelected ? 1 : 0.5,
            marginTop:   isEmpty ? 0 : 'auto',
            background:  colHovered || isDaySelected
              ? `${colors.primary}06`
              : 'transparent',
          }}
          aria-label="Ajouter un bloc"
        >
          <Plus size={13} />
          {visibleCount <= 5 && (
            <span style={{ fontSize: 11, fontWeight: 600 }}>Ajouter</span>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── CalendarPage ─────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const {
    weekDays, getBlocksForDay,
    timeBlocks,
    unplannedTasks, isLoading, isCreating,
    createBlock, deleteBlock, assignTask, unassignTask,
    goToPrevWeek, goToNextWeek, goToToday,
  } = useCalendar();

  const [width, setWidth]                     = useState(window.innerWidth);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedDay,     setSelectedDay]     = useState<Date | null>(null);

  const selectedBlock = selectedBlockId
    ? timeBlocks.find(b => b.id === selectedBlockId) ?? null
    : null;

  useEffect(() => {
    function handleResize() { setWidth(window.innerWidth); }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const today        = new Date();
  const visibleCount = width < MOBILE_BREAKPOINT ? 3 : width < TABLET_BREAKPOINT ? 5 : 7;
  const todayIdx     = weekDays.findIndex(d => isSameDay(d, today));
  const startIdx     = Math.max(0, Math.min(
    todayIdx - Math.floor(visibleCount / 2),
    7 - visibleCount,
  ));
  const visibleDays = weekDays.slice(startIdx, startIdx + visibleCount);

  function openForDay(day: Date) {
    setSelectedBlockId(null);
    setSelectedDay(day);
  }

  function openForBlock(block: TimeBlock) {
    setSelectedDay(null);
    setSelectedBlockId(block.id);
  }

  function closePanel() {
    setSelectedBlockId(null);
    setSelectedDay(null);
  }

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Calendrier</h1>
          <p style={styles.subtitle}>
            {formatHeaderDate(weekDays[0], weekDays[6])}
          </p>
        </div>
        <div style={styles.nav}>
          <button onClick={goToToday} style={styles.todayBtn}>
            Aujourd'hui
          </button>
          <button onClick={goToPrevWeek} style={styles.navBtn}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={goToNextWeek} style={styles.navBtn}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Grille ── */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <div style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${visibleCount}, 1fr)`,
        }}>
          {visibleDays.map((day, i) => (
            <DayColumn
              key={i}
              day={day}
              dayLabel={DAY_LABELS[startIdx + i]}
              isToday={isSameDay(day, today)}
              isDaySelected={selectedDay ? isSameDay(selectedDay, day) : false}
              blocks={getBlocksForDay(day)}
              selectedBlockId={selectedBlockId}
              visibleCount={visibleCount}
              onDayClick={() => openForDay(day)}
              onBlockClick={openForBlock}
              onAddClick={() => openForDay(day)}
            />
          ))}
        </div>
      )}

      {/* ── Panel latéral ── */}
      <BlockPanel
        block={selectedBlock}
        selectedDay={selectedDay}
        unplannedTasks={unplannedTasks as any}
        isCreating={isCreating}
        onClose={closePanel}
        onCreate={createBlock}
        onDelete={deleteBlock}
        onAssignTask={async (blockId, taskId) => {
          await assignTask({ blockId, taskId });
        }}
        onUnassignTask={async (blockId, taskId) => {
          await unassignTask({ blockId, taskId });
        }}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
    height:        'calc(100vh - 64px - 48px)',
    minHeight:     400,
  },
  header: {
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    flexWrap:       'wrap',
    gap:            12,
    flexShrink:     0,
  },
  title: {
    fontSize:      22,
    fontWeight:    800,
    color:         colors.dark,
    margin:        0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 12,
    color:    colors.muted,
    margin:   '4px 0 0',
  },
  nav: {
    display:    'flex',
    alignItems: 'center',
    gap:        6,
  },
  todayBtn: {
    padding:      '7px 14px',
    background:   colors.white,
    border:       `1.5px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize:     13,
    fontWeight:   600,
    color:        colors.dark,
    cursor:       'pointer',
    fontFamily:   'inherit',
    transition:   'background 0.15s, border-color 0.15s',
  },
  navBtn: {
    width:          34,
    height:         34,
    background:     colors.white,
    border:         `1.5px solid ${colors.border}`,
    borderRadius:   radius.md,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    cursor:         'pointer',
    color:          colors.dark,
    padding:        0,
    transition:     'background 0.15s',
  },
  grid: {
    display:   'grid',
    gap:       8,
    flex:      1,
    minHeight: 0,
  },
  dayCol: {
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
    minWidth:      0,
    minHeight:     0,
  },
  dayHeader: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    padding:        '8px 4px',
    borderRadius:   radius.sm,
    gap:            2,
    flexShrink:     0,
    position:       'relative',
    fontFamily:     'inherit',
    border:         'none',
  },
  dayName: {
    fontSize:      10,
    fontWeight:    700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  dayNum: {
    fontSize:   18,
    fontWeight: 800,
    lineHeight: 1,
  },
  blocksArea: {
    display:       'flex',
    flexDirection: 'column',
    gap:           5,
    flex:          1,
    borderRadius:  radius.sm,
    border:        '1px solid',
    padding:       8,
    overflowY:     'auto',
    minHeight:     100,
    transition:    'border-color 0.2s, background 0.2s',
    position:      'relative',
  },
  emptyHint: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            4,
    padding:        '16px 8px',
    flex:           1,
    justifyContent: 'center',
    textAlign:      'center',
  },
  addBtn: {
    border:         '1.5px dashed',
    borderRadius:   6,
    padding:        '7px 8px',
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            4,
    flexShrink:     0,
    fontFamily:     'inherit',
    transition:     'all 0.2s ease',
  },
};