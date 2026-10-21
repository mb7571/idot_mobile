import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../styles/colors';
import { subscriptionAPI } from '../../api';
import { LoadingSpinner } from '../../components/SharedComponents';

/**
 * Customer subscription screen.
 *
 * - Shows current plan status (searches left, expiry, amount paid)
 * - Lists available plans (Free / Monthly / Quarterly / Yearly) — shown even
 *   when subscriptions are disabled (read-only) so Free plan is discoverable
 * - Free plan: one-tap activation
 * - Paid plans: Razorpay checkout via react-native-razorpay
 * - Inline payments & invoices section (paid subscriptions with amounts)
 */

const PLAN_ICONS = { free: '🎁', monthly: '⭐', quarterly: '🚀', yearly: '👑' };

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

const SubscriptionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [plansEnabled, setPlansEnabled] = useState(true);
  const [freeAvailable, setFreeAvailable] = useState(false);
  const [payments, setPayments] = useState([]);
  const [busyPlanId, setBusyPlanId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [statusRes, plansRes, paymentsRes] = await Promise.all([
        subscriptionAPI.getStatus(),
        subscriptionAPI.getPlans(),
        subscriptionAPI.getPayments(),
      ]);
      const statusData = statusRes.data?.data || null;
      const plansData = plansRes.data?.data || {};
      setStatus(statusData);
      setPlans(plansData.plans || []);
      setPlansEnabled(plansData.enabled !== false);
      // Free trial = one-time registration offer. Server already hides the
      // Free plan from the list when ineligible; this flag drives the copy.
      setFreeAvailable(plansData.free_plan_available ?? statusData?.free_plan_available ?? false);
      setPayments(paymentsRes.data?.data || []);
    } catch (e) {
      // keep prior state on refresh errors
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleFreeActivate = async (plan) => {
    setBusyPlanId(plan.id);
    try {
      const res = await subscriptionAPI.activateFree();
      Alert.alert('🎉 Free Plan Activated', res.data?.message || 'You are ready to search!');
      await load();
    } catch (e) {
      Alert.alert('Not Available', e.response?.data?.message || 'Could not activate the free plan.');
    } finally {
      setBusyPlanId(null);
    }
  };

  const handlePaidPurchase = async (plan) => {
    setBusyPlanId(plan.id);
    try {
      // 1) Create Razorpay order on our server
      const orderRes = await subscriptionAPI.createOrder(plan.id);
      const order = orderRes.data?.data;
      if (!order?.order_id) {
        throw new Error(order?.message || 'Order failed');
      }

      // 2) Open Razorpay checkout via the native SDK when available
      let RazorpayCheckout;
      try {
        RazorpayCheckout = require('react-native-razorpay').default;
      } catch (e) {
        RazorpayCheckout = null;
      }

      if (!RazorpayCheckout) {
        Alert.alert(
          'Payment Unavailable',
          `The payment module is not installed in this build.\n\nPlan: ${plan.name} — ${plan.price_display}\nOrder ID: ${order.order_id}\n\nPlease update the app or contact support.`,
        );
        return;
      }

      const options = {
        key: order.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'iDOT Transport',
        description: `${plan.name} subscription`,
        order_id: order.order_id,
        prefill: { contact: global.userPhone || '', name: global.userName || '' },
        theme: { color: '#2563EB' },
      };

      RazorpayCheckout.open(options)
        .then(async (payment) => {
          // 3) Verify on server → activates the plan
          try {
            const verifyRes = await subscriptionAPI.verifyPayment({
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
              plan_id: plan.id,
            });
            Alert.alert('✅ Subscription Active', verifyRes.data?.message || `${plan.name} plan activated!`);
            await load();
          } catch (e) {
            Alert.alert(
              'Payment Received',
              'We received your payment but activation needs a moment. Please restart the app — your plan will apply automatically.',
            );
          }
        })
        .catch((err) => {
          // user cancelled or payment failed
          if (err?.code !== 'PAYMENT_CANCELLED') {
            Alert.alert('Payment Failed', err?.description || 'Something went wrong. Please try again.');
          }
        });
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message || 'Could not start payment.');
    } finally {
      setBusyPlanId(null);
    }
  };

  const handleSelectPlan = (plan) => {
    if (plan.is_free) {
      handleFreeActivate(plan);
    } else {
      handlePaidPurchase(plan);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const sub = status?.subscription;
  const searchesLeft =
    sub && !sub.is_unlimited ? Math.max(0, sub.searches_limit - sub.searches_used) : null;
  const usagePct = sub && !sub.is_unlimited && sub.searches_limit > 0
    ? Math.min(100, Math.round((sub.searches_used / sub.searches_limit) * 100))
    : 0;

  // Paid payment rows only (invoices apply to paid subscriptions)
  const paidPayments = payments.filter((p) => Number(p.amount) > 0);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Current plan card */}
        {sub ? (
          <LinearGradient
            colors={['#2563EB', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.currentCard}
          >
            <View style={styles.currentRow}>
              <Text style={styles.currentLabel}>CURRENT PLAN</Text>
              <Text style={styles.currentPlan}>{sub.plan_name}</Text>
            </View>
            {sub.is_unlimited ? (
              <Text style={styles.unlimitedText}>♾️ Unlimited searches</Text>
            ) : (
              <View style={{ marginTop: 12 }}>
                <View style={styles.usageRow}>
                  <Text style={styles.usageText}>
                    {searchesLeft} searches left
                  </Text>
                  <Text style={styles.usageTextDim}>
                    {sub.searches_used}/{sub.searches_limit} used
                  </Text>
                </View>
                <View style={styles.usageBar}>
                  <View style={[styles.usageFill, { width: `${usagePct}%` }]} />
                </View>
              </View>
            )}
            <Text style={styles.expiryText}>
              {sub.days_remaining > 0
                ? `Valid for ${sub.days_remaining} more day${sub.days_remaining === 1 ? '' : 's'}`
                : 'Expires today'}
              {' · '}
              {fmtDate(sub.ends_at)}
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.noPlanCard}>
            <Text style={styles.noPlanEmoji}>🔒</Text>
            <Text style={styles.noPlanTitle}>No active subscription</Text>
            <Text style={styles.noPlanText}>
              {freeAvailable
                ? 'Start with the Free plan below — it gives you 30 searches for 15 days.'
                : 'Choose a paid plan below to unlock transporter search. (The free trial is a one-time offer at registration.)'}
            </Text>
          </View>
        )}

        {/* Plans — always listed; read-only when subscriptions are disabled */}
        <Text style={styles.sectionTitle}>
          {sub ? 'Upgrade / Renew' : 'Choose a Plan'}
        </Text>

        {!plansEnabled && (
          <View style={styles.disabledBanner}>
            <Text style={styles.disabledBannerText}>
              ℹ️ Paid subscriptions are temporarily paused. Search is currently free for everyone.
            </Text>
          </View>
        )}

        {!freeAvailable && (
          <View style={styles.disabledBanner}>
            <Text style={styles.disabledBannerText}>
              🎁 The free trial is a one-time offer, available only when you register.
            </Text>
          </View>
        )}

        {plans.length === 0 ? (
          <View style={styles.disabledCard}>
            <Text style={styles.disabledText}>
              Plans are being set up. Please check back soon.
            </Text>
          </View>
        ) : (
          plans.map((plan) => {
            const isCurrent = sub && sub.plan_slug === plan.slug;
            const buyDisabled = !plansEnabled || busyPlanId === plan.id;
            return (
              <View key={plan.id} style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
                <View style={styles.planHead}>
                  <View style={styles.planNameRow}>
                    <Text style={styles.planEmoji}>{PLAN_ICONS[plan.slug] || '📄'}</Text>
                    <View>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planValidity}>
                        {plan.validity_days >= 365
                          ? '12 months'
                          : plan.validity_days >= 90
                          ? '3 months'
                          : plan.validity_days >= 30
                          ? '1 month'
                          : `${plan.validity_days} days`}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.planPrice}>{plan.price_display}</Text>
                </View>

                <Text style={styles.planDesc}>
                  {plan.is_unlimited
                    ? '♾️ Unlimited transporter searches'
                    : `🔍 ${plan.search_limit} transporter searches`}
                </Text>

                {isCurrent ? (
                  <View style={[styles.planBtn, styles.planBtnCurrent]}>
                    <Text style={[styles.planBtnText, { color: COLORS.success }]}>
                      ✓ Current Plan
                    </Text>
                  </View>
                ) : buyDisabled ? (
                  <View style={[styles.planBtn, styles.planBtnDisabled]}>
                    <Text style={[styles.planBtnText, { color: COLORS.textSecondary }]}>
                      {busyPlanId === plan.id ? 'Please wait…' : 'Currently Unavailable'}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleSelectPlan(plan)}
                  >
                    <LinearGradient
                      colors={plan.is_free ? ['#10B981', '#059669'] : ['#2563EB', '#7C3AED']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.planBtn}
                    >
                      <Text style={styles.planBtnText}>
                        {plan.is_free ? 'Activate Free Trial' : `Pay ${plan.price_display} Securely`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

        {/* Payments & Invoices (paid) */}
        {paidPayments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Payments & Invoices</Text>
            {paidPayments.map((p) => (
              <View key={p.id} style={styles.payCard}>
                <View style={styles.payHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payPlan}>{p.plan_name} Plan</Text>
                    <Text style={styles.payInvoiceNo}>{p.invoice_no}</Text>
                  </View>
                  <Text style={styles.payAmount}>₹{Number(p.amount).toFixed(0)}</Text>
                </View>
                <View style={styles.payMetaRow}>
                  <Text style={styles.payMetaText}>{fmtDate(p.created_at)}</Text>
                  <TouchableOpacity
                    style={styles.payInvoiceBtn}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('PaymentHistory')}
                  >
                    <Text style={styles.payInvoiceBtnText}>🧾 Invoice</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Full history */}
        <TouchableOpacity
          style={styles.historyBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PaymentHistory')}
        >
          <Text style={styles.historyBtnIcon}>🧾</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.historyBtnTitle}>Payments & Invoices</Text>
            <Text style={styles.historyBtnSub}>View past payments and download invoices</Text>
          </View>
          <Text style={styles.historyBtnArrow}>→</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          🔐 Payments secured by Razorpay · UPI, Cards, NetBanking & Wallets accepted
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  // Current plan
  currentCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  currentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  currentLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  currentPlan: { color: '#fff', fontSize: 20, fontWeight: '800' },
  unlimitedText: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 8 },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  usageText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  usageTextDim: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  usageBar: {
    height: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  usageFill: { height: 8, borderRadius: 6, backgroundColor: '#fff' },
  expiryText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 10 },

  // No plan
  noPlanCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  noPlanEmoji: { fontSize: 34, marginBottom: 8 },
  noPlanTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  noPlanText: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },

  // Disabled banner
  disabledBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  disabledBannerText: { fontSize: 12.5, color: '#92400E', textAlign: 'center' },

  // Plan cards
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  planCardCurrent: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  planHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planNameRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planEmoji: { fontSize: 26 },
  planName: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  planValidity: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  planPrice: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  planDesc: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    marginTop: 10,
    marginBottom: 14,
  },
  planBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  planBtnCurrent: {
    backgroundColor: '#ECFDF5',
  },
  planBtnDisabled: {
    backgroundColor: '#F3F4F6',
  },
  planBtnText: { color: '#fff', fontSize: 14.5, fontWeight: '800' },

  // Payment rows
  payCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  payHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  payPlan: { fontSize: 14.5, fontWeight: '800', color: COLORS.text },
  payInvoiceNo: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  payAmount: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  payMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  payMetaText: { fontSize: 12, color: COLORS.textSecondary },
  payInvoiceBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9,
  },
  payInvoiceBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },

  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  historyBtnIcon: { fontSize: 22 },
  historyBtnTitle: { fontSize: 14.5, fontWeight: '800', color: COLORS.text },
  historyBtnSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  historyBtnArrow: { fontSize: 15, color: COLORS.placeholder, fontWeight: '700' },

  footerNote: {
    textAlign: 'center',
    fontSize: 11.5,
    color: COLORS.placeholder,
    marginTop: 14,
  },
});

export default SubscriptionScreen;
