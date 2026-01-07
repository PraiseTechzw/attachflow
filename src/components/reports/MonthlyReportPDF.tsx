'use client';

import React, { useEffect } from 'react';
import { usePDF } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import MonthlyReportDocument from '@/components/reports/MonthlyReportDocument';
import type { DailyLog } from '@/types';
import { Loader2 } from 'lucide-react';

interface MonthlyReportPDFProps {
  logs: DailyLog[];
  studentName: string;
  month: string;
  onFinished: () => void;
}

const MonthlyReportPDF: React.FC<MonthlyReportPDFProps> = ({ logs, studentName, month, onFinished }) => {
  const { toast } = useToast();

  const document = (
    <MonthlyReportDocument
      logs={logs}
      studentName={studentName}
      month={month}
    />
  );
  
  const [instance, updateInstance] = usePDF({ document });

  useEffect(() => {
    const generateAndDownload = async () => {
      if (instance.loading) return;

      if (instance.error) {
        console.error('Failed to generate PDF:', instance.error);
        toast({
          variant: 'destructive',
          title: 'PDF Generation Failed',
          description: 'An unexpected error occurred.',
        });
        onFinished();
        return;
      }
      
      if (instance.blob) {
        try {
          saveAs(instance.blob, `Monthly_Report_${month.replace(' ', '_')}.pdf`);
        } catch (error) {
           console.error('Failed to save PDF:', error);
           toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'Could not save the PDF file.',
          });
        } finally {
          onFinished();
        }
      }
    };

    generateAndDownload();

  }, [instance, onFinished, toast, month]);

  // This component doesn't render anything to the main DOM itself,
  // but it's helpful to show a loading state in the console or via a modal if desired.
  if (instance.loading) {
      return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background p-4 rounded-lg flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin"/>
                <span>Generating PDF...</span>
              </div>
          </div>
      )
  }

  return null;
};

export default MonthlyReportPDF;
