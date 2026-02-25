import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';
import { vi, describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Deadline, Subtask, Category } from '@/types/deadline';

// Mock dependencies
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com', user_metadata: { display_name: 'Test User' } },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockDeadlines: Deadline[] = [
  {
    id: '1',
    user_id: 'test-user',
    title: 'Urgent Deadline',
    description: null,
    deadline_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour from now
    priority: 'high',
    category_id: 'work',
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
  },
  {
    id: '2',
    user_id: 'test-user',
    title: 'Later Deadline',
    description: null,
    deadline_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days from now
    priority: 'medium',
    category_id: 'personal',
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
  },
  {
      id: '3',
      user_id: 'test-user',
      title: 'Completed Deadline',
      description: null,
      deadline_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      priority: 'low',
      category_id: 'work',
      parent_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
  }
];

const mockSubtasksMap: Record<string, Subtask[]> = {
  '1': [
    {
      id: 's1',
      deadline_id: '1',
      user_id: 'test-user',
      title: 'Subtask 1',
      completed: false,
      order_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

const mockCategories: Category[] = [
  { id: 'work', name: 'Trabajo', color: 'red' },
  { id: 'personal', name: 'Personal', color: 'blue' },
];

vi.mock('@/hooks/useDeadlines', () => ({
  useDeadlines: () => ({
    deadlines: mockDeadlines,
    subtasksMap: mockSubtasksMap,
    categories: mockCategories,
    toggleSubtask: vi.fn(),
  }),
}));

vi.mock('@/components/vitality/ResuscitationEffect', () => ({
  ResuscitationEffect: () => <div data-testid="resuscitation-effect" />,
}));

// Mock HomeFilters to bypass Radix UI complexity
vi.mock('@/components/home/HomeFilters', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HomeFilters: ({ setFilter, setSelectedCategory }: any) => (
    <div>
      <button onClick={() => setFilter('urgent')}>Filter Urgent</button>
      <button onClick={() => setSelectedCategory('work')}>Filter Work</button>
    </div>
  ),
}));

describe('HomePage', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText('Urgent Deadline')).toBeInTheDocument();
    expect(screen.getByText('Later Deadline')).toBeInTheDocument();
  });

  it('filters by urgency', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Click mock filter button
    fireEvent.click(screen.getByText('Filter Urgent'));

    // Check that only urgent deadline is shown
    expect(screen.getByText('Urgent Deadline')).toBeInTheDocument();
    expect(screen.queryByText('Later Deadline')).not.toBeInTheDocument();
  });

  it('filters by category', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Click mock category button
    fireEvent.click(screen.getByText('Filter Work'));

    expect(screen.getByText('Urgent Deadline')).toBeInTheDocument(); // Work
    expect(screen.queryByText('Later Deadline')).not.toBeInTheDocument(); // Personal
  });
});
