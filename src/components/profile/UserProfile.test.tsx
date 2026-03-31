import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test-utils/render'
import { UserProfile } from './UserProfile'
import { useUserProfile } from '@/hooks/useUserProfile'

// Mock the hook
vi.mock('@/hooks/useUserProfile')

const mockUseUserProfile = vi.mocked(useUserProfile)

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show sign in message when userId is null', () => {
    // Arrange
    mockUseUserProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    // Act
    render(<UserProfile userId={null} />)

    // Assert
    expect(screen.getByTestId('no-user')).toHaveTextContent('Please sign in to view profile')
    expect(mockUseUserProfile).toHaveBeenCalledWith(null)
  })

  it('should show loading state', () => {
    // Arrange
    const userId = 'user123'
    mockUseUserProfile.mockReturnValue({
      profile: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    })

    // Act
    render(<UserProfile userId={userId} />)

    // Assert
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading profile...')
    expect(mockUseUserProfile).toHaveBeenCalledWith(userId)
  })

  it('should show error state with retry button', async () => {
    // Arrange
    const user = userEvent.setup()
    const userId = 'user123'
    const mockRefetch = vi.fn()
    mockUseUserProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: 'Permission denied',
      refetch: mockRefetch,
    })

    // Act
    render(<UserProfile userId={userId} />)

    // Assert
    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(screen.getByText('Error loading profile: Permission denied')).toBeInTheDocument()
    
    const retryButton = screen.getByTestId('retry-button')
    expect(retryButton).toBeInTheDocument()

    // Test retry functionality
    await user.click(retryButton)
    expect(mockRefetch).toHaveBeenCalledOnce()
  })

  it('should show not found state when profile is null', () => {
    // Arrange
    const userId = 'user123'
    mockUseUserProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    // Act
    render(<UserProfile userId={userId} />)

    // Assert
    expect(screen.getByTestId('not-found')).toHaveTextContent('Profile not found')
  })

  it('should display complete profile information', () => {
    // Arrange
    const userId = 'user123'
    const mockProfile = {
      id: userId,
      email: 'john@example.com',
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      bio: 'Software developer passionate about React',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-20'),
    }
    
    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    // Act
    render(<UserProfile userId={userId} />)

    // Assert
    expect(screen.getByTestId('profile')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'John Doe' })).toBeInTheDocument()
    expect(screen.getByTestId('email')).toHaveTextContent('john@example.com')
    expect(screen.getByTestId('avatar')).toHaveAttribute('src', 'https://example.com/photo.jpg')
    expect(screen.getByTestId('avatar')).toHaveAttribute('alt', "John Doe's avatar")
    expect(screen.getByTestId('bio')).toHaveTextContent('Software developer passionate about React')
    expect(screen.getByTestId('created-at')).toHaveTextContent('Member since: 1/15/2023')
  })

  it('should display profile without optional fields', () => {
    // Arrange
    const userId = 'user123'
    const mockProfile = {
      id: userId,
      email: 'john@example.com',
      displayName: 'John Doe',
      // photoURL and bio are undefined
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-20'),
    }
    
    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    // Act
    render(<UserProfile userId={userId} />)

    // Assert
    expect(screen.getByTestId('profile')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'John Doe' })).toBeInTheDocument()
    expect(screen.getByTestId('email')).toHaveTextContent('john@example.com')
    expect(screen.queryByTestId('avatar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('bio')).not.toBeInTheDocument()
    expect(screen.getByTestId('created-at')).toHaveTextContent('Member since: 1/15/2023')
  })

  it('should call refetch when refresh button is clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const userId = 'user123'
    const mockRefetch = vi.fn()
    const mockProfile = {
      id: userId,
      email: 'john@example.com',
      displayName: 'John Doe',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-20'),
    }
    
    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      loading: false,
      error: null,
      refetch: mockRefetch,
    })

    // Act
    render(<UserProfile userId={userId} />)
    
    const refreshButton = screen.getByTestId('refresh-button')
    await user.click(refreshButton)

    // Assert
    expect(mockRefetch).toHaveBeenCalledOnce()
  })

  it('should update when userId prop changes', () => {
    // Arrange
    const userId1 = 'user123'
    const userId2 = 'user456'
    
    mockUseUserProfile.mockReturnValue({
      profile: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    })

    // Act
    const { rerender } = render(<UserProfile userId={userId1} />)
    
    expect(mockUseUserProfile).toHaveBeenCalledWith(userId1)
    
    rerender(<UserProfile userId={userId2} />)

    // Assert
    expect(mockUseUserProfile).toHaveBeenCalledWith(userId2)
  })
})