import React from 'react';

interface AuthLayoutProps {
  left:  React.ReactNode;
  right: React.ReactNode;
}

/** Layout split-screen partagé par toutes les pages d'authentification. */
export function AuthLayout({ left, right }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-left">{left}</div>
      <div className="auth-right">{right}</div>
    </div>
  );
}