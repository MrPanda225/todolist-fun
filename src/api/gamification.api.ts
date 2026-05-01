import { api } from './axios.instance';

export interface UserStats {
  id:               string;
  userId:           string;
  totalXp:          number;
  level:            number;
  currentStreak:    number;
  longestStreak:    number;
  tasksCompleted:   number;
  lastActivityDate: string | null;
}

export interface NextLevel {
  current: number;
  next:    number;
}

// Reflète exactement AchievementWithStatus du backend
export interface Achievement {
  id:             string;
  name:           string;
  description:    string;
  icon:           string;
  xpBonus:        number;
  conditionType:  string;
  conditionValue: number;
  unlocked:       boolean;    // true = débloqué, false = verrouillé
  unlockedAt:     string | null;
}

export const gamificationApi = {
  getStats:        () => api.get<UserStats>('/gamification/stats'),
  getNextLevel:    () => api.get<NextLevel>('/gamification/stats/next-level'),
  getAchievements: () => api.get<Achievement[]>('/gamification/achievements'),
};