'use client';

import React, { useEffect } from 'react';
import { Page, Text, View, Document, StyleSheet, Font, PDFDownloadLink } from '@react-pdf/renderer';
import type { DailyLog } from '@/types';
import { format } from 'date-fns';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    padding: '1cm',
    fontSize: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  university: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  school: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  department: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginTop: 10,
  },
  metaBlock: {
    marginBottom: 20,
    fontSize: 10,
  },
  table: {
    width: '100%',
    border: '1px solid #000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #eee',
  },
  colDate: {
    width: '15%',
    borderRight: '1px solid #ccc',
    padding: 5,
  },
  colActivities: {
    width: '60%',
    borderRight: '1px solid #ccc',
    padding: 5,
  },
  colComments: {
    width: '25%',
    padding: 5,
  },
  colHeader: {
      fontWeight: 'bold'
  },
  footer: {
    marginTop: 40,
    textAlign: 'right',
  },
  signature: {
      marginTop: 20,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
  repeatingHeader: {
    position: 'absolute',
    top: 10,
    left: 40,
    right: 40,
    textAlign: 'right',
    fontSize: 8,
    color: 'grey',
  }
});

interface CUTLogSheetPDFProps {
  logs: DailyLog[];
  studentName: string;
  regNumber: string;
  companyName: string;
  startDate: string;
  endDate: string;
}

const CUTLogSheetPDF: React.FC<CUTLogSheetPDFProps> = ({
  logs,
  studentName,
  regNumber,
  companyName,
  startDate,
  endDate,
}) => {
  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.repeatingHeader} fixed>
            <Text>{`Name: ${studentName} | Reg No: ${regNumber}`}</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.university}>CHINHOYI UNIVERSITY OF TECHNOLOGY (CUT)</Text>
          <Text style={styles.school}>SCHOOL OF ENGINEERING SCIENCES AND TECHNOLOGY</Text>
          <Text style={styles.department}>ICT AND ELECTRONICS DEPARTMENT</Text>
          <Text style={styles.title}>INDUSTRIAL ATTACHMENT LOG SHEET</Text>
        </View>

        <View style={styles.metaBlock}>
          <Text>Name: {studentName}</Text>
          <Text>Reg No: {regNumber}</Text>
          <Text>Company: {companyName}</Text>
          <Text>Period: {startDate} to {endDate}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <View style={[styles.colDate, styles.colHeader]}><Text>Date</Text></View>
            <View style={[styles.colActivities, styles.colHeader]}><Text>Activities</Text></View>
            <View style={[styles.colComments, styles.colHeader]}><Text>Comments</Text></View>
          </View>
          {logs.map((log) => (
            <View key={log.id} style={styles.tableRow} wrap={false}>
              <View style={styles.colDate}><Text>{log.date ? format(log.date.toDate(), 'dd/MM/yyyy') : ''}</Text></View>
              <View style={styles.colActivities}><Text>{log.activitiesProfessional || log.activitiesRaw}</Text></View>
              <View style={styles.colComments}><Text>{log.feedback || ''}</Text></View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
            <Text>Supervisor's Signature................................................</Text>
            <Text style={styles.signature}>Date: ................................................</Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );

  return (
    <div style={{ display: 'none' }}>
        <PDFDownloadLink document={MyDocument} fileName={`CUT_Log_Sheet_${studentName}.pdf`}>
            {({ blob, url, loading, error }) => {
                useEffect(() => {
                    if (url && !loading && !error) {
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `CUT_Log_Sheet_${studentName}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                }, [url, loading, error]);
                return null;
            }}
        </PDFDownloadLink>
    </div>
  );
};

export default CUTLogSheetPDF;
