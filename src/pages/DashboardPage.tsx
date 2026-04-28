import React, { useEffect, useState } from 'react';
import { CheckSquare, ListTodo }      from 'lucide-react';
import { useDashboard }               from '../hooks/useDashboard';
import { KpiCard }                    from '../components/dashboard/KpiCard';
import { StreakCard }                  from '../components/dashboard/StreakCard';
import { XpCard }                     from '../components/dashboard/XpCard';
import { TodayTasks }                 from '../components/dashboard/TodayTasks';
import { ProgressPanel }              from '../components/dashboard/ProgressPanel';
import { DashboardSkeleton }          from '../components/dashboard/DashboardSkeleton';

const MOBILE_BREAKPOINT = 768;

export default function DashboardPage() {
  const {
    stats, nextLevel, achievements,
    allTasks, todayTasks,
    doneTodayCount, inProgressCount,
    isLoading,
  } = useDashboard();

  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const xp               = stats?.totalXp         ?? 0;
  const level            = stats?.level            ?? 1;
  const streak           = stats?.currentStreak    ?? 0;
  const lastActivityDate = stats?.lastActivityDate ?? null;

  return (
    <div style={styles.page}>

      {/* ── KPI Cards ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap:                 12,
      }}>
        <StreakCard
          streak={streak}
          lastActiveDate={lastActivityDate}
        />
        <KpiCard
          label="Tâches complétées"
          value={doneTodayCount}
          icon={<CheckSquare size={18} />}
          sub="Aujourd'hui"
          accent="#27ae60"
        />
        {!isMobile && (
          <>
            <KpiCard
              label="En cours"
              value={inProgressCount}
              icon={<ListTodo size={18} />}
              sub={`${todayTasks.length} tâches au total`}
              accent="#f39c12"
            />
            <XpCard
              xp={xp}
              level={level}
              nextLevel={nextLevel}
            />
          </>
        )}
      </div>

      {/* ── Contenu principal ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
        gap:                 16,
        alignItems:          'start',
      }}>
        <TodayTasks tasks={todayTasks} />
        {!isMobile && (
          <ProgressPanel
            level={level}
            xp={xp}
            nextLevel={nextLevel}
            achievements={achievements}
            allTasks={allTasks}
          />
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
    maxWidth:      1200,
  },
};