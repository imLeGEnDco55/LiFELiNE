import { bench, describe } from 'vitest';
import { startOfWeek, addDays, isSameDay, parseISO, differenceInCalendarDays } from 'date-fns';

// Mock data generation
const generateData = (count: number) => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const deadlines = Array.from({ length: count }, (_, i) => ({
    id: `d-${i}`,
    completed_at: addDays(weekStart, i % 7).toISOString(), // Distribute across the week
    title: 'test'
  }));

  const focusSessions = Array.from({ length: count }, (_, i) => ({
    id: `s-${i}`,
    started_at: addDays(weekStart, i % 7).toISOString(),
    completed_at: addDays(weekStart, i % 7).toISOString(),
    session_type: 'work',
    duration_minutes: 25
  }));

  return { deadlines, focusSessions };
};

const COUNT = 5000;
const { deadlines, focusSessions } = generateData(COUNT);
const now = new Date();
const weekStart = startOfWeek(now, { weekStartsOn: 1 });
const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

describe('DailyActivityChart Calculation', () => {

  bench('current_implementation (O(7*N))', () => {
    days.map(day => {
      const completedDeadlines = deadlines.filter(d => {
        if (!d.completed_at) return false;
        return isSameDay(parseISO(d.completed_at), day);
      }).length;

      const focusMinutes = focusSessions
        .filter(s => {
          if (!s.completed_at || s.session_type !== 'work') return false;
          return isSameDay(parseISO(s.started_at), day);
        })
        .reduce((acc, s) => acc + s.duration_minutes, 0);

      return { deadlines: completedDeadlines, focus: focusMinutes };
    });
  });

  bench('optimized_implementation (O(N))', () => {
    // Initialize stats array for 7 days
    const stats = Array.from({ length: 7 }, () => ({ deadlines: 0, focus: 0 }));

    // Single pass for deadlines
    deadlines.forEach(d => {
        if (!d.completed_at) return;
        const date = parseISO(d.completed_at);
        const dayIndex = differenceInCalendarDays(date, weekStart);
        if (dayIndex >= 0 && dayIndex < 7) {
            stats[dayIndex].deadlines++;
        }
    });

    // Single pass for focus sessions
    focusSessions.forEach(s => {
        if (!s.completed_at || s.session_type !== 'work') return;
        const date = parseISO(s.started_at);
        const dayIndex = differenceInCalendarDays(date, weekStart);
        if (dayIndex >= 0 && dayIndex < 7) {
             stats[dayIndex].focus += s.duration_minutes;
        }
    });

    // Map to final structure (simulate what the component does)
    days.map((day, i) => {
        return {
            deadlines: stats[i].deadlines,
            focus: stats[i].focus
        };
    });
  });
});
