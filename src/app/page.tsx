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
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
