import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mockRouterPush } from '@/test-utils/mocks'
import type { User } from 'firebase/auth'

const mockUseAuth = vi.fn()

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('LandingPage', () => {
  beforeEach(() => {
    mockRouterPush.mockClear()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
  })

  it('shows hero and auth form when logged out', async () => {
    const { default: LandingPage } = await import('./page')
    render(<LandingPage />)
    expect(
      await screen.findByRole('heading', { name: /partyup/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows loading spinner when auth loading', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    const { default: LandingPage } = await import('./page')
    const { container } = render(<LandingPage />)
    expect(container.querySelector('.lucide-party-popper')).toBeTruthy()
  })

  it('redirects to dashboard when user present', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1' } as User,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    const { default: LandingPage } = await import('./page')
    render(<LandingPage />)
    await waitFor(() =>
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard')
    )
  })
})
