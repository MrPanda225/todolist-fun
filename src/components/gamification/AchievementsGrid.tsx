import React, { useEffect, useRef, useState } from 'react';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Achievement }  from '../../api/gamification.api';
import { AchievementCard }   from './AchievementCard';
import { colors, radius }    from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'unlocked' | 'locked';

interface AchievementsGridProps {
  unlockedAchievements: Achievement[];
  lockedAchievements:   Achievement[];
  isMobile:             boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Largeur d'une card + gap — utilisé pour le scroll par cran */
const CARD_WIDTH      = 160;
const CARD_GAP        = 12;
const SCROLL_STEP     = (CARD_WIDTH + CARD_GAP) * 2; // 2 cards à la fois

// ─── Sous-composants privés ───────────────────────────────────────────────────

interface TabButtonProps {
  tab:      Tab;
  active:   Tab;
  count:    number;
  isMobile: boolean;
  onClick:  (tab: Tab) => void;
}

function TabButton({ tab, active, count, isMobile, onClick }: TabButtonProps) {
  const isActive = active === tab;
  const label    = tab === 'unlocked'
    ? `✅ Débloqués (${count})`
    : `🔒 À venir (${count})`;

  return (
    <button
      onClick={() => onClick(tab)}
      style={{
        flex:         isMobile ? 1 : 'none',
        padding:      '7px 14px',
        borderRadius: radius.full,
        fontSize:     12,
        fontWeight:   600,
        cursor:       'pointer',
        fontFamily:   'inherit',
        transition:   'all 0.2s ease',
        background:   isActive
          ? tab === 'unlocked' ? colors.primary : colors.dark
          : 'transparent',
        color:  isActive ? 'white' : colors.muted,
        border: `1.5px solid ${isActive
          ? tab === 'unlocked' ? colors.primary : colors.dark
          : colors.border}`,
      }}
    >
      {label}
    </button>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           12,
      padding:       '40px 24px',
    }}>
      <span style={{ fontSize: 40 }}>
        {tab === 'unlocked' ? '🎯' : '🏆'}
      </span>
      <p style={{ fontSize: 13, color: colors.muted, margin: 0, textAlign: 'center' }}>
        {tab === 'unlocked'
          ? 'Complète tes premières tâches pour débloquer des achievements !'
          : 'Tous les achievements sont débloqués. Tu es une légende ! 🌟'}
      </p>
    </div>
  );
}

interface NavArrowProps {
  direction: 'left' | 'right';
  visible:   boolean;
  onClick:   () => void;
}

function NavArrow({ direction, visible, onClick }: NavArrowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:       'absolute',
        top:            '50%',
        [direction === 'left' ? 'left' : 'right']: -16,
        transform:      'translateY(-50%)',
        zIndex:         10,
        width:          32,
        height:         32,
        borderRadius:   '50%',
        border:         `1.5px solid ${colors.border}`,
        background:     hovered ? colors.primary : colors.white,
        color:          hovered ? 'white' : colors.muted,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        boxShadow:      '0 2px 8px rgba(13,31,51,0.12)',
        transition:     'all 0.2s ease',
        opacity:        visible ? 1 : 0,
        pointerEvents:  visible ? 'auto' : 'none',
        padding:        0,
      }}
    >
      {direction === 'left'
        ? <ChevronLeft  size={16} color={hovered ? 'white' : colors.muted} />
        : <ChevronRight size={16} color={hovered ? 'white' : colors.muted} />}
    </button>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * Section achievements — scroll horizontal animé via Anime.js.
 * Pas de scrollbar native visible, navigation par flèches ou swipe.
 */
