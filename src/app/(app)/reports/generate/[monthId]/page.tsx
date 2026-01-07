
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import type { DailyLog, MonthlyReport } from '@/types';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Loader2, FileDown, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { format, parse, subMonths, getMonth, getYear } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { generateMonthlyReport } from '@/ai/flows/generate-monthly-report-flow';

export default function GenerateMonthlyReportPage({ params }: { params: Promise<{ monthId: string }> }) {
  const { monthId } = React.use(params);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { userProfile } = useUserProfile();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<Partial<MonthlyReport>>({});
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [hasFetchedLogs, setHasFetchedLogs] = useState(false);
  
  const reportDate = parse(monthId, 'yyyy-MM', new Date());
  const monthName = format(reportDate, 'MMMM yyyy');

  // Fetch logs and check for existing report or previous conclusion on mount
  useEffect(() => {
    if (!user || !firestore) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Calculate date ranges
        const startOfMonth = new Date(getYear(reportDate), getMonth(reportDate), 1);
        const endOfMonth = new Date(getYear(reportDate), getMonth(reportDate) + 1, 0, 23, 59, 59);

        // 2. Fetch Logs for the current month
        const logsQuery = query(
          collection(firestore, `users/${user.uid}/dailyLogs`),
          where('date', '>=', startOfMonth),
          where('date', '<=', endOfMonth)
        );
        const logSnapshot = await getDocs(logsQuery);
        const fetchedLogs = logSnapshot.docs.map(doc => doc.data() as DailyLog);
        setLogs(fetchedLogs);

        // 3. Check if a report already exists for this month
        const currentReportRef = doc(firestore, `users/${user.uid}/monthlyReports`, monthId);
        const currentReportSnap = await getDoc(currentReportRef);

        if (currentReportSnap.exists()) {
          // Load existing report data
          const existingData = currentReportSnap.data() as MonthlyReport;
          setReportData(existingData);
        } else {
          // New Report: Fetch previous month's conclusion for continuity
          const prevMonthDate = subMonths(reportDate, 1);
          const prevMonthId = format(prevMonthDate, 'yyyy-MM');
          const prevReportRef = doc(firestore, `users/${user.uid}/monthlyReports`, prevMonthId);
          const prevReportSnap = await getDoc(prevReportRef);

          let intro = '';
          if (prevReportSnap.exists()) {
            const prevReport = prevReportSnap.data() as MonthlyReport;
            if (prevReport.conclusion) {
              intro = `Continuing from the activities of last month where we concluded with: "${prevReport.conclusion}", this month focused on...`;
            }
          }
          setReportData(prev => ({ ...prev, introduction: intro }));
        }
      } catch (error) {
        console.error("Error fetching prerequisites:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load report data.' });
      } finally {
        setIsLoading(false);
        setHasFetchedLogs(true);
      }
    };

    fetchData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore, monthId, reportDate]); // reportDate is derived from monthId, but included for stability

  const handleAutoGenerate = async () => {
    if (logs.length === 0) {
        toast({ variant: 'destructive', title: 'No logs found for this month.' });
        return;
    }
    setIsGenerating(true);
    try {
      // Map logs to required shape for generateMonthlyReport
      const mappedLogs = logs.map(log => ({
        content: log.content ?? log.activitiesRaw ?? '',
        date: log.date
      }));
      const result = await generateMonthlyReport({ logs: mappedLogs });
      setReportData(prev => ({
        ...prev,
        duties: result.duties,
        problems: result.problems,
        analysis: result.analysis,
        conclusion: result.conclusion,
      }));
      toast({ title: 'Draft Generated', description: 'AI has generated the report draft. Please review and edit.' });
    } catch (error) {
      console.error("AI generation failed:", error);
      toast({ variant: 'destructive', title: 'AI Generation Failed', description: 'Please try again later.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReport = async () => {
      if (!user) return;
      setIsSaving(true);
      try {
        const reportRef = doc(firestore, `users/${user.uid}/monthlyReports`, monthId);
        const finalReportData: MonthlyReport = {
          ...reportData as MonthlyReport, // Spread first (may include AI fields)
          id: monthId,
          userId: user.uid,
          month: monthName,
          year: getYear(reportDate),
          logCount: logs.length,
          status: 'Draft',
          lastUpdated: new Date(), // Override after
        };

        await setDoc(reportRef, finalReportData, { merge: true });
        toast({ title: 'Report Saved', description: 'Your monthly report has been saved as a draft.' });
      } catch (error) {
          console.error("Failed to save report:", error);
          toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save report to database.' });
      } finally {
          setIsSaving(false);
      }
  }
  
  const handleDownload = () => window.print();

  const handleTextChange = (field: keyof MonthlyReport, value: string) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const reportFields: { key: keyof MonthlyReport, label: string }[] = [
    { key: 'introduction', label: 'Introduction / Summary' },
    { key: 'duties', label: 'Relevant Duties and Activities' },
    { key: 'problems', label: 'Problems Encountered' },
    { key: 'analysis', label: 'Analysis of Problems' },
    { key: 'conclusion', label: 'Conclusion' },
  ];

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="print-container container mx-auto py-8 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 print-hide">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Report: {monthName}</h1>
          <p className="text-muted-foreground">Use AI to generate a draft and then edit the content below.</p>
        </div>
        <div className='flex gap-2'>
            <Button onClick={handleSaveReport} disabled={isSaving || isGenerating} variant="outline">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Save Draft
            </Button>
            <Button onClick={handleDownload}>
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
        </div>
      </div>
      
      <div className='print-hide mb-8'>
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Sparkles className="text-primary h-5 w-5"/>
                    AI Draft Generator
                </CardTitle>
                <CardDescription>Summarize all logs from {monthName} into a report draft.</CardDescription>
            </CardHeader>
            <CardContent>
                {hasFetchedLogs && logs.length === 0 ? (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>No Logs Found!</AlertTitle>
                        <AlertDescription>
                            There are no daily logs recorded for {monthName}. Please add logs before generating a report.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Button onClick={handleAutoGenerate} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Auto-Generate Draft ({logs.length} {logs.length === 1 ? 'log' : 'logs'})
                    </Button>
                )}
            </CardContent>
        </Card>
      </div>

      <Card id="report-content" className="min-h-[1000px]">
          <CardHeader className='text-center space-y-2'>
              <div className='font-bold text-xl uppercase tracking-wide'>{userProfile?.universityName || 'University Name'}</div>
              <div className='font-bold text-sm'>SCHOOL OF ENGINEERING SCIENCES AND TECHNOLOGY</div>
              <div className='font-bold text-xs'>ICT AND ELECTRONICS DEPARTMENT</div>
              <CardTitle className='text-base underline pt-4 font-bold'>INDUSTRIAL ATTACHMENT MONTHLY REPORT</CardTitle>
              <div className='pt-6 text-sm text-left grid grid-cols-2 gap-4 max-w-md mx-auto'>
                <p><span className='font-semibold'>Name:</span> {userProfile?.displayName || 'N/A'}</p>
                <p><span className='font-semibold'>Reg No:</span> {userProfile?.regNumber || 'N/A'}</p>
                <p className="col-span-2"><span className='font-semibold'>Company:</span> {userProfile?.companyName || 'N/A'}</p>
                <p className="col-span-2"><span className='font-semibold'>For the month of:</span> {monthName}</p>
              </div>
          </CardHeader>
          <CardContent className="space-y-8 mt-4">
            {reportFields.map(field => (
                <div key={field.key} className="grid w-full gap-2">
                    <Label htmlFor={field.key} className="text-base font-bold underline">{field.label}</Label>
                    <Textarea
                        id={field.key}
                        value={(reportData[field.key] as string) || ''}
                        onChange={(e) => handleTextChange(field.key, e.target.value)}
                        placeholder={`Content for ${field.label}...`}
                        className="min-h-[150px] print-show text-sm leading-relaxed"
                    />
                </div>
            ))}
          </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: white;
            }
            /* Hide UI elements */
            .print-hide {
              display: none !important;
            }
            /* Reset main container */
            main {
              padding: 0;
              margin: 0;
              max-width: none;
            }
            .print-container {
               padding: 0;
               max-width: 100%;
            }
            /* Card styling for print */
            #report-content {
              border: none !important;
              box-shadow: none !important;
            }
            /* Textarea styling for print */
            .print-show {
                display: block;
                width: 100%;
                border: none !important;
                background-color: transparent !important;
                box-shadow: none !important;
                resize: none !important;
                overflow: hidden; 
                padding: 0;
                font-family: 'Times New Roman', Times, serif;
                color: black;
                text-align: justify;
                white-space: pre-wrap;
                /* Ensure textarea height fits content - requires JS or fixed min-height in CSS */
                height: auto !important; 
            }
            /* Adjust labels for print */
            label {
                font-family: 'Times New Roman', Times, serif;
                font-weight: bold;
                color: black;
            }
            @page {
              size: A4;
              margin: 2cm;
            }
        }
      `}</style>

    </div>
  );
}
