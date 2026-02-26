import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BottomNav } from './BottomNav';
import { MemoryRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock PomodoroDrawer since it likely has complex dependencies
vi.mock('@/components/focus/PomodoroDrawer', () => ({
  PomodoroDrawer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// ResizeObserver mock needed for Radix primitives
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('BottomNav', () => {
  it('renders the Pomodoro button with correct aria-label', () => {
    render(
      <MemoryRouter>
        <TooltipProvider>
          <BottomNav />
        </TooltipProvider>
      </MemoryRouter>
    );

    const button = screen.getByLabelText('Temporizador Pomodoro');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('🍅');
  });
});
