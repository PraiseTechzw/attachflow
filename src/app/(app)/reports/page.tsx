
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import type { Project, MonthlyReport, DailyLog, FinalReportAIStructure } from '@/types';
import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import { generateFinalReportDoc } from '@/lib/docx-generator';
import { generateFinalReport } from '@/ai/flows/generate-final-report-flow';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useCollection, useMemoFirebase } from "@/firebase";
import { FileDown, Loader2, Calendar, Eye, FileSignature } from 'lucide-react';
import Link from 'next/link';
import { eachMonthOfInterval, format, startOfToday, sub } from 'date-fns';

export default function ReportsPage() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { userProfile } = useUserProfile();
  const [isDocxLoading, setIsDocxLoading] = useState(false);

  // Generate the last 12 months for the report timeline
  const monthIds = useMemo(() => {
    const today = startOfToday();
    const lastYear = sub(today, { years: 1 });
    return eachMonthOfInterval({ start: lastYear, end: today })
           .map(d => format(d, 'yyyy-MM'))
           .reverse();
  }, []);

  const reportsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/monthlyReports`), orderBy('id', 'desc'));
  }, [firestore, user]);

  const { data: monthlyReports, isLoading: isReportsLoading } = useCollection<MonthlyReport>(reportsQuery);
  
  const reportsMap = useMemo(() => {
    return new Map(monthlyReports?.map(report => [report.id, report]));
  }, [monthlyReports]);


  const handleDownloadFinalReport = async () => {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Not logged in' });
        return;
    }
    setIsDocxLoading(true);
    try {
        const projectsQuery = query(collection(firestore, `users/${user.uid}/projects`));
        const logsQuery = query(collection(firestore, `users/${user.uid}/dailyLogs`), orderBy('date', 'asc'));

        const [projectSnapshot, logSnapshot] = await Promise.all([getDocs(projectsQuery), getDocs(logsQuery)]);

        // For simplicity, we'll use the first project found.
        const project = projectSnapshot.docs[0]?.data() as Project | undefined;
        const logs = logSnapshot.docs.map(doc => doc.data() as DailyLog);

        if (!project) {
            toast({ title: 'No Project Found', description: 'Create a project before generating a final report.' });
            setIsDocxLoading(false);
            return;
        }

        toast({ title: "AI is structuring your report...", description: "This might take a moment. Please wait." });

        // Map logs to the simplified schema expected by the AI flow
        const mappedLogs = logs.map(log => ({
          content: log.content ?? log.activitiesRaw ?? '',
          date: log.date
        }));

        const aiGeneratedContent = await generateFinalReport({
            project: {
                title: project.title,
                description: project.description,
            },
            logs: mappedLogs,
            studentName: userProfile.displayName || 'Student',
        });
        
        toast({ title: "Generating Word document..." });

        const doc = generateFinalReportDoc(
            project,
            userProfile.displayName || 'Student',
            aiGeneratedContent as FinalReportAIStructure
        );

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
        <h1 className="text-3xl font-bold tracking-tight">Reports Timeline</h1>
        <p className="text-muted-foreground">
            Review your live monthly reports or generate your final summary.
        </p>
      </div>
      
      <div className="mb-12">
        <Card className='bg-gradient-to-br from-primary/80 to-primary/60 text-primary-foreground'>
          <CardHeader>
            <CardTitle>AI-Powered Final Report</CardTitle>
            <CardDescription className='text-primary-foreground/80'>Let AI structure and summarize all your logs into a professional Word document.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDownloadFinalReport} disabled={isDocxLoading} variant='secondary'>
                {isDocxLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                )}
                Generate Final Report (DOCX)
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Monthly Reports</h2>
        {isReportsLoading && (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )}

        {!isReportsLoading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {monthIds.map(monthId => {
                    const report = reportsMap.get(monthId);
                    const monthDate = new Date(`${monthId}-02`); // Use day 2 to avoid timezone issues
                    const monthName = format(monthDate, 'MMMM yyyy');

                    return (
                        <Card key={monthId} className={`card-hover flex flex-col ${monthId === format(new Date(), 'yyyy-MM') ? 'border-primary' : ''}`}>
                            <CardHeader>
                                <CardTitle>{monthName}</CardTitle>
                                {report ? (
                                    <CardDescription>Status: {report.status}</CardDescription>
                                ) : (
                                    <CardDescription>No report generated yet.</CardDescription>
                                )}
                            </CardHeader>
                            {report ? (
                                <CardContent className="flex-grow">
                                    <div className="text-sm text-muted-foreground">Logs Created</div>
                                    <div className="text-2xl font-bold">{report.logCount}</div>
                                </CardContent>
                            ) : (
                                <CardContent className="flex-grow flex items-center justify-center">
                                    <p className="text-sm text-muted-foreground">Start logging to generate.</p>
                                </CardContent>
                            )}
                            <CardFooter>
                                {report ? (
                                    <Link href={`/reports/${monthId}`} className="w-full">
                                        <Button variant="outline" className="w-full">
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Report
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href={`/reports/generate/${monthId}`} className="w-full">
                                        <Button className="w-full">
                                            <FileSignature className="mr-2 h-4 w-4" />
                                            Generate Report
                                        </Button>
                                    </Link>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        )}

        {!isReportsLoading && monthIds.length === 0 && (
            <Card className="flex flex-col items-center justify-center border-dashed min-h-[200px]">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-secondary p-3 rounded-full w-fit mb-4">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle>No Reports Yet</CardTitle>
                    <CardDescription>Your monthly reports will appear here after you create your first log.</CardDescription>
                </CardHeader>
            </Card>
        )}
      </div>
    </div>
  );
}
