import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Filter, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeadlineCard } from '@/components/deadline/DeadlineCard';
import { FocusBubble } from '@/components/focus/FocusBubble';
import { HeartbeatMonitor } from '@/components/vitality/HeartbeatMonitor';
import { ResuscitationEffect } from '@/components/vitality/ResuscitationEffect';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useDeadlines } from '@/hooks/useDeadlines';
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
  const { user } = useLocalAuth();
  const { deadlines, subtasksMap, categories } = useDeadlines();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  

  const filteredDeadlines = deadlines.filter(deadline => {
    // Category filter
    if (selectedCategory && deadline.category_id !== selectedCategory) return false;
    
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
    <div className="px-4 py-6 pb-24">
      {/* Resuscitation Effect */}
      <ResuscitationEffect />

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
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

      {/* LiFELiNE Monitor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-5"
      >
        <HeartbeatMonitor />
      </motion.div>


      {/* Category Pills */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2"
      >
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          className={cn(
            "rounded-full shrink-0 gap-1.5",
            selectedCategory === null && "gradient-primary"
          )}
          onClick={() => setSelectedCategory(null)}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Todas
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            className="rounded-full shrink-0 gap-1.5"
            style={{
              backgroundColor: selectedCategory === category.id ? category.color : undefined,
              borderColor: category.color,
              color: selectedCategory === category.id ? 'white' : category.color,
            }}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: selectedCategory === category.id ? 'white' : category.color }}
            />
            {category.name}
          </Button>
        ))}
      </motion.div>

      {/* Time Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
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
        {filteredDeadlines.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {filter === 'all' && !selectedCategory ? 'Sin deadlines' : 'Sin resultados'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {filter === 'all' && !selectedCategory
                ? 'Crea tu primer deadline para empezar'
                : 'No hay deadlines en esta categoría'}
            </p>
            {filter === 'all' && !selectedCategory && (
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
                category={categories.find(c => c.id === deadline.category_id)}
                onClick={() => navigate(`/deadline/${deadline.id}`)}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Focus Bubble */}
      <FocusBubble />
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}
