import { motion } from 'framer-motion';
import { WeeklyStats } from '@/components/stats/WeeklyStats';
import { DailyActivityChart } from '@/components/stats/DailyActivityChart';

export function StatsPage() {
  return (
    <div className="px-4 py-6 pb-24">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tu progreso semanal
        </p>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Weekly Stats */}
        <WeeklyStats />

        {/* Daily Activity Chart */}
        <div className="bg-card rounded-xl border border-border p-4">
          <DailyActivityChart />
        </div>
      </motion.div>
    </div>
  );
}
