import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InviteList } from './invite-list'

const firestoreMocks = vi.hoisted(() => ({
  getInvitesByHost: vi.fn(),
  deleteInvite: vi.fn(),
  getRSVPs: vi.fn(),
  getGifts: vi.fn(),
  addGift: vi.fn(),
  removeGift: vi.fn(),
}))

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { uid: 'host-1', email: 'h@example.com' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}))

vi.mock('@/lib/firestore/invites', () => ({
  getInvitesByHost: firestoreMocks.getInvitesByHost,
  deleteInvite: firestoreMocks.deleteInvite,
}))

vi.mock('@/lib/firestore/rsvps', () => ({
  getRSVPs: firestoreMocks.getRSVPs,
}))

vi.mock('@/lib/firestore/gifts', () => ({
  getGifts: firestoreMocks.getGifts,
  addGift: firestoreMocks.addGift,
  removeGift: firestoreMocks.removeGift,
}))

const invite = {
  id: 'inv-1',
  hostId: 'host-1',
  location: 'Venue',
  dateTime: new Date('2030-06-01T18:00:00Z'),
  heading: 'Summer Bash',
  hostName: 'Alex',
  templateType: 'birthday' as const,
  createdAt: new Date('2030-01-01T00:00:00Z'),
}

describe('InviteList', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
    firestoreMocks.getInvitesByHost.mockReset()
    firestoreMocks.deleteInvite.mockReset()
    firestoreMocks.getRSVPs.mockReset()
    firestoreMocks.getGifts.mockReset()
    firestoreMocks.addGift.mockReset()
    firestoreMocks.removeGift.mockReset()

    firestoreMocks.getInvitesByHost.mockResolvedValue([invite])
    firestoreMocks.getRSVPs.mockResolvedValue([])
    firestoreMocks.getGifts.mockResolvedValue([])
    firestoreMocks.deleteInvite.mockResolvedValue(undefined)
    firestoreMocks.addGift.mockResolvedValue('new-gift')
    firestoreMocks.removeGift.mockResolvedValue(undefined)

    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })
  })

  it('shows loading then invites', async () => {
    firestoreMocks.getInvitesByHost.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve([invite]), 50)
        )
    )
    render(<InviteList />)
    expect(document.querySelector('.animate-spin')).toBeTruthy()
    await waitFor(() =>
      expect(screen.getByText('Summer Bash')).toBeInTheDocument()
    )
  })

  it('shows empty state', async () => {
    firestoreMocks.getInvitesByHost.mockResolvedValue([])
    render(<InviteList />)
    await waitFor(() =>
      expect(screen.getByText(/no invites yet/i)).toBeInTheDocument()
    )
  })

  it('copies invite link', async () => {
    const user = userEvent.setup()
    render(<InviteList />)
    await waitFor(() => screen.getByText('Summer Bash'))

    await user.click(screen.getByRole('button', { name: /copy link/i }))
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Invite link copied!')
    )
  })

  it('deletes invite', async () => {
    const user = userEvent.setup()
    render(<InviteList />)
    await waitFor(() => screen.getByText('Summer Bash'))

    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(firestoreMocks.deleteInvite).toHaveBeenCalledWith('inv-1')
    expect(toast.success).toHaveBeenCalledWith('Invite deleted')
  })

  it('toasts on delete failure', async () => {
    firestoreMocks.deleteInvite.mockRejectedValue(new Error('fail'))
    const user = userEvent.setup()
    render(<InviteList />)
    await waitFor(() => screen.getByText('Summer Bash'))

    await user.click(screen.getByRole('button', { name: /delete/i }))
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to delete invite')
    )
  })

  it('expands details and shows RSVPs and gifts', async () => {
    firestoreMocks.getRSVPs.mockResolvedValue([
      {
        id: 'r1',
        guestName: 'Guest',
        pax: 2,
        timestamp: new Date(),
      },
    ])
    firestoreMocks.getGifts.mockResolvedValue([
      {
        id: 'g1',
        itemName: 'Mug',
        link: null,
        isClaimed: false,
        claimedBy: null,
      },
      {
        id: 'g2',
        itemName: 'Taken',
        link: 'https://x.com',
        isClaimed: true,
        claimedBy: 'Bob',
      },
    ])

    const user = userEvent.setup()
    render(<InviteList />)
    await waitFor(() => screen.getByText('Summer Bash'))

    await user.click(screen.getByRole('button', { name: /details/i }))
    await waitFor(() => expect(screen.getByText('Guest')).toBeInTheDocument())
    expect(screen.getByText('Taken')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('adds and removes gift in expanded section', async () => {
    firestoreMocks.getGifts.mockResolvedValue([
      {
        id: 'g1',
        itemName: 'Mug',
        link: null,
        isClaimed: false,
        claimedBy: null,
      },
    ])
    const user = userEvent.setup()
    render(<InviteList />)
    await waitFor(() => screen.getByText('Summer Bash'))
    await user.click(screen.getByRole('button', { name: /details/i }))

    await waitFor(() => screen.getByPlaceholderText('Gift name...'))
    await user.type(screen.getByPlaceholderText('Gift name...'), 'New')
    await user.click(screen.getByRole('button', { name: /^add gift$/i }))
    expect(firestoreMocks.addGift).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalled()

    const removeBtns = screen.getAllByRole('button').filter((b) =>
      b.querySelector('svg.lucide-x')
    )
    await user.click(removeBtns[removeBtns.length - 1]!)
    expect(firestoreMocks.removeGift).toHaveBeenCalled()
  })

  it('toasts when add gift fails', async () => {
    firestoreMocks.getGifts.mockResolvedValue([])
    firestoreMocks.addGift.mockRejectedValueOnce(new Error('fail'))
    const user = userEvent.setup()
    render(<InviteList />)
    await waitFor(() => screen.getByText('Summer Bash'))
    await user.click(screen.getByRole('button', { name: /details/i }))
    await waitFor(() => screen.getByPlaceholderText('Gift name...'))
    await user.type(screen.getByPlaceholderText('Gift name...'), 'X')
    await user.click(screen.getByRole('button', { name: /^add gift$/i }))
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to add gift')
    )
  })

  it('adds gift via Enter on name input', async () => {
    firestoreMocks.getGifts.mockResolvedValue([])
    const user = userEvent.setup()
    render(<InviteList />)
    await waitFor(() => screen.getByText('Summer Bash'))
    await user.click(screen.getByRole('button', { name: /details/i }))
    await waitFor(() => screen.getByPlaceholderText('Gift name...'))

    const nameInput = screen.getByPlaceholderText('Gift name...')
    await user.type(nameInput, 'Tea')
    fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' })
    expect(firestoreMocks.addGift).toHaveBeenCalled()

    firestoreMocks.addGift.mockClear()
    await user.type(nameInput, 'Kettle')
    const linkInput = screen.getByPlaceholderText('Product link (optional)')
    await user.type(linkInput, 'https://x.com')
    fireEvent.keyDown(linkInput, { key: 'Enter', code: 'Enter' })
    expect(firestoreMocks.addGift).toHaveBeenCalled()
  })

  it('toasts when remove gift fails', async () => {
    firestoreMocks.getGifts.mockResolvedValue([
      {
        id: 'g1',
        itemName: 'Mug',
        link: null,
        isClaimed: false,
        claimedBy: null,
      },
    ])
    firestoreMocks.removeGift.mockRejectedValueOnce(new Error('nope'))
    const user = userEvent.setup()
    render(<InviteList />)
    await waitFor(() => screen.getByText('Summer Bash'))
    await user.click(screen.getByRole('button', { name: /details/i }))
    await waitFor(() => screen.getByText('Mug'))
    const removeBtns = screen.getAllByRole('button').filter((b) =>
      b.querySelector('svg.lucide-x')
    )
    await user.click(removeBtns[removeBtns.length - 1]!)
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to remove gift')
    )
  })

  it('shows unknown template label fallback', async () => {
    firestoreMocks.getInvitesByHost.mockResolvedValue([
      {
        ...invite,
        templateType: 'weird-type' as never,
      },
    ])
    render(<InviteList />)
    await waitFor(() =>
      expect(screen.getByText('weird-type')).toBeInTheDocument()
    )
  })
})
