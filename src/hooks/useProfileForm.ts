import { useState, useEffect } from 'react';
import { z }                   from 'zod';
import { useAuth }             from './useAuth';
import { usersService }        from '../services/users.service';
import { authService }         from '../services/auth.service';

const ProfileSchema = z.object({
  username:  z.string().min(3, 'Min. 3 caractères').max(50).trim(),
  firstName: z.string().min(1, 'Requis').max(100).trim(),
  lastName:  z.string().min(1, 'Requis').max(100).trim(),
});

type ProfileForm = z.infer<typeof ProfileSchema>;

export function useProfileForm() {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError]         = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm]           = useState<ProfileForm>({
    username:  user?.username  ?? '',
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName  ?? '',
  });

  /* Charge les données complètes depuis le backend au montage */
  useEffect(() => {
    async function fetchFullProfile() {
      try {
        await usersService.fetchProfile();
      } catch {
        // Silencieux — le store garde les données JWT
      } finally {
        setIsFetching(false);
      }
    }
    fetchFullProfile();
  }, []);

  /* Sync le form quand le store est hydraté */
  useEffect(() => {
    if (!isFetching) {
      setForm({
        username:  user?.username  ?? '',
        firstName: user?.firstName ?? '',
        lastName:  user?.lastName  ?? '',
      });
    }
  }, [isFetching, user]);

  function handleFieldChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setIsSuccess(false);
  }

  function handleCancelEdit() {
    setForm({
      username:  user?.username  ?? '',
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
    });
    setIsEditing(false);
    setError('');
  }

  async function handleSave() {
    const result = ProfileSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await usersService.updateProfile(result.data);
      setIsSuccess(true);
      setIsEditing(false);
    } catch (e: unknown) {
      setError(authService.extractError(e));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    isEditing,
    isLoading,
    isFetching,
    error,
    isSuccess,
    setIsEditing,
    handleFieldChange,
    handleCancelEdit,
    handleSave,
  };
}