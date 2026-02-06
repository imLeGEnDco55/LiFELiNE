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

## 2025-05-20 - [Mutation Authorization Defense]
**Vulnerability:** Database mutation operations (update, delete) in `useCloudDeadlines` relied solely on RLS policies, lacking explicit client-side `user_id` filtering.
**Learning:** Defense in Depth requires that both the database (RLS) and the application layer (Client Queries) enforce ownership checks. This prevents accidental data modification if RLS is misconfigured.
**Prevention:** Added `.eq('user_id', user.id)` to all update/delete queries and ensured `user` existence checks before execution.
