'use client';

import { create } from 'zustand';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useNotifications = create<NotificationStore>((set, get) => ({
  notifications: [
    {
      id: '1',
      title: 'New Log Entry Created',
      description: 'Your daily log for today has been successfully created and saved.',
      type: 'success',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      action: {
        label: 'View Log',
        href: '/logs'
      }
    },
    {
      id: '2',
      title: 'Monthly Report Ready',
      description: 'Your monthly report for December 2024 is ready for download.',
      type: 'info',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      action: {
        label: 'Download',
        href: '/reports'
      }
    },
    {
      id: '3',
      title: 'System Maintenance',
      description: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST.',
      type: 'warning',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
    }
  ],

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));

    // Also show as toast
    toast({
      title: notification.title,
      description: notification.description,
      variant: notification.type === 'error' ? 'destructive' : 'default',
    });
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true }))
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));

// Utility functions for common notification types
export const notificationHelpers = {
  success: (title: string, description: string, action?: Notification['action']) => {
    useNotifications.getState().addNotification({
      title,
      description,
      type: 'success',
      action,
    });
  },

  error: (title: string, description: string, action?: Notification['action']) => {
    useNotifications.getState().addNotification({
      title,
      description,
      type: 'error',
      action,
    });
  },

  warning: (title: string, description: string, action?: Notification['action']) => {
    useNotifications.getState().addNotification({
      title,
      description,
      type: 'warning',
      action,
    });
  },

  info: (title: string, description: string, action?: Notification['action']) => {
    useNotifications.getState().addNotification({
      title,
      description,
      type: 'info',
      action,
    });
  },
};