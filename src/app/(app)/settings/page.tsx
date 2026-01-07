
'use client'
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
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const settingsFormSchema = z.object({
    displayName: z.string().min(2, {
        message: "Display name must be at least 2 characters.",
    }).max(50, {
        message: "Display name must not be longer than 50 characters.",
    }),
    goals: z.string().max(500, {
        message: "Goals must not be longer than 500 characters.",
    }).optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
    const { user, userProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
          displayName: userProfile?.displayName || "",
          goals: userProfile?.goals || "",
        },
        mode: "onChange",
      });

    async function onSubmit(data: SettingsFormValues) {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not authenticated' });
            return;
        }
        setIsLoading(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                displayName: data.displayName,
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
            setIsLoading(false);
        }
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
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
