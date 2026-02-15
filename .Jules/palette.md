## 2025-02-18 - Accessibility in Focus Mode
**Learning:** Icon-only buttons for core features like Pomodoro timers are completely inaccessible without labels. Tooltips enhance usability for mouse users while providing context that can mirror aria-labels.
**Action:** Always check interactive components (like timers and floating buttons) for accessible names, especially when they rely heavily on iconography.
## 2026-01-31 - Auth Form Accessibility & Feedback
**Learning:** Auth forms often lack basic accessibility (aria-labels on inputs) and visual feedback (loading spinners), making them unfriendly to screen readers and uncertain for users on slow connections.
**Action:** Always wrap interactive icons in proper Button components with aria-labels, use aria-labels for inputs without visible labels, and include explicit visual loading states in submit buttons.
## 2026-02-04 - Form Label Association
**Learning:** Visible text labels adjacent to inputs are often not programmatically associated, breaking click-to-focus and screen reader context.
**Action:** Use `htmlFor` on labels matching the `id` of the input to ensure proper association and improve click target size.

## 2026-02-15 - Accessibility for Time Critical Actions
**Learning:** Icon-only buttons in focus interfaces need clear identification. Providing both aria-labels and tooltips reduces cognitive load and prevents accidental clicks.
**Action:** Always pair icon-only controls with tooltips that match their accessible name, especially in "Focus Mode" interfaces.
