/**
 * AchievementIcon
 *
 * Mappe le champ `icon` (string Lucide venant de la BDD) vers un composant
 * Lucide coloré et animé. Chaque type de condition a sa propre couleur
 * et animation pour renforcer la lecture visuelle des achievements.
 *
 * Couleurs par conditionType :
 *  - TASKS_COMPLETED → bleu primaire (#2470BD)
 *  - STREAK          → orange flamme (#e67e22)
 *  - LEVEL_REACHED   → violet (#9b59b6)
 *  - XP_EARNED       → or (#f0a500)
 */

import React, { useEffect, useRef } from 'react';
import {
  Star, Flame, Rocket, Zap, Cpu, Trophy, Crown,
  TrendingUp, Coins, Award, Lock,
} from 'lucide-react';

// ─── Config couleurs par conditionType ────────────────────────────────────────
export const CONDITION_COLORS: Record<string, { primary: string; soft: string; glow: string }> = {
  TASKS_COMPLETED: { primary: '#2470BD', soft: '#EBF3FC', glow: 'rgba(36,112,189,0.35)' },
  STREAK:          { primary: '#e67e22', soft: '#FEF3C7', glow: 'rgba(230,126,34,0.35)'  },
  LEVEL_REACHED:   { primary: '#9b59b6', soft: '#F3E8FF', glow: 'rgba(155,89,182,0.35)'  },
  XP_EARNED:       { primary: '#f0a500', soft: '#FFF8E1', glow: 'rgba(240,165,0,0.35)'   },
};

// ─── Mapper nom BDD → composant Lucide ───────────────────────────────────────
const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>> = {
  star:     Star,
  flame:    Flame,
  fire:     Flame,
  rocket:   Rocket,
  zap:      Zap,
  cpu:      Cpu,
  trophy:   Trophy,
  crown:    Crown,
  trending: TrendingUp,
  coins:    Coins,
  award:    Award,
};

// ─── Animations CSS injectées une seule fois ──────────────────────────────────
let stylesInjected = false;

function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;

  const css = `
    @keyframes ach-pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.12); }
    }
    @keyframes ach-spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes ach-bounce {
      0%, 100% { transform: translateY(0); }
      40%       { transform: translateY(-5px); }
      60%       { transform: translateY(-3px); }
    }
    @keyframes ach-flicker {
      0%, 100% { transform: scale(1)   rotate(0deg); opacity: 1;    }
      25%       { transform: scale(1.1) rotate(-4deg); opacity: 0.9; }
      75%       { transform: scale(0.95) rotate(3deg); opacity: 1;   }
    }
    @keyframes ach-glow-pulse {
      0%, 100% { box-shadow: 0 0 0px transparent; }
      50%       { box-shadow: var(--ach-glow); }
    }
    @keyframes ach-locked-float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-3px); }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

// ─── Choix d'animation par conditionType ────────────────────────────────────
function getAnimation(conditionType: string, unlocked: boolean): string {
  if (!unlocked) return 'ach-locked-float 3s ease-in-out infinite';
  switch (conditionType) {
    case 'STREAK':          return 'ach-flicker 2.4s ease-in-out infinite';
    case 'TASKS_COMPLETED': return 'ach-bounce 2s ease-in-out infinite';
    case 'LEVEL_REACHED':   return 'ach-spin-slow 8s linear infinite';
    case 'XP_EARNED':       return 'ach-pulse 1.8s ease-in-out infinite';
    default:                return 'ach-pulse 2s ease-in-out infinite';
  }
}

// ─── Composant principal ──────────────────────────────────────────────────────
interface AchievementIconProps {
  /** Valeur du champ `icon` en BDD — ex: "star", "flame", "rocket" */
  iconName:      string;
  conditionType: string;
  unlocked:      boolean;
  /** Taille du conteneur circulaire en px (défaut: 56) */
  size?:         number;
}

export function AchievementIcon({
  iconName,
  conditionType,
  unlocked,
  size = 56,
}: AchievementIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { injectStyles(); }, []);

  const palette   = CONDITION_COLORS[conditionType] ?? CONDITION_COLORS['TASKS_COMPLETED'];
  const IconComp  = ICON_MAP[iconName] ?? Award;
  const iconSize  = Math.round(size * 0.48);
  const animation = getAnimation(conditionType, unlocked);

  // Pause animation au hover pour laisser l'utilisateur "voir" l'icône
  function handleMouseEnter() {
    if (containerRef.current) containerRef.current.style.animationPlayState = 'paused';
  }
  function handleMouseLeave() {
    if (containerRef.current) containerRef.current.style.animationPlayState = 'running';
  }

  return (
    <div
      style={{
        position: 'relative',
        width:    size,
        height:   size,
        flexShrink: 0,
      }}
    >
      {/* Halo de glow — uniquement pour les achievements débloqués */}
      {unlocked && (
        <div
          style={{
            position:     'absolute',
            inset:        -4,
            borderRadius: '50%',
            background:   palette.soft,
            // @ts-ignore — variable CSS custom
            '--ach-glow': `0 0 18px 4px ${palette.glow}`,
            animation:    'ach-glow-pulse 2.4s ease-in-out infinite',
            animationDelay: '0.3s',
          } as React.CSSProperties}
        />
      )}

      {/* Cercle principal animé */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position:       'relative',
          zIndex:         1,
          width:          size,
          height:         size,
          borderRadius:   '50%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     unlocked ? palette.soft : '#f0f0f0',
          border:         `2px solid ${unlocked ? palette.primary + '40' : '#dde3ea'}`,
          animation,
          cursor:         'default',
          transition:     'filter 0.2s',
          filter:         unlocked ? 'none' : 'grayscale(0.6) opacity(0.6)',
        }}
      >
        {unlocked ? (
          <IconComp
            size={iconSize}
            color={palette.primary}
            strokeWidth={2}
          />
        ) : (
          <Lock
            size={iconSize - 4}
            color="#aab0b8"
            strokeWidth={2}
          />
        )}
      </div>

      {/* Badge statut — coin inférieur droit */}
      <div
        style={{
          position:       'absolute',
          bottom:         -2,
          right:          -2,
          zIndex:         2,
          width:          20,
          height:         20,
          borderRadius:   '50%',
          background:     'white',
          border:         `1.5px solid ${unlocked ? palette.primary + '50' : '#dde3ea'}`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          boxShadow:      '0 1px 4px rgba(0,0,0,0.12)',
        }}
      >
        {unlocked ? (
          <div style={{
            width:        10,
            height:       10,
            borderRadius: '50%',
            background:   palette.primary,
          }} />
        ) : (
          <div style={{
            width:        8,
            height:       8,
            borderRadius: '50%',
            background:   '#c5cdd5',
          }} />
        )}
      </div>
    </div>
  );
}