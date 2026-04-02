import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./globals.css', () => ({}))

vi.mock('next/font/google', () => ({
  Poppins: () => ({ variable: '--font-heading', className: '' }),
  Inter: () => ({ variable: '--font-sans', className: '' }),
}))

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
  useTheme: () => ({ theme: 'light' }),
}))

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => null,
}))

describe('RootLayout', () => {
  it('renders children inside AuthProvider', async () => {
    const { default: RootLayout } = await import('./layout')
    render(
      <RootLayout>
        <div>inside</div>
      </RootLayout>
    )
    expect(screen.getByText('inside')).toBeInTheDocument()
  })
})
