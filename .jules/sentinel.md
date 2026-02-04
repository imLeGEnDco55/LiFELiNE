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

## 2025-05-20 - [Configuration Security]
**Vulnerability:** The `.env` file containing configuration keys was tracked in version control.
**Learning:** Checking in `.env` files poses a severe security risk as it exposes configuration secrets and encourages hardcoding sensitive data in the repo history. Even if current keys are public, the file itself should never be tracked.
**Prevention:** Removed `.env` from git tracking, added it to `.gitignore`, and created `.env.example` to guide developers safely.
