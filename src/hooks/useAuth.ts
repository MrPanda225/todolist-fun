import { useAuthStore } from '../store/auth.store';
import { authService }  from '../services/auth.service';
import type { LoginPayload, RegisterPayload } from '../types/auth.types';

export function useAuth() {
  const user            = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  return {
    user,
    isAuthenticated,
    login:    (payload: LoginPayload)    => authService.login(payload),
    register: (payload: RegisterPayload) => authService.register(payload),
    logout:   ()                         => authService.logout(),
  };
}