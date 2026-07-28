# Workflow Analysis: Lazy Prompting vs. Explore-Plan-Code Loop

This document compares the outcomes of building a profile settings form twice: first using a single vague prompt (Round One, branch `round-one`), and second using a precise prompt with an explore-plan-code loop (Round Two, branch `round-two`).

## Correctness & Validation
- **Round One (`src/App.tsx`):** Hand-rolled validation states in a single block. Email was verified using a naive regex (`/^\S+@\S+\.\S+$/`), which accepts invalid emails (e.g. `user@domain..com`) and fails on valid subaddressed formats. Username had no structure rules beyond length.
- **Round Two (`src/App.tsx`):** Utilized a Zod schema resolver with React Hook Form. This enforced strict, standard RFC 5322 compliance for emails, and precise username patterns (`/^[a-z][a-z0-9_]*$/`) starting with letters. Errors are mapped cleanly on field blur (`mode: 'onBlur'`) instead of only on submission.

## Accessibility (a11y)
- **Round One:** Default unstyled input elements. There were no connections between invalid inputs and their errors, which blocks screen reader navigation.
- **Round Two:** Form components explicitly link fields to their error messages using `aria-invalid` and `aria-describedby`. Labels are linked to inputs via unique `useId` hooks (`id` and `htmlFor`). Submits and api errors are announced to screen readers via an `aria-live="polite"` status region (`div.sr-only`), and interactive theme options use `aria-pressed`.

## Edge Cases & UX
- **Round One:** Instant alert box showing "Settings saved!", failing to handle network latency or errors.
- **Round Two:** Simulates API communication (1.5s delay) with disabled input fields and a loading spinner (`Loader2`). Avatar uploads are fully validated for file size (max 2MB) and MIME type (PNG/JPG/WebP) with dynamic previewing, rather than using simple URL strings. Theme choices toggle global styles via root DOM classes (`html.dark`/`html.light`).

## Review Effort & Time Comparison
- **Round One (approx. 5 minutes):** Writing the code was fast, but reviewing it revealed numerous bugs, no modularity, and zero test coverage.
- **Round Two (approx. 35 minutes):** The planning phase identified setup needs (Vitest, React Hook Form) upfront. While writing the tests and styles took longer, the review effort was nearly zero because the automated suite validated all logic. It is much faster end-to-end when factoring in bug-prevention.

## AI Mistake Caught
During the verification of Round Two, the initial test `src/App.test.tsx` failed. The AI generated a test asserting that the bio character count would show `119 characters left` for the default bio. However, the default bio string was `"Software development intern at FlyRank AI."` (42 characters, including the trailing period). The test failed because the actual UI showed `118` characters left. This was caught by running `npm test`, showing how the explore-plan-code loop with automated verification catches minor mathematical/logical discrepancies that are easily missed by manual inspection.
