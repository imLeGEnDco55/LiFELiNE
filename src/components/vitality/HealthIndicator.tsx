import { motion } from 'framer-motion';
import { HEALTH_CONFIG, HealthStatus } from '@/hooks/useDailyHealth';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HealthIndicatorProps {
  status: HealthStatus;
  score: number;
  completedCount: number;
  overdueCount: number;
  focusMinutes: number;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

export function HealthIndicator({ 
  status, 
  score, 
  completedCount, 
  overdueCount,
  focusMinutes,
  size = 'sm',
  showTooltip = true,
}: HealthIndicatorProps) {
  const config = HEALTH_CONFIG[status];
  
  if (status === 'none') {
    return null;
  }

  const indicator = (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "rounded-full",
        size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
        status === 'vital' && 'animate-pulse'
      )}
      style={{ 
        backgroundColor: config.color,
        boxShadow: `0 0 ${size === 'sm' ? '4px' : '6px'} ${config.color}`,
      }}
    />
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {indicator}
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="bg-card border-border"
      >
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2 font-semibold" style={{ color: config.color }}>
            <span>{config.emoji}</span>
            <span>{config.label}</span>
          </div>
          <div className="text-muted-foreground space-y-0.5">
            {completedCount > 0 && (
              <p>✓ {completedCount} completado{completedCount > 1 ? 's' : ''}</p>
            )}
            {overdueCount > 0 && (
              <p className="text-urgent">✗ {overdueCount} vencido{overdueCount > 1 ? 's' : ''}</p>
            )}
            {focusMinutes > 0 && (
              <p>🍅 {focusMinutes} min de focus</p>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
