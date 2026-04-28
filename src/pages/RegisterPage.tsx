import React, { useState }   from 'react';
import { Link }              from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { AuthLayout }        from '../components/layout/AuthLayout';
import { AuthIllustration }  from '../components/layout/AuthIllustration';
import { AuthLogo }          from '../components/ui/AuthLogo';
import { AuthField }         from '../components/ui/AuthField';
import { AuthButton }        from '../components/ui/AuthButton';
import { ErrorBanner }       from '../components/ui/ErrorBanner';
import { PasswordStrength }  from '../components/ui/PasswordStrength';
import { RegisterSteps }     from '../components/ui/RegisterSteps';
import { HumaaanCelebrating } from '../components/ui/illustrations/HumaaanCelebrating';
import { useAuth }           from '../hooks/useAuth';
import { useFormSubmit }     from '../hooks/useFormSubmit';
import { usePasswordToggle } from '../hooks/usePasswordToggle';
import { colors }            from '../styles/tokens';

const MIN_PASSWORD_LENGTH = 8;

interface RegisterForm {
  firstName: string;
  lastName:  string;
  username:  string;
  email:     string;
  password:  string;
}

const INITIAL_FORM: RegisterForm = {
  firstName: '', lastName: '', username: '', email: '', password: '',
};

export default function RegisterPage() {
  const { register }                 = useAuth();
  const { isLoading, error, submit } = useFormSubmit();
  const passwordToggle               = usePasswordToggle();
  const [form, setForm]              = useState<RegisterForm>(INITIAL_FORM);

  function updateField(field: keyof RegisterForm) {
    return (value: string) => setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < MIN_PASSWORD_LENGTH) return;
    submit(() => register(form));
  }

  return (
    <AuthLayout
      left={
        <AuthIllustration
          tagline={<>Commence à planifier<br />avec intention.</>}
          figure={<HumaaanCelebrating />}
          footer={<RegisterSteps />}
        />
      }
      right={
        <div style={styles.container} className="animate-fade-right">
          <div className="animate-fade-up delay-100"><AuthLogo /></div>

          <div className="animate-fade-up delay-200">
            <h1 style={styles.title}>Crée ton compte</h1>
            <p style={styles.subtitle}>C'est gratuit et prend moins d'une minute</p>
          </div>

          <div className="animate-fade-up delay-200">
            <ErrorBanner message={error} />
          </div>

          <form onSubmit={handleSubmit} noValidate style={styles.form}>
            <div style={styles.nameRow} className="animate-fade-up delay-200">
              <AuthField id="firstName" label="Prénom" type="text" value={form.firstName} onChange={updateField('firstName')} placeholder="Jean" autoComplete="given-name" required />
              <AuthField id="lastName"  label="Nom"    type="text" value={form.lastName}  onChange={updateField('lastName')}  placeholder="Dupont" autoComplete="family-name" required />
            </div>

            <div className="animate-fade-up delay-300">
              <AuthField id="username" label="Nom d'utilisateur" type="text" value={form.username} onChange={updateField('username')} placeholder="jean.dupont" autoComplete="username" required icon={<User size={18} />} />
            </div>

            <div className="animate-fade-up delay-300">
              <AuthField id="email" label="Adresse email" type="email" value={form.email} onChange={updateField('email')} placeholder="jean@exemple.com" autoComplete="email" required icon={<Mail size={18} />} />
            </div>

            <div className="animate-fade-up delay-400">
              <AuthField
                id="password" label="Mot de passe"
                type={passwordToggle.inputType}
                value={form.password} onChange={updateField('password')}
                placeholder="8 caractères minimum"
                autoComplete="new-password" required
                icon={<Lock size={18} />}
                rightSlot={
                  <button type="button" onClick={passwordToggle.toggleVisibility} style={styles.eyeBtn} aria-label="Afficher/masquer le mot de passe">
                    {passwordToggle.isVisible
                      ? <EyeOff size={18} color="#7a8a9a" />
                      : <Eye    size={18} color="#7a8a9a" />}
                  </button>
                }
              />
              <PasswordStrength password={form.password} minLength={MIN_PASSWORD_LENGTH} />
            </div>

            <div className="animate-fade-up delay-500">
              <AuthButton label="Créer mon compte 🚀" isLoading={isLoading} />
            </div>
          </form>

          <p style={styles.switchText} className="animate-fade-up delay-500">
            Déjà un compte ?{' '}
            <Link to="/login" style={styles.link}>Se connecter</Link>
          </p>
        </div>
      }
    />
  );
}

const styles: Record<string, React.CSSProperties> = {
  container:  { width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 },
  title:      { fontSize: 28, fontWeight: 700, color: colors.dark, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 },
  subtitle:   { fontSize: 14, color: colors.muted, margin: 0, marginTop: 6 },
  form:       { display: 'flex', flexDirection: 'column', gap: 14 },
  nameRow:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  eyeBtn:     { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  switchText: { textAlign: 'center', fontSize: 14, color: colors.muted, margin: 0 },
  link:       { color: colors.primary, fontWeight: 600, textDecoration: 'none' },
};