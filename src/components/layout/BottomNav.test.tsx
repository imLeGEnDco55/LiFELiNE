import { render, screen } from '@testing-library/react';
import { BottomNav } from './BottomNav';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';

// Mock PomodoroDrawer
vi.mock('@/components/focus/PomodoroDrawer', () => ({
  PomodoroDrawer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('BottomNav', () => {
  it('renders Pomodoro button with accessible name', () => {
    render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>
    );

    // Look for a button that contains the tomato emoji
    // Using closest('button') because getByText returns the text node or element containing it
    const pomodoroButton = screen.getByText('🍅').closest('button');
    expect(pomodoroButton).toBeInTheDocument();

    // Check for aria-label
    // This assertion is expected to fail initially as the label is missing
    expect(pomodoroButton).toHaveAttribute('aria-label', 'Abrir temporizador Pomodoro');
  });
});
