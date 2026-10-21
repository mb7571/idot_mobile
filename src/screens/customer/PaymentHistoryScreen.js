import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../styles/colors';
import { subscriptionAPI } from '../../api';
import { getApiBaseUrl, getApiHost } from '../../config/api';
import { getExternalBrowserHost } from '../../config/apiHost';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Subscription payment history for the customer.
 * "Download Invoice" opens the server-rendered GST invoice in the browser,
 * where the user can print or save it as PDF.
 *
 * Note: invoice links are opened OUTSIDE the app (browser), where the
 * `adb reverse` localhost tunnel doesn't exist — so the host is swapped for
 * the last-known-good LAN IP of the dev server.
 */

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

const PaymentHistoryScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const load = async () => {
    try {
      const res = await subscriptionAPI.getPayments();
      setPayments(res.data?.data || []);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const openInvoice = async (payment) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');

      // In-app traffic can use the resolved host (even localhost via adb
      // reverse), but the browser cannot — swap it for the LAN IP.
      const appHost = getApiHost();
      const browserHost = appHost === 'localhost' ? await getExternalBrowserHost() : appHost;
      const browserBase = getApiBaseUrl().replace(`://${appHost}:`, `://${browserHost}:`);

      const url = `${browserBase}/api/subscription/payments/${payment.id}/invoice?token=${token}`;
      await Linking.openURL(url);
    } catch (e) {
      // ignore
    }
  };

  const statusColor = (s) =>
    s === 'active' ? '#10B981' : s === 'expired' ? '#94A3B8' : '#EF4444';

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View>
          <Text style={styles.planName}>{item.plan_name} Plan</Text>
          <Text style={styles.invoiceNo}>{item.invoice_no}</Text>
        </View>
        <Text style={styles.amount}>₹{Number(item.amount).toFixed(0)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          Paid on {fmtDate(item.created_at)}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: statusColor(item.status) + '18' }]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
            {item.status === 'active' ? '✓ Active' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.validityRow}>
        <Text style={styles.validityText}>
          Validity: {fmtDate(item.starts_at)} → {fmtDate(item.ends_at)}
        </Text>
      </View>

      {item.razorpay_payment_id ? (
        <Text style={styles.razorpayId}>
          Payment ID: {item.razorpay_payment_id}
        </Text>
      ) : null}

      <TouchableOpacity style={styles.invoiceBtn} activeOpacity={0.8} onPress={() => openInvoice(item)}>
        <LinearGradient
          colors={['#2563EB', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.invoiceBtnGradient}
        >
          <Text style={styles.invoiceBtnText}>🧾 Download Invoice</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        keyExtractor={(p) => String(p.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🧾</Text>
              <Text style={styles.emptyTitle}>No payments yet</Text>
              <Text style={styles.emptyText}>
                You haven't purchased a plan yet. Browse available plans to unlock transporter search.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('Subscription')}
              >
                <Text style={styles.emptyBtnText}>View Plans</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, paddingBottom: 32 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  invoiceNo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  amount: { fontSize: 18, fontWeight: '800', color: COLORS.primary },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  metaText: { fontSize: 12.5, color: COLORS.textSecondary },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11.5, fontWeight: '700' },

  validityRow: { marginTop: 6 },
  validityText: { fontSize: 12, color: COLORS.textSecondary },
  razorpayId: {
    fontSize: 11,
    color: COLORS.placeholder,
    marginTop: 4,
    fontFamily: 'monospace',
  },

  invoiceBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 14 },
  invoiceBtnGradient: { paddingVertical: 12, alignItems: 'center' },
  invoiceBtnText: { color: '#fff', fontSize: 13.5, fontWeight: '800' },

  empty: { alignItems: 'center', paddingTop: 90, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  emptyText: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  emptyBtn: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 26,
    paddingVertical: 11,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});

export default PaymentHistoryScreen;
