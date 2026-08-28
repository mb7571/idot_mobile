import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { adminAPI } from '../../services/api';

const AdminReportsScreen = ({ navigation }) => {
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reports = [
    { key: 'customers', title: 'Customer Reports', icon: '👥', description: 'Customer statistics and registration data' },
    { key: 'transporters', title: 'Transporter Reports', icon: '🚛', description: 'Transporter verification and business data' },
    { key: 'fleet', title: 'Fleet Reports', icon: '📦', description: 'Vehicle type and fleet distribution' },
    { key: 'service-locations', title: 'Service Location Reports', icon: '📍', description: 'Service area and radius coverage' },
    { key: 'service-requests', title: 'Service Request Reports', icon: '📋', description: 'Request statistics and trends' },
    { key: 'favorites', title: 'Favorites & Usage', icon: '❤️', description: 'Most favorited and searched transporters' },
  ];

  const loadReport = async (key) => {
    setActiveReport(key);
    setLoading(true);
    try {
      let response;
      switch (key) {
        case 'customers': response = await adminAPI.getCustomerReport(); break;
        case 'transporters': response = await adminAPI.getTransporterReport(); break;
        case 'fleet': response = await adminAPI.getFleetReport(); break;
        case 'service-locations': response = await adminAPI.getServiceLocationReport(); break;
        case 'service-requests': response = await adminAPI.getServiceRequestReport(); break;
        case 'favorites': response = await adminAPI.getFavoritesReport(); break;
      }
      setReportData(response.data.data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (activeReport) {
      case 'customers':
        return (
          <View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}><Text style={styles.statValue}>{reportData.total}</Text><Text style={styles.statLabel}>Total</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}><Text style={[styles.statValue, { color: '#065F46' }]}>{reportData.active}</Text><Text style={styles.statLabel}>Active</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#F3F4F6' }]}><Text style={[styles.statValue, { color: '#6B7280' }]}>{reportData.inactive}</Text><Text style={styles.statLabel}>Inactive</Text></View>
            </View>
          </View>
        );
      case 'transporters':
        return (
          <View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}><Text style={styles.statValue}>{reportData.total}</Text><Text style={styles.statLabel}>Total</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}><Text style={[styles.statValue, { color: '#92400E' }]}>{reportData.pending}</Text><Text style={styles.statLabel}>Pending</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}><Text style={[styles.statValue, { color: '#065F46' }]}>{reportData.verified}</Text><Text style={styles.statLabel}>Verified</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}><Text style={[styles.statValue, { color: '#991B1B' }]}>{reportData.rejected}</Text><Text style={styles.statLabel}>Rejected</Text></View>
            </View>
          </View>
        );
      case 'service-requests':
        return (
          <View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}><Text style={styles.statValue}>{reportData.total}</Text><Text style={styles.statLabel}>Total</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}><Text style={[styles.statValue, { color: '#92400E' }]}>{reportData.pending}</Text><Text style={styles.statLabel}>Pending</Text></View>
              <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}><Text style={[styles.statValue, { color: '#065F46' }]}>{reportData.completed}</Text><Text style={styles.statLabel}>Completed</Text></View>
            </View>
          </View>
        );
      case 'favorites':
        return (
          <View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}><Text style={styles.statValue}>{reportData.total_favorites}</Text><Text style={styles.statLabel}>Total Favorites</Text></View>
              <View style={styles.statCard}><Text style={styles.statValue}>{reportData.search_statistics?.total_searches || 0}</Text><Text style={styles.statLabel}>Total Searches</Text></View>
            </View>
            {reportData.most_favorited?.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>Most Favorited Transporters</Text>
                {reportData.most_favorited.map((t, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.listItemText}>{t.business_name}</Text>
                    <Text style={styles.listItemValue}>{t.favorites_count} ❤️</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      default:
        return <Text style={styles.placeholderText}>Report data loaded. Select a specific metric to view details.</Text>;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.reportsList}>
        {reports.map((report) => (
          <TouchableOpacity
            key={report.key}
            style={[styles.reportCard, activeReport === report.key && styles.reportCardActive]}
            onPress={() => loadReport(report.key)}
          >
            <Text style={styles.reportIcon}>{report.icon}</Text>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDesc}>{report.description}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeReport && (
        <View style={styles.reportContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#1E40AF" style={{ marginVertical: 20 }} />
          ) : (
            renderReportContent()
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  reportsList: { padding: 16 },
  reportCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  reportCardActive: { borderWidth: 2, borderColor: '#1E40AF' },
  reportIcon: { fontSize: 28, marginRight: 12 },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  reportDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  arrow: { fontSize: 24, color: '#9CA3AF' },
  reportContent: { margin: 16, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  listSection: { marginTop: 16 },
  listTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  listItemText: { fontSize: 14, color: '#374151' },
  listItemValue: { fontSize: 14, color: '#6B7280' },
  placeholderText: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingVertical: 20 },
});

export default AdminReportsScreen;
