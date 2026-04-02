import { addDoc, getDocs, orderBy, query, Timestamp } from 'firebase/firestore'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRSVP, getRSVPs } from './rsvps'

describe('rsvps', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createRSVP adds doc and returns id', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'rsvp-1' } as never)
    vi.mocked(Timestamp.now).mockReturnValue('ts' as never)

    const id = await createRSVP('inv-1', 'Guest', 2)
    expect(id).toBe('rsvp-1')
    expect(addDoc).toHaveBeenCalled()
    const data = vi.mocked(addDoc).mock.calls[0][1] as Record<string, unknown>
    expect(data.guestName).toBe('Guest')
    expect(data.pax).toBe(2)
    expect(data.timestamp).toBe('ts')
  })

  it('getRSVPs orders by timestamp desc and maps', async () => {
    const t = new Date('2030-01-01T00:00:00Z')
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: 'r1',
          data: () => ({
            guestName: 'A',
            pax: 1,
            timestamp: { toDate: () => t },
          }),
        },
      ],
    } as never)

    const list = await getRSVPs('inv-1')
    expect(orderBy).toHaveBeenCalledWith('timestamp', 'desc')
    expect(query).toHaveBeenCalled()
    expect(list).toEqual([
      { id: 'r1', guestName: 'A', pax: 1, timestamp: t },
    ])
  })
})
