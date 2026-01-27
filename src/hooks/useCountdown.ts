import { useState, useEffect, useMemo } from 'react';
import { TimeRemaining } from '@/types/deadline';

export function useCountdown(targetDate: string, createdAt?: string) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    percentage: 0,
  });

  const targetTime = useMemo(() => new Date(targetDate).getTime(), [targetDate]);
  const startTime = useMemo(() => 
    createdAt ? new Date(createdAt).getTime() : Date.now(), 
    [createdAt]
  );

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const total = targetTime - now;
      const totalDuration = targetTime - startTime;
      
      if (total <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
          percentage: 100,
        });
        return;
      }

      const elapsed = now - startTime;
      const percentage = totalDuration > 0 ? Math.min((elapsed / totalDuration) * 100, 100) : 0;

      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((total % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        total,
        percentage,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetTime, startTime]);

  return timeRemaining;
}

export function getDeadlineStatus(timeRemaining: TimeRemaining, completed: boolean): 'immediate' | 'warning' | 'on_track' | 'completed' | 'overdue' {
  if (completed) return 'completed';
  if (timeRemaining.total <= 0) return 'overdue';
  if (timeRemaining.days === 0 && timeRemaining.hours < 6) return 'immediate';
  if (timeRemaining.days < 2) return 'warning';
  return 'on_track';
}

export function formatCountdownUnit(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}
