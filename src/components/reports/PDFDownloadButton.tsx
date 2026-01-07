'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface PDFDownloadButtonProps {
  document: React.ReactElement;
  fileName: string;
  disabled?: boolean;
  onDownload?: () => void;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  document,
  fileName,
  disabled = false,
  onDownload,
}) => {
  return (
    <PDFDownloadLink
      document={document}
      fileName={fileName}
      onClick={onDownload}
    >
      {({ loading }) => (
        <Button 
          disabled={disabled || loading}
          variant="gradient"
          size="lg"
          className="min-w-[200px]"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Preparing PDF...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default PDFDownloadButton;