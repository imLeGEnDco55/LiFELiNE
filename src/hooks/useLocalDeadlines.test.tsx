import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalDeadlines } from './useLocalDeadlines';

describe('useLocalDeadlines', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should manage deadlines and parent-child relationships correctly', () => {
    const { result } = renderHook(() => useLocalDeadlines());

    // Create parent
    let parent: { id: string } | undefined;
    act(() => {
      parent = result.current.createDeadline({
        title: 'Parent Task',
        description: 'Parent Description',
        deadline_at: new Date().toISOString(),
        priority: 'medium',
        category_id: null,
      });
    });

    if (!parent) throw new Error('Parent not created');

    expect(parent).toBeDefined();
    expect(result.current.deadlines.length).toBe(1);

    // Create child
    let child: { id: string } | undefined;
    act(() => {
      child = result.current.createDeadline({
        title: 'Child Task',
        description: 'Child Description',
        deadline_at: new Date().toISOString(),
        priority: 'medium',
        category_id: null,
        parent_id: parent!.id,
      });
    });

    if (!child) throw new Error('Child not created');

    expect(result.current.deadlines.length).toBe(2);

    // Verify getChildDeadlines
    const children = result.current.getChildDeadlines(parent.id);
    expect(children.length).toBe(1);
    expect(children[0].id).toBe(child.id);

    // Verify getRootDeadlines
    const roots = result.current.getRootDeadlines();
    expect(roots.length).toBe(1);
    expect(roots[0].id).toBe(parent.id);

    // Verify canCompleteDeadline (should be true as child is not completed but logic might differ)
    // Actually logic is: if children exist, all must be completed.
    expect(result.current.canCompleteDeadline(parent.id)).toBe(false);

    // Complete child
    act(() => {
      result.current.completeDeadline(child!.id);
    });

    // Refresh result reference if needed, but in renderHook result.current proxy handles it.
    // However, createDeadline/completeDeadline updates state asynchronously?
    // Act handles state updates.

    // Check if child is completed
    const updatedChild = result.current.deadlines.find((d) => d.id === child!.id);
    expect(updatedChild?.completed_at).not.toBeNull();

    // Now parent should be completable
    // Note: canCompleteDeadline checks current state.
    expect(result.current.canCompleteDeadline(parent.id)).toBe(true);
  });
});
