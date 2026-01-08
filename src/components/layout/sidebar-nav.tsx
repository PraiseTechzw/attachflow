'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Book, 
  FolderKanban, 
  FileText, 
  FileDown, 
  FileSignature, 
  Sparkles,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuickStats } from '@/hooks/use-quick-stats';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: Home,
    description: 'Overview and analytics',
  },
  { 
    href: '/logs', 
    label: 'Daily Logs', 
    icon: Book,
    description: 'Track your daily progress',
  },
  { 
    href: '/projects', 
    label: 'Projects', 
    icon: FolderKanban,
    description: 'Manage your projects',
  },
  { 
    href: '/documents', 
    label: 'Documents', 
    icon: FileText,
    description: 'File management',
  },
  { 
    href: '/reports', 
    label: 'Monthly Reports', 
    icon: FileDown,
    description: 'Generate and view reports',
  },
];

const extraNavItems = [
  { 
    href: '/reports/cut-log-generator', 
    label: 'CUT Log Sheet', 
    icon: FileSignature,
    description: 'Generate CUT log sheets',
    badge: 'AI'
  },
];

interface SidebarNavProps {
  onItemClick?: () => void;
}

export function SidebarNav({ onItemClick }: SidebarNavProps) {
  const pathname = usePathname();
  const { quickStats, isLoading } = useQuickStats();

  const getStatByLabel = (label: string) => {
    return quickStats.find(stat => stat.label === label);
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <ScrollArea className="flex-1 px-4 pt-6 sidebar-scroll">
        {/* Quick Stats */}
        <div className="mb-6 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-chart-4/5 border border-primary/10 hover-lift">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Quick Stats</span>
            {isLoading && (
              <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {quickStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between quick-stat-item rounded-md p-1 transition-colors">
                <div className="flex items-center gap-2">
                  <stat.icon className={`h-3 w-3 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-3 w-4" /> : stat.value}
                  </span>
                  {!isLoading && stat.trend && (
                    <div className={`flex items-center text-xs trend-indicator ${
                      stat.trend.isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <TrendingUp className={`h-2 w-2 ${
                        stat.trend.isPositive ? '' : 'rotate-180'
                      }`} />
                      <span className="ml-0.5">{stat.trend.value}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <div className='space-y-2 mb-6'>
          {navItems.map((item, index) => {
            const stat = item.label === 'Daily Logs' ? getStatByLabel('Total Logs') 
                       : item.label === 'Projects' ? getStatByLabel('Active Projects')
                       : item.label === 'Documents' ? getStatByLabel('Documents')
                       : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-3 text-sidebar-foreground/80 transition-all duration-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md hover:scale-105 relative overflow-hidden',
                  (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && !extraNavItems.some(extra => pathname.startsWith(extra.href)))) &&
                  'bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-lg scale-105 pulse-glow'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  <div className="flex flex-col">
                    <span className="transition-all duration-300 font-medium">{item.label}</span>
                    <span className="text-xs text-sidebar-foreground/60 transition-all duration-300">
                      {item.description}
                    </span>
                  </div>
                </div>
                {stat && !isLoading && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5"
                  >
                    {stat.value}
                  </Badge>
                )}
                {(pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && !extraNavItems.some(extra => pathname.startsWith(extra.href)))) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
                )}
              </Link>
            );
          })}
        </div>
        
        {/* AI Generators Section */}
        <div className="pt-6 border-t border-sidebar-border/50">
          <div className="flex items-center gap-2 px-3 pb-3">
            <Sparkles className="h-4 w-4 text-sidebar-primary animate-pulse" />
            <p className="text-sm font-semibold text-sidebar-foreground/80 gradient-text">AI Generators</p>
            <Zap className="h-3 w-3 text-yellow-500 animate-bounce" />
          </div>
          <div className='space-y-2'>
            {extraNavItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-3 text-sidebar-foreground/80 transition-all duration-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md hover:scale-105 relative overflow-hidden',
                  pathname.startsWith(item.href) &&
                  'bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-lg scale-105 pulse-glow'
                )}
                style={{ animationDelay: `${(navItems.length + index) * 100}ms` }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  <div className="flex flex-col">
                    <span className="transition-all duration-300 font-medium">{item.label}</span>
                    <span className="text-xs text-sidebar-foreground/60 transition-all duration-300">
                      {item.description}
                    </span>
                  </div>
                </div>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-400/30 animate-pulse"
                  >
                    {item.badge}
                  </Badge>
                )}
                {pathname.startsWith(item.href) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer Section - Fixed at bottom */}
      <div className="p-4 border-t border-sidebar-border/50 bg-sidebar/50">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/60">
          <Activity className="h-3 w-3" />
          <span>System Status: Online</span>
          <div className="ml-auto h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
                  
