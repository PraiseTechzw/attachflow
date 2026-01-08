'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  Book,
  FolderKanban,
  FileText,
  FileDown,
  FileSignature,
  Settings,
  Search,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Zap,
  Plus,
  Download
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  category: string;
  keywords: string[];
}

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  // Mock search items
  const searchItems: SearchItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      description: 'View overview and analytics',
      icon: Home,
      href: '/dashboard',
      category: 'Navigation',
      keywords: ['dashboard', 'home', 'overview', 'analytics']
    },
    {
      id: 'nav-logs',
      title: 'Daily Logs',
      description: 'Track your daily progress',
      icon: Book,
      href: '/logs',
      category: 'Navigation',
      keywords: ['logs', 'daily', 'entries', 'journal']
    },
    {
      id: 'nav-projects',
      title: 'Projects',
      description: 'Manage your projects',
      icon: FolderKanban,
      href: '/projects',
      category: 'Navigation',
      keywords: ['projects', 'manage', 'portfolio']
    },
    {
      id: 'nav-documents',
      title: 'Documents',
      description: 'File management',
      icon: FileText,
      href: '/documents',
      category: 'Navigation',
      keywords: ['documents', 'files', 'upload', 'storage']
    },
    {
      id: 'nav-reports',
      title: 'Monthly Reports',
      description: 'Generate and view reports',
      icon: FileDown,
      href: '/reports',
      category: 'Navigation',
      keywords: ['reports', 'monthly', 'generate', 'analytics']
    },
    {
      id: 'nav-cut-generator',
      title: 'CUT Log Generator',
      description: 'Generate CUT log sheets',
      icon: FileSignature,
      href: '/reports/cut-log-generator',
      category: 'Navigation',
      keywords: ['cut', 'generator', 'log', 'sheet', 'ai']
    },

    // Quick Actions
    {
      id: 'action-new-log',
      title: 'Create New Log Entry',
      description: 'Start a new daily log',
      icon: Plus,
      href: '/logs/new',
      category: 'Quick Actions',
      keywords: ['create', 'new', 'log', 'entry', 'daily']
    },
    {
      id: 'action-upload-document',
      title: 'Upload Document',
      description: 'Upload a new document',
      icon: FileText,
      href: '/documents?action=upload',
      category: 'Quick Actions',
      keywords: ['upload', 'document', 'file', 'add']
    },
    {
      id: 'action-generate-report',
      title: 'Generate Monthly Report',
      description: 'Create a new monthly report',
      icon: BarChart3,
      href: '/reports?action=generate',
      category: 'Quick Actions',
      keywords: ['generate', 'report', 'monthly', 'create']
    },
    {
      id: 'action-download-data',
      title: 'Download Data Export',
      description: 'Export your data',
      icon: Download,
      action: () => {
        // Mock download action
        console.log('Downloading data export...');
      },
      category: 'Quick Actions',
      keywords: ['download', 'export', 'data', 'backup']
    },

    // Recent Items
    {
      id: 'recent-log-1',
      title: 'Today\'s Log Entry',
      description: 'Last edited 2 hours ago',
      icon: Clock,
      href: '/logs/today',
      category: 'Recent',
      keywords: ['today', 'recent', 'log', 'current']
    },
    {
      id: 'recent-project-1',
      title: 'Web Development Project',
      description: 'Last updated yesterday',
      icon: FolderKanban,
      href: '/projects/web-dev',
      category: 'Recent',
      keywords: ['web', 'development', 'project', 'recent']
    },
    {
      id: 'recent-report-1',
      title: 'December 2024 Report',
      description: 'Generated last week',
      icon: FileDown,
      href: '/reports/december-2024',
      category: 'Recent',
      keywords: ['december', 'report', 'recent', '2024']
    },

    // Settings
    {
      id: 'settings-profile',
      title: 'Profile Settings',
      description: 'Manage your profile',
      icon: Users,
      href: '/settings/profile',
      category: 'Settings',
      keywords: ['profile', 'settings', 'account', 'user']
    },
    {
      id: 'settings-preferences',
      title: 'Preferences',
      description: 'App preferences and configuration',
      icon: Settings,
      href: '/settings/preferences',
      category: 'Settings',
      keywords: ['preferences', 'settings', 'config', 'options']
    }
  ];

  const filteredItems = searchItems.filter(item => {
    if (!searchValue) return true;
    
    const searchLower = searchValue.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);

  const handleSelect = (item: SearchItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
    onOpenChange(false);
    setSearchValue('');
  };

  // Keyboard shortcut to open command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search for pages, actions, or content..."
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList>
        <CommandEmpty>
          <div className="text-center py-6">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No results found.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching for pages, actions, or content.
            </p>
          </div>
        </CommandEmpty>

        {Object.entries(groupedItems).map(([category, items], index) => (
          <div key={category}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.description} ${item.keywords.join(' ')}`}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.title}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {item.category === 'Quick Actions' && (
                    <Zap className="h-3 w-3 text-yellow-500" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}

        {!searchValue && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tips">
              <div className="px-3 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                  <span>to open command palette</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    ↑↓
                  </kbd>
                  <span>to navigate</span>
                </div>
              </div>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}