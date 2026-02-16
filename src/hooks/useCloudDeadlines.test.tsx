import { renderHook, act } from '@testing-library/react';
import { useCloudDeadlines } from './useCloudDeadlines';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from: vi.fn(() => {
        const chain = {
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        };
        // Bind methods so 'this' works correctly if needed, though mockReturnThis handles it
        return chain;
      }),
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      })),
      removeChannel: vi.fn(),
    }
  };
});

vi.mock('@/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

describe('useCloudDeadlines Security Checks', () => {
  const mockUser = { id: 'test-user-id' };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ user: mockUser });
  });

  it('updateDeadline should include user_id filter', async () => {
    const { result } = renderHook(() => useCloudDeadlines());

    // Clear initial fetch calls
    vi.clearAllMocks();

    await act(async () => {
      await result.current.updateDeadline('deadline-123', { title: 'New Title' });
    });

    // Find the call corresponding to update
    const fromMock = supabase.from as unknown as ReturnType<typeof vi.fn>;

    // There should be exactly one call to .from('deadlines') for the update
    // (Assuming initial fetch happened before clearAllMocks)

    // Actually, renderHook triggers useEffect which calls fetchData.
    // If I clearAllMocks inside test, I might miss things if they are async/parallel.
    // But updateDeadline is explicit.

    // Let's filter calls to find the one for 'deadlines' that called 'update'
    const calls = fromMock.mock.results;
    const updateCall = calls.find(call => {
        const chain = call.value;
        return chain.update.mock.calls.length > 0;
    });

    expect(updateCall).toBeDefined();
    const chain = updateCall?.value;

    expect(chain.update).toHaveBeenCalledWith({ title: 'New Title' });

    // Now check eq calls on THIS chain
    expect(chain.eq).toHaveBeenCalledWith('user_id', mockUser.id);
  });

  it('deleteDeadline should include user_id filter', async () => {
    const { result } = renderHook(() => useCloudDeadlines());
    vi.clearAllMocks();

    await act(async () => {
      await result.current.deleteDeadline('deadline-123');
    });

    const fromMock = supabase.from as unknown as ReturnType<typeof vi.fn>;
    const calls = fromMock.mock.results;
    const deleteCall = calls.find(call => {
        const chain = call.value;
        return chain.delete.mock.calls.length > 0;
    });

    expect(deleteCall).toBeDefined();
    const chain = deleteCall?.value;

    expect(chain.eq).toHaveBeenCalledWith('user_id', mockUser.id);
  });
});
