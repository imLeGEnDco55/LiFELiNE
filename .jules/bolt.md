## 2024-05-22 - TasksPage List Rendering
**Learning:** `TasksPage` performs O(N) grouping and filtering of subtasks on every render, which can become a bottleneck as the number of tasks grows. The existing pattern of using `useQuery` followed by synchronous processing in render is common but inefficient for large datasets.
**Action:** Always look for derived state calculations involving list iterations in page components and memoize them with `useMemo`.

## 2024-05-24 - Supabase Relational Filtering
**Learning:** Supabase/PostgREST queries filtering on joined tables (e.g., filtering subtasks by parent deadline status) default to LEFT JOIN behavior unless `!inner` is specified in the select clause (e.g., `select('*, deadline!inner(*)')`). Without `!inner`, filtering the parent returns null for the parent object but keeps the child row, failing to filter the child list itself server-side.
**Action:** Use `!inner` hints in Supabase select clauses when the goal is to filter the primary table based on conditions in the related table to ensure server-side payload reduction.

## 2024-05-24 - Expensive Sort and State Mutation in Hook Render
**Learning:** `useLocalDeadlines` was sorting the deadlines array in-place (`deadlines.sort(...)`) on every render. This mutated the React state directly (since `deadlines` came from `useState`) and caused an expensive O(N log N) `new Date()` comparison on every re-render. Additionally, `useLocalStorage` had a bug preventing batched updates in the same render cycle due to stale ref usage.
**Action:** Always memoize derived sorted lists with `useMemo` and ensure sorting happens on a copy (`[...arr].sort(...)`) to avoid mutating state. Use simple string comparison for ISO dates instead of `new Date()` for ~16x speedup. Avoid `useRef` for state syncing in custom hooks unless absolutely necessary and handle batched updates correctly.
