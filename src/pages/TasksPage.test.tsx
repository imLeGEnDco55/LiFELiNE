import { render, screen } from '@testing-library/react';
import { TasksPage } from './TasksPage';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { useQuery } from '@tanstack/react-query';

// Mocks
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: () => ({ mutate: vi.fn() }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          is: () => ({
            order: () => Promise.resolve({ data: [] }),
          }),
        }),
      }),
    }),
  },
}));

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pending and completed tasks correctly', () => {
    const mockDeadlines = [
      { id: 'd1', title: 'Deadline 1', deadline_at: '2023-12-31T00:00:00Z', user_id: 'test-user' },
    ];
    const mockSubtasks = [
      { id: 's1', title: 'Pending Task', completed: false, deadline_id: 'd1', user_id: 'test-user' },
      { id: 's2', title: 'Completed Task', completed: true, deadline_id: 'd1', user_id: 'test-user' },
    ];

    (useQuery as Mock).mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === 'deadlines') return { data: mockDeadlines };
      if (queryKey[0] === 'all-subtasks') return { data: mockSubtasks };
      return { data: [] };
    });

    render(<TasksPage />);

    // Header stats
    expect(screen.getByText(/1 pendientes/)).toBeInTheDocument();
    expect(screen.getByText(/1 completadas/)).toBeInTheDocument();

    // Pending list
    expect(screen.getByText('Deadline 1')).toBeInTheDocument();
    expect(screen.getByText('Pending Task')).toBeInTheDocument();

    // Completed list
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  it('renders empty state when no pending tasks', () => {
     const mockDeadlines = [
      { id: 'd1', title: 'Deadline 1', deadline_at: '2023-12-31T00:00:00Z', user_id: 'test-user' },
    ];
    const mockSubtasks = [
      { id: 's2', title: 'Completed Task', completed: true, deadline_id: 'd1', user_id: 'test-user' },
    ];

    (useQuery as Mock).mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === 'deadlines') return { data: mockDeadlines };
      if (queryKey[0] === 'all-subtasks') return { data: mockSubtasks };
      return { data: [] };
    });

    render(<TasksPage />);

    expect(screen.getByText('¡Todo listo!')).toBeInTheDocument();
    expect(screen.getByText('No tienes tareas pendientes')).toBeInTheDocument();
  });
});
