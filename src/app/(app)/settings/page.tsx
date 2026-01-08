'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/use-user-profile";

const settingsFormSchema = z.object({
    displayName: z.string().min(2, {
        message: "Display name must be at least 2 characters.",
    }).max(50, {
        message: "Display name must not be longer than 50 characters.",
    }),
    regNumber: z.string().optional(),
    companyName: z.string().optional(),
    universityName: z.string().optional(),
    goals: z.string().max(500, {
        message: "Goals must not be longer than 500 characters.",
    }).optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
    console.log('🏗️ SettingsPage component initializing');
    
    const { user, firestore } = useFirebase();
    const { userProfile, isLoading: isProfileLoading } = useUserProfile();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    
    console.log('🔍 Component state:', {
        user: user ? { uid: user.uid, email: user.email } : 'No user',
        userProfile: userProfile ? 'Profile loaded' : 'No profile',
        isProfileLoading,
        isSubmitting,
        firestore: firestore ? 'Available' : 'Not available'
    });
    
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
          displayName: "",
          regNumber: "",
          companyName: "",
          universityName: "",
          goals: "",
        },
        mode: "onChange",
      });

    useEffect(() => {
        console.log('🔄 Profile data effect triggered');
        console.log('👤 Current userProfile:', userProfile);
        console.log('📋 Current form values:', form.getValues());
        
        if (userProfile) {
            console.log('✅ UserProfile available, resetting form with:', {
                displayName: userProfile.displayName || "",
                regNumber: userProfile.regNumber || "",
                companyName: userProfile.companyName || "",
                universityName: userProfile.universityName || "",
                goals: userProfile.goals || "",
            });
            
            form.reset({
                displayName: userProfile.displayName || "",
                regNumber: userProfile.regNumber || "",
                companyName: userProfile.companyName || "",
                universityName: userProfile.universityName || "",
                goals: userProfile.goals || "",
            });
            
            console.log('📋 Form reset complete, new values:', form.getValues());
        } else {
            console.log('⚠️ UserProfile not available yet');
        }
    }, [userProfile, form]);

    async function onSubmit(data: SettingsFormValues) {
        console.log('🚀 Profile submission started');
        console.log('📝 Form data:', data);
        console.log('👤 Current user:', user ? { uid: user.uid, email: user.email } : 'No user');
        console.log('🔥 Firestore instance:', firestore ? 'Available' : 'Not available');
        
        if (!user) {
            console.error('❌ User not authenticated');
            toast({ variant: 'destructive', title: 'Not authenticated' });
            return;
        }
        
        if (!firestore) {
            console.error('❌ Firestore not available');
            toast({ variant: 'destructive', title: 'Database not available' });
            return;
        }
        
        setIsSubmitting(true);
        console.log('⏳ Setting isSubmitting to true');
        
        try {
            console.log('📄 Creating document reference for user:', user.uid);
            const userRef = doc(firestore, "users", user.uid);
            console.log('📄 Document reference created:', userRef.path);
            
            const updateData = {
                displayName: data.displayName,
                regNumber: data.regNumber,
                companyName: data.companyName,
                universityName: data.universityName,
                goals: data.goals,
                updatedAt: serverTimestamp(),
                // Ensure we have the user's email and uid for reference
                email: user.email,
                uid: user.uid,
                // Add createdAt only if it's a new document
                ...(userProfile ? {} : { createdAt: serverTimestamp() })
            };
            console.log('📊 Update data prepared:', updateData);
            
            console.log('💾 Attempting to create/update document...');
            await setDoc(userRef, updateData, { merge: true });
            console.log('✅ Document created/updated successfully');
            
            toast({
                title: "Settings updated",
                description: "Your profile has been successfully updated.",
            });
            console.log('🎉 Success toast shown');
            
        } catch (error: any) {
            console.error('❌ Error updating profile:', error);
            console.error('❌ Error details:', {
                name: error?.name,
                message: error?.message,
                code: error?.code,
                stack: error?.stack
            });
            
            toast({
                variant: 'destructive',
                title: "Update failed",
                description: `Could not update your settings: ${error?.message || 'Unknown error'}`,
            });
        } finally {
            console.log('🏁 Setting isSubmitting to false');
            setIsSubmitting(false);
        }
    }

    if (isProfileLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information and attachment goals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Name" {...field} />
                                        </FormControl>
                                        <FormDescription>This is your public display name.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="regNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Registration Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. C12345678" {...field} />
                                        </FormControl>
                                        <FormDescription>Your official university registration number.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Google" {...field} />
                                        </FormControl>
                                        <FormDescription>The company where you are attached.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="universityName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>University Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. University of Technology" {...field} />
                                        </FormControl>
                                        <FormDescription>The university you attend.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="goals"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Attachment Goals</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe what you want to achieve during your attachment..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            This will help the AI provide more relevant feedback on your logs.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
