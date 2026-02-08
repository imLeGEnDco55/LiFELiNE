import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Supabase environment variables to ensure tests run without .env file
vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "dummy-key");
vi.stubEnv("VITE_SUPABASE_PROJECT_ID", "dummy-project");

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
