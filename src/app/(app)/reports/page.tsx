'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, FileDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { DailyLog, Project } from '@/types';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import MonthlyReportDocument from '@/components/reports/MonthlyReportDocument';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Packer } from 'docx';
import { generateFinalReport } from '@/lib/docx-generator';

export default function ReportsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isDocxLoading, setIsDocxLoading] = useState(false);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { userProfile } = useUserProfile();

  const handleDownloadMonthlyReport = async () => {
    if (!date || !user || !userProfile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a month and ensure you are logged in.',
      });
      return;
    }
    setIsPdfLoading(true);

    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const logsQuery = query(
        collection(firestore, `users/${user.uid}/dailyLogs`),
        where('date', '>=', startOfMonth),
        where('date', '<=', endOfMonth)
      );

      const querySnapshot = await getDocs(logsQuery);
      const logs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as DailyLog[];

      if (logs.length === 0) {
        toast({
          title: 'No Logs Found',
          description: 'There are no logs for the selected month.',
        });
        return;
      }

      const blob = await pdf(
        <MonthlyReportDocument
          logs={logs}
          studentName={userProfile.displayName || 'N/A'}
          month={format(date, 'MMMM yyyy')}
        />
      ).toBlob();

      saveAs(blob, `Monthly_Report_${format(date, 'MMM_yyyy')}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      toast({
        variant: 'destructive',
        title: 'PDF Generation Failed',
        description: 'An unexpected error occurred while creating the report.',
      });
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleDownloadFinalReport = async () => {
    if (!user) return;
    setIsDocxLoading(true);
    try {
        const projectsQuery = query(collection(firestore, `users/${user.uid}/projects`));
        const logsQuery = query(collection(firestore, `users/${user.uid}/dailyLogs`));

        const [projectSnapshot, logSnapshot] = await Promise.all([getDocs(projectsQuery), getDocs(logsQuery)]);

        // For simplicity, we'll use the first project found.
        const project = projectSnapshot.docs[0]?.data() as Project | undefined;
        const logs = logSnapshot.docs.map(doc => doc.data() as DailyLog);

        if (!project) {
            toast({ title: 'No Project Found', description: 'Create a project before generating a final report.' });
            return;
        }

        const doc = generateFinalReport(project, logs, userProfile?.displayName || 'Student');
        const blob = await Packer.toBlob(doc);
        saveAs(blob, "Final_Report.docx");

    } catch (error) {
        console.error("Failed to generate DOCX report:", error);
        toast({ variant: 'destructive', title: 'Word Generation Failed' });
    } finally {
        setIsDocxLoading(false);
    }
};

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and download your attachment reports.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Log Report</CardTitle>
            <CardDescription>Generate a PDF report of your daily logs for a specific month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className="w-[280px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'MMMM yyyy') : <span>Pick a month</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    captionLayout="dropdown-buttons" 
                    fromYear={2020} 
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleDownloadMonthlyReport} disabled={isPdfLoading}>
              {isPdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Download PDF Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Final Attachment Report</CardTitle>
            <CardDescription>Generate a Word document of your final project report.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDownloadFinalReport} disabled={isDocxLoading}>
                {isDocxLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                )}
                Download Word Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
