import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { CircularProgress } from '@/components/deadline/CircularProgress';
import { CountdownDisplay } from '@/components/deadline/CountdownDisplay';
import { useCountdown, getDeadlineStatus } from '@/hooks/useCountdown';
import { Deadline, Subtask, Category } from '@/types/deadline';

interface DeadlineHeroProps {
  deadline: Deadline;
  subtasks: Subtask[];
  childDeadlines: Deadline[];
  category?: Category;
}

export function DeadlineHero({
  deadline,
  subtasks,
  childDeadlines,
  category
}: DeadlineHeroProps) {
  const timeRemaining = useCountdown(
    deadline.deadline_at,
    deadline.created_at
  );

  const isCompleted = !!deadline.completed_at;
  const status = getDeadlineStatus(timeRemaining, isCompleted);

  const completedCount = subtasks.filter(s => s.completed).length;
  const completedChildrenCount = childDeadlines.filter(c => c.completed_at).length;
  const totalProgress = subtasks.length + childDeadlines.length;
  const completedProgress = completedCount + completedChildrenCount;

  const progressPercentage = totalProgress > 0
    ? Math.round((completedProgress / totalProgress) * 100)
    : Math.round(timeRemaining.percentage);

  const variant = status === 'immediate' || status === 'overdue' ? 'urgent'
    : status === 'warning' ? 'warning'
      : status === 'completed' ? 'success'
        : 'primary';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center mb-8"
    >
      <CircularProgress
        percentage={progressPercentage}
        size={200}
        strokeWidth={14}
        variant={variant}
      >
        <div className="text-center">
          <CountdownDisplay
            timeRemaining={timeRemaining}
            size="sm"
            showSeconds={timeRemaining.days === 0}
          />
        </div>
      </CircularProgress>

      <h1 className="text-2xl font-bold mt-4 text-center">{deadline.title}</h1>

      {category && (
        <span
          className="mt-2 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${category.color}20`,
            color: category.color,
          }}
        >
          {category.name}
        </span>
      )}

      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarIcon className="w-4 h-4" />
          {format(new Date(deadline.deadline_at), "d MMM", { locale: es })}
        </span>
        <span>{format(new Date(deadline.deadline_at), "HH:mm")}</span>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{progressPercentage}%</p>
          <p className="text-xs text-muted-foreground">Progreso</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{completedCount}/{subtasks.length}</p>
          <p className="text-xs text-muted-foreground">Subtareas</p>
        </div>
        {childDeadlines.length > 0 && (
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{completedChildrenCount}/{childDeadlines.length}</p>
            <p className="text-xs text-muted-foreground">Anidados</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
