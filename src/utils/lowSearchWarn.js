import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

/**
 * Low-searches in-app warning.
 *
 * Fires a toast when the customer drops into their last 5 searches. Each
 * urgency threshold alerts only once per subscription (5, 3, 1), and the
 * memory resets when the plan changes or searches go back above the highest
 * threshold (renewal / top-up).
 */

const MEMORY_KEY = 'sub_low_search_warn';

const THRESHOLDS = [
  {
    at: 5,
    title: '⚠️ Running low on searches',
    msg: 'Only 5 searches left. Upgrade to keep searching without breaks.',
  },
  {
    at: 3,
    title: '⚠️ Almost out of searches',
    msg: 'Just 3 searches left. Renew now to avoid interruption.',
  },
  {
    at: 1,
    title: '🚨 Last search remaining',
    msg: 'This is your final search. Subscribe to continue after this.',
  },
];

// ── Extract the comparable state from a subscription status payload ────────
// Accepts the /subscription/status shape ({subscription: {...}}) or the
// embedded subscription object itself (search response `subscription` key).
const extract = (status) => {
  const sub = status?.subscription || null;
  if (!sub || sub.is_unlimited) return null;
  const left = sub.remaining_searches ?? null;
  if (left === null || left < 0) return null;
  return { left, planId: sub.id ?? null };
};

// ── Fire the warning for the current remaining count (if any) ──────────────
export const checkLowSearches = async (status) => {
  try {
    const info = extract(status);
    if (!info) return;

    // Skip when subscriptions are disabled entirely
    if (status?.enabled === false) return;

    const applicable = THRESHOLDS.filter((t) => info.left <= t.at);
    if (applicable.length === 0) {
      // Back above all thresholds (renewal) → clear memory
      await AsyncStorage.removeItem(MEMORY_KEY);
      return;
    }

    const memoryRaw = await AsyncStorage.getItem(MEMORY_KEY);
    const memory = memoryRaw ? JSON.parse(memoryRaw) : {};

    // Reset memory when the subscription changed (new plan purchased)
    if (memory.planId !== info.planId) {
      memory.fired = [];
      memory.planId = info.planId;
    }

    // Highest (most urgent) threshold not yet fired for this subscription
    const next = applicable.find((t) => !memory.fired?.includes(t.at));
    if (!next) return;

    memory.fired = [...(memory.fired || []), next.at];
    await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(memory));

    Toast.show({
      type: 'warn',
      text1: next.title,
      text2: next.msg,
      position: 'top',
      visibilityTime: 4500,
      onPress: Toast.hide,
    });
  } catch {
    // Warning is best-effort; never break the search flow
  }
};
