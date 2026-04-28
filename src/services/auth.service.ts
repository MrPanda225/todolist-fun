import { authApi }      from '../api/auth.api';
import { tokenUtils }   from '../api/axios.instance';
import { useAuthStore } from '../store/auth.store';
import type { LoginPayload, RegisterPayload } from '../types/auth.types';
import { AxiosError }   from 'axios';
import type { ApiError } from '../types/api.types';

export const authService = {

  async login(payload: LoginPayload): Promise<void> {
    const { data } = await authApi.login(payload);
    tokenUtils.set(data.accessToken);
    await authService.fetchProfile();
  },

  async register(payload: RegisterPayload): Promise<void> {
    const { data } = await authApi.register(payload);
    tokenUtils.set(data.accessToken);
    await authService.fetchProfile();
  },

  async logout(): Promise<void> {
    const { clearAuth } = useAuthStore.getState();
    tokenUtils.clear();
    clearAuth();
    try {
      await authApi.logout();
    } catch {
      // Silencieux — session locale déjà nettoyée
    }
  },

  /**
   * Décode le JWT et hydrate le store sans appel réseau.
   */
  async fetchProfile(): Promise<void> {
    const token = tokenUtils.get();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      useAuthStore.getState().setUser({
        id:        payload.sub       ?? '',
        username:  payload.username  ?? '',
        email:     payload.email     ?? '',
        firstName: payload.firstName ?? '',
        lastName:  payload.lastName  ?? '',
        createdAt: payload.createdAt ?? '',
      });
    } catch {
      tokenUtils.clear();
      useAuthStore.getState().clearAuth();
    }
  },

  /**
   * Restaure la session via le cookie refresh_token au démarrage.
   * Silencieux si aucune session active.
   */
  async tryRestoreSession(): Promise<void> {
    const { clearAuth, setRestoring } = useAuthStore.getState();
    try {
      const { data } = await authApi.refresh();
      tokenUtils.set(data.accessToken);
      await authService.fetchProfile();
    } catch {
      clearAuth();
    } finally {
      setRestoring(false);
    }
  },

  extractError(error: unknown): string {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiError;

      if (data?.message) return data.message;

      if (data?.formErrors?.[0]) return data.formErrors[0];

      if (data?.fieldErrors) {
        const firstField = Object.values(data.fieldErrors)[0];
        if (Array.isArray(firstField) && firstField[0]) return firstField[0];
      }
    }
    return 'Une erreur est survenue';
  },
};