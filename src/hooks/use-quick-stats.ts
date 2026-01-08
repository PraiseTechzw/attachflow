
'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { statsService, type UserStats } from '@/lib/firebase/stats-service';
import { FolderKanban, Calendar, Activity, FileText, TrendingUp } from 'lucide-react';

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
    { label: 'This Month', value: '0', icon: Calendar, color: 'text-green-500' },
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

  const { data: userStats, isLoading, error } = useDoc<UserStats>(statsDocRef);

  useEffect(() => {
    // This effect ensures the stats document exists for the current user.
    const ensureStatsDocExists = async () => {
      if (user && !isLoading && !userStats && !error) {
        console.log("Stats document not found for user, creating one...");
        try {
          statsService.setFirestore(firestore);
          await statsService.createInitialStats(user.uid);
          // The useDoc hook will automatically pick up the new document.
        } catch (e) {
          console.error("Failed to create initial stats document:", e);
        }
      }
    };
    ensureStatsDocExists();
  }, [user, firestore, isLoading, userStats, error]);


  useEffect(() => {
    if (isLoading) {
      // While loading, we can show skeleton state or stick to initial
      return;
    }

    if (userStats) {
      const logsTrend = userStats.thisWeekLogs > 0 ? 
          Math.min(Math.round((userStats.thisWeekLogs / 7) * 10), 99) : 0;
      
      const projectsTrend = userStats.totalProjects > 0 ? 
        Math.min(Math.round(userStats.totalProjects * 5), 99) : 0;

      setQuickStats([
        { 
          label: 'Active Projects', 
          value: userStats.totalProjects.toString(), 
          icon: FolderKanban, 
          color: 'text-blue-500',
          trend: { value: projectsTrend, isPositive: userStats.totalProjects > 0 }
        },
        { 
          label: 'This Month', 
          value: userStats.thisMonthLogs.toString(), 
          icon: Calendar, 
          color: 'text-green-500',
          trend: { value: logsTrend, isPositive: true }
        },
        { 
          label: 'Total Logs', 
          value: userStats.totalLogs.toString(), 
          icon: Activity, 
          color: 'text-purple-500',
          trend: { value: Math.min(userStats.streakDays || 0, 99), isPositive: (userStats.streakDays || 0) > 0 }
        },
        { 
          label: 'Documents', 
          value: userStats.totalDocuments.toString(), 
          icon: FileText, 
          color: 'text-orange-500',
          trend: { value: Math.min(Math.round(userStats.totalDocuments * 2), 99), isPositive: userStats.totalDocuments > 0 }
        },
      ]);
    } else {
      // If there are no stats or an error occurred, show zeros.
      setQuickStats(initialStats);
      if (error) {
          console.error("Error fetching quick stats:", error.message);
      }
    }
  }, [userStats, isLoading, error]);

  return { quickStats, isLoading };
}
