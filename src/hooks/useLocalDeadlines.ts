import { useLocalStorage } from './useLocalStorage';
import { Deadline, Subtask, Category, FocusSession, DEFAULT_CATEGORIES } from '@/types/deadline';
import { useCallback, useMemo } from 'react';
import { calculateWeeklyStats, calculateStreakStats } from '@/lib/stats';

const MOCK_USER_ID = 'local-test-user';

export function useLocalDeadlines() {
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

  // Memoized subtasks map - only recomputes when subtasks change
  const subtasksMap = useMemo(() => {
    const map: Record<string, Subtask[]> = {};
    subtasks.forEach(subtask => {
      if (!map[subtask.deadline_id]) map[subtask.deadline_id] = [];
      map[subtask.deadline_id].push(subtask);
    });
    return map;
  }, [subtasks]);

  // Memoized children map - O(N) -> O(1) lookup
  const deadlineChildrenMap = useMemo(() => {
    const map: Record<string, Deadline[]> = {};
    deadlines.forEach(d => {
      if (d.parent_id) {
        if (!map[d.parent_id]) map[d.parent_id] = [];
        map[d.parent_id].push(d);
      }
    });
    return map;
  }, [deadlines]);

  // Memoized root deadlines
  const rootDeadlinesList = useMemo(() => {
    return deadlines.filter(d => d.parent_id === null);
  }, [deadlines]);

  // Nested deadlines helpers - now O(1) instead of O(N)
  const getChildDeadlines = useCallback((parentId: string) => {
    return deadlineChildrenMap[parentId] || [];
  }, [deadlineChildrenMap]);

  const getParentDeadline = useCallback((childId: string) => {
    const child = deadlines.find(d => d.id === childId);
    if (!child?.parent_id) return null;
    return deadlines.find(d => d.id === child.parent_id) || null;
  }, [deadlines]);

  const getRootDeadlines = useCallback(() => {
    return rootDeadlinesList;
  }, [rootDeadlinesList]);

  const canCompleteDeadline = useCallback((id: string) => {
    const children = deadlineChildrenMap[id] || [];
    if (children.length === 0) return true;
    return children.every(c => c.completed_at !== null);
  }, [deadlineChildrenMap]);

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
      deadline_at: parentDeadline.deadline_at, // Use parent deadline date
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

  // Weekly stats - using shared utility
  const weeklyStats = useMemo(() =>
    calculateWeeklyStats(deadlines, focusSessions),
    [deadlines, focusSessions]
  );

  // Streak calculation - using shared utility
  const streakStats = useMemo(() =>
    calculateStreakStats(deadlines, focusSessions),
    [deadlines, focusSessions]
  );

  return {
    deadlines: deadlines.sort((a, b) => new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime()),
    subtasks,
    categories,
    focusSessions,
    subtasksMap,
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
