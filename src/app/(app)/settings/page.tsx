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
import { doc, updateDoc } from "firebase/firestore";
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
    goals: z.string().max(500, {
        message: "Goals must not be longer than 500 characters.",
    }).optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
    const { user, firestore } = useFirebase();
    const { userProfile, isLoading: isProfileLoading } = useUserProfile();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
          displayName: "",
          regNumber: "",
          companyName: "",
          goals: "",
        },
        mode: "onChange",
      });

    useEffect(() => {
        if (userProfile) {
            form.reset({
                displayName: userProfile.displayName || "",
                regNumber: userProfile.regNumber || "",
                companyName: userProfile.companyName || "",
                goals: userProfile.goals || "",
            });
        }
    }, [userProfile, form]);

    async function onSubmit(data: SettingsFormValues) {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not authenticated' });
            return;
        }
        setIsSubmitting(true);
        try {
            const userRef = doc(firestore, "users", user.uid);
            await updateDoc(userRef, {
                displayName: data.displayName,
                regNumber: data.regNumber,
                companyName: data.companyName,
                goals: data.goals,
            });
            toast({
                title: "Settings updated",
                description: "Your profile has been successfully updated.",
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Update failed",
                description: "Could not update your settings. Please try again.",
            });
        } finally {
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
