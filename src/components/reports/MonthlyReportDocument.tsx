import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { DailyLog } from '@/types';
import { format } from 'date-fns';

// Register fonts
// Note: In a real app, you would host these font files with your project.
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    backgroundColor: '#F0F2F5',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableColHeaderContent: {
    width: '80%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableColContent: {
    width: '80%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333'
  },
  tableCell: {
    fontSize: 10,
  },
  summary: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3F51B5',
  },
  summaryText: {
    fontSize: 12,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});

interface MonthlyReportProps {
  logs: DailyLog[];
  studentName: string;
  month: string;
}

const MonthlyReportDocument: React.FC<MonthlyReportProps> = ({ logs, studentName, month }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Attachment Report</Text>
        <Text style={styles.subtitle}>{studentName} - {month}</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Date</Text>
          </View>
          <View style={styles.tableColHeaderContent}>
            <Text style={styles.tableCellHeader}>Log Entry</Text>
          </View>
        </View>
        {logs.sort((a, b) => a.date.seconds - b.date.seconds).map(log => (
          <View style={styles.tableRow} key={log.id}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{format(log.date.toDate(), 'yyyy-MM-dd')}</Text>
            </View>
            <View style={styles.tableColContent}>
              <Text style={styles.tableCell}>{log.content}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        <Text style={styles.summaryText}>Total logs submitted: {logs.length}</Text>
      </View>

      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

export default MonthlyReportDocument;
