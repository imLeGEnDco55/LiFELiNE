import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Subtask, Deadline } from '@/types/deadline';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

interface SubtaskWithDeadline extends Subtask {
  deadline?: Deadline;
}

export function TasksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: deadlines = [] } = useQuery({
    queryKey: ['deadlines', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('deadline_at', { ascending: true });
      if (error) throw error;
      return data as Deadline[];
    },
    enabled: !!user,
  });

  // Memoize deadlineMap to prevent re-creation on every render, ensuring O(1) lookups
  const deadlineMap = useMemo(() => new Map(deadlines.map(d => [d.id, d])), [deadlines]);
  const activeDeadlineIds = useMemo(() => deadlines.map(d => d.id), [deadlines]);

  // Optimize: Fetch only pending subtasks to avoid loading completed history
  const { data: pendingSubtasksData = [] } = useQuery({
    queryKey: ['pending-subtasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Subtask[];
    },
    enabled: !!user,
  });

  // Optimize: Fetch limited set of completed subtasks for active deadlines only
  // This avoids downloading thousands of completed tasks and N+1 filtering
  const { data: completedSubtasksResult } = useQuery({
    queryKey: ['completed-subtasks', user?.id, activeDeadlineIds],
    queryFn: async () => {
      if (!user || activeDeadlineIds.length === 0) return { data: [], count: 0 };

      const { data, error, count } = await supabase
        .from('subtasks')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('deadline_id', activeDeadlineIds)
        .order('created_at', { ascending: true }) // Oldest completed first (parity with previous behavior)
        .limit(5);

      if (error) throw error;
      return { data: data as Subtask[], count: count || 0 };
    },
    enabled: !!user && activeDeadlineIds.length > 0,
    staleTime: 1000 * 60, // Cache completed tasks briefly
  });

  const completedSubtasksList = completedSubtasksResult?.data || [];
  const completedSubtasksCount = completedSubtasksResult?.count || 0;

  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, completed }: { subtaskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from('subtasks')
        .update({ completed })
        .eq('id', subtaskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-subtasks'] });
      queryClient.invalidateQueries({ queryKey: ['completed-subtasks'] });
    },
  });

  // Filter pending subtasks to ensure they belong to active deadlines (hide orphans)
  const pendingSubtasks = useMemo(() =>
    pendingSubtasksData.filter(s => deadlineMap.has(s.deadline_id)),
    [pendingSubtasksData, deadlineMap]
  );

  // Group pending subtasks by deadline
  const groupedSubtasks = useMemo(() => {
    const grouped: Record<string, SubtaskWithDeadline[]> = {};
    pendingSubtasks.forEach(subtask => {
      const deadline = deadlineMap.get(subtask.deadline_id);
      if (deadline) {
        if (!grouped[subtask.deadline_id]) {
          grouped[subtask.deadline_id] = [];
        }
        grouped[subtask.deadline_id].push({ ...subtask, deadline });
      }
    });
    return grouped;
  }, [pendingSubtasks, deadlineMap]);

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">Mis Tareas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {pendingSubtasks.length} pendientes · {completedSubtasksCount} completadas
        </p>
      </motion.header>

      {/* Pending Tasks */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {Object.entries(groupedSubtasks).map(([deadlineId, tasks]) => {
          const deadline = deadlineMap.get(deadlineId);
          if (!deadline) return null;

          const pendingTasks = tasks; // All tasks in this group are pending by definition
          if (pendingTasks.length === 0) return null;

          return (
            <div key={deadlineId} className="space-y-2">
              <button
                onClick={() => navigate(`/deadline/${deadlineId}`)}
                className="text-sm font-medium text-primary hover:underline flex items-center gap-2"
              >
                {deadline.title}
                <span className="text-muted-foreground font-normal">
                  · {format(new Date(deadline.deadline_at), "d MMM", { locale: es })}
                </span>
              </button>
              
              {pendingTasks.map((subtask, index) => (
                <motion.div
                  key={subtask.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={(checked) => 
                      toggleSubtaskMutation.mutate({ 
                        subtaskId: subtask.id, 
                        completed: !!checked 
                      })
                    }
                  />
                  <span className="flex-1">{subtask.title}</span>
                </motion.div>
              ))}
            </div>
          );
        })}

        {pendingSubtasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">¡Todo listo!</h3>
            <p className="text-muted-foreground text-sm">
              No tienes tareas pendientes
            </p>
          </div>
        )}
      </motion.div>

      {/* Completed Section */}
      {completedSubtasksList.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Completadas ({completedSubtasksCount})
          </h2>
          <div className="space-y-2 opacity-60">
            {completedSubtasksList.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border"
              >
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={(checked) => 
                    toggleSubtaskMutation.mutate({ 
                      subtaskId: subtask.id, 
                      completed: !!checked 
                    })
                  }
                />
                <span className="flex-1 line-through text-muted-foreground">
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
