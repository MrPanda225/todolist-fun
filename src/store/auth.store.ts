import { create } from 'zustand';
import type { User } from '../types/auth.types';

interface AuthState {
  user:            User | null;
  isAuthenticated: boolean;
  isRestoring:     boolean;
  setUser:         (user: User) => void;
  clearAuth:       () => void;
  setRestoring:    (restoring: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  isAuthenticated: false,
  isRestoring:     true,

  setUser:      (user)        => set({ user, isAuthenticated: true }),
  clearAuth:    ()            => set({ user: null, isAuthenticated: false }),
  setRestoring: (isRestoring) => set({ isRestoring }),
}));