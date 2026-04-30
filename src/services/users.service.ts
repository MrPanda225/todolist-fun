import { usersApi, type UpdateProfilePayload } from '../api/users.api';
import { useAuthStore }                        from '../store/auth.store';

export const usersService = {
  async fetchProfile(): Promise<void> {
    const { data } = await usersApi.getMe();
    useAuthStore.getState().setUser(data);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<void> {
    const { data } = await usersApi.updateMe(payload);
    useAuthStore.getState().setUser(data);
  },
};