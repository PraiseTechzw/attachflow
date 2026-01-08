'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notificationHelpers } from '@/hooks/use-notifications';
import { toast } from '@/hooks/use-toast';
import { Bell, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export function NotificationDemo() {
  const testNotifications = () => {
    // Test different notification types
    setTimeout(() => {
      notificationHelpers.success(
        'Log Entry Saved',
        'Your daily log entry has been successfully saved.',
        { label: 'View Log', href: '/logs' }
      );
    }, 500);

    setTimeout(() => {
      notificationHelpers.info(
        'System Update Available',
        'A new version of AttachFlow is available for download.',
        { label: 'Update Now', onClick: () => console.log('Updating...') }
      );
    }, 1000);

    setTimeout(() => {
      notificationHelpers.warning(
        'Storage Almost Full',
        'You have used 90% of your storage quota. Consider upgrading.',
        { label: 'Upgrade', href: '/settings/billing' }
      );
    }, 1500);

    setTimeout(() => {
      notificationHelpers.error(
        'Upload Failed',
        'Failed to upload document. Please check your connection and try again.',
        { label: 'Retry', onClick: () => console.log('Retrying upload...') }
      );
    }, 2000);
  };

  const testToasts = () => {
    toast({
      title: 'Success!',
      description: 'This is a success toast notification.',
      variant: 'default',
    });

    setTimeout(() => {
      toast({
        title: 'Error occurred',
        description: 'This is an error toast notification.',
        variant: 'destructive',
      });
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification System Demo
        </CardTitle>
        <CardDescription>
          Test the enhanced notification system with different types of notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testNotifications} className="w-full">
          Test In-App Notifications
        </Button>
        
        <Button onClick={testToasts} variant="outline" className="w-full">
          Test Toast Notifications
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => notificationHelpers.success('Success!', 'Operation completed successfully.')}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Success
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => notificationHelpers.error('Error!', 'Something went wrong.')}
            className="flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            Error
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => notificationHelpers.warning('Warning!', 'Please be careful.')}
            className="flex items-center gap-1"
          >
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => notificationHelpers.info('Info', 'Here is some information.')}
            className="flex items-center gap-1"
          >
            <Info className="h-3 w-3" />
            Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}