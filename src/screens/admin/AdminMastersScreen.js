import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { mastersAPI, adminAPI } from '../../services/api';

const AdminMastersScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('business-types');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', value: '', label: '' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      let response;
      switch (activeTab) {
        case 'business-types':
          response = await mastersAPI.getBusinessTypes();
          break;
        case 'vehicle-types':
          response = await mastersAPI.getVehicleTypes();
          break;
        case 'states':
          response = await mastersAPI.getStates();
          break;
        case 'radius':
          response = await mastersAPI.getRadiusOptions();
          break;
        default:
          return;
      }
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const api = adminAPI;
      const id = editingItem?.id;

      switch (activeTab) {
        case 'business-types':
          if (id) await api.updateBusinessType(id, formData);
          else await api.createBusinessType(formData);
          break;
        case 'vehicle-types':
          if (id) await api.updateVehicleType(id, formData);
          else await api.createVehicleType(formData);
          break;
        case 'states':
          if (id) await api.updateState(id, formData);
          else await api.createState(formData);
          break;
        case 'radius':
          if (id) await api.updateRadiusOption(id, formData);
          else await api.createRadiusOption(formData);
          break;
      }
      setModalVisible(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', value: '', label: '' });
      loadData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete', `Are you sure you want to delete "${item.name || item.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            switch (activeTab) {
              case 'business-types': await adminAPI.deleteBusinessType(item.id); break;
              case 'vehicle-types': await adminAPI.deleteVehicleType(item.id); break;
              case 'states': await adminAPI.deleteState(item.id); break;
              case 'radius': await adminAPI.deleteRadiusOption(item.id); break;
            }
            loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', value: '', label: '' });
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name || '', description: item.description || '', value: String(item.value || ''), label: item.label || '' });
    setModalVisible(true);
  };

  const tabs = [
    { key: 'business-types', label: 'Business Types' },
    { key: 'vehicle-types', label: 'Vehicle Types' },
    { key: 'states', label: 'States' },
    { key: 'radius', label: 'Radius' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.itemName}>{item.name || item.label || `${item.value} KM`}</Text>
              {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No items found</Text> : null}
      />

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>+ Add</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingItem ? 'Edit' : 'Add'} {tabs.find((t) => t.key === activeTab)?.label}</Text>

            {(activeTab === 'business-types' || activeTab === 'vehicle-types' || activeTab === 'states') && (
              <>
                <Text style={styles.label}>Name *</Text>
                <TextInput style={styles.input} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="Enter name" placeholderTextColor="#9CA3AF" />
              </>
            )}

            {activeTab === 'radius' && (
              <>
                <Text style={styles.label}>Value (KM) *</Text>
                <TextInput style={styles.input} value={formData.value} onChangeText={(v) => setFormData({ ...formData, value: v })} keyboardType="numeric" placeholder="e.g. 50" placeholderTextColor="#9CA3AF" />
                <Text style={styles.label}>Label *</Text>
                <TextInput style={styles.input} value={formData.label} onChangeText={(v) => setFormData({ ...formData, label: v })} placeholder="e.g. 50 KM" placeholderTextColor="#9CA3AF" />
              </>
            )}

            {activeTab === 'states' && (
              <>
                <Text style={styles.label}>Code *</Text>
                <TextInput style={styles.input} value={formData.code || ''} onChangeText={(v) => setFormData({ ...formData, code: v })} placeholder="e.g. MH" placeholderTextColor="#9CA3AF" maxLength={10} />
              </>
            )}

            {(activeTab === 'business-types' || activeTab === 'vehicle-types') && (
              <>
                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.input, { height: 80 }]} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} multiline placeholder="Optional description" placeholderTextColor="#9CA3AF" />
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>{editingItem ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1E40AF' },
  tabText: { fontSize: 13, color: '#6B7280' },
  tabTextActive: { color: '#1E40AF', fontWeight: '600' },
  list: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '500', color: '#111827' },
  itemDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EFF6FF', borderRadius: 6 },
  editText: { color: '#2563EB', fontSize: 13 },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FEE2E2', borderRadius: 6 },
  deleteText: { color: '#DC2626', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 40, fontSize: 16 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1E40AF', borderRadius: 28, paddingHorizontal: 24, paddingVertical: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  fabText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 14, fontSize: 16, backgroundColor: '#F9FAFB', marginBottom: 8 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelText: { color: '#6B7280', fontSize: 16, fontWeight: '500' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#1E40AF', alignItems: 'center' },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default AdminMastersScreen;
