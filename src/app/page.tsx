'use client';

import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/icons/logo';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-12 w-auto animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo className="h-12 w-auto" />
        </div>
        <h1 className="mb-2 text-center text-3xl font-bold text-foreground">
          Welcome to AttachFlow
        </h1>
        <p className="mb-8 text-center text-muted-foreground">
          Sign in to manage your industrial attachment.
        </p>
        <AuthForm type="login" />
      </div>
    </div>
  );
}
