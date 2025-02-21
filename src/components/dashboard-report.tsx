import { Device } from '@prisma/client';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

// Register fonts for better typography
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter'
  },
  header: {
    marginBottom: 30
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
    color: '#111827'
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827'
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 16
  },
  table: {
    width: '100%'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB'
  },
  tableCell: {
    flex: 1,
    fontSize: 12
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 16
  }
});

interface DashboardReportProps {
  totalLogins: number;
  totalUsers: number;
  totalDevices: number;
  activeNow: number;
  dateRange: DateRange;
  devices: Device[];
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  }>;
}

export const DashboardReport: React.FC<{ data: DashboardReportProps }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src="/passlogo-small.png" style={styles.logo} />
        <Text style={styles.title}>EduInsight Lab Report</Text>
        <Text style={styles.subtitle}>
          {data.dateRange.from && data.dateRange.to
            ? `${format(data.dateRange.from, 'PPP')} - ${format(data.dateRange.to, 'PPP')}`
            : 'All Time Report'}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Sessions</Text>
          <Text style={styles.statValue}>{data.totalLogins}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Users</Text>
          <Text style={styles.statValue}>{data.activeNow}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Users</Text>
          <Text style={styles.statValue}>{data.totalUsers}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Devices</Text>
          <Text style={styles.statValue}>{data.totalDevices}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lab Devices</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Device Name</Text>
            <Text style={styles.tableCell}>Status</Text>
            <Text style={styles.tableCell}>Last Used</Text>
          </View>
          {data.devices.map((device) => (
            <View style={styles.tableRow} key={device.id}>
              <Text style={styles.tableCell}>{device.name}</Text>
              <Text style={styles.tableCell}>{device.isArchived ? 'Archived' : 'Active'}</Text>
              <Text style={styles.tableCell}>
                {device.updatedAt ? format(new Date(device.updatedAt), 'PP') : 'Never'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registered Users</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Name</Text>
            <Text style={styles.tableCell}>Role</Text>
          </View>
          {data.users.map((user) => (
            <View style={styles.tableRow} key={user.id}>
              <Text style={styles.tableCell}>{`${user.firstName} ${user.lastName}`}</Text>
              <Text style={styles.tableCell}>{user.role}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.footer}>
        Generated on {format(new Date(), 'PPP')} • EduInsight Lab Management System
      </Text>
    </Page>
  </Document>
);

