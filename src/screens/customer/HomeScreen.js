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
import { favoriteAPI, serviceRequestAPI, notificationAPI } from '../../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ favorites: 0, requests: 0, unread: 0 });

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, []),
  );

  const loadStats = async () => {
    try {
      const [favRes, reqRes, notifRes] = await Promise.allSettled([
        favoriteAPI.list(),
        serviceRequestAPI.myRequests({}),
        notificationAPI.unreadCount(),
      ]);
      setStats({
        favorites:
          favRes.status === 'fulfilled'
            ? (favRes.value.data.data || favRes.value.data || []).length
            : 0,
        requests:
          reqRes.status === 'fulfilled'
            ? (reqRes.value.data.data?.data || reqRes.value.data.data || reqRes.value.data || []).length
            : 0,
        unread:
          notifRes.status === 'fulfilled'
            ? notifRes.value.data.unread_count || notifRes.value.data.data?.unread_count || 0
            : 0,
      });
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const quickActions = [
    {
      icon: '🔍',
      title: 'Search Transporters',
      subtitle: 'Find transporters near you',
      screen: 'TransporterSearch',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      icon: '⭐',
      title: 'My Favorites',
      subtitle: `${stats.favorites} saved`,
      screen: 'Favorites',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
    },
    {
      icon: '📋',
      title: 'My Requests',
      subtitle: `${stats.requests} total`,
      screen: 'MyRequests',
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
    {
      icon: '🔔',
      title: 'Notifications',
      subtitle: stats.unread > 0 ? `${stats.unread} new` : 'All read',
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
            <View>
              <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
              <Text style={styles.headerSubtitle}>What do you need today?</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => navigation.navigate('SettingsTab')}
            >
              <Text style={styles.avatarText}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}              onPress={() => navigation.navigate('TransporterSearch')}
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

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        {[
          { label: 'Favorites', value: stats.favorites, icon: '⭐', color: '#F59E0B' },
          { label: 'Requests', value: stats.requests, icon: '📋', color: '#10B981' },
          { label: 'Unread', value: stats.unread, icon: '🔔', color: '#EF4444' },
        ].map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
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

      {/* Register as Transporter CTA */}
      <View style={styles.section}>
        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient
            colors={['#2563EB', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            <View style={styles.ctaContent}>
              <Text style={styles.ctaIcon}>🚛</Text>
              <View style={styles.ctaTextContainer}>
                <Text style={styles.ctaTitle}>Are you a Transporter?</Text>
                <Text style={styles.ctaSubtitle}>
                  Register your business and start getting service requests today.
                </Text>
              </View>
            </View>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Register Now →</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  avatarBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9CA3AF',
  },
  searchBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  searchBadgeText: {
    color: COLORS.white,
    fontSize: 12,
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -14,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ctaCard: {
    borderRadius: 20,
    padding: 20,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  ctaIcon: {
    fontSize: 36,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  ctaButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default HomeScreen;
