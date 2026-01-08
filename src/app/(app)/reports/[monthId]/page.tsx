
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileDown, Loader2, Lock, Unlock, FileSignature, Edit, 
  CheckCircle, Clock, Eye, Printer, Share, Star, 
  Calendar, User, Building, Hash, FileText, Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useDoc, useMemoFirebase } from '@/firebase';
import type { MonthlyReport } from '@/types';
import { useUserProfile } from '@/hooks/use-user-profile';
import { format, parse } from 'date-fns';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MonthlyReportPDFGenerator = dynamic(() => import('@/components/reports/MonthlyReportPDFGenerator'), {
  ssr: false,
});

// Utility function to safely format dates from Firestore
const safeFormatDate = (date: any, formatString: string = 'PPP'): string => {
  try {
    if (!date) return 'N/A';
    
    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      return format(date.toDate(), formatString);
    }
    
    // Handle regular Date object or date string
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    return format(dateObj, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'N/A';
  }
};

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
  
  const handleToggleLock = async () => {
    if (!report || !reportRef) return;

    setIsLocking(true);
    const newStatus = report.status === 'Draft' ? 'Finalized' : 'Draft';
    try {
        await updateDoc(reportRef, { status: newStatus });
        toast({
            title: `Report ${newStatus} Successfully! 🎉`,
            description: `The report for ${report.month} has been ${newStatus.toLowerCase()}.`,
        });
    } catch (error) {
        console.error("Failed to update report status:", error);
        toast({ 
          variant: 'destructive', 
          title: 'Update Failed',
          description: 'There was an error updating the report status. Please try again.' 
        });
    } finally {
        setIsLocking(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your monthly report...</p>
      </div>
    )
  }
  
  if (!report) {
      const monthDate = parse(monthId, 'yyyy-MM', new Date());
      const monthName = format(monthDate, 'MMMM yyyy');
      return (
        <div className="container mx-auto py-8">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-4/5 opacity-50"></div>
            <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 relative z-10">
              <div className="relative">
                <div className="p-8 rounded-full bg-gradient-to-br from-primary/10 to-chart-4/10 w-fit mx-auto">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground/50" />
                </div>
                <div className="absolute -top-2 -right-2 p-2 rounded-full bg-primary/20">
                  <Star className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">Report Not Found</h1>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  There is no report generated for {monthName} yet. Would you like to create one?
                </p>
              </div>
              <Link href={`/reports/generate/${monthId}`}>
                <Button size="lg" className="font-semibold">
                  <FileSignature className="mr-2 h-5 w-5" />
                  Generate Report for {monthName}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
  }

  const renderSection = (title: string, content?: string) => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold underline print:text-black flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary print:bg-black"></div>
          {title}
        </h3>
        <div className="pl-4 border-l-2 border-primary/20 print:border-black/20">
          <p className="text-sm text-foreground/90 print:text-black whitespace-pre-wrap leading-relaxed text-justify">
              {content || 'Content not generated yet.'}
          </p>
        </div>
    </div>
  );

  return (
    <div className="print-container container mx-auto py-8 max-w-5xl space-y-8">
      {/* Header Section */}
      <div className="print-hide">
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-4/5 rounded-3xl -z-10"></div>
          <div className="py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight gradient-text">
                Monthly Report: {report.month}
              </h1>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Badge 
                variant={report.status === 'Finalized' ? 'default' : 'secondary'}
                className="flex items-center gap-1 text-sm px-3 py-1"
              >
                {report.status === 'Finalized' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                {report.status}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {report.logCount} logs
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold">Report Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your monthly report with the options below
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/reports/generate/${monthId}`}>
                  <Button 
                    variant="outline" 
                    disabled={isLocking || report.status === 'Finalized'}
                    className="hover:border-primary hover:text-primary transition-colors duration-200"
                  >
                    <Edit className="mr-2 h-4 w-4"/>
                    Edit Report
                  </Button>
                </Link>
                <Button 
                  onClick={handleToggleLock} 
                  variant="outline" 
                  disabled={isLocking}
                  className="hover:border-primary hover:text-primary transition-colors duration-200"
                >
                  {isLocking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    report.status === 'Draft' ? <Lock className="mr-2 h-4 w-4"/> : <Unlock className="mr-2 h-4 w-4"/>
                  )}
                  {report.status === 'Draft' ? 'Finalize' : 'Re-open'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PDF Generator */}
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-semibold">PDF Download</h3>
                <p className="text-sm text-muted-foreground">
                  Generate and download your monthly report as a professional PDF document
                </p>
              </div>
              <MonthlyReportPDFGenerator
                report={report}
                studentName={userProfile?.displayName || 'N/A'}
                regNumber={userProfile?.regNumber || 'N/A'}
                companyName={userProfile?.companyName || 'N/A'}
                universityName={userProfile?.universityName || 'Chinhoyi University of Technology'}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <Card id="report-content" className="print:shadow-none print:border-none min-h-[1000px] print:bg-white print:text-black">
          <CardHeader className='text-center space-y-3 font-serif border-b print:border-black/20'>
              <div className="space-y-2">
                <p className='font-bold text-2xl uppercase tracking-wide text-primary print:text-black'>
                  {userProfile?.universityName || 'Chinhoyi University of Technology'}
                </p>
                <p className='font-bold text-xl text-primary/80 print:text-black'>
                  SCHOOL OF ENGINEERING SCIENCES AND TECHNOLOGY
                </p>
                <p className='font-bold text-lg text-primary/70 print:text-black'>
                  ICT AND ELECTRONICS DEPARTMENT
                </p>
              </div>
              <CardTitle className='text-xl underline pt-6 font-bold text-primary print:text-black'>
                INDUSTRIAL ATTACHMENT MONTHLY REPORT
              </CardTitle>
          </CardHeader>
          
          <CardContent className="mt-8 space-y-8 px-8 font-serif">
              {/* Student Information */}
              <div className='pt-6 bg-gradient-to-r from-primary/5 to-chart-4/5 print:bg-transparent rounded-lg p-6 print:p-0'>
                <div className='text-sm grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto'>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 print:hidden">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className='font-semibold'>Name:</span> {userProfile?.displayName || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10 print:hidden">
                      <Hash className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className='font-semibold'>Reg No:</span> {userProfile?.regNumber || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <div className="p-2 rounded-lg bg-purple-500/10 print:hidden">
                      <Building className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <span className='font-semibold'>Company:</span> {userProfile?.companyName || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <div className="p-2 rounded-lg bg-orange-500/10 print:hidden">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <span className='font-semibold'>For the month of:</span> {report.month}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Report Sections */}
              <div className="space-y-8">
                {renderSection("Introduction / Summary", report.introduction)}
                {renderSection("Relevant Duties and Activities", report.duties)}
                {renderSection("Problems Encountered", report.problems)}
                {renderSection("Analysis of Problems", report.analysis)}
                {renderSection("Conclusion", report.conclusion)}
              </div>
          </CardContent>
          
          <CardFooter className="flex-col items-start gap-6 px-8 pt-8 font-serif border-t print:border-black/20">
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary print:text-black" />
                  <p className="text-sm text-muted-foreground print:text-black">
                    Total logs for this month: <span className="font-semibold">{report.logCount}</span>
                  </p>
                </div>
                <div className="text-sm text-muted-foreground print:text-black">
                  Generated on: {safeFormatDate(new Date(), 'PPP')}
                </div>
              </div>
              
              <div className="w-full pt-16 print-only">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="border-b border-black pb-1 mb-2">Student Signature</p>
                    <p className="text-sm">Date: ................................</p>
                  </div>
                  <div>
                    <p className="border-b border-black pb-1 mb-2">Supervisor&apos;s Signature</p>
                    <p className="text-sm">Date: ................................</p>
                  </div>
                </div>
              </div>
          </CardFooter>
      </Card>
      
       <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&family=Tinos:wght@400;700&display=swap');

        .font-serif {
            font-family: 'Times New Roman', Times, serif;
        }

        @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-family: 'Times New Roman', Times, serif;
              background: white;
            }
            .print-hide {
              display: none !important;
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
               padding: 1rem;
               max-width: 100%;
            }
            #report-content {
              border: none !important;
              box-shadow: none !important;
              color: black !important;
              background: white !important;
            }
            .print\\:text-black {
                color: black !important;
            }
            .print\\:bg-transparent {
                background: transparent !important;
            }
            .print\\:border-black\\/20 {
                border-color: rgba(0, 0, 0, 0.2) !important;
            }
            .print\\:hidden {
                display: none !important;
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
