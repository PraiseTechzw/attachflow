'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Home, Book, FolderKanban, FileText, Settings, FileDown, FileSignature, Sparkles } from 'lucide-react';

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
        {navItems.map((item, index) => (
            <Link
            key={item.href}
            href={item.href}
            className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all duration-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md hover:scale-105 relative overflow-hidden',
                (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && !extraNavItems.some(extra => pathname.startsWith(extra.href)))) &&
                'bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-lg scale-105 pulse-glow'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            >
            <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="transition-all duration-300">{item.label}</span>
            {(pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && !extraNavItems.some(extra => pathname.startsWith(extra.href)))) && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
            )}
            </Link>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-sidebar-border/50">
          <div className="flex items-center gap-2 px-3 pb-3">
            <Sparkles className="h-3 w-3 text-sidebar-primary animate-pulse" />
            <p className="text-xs font-semibold text-sidebar-foreground/60 gradient-text">Generators</p>
          </div>
          <div className='space-y-2'>
            {extraNavItems.map((item, index) => (
                 <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all duration-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md hover:scale-105 relative overflow-hidden',
                        pathname.startsWith(item.href) &&
                        'bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-lg scale-105 pulse-glow'
                    )}
                    style={{ animationDelay: `${(navItems.length + index) * 100}ms` }}
                    >
                    <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    <span className="transition-all duration-300">{item.label}</span>
                    {pathname.startsWith(item.href) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
                    )}
                    </Link>
            ))}
          </div>
      </div>
    </nav>
  );
}
                  