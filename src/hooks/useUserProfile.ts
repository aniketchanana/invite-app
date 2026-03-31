import { useState, useEffect, useRef } from 'react';
import { getUserProfile, UserProfile } from '@/lib/firestore/users';

export interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserProfile(userId: string | null): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchProfile = async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userProfile = await getUserProfile(userId);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setProfile(userProfile);
        setLoading(false);
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user profile';
        setError(errorMessage);
        setLoading(false);
        setProfile(null);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refetch = async () => {
    await fetchProfile();
  };

  return {
    profile,
    loading,
    error,
    refetch,
  };
}