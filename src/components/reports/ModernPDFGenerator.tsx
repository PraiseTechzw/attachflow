'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Eye, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DailyLog } from '@/types';
import { format } from 'date-fns';

interface ModernPDFGeneratorProps {
  logs: DailyLog[];
  studentName: string;
  regNumber: string;
  companyName: string;
  startDate: string;
  endDate: string;
}

const ModernPDFGenerator: React.FC<ModernPDFGeneratorProps> = ({
  logs,
  studentName,
  regNumber,
  companyName,
  startDate,
  endDate,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
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
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Download the PDF
      pdf.save(`CUT_Log_Sheet_${studentName}.pdf`);
      
      toast({
        title: "PDF Generated Successfully!",
        description: "Your CUT log sheet has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const LogSheetContent = () => (
    <div 
      ref={previewRef}
      className="bg-white p-8 text-black font-sans"
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold mb-2">CHINHOYI UNIVERSITY OF TECHNOLOGY (CUT)</h1>
        <h2 className="text-lg font-bold mb-1">SCHOOL OF ENGINEERING SCIENCES AND TECHNOLOGY</h2>
        <h3 className="text-base font-bold mb-1">ICT AND ELECTRONICS DEPARTMENT</h3>
        <h4 className="text-base font-bold underline mt-4">INDUSTRIAL ATTACHMENT LOG SHEET</h4>
      </div>

      {/* Student Information */}
      <div className="mb-6 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Name:</strong> {studentName}</p>
            <p><strong>Reg No:</strong> {regNumber}</p>
          </div>
          <div>
            <p><strong>Company:</strong> {companyName}</p>
            <p><strong>Period:</strong> {startDate} to {endDate}</p>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="border border-black">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-gray-100 border-b border-black">
          <div className="col-span-2 p-2 border-r border-black font-bold text-xs">Date</div>
          <div className="col-span-7 p-2 border-r border-black font-bold text-xs">Activities</div>
          <div className="col-span-3 p-2 font-bold text-xs">Comments</div>
        </div>
        
        {/* Table Rows */}
        {logs.map((log, index) => (
          <div key={log.id || index} className="grid grid-cols-12 border-b border-gray-300">
            <div className="col-span-2 p-2 border-r border-gray-300 text-xs">
              {log.date ? format(log.date.toDate(), 'dd/MM/yyyy') : ''}
            </div>
            <div className="col-span-7 p-2 border-r border-gray-300 text-xs">
              {log.activitiesProfessional || log.activitiesRaw || ''}
            </div>
            <div className="col-span-3 p-2 text-xs">
              {log.feedback || ''}
            </div>
          </div>
        ))}
        
        {/* Add empty rows if needed */}
        {Array.from({ length: Math.max(0, 10 - logs.length) }).map((_, index) => (
          <div key={`empty-${index}`} className="grid grid-cols-12 border-b border-gray-300 h-8">
            <div className="col-span-2 p-2 border-r border-gray-300"></div>
            <div className="col-span-7 p-2 border-r border-gray-300"></div>
            <div className="col-span-3 p-2"></div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-right text-sm">
        <p>Supervisor's Signature: ................................................</p>
        <p className="mt-4">Date: ................................................</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="outline"
          size="lg"
          className="min-w-[140px]"
        >
          <Eye className="mr-2 h-4 w-4" />
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
        
        <Button
          onClick={generatePDF}
          disabled={isGenerating}
          variant="gradient"
          size="lg"
          className="min-w-[200px]"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      </div>

      {/* Preview */}
      {showPreview && (
        <Card className="card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                PDF Preview
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(false)}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[800px] overflow-auto border rounded-lg shadow-lg bg-gray-50 p-4">
              <LogSheetContent />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden content for PDF generation */}
      {!showPreview && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <LogSheetContent />
        </div>
      )}
    </div>
  );
};

export default ModernPDFGenerator;