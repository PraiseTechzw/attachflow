'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MonthlyReport } from '@/types';
import { format } from 'date-fns';

interface MonthlyReportPDFGeneratorProps {
  report: MonthlyReport;
  studentName: string;
  regNumber: string;
  companyName: string;
  universityName: string;
}

const MonthlyReportPDFGenerator: React.FC<MonthlyReportPDFGeneratorProps> = ({
  report,
  studentName,
  regNumber,
  companyName,
  universityName
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const generatePDF = async () => {
    if (!previewRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      if (!previewRef.current) {
        throw new Error('Preview element not found');
      }

      // Create canvas from HTML
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `Monthly_Report_${report.month.replace(' ', '_')}_${studentName.replace(' ', '_')}.pdf`;
      pdf.save(fileName);

      toast({
        title: 'PDF Downloaded Successfully! 🎉',
        description: `Your monthly report for ${report.month} has been downloaded.`,
      });

    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'PDF Generation Failed',
        description: 'There was an error generating the PDF. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderSection = (title: string, content?: string) => (
    <div className="space-y-4 mb-8">
      <h3 className="text-lg font-bold underline text-black flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-black"></div>
        {title}
      </h3>
      <div className="pl-4 border-l-2 border-black/20">
        <p className="text-sm text-black whitespace-pre-wrap leading-relaxed text-justify">
          {content || 'Content not generated yet.'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button 
          onClick={() => setShowPreview(!showPreview)}
          variant="outline"
          className="hover:border-primary hover:text-primary transition-colors duration-200"
        >
          <Eye className="mr-2 h-4 w-4" />
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
        
        <Button 
          onClick={generatePDF}
          disabled={isGenerating}
          className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      </div>

      {showPreview && (
        <div className="border rounded-lg p-4 bg-white">
          <div 
            ref={previewRef}
            className="bg-white text-black p-8 font-serif"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            {/* Header */}
            <div className="text-center space-y-3 border-b border-black/20 pb-6 mb-8">
              <div className="space-y-2">
                <p className="font-bold text-2xl uppercase tracking-wide text-black">
                  {universityName || 'Chinhoyi University of Technology'}
                </p>
                <p className="font-bold text-xl text-black">
                  SCHOOL OF ENGINEERING SCIENCES AND TECHNOLOGY
                </p>
                <p className="font-bold text-lg text-black">
                  ICT AND ELECTRONICS DEPARTMENT
                </p>
              </div>
              <h1 className="text-xl underline pt-6 font-bold text-black">
                INDUSTRIAL ATTACHMENT MONTHLY REPORT
              </h1>
            </div>

            {/* Student Information */}
            <div className="mb-8 p-6 bg-gray-50">
              <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div>
                  <span className="font-semibold">Name:</span> {studentName || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Reg No:</span> {regNumber || 'N/A'}
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold">Company:</span> {companyName || 'N/A'}
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold">For the month of:</span> {report.month}
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

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-black/20">
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm text-black">
                  Total logs for this month: <span className="font-semibold">{report.logCount}</span>
                </p>
                <div className="text-sm text-black">
                  Generated on: {format(new Date(), 'PPP')}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 pt-16">
                <div>
                  <p className="border-b border-black pb-1 mb-2">Student Signature</p>
                  <p className="text-sm">Date: ................................</p>
                </div>
                <div>
                  <p className="border-b border-black pb-1 mb-2">Supervisor's Signature</p>
                  <p className="text-sm">Date: ................................</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReportPDFGenerator;