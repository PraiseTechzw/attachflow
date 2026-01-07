'use client';

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { MonthlyReportDocument } from './MonthlyReportDocument';
import type { DailyLog, MonthlyReport, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MonthlyReportPDFProps {
  report: MonthlyReport;
  logs: DailyLog[];
  userProfile: UserProfile | null;
}

export function MonthlyReportPDF({ report, logs, userProfile }: MonthlyReportPDFProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <PDFDownloadLink
                document={<MonthlyReportDocument report={report} logs={logs} userProfile={userProfile} />}
                fileName={`Monthly_Report_${report.id}.pdf`}
            >
                {({ loading }) => (
                    <Button disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                        Download PDF
                    </Button>
                )}
            </PDFDownloadLink>
        )
    }

    return (
        <div className="h-[70vh] w-full mt-8">
            <PDFViewer width="100%" height="100%">
                <MonthlyReportDocument report={report} logs={logs} userProfile={userProfile} />
            </PDFViewer>
        </div>
    )
}
