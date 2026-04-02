import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth-context'

function AllProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

/** Wrap tree with `AuthProvider` (matches root layout). */
export function renderWithAuth(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
