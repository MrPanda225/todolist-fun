import React                from 'react';
import type { Task }        from '../../api/tasks.api';
import type { Achievement } from '../../api/gamification.api';
import { AchievementIcon }  from '../gamification/AchievementIcon';
import { colors, radius }   from '../../styles/tokens';

interface ProgressPanelProps {
  level:        number;
  xp:           number;
  nextLevel:    { xpToNextLevel: number; progressPct: number } | undefined;
  achievements: Achievement[];
  allTasks:     Task[];
}

function computeWeekActivity(tasks: Task[]): number[] {
  const result = Array(7).fill(0);
  const now    = new Date();

  for (const task of tasks) {
    if (task.status !== 'DONE' || !task.updatedAt) continue;
    const updated  = new Date(task.updatedAt);
    if (isNaN(updated.getTime())) continue;

    const diffMs   = now.getTime() - updated.getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);
    if (diffDays < 0 || diffDays >= 7) continue;

    const dayIdx = updated.getDay() === 0 ? 6 : updated.getDay() - 1;
    result[dayIdx]++;
  }

  return result;
}

/**
 * Retourne le dernier achievement débloqué (unlockedAt le plus récent).
 * Ignore les achievements verrouillés (unlocked: false).
 */
function getLastUnlocked(achievements: Achievement[]): Achievement | null {
  const unlocked = achievements.filter(a => a.unlocked && a.unlockedAt);
  if (unlocked.length === 0) return null;

  return unlocked.reduce((latest, a) =>
    new Date(a.unlockedAt!) > new Date(latest.unlockedAt!) ? a : latest
  );
}

export function ProgressPanel({ level, xp, nextLevel, achievements, allTasks }: ProgressPanelProps) {
  const lastAchievement = getLastUnlocked(achievements);
  const pct             = nextLevel?.progressPct ?? 0;
  const weekActivity    = computeWeekActivity(allTasks);
  const maxActivity     = Math.max(...weekActivity, 1);
  const totalThisWeek   = weekActivity.reduce((a, b) => a + b, 0);
  const DAY_LABELS      = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const todayIdx        = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div style={styles.panel}>

      {/* ── Niveau ── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Niveau {level}</span>
          <span style={styles.xpText}>{xp.toLocaleString()} XP</span>
        </div>

        <div style={styles.barTrack}>
          <div style={{ ...styles.barFill, width: `${pct}%` }} />
        </div>

        <div style={styles.barLabels}>
          <span style={styles.barLabel}>Niveau {level}</span>
          <span style={styles.barLabel}>
            {nextLevel ? `${nextLevel.xpToNextLevel} XP restants` : 'Max'}
          </span>
        </div>
      </div>

      {/* ── Dernier achievement débloqué ── */}
      {lastAchievement && (
        <div style={styles.section}>
          <span style={styles.sectionTitle}>Dernier succès</span>
          <div style={styles.achievement}>
            <AchievementIcon
              iconName={lastAchievement.icon}
              conditionType={lastAchievement.conditionType}
              unlocked={true}
              size={40}
            />
            <div style={styles.achievementInfo}>
              <span style={styles.achievementName}>{lastAchievement.name}</span>
              <span style={styles.achievementDesc}>{lastAchievement.description}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Activité 7 jours ── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Activité cette semaine</span>
          {totalThisWeek > 0 && (
            <span style={styles.xpText}>
              {totalThisWeek} tâche{totalThisWeek > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {totalThisWeek === 0 ? (
          <div style={styles.emptyActivity}>
            <span style={{ fontSize: 11, color: colors.muted }}>
              Aucune tâche complétée cette semaine
            </span>
          </div>
        ) : (
          <div style={styles.activity}>
            {DAY_LABELS.map((day, i) => {
              const count   = weekActivity[i];
              const isToday = i === todayIdx;
              const barH    = count > 0
                ? `${Math.max(15, (count / maxActivity) * 100)}%`
                : '4px';

              return (
                <div key={i} style={styles.activityCol}>
                  {count > 0 && (
                    <span style={{
                      fontSize:     9,
                      fontWeight:   700,
                      color:        isToday ? colors.primary : colors.muted,
                      marginBottom: 2,
                    }}>
                      {count}
                    </span>
                  )}
                  <div style={styles.barContainer}>
                    <div style={{
                      ...styles.activityBar,
                      height:       barH,
                      background:   isToday
                        ? colors.primary
                        : count > 0
                        ? `${colors.primary}80`
                        : `${colors.border}60`,
                      borderRadius: count > 0 ? '3px 3px 0 0' : 3,
                    }} />
                  </div>
                  <span style={{
                    ...styles.dayLabel,
                    color:      isToday ? colors.primary : colors.muted,
                    fontWeight: isToday ? 700 : 400,
                  }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background:    colors.white,
    borderRadius:  radius.lg,
    padding:       '20px 24px',
    display:       'flex',
    flexDirection: 'column',
    gap:           20,
    boxShadow:     '0 1px 4px rgba(13,31,51,0.07)',
    border:        `1px solid ${colors.border}`,
  },
  section: {
    display:       'flex',
    flexDirection: 'column',
    gap:           10,
  },
  sectionHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  sectionTitle: {
    fontSize:   13,
    fontWeight: 700,
    color:      colors.dark,
  },
  xpText: {
    fontSize:   12,
    fontWeight: 600,
    color:      colors.primary,
  },
  barTrack: {
    height:       8,
    borderRadius: 4,
    background:   colors.border,
    overflow:     'hidden',
  },
  barFill: {
    height:       '100%',
    borderRadius: 4,
    background:   `linear-gradient(90deg, ${colors.primary}, #63ADFF)`,
    transition:   'width 1s cubic-bezier(0.4,0,0.2,1)',
  },
  barLabels: {
    display:        'flex',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontSize: 11,
    color:    colors.muted,
  },
  achievement: {
    display:      'flex',
    alignItems:   'center',
    gap:          12,
    padding:      '12px',
    borderRadius: radius.sm,
    background:   `${colors.primary}08`,
    border:       `1px solid ${colors.primary}20`,
  },
  achievementInfo: {
    display:       'flex',
    flexDirection: 'column',
    gap:           2,
    flex:          1,
    minWidth:      0,
  },
  achievementName: {
    fontSize:     13,
    fontWeight:   700,
    color:        colors.dark,
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  },
  achievementDesc: {
    fontSize:     11,
    color:        colors.muted,
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  },
  emptyActivity: {
    padding:      '12px',
    textAlign:    'center',
    background:   colors.background,
    borderRadius: radius.sm,
    border:       `1px dashed ${colors.border}`,
  },
  activity: {
    display:    'flex',
    gap:        6,
    height:     72,
    alignItems: 'flex-end',
  },
  activityCol: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           2,
    height:        '100%',
  },
  barContainer: {
    flex:           1,
    width:          '100%',
    display:        'flex',
    alignItems:     'flex-end',
    justifyContent: 'center',
  },
  activityBar: {
    width:      '70%',
    minHeight:  4,
    transition: 'height 0.5s ease',
  },
  dayLabel: {
    fontSize: 10,
    color:    colors.muted,
  },
};