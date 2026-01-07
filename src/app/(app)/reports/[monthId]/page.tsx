'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileDown, Loader2, Lock, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import type { DailyLog, MonthlyReport } from '@/types';
import { useUserProfile } from '@/hooks/use-user-profile';
import { format, parse } from 'date-fns';
import dynamic from 'next/dynamic';

const MonthlyReportPDF = dynamic(() => import('@/components/reports/MonthlyReportPDF'), {
  ssr: false,
});

export default function MonthlyReportPage({ params }: { params: { monthId: string } }) {
  const { monthId } = params; // e.g., "2024-08"
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { userProfile } = useUserProfile();
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  // Parse month and year from monthId
  const reportDate = parse(monthId, 'yyyy-MM', new Date());
  const startOfMonth = new Date(reportDate.getFullYear(), reportDate.getMonth(), 1);
  const endOfMonth = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0, 23, 59, 59);

  // Reference for the monthly report document
  const reportRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}/monthlyReports`, monthId);
  }, [firestore, user, monthId]);

  // Query for logs within the selected month
  const logsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/dailyLogs`),
      where('date', '>=', startOfMonth),
      where('date', '<=', endOfMonth)
    );
  }, [firestore, user, startOfMonth, endOfMonth]);

  const { data: report, isLoading: isReportLoading } = useDoc<MonthlyReport>(reportRef);
  const { data: logs, isLoading: areLogsLoading } = useCollection<DailyLog>(logsQuery);

  const isLoading = isReportLoading || areLogsLoading;

  const handleDownloadClick = () => {
     if (!logs || logs.length === 0 || !userProfile || !report) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot generate report. No logs found for this month.',
      });
      return;
    }
    setIsDownloading(true);
  }
  
  const handleToggleLock = async () => {
    if (!report || !reportRef) return;

    setIsLocking(true);
    const newStatus = report.status === 'Draft' ? 'Finalized' : 'Draft';
    try {
        await updateDoc(reportRef, { status: newStatus });
        toast({
            title: `Report ${newStatus}`,
            description: `The report for ${report.month} has been ${newStatus.toLowerCase()}.`,
        });
    } catch (error) {
        console.error("Failed to update report status:", error);
        toast({ variant: 'destructive', title: 'Update Failed' });
    } finally {
        setIsLocking(false);
    }
  }


  if (isLoading) {
    return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }
  
  if (!report) {
      return (
          <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold">Report Not Found</h1>
                <p className="text-muted-foreground">There is no monthly report for {monthId}.</p>
          </div>
      )
  }

  return (
    <>
      {isDownloading && logs && report && userProfile && (
        <MonthlyReportPDF 
          logs={logs}
          studentName={userProfile.displayName || 'N/A'}
          month={report.month}
          onFinished={() => setIsDownloading(false)}
        />
      )}
      <div className="container mx-auto py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Live Report: {report.month}</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">Status:</p>
              <Badge variant={report.status === 'Draft' ? 'secondary' : 'default'}>{report.status}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
              <Button onClick={handleToggleLock} variant="outline" disabled={isLocking}>
                  {isLocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                      report.status === 'Draft' ? <Lock className="mr-2 h-4 w-4"/> : <Unlock className="mr-2 h-4 w-4"/>
                  )}
                  {report.status === 'Draft' ? 'Finalize' : 'Unlock'}
              </Button>
              <Button onClick={handleDownloadClick} disabled={isDownloading}>
                  {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                  Download PDF
              </Button>
          </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Daily Log Entries</CardTitle>
                <CardDescription>This is a live preview of the logs for {report.month}.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead className="w-[180px]">Date</TableHead>
                              <TableHead>Log Content</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {areLogsLoading ? (
                              <TableRow><TableCell colSpan={2} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                          ) : logs && logs.length > 0 ? (
                              logs.sort((a,b) => a.date.seconds - b.date.seconds).map(log => (
                                  <TableRow key={log.id}>
                                      <TableCell className="font-medium">{format(log.date.toDate(), 'EEEE, MMMM d, yyyy')}</TableCell>
                                      <TableCell className="text-muted-foreground whitespace-pre-wrap">{log.content}</TableCell>
                                  </TableRow>
                              ))
                          ) : (
                              <TableRow><TableCell colSpan={2} className="h-24 text-center">No logs found for this month.</TableCell></TableRow>
                          )}
                      </TableBody>
                  </Table>
              </div>
            </CardContent>
            <CardFooter>
                <p className="text-sm text-muted-foreground">Total logs for this month: {report.logCount}</p>
            </CardFooter>
        </Card>
      </div>
    </>
  );
}
