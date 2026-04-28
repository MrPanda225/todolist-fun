import { api } from './axios.instance';

export interface TimeBlock {
  id:        string;
  title:     string;
  startTime: string;
  endTime:   string;
  date:      string;
  color:     string | null;
  tasks:     { id: string; title: string; status: string }[];
}

export interface CreateTimeBlockPayload {
  title:     string;
  startTime: string; // ISO complet : "2026-04-27T18:30:00.000Z"
  endTime:   string; // ISO complet : "2026-04-27T19:15:00.000Z"
  date:      string; // "2026-04-27"
}

export const timeBlocksApi = {
  getAll: () =>
    api.get<TimeBlock[]>('/time-blocks'),

  create: (payload: CreateTimeBlockPayload) =>
    api.post<TimeBlock>('/time-blocks', payload),

  delete: (id: string) =>
    api.delete(`/time-blocks/${id}`),

  assignTask: (blockId: string, taskId: string) =>
    api.post(`/time-blocks/${blockId}/tasks/${taskId}`),

  unassignTask: (blockId: string, taskId: string) =>
    api.delete(`/time-blocks/${blockId}/tasks/${taskId}`),
};