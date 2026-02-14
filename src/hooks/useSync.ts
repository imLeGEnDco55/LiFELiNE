import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { Deadline, Subtask, FocusSession, Category } from '@/types/deadline';

export function useSync() {
  const { user, session } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(() => {
    return localStorage.getItem('lifeline-last-sync');
  });

  const syncLocalToCloud = async () => {
    if (!user || !session) {
      toast.error('Debes iniciar sesión para sincronizar');
      return;
    }

    setIsSyncing(true);
    const toastId = toast.loading('Sincronizando datos...');

    try {
      // 1. Read all local data
      const localDeadlines: Deadline[] = JSON.parse(localStorage.getItem('deadliner-deadlines') || '[]');
      const localSubtasks: Subtask[] = JSON.parse(localStorage.getItem('deadliner-subtasks') || '[]');
      const localFocusSessions: FocusSession[] = JSON.parse(localStorage.getItem('deadliner-focus-sessions') || '[]');
      const localCategories: Category[] = JSON.parse(localStorage.getItem('deadliner-categories') || '[]');

      if (localDeadlines.length === 0 && localSubtasks.length === 0 && localFocusSessions.length === 0) {
        toast.dismiss(toastId);
        toast.info('No hay datos locales para sincronizar');
        setIsSyncing(false);
        return;
      }

      // 2. Prepare data for upsert (attach current user_id)
      const deadlinesToUpsert = localDeadlines.map(d => ({
        ...d,
        user_id: user.id, // Ensure it belongs to current cloud user
        description: d.description || null, // Handle undefined
        completed_at: d.completed_at || null,
        parent_id: d.parent_id || null,
        category_id: d.category_id || null
      }));

      const subtasksToUpsert = localSubtasks.map(s => ({
        ...s,
        user_id: user.id
      }));

      const sessionsToUpsert = localFocusSessions.map(s => ({
        ...s,
        user_id: user.id,
        deadline_id: s.deadline_id || null,
        completed_at: s.completed_at || null
      }));

      // 3. Upsert to Supabase
      // We use upsert to avoid duplicates if ID matches

      // Sync Categories (Optional, if we want to sync custom categories)
      // For now we skip as they are mostly static or default

      // Sync Deadlines
      if (deadlinesToUpsert.length > 0) {
        const { error: deadlinesError } = await supabase
          .from('deadlines')
          .upsert(deadlinesToUpsert, { onConflict: 'id' });

        if (deadlinesError) throw deadlinesError;
      }

      // Sync Subtasks
      if (subtasksToUpsert.length > 0) {
        const { error: subtasksError } = await supabase
          .from('subtasks')
          .upsert(subtasksToUpsert, { onConflict: 'id' });

        if (subtasksError) throw subtasksError;
      }

      // Sync Focus Sessions
      if (sessionsToUpsert.length > 0) {
        const { error: sessionsError } = await supabase
          .from('focus_sessions')
          .upsert(sessionsToUpsert, { onConflict: 'id' });

        if (sessionsError) throw sessionsError;
      }

      // 4. Update timestamp
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem('lifeline-last-sync', now);

      toast.dismiss(toastId);
      toast.success('Sincronización completada');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.dismiss(toastId);
      toast.error(`Error al sincronizar: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    lastSync,
    syncLocalToCloud
  };
}
