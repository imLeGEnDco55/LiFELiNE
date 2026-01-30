import { useLocalStorage } from './useLocalStorage';
import { Deadline, Subtask, Category, FocusSession, DEFAULT_CATEGORIES } from '@/types/deadline';
import { useCallback, useMemo } from 'react';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, startOfDay, subDays, isSameDay } from 'date-fns';

const MOCK_USER_ID = 'local-test-user';

export function useDeadlines() {
  const [deadlines, setDeadlines] = useLocalStorage<Deadline[]>('deadliner-deadlines', []);
  const [subtasks, setSubtasks] = useLocalStorage<Subtask[]>('deadliner-subtasks', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('deadliner-categories', DEFAULT_CATEGORIES);
  const [focusSessions, setFocusSessions] = useLocalStorage<FocusSession[]>('deadliner-focus-sessions', []);

  const createDeadline = useCallback((data: Omit<Deadline, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
    const now = new Date().toISOString();
    const newDeadline: Deadline = {
      ...data,
      id: crypto.randomUUID(),
      user_id: MOCK_USER_ID,
      parent_id: data.parent_id ?? null,
      created_at: now,
      updated_at: now,
      completed_at: null,
    };
    setDeadlines(prev => [...prev, newDeadline]);
    return newDeadline;
  }, [setDeadlines]);

  const updateDeadline = useCallback((id: string, updates: Partial<Deadline>) => {
    setDeadlines(prev => prev.map(d => 
      d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
    ));
  }, [setDeadlines]);

  const deleteDeadline = useCallback((id: string) => {
    setDeadlines(prev => prev.filter(d => d.id !== id));
    setSubtasks(prev => prev.filter(s => s.deadline_id !== id));
  }, [setDeadlines, setSubtasks]);

  const completeDeadline = useCallback((id: string) => {
    // Check if all children are completed (blocking logic)
    const children = deadlines.filter(d => d.parent_id === id);
    const allChildrenCompleted = children.every(c => c.completed_at !== null);
    
    if (children.length > 0 && !allChildrenCompleted) {
      return { success: false, reason: 'children_incomplete' };
    }
    
    setDeadlines(prev => prev.map(d => 
      d.id === id ? { ...d, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() } : d
    ));
    return { success: true };
  }, [setDeadlines, deadlines]);

  const createSubtask = useCallback((data: Omit<Subtask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newSubtask: Subtask = {
      ...data,
      id: crypto.randomUUID(),
      user_id: MOCK_USER_ID,
      created_at: now,
      updated_at: now,
    };
    setSubtasks(prev => [...prev, newSubtask]);
    return newSubtask;
  }, [setSubtasks]);

  const updateSubtask = useCallback((id: string, updates: Partial<Subtask>) => {
    setSubtasks(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
    ));
  }, [setSubtasks]);

  const deleteSubtask = useCallback((id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  }, [setSubtasks]);

  const toggleSubtask = useCallback((id: string) => {
    setSubtasks(prev => prev.map(s => 
      s.id === id ? { ...s, completed: !s.completed, updated_at: new Date().toISOString() } : s
    ));
  }, [setSubtasks]);

  const reorderSubtasks = useCallback((deadlineId: string, reorderedIds: string[]) => {
    setSubtasks(prev => {
      const updated = [...prev];
      reorderedIds.forEach((id, index) => {
        const subtaskIndex = updated.findIndex(s => s.id === id);
        if (subtaskIndex !== -1) {
          updated[subtaskIndex] = { ...updated[subtaskIndex], order_index: index };
        }
      });
      return updated.sort((a, b) => {
        if (a.deadline_id === deadlineId && b.deadline_id === deadlineId) {
          return a.order_index - b.order_index;
        }
        return 0;
      });
    });
  }, [setSubtasks]);

  const createCategory = useCallback((data: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...data,
      id: crypto.randomUUID(),
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, [setCategories]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  }, [setCategories]);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    // Remove category from deadlines
    setDeadlines(prev => prev.map(d => 
      d.category_id === id ? { ...d, category_id: null } : d
    ));
  }, [setCategories, setDeadlines]);

  const reorderCategories = useCallback((reorderedCategories: typeof categories) => {
    setCategories(reorderedCategories);
  }, [setCategories]);

  // Focus Sessions
  const createFocusSession = useCallback((data: Omit<FocusSession, 'id' | 'user_id' | 'started_at'>) => {
    const newSession: FocusSession = {
      ...data,
      id: crypto.randomUUID(),
      user_id: MOCK_USER_ID,
      started_at: new Date().toISOString(),
    };
    setFocusSessions(prev => [...prev, newSession]);
    return newSession;
  }, [setFocusSessions]);

  const completeFocusSession = useCallback((id: string) => {
    setFocusSessions(prev => prev.map(s => 
      s.id === id ? { ...s, completed_at: new Date().toISOString() } : s
    ));
  }, [setFocusSessions]);

  const getSubtasksForDeadline = useCallback((deadlineId: string) => {
    return subtasks.filter(s => s.deadline_id === deadlineId);
  }, [subtasks]);

  const getSubtasksMap = useCallback(() => {
    const map: Record<string, Subtask[]> = {};
    subtasks.forEach(subtask => {
      if (!map[subtask.deadline_id]) map[subtask.deadline_id] = [];
      map[subtask.deadline_id].push(subtask);
    });
    return map;
  }, [subtasks]);

  // Nested deadlines helpers
  const getChildDeadlines = useCallback((parentId: string) => {
    return deadlines.filter(d => d.parent_id === parentId);
  }, [deadlines]);

  const getParentDeadline = useCallback((childId: string) => {
    const child = deadlines.find(d => d.id === childId);
    if (!child?.parent_id) return null;
    return deadlines.find(d => d.id === child.parent_id) || null;
  }, [deadlines]);

  const getRootDeadlines = useCallback(() => {
    return deadlines.filter(d => d.parent_id === null);
  }, [deadlines]);

  const canCompleteDeadline = useCallback((id: string) => {
    const children = deadlines.filter(d => d.parent_id === id);
    if (children.length === 0) return true;
    return children.every(c => c.completed_at !== null);
  }, [deadlines]);

  // Convert subtask to child deadline
  const convertSubtaskToDeadline = useCallback((subtaskId: string) => {
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask) return null;

    const parentDeadline = deadlines.find(d => d.id === subtask.deadline_id);
    if (!parentDeadline) return null;

    // Create new deadline with parent reference
    const now = new Date().toISOString();
    const newDeadline: Deadline = {
      id: crypto.randomUUID(),
      user_id: MOCK_USER_ID,
      title: subtask.title,
      description: null,
      deadline_at: subtask.due_at || parentDeadline.deadline_at, // Use subtask due_at or parent deadline
      priority: parentDeadline.priority,
      category_id: parentDeadline.category_id,
      parent_id: parentDeadline.id,
      created_at: now,
      updated_at: now,
      completed_at: subtask.completed ? now : null,
    };

    setDeadlines(prev => [...prev, newDeadline]);
    setSubtasks(prev => prev.filter(s => s.id !== subtaskId));

    return newDeadline;
  }, [subtasks, deadlines, setDeadlines, setSubtasks]);

  // Weekly stats
  const weeklyStats = useMemo(() => {
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
  }, [deadlines, focusSessions]);

  // Streak calculation
  const streakStats = useMemo(() => {
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

    // Sort dates descending
    const sortedDates = Array.from(activityDates)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    if (sortedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, todayActive: false };
    }

    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);
    
    // Check if today has activity
    const todayActive = sortedDates.some(d => isSameDay(d, today));
    
    // Calculate current streak
    let currentStreak = 0;
    let checkDate = todayActive ? today : yesterday;
    
    // If no activity today or yesterday, streak is 0
    if (!todayActive && !sortedDates.some(d => isSameDay(d, yesterday))) {
      currentStreak = 0;
    } else {
      for (let i = 0; i < 365; i++) {
        const hasActivity = sortedDates.some(d => isSameDay(d, checkDate));
        if (hasActivity) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    // Sort ascending for longest streak calculation
    const ascendingDates = [...sortedDates].sort((a, b) => a.getTime() - b.getTime());
    
    ascendingDates.forEach(date => {
      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const expectedNext = subDays(date, -1); // Add 1 day
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
  }, [deadlines, focusSessions]);

  return {
    deadlines: deadlines.sort((a, b) => new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime()),
    subtasks,
    categories,
    focusSessions,
    subtasksMap: getSubtasksMap(),
    weeklyStats,
    streakStats,
    createDeadline,
    updateDeadline,
    deleteDeadline,
    completeDeadline,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    reorderSubtasks,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    getSubtasksForDeadline,
    createFocusSession,
    completeFocusSession,
    // Nested deadlines
    getChildDeadlines,
    getParentDeadline,
    getRootDeadlines,
    canCompleteDeadline,
    convertSubtaskToDeadline,
  };
}
