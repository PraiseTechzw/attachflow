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
    // Log page visits for debugging, but do not show a notification.
    const logPageVisit = (path: string) => {
      const pageName = getPageName(path);
      console.log(`📍 Navigated to: ${pageName} (${path})`);
    };

    logPageVisit(pathname);
  }, [pathname]);

  // Log user interactions
  useEffect(() => {
    const logUserInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      const action = event.type;
      
      if (shouldLogInteraction(target, action)) {
        const element = target.tagName.toLowerCase();
        const text = target.textContent?.slice(0, 50) || '';
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

function shouldLogInteraction(target: HTMLElement, action: string): boolean {
  // Don't log every single click, only meaningful interactions
  if (action !== 'click' && action !== 'submit') return false;
  
  // Log button clicks, form submissions, navigation links
  const tagName = target.tagName.toLowerCase();
  const isButton = tagName === 'button' || target.getAttribute('role') === 'button';
  const isLink = tagName === 'a';
  const isForm = tagName === 'form';
  const hasClickHandler = target.onclick !== null;
  
  // A simple check to avoid logging clicks on the entire body or main content areas
  if (['body', 'main', 'div'].includes(tagName) && !hasClickHandler && !isButton) {
    return false;
  }
  
  return isButton || isLink || isForm || hasClickHandler;
}
