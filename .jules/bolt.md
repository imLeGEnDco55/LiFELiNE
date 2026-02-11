## 2024-05-22 - TasksPage List Rendering
**Learning:** `TasksPage` performs O(N) grouping and filtering of subtasks on every render, which can become a bottleneck as the number of tasks grows. The existing pattern of using `useQuery` followed by synchronous processing in render is common but inefficient for large datasets.
**Action:** Always look for derived state calculations involving list iterations in page components and memoize them with `useMemo`.

## 2024-05-24 - Supabase Relational Filtering
**Learning:** Supabase/PostgREST queries filtering on joined tables (e.g., filtering subtasks by parent deadline status) default to LEFT JOIN behavior unless `!inner` is specified in the select clause (e.g., `select('*, deadline!inner(*)')`). Without `!inner`, filtering the parent returns null for the parent object but keeps the child row, failing to filter the child list itself server-side.
**Action:** Use `!inner` hints in Supabase select clauses when the goal is to filter the primary table based on conditions in the related table to ensure server-side payload reduction.

## 2024-05-25 - Grouping and Filtering Optimization
**Learning:** Iterating over a list multiple times to derive different subsets (grouped, pending, completed) and then filtering again inside the render loop (O(M * N_avg)) is significantly slower than a single-pass reduction (O(N)).
**Action:** Consolidate multiple derived state calculations into a single `useMemo` hook that returns an object containing all necessary data structures (e.g., `{ grouped, pendingCount, completedList }`). Ensure that lists used in render loops are pre-filtered to avoid array methods like `.filter()` during rendering.
