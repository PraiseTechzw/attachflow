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
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import Link from 'next/link';

export function UserNav() {
  const { user } = useFirebase();
  const { userProfile } = useUserProfile();
  const router = useRouter();

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
    </div>
  );
}
