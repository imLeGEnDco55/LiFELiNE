import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { useDeadlines } from '@/hooks/useDeadlines';
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
  const { deadlines, subtasks, toggleSubtask } = useDeadlines();

  // Only active (non-completed) deadlines
  const activeDeadlines = useMemo(
    () => deadlines.filter(d => !d.completed_at),
    [deadlines]
  );

  // Memoize deadlineMap for O(1) lookups
  const deadlineMap = useMemo(
    () => new Map(activeDeadlines.map(d => [d.id, d])),
    [activeDeadlines]
  );

  // Only subtasks belonging to active deadlines
  const relevantSubtasks = useMemo(
    () => subtasks.filter(s => deadlineMap.has(s.deadline_id)),
    [subtasks, deadlineMap]
  );

  // Group subtasks by deadline
  const groupedSubtasks = useMemo(() => {
    const grouped: Record<string, SubtaskWithDeadline[]> = {};
    relevantSubtasks.forEach(subtask => {
      const deadline = deadlineMap.get(subtask.deadline_id);
      if (deadline) {
        if (!grouped[subtask.deadline_id]) {
          grouped[subtask.deadline_id] = [];
        }
        grouped[subtask.deadline_id].push({ ...subtask, deadline });
      }
    });
    return grouped;
  }, [relevantSubtasks, deadlineMap]);

  const pendingSubtasks = useMemo(
    () => relevantSubtasks.filter(s => !s.completed),
    [relevantSubtasks]
  );
  const completedSubtasks = useMemo(
    () => relevantSubtasks.filter(s => s.completed),
    [relevantSubtasks]
  );

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
          {pendingSubtasks.length} pendientes · {completedSubtasks.length} completadas
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

          const pendingTasks = tasks.filter(t => !t.completed);
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
                    onCheckedChange={() => toggleSubtask(subtask.id)}
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
      {completedSubtasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Completadas ({completedSubtasks.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {completedSubtasks.slice(0, 5).map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border"
              >
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => toggleSubtask(subtask.id)}
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
