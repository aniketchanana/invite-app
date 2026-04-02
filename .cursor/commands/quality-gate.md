---
description: Run the full quality pipeline — type check, lint, and test with coverage
---

# Quality Gate

Run the complete quality pipeline in sequence. Stop on the first failure and report the issue.

## Steps

1. **TypeScript type check**
   ```bash
   npx tsc --noEmit
   ```
   If this fails, report the type errors with file paths and line numbers. Stop here.

2. **ESLint**
   ```bash
   npm run lint
   ```
   If this fails, report the lint errors. Stop here.

3. **Vitest with coverage**
   ```bash
   npm run test -- --coverage
   ```
   If tests fail, report which tests failed and why. If coverage thresholds are not met, report which files are below 100%.

4. **Report summary**
   Output a pass/fail table:
   ```
   Type Check:  PASS / FAIL
   Lint:        PASS / FAIL
   Tests:       PASS / FAIL (X passed, Y failed)
   Coverage:    PASS / FAIL (branches: X%, lines: X%)
   ```

If all steps pass, confirm the codebase is ready for PR/deploy.
If any step fails, provide actionable fix suggestions for each error.
