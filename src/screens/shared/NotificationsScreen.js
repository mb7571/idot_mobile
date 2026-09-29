import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../styles/colors';
import { notificationAPI } from '../../api';
import { EmptyState, LoadingSpinner } from '../../components/SharedComponents';
import { formatDateTime } from '../../utils/helpers';

// Visual treatment per notification type (mirrors backend admin panel):
// success | warning | alert | status_update | info (default)
const TYPE_STYLES = {
  success: { icon: '✅', color: COLORS.success, bg: '#D1FAE5' },
  warning: { icon: '⚠️', color: COLORS.warning, bg: '#FEF3C7' },
  alert: { icon: '🚨', color: COLORS.danger, bg: '#FEE2E2' },
  status_update: { icon: '🔄', color: COLORS.primary, bg: COLORS.primaryLight },
  info: { icon: 'ℹ️', color: COLORS.primary, bg: COLORS.primaryLight },
};

const getTypeStyle = (type) => TYPE_STYLES[type] || TYPE_STYLES.info;

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, []),
  );

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.list({});
      const data = response.data.data;
      setNotifications(data?.data || data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const renderNotification = ({ item }) => {
    const typeStyle = getTypeStyle(item.type);
    return (
      <TouchableOpacity
        style={[styles.card, !item.is_read && styles.cardUnread]}
        onPress={() => handleMarkAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <View style={[styles.iconBadge, { backgroundColor: typeStyle.bg }]}>
            <Text style={styles.iconText}>{typeStyle.icon}</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text
                style={[styles.cardTitle, { color: typeStyle.color }]}
                numberOfLines={1}
              >
                {item.title || 'Notification'}
              </Text>
              {!item.is_read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.cardMessage} numberOfLines={3}>
              {item.message || item.body || ''}
            </Text>
            <Text style={styles.cardTime}>{formatDateTime(item.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.topBar}>
          <Text style={styles.unreadText}>{unreadCount} unread notification(s)</Text>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="No Notifications"
            message="You don't have any notifications yet."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  unreadText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '500',
  },
  markAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  cardUnread: {
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  cardMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});

export default NotificationsScreen;
