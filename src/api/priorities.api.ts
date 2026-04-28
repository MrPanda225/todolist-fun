import { api } from './axios.instance';

export interface Priority {
  id:           string;
  label:        string;
  level:        number;
  color:        string;
  icon:         string | null;
  xpMultiplier: number | { s: number; e: number; d: number[] };
}

export const prioritiesApi = {
  getAll: () => api.get<Priority[]>('/priorities'),
};