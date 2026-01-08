
'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { UserNav } from '@/components/layout/user-nav';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Loader2, Menu } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { ActivityLogger } from '@/components/logging/activity-logger';
import { NotificationPermissionRequester } from '@/components/notifications/NotificationPermissionRequester';
import { useUserProfile } from '@/hooks/use-user-profile';
import { doc, getDoc } from 'firebase/firestore';
import { statsService } from '@/lib/firebase/stats-service';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, firestore } = useFirebase();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const isLoading = isUserLoading || isProfileLoading;

  useEffect(() => {
    // This effect ensures the stats document exists for the current user.
    const ensureStatsDocExists = async () => {
      if (user && firestore) {
        const statsDocRef = doc(firestore, `users/${user.uid}/stats`, 'summary');
        const statsDoc = await getDoc(statsDocRef);

        if (!statsDoc.exists()) {
          console.log('Stats document not found for existing user. Creating now...');
          statsService.setFirestore(firestore);
          await statsService.createInitialStats(user.uid);
          console.log('Stats document created.');
        }
      }
    };

    ensureStatsDocExists();
  }, [user, firestore]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
     // This case should be handled by middleware, but as a fallback:
     router.push('/');
     return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <ActivityLogger>
      <SidebarProvider
        open={isSidebarOpen}
        onOpenChange={setSidebarOpen}
      >
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
        <Sidebar className="h-full border-r bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 text-sidebar-foreground backdrop-blur-sm">
            <div className="flex h-full min-h-0 flex-col">
                <div className="flex h-16 items-center border-b border-sidebar-border/50 px-6 bg-gradient-to-r from-sidebar-primary/10 to-transparent flex-shrink-0">
                    <Logo className="h-8 w-auto floating" />
                </div>
                <SidebarNav />
            </div>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-4 shadow-sm sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-primary/10 hover:text-primary transition-all duration-300"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">AttachFlow</span>
                <span>/</span>
                <span className="capitalize">
                  {pathname.split('/').filter(Boolean).pop() || 'Dashboard'}
                </span>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Welcome Message */}
              <div className="hidden lg:flex flex-col items-end">
                <p className="text-sm font-medium text-foreground">
                  Welcome back, {userProfile?.displayName?.split(' ')[0] || 'User'}!
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <UserNav />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
      <NotificationPermissionRequester />
    </SidebarProvider>
    </ActivityLogger>
  );

}
