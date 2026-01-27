import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Timer, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CircularProgress } from '@/components/deadline/CircularProgress';
import { CountdownDisplay } from '@/components/deadline/CountdownDisplay';
import { useCountdown, getDeadlineStatus } from '@/hooks/useCountdown';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deadline, Subtask } from '@/types/deadline';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DeadlineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newSubtask, setNewSubtask] = useState('');

  const { data: deadline } = useQuery({
    queryKey: ['deadline', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Deadline | null;
    },
    enabled: !!id,
  });

  const { data: subtasks = [] } = useQuery({
    queryKey: ['subtasks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('deadline_id', id)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as Subtask[];
    },
    enabled: !!id,
  });

  const timeRemaining = useCountdown(
    deadline?.deadline_at || new Date().toISOString(),
    deadline?.created_at
  );

  const isCompleted = !!deadline?.completed_at;
  const status = getDeadlineStatus(timeRemaining, isCompleted);
  const completedCount = subtasks.filter(s => s.completed).length;
  const progressPercentage = subtasks.length > 0 
    ? Math.round((completedCount / subtasks.length) * 100)
    : Math.round(timeRemaining.percentage);

  const addSubtaskMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!user || !id) throw new Error('Not authenticated');
      const { error } = await supabase.from('subtasks').insert({
        deadline_id: id,
        user_id: user.id,
        title,
        order_index: subtasks.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', id] });
      setNewSubtask('');
    },
    onError: () => toast.error('Error al agregar subtarea'),
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
      queryClient.invalidateQueries({ queryKey: ['subtasks', id] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      const { error } = await supabase.from('subtasks').delete().eq('id', subtaskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', id] });
    },
  });

  const completeDeadlineMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('deadlines')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline', id] });
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast.success('¡Deadline completado! 🎉');
    },
  });

  const deleteDeadlineMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('deadlines').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast.success('Deadline eliminado');
      navigate('/');
    },
  });

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
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-destructive"
          onClick={() => deleteDeadlineMutation.mutate()}
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </motion.header>

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
      {nextSubtask && !isCompleted && (
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
                addSubtaskMutation.mutate(newSubtask.trim());
              }
            }}
            className="bg-card"
          />
          <Button
            size="icon"
            disabled={!newSubtask.trim()}
            onClick={() => addSubtaskMutation.mutate(newSubtask.trim())}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Subtasks List */}
        <div className="space-y-2">
          {subtasks.map((subtask, index) => (
            <motion.div
              key={subtask.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg bg-card border border-border",
                subtask.completed && "opacity-60"
              )}
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
                onClick={() => deleteSubtaskMutation.mutate(subtask.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>

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
            onClick={() => completeDeadlineMutation.mutate()}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Marcar como Completado
          </Button>
        </motion.div>
      )}
    </div>
  );
}
