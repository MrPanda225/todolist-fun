import { useState } from 'react';
import { authService } from '../services/auth.service';

interface FormSubmitState {
  isLoading: boolean;
  error:     string;
  submit:    (action: () => Promise<void>) => Promise<void>;
}

/** Gère l'état de soumission d'un formulaire — loading, erreur, reset. */
export function useFormSubmit(): FormSubmitState {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  async function submit(action: () => Promise<void>): Promise<void> {
    setError('');
    setIsLoading(true);
    try {
      await action();
    } catch (err) {
      setError(authService.extractError(err));
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, submit };
}