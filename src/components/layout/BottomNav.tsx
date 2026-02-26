import { Home, Calendar, ListTodo, Settings, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PomodoroDrawer } from '@/components/focus/PomodoroDrawer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { icon: Home, label: 'Inicio', path: '/' },
  { icon: Calendar, label: 'Historial', path: '/calendar' },
  { type: 'pomodoro' as const }, // Center slot for Pomodoro
  { icon: BarChart3, label: 'Stats', path: '/stats' },
  { icon: Settings, label: 'Ajustes', path: '/settings' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item, index) => {
          // Special handling for Pomodoro center button
          if ('type' in item && item.type === 'pomodoro') {
            return (
              <PomodoroDrawer key="pomodoro">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      aria-label="Temporizador Pomodoro"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "relative flex items-center justify-center w-14 h-14 -mt-5",
                        "rounded-full",
                        "bg-gradient-to-br from-red-500 to-orange-500",
                        "shadow-lg",
                        "text-2xl"
                      )}
                      style={{
                        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
                      }}
                    >
                      🍅
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Temporizador Pomodoro</p>
                  </TooltipContent>
                </Tooltip>
              </PomodoroDrawer>
            );
          }

          const { icon: Icon, label, path } = item as { icon: typeof Home; label: string; path: string };
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "relative flex flex-col items-center justify-center w-16 h-full",
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 w-8 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] mt-1 font-medium",
                isActive && "text-primary"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
