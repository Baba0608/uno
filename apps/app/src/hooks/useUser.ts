import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';

export function useUser() {
  const { data: session, status, update } = useSession();

  // Auto-refresh session before it expires
  useEffect(() => {
    if (session?.user?.apiToken) {
      // Check if token is about to expire (within 5 minutes)
      const tokenExp = getTokenExpiration(session.user.apiToken);
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = tokenExp - now;

      if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
        // 5 minutes
        // Refresh the session
        update();
      }
    }
  }, [session, update]);

  const refreshSession = async () => {
    try {
      await update();
    } catch (error) {
      console.error('Failed to refresh session:', error);
      // If refresh fails, redirect to sign in
      signIn();
    }
  };

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    refreshSession,
  };
}

// Helper function to decode JWT and get expiration
function getTokenExpiration(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp || 0;
  } catch {
    return 0;
  }
}
