import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useNotifications } from '@/hooks/useNotifications';
import { PWAPrompt } from '@/components/pwa/PWAPrompt';

export function AppLayout() {
  // Initialize notification checking
  useNotifications();
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
      <PWAPrompt />
    </div>
  );
}
