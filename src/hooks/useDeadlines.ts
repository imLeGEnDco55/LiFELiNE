import { useAuth } from '@/providers/AuthProvider';
import { useLocalDeadlines } from './useLocalDeadlines';
import { useCloudDeadlines } from './useCloudDeadlines';

export function useDeadlines() {
    const { mode } = useAuth();
    const localDeadlines = useLocalDeadlines();
    const cloudDeadlines = useCloudDeadlines();

    if (mode === 'local') {
        return localDeadlines;
    } else {
        // Cloud mode might have missing features initially (like stats), but typed interfaces match
        return {
            ...cloudDeadlines,
            // Fallback for missing calculated stats in cloud hook if needed
            // But for now assuming Cloud Hook returns defaults where logic is missing
        };
    }
}
