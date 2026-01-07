'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Home, Book, FolderKanban, FileText, Settings, FileDown } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/logs', label: 'Daily Logs', icon: Book },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/reports', label: 'Reports', icon: FileDown },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-2 p-4 pt-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) &&
              'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
      <div className="!mt-auto pt-6">
        <Link
            href="/settings"
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                pathname.startsWith('/settings') && 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
            )}
        >
            <Settings className="h-4 w-4" />
            Settings
        </Link>
      </div>
    </nav>
  );
}
