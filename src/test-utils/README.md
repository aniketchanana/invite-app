# Test utilities

- **`setup.ts`** — Loaded by Vitest; registers `@testing-library/jest-dom` and mocks Firebase modules.
- **`firebase-mocks.ts`** — Helpers for Firestore snapshot/refs and errors.
- **`render.tsx`** — `renderWithAuth()` wraps components in `AuthProvider` when tests need real auth context (prefer mocking `useAuth` when simpler).

Run tests:

```bash
npm run test
npm run test:coverage
```

Coverage thresholds (see `vitest.config.ts`): **100%** lines/statements; **98%** branches; **92%** functions (inline JSX handlers make 100% function coverage impractical).
