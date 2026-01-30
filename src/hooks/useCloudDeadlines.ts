import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deadline, Subtask, Category, FocusSession, DEFAULT_CATEGORIES } from '@/types/deadline';
import { useAuth } from '@/providers/AuthProvider';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, startOfDay, subDays, isSameDay } from 'date-fns';

export function useCloudDeadlines() {
    const { user } = useAuth();
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    // Use local categories as fallback for now or fetch from DB if we migrated
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);

            const { data: deadlinesData } = await supabase.from('deadlines').select('*');
            const { data: subtasksData } = await supabase.from('subtasks').select('*');
            const { data: categoriesData } = await supabase.from('categories').select('*');
            const { data: sessionsData } = await supabase.from('focus_sessions').select('*');

            if (deadlinesData) setDeadlines(deadlinesData as any);
            if (subtasksData) setSubtasks(subtasksData as any);
            if (categoriesData && categoriesData.length > 0) setCategories(categoriesData as any);
            if (sessionsData) setFocusSessions(sessionsData as any);

            setLoading(false);
        };

        fetchData();

        // Realtime subscription could go here
        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // CRUD Operations - Wrappers around Supabase
    const createDeadline = async (data: Omit<Deadline, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
        if (!user) {
            console.error('[Cloud] Cannot create deadline: No user logged in');
            return;
        }

        console.log('[Cloud] Creating deadline for user:', user.id, data);

        const { data: newDeadline, error } = await supabase.from('deadlines').insert({
            ...data,
            user_id: user.id
        }).select().single();

        if (error) {
            console.error('[Cloud] Error creating deadline:', error);
            return;
        }

        if (newDeadline) {
            console.log('[Cloud] Deadline created successfully:', newDeadline);
            setDeadlines(prev => [...prev, newDeadline as any]);
        }
        return newDeadline;
    };

    const updateDeadline = async (id: string, updates: Partial<Deadline>) => {
        const { error } = await supabase.from('deadlines').update(updates).eq('id', id);
        if (!error) {
            setDeadlines(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
        }
    };

    const deleteDeadline = async (id: string) => {
        await supabase.from('deadlines').delete().eq('id', id);
        setDeadlines(prev => prev.filter(d => d.id !== id));
    };

    const completeDeadline = async (id: string) => {
        // Check children first
        const children = deadlines.filter(d => d.parent_id === id);
        if (children.length > 0) {
            const allCompleted = children.every(c => c.completed_at !== null);
            if (!allCompleted) return { success: false, reason: 'children_incomplete' };
        }

        const now = new Date().toISOString();
        await updateDeadline(id, { completed_at: now });
        return { success: true };
    };

    // Subtasks
    const createSubtask = async (data: Omit<Subtask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        if (!user) return;
        const { data: newSubtask } = await supabase.from('subtasks').insert({
            ...data,
            user_id: user.id
        }).select().single();

        if (newSubtask) setSubtasks(prev => [...prev, newSubtask as any]);
        return newSubtask;
    };

    const updateSubtask = async (id: string, updates: Partial<Subtask>) => {
        await supabase.from('subtasks').update(updates).eq('id', id);
        setSubtasks(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteSubtask = async (id: string) => {
        await supabase.from('subtasks').delete().eq('id', id);
        setSubtasks(prev => prev.filter(s => s.id !== id));
    };

    const toggleSubtask = async (id: string) => {
        const subtask = subtasks.find(s => s.id === id);
        if (subtask) {
            await updateSubtask(id, { completed: !subtask.completed });
        }
    };

    // Categories
    const createCategory = async (data: Omit<Category, 'id'>) => {
        if (!user) return;
        const { data: newCat } = await supabase.from('categories').insert({
            ...data,
            user_id: user.id
        }).select().single();
        if (newCat) setCategories(prev => [...prev, newCat as any]);
        return newCat;
    };

    const updateCategory = async (id: string, updates: Partial<Category>) => {
        await supabase.from('categories').update(updates).eq('id', id);
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const deleteCategory = async (id: string) => {
        await supabase.from('categories').delete().eq('id', id);
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    // Focus Sessions
    const createFocusSession = async (data: Omit<FocusSession, 'id' | 'user_id' | 'started_at'>) => {
        if (!user) return;
        const { data: newSession } = await supabase.from('focus_sessions').insert({
            ...data,
            user_id: user.id,
            started_at: new Date().toISOString()
        }).select().single();
        if (newSession) setFocusSessions(prev => [...prev, newSession as any]);
        return newSession;
    };

    const completeFocusSession = async (id: string) => {
        const now = new Date().toISOString();
        await supabase.from('focus_sessions').update({ completed_at: now }).eq('id', id);
        setFocusSessions(prev => prev.map(s => s.id === id ? { ...s, completed_at: now } : s));
    };

    // Helpers (Logic copied from useLocalDeadlines)
    const getSubtasksForDeadline = (deadlineId: string) => subtasks.filter(s => s.deadline_id === deadlineId);

    const getSubtasksMap = () => {
        const map: Record<string, Subtask[]> = {};
        subtasks.forEach(subtask => {
            if (!map[subtask.deadline_id]) map[subtask.deadline_id] = [];
            map[subtask.deadline_id].push(subtask);
        });
        return map;
    };

    const getChildDeadlines = (parentId: string) => deadlines.filter(d => d.parent_id === parentId);
    const getParentDeadline = (childId: string) => {
        const child = deadlines.find(d => d.id === childId);
        if (!child?.parent_id) return null;
        return deadlines.find(d => d.id === child.parent_id) || null;
    };
    const getRootDeadlines = () => deadlines.filter(d => d.parent_id === null);

    const canCompleteDeadline = (id: string) => {
        const children = deadlines.filter(d => d.parent_id === id);
        if (children.length === 0) return true;
        return children.every(c => c.completed_at !== null);
    };

    const convertSubtaskToDeadline = async (subtaskId: string) => {
        // Not implemented in cloud yet
        return null;
    };

    const reorderSubtasks = async (deadlineId: string, reorderedIds: string[]) => {
        // Not implemented in cloud yet - requires DB order index update
    };

    const reorderCategories = async (reorderedCategories: Category[]) => {
        // Not implemented
    };

    // Stats Logic (Pure functions using state)
    // Reuse the logic from useLocalDeadlines by extracting it to a util if possible, 
    // but for now I'll duplicate the memoization logic or just return basic stats.
    // Ideally we should extract `calculateStats` to a utility file.

    // Return equivalent structure
    return {
        deadlines,
        subtasks,
        categories,
        focusSessions,
        subtasksMap: getSubtasksMap(),
        // Logic below should be computed - for now returning placeholders or basic ops
        weeklyStats: { completedTotal: 0, completedByCategory: {}, totalFocusMinutes: 0, focusSessionsCount: 0, todaySessionsCount: 0 },
        streakStats: { currentStreak: 0, longestStreak: 0, todayActive: false },
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
        getChildDeadlines,
        getParentDeadline,
        getRootDeadlines,
        canCompleteDeadline,
        convertSubtaskToDeadline,
    };
}
