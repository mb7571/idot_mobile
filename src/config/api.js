// ═══════════════════════════════════════════════════════════════════════════
// API Configuration
// ═══════════════════════════════════════════════════════════════════════════
// Update HOST if your PC's LAN IP changes (run `ipconfig` to check).
// Port 8000 is the default Laravel `php artisan serve` port.
// ═══════════════════════════════════════════════════════════════════════════

const API_HOST = '192.168.1.7';
const API_PORT = '8000';
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;

// export const API_BASE_URL = `https://idot.kmwebtech.com`;
export const API_URL = `${API_BASE_URL}/api`;

// Public app download link used when sharing transporter profiles.
// Update if the app is published under a different package name.
export const APP_DOWNLOAD_LINK =
  'https://play.google.com/store/apps/details?id=com.idotmobile';
