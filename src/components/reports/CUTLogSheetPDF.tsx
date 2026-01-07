'use client';

import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Font, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Types
interface DailyLog {
  id: string;
  date: any; // Firebase Timestamp
  activitiesProfessional?: string;
  activitiesRaw?: string;
  feedback?: string;
}

// Register fonts with proper fallbacks
Font.register({
  family: 'Inter',
  fonts: [
    { 
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      fontWeight: 400 
    },
    { 
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2',
      fontWeight: 700 
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    padding: 40,
    paddingTop: 50,
    paddingBottom: 60,
    fontSize: 10,
    lineHeight: 1.4,
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: '2pt solid #000',
  },
  university: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  school: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 3,
  },
  department: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    color: '#333',
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 8,
    textDecoration: 'underline',
    letterSpacing: 0.3,
  },
  metaBlock: {
    marginBottom: 20,
    fontSize: 10,
    lineHeight: 1.6,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    fontWeight: 700,
    width: 80,
  },
  metaValue: {
    flex: 1,
  },
  table: {
    width: '100%',
    border: '1.5pt solid #000',
    borderRadius: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    color: '#ffffff',
    borderBottom: '1.5pt solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #dee2e6',
    minHeight: 30,
  },
  tableRowAlt: {
    backgroundColor: '#f8f9fa',
  },
  colDate: {
    width: '15%',
    borderRight: '0.5pt solid #dee2e6',
    padding: 8,
    justifyContent: 'center',
  },
  colActivities: {
    width: '55%',
    borderRight: '0.5pt solid #dee2e6',
    padding: 8,
  },
  colComments: {
    width: '30%',
    padding: 8,
  },
  colHeader: {
    fontWeight: 700,
    fontSize: 10,
    textAlign: 'center',
    padding: 10,
  },
  cellText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  dateText: {
    fontSize: 9,
    textAlign: 'center',
    fontWeight: 600,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1pt solid #dee2e6',
  },
  signatureBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  signatureItem: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 10,
    marginBottom: 8,
    fontWeight: 600,
  },
  signatureLine: {
    borderBottom: '1pt solid #000',
    marginBottom: 5,
    height: 20,
  },
  dateLabel: {
    fontSize: 9,
    color: '#666',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#666',
  },
  repeatingHeader: {
    position: 'absolute',
    top: 15,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#666',
    paddingBottom: 5,
    borderBottom: '0.5pt solid #dee2e6',
  },
  emptyState: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  watermark: {
    position: 'absolute',
    fontSize: 60,
    color: '#f0f0f0',
    transform: 'rotate(-45deg)',
    top: '40%',
    left: '20%',
    opacity: 0.1,
    fontWeight: 700,
  },
});

interface CUTLogSheetPDFProps {
  logs: DailyLog[];
  studentName: string;
  regNumber: string;
  companyName: string;
  startDate: string;
  endDate: string;
  onRendered?: () => void;
  mode?: 'download' | 'view';
}

const MyDocument: React.FC<Omit<CUTLogSheetPDFProps, 'onRendered' | 'mode'>> = ({
  logs,
  studentName,
  regNumber,
  companyName,
  startDate,
  endDate,
}) => {
  // Sort logs by date
  const sortedLogs = [...logs].sort((a, b) => {
    const dateA = a.date?.toDate?.() || new Date(a.date);
    const dateB = b.date?.toDate?.() || new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Repeating header on all pages */}
        <View style={styles.repeatingHeader} fixed>
          <Text>{studentName}</Text>
          <Text>{regNumber}</Text>
        </View>

        {/* Main Header - Only on first page */}
        <View style={styles.header}>
          <Text style={styles.university}>CHINHOYI UNIVERSITY OF TECHNOLOGY</Text>
          <Text style={styles.school}>SCHOOL OF ENGINEERING SCIENCES AND TECHNOLOGY</Text>
          <Text style={styles.department}>ICT & ELECTRONICS DEPARTMENT</Text>
          <Text style={styles.title}>INDUSTRIAL ATTACHMENT LOG SHEET</Text>
        </View>

        {/* Student Information Block */}
        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Name:</Text>
            <Text style={styles.metaValue}>{studentName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Reg Number:</Text>
            <Text style={styles.metaValue}>{regNumber}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Company:</Text>
            <Text style={styles.metaValue}>{companyName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Period:</Text>
            <Text style={styles.metaValue}>{startDate} to {endDate}</Text>
          </View>
        </View>

        {/* Log Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <View style={[styles.colDate, styles.colHeader]}>
              <Text>Date</Text>
            </View>
            <View style={[styles.colActivities, styles.colHeader]}>
              <Text>Daily Activities</Text>
            </View>
            <View style={[styles.colComments, styles.colHeader]}>
              <Text>Supervisor Comments</Text>
            </View>
          </View>

          {/* Table Rows */}
          {sortedLogs.length > 0 ? (
            sortedLogs.map((log, index) => {
              const logDate = log.date?.toDate ? log.date.toDate() : new Date(log.date);
              const activities = log.activitiesProfessional || log.activitiesRaw || '';
              const comments = log.feedback || '';

              return (
                <View 
                  key={log.id} 
                  style={[
                    styles.tableRow,
                    index % 2 === 1 && styles.tableRowAlt
                  ]} 
                  wrap={false}
                >
                  <View style={styles.colDate}>
                    <Text style={styles.dateText}>
                      {format(logDate, 'dd/MM/yyyy')}
                    </Text>
                  </View>
                  <View style={styles.colActivities}>
                    <Text style={styles.cellText}>{activities}</Text>
                  </View>
                  <View style={styles.colComments}>
                    <Text style={styles.cellText}>{comments}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text>No log entries recorded</Text>
            </View>
          )}
        </View>

        {/* Footer with Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureItem}>
              <Text style={styles.signatureLabel}>Student Signature:</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.dateLabel}>Date: _________________</Text>
            </View>
            <View style={styles.signatureItem}>
              <Text style={styles.signatureLabel}>Supervisor Signature:</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.dateLabel}>Date: _________________</Text>
            </View>
          </View>
        </View>

        {/* Page Numbers */}
        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
          fixed 
        />
      </Page>
    </Document>
  );
};

const CUTLogSheetPDF: React.FC<CUTLogSheetPDFProps> = ({
  logs,
  studentName,
  regNumber,
  companyName,
  startDate,
  endDate,
  onRendered,
  mode = 'download',
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (mode === 'download' && onRendered && isClient) {
      const timer = setTimeout(() => {
        onRendered();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mode, onRendered, isClient]);

  if (!isClient) {
    return <div className="p-4 text-center">Loading PDF...</div>;
  }

  const document = (
    <MyDocument
      logs={logs}
      studentName={studentName}
      regNumber={regNumber}
      companyName={companyName}
      startDate={startDate}
      endDate={endDate}
    />
  );

  if (mode === 'view') {
    return (
      <div className="w-full h-[800px] border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <PDFViewer width="100%" height="100%" showToolbar={true}>
          {document}
        </PDFViewer>
      </div>
    );
  }

  // Download mode
  const fileName = `CUT_LogSheet_${studentName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

  return (
    <PDFDownloadLink
      document={document}
      fileName={fileName}
      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
    >
      {({ loading, error }) => {
        if (error) return 'Error generating PDF';
        return loading ? 'Preparing PDF...' : 'Download Log Sheet PDF';
      }}
    </PDFDownloadLink>
  );
};

export default CUTLogSheetPDF;