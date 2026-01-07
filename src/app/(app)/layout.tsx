'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { UserNav } from '@/components/layout/user-nav';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Loader2, Menu } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider
      open={isSidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <div className="flex min-h-screen">
        <Sidebar className="h-full border-r bg-sidebar text-sidebar-foreground">
            <div className="flex h-full min-h-0 flex-col">
                <div className="flex h-16 items-center border-b px-6">
                    <Logo className="h-8 w-auto" />
                </div>
                <SidebarNav />
            </div>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
            </Button>
            <div className="flex-1"></div>
            <UserNav />
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>

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
