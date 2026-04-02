import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RsvpDialog } from './rsvp-dialog'

const mocks = vi.hoisted(() => ({
  getAvailableGifts: vi.fn(),
  claimGifts: vi.fn(),
  createRSVP: vi.fn(),
}))

vi.mock('@/lib/firestore/gifts', () => ({
  getAvailableGifts: mocks.getAvailableGifts,
  claimGifts: mocks.claimGifts,
}))

vi.mock('@/lib/firestore/rsvps', () => ({
  createRSVP: mocks.createRSVP,
}))

describe('RsvpDialog', () => {
  beforeEach(() => {
    mocks.getAvailableGifts.mockReset()
    mocks.claimGifts.mockReset()
    mocks.createRSVP.mockReset()
    mocks.getAvailableGifts.mockResolvedValue([])
    mocks.claimGifts.mockResolvedValue(undefined)
    mocks.createRSVP.mockResolvedValue('r1')
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
  })

  it('loads gifts when open', async () => {
    mocks.getAvailableGifts.mockResolvedValue([
      {
        id: 'g1',
        itemName: 'Vase',
        link: null,
        isClaimed: false,
        claimedBy: null,
      },
    ])

    render(<RsvpDialog inviteId="inv-1" open onOpenChange={vi.fn()} />)

    await waitFor(() => expect(screen.getByText('Vase')).toBeInTheDocument())
    expect(mocks.getAvailableGifts).toHaveBeenCalledWith('inv-1')
  })

  it('submits RSVP without gifts', async () => {
    const user = userEvent.setup()
    render(<RsvpDialog inviteId="inv-1" open onOpenChange={vi.fn()} />)

    await waitFor(() => expect(mocks.getAvailableGifts).toHaveBeenCalled())

    await user.type(screen.getByPlaceholderText(/enter your name/i), 'Alex')
    await user.click(screen.getByRole('button', { name: /submit rsvp/i }))

    expect(mocks.claimGifts).not.toHaveBeenCalled()
    expect(mocks.createRSVP).toHaveBeenCalledWith('inv-1', 'Alex', 1)
    expect(toast.success).toHaveBeenCalled()
  })

  it('claims gifts with anonymous label', async () => {
    mocks.getAvailableGifts.mockResolvedValue([
      {
        id: 'g1',
        itemName: 'Vase',
        link: null,
        isClaimed: false,
        claimedBy: null,
      },
    ])
    const user = userEvent.setup()
    render(<RsvpDialog inviteId="inv-1" open onOpenChange={vi.fn()} />)

    await waitFor(() => screen.getByText('Vase'))
    await user.click(screen.getByRole('checkbox', { name: /vase/i }))
    await user.type(screen.getByPlaceholderText(/enter your name/i), 'Sam')
    await user.click(
      screen.getByRole('checkbox', { name: /keep my name anonymous/i })
    )
    await user.click(screen.getByRole('button', { name: /submit rsvp/i }))

    expect(mocks.claimGifts).toHaveBeenCalledWith('inv-1', ['g1'], 'Anonymous')
  })

  it('handles already-claimed error and refetches', async () => {
    mocks.getAvailableGifts
      .mockResolvedValueOnce([
        {
          id: 'g1',
          itemName: 'Vase',
          link: null,
          isClaimed: false,
          claimedBy: null,
        },
      ])
      .mockResolvedValueOnce([])
    mocks.claimGifts.mockRejectedValue(new Error('Gift already claimed'))

    const user = userEvent.setup()
    render(<RsvpDialog inviteId="inv-1" open onOpenChange={vi.fn()} />)

    await waitFor(() => screen.getByText('Vase'))
    await user.click(screen.getByRole('checkbox', { name: /vase/i }))
    await user.type(screen.getByPlaceholderText(/enter your name/i), 'Sam')
    await user.click(screen.getByRole('button', { name: /submit rsvp/i }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'One or more gifts were just claimed. Please re-select.'
      )
    )
    expect(mocks.getAvailableGifts).toHaveBeenCalledTimes(2)
  })

  it('shows generic error', async () => {
    mocks.createRSVP.mockRejectedValue(new Error('network'))
    const user = userEvent.setup()
    render(<RsvpDialog inviteId="inv-1" open onOpenChange={vi.fn()} />)
    await waitFor(() => mocks.getAvailableGifts.mock.calls.length)
    await user.type(screen.getByPlaceholderText(/enter your name/i), 'Sam')
    await user.click(screen.getByRole('button', { name: /submit rsvp/i }))
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('network')
    )
  })

  it('calls onOpenChange when Done after submit', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<RsvpDialog inviteId="inv-1" open onOpenChange={onOpenChange} />)
    await waitFor(() => mocks.getAvailableGifts.mock.calls.length)

    await user.type(screen.getByPlaceholderText(/enter your name/i), 'Pat')
    await user.click(screen.getByRole('button', { name: /submit rsvp/i }))
    await waitFor(() => screen.getByText(/you're in!/i))

    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('returns early when name empty on submit', async () => {
    const { fireEvent } = await import('@testing-library/react')
    render(<RsvpDialog inviteId="inv-1" open onOpenChange={vi.fn()} />)
    await waitFor(() => mocks.getAvailableGifts.mock.calls.length)

    const form = screen.getByPlaceholderText(/enter your name/i).closest('form')
    expect(form).toBeTruthy()
    fireEvent.submit(form!)
    expect(mocks.createRSVP).not.toHaveBeenCalled()
  })
})
