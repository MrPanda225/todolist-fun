export type TaskStatus   = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Priority {
  id:            string;
  label:         string;
  xpMultiplier:  number;
}

export interface Category {
  id:    string;
  name:  string;
  color: string;
}

export interface Task {
  id:          string;
  title:       string;
  description: string | null;
  status:      TaskStatus;
  xpReward:    number;
  dueDate:     string | null;
  priority:    Priority | null;
  category:    Category | null;
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

export interface UpdateTaskPayload {
  title?:       string;
  description?: string;
  xpReward?:    number;
  dueDate?:     string;
  priorityId?:  string;
  categoryId?:  string;
}