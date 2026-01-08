
'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { BellRing, CheckCircle } from 'lucide-react';

export function NotificationPermissionRequester() {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const requestPermission = () => {
    if (!('Notification' in window)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: 'This browser does not support desktop notifications.',
      });
      return;
    }

    Notification.requestPermission().then((status) => {
      setPermission(status);
      if (status === 'granted') {
        toast({
          title: 'Notifications Enabled! 🎉',
          description: 'You will now receive updates through your browser.',
        });
        // Here you would typically send the subscription to your server
        // e.g., subscribeUserToPush();
      } else if (status === 'denied') {
        toast({
          variant: 'destructive',
          title: 'Notifications Blocked',
          description: 'You have blocked notifications. To enable them, please check your browser settings.',
        });
      }
    });
  };

  if (permission === 'granted' || permission === 'unsupported' || permission === 'denied') {
    return null; // Don't show anything if permission is already granted, denied or not supported
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-background border rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <BellRing className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Enable browser notifications to get important updates about your logs and reports.
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setPermission('denied')}>
            Maybe Later
          </Button>
          <Button size="sm" onClick={requestPermission}>
            Enable Notifications
          </Button>
        </div>
      </div>
    </div>
  );
}
