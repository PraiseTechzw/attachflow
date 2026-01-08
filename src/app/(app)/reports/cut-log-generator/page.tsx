'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { DailyLog } from '@/types';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Loader2, CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format, startOfMonth } from "date-fns"
import dynamic from 'next/dynamic';

const ModernPDFGenerator = dynamic(() => import('@/components/reports/ModernPDFGenerator'), {
  ssr: false,
});

export default function CutLogGeneratorPage() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [logsForPdf, setLogsForPdf] = useState<DailyLog[] | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const handleGenerate = async () => {
    if (!user || !userProfile) {
      toast({ variant: 'destructive', title: 'User profile not loaded yet. Please wait.' });
      return;
    }
    if (!dateRange || !dateRange.from || !dateRange.to) {
        toast({ variant: 'destructive', title: 'Please select a date range.' });
        return;
    }

    setIsLoading(true);
    setLogsForPdf(null);
    
    try {
      const logsQuery = query(
        collection(firestore, `users/${user.uid}/dailyLogs`),
        where('date', '>=', dateRange.from),
        where('date', '<=', dateRange.to),
        orderBy('date', 'asc')
      );
      const logSnapshot = await getDocs(logsQuery);
      const fetchedLogs = logSnapshot.docs.map(doc => doc.data() as DailyLog);

      if (fetchedLogs.length === 0) {
        toast({ title: 'No Logs Found', description: 'There are no logs in the selected date range.' });
        setIsLoading(false);
        return;
      }
      
      toast({ title: "Logs Loaded!", description: "Your log sheet is ready for generation." });
      setLogsForPdf(fetchedLogs);

    } catch (error) {
      console.error("Failed to load logs:", error);
      toast({ variant: 'destructive', title: 'Failed to Load Logs' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Callback to reset loading state
  const onPdfRendered = () => {
    setIsLoading(false);
  }


  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight gradient-text">CUT Log Sheet Generator</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Generate an official Chinhoyi University of Technology log sheet PDF with beautiful formatting.
        </p>
      </div>

      <Card className="card-hover">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            Select Date Range
          </CardTitle>
          <CardDescription>Choose the period for which you want to generate the log sheet</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 md:flex-row md:items-center">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                    id="date"
                    variant={"outline"}
                    className="w-[300px] justify-start text-left font-normal transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                        dateRange.to ? (
                        <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                        </>
                        ) : (
                        format(dateRange.from, "LLL dd, y")
                        )
                    ) : (
                        <span>Pick a date</span>
                    )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 backdrop-blur-sm bg-background/95 border-border/50" align="start">
                    <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || isProfileLoading}
            variant="gradient"
            size="lg"
            className="min-w-[200px]"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CalendarIcon className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Loading Logs...' : 'Load Logs'}
          </Button>
        </CardContent>
      </Card>
      
      {logsForPdf && !isProfileLoading && userProfile && dateRange?.from && dateRange?.to && (
        <ModernPDFGenerator
          logs={logsForPdf}
          studentName={userProfile.displayName}
          regNumber={userProfile.regNumber || 'N/A'}
          companyName={userProfile.companyName || 'N/A'}
          startDate={format(dateRange.from, 'dd/MM/yyyy')}
          endDate={format(dateRange.to, 'dd/MM/yyyy')}
        />
      )}
    </div>
  );
}
