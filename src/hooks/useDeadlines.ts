import { useLocalStorage } from './useLocalStorage';
import { Deadline, Subtask, Category, DEFAULT_CATEGORIES } from '@/types/deadline';
import { useCallback } from 'react';

const MOCK_USER_ID = 'local-test-user';

export function useDeadlines() {
  const [deadlines, setDeadlines] = useLocalStorage<Deadline[]>('deadliner-deadlines', []);
  const [subtasks, setSubtasks] = useLocalStorage<Subtask[]>('deadliner-subtasks', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('deadliner-categories', DEFAULT_CATEGORIES);

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

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    // Remove category from deadlines
    setDeadlines(prev => prev.map(d => 
      d.category_id === id ? { ...d, category_id: null } : d
    ));
  }, [setCategories, setDeadlines]);

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

  return {
    deadlines: deadlines.sort((a, b) => new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime()),
    subtasks,
    categories,
    subtasksMap: getSubtasksMap(),
    createDeadline,
    updateDeadline,
    deleteDeadline,
    completeDeadline,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    createCategory,
    deleteCategory,
    getSubtasksForDeadline,
  };
}
