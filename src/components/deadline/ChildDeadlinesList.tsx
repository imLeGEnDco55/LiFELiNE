import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronRight, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Deadline, Category } from '@/types/deadline';
import { cn } from '@/lib/utils';

interface ChildDeadlinesListProps {
  children: Deadline[];
  categories: Category[];
  parentDeadlineAt: string;
}

export function ChildDeadlinesList({ children, categories, parentDeadlineAt }: ChildDeadlinesListProps) {
  const navigate = useNavigate();

  if (children.length === 0) return null;

  const completedCount = children.filter(c => c.completed_at).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground">
          Deadlines Anidados
        </h3>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{children.length} completados
        </span>
      </div>

      <div className="space-y-2">
        {children
          .sort((a, b) => new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime())
          .map((child, index) => {
            const isCompleted = !!child.completed_at;
            const isOverdue = isBefore(parseISO(child.deadline_at), new Date()) && !isCompleted;
            const category = categories.find(c => c.id === child.category_id);
            const hoursUntil = (new Date(child.deadline_at).getTime() - new Date().getTime()) / (1000 * 60 * 60);
            const isUrgent = !isCompleted && hoursUntil > 0 && hoursUntil < 24;

            return (
              <motion.button
                key={child.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/deadline/${child.id}`)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                  "hover:bg-accent/50",
                  isCompleted && "bg-success/5 border-success/30",
                  isOverdue && "bg-destructive/5 border-destructive/30",
                  isUrgent && !isOverdue && "bg-warning/5 border-warning/30",
                  !isCompleted && !isOverdue && !isUrgent && "bg-card border-border"
                )}
              >
                {/* Status Icon */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : isOverdue ? (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Clock className={cn(
                      "w-5 h-5",
                      isUrgent ? "text-warning" : "text-muted-foreground"
                    )} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-left min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isCompleted && "line-through text-muted-foreground"
                  )}>
                    {child.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {category && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <span className={cn(
                      "text-xs",
                      isOverdue ? "text-destructive" : isUrgent ? "text-warning" : "text-muted-foreground"
                    )}>
                      {format(parseISO(child.deadline_at), "d MMM, HH:mm", { locale: es })}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.button>
            );
          })}
      </div>
    </motion.div>
  );
}
