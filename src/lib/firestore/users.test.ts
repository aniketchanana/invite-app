import { describe, it, expect, vi, beforeEach } from 'vitest';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getUserProfile, createUserProfile, updateUserProfile } from './users';
import { 
  createMockDocSnapshot, 
  createFirebaseError, 
  FIREBASE_ERRORS,
  resetFirebaseMocks 
} from '@/test-utils/firebase-mocks';

// Mock the Firebase modules
vi.mock('firebase/firestore');
vi.mock('@/lib/firebase', () => ({
  db: { _type: 'firestore' }, // Mock Firestore instance
}));

const mockDoc = vi.mocked(doc);
const mockGetDoc = vi.mocked(getDoc);
const mockSetDoc = vi.mocked(setDoc);
const mockTimestamp = vi.mocked(Timestamp);

describe('getUserProfile', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  it('should return user profile when document exists', async () => {
    // Arrange
    const userId = 'user123';
    const mockDocRef = { _type: 'doc-ref', id: userId };
    mockDoc.mockReturnValue(mockDocRef as any);

    const mockData = {
      email: 'test@example.com',
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      bio: 'Software developer',
      createdAt: { toDate: () => new Date('2023-01-01') },
      updatedAt: { toDate: () => new Date('2023-01-02') },
    };
    
    const mockSnapshot = createMockDocSnapshot(true, mockData, userId);
    mockGetDoc.mockResolvedValue(mockSnapshot);

    // Act
    const result = await getUserProfile(userId);

    // Assert
    expect(mockDoc).toHaveBeenCalledWith({ _type: 'firestore' }, 'users', userId);
    expect(mockGetDoc).toHaveBeenCalledWith(mockDocRef);
    expect(result).toEqual({
      id: userId,
      email: 'test@example.com',
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      bio: 'Software developer',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    });
  });

  it('should return null when document does not exist', async () => {
    // Arrange
    const userId = 'nonexistent-user';
    const mockDocRef = { _type: 'doc-ref', id: userId };
    mockDoc.mockReturnValue(mockDocRef as any);
    const mockSnapshot = createMockDocSnapshot(false);
    mockGetDoc.mockResolvedValue(mockSnapshot);

    // Act
    const result = await getUserProfile(userId);

    // Assert
    expect(mockDoc).toHaveBeenCalledWith({ _type: 'firestore' }, 'users', userId);
    expect(mockGetDoc).toHaveBeenCalledWith(mockDocRef);
    expect(result).toBeNull();
  });

  it('should handle missing optional fields gracefully', async () => {
    // Arrange
    const userId = 'user123';
    const mockDocRef = { _type: 'doc-ref', id: userId };
    mockDoc.mockReturnValue(mockDocRef as any);
    const mockData = {
      email: 'test@example.com',
      displayName: 'John Doe',
      // photoURL and bio are missing
      createdAt: { toDate: () => new Date('2023-01-01') },
      updatedAt: { toDate: () => new Date('2023-01-02') },
    };
    
    const mockSnapshot = createMockDocSnapshot(true, mockData, userId);
    mockGetDoc.mockResolvedValue(mockSnapshot);

    // Act
    const result = await getUserProfile(userId);

    // Assert
    expect(result).toEqual({
      id: userId,
      email: 'test@example.com',
      displayName: 'John Doe',
      photoURL: undefined,
      bio: undefined,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    });
  });

  it('should handle minimal user documents (uid + email only)', async () => {
    // Arrange
    const userId = 'user123';
    const mockDocRef = { _type: 'doc-ref', id: userId };
    mockDoc.mockReturnValue(mockDocRef as any);
    const mockData = {
      uid: userId,
      email: 'test@example.com',
      // no displayName, createdAt, updatedAt
    };
    const mockSnapshot = createMockDocSnapshot(true, mockData, userId);
    mockGetDoc.mockResolvedValue(mockSnapshot);

    // Act
    const result = await getUserProfile(userId);

    // Assert
    expect(result).toEqual({
      id: userId,
      email: 'test@example.com',
      displayName: undefined,
      photoURL: undefined,
      bio: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    });
  });

  it('should throw error when Firestore throws permission denied', async () => {
    // Arrange
    const userId = 'user123';
    const mockDocRef = { _type: 'doc-ref', id: userId };
    mockDoc.mockReturnValue(mockDocRef as any);
    const error = createFirebaseError(FIREBASE_ERRORS.PERMISSION_DENIED, 'Permission denied');
    mockGetDoc.mockRejectedValue(error);

    // Act & Assert
    await expect(getUserProfile(userId)).rejects.toThrow('Permission denied');
    expect(mockDoc).toHaveBeenCalledWith({ _type: 'firestore' }, 'users', userId);
  });

  it('should throw error when Firestore is unavailable', async () => {
    // Arrange
    const userId = 'user123';
    const error = createFirebaseError(FIREBASE_ERRORS.UNAVAILABLE, 'Service unavailable');
    mockGetDoc.mockRejectedValue(error);

    // Act & Assert
    await expect(getUserProfile(userId)).rejects.toThrow('Service unavailable');
  });

  it('should throw error when user is unauthenticated', async () => {
    // Arrange
    const userId = 'user123';
    const error = createFirebaseError(FIREBASE_ERRORS.UNAUTHENTICATED, 'User not authenticated');
    mockGetDoc.mockRejectedValue(error);

    // Act & Assert
    await expect(getUserProfile(userId)).rejects.toThrow('User not authenticated');
  });
});

