import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { HeartbeatMonitor } from '@/components/vitality/HeartbeatMonitor';
import { useNotifications } from '@/hooks/useNotifications';
import { PWAPrompt } from '@/components/pwa/PWAPrompt';

export function AppLayout() {
  // Initialize notification checking
  useNotifications();
  
  return (
    <div className="min-h-screen bg-background pb-36">
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>
      
      {/* LiFELiNE Monitor - Fixed above bottom nav with visual frame */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-2 max-w-lg mx-auto safe-area-bottom">
        <div className="p-1 rounded-2xl bg-gradient-to-b from-[hsl(200,60%,30%)/20] to-transparent">
          <HeartbeatMonitor />
        </div>
      </div>
      
      <BottomNav />
      <PWAPrompt />
    </div>
  );
}
