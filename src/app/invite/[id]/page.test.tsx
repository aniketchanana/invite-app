import { render, screen } from '@testing-library/react'
import { getDoc } from 'firebase/firestore'
import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('invite/[id]/page', () => {
  beforeEach(() => {
    vi.mocked(getDoc).mockReset()
  })

  it('generateMetadata when invite missing', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as never)
    const { generateMetadata } = await import('./page')
    const m = await generateMetadata({
      params: Promise.resolve({ id: 'missing' }),
    })
    expect(m.title).toBe('Invite Not Found')
  })

  it('generateMetadata when invite exists', async () => {
    const dt = new Date('2030-07-04T12:00:00Z')
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 'inv-1',
      data: () => ({
        hostId: 'h',
        location: 'Park',
        dateTime: { toDate: () => dt },
        heading: 'BBQ',
        hostName: 'Chris',
        templateType: 'birthday',
        createdAt: { toDate: () => new Date() },
      }),
    } as never)

    const { generateMetadata } = await import('./page')
    const m = await generateMetadata({
      params: Promise.resolve({ id: 'inv-1' }),
    })
    expect(m.title).toBe('BBQ')
    expect(String(m.description)).toContain('Chris')
  })

  it('renders 404 when invite missing', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as never)
    const { default: InvitePage } = await import('./page')
    const node = await InvitePage({
      params: Promise.resolve({ id: 'x' }),
    })
    render(node)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders invite client when invite exists', async () => {
    const dt = new Date('2030-07-04T12:00:00Z')
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 'inv-1',
      data: () => ({
        hostId: 'h',
        location: 'Park',
        dateTime: { toDate: () => dt },
        heading: 'BBQ Night',
        hostName: 'Chris',
        templateType: 'birthday',
        createdAt: { toDate: () => new Date() },
      }),
    } as never)

    const { default: InvitePage } = await import('./page')
    const node = await InvitePage({
      params: Promise.resolve({ id: 'inv-1' }),
    })
    render(node)
    expect(screen.getByText('BBQ Night')).toBeInTheDocument()
  })
})
