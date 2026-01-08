
'use client';

import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDoc, useMemoFirebase } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { statsService } from '@/lib/firebase/stats-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function DebugPage() {
  const { user, isUserLoading, userError, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const statsDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}/stats`, 'summary');
  }, [user, firestore]);

  const { data: userStats, isLoading: isStatsLoading, error: statsError } = useDoc(statsDocRef);

  const handleUpdateStats = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'User not authenticated' });
      return;
    }
    setIsUpdating(true);
    try {
      statsService.setFirestore(firestore);
      await statsService.updateUserStats(user.uid);
      toast({ title: 'Stats updated!', description: 'Your stats have been recalculated.' });
    } catch (e) {
      const error = e as Error;
      toast({ variant: 'destructive', title: 'Update failed', description: error.message });
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>User:</strong> {user ? user.email : 'Not authenticated'}
          </div>
          <div>
            <strong>UID:</strong> {user?.uid || 'N/A'}
          </div>
          <div>
            <strong>Loading:</strong> {isUserLoading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Auth Error:</strong> {userError ? userError.message : 'None'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Stats Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <strong>Path:</strong> {user ? `/users/${user.uid}/stats/summary` : 'N/A'}
          </div>
          {isStatsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading stats...</span>
            </div>
          ) : (
            <>
              <div className="p-4 bg-muted rounded-md font-mono text-xs overflow-x-auto">
                <pre>{JSON.stringify(userStats || { status: "Document does not exist or could not be read." }, null, 2)}</pre>
              </div>
              {statsError && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-xs font-mono">
                    <strong>Error:</strong> {statsError.message}
                </div>
              )}
            </>
          )}
          <Button onClick={handleUpdateStats} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Force Stats Recalculation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Test</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/"><Button variant="outline" className="w-full">Go to Home</Button></Link>
            <Link href="/signup"><Button variant="outline" className="w-full">Go to Signup</Button></Link>
            <Link href="/dashboard"><Button variant="outline" className="w-full">Go to Dashboard</Button></Link>
            <Link href="/logs"><Button variant="outline" className="w-full">Go to Logs</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}
