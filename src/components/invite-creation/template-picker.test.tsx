import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TemplatePicker } from './template-picker'

describe('TemplatePicker', () => {
  it('selects template, enables next, and calls back', async () => {
    const onSelect = vi.fn()
    const onNext = vi.fn()
    const onBack = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(
      <TemplatePicker
        selected={null}
        onSelect={onSelect}
        onNext={onNext}
        onBack={onBack}
      />
    )

    const nextBtns = screen.getAllByRole('button', {
      name: /next: gift registry/i,
    })
    expect(nextBtns[0]).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /birthday party/i }))
    expect(onSelect).toHaveBeenCalledWith('birthday')

    rerender(
      <TemplatePicker
        selected="birthday"
        onSelect={onSelect}
        onNext={onNext}
        onBack={onBack}
      />
    )

    await user.click(
      screen.getAllByRole('button', { name: /next: gift registry/i })[0]
    )
    expect(onNext).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /^back$/i }))
    expect(onBack).toHaveBeenCalled()
  })
})
