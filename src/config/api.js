// ═══════════════════════════════════════════════════════════════════════════
// API Configuration
// ═══════════════════════════════════════════════════════════════════════════
// The backend host is resolved dynamically at startup (see apiHost.js): the
// app probes localhost (works with `adb reverse tcp:8000 tcp:8000`) and known
// LAN IPs, then remembers what worked. Because the host is only known at
// runtime, always read URLs through the getters below — never cache them in
// module-level constants.
//
// Port 8000 is the default Laravel `php artisan serve` port.
// ═══════════════════════════════════════════════════════════════════════════

import { resolveApiHost, buildApiBaseUrl } from './apiHost';

export const API_PORT = '8000';

// ── Mutable state, updated by initApiConfig() at startup ──────────────────
let currentHost = 'localhost';
let currentBaseUrl = 'http://localhost:8000';
let currentApiUrl = 'http://localhost:8000/api';
let initialized = false;

// Live getters — the only supported way to read the URLs.
export const getApiHost = () => currentHost;
export const getApiBaseUrl = () => currentBaseUrl;
export const getApiUrl = () => currentApiUrl;
export const isApiConfigReady = () => initialized;

// Idempotent: safe to call from both index.js (kick-off) and App.js (await).
export const initApiConfig = () => {
  if (!initApiConfig._promise) {
    initApiConfig._promise = (async () => {
      try {
        const host = await resolveApiHost();
        currentHost = host;
        currentBaseUrl = buildApiBaseUrl(host);
        currentApiUrl = `${currentBaseUrl}/api`;
        console.log('[API] Using base URL:', currentBaseUrl);
      } catch (error) {
        console.warn('[API] Host resolution failed, using localhost:', error);
      } finally {
        initialized = true;
      }
    })();
  }
  return initApiConfig._promise;
};

// export const API_BASE_URL = `https://idot.kmwebtech.com`;
export const APP_DOWNLOAD_LINK =
  'https://play.google.com/store/apps/details?id=com.idotmobile';
