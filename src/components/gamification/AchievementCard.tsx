import { useState } from 'react';
import type { Achievement }  from '../../api/gamification.api';
import { AchievementIcon, CONDITION_COLORS } from './AchievementIcon';
import { colors, radius } from '../../styles/tokens';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Génère le libellé de condition lisible pour un achievement verrouillé.
 * Fonction pure — aucun effet de bord.
 */
function formatConditionLabel(achievement: Achievement): string {
  switch (achievement.conditionType) {
    case 'TASKS_COMPLETED': return `${achievement.conditionValue} tâches`;
    case 'STREAK':          return `${achievement.conditionValue}j streak`;
    case 'LEVEL_REACHED':   return `Niveau ${achievement.conditionValue}`;
    case 'XP_EARNED':       return `${achievement.conditionValue} XP`;
    default:                return '';
  }
}

/**
 * Formate la date de déblocage en français court.
 * Retourne null si l'achievement n'est pas encore débloqué.
 */
function formatUnlockedAt(unlockedAt: string | null): string | null {
  if (!unlockedAt) return null;
  return new Date(unlockedAt).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short',
  });
}

// ─── Composant ────────────────────────────────────────────────────────────────

interface AchievementCardProps {
  achievement: Achievement;
  isMobile:   boolean;
}

/**
 * Carte d'un achievement — débloqué ou verrouillé.
 * Couleur et animation dérivées de `conditionType` via AchievementIcon.
 */
export function AchievementCard({ achievement, isMobile }: AchievementCardProps) {
  const [hovered, setHovered] = useState(false);

  const isLocked   = !achievement.unlocked;
  const palette    = CONDITION_COLORS[achievement.conditionType] ?? CONDITION_COLORS['TASKS_COMPLETED'];
  const unlockedAt = formatUnlockedAt(achievement.unlockedAt);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           isMobile ? 8 : 10,
        padding:       isMobile ? '16px 10px' : '20px 14px',
        borderRadius:  radius.md,
        border:        `1.5px solid ${hovered && !isLocked ? palette.primary + '50' : colors.border}`,
        background:    hovered && !isLocked ? palette.soft : colors.background,
        transform:     hovered && !isLocked ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow:     hovered && !isLocked ? `0 6px 20px ${palette.primary}18` : 'none',
        transition:    'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        cursor:        'default',
      }}
    >
      <AchievementIcon
        iconName={achievement.icon}
        conditionType={achievement.conditionType}
        unlocked={achievement.unlocked}
        size={isMobile ? 48 : 56}
      />

      <span style={{
        fontSize:   isMobile ? 11 : 12,
        fontWeight: 700,
        color:      isLocked ? colors.muted : colors.dark,
        textAlign:  'center',
        lineHeight: 1.3,
      }}>
        {achievement.name}
      </span>

      {/* Description — desktop uniquement pour réduire la densité mobile */}
      {!isMobile && (
        <span style={{
          fontSize:   10,
          color:      colors.muted,
          textAlign:  'center',
          lineHeight: 1.4,
        }}>
          {achievement.description}
        </span>
      )}

      {/* Badge — date si débloqué, condition si verrouillé */}
      {unlockedAt ? (
        <span style={{
          fontSize:     10,
          fontWeight:   700,
          color:        palette.primary,
          background:   palette.soft,
          padding:      '2px 8px',
          borderRadius: radius.full,
        }}>
          {unlockedAt}
        </span>
      ) : (
        <span style={{
          fontSize:     9,
          fontWeight:   600,
          color:        colors.muted,
          background:   `${colors.border}80`,
          padding:      '2px 7px',
          borderRadius: radius.full,
        }}>
          {formatConditionLabel(achievement)}
        </span>
      )}
    </div>
  );
}