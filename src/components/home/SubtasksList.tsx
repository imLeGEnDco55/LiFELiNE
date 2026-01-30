import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import { Deadline, Subtask, Category } from '@/types/deadline';
import { cn } from '@/lib/utils';

interface SubtasksListProps {
  deadlines: Deadline[];
  subtasksMap: Record<string, Subtask[]>;
  categories: Category[];
  onToggleSubtask: (id: string) => void;
  onDeadlineClick: (id: string) => void;
}

export function SubtasksList({
  deadlines,
  subtasksMap,
  categories,
  onToggleSubtask,
  onDeadlineClick,
}: SubtasksListProps) {
  // Filter deadlines that have subtasks
  const deadlinesWithSubtasks = deadlines.filter(
    (d) => subtasksMap[d.id]?.length > 0
  );

  if (deadlinesWithSubtasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Sin subtareas</h3>
        <p className="text-muted-foreground text-sm">
          Las subtareas de tus deadlines aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deadlinesWithSubtasks.map((deadline, index) => {
        const subtasks = subtasksMap[deadline.id] || [];
        const category = categories.find((c) => c.id === deadline.category_id);
        const completedCount = subtasks.filter((s) => s.completed).length;

        return (
          <motion.div
            key={deadline.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className="rounded-xl bg-card border border-border overflow-hidden"
          >
            {/* Deadline Header */}
            <button
              onClick={() => onDeadlineClick(deadline.id)}
              className="w-full px-4 py-3 flex items-center justify-between bg-secondary/50 hover:bg-secondary/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                {category && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <span className="font-medium text-sm truncate max-w-[200px]">
                  {deadline.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {completedCount}/{subtasks.length}
                </span>
                <Clock className="w-3 h-3" />
                <span>{format(new Date(deadline.deadline_at), 'dd MMM', { locale: es })}</span>
              </div>
            </button>

            {/* Subtasks List */}
            <div className="divide-y divide-border">
              {subtasks
                .sort((a, b) => a.order_index - b.order_index)
                .map((subtask) => {
                  const isOverdue = subtask.due_at && new Date(subtask.due_at) < new Date() && !subtask.completed;
                  const isUrgent = subtask.due_at && !subtask.completed && 
                    (new Date(subtask.due_at).getTime() - new Date().getTime()) / (1000 * 60 * 60) < 24;

                  return (
                    <div
                      key={subtask.id}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-accent/30 transition-colors"
                    >
                      <button
                        onClick={() => onToggleSubtask(subtask.id)}
                        className="shrink-0"
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className={cn(
                            "w-5 h-5",
                            isOverdue ? "text-destructive" : isUrgent ? "text-warning" : "text-muted-foreground"
                          )} />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm truncate",
                          subtask.completed && "line-through text-muted-foreground"
                        )}>
                          {subtask.title}
                        </p>
                      </div>

                      {subtask.due_at && (
                        <div className={cn(
                          "flex items-center gap-1 text-xs shrink-0",
                          isOverdue ? "text-destructive" : isUrgent ? "text-warning" : "text-muted-foreground"
                        )}>
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                          <span>{format(new Date(subtask.due_at), 'dd/MM')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
