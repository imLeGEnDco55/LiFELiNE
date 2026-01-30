import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Deadline, Subtask, Category } from '@/types/deadline';
import { useCountdown, getDeadlineStatus } from '@/hooks/useCountdown';
import { CountdownDisplay } from './CountdownDisplay';
import { Progress } from '@/components/ui/progress';

interface DeadlineCardProps {
  deadline: Deadline;
  subtasks?: Subtask[];
  category?: Category;
  childrenCount?: number;
  onClick?: () => void;
}

const priorityColors = {
  low: 'border-l-success',
  medium: 'border-l-warning',
  high: 'border-l-urgent',
};

const statusLabels = {
  immediate: { text: 'INMEDIATO', className: 'bg-urgent/20 text-urgent' },
  warning: { text: 'ADVERTENCIA', className: 'bg-warning/20 text-warning' },
  on_track: { text: 'EN CURSO', className: 'bg-info/20 text-info' },
  completed: { text: 'COMPLETADO', className: 'bg-success/20 text-success' },
  overdue: { text: 'VENCIDO', className: 'bg-urgent/20 text-urgent' },
};

export function DeadlineCard({ deadline, subtasks = [], category, childrenCount = 0, onClick }: DeadlineCardProps) {
  const timeRemaining = useCountdown(deadline.deadline_at, deadline.created_at);
  const isCompleted = !!deadline.completed_at;
  const status = getDeadlineStatus(timeRemaining, isCompleted);
  const statusInfo = statusLabels[status];

  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const totalSubtasks = subtasks.length;
  const progressPercentage = totalSubtasks > 0 
    ? Math.round((completedSubtasks / totalSubtasks) * 100) 
    : Math.round(timeRemaining.percentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative bg-card rounded-xl border-l-4 p-4 cursor-pointer",
        "transition-all duration-200 hover:bg-accent/50",
        priorityColors[deadline.priority],
        isCompleted && "opacity-60"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-semibold text-foreground truncate",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {deadline.title}
            </h3>
            {category && (
              <span 
                className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium"
                style={{ 
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                }}
              >
                {category.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
              statusInfo.className
            )}>
              {statusInfo.text}
            </span>
            {/* Children indicator */}
            {childrenCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground">
                <GitBranch className="w-3 h-3" />
                {childrenCount} anidado{childrenCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </div>

      {/* Countdown */}
      {!isCompleted && (
        <div className="mb-3">
          <CountdownDisplay timeRemaining={timeRemaining} size="sm" />
        </div>
      )}

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {totalSubtasks > 0 
              ? `${completedSubtasks}/${totalSubtasks} subtareas`
              : 'Progreso de tiempo'}
          </span>
          <span className={cn(
            "font-semibold",
            status === 'immediate' || status === 'overdue' ? 'text-urgent' :
            status === 'warning' ? 'text-warning' : 'text-primary'
          )}>
            {progressPercentage}%
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-1.5"
        />
      </div>
    </motion.div>
  );
}
