'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { notificationHelpers } from '@/hooks/use-notifications';

interface ActivityLoggerProps {
  children: React.ReactNode;
}

export function ActivityLogger({ children }: ActivityLoggerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Log page visits
    const logPageVisit = (path: string) => {
      const pageName = getPageName(path);
      console.log(`📍 Navigated to: ${pageName} (${path})`);
      
      // Show notification for important page visits
      if (shouldNotifyPageVisit(path)) {
        notificationHelpers.info(
          `Navigated to ${pageName}`,
          `You're now viewing the ${pageName.toLowerCase()} page.`
        );
      }
    };

    logPageVisit(pathname);
  }, [pathname]);

  // Log user interactions
  useEffect(() => {
    const logUserInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      const action = event.type;
      const element = target.tagName.toLowerCase();
      const text = target.textContent?.slice(0, 50) || '';
      
      if (shouldLogInteraction(target, action)) {
        console.log(`🖱️ User ${action}: ${element} - "${text}"`);
      }
    };

    // Add event listeners for user interactions
    document.addEventListener('click', logUserInteraction);
    document.addEventListener('submit', logUserInteraction);
    
    return () => {
      document.removeEventListener('click', logUserInteraction);
      document.removeEventListener('submit', logUserInteraction);
    };
  }, []);

  return <>{children}</>;
}

function getPageName(path: string): string {
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 0) return 'Home';
  
  const pageMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'logs': 'Daily Logs',
    'projects': 'Projects',
    'documents': 'Documents',
    'reports': 'Reports',
    'cut-log-generator': 'CUT Log Generator',
    'settings': 'Settings',
  };
  
  const mainPage = segments[0];
  return pageMap[mainPage] || mainPage.charAt(0).toUpperCase() + mainPage.slice(1);
}

function shouldNotifyPageVisit(path: string): boolean {
  // Only notify for main navigation pages, not sub-pages
  const mainPages = ['/dashboard', '/logs', '/projects', '/documents', '/reports'];
  return mainPages.includes(path);
}

function shouldLogInteraction(target: HTMLElement, action: string): boolean {
  // Don't log every single click, only meaningful interactions
  if (action !== 'click' && action !== 'submit') return false;
  
  // Log button clicks, form submissions, navigation links
  const tagName = target.tagName.toLowerCase();
  const isButton = tagName === 'button' || target.getAttribute('role') === 'button';
  const isLink = tagName === 'a';
  const isForm = tagName === 'form';
  const hasClickHandler = target.onclick !== null;
  
  return isButton || isLink || isForm || hasClickHandler;
}