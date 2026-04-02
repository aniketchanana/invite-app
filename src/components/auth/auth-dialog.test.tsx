import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthDialog } from './auth-dialog'

const signIn = vi.fn()
const signUp = vi.fn()

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn,
    signUp,
    signOut: vi.fn(),
  }),
}))

describe('AuthDialog', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
    signIn.mockReset()
    signUp.mockReset()
    signIn.mockResolvedValue(undefined)
    signUp.mockResolvedValue(undefined)
  })

  it('renders when open and submits sign in', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<AuthDialog open onOpenChange={onOpenChange} />)

    expect(screen.getByText('Welcome to PartyUp')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret12')
    await user.click(screen.getByRole('button', { name: /sign in$/i }))

    expect(signIn).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Welcome back!')
  })

  it('submits sign up and shows success toast', async () => {
    const user = userEvent.setup()
    render(<AuthDialog open onOpenChange={vi.fn()} />)

    await user.click(screen.getByRole('tab', { name: /sign up/i }))
    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret12')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await vi.waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Account created! Welcome to PartyUp!'
      )
    )
  })

  it('shows error on sign up failure', async () => {
    signUp.mockRejectedValue(new Error('weak'))
    const user = userEvent.setup()
    render(<AuthDialog open onOpenChange={vi.fn()} />)

    await user.click(screen.getByRole('tab', { name: /sign up/i }))
    await user.type(screen.getByLabelText(/email/i), 'c@d.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret12')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith('weak'))
  })

  it('shows generic error when throw is non-Error', async () => {
    signIn.mockRejectedValue('x')
    const user = userEvent.setup()
    render(<AuthDialog open onOpenChange={vi.fn()} />)

    await user.type(screen.getByLabelText(/email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret12')
    await user.click(screen.getByRole('button', { name: /sign in$/i }))

    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Something went wrong')
    )
  })
})
