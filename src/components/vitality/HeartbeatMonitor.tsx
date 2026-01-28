import { motion } from 'framer-motion';
import { useVitality, VitalityState } from '@/hooks/useVitality';
import { cn } from '@/lib/utils';
import { useFeedback } from '@/hooks/useFeedback';
import { useEffect, useRef } from 'react';

const STATE_CONFIG: Record<VitalityState, {
  color: string;
  glowColor: string;
  pulseSpeed: number;
  label: string;
  pathVariant: 'normal' | 'weak' | 'erratic' | 'flat';
}> = {
  vital: {
    color: 'hsl(142, 76%, 50%)',
    glowColor: 'hsl(142, 76%, 50%)',
    pulseSpeed: 1,
    label: 'VITAL',
    pathVariant: 'normal',
  },
  weak: {
    color: 'hsl(45, 100%, 55%)',
    glowColor: 'hsl(45, 100%, 55%)',
    pulseSpeed: 1.5,
    label: 'DÉBIL',
    pathVariant: 'weak',
  },
  critical: {
    color: 'hsl(25, 95%, 55%)',
    glowColor: 'hsl(25, 95%, 55%)',
    pulseSpeed: 2,
    label: 'CRÍTICO',
    pathVariant: 'erratic',
  },
  flatline: {
    color: 'hsl(0, 84%, 60%)',
    glowColor: 'hsl(0, 84%, 60%)',
    pulseSpeed: 0,
    label: 'SIN PULSO',
    pathVariant: 'flat',
  },
};

// ECG wave paths for different states
const ECG_PATHS = {
  normal: 'M 0,50 L 15,50 L 20,50 L 25,20 L 30,80 L 35,35 L 40,50 L 60,50 L 65,50 L 70,20 L 75,80 L 80,35 L 85,50 L 100,50',
  weak: 'M 0,50 L 20,50 L 25,35 L 30,65 L 35,45 L 40,50 L 70,50 L 75,35 L 80,65 L 85,45 L 90,50 L 100,50',
  erratic: 'M 0,50 L 10,50 L 15,30 L 18,70 L 22,25 L 28,75 L 32,50 L 50,50 L 55,40 L 60,60 L 65,35 L 75,65 L 80,50 L 100,50',
  flat: 'M 0,50 L 100,50',
};

interface HeartbeatMonitorProps {
  compact?: boolean;
  className?: string;
}

export function HeartbeatMonitor({ compact = false, className }: HeartbeatMonitorProps) {
  const vitality = useVitality();
  const config = STATE_CONFIG[vitality.state];
  const { tickFeedback } = useFeedback();
  const prevState = useRef(vitality.state);

  // Trigger feedback when coming back from flatline
  useEffect(() => {
    if (prevState.current === 'flatline' && vitality.state !== 'flatline') {
      tickFeedback();
    }
    prevState.current = vitality.state;
  }, [vitality.state, tickFeedback]);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div 
          className="relative w-8 h-8 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: `${config.color}20`,
            boxShadow: vitality.state !== 'flatline' ? `0 0 10px ${config.glowColor}40` : 'none'
          }}
        >
          <motion.div
            animate={vitality.state !== 'flatline' ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={{
              duration: config.pulseSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-lg"
          >
            {vitality.state === 'flatline' ? '💀' : '🫀'}
          </motion.div>
        </div>
        <div className="flex flex-col">
          <span 
            className="text-xs font-bold tracking-wider"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {vitality.score}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative bg-card rounded-xl border border-border p-4 overflow-hidden",
        className
      )}
      style={{
        boxShadow: vitality.state !== 'flatline' 
          ? `0 0 30px ${config.glowColor}20, inset 0 0 30px ${config.glowColor}05`
          : 'none'
      }}
    >
      {/* Background grid effect */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(${config.color}20 1px, transparent 1px),
            linear-gradient(90deg, ${config.color}20 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={vitality.state !== 'flatline' ? {
              scale: [1, 1.15, 1],
            } : {}}
            transition={{
              duration: config.pulseSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-xl"
          >
            {vitality.state === 'flatline' ? '💀' : '🫀'}
          </motion.div>
          <div>
            <h3 className="text-sm font-bold tracking-wide" style={{ color: config.color }}>
              LiFELiNE
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Monitor de Productividad
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <motion.div
            animate={vitality.state !== 'flatline' ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: config.pulseSpeed, repeat: Infinity }}
            className="text-2xl font-bold font-mono"
            style={{ color: config.color }}
          >
            {vitality.score}
          </motion.div>
          <span 
            className="text-[10px] font-semibold tracking-wider"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* ECG Display */}
      <div className="relative h-16 mb-3">
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Static trace line (faded) */}
          <path
            d={ECG_PATHS[config.pathVariant]}
            fill="none"
            stroke={config.color}
            strokeWidth="1"
            strokeOpacity="0.2"
          />
          
          {/* Animated trace */}
          {vitality.state !== 'flatline' ? (
            <motion.path
              d={ECG_PATHS[config.pathVariant]}
              fill="none"
              stroke={config.color}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                pathLength: {
                  duration: config.pulseSpeed * 1.5,
                  repeat: Infinity,
                  ease: "linear",
                },
                opacity: {
                  duration: config.pulseSpeed,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              }}
              style={{
                filter: `drop-shadow(0 0 3px ${config.glowColor})`,
              }}
            />
          ) : (
            <motion.path
              d={ECG_PATHS.flat}
              fill="none"
              stroke={config.color}
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                filter: `drop-shadow(0 0 3px ${config.glowColor})`,
              }}
            />
          )}

          {/* Scanning line effect */}
          {vitality.state !== 'flatline' && (
            <motion.line
              x1="0"
              y1="0"
              x2="0"
              y2="100"
              stroke={config.color}
              strokeWidth="2"
              strokeOpacity="0.5"
              animate={{ x1: [0, 100], x2: [0, 100] }}
              transition={{
                duration: config.pulseSpeed * 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </svg>

        {/* Glow overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${config.glowColor}10 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Message */}
      <motion.p 
        key={vitality.message}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm text-muted-foreground"
      >
        {vitality.message}
      </motion.p>

      {/* Stats row */}
      <div className="flex justify-between mt-3 pt-3 border-t border-border/50">
        <Stat label="Racha" value={`${vitality.streakDays}d`} color={config.color} />
        <Stat label="Vencidas" value={vitality.overdueCount.toString()} color={vitality.overdueCount > 0 ? 'hsl(0, 84%, 60%)' : config.color} />
        <Stat label="Completadas" value={vitality.completedRecently.toString()} color={config.color} />
      </div>
    </motion.div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold font-mono" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
