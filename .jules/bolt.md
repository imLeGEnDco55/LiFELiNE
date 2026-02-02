## 2024-05-22 - TasksPage List Rendering
**Learning:** `TasksPage` performs O(N) grouping and filtering of subtasks on every render, which can become a bottleneck as the number of tasks grows. The existing pattern of using `useQuery` followed by synchronous processing in render is common but inefficient for large datasets.
**Action:** Always look for derived state calculations involving list iterations in page components and memoize them with `useMemo`.

## 2024-05-24 - Server-Side Limits vs Client-Side Filtering
**Learning:** The previous implementation fetched *all* subtask history client-side and then filtered for completed items in the UI. This is an O(N) transfer and memory cost where N grows indefinitely over time.
**Action:** Implemented server-side limiting (`.limit(5)`) for historical data (completed tasks) while keeping a separate query for active tasks. Always prefer shaping the data via the API query over filtering in the browser for potentially unbounded lists.