export function AchievementsGrid({
  unlockedAchievements,
  lockedAchievements,
  isMobile,
}: AchievementsGridProps) {
  const [activeTab, setActiveTab]   = useState<Tab>('unlocked');
  const [canScrollL, setCanScrollL] = useState(false);
  const [canScrollR, setCanScrollR] = useState(false);
  const trackRef                    = useRef<HTMLDivElement>(null);
  const isAnimating                 = useRef(false);

  const current = activeTab === 'unlocked' ? unlockedAchievements : lockedAchievements;

  // ── Mise à jour des flèches selon position scroll ──────────────────────────
  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollL(el.scrollLeft > 4);
    setCanScrollR(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    // Laisse le DOM se mettre à jour avant de mesurer
    requestAnimationFrame(updateArrows);
    el.addEventListener('scroll', updateArrows, { passive: true });
    return () => el.removeEventListener('scroll', updateArrows);
  }, [activeTab, current.length]);

  // ── Animation Anime.js entrée staggerée ───────────────────────────────────
  useEffect(() => {
    const el = trackRef.current;
    if (!el || current.length === 0) return;

    import('animejs').then(mod => {
      const anime = (mod.default ?? mod) as any;
      const items = Array.from(el.children) as HTMLElement[];

      // Reset immédiat sans transition
      items.forEach(item => {
        item.style.transition = 'none';
        item.style.opacity    = '0';
        item.style.transform  = 'translateY(16px) scale(0.94)';
      });

      // Lance le stagger après un frame
      requestAnimationFrame(() => {
        anime({
          targets:     items,
          opacity:     [0, 1],
          translateY:  [16, 0],
          scale:       [0.94, 1],
          delay:       anime.stagger(60, { start: 40 }),
          duration:    380,
          easing:      'easeOutExpo',
        });
      });
    });
  }, [activeTab]);

  // ── Scroll animé via Anime.js ─────────────────────────────────────────────
  function scrollBy(direction: 'left' | 'right') {
    const el = trackRef.current;
    if (!el || isAnimating.current) return;

    const delta  = direction === 'left' ? -SCROLL_STEP : SCROLL_STEP;
    const target = Math.max(0, Math.min(el.scrollLeft + delta, el.scrollWidth - el.clientWidth));

    isAnimating.current = true;

    import('animejs').then(mod => {
      const anime = (mod.default ?? mod) as any;
      anime({
        targets:  el,
        scrollLeft: target,
        duration: 480,
        easing:   'easeInOutQuart',
        complete: () => { isAnimating.current = false; },
      });
    });
  }

  return (
    <div style={{
      background:    colors.white,
      borderRadius:  radius.lg,
      padding:       '24px',
      border:        `1px solid ${colors.border}`,
      boxShadow:     '0 1px 4px rgba(13,31,51,0.07)',
      display:       'flex',
      flexDirection: 'column',
      gap:           16,
    }}>

      {/* ── Header ── */}
      <div style={{
        display:        'flex',
        alignItems:     isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        flexDirection:  isMobile ? 'column' : 'row',
        gap:            12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={20} color={colors.primary} />
          <span style={{ fontSize: 16, fontWeight: 800, color: colors.dark }}>
            Achievements
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, width: isMobile ? '100%' : 'auto' }}>
          <TabButton
            tab="unlocked"
            active={activeTab}
            count={unlockedAchievements.length}
            isMobile={isMobile}
            onClick={setActiveTab}
          />
          <TabButton
            tab="locked"
            active={activeTab}
            count={lockedAchievements.length}
            isMobile={isMobile}
            onClick={setActiveTab}
          />
        </div>
      </div>

      {/* ── Contenu ── */}
      {current.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        // Wrapper relatif pour positionner les flèches en dehors du track
        <div style={{ position: 'relative', margin: '0 16px' }}>

          <NavArrow
            direction="left"
            visible={canScrollL}
            onClick={() => scrollBy('left')}
          />

          {/* Scrollbar WebKit masquée via <style> global injecté une seule fois */}
          <style>{`.ach-track::-webkit-scrollbar { display: none; }`}</style>

          {/* Track scrollable */}
          <div
            ref={trackRef}
            className="ach-track"
            style={{
              display:        'flex',
              flexDirection:  'row',
              gap:            CARD_GAP,
              overflowX:      'auto',
              overflowY:      'hidden',
              scrollbarWidth: 'none',   // Firefox
              paddingBottom:  4,        // Évite le clipping du box-shadow des cards
              paddingTop:     4,
            } as React.CSSProperties}
          >

            {current.map(achievement => (
              <div
                key={achievement.id}
                style={{
                  flexShrink: 0,
                  width:      CARD_WIDTH,
                }}
              >
                <AchievementCard
                  achievement={achievement}
                  isMobile={isMobile}
                />
              </div>
            ))}
          </div>

          <NavArrow
            direction="right"
            visible={canScrollR}
            onClick={() => scrollBy('right')}
          />
        </div>
      )}
    </div>
  );
}