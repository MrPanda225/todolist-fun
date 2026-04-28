import { useQuery }        from '@tanstack/react-query';
import { gamificationApi } from '../api/gamification.api';
import { tasksApi }        from '../api/tasks.api';

function isToday(dateStr: string): boolean {
  const date  = new Date(dateStr);
  const today = new Date();
  return (
    date.getDate()     === today.getDate()     &&
    date.getMonth()    === today.getMonth()    &&
    date.getFullYear() === today.getFullYear()
  );
}

export function useDashboard() {
  const statsQuery = useQuery({
    queryKey: ['gamification', 'stats'],
    queryFn:  () => gamificationApi.getStats().then(r => r.data),
  });

  const nextLevelQuery = useQuery({
    queryKey: ['gamification', 'next-level'],
    queryFn:  () => gamificationApi.getNextLevel().then(r => r.data),
  });

  const achievementsQuery = useQuery({
    queryKey: ['gamification', 'achievements'],
    queryFn:  () => gamificationApi.getAchievements().then(r => r.data),
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn:  () => tasksApi.getAll().then(r => r.data),
  });

  const allTasks        = tasksQuery.data ?? [];
  const todayTasks      = allTasks.filter(t => t.dueDate && isToday(t.dueDate));
  const doneTodayCount  = todayTasks.filter(t => t.status === 'DONE').length;
  const inProgressCount = allTasks.filter(t => t.status === 'IN_PROGRESS').length;

  // Calcule depuis current/next retournés par le backend
  const current  = nextLevelQuery.data?.current ?? 0;
  const next     = nextLevelQuery.data?.next    ?? 1;
  const xpToNext = Math.max(0, next - current);
  const pct      = next > 0 ? Math.min(100, (current / next) * 100) : 0;

  return {
    stats:          statsQuery.data,
    nextLevel:      nextLevelQuery.data
      ? { xpToNextLevel: xpToNext, progressPct: pct }
      : undefined,
    achievements:   achievementsQuery.data ?? [],
    allTasks,
    todayTasks,
    doneTodayCount,
    inProgressCount,
    isLoading:      statsQuery.isLoading || tasksQuery.isLoading,
  };
}