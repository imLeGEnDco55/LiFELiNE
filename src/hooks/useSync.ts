import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Deadline, Subtask, FocusSession } from "@/types/deadline";

export function useSync() {
  const { user, session } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(() => {
    return localStorage.getItem("lifeline-last-sync");
  });

  const syncLocalToCloud = async () => {
    if (!user || !session) {
      toast.error("Debes iniciar sesión para sincronizar");
      return;
    }

    setIsSyncing(true);
    const toastId = toast.loading("Sincronizando datos...");

    // Timeout helper: rejects if Supabase hangs
    const withTimeout = <T>(promise: Promise<T>, ms = 15000): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Tiempo de espera agotado")), ms),
        ),
      ]);
    };

    try {
      // 1. Read all local data
      const localDeadlines: Deadline[] = JSON.parse(
        localStorage.getItem("deadliner-deadlines") || "[]",
      );
      const localSubtasks: Subtask[] = JSON.parse(
        localStorage.getItem("deadliner-subtasks") || "[]",
      );
      const localFocusSessions: FocusSession[] = JSON.parse(
        localStorage.getItem("deadliner-focus-sessions") || "[]",
      );

      if (
        localDeadlines.length === 0 &&
        localSubtasks.length === 0 &&
        localFocusSessions.length === 0
      ) {
        toast.info("No hay datos locales para sincronizar");
        return;
      }

      // 2. Prepare data for upsert (attach current user_id)
      const deadlinesToUpsert = localDeadlines.map((d) => ({
        ...d,
        user_id: user.id,
        description: d.description || null,
        completed_at: d.completed_at || null,
        parent_id: d.parent_id || null,
        category_id: d.category_id || null,
      }));

      const subtasksToUpsert = localSubtasks.map((s) => ({
        ...s,
        user_id: user.id,
      }));

      const sessionsToUpsert = localFocusSessions.map((s) => ({
        ...s,
        user_id: user.id,
        deadline_id: s.deadline_id || null,
        completed_at: s.completed_at || null,
      }));

      // 3. Upsert to Supabase with timeout protection

      if (deadlinesToUpsert.length > 0) {
        const { error: deadlinesError } = await withTimeout(
          Promise.resolve(
            supabase.from("deadlines").upsert(deadlinesToUpsert, { onConflict: "id" })
          ),
        );
        if (deadlinesError) throw deadlinesError;
      }

      if (subtasksToUpsert.length > 0) {
        const { error: subtasksError } = await withTimeout(
          Promise.resolve(
            supabase.from("subtasks").upsert(subtasksToUpsert, { onConflict: "id" })
          ),
        );
        if (subtasksError) throw subtasksError;
      }

      if (sessionsToUpsert.length > 0) {
        const { error: sessionsError } = await withTimeout(
          Promise.resolve(
            supabase.from("focus_sessions").upsert(sessionsToUpsert, { onConflict: "id" })
          ),
        );
        if (sessionsError) throw sessionsError;
      }

      // 4. Update timestamp
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem("lifeline-last-sync", now);

      toast.success("Sincronización completada");
    } catch (error: any) {
      console.error("Sync error:", error);
      toast.error(`Error al sincronizar: ${error.message}`);
    } finally {
      toast.dismiss(toastId);
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    lastSync,
    syncLocalToCloud,
  };
}
