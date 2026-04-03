import type { DocumentData } from 'firebase/firestore'
import { vi } from 'vitest'

/** Minimal mock for Firestore document snapshots in unit tests */
export const createMockDocSnapshot = (
  exists: boolean,
  data?: DocumentData,
  id?: string,
) => ({
  exists: () => exists,
  data: () => data,
  id: id || 'mock-doc-id',
})

// Mock Firestore collection snapshot
export const createMockQuerySnapshot = (
  docs: ReturnType<typeof createMockDocSnapshot>[] = [],
) => ({
  docs,
  empty: docs.length === 0,
  size: docs.length,
})

// Mock Firestore document reference
export const createMockDocRef = (id: string = 'mock-doc-id') => ({
  id,
  path: `users/${id}`,
})

// Firebase error factory
export const createFirebaseError = (
  code: string,
  message: string,
): Error & { code: string } => {
  const error = new Error(message) as Error & { code: string }
  error.code = code
  return error
}

// Common Firebase error codes
export const FIREBASE_ERRORS = {
  PERMISSION_DENIED: 'permission-denied',
  NOT_FOUND: 'not-found',
  UNAVAILABLE: 'unavailable',
  UNAUTHENTICATED: 'unauthenticated',
} as const

// Reset all Firebase mocks
export const resetFirebaseMocks = () => {
  vi.clearAllMocks()
}