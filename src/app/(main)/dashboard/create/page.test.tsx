import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { User } from 'firebase/auth'
import { mockRouterPush } from '@/test-utils/mocks'

const mockUseAuth = vi.fn()
const createInvite = vi.fn()
const addGifts = vi.fn()

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/lib/firestore/invites', () => ({
  createInvite: (...args: unknown[]) => createInvite(...args),
}))

vi.mock('@/lib/firestore/gifts', () => ({
  addGifts: (...args: unknown[]) => addGifts(...args),
}))

describe('CreateInvitePage', () => {
  beforeEach(() => {
    mockRouterPush.mockClear()
    createInvite.mockReset()
    addGifts.mockReset()
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1', email: 'a@b.com' } as User,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    createInvite.mockResolvedValue('new-inv')
    addGifts.mockResolvedValue(undefined)
  })

  it('redirects when unauthenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    const { default: CreateInvitePage } = await import('./page')
    render(<CreateInvitePage />)
    await waitFor(() =>
      expect(mockRouterPush).toHaveBeenCalledWith('/')
    )
  })

  it('creates invite without gifts', async () => {
    const user = userEvent.setup()
    const { default: CreateInvitePage } = await import('./page')
    render(<CreateInvitePage />)

    fireEvent.change(screen.getByLabelText(/party heading/i), {
      target: { value: 'Big party here' },
    })
    fireEvent.change(screen.getByLabelText(/host \/ organizer name/i), {
      target: { value: 'Host' },
    })
    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: 'Venue' },
    })
    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: '2099-12-31T18:00' },
    })

    await user.click(screen.getByRole('button', { name: /next: choose template/i }))
    await user.click(screen.getByRole('button', { name: /birthday party/i }))
    await user.click(
      screen.getAllByRole('button', { name: /next: gift registry/i })[0]
    )

    await user.click(screen.getByRole('button', { name: /skip & create invite/i }))

    await waitFor(() => expect(createInvite).toHaveBeenCalled())
    expect(addGifts).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalled()
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard')
  })

  it('calls addGifts when registry has items', async () => {
    const user = userEvent.setup()
    const { default: CreateInvitePage } = await import('./page')
    render(<CreateInvitePage />)

    fireEvent.change(screen.getByLabelText(/party heading/i), {
      target: { value: 'Big party here' },
    })
    fireEvent.change(screen.getByLabelText(/host \/ organizer name/i), {
      target: { value: 'Host' },
    })
    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: 'Venue' },
    })
    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: '2099-12-31T18:00' },
    })

    await user.click(screen.getByRole('button', { name: /next: choose template/i }))
    await user.click(screen.getByRole('button', { name: /birthday party/i }))
    await user.click(
      screen.getAllByRole('button', { name: /next: gift registry/i })[0]
    )

    fireEvent.change(screen.getByLabelText(/gift name/i), {
      target: { value: 'Teapot' },
    })
    await user.click(screen.getByRole('button', { name: /^add gift$/i }))
    await user.click(screen.getByRole('button', { name: /create invite/i }))

    await waitFor(() => expect(addGifts).toHaveBeenCalled())
  })

  it('toasts when createInvite fails', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    createInvite.mockRejectedValueOnce(new Error('fail'))

    const user = userEvent.setup()
    const { default: CreateInvitePage } = await import('./page')
    render(<CreateInvitePage />)

    fireEvent.change(screen.getByLabelText(/party heading/i), {
      target: { value: 'Big party here' },
    })
    fireEvent.change(screen.getByLabelText(/host \/ organizer name/i), {
      target: { value: 'Host' },
    })
    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: 'Venue' },
    })
    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: '2099-12-31T18:00' },
    })

    await user.click(screen.getByRole('button', { name: /next: choose template/i }))
    await user.click(screen.getByRole('button', { name: /birthday party/i }))
    await user.click(
      screen.getAllByRole('button', { name: /next: gift registry/i })[0]
    )
    await user.click(screen.getByRole('button', { name: /skip & create invite/i }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to create invite. Please try again.'
      )
    )
    errSpy.mockRestore()
  })

  it('shows loader when auth loading', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })
    const { default: CreateInvitePage } = await import('./page')
    const { container } = render(<CreateInvitePage />)
    expect(container.querySelector('.animate-spin')).toBeTruthy()
  })
})
