## 2024-05-22 - TasksPage List Rendering
**Learning:** `TasksPage` performs O(N) grouping and filtering of subtasks on every render, which can become a bottleneck as the number of tasks grows. The existing pattern of using `useQuery` followed by synchronous processing in render is common but inefficient for large datasets.
**Action:** Always look for derived state calculations involving list iterations in page components and memoize them with `useMemo`.

## 2024-05-24 - Supabase Relational Filtering
**Learning:** Supabase/PostgREST queries filtering on joined tables (e.g., filtering subtasks by parent deadline status) default to LEFT JOIN behavior unless `!inner` is specified in the select clause (e.g., `select('*, deadline!inner(*)')`). Without `!inner`, filtering the parent returns null for the parent object but keeps the child row, failing to filter the child list itself server-side.
**Action:** Use `!inner` hints in Supabase select clauses when the goal is to filter the primary table based on conditions in the related table to ensure server-side payload reduction.

## 2024-05-24 - Single-Pass Grouping
**Learning:** When separating a list into multiple groups (e.g., active vs. completed tasks), using multiple `.filter()` calls iterates the list K times (O(K*N)). A single `.reduce()` or `forEach` loop to push items into buckets is O(N) and significantly more performant for large lists.
**Action:** Replace multiple `filter` chains on the same source array with a single-pass grouping function memoized with `useMemo`.
