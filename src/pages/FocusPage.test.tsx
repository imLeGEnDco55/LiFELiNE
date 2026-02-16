import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FocusPage } from "./FocusPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";

// Mock dependencies
vi.mock("@/hooks/useDeadlines", () => ({
  useDeadlines: () => ({
    deadlines: [],
    createFocusSession: vi.fn(),
    completeFocusSession: vi.fn(),
    weeklyStats: { todaySessionsCount: 0 },
  }),
}));

vi.mock("@/hooks/useFeedback", () => ({
  useFeedback: () => ({
    successFeedback: vi.fn(),
    breakFeedback: vi.fn(),
  }),
}));

// Mock ResizeObserver for CircularProgress or Tooltips
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("FocusPage Accessibility", () => {
  it("renders with accessible controls", () => {
    render(
      <TooltipProvider>
        <BrowserRouter>
          <FocusPage />
        </BrowserRouter>
      </TooltipProvider>
    );

    // Check for accessible labels on buttons
    expect(screen.getByLabelText("Volver")).toBeInTheDocument();
    expect(screen.getByLabelText("Iniciar sesión")).toBeInTheDocument();
    expect(screen.getByLabelText("Saltar sesión")).toBeInTheDocument();
    expect(screen.getByLabelText("Reiniciar sesión")).toBeInTheDocument();
  });
});
