'use client'

import { useUserProfile } from '@/hooks/useUserProfile'
import { Button } from '@/components/ui/button'

interface UserProfileProps {
  userId: string | null
}

export function UserProfile({ userId }: UserProfileProps) {
  const { profile, loading, error, refetch } = useUserProfile(userId)

  if (!userId) {
    return <div data-testid="no-user">Please sign in to view profile</div>
  }

  if (loading) {
    return <div data-testid="loading">Loading profile...</div>
  }

  if (error) {
    return (
      <div data-testid="error">
        <p>Error loading profile: {error}</p>
        <Button onClick={refetch} data-testid="retry-button">
          Retry
        </Button>
      </div>
    )
  }

  if (!profile) {
    return <div data-testid="not-found">Profile not found</div>
  }

  return (
    <div data-testid="profile">
      <h1>{profile.displayName}</h1>
      <p data-testid="email">{profile.email}</p>
      {profile.photoURL && (
        <img 
          src={profile.photoURL} 
          alt={`${profile.displayName}'s avatar`}
          data-testid="avatar"
        />
      )}
      {profile.bio && <p data-testid="bio">{profile.bio}</p>}
      {profile.createdAt && (
        <p data-testid="created-at">
          Member since: {profile.createdAt.toLocaleDateString()}
        </p>
      )}
      <Button onClick={refetch} data-testid="refresh-button">
        Refresh Profile
      </Button>
    </div>
  )
}