import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Lock, CheckCircle }            from 'lucide-react';
import { useQuery }                             from '@tanstack/react-query';
import { gamificationApi }                      from '../api/gamification.api';
import { GamificationSkeleton }                 from '../components/gamification/GamificationSkeleton';
import { colors, radius }                       from '../styles/tokens';

const MOBILE_BREAKPOINT = 768;

const LEVEL_TITLES = [
  'Débutant', 'Apprenti', 'Initié', 'Intermédiaire',
  'Avancé', 'Expert', 'Maître', 'Grand Maître', 'Légende', 'Mythique',
];

const LEVEL_COLORS = [
  '#27ae60', '#27ae60',
  '#2470BD', '#2470BD',
  '#9b59b6', '#9b59b6',
  '#e67e22', '#e67e22',
  '#e74c3c', '#e74c3c',
];

const LOCKED_ACHIEVEMENTS = [
  { name: 'Centurion',       description: 'Complète 100 tâches',              icon: '💯', condition: '100 tâches'   },
  { name: 'Perfectionniste', description: '30 jours de streak consécutifs',   icon: '⭐', condition: '30j streak'   },
  { name: 'Productivité+',   description: 'Gagne 1000 XP en une semaine',     icon: '📈', condition: '1000 XP/sem'  },
  { name: 'Nocturne',        description: 'Complète une tâche après 22h',     icon: '🌙', condition: 'Tâche tardive' },
  { name: 'Marathon',        description: '7 tâches en un jour',              icon: '🏃', condition: '7 tâches/jour' },
  { name: 'Stratège',        description: 'Utilise 5 catégories différentes', icon: '🎯', condition: '5 catégories'  },
];

function computeActivity(streak: number, lastActivityDate: string | null): boolean[] {
  const result   = Array(7).fill(false);
  if (streak === 0 || !lastActivityDate) return result;
  const today    = new Date();
  const last     = new Date(lastActivityDate);
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const todayMs  = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const lastMs   = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
  if (Math.floor((todayMs - lastMs) / 86_400_000) > 1) return result;
  const active = Math.min(streak, todayIdx + 1);
  for (let i = 0; i < active; i++) result[todayIdx - i] = true;
  return result;
}

type Tab = 'unlocked' | 'locked';

// ─── Page principale ──────────────────────────────────────────────────────────
export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('unlocked');
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const statsQuery = useQuery({
    queryKey: ['gamification', 'stats'],
    queryFn:  () => gamificationApi.getStats().then(r => r.data),
  });

  const nextLevelQuery = useQuery({
    queryKey: ['gamification', 'next-level'],
    queryFn:  () => gamificationApi.getNextLevel().then(r => r.data),
  });

  const achievementsQuery = useQuery({
    queryKey: ['gamification', 'achievements'],
    queryFn:  () => gamificationApi.getAchievements().then(r => r.data),
  });

  if (statsQuery.isLoading) return <GamificationSkeleton />;

  const stats        = statsQuery.data;
  const achievements = achievementsQuery.data ?? [];

  // Champs exacts du backend
  const xp               = stats?.totalXp          ?? 0;
  const streak           = stats?.currentStreak     ?? 0;
  const lastActivityDate = stats?.lastActivityDate  ?? null;
  const level            = stats?.level             ?? 1;
  const tasksCompleted   = stats?.tasksCompleted    ?? 0;
  const longestStreak    = stats?.longestStreak     ?? 0;

  const levelColor = LEVEL_COLORS[Math.min(level - 1, LEVEL_COLORS.length - 1)];
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  // Calcule pct depuis current/next retournés par le backend
  const current  = nextLevelQuery.data?.current ?? 0;
  const next     = nextLevelQuery.data?.next    ?? 1;
  const xpToNext = Math.max(0, next - current);
  const pct      = next > 0 ? Math.min(100, (current / next) * 100) : 0;

  // Objet normalisé pour les composants enfants
  const nextLevelNorm = nextLevelQuery.data
    ? { xpToNextLevel: xpToNext, progressPct: pct }
    : undefined;

  return (
    <div style={styles.page}>

      {/* ── Streak Hero ── */}
      <StreakHero
        streak={streak}
        lastActivityDate={lastActivityDate}
        isMobile={isMobile}
      />

      {/* ── Niveau + Stats ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
        gap:                 16,
        alignItems:          'start',
      }}>
        <LevelSection
          level={level}
          xp={xp}
          pct={pct}
          levelColor={levelColor}
          levelTitle={levelTitle}
          nextLevel={nextLevelNorm}
        />
        <QuickStats
          xp={xp}
          level={level}
          streak={streak}
          tasksCompleted={tasksCompleted}
          longestStreak={longestStreak}
          levelColor={levelColor}
          isMobile={isMobile}
        />
      </div>

      {/* ── Achievements ── */}
      <AchievementsSection
        achievements={achievements}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobile={isMobile}
      />
    </div>
  );
}

