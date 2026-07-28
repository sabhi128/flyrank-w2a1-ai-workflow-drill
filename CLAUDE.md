# Project Instructions & Rules

## Commands
- **Build the project**: `npm run build`
- **Run linter**: `npm run lint`
- **Run test suite**: `npm test`
- **Run dev server**: `npm run dev`

## Coding Rules

### 1. Form Validation & State
- All settings and data entry forms MUST use `react-hook-form` combined with a strict `zod` schema resolver (`@hookform/resolvers/zod`).
- Never use uncontrolled inputs or manual state-based field validations.
- Form inputs must validate on blur (`mode: 'onBlur'`) to give users immediate feedback.

### 2. Accessibility (a11y) Requirements
- Every input element must be explicitly associated with a label using unique React `useId` values (`htmlFor` on labels, matching `id` on inputs).
- Inputs with errors must include `aria-invalid={true}` and `aria-describedby` pointing to the error message container's unique ID.
- Loading states, submissions, and success notifications must be announced using screen reader live regions (`aria-live="polite"` or `role="status"`).

### 3. Build & Test Verification Loop
- No code may be committed to branch headers or pull requests without successfully compiling under the production TypeScript configuration (`tsc -b && vite build`).
- Any new features must be accompanied by unit tests in a corresponding `.test.tsx` file running under Vitest, asserting validation logic, error presence, and success paths.
