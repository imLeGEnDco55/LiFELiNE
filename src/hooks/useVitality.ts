import { useMemo } from 'react';
import { useDeadlines } from './useDeadlines';
import { differenceInDays, differenceInHours, parseISO, startOfDay } from 'date-fns';

export type VitalityState = 'vital' | 'weak' | 'critical' | 'flatline';

export interface VitalityData {
  score: number; // 0-100
  state: VitalityState;
  daysSinceActivity: number;
  overdueCount: number;
  completedRecently: number;
  streakDays: number;
  message: string;
}

export function useVitality(): VitalityData {
  const { deadlines, focusSessions, streakStats } = useDeadlines();

  return useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);

    // 1. Find last activity date
    let lastActivityDate: Date | null = null;

    deadlines.forEach(d => {
      if (d.completed_at) {
        const date = parseISO(d.completed_at);
        if (!lastActivityDate || date > lastActivityDate) {
          lastActivityDate = date;
        }
      }
    });

    focusSessions.forEach(s => {
      if (s.completed_at) {
        const date = parseISO(s.completed_at);
        if (!lastActivityDate || date > lastActivityDate) {
          lastActivityDate = date;
        }
      }
    });

    const daysSinceActivity = lastActivityDate 
      ? differenceInDays(today, startOfDay(lastActivityDate))
      : 999;

    // 2. Count overdue deadlines
    const overdueCount = deadlines.filter(d => {
      if (d.completed_at) return false;
      return parseISO(d.deadline_at) < now;
    }).length;

    // 3. Count recently completed (last 7 days)
    const completedRecently = deadlines.filter(d => {
      if (!d.completed_at) return false;
      const completedDate = parseISO(d.completed_at);
      return differenceInDays(today, startOfDay(completedDate)) <= 7;
    }).length;

    // 4. Get streak
    const streakDays = streakStats.currentStreak;

    // 5. Calculate vitality score (0-100)
    let score = 50; // Base score

    // Activity recency (max +30 or -50)
    if (daysSinceActivity === 0) {
      score += 30;
    } else if (daysSinceActivity === 1) {
      score += 15;
    } else if (daysSinceActivity === 2) {
      score += 5;
    } else if (daysSinceActivity >= 3 && daysSinceActivity < 5) {
      score -= 20;
    } else if (daysSinceActivity >= 5) {
      score -= 50;
    }

    // Streak bonus (max +20)
    score += Math.min(streakDays * 3, 20);

    // Overdue penalty (max -30)
    score -= Math.min(overdueCount * 10, 30);

    // Recent completions bonus (max +15)
    score += Math.min(completedRecently * 3, 15);

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Determine state
    let state: VitalityState;
    let message: string;

    if (score >= 75) {
      state = 'vital';
      message = streakDays > 0 
        ? `${streakDays} días de racha. ¡Sigue así!`
        : '¡Tu productividad está en forma!';
    } else if (score >= 50) {
      state = 'weak';
      message = overdueCount > 0
        ? `${overdueCount} tarea${overdueCount > 1 ? 's' : ''} vencida${overdueCount > 1 ? 's' : ''}`
        : 'Tu ritmo está bajando...';
    } else if (score >= 25) {
      state = 'critical';
      message = daysSinceActivity >= 3
        ? `${daysSinceActivity} días sin actividad`
        : '¡Señales vitales críticas!';
    } else {
      state = 'flatline';
      message = daysSinceActivity >= 5
        ? '⚠️ Sin signos de vida...'
        : '¡Necesitas reanimación!';
    }

    return {
      score,
      state,
      daysSinceActivity,
      overdueCount,
      completedRecently,
      streakDays,
      message,
    };
  }, [deadlines, focusSessions, streakStats]);
}
