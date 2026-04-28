import React, { useState }   from 'react';
import { Link }              from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout }        from '../components/layout/AuthLayout';
import { AuthIllustration }  from '../components/layout/AuthIllustration';
import { AuthLogo }          from '../components/ui/AuthLogo';
import { AuthField }         from '../components/ui/AuthField';
import { AuthButton }        from '../components/ui/AuthButton';
import { ErrorBanner }       from '../components/ui/ErrorBanner';
import { LoginStats }        from '../components/ui/LoginStats';
import { HumaaanPointing }   from '../components/ui/illustrations/HumaaanPointing';
import { useAuth }           from '../hooks/useAuth';
import { useFormSubmit }     from '../hooks/useFormSubmit';
import { usePasswordToggle } from '../hooks/usePasswordToggle';
import { colors }            from '../styles/tokens';

export default function LoginPage() {
  const { login }                    = useAuth();
  const { isLoading, error, submit } = useFormSubmit();
  const passwordToggle               = usePasswordToggle();
  const [email, setEmail]            = useState('');
  const [password, setPassword]      = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(() => login({ email, password }));
  }

  return (
    <AuthLayout
      left={
        <AuthIllustration
          tagline={<>Reprends le contrôle<br />de tes journées.</>}
          figure={<HumaaanPointing />}
          footer={<LoginStats />}
        />
      }
      right={
        <div style={styles.container} className="animate-fade-right">
          <div className="animate-fade-up delay-100"><AuthLogo /></div>

          <div className="animate-fade-up delay-200">
            <h1 style={styles.title}>Content de te revoir</h1>
            <p style={styles.subtitle}>Connecte-toi pour retrouver tes tâches</p>
          </div>

          <div className="animate-fade-up delay-200">
            <ErrorBanner message={error} />
          </div>

          <form onSubmit={handleSubmit} noValidate style={styles.form}>
            <div className="animate-fade-up delay-300">
              <AuthField
                id="email" label="Adresse email" type="email"
                value={email} onChange={setEmail}
                placeholder="toi@exemple.com"
                autoComplete="email" required
                icon={<Mail size={18} />}
              />
            </div>

            <div className="animate-fade-up delay-400">
              <AuthField
                id="password" label="Mot de passe"
                type={passwordToggle.inputType}
                value={password} onChange={setPassword}
                placeholder="••••••••"
                autoComplete="current-password" required
                icon={<Lock size={18} />}
                rightSlot={
                  <button
                    type="button"
                    onClick={passwordToggle.toggleVisibility}
                    style={styles.eyeBtn}
                    aria-label="Afficher/masquer le mot de passe"
                  >
                    {passwordToggle.isVisible
                      ? <EyeOff size={18} color="#7a8a9a" />
                      : <Eye    size={18} color="#7a8a9a" />}
                  </button>
                }
              />
            </div>

            <div className="animate-fade-up delay-500">
              <AuthButton label="Se connecter" isLoading={isLoading} />
            </div>
          </form>

          <p style={styles.switchText} className="animate-fade-up delay-500">
            Pas encore de compte ?{' '}
            <Link to="/register" style={styles.link}>Créer un compte</Link>
          </p>
        </div>
      }
    />
  );
}

const styles: Record<string, React.CSSProperties> = {
  container:  { width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 },
  title:      { fontSize: 30, fontWeight: 700, color: colors.dark, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 },
  subtitle:   { fontSize: 15, color: colors.muted, margin: 0, marginTop: 6 },
  form:       { display: 'flex', flexDirection: 'column', gap: 14 },
  eyeBtn:     { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  switchText: { textAlign: 'center', fontSize: 14, color: colors.muted, margin: 0 },
  link:       { color: colors.primary, fontWeight: 600, textDecoration: 'none' },
};