---
name: firebase-security-audit
description: Audits Firestore data access patterns against security rules, identifies unprotected writes, missing auth checks, and data exposure risks.
---

# Firebase Security Audit

Security-focused analysis of all Firestore data access. Uses firebase-architect agent knowledge — this skill defines the audit workflow and output format only.

## When to Use

- User asks to "audit security", "check Firestore rules", "security review", or "are my writes protected".
- Before deploying rule changes or after adding new Firestore operations.

## Audit Workflow

### Phase 1: Catalog Operations
Read `src/lib/firestore/`, `src/lib/auth-context.tsx`, and `src/app/invite/[id]/page.tsx`. Build a table:

| Operation | Path | Type | Auth Required? | File:Line |

### Phase 2: Map Required Rules
For each operation, determine the minimum security rule: public read, authenticated write with ownership check, guest write with constraints, etc.

### Phase 3: Check Existing Rules
1. Read `firestore.rules` at repo root (if it exists)
2. Compare against required rules from Phase 2
3. Flag missing coverage as critical

### Phase 4: Identify Vulnerabilities
1. Writes without corresponding security rules
2. Missing field validation in rules (guest could set `hostId`)
3. `updateDoc` on shared data instead of `runTransaction`
4. Reads returning more fields than needed
5. Client-trusting patterns (passing `userId` without rule verification)
6. Missing rate limiting (RSVP spam, gift claim abuse)

### Phase 5: Auth Patterns
1. AuthProvider handles loading state (no content flash)
2. Dashboard redirects unauthenticated users
3. signOut clears state and listeners
4. No custom localStorage for auth tokens

## Output Format

```
FIREBASE SECURITY AUDIT — PartyUp
====================================
CRITICAL VULNERABILITIES:
  1. [File:Line] Description → Risk → Fix
WARNINGS:
  1. [File:Line] Description → Risk → Fix
RULE COVERAGE MATRIX:
  Collection | Read | Create | Update | Delete
RECOMMENDED FIRESTORE RULES: (complete file)
SUMMARY: X critical, Y warnings, X/Y ops covered
```
