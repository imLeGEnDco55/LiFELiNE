import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Timer, CheckCircle2, Skull, ChevronUp, Lock, Pencil } from 'lucide-react';
import { parseISO, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AutopsyModal } from '@/components/vitality/AutopsyModal';
import { SubtaskItem } from '@/components/deadline/SubtaskItem';
import { ChildDeadlinesList } from '@/components/deadline/ChildDeadlinesList';
import { EditDeadlineModal } from '@/components/deadline/EditDeadlineModal';
import { DeadlineHero } from '@/components/deadline/DeadlineHero';
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
    updateDeadline,
    categories,
    getChildDeadlines,
    getParentDeadline,
    canCompleteDeadline,
    convertSubtaskToDeadline,
  } = useDeadlines();
  const { completeFeedback, tickFeedback } = useFeedback();
  const [newSubtask, setNewSubtask] = useState('');
  const [autopsyOpen, setAutopsyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Get source subtasks
  const sourceSubtasks = id ? getSubtasksForDeadline(id).sort((a, b) => a.order_index - b.order_index) : [];

  // Local state for drag operations (optimistic UI)
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>(sourceSubtasks);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state when source changes (but not during drag)
  useEffect(() => {
    setLocalSubtasks(sourceSubtasks);
  }, [JSON.stringify(sourceSubtasks.map(s => s.id + s.order_index))]);

  // Debounced reorder - only persist after drag stops
  const handleReorder = useCallback((newOrder: Subtask[]) => {
    // Update local state immediately (smooth drag)
    setLocalSubtasks(newOrder);

    // Debounce DB persistence
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (id) {
        reorderSubtasks(id, newOrder.map(s => s.id));
      }
    }, 300);
  }, [id, reorderSubtasks]);

  const deadline = deadlines.find(d => d.id === id);
  const subtasks = localSubtasks; // Use local state for rendering
  const childDeadlines = id ? getChildDeadlines(id) : [];
  const parentDeadline = id ? getParentDeadline(id) : null;
  const canComplete = id ? canCompleteDeadline(id) : true;

  const category = deadline?.category_id
    ? categories.find(c => c.id === deadline.category_id)
    : undefined;

  // Use a low-frequency timer for overdue checks (every 60s) instead of 1s
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isCompleted = !!deadline?.completed_at;
  // Use `now` state instead of `new Date()` directly in render to ensure consistency
  // and control re-renders if we were memoizing this component.
  // In this case, `now` updates every 60s, triggering a re-render to update `isOverdue`.
  const isOverdue = deadline ? isBefore(parseISO(deadline.deadline_at), now) && !isCompleted : false;

  const handleAddSubtask = (title: string) => {
    if (!id) return;
    createSubtask({
      deadline_id: id,
      title,
      completed: false,
      order_index: subtasks.length,
    });
    setNewSubtask('');
  };

  const handleCompleteDeadline = async () => {
    if (!id) return;

    if (!canComplete) {
      toast.error('Completa todos los deadlines anidados primero');
      return;
    }

    const result = await completeDeadlineFn(id);
    if (result.success) {
      completeFeedback();
      toast.success('¡Deadline completado! 🎉');
    } else {
      toast.error('Completa todos los deadlines anidados primero');
    }
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

  const handleConvertSubtask = (subtaskId: string) => {
    const newDeadline = convertSubtaskToDeadline(subtaskId);
    if (newDeadline) {
      toast.success('¡Subtarea convertida a deadline!');
    }
  };

  if (!deadline) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const nextSubtask = subtasks.find(s => !s.completed);

  return (
    <div className="px-4 py-6 min-h-screen pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Volver atrás">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Volver atrás</p>
          </TooltipContent>
        </Tooltip>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditOpen(true)}
                aria-label="Editar deadline"
              >
                <Pencil className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar deadline</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={handleDeleteDeadline}
                aria-label="Eliminar deadline"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar deadline</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.header>

      {/* Parent Deadline Link */}
      {parentDeadline && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(`/deadline/${parentDeadline.id}`)}
          className="w-full mb-4 p-3 rounded-lg bg-secondary/50 border border-border flex items-center gap-2 text-sm hover:bg-secondary transition-colors"
        >
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Parte de:</span>
          <span className="font-medium truncate">{parentDeadline.title}</span>
        </motion.button>
      )}

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

      {/* Main Hero Section (Timer, Title, Stats) */}
      <DeadlineHero
        deadline={deadline}
        subtasks={subtasks}
        childDeadlines={childDeadlines}
        category={category}
      />

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

      {/* Child Deadlines */}
      {childDeadlines.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <ChildDeadlinesList
            children={childDeadlines}
            categories={categories}
            parentDeadlineAt={deadline.deadline_at}
          />
        </motion.div>
      )}

      {/* Subtasks Roadmap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Subtareas</h2>
          <p className="text-xs text-muted-foreground">
            Mantén presionado para convertir a deadline
          </p>
        </div>

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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                disabled={!newSubtask.trim()}
                onClick={() => handleAddSubtask(newSubtask.trim())}
                aria-label="Agregar subtarea"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Agregar subtarea</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Subtasks List with Drag & Drop */}
        <Reorder.Group
          axis="y"
          values={subtasks}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onToggle={() => handleToggleSubtask(subtask.id)}
              onDelete={() => deleteSubtask(subtask.id)}
              onConvertToDeadline={() => handleConvertSubtask(subtask.id)}
            />
          ))}
        </Reorder.Group>

        {subtasks.length === 0 && childDeadlines.length === 0 && (
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
            className={cn(
              "w-full h-12",
              canComplete
                ? "border-success text-success hover:bg-success/10"
                : "border-muted text-muted-foreground cursor-not-allowed"
            )}
            onClick={handleCompleteDeadline}
            disabled={!canComplete}
          >
            {canComplete ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Marcar como Completado
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Completa los deadlines anidados primero
              </>
            )}
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

      {/* Edit Modal */}
      <EditDeadlineModal
        deadline={deadline}
        parentDeadline={parentDeadline}
        categories={categories}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(updates) => updateDeadline(id!, updates)}
      />
    </div>
  );
}
