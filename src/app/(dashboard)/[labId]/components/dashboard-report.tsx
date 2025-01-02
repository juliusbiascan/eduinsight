import { Device, DeviceUser } from '@prisma/client';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

// Register a font for a formal look
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v10/5URNQjwBPE-oY7WSsbJDoQ.woff2' }, // Example font URL
  ],
});

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
  headerImage: {
    width: '100%',
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
    color: '#1A1617',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    color: '#555555',
    textAlign: 'center',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: '#1A1617',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    color: '#1A1617',
    fontWeight: 'bold',
  },
  table: {
    display: "flex",
    width: "auto",
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1617',
  },
  tableCell: {
    fontSize: 10,
    color: '#333333',
  },
});

interface DashboardReportProps {
  totalLogins: number;
  totalUsers: number;
  totalDevices: number;
  dateRange: DateRange;
  studentCount: number;
  teacherCount: number;
  devices: Device[];
  users: Array<{ id: string; firstName: string; lastName: string; role: string }>;
}

export const DashboardReport: React.FC<{ data: DashboardReportProps }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image src={"/pass-banner.png"} style={styles.headerImage} />
      <View style={styles.section}>
        <Text style={styles.title}>EduInsight Lab Report</Text>
        <Text style={styles.description}>This report provides an overview of the lab's activities and usage statistics.</Text>
        <Text style={styles.text}>
          Date Range: {data.dateRange.from ? format(data.dateRange.from, 'PP') : 'N/A'} - {data.dateRange.to ? format(data.dateRange.to, 'PP') : 'N/A'}
        </Text>
        <Text style={styles.text}>Total Logins: {data.totalLogins}</Text>
        <Text style={styles.text}>Total Users: {data.totalUsers}</Text>
        <Text style={styles.text}>Total Students: {data.studentCount}</Text>
        <Text style={styles.text}>Total Devices: {data.totalDevices}</Text>
       
        <Text style={styles.subtitle}>List of Devices:</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Device Name</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Status</Text>
            </View>
          </View>
          {data.devices.map(device => (
            <View style={styles.tableRow} key={device.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{device.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{device.isArchived ? 'Archived' : 'Active'}</Text>
              </View>
            </View>
          ))}
        </View>
        
        <Text style={styles.subtitle}>List of Users:</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Name</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Role</Text>
            </View>
          </View>
          {data.users.map(user => (
            <View style={styles.tableRow} key={user.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{user.firstName} {user.lastName}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{user.role}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

