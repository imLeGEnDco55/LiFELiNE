import { render, screen, fireEvent } from '@testing-library/react';
import { CreateDeadlinePage } from './CreateDeadlinePage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_CATEGORIES } from '@/types/deadline';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useDeadlines
const mockCreateDeadline = vi.fn();
vi.mock('@/hooks/useDeadlines', () => ({
  useDeadlines: () => ({
    createDeadline: mockCreateDeadline,
    categories: DEFAULT_CATEGORIES,
  }),
}));

// Mock ResizeObserver for any layout components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CreateDeadlinePage Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (ui: React.ReactNode) => {
    return render(
      <TooltipProvider>
        {ui}
      </TooltipProvider>
    );
  };

  it('renders time input with accessible label', () => {
    renderWithProviders(<CreateDeadlinePage />);

    // This will fail if the label is not associated with the input
    const timeInput = screen.getByLabelText(/hora límite/i);
    expect(timeInput).toBeInTheDocument();
    expect(timeInput).toHaveAttribute('type', 'time');
  });

  it('renders priority selection as an accessible radiogroup', () => {
    renderWithProviders(<CreateDeadlinePage />);

    // Check for radiogroup role
    const priorityGroup = screen.getByRole('radiogroup', { name: /prioridad/i });
    expect(priorityGroup).toBeInTheDocument();

    // Check for radio roles
    const lowPriority = screen.getByRole('radio', { name: /baja/i });
    const mediumPriority = screen.getByRole('radio', { name: /media/i });
    const highPriority = screen.getByRole('radio', { name: /alta/i });

    expect(lowPriority).toBeInTheDocument();
    expect(mediumPriority).toBeInTheDocument();
    expect(highPriority).toBeInTheDocument();

    // Default state (Medium)
    expect(mediumPriority).toHaveAttribute('aria-checked', 'true');
    expect(lowPriority).toHaveAttribute('aria-checked', 'false');
    expect(highPriority).toHaveAttribute('aria-checked', 'false');
  });

  it('updates priority selection state correctly', () => {
    renderWithProviders(<CreateDeadlinePage />);

    const highPriority = screen.getByRole('radio', { name: /alta/i });
    const mediumPriority = screen.getByRole('radio', { name: /media/i });

    fireEvent.click(highPriority);

    expect(highPriority).toHaveAttribute('aria-checked', 'true');
    expect(mediumPriority).toHaveAttribute('aria-checked', 'false');
  });

  it('renders category selection as an accessible radiogroup', () => {
    renderWithProviders(<CreateDeadlinePage />);

    const categoryGroup = screen.getByRole('radiogroup', { name: /categoría/i });
    expect(categoryGroup).toBeInTheDocument();

    // Check a specific category
    const workCategory = screen.getByRole('radio', { name: /trabajo/i });
    expect(workCategory).toBeInTheDocument();
    expect(workCategory).toHaveAttribute('aria-checked', 'false');

    // Check "No Category" option
    const noCategory = screen.getByRole('radio', { name: /sin categoría/i });
    expect(noCategory).toBeInTheDocument();
    expect(noCategory).toHaveAttribute('aria-checked', 'true'); // Default
  });
});
