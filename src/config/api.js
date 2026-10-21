// ═══════════════════════════════════════════════════════════════════════════
// API Configuration
// ═══════════════════════════════════════════════════════════════════════════
// Release builds use the production backend (https://idot.kmwebtech.com);
// dev builds resolve the host at startup (see apiHost.js): probe localhost
// (works with `adb reverse tcp:8000 tcp:8000`) and known LAN IPs, then
// remember what worked. Because the host is only known at runtime, always
// read URLs through the getters below — never cache them in module-level
// constants.
// ═══════════════════════════════════════════════════════════════════════════

import {
  resolveApiHost,
  buildApiBaseUrl,
  PRODUCTION_BASE_URL,
} from './apiHost';

export const API_PORT = '8000';

// ── Mutable state, updated by initApiConfig() at startup ──────────────────
// Pre-init defaults point at production so even a request that fires before
// initApiConfig() resolves targets the release backend, not localhost.
let currentHost = PRODUCTION_BASE_URL;
let currentBaseUrl = PRODUCTION_BASE_URL;
let currentApiUrl = `${PRODUCTION_BASE_URL}/api`;
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
        console.warn('[API] Host resolution failed, keeping production URL:', error);
      } finally {
        initialized = true;
      }
    })();
  }
  return initApiConfig._promise;
};

export const APP_DOWNLOAD_LINK =
  'https://play.google.com/store/apps/details?id=com.idotmobile';
