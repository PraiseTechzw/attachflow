'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
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
    { label: 'This Month', value: '0', icon: Calendar, color: 'text-green-500' },
    { label: 'Total Logs', value: '0', icon: Activity, color: 'text-purple-500' },
    { label: 'Documents', value: '0', icon: FileText, color: 'text-orange-500' },
];

export function useQuickStats() {
  const { user, firestore } = useFirebase();
  const [quickStats, setQuickStats] = useState<QuickStat[]>(initialStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
      setIsLoading(false);
      return;
    }

    statsService.setFirestore(firestore);

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        let userStats: UserStats | null = await statsService.getUserStats(user.uid);
        
        // If stats are stale or don't exist, recalculate them
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        if (!userStats || !userStats.lastUpdated || (userStats.lastUpdated?.toDate() || new Date(0)) < fiveMinutesAgo) {
          userStats = await statsService.updateUserStats(user.uid);
        }

        if (!userStats) {
            throw new Error("Could not fetch or generate user stats.");
        }

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
            trend: {
              value: projectsTrend,
              isPositive: userStats.totalProjects > 0
            }
          },
          { 
            label: 'This Month', 
            value: userStats.thisMonthLogs.toString(), 
            icon: Calendar, 
            color: 'text-green-500',
            trend: {
              value: logsTrend,
              isPositive: true
            }
          },
          { 
            label: 'Total Logs', 
            value: userStats.totalLogs.toString(), 
            icon: Activity, 
            color: 'text-purple-500',
            trend: {
              value: Math.min(userStats.streakDays, 99),
              isPositive: userStats.streakDays > 0
            }
          },
          { 
            label: 'Documents', 
            value: userStats.totalDocuments.toString(), 
            icon: FileText, 
            color: 'text-orange-500',
            trend: {
              value: Math.min(Math.round(userStats.totalDocuments * 2), 99),
              isPositive: userStats.totalDocuments > 0
            }
          },
        ]);

      } catch (error) {
        console.error('Error fetching quick stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, firestore]);

  return { quickStats, isLoading };
}
