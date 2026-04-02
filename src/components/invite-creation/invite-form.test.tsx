import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InviteForm, type InviteFormValues } from './invite-form'

describe('InviteForm', () => {
  const onChange = vi.fn()
  const onNext = vi.fn()

  beforeEach(() => {
    onChange.mockClear()
    onNext.mockClear()
  })

  const base: InviteFormValues = {
    location: '',
    dateTime: '',
    heading: '',
    hostName: '',
  }

  function renderForm(values: InviteFormValues) {
    return render(
      <InviteForm values={values} onChange={onChange} onNext={onNext} />
    )
  }

  it('calls onNext when valid', async () => {
    const user = userEvent.setup()
    const values: InviteFormValues = {
      heading: "You're invited!",
      hostName: 'Sam',
      location: 'Hall',
      dateTime: '2099-06-15T16:00',
    }
    renderForm(values)

    await user.click(screen.getByRole('button', { name: /next: choose template/i }))
    expect(onNext).toHaveBeenCalled()
  })

  it('shows errors when fields invalid on submit', async () => {
    const user = userEvent.setup()
    renderForm(base)

    await user.click(screen.getByRole('button', { name: /next: choose template/i }))

    expect(onNext).not.toHaveBeenCalled()
    expect(screen.getByText('Party heading is required')).toBeInTheDocument()
    expect(screen.getByText('Host name is required')).toBeInTheDocument()
    expect(screen.getByText('Location is required')).toBeInTheDocument()
    expect(screen.getByText('Date and time are required')).toBeInTheDocument()
  })

  it('validates heading min length', async () => {
    const user = userEvent.setup()
    renderForm({
      ...base,
      heading: 'ab',
      hostName: 'Sam',
      location: 'L',
      dateTime: '2099-06-15T16:00',
    })

    await user.click(screen.getByRole('button', { name: /next: choose template/i }))
    expect(screen.getByText('Heading must be at least 3 characters')).toBeInTheDocument()
    expect(onNext).not.toHaveBeenCalled()
  })

  it('validates past date', async () => {
    const user = userEvent.setup()
    renderForm({
      heading: 'Party time',
      hostName: 'Sam',
      location: 'L',
      dateTime: '2000-01-01T12:00',
    })

    await user.click(screen.getByRole('button', { name: /next: choose template/i }))
    expect(screen.getByText('Date must be in the future')).toBeInTheDocument()
    expect(onNext).not.toHaveBeenCalled()
  })

  it('validates invalid date string', async () => {
    const user = userEvent.setup()
    renderForm({
      heading: 'Party time here',
      hostName: 'Sam',
      location: 'L',
      dateTime: 'not-a-date',
    })

    await user.click(screen.getByRole('button', { name: /next: choose template/i }))
    expect(
      screen.getByText('Please enter a valid date and time')
    ).toBeInTheDocument()
    expect(onNext).not.toHaveBeenCalled()
  })

  it('shows field error on blur', async () => {
    const user = userEvent.setup()
    renderForm({
      ...base,
      heading: 'Valid heading text',
      hostName: '',
      location: '',
      dateTime: '',
    })

    await user.click(screen.getByLabelText(/host \/ organizer name/i))
    await user.tab()
    expect(screen.getByText('Host name is required')).toBeInTheDocument()
  })
})
