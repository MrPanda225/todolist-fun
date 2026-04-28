import { api } from './axios.instance';

export type TaskStatus   = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id:          string;
  title:       string;
  description: string | null;
  status:      TaskStatus;
  xpReward:    number;
  dueDate:     string | null;
  priority:    { id: string; label: string; xpMultiplier: number } | null;
  category:    { id: string; name: string; color: string } | null;
  createdAt:   string;
  updatedAt:   string;
}

export interface CreateTaskPayload {
  title:       string;
  description?: string;
  xpReward?:   number;
  dueDate?:    string;
  priorityId?: string;
  categoryId?: string;
}

export const tasksApi = {
  getAll: () =>
    api.get<Task[]>('/tasks'),

  create: (payload: CreateTaskPayload) =>
    api.post<Task>('/tasks', payload),

  updateStatus: (id: string, status: TaskStatus) =>
    api.patch<Task>(`/tasks/${id}/status`, { status }),

  delete: (id: string) =>
    api.delete(`/tasks/${id}`),
};