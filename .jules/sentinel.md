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

## 2025-10-26 - [Defense in Depth: IDOR Prevention in Mutations]
**Vulnerability:** Client-side data mutation operations (`update`, `delete`) in `useCloudDeadlines.ts` relied solely on the object's ID (e.g., `.eq('id', id)`). This creates an Insecure Direct Object Reference (IDOR) risk where an authenticated user could modify or delete records belonging to other users if Supabase Row Level Security (RLS) was bypassed or misconfigured.
**Learning:** Defense in Depth is crucial for client-side queries. Never trust that the backend will catch all authorization errors. Explicitly scoping every mutation query to the current authenticated user's ID provides a necessary safety net against RLS failures and clearly documents the intended authorization constraints within the client codebase.
**Prevention:** Updated all `.update()` and `.delete()` calls in `useCloudDeadlines.ts` to explicitly include `.eq('user_id', user.id)` in addition to the object ID. Added early return `if (!user) return;` to prevent execution without an active session.