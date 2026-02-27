import { Deadline, FocusSession } from '@/types/deadline';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, startOfDay, subDays, isSameDay } from 'date-fns';

export interface WeeklyStats {
    completedTotal: number;
    completedByCategory: Record<string, number>;
    totalFocusMinutes: number;
    focusSessionsCount: number;
    todaySessionsCount: number;
}

export interface StreakStats {
    currentStreak: number;
    longestStreak: number;
    todayActive: boolean;
}

/**
 * Calculate weekly statistics for deadlines and focus sessions
 */
export function calculateWeeklyStats(
    deadlines: Deadline[],
    focusSessions: FocusSession[]
): WeeklyStats {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const interval = { start: weekStart, end: weekEnd };

    // Completed deadlines this week
    const completedThisWeek = deadlines.filter(d => {
        if (!d.completed_at) return false;
        const completedDate = parseISO(d.completed_at);
        return isWithinInterval(completedDate, interval);
    });

    // Completed by category
    const completedByCategory: Record<string, number> = {};
    completedThisWeek.forEach(d => {
        const catId = d.category_id || 'uncategorized';
        completedByCategory[catId] = (completedByCategory[catId] || 0) + 1;
    });

    // Focus sessions this week
    const focusThisWeek = focusSessions.filter(s => {
        if (!s.completed_at || s.session_type !== 'work') return false;
        const sessionDate = parseISO(s.started_at);
        return isWithinInterval(sessionDate, interval);
    });

    const totalFocusMinutes = focusThisWeek.reduce((acc, s) => acc + s.duration_minutes, 0);

    // Today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = focusSessions.filter(s => {
        if (!s.completed_at || s.session_type !== 'work') return false;
        return parseISO(s.started_at) >= today;
    });

    return {
        completedTotal: completedThisWeek.length,
        completedByCategory,
        totalFocusMinutes,
        focusSessionsCount: focusThisWeek.length,
        todaySessionsCount: todaySessions.length,
    };
}

/**
 * Calculate streak statistics based on activity dates
 */
export function calculateStreakStats(
    deadlines: Deadline[],
    focusSessions: FocusSession[]
): StreakStats {
    // Get all activity dates (deadlines completed + focus sessions)
    const activityDates = new Set<string>();

    deadlines.forEach(d => {
        if (d.completed_at) {
            const date = startOfDay(parseISO(d.completed_at));
            activityDates.add(date.toISOString());
        }
    });

    focusSessions.forEach(s => {
        if (s.completed_at && s.session_type === 'work') {
            const date = startOfDay(parseISO(s.started_at));
            activityDates.add(date.toISOString());
        }
    });

    if (activityDates.size === 0) {
        return { currentStreak: 0, longestStreak: 0, todayActive: false };
    }

    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);

    // Check if today has activity (O(1) lookup)
    const todayActive = activityDates.has(today.toISOString());

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = todayActive ? today : yesterday;

    // If no activity today or yesterday, streak is 0
    // O(1) lookup for yesterday
    if (!todayActive && !activityDates.has(yesterday.toISOString())) {
        currentStreak = 0;
    } else {
        // O(K) loop with O(1) lookup inside, instead of O(K * N)
        for (let i = 0; i < 365; i++) {
            if (activityDates.has(checkDate.toISOString())) {
                currentStreak++;
                checkDate = subDays(checkDate, 1);
            } else {
                break;
            }
        }
    }

    // Calculate longest streak
    // We still need sorted dates for longest streak calculation
    const sortedDates = Array.from(activityDates)
        .map(d => new Date(d))
        .sort((a, b) => a.getTime() - b.getTime()); // Ascending

    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    sortedDates.forEach(date => {
        if (prevDate === null) {
            tempStreak = 1;
        } else {
            if (isSameDay(prevDate, subDays(date, 1))) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        prevDate = date;
    });

    return { currentStreak, longestStreak, todayActive };
}

/**
 * Empty stats for initial/loading states
 */
export const EMPTY_WEEKLY_STATS: WeeklyStats = {
    completedTotal: 0,
    completedByCategory: {},
    totalFocusMinutes: 0,
    focusSessionsCount: 0,
    todaySessionsCount: 0,
};

export const EMPTY_STREAK_STATS: StreakStats = {
    currentStreak: 0,
    longestStreak: 0,
    todayActive: false,
};
