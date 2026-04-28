import { api } from './axios.instance';
import type { LoginPayload, RegisterPayload, AuthTokens } from '../types/auth.types';

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthTokens>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<AuthTokens>('/auth/login', payload),

  refresh: () =>
    api.post<AuthTokens>('/auth/refresh'),

  logout: () =>
    api.post('/auth/logout'),
};