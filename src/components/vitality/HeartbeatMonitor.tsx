import { motion } from 'framer-motion';
import { useVitality, VitalityState } from '@/hooks/useVitality';
import { cn } from '@/lib/utils';
import { useFeedback } from '@/hooks/useFeedback';
import { useEffect, useRef } from 'react';

const STATE_CONFIG: Record<VitalityState, {
  color: string;
  glowColor: string;
  pulseSpeed: number;
  pathVariant: 'normal' | 'weak' | 'erratic' | 'flat';
}> = {
  vital: {
    color: 'hsl(142, 76%, 50%)',
    glowColor: 'hsl(142, 76%, 50%)',
    pulseSpeed: 1,
    pathVariant: 'normal',
  },
  weak: {
    color: 'hsl(45, 100%, 55%)',
    glowColor: 'hsl(45, 100%, 55%)',
    pulseSpeed: 1.5,
    pathVariant: 'weak',
  },
  critical: {
    color: 'hsl(25, 95%, 55%)',
    glowColor: 'hsl(25, 95%, 55%)',
    pulseSpeed: 2,
    pathVariant: 'erratic',
  },
  flatline: {
    color: 'hsl(0, 84%, 60%)',
    glowColor: 'hsl(0, 84%, 60%)',
    pulseSpeed: 0,
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
  className?: string;
}

export function HeartbeatMonitor({ className }: HeartbeatMonitorProps) {
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative h-16 bg-card rounded-xl border border-border overflow-hidden flex items-center px-4 gap-3",
        className
      )}
      style={{
        boxShadow: vitality.state !== 'flatline' 
          ? `0 0 20px ${config.glowColor}15, inset 0 0 20px ${config.glowColor}05`
          : 'none'
      }}
    >
      {/* Background grid effect */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(${config.color}30 1px, transparent 1px),
            linear-gradient(90deg, ${config.color}30 1px, transparent 1px)
          `,
          backgroundSize: '12px 12px',
        }}
      />

      {/* Left: Emoji with pulse */}
      <motion.div
        animate={vitality.state !== 'flatline' ? {
          scale: [1, 1.15, 1],
        } : {}}
        transition={{
          duration: config.pulseSpeed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 text-2xl shrink-0"
      >
        {vitality.state === 'flatline' ? '💀' : '🫀'}
      </motion.div>

      {/* Center: ECG Line */}
      <div className="relative flex-1 h-10">
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
            strokeWidth="1.5"
            strokeOpacity="0.15"
          />
          
          {/* Animated trace */}
          {vitality.state !== 'flatline' ? (
            <motion.path
              d={ECG_PATHS[config.pathVariant]}
              fill="none"
              stroke={config.color}
              strokeWidth="2.5"
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
                filter: `drop-shadow(0 0 4px ${config.glowColor})`,
              }}
            />
          ) : (
            <motion.path
              d={ECG_PATHS.flat}
              fill="none"
              stroke={config.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                filter: `drop-shadow(0 0 4px ${config.glowColor})`,
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
              strokeOpacity="0.4"
              animate={{ x1: [0, 100], x2: [0, 100] }}
              transition={{
                duration: config.pulseSpeed * 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </svg>
      </div>

      {/* Right: Score with pulse effect */}
      <motion.div
        animate={vitality.state !== 'flatline' ? { opacity: [1, 0.6, 1] } : {}}
        transition={{ duration: config.pulseSpeed, repeat: Infinity }}
        className="relative z-10 text-2xl font-bold font-mono shrink-0 tabular-nums"
        style={{ color: config.color }}
      >
        {vitality.score}
      </motion.div>
    </motion.div>
  );
}
