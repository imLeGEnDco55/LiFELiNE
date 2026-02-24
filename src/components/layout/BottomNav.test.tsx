import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { vi } from 'vitest';

// Mock PomodoroDrawer to render children directly
vi.mock('@/components/focus/PomodoroDrawer', () => ({
  PomodoroDrawer: ({ children }: { children: React.ReactNode }) => children,
}));

describe('BottomNav', () => {
  it('renders Pomodoro button with accessible name', () => {
    render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>
    );

    // Look for the button with the tomato emoji
    const pomodoroButton = screen.getByText('🍅');
    expect(pomodoroButton).toBeInTheDocument();

    // Check if it has the accessible name
    expect(pomodoroButton).toHaveAccessibleName('Temporizador Pomodoro');
  });
});
