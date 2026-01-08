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
import type { DailyLog, MonthlyReport } from "@/types";
import { useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, serverTimestamp, runTransaction, writeBatch, increment, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { extractSkillsFromLog } from "@/ai/flows/extract-skills-from-log-flow";
import { polishLogEntry } from "@/ai/flows/polish-log-entry-flow";
import { analyzeLogSentiment } from "@/ai/flows/analyze-log-sentiment-flow";
import { format, getWeek } from 'date-fns';

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

  const runAIAugmentation = async (logContent: string, logRef: any) => {
    if (!user) return;
    try {
      // Run skill extraction and sentiment analysis in parallel
      const [skillsResult, sentimentResult] = await Promise.all([
        extractSkillsFromLog({ logContent }),
        analyzeLogSentiment({ logContent })
      ]);

      const { skills } = skillsResult;
      const { sentiment } = sentimentResult;

      const batch = writeBatch(firestore);

      // Update log with sentiment
      batch.update(logRef, { sentiment });

      // Update skills subcollection
      if (skills && skills.length > 0) {
        for (const skillName of skills) {
          const skillId = skillName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const skillRef = doc(firestore, `users/${user.uid}/skills`, skillId);
          // In a batched write, we can't read first, so we use increment.
          // This requires a more complex transaction if we need to set initial value.
          // For simplicity here, we assume a transaction in a real scenario
          // or handle creation separately. This non-transactional approach is a simplification.
          const skillDoc = {
              id: skillId,
              name: skillName,
              userId: user.uid,
              frequency: increment(1)
          };
          // This will overwrite the name but is acceptable for this simplified scenario
          batch.set(skillRef, skillDoc, { merge: true });
        }
      }
      
      await batch.commit();

    } catch (e) {
      console.error("Failed to run AI augmentation:", e);
      toast({
        variant: "destructive",
        title: "AI Augmentation Failed",
        description: "Your log was saved, but AI features failed."
      })
    }
  };

  const updateMonthlyReport = async (date: Date) => {
    if (!user) return;
    
    const monthId = format(date, 'yyyy-MM');
    const monthlyReportRef = doc(firestore, `users/${user.uid}/monthlyReports`, monthId);

    try {
        await runTransaction(firestore, async (transaction) => {
            const reportDoc = await transaction.get(monthlyReportRef);
            if (reportDoc.exists()) {
                transaction.update(monthlyReportRef, { 
                    logCount: increment(1),
                    lastUpdated: serverTimestamp() 
                });
            } else {
                transaction.set(monthlyReportRef, {
                    id: monthId,
                    userId: user.uid,
                    month: format(date, 'MMMM yyyy'),
                    year: date.getFullYear(),
                    logCount: 1,
                    status: 'Draft',
                    lastUpdated: serverTimestamp(),
                } as Omit<MonthlyReport, 'status' | 'duties' | 'problems' | 'analysis' | 'conclusion'> & { status: 'Draft' });
            }
        });
    } catch (e) {
        console.error("Failed to update monthly report:", e);
        // Fail silently as the log itself is already saved.
    }
  }


  async function onSubmit(data: LogFormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in.' });
        return;
    }
    setIsSaving(true);

    try {
        const isNewLog = !log;
        let logRef;
        const dateForLog = isNewLog ? (logDate || new Date()) : log.date.toDate();

        if (isNewLog) {
            if (!logDate) {
                toast({ variant: 'destructive', title: 'Please select a date for the log.' });
                setIsSaving(false);
                return;
            }
            const logId = uuidv4();
            logRef = doc(firestore, `users/${user.uid}/dailyLogs`, logId);
            const newLogData = {
                id: logId,
                userId: user.uid,
                ...data,
                date: dateForLog,
                monthYear: format(dateForLog, 'MMMM yyyy'),
                weekNumber: getWeek(dateForLog),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
             await setDoc(logRef, newLogData);
             toast({ title: "Log saved successfully!", description: "Your daily progress has been recorded." });

        } else {
            logRef = doc(firestore, `users/${user.uid}/dailyLogs`, log.id);
            updateDocumentNonBlocking(logRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });
            toast({ title: "Log updated successfully!", description: "Your daily progress has been updated." });
        }
        
        // Run AI tasks in the background
        runAIAugmentation(data.activitiesRaw, logRef);

        // Update monthly report count only for new logs
        if (isNewLog) {
            updateMonthlyReport(dateForLog);
        }

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
