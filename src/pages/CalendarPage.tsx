import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DeadlineCard } from '@/components/deadline/DeadlineCard';
import { HealthIndicator } from '@/components/vitality/HealthIndicator';
import { useDeadlines } from '@/hooks/useDeadlines';
import { useDailyHealth, HEALTH_CONFIG } from '@/hooks/useDailyHealth';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CalendarPage() {
  const navigate = useNavigate();
  const { deadlines, categories, subtasksMap } = useDeadlines();
  const { getDayHealth } = useDailyHealth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start to align with weekday
  const startDay = monthStart.getDay();
  const paddingDays = startDay === 0 ? 6 : startDay - 1;

  const getDeadlinesForDay = (date: Date) => {
    return deadlines.filter(d => isSameDay(new Date(d.deadline_at), date));
  };

  const selectedDeadlines = selectedDate ? getDeadlinesForDay(selectedDate) : [];
  const selectedHealth = selectedDate ? getDayHealth(selectedDate) : null;
  const today = startOfDay(new Date());

  return (
    <div className="px-4 py-6 pb-24">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">Historial Médico</h1>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mes anterior</p>
              </TooltipContent>
            </Tooltip>

            <span className="font-semibold min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mes siguiente</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Registro de signos vitales diarios
        </p>
      </motion.header>

      {/* Health Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 mb-4 text-xs"
      >
        {(['vital', 'stable', 'weak', 'critical', 'flatline'] as const).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: HEALTH_CONFIG[status].color }}
            />
            <span className="text-muted-foreground capitalize">
              {status === 'vital' ? 'Vital' : 
               status === 'stable' ? 'Estable' :
               status === 'weak' ? 'Débil' :
               status === 'critical' ? 'Crítico' : 'Sin pulso'}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Calendar Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card rounded-xl p-4 mb-6 border border-border"
      >
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding cells */}
          {[...Array(paddingDays)].map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {days.map(day => {
            const dayDeadlines = getDeadlinesForDay(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isPast = isBefore(day, today);
            const dayHealth = isPast || isToday ? getDayHealth(day) : null;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center relative",
                  "transition-all duration-200",
                  isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  isSelected && "bg-primary text-primary-foreground",
                  !isToday && !isSelected && "hover:bg-accent"
                )}
                style={dayHealth && dayHealth.status !== 'none' ? {
                  backgroundColor: isSelected ? undefined : HEALTH_CONFIG[dayHealth.status].bgColor,
                } : undefined}
              >
                <span className={cn(
                  "text-sm font-medium",
                  !isSameMonth(day, currentMonth) && "text-muted-foreground/50"
                )}>
                  {format(day, 'd')}
                </span>
                
                {/* Health indicator */}
                {dayHealth && dayHealth.status !== 'none' && (
                  <div className="absolute bottom-1">
                    <HealthIndicator
                      status={dayHealth.status}
                      score={dayHealth.score}
                      completedCount={dayHealth.completedCount}
                      overdueCount={dayHealth.overdueCount}
                      focusMinutes={dayHealth.focusMinutes}
                      size="sm"
                    />
                  </div>
                )}

                {/* Deadline dots (for future dates) */}
                {!dayHealth && dayDeadlines.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayDeadlines.slice(0, 3).map((d, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 h-1 rounded-full",
                          d.completed_at ? "bg-success" : "bg-primary"
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Day Details */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Day header with health status */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
            </h2>
            {selectedHealth && selectedHealth.status !== 'none' && (
              <div 
                className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: HEALTH_CONFIG[selectedHealth.status].bgColor,
                  color: HEALTH_CONFIG[selectedHealth.status].color,
                }}
              >
                <span>{HEALTH_CONFIG[selectedHealth.status].emoji}</span>
                <span>{HEALTH_CONFIG[selectedHealth.status].label}</span>
              </div>
            )}
          </div>

          {/* Health summary card for past days */}
          {selectedHealth && selectedHealth.status !== 'none' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                Resumen de Signos Vitales
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-success">
                    {selectedHealth.completedCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Completados
                  </div>
                </div>
                <div>
                  <div className={cn(
                    "text-2xl font-bold",
                    selectedHealth.overdueCount > 0 ? "text-urgent" : "text-muted-foreground"
                  )}>
                    {selectedHealth.overdueCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Vencidos
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {selectedHealth.focusMinutes}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Min Focus
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Deadlines for this day */}
          {selectedDeadlines.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No hay deadlines para este día
            </p>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Deadlines del día
              </h3>
              {selectedDeadlines.map(deadline => (
                <DeadlineCard
                  key={deadline.id}
                  deadline={deadline}
                  subtasks={subtasksMap[deadline.id]}
                  category={categories.find(c => c.id === deadline.category_id)}
                  onClick={() => navigate(`/deadline/${deadline.id}`)}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