describe('createUserProfile', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  it('should create user profile with all fields', async () => {
    // Arrange
    const userId = 'user123';
    const email = 'test@example.com';
    const profileData = {
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      bio: 'Software developer',
    };
    const mockNow = { _type: 'timestamp' } as any;
    const mockDocRef = { _type: 'doc-ref', id: userId };
    mockDoc.mockReturnValue(mockDocRef as any);
    mockTimestamp.now.mockReturnValue(mockNow);
    mockSetDoc.mockResolvedValue(undefined);

    // Act
    await createUserProfile(userId, email, profileData);

    // Assert
    expect(mockDoc).toHaveBeenCalledWith({ _type: 'firestore' }, 'users', userId);
    expect(mockSetDoc).toHaveBeenCalledWith(
      mockDocRef, // doc reference
      {
        email,
        displayName: 'John Doe',
        photoURL: 'https://example.com/photo.jpg',
        bio: 'Software developer',
        createdAt: mockNow,
        updatedAt: mockNow,
      }
    );
  });

  it('should create user profile with minimal fields', async () => {
    // Arrange
    const userId = 'user123';
    const email = 'test@example.com';
    const profileData = {
      displayName: 'John Doe',
    };
    const mockNow = { _type: 'timestamp' } as any;
    const mockDocRef = { _type: 'doc-ref', id: userId };
    mockDoc.mockReturnValue(mockDocRef as any);
    mockTimestamp.now.mockReturnValue(mockNow);
    mockSetDoc.mockResolvedValue(undefined);

    // Act
    await createUserProfile(userId, email, profileData);

    // Assert
    expect(mockSetDoc).toHaveBeenCalledWith(
      mockDocRef,
      {
        email,
        displayName: 'John Doe',
        photoURL: null,
        bio: null,
        createdAt: mockNow,
        updatedAt: mockNow,
      }
    );
  });

  it('should throw error when creation fails', async () => {
    // Arrange
    const userId = 'user123';
    const email = 'test@example.com';
    const profileData = { displayName: 'John Doe' };
    const error = createFirebaseError(FIREBASE_ERRORS.PERMISSION_DENIED, 'Permission denied');
    mockSetDoc.mockRejectedValue(error);

    // Act & Assert
    await expect(createUserProfile(userId, email, profileData)).rejects.toThrow('Permission denied');
  });
});

describe('updateUserProfile', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  it('should update user profile with partial data', async () => {
    // Arrange
    const userId = 'user123';
    const profileData = {
      displayName: 'Jane Doe',
      bio: 'Updated bio',
    };
    const mockNow = { _type: 'timestamp' } as any;
    const mockDocRef = { _type: 'doc-ref', id: userId };
    mockDoc.mockReturnValue(mockDocRef as any);
    mockTimestamp.now.mockReturnValue(mockNow);
    mockSetDoc.mockResolvedValue(undefined);

    // Act
    await updateUserProfile(userId, profileData);

    // Assert
    expect(mockDoc).toHaveBeenCalledWith({ _type: 'firestore' }, 'users', userId);
    expect(mockSetDoc).toHaveBeenCalledWith(
      mockDocRef,
      {
        displayName: 'Jane Doe',
        bio: 'Updated bio',
        updatedAt: mockNow,
      },
      { merge: true }
    );
  });

  it('should update single field', async () => {
    // Arrange
    const userId = 'user123';
    const profileData = { displayName: 'New Name' };
    const mockNow = { _type: 'timestamp' } as any;
    const mockDocRef = { _type: 'doc-ref', id: userId };
    mockDoc.mockReturnValue(mockDocRef as any);
    mockTimestamp.now.mockReturnValue(mockNow);
    mockSetDoc.mockResolvedValue(undefined);

    // Act
    await updateUserProfile(userId, profileData);

    // Assert
    expect(mockSetDoc).toHaveBeenCalledWith(
      mockDocRef,
      {
        displayName: 'New Name',
        updatedAt: mockNow,
      },
      { merge: true }
    );
  });

  it('should throw error when update fails', async () => {
    // Arrange
    const userId = 'user123';
    const profileData = { displayName: 'New Name' };
    const error = createFirebaseError(FIREBASE_ERRORS.PERMISSION_DENIED, 'Permission denied');
    mockSetDoc.mockRejectedValue(error);

    // Act & Assert
    await expect(updateUserProfile(userId, profileData)).rejects.toThrow('Permission denied');
  });
});