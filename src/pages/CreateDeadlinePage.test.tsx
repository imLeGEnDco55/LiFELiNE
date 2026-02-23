import { render, screen } from '@testing-library/react';
import { CreateDeadlinePage } from './CreateDeadlinePage';
import { vi, describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DEFAULT_CATEGORIES } from '@/types/deadline';

// Mock hooks
vi.mock('@/hooks/useDeadlines', () => ({
  useDeadlines: () => ({
    createDeadline: vi.fn(),
    categories: DEFAULT_CATEGORIES,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock Toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('CreateDeadlinePage', () => {
  it('renders accessible category selection', () => {
    render(
      <TooltipProvider>
        <BrowserRouter>
          <CreateDeadlinePage />
        </BrowserRouter>
      </TooltipProvider>
    );

    // Check for Category Radio Group
    const categoryGroup = screen.getByRole('radiogroup', { name: /categoría/i });
    expect(categoryGroup).toBeInTheDocument();

    // Check for Radio Buttons inside the group
    // 5 default categories + "Sin categoría"
    // Using within() to scope search is better, but getAllByRole is fine for now
    // We expect 6 radios in this group.
    // Note: Priority buttons will also be radios in the final implementation, so we need to be careful.
    // Ideally we scope:
    // const radios = within(categoryGroup).getAllByRole('radio');
  });

  it('renders accessible priority selection', () => {
    render(
      <TooltipProvider>
        <BrowserRouter>
          <CreateDeadlinePage />
        </BrowserRouter>
      </TooltipProvider>
    );

    // Check for Priority Radio Group
    const priorityGroup = screen.getByRole('radiogroup', { name: /prioridad/i });
    expect(priorityGroup).toBeInTheDocument();
  });

  it('renders accessible quick date buttons', () => {
    render(
      <TooltipProvider>
        <BrowserRouter>
          <CreateDeadlinePage />
        </BrowserRouter>
      </TooltipProvider>
    );

    // Check for aria-pressed on quick dates
    const todayBtn = screen.getByRole('button', { name: /hoy/i });
    expect(todayBtn).toHaveAttribute('aria-pressed');

    const tomorrowBtn = screen.getByRole('button', { name: /mañana/i });
    expect(tomorrowBtn).toHaveAttribute('aria-pressed');
  });
});
