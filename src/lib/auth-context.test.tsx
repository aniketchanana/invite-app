import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from './auth-context'

function OutsideProvider() {
  useAuth()
  return null
}

function Harness() {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="uid">{user?.uid ?? 'none'}</span>
      <button type="button" onClick={() => signIn('a@b.com', 'secret12')}>
        signin
      </button>
      <button type="button" onClick={() => signUp('c@d.com', 'secret12')}>
        signup
      </button>
      <button type="button" onClick={() => signOut()}>
        signout
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  let authCallback: ((u: { uid: string } | null) => void) | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    authCallback = undefined
    vi.mocked(onAuthStateChanged).mockImplementation((_a, cb) => {
      authCallback = cb as typeof authCallback
      return vi.fn()
    })
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue(undefined as never)
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: { uid: 'u-new', email: 'c@d.com' },
    } as never)
    vi.mocked(setDoc).mockResolvedValue(undefined as never)
    vi.mocked(firebaseSignOut).mockResolvedValue(undefined as never)
  })

  it('useAuth throws outside AuthProvider', () => {
    expect(() => render(<OutsideProvider />)).toThrow(
      'useAuth must be used within AuthProvider'
    )
  })

  it('sets user from onAuthStateChanged and clears loading', async () => {
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading').textContent).toBe('true')
    authCallback?.({ uid: 'u-1' } as never)

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
    expect(screen.getByTestId('uid').textContent).toBe('u-1')
  })

  it('signIn calls firebase signIn', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    )
    authCallback?.(null)
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )

    await user.click(screen.getByRole('button', { name: 'signin' }))
    expect(signInWithEmailAndPassword).toHaveBeenCalled()
  })

  it('signUp creates user and setDoc', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    )
    authCallback?.(null)
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )

    await user.click(screen.getByRole('button', { name: 'signup' }))
    expect(createUserWithEmailAndPassword).toHaveBeenCalled()
    expect(setDoc).toHaveBeenCalled()
    expect(doc).toHaveBeenCalled()
  })

  it('signOut calls firebase signOut', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    )
    authCallback?.(null)
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )

    await user.click(screen.getByRole('button', { name: 'signout' }))
    expect(firebaseSignOut).toHaveBeenCalled()
  })
})
