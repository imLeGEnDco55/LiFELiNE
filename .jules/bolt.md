## 2024-05-22 - TasksPage List Rendering
**Learning:** `TasksPage` performs O(N) grouping and filtering of subtasks on every render, which can become a bottleneck as the number of tasks grows. The existing pattern of using `useQuery` followed by synchronous processing in render is common but inefficient for large datasets.
**Action:** Always look for derived state calculations involving list iterations in page components and memoize them with `useMemo`.

## 2024-05-24 - Supabase Relational Filtering
**Learning:** Supabase/PostgREST queries filtering on joined tables (e.g., filtering subtasks by parent deadline status) default to LEFT JOIN behavior unless `!inner` is specified in the select clause (e.g., `select('*, deadline!inner(*)')`). Without `!inner`, filtering the parent returns null for the parent object but keeps the child row, failing to filter the child list itself server-side.
**Action:** Use `!inner` hints in Supabase select clauses when the goal is to filter the primary table based on conditions in the related table to ensure server-side payload reduction.

## 2024-05-27 - Single Pass List Processing
**Learning:** Found multiple `filter` calls iterating over the same large list to create different view subsets (e.g., pending vs completed). This results in O(k*N) complexity.
**Action:** Consolidate multiple filter passes into a single `reduce` or `forEach` loop inside `useMemo` to categorize items in one pass (O(N)), returning an object with all necessary subsets. Use `Map` for O(1) lookups of related data (like deadlines) to avoid O(N*M) nested searches.
