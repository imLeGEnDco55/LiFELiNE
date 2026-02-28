import { useMemo } from 'react';
import { useDeadlines } from './useDeadlines';
import { differenceInDays, parseISO, startOfDay, subDays, isSameDay, isAfter } from 'date-fns';

export type VitalityState = 'vital' | 'weak' | 'critical' | 'flatline';

export interface VitalityData {
  score: number; // 0-100 (clamped, but rawScore can exceed)
  rawScore: number; // Unclamped score for overwork detection
  state: VitalityState;
  daysSinceActivity: number;
  overdueCount: number;
  completedRecently: number;
  completedToday: number;
  streakDays: number;
  focusMinutesToday: number;
  completionRatio: number; // 0-1
  isOverworking: boolean;
  hasScheduledTasksToday: boolean;
  message: string;
}

export function useVitality(): VitalityData {
  const { deadlines, focusSessions, streakStats } = useDeadlines();

  return useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = subDays(today, 1);

    // --- ⚡ Bolt Optimization: Single-pass iteration ---
    // Instead of chaining multiple `.filter()`/`.reduce()` operations that iterate
    // over arrays repeatedly and parsing the same ISO string multiple times, we loop
    // exactly once over deadlines and once over focusSessions, maintaining local time accuracy.
    
    let lastActivityDate: Date | null = null;
    let overdueCount = 0;
    let scheduledToday = false;
    let completedToday = 0;
    let completedRecently = 0;
    let completedYesterday = 0;
    let totalThisWeek = 0;

    for (const d of deadlines) {
      const deadlineDate = parseISO(d.deadline_at);
      const deadlineStartOfDay = startOfDay(deadlineDate);

      // Calculate scheduledToday: deadline is today or overdue
      if (isSameDay(deadlineStartOfDay, today) || isAfter(today, deadlineStartOfDay)) {
        scheduledToday = true;
      }

      // Calculate totalThisWeek: deadline in last 7 days or completed_at exists
      if (differenceInDays(today, deadlineStartOfDay) <= 7 || d.completed_at) {
        totalThisWeek++;
      }

      if (d.completed_at) {
        const date = parseISO(d.completed_at);
        if (!lastActivityDate || date > lastActivityDate) {
          lastActivityDate = date;
        }

        const completedStartOfDay = startOfDay(date);

        if (isSameDay(completedStartOfDay, today)) {
          completedToday++;
        } else if (isSameDay(completedStartOfDay, yesterday)) {
          completedYesterday++;
        }

        if (differenceInDays(today, completedStartOfDay) <= 7) {
          completedRecently++;
        }
      } else {
        if (deadlineDate < now) {
          overdueCount++;
        }
      }
    }

    let focusMinutesToday = 0;
    let focusMinutesYesterday = 0;

    for (const s of focusSessions) {
      if (s.completed_at) {
        const date = parseISO(s.completed_at);
        if (!lastActivityDate || date > lastActivityDate) {
          lastActivityDate = date;
        }
      }

      if (s.completed_at && s.session_type === 'work') {
        const startedStartOfDay = startOfDay(parseISO(s.started_at));
        if (isSameDay(startedStartOfDay, today)) {
          focusMinutesToday += s.duration_minutes;
        } else if (isSameDay(startedStartOfDay, yesterday)) {
          focusMinutesYesterday += s.duration_minutes;
        }
      }
    }

    const daysSinceActivity = lastActivityDate 
      ? differenceInDays(today, startOfDay(lastActivityDate))
      : 999;

    const hasScheduledTasksToday = scheduledToday;
    const completionRatio = totalThisWeek > 0 ? completedRecently / totalThisWeek : 1;

    // === 4. STREAK ===
    const streakDays = streakStats.currentStreak;

    // === 5. CALCULATE VITALITY SCORE ===
    let score = 40; // Base score (neutral starting point)

    // --- Activity Recency (max +35 / -40) ---
    if (daysSinceActivity === 0) {
      score += 35; // Active today = big boost
    } else if (daysSinceActivity === 1) {
      score += 20;
    } else if (daysSinceActivity === 2) {
      score += 5;
    } else if (daysSinceActivity >= 3 && daysSinceActivity < 5) {
      // Grace period if no tasks scheduled
      if (!hasScheduledTasksToday && overdueCount === 0) {
        score -= 5; // Minimal penalty
      } else {
        score -= 25;
      }
    } else if (daysSinceActivity >= 5) {
      if (!hasScheduledTasksToday && overdueCount === 0) {
        score -= 15; // Reduced penalty for empty schedule
      } else {
        score -= 40;
      }
    }

    // --- Streak Bonus (max +25) ---
    if (streakDays >= 7) {
      score += 25;
    } else if (streakDays >= 3) {
      score += 15;
    } else if (streakDays >= 1) {
      score += 8;
    }

    // --- Completion Ratio Bonus (max +20) ---
    if (completionRatio >= 0.9) {
      score += 20;
    } else if (completionRatio >= 0.7) {
      score += 12;
    } else if (completionRatio >= 0.5) {
      score += 5;
    } else if (completionRatio < 0.3 && totalThisWeek > 0) {
      score -= 10; // Low completion penalty
    }

    // --- Focus Session Bonus (max +15) ---
    if (focusMinutesToday >= 90) {
      score += 15;
    } else if (focusMinutesToday >= 45) {
      score += 10;
    } else if (focusMinutesToday >= 25) {
      score += 5;
    }

    // --- Momentum Bonus (improvement vs yesterday, max +10) ---
    const todayActivity = completedToday + (focusMinutesToday > 0 ? 1 : 0);
    const yesterdayActivity = completedYesterday + (focusMinutesYesterday > 0 ? 1 : 0);
    if (todayActivity > yesterdayActivity && todayActivity > 0) {
      score += 10; // Improving trend
    } else if (todayActivity === yesterdayActivity && todayActivity > 0) {
      score += 3; // Maintaining pace
    }

    // --- Overdue Penalty (max -25) ---
    if (overdueCount > 0) {
      score -= Math.min(overdueCount * 8, 25);
    }

    // --- Today's Completions Bonus (max +10) ---
    score += Math.min(completedToday * 3, 10);

    // Store raw score before clamping (for overwork detection)
    const rawScore = score;
    
    // Detect overworking (raw score exceeds 100 significantly)
    const isOverworking = rawScore > 110;

    // Clamp score to 0-100
    score = Math.max(0, Math.min(100, score));

    // === 6. DETERMINE STATE & MESSAGE ===
    let state: VitalityState;
    let message: string;

    if (isOverworking) {
      state = 'vital';
      const overworkMessages = [
        '🏆 Increíble ritmo... ¿un descanso?',
        '⚡ Productividad máxima. Recuerda respirar.',
        '🔥 Vas a tope. Planea un break.',
        '💪 Racha brutal. Tu cuerpo también cuenta.',
      ];
      message = overworkMessages[Math.floor(Math.random() * overworkMessages.length)];
    } else if (score >= 85) {
      state = 'vital';
      if (streakDays >= 7) {
        message = `🔥 ${streakDays} días de racha. ¡Imparable!`;
      } else if (completedToday >= 3) {
        message = `⚡ ${completedToday} tareas hoy. ¡En llamas!`;
      } else if (focusMinutesToday >= 60) {
        message = `🧘 ${focusMinutesToday}min de focus. ¡Zen total!`;
      } else {
        message = '💚 Signos vitales óptimos';
      }
    } else if (score >= 65) {
      state = 'vital';
      if (streakDays > 0) {
        message = `${streakDays} día${streakDays > 1 ? 's' : ''} de racha activa`;
      } else {
        message = '✨ Buen ritmo de trabajo';
      }
    } else if (score >= 45) {
      state = 'weak';
      if (overdueCount > 0) {
        message = `⚠️ ${overdueCount} tarea${overdueCount > 1 ? 's' : ''} vencida${overdueCount > 1 ? 's' : ''}`;
      } else if (daysSinceActivity >= 2) {
        message = `${daysSinceActivity} días sin actividad...`;
      } else {
        message = 'Tu ritmo está bajando...';
      }
    } else if (score >= 25) {
      state = 'critical';
      if (overdueCount > 2) {
        message = `🚨 ${overdueCount} tareas acumuladas`;
      } else if (daysSinceActivity >= 3) {
        message = `⚠️ ${daysSinceActivity} días desconectado`;
      } else {
        message = '¡Señales vitales críticas!';
      }
    } else {
      state = 'flatline';
      if (daysSinceActivity >= 7) {
        message = '💀 Línea plana... ¿sigues ahí?';
      } else if (overdueCount > 3) {
        message = '🆘 Emergencia productiva';
      } else {
        message = '⚠️ Sin signos de vida...';
      }
    }

    return {
      score,
      rawScore,
      state,
      daysSinceActivity,
      overdueCount,
      completedRecently,
      completedToday,
      streakDays,
      focusMinutesToday,
      completionRatio,
      isOverworking,
      hasScheduledTasksToday,
      message,
    };
  }, [deadlines, focusSessions, streakStats]);
}
