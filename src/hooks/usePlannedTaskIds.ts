import { useQuery } from '@tanstack/react-query';
import { timeBlocksApi } from '../api/timeBlocks.api';

/** Retourne un Set des IDs de tâches déjà assignées à un bloc. */
export function usePlannedTaskIds(): Set<string> {
  const { data: timeBlocks = [] } = useQuery({
    queryKey:  ['time-blocks'],
    queryFn:   () => timeBlocksApi.getAll().then(r => r.data),
    staleTime: 30_000,
  });

  return new Set(
    timeBlocks.flatMap(b => b.tasks.map(t => t.id))
  );
}