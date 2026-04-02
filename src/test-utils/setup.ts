import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'
import { mockRouterPush } from './mocks'

// @base-ui/react Checkbox uses PointerEvent (not in jsdom)
if (typeof globalThis.PointerEvent === 'undefined') {
  globalThis.PointerEvent = class extends MouseEvent {
    constructor(type: string, init?: MouseEventInit) {
      super(type, init)
    }
  } as typeof PointerEvent
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

vi.mock('next/link', () => ({
  default: function Link({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode
    href: string
    [k: string]: unknown
  }) {
    return React.createElement('a', { href, ...rest }, children)
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('framer-motion', () => {
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      layoutId: _l,
      initial: _i,
      animate: _a,
      transition: _t,
      whileHover: _wh,
      whileTap: _wt,
      exit: _e,
      ...rest
    } = props
    return rest
  }
  const motion = new Proxy(
    {},
    {
      get(_, tag: string) {
        return function MotionTag({
          children,
          ...props
        }: {
          children?: React.ReactNode
          [k: string]: unknown
        }) {
          return React.createElement(
            tag,
            stripMotionProps(props as Record<string, unknown>) as never,
            children
          )
        }
      },
    }
  )
  return {
    motion,
    AnimatePresence: ({
      children,
    }: {
      children?: React.ReactNode
    }) => React.createElement(React.Fragment, null, children),
  }
})

// Mock Firebase modules globally
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  deleteDoc: vi.fn(),
  setDoc: vi.fn(),
  orderBy: vi.fn(),
  runTransaction: vi.fn(),
  Timestamp: {
    now: vi.fn(),
    fromDate: vi.fn(),
  },
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
}))