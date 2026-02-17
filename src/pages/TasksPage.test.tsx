import { render, screen, waitFor } from '@testing-library/react';
import { TasksPage } from './TasksPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock React Query
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockUseQueryClient = vi.fn();

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: any) => mockUseQuery(options),
  useMutation: (options: any) => mockUseMutation(options),
  useQueryClient: () => mockUseQueryClient,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue({ mutate: vi.fn() });
    mockUseQueryClient.mockReturnValue({ invalidateQueries: vi.fn() });
  });

  it('renders grouped tasks correctly', () => {
    const deadlines = [
      { id: 'd1', title: 'Project A', deadline_at: '2023-12-01T10:00:00Z', user_id: 'test-user' },
      { id: 'd2', title: 'Project B', deadline_at: '2023-12-05T10:00:00Z', user_id: 'test-user' },
    ];
    const subtasks = [
      { id: 's1', title: 'Task A1', completed: false, deadline_id: 'd1', user_id: 'test-user' },
      { id: 's2', title: 'Task A2', completed: true, deadline_id: 'd1', user_id: 'test-user' },
      { id: 's3', title: 'Task B1', completed: false, deadline_id: 'd2', user_id: 'test-user' },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: any[] }) => {
      if (queryKey[0] === 'deadlines') return { data: deadlines };
      if (queryKey[0] === 'all-subtasks') return { data: subtasks };
      return { data: [] };
    });

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    // Header
    expect(screen.getByText('Mis Tareas')).toBeInTheDocument();
    // 2 pending, 1 completed. Using regex to match partially as the text structure is "X pendientes · Y completadas"
    expect(screen.getByText(/2 pendientes/)).toBeInTheDocument();
    expect(screen.getByText(/1 completadas/)).toBeInTheDocument();

    // Deadlines
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();

    // Tasks
    expect(screen.getByText('Task A1')).toBeInTheDocument();
    expect(screen.getByText('Task B1')).toBeInTheDocument();

    // Completed task should be at the bottom list
    // Since completed tasks are rendered differently (opacity-60), we check presence
    expect(screen.getByText('Completadas (1)')).toBeInTheDocument();
    expect(screen.getByText('Task A2')).toBeInTheDocument();
  });

  it('renders "no tasks" message when all done', () => {
    const deadlines = [
      { id: 'd1', title: 'Project A', deadline_at: '2023-12-01T10:00:00Z', user_id: 'test-user' },
    ];
    const subtasks = [
      { id: 's2', title: 'Task A2', completed: true, deadline_id: 'd1', user_id: 'test-user' },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: any[] }) => {
      if (queryKey[0] === 'deadlines') return { data: deadlines };
      if (queryKey[0] === 'all-subtasks') return { data: subtasks };
      return { data: [] };
    });

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    expect(screen.getByText('¡Todo listo!')).toBeInTheDocument();
    expect(screen.getByText('No tienes tareas pendientes')).toBeInTheDocument();
    expect(screen.getByText(/0 pendientes/)).toBeInTheDocument();
    expect(screen.getByText(/1 completadas/)).toBeInTheDocument();
  });
});
