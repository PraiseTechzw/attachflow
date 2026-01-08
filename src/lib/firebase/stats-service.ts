
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
      const statsDocRef = doc(db, `users/${userId}/stats`, 'summary');
      const statsDoc = await getDoc(statsDocRef);
      
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

      // Define collection paths for the specific user
      const logsCollection = collection(db, `users/${userId}/dailyLogs`);
      const projectsCollection = collection(db, `users/${userId}/projects`);
      const documentsCollection = collection(db, `users/${userId}/documents`);

      // Fetch current counts
      const [logsSnapshot, projectsSnapshot, documentsSnapshot, thisMonthLogsSnapshot, thisWeekLogsSnapshot] = await Promise.all([
        getDocs(query(logsCollection)),
        getDocs(query(projectsCollection)),
        getDocs(query(documentsCollection)),
        getDocs(query(logsCollection, where('date', '>=', Timestamp.fromDate(monthStart)))),
        getDocs(query(logsCollection, where('date', '>=', Timestamp.fromDate(weekStart))))
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
      const statsDocRef = doc(db, `users/${userId}/stats`, 'summary');
      await setDoc(statsDocRef, stats, { merge: true });
      
      return stats;
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  async incrementStat(userId: string, statName: keyof Pick<UserStats, 'totalLogs' | 'totalProjects' | 'totalDocuments'>, amount: number = 1): Promise<void> {
    try {
      const db = this.getFirestore();
      const statsRef = doc(db, `users/${userId}/stats`, 'summary');
      await updateDoc(statsRef, {
        [statName]: increment(amount),
        lastUpdated: Timestamp.now()
      });
    } catch (error) {
      console.error('Error incrementing stat:', error);
      // If the doc doesn't exist, create it
      if (error.code === 'not-found') {
        await this.updateUserStats(userId);
      } else {
        throw error;
      }
    }
  }

  private async calculateStreak(userId: string): Promise<{ streakDays: number; longestStreak: number }> {
    try {
      const db = this.getFirestore();
      const logsQuery = query(
        collection(db, `users/${userId}/dailyLogs`),
        orderBy('date', 'desc')
      );
      const logsSnapshot = await getDocs(logsQuery);
      
      if (logsSnapshot.empty) {
        return { streakDays: 0, longestStreak: 0 };
      }

      const logs = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        createdAt: doc.data().date?.toDate() || new Date()
      }));

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const logsByDate = new Map<string, number>();
      logs.forEach(log => {
        const dateKey = log.createdAt.toDateString();
        logsByDate.set(dateKey, (logsByDate.get(dateKey) || 0) + 1);
      });

      let checkDate = new Date(today);
      if (logsByDate.has(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        while (logsByDate.has(checkDate.toDateString())) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }

      const sortedDates = Array.from(logsByDate.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      
      if (sortedDates.length > 0) {
        tempStreak = 1;
        longestStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i]);
          const prevDate = new Date(sortedDates[i - 1]);
          const diffTime = currentDate.getTime() - prevDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
          longestStreak = Math.max(longestStreak, tempStreak);
        }
      }

      return { streakDays: currentStreak, longestStreak };
    } catch (error) {
      console.error('Error calculating streak:', error);
      return { streakDays: 0, longestStreak: 0 };
    }
  }

  async getRecentActivity(userId: string, count: number = 10): Promise<any[]> {
    try {
      const db = this.getFirestore();
      const recentLogsQuery = query(
        collection(db, `users/${userId}/dailyLogs`),
        orderBy('date', 'desc'),
        limit(count)
      );
      
      const snapshot = await getDocs(recentLogsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'log',
        ...doc.data(),
        date: doc.data().date?.toDate()
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  async getProjectStats(userId: string): Promise<{
    active: number;
    completed: number;
    pending: number;
    total: number;
  }> {
    try {
      const db = this.getFirestore();
      const projectsCollection = collection(db, `users/${userId}/projects`);
      const [activeSnapshot, completedSnapshot, pendingSnapshot, totalSnapshot] = await Promise.all([
        getDocs(query(projectsCollection, where('status', '==', 'Approved'))),
        getDocs(query(projectsCollection, where('status', '==', 'Completed'))),
        getDocs(query(projectsCollection, where('status', '==', 'Pending'))),
        getDocs(query(projectsCollection))
      ]);

      return {
        active: activeSnapshot.size,
        completed: completedSnapshot.size,
        pending: pendingSnapshot.size,
        total: totalSnapshot.size
      };
    } catch (error) {
      console.error('Error fetching project stats:', error);
      return { active: 0, completed: 0, pending: 0, total: 0 };
    }
  }
}

export const statsService = StatsService.getInstance();
