import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { adminAPI } from '../../services/api';

const AdminSettingsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'settings') {
        const response = await adminAPI.getSettings();
        setSettings(response.data.data);
      } else {
        const response = await adminAPI.getAllContent();
        setContent(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      await adminAPI.updateSetting({ key, value });
      setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const renderSettings = () => (
    <View>
      {settings.map((setting) => (
        <View key={setting.key} style={styles.settingItem}>
          <Text style={styles.settingLabel}>{setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</Text>
          <TextInput
            style={styles.settingInput}
            value={setting.value || ''}
            onChangeText={(value) => updateSetting(setting.key, value)}
            placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      ))}
    </View>
  );

  const renderContent = () => (
    <View>
      {content.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.contentCard}
          onPress={() => {
            // Navigate to content editor
            Alert.alert('Content Editor', `Edit "${item.title}"\n\nType: ${item.type}\nStatus: ${item.is_active ? 'Active' : 'Inactive'}`);
          }}
        >
          <View style={styles.contentInfo}>
            <Text style={styles.contentTitle}>{item.title}</Text>
            <Text style={styles.contentType}>{item.type.replace(/_/g, ' ').toUpperCase()}</Text>
          </View>
          <View style={[styles.contentStatus, item.is_active ? styles.statusActive : styles.statusInactive]}>
            <Text style={[styles.statusText, item.is_active ? styles.textActive : styles.textInactive]}>
              {item.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'content' && styles.tabActive]}
          onPress={() => setActiveTab('content')}
        >
          <Text style={[styles.tabText, activeTab === 'content' && styles.tabTextActive]}>Content</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#1E40AF" style={{ marginTop: 40 }} />
        ) : activeTab === 'settings' ? (
          renderSettings()
        ) : (
          renderContent()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1E40AF' },
  tabText: { fontSize: 15, color: '#6B7280' },
  tabTextActive: { color: '#1E40AF', fontWeight: '600' },
  content: { padding: 16 },
  settingItem: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 8 },
  settingLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  settingInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F9FAFB' },
  contentCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  contentInfo: { flex: 1 },
  contentTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  contentType: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  contentStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusInactive: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 12, fontWeight: '500' },
  textActive: { color: '#065F46' },
  textInactive: { color: '#6B7280' },
});

export default AdminSettingsScreen;
