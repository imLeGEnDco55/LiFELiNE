## 2025-02-17 - Fix React State Mutation in useLocalDeadlines
**Learning:** `Array.prototype.sort()` sorts in-place. Using it directly on a state variable (even inside a return statement) mutates the state reference, which is a React anti-pattern and can lead to unpredictable rendering behavior or bugs.
**Action:** Always create a copy (e.g., `[...array]`) before sorting state arrays, and memoize the sorted result with `useMemo` to prevent O(N log N) operations on every render.
