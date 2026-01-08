
'use client';

import React from "react";
import { AIFeedback } from "@/components/logs/ai-feedback";
import { LogForm } from "@/components/logs/log-form";
import { useFirebase } from "@/firebase/provider";
import { useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { DailyLog } from "@/types";

const logFormSchema = z.object({
  activitiesRaw: z.string().min(10, {
    message: "Log content must be at least 10 characters.",
  }),
  activitiesProfessional: z.string().optional(),
});

type LogFormValues = z.infer<typeof logFormSchema>;

export default function LogDetailPage({ params }: { params: Promise<{ logId: string }> }) {
    const { logId } = React.use(params);
    const { firestore, user } = useFirebase();
    const { userProfile, isLoading: profileLoading } = useUserProfile();
    
    const logRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}/dailyLogs`, logId);
    }, [firestore, user, logId]);

    const { data: log, isLoading: logLoading } = useDoc<DailyLog>(logRef);

    const form = useForm<LogFormValues>({
        resolver: zodResolver(logFormSchema),
        defaultValues: {
          activitiesRaw: "",
          activitiesProfessional: "",
        },
      });
    
      React.useEffect(() => {
        if (log) {
          form.reset({
            activitiesRaw: log.activitiesRaw || "",
            activitiesProfessional: log.activitiesProfessional || "",
          });
        }
      }, [log, form]);

    if (logLoading || profileLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }
    
    if (!log) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold">Log not found</h1>
                <p className="text-muted-foreground">The requested log could not be located.</p>
            </div>
        )
    }

    const logDate = log.date.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

  return (
    <FormProvider {...form}>
        <div className="container mx-auto py-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Log for {logDate}</h1>
            <p className="text-muted-foreground">
            Review and edit your log, and see AI-powered feedback.
            </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <LogForm log={log} />
            </div>
            <div className="lg:col-span-1">
                <AIFeedback log={log} studentGoals={userProfile?.goals || "No goals set."} />
            </div>
        </div>
        </div>
    </FormProvider>
  );
}
