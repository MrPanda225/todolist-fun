import { useState }                              from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeBlocksApi, type CreateTimeBlockPayload } from '../api/timeBlocks.api';
import { tasksApi }                              from '../api/tasks.api';

function getWeekDays(baseDate: Date): Date[] {
  const day    = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate()     === b.getDate()     &&
    a.getMonth()    === b.getMonth()    &&
    a.getFullYear() === b.getFullYear()
  );
}

export function useCalendar() {
  const queryClient               = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = getWeekDays(currentDate);

  const { data: timeBlocks = [], isLoading: blocksLoading } = useQuery({
    queryKey: ['time-blocks'],
    queryFn:  () => timeBlocksApi.getAll().then(r => r.data),
  });

  const { data: allTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn:  () => tasksApi.getAll().then(r => r.data),
  });

  const assignedTaskIds = new Set(
    timeBlocks.flatMap(b => b.tasks.map(t => t.id))
  );

  const unplannedTasks = allTasks.filter(
    t => t.status !== 'DONE' && !assignedTaskIds.has(t.id)
  );

  function getBlocksForDay(date: Date) {
    return timeBlocks
      .filter(b => {
        const blockDate = b.date ? new Date(b.date) : new Date(b.startTime);
        return isSameDay(blockDate, date);
      })
      .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateTimeBlockPayload) =>
      timeBlocksApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['time-blocks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => timeBlocksApi.delete(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['time-blocks'] }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ blockId, taskId }: { blockId: string; taskId: string }) =>
      timeBlocksApi.assignTask(blockId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const unassignMutation = useMutation({
    mutationFn: ({ blockId, taskId }: { blockId: string; taskId: string }) =>
      timeBlocksApi.unassignTask(blockId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  function goToPrevWeek() {
    setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
  }

  function goToNextWeek() {
    setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
  }

  function goToToday() { setCurrentDate(new Date()); }

  return {
        weekDays,
        currentDate,
        timeBlocks,
        unplannedTasks,
        getBlocksForDay,
        isLoading:    blocksLoading || tasksLoading,

        createBlock:  (payload: CreateTimeBlockPayload): Promise<void> =>
            createMutation.mutateAsync(payload).then(() => {}),
        isCreating:   createMutation.isPending,

        deleteBlock:  (id: string): Promise<void> =>
            deleteMutation.mutateAsync(id).then(() => {}),

        assignTask:   (args: { blockId: string; taskId: string }): Promise<void> =>
            assignMutation.mutateAsync(args).then(() => {}),

        unassignTask: (args: { blockId: string; taskId: string }): Promise<void> =>
            unassignMutation.mutateAsync(args).then(() => {}),

        goToPrevWeek,
        goToNextWeek,
        goToToday,
    };
}