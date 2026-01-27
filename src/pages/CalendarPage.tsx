import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeadlineCard } from '@/components/deadline/DeadlineCard';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deadline } from '@/types/deadline';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: deadlines = [] } = useQuery({
    queryKey: ['deadlines', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as Deadline[];
    },
    enabled: !!user,
  });

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

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calendario</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="font-semibold min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Calendar Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card rounded-xl p-4 mb-6"
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
            const hasDeadlines = dayDeadlines.length > 0;
            const hasUrgent = dayDeadlines.some(d => {
              const hoursUntil = (new Date(d.deadline_at).getTime() - Date.now()) / (1000 * 60 * 60);
              return hoursUntil < 24 && !d.completed_at;
            });

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center relative",
                  "transition-all duration-200",
                  isToday && "bg-primary/20",
                  isSelected && "bg-primary text-primary-foreground",
                  !isToday && !isSelected && "hover:bg-accent"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  !isSameMonth(day, currentMonth) && "text-muted-foreground/50"
                )}>
                  {format(day, 'd')}
                </span>
                {hasDeadlines && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayDeadlines.slice(0, 3).map((d, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 h-1 rounded-full",
                          d.completed_at ? "bg-success" : hasUrgent ? "bg-urgent" : "bg-primary"
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

      {/* Selected Day Deadlines */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h2 className="font-semibold">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h2>
          
          {selectedDeadlines.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No hay deadlines para este día
            </p>
          ) : (
            selectedDeadlines.map(deadline => (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                onClick={() => navigate(`/deadline/${deadline.id}`)}
              />
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
