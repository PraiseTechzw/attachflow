import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/icons/logo';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo className="h-12 w-auto" />
        </div>
        <h1 className="mb-2 text-center text-3xl font-bold text-foreground">
          Create an Account
        </h1>
        <p className="mb-8 text-center text-muted-foreground">
          Join AttachFlow to streamline your attachment experience.
        </p>
        <AuthForm type="signup" />
      </div>
    </div>
  );
}
