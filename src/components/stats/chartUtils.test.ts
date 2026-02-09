import { describe, it, expect } from 'vitest';
import { calculateChartData } from './chartUtils';
import { Deadline, FocusSession } from '@/types/deadline';

describe('calculateChartData', () => {
  const mockWeekStart = new Date('2023-10-23T00:00:00Z'); // A Monday
  const mockToday = new Date('2023-10-25T12:00:00Z'); // A Wednesday

  it('should return 7 days of empty data when inputs are empty', () => {
    const result = calculateChartData([], [], mockWeekStart, mockToday);
    expect(result).toHaveLength(7);
    expect(result[0].day).toBe('lun'); // Monday in Spanish
    expect(result.every(d => d.deadlines === 0 && d.focus === 0)).toBe(true);
  });

  it('should correctly count deadlines within the week', () => {
    const deadlines: Deadline[] = [
      {
        id: '1',
        title: 'Task 1',
        completed_at: '2023-10-23T10:00:00Z', // Monday (index 0)
        user_id: 'u1',
        deadline_at: '2023-10-23T00:00:00Z',
        created_at: '2023-10-20T00:00:00Z',
        updated_at: '2023-10-20T00:00:00Z',
        category_id: null,
        description: null,
        parent_id: null,
        priority: 'medium'
      },
      {
        id: '2',
        title: 'Task 2',
        completed_at: '2023-10-25T15:00:00Z', // Wednesday (index 2)
        user_id: 'u1',
        deadline_at: '2023-10-25T00:00:00Z',
        created_at: '2023-10-20T00:00:00Z',
        updated_at: '2023-10-20T00:00:00Z',
        category_id: null,
        description: null,
        parent_id: null,
        priority: 'medium'
      },
      {
        id: '3',
        title: 'Task 3', // Outside week (previous Sunday)
        completed_at: '2023-10-22T23:00:00Z',
        user_id: 'u1',
        deadline_at: '2023-10-22T00:00:00Z',
        created_at: '2023-10-20T00:00:00Z',
        updated_at: '2023-10-20T00:00:00Z',
        category_id: null,
        description: null,
        parent_id: null,
        priority: 'medium'
      },
       {
        id: '4',
        title: 'Task 4', // Not completed
        completed_at: null,
        user_id: 'u1',
        deadline_at: '2023-10-25T00:00:00Z',
        created_at: '2023-10-20T00:00:00Z',
        updated_at: '2023-10-20T00:00:00Z',
        category_id: null,
        description: null,
        parent_id: null,
        priority: 'medium'
      }
    ];

    const result = calculateChartData(deadlines, [], mockWeekStart, mockToday);

    expect(result[0].deadlines).toBe(1); // Monday
    expect(result[2].deadlines).toBe(1); // Wednesday
    expect(result[1].deadlines).toBe(0); // Tuesday
    expect(result.reduce((acc, curr) => acc + curr.deadlines, 0)).toBe(2);
  });

  it('should correctly sum focus session durations and convert to pomodoros', () => {
    const sessions: FocusSession[] = [
      {
        id: 's1',
        user_id: 'u1',
        session_type: 'work',
        started_at: '2023-10-23T09:00:00Z', // Monday
        duration_minutes: 25,
        completed_at: '2023-10-23T09:25:00Z'
      },
      {
        id: 's2',
        user_id: 'u1',
        session_type: 'work',
        started_at: '2023-10-23T10:00:00Z', // Monday
        duration_minutes: 25,
        completed_at: '2023-10-23T10:25:00Z'
      },
      {
        id: 's3',
        user_id: 'u1',
        session_type: 'break', // Should be ignored
        started_at: '2023-10-23T09:25:00Z',
        duration_minutes: 5,
        completed_at: '2023-10-23T09:30:00Z'
      },
      {
        id: 's4',
        user_id: 'u1',
        session_type: 'work',
        started_at: '2023-10-24T10:00:00Z', // Tuesday
        duration_minutes: 50, // 2 pomodoros
        completed_at: '2023-10-24T10:50:00Z'
      }
    ];

    const result = calculateChartData([], sessions, mockWeekStart, mockToday);

    expect(result[0].focus).toBe(2); // Monday: 50 mins -> 2 pomodoros
    expect(result[1].focus).toBe(2); // Tuesday: 50 mins -> 2 pomodoros
    expect(result[2].focus).toBe(0); // Wednesday
  });

  it('should correctly identify today', () => {
    // mockToday is Wednesday 2023-10-25
    const result = calculateChartData([], [], mockWeekStart, mockToday);

    expect(result[2].isToday).toBe(true); // Wednesday index
    expect(result[0].isToday).toBe(false);
  });
});
