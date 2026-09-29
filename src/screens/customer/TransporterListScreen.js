import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../styles/colors';
import { transporterAPI } from '../../api';
import { StatusBadge, EmptyState } from '../../components/SharedComponents';
import { getStatusInfo, getLogoUrl } from '../../utils/helpers';

// Fields the "Search by" filter can target
const SEARCH_FIELDS = [
  { key: 'all', label: 'All Fields' },
  { key: 'name', label: 'Business Name' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'city', label: 'City' },
  { key: 'type', label: 'Business Type' },
  { key: 'contact', label: 'Contact Person' },
];

const SORT_OPTIONS = [
  { key: 'AZ', label: 'Name A → Z' },
  { key: 'ZA', label: 'Name Z → A' },
  { key: 'NEW', label: 'Newest First' },
];

const TransporterListScreen = ({ route, navigation }) => {
  const { results: searchResults = [], isSearch = false } = route.params || {};
  const [allTransporters, setAllTransporters] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState('AZ');

  // "See All Transporters" navigates here WITHOUT params; a real search always
  // passes isSearch: true — even when it matched nothing (empty results must
  // show "not found", never the full transporter list).
  const isAllView = !isSearch;

  // When opened WITHOUT search results ("See All Transporters"),
  // fetch the full transporter list from the backend.
  const loadAll = useCallback(async () => {
    setLoadingAll(true);
    try {
      const response = await transporterAPI.search({ per_page: 200 });
      const responseData = response.data;
      let list = [];
      if (responseData?.data?.data) {
        list = responseData.data.data;
      } else if (Array.isArray(responseData?.data)) {
        list = responseData.data;
      } else if (Array.isArray(responseData)) {
        list = responseData;
      }
      setAllTransporters(list);
    } catch {
      // keep previous list on failure
    } finally {
      setLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    if (isAllView) loadAll();
  }, [isAllView, loadAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (isAllView) await loadAll();
    setRefreshing(false);
  };

  const baseResults = isAllView ? allTransporters : searchResults;

  // Matched FROM → TO route from the backend route_match enrichment
  const getRouteMatch = (transporter) => {
    const rm = transporter.route_match;
    if (!rm || (!rm.from && !rm.to)) return null;

    const format = (m) => {
      if (!m) return null;
      const city = m.city_name || '';
      if (m.exact) return city;
      if (m.distance_km !== null && m.distance_km !== undefined) {
        return `${city} · ${m.distance_km} km`;
      }
      return city;
    }

    const from = format(rm.from);
    const to = format(rm.to);
    if (!from && !to) return null;
    return { from, to };
  };

  const getVehicleTypeNames = (transporter) => {
    const fleet = transporter.fleet || [];
    const types = new Set();
    fleet.forEach((f) => {
      if (f.vehicle_types && Array.isArray(f.vehicle_types)) {
        f.vehicle_types.forEach((vt) => types.add(vt.name));
      }
      if (f.vehicle_type) types.add(f.vehicle_type.name);
      if (f.vehicle_type_name) types.add(f.vehicle_type_name);
    });
    return types.size > 0 ? Array.from(types).join(', ') : null;
  };

  const getFilteredAndSorted = () => {
    let filtered = [...baseResults];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches = {
        name: (t) => (t.business_name || '').toLowerCase().includes(q),
        mobile: (t) => (t.mobile || '').toLowerCase().includes(q),
        city: (t) => (t.business_city || '').toLowerCase().includes(q),
        type: (t) => (t.business_type?.name || '').toLowerCase().includes(q),
        contact: (t) => (t.contact_person_name || '').toLowerCase().includes(q),
        all: (t) =>
          (t.business_name || '').toLowerCase().includes(q) ||
          (t.contact_person_name || '').toLowerCase().includes(q) ||
          (t.mobile || '').toLowerCase().includes(q) ||
          (t.business_location_address || '').toLowerCase().includes(q) ||
          (t.business_city || '').toLowerCase().includes(q) ||
          (t.business_type?.name || '').toLowerCase().includes(q),
      };
      filtered = filtered.filter(matches[searchField] || matches.all);
    }
    filtered.sort((a, b) => {
      if (sortOrder === 'NEW') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      const nameA = (a.business_name || '').toLowerCase();
      const nameB = (b.business_name || '').toLowerCase();
      return sortOrder === 'AZ' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return filtered;
  };

  const filtered = getFilteredAndSorted();
  const activeFieldLabel =
    SEARCH_FIELDS.find((f) => f.key === searchField)?.label || 'All Fields';
  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.key === sortOrder)?.label || 'Name A → Z';

  const renderTransporter = ({ item }) => {
    const vehicleTypes = getVehicleTypeNames(item);
    const routeMatch = getRouteMatch(item);
    const logoUrl = getLogoUrl(item.logo);
    const initials = (item.business_name || 'N/A')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('TransporterProfile', { transporterId: item.id })}
        activeOpacity={0.7}
      >
        {/* Top section with logo/avatar + name */}
        <View style={styles.cardTop}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={['#2563EB', '#7C3AED']}
              style={styles.logoPlaceholder}
            >
              <Text style={styles.logoInitials}>{initials}</Text>
            </LinearGradient>
          )}
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.businessName} numberOfLines={1}>
              {item.business_name || 'N/A'}
            </Text>
            {item.business_type?.name && (
              <Text style={styles.businessType}>{item.business_type.name}</Text>
            )}
          </View>
          {item.verification_status && (
            <StatusBadge info={getStatusInfo(item.verification_status)} />
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Matched route FROM → TO */}
        {routeMatch && (
          <View style={styles.routeMatchRow}>
            <View style={styles.routeChipFrom}>
              <Text style={styles.routeChipLabel}>🟢 FROM</Text>
              <Text style={styles.routeChipValue} numberOfLines={1}>
                {routeMatch.from || '—'}
              </Text>
            </View>
            <Text style={styles.routeArrow}>→</Text>
            <View style={styles.routeChipTo}>
              <Text style={styles.routeChipLabel}>🔴 TO</Text>
              <Text style={styles.routeChipValue} numberOfLines={1}>
                {routeMatch.to || '—'}
              </Text>
            </View>
          </View>
        )}

        {/* Detail chips */}
        <View style={styles.cardDetails}>
          {vehicleTypes && (
            <View style={[styles.detailChip, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.detailChipIcon}>🚛</Text>
              <Text style={[styles.detailChipText, { color: '#1D4ED8' }]} numberOfLines={1}>
                {vehicleTypes}
              </Text>
            </View>
          )}
          {item.contact_person_name && (
            <View style={[styles.detailChip, { backgroundColor: '#F0FDF4' }]}>
              <Text style={styles.detailChipIcon}>👤</Text>
              <Text style={[styles.detailChipText, { color: '#166534' }]} numberOfLines={1}>
                {item.contact_person_name}
              </Text>
            </View>
          )}
          {item.mobile && (
            <View style={[styles.detailChip, { backgroundColor: '#FDF4FF' }]}>
              <Text style={styles.detailChipIcon}>📱</Text>
              <Text style={[styles.detailChipText, { color: '#86198F' }]}>{item.mobile}</Text>
            </View>
          )}
          {(item.business_location_address || item.business_city) && (
            <View style={[styles.detailChip, { backgroundColor: '#FFF7ED' }]}>
              <Text style={styles.detailChipIcon}>📍</Text>
              <Text style={[styles.detailChipText, { color: '#9A3412' }]} numberOfLines={1}>
                {[item.business_location_address, item.business_city]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* View Profile footer */}
        <TouchableOpacity
          style={styles.cardFooter}
          onPress={() => navigation.navigate('TransporterProfile', { transporterId: item.id })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#2563EB', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardFooterGradient}
          >
            <Text style={styles.viewProfileText}>View Full Profile</Text>
            <Text style={styles.viewProfileArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Gradient search bar */}
      <LinearGradient colors={['#2563EB', '#1E40AF']} style={styles.topBar}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search by ${activeFieldLabel.toLowerCase()}...`}
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search by + Sort dropdowns */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => {
              setShowSortDropdown(false);
              setShowFieldDropdown(!showFieldDropdown);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownBtnLabel}>Search by:</Text>
            <Text style={styles.dropdownBtnValue}>{activeFieldLabel}</Text>
            <Text style={styles.dropdownBtnArrow}>
              {showFieldDropdown ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => {
              setShowFieldDropdown(false);
              setShowSortDropdown(!showSortDropdown);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownBtnLabel}>Sort:</Text>
            <Text style={styles.dropdownBtnValue}>{activeSortLabel}</Text>
            <Text style={styles.dropdownBtnArrow}>
              {showSortDropdown ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Field dropdown panel */}
        {showFieldDropdown && (
          <View style={styles.dropdownPanel}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
              {SEARCH_FIELDS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.optionChip, searchField === f.key && styles.optionChipActive]}
                  onPress={() => {
                    setSearchField(f.key);
                    setShowFieldDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.optionText, searchField === f.key && styles.optionTextActive]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Sort dropdown panel */}
        {showSortDropdown && (
          <View style={styles.dropdownPanel}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
              {SORT_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.optionChip, sortOrder === s.key && styles.optionChipActive]}
                  onPress={() => {
                    setSortOrder(s.key);
                    setShowSortDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, sortOrder === s.key && styles.optionTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.sortRow}>
          <Text style={styles.resultCount}>
            {loadingAll && isAllView
              ? 'Loading transporters…'
              : `${filtered.length} transporter${filtered.length !== 1 ? 's' : ''} found`}
          </Text>
        </View>
      </LinearGradient>

      {loadingAll && isAllView && filtered.length === 0 ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderTransporter}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🔍"
              title="No Transporters Found"
              message={
                isAllView
                  ? 'No transporters available yet. Pull down to refresh.'
                  : 'Try adjusting your search or the Search by field'
              }
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  topBar: {
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.white, fontWeight: '500' },
  clearSearch: { fontSize: 16, color: 'rgba(255,255,255,0.7)', paddingHorizontal: 6 },
  sortRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  resultCount: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  dropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
  },
  dropdownBtnLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  dropdownBtnValue: {
    flex: 1,
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '700',
  },
  dropdownBtnArrow: { fontSize: 9, color: 'rgba(255,255,255,0.7)' },
  dropdownPanel: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: COLORS.gray50,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  optionChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optionTextActive: { color: COLORS.primaryDark },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { padding: 16, paddingBottom: 24 },

  // Matched route FROM → TO styles
  routeMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    gap: 10,
  },
  routeChipFrom: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  routeChipTo: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  routeChipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  routeChipValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  routeArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },

  // Card styles
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 14,
    backgroundColor: COLORS.gray100,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  cardHeaderInfo: { flex: 1, marginRight: 8 },
  businessName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  businessType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: 12,
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  detailChipIcon: { fontSize: 13 },
  detailChipText: { fontSize: 12, fontWeight: '600', maxWidth: 180 },
  cardFooter: {
    marginTop: 14,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardFooterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  viewProfileArrow: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
});

export default TransporterListScreen;
