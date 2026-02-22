## 2024-05-23 - Dual Authentication Mode Constraints
**Vulnerability:** Weak password validation (min 6 chars) was applied universally because the app supports a "Local" mode (insecure by design) alongside "Cloud" mode.
**Learning:** Security enhancements must distinguish between the "Local" mode (where friction should be minimized) and "Cloud" mode (where security is critical). Applying strict rules universally can degrade the local experience.
**Prevention:** When implementing security controls, check `mode` or context (login vs registration) to apply appropriate rigor.
