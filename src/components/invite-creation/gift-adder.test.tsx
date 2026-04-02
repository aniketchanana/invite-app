import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GiftAdder } from './gift-adder'

describe('GiftAdder', () => {
  it('adds gift with trimmed link and shows external link', async () => {
    const onGiftsChange = vi.fn()
    const user = userEvent.setup()
    render(
      <GiftAdder
        gifts={[]}
        onGiftsChange={onGiftsChange}
        onSubmit={vi.fn()}
        onBack={vi.fn()}
        submitting={false}
      />
    )

    await user.type(screen.getByLabelText(/gift name/i), 'Mixer')
    await user.type(screen.getByLabelText(/product link/i), ' https://shop.example/x ')
    await user.click(screen.getByRole('button', { name: /add gift/i }))

    expect(onGiftsChange).toHaveBeenCalledWith([
      { name: 'Mixer', link: 'https://shop.example/x' },
    ])
  })

  it('does not add duplicate name', async () => {
    const onGiftsChange = vi.fn()
    const user = userEvent.setup()
    render(
      <GiftAdder
        gifts={[{ name: 'Same', link: '' }]}
        onGiftsChange={onGiftsChange}
        onSubmit={vi.fn()}
        onBack={vi.fn()}
        submitting={false}
      />
    )

    await user.type(screen.getByLabelText(/gift name/i), 'Same')
    await user.click(screen.getByRole('button', { name: /add gift/i }))
    expect(onGiftsChange).not.toHaveBeenCalled()
  })

  it('adds via Enter key on gift name field', async () => {
    const onGiftsChange = vi.fn()
    const user = userEvent.setup()
    render(
      <GiftAdder
        gifts={[]}
        onGiftsChange={onGiftsChange}
        onSubmit={vi.fn()}
        onBack={vi.fn()}
        submitting={false}
      />
    )

    await user.type(screen.getByLabelText(/gift name/i), 'Vase{Enter}')
    expect(onGiftsChange).toHaveBeenCalledWith([{ name: 'Vase', link: '' }])
  })

  it('adds via Enter key on link field', async () => {
    const onGiftsChange = vi.fn()
    const user = userEvent.setup()
    render(
      <GiftAdder
        gifts={[]}
        onGiftsChange={onGiftsChange}
        onSubmit={vi.fn()}
        onBack={vi.fn()}
        submitting={false}
      />
    )

    await user.type(screen.getByLabelText(/gift name/i), 'Toy')
    await user.type(screen.getByLabelText(/product link/i), '{Enter}')
    expect(onGiftsChange).toHaveBeenCalledWith([{ name: 'Toy', link: '' }])
  })

  it('removes gift row', async () => {
    const onGiftsChange = vi.fn()
    const user = userEvent.setup()
    render(
      <GiftAdder
        gifts={[{ name: 'RemoveMe', link: 'https://z.com' }]}
        onGiftsChange={onGiftsChange}
        onSubmit={vi.fn()}
        onBack={vi.fn()}
        submitting={false}
      />
    )

    const row = screen.getByText('RemoveMe').closest('div')?.parentElement
    const removeBtn = row?.querySelector('button.rounded-full')
    expect(removeBtn).toBeTruthy()
    await user.click(removeBtn!)
    expect(onGiftsChange).toHaveBeenCalledWith([])
  })

  it('calls onSubmit with skip label when no gifts', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <GiftAdder
        gifts={[]}
        onGiftsChange={vi.fn()}
        onSubmit={onSubmit}
        onBack={vi.fn()}
        submitting={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /skip & create invite/i }))
    expect(onSubmit).toHaveBeenCalled()
  })

  it('calls onBack', async () => {
    const onBack = vi.fn()
    const user = userEvent.setup()
    render(
      <GiftAdder
        gifts={[{ name: 'G', link: '' }]}
        onGiftsChange={vi.fn()}
        onSubmit={vi.fn()}
        onBack={onBack}
        submitting={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalled()
  })

  it('Enter on link field without gift name does not add', async () => {
    const onGiftsChange = vi.fn()
    const user = userEvent.setup()
    render(
      <GiftAdder
        gifts={[]}
        onGiftsChange={onGiftsChange}
        onSubmit={vi.fn()}
        onBack={vi.fn()}
        submitting={false}
      />
    )

    await user.type(screen.getByLabelText(/product link/i), '{Enter}')
    expect(onGiftsChange).not.toHaveBeenCalled()
  })

  it('disables primary action while submitting', () => {
    render(
      <GiftAdder
        gifts={[{ name: 'G', link: '' }]}
        onGiftsChange={vi.fn()}
        onSubmit={vi.fn()}
        onBack={vi.fn()}
        submitting
      />
    )

    const primary = screen.getAllByRole('button').find((b) =>
      b.className.includes('party-gradient')
    )
    expect(primary).toBeDefined()
    expect(primary).toBeDisabled()
  })
})
