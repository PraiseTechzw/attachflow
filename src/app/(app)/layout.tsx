'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { UserNav } from '@/components/layout/user-nav';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Loader2, Menu } from 'lucide-react';
import { useFirebase } from '@/firebase';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  if (isUserLoading) {
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
    <SidebarProvider
      open={isSidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
        <Sidebar className="h-full border-r bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 text-sidebar-foreground backdrop-blur-sm">
            <div className="flex h-full min-h-0 flex-col">
                <div className="flex h-16 items-center border-b border-sidebar-border/50 px-6 bg-gradient-to-r from-sidebar-primary/10 to-transparent">
                    <Logo className="h-8 w-auto floating" />
                </div>
                <SidebarNav />
            </div>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-4 shadow-sm sm:px-6">
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-primary/10 hover:text-primary transition-all duration-300"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-4">
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
    </SidebarProvider>
  );

       {/* Mobile Sidebar */}
       <div className={`fixed inset-0 z-40 md:hidden ${isMobileSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)}></div>
        <div className="relative z-50 flex h-full w-72 max-w-[calc(100%-4rem)] flex-col bg-sidebar text-sidebar-foreground">
          <div className="flex h-16 items-center border-b px-6">
            <Logo className="h-8 w-auto" />
          </div>
          <div onClick={() => setMobileSidebarOpen(false)}>
            <SidebarNav />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
