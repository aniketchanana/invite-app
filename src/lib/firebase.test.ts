import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import * as firebaseApp from 'firebase/app'

describe('firebase init', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.mocked(firebaseApp.getApps).mockReset()
    vi.mocked(firebaseApp.initializeApp).mockReset()
  })

  it('initializes app when getApps is empty', async () => {
    vi.mocked(firebaseApp.getApps).mockImplementation(() => [] as never)
    const fresh = { name: 'fresh' }
    vi.mocked(firebaseApp.initializeApp).mockReturnValue(fresh as never)
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'k'
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'a'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'p'
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 's'
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'm'
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'i'
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'x'

    const mod = await import('./firebase')
    expect(firebaseApp.initializeApp).toHaveBeenCalled()
    expect(mod.default).toBe(fresh)
  })

  it('reuses existing app when getApps is non-empty', async () => {
    const existing = { name: 'existing' }
    vi.mocked(firebaseApp.getApps).mockImplementation(() => [existing] as never)

    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'k'
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'a'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'p'
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 's'
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'm'
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'i'
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'x'

    const mod = await import('./firebase')
    expect(firebaseApp.initializeApp).not.toHaveBeenCalled()
    expect(mod.default).toBe(existing)
  })
})
