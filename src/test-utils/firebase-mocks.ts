import { vi } from 'vitest'

// Mock Firestore document snapshot (typed as any for simple unit tests)
export const createMockDocSnapshot = (exists: boolean, data?: any, id?: string): any => ({
  exists: () => exists,
  data: () => data,
  id: id || 'mock-doc-id',
})

// Mock Firestore collection snapshot
export const createMockQuerySnapshot = (docs: any[] = []) => ({
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
export const createFirebaseError = (code: string, message: string) => {
  const error = new Error(message) as any
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