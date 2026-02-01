## 2024-05-22 - TasksPage List Rendering
**Learning:** `TasksPage` performs O(N) grouping and filtering of subtasks on every render, which can become a bottleneck as the number of tasks grows. The existing pattern of using `useQuery` followed by synchronous processing in render is common but inefficient for large datasets.
**Action:** Always look for derived state calculations involving list iterations in page components and memoize them with `useMemo`.
