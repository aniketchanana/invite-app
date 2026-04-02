import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Invite } from '@/lib/firestore/invites'
import { TemplateRenderer } from './template-renderer'
import { BirthdayTemplate } from './birthday'
import { MarriageTemplate } from './marriage'
import { BabyShowerTemplate } from './baby-shower'
import { NewBabyTemplate } from './new-baby'

const base: Invite = {
  id: 'i1',
  hostId: 'h1',
  location: 'Hall',
  dateTime: new Date('2030-06-15T18:00:00Z'),
  heading: 'Test Party',
  hostName: 'Sam',
  templateType: 'birthday',
  createdAt: new Date(),
}

describe('invite templates', () => {
  const onRsvp = vi.fn()

  beforeEach(() => {
    onRsvp.mockClear()
  })

  it.each([
    ['birthday', BirthdayTemplate, /RSVP Now 🎉/],
    ['marriage', MarriageTemplate, /RSVP with Love/],
    ['baby-shower', BabyShowerTemplate, /RSVP Now 🎀/],
    ['new-baby', NewBabyTemplate, /RSVP Now 💕/],
  ] as const)('%s CTA calls onRsvp', async (_name, Component, cta) => {
    const user = userEvent.setup()
    render(
      <Component
        invite={{ ...base, templateType: _name as Invite['templateType'] }}
        onRsvp={onRsvp}
      />
    )
    await user.click(screen.getByRole('button', { name: cta }))
    expect(onRsvp).toHaveBeenCalled()
  })

  it('TemplateRenderer falls back to birthday for unknown type', async () => {
    const user = userEvent.setup()
    render(
      <TemplateRenderer
        invite={{ ...base, templateType: 'not-a-real-type' as Invite['templateType'] }}
        onRsvp={onRsvp}
      />
    )
    await user.click(screen.getByRole('button', { name: /RSVP Now 🎉/ }))
    expect(onRsvp).toHaveBeenCalled()
  })
})
