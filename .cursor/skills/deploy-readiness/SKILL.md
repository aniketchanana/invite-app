---
name: deploy-readiness
description: Pre-deployment verification — type check, lint, tests, console audit, env vars, secrets, and build before shipping.
---

# Deploy Readiness Check

Pre-deployment verification for shipping to Vercel. Run each check in order, track pass/fail.

## When to Use

- User asks "ready to deploy?", "pre-deploy check", "can I ship?", or "deploy readiness".
- Before merging to `main`. For routine dev, use `/quality-gate` instead.

## Checks

### 1. TypeScript — `npx tsc --noEmit`
### 2. ESLint — `npm run lint`
### 3. Tests + Coverage — `npm run test -- --coverage`
### 4. Console Statements
Search `src/**/*.{ts,tsx}` (excluding `test-utils/`, `*.test.*`) for `console.log`, `console.warn`, `console.error`, `console.debug`. Report file:line.

### 5. Environment Variables
Scan `src/` for `process.env.NEXT_PUBLIC_*` references. Verify all are documented in `.env.example`. Flag orphaned or missing vars.

Expected: `FIREBASE_API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`, `MEASUREMENT_ID` (all `NEXT_PUBLIC_FIREBASE_*`).

### 6. Secrets Check
Verify `.env`, `.env.local`, `serviceAccountKey.json` are NOT tracked. Check `git status` and `git diff --cached`.

### 7. Deploy Config
Read `vercel.json` (branch config) and `next.config.ts` (no risky experimental flags, image domains if needed).

### 8. Build — `npm run build`

## Output

```
DEPLOY READINESS — PartyUp
  TypeScript:      PASS / FAIL
  ESLint:          PASS / FAIL
  Tests:           PASS / FAIL (X passed, Y failed)
  Coverage:        PASS / FAIL (branches: X%, lines: X%)
  Console cleanup: PASS / FAIL (X found)
  Env vars:        PASS / FAIL
  Secrets:         PASS / FAIL
  Deploy config:   PASS / FAIL
  Build:           PASS / FAIL
  VERDICT:         GO / NO-GO
```
