import { render, screen } from '@testing-library/react';
import { TasksPage } from './TasksPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: () => ({
    mutate: vi.fn(),
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Import useQuery to mock return values
import { useQuery } from '@tanstack/react-query';
import { type Mock } from 'vitest';

describe('TasksPage', () => {
  const mockDeadlines = [
    {
      id: 'd1',
      title: 'Project Alpha',
      deadline_at: '2023-12-31T23:59:59Z',
      user_id: 'test-user-id',
    },
    {
      id: 'd2',
      title: 'Project Beta',
      deadline_at: '2024-01-15T23:59:59Z',
      user_id: 'test-user-id',
    },
  ];

  const mockSubtasks = [
    {
      id: 's1',
      title: 'Task 1 for Alpha',
      completed: false,
      deadline_id: 'd1',
      user_id: 'test-user-id',
      created_at: '2023-01-01T00:00:00Z',
    },
    {
      id: 's2',
      title: 'Task 2 for Alpha',
      completed: true, // Completed
      deadline_id: 'd1',
      user_id: 'test-user-id',
      created_at: '2023-01-02T00:00:00Z',
    },
    {
      id: 's3',
      title: 'Task 1 for Beta',
      completed: false,
      deadline_id: 'd2',
      user_id: 'test-user-id',
      created_at: '2023-01-03T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with grouped tasks', () => {
    // Mock useQuery implementation
    (useQuery as Mock).mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === 'deadlines') {
        return { data: mockDeadlines };
      }
      if (queryKey[0] === 'all-subtasks') {
        return { data: mockSubtasks };
      }
      return { data: [] };
    });

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    // Check header
    expect(screen.getByText('Mis Tareas')).toBeInTheDocument();

    // Check counts: 2 pending, 1 completed
    expect(screen.getByText(/2 pendientes/)).toBeInTheDocument();
    expect(screen.getByText(/1 completadas/)).toBeInTheDocument();

    // Check Deadlines
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();

    // Check Pending Tasks
    expect(screen.getByText('Task 1 for Alpha')).toBeInTheDocument();
    expect(screen.getByText('Task 1 for Beta')).toBeInTheDocument();

    // Check Completed Tasks (should be in separate section)
    const completedSectionHeader = screen.getByText(/Completadas \(1\)/);
    expect(completedSectionHeader).toBeInTheDocument();
    expect(screen.getByText('Task 2 for Alpha')).toBeInTheDocument();
  });
});
