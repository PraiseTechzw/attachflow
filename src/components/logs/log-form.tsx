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
import { Loader2 } from "lucide-react";
import type { DailyLog, MonthlyReport } from "@/types";
import { useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, serverTimestamp, runTransaction, writeBatch, increment } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { extractSkillsFromLog } from "@/ai/flows/extract-skills-from-log-flow";
import { format } from 'date-fns';

const logFormSchema = z.object({
  content: z.string().min(10, {
    message: "Log content must be at least 10 characters.",
  }),
});

type LogFormValues = z.infer<typeof logFormSchema>;

interface LogFormProps {
  log?: DailyLog;
  suggestion?: string;
}

export function LogForm({ log, suggestion }: LogFormProps) {
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LogFormValues>({
    resolver: zodResolver(logFormSchema),
    defaultValues: {
      content: log?.content || "",
    },
  });

  const updateSkillsAndReports = async (logContent: string, isNewLog: boolean) => {
    if (!user) return;
    const now = new Date();
    const monthId = format(now, 'yyyy-MM');
    const monthlyReportRef = doc(firestore, `users/${user.uid}/monthlyReports`, monthId);
    
    try {
      // 1. Extract skills from log content
      const { skills } = await extractSkillsFromLog({ logContent });
  
      // 2. Run a transaction to update skills and monthly report
      await runTransaction(firestore, async (transaction) => {
        // Update skills
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
  
        // Update monthly report only for new logs
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
                } as MonthlyReport);
            }
        }
      });
  
    } catch (e) {
      console.error("Failed to update skills and reports:", e);
      // Non-blocking error for the user
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
    setIsLoading(true);

    try {
        if (log) {
            // Update existing log
            const logRef = doc(firestore, `users/${user.uid}/dailyLogs`, log.id);
            updateDocumentNonBlocking(logRef, {
                content: data.content,
                updatedAt: serverTimestamp(),
            });
            toast({
                title: "Log updated successfully!",
                description: "Your daily progress has been updated.",
            });
            // Don't navigate away, let user see the changes
        } else {
            // Create new log
            const logId = uuidv4();
            const logRef = doc(firestore, `users/${user.uid}/dailyLogs`, logId);
            const newLog = {
                id: logId,
                content: data.content,
                userId: user.uid,
                date: serverTimestamp(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
             // Use a batch to ensure the primary document is created non-blockingly
             const batch = writeBatch(firestore);
             batch.set(logRef, newLog);
             await batch.commit();

            toast({
                title: "Log saved successfully!",
                description: "Your daily progress has been recorded.",
            });
        }
        
        // After saving, extract skills and update monthly report
        await updateSkillsAndReports(data.content, !log);

        if (!log) {
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
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Today's Activities</FormLabel>
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
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {log ? "Update Log & Skills" : "Save Log & Update Skills"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
