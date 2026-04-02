import { vi } from 'vitest'

/** Shared `useRouter().push` mock — reset in tests with `mockClear()`. */
export const mockRouterPush = vi.fn()
