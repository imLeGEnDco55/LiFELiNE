import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, ListTodo, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResuscitationEffect } from '@/components/vitality/ResuscitationEffect';
import { HomeFilters, FilterType } from '@/components/home/HomeFilters';
import { DeadlinesList } from '@/components/home/DeadlinesList';
import { SubtasksList } from '@/components/home/SubtasksList';
import { useAuth } from '@/providers/AuthProvider';
import { useDeadlines } from '@/hooks/useDeadlines';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deadlines, subtasksMap, categories, toggleSubtask } = useDeadlines();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'deadlines' | 'subtasks'>('deadlines');

  // Filter logic for deadlines
  // Optimization: Memoize filtering to prevent O(N) iteration and date calculations on every render.
  // This is critical as the number of deadlines grows.
  const filteredDeadlines = useMemo(() => deadlines.filter((deadline) => {
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
  }), [deadlines, selectedCategory, filter]);

  // Filter subtasks based on parent deadline filters
  // Optimization: Memoize map construction to prevent O(M) operations on every render.
  const filteredSubtasksMap = useMemo(() => {
    const map: Record<string, typeof subtasksMap[string]> = {};
    filteredDeadlines.forEach((deadline) => {
      if (subtasksMap[deadline.id]) {
        map[deadline.id] = subtasksMap[deadline.id];
      }
    });
    return map;
  }, [filteredDeadlines, subtasksMap]);

  const today = new Date();
  const greeting = getGreeting();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuario';

  const hasFilters = filter !== 'all' || selectedCategory !== null;

  return (
    <div className="px-4 py-6 pb-24">
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

      {/* Compact Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <HomeFilters
          filter={filter}
          setFilter={setFilter}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
      </motion.div>

      {/* Dual Tab System */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'deadlines' | 'subtasks')}>
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="deadlines" className="gap-2">
              <Target className="w-4 h-4" />
              Deadlines
            </TabsTrigger>
            <TabsTrigger value="subtasks" className="gap-2">
              <ListTodo className="w-4 h-4" />
              Subtareas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deadlines" className="mt-0">
            <DeadlinesList
              deadlines={filteredDeadlines}
              allDeadlines={deadlines}
              subtasksMap={subtasksMap}
              categories={categories}
              hasFilters={hasFilters}
              onDeadlineClick={(id) => navigate(`/deadline/${id}`)}
              onCreateClick={() => navigate('/create')}
            />
          </TabsContent>

          <TabsContent value="subtasks" className="mt-0">
            <SubtasksList
              deadlines={filteredDeadlines}
              subtasksMap={filteredSubtasksMap}
              categories={categories}
              onToggleSubtask={toggleSubtask}
              onDeadlineClick={(id) => navigate(`/deadline/${id}`)}
            />
          </TabsContent>
        </Tabs>
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
