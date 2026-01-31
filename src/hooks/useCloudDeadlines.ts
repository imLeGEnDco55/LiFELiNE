import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deadline, Subtask, Category, FocusSession, DEFAULT_CATEGORIES } from '@/types/deadline';
import { useAuth } from '@/providers/AuthProvider';
import { calculateWeeklyStats, calculateStreakStats } from '@/lib/stats';

export function useCloudDeadlines() {
    const { user } = useAuth();
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    // Start empty to force usage of DB categories (with valid UUIDs)
    const [categories, setCategories] = useState<Category[]>([]);
    const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);

            // Parallel fetch - all queries run simultaneously
            const [
                { data: deadlinesData },
                { data: subtasksData },
                { data: categoriesResult },
                { data: sessionsData }
            ] = await Promise.all([
                supabase.from('deadlines').select('*'),
                supabase.from('subtasks').select('*').order('order_index'),
                supabase.from('categories').select('*'),
                supabase.from('focus_sessions').select('*')
            ]);

            let categoriesData = categoriesResult;

            // Seed categories if empty
            if (!categoriesData || categoriesData.length === 0) {
                console.log('[Cloud] Seeding default categories...');
                const categoriesToInsert = DEFAULT_CATEGORIES.map(c => ({
                    user_id: user.id,
                    name: c.name,
                    color: c.color,
                    icon: c.icon
                }));

                const { data: newCategories, error } = await supabase
                    .from('categories')
                    .insert(categoriesToInsert)
                    .select();

                if (error) {
                    console.error('[Cloud] Error seeding categories:', error);
                } else {
                    categoriesData = newCategories;
                }
            }

            if (deadlinesData) setDeadlines(deadlinesData as any);
            if (subtasksData) setSubtasks(subtasksData as any);
            if (categoriesData) setCategories(categoriesData as any);
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
    const getSubtasksForDeadline = (deadlineId: string) =>
        subtasks.filter(s => s.deadline_id === deadlineId).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    // Memoized subtasks map - only recomputes when subtasks change
    const subtasksMap = useMemo(() => {
        const map: Record<string, Subtask[]> = {};
        // Sort first, then group
        const sorted = [...subtasks].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        sorted.forEach(subtask => {
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

    const getChildDeadlines = (parentId: string) => deadlineChildrenMap[parentId] || [];
    const getParentDeadline = (childId: string) => {
        const child = deadlines.find(d => d.id === childId);
        if (!child?.parent_id) return null;
        return deadlines.find(d => d.id === child.parent_id) || null;
    };
    const getRootDeadlines = () => rootDeadlinesList;

    const canCompleteDeadline = (id: string) => {
        const children = deadlineChildrenMap[id] || [];
        if (children.length === 0) return true;
        return children.every(c => c.completed_at !== null);
    };

    const convertSubtaskToDeadline = async (subtaskId: string) => {
        if (!user) return null;

        const subtask = subtasks.find(s => s.id === subtaskId);
        if (!subtask) return null;

        const parentDeadline = deadlines.find(d => d.id === subtask.deadline_id);
        if (!parentDeadline) return null;

        // Create new deadline from subtask
        const { data: newDeadline, error: createError } = await supabase
            .from('deadlines')
            .insert({
                user_id: user.id,
                title: subtask.title,
                description: null,
                deadline_at: parentDeadline.deadline_at,
                priority: parentDeadline.priority,
                category_id: parentDeadline.category_id,
                parent_id: parentDeadline.id,
                completed_at: subtask.completed ? new Date().toISOString() : null
            })
            .select()
            .single();

        if (createError) {
            console.error('[Cloud] Error converting subtask to deadline:', createError);
            return null;
        }

        // Delete the original subtask
        const { error: deleteError } = await supabase
            .from('subtasks')
            .delete()
            .eq('id', subtaskId);

        if (deleteError) {
            console.error('[Cloud] Error deleting converted subtask:', deleteError);
            // We continue anyway since the deadline was created
        }

        // Update local state
        if (newDeadline) {
            setDeadlines(prev => [...prev, newDeadline as any]);
            setSubtasks(prev => prev.filter(s => s.id !== subtaskId));
        }

        return newDeadline;
    };

    const reorderSubtasks = async (deadlineId: string, reorderedIds: string[]) => {
        // Update order_index for each subtask in Supabase
        const updates = reorderedIds.map((id, index) =>
            supabase.from('subtasks').update({ order_index: index }).eq('id', id)
        );

        const results = await Promise.all(updates);
        const hasError = results.some(r => r.error);

        if (hasError) {
            console.error('[Cloud] Error reordering subtasks');
            return;
        }

        // Update local state
        setSubtasks(prev => {
            const updated = [...prev];
            reorderedIds.forEach((id, index) => {
                const idx = updated.findIndex(s => s.id === id);
                if (idx !== -1) {
                    updated[idx] = { ...updated[idx], order_index: index };
                }
            });
            return updated;
        });
    };

    const reorderCategories = async (reorderedCategories: Category[]) => {
        // Update order_index for each category in Supabase
        const updates = reorderedCategories.map((cat, index) =>
            supabase.from('categories').update({ order_index: index }).eq('id', cat.id)
        );

        const results = await Promise.all(updates);
        const hasError = results.some(r => r.error);

        if (hasError) {
            console.error('[Cloud] Error reordering categories');
            return;
        }

        // Update local state with new order
        setCategories(reorderedCategories.map((c, i) => ({ ...c, order_index: i })));
    };

    // Stats Logic (Pure functions using state)
    // Reuse the logic from useLocalDeadlines by extracting it to a util if possible, 
    // but for now I'll duplicate the memoization logic or just return basic stats.
    // Ideally we should extract `calculateStats` to a utility file.

    // Stats computed using shared utilities
    const weeklyStats = useMemo(() =>
        calculateWeeklyStats(deadlines, focusSessions),
        [deadlines, focusSessions]
    );

    const streakStats = useMemo(() =>
        calculateStreakStats(deadlines, focusSessions),
        [deadlines, focusSessions]
    );

    // Return equivalent structure
    return {
        deadlines,
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
        getChildDeadlines,
        getParentDeadline,
        getRootDeadlines,
        canCompleteDeadline,
        convertSubtaskToDeadline,
    };
}
