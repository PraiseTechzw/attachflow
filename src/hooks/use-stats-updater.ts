
'use client';

import { useCallback } from 'react';
import { useFirebase } from '@/firebase';
import { statsService } from '@/lib/firebase/stats-service';
import { notificationHelpers } from '@/hooks/use-notifications';

export function useStatsUpdater() {
  const { user, firestore } = useFirebase();

  const triggerStatsUpdate = useCallback(async () => {
    if (!user || !firestore) return;
    
    try {
      statsService.setFirestore(firestore);
      // This is a non-blocking, background operation.
      // We don't await it so the UI remains responsive.
      statsService.updateUserStats(user.uid).catch(err => {
        console.error("Background stat update failed:", err);
      });
    } catch (error) {
      console.error('Error initiating stats update:', error);
    }
  }, [user, firestore]);

  const incrementLogCount = useCallback(async () => {
    notificationHelpers.success(
      'Log Entry Saved',
      'Your daily log has been saved. Stats are updating...',
      { label: 'View Logs', href: '/logs' }
    );
    await triggerStatsUpdate();
  }, [triggerStatsUpdate]);

  const incrementProjectCount = useCallback(async () => {
    notificationHelpers.success(
      'Project Created',
      'Your new project has been created. Stats are updating...',
      { label: 'View Projects', href: '/projects' }
    );
    await triggerStatsUpdate();
  }, [triggerStatsUpdate]);

  const incrementDocumentCount = useCallback(async () => {
    notificationHelpers.success(
      'Document Uploaded',
      'Your document has been uploaded. Stats are updating...',
      { label: 'View Documents', href: '/documents' }
    );
    await triggerStatsUpdate();
  }, [triggerStatsUpdate]);

  return {
    updateStats: triggerStatsUpdate, // Keep the manual trigger for the debug page
    incrementLogCount,
    incrementProjectCount,
    incrementDocumentCount,
  };
}
