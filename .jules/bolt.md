## 2024-05-22 - TasksPage List Rendering
**Learning:** `TasksPage` performs O(N) grouping and filtering of subtasks on every render, which can become a bottleneck as the number of tasks grows. The existing pattern of using `useQuery` followed by synchronous processing in render is common but inefficient for large datasets.
**Action:** Always look for derived state calculations involving list iterations in page components and memoize them with `useMemo`.

## 2024-05-24 - Supabase Relational Filtering
**Learning:** Supabase/PostgREST queries filtering on joined tables (e.g., filtering subtasks by parent deadline status) default to LEFT JOIN behavior unless `!inner` is specified in the select clause (e.g., `select('*, deadline!inner(*)')`). Without `!inner`, filtering the parent returns null for the parent object but keeps the child row, failing to filter the child list itself server-side.
**Action:** Use `!inner` hints in Supabase select clauses when the goal is to filter the primary table based on conditions in the related table to ensure server-side payload reduction.

## 2025-05-22 - Consolidating Derived State
**Learning:** When deriving multiple subsets (e.g., active, completed) from a single large array, use a single `useMemo` hook to iterate once and return an object containing all subsets, rather than multiple separate `filter` passes. This reduces complexity from O(K*N) to O(N).
**Action:** Consolidate multiple `useMemo` or `filter` calls acting on the same source array into a single pass.

## 2025-05-24 - E2E Testing with Splash Screens
**Learning:** The "LiFELiNE" splash screen persists on initial load and blocks interaction with the login form, causing Playwright timeouts. E2E tests targeting the initial page load must explicitly wait for the splash screen to disappear (`state='hidden'`) before asserting form visibility.
**Action:** Include a dedicated splash screen wait step (e.g., `page.wait_for_selector('img[alt="LiFELiNE"]', state='hidden')`) in the setup phase of any E2E test verifying the authentication flow.
