import { motion } from 'framer-motion';
import { Flame, Trophy, Zap } from 'lucide-react';
import { useDeadlines } from '@/hooks/useDeadlines';
import { cn } from '@/lib/utils';

export function StreakDisplay() {
  const { streakStats } = useDeadlines();
  const { currentStreak, longestStreak, todayActive } = streakStats;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-orange-500/20 via-red-500/10 to-yellow-500/20 rounded-xl border border-orange-500/30 p-4"
    >
      <div className="flex items-center justify-between">
        {/* Current Streak */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={todayActive ? { 
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "easeInOut"
            }}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              todayActive 
                ? "bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/40" 
                : "bg-muted"
            )}
          >
            <Flame className={cn(
              "w-7 h-7",
              todayActive ? "text-white" : "text-muted-foreground"
            )} />
          </motion.div>
          
          <div>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-3xl font-bold",
                todayActive ? "text-orange-500" : "text-muted-foreground"
              )}>
                {currentStreak}
              </span>
              <span className="text-sm text-muted-foreground">días</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {todayActive ? '¡Racha activa!' : 'Racha actual'}
            </p>
          </div>
        </div>

        {/* Best Streak */}
        <div className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <div className="text-right">
            <p className="text-lg font-bold">{longestStreak}</p>
            <p className="text-[10px] text-muted-foreground">Mejor racha</p>
          </div>
        </div>
      </div>

      {/* Streak Status */}
      {!todayActive && currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 bg-warning/10 rounded-lg px-3 py-2"
        >
          <Zap className="w-4 h-4 text-warning" />
          <p className="text-xs text-warning">
            ¡Completa algo hoy para mantener tu racha!
          </p>
        </motion.div>
      )}

      {currentStreak === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 bg-muted rounded-lg px-3 py-2"
        >
          <Flame className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Completa un deadline o sesión focus para iniciar tu racha
          </p>
        </motion.div>
      )}

      {/* Streak milestones */}
      {currentStreak >= 7 && (
        <div className="mt-3 flex gap-2">
          {currentStreak >= 7 && (
            <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full">
              🔥 1 semana
            </span>
          )}
          {currentStreak >= 30 && (
            <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">
              🏆 1 mes
            </span>
          )}
          {currentStreak >= 100 && (
            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
              ⭐ 100 días
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
