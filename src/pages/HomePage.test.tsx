import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';
import { MemoryRouter } from 'react-router-dom';

// Mocks
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useDeadlines', () => ({
  useDeadlines: vi.fn(),
}));

vi.mock('@/hooks/useVitality', () => ({
  useVitality: vi.fn(),
}));

vi.mock('@/hooks/useFeedback', () => ({
  useFeedback: vi.fn(),
}));

// Import the mocked modules to set return values
import { useAuth } from '@/providers/AuthProvider';
import { useDeadlines } from '@/hooks/useDeadlines';
import { useVitality } from '@/hooks/useVitality';
import { useFeedback } from '@/hooks/useFeedback';

describe('HomePage', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: { display_name: 'Test User' },
  };

  const mockDeadlines = [
    {
      id: 'd1',
      title: 'Urgent Task',
      deadline_at: new Date(Date.now() + 3600000).toISOString(), // +1 hour
      category_id: 'work',
      completed_at: null,
    },
    {
      id: 'd2',
      title: 'Future Task',
      deadline_at: new Date(Date.now() + 86400000 * 10).toISOString(), // +10 days
      category_id: 'personal',
      completed_at: null,
    },
  ];

  const mockSubtasksMap = {
    'd1': [],
    'd2': [],
  };

  const mockCategories = [
    { id: 'work', name: 'Work', color: 'blue' },
    { id: 'personal', name: 'Personal', color: 'green' },
  ];

  beforeEach(() => {
    (useAuth as Mock).mockReturnValue({
      user: mockUser,
    });
    (useDeadlines as Mock).mockReturnValue({
      deadlines: mockDeadlines,
      subtasksMap: mockSubtasksMap,
      categories: mockCategories,
      toggleSubtask: vi.fn(),
    });
    (useVitality as Mock).mockReturnValue({
      state: 'vital',
    });
    (useFeedback as Mock).mockReturnValue({
      successFeedback: vi.fn(),
    });
  });

  it('renders deadlines correctly', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Urgent Task')).toBeInTheDocument();
    expect(screen.getByText('Future Task')).toBeInTheDocument();
  });
});
