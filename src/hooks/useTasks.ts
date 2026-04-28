import { useState }                              from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi }                              from '../api/tasks.api';
import { usePriorities }                         from './usePriorities';
import type {
  TaskStatus,
  CreateTaskPayload,
}                                                from '../types/task.types';

export type StatusFilter   = 'ALL' | TaskStatus;
export type PriorityFilter = 'ALL' | string;

export function useTasks() {
  const queryClient = useQueryClient();

  const [statusFilter,   setStatusFilter]   = useState<StatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [search,         setSearch]         = useState('');

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn:  () => tasksApi.getAll().then(r => r.data),
  });

  const { data: priorities = [], isLoading: prioritiesLoading } = usePriorities();

  const filtered = tasks.filter(t => {
    const matchStatus   = statusFilter   === 'ALL' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || t.priority?.id === priorityFilter;
    const matchSearch   = t.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.create(payload),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return {
    tasks:          filtered,
    allTasks:       tasks,
    isLoading:      tasksLoading || prioritiesLoading,
    priorities,
    statusFilter,   setStatusFilter,
    priorityFilter, setPriorityFilter,
    search,         setSearch,
    createTask:     (payload: CreateTaskPayload): Promise<void> =>
      createMutation.mutateAsync(payload).then(() => {}),
    isCreating:     createMutation.isPending,
    updateStatus:   (args: { id: string; status: TaskStatus }): Promise<void> =>
      updateStatusMutation.mutateAsync(args).then(() => {}),
    deleteTask:     (id: string): Promise<void> =>
      deleteMutation.mutateAsync(id).then(() => {}),
  };
}