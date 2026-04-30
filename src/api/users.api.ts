import { api }       from './axios.instance';
import type { User } from '../types/auth.types';

export interface UpdateProfilePayload {
  username?:  string;
  firstName?: string;
  lastName?:  string;
}

export const usersApi = {
  getMe:    ()                               => api.get<User>('/users/me'),
  updateMe: (payload: UpdateProfilePayload)  => api.patch<User>('/users/me', payload),
};