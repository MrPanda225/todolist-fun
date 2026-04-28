import { useQuery }        from '@tanstack/react-query';
import { prioritiesApi }   from '../api/priorities.api';

/** Charge les priorités depuis le backend — données stables, cache infini. */
export function usePriorities() {
  return useQuery({
    queryKey:  ['priorities'],
    queryFn:   () => prioritiesApi.getAll().then(r => r.data),
    staleTime: Infinity,
  });
}