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

  const { data: subtasks = [] } = useQuery({
    queryKey: ['all-subtasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Optimization: Filter out subtasks from completed deadlines at the DB level
      // This reduces payload size by excluding historical data that isn't displayed
      const { data, error } = await supabase
        .from('subtasks')
        .select('*, deadline:deadlines!inner(id)')
        .eq('user_id', user.id)
        .is('deadline.completed_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Strip the joined deadline object to match Subtask type
      return data.map(({ deadline, ...rest }) => rest) as Subtask[];
    },
    enabled: !!user,
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, completed }: { subtaskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from('subtasks')
        .update({ completed })
        .eq('id', subtaskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-subtasks'] });
      queryClient.invalidateQueries({ queryKey: ['subtasks'] });
    },
  });

  // Group subtasks by deadline
  // Memoize deadlineMap to prevent re-creation on every render, ensuring O(1) lookups
  const deadlineMap = useMemo(() => new Map(deadlines.map(d => [d.id, d])), [deadlines]);

  // Memoize derived state (grouping and filtering) in a single pass to avoid O(3N) and reduce render-time filtering
  const { groupedPending, pendingCount, completedList } = useMemo(() => {
    const grouped: Record<string, SubtaskWithDeadline[]> = {};
    let pendingCount = 0;
    const completedList: SubtaskWithDeadline[] = [];

    subtasks.forEach(subtask => {
      const deadline = deadlineMap.get(subtask.deadline_id);
      if (deadline) {
        const enrichedSubtask = { ...subtask, deadline };
        if (subtask.completed) {
          completedList.push(enrichedSubtask);
        } else {
          pendingCount++;
          if (!grouped[subtask.deadline_id]) {
            grouped[subtask.deadline_id] = [];
          }
          grouped[subtask.deadline_id].push(enrichedSubtask);
        }
      }
    });

    return { groupedPending: grouped, pendingCount, completedList };
  }, [subtasks, deadlineMap]);

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
          {pendingCount} pendientes · {completedList.length} completadas
        </p>
      </motion.header>

      {/* Pending Tasks */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {Object.entries(groupedPending).map(([deadlineId, tasks]) => {
          const deadline = deadlineMap.get(deadlineId);
          if (!deadline) return null;

          if (tasks.length === 0) return null;

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
              
              {tasks.map((subtask, index) => (
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

        {pendingCount === 0 && (
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
      {completedList.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Completadas ({completedList.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {completedList.slice(0, 5).map((subtask) => (
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
