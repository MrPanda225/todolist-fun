import React, { useEffect, useRef, useState } from 'react';
import { Mail, Calendar, Edit2, Check, X, Shield, Zap, Flame, Lock } from 'lucide-react';
import { useAuth }         from '../hooks/useAuth';
import { useProfileForm }  from '../hooks/useProfileForm';
import { useQuery }        from '@tanstack/react-query';
import { gamificationApi } from '../api/gamification.api';

// ─── Tokens ──────────────────────────────────────────────────────────────────
const C = {
  dark:        '#0D1F33',
  darkMid:     '#1a3a5c',
  primary:     '#2470BD',
  primarySoft: '#EBF3FC',
  bg:          '#F0F3F8',
  surface:     '#F8FAFC',
  muted:       '#64748B',
  border:      '#E2E8F0',
  amber:       '#F59E0B',
  amberSoft:   '#FEF3C7',
  green:       '#10B981',
  greenSoft:   '#D1FAE5',
  error:       '#EF4444',
  errorSoft:   '#FEF2F2',
} as const;

const MOBILE = 680;

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user }   = useAuth();
  const {
    form, isEditing, isLoading, isFetching, error, isSuccess,
    setIsEditing, handleFieldChange, handleCancelEdit, handleSave,
  } = useProfileForm();

  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE);

  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < MOBILE); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Stats réelles depuis le backend
  const statsQuery = useQuery({
    queryKey: ['gamification', 'stats'],
    queryFn:  () => gamificationApi.getStats().then(r => r.data),
  });
  const nextLevelQuery = useQuery({
    queryKey: ['gamification', 'next-level'],
    queryFn:  () => gamificationApi.getNextLevel().then(r => r.data),
  });

  const xp     = statsQuery.data?.totalXp      ?? 0;
  const level  = statsQuery.data?.level        ?? 1;
  const streak = statsQuery.data?.currentStreak ?? 0;

  const current = nextLevelQuery.data?.current ?? 0;
  const next    = nextLevelQuery.data?.next    ?? 1;
  const pct     = next > 0 ? Math.min(100, (current / next) * 100) : 0;

  // Animations entrée
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isFetching) return;
    import('animejs').then(mod => {
      const anime = (mod.default ?? mod) as any;
      anime({
        targets:    '.profile-section',
        opacity:    [0, 1],
        translateY: [16, 0],
        delay:      anime.stagger(80),
        duration:   500,
        easing:     'easeOutExpo',
      });
    });
  }, [isFetching]);

  const joinDate   = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '—';
  const initial    = (user?.username?.charAt(0) ?? 'U').toUpperCase();
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username ?? '—';

  if (isFetching) {
    return (
      <div style={s.page}>
        <ProfilePageSkeleton isMobile={isMobile} />
      </div>
    );
  }

  return (
    <div ref={pageRef} style={s.page}>

      {/* ── Header ── */}
      <div className="profile-section" style={{ opacity: 0, ...s.pageHeader }}>
        <div>
          <h1 style={s.pageTitle}>Mon profil</h1>
          <p style={s.pageSub}>Ton identité dans Questly</p>
        </div>
        {isSuccess && (
          <div style={s.successBadge}>
            <Check size={13} /> Profil mis à jour
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div style={{
        ...s.grid,
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(240px, 280px) 1fr',
      }}>

        {/* ── Colonne gauche ── */}
        <div style={s.leftCol}>

          {/* Hero card */}
          <div className="profile-section" style={{ opacity: 0, ...s.heroCard }}>
            {/* Avatar */}
            <div style={s.avatarWrap}>
              <svg style={s.avatarRingSvg} viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="44" fill="none"
                  stroke={C.primary} strokeWidth="2" strokeDasharray="70 207"
                  strokeLinecap="round" opacity="0.6" />
                <circle cx="48" cy="48" r="44" fill="none"
                  stroke={C.amber} strokeWidth="2" strokeDasharray="40 237"
                  strokeDashoffset="90" strokeLinecap="round" opacity="0.8" />
              </svg>
              <div style={s.avatarInner}>{initial}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={s.heroName}>{displayName}</div>
              <div style={s.heroUsername}>@{user?.username}</div>
            </div>

            {/* Stats pills */}
            <div style={s.statRow}>
              <StatPill
                icon={<Shield size={11} />}
                label={`Niv. ${level}`}
                color={C.primary}
                bg={C.primarySoft}
              />
              <StatPill
                icon={<Zap size={11} />}
                label={`${xp} XP`}
                color={C.amber}
                bg={C.amberSoft}
              />
              <StatPill
                icon={<Flame size={11} />}
                label={`${streak}j`}
                color={C.green}
                bg={C.greenSoft}
              />
            </div>

            {/* Barre XP */}
            <div style={s.xpSection}>
              <div style={s.xpLabelRow}>
                <span style={s.xpLabel}>Progression niveau {level + 1}</span>
                <span style={{ ...s.xpLabel, color: C.primary, fontWeight: 700 }}>
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div style={s.xpTrack}>
                <div style={{ ...s.xpFill, width: `${pct}%` }} />
              </div>
            </div>
          </div>

          {/* Meta card */}
          <div className="profile-section" style={{ opacity: 0, ...s.metaCard }}>
            <div style={s.metaItem}>
              <Mail size={14} color={C.muted} />
              <span style={s.metaText}>{user?.email ?? '—'}</span>
            </div>
            <div style={s.metaDivider} />
            <div style={s.metaItem}>
              <Calendar size={14} color={C.muted} />
              <span style={s.metaText}>Membre depuis {joinDate}</span>
            </div>
          </div>
        </div>

        {/* ── Colonne droite ── */}
        <div className="profile-section" style={{ opacity: 0, ...s.formCard }}>
          <div style={s.formHeader}>
            <span style={s.formTitle}>Informations</span>
            {!isEditing && (
              <ActionButton onClick={() => setIsEditing(true)}>
                <Edit2 size={13} /> Modifier
              </ActionButton>
            )}
          </div>

          <div style={s.fields}>
            {/* Prénom + Nom */}
            <div style={{
              display:             'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap:                 14,
            }}>
              <ProfileField
                label="Prénom"
                name="firstName"
                value={form.firstName}
                maxLength={100}
                isEditing={isEditing}
                onChange={handleFieldChange}
              />
              <ProfileField
                label="Nom"
                name="lastName"
                value={form.lastName}
                maxLength={100}
                isEditing={isEditing}
                onChange={handleFieldChange}
              />
            </div>

            <ProfileField
              label="Nom d'utilisateur"
              name="username"
              value={form.username}
              maxLength={50}
              isEditing={isEditing}
              onChange={handleFieldChange}
            />

            {/* Email — verrouillé */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Email</label>
              <div style={s.lockedField}>
                <Mail size={13} color={C.muted} />
                <span style={s.lockedText}>{user?.email}</span>
                <span style={s.lockedBadge}>
                  <Lock size={9} /> Verrouillé
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div style={s.errorBox}>
              <X size={13} color={C.error} /> {error}
            </div>
          )}

          {isEditing && (
            <div style={s.formActions}>
              <ActionButton variant="ghost" onClick={handleCancelEdit} disabled={isLoading}>
                <X size={13} /> Annuler
              </ActionButton>
              <ActionButton variant="dark" onClick={handleSave} disabled={isLoading}>
                {isLoading
                  ? <><Spinner /> Enregistrement…</>
                  : <><Check size={13} /> Enregistrer</>}
              </ActionButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton inline ──────────────────────────────────────────────────────────
function ProfilePageSkeleton({ isMobile }: { isMobile: boolean }) {
  const shimmer: React.CSSProperties = {
    background:         `linear-gradient(90deg, ${C.border} 25%, #f0f3f8 50%, ${C.border} 75%)`,
    backgroundSize:     '200% 100%',
    animation:          'skeleton-shimmer 1.4s infinite',
    borderRadius:       8,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ ...shimmer, width: 120, height: 24 }} />
        <div style={{ ...shimmer, width: 180, height: 13 }} />
      </div>
      <div style={{
        display:             'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(240px, 280px) 1fr',
        gap:                 16,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...s.heroCard, gap: 16 }}>
            <div style={{ ...shimmer, width: 88, height: 88, borderRadius: '50%', alignSelf: 'center',
              background: 'rgba(255,255,255,0.10)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 120, height: 16, borderRadius: 6,
                background: 'rgba(255,255,255,0.12)', animation: 'skeleton-shimmer 1.4s infinite' }} />
              <div style={{ width: 80, height: 12, borderRadius: 4,
                background: 'rgba(255,255,255,0.08)', animation: 'skeleton-shimmer 1.4s infinite' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[70, 70, 60].map((w, i) => (
                <div key={i} style={{ width: w, height: 26, borderRadius: 999,
                  background: 'rgba(255,255,255,0.10)', animation: 'skeleton-shimmer 1.4s infinite' }} />
              ))}
            </div>
          </div>
          <div style={{ ...s.metaCard }}>
            <div style={{ ...shimmer, width: '70%', height: 12 }} />
            <div style={s.metaDivider} />
            <div style={{ ...shimmer, width: '60%', height: 12 }} />
          </div>
        </div>
        <div style={s.formCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ ...shimmer, width: 110, height: 18 }} />
            <div style={{ ...shimmer, width: 90, height: 34, borderRadius: 10 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[['50%', '50%'], ['100%'], ['100%']].map((widths, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: widths.length > 1 ? '1fr 1fr' : '1fr', gap: 14 }}>
                {widths.map((_, j) => (
                  <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div style={{ ...shimmer, width: 60, height: 10 }} />
                    <div style={{ ...shimmer, width: '100%', height: 42, borderRadius: 10 }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── StatPill ─────────────────────────────────────────────────────────────────
function StatPill({ icon, label, color, bg }: {
  icon: React.ReactNode; label: string; color: string; bg: string;
}) {
  return (
    <div style={{ ...s.statPill, background: bg }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ ...s.statLabel, color }}>{label}</span>
    </div>
  );
}

// ─── ProfileField ─────────────────────────────────────────────────────────────
function ProfileField({ label, name, value, maxLength, isEditing, onChange }: {
  label: string; name: string; value: string; maxLength: number;
  isEditing: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={s.fieldGroup}>
      <label style={s.label} htmlFor={name}>{label}</label>
      {isEditing ? (
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          autoComplete="off"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...s.input,
            borderColor: focused ? C.primary : C.border,
            boxShadow:   focused ? `0 0 0 3px ${C.primary}18` : 'none',
          }}
        />
      ) : (
        <div style={s.readField}>{value || '—'}</div>
      )}
    </div>
  );
}

// ─── ActionButton ─────────────────────────────────────────────────────────────
function ActionButton({ children, onClick, variant = 'primary', disabled }: {
  children:  React.ReactNode;
  onClick:   () => void;
  variant?:  'primary' | 'ghost' | 'dark';
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: hovered ? C.dark : C.primarySoft,
      color:      hovered ? C.surface : C.primary,
    },
    ghost: {
      background: hovered ? '#EDF2F7' : 'transparent',
      color:      C.muted,
      border:     `1.5px solid ${C.border}`,
    },
    dark: {
      background: C.dark,
      color:      '#F8FAFC',
      transform:  hovered ? 'translateY(-1px)' : 'none',
      boxShadow:  hovered ? `0 6px 20px ${C.dark}30` : 'none',
      opacity:    disabled ? 0.7 : 1,
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...s.btn, ...variantStyles[variant] }}
    >
      {children}
    </button>
  );
}

function Spinner() {
  return <span style={s.spinner} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    padding:    'clamp(16px, 4vw, 40px)',
    maxWidth:   900,
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  },
  pageHeader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   24,
    flexWrap:       'wrap',
    gap:            12,
  },
  pageTitle: {
    fontSize:      'clamp(20px, 3vw, 26px)',
    fontWeight:    800,
    color:         C.dark,
    margin:        0,
    letterSpacing: '-0.03em',
  },
  pageSub: {
    fontSize: 13,
    color:    C.muted,
    margin:   '3px 0 0',
  },
  successBadge: {
    display:      'flex',
    alignItems:   'center',
    gap:          6,
    padding:      '8px 14px',
    background:   C.greenSoft,
    color:        C.green,
    borderRadius: 999,
    fontSize:     13,
    fontWeight:   600,
  },
  grid: {
    display:    'grid',
    gap:        16,
    alignItems: 'start',
  },
  leftCol: {
    display:       'flex',
    flexDirection: 'column',
    gap:           12,
  },

  // Hero
  heroCard: {
    background:    C.dark,
    borderRadius:  20,
    padding:       24,
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           14,
  },
  avatarWrap: {
    position: 'relative',
    width:    96,
    height:   96,
  },
  avatarRingSvg: {
    position: 'absolute',
    top:      0,
    left:     0,
    width:    '100%',
    height:   '100%',
  },
  avatarInner: {
    position:       'absolute',
    top:            '50%',
    left:           '50%',
    transform:      'translate(-50%, -50%)',
    width:          72,
    height:         72,
    borderRadius:   '50%',
    background:     `linear-gradient(135deg, ${C.primary}, ${C.darkMid})`,
    color:          '#F8FAFC',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       28,
    fontWeight:     800,
    userSelect:     'none',
  },
  heroName: {
    fontSize:   17,
    fontWeight: 700,
    color:      '#F8FAFC',
  },
  heroUsername: {
    fontSize:  13,
    color:     'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  statRow: {
    display:        'flex',
    justifyContent: 'center',
    gap:            6,
    flexWrap:       'wrap',
  },
  statPill: {
    display:      'flex',
    alignItems:   'center',
    gap:          5,
    padding:      '5px 10px',
    borderRadius: 999,
  },
  statLabel: {
    fontSize:   11,
    fontWeight: 700,
  },
  xpSection: {
    width:         '100%',
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
    marginTop:     4,
  },
  xpLabelRow: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  xpLabel: {
    fontSize:   10,
    fontWeight: 600,
    color:      'rgba(255,255,255,0.4)',
  },
  xpTrack: {
    height:       6,
    borderRadius: 3,
    background:   'rgba(255,255,255,0.1)',
    overflow:     'hidden',
  },
  xpFill: {
    height:       '100%',
    borderRadius: 3,
    background:   `linear-gradient(90deg, ${C.primary}, #63ADFF)`,
    transition:   'width 1s cubic-bezier(0.4,0,0.2,1)',
  },

  // Meta
  metaCard: {
    background:    C.surface,
    borderRadius:  16,
    padding:       '12px 16px',
    border:        `1px solid ${C.border}`,
    display:       'flex',
    flexDirection: 'column',
    gap:           0,
  },
  metaItem: {
    display:    'flex',
    alignItems: 'center',
    gap:        10,
    padding:    '8px 0',
  },
  metaDivider: {
    height:     1,
    background: C.border,
  },
  metaText: {
    fontSize: 13,
    color:    C.muted,
  },

  // Form
  formCard: {
    background:    C.surface,
    borderRadius:  20,
    padding:       'clamp(16px, 3vw, 28px)',
    border:        `1px solid ${C.border}`,
  },
  formHeader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   24,
  },
  formTitle: {
    fontSize:   16,
    fontWeight: 700,
    color:      C.dark,
  },
  fields: {
    display:       'flex',
    flexDirection: 'column',
    gap:           18,
  },
  fieldGroup: {
    display:       'flex',
    flexDirection: 'column',
    gap:           7,
  },
  label: {
    fontSize:      11,
    fontWeight:    700,
    color:         C.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    padding:      '10px 14px',
    borderRadius: 10,
    border:       `1.5px solid ${C.border}`,
    fontSize:     14,
    color:        C.dark,
    background:   C.surface,
    width:        '100%',
    boxSizing:    'border-box',
    fontFamily:   'inherit',
    outline:      'none',
    transition:   'border-color 0.15s, box-shadow 0.15s',
  },
  readField: {
    padding:      '10px 14px',
    borderRadius: 10,
    background:   C.bg,
    fontSize:     14,
    color:        C.dark,
    fontWeight:   500,
  },
  lockedField: {
    display:      'flex',
    alignItems:   'center',
    gap:          8,
    padding:      '10px 14px',
    borderRadius: 10,
    background:   C.bg,
    border:       `1.5px dashed ${C.border}`,
  },
  lockedText: {
    fontSize: 14,
    color:    C.muted,
    flex:     1,
  },
  lockedBadge: {
    display:       'flex',
    alignItems:    'center',
    gap:           4,
    fontSize:      10,
    fontWeight:    700,
    color:         C.muted,
    background:    C.border,
    padding:       '2px 8px',
    borderRadius:  999,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    whiteSpace:    'nowrap',
  },
  errorBox: {
    display:      'flex',
    alignItems:   'center',
    gap:          8,
    marginTop:    16,
    padding:      '10px 14px',
    borderRadius: 10,
    background:   C.errorSoft,
    color:        C.error,
    fontSize:     13,
    fontWeight:   500,
    border:       '1px solid #FECACA',
  },
  formActions: {
    display:        'flex',
    gap:            10,
    justifyContent: 'flex-end',
    marginTop:      24,
    paddingTop:     20,
    borderTop:      `1px solid ${C.border}`,
    flexWrap:       'wrap',
  },
  btn: {
    display:      'flex',
    alignItems:   'center',
    gap:          6,
    padding:      '9px 18px',
    border:       'none',
    borderRadius: 10,
    fontSize:     13,
    fontWeight:   600,
    cursor:       'pointer',
    fontFamily:   'inherit',
    transition:   'all 0.15s',
  },
  spinner: {
    width:        13,
    height:       13,
    border:       '2px solid rgba(255,255,255,0.3)',
    borderTop:    '2px solid white',
    borderRadius: '50%',
    display:      'inline-block',
    animation:    'spin 0.7s linear infinite',
  },
};