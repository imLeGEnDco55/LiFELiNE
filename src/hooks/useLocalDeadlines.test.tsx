import { renderHook, act } from '@testing-library/react';
import { useLocalDeadlines } from './useLocalDeadlines';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock local storage to ensure clean state
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalDeadlines', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return deadlines sorted by date (earliest first)', () => {
    const { result } = renderHook(() => useLocalDeadlines());

    act(() => {
      // Create a later deadline first
      result.current.createDeadline({
        title: 'Later Deadline',
        deadline_at: '2023-01-02T10:00:00.000Z',
        priority: 'high',
        category_id: null,
      });
    });

    act(() => {
      // Create an earlier deadline second
      result.current.createDeadline({
        title: 'Earlier Deadline',
        deadline_at: '2023-01-01T10:00:00.000Z',
        priority: 'high',
        category_id: null,
      });
    });

    // Verify sorting
    expect(result.current.deadlines).toHaveLength(2);
    expect(result.current.deadlines[0].title).toBe('Earlier Deadline');
    expect(result.current.deadlines[0].deadline_at).toBe('2023-01-01T10:00:00.000Z');
    expect(result.current.deadlines[1].title).toBe('Later Deadline');
    expect(result.current.deadlines[1].deadline_at).toBe('2023-01-02T10:00:00.000Z');
  });

  it('should maintain sorted order after updates', () => {
    const { result } = renderHook(() => useLocalDeadlines());

    act(() => {
        result.current.createDeadline({
            title: 'Task A',
            deadline_at: '2023-01-02T10:00:00.000Z',
            priority: 'medium',
            category_id: null
        });
    });

    act(() => {
        result.current.createDeadline({
            title: 'Task B',
            deadline_at: '2023-01-03T10:00:00.000Z', // Latest
            priority: 'medium',
            category_id: null
        });
    });

    const taskBId = result.current.deadlines[1].id;

    // Update Task B to be the earliest
    act(() => {
        result.current.updateDeadline(taskBId, {
            deadline_at: '2023-01-01T10:00:00.000Z'
        });
    });

    expect(result.current.deadlines[0].title).toBe('Task B');
    expect(result.current.deadlines[1].title).toBe('Task A');
  });
});
