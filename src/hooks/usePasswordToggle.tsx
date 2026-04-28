import { useState } from 'react';

interface PasswordToggle {
  isVisible:        boolean;
  inputType:        'text' | 'password';
  toggleVisibility: () => void;
}

export function usePasswordToggle(): PasswordToggle {
  const [isVisible, setIsVisible] = useState(false);
  return {
    isVisible,
    inputType:        isVisible ? 'text' : 'password',
    toggleVisibility: () => setIsVisible(v => !v),
  };
}