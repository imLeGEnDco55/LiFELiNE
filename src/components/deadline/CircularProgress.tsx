import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'urgent' | 'warning' | 'success';
}

export function CircularProgress({
  percentage,
  size = 200,
  strokeWidth = 12,
  children,
  className,
  variant = 'primary',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    primary: 'stroke-primary',
    urgent: 'stroke-urgent',
    warning: 'stroke-warning',
    success: 'stroke-success',
  };

  const variantGlows = {
    primary: 'drop-shadow-[0_0_8px_hsl(217,91%,60%,0.5)]',
    urgent: 'drop-shadow-[0_0_8px_hsl(0,84%,60%,0.5)]',
    warning: 'drop-shadow-[0_0_8px_hsl(38,92%,50%,0.5)]',
    success: 'drop-shadow-[0_0_8px_hsl(142,76%,36%,0.5)]',
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-secondary"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn(variantColors[variant], variantGlows[variant])}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
