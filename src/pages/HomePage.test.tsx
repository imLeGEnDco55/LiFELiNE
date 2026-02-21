import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';
import { vi, describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user', user_metadata: { display_name: 'Test User' } },
  }),
}));

vi.mock('@/hooks/useDeadlines', () => ({
  useDeadlines: () => ({
    deadlines: [
      {
        id: '1',
        title: 'Urgent Deadline',
        deadline_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour from now
        completed_at: null,
        category_id: 'work',
      },
      {
        id: '2',
        title: 'Future Deadline',
        deadline_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
        completed_at: null,
        category_id: 'personal',
      },
      {
        id: '3',
        title: 'Far Future Deadline',
        deadline_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days from now
        completed_at: null,
        category_id: 'work',
      }
    ],
    subtasksMap: {
      '1': [{ id: 's1', title: 'Subtask 1', completed: false, deadline_id: '1' }],
    },
    categories: [
      { id: 'work', name: 'Work', color: 'blue' },
      { id: 'personal', name: 'Personal', color: 'green' },
    ],
    toggleSubtask: vi.fn(),
  }),
}));

vi.mock('@/components/vitality/ResuscitationEffect', () => ({
  ResuscitationEffect: () => <div data-testid="resuscitation-effect" />,
}));

// Mock child components that might use complicated logic or animations
vi.mock('@/components/home/HomeFilters', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HomeFilters: ({ filter, setFilter, selectedCategory, setSelectedCategory, categories }: any) => (
    <div data-testid="home-filters">
      <button onClick={() => setFilter('urgent')}>Filter Urgent</button>
      <button onClick={() => setFilter('all')}>Filter All</button>
      <button onClick={() => setSelectedCategory('work')}>Filter Work</button>
      <button onClick={() => setSelectedCategory(null)}>Clear Category</button>
    </div>
  ),
}));

vi.mock('@/components/home/DeadlinesList', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DeadlinesList: ({ deadlines }: any) => (
    <div data-testid="deadlines-list">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {deadlines.map((d: any) => (
        <div key={d.id} data-testid={`deadline-${d.id}`}>{d.title}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/home/SubtasksList', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SubtasksList: ({ subtasksMap }: any) => (
    <div data-testid="subtasks-list">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {Object.values(subtasksMap).flat().map((s: any) => (
        <div key={s.id} data-testid={`subtask-${s.id}`}>{s.title}</div>
      ))}
    </div>
  ),
}));


describe('HomePage', () => {
  it('renders deadlines correctly', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Urgent Deadline')).toBeInTheDocument();
    expect(screen.getByText('Future Deadline')).toBeInTheDocument();
    expect(screen.getByText('Far Future Deadline')).toBeInTheDocument();
  });

  it('filters deadlines when filter is changed', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Initial state: all deadlines visible
    expect(screen.getByText('Urgent Deadline')).toBeInTheDocument();
    expect(screen.getByText('Far Future Deadline')).toBeInTheDocument();

    // Change filter to 'urgent'
    fireEvent.click(screen.getByText('Filter Urgent'));

    // Only urgent deadline should be visible
    expect(screen.getByText('Urgent Deadline')).toBeInTheDocument();
    expect(screen.queryByText('Far Future Deadline')).not.toBeInTheDocument();
  });

  it('filters deadlines when category is selected', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Initial state: all deadlines visible
    expect(screen.getByText('Urgent Deadline')).toBeInTheDocument(); // work
    expect(screen.getByText('Future Deadline')).toBeInTheDocument(); // personal

    // Select 'work' category
    fireEvent.click(screen.getByText('Filter Work'));

    // Only work deadlines should be visible
    expect(screen.getByText('Urgent Deadline')).toBeInTheDocument();
    expect(screen.queryByText('Future Deadline')).not.toBeInTheDocument();
  });
});
