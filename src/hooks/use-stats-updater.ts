'use client';

import { useCallback } from 'react';
import { useFirebase } from '@/firebase';
import { statsService } from '@/lib/firebase/stats-service';
import { notificationHelpers } from '@/hooks/use-notifications';

export function useStatsUpdater() {
  const { user } = useFirebase();

  const updateStats = useCallback(async () => {
    if (!user) return;
    
    try {
      await statsService.updateUserStats(user.uid);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }, [user]);

  const incrementLogCount = useCallback(async () => {
    if (!user) return;
    
    try {
      await statsService.incrementStat(user.uid, 'totalLogs');
      notificationHelpers.success(
        'Log Entry Created',
        'Your daily log has been saved successfully!',
        { label: 'View Logs', href: '/logs' }
      );
    } catch (error) {
      console.error('Error incrementing log count:', error);
    }
  }, [user]);

  const incrementProjectCount = useCallback(async () => {
    if (!user) return;
    
    try {
      await statsService.incrementStat(user.uid, 'totalProjects');
      notificationHelpers.success(
        'Project Created',
        'Your new project has been created successfully!',
        { label: 'View Projects', href: '/projects' }
      );
    } catch (error) {
      console.error('Error incrementing project count:', error);
    }
  }, [user]);

  const incrementDocumentCount = useCallback(async () => {
    if (!user) return;
    
    try {
      await statsService.incrementStat(user.uid, 'totalDocuments');
      notificationHelpers.success(
        'Document Uploaded',
        'Your document has been uploaded successfully!',
        { label: 'View Documents', href: '/documents' }
      );
    } catch (error) {
      console.error('Error incrementing document count:', error);
    }
  }, [user]);

  return {
    updateStats,
    incrementLogCount,
    incrementProjectCount,
    incrementDocumentCount,
  };
}