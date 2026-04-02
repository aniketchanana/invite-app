import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createInvite,
  deleteInvite,
  getInvite,
  getInvitesByHost,
} from './invites'

describe('invites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createInvite writes and returns id', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'inv-1' } as never)
    vi.mocked(Timestamp.fromDate).mockReturnValue('fromDate' as never)
    vi.mocked(Timestamp.now).mockReturnValue('now' as never)

    const id = await createInvite('host-1', {
      location: 'Venue',
      dateTime: new Date('2030-01-15T12:00:00Z'),
      heading: 'Party',
      hostName: 'Sam',
      templateType: 'birthday',
    })

    expect(id).toBe('inv-1')
    expect(addDoc).toHaveBeenCalled()
    const payload = vi.mocked(addDoc).mock.calls[0][1] as Record<string, unknown>
    expect(payload.hostId).toBe('host-1')
    expect(payload.dateTime).toBe('fromDate')
    expect(payload.createdAt).toBe('now')
  })

  it('getInvite returns null when missing', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as never)

    const r = await getInvite('x')
    expect(r).toBeNull()
  })

  it('getInvite maps document data', async () => {
    const dt = new Date('2030-06-01T10:00:00Z')
    const created = new Date('2030-01-01T00:00:00Z')
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 'doc1',
      data: () => ({
        hostId: 'h1',
        location: 'L',
        dateTime: { toDate: () => dt },
        heading: 'H',
        hostName: 'HN',
        templateType: 'marriage',
        createdAt: { toDate: () => created },
      }),
    } as never)

    const r = await getInvite('doc1')
    expect(r).toEqual({
      id: 'doc1',
      hostId: 'h1',
      location: 'L',
      dateTime: dt,
      heading: 'H',
      hostName: 'HN',
      templateType: 'marriage',
      createdAt: created,
    })
  })

  it('getInvitesByHost sorts by createdAt desc', async () => {
    const older = new Date('2020-01-01T00:00:00Z')
    const newer = new Date('2025-01-01T00:00:00Z')
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: 'a',
          data: () => ({
            hostId: 'h',
            location: 'L1',
            dateTime: { toDate: () => older },
            heading: 'A',
            hostName: 'X',
            templateType: 'birthday',
            createdAt: { toDate: () => older },
          }),
        },
        {
          id: 'b',
          data: () => ({
            hostId: 'h',
            location: 'L2',
            dateTime: { toDate: () => newer },
            heading: 'B',
            hostName: 'Y',
            templateType: 'birthday',
            createdAt: { toDate: () => newer },
          }),
        },
      ],
    } as never)

    const list = await getInvitesByHost('h')
    expect(query).toHaveBeenCalled()
    expect(where).toHaveBeenCalledWith('hostId', '==', 'h')
    expect(list.map((i) => i.id)).toEqual(['b', 'a'])
  })

  it('deleteInvite calls deleteDoc', async () => {
    await deleteInvite('inv-x')
    expect(deleteDoc).toHaveBeenCalled()
    expect(doc).toHaveBeenCalled()
  })
})
