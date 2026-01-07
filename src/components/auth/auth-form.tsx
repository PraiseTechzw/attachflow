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
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {type === 'signup' && (
               <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                  <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">Full Name</FormLabel>
                      <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        className="transition-all duration-300 focus:scale-[1.02]" 
                        {...field} 
                      />
                      </FormControl>
                      <FormMessage className="text-xs" />
                  </FormItem>
                  )}
              />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="name@example.com" 
                    className="transition-all duration-300 focus:scale-[1.02]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="transition-all duration-300 focus:scale-[1.02]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          {type === 'signup' && (
            <div className="space-y-4 pt-2">
              <div className="text-sm font-medium text-muted-foreground border-t pt-4">
                Optional Information
              </div>
              <FormField
                  control={form.control}
                  name="regNumber"
                  render={({ field }) => (
                  <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">Registration Number</FormLabel>
                      <FormControl>
                      <Input 
                        placeholder="C1234567" 
                        className="transition-all duration-300 focus:scale-[1.02]" 
                        {...field} 
                      />
                      </FormControl>
                      <FormMessage className="text-xs" />
                  </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                  <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">Company Name</FormLabel>
                      <FormControl>
                      <Input 
                        placeholder="AttachFlow Inc." 
                        className="transition-all duration-300 focus:scale-[1.02]" 
                        {...field} 
                      />
                      </FormControl>
                      <FormMessage className="text-xs" />
                  </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="universityName"
                  render={({ field }) => (
                  <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-foreground">University Name</FormLabel>
                      <FormControl>
                      <Input 
                        placeholder="University of Technology" 
                        className="transition-all duration-300 focus:scale-[1.02]" 
                        {...field} 
                      />
                      </FormControl>
                      <FormMessage className="text-xs" />
                  </FormItem>
                  )}
              />
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full mt-8 h-11 text-base font-medium" 
            variant="gradient"
            size="lg"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {type === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {type === 'login' ? 'New to AttachFlow?' : 'Already have an account?'}
              </span>
            </div>
          </div>
          <div className="mt-4">
            {type === 'login' ? (
              <Link 
                href="/signup" 
                className="text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-300 hover:underline"
              >
                Create your account →
              </Link>
            ) : (
              <Link 
                href="/" 
                className="text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-300 hover:underline"
              >
                Sign in to your account →
              </Link>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}
