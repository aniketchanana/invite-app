---
description: Scaffold a new Next.js App Router route with page, loading state, and tests
---

# Scaffold Route

Create a new Next.js App Router route following the project's conventions.

## Steps

1. **Gather info** — Ask the user for:
   - Route path (e.g., `/dashboard/settings`, `/invite/[id]/edit`)
   - Is this a protected route? (needs auth guard)
   - Does it need SSR data fetching / `generateMetadata()`?
   - Should it be a Server Component (default) or Client Component?

2. **Create route directory** at `src/app/<route-path>/`

3. **Create `page.tsx`**:

   **Server Component (default):**
   ```tsx
   import type { Metadata } from "next";

   export const metadata: Metadata = {
     title: "<Page Title> | PartyUp",
   };

   export default function <PageName>Page() {
     return (
       <main>
         {/* page content */}
       </main>
     );
   }
   ```

   **Client Component (if state/interactivity needed):**
   ```tsx
   "use client";

   import { useState } from "react";
   // ... imports

   export default function <PageName>Page() {
     // auth guard if protected route
     const { user, loading } = useAuth();

     if (loading) return <PageSkeleton />;
     if (!user) { redirect("/"); return null; }

     return (
       <main>
         {/* page content */}
       </main>
     );
   }
   ```

4. **Create `loading.tsx`** (skeleton):
   ```tsx
   export default function Loading() {
     return (
       <div className="animate-pulse space-y-4 p-6">
         <div className="h-8 w-48 rounded-lg bg-muted" />
         <div className="h-64 rounded-xl bg-muted" />
       </div>
     );
   }
   ```

5. **Create `page.test.tsx`**:
   ```tsx
   import { describe, it, expect } from "vitest";
   import { screen } from "@testing-library/react";
   // renderWithAuth if protected, render if public

   describe("<PageName>Page", () => {
     it("should render the page", () => { /* ... */ });
     it("should redirect unauthenticated users", () => { /* if protected */ });
   });
   ```

6. **Remind the user** to:
   - Add any navigation links pointing to the new route
   - Update `generateMetadata()` if the route needs OG tags
   - Run `npm run test:coverage` to verify
