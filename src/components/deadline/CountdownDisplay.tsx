import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TimeRemaining } from '@/types/deadline';

interface CountdownDisplayProps {
  timeRemaining: TimeRemaining;
  size?: 'sm' | 'md' | 'lg';
  showSeconds?: boolean;
  className?: string;
}

export function CountdownDisplay({ 
  timeRemaining, 
  size = 'md', 
  showSeconds = false,
  className 
}: CountdownDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-bold',
    lg: 'text-4xl font-extrabold',
  };

  const labelClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const unitClasses = {
    sm: 'min-w-[2.5rem] p-1.5',
    md: 'min-w-[3.5rem] p-2',
    lg: 'min-w-[5rem] p-3',
  };

  const isUrgent = timeRemaining.days === 0 && timeRemaining.hours < 6;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <TimeUnit 
        value={timeRemaining.days} 
        label="DÍAS"
        sizeClass={sizeClasses[size]}
        labelClass={labelClasses[size]}
        unitClass={unitClasses[size]}
        isUrgent={isUrgent}
      />
      <Separator size={size} />
      <TimeUnit 
        value={timeRemaining.hours} 
        label="HRS"
        sizeClass={sizeClasses[size]}
        labelClass={labelClasses[size]}
        unitClass={unitClasses[size]}
        isUrgent={isUrgent}
      />
      <Separator size={size} />
      <TimeUnit 
        value={timeRemaining.minutes} 
        label="MIN"
        sizeClass={sizeClasses[size]}
        labelClass={labelClasses[size]}
        unitClass={unitClasses[size]}
        isUrgent={isUrgent}
      />
      {showSeconds && (
        <>
          <Separator size={size} />
          <TimeUnit 
            value={timeRemaining.seconds} 
            label="SEG"
            sizeClass={sizeClasses[size]}
            labelClass={labelClasses[size]}
            unitClass={unitClasses[size]}
            isUrgent={isUrgent}
            animate
          />
        </>
      )}
    </div>
  );
}

interface TimeUnitProps {
  value: number;
  label: string;
  sizeClass: string;
  labelClass: string;
  unitClass: string;
  isUrgent?: boolean;
  animate?: boolean;
}

function TimeUnit({ value, label, sizeClass, labelClass, unitClass, isUrgent, animate }: TimeUnitProps) {
  return (
    <motion.div 
      className={cn(
        "flex flex-col items-center rounded-lg bg-secondary/50",
        unitClass
      )}
      key={animate ? value : undefined}
      initial={animate ? { scale: 1.1 } : undefined}
      animate={animate ? { scale: 1 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <span className={cn(
        sizeClass,
        "tabular-nums tracking-tight",
        isUrgent ? "text-urgent" : "text-foreground"
      )}>
        {String(value).padStart(2, '0')}
      </span>
      <span className={cn(
        labelClass,
        "uppercase tracking-wider text-muted-foreground"
      )}>
        {label}
      </span>
    </motion.div>
  );
}

function Separator({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const dotSize = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  return (
    <div className="flex flex-col gap-1 items-center justify-center">
      <div className={cn("rounded-full bg-muted-foreground/50", dotSize[size])} />
      <div className={cn("rounded-full bg-muted-foreground/50", dotSize[size])} />
    </div>
  );
}
