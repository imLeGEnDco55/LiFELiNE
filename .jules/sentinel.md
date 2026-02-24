## 2025-02-18 - [Security Enhancements]
**Vulnerability:** Missing Content Security Policy (CSP) and strict Referrer Policy.
**Learning:** Single Page Applications (SPAs) built with Vite require 'unsafe-inline' and 'unsafe-eval' in script-src for development (HMR), which makes strict CSP challenging without a separate production build process that generates nonces.
**Prevention:** Added meta tags to index.html to enforce CSP and Referrer Policy, whitelisting only necessary domains (Supabase, Lovable).

## 2025-05-18 - [Data Access Security]
**Vulnerability:** Client-side data fetching relied solely on Row Level Security (RLS) policies, requesting all records (`select('*')`) without explicit user filtering. If RLS were disabled or misconfigured, this would leak the entire database to any authenticated user.
**Learning:** Always implement "Defense in Depth". Explicitly filter data by `user_id` on the client side even if RLS is present. This acts as a safety net and documents the data access intent clearly.
**Prevention:** Updated `useCloudDeadlines.ts` to add `.eq('user_id', user.id)` to all fetch queries and removed sensitive data logging.

## 2025-05-19 - [Enhanced Auth Validation & Privacy]
**Vulnerability:** Weak input validation on authentication forms and PII exposure in console logs.
**Learning:** Client-side validation is the first line of defense against bad data and improves user feedback. Operational logs can inadvertently leak sensitive context (like User IDs) if not pruned for production.
**Prevention:** Implemented `isValidEmail` and `isValidPassword` checks in `AuthPage`. Removed `user.id` logging from `useCloudDeadlines`.

## 2025-02-18 - [Local vs Cloud Security]
**Vulnerability:** Local authentication (`useLocalAuth`) accepts any password and doesn't validate it against stored credentials (it just sets the user).
**Learning:** The "Local" mode is designed for zero-friction offline usage, effectively bypassing authentication. Security controls must be enforced client-side (like password strength) to encourage good habits even if the backend (local storage) doesn't enforce them.
**Prevention:** Enforced strict password policies in `AuthPage` for new account creation, regardless of mode, to establish a baseline of security hygiene.
