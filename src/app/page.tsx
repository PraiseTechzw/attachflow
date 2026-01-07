'use client';

import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/icons/logo';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';

export default function LoginPage() {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-chart-4/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-chart-4/5 rounded-full blur-3xl animate-float"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center space-y-6 mb-8">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-chart-4/10 backdrop-blur-sm border border-primary/20">
              <Logo className="h-12 w-auto floating" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold gradient-text">
              Welcome to AttachFlow
            </h1>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto">
              Your beautiful companion for managing industrial attachments with style and efficiency.
            </p>
          </div>
        </div>
        
        <div className="backdrop-blur-sm bg-card/50 border border-border/50 rounded-2xl p-8 shadow-2xl">
          <AuthForm type="login" />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Streamline your attachment journey with powerful tools and insights
          </p>
        </div>
      </div>
    </div>
  );
}
