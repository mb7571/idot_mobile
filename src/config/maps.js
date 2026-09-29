// Google Maps API Key Configuration
// Replace with your actual Google Maps API key
// Get one at: https://console.cloud.google.com/apis/credentials
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCRkkY_IH_Is-BBwScEqAFDY0g-nMzzJbY';

// Default search region (India)
export const DEFAULT_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

// The map still uses the Google Maps SDK natively, which requires HTTPS directly from the device. If tiles show blank:
// 1. Go to Google Cloud Console → APIs & Services
// 2. Enable "Maps SDK for Android"
// 3. Enable "Geocoding API"
// 4. In Credentials → API key restrictions, set to "None" or add your app's SHA-1:
// - SHA-1:  5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25 
// - Package:  com.idotmobile 