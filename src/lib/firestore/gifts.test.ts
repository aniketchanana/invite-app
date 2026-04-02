import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addGift,
  addGifts,
  claimGifts,
  getAvailableGifts,
  getGifts,
  removeGift,
} from './gifts'

describe('gifts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('addGift trims link to null when empty', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'g1' } as never)

    await addGift('inv-1', 'Book', '  ')
    let payload = vi.mocked(addDoc).mock.calls[0][1] as { link: unknown }
    expect(payload.link).toBeNull()

    vi.mocked(addDoc).mockResolvedValue({ id: 'g2' } as never)
    await addGift('inv-1', 'Mug')
    payload = vi.mocked(addDoc).mock.calls[1][1] as { link: unknown }
    expect(payload.link).toBeNull()

    vi.mocked(addDoc).mockResolvedValue({ id: 'g3' } as never)
    await addGift('inv-1', 'Toy', ' https://x.com ')
    payload = vi.mocked(addDoc).mock.calls[2][1] as { link: string }
    expect(payload.link).toBe('https://x.com')
  })

  it('addGifts maps items with trimmed links', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'x' } as never)
    await addGifts('inv-1', [
      { name: 'A', link: '  ' },
      { name: 'B', link: 'https://b' },
    ])
    expect(addDoc).toHaveBeenCalledTimes(2)
    const p0 = vi.mocked(addDoc).mock.calls[0][1] as { link: unknown }
    const p1 = vi.mocked(addDoc).mock.calls[1][1] as { link: string }
    expect(p0.link).toBeNull()
    expect(p1.link).toBe('https://b')
  })

  it('getGifts maps link with nullish coalescing', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: '1',
          data: () => ({
            itemName: 'X',
            link: undefined,
            isClaimed: false,
            claimedBy: null,
          }),
        },
      ],
    } as never)

    const g = await getGifts('inv-1')
    expect(g[0].link).toBeNull()
  })

  it('getAvailableGifts filters unclaimed', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never)
    await getAvailableGifts('inv-1')
    expect(where).toHaveBeenCalledWith('isClaimed', '==', false)
  })

  it('getAvailableGifts maps docs with link nullish', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: 'g1',
          data: () => ({
            itemName: 'A',
            link: undefined,
            isClaimed: false,
            claimedBy: null,
          }),
        },
      ],
    } as never)
    const list = await getAvailableGifts('inv-1')
    expect(list[0].link).toBeNull()
  })

  it('claimGifts updates when all gifts exist and unclaimed', async () => {
    vi.mocked(runTransaction).mockImplementation(async (_db, fn) => {
      const transaction = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ isClaimed: false }),
        }),
        update: vi.fn(),
      }
      await fn(transaction as never)
      expect(transaction.update).toHaveBeenCalledTimes(2)
    })

    await claimGifts('inv-1', ['g1', 'g2'], 'Alice')
    expect(runTransaction).toHaveBeenCalled()
  })

  it('claimGifts throws when gift missing', async () => {
    vi.mocked(runTransaction).mockImplementation(async (_db, fn) => {
      const transaction = {
        get: vi.fn().mockResolvedValue({
          exists: () => false,
          data: () => ({}),
        }),
        update: vi.fn(),
      }
      await fn(transaction as never)
    })

    await expect(claimGifts('inv-1', ['g1'], 'Bob')).rejects.toThrow(
      'Gift no longer exists'
    )
  })

  it('claimGifts throws when already claimed', async () => {
    vi.mocked(runTransaction).mockImplementation(async (_db, fn) => {
      const transaction = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ isClaimed: true }),
        }),
        update: vi.fn(),
      }
      await fn(transaction as never)
    })

    await expect(claimGifts('inv-1', ['g1'], 'Bob')).rejects.toThrow(
      'Gift already claimed'
    )
  })

  it('removeGift deletes doc', async () => {
    await removeGift('inv-1', 'gift-1')
    expect(deleteDoc).toHaveBeenCalled()
    expect(doc).toHaveBeenCalled()
  })
})
