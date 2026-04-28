import React, { useEffect, useRef } from 'react';
import { colors, radius }           from '../../styles/tokens';

interface StreakCardProps {
  streak:         number;
  lastActiveDate: string | null;
}

function computeWeekActivity(streak: number, lastActiveDate: string | null): boolean[] {
  const result = Array(7).fill(false);
  if (streak === 0 || !lastActiveDate) return result;

  const today    = new Date();
  const last     = new Date(lastActiveDate);
  const todayDay = today.getDay();
  const todayIdx = todayDay === 0 ? 6 : todayDay - 1;

  const todayMs  = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const lastMs   = new Date(last.getFullYear(),  last.getMonth(),  last.getDate()).getTime();
  const diffDays = Math.floor((todayMs - lastMs) / 86_400_000);

  if (diffDays > 1) return result;

  const activeDays = Math.min(streak, todayIdx + 1);
  for (let i = 0; i < activeDays; i++) {
    result[todayIdx - i] = true;
  }
  return result;
}

export function StreakCard({ streak, lastActiveDate }: StreakCardProps) {
  const flameRef = useRef<HTMLDivElement>(null);
  const isActive = streak > 0;
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const activity = computeWeekActivity(streak, lastActiveDate);

  const todayIdx = (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  })();

  useEffect(() => {
    if (!flameRef.current || !isActive) return;
    const el = flameRef.current;
    let rafId: number;
    let start: number | null = null;

    function animate(ts: number) {
      if (!start) start = ts;
      const t     = (ts - start) / 1000;
      const scale = 1 + Math.sin(t * 2.5) * 0.08;
      const rot   = Math.sin(t * 3)       * 4;
      el.style.transform = `scale(${scale}) rotate(${rot}deg)`;
      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isActive]);

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <span style={styles.label}>Streak</span>
        <div
          ref={flameRef}
          style={{
            fontSize:        22,
            transformOrigin: 'bottom center',
            display:         'inline-block',
            filter:          isActive ? 'none' : 'grayscale(1)',
            opacity:         isActive ? 1 : 0.4,
          }}
        >
          🔥
        </div>
      </div>

      <div style={{ ...styles.value, color: isActive ? '#e67e22' : colors.muted }}>
        {streak}
      </div>

      <span style={styles.sub}>
        {streak === 0
          ? "Commence aujourd'hui !"
          : streak === 1
          ? '1 jour consécutif'
          : `${streak} jours`}
      </span>

      {/* ── Grille 7 jours ── */}
      <div style={styles.grid}>
        {weekDays.map((day, i) => {
          const active  = activity[i];
          const isToday = i === todayIdx;

          return (
            <div key={i} style={styles.dayCol}>
              <div style={{
                ...styles.dot,
                background: active ? '#e67e22' : `${colors.border}80`,
                boxShadow:  active ? '0 0 6px rgba(230,126,34,0.5)' : 'none',
                border:     isToday && !active
                  ? `2px dashed ${colors.muted}`
                  : '2px solid transparent',
              }} />
              <span style={{
                ...styles.dayLabel,
                color:      isToday ? colors.dark : colors.muted,
                fontWeight: isToday ? 700 : 400,
              }}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background:    colors.white,
    borderRadius:  radius.lg,
    padding:       '16px 18px',
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
    boxShadow:     '0 1px 4px rgba(13,31,51,0.07)',
    border:        `1px solid ${colors.border}`,
    flex:          1,
    minWidth:      0,
  },
  top: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize:      11,
    fontWeight:    600,
    color:         colors.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  value: {
    fontSize:      24,
    fontWeight:    800,
    letterSpacing: '-0.03em',
    lineHeight:    1,
  },
  sub: {
    fontSize: 11,
    color:    colors.muted,
  },
  grid: {
    display:   'flex',
    gap:       4,
    marginTop: 4,
  },
  dayCol: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           3,
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: '50%',
    transition:   'background 0.3s, box-shadow 0.3s',
  },
  dayLabel: {
    fontSize: 9,
  },
};