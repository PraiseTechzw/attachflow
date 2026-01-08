"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { DailyLog } from "@/types";
import { useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { extractSkillsFromLog } from "@/ai/flows/extract-skills-from-log-flow";
import { polishLogEntry } from "@/ai/flows/polish-log-entry-flow";
import { analyzeLogSentiment } from "@/ai/flows/analyze-log-sentiment-flow";
import { format, getWeek } from 'date-fns';
import { useStatsUpdater } from "@/hooks/use-stats-updater";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useFirstLogDate } from "@/hooks/use-first-log-date";
import { calculateLogNumbers } from "@/lib/date-utils";

const logFormSchema = z.object({
  activitiesRaw: z.string().min(10, {
    message: "Log content must be at least 10 characters.",
  }),
  activitiesProfessional: z.string().optional(),
});

type LogFormValues = z.infer<typeof logFormSchema>;

interface LogFormProps {
  log?: DailyLog;
  suggestion?: string;
  logDate?: Date;
}

export function LogForm({ log, suggestion, logDate }: LogFormProps) {
  const { firestore, user } = useFirebase();
  const [isSaving, setIsSaving] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { updateStats } = useStatsUpdater();
  const { firstLogDate } = useFirstLogDate();

  const form = useForm<LogFormValues>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      activitiesRaw: "",
      activitiesProfessional: "",
    },
  });

  useEffect(() => {
    if (log) {
      form.reset({
        activitiesRaw: log.activitiesRaw || "",
        activitiesProfessional: log.activitiesProfessional || "",
      });
    } else if (suggestion) {
      form.reset({
        activitiesRaw: suggestion,
        activitiesProfessional: "",
      });
    }
  }, [log, suggestion, form]);


  const handlePolish = async () => {
    const rawContent = form.getValues("activitiesRaw");
    if (!rawContent) {
        toast({ variant: "destructive", title: "Nothing to polish!", description: "Write some content before using the Smart Pen." });
        return;
    }
    setIsPolishing(true);
    try {
        const { polishedContent } = await polishLogEntry({ logContent: rawContent });
        form.setValue("activitiesProfessional", polishedContent, { shouldValidate: true });
        toast({ title: "Log Polished!", description: "AI has rewritten your entry." });
    } catch (error) {
        console.error("Error polishing log:", error);
        toast({ variant: "destructive", title: "Polishing Failed" });
    } finally {
        setIsPolishing(false);
    }
  };

  async function onSubmit(data: LogFormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in.' });
        return;
    }
    setIsSaving(true);

    try {
        const isNewLog = !log;
        const dateForLog = isNewLog ? (logDate || new Date()) : log.date.toDate();

        if (isNewLog) {
            if (!logDate) {
                toast({ variant: 'destructive', title: 'Please select a date for the log.' });
                setIsSaving(false);
                return;
            }
            
            const logId = uuidv4();
            const logRef = doc(firestore, `users/${user.uid}/dailyLogs`, logId);
            
            // Calculate attachment-based numbers
            const logNumbers = firstLogDate 
                ? calculateLogNumbers(dateForLog, firstLogDate)
                : {
                    weekNumber: getWeek(dateForLog), // Fallback to ISO week
                    monthNumber: 1,
                    monthYear: format(dateForLog, 'MMMM yyyy')
                };
            
            const newLogData: Omit<DailyLog, 'sentiment' | 'skills' | 'feedback'> = {
                id: logId,
                userId: user.uid,
                ...data,
                date: dateForLog,
                monthYear: logNumbers.monthYear,
                weekNumber: logNumbers.weekNumber,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            
            await setDoc(logRef, newLogData);
            toast({ title: "Log saved successfully!", description: "Your daily progress has been recorded." });

        } else {
            const logRef = doc(firestore, `users/${user.uid}/dailyLogs`, log.id);
            updateDocumentNonBlocking(logRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });
            toast({ title: "Log updated successfully!", description: "Your daily progress has been updated." });
        }
        
        // Trigger a background update of stats.
        await updateStats();

        if (isNewLog) {
            router.push('/logs');
        }

    } catch (error) {
        console.error("Error saving log:", error);
        toast({
            variant: 'destructive',
            title: `Error ${log ? 'updating' : 'saving'} log`,
            description: "An unexpected error occurred. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Card>
    <CardContent className="pt-6">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                control={form.control}
                name="activitiesRaw"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Today's Activities (Raw)</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder={suggestion || "Describe your tasks, progress, and any challenges you faced today."}
                        className="min-h-[200px]"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="activitiesProfessional"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center justify-between">
                        AI Polished Version
                        <Button type="button" size="sm" variant="outline" onClick={handlePolish} disabled={isPolishing}>
                            {isPolishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                            Smart Pen
                        </Button>
                    </FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Click 'Smart Pen' to generate a professional version of your log."
                        className="min-h-[200px] bg-secondary/50"
                        readOnly
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {log ? "Update Log" : "Save Log"}
            </Button>
            </div>
        </form>
        </Form>
    </CardContent>
    </Card>
  );
}
