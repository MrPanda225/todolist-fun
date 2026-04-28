import { api } from './axios.instance';

export interface Category {
  id:    string;
  name:  string;
  color: string;
}

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
};