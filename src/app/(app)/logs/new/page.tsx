'use client';

import { LogForm } from "@/components/logs/log-form";
import { generateLogSuggestion } from "@/ai/flows/generate-log-suggestion-flow";
import { useFirebase } from "@/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Loader2, CalendarIcon } from "lucide-react";
import type { DailyLog } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function NewLogPage() {
  const { firestore, user } = useFirebase();
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [logDate, setLogDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    async function fetchSuggestion() {
      if (!user) {
        setIsLoading(false);
        return;
      };

      try {
        const logsQuery = query(
          collection(firestore, `users/${user.uid}/dailyLogs`),
          orderBy('date', 'desc'),
          limit(1)
        );
        const logSnapshot = await getDocs(logsQuery);
        
        if (!logSnapshot.empty) {
          const lastLog = logSnapshot.docs[0].data() as DailyLog;
          const result = await generateLogSuggestion({ previousLogContent: lastLog.activitiesRaw });
          setSuggestion(result.suggestion);
        }
      } catch (error) {
        console.error("Failed to generate log suggestion:", error);
        // It's okay to fail silently, the user can still type their log.
      } finally {
        setIsLoading(false);
      }
    }
    fetchSuggestion();
  }, [firestore, user]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Daily Log</h1>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
            <p className="text-muted-foreground">
            Record your activities, challenges, and achievements.
            </p>
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !logDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {logDate ? format(logDate, "PPP") : <span>Pick a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 calendar-popover">
                <Calendar
                    mode="single"
                    selected={logDate}
                    onSelect={setLogDate}
                    disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                />
                </PopoverContent>
            </Popover>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[280px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <LogForm suggestion={suggestion} logDate={logDate} />
      )}
    </div>
  );
}
