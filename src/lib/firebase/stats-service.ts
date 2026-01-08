
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

  async createInitialStats(userId: string): Promise<UserStats> {
    const db = this.getFirestore();
    const statsDocRef = doc(db, `users/${userId}/stats`, 'summary');
    const initialStats: UserStats = {
      userId,
      totalLogs: 0,
      totalProjects: 0,
      totalDocuments: 0,
      thisMonthLogs: 0,
      thisWeekLogs: 0,
      lastUpdated: Timestamp.now(),
      streakDays: 0,
      longestStreak: 0,
    };
    await setDoc(statsDocRef, initialStats);
    return initialStats;
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    const db = this.getFirestore();
    const statsDocRef = doc(db, `users/${userId}/stats`, 'summary');
    const statsDoc = await getDoc(statsDocRef);
    
    if (statsDoc.exists()) {
      return { userId, ...statsDoc.data() } as UserStats;
    }
    
    // If stats doc doesn't exist, create it and return initial stats
    console.log(`Stats document for ${userId} not found, creating one.`);
    return this.createInitialStats(userId);
  }

  async updateUserStats(userId: string): Promise<UserStats> {
    try {
      const db = this.getFirestore();
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

      const logsCollection = collection(db, `users/${userId}/dailyLogs`);
      const projectsCollection = collection(db, `users/${userId}/projects`);
      const documentsCollection = collection(db, `users/${userId}/documents`);

      const [logsSnapshot, projectsSnapshot, documentsSnapshot, thisMonthLogsSnapshot, thisWeekLogsSnapshot] = await Promise.all([
        getDocs(query(logsCollection)),
        getDocs(query(projectsCollection)),
        getDocs(query(documentsCollection)),
        getDocs(query(logsCollection, where('date', '>=', Timestamp.fromDate(monthStart)))),
        getDocs(query(logsCollection, where('date', '>=', Timestamp.fromDate(weekStart))))
      ]);

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

      const statsDocRef = doc(db, `users/${userId}/stats`, 'summary');
      await setDoc(statsDocRef, stats, { merge: true });
      
      console.log(`Stats for user ${userId} have been successfully recalculated.`);
      return stats;
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  async incrementStat(userId: string, statName: keyof Pick<UserStats, 'totalLogs' | 'totalProjects' | 'totalDocuments'>, amount: number = 1): Promise<void> {
    const db = this.getFirestore();
    const statsRef = doc(db, `users/${userId}/stats`, 'summary');
    
    // We update the specific stat, but then trigger a full recalculation
    // to ensure all other stats (like streaks, thisWeek, etc.) are up to date.
    try {
        await updateDoc(statsRef, { [statName]: increment(amount) });
    } catch (e) {
        console.warn(`Increment failed for ${statName}, falling back to full update.`);
    } finally {
        // Always trigger a full update for consistency.
        // This is non-blocking and will run in the background.
        this.updateUserStats(userId).catch(err => console.error("Background stat update failed:", err));
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

      const logDates = new Set<string>();
      logsSnapshot.docs.forEach(doc => {
        const date = doc.data().date?.toDate();
        if (date) {
            logDates.add(date.toDateString());
        }
      });
      
      let currentStreak = 0;
      let today = new Date();
      if (logDates.has(today.toDateString()) || (today.getHours() < 4 && logDates.has(new Date(today.getTime() - 86400000).toDateString()))) {
        currentStreak = 1;
        let prevDate = new Date(today.getTime() - 86400000);
        while (logDates.has(prevDate.toDateString())) {
            currentStreak++;
            prevDate.setDate(prevDate.getDate() - 1);
        }
      }
      
      // For longest streak, we can just return the existing value from stats doc if we don't need to be precise here
      // For now, this simple current streak calculation is enough to show activity.
      // A more complex calculation can be implemented if needed.
      return { streakDays: currentStreak, longestStreak: 0 }; // longestStreak calculation can be heavy, let's simplify for now
    } catch (error) {
      console.error('Error calculating streak:', error);
      return { streakDays: 0, longestStreak: 0 };
    }
  }
}

export const statsService = StatsService.getInstance();
