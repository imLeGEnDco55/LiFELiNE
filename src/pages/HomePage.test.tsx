/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';
import { useAuth } from '@/providers/AuthProvider';
import { useDeadlines } from '@/hooks/useDeadlines';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mocks
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useDeadlines', () => ({
  useDeadlines: vi.fn(),
}));

// Mock child components to verify props
vi.mock('@/components/vitality/ResuscitationEffect', () => ({
  ResuscitationEffect: () => <div data-testid="resuscitation-effect" />,
}));

vi.mock('@/components/home/HomeFilters', () => ({
  HomeFilters: ({ setFilter, filter }: any) => (
    <div data-testid="home-filters">
        Current: {filter}
        <button onClick={() => setFilter('urgent')}>Set Urgent</button>
        <button onClick={() => setFilter('all')}>Set All</button>
    </div>
  ),
}));

vi.mock('@/components/home/DeadlinesList', () => ({
  DeadlinesList: ({ deadlines }: any) => (
    <div data-testid="deadlines-list">
      Count: {deadlines.length}
      {deadlines.map((d: any) => <div key={d.id}>{d.title}</div>)}
    </div>
  ),
}));

vi.mock('@/components/home/SubtasksList', () => ({
  SubtasksList: () => <div data-testid="subtasks-list" />,
}));

// Mock generic UI components to simplify rendering
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => <div data-testid="tabs" onClick={() => onValueChange && onValueChange('subtasks')}>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children, value }: any) => <div>{children}</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children }: any) => <header>{children}</header>,
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

describe('HomePage', () => {
  const now = Date.now();
  const mockDeadlines = [
    { id: '1', title: 'Task Future', deadline_at: new Date(now + 200000000).toISOString(), completed_at: null }, // > 2 days
    { id: '2', title: 'Task Past', deadline_at: new Date(now - 1000).toISOString(), completed_at: null }, // Past
    { id: '3', title: 'Task Urgent', deadline_at: new Date(now + 3600000).toISOString(), completed_at: null }, // 1 hour
  ];

  beforeEach(() => {
    (useAuth as any).mockReturnValue({ user: { email: 'test@example.com' } });
    (useDeadlines as any).mockReturnValue({
      deadlines: mockDeadlines,
      subtasksMap: {},
      categories: [],
      toggleSubtask: vi.fn(),
    });
  });

  it('renders correctly', () => {
    render(<HomePage />);
    expect(screen.getByText(/Buenos/)).toBeInTheDocument();
    expect(screen.getByTestId('deadlines-list')).toBeInTheDocument();
  });

  it('filters deadlines correctly when switching to urgent', () => {
    render(<HomePage />);

    // Default: All 3 tasks
    expect(screen.getByTestId('deadlines-list')).toHaveTextContent(`Count: 3`);

    // Click Urgent
    const urgentBtn = screen.getByText('Set Urgent');
    fireEvent.click(urgentBtn);

    expect(screen.getByTestId('deadlines-list')).toHaveTextContent(`Count: 2`);
    expect(screen.queryByText('Task Future')).not.toBeInTheDocument();
    expect(screen.getByText('Task Past')).toBeInTheDocument();
    expect(screen.getByText('Task Urgent')).toBeInTheDocument();
  });
});
