import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Timer, Calendar as CalendarIcon, CheckCircle2, GripVertical, Skull } from 'lucide-react';
import { format, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CircularProgress } from '@/components/deadline/CircularProgress';
import { CountdownDisplay } from '@/components/deadline/CountdownDisplay';
import { AutopsyModal } from '@/components/vitality/AutopsyModal';
import { useCountdown, getDeadlineStatus } from '@/hooks/useCountdown';
import { useDeadlines } from '@/hooks/useDeadlines';
import { useFeedback } from '@/hooks/useFeedback';
import { Subtask } from '@/types/deadline';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DeadlineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    deadlines, 
    getSubtasksForDeadline, 
    createSubtask, 
    toggleSubtask, 
    deleteSubtask,
    reorderSubtasks,
    completeDeadline: completeDeadlineFn,
    deleteDeadline: deleteDeadlineFn,
    categories 
  } = useDeadlines();
  const { completeFeedback, tickFeedback } = useFeedback();
  const [newSubtask, setNewSubtask] = useState('');
  const [autopsyOpen, setAutopsyOpen] = useState(false);

  const deadline = deadlines.find(d => d.id === id);
  const subtasks = id ? getSubtasksForDeadline(id).sort((a, b) => a.order_index - b.order_index) : [];
  const category = deadline?.category_id 
    ? categories.find(c => c.id === deadline.category_id) 
    : undefined;

  const timeRemaining = useCountdown(
    deadline?.deadline_at || new Date().toISOString(),
    deadline?.created_at
  );

  const isCompleted = !!deadline?.completed_at;
  const isOverdue = deadline ? isBefore(parseISO(deadline.deadline_at), new Date()) && !isCompleted : false;
  const status = getDeadlineStatus(timeRemaining, isCompleted);
  const completedCount = subtasks.filter(s => s.completed).length;
  const progressPercentage = subtasks.length > 0 
    ? Math.round((completedCount / subtasks.length) * 100)
    : Math.round(timeRemaining.percentage);

  const handleAddSubtask = (title: string) => {
    if (!id) return;
    createSubtask({
      deadline_id: id,
      title,
      completed: false,
      due_at: null,
      order_index: subtasks.length,
    });
    setNewSubtask('');
  };

  const handleCompleteDeadline = () => {
    if (!id) return;
    completeDeadlineFn(id);
    completeFeedback();
    toast.success('¡Deadline completado! 🎉');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    toggleSubtask(subtaskId);
    tickFeedback();
  };

  const handleDeleteDeadline = () => {
    if (!id) return;
    deleteDeadlineFn(id);
    toast.success('Deadline eliminado');
    navigate('/');
  };

  const variant = status === 'immediate' || status === 'overdue' ? 'urgent' 
    : status === 'warning' ? 'warning'
    : status === 'completed' ? 'success' 
    : 'primary';

  if (!deadline) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const nextSubtask = subtasks.find(s => !s.completed);

  return (
    <div className="px-4 py-6 min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          {isOverdue && (
            <Button 
              variant="outline" 
              size="sm"
              className="border-urgent text-urgent hover:bg-urgent/10"
              onClick={() => setAutopsyOpen(true)}
            >
              <Skull className="w-4 h-4 mr-1.5" />
              Ver Autopsia
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive"
            onClick={handleDeleteDeadline}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>

      {/* Overdue Banner */}
      {isOverdue && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-urgent/10 border border-urgent/30"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Skull className="w-6 h-6 text-urgent" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-urgent">Deadline Vencido</h3>
              <p className="text-xs text-muted-foreground">
                Revisa el reporte de autopsia para analizar qué salió mal
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Progress Circle */}
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
            <p className="text-xs text-muted-foreground">Transcurrido</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{completedCount}/{subtasks.length}</p>
            <p className="text-xs text-muted-foreground">Subtareas</p>
          </div>
        </div>
      </motion.div>

      {/* Next Subtask Highlight */}
      {nextSubtask && !isCompleted && !isOverdue && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button 
            className="w-full h-14 gradient-primary glow-primary justify-between"
            onClick={() => navigate(`/focus?deadline=${id}`)}
          >
            <span className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Siguiente: {nextSubtask.title}
            </span>
            <span className="text-xs opacity-80">Iniciar Focus</span>
          </Button>
        </motion.div>
      )}

      {/* Subtasks Roadmap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="font-semibold text-lg">Roadmap de Subtareas</h2>

        {/* Add Subtask */}
        <div className="flex gap-2">
          <Input
            placeholder="Agregar subtarea..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newSubtask.trim()) {
                handleAddSubtask(newSubtask.trim());
              }
            }}
            className="bg-card"
          />
          <Button
            size="icon"
            disabled={!newSubtask.trim()}
            onClick={() => handleAddSubtask(newSubtask.trim())}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Subtasks List with Drag & Drop */}
        <Reorder.Group 
          axis="y" 
          values={subtasks} 
          onReorder={(newOrder: Subtask[]) => {
            if (id) {
              reorderSubtasks(id, newOrder.map(s => s.id));
            }
          }}
          className="space-y-2"
        >
          {subtasks.map((subtask) => (
            <Reorder.Item
              key={subtask.id}
              value={subtask}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg bg-card border border-border cursor-grab active:cursor-grabbing",
                subtask.completed && "opacity-60"
              )}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => handleToggleSubtask(subtask.id)}
              />
              <span className={cn(
                "flex-1",
                subtask.completed && "line-through text-muted-foreground"
              )}>
                {subtask.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => deleteSubtask(subtask.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {subtasks.length === 0 && (
          <p className="text-center text-muted-foreground py-6">
            Agrega subtareas para dividir tu deadline
          </p>
        )}
      </motion.div>

      {/* Complete Button */}
      {!isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Button
            variant="outline"
            className="w-full h-12 border-success text-success hover:bg-success/10"
            onClick={handleCompleteDeadline}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Marcar como Completado
          </Button>
        </motion.div>
      )}

      {/* Autopsy Modal */}
      <AutopsyModal
        deadline={deadline}
        subtasks={subtasks}
        open={autopsyOpen}
        onOpenChange={setAutopsyOpen}
      />
    </div>
  );
}
