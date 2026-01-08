'use client';

import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DebugPage() {
  const { user, isUserLoading, userError } = useFirebase();
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>User:</strong> {user ? user.email : 'Not authenticated'}
          </div>
          <div>
            <strong>Loading:</strong> {isUserLoading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Error:</strong> {userError ? userError.message : 'None'}
          </div>
          <div>
            <strong>UID:</strong> {user?.uid || 'N/A'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Link href="/">
              <Button variant="outline" className="w-full">Go to Home</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="w-full">Go to Signup</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/logs">
              <Button variant="outline" className="w-full">Go to Logs</Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" className="w-full">Go to Projects</Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" className="w-full">Go to Reports</Button>
            </Link>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              onClick={() => router.push('/dashboard')} 
              variant="default" 
              className="w-full"
            >
              Router Push to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={async () => {
              if (user) {
                try {
                  const { createSessionCookie } = await import('@/lib/firebase/server-auth');
                  const idToken = await user.getIdToken(true); // Force refresh
                  await createSessionCookie(idToken);
                  alert('Session cookie refreshed! Try navigating now.');
                  window.location.reload();
                } catch (error) {
                  console.error('Error refreshing session:', error);
                  alert('Error refreshing session: ' + error.message);
                }
              }
            }}
            variant="default"
            className="w-full"
            disabled={!user}
          >
            Refresh Session Cookie
          </Button>
          
          <Button 
            onClick={async () => {
              try {
                const { clearSessionCookie } = await import('@/lib/firebase/server-auth');
                await clearSessionCookie();
                alert('Session cookie cleared!');
                window.location.reload();
              } catch (error) {
                console.error('Error clearing session:', error);
                alert('Error clearing session: ' + error.message);
              }
            }}
            variant="destructive"
            className="w-full"
          >
            Clear Session Cookie
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
          </div>
          <div>
            <strong>Firebase Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}
          </div>
          <div>
            <strong>Firebase Auth Domain:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}