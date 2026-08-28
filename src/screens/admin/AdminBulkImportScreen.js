import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { adminAPI } from '../../services/api';

const AdminBulkImportScreen = ({ navigation }) => {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);

  const downloadTemplate = async () => {
    try {
      // In production, this would download the actual Excel template
      Alert.alert('Download Template', 'Template download will be available in production. The CSV template includes columns for: Registration Type, Business Name, Contact Person, Mobile, Email, Location, City, State, Pincode, Service Location, Radius, Vehicle Type.');
    } catch (error) {
      Alert.alert('Error', 'Failed to download template');
    }
  };

  const handleImport = async () => {
    // In production, this would use DocumentPicker to select a file
    Alert.alert(
      'Import Transporters',
      'Select an Excel or CSV file to import transporter data',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select File',
          onPress: async () => {
            // TODO: Implement file picker
            // For now, simulate import
            setImporting(true);
            try {
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 2000));
              setResults({
                total: 0,
                success: 0,
                failed: 0,
                duplicates: 0,
                errors: [],
              });
              Alert.alert('Info', 'File picker integration needed for production');
            } catch (error) {
              Alert.alert('Error', 'Import failed');
            } finally {
              setImporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Bulk Transporter Import</Text>
        <Text style={styles.subtitle}>Import transporters from Excel or CSV files</Text>
      </View>

      {/* Steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Import Process</Text>
        {[
          { step: 1, title: 'Download Template', desc: 'Get the Excel template with required columns' },
          { step: 2, title: 'Fill Transporter Data', desc: 'Add transporter details in the template' },
          { step: 3, title: 'Upload Excel', desc: 'Select and upload the completed file' },
          { step: 4, title: 'Validate & Import', desc: 'System validates data and imports records' },
        ].map((item) => (
          <View key={item.step} style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{item.step}</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.outlineBtn} onPress={downloadTemplate}>
          <Text style={styles.outlineBtnText}>📥 Download Template</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryBtn, importing && styles.primaryBtnDisabled]}
          onPress={handleImport}
          disabled={importing}
        >
          <Text style={styles.primaryBtnText}>
            {importing ? 'Importing...' : '📤 Upload & Import'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {results && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Summary</Text>
          <View style={styles.resultsGrid}>
            <View style={styles.resultCard}>
              <Text style={styles.resultValue}>{results.total}</Text>
              <Text style={styles.resultLabel}>Total Records</Text>
            </View>
            <View style={[styles.resultCard, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.resultValue, { color: '#065F46' }]}>{results.success}</Text>
              <Text style={styles.resultLabel}>Imported</Text>
            </View>
            <View style={[styles.resultCard, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.resultValue, { color: '#991B1B' }]}>{results.failed}</Text>
              <Text style={styles.resultLabel}>Failed</Text>
            </View>
            <View style={[styles.resultCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.resultValue, { color: '#92400E' }]}>{results.duplicates}</Text>
              <Text style={styles.resultLabel}>Duplicates</Text>
            </View>
          </View>

          {results.errors.length > 0 && (
            <View style={styles.errorSection}>
              <Text style={styles.errorTitle}>Validation Errors</Text>
              {results.errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>Row {error.row}: {error.message}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16 },
  headerSection: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },
  stepItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E40AF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepNumberText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  stepDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  outlineBtn: { borderWidth: 1, borderColor: '#1E40AF', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  outlineBtnText: { color: '#1E40AF', fontSize: 16, fontWeight: '600' },
  primaryBtn: { backgroundColor: '#1E40AF', borderRadius: 12, padding: 16, alignItems: 'center' },
  primaryBtnDisabled: { backgroundColor: '#93C5FD' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resultCard: { flex: 1, minWidth: '45%', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, alignItems: 'center' },
  resultValue: { fontSize: 24, fontWeight: '700', color: '#111827' },
  resultLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  errorSection: { marginTop: 16, padding: 12, backgroundColor: '#FEF2F2', borderRadius: 8 },
  errorTitle: { fontSize: 14, fontWeight: '600', color: '#991B1B', marginBottom: 8 },
  errorText: { fontSize: 13, color: '#991B1B', marginBottom: 4 },
});

export default AdminBulkImportScreen;
