'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { signInUser, signUpUser } from '@/lib/firebase/auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = z.object({
    displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    regNumber: z.string().optional(),
    companyName: z.string().optional(),
    universityName: z.string().optional(),
});


type AuthFormProps = {
  type: 'login' | 'signup';
};

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema | typeof signupSchema>>({
    resolver: zodResolver(type === 'login' ? loginSchema : signupSchema),
    defaultValues: type === 'login' ? {
      email: '',
      password: '',
    } : {
        displayName: '',
        email: '',
        password: '',
        regNumber: '',
        companyName: '',
        universityName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema | typeof signupSchema>) {
    setIsLoading(true);
    try {
      if (type === 'login') {
        await signInUser(values.email, values.password);
        toast({
          title: 'Login Successful',
          description: "Welcome back!",
        });
        router.push('/dashboard');
        router.refresh();
      } else {
        const signupValues = values as z.infer<typeof signupSchema>;
        await signUpUser(signupValues);
        toast({
          title: 'Account Created',
          description: "You've been successfully signed up!",
        });
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {type === 'signup' && (
             <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                    <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {type === 'signup' && (
          <>
            <FormField
                control={form.control}
                name="regNumber"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Registration Number (Optional)</FormLabel>
                    <FormControl>
                    <Input placeholder="C1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Company Name (Optional)</FormLabel>
                    <FormControl>
                    <Input placeholder="AttachFlow Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="universityName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>University Name (Optional)</FormLabel>
                    <FormControl>
                    <Input placeholder="University of Technology" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {type === 'login' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        {type === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/" className="underline">
              Sign in
            </Link>
          </>
        )}
      </div>
    </Form>
  );
}
