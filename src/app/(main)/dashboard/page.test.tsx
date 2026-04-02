import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { User } from 'firebase/auth'
import { mockRouterPush } from '@/test-utils/mocks'

const mockUseAuth = vi.fn()

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/components/dashboard/invite-list', () => ({
  InviteList: () => <div data-testid="invite-list">list</div>,
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    mockRouterPush.mockClear()
  })

  it('redirects when unauthenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    const { default: DashboardPage } = await import('./page')
    render(<DashboardPage />)
    await waitFor(() =>
      expect(mockRouterPush).toHaveBeenCalledWith('/')
    )
  })

  it('shows dashboard when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1', email: 'a@b.com' } as User,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    const { default: DashboardPage } = await import('./page')
    render(<DashboardPage />)
    expect(await screen.findByText('Your Invites')).toBeInTheDocument()
    expect(screen.getByTestId('invite-list')).toBeInTheDocument()
  })

  it('shows loader while auth loading', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    const { default: DashboardPage } = await import('./page')
    const { container } = render(<DashboardPage />)
    expect(container.querySelector('.animate-spin')).toBeTruthy()
  })

  it('sign out calls signOut', async () => {
    const signOut = vi.fn()
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1', email: 'a@b.com' } as User,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut,
    })
    const { default: DashboardPage } = await import('./page')
    const user = userEvent.setup()
    render(<DashboardPage />)
    await user.click(await screen.findByRole('button', { name: /sign out/i }))
    expect(signOut).toHaveBeenCalled()
  })
})
