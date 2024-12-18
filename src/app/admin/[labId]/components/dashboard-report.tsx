import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#EAEAEB',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#1A1617',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: '#1A1617',
  },
});

interface DashboardReportProps {
  totalLogins: number;
  totalUsers: number;
  totalDevices: number;
  activeNow: number;
  dateRange: DateRange;
}

export const DashboardReport: React.FC<{ data: DashboardReportProps }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Dashboard Report</Text>
        <Text style={styles.text}>Date Range: {format(data.dateRange.from!, 'PP')} - {format(data.dateRange.to!, 'PP')}</Text>
        <Text style={styles.text}>Total Logins: {data.totalLogins}</Text>
        <Text style={styles.text}>Total Users: {data.totalUsers}</Text>
        <Text style={styles.text}>Total Devices: {data.totalDevices}</Text>
        <Text style={styles.text}>Active Now: {data.activeNow}</Text>
      </View>
    </Page>
  </Document>
);
