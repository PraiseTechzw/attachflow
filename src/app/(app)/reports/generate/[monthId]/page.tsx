'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { DailyLog, MonthlyReport } from '@/types';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Loader2, FileDown, Sparkles, AlertTriangle } from 'lucide-react';
import { format, parse, subMonths, getMonth, getYear } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { generateMonthlyReport } from '@/ai/flows/generate-monthly-report-flow';

export default function GenerateMonthlyReportPage({ params }: { params: { monthId: string } }) {
  const { monthId } = params; // e.g., "2024-08"
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { userProfile } = useUserProfile();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reportData, setReportData] = useState<Partial<MonthlyReport>>({});
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [hasFetchedLogs, setHasFetchedLogs] = useState(false);
  
  const reportDate = parse(monthId, 'yyyy-MM', new Date());
  const monthName = format(reportDate, 'MMMM yyyy');

  // Fetch logs and check for previous report conclusion on mount
  useEffect(() => {
    if (!user) return;
    
    const fetchPrerequisites = async () => {
        // 1. Fetch logs for the current month
        const startOfMonth = new Date(getYear(reportDate), getMonth(reportDate), 1);
        const endOfMonth = new Date(getYear(reportDate), getMonth(reportDate) + 1, 0, 23, 59, 59);

        const logsQuery = query(
            collection(firestore, `users/${user.uid}/dailyLogs`),
            where('date', '>=', startOfMonth),
            where('date', '<=', endOfMonth)
        );
        const logSnapshot = await getDocs(logsQuery);
        const fetchedLogs = logSnapshot.docs.map(doc => doc.data() as DailyLog);
        setLogs(fetchedLogs);
        setHasFetchedLogs(true);

        // 2. Fetch previous month's conclusion for continuity
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
        setReportData(prev => ({...prev, introduction: intro}));
    };

    fetchPrerequisites();

  }, [user, firestore, monthId, reportDate]);


  const handleAutoGenerate = async () => {
    if (logs.length === 0) {
        toast({ variant: 'destructive', title: 'No logs found for this month.' });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateMonthlyReport({ logs });
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
        toast({ variant: 'destructive', title: 'AI Generation Failed' });
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
            id: monthId,
            userId: user.uid,
            month: monthName,
            year: getYear(reportDate),
            logCount: logs.length,
            status: 'Draft',
            lastUpdated: new Date(),
            ...reportData,
        };

        await setDoc(reportRef, finalReportData, { merge: true });
        toast({ title: 'Report Saved', description: 'Your monthly report has been saved as a draft.' });
      } catch (error) {
          console.error("Failed to save report:", error);
          toast({ variant: 'destructive', title: 'Save Failed' });
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

  return (
    <div className="print-container container mx-auto py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 print-hide">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Report: {monthName}</h1>
          <p className="text-muted-foreground">Use AI to generate a draft and then edit the content below.</p>
        </div>
        <div className='flex gap-2'>
            <Button onClick={handleSaveReport} disabled={isSaving || isGenerating}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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

      <Card id="report-content">
          <CardHeader className='text-center'>
              <div className='font-bold'>CHINHOYI UNIVERSITY OF TECHNOLOGY (CUT)</div>
              <div className='font-bold text-sm'>SCHOOL OF ENGINEERING SCIENCES AND TECHNOLOGY</div>
              <div className='font-bold text-xs'>ICT AND ELECTRONICS DEPARTMENT</div>
              <CardTitle className='text-base underline pt-2'>INDUSTRIAL ATTACHMENT MONTHLY REPORT</CardTitle>
              <div className='pt-4 text-sm text-left'>
                <p><span className='font-semibold'>Name:</span> {userProfile?.displayName}</p>
                <p><span className='font-semibold'>Reg No:</span> {userProfile?.regNumber}</p>
                <p><span className='font-semibold'>Company:</span> {userProfile?.companyName}</p>
                <p><span className='font-semibold'>For the month of:</span> {monthName}</p>
              </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {reportFields.map(field => (
                <div key={field.key} className="grid w-full gap-1.5">
                    <Label htmlFor={field.key} className="text-lg font-semibold">{field.label}</Label>
                    <Textarea
                        id={field.key}
                        value={(reportData[field.key] as string) || ''}
                        onChange={(e) => handleTextChange(field.key, e.target.value)}
                        placeholder={`Content for ${field.label}...`}
                        className="min-h-[150px] whitespace-pre-wrap print-show"
                    />
                </div>
            ))}
          </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
            .print-show {
                border: none !important;
                background-color: transparent !important;
                box-shadow: none !important;
                resize: none !important;
                height: auto !important;
            }
        }
      `}</style>

    </div>
  );
}
