import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GiftSelector } from './gift-selector'
import type { Gift } from '@/lib/firestore/gifts'

const gift: Gift = {
  id: 'g1',
  itemName: 'Book',
  link: null,
  isClaimed: false,
  claimedBy: null,
}

const giftWithLink: Gift = {
  ...gift,
  id: 'g2',
  itemName: 'Mug',
  link: 'https://shop.example',
}

describe('GiftSelector', () => {
  it('returns null when no gifts', () => {
    const { container } = render(
      <GiftSelector gifts={[]} selectedIds={[]} onToggle={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('toggles selection and shows link when present', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(
      <GiftSelector
        gifts={[gift, giftWithLink]}
        selectedIds={['g1']}
        onToggle={onToggle}
      />
    )

    expect(screen.getByText('Book')).toBeInTheDocument()
    expect(screen.getByText('View product')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: /book/i }))
    expect(onToggle).toHaveBeenCalledWith('g1')
  })
})
