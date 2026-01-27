import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeadlineCard } from '@/components/deadline/DeadlineCard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deadline, Subtask } from '@/types/deadline';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'urgent' | 'week' | 'later';

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'later', label: 'Más Tarde' },
];

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: deadlines = [], isLoading } = useQuery({
    queryKey: ['deadlines', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline_at', { ascending: true });
      if (error) throw error;
      return data as Deadline[];
    },
    enabled: !!user,
  });

  const { data: subtasksMap = {} } = useQuery({
    queryKey: ['subtasks', user?.id],
    queryFn: async () => {
      if (!user) return {};
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      
      const map: Record<string, Subtask[]> = {};
      (data as Subtask[]).forEach(subtask => {
        if (!map[subtask.deadline_id]) map[subtask.deadline_id] = [];
        map[subtask.deadline_id].push(subtask);
      });
      return map;
    },
    enabled: !!user,
  });

  const filteredDeadlines = deadlines.filter(deadline => {
    if (deadline.completed_at) return filter === 'all';
    
    const now = new Date();
    const deadlineDate = new Date(deadline.deadline_at);
    const hoursUntil = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const daysUntil = hoursUntil / 24;

    switch (filter) {
      case 'urgent':
        return hoursUntil < 24;
      case 'week':
        return daysUntil <= 7 && daysUntil > 1;
      case 'later':
        return daysUntil > 7;
      default:
        return true;
    }
  });

  const today = new Date();
  const greeting = getGreeting();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm text-muted-foreground">
          {format(today, "EEEE, d 'de' MMMM", { locale: es })}
        </p>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, <span className="text-gradient-primary">{displayName}</span>
          </h1>
          <Button
            size="icon"
            className="gradient-primary glow-primary rounded-full"
            onClick={() => navigate('/create')}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2"
      >
        {filterOptions.map(({ value, label }) => (
          <Button
            key={value}
            variant={filter === value ? "default" : "secondary"}
            size="sm"
            className={cn(
              "rounded-full shrink-0",
              filter === value && "gradient-primary"
            )}
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </motion.div>

      {/* Deadlines List */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredDeadlines.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {filter === 'all' ? 'Sin deadlines' : 'Sin resultados'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {filter === 'all' 
                ? 'Crea tu primer deadline para empezar'
                : 'No hay deadlines en esta categoría'}
            </p>
            {filter === 'all' && (
              <Button 
                className="mt-4 gradient-primary"
                onClick={() => navigate('/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Deadline
              </Button>
            )}
          </div>
        ) : (
          filteredDeadlines.map((deadline, index) => (
            <motion.div
              key={deadline.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <DeadlineCard
                deadline={deadline}
                subtasks={subtasksMap[deadline.id]}
                onClick={() => navigate(`/deadline/${deadline.id}`)}
              />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}
