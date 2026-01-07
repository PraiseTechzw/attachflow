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
import { Loader2, CalendarIcon, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format, startOfMonth } from "date-fns"
import dynamic from 'next/dynamic';

const CUTLogSheetPDF = dynamic(() => import('@/components/reports/CUTLogSheetPDF'), {
  ssr: false,
});

export default function CutLogGeneratorPage() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { userProfile } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [logsForPdf, setLogsForPdf] = useState<DailyLog[] | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const handleDownload = async () => {
    if (!user || !userProfile) {
      toast({ variant: 'destructive', title: 'User not found.' });
      return;
    }
    if (!dateRange || !dateRange.from || !dateRange.to) {
        toast({ variant: 'destructive', title: 'Please select a date range.' });
        return;
    }

    setIsLoading(true);
    setLogsForPdf(null); // Reset previous PDF data
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
        return;
      }
      
      toast({ title: "Preparing PDF...", description: "Your log sheet is being prepared for download." });
      setLogsForPdf(fetchedLogs);

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({ variant: 'destructive', title: 'PDF Generation Failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">CUT Log Sheet Generator</h1>
        <p className="text-muted-foreground">
          Generate an official Chinhoyi University of Technology log sheet PDF.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Date Range</CardTitle>
          <CardDescription>Choose the period for which you want to generate the log sheet.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                    id="date"
                    variant={"outline"}
                    className="w-[300px] justify-start text-left font-normal"
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
                <PopoverContent className="w-auto p-0" align="start">
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

          <Button onClick={handleDownload} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download Official CUT Log Sheet
          </Button>
        </CardContent>
      </Card>
      
      {logsForPdf && userProfile && dateRange?.from && dateRange?.to && (
        <CUTLogSheetPDF
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
