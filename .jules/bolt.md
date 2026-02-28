## 2024-05-22 - TasksPage List Rendering
**Learning:** `TasksPage` performs O(N) grouping and filtering of subtasks on every render, which can become a bottleneck as the number of tasks grows. The existing pattern of using `useQuery` followed by synchronous processing in render is common but inefficient for large datasets.
**Action:** Always look for derived state calculations involving list iterations in page components and memoize them with `useMemo`.

## 2024-05-24 - Supabase Relational Filtering
**Learning:** Supabase/PostgREST queries filtering on joined tables (e.g., filtering subtasks by parent deadline status) default to LEFT JOIN behavior unless `!inner` is specified in the select clause (e.g., `select('*, deadline!inner(*)')`). Without `!inner`, filtering the parent returns null for the parent object but keeps the child row, failing to filter the child list itself server-side.
**Action:** Use `!inner` hints in Supabase select clauses when the goal is to filter the primary table based on conditions in the related table to ensure server-side payload reduction.

## 2026-02-14 - Optimizing useVitality Hook Date Operations
**Learning:** The `useVitality` hook used multiple `.filter().reduce()` chains that iterated over arrays repeatedly and parsed the same dates multiple times (O(N) operations within loops). This causes performance overhead in a component that re-renders frequently when task or session data changes.
**Action:** Replace chained `.filter()` operations with a single-pass `for...of` loop. This significantly reduces GC overhead and array iterations while maintaining local time accuracy using `date-fns`.
