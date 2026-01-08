
'use client';

import { useCallback } from 'react';
import { useFirebase } from '@/firebase';
import { statsService } from '@/lib/firebase/stats-service';
import { notificationHelpers } from '@/hooks/use-notifications';

export function useStatsUpdater() {
  const { user, firestore } = useFirebase();

  const updateStats = useCallback(async () => {
    if (!user || !firestore) return;
    
    try {
      statsService.setFirestore(firestore);
      // This is now a background, non-blocking operation
      statsService.updateUserStats(user.uid).catch(err => console.error("Background stat update failed:", err));
    } catch (error) {
      console.error('Error initiating stats update:', error);
    }
  }, [user, firestore]);

  const incrementLogCount = useCallback(async () => {
    if (!user || !firestore) return;
    
    notificationHelpers.success(
      'Log Entry Saved',
      'Your daily log has been saved. Stats are updating...',
      { label: 'View Logs', href: '/logs' }
    );
    // This will now automatically trigger a full recalculation in the background
    statsService.setFirestore(firestore);
    await statsService.incrementStat(user.uid, 'totalLogs');
    
  }, [user, firestore]);

  const incrementProjectCount = useCallback(async () => {
    if (!user || !firestore) return;
    
    notificationHelpers.success(
      'Project Created',
      'Your new project has been created. Stats are updating...',
      { label: 'View Projects', href: '/projects' }
    );
    statsService.setFirestore(firestore);
    await statsService.incrementStat(user.uid, 'totalProjects');

  }, [user, firestore]);

  const incrementDocumentCount = useCallback(async () => {
    if (!user || !firestore) return;
    
    notificationHelpers.success(
      'Document Uploaded',
      'Your document has been uploaded. Stats are updating...',
      { label: 'View Documents', href: '/documents' }
    );
    statsService.setFirestore(firestore);
    await statsService.incrementStat(user.uid, 'totalDocuments');

  }, [user, firestore]);

  return {
    updateStats,
    incrementLogCount,
    incrementProjectCount,
    incrementDocumentCount,
  };
}
