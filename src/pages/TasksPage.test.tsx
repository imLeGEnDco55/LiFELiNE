import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TasksPage } from "./TasksPage";
import { MemoryRouter } from "react-router-dom";

// Mock dependencies
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            order: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

// Mock React Query
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useQuery: (options: any) => mockUseQuery(options),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useMutation: (options: any) => {
      const mutation = mockUseMutation(options);
      return { ...mutation, mutate: mutation?.mutate || vi.fn() };
    },
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

describe("TasksPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue({ mutate: vi.fn() });
  });

  it("renders pending and completed tasks correctly", () => {
    // Mock data
    const mockDeadlines = [
      { id: "d1", title: "Project Alpha", deadline_at: "2023-12-31T23:59:59Z" },
    ];

    const mockSubtasks = [
      { id: "s1", title: "Task 1", completed: false, deadline_id: "d1", created_at: "2023-01-01" },
      { id: "s2", title: "Task 2", completed: true, deadline_id: "d1", created_at: "2023-01-02" },
      { id: "s3", title: "Task 3", completed: false, deadline_id: "d1", created_at: "2023-01-03" },
    ];

    mockUseQuery.mockImplementation(({ queryKey }) => {
      if (queryKey[0] === "deadlines") {
        return { data: mockDeadlines };
      }
      if (queryKey[0] === "all-subtasks") {
        return { data: mockSubtasks };
      }
      return { data: [] };
    });

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>
    );

    // Verify header counts
    expect(screen.getByText(/2 pendientes/)).toBeInTheDocument();
    expect(screen.getByText(/1 completadas/)).toBeInTheDocument();

    // Verify pending tasks are shown
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();

    // Verify completed tasks section
    expect(screen.getByText("Completadas (1)")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });
});
