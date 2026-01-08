
'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { statsService, type UserStats } from '@/lib/firebase/stats-service';
import { FolderKanban, Calendar, Activity, FileText } from 'lucide-react';

export interface QuickStat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const initialStats: QuickStat[] = [
    { label: 'Active Projects', value: '0', icon: FolderKanban, color: 'text-blue-500' },
    { label: 'This Week', value: '0', icon: Calendar, color: 'text-green-500' },
    { label: 'Total Logs', value: '0', icon: Activity, color: 'text-purple-500' },
    { label: 'Documents', value: '0', icon: FileText, color: 'text-orange-500' },
];

export function useQuickStats() {
  const { user, firestore } = useFirebase();
  const [quickStats, setQuickStats] = useState<QuickStat[]>(initialStats);
  
  const statsDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}/stats`, 'summary');
  }, [user, firestore]);

  const { data: userStats, isLoading: isStatsLoading, error: statsError } = useDoc<UserStats>(statsDocRef);

  useEffect(() => {
    const processStats = async () => {
      // Don't do anything until loading is finished and we have a user
      if (isStatsLoading || !user) {
        return;
      }

      // If the document doesn't exist and there's no error, it means we need to create it.
      if (!userStats && !statsError) {
        console.log("useQuickStats: Stats document not found for user. Creating now...");
        try {
          statsService.setFirestore(firestore);
          await statsService.createInitialStats(user.uid);
          // The useDoc hook will automatically pick up the new document, triggering this effect again.
        } catch (e) {
          console.error("useQuickStats: Failed to create initial stats document.", e);
        }
        return; // Exit and wait for the re-render with the new doc.
      }
      
      // If the document *does* exist, format the data for the UI.
      if (userStats) {
        const logsTrend = userStats.thisWeekLogs > 0 ? Math.min(Math.round((userStats.thisWeekLogs / 7) * 100), 99) : 0;
        const projectsTrend = userStats.totalProjects > 0 ? Math.min(userStats.totalProjects * 10, 99) : 0;

        setQuickStats([
          { 
            label: 'Active Projects', 
            value: (userStats.totalProjects || 0).toString(), 
            icon: FolderKanban, 
            color: 'text-blue-500',
            trend: { value: projectsTrend, isPositive: userStats.totalProjects > 0 }
          },
          { 
            label: 'This Week', 
            value: (userStats.thisWeekLogs || 0).toString(), 
            icon: Calendar, 
            color: 'text-green-500',
            trend: { value: logsTrend, isPositive: true }
          },
          { 
            label: 'Total Logs', 
            value: (userStats.totalLogs || 0).toString(), 
            icon: Activity, 
            color: 'text-purple-500',
            trend: { value: Math.min(userStats.streakDays || 0, 99), isPositive: (userStats.streakDays || 0) > 0 }
          },
          { 
            label: 'Documents', 
            value: (userStats.totalDocuments || 0).toString(), 
            icon: FileText, 
            color: 'text-orange-500',
            trend: { value: Math.min(Math.round(userStats.totalDocuments * 10), 99), isPositive: userStats.totalDocuments > 0 }
          },
        ]);
      }
    };
    
    processStats();
  }, [user, firestore, userStats, isStatsLoading, statsError]);

  if (statsError) {
    console.error("Error loading quick stats:", statsError);
  }

  return { quickStats, isLoading: isStatsLoading };
}
