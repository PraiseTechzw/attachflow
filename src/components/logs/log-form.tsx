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
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { DailyLog, MonthlyReport } from "@/types";
import { useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, serverTimestamp, runTransaction, writeBatch, increment } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { extractSkillsFromLog } from "@/ai/flows/extract-skills-from-log-flow";
import { polishLogEntry } from "@/ai/flows/polish-log-entry-flow";
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
}

export function LogForm({ log, suggestion }: LogFormProps) {
  const { firestore, user } = useFirebase();
  const [isSaving, setIsSaving] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LogFormValues>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      activitiesRaw: log?.activitiesRaw || "",
      activitiesProfessional: log?.activitiesProfessional || "",
    },
  });

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

  const updateSkillsAndReports = async (logContent: string, isNewLog: boolean) => {
    if (!user) return;
    const now = new Date();
    const monthId = format(now, 'yyyy-MM');
    const monthlyReportRef = doc(firestore, `users/${user.uid}/monthlyReports`, monthId);
    
    try {
      const { skills } = await extractSkillsFromLog({ logContent });
  
      await runTransaction(firestore, async (transaction) => {
        if (skills && skills.length > 0) {
          for (const skillName of skills) {
            const skillId = skillName.toLowerCase().replace(/\s+/g, '-');
            const skillRef = doc(firestore, `users/${user.uid}/skills`, skillId);
            const skillDoc = await transaction.get(skillRef);
            
            if (skillDoc.exists()) {
              transaction.update(skillRef, { frequency: increment(1) });
            } else {
              transaction.set(skillRef, {
                id: skillId,
                name: skillName,
                frequency: 1,
                userId: user.uid,
              });
            }
          }
        }
  
        if (isNewLog) {
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
                    month: format(now, 'MMMM yyyy'),
                    year: now.getFullYear(),
                    logCount: 1,
                    status: 'Draft',
                    lastUpdated: serverTimestamp(),
                } as Omit<MonthlyReport, 'status' | 'duties' | 'problems' | 'analysis' | 'conclusion'> & { status: 'Draft' });
            }
        }
      });
  
    } catch (e) {
      console.error("Failed to update skills and reports:", e);
      toast({
          variant: "destructive",
          title: "Could not update skills/reports",
          description: "Your log was saved, but there was an issue updating aggregated data."
      })
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
        if (isNewLog) {
            const logId = uuidv4();
            const now = new Date();
            const logRef = doc(firestore, `users/${user.uid}/dailyLogs`, logId);
            const newLogData = {
                id: logId,
                userId: user.uid,
                ...data,
                date: serverTimestamp(),
                monthYear: format(now, 'MMMM yyyy'),
                weekNumber: getWeek(now),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
             const batch = writeBatch(firestore);
             batch.set(logRef, newLogData);
             await batch.commit();
             toast({ title: "Log saved successfully!", description: "Your daily progress has been recorded." });

        } else {
            const logRef = doc(firestore, `users/${user.uid}/dailyLogs`, log.id);
            updateDocumentNonBlocking(logRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });
            toast({ title: "Log updated successfully!", description: "Your daily progress has been updated." });
        }
        
        await updateSkillsAndReports(data.activitiesRaw, isNewLog);

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
                {log ? "Update Log & Skills" : "Save Log & Update Skills"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
