---
description: Scaffold a new component with proper project patterns and a co-located test file
---

# Scaffold Component

Create a new component following the project's established patterns, including a co-located test file.

## Steps

1. **Gather info** — Ask the user for:
   - Component name (e.g., `GuestCount`)
   - Target directory: `auth/`, `dashboard/`, `guest/`, `invite-creation/`, `templates/`, or a new directory name
   - Does it need auth context? (determines whether tests use `renderWithAuth`)
   - Is it a Client Component? (needs `"use client"` directive)

2. **Create the component file** at `src/components/<directory>/<component-name>.tsx`:
   ```tsx
   "use client"; // only if client component

   import { /* hooks if needed */ } from "react";
   // ... other imports following import ordering rules

   interface <ComponentName>Props {
     // typed props
   }

   export function <ComponentName>({ }: <ComponentName>Props) {
     return (
       <div>
         {/* component content */}
       </div>
     );
   }
   ```
   - Named export (not default)
   - Props interface defined and exported
   - Follows component internals ordering (hooks → derived state → effects → handlers → guards → render)
   - Max 120 lines

3. **Create the test file** at `src/components/<directory>/<component-name>.test.tsx`:
   ```tsx
   import { describe, it, expect, vi } from "vitest";
   import { screen } from "@testing-library/react";
   import userEvent from "@testing-library/user-event";
   // use renderWithAuth if component needs auth, otherwise standard render
   import { <ComponentName> } from "./<component-name>";

   describe("<ComponentName>", () => {
     it("should render without crashing", () => {
       // smoke test
     });

     it("should handle user interaction", async () => {
       // basic interaction test
     });
   });
   ```

4. **Remind the user** to:
   - Add the component to any barrel exports if the directory has an `index.ts`
   - Fill in the actual component logic and additional test cases
   - Run `npm run test:coverage` to verify coverage
