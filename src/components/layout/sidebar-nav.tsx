'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Home, Book, FolderKanban, FileText, Settings, FileDown, FileSignature } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/logs', label: 'Daily Logs', icon: Book },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/reports', label: 'Monthly Reports', icon: FileDown },
];

const extraNavItems = [
    { href: '/reports/cut-log-generator', label: 'CUT Log Sheet', icon: FileSignature },
]

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col p-4 pt-6">
      <div className='space-y-2'>
        {navItems.map((item) => (
            <Link
            key={item.href}
            href={item.href}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && !extraNavItems.some(extra => pathname.startsWith(extra.href)))) &&
                'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
            )}
            >
            <item.icon className="h-4 w-4" />
            {item.label}
            </Link>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-sidebar-border/50">
          <p className="px-3 pb-2 text-xs font-semibold text-sidebar-foreground/60">Generators</p>
          <div className='space-y-2'>
            {extraNavItems.map(item => (
                 <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        pathname.startsWith(item.href) && 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                    )}
                    >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Link>
            ))}
          </div>
      </div>


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
