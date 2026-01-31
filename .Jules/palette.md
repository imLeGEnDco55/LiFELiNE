## 2025-02-18 - Accessibility in Focus Mode
**Learning:** Icon-only buttons for core features like Pomodoro timers are completely inaccessible without labels. Tooltips enhance usability for mouse users while providing context that can mirror aria-labels.
**Action:** Always check interactive components (like timers and floating buttons) for accessible names, especially when they rely heavily on iconography.
## 2026-01-31 - Auth Form Accessibility & Feedback
**Learning:** Auth forms often lack basic accessibility (aria-labels on inputs) and visual feedback (loading spinners), making them unfriendly to screen readers and uncertain for users on slow connections.
**Action:** Always wrap interactive icons in proper Button components with aria-labels, use aria-labels for inputs without visible labels, and include explicit visual loading states in submit buttons.
