import { useLocalStorage } from './useLocalStorage';
import { Deadline, Subtask, Category, FocusSession, DEFAULT_CATEGORIES } from '@/types/deadline';
import { useCallback, useMemo } from 'react';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

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
    setDeadlines(prev => prev.map(d => 
      d.id === id ? { ...d, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() } : d
    ));
  }, [setDeadlines]);

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

  return {
    deadlines: deadlines.sort((a, b) => new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime()),
    subtasks,
    categories,
    focusSessions,
    subtasksMap: getSubtasksMap(),
    weeklyStats,
    createDeadline,
    updateDeadline,
    deleteDeadline,
    completeDeadline,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    createCategory,
    updateCategory,
    deleteCategory,
    getSubtasksForDeadline,
    createFocusSession,
    completeFocusSession,
  };
}