// ─── StreakHero ───────────────────────────────────────────────────────────────
function StreakHero({ streak, lastActivityDate, isMobile }: {
  streak: number; lastActivityDate: string | null; isMobile: boolean;
}) {
  const flameRef = useRef<HTMLDivElement>(null);
  const isActive = streak > 0;
  const activity = computeActivity(streak, lastActivityDate);
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const message = streak === 0    ? "Lance-toi aujourd'hui !"
    : streak < 3  ? "C'est parti ! Continue !"
    : streak < 7  ? "Tu chauffes ! 🔥"
    : streak < 14 ? "Impressionnant !"
    : streak < 30 ? "Légendaire ! 🏆"
    : "INARRÊTABLE ! 🌟";

  useEffect(() => {
    if (!flameRef.current || !isActive) return;
    const el = flameRef.current;
    let rafId: number;
    let start: number | null = null;
    function animate(ts: number) {
      if (!start) start = ts;
      const t     = (ts - start) / 1000;
      const scale = 1 + Math.sin(t * 2.2) * 0.07;
      const rot   = Math.sin(t * 2.8) * 5;
      el.style.transform = `scale(${scale}) rotate(${rot}deg)`;
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isActive]);

  return (
    <div style={{
      ...styles.card,
      background:  isActive ? 'linear-gradient(135deg, #fff8f0, #fff3e0)' : colors.white,
      borderColor: isActive ? '#f39c1230' : colors.border,
      alignItems:  'center',
      padding:     isMobile ? '20px 16px' : '28px 32px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
        <div
          ref={flameRef}
          style={{
            fontSize:        isMobile ? 48 : 64,
            transformOrigin: 'bottom center',
            display:         'inline-block',
            filter:          isActive ? 'none' : 'grayscale(1)',
            opacity:         isActive ? 1 : 0.3,
            lineHeight:      1,
          }}
        >
          🔥
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{
            fontSize:      isMobile ? 40 : 52,
            fontWeight:    900,
            letterSpacing: '-0.04em',
            lineHeight:    1,
            color:         isActive ? '#e67e22' : colors.muted,
          }}>
            {streak}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, color: colors.muted, fontWeight: 600 }}>
            {streak === 1 ? 'jour consécutif' : 'jours consécutifs'}
          </div>
          <div style={{
            fontSize:   isMobile ? 11 : 13,
            fontStyle:  'italic',
            color:      isActive ? '#e67e22' : colors.muted,
            marginTop:  2,
            fontWeight: 500,
          }}>
            {message}
          </div>
        </div>
      </div>

      {/* Grille 7 jours */}
      <div style={{ display: 'flex', gap: isMobile ? 10 : 16, justifyContent: 'center' }}>
        {weekDays.map((day, i) => {
          const active  = activity[i];
          const isToday = i === todayIdx;
          return (
            <div key={i} style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           5,
            }}>
              <div style={{
                width:        isToday ? 16 : 12,
                height:       isToday ? 16 : 12,
                borderRadius: '50%',
                background:   active ? '#e67e22' : isToday ? 'transparent' : `${colors.border}60`,
                border:       isToday && !active ? '2px dashed #e67e22' : '2px solid transparent',
                boxShadow:    active ? '0 0 8px rgba(230,126,34,0.5)' : 'none',
                transition:   'all 0.3s ease',
              }} />
              <span style={{
                fontSize:   9,
                fontWeight: isToday ? 800 : 500,
                color:      isToday ? '#e67e22' : colors.muted,
              }}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LevelSection ─────────────────────────────────────────────────────────────
function LevelSection({ level, xp, pct, levelColor, levelTitle, nextLevel }: {
  level:      number;
  xp:         number;
  pct:        number;
  levelColor: string;
  levelTitle: string;
  nextLevel:  { xpToNextLevel: number; progressPct: number } | undefined;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    const el    = barRef.current;
    el.style.width = '0%';
    const timer = setTimeout(() => {
      el.style.transition = 'width 1.4s cubic-bezier(0.4,0,0.2,1)';
      el.style.width      = `${pct}%`;
    }, 300);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          6,
          padding:      '5px 14px',
          borderRadius: 20,
          background:   `${levelColor}18`,
          color:        levelColor,
          border:       `1.5px solid ${levelColor}30`,
        }}>
          <span style={{ fontSize: 14 }}>⚡</span>
          <span style={{ fontSize: 14, fontWeight: 800 }}>Niveau {level}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: levelColor }}>
          {levelTitle}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontSize:      32,
          fontWeight:    900,
          color:         levelColor,
          letterSpacing: '-0.04em',
        }}>
          {xp.toLocaleString()}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: colors.muted }}>XP</span>
      </div>

      <div style={{ height: 12, borderRadius: 6, background: colors.border, overflow: 'hidden' }}>
        <div ref={barRef} style={{
          height:       '100%',
          borderRadius: 6,
          background:   `linear-gradient(90deg, ${levelColor}, ${levelColor}88)`,
          width:        '0%',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: colors.muted }}>Niv. {level}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: levelColor }}>{pct.toFixed(0)}%</span>
        <span style={{ fontSize: 11, color: colors.muted }}>
          {nextLevel ? `Niv. ${level + 1}` : 'MAX'}
        </span>
      </div>

      {nextLevel && (
        <div style={{
          background:   `${levelColor}08`,
          borderRadius: radius.sm,
          padding:      '10px 14px',
          textAlign:    'center',
          border:       `1px dashed ${levelColor}25`,
        }}>
          <span style={{ fontSize: 12, color: colors.muted }}>
            encore{' '}
            <strong style={{ color: levelColor }}>{nextLevel.xpToNextLevel} XP</strong>
            {' '}pour le niveau {level + 1}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── QuickStats ───────────────────────────────────────────────────────────────
function QuickStats({ xp, level, streak, tasksCompleted, longestStreak, levelColor, isMobile }: {
  xp:             number;
  level:          number;
  streak:         number;
  tasksCompleted: number;
  longestStreak:  number;
  levelColor:     string;
  isMobile:       boolean;
}) {
  const stats = [
    { label: 'XP total',        value: xp.toLocaleString(), unit: 'XP', color: levelColor, icon: '⚡' },
    { label: 'Niveau',          value: level,                unit: '',   color: levelColor, icon: '🎯' },
    { label: 'Streak actuel',   value: streak,               unit: '🔥', color: '#e67e22',  icon: '🔥' },
    { label: 'Tâches faites',   value: tasksCompleted,       unit: '',   color: '#27ae60',  icon: '✅' },
    { label: 'Meilleur streak', value: longestStreak,        unit: '🔥', color: '#e67e22',  icon: '🏆' },
  ];

  if (isMobile) {
    return (
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap:                 8,
      }}>
        {stats.slice(0, 3).map((s, i) => (
          <div key={i} style={{
            ...styles.card,
            padding:    '14px 10px',
            alignItems: 'center',
            gap:        4,
          }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <span style={{
              fontSize:      20,
              fontWeight:    900,
              color:         s.color,
              letterSpacing: '-0.02em',
            }}>
              {s.value}
            </span>
            <span style={{ fontSize: 9, color: colors.muted, fontWeight: 600, textAlign: 'center' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ ...styles.card, minWidth: 210, gap: 0, padding: '20px' }}>
      <span style={{ fontSize: 15, fontWeight: 800, color: colors.dark, marginBottom: 12 }}>
        Statistiques
      </span>
      {stats.map((s, i) => (
        <div key={i} style={{
          display:      'flex',
          alignItems:   'center',
          gap:          12,
          padding:      '10px 0',
          borderBottom: i < stats.length - 1 ? `1px solid ${colors.border}` : 'none',
        }}>
          <div style={{
            width:          40,
            height:         40,
            borderRadius:   radius.sm,
            background:     `${s.color}15`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
          }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: colors.muted, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>
              {s.value}
              {s.unit && <span style={{ fontSize: 12, marginLeft: 3 }}>{s.unit}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AchievementsSection ──────────────────────────────────────────────────────
interface Achievement {
  id: string; name: string; description: string; icon: string; unlockedAt: string;
}

function AchievementsSection({ achievements, activeTab, onTabChange, isMobile }: {
  achievements: Achievement[];
  activeTab:    Tab;
  onTabChange:  (t: Tab) => void;
  isMobile:     boolean;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const locked  = LOCKED_ACHIEVEMENTS.slice(0, Math.max(0, 6 - achievements.length));
  const current = activeTab === 'unlocked' ? achievements : locked;

  useEffect(() => {
    if (!gridRef.current) return;
    const items = Array.from(gridRef.current.children) as HTMLElement[];
    items.forEach((el, i) => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(10px) scale(0.96)';
      setTimeout(() => {
        el.style.transition = `opacity 0.3s ease ${i * 50}ms, transform 0.3s ease ${i * 50}ms`;
        el.style.opacity    = '1';
        el.style.transform  = 'translateY(0) scale(1)';
      }, 10);
    });
  }, [activeTab]);

  return (
    <div style={styles.card}>
      <div style={{
        display:        'flex',
        alignItems:     isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        flexDirection:  isMobile ? 'column' : 'row',
        gap:            12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={20} color={colors.primary} />
          <span style={{ fontSize: 16, fontWeight: 800, color: colors.dark }}>Achievements</span>
        </div>

        <div style={{ display: 'flex', gap: 6, width: isMobile ? '100%' : 'auto' }}>
          {(['unlocked', 'locked'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                flex:         isMobile ? 1 : 'none',
                padding:      '7px 14px',
                borderRadius: 20,
                fontSize:     12,
                fontWeight:   600,
                cursor:       'pointer',
                fontFamily:   'inherit',
                transition:   'all 0.2s ease',
                background:   activeTab === tab
                  ? tab === 'unlocked' ? colors.primary : colors.dark
                  : 'transparent',
                color:  activeTab === tab ? 'white' : colors.muted,
                border: `1.5px solid ${activeTab === tab
                  ? tab === 'unlocked' ? colors.primary : colors.dark
                  : colors.border}`,
              }}
            >
              {tab === 'unlocked'
                ? `✅ Débloqués (${achievements.length})`
                : `🔒 À venir (${locked.length})`}
            </button>
          ))}
        </div>
      </div>

      {current.length === 0 ? (
        <div style={{
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           12,
          padding:       '40px 24px',
        }}>
          <span style={{ fontSize: 40 }}>🎯</span>
          <p style={{ fontSize: 13, color: colors.muted, margin: 0, textAlign: 'center' }}>
            Complète tes premières tâches pour débloquer des achievements !
          </p>
        </div>
      ) : (
        <div
          ref={gridRef}
          style={{
            display:             'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(2, 1fr)'
              : 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: isMobile ? 10 : 12,
          }}
        >
          {(current as any[]).map((a, i) => (
            <AchievementCard
              key={'id' in a ? a.id : i}
              name={a.name}
              description={a.description}
              icon={a.icon}
              unlockedAt={'unlockedAt' in a ? a.unlockedAt : null}
              condition={'condition' in a ? a.condition : null}
              isLocked={activeTab === 'locked'}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AchievementCard ──────────────────────────────────────────────────────────
function AchievementCard({ name, description, icon, unlockedAt, condition, isLocked, isMobile }: {
  name:       string;
  description: string;
  icon:        string;
  unlockedAt:  string | null;
  condition:   string | null;
  isLocked:    boolean;
  isMobile:    boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           isMobile ? 6 : 8,
        padding:       isMobile ? '14px 10px' : '18px 12px',
        borderRadius:  radius.md,
        border:        `1px solid ${hovered && !isLocked ? `${colors.primary}40` : colors.border}`,
        background:    hovered && !isLocked ? `${colors.primary}06` : colors.background,
        transform:     hovered ? 'translateY(-2px)' : 'translateY(0)',
        opacity:       isLocked ? 0.65 : 1,
        transition:    'all 0.2s ease',
        cursor:        'default',
      }}
    >
      <div style={{
        position:       'relative',
        width:          isMobile ? 48 : 56,
        height:         isMobile ? 48 : 56,
        borderRadius:   '50%',
        background:     isLocked ? `${colors.border}40` : `${colors.primary}15`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        filter:         isLocked ? 'grayscale(0.5)' : 'none',
      }}>
        <span style={{ fontSize: isMobile ? 22 : 26 }}>{icon}</span>
        <div style={{
          position:       'absolute',
          bottom:         -2,
          right:          -2,
          background:     'white',
          borderRadius:   '50%',
          width:          18,
          height:         18,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          boxShadow:      '0 1px 4px rgba(0,0,0,0.1)',
        }}>
          {isLocked
            ? <Lock size={10} color={colors.muted} />
            : <CheckCircle size={10} color="#27ae60" />}
        </div>
      </div>

      <span style={{
        fontSize:   isMobile ? 11 : 12,
        fontWeight: 700,
        color:      isLocked ? colors.muted : colors.dark,
        textAlign:  'center',
        lineHeight: 1.3,
      }}>
        {name}
      </span>

      {!isMobile && (
        <span style={{
          fontSize:   10,
          color:      colors.muted,
          textAlign:  'center',
          lineHeight: 1.4,
        }}>
          {description}
        </span>
      )}

      {unlockedAt ? (
        <span style={{ fontSize: 10, color: colors.primary, fontWeight: 700 }}>
          {new Date(unlockedAt).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short',
          })}
        </span>
      ) : condition ? (
        <span style={{
          fontSize:     9,
          fontWeight:   600,
          color:        colors.muted,
          background:   `${colors.border}60`,
          padding:      '2px 6px',
          borderRadius: 20,
        }}>
          {condition}
        </span>
      ) : null}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
    width:         '100%',
    paddingBottom: 24,
  },
  card: {
    background:    colors.white,
    borderRadius:  radius.lg,
    padding:       '24px',
    border:        `1px solid ${colors.border}`,
    boxShadow:     '0 1px 4px rgba(13,31,51,0.07)',
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
  },
};