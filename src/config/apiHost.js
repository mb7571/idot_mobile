// ═══════════════════════════════════════════════════════════════════════════
// Dynamic API host resolution
// ═══════════════════════════════════════════════════════════════════════════
// The backend (Laravel `php artisan serve`) runs on a dev PC whose LAN IP can
// change between DHCP leases, which used to break the app silently. Instead of
// hard-coding one IP, we probe a list of candidate hosts at startup:
//
//   1. localhost:8000   → works when `adb reverse tcp:8000 tcp:8000` is active
//   2. each LAN IP below → works when the phone is on the same Wi-Fi network
//
// The first host that answers wins and is remembered in AsyncStorage, so
// subsequent launches start with the last-known-good host. A manual override
// (set via setApiHostOverride) always wins over probing.
// ═══════════════════════════════════════════════════════════════════════════

import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_PORT = '8000';
export const API_HOST_KEY = 'api_host_override';
export const API_LAST_GOOD_HOST_KEY = 'api_last_good_host';
export const API_LAN_HOST_KEY = 'api_last_good_lan_host';

// Candidate LAN IPs of the dev machine. Add/remove entries as needed — the
// resolver tries them in order after localhost.
const LAN_HOST_CANDIDATES = ['192.168.1.8', '192.168.1.7'];

const PROBE_TIMEOUT_MS = 2500;

const buildUrl = (host) => `http://${host}:${API_PORT}`;

// ── Manual override (persists across restarts) ────────────────────────────
export const setApiHostOverride = async (host) => {
  if (host) {
    await AsyncStorage.setItem(API_HOST_KEY, host);
  } else {
    await AsyncStorage.removeItem(API_HOST_KEY);
  }
};

export const getApiHostOverride = () => AsyncStorage.getItem(API_HOST_KEY);

// ── Probe a candidate host with a tiny request ─────────────────────────────
// Any HTTP response (even 404/302) proves the backend is reachable.
const probeHost = async (host) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    await fetch(`${buildUrl(host)}/api/subscription/plans`, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    return true;
  } catch (error) {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

// ── Resolve the best available host ────────────────────────────────────────
// Order: manual override → localhost (adb reverse) → LAN IPs.
// Resolves to a host string, e.g. "localhost" or "192.168.1.8".
export const resolveApiHost = async () => {
  // 1. Manual override always wins
  const override = await getApiHostOverride();
  if (override) {
    console.log('[APIHost] Using manual override:', override);
    return override;
  }

  // 2. Probe candidates in order. Connection-refused fails instantly, so this
  //    sequence is cheap; only unreachable IPs wait out the probe timeout.
  const candidates = ['localhost', ...LAN_HOST_CANDIDATES];
  for (const host of candidates) {
    if (await probeHost(host)) {
      console.log('[APIHost] Resolved host:', host);
      await AsyncStorage.setItem(API_LAST_GOOD_HOST_KEY, host);
      // Remember the LAN IP separately — see getExternalBrowserHost()
      if (host !== 'localhost') {
        await AsyncStorage.setItem(API_LAN_HOST_KEY, host);
      }
      return host;
    }
  }

  // 3. Nothing answered — fall back to localhost (adb reverse workflow)
  console.warn('[APIHost] No host reachable, falling back to localhost');
  return 'localhost';
};

// Host to use when opening links OUTSIDE the app (e.g. invoices in the
// browser). `adb reverse` tunnels only work for traffic originating inside
// the app, so "localhost" must be swapped for the PC's LAN IP there.
export const getExternalBrowserHost = async () => {
  const lan = await AsyncStorage.getItem(API_LAN_HOST_KEY);
  return lan || LAN_HOST_CANDIDATES[0] || 'localhost';
};

export const buildApiBaseUrl = buildUrl;
