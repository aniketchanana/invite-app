# Firestore User Profile Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for Firestore fetching logic for user profile components, focusing on unit tests with proper mocking and error handling.

## Test Architecture

### 1. Testing Stack
- **Test Runner**: Vitest (fast, modern alternative to Jest)
- **Component Testing**: React Testing Library
- **User Interactions**: @testing-library/user-event
- **Mocking**: Vitest's built-in `vi.mock()` and `vi.fn()`
- **Firebase Mocking**: Complete SDK mocking (never hit real Firestore)

### 2. Test Structure

```
src/
├── test-utils/
│   ├── setup.ts              # Global test setup and Firebase mocks
│   ├── firebase-mocks.ts     # Firebase mock utilities and factories
│   └── render.tsx            # Custom render with providers
├── lib/firestore/
│   ├── users.ts              # Firestore helper functions
│   └── users.test.ts         # Unit tests for Firestore helpers
├── hooks/
│   ├── useUserProfile.ts     # React hook for profile fetching
│   └── useUserProfile.test.ts # Hook unit tests
└── components/profile/
    ├── UserProfile.tsx       # Profile component
    └── UserProfile.test.tsx  # Integration tests
```

## Test Categories

### 1. Firestore Helper Tests (`users.test.ts`)

**Purpose**: Test pure functions that interact with Firestore SDK

**Test Cases**:
- ✅ **Success Path**: Document exists and returns complete profile
- ✅ **Missing Document**: Document doesn't exist, returns null
- ✅ **Partial Data**: Handle missing optional fields gracefully
- ✅ **Firebase Errors**: Permission denied, service unavailable, unauthenticated
- ✅ **Data Transformation**: Timestamp conversion, field mapping
- ✅ **Create/Update Operations**: Profile creation and updates

**Mocking Strategy**:
```typescript
// Mock Firebase modules at module level
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  Timestamp: { now: vi.fn(), fromDate: vi.fn() },
}))

// Create mock document snapshots
const mockSnapshot = createMockDocSnapshot(true, mockData, userId)
mockGetDoc.mockResolvedValue(mockSnapshot)
```

### 2. React Hook Tests (`useUserProfile.test.ts`)

**Purpose**: Test React hook behavior, state management, and lifecycle

**Test Cases**:
- ✅ **Initial State**: Correct initial values when userId is null
- ✅ **Loading States**: Proper loading state transitions
- ✅ **Success Flow**: Profile fetching and state updates
- ✅ **Error Handling**: Error state management and recovery
- ✅ **Refetch Functionality**: Manual profile refresh
- ✅ **UserId Changes**: Hook updates when userId prop changes
- ✅ **Unmount Protection**: No state updates after component unmount
- ✅ **Null UserId**: Handle null userId gracefully

**Key Testing Patterns**:
```typescript
// Test async state transitions
await waitFor(() => {
  expect(result.current.loading).toBe(false)
})

// Test unmount protection
const { unmount } = renderHook(() => useUserProfile(userId))
unmount()
// Resolve promise after unmount - should not cause errors
```

### 3. Component Integration Tests (`UserProfile.test.tsx`)

**Purpose**: Test component behavior and user interactions

**Test Cases**:
- ✅ **Conditional Rendering**: Different states (loading, error, success, not found)
- ✅ **User Interactions**: Button clicks, retry functionality
- ✅ **Data Display**: Correct profile information rendering
- ✅ **Optional Fields**: Handle missing profile data
- ✅ **Accessibility**: Proper ARIA attributes and alt text
- ✅ **Prop Changes**: Component updates when props change

## Mock Strategies

### 1. Firebase SDK Mocking

**Complete Module Mocking**:
```typescript
// Global setup in test-utils/setup.ts
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  // ... all Firestore functions
}))
```

**Mock Factories**:
```typescript
// Reusable mock creators
export const createMockDocSnapshot = (exists: boolean, data?: any, id?: string) => ({
  exists: () => exists,
  data: () => data,
  id: id || 'mock-doc-id',
})

export const createFirebaseError = (code: string, message: string) => {
  const error = new Error(message) as any
  error.code = code
  return error
}
```

### 2. Hook Mocking for Component Tests

```typescript
// Mock the hook completely for component tests
vi.mock('@/hooks/useUserProfile')
const mockUseUserProfile = vi.mocked(useUserProfile)

// Control hook return values in tests
mockUseUserProfile.mockReturnValue({
  profile: mockProfile,
  loading: false,
  error: null,
  refetch: vi.fn(),
})
```

## Error Scenarios Covered

### 1. Firestore Errors
- **Permission Denied**: User lacks read permissions
- **Unauthenticated**: User not signed in
- **Service Unavailable**: Firestore is down
- **Network Errors**: Connection issues
- **Invalid Arguments**: Malformed requests

### 2. Data Errors
- **Missing Document**: Profile doesn't exist
- **Corrupted Data**: Invalid field types
- **Partial Data**: Missing optional fields
- **Timestamp Conversion**: Date parsing errors

### 3. React Errors
- **Unmount Race Conditions**: State updates after unmount
- **Prop Changes**: Handling rapid userId changes
- **Async Errors**: Promise rejections during fetch

## Test Execution

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Run specific test file
npm test users.test.ts
```

### Coverage Targets
- **Firestore Helpers**: 100% (pure functions, easy to test)
- **React Hooks**: 95%+ (focus on all state transitions)
- **Components**: 90%+ (focus on user-facing behavior)

## Best Practices Applied

### 1. Test Isolation
- Each test is independent
- Mocks are reset between tests
- No shared state between tests

### 2. Behavior Testing
- Test observable outcomes, not implementation
- Focus on user-facing behavior
- Test error states as thoroughly as success states

### 3. Realistic Mocking
- Mock at module boundaries
- Use realistic mock data
- Test both success and failure paths

### 4. Async Testing
- Proper use of `waitFor` for async operations
- Test loading states and transitions
- Handle race conditions and cleanup

### 5. Error Handling
- Test all error scenarios
- Verify error messages are user-friendly
- Test error recovery mechanisms

## Future Enhancements

1. **Performance Testing**: Add tests for hook optimization and memoization
2. **Integration Testing**: Test with real Firebase emulator
3. **E2E Testing**: Browser-based testing with Playwright
4. **Accessibility Testing**: Automated a11y testing with jest-axe
5. **Visual Regression**: Screenshot testing for UI components

This testing strategy ensures robust, maintainable tests that catch real bugs while remaining fast and reliable.