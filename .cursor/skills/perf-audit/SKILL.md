---
name: perf-audit
description: Deep frontend performance audit — analyzes re-renders, bundle size, Firebase query efficiency, and Core Web Vitals impact across the codebase.
---

# Performance Audit

Comprehensive performance analysis of the PartyUp codebase. Uses knowledge from the frontend-expert and firebase-architect agents — this skill defines the audit workflow and output format only.

## When to Use

- User asks to "audit performance", "check bundle size", "find re-renders", "optimize speed", or "check Core Web Vitals".
- After major feature additions or before a production deploy.

## Audit Workflow

### Phase 1: Rendering Efficiency
Read `src/components/**/*.tsx` and `src/app/**/*.tsx`. Flag:
1. Inline objects/arrays/functions in JSX props (especially to memoized children)
2. Components in `.map()` loops missing `React.memo`
3. Context provider values recreated every render (missing `useMemo`)
4. State too high — parent re-renders when only a child needs the state

### Phase 2: Bundle & Loading
1. Scan imports for barrel imports from large libs (`date-fns`, `framer-motion`)
2. Identify `next/dynamic` candidates: template renderers, dialogs, modals, heavy form components
3. Find raw `<img>` tags (should be `next/image`)
4. Verify fonts use `next/font`, not `<link>` stylesheet

### Phase 3: Firebase Query Efficiency
Read `src/lib/firestore/`. Flag:
1. `getDocs` without `limit()` on growing collections
2. Fetching docs to count instead of `getCountFromServer`
3. Full doc reads where `select()` would suffice
4. Redundant reads of the same document in one render cycle
5. `onSnapshot` on rarely-changing data
6. List queries without pagination

### Phase 4: Core Web Vitals
1. **LCP** — Is the largest element server-rendered, preloaded, not lazy-loaded?
2. **CLS** — Images without dimensions? Dynamic content above fold? Font swap?
3. **INP** — Click handlers with sync Firestore reads? Missing `startTransition`?

## Output Format

```
PERFORMANCE AUDIT — PartyUp
============================
CRITICAL (must fix):
  1. [File:Line] Issue → Fix: <code change>
WARNING (should fix):
  1. [File:Line] Issue → Fix: <code change>
SUGGESTION (nice to have):
  1. [File:Line] Issue → Fix: <code change>
SUMMARY: X critical, Y warning, Z suggestion
```

Always provide the fix alongside the finding.
