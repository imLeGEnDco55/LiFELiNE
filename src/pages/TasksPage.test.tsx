/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TasksPage } from './TasksPage';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Mock all external hooks and modules
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    header: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <header className={className} {...props}>
        {children}
      </header>
    ),
  },
}));

describe('TasksPage', () => {
  const mockNavigate = vi.fn();
  const mockQueryClient = { invalidateQueries: vi.fn() };

  const mockUser = { id: 'test-user-id' };

  const mockDeadlines = [
    { id: 'd1', title: 'Deadline 1', deadline_at: '2024-12-31T23:59:59Z', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', user_id: 'test-user-id', priority: 'medium', category_id: null, description: null, parent_id: null, completed_at: null },
    { id: 'd2', title: 'Deadline 2', deadline_at: '2024-12-30T23:59:59Z', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', user_id: 'test-user-id', priority: 'high', category_id: null, description: null, parent_id: null, completed_at: null },
  ];

  const mockSubtasks = [
    { id: 's1', deadline_id: 'd1', title: 'Subtask 1.1', completed: false, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z', user_id: 'test-user-id', order_index: 0 },
    { id: 's2', deadline_id: 'd1', title: 'Subtask 1.2', completed: true, created_at: '2024-01-02T10:00:00Z', updated_at: '2024-01-02T10:00:00Z', user_id: 'test-user-id', order_index: 1 },
    { id: 's3', deadline_id: 'd2', title: 'Subtask 2.1', completed: false, created_at: '2024-01-03T10:00:00Z', updated_at: '2024-01-03T10:00:00Z', user_id: 'test-user-id', order_index: 0 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient as any);
    vi.mocked(useMutation).mockReturnValue({ mutate: vi.fn() } as any);
  });

  it('renders loading state initially (empty lists)', () => {
    vi.mocked(useQuery).mockImplementation(({ queryKey }: { queryKey: readonly unknown[] }) => {
       if (queryKey[0] === 'deadlines') return { data: undefined, isLoading: true } as any;
       if (queryKey[0] === 'all-subtasks') return { data: undefined, isLoading: true } as any;
       return { data: undefined } as any;
    });

    render(<TasksPage />);
    expect(screen.getByText(/0 pendientes/)).toBeInTheDocument();
  });

  it('renders tasks grouped by deadline', () => {
    vi.mocked(useQuery).mockImplementation(({ queryKey }: { queryKey: readonly unknown[] }) => {
       if (queryKey[0] === 'deadlines') return { data: mockDeadlines } as any;
       if (queryKey[0] === 'all-subtasks') return { data: mockSubtasks } as any;
       return { data: [] } as any;
    });

    render(<TasksPage />);

    expect(screen.getByText('Deadline 1')).toBeInTheDocument();
    expect(screen.getByText('Deadline 2')).toBeInTheDocument();

    expect(screen.getByText('Subtask 1.1')).toBeInTheDocument();
    expect(screen.getByText('Subtask 2.1')).toBeInTheDocument();

    // Subtask 1.2 is completed, should be in completed section
    expect(screen.getByText('Subtask 1.2')).toBeInTheDocument();
  });

  it('displays correct counts', () => {
    vi.mocked(useQuery).mockImplementation(({ queryKey }: { queryKey: readonly unknown[] }) => {
       if (queryKey[0] === 'deadlines') return { data: mockDeadlines } as any;
       if (queryKey[0] === 'all-subtasks') return { data: mockSubtasks } as any;
       return { data: [] } as any;
    });

    render(<TasksPage />);

    // 2 pending (s1, s3), 1 completed (s2)
    expect(screen.getByText(/2 pendientes/)).toBeInTheDocument();
    expect(screen.getByText(/1 completadas/)).toBeInTheDocument();
  });
});
