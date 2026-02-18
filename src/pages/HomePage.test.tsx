import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock the hooks
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
  }),
}));

vi.mock('@/hooks/useDeadlines', () => ({
  useDeadlines: () => ({
    deadlines: [],
    subtasksMap: {},
    categories: [],
    toggleSubtask: vi.fn(),
    focusSessions: [], // Added
    streakStats: { currentStreak: 0 }, // Added
  }),
}));

describe('HomePage', () => {
  it('renders the create deadline button with accessible label', () => {
    render(
      <BrowserRouter>
        <TooltipProvider>
          <HomePage />
        </TooltipProvider>
      </BrowserRouter>
    );

    // This should initially fail because the aria-label is missing
    const createButton = screen.getByRole('button', { name: /crear nuevo deadline/i });
    expect(createButton).toBeInTheDocument();
  });
});
