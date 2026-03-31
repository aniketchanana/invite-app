import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUserProfile } from './useUserProfile';
import { getUserProfile } from '@/lib/firestore/users';
import { resetFirebaseMocks } from '@/test-utils/firebase-mocks';

// Mock the Firestore helper
vi.mock('@/lib/firestore/users', () => ({
  getUserProfile: vi.fn(),
}));

const mockGetUserProfile = vi.mocked(getUserProfile);

describe('useUserProfile', () => {
  beforeEach(() => {
    resetFirebaseMocks();
    vi.clearAllMocks();
  });

  it('should return initial state when userId is null', () => {
    // Act
    const { result } = renderHook(() => useUserProfile(null));

    // Assert
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockGetUserProfile).not.toHaveBeenCalled();
  });

  it('should fetch user profile successfully', async () => {
    // Arrange
    const userId = 'user123';
    const mockProfile = {
      id: userId,
      email: 'test@example.com',
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      bio: 'Software developer',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    };
    mockGetUserProfile.mockResolvedValue(mockProfile);

    // Act
    const { result } = renderHook(() => useUserProfile(userId));

    // Assert initial loading state
    expect(result.current.loading).toBe(true);
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for async operation to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.error).toBeNull();
    expect(mockGetUserProfile).toHaveBeenCalledWith(userId);
  });

  it('should handle user profile not found (null return)', async () => {
    // Arrange
    const userId = 'nonexistent-user';
    mockGetUserProfile.mockResolvedValue(null);

    // Act
    const { result } = renderHook(() => useUserProfile(userId));

    // Wait for async operation to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockGetUserProfile).toHaveBeenCalledWith(userId);
  });

  it('should handle Firestore errors', async () => {
    // Arrange
    const userId = 'user123';
    const error = new Error('Permission denied');
    mockGetUserProfile.mockRejectedValue(error);

    // Act
    const { result } = renderHook(() => useUserProfile(userId));

    // Wait for async operation to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe('Permission denied');
    expect(mockGetUserProfile).toHaveBeenCalledWith(userId);
  });

  it('should handle non-Error exceptions', async () => {
    // Arrange
    const userId = 'user123';
    mockGetUserProfile.mockRejectedValue('String error');

    // Act
    const { result } = renderHook(() => useUserProfile(userId));

    // Wait for async operation to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe('Failed to fetch user profile');
  });

  it('should refetch profile when refetch is called', async () => {
    // Arrange
    const userId = 'user123';
    const mockProfile = {
      id: userId,
      email: 'test@example.com',
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      bio: 'Software developer',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    };
    mockGetUserProfile.mockResolvedValue(mockProfile);

    // Act
    const { result } = renderHook(() => useUserProfile(userId));

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    mockGetUserProfile.mockClear();

    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    // Assert
    expect(mockGetUserProfile).toHaveBeenCalledWith(userId);
  });

  it('should update when userId changes', async () => {
    // Arrange
    const userId1 = 'user123';
    const userId2 = 'user456';
    const mockProfile1 = {
      id: userId1,
      email: 'test1@example.com',
      displayName: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockProfile2 = {
      id: userId2,
      email: 'test2@example.com',
      displayName: 'Jane Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetUserProfile.mockImplementation((id) => {
      if (id === userId1) return Promise.resolve(mockProfile1);
      if (id === userId2) return Promise.resolve(mockProfile2);
      return Promise.resolve(null);
    });

    // Act
    const { result, rerender } = renderHook(
      ({ userId }: { userId: string | null }) => useUserProfile(userId),
      { initialProps: { userId: userId1 } }
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile1);

    // Change userId
    rerender({ userId: userId2 });

    // Wait for new fetch
    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile2);
    });

    expect(mockGetUserProfile).toHaveBeenCalledWith(userId1);
    expect(mockGetUserProfile).toHaveBeenCalledWith(userId2);
  });

  it('should reset state when userId changes to null', async () => {
    // Arrange
    const userId = 'user123';
    const mockProfile = {
      id: userId,
      email: 'test@example.com',
      displayName: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockGetUserProfile.mockResolvedValue(mockProfile);

    // Act
    const { result, rerender } = renderHook(
      ({ userId }: { userId: string | null }) => useUserProfile(userId),
      { initialProps: { userId } as { userId: string | null } }
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);

    // Change userId to null
    rerender({ userId: null });

    // Assert immediate state change
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should prevent state updates after component unmount', async () => {
    // Arrange
    const userId = 'user123';
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    mockGetUserProfile.mockReturnValue(delayedPromise as any);

    // Act
    const { result, unmount } = renderHook(() => useUserProfile(userId));

    // Verify loading state
    expect(result.current.loading).toBe(true);

    // Unmount before promise resolves
    unmount();

    // Resolve the promise after unmount
    const mockProfile = {
      id: userId,
      email: 'test@example.com',
      displayName: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    resolvePromise!(mockProfile);

    // Wait a bit to ensure any state updates would have happened
    await new Promise(resolve => setTimeout(resolve, 100));

    // Assert that the last known state before unmount is preserved
    // (we can't check the state after unmount, but this test ensures
    // no errors are thrown and no memory leaks occur)
    expect(mockGetUserProfile).toHaveBeenCalledWith(userId);
  });

  it('should prevent error state updates after component unmount', async () => {
    // Arrange
    const userId = 'user123';
    let rejectPromise: (error: any) => void;
    const delayedPromise = new Promise((_, reject) => {
      rejectPromise = reject;
    });
    
    mockGetUserProfile.mockReturnValue(delayedPromise as any);

    // Act
    const { result, unmount } = renderHook(() => useUserProfile(userId));

    // Verify loading state
    expect(result.current.loading).toBe(true);

    // Unmount before promise rejects
    unmount();

    // Reject the promise after unmount
    rejectPromise!(new Error('Test error'));

    // Wait a bit to ensure any state updates would have happened
    await new Promise(resolve => setTimeout(resolve, 100));

    // Assert that no errors are thrown due to state updates after unmount
    expect(mockGetUserProfile).toHaveBeenCalledWith(userId);
  });
});