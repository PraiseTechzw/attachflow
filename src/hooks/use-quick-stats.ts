'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { statsService } from '@/lib/firebase/stats-service';
import { FolderKanban, Calendar, Activity, FileText, Users, TrendingUp } from 'lucide-react';

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

export function useQuickStats() {
  const { user } = useFirebase();
  const [quickStats, setQuickStats] = useState<QuickStat[]>([
    { label: 'Active Projects', value: '0', icon: FolderKanban, color: 'text-blue-500' },
    { label: 'This Month', value: '0', icon: Calendar, color: 'text-green-500' },
    { label: 'Total Logs', value: '0', icon: Activity, color: 'text-purple-500' },
    { label: 'Documents', value: '0', icon: FileText, color: 'text-orange-500' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Try to get cached stats first
        let userStats = await statsService.getUserStats(user.uid);
        
        // If no cached stats or stats are old (more than 5 minutes), update them
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        if (!userStats || (userStats.lastUpdated?.toDate() || new Date(0)) < fiveMinutesAgo) {
          userStats = await statsService.updateUserStats(user.uid);
        }

        // Get project stats
        const projectStats = await statsService.getProjectStats(user.uid);

        // Calculate trends (simple mock for now - in real app, you'd compare with previous period)
        const logsTrend = userStats.thisWeekLogs > 0 ? 
          Math.min(Math.round((userStats.thisWeekLogs / 7) * 10), 99) : 0;
        
        const projectsTrend = projectStats.active > 0 ? 
          Math.min(Math.round(projectStats.active * 5), 99) : 0;

        // Update stats
        setQuickStats([
          { 
            label: 'Active Projects', 
            value: projectStats.active.toString(), 
            icon: FolderKanban, 
            color: 'text-blue-500',
            trend: {
              value: projectsTrend,
              isPositive: projectStats.active > 0
            }
          },
          { 
            label: 'This Month', 
            value: userStats.thisMonthLogs.toString(), 
            icon: Calendar, 
            color: 'text-green-500',
            trend: {
              value: logsTrend,
              isPositive: userStats.thisMonthLogs > userStats.thisWeekLogs
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
        // Keep default values on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { quickStats, isLoading };
}

// Hook for more detailed stats used in dashboard
export function useDetailedStats() {
  const { user } = useFirebase();
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalProjects: 0,
    totalDocuments: 0,
    thisMonthLogs: 0,
    thisWeekLogs: 0,
    streakDays: 0,
    longestStreak: 0,
    projectStats: {
      active: 0,
      completed: 0,
      paused: 0,
      total: 0
    },
    recentActivity: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchDetailedStats = async () => {
      try {
        setIsLoading(true);
        
        // Get user stats
        const userStats = await statsService.updateUserStats(user.uid);
        
        // Get project stats
        const projectStats = await statsService.getProjectStats(user.uid);
        
        // Get recent activity
        const recentActivity = await statsService.getRecentActivity(user.uid, 10);

        setStats({
          totalLogs: userStats.totalLogs,
          totalProjects: userStats.totalProjects,
          totalDocuments: userStats.totalDocuments,
          thisMonthLogs: userStats.thisMonthLogs,
          thisWeekLogs: userStats.thisWeekLogs,
          streakDays: userStats.streakDays,
          longestStreak: userStats.longestStreak,
          projectStats,
          recentActivity,
        });

      } catch (error) {
        console.error('Error fetching detailed stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailedStats();
  }, [user]);

  return { stats, isLoading };
}