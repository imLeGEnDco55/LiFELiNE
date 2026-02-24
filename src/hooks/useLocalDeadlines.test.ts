import { renderHook, act } from '@testing-library/react';
import { useLocalDeadlines } from './useLocalDeadlines';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useLocalDeadlines', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return deadlines sorted by deadline_at', () => {
    const { result } = renderHook(() => useLocalDeadlines());

    // Create unordered deadlines
    // Note: createDeadline updates state, so we wrap in act
    act(() => {
      // Date: 2023-10-15
      result.current.createDeadline({
        title: 'Middle',
        priority: 'medium',
        deadline_at: '2023-10-15T12:00:00.000Z',
        category_id: null,
        description: null,
      });
      // Date: 2023-12-01 (Later)
      result.current.createDeadline({
        title: 'Last',
        priority: 'medium',
        deadline_at: '2023-12-01T12:00:00.000Z',
        category_id: null,
        description: null,
      });
      // Date: 2023-01-01 (Earlier)
      result.current.createDeadline({
        title: 'First',
        priority: 'medium',
        deadline_at: '2023-01-01T12:00:00.000Z',
        category_id: null,
        description: null,
      });
    });

    const deadlines = result.current.deadlines;
    expect(deadlines).toHaveLength(3);

    // Check order
    expect(deadlines[0].title).toBe('First');
    expect(deadlines[1].title).toBe('Middle');
    expect(deadlines[2].title).toBe('Last');

    // Verify deadline_at strings are sorted
    expect(deadlines[0].deadline_at < deadlines[1].deadline_at).toBe(true);
    expect(deadlines[1].deadline_at < deadlines[2].deadline_at).toBe(true);
  });
});
