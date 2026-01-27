import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle2, Target } from 'lucide-react';
import { useDeadlines } from '@/hooks/useDeadlines';
import { cn } from '@/lib/utils';

export function WeeklyStats() {
  const { weeklyStats, categories } = useDeadlines();
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const getCategoryName = (id: string) => {
    if (id === 'uncategorized') return 'Sin categoría';
    return categories.find(c => c.id === id)?.name || id;
  };

  const getCategoryColor = (id: string) => {
    if (id === 'uncategorized') return 'hsl(var(--muted-foreground))';
    return categories.find(c => c.id === id)?.color || 'hsl(var(--primary))';
  };

  const categoryEntries = Object.entries(weeklyStats.completedByCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Estadísticas Semanales
      </h2>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={CheckCircle2}
          label="Completados"
          value={weeklyStats.completedTotal.toString()}
          color="text-success"
          bgColor="bg-success/10"
        />
        <StatCard
          icon={Clock}
          label="Tiempo Focus"
          value={formatTime(weeklyStats.totalFocusMinutes)}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon={Target}
          label="Sesiones Focus"
          value={weeklyStats.focusSessionsCount.toString()}
          color="text-info"
          bgColor="bg-info/10"
        />
        <StatCard
          icon={Target}
          label="Hoy"
          value={`${weeklyStats.todaySessionsCount} sesiones`}
          color="text-warning"
          bgColor="bg-warning/10"
        />
      </div>

      {/* Completed by Category */}
      {categoryEntries.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Completados por categoría
          </h3>
          <div className="space-y-2">
            {categoryEntries.map(([catId, count]) => (
              <div key={catId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(catId) }}
                  />
                  <span className="text-sm">{getCategoryName(catId)}</span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {weeklyStats.completedTotal === 0 && weeklyStats.focusSessionsCount === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">Aún no tienes actividad esta semana</p>
          <p className="text-xs mt-1">¡Comienza completando un deadline!</p>
        </div>
      )}
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className={cn("rounded-xl p-4 border border-border", bgColor)}>
      <Icon className={cn("w-5 h-5 mb-2", color)} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
