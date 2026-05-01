import React, { useState, useEffect, useRef } from 'react';
import { useQuery }                from '@tanstack/react-query';
import { gamificationApi }         from '../api/gamification.api';
import { GamificationSkeleton }    from '../components/gamification/GamificationSkeleton';
import { AchievementsGrid }        from '../components/gamification/AchievementsGrid';
import { colors, radius }          from '../styles/tokens';

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Calcule les jours actifs de la semaine en cours à partir du streak.
 * Retourne un tableau de 7 booléens (lundi → dimanche).
 */
function computeWeekActivity(streak: number, lastActivityDate: string | null): boolean[] {
  const result = Array(7).fill(false);
  if (streak === 0 || !lastActivityDate) return result;

  const today    = new Date();
  const last     = new Date(lastActivityDate);
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const todayMs  = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const lastMs   = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();

  if (Math.floor((todayMs - lastMs) / 86_400_000) > 1) return result;

  const activeDays = Math.min(streak, todayIdx + 1);
  for (let i = 0; i < activeDays; i++) result[todayIdx - i] = true;
  return result;
}

function getStreakMessage(streak: number): string {
  if (streak === 0)   return "Lance-toi aujourd'hui !";
  if (streak < 3)     return "C'est parti ! Continue !";
  if (streak < 7)     return "Tu chauffes ! 🔥";
  if (streak < 14)    return "Impressionnant !";
  if (streak < 30)    return "Légendaire ! 🏆";
  return "INARRÊTABLE ! 🌟";
}

function getLevelColor(level: number): string {
  return LEVEL_COLORS[Math.min(level - 1, LEVEL_COLORS.length - 1)];
}

function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function GamificationPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

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

  const xp             = stats?.totalXp         ?? 0;
  const streak         = stats?.currentStreak    ?? 0;
  const level          = stats?.level            ?? 1;
  const tasksCompleted = stats?.tasksCompleted   ?? 0;
  const longestStreak  = stats?.longestStreak    ?? 0;
  const lastActivity   = stats?.lastActivityDate ?? null;

  const levelColor = getLevelColor(level);
  const levelTitle = getLevelTitle(level);

  const current  = nextLevelQuery.data?.current ?? 0;
  const next     = nextLevelQuery.data?.next    ?? 1;
  const xpToNext = Math.max(0, next - current);
  const pct      = next > 0 ? Math.min(100, (current / next) * 100) : 0;

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements   = achievements.filter(a => !a.unlocked);

  return (
    <div style={styles.page}>

      <StreakHero
        streak={streak}
        lastActivityDate={lastActivity}
        isMobile={isMobile}
      />

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
          xpToNext={xpToNext}
          levelColor={levelColor}
          levelTitle={levelTitle}
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

      <AchievementsGrid
        unlockedAchievements={unlockedAchievements}
        lockedAchievements={lockedAchievements}
        isMobile={isMobile}
      />
    </div>
  );
}

// ─── StreakHero ───────────────────────────────────────────────────────────────

interface StreakHeroProps {
  streak:           number;
  lastActivityDate: string | null;
  isMobile:         boolean;
}

function StreakHero({ streak, lastActivityDate, isMobile }: StreakHeroProps) {
  const flameRef = useRef<HTMLDivElement>(null);
  const isActive = streak > 0;
  const activity = computeWeekActivity(streak, lastActivityDate);
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

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
            {getStreakMessage(streak)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: isMobile ? 10 : 16, justifyContent: 'center' }}>
        {weekDays.map((day, i) => {
          const active  = activity[i];
          const isToday = i === todayIdx;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
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

interface LevelSectionProps {
  level:      number;
  xp:         number;
  pct:        number;
  xpToNext:   number;
  levelColor: string;
  levelTitle: string;
}

function LevelSection({ level, xp, pct, xpToNext, levelColor, levelTitle }: LevelSectionProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    const el = barRef.current;
    el.style.width = '0%';
    const timer = setTimeout(() => {
      el.style.transition = 'width 1.4s cubic-bezier(0.4,0,0.2,1)';
      el.style.width      = `${pct}%`;
    }, 300);
    return () => clearTimeout(timer);
  }, [pct]);

  const isMaxLevel = xpToNext === 0;

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
        <span style={{ fontSize: 13, fontWeight: 600, color: levelColor }}>{levelTitle}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: levelColor, letterSpacing: '-0.04em' }}>
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
          {isMaxLevel ? 'MAX' : `Niv. ${level + 1}`}
        </span>
      </div>

      {!isMaxLevel && (
        <div style={{
          background:   `${levelColor}08`,
          borderRadius: radius.sm,
          padding:      '10px 14px',
          textAlign:    'center',
          border:       `1px dashed ${levelColor}25`,
        }}>
          <span style={{ fontSize: 12, color: colors.muted }}>
            encore{' '}
            <strong style={{ color: levelColor }}>{xpToNext} XP</strong>
            {' '}pour le niveau {level + 1}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── QuickStats ───────────────────────────────────────────────────────────────

interface QuickStatsProps {
  xp:             number;
  level:          number;
  streak:         number;
  tasksCompleted: number;
  longestStreak:  number;
  levelColor:     string;
  isMobile:       boolean;
}

function QuickStats({ xp, level, streak, tasksCompleted, longestStreak, levelColor, isMobile }: QuickStatsProps) {
  const statItems = [
    { label: 'XP total',        value: xp.toLocaleString(), unit: 'XP', color: levelColor, icon: '⚡' },
    { label: 'Niveau',          value: level,                unit: '',   color: levelColor, icon: '🎯' },
    { label: 'Streak actuel',   value: streak,               unit: '🔥', color: '#e67e22',  icon: '🔥' },
    { label: 'Tâches faites',   value: tasksCompleted,       unit: '',   color: '#27ae60',  icon: '✅' },
    { label: 'Meilleur streak', value: longestStreak,        unit: '🔥', color: '#e67e22',  icon: '🏆' },
  ];

  if (isMobile) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {statItems.slice(0, 3).map((s, i) => (
          <div key={i} style={{ ...styles.card, padding: '14px 10px', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: s.color, letterSpacing: '-0.02em' }}>
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
      {statItems.map((s, i) => (
        <div key={i} style={{
          display:      'flex',
          alignItems:   'center',
          gap:          12,
          padding:      '10px 0',
          borderBottom: i < statItems.length - 1 ? `1px solid ${colors.border}` : 'none',
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