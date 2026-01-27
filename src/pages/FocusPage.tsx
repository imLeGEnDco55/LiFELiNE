import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, Coffee, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  work: 'Focus Time',
  short_break: 'Descanso Corto',
  long_break: 'Descanso Largo',
};

export function FocusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { deadlines, createFocusSession, completeFocusSession, weeklyStats } = useDeadlines();
  const { successFeedback, breakFeedback } = useFeedback();
  
  const deadlineId = searchParams.get('deadline');
  const deadline = deadlineId ? deadlines.find(d => d.id === deadlineId) : null;
  
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
      toast.success('¡Sesión completada! 🎉');
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
      // Start a new session
      const session = createFocusSession({
        deadline_id: deadlineId || null,
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
  const todaysSessions = weeklyStats.todaySessionsCount;

  return (
    <div className="px-4 py-6 min-h-screen flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Modo Focus</h1>
          {deadline && (
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {deadline.title}
            </p>
          )}
        </div>
      </motion.header>

      {/* Main Timer */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center"
      >
        <p className={cn(
          "text-sm font-medium mb-4 px-4 py-1 rounded-full",
          isBreak ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
        )}>
          {isBreak && <Coffee className="w-4 h-4 inline mr-1" />}
          {SESSION_LABELS[sessionType]}
        </p>

        <CircularProgress 
          percentage={progress} 
          size={280} 
          strokeWidth={16}
          variant={isBreak ? 'success' : 'primary'}
          className={cn(isRunning && "animate-pulse-glow")}
        >
          <div className="text-center">
            <p className="text-6xl font-bold tabular-nums tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
          </div>
        </CircularProgress>

        {/* Session Counter */}
        <div className="flex items-center gap-2 mt-6">
          <span className="text-muted-foreground text-sm">Sesiones hoy:</span>
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  i < (todaysSessions + sessionsCompleted) % 4 
                    ? "bg-primary" 
                    : "bg-secondary"
                )}
              />
            ))}
          </div>
          <span className="font-semibold">{todaysSessions + sessionsCompleted}</span>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center gap-4 pb-8"
      >
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-14 h-14"
          onClick={resetTimer}
        >
          <span className="text-xs">Reset</span>
        </Button>

        <Button
          size="lg"
          className={cn(
            "rounded-full w-20 h-20",
            isRunning ? "bg-destructive hover:bg-destructive/90" : "gradient-primary glow-primary"
          )}
          onClick={toggleTimer}
        >
          {isRunning ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-14 h-14"
          onClick={skipSession}
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}
