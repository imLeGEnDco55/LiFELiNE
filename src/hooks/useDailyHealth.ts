import { useMemo } from 'react';
import { useDeadlines } from './useDeadlines';
import { 
  startOfDay, 
  endOfDay, 
  parseISO, 
  isSameDay,
  differenceInHours,
  isAfter,
  isBefore 
} from 'date-fns';

export type HealthStatus = 'vital' | 'stable' | 'weak' | 'critical' | 'flatline' | 'none';

export interface DayHealth {
  status: HealthStatus;
  score: number; // 0-100
  completedCount: number;
  overdueCount: number;
  focusMinutes: number;
}

export function useDailyHealth() {
  const { deadlines, focusSessions } = useDeadlines();

  const getDayHealth = useMemo(() => {
    return (date: Date): DayHealth => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const today = startOfDay(new Date());

      // Count completed deadlines on this day
      const completedCount = deadlines.filter(d => {
        if (!d.completed_at) return false;
        const completedDate = parseISO(d.completed_at);
        return isSameDay(completedDate, date);
      }).length;

      // Count deadlines that became overdue on this day
      const overdueCount = deadlines.filter(d => {
        if (d.completed_at) {
          // If completed, check if it was completed after deadline
          const deadlineDate = parseISO(d.deadline_at);
          const completedDate = parseISO(d.completed_at);
          return isSameDay(deadlineDate, date) && isAfter(completedDate, deadlineDate);
        }
        // If not completed, check if deadline was on this day and day has passed
        const deadlineDate = parseISO(d.deadline_at);
        return isSameDay(deadlineDate, date) && isBefore(dayEnd, today);
      }).length;

      // Count focus minutes on this day
      const focusMinutes = focusSessions
        .filter(s => {
          if (!s.completed_at) return false;
          const completedDate = parseISO(s.completed_at);
          return isSameDay(completedDate, date);
        })
        .reduce((acc, s) => acc + s.duration_minutes, 0);

      // Calculate health score (0-100)
      let score = 0;

      // No activity = no health data
      if (completedCount === 0 && focusMinutes === 0 && overdueCount === 0) {
        // Check if there were any deadlines due that day
        const hadDeadlines = deadlines.some(d => 
          isSameDay(parseISO(d.deadline_at), date)
        );
        
        if (!hadDeadlines) {
          return {
            status: 'none',
            score: 0,
            completedCount: 0,
            overdueCount: 0,
            focusMinutes: 0,
          };
        }
      }

      // Base score from completions (max 50)
      score += Math.min(completedCount * 15, 50);

      // Focus time bonus (max 30)
      score += Math.min(focusMinutes / 2, 30);

      // Overdue penalty (max -50)
      score -= overdueCount * 25;

      // Clamp score
      score = Math.max(0, Math.min(100, score));

      // Determine status
      let status: HealthStatus;
      if (score >= 75) {
        status = 'vital';
      } else if (score >= 50) {
        status = 'stable';
      } else if (score >= 25) {
        status = 'weak';
      } else if (score > 0) {
        status = 'critical';
      } else if (overdueCount > 0) {
        status = 'flatline';
      } else {
        status = 'none';
      }

      return {
        status,
        score,
        completedCount,
        overdueCount,
        focusMinutes,
      };
    };
  }, [deadlines, focusSessions]);

  return { getDayHealth };
}

// Visual config for health statuses
export const HEALTH_CONFIG: Record<HealthStatus, {
  color: string;
  bgColor: string;
  label: string;
  emoji: string;
}> = {
  vital: {
    color: 'hsl(142, 76%, 50%)',
    bgColor: 'hsl(142, 76%, 50%, 0.3)',
    label: 'Signos vitales óptimos',
    emoji: '💚',
  },
  stable: {
    color: 'hsl(200, 100%, 60%)',
    bgColor: 'hsl(200, 100%, 60%, 0.3)',
    label: 'Paciente estable',
    emoji: '💙',
  },
  weak: {
    color: 'hsl(45, 100%, 55%)',
    bgColor: 'hsl(45, 100%, 55%, 0.3)',
    label: 'Signos débiles',
    emoji: '💛',
  },
  critical: {
    color: 'hsl(25, 95%, 55%)',
    bgColor: 'hsl(25, 95%, 55%, 0.3)',
    label: 'Estado crítico',
    emoji: '🧡',
  },
  flatline: {
    color: 'hsl(0, 84%, 60%)',
    bgColor: 'hsl(0, 84%, 60%, 0.3)',
    label: 'Sin signos vitales',
    emoji: '💔',
  },
  none: {
    color: 'hsl(0, 0%, 40%)',
    bgColor: 'transparent',
    label: 'Sin actividad registrada',
    emoji: '🩶',
  },
};
