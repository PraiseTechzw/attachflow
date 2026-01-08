'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserStats } from '@/lib/firebase/stats-service';
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

  const { data: userStats, isLoading } = useDoc<UserStats>(statsDocRef);

  useEffect(() => {
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
    } else if (!isLoading) {
      // If there are no stats, show zeros but don't show loading.
      setQuickStats(initialStats);
    }
  }, [userStats, isLoading]);

  return { quickStats, isLoading };
}
