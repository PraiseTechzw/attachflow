
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileDown, Loader2, Lock, Unlock, FileSignature, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useDoc, useMemoFirebase } from '@/firebase';
import type { MonthlyReport } from '@/types';
import { useUserProfile } from '@/hooks/use-user-profile';
import { format, parse } from 'date-fns';
import Link from 'next/link';

export default function MonthlyReportPage({ params }: { params: Promise<{ monthId: string }> }) {
  const { monthId } = React.use(params);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();
  
  const [isLocking, setIsLocking] = useState(false);

  // Reference for the monthly report document
  const reportRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}/monthlyReports`, monthId);
  }, [firestore, user, monthId]);
  
  const { data: report, isLoading: isReportLoading } = useDoc<MonthlyReport>(reportRef);

  const isLoading = isReportLoading || isProfileLoading;

  const handleDownloadClick = () => {
    window.print();
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
      const monthDate = parse(monthId, 'yyyy-MM', new Date());
      const monthName = format(monthDate, 'MMMM yyyy');
      return (
          <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold">Report Not Found</h1>
                <p className="text-muted-foreground">There is no report for {monthName}.</p>
                <Link href={`/reports/generate/${monthId}`} className="mt-4 inline-block">
                    <Button>
                        <FileSignature className="mr-2 h-4 w-4" />
                        Generate Report for {monthName}
                    </Button>
                </Link>
          </div>
      )
  }

  const renderSection = (title: string, content?: string) => (
    <div className="space-y-3">
        <h3 className="text-base font-bold underline">{title}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {content || 'Not generated yet.'}
        </p>
    </div>
  );

  return (
    <div className="print-container container mx-auto py-8 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 print-hide">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Report: {report.month}</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground">Status:</p>
            <Badge variant={report.status === 'Draft' ? 'secondary' : 'default'}>{report.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
            <Link href={`/reports/generate/${monthId}`}>
              <Button variant="secondary" disabled={isLocking}>
                  <Edit className="mr-2 h-4 w-4"/>
                  Edit Report
              </Button>
            </Link>
            <Button onClick={handleToggleLock} variant="outline" disabled={isLocking}>
                {isLocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                    report.status === 'Draft' ? <Lock className="mr-2 h-4 w-4"/> : <Unlock className="mr-2 h-4 w-4"/>
                )}
                {report.status === 'Draft' ? 'Finalize' : 'Re-open'}
            </Button>
            <Button onClick={handleDownloadClick}>
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
        </div>
      </div>

      <Card id="report-content" className="print:shadow-none print:border-none min-h-[1000px] print:bg-white print:text-black">
          <CardHeader className='text-center space-y-2 font-serif'>
              <p className='font-bold text-xl uppercase tracking-wide'>{userProfile?.universityName || 'University Name'}</p>
              <p className='font-bold text-lg'>SCHOOL OF ENGINEERING SCIENCES AND TECHNOLOGY</p>
              <p className='font-bold text-base'>ICT AND ELECTRONICS DEPARTMENT</p>
              <CardTitle className='text-base underline pt-4 font-bold'>INDUSTRIAL ATTACHMENT MONTHLY REPORT</CardTitle>
          </CardHeader>
          <CardContent className="mt-8 space-y-8 px-8 font-serif">
              <div className='pt-6 text-sm grid grid-cols-2 gap-x-8 gap-y-2 max-w-md mx-auto mb-10'>
                <p><span className='font-semibold'>Name:</span> {userProfile?.displayName}</p>
                <p><span className='font-semibold'>Reg No:</span> {userProfile?.regNumber}</p>
                <p className="col-span-2"><span className='font-semibold'>Company:</span> {userProfile?.companyName}</p>
                <p className="col-span-2"><span className='font-semibold'>For the month of:</span> {report.month}</p>
              </div>
              
              {renderSection("Introduction / Summary", report.introduction)}
              {renderSection("Relevant Duties and Activities", report.duties)}
              {renderSection("Problems Encountered", report.problems)}
              {renderSection("Analysis of Problems", report.analysis)}
              {renderSection("Conclusion", report.conclusion)}

          </CardContent>
          <CardFooter className="flex-col items-start gap-4 px-8 pt-8 font-serif">
              <p className="text-sm text-muted-foreground print:text-black">Total logs for this month: {report.logCount}</p>
              <div className="w-full pt-20 print-only">
                <p>Supervisor&apos;s Signature................................................ Date: ................................................</p>
              </div>
          </CardFooter>
      </Card>
      
       <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap');

        .font-serif {
            font-family: 'Tinos', serif;
        }

        @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-family: 'Tinos', serif;
            }
            .print-hide {
              display: none;
            }
            .print-only {
                display: block !important;
            }
            main {
              padding: 0;
              margin: 0;
              background: white;
            }
            .print-container {
               padding: 0;
               max-width: 100%;
            }
            #report-content {
              border: none !important;
              box-shadow: none !important;
              color: black;
            }
            .print\:text-black {
                color: black !important;
            }
            p {
                text-align: justify;
            }
            @page {
              size: A4;
              margin: 2cm;
            }
        }
        .print-only {
            display: none;
        }
      `}</style>
    </div>
  );
}
