'use client';

import { useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { createSessionCookie, clearSessionCookie } from '@/lib/firebase/server-auth';

export function SessionSync() {
  const { user, isUserLoading } = useFirebase();

  useEffect(() => {
    const syncSession = async () => {
      if (isUserLoading) return; // Wait for auth to load

      try {
        if (user) {
          // User is authenticated, ensure session cookie exists
          const idToken = await user.getIdToken();
          await createSessionCookie(idToken);
          console.log('Session cookie created for user:', user.email);
        } else {
          // User is not authenticated, clear session cookie
          await clearSessionCookie();
          console.log('Session cookie cleared');
        }
      } catch (error) {
        console.error('Error syncing session:', error);
      }
    };

    syncSession();
  }, [user, isUserLoading]);

  return null; // This component doesn't render anything
}