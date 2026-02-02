import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MiniPomodoro } from './MiniPomodoro';
import { cn } from '@/lib/utils';

interface PomodoroDrawerProps {
  children: React.ReactNode;
}

export function PomodoroDrawer({ children }: PomodoroDrawerProps) {
  return (
    <Drawer>
      <Tooltip>
        <DrawerTrigger asChild>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
        </DrawerTrigger>
        <TooltipContent>
          <p>Temporizador Pomodoro</p>
        </TooltipContent>
      </Tooltip>
      <DrawerContent className="pb-8">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <span className="text-2xl">🍅</span>
            Pomodoro Focus
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4">
          <MiniPomodoro />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
