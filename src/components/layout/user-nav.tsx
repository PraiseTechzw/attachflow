'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { signOutUser } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Settings, Bell, Search, Command } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { SearchCommand } from '@/components/search/search-command';
import { useNotifications } from '@/hooks/use-notifications';
import Link from 'next/link';
import { useState } from 'react';

export function UserNav() {
  const { user } = useFirebase();
  const { userProfile } = useUserProfile();
  const { getUnreadCount } = useNotifications();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const unreadCount = getUnreadCount();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-primary/10"
        onClick={() => setShowSearch(true)}
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>

      {/* Command Palette Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-primary/10"
        onClick={() => setShowSearch(true)}
      >
        <Command className="h-4 w-4" />
        <span className="sr-only">Command Palette</span>
        <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
      </Button>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-primary/10"
        onClick={() => setShowNotifications(true)}
      >
        <Bell className="h-4 w-4" />
        <span className="sr-only">Notifications</span>
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </Button>

      <ThemeToggle />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-10 w-10 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-primary/10"
          >
            <Avatar className="h-10 w-10 ring-2 ring-transparent transition-all duration-300 hover:ring-primary/50">
              <AvatarImage src={user?.photoURL ?? ''} alt={userProfile?.displayName ?? 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-chart-4 text-primary-foreground font-semibold">
                {getInitials(userProfile?.displayName || user?.email)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-64 backdrop-blur-sm bg-background/95 border-border/50 shadow-xl" 
          align="end" 
          forceMount
        >
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL ?? ''} alt={userProfile?.displayName ?? 'User'} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-chart-4 text-primary-foreground text-xs">
                    {getInitials(userProfile?.displayName || user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold leading-none">
                    {userProfile?.displayName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuGroup className="p-1">
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer transition-all duration-300 hover:bg-primary/10 hover:text-primary rounded-md">
                <UserIcon className="mr-3 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="cursor-pointer transition-all duration-300 hover:bg-primary/10 hover:text-primary rounded-md">
              <Settings className="mr-3 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-border/50" />
          <div className="p-1">
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="cursor-pointer transition-all duration-300 hover:bg-destructive/10 hover:text-destructive rounded-md"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notification Center */}
      <NotificationCenter 
        open={showNotifications} 
        onOpenChange={setShowNotifications} 
      />

      {/* Search Command */}
      <SearchCommand 
        open={showSearch} 
        onOpenChange={setShowSearch} 
      />
    </div>
  );
}
