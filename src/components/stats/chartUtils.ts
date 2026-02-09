import { Deadline, FocusSession } from '@/types/deadline';
import { addDays, format, parseISO, differenceInCalendarDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export interface ChartData {
  day: string;
  fullDay: string;
  deadlines: number;
  focus: number;
  isToday: boolean;
}

/**
 * Calculates chart data for the week starting at weekStart.
 * Optimized for O(N + M) complexity where N is deadlines and M is focus sessions.
 */
export function calculateChartData(
  deadlines: Deadline[],
  focusSessions: FocusSession[],
  weekStart: Date,
  today: Date = new Date()
): ChartData[] {
  // Initialize array of 7 days with zeroed data
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return {
      day: format(d, 'EEE', { locale: es }),
      fullDay: format(d, 'EEEE', { locale: es }),
      deadlines: 0,
      focus: 0, // This accumulates minutes initially
      isToday: isSameDay(d, today),
    };
  });

  // Single pass over deadlines
  for (const d of deadlines) {
    if (!d.completed_at) continue;
    const completedDate = parseISO(d.completed_at);
    const diff = differenceInCalendarDays(completedDate, weekStart);

    // Check if the deadline falls within the week (0-6 days from start)
    if (diff >= 0 && diff < 7) {
      data[diff].deadlines++;
    }
  }

  // Single pass over focus sessions
  for (const s of focusSessions) {
    if (!s.completed_at || s.session_type !== 'work') continue;
    const sessionDate = parseISO(s.started_at);
    const diff = differenceInCalendarDays(sessionDate, weekStart);

    // Check if the session falls within the week (0-6 days from start)
    if (diff >= 0 && diff < 7) {
      data[diff].focus += s.duration_minutes;
    }
  }

  // Convert accumulated focus minutes to pomodoro sessions (approx 25 mins)
  return data.map(item => ({
    ...item,
    focus: Math.round(item.focus / 25)
  }));
}
