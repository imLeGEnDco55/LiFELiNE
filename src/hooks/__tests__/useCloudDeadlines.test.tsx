import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Define mocks using vi.hoisted
const { mockSupabase, mockBuilder } = vi.hoisted(() => {
  const mockBuilder = {
    then: (resolve: (val: unknown) => void) => resolve({ data: [], error: null }),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
  };

  // We set return values here initially
  mockBuilder.select.mockReturnValue(mockBuilder);
  mockBuilder.insert.mockReturnValue(mockBuilder);
  mockBuilder.update.mockReturnValue(mockBuilder);
  mockBuilder.delete.mockReturnValue(mockBuilder);
  mockBuilder.eq.mockReturnValue(mockBuilder);
  mockBuilder.order.mockReturnValue(mockBuilder);
  mockBuilder.single.mockResolvedValue({ data: { id: 'test-id' }, error: null });

  const mockSupabase = {
    from: vi.fn().mockReturnValue(mockBuilder),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    }),
    removeChannel: vi.fn(),
  };

  return { mockSupabase, mockBuilder };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

import { useCloudDeadlines } from '../useCloudDeadlines';

describe('useCloudDeadlines Security Checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset implementations to ensure return values are correct
    mockBuilder.select.mockReturnValue(mockBuilder);
    mockBuilder.insert.mockReturnValue(mockBuilder);
    mockBuilder.update.mockReturnValue(mockBuilder);
    mockBuilder.delete.mockReturnValue(mockBuilder);
    mockBuilder.eq.mockReturnValue(mockBuilder);
    mockBuilder.order.mockReturnValue(mockBuilder);
    mockBuilder.single.mockResolvedValue({ data: { id: 'test-id' }, error: null });

    mockSupabase.from.mockReturnValue(mockBuilder);
  });

  it('updateDeadline sanitizes input and checks user_id', async () => {
    const { result } = renderHook(() => useCloudDeadlines());

    await act(async () => {
      try {
        // Pass unsafe fields and fields that should be updated
        await result.current.updateDeadline('deadline-123', {
          title: 'New Title',
        // @ts-expect-error - simulating malicious input
          user_id: 'malicious-user-id',
        // @ts-expect-error - simulating malicious input
          id: 'malicious-id',
        // @ts-expect-error - simulating malicious input
          created_at: '2020-01-01',
        });
      } catch (e) {
        console.error('Error in updateDeadline:', e);
      }
    });

    // Verify 'update' was called with sanitized data
    expect(mockSupabase.from).toHaveBeenCalledWith('deadlines');
    expect(mockBuilder.update).toHaveBeenCalledWith({
      title: 'New Title',
    });

    // Verify 'eq' was called for both id and user_id
    expect(mockBuilder.eq).toHaveBeenCalledWith('id', 'deadline-123');
    expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
  });

  it('deleteDeadline checks user_id', async () => {
    const { result } = renderHook(() => useCloudDeadlines());

    await act(async () => {
      await result.current.deleteDeadline('deadline-123');
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('deadlines');
    expect(mockBuilder.delete).toHaveBeenCalled();
    expect(mockBuilder.eq).toHaveBeenCalledWith('id', 'deadline-123');
    expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
  });
});
