import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  Firestore
} from 'firebase/firestore';

export interface UserStats {
  userId: string;
  totalLogs: number;
  totalProjects: number;
  totalDocuments: number;
  thisMonthLogs: number;
  thisWeekLogs: number;
  lastUpdated: Timestamp;
  streakDays: number;
  longestStreak: number;
}

export class StatsService {
  private static instance: StatsService;
  private firestore: Firestore | null = null;
  
  static getInstance(): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService();
    }
    return StatsService.instance;
  }

  setFirestore(firestore: Firestore) {
    this.firestore = firestore;
  }

  private getFirestore(): Firestore {
    if (!this.firestore) {
      throw new Error('Firestore not initialized. Call setFirestore() first.');
    }
    return this.firestore;
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const db = this.getFirestore();
      const statsDoc = await getDoc(doc(db, 'userStats', userId));
      if (statsDoc.exists()) {
        return { userId, ...statsDoc.data() } as UserStats;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  async updateUserStats(userId: string): Promise<UserStats> {
    try {
      const db = this.getFirestore();
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Fetch current counts
      const [logsSnapshot, projectsSnapshot, documentsSnapshot, thisMonthLogsSnapshot, thisWeekLogsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'logs'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'projects'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'documents'), where('userId', '==', userId))),
        getDocs(query(
          collection(db, 'logs'),
          where('userId', '==', userId),
          where('createdAt', '>=', Timestamp.fromDate(monthStart))
        )),
        getDocs(query(
          collection(db, 'logs'),
          where('userId', '==', userId),
          where('createdAt', '>=', Timestamp.fromDate(weekStart))
        ))
      ]);

      // Calculate streak
      const { streakDays, longestStreak } = await this.calculateStreak(userId);

      const stats: UserStats = {
        userId,
        totalLogs: logsSnapshot.size,
        totalProjects: projectsSnapshot.size,
        totalDocuments: documentsSnapshot.size,
        thisMonthLogs: thisMonthLogsSnapshot.size,
        thisWeekLogs: thisWeekLogsSnapshot.size,
        lastUpdated: Timestamp.now(),
        streakDays,
        longestStreak,
      };

      // Update or create stats document
      await setDoc(doc(db, 'userStats', userId), stats, { merge: true });
      
      return stats;
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  async incrementStat(userId: string, statName: keyof Pick<UserStats, 'totalLogs' | 'totalProjects' | 'totalDocuments'>, amount: number = 1): Promise<void> {
    try {
      const db = this.getFirestore();
      const statsRef = doc(db, 'userStats', userId);
      await updateDoc(statsRef, {
        [statName]: increment(amount),
        lastUpdated: Timestamp.now()
      });
    } catch (error) {
      console.error('Error incrementing stat:', error);
      throw error;
    }
  }

  private async calculateStreak(userId: string): Promise<{ streakDays: number; longestStreak: number }> {
    try {
      const db = this.getFirestore();
      // Get all logs ordered by date
      const logsQuery = query(
        collection(db, 'logs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const logsSnapshot = await getDocs(logsQuery);
      
      if (logsSnapshot.empty) {
        return { streakDays: 0, longestStreak: 0 };
      }

      const logs = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Group logs by date
      const logsByDate = new Map<string, number>();
      logs.forEach(log => {
        const dateKey = log.createdAt.toDateString();
        logsByDate.set(dateKey, (logsByDate.get(dateKey) || 0) + 1);
      });

      // Check for current streak
      let checkDate = new Date(today);
      while (true) {
        const dateKey = checkDate.toDateString();
        if (logsByDate.has(dateKey)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate longest streak
      const sortedDates = Array.from(logsByDate.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      
      for (let i = 0; i < sortedDates.length; i++) {
        tempStreak = 1;
        
        for (let j = i + 1; j < sortedDates.length; j++) {
          const currentDate = new Date(sortedDates[j]);
          const prevDate = new Date(sortedDates[j - 1]);
          const diffTime = currentDate.getTime() - prevDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            tempStreak++;
          } else {
            break;
          }
        }
        
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      return { streakDays: currentStreak, longestStreak };
    } catch (error) {
      console.error('Error calculating streak:', error);
      return { streakDays: 0, longestStreak: 0 };
    }
  }

  async getRecentActivity(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const db = this.getFirestore();
      const recentLogsQuery = query(
        collection(db, 'logs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(recentLogsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'log',
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  async getProjectStats(userId: string): Promise<{
    active: number;
    completed: number;
    paused: number;
    total: number;
  }> {
    try {
      const db = this.getFirestore();
      const [activeSnapshot, completedSnapshot, pausedSnapshot, totalSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'projects'), where('userId', '==', userId), where('status', '==', 'active'))),
        getDocs(query(collection(db, 'projects'), where('userId', '==', userId), where('status', '==', 'completed'))),
        getDocs(query(collection(db, 'projects'), where('userId', '==', userId), where('status', '==', 'paused'))),
        getDocs(query(collection(db, 'projects'), where('userId', '==', userId)))
      ]);

      return {
        active: activeSnapshot.size,
        completed: completedSnapshot.size,
        paused: pausedSnapshot.size,
        total: totalSnapshot.size
      };
    } catch (error) {
      console.error('Error fetching project stats:', error);
      return { active: 0, completed: 0, paused: 0, total: 0 };
    }
  }
}

export const statsService = StatsService.getInstance();