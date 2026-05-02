import { api } from './axios.instance';

/** Format interne Decimal.js sérialisé par Prisma quand non converti par l'intercepteur */
type DecimalRaw = { s: number; e: number; d: number[] };

export interface Priority {
  id:           string;
  label:        string;
  level:        number;
  color:        string;
  icon:         string | null;
  xpMultiplier: number | DecimalRaw;
}

export const prioritiesApi = {
  getAll: () => api.get<Priority[]>('/priorities'),
};