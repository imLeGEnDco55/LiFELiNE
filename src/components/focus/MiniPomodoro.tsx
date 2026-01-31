import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, Coffee, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircularProgress } from '@/components/deadline/CircularProgress';
import { useDeadlines } from '@/hooks/useDeadlines';
import { useFeedback } from '@/hooks/useFeedback';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SessionType = 'work' | 'short_break' | 'long_break';

const SESSION_DURATIONS = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

const SESSION_LABELS = {
  work: 'Focus',
  short_break: 'Descanso',
  long_break: 'Descanso Largo',
};

export function MiniPomodoro() {
  const { createFocusSession, completeFocusSession, weeklyStats } = useDeadlines();
  const { successFeedback, breakFeedback } = useFeedback();
  
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const handleSessionComplete = useCallback(() => {
    if (currentSessionId) {
      completeFocusSession(currentSessionId);
    }
    
    setIsRunning(false);
    setCurrentSessionId(null);
    
    if (sessionType === 'work') {
      setSessionsCompleted(prev => prev + 1);
      successFeedback();
      toast.success('¡Sesión completada! 🍅');
      const nextType = (sessionsCompleted + 1) % 4 === 0 ? 'long_break' : 'short_break';
      setSessionType(nextType);
      setTimeLeft(SESSION_DURATIONS[nextType]);
    } else {
      breakFeedback();
      setSessionType('work');
      setTimeLeft(SESSION_DURATIONS.work);
    }
  }, [sessionType, sessionsCompleted, currentSessionId, completeFocusSession, successFeedback, breakFeedback]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleSessionComplete]);

  const toggleTimer = () => {
    if (!isRunning) {
      const session = createFocusSession({
        deadline_id: null,
        duration_minutes: SESSION_DURATIONS[sessionType] / 60,
        session_type: sessionType,
        completed_at: null,
      });
      setCurrentSessionId(session.id);
    }
    setIsRunning(prev => !prev);
  };

  const skipSession = () => {
    setIsRunning(false);
    setCurrentSessionId(null);
    if (sessionType === 'work') {
      setSessionType('short_break');
      setTimeLeft(SESSION_DURATIONS.short_break);
    } else {
      setSessionType('work');
      setTimeLeft(SESSION_DURATIONS.work);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentSessionId(null);
    setTimeLeft(SESSION_DURATIONS[sessionType]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((SESSION_DURATIONS[sessionType] - timeLeft) / SESSION_DURATIONS[sessionType]) * 100;
  const isBreak = sessionType !== 'work';
  const todaysSessions = weeklyStats.todaySessionsCount + sessionsCompleted;

  return (
    <div className="flex flex-col items-center">
      {/* Session Type Badge */}
      <div className={cn(
        "text-xs font-medium px-3 py-1 rounded-full mb-4",
        isBreak ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
      )}>
        {isBreak && <Coffee className="w-3 h-3 inline mr-1" />}
        {SESSION_LABELS[sessionType]}
      </div>

      {/* Timer */}
      <CircularProgress 
        percentage={progress} 
        size={180} 
        strokeWidth={12}
        variant={isBreak ? 'success' : 'primary'}
        className={cn(isRunning && "animate-pulse-glow")}
      >
        <div className="text-center">
          <p className="text-4xl font-bold tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>
      </CircularProgress>

      {/* Session Counter */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-muted-foreground text-xs">Hoy:</span>
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i < todaysSessions % 4 ? "bg-red-500" : "bg-secondary"
              )}
            />
          ))}
        </div>
        <span className="font-semibold text-sm">{todaysSessions} 🍅</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={resetTimer}
              aria-label="Reiniciar Temporizador"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reiniciar</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className={cn(
                "rounded-full w-16 h-16",
                isRunning
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              )}
              onClick={toggleTimer}
              aria-label={isRunning ? "Pausar Temporizador" : "Iniciar Temporizador"}
            >
              {isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRunning ? "Pausar" : "Iniciar"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={skipSession}
              aria-label="Saltar Sesión"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Saltar</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
