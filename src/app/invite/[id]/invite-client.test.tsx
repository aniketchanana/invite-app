import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InviteClient } from './invite-client'

vi.mock('@/lib/firestore/gifts', () => ({
  getAvailableGifts: vi.fn().mockResolvedValue([]),
  claimGifts: vi.fn(),
}))

vi.mock('@/lib/firestore/rsvps', () => ({
  createRSVP: vi.fn(),
}))

describe('InviteClient', () => {
  it('opens RSVP dialog when template triggers onRsvp', async () => {
    const user = userEvent.setup()
    const invite = {
      id: 'inv-1',
      hostId: 'h',
      location: 'L',
      dateTime: new Date('2030-01-01').toISOString(),
      heading: 'Party',
      hostName: 'H',
      templateType: 'birthday' as const,
      createdAt: new Date().toISOString(),
    }

    render(<InviteClient invite={invite} />)

    await user.click(screen.getByRole('button', { name: /RSVP Now 🎉/ }))
    expect(screen.getByText('RSVP')).toBeInTheDocument()
  })
})
