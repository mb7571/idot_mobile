import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../styles/colors';
import { useAuth } from '../../context/AuthContext';
import { transporterAPI, serviceRequestAPI, notificationAPI, favoriteAPI } from '../../api';
import { StatusBadge, Card } from '../../components/SharedComponents';
import { getStatusInfo } from '../../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TransporterDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ incoming: 0, unread: 0, favorites: 0 });

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, []),
  );

  const loadDashboard = async () => {
    try {
      const [profileRes, reqRes, notifRes, favRes] = await Promise.allSettled([
        transporterAPI.getMyProfile(),
        serviceRequestAPI.incomingRequests({}),
        notificationAPI.unreadCount(),
        favoriteAPI.list(),
      ]);
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data.data || profileRes.value.data);
      }
      setStats({
        incoming:
          reqRes.status === 'fulfilled'
            ? (reqRes.value.data.data?.data || reqRes.value.data.data || reqRes.value.data || [])
                .length
            : 0,
        unread:
          notifRes.status === 'fulfilled'
            ? notifRes.value.data.unread_count || notifRes.value.data.data?.unread_count || 0
            : 0,
        favorites:
          favRes.status === 'fulfilled'
            ? (favRes.value.data.data || favRes.value.data || []).length
            : 0,
      });
    } catch {
      // ignore
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const verificationStatus = profile?.verification_status || 'pending';
  const isVerified = verificationStatus === 'verified' || verificationStatus === 'approved';

  const quickActions = [
    {
      icon: '📥',
      title: 'Incoming',
      subtitle: `${stats.incoming} pending`,
      screen: 'IncomingRequests',
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
    {
      icon: '🚛',
      title: 'My Fleet Services',
      subtitle: 'Your vehicles',
      screen: 'MyFleet',
      color: '#2563EB',
      bgColor: '#EFF6FF',
    },
    {
      icon: '🔍',
      title: 'Search',
      subtitle: 'Find transporters',
      screen: 'TransporterSearch',
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
    },
    {
      icon: '⭐',
      title: 'Favorites',
      subtitle: `${stats.favorites} saved`,
      screen: 'Favorites',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
    },
    {
      icon: '📋',
      title: 'My Requests',
      subtitle: 'You submitted',
      screen: 'MyRequests',
      color: '#0EA5E9',
      bgColor: '#F0F9FF',
    },
    {
      icon: '🔔',
      title: 'Notifications',
      subtitle: `${stats.unread} unread`,
      screen: 'Notifications',
      color: '#EF4444',
      bgColor: '#FEF2F2',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Gradient Header */}
      <LinearGradient colors={['#2563EB', '#1E40AF', '#1E3A8A']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>
                Hello, {user?.name?.split(' ')[0] || 'Transporter'} 👋
              </Text>
              {profile?.business_name && (
                <Text style={styles.businessName} numberOfLines={1}>
                  🏢 {profile.business_name}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => navigation.navigate('TransporterMyProfile')}
              activeOpacity={0.7}
            >
              <Text style={styles.avatarText}>
                {(user?.name || 'T').charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('TransporterSearch')}
            activeOpacity={0.7}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search transporters...</Text>
            <View style={styles.searchBadge}>
              <Text style={styles.searchBadgeText}>GO</Text>
            </View>
          </TouchableOpacity>

          {/* See All Transporters */}
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate('TransporterList')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllIcon}>👥</Text>
            <Text style={styles.viewAllText}>See All Transporters</Text>
            <Text style={styles.viewAllArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats row overlapping header */}
      <View style={styles.statsRow}>
        {[
          { label: 'Requests', value: stats.incoming, icon: '📥', color: '#10B981' },
          { label: 'Favorites', value: stats.favorites, icon: '⭐', color: '#F59E0B' },
          { label: 'Unread', value: stats.unread, icon: '🔔', color: '#EF4444' },
        ].map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Verification card */}
      <View style={styles.section}>
        <Card>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Text style={styles.statusTitle}>Verification Status</Text>
              {!isVerified && (
                <Text style={styles.statusNote}>
                  {verificationStatus === 'rejected'
                    ? 'Registration rejected — please contact support.'
                    : 'Under review. You will be notified once verified.'}
                </Text>
              )}
            </View>
            <StatusBadge info={getStatusInfo(verificationStatus)} />
          </View>
        </Card>
      </View>

      {/* Quick Actions — 2 column grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: action.bgColor }]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: action.color + '20' }]}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <Text style={[styles.actionTitle, { color: action.color }]}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },

  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 34,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: { paddingHorizontal: 20 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  businessName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 3,
  },
  avatarBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
  },
  searchIcon: { fontSize: 17 },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9CA3AF',
  },
  searchBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  searchBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 10,
    gap: 8,
  },
  viewAllIcon: { fontSize: 15 },
  viewAllText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  viewAllArrow: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -18,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 13,
    alignItems: 'center',
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: { fontSize: 18, marginBottom: 3 },
  statValue: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },

  // Verification card
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  statusLeft: { flex: 1 },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },

  // Action grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: { fontSize: 20 },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
});

export default TransporterDashboardScreen;
