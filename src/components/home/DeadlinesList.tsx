import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeadlineCard } from '@/components/deadline/DeadlineCard';
import { Deadline, Subtask, Category } from '@/types/deadline';

interface DeadlinesListProps {
  deadlines: Deadline[];
  allDeadlines: Deadline[]; // To calculate children count
  subtasksMap: Record<string, Subtask[]>;
  categories: Category[];
  hasFilters: boolean;
  onDeadlineClick: (id: string) => void;
  onCreateClick: () => void;
}

export function DeadlinesList({
  deadlines,
  allDeadlines,
  subtasksMap,
  categories,
  hasFilters,
  onDeadlineClick,
  onCreateClick,
}: DeadlinesListProps) {
  // O(1) lookup map - built once when categories change
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  // Pre-calculate children counts to avoid O(N*M) complexity
  const childrenCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allDeadlines.forEach((d) => {
      if (d.parent_id) {
        counts[d.parent_id] = (counts[d.parent_id] || 0) + 1;
      }
    });
    return counts;
  }, [allDeadlines]);

  if (deadlines.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <Filter className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">
          {hasFilters ? 'Sin resultados' : 'Sin deadlines'}
        </h3>
        <p className="text-muted-foreground text-sm">
          {hasFilters
            ? 'No hay deadlines en esta categoría'
            : 'Crea tu primer deadline para empezar'}
        </p>
        {!hasFilters && (
          <Button className="mt-4 gradient-primary" onClick={onCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Deadline
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deadlines.map((deadline, index) => (
        <motion.div
          key={deadline.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
        >
          <DeadlineCard
            deadline={deadline}
            subtasks={subtasksMap[deadline.id]}
            category={deadline.category_id ? categoryMap.get(deadline.category_id) : undefined}
            childrenCount={childrenCounts[deadline.id] || 0}
            onClick={() => onDeadlineClick(deadline.id)}
          />
        </motion.div>
      ))}
    </div>
  );
}
