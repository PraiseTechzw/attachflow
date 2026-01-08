
'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Loader2, Menu } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { ActivityLogger } from '@/components/logging/activity-logger';
import { NotificationPermissionRequester } from '@/components/notifications/NotificationPermissionRequester';
import { useUserProfile } from '@/hooks/use-user-profile';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useFirebase();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const isLoading = isUserLoading || isProfileLoading;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
     // This case should be handled by middleware, but as a fallback:
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
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex h-full border-r bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 text-sidebar-foreground backdrop-blur-sm">
            <div className="flex h-full min-h-0 flex-col">
                <div className="flex h-16 items-center border-b border-sidebar-border/50 px-6 bg-gradient-to-r from-sidebar-primary/10 to-transparent flex-shrink-0">
                    <Logo className="h-8 w-auto floating" />
                </div>
                <SidebarNav />
            </div>
        </Sidebar>

        {/* Mobile Sidebar */}
        <MobileSidebar 
          open={isMobileSidebarOpen} 
          onOpenChange={setMobileSidebarOpen} 
        />

        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-3 sm:px-4 lg:px-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-primary/10 hover:text-primary transition-all duration-300 flex-shrink-0"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              
              {/* Mobile Logo */}
              <div className="lg:hidden flex-shrink-0">
                <Logo className="h-6 w-auto sm:h-7" />
              </div>
              
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <span className="font-medium text-foreground truncate">AttachFlow</span>
                <span className="flex-shrink-0">/</span>
                <span className="capitalize truncate">
                  {pathname.split('/').filter(Boolean).pop() || 'Dashboard'}
                </span>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Welcome Message */}
              <div className="hidden xl:flex flex-col items-end">
                <p className="text-sm font-medium text-foreground truncate">
                  Welcome back, {userProfile?.displayName?.split(' ')[0] || 'User'}!
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <UserNav />
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 min-w-0">
            <div className="mx-auto max-w-7xl min-w-0">
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
