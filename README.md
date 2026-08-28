# iDOT Mobile - React Native Application

## Overview
Single React Native mobile application for the iDOT transport marketplace. Supports role-based access for Customers, Transporters, and Admin users.

## Architecture
- **Framework:** React Native 0.73
- **Navigation:** React Navigation 6
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Storage:** AsyncStorage

## Features

### Customer Features
- OTP-based login
- Search transporters by name, mobile, business, location, vehicle type
- View transporter profiles with fleet information
- Add/remove favorites
- Submit service requests (enquiry-based)
- View submitted requests and status
- Notifications
- Settings and profile management

### Transporter Features
- All customer features (search, favorites, service requests)
- View own profile and verification status
- View incoming service requests
- Accept/decline service requests
- View own fleet information (read-only)
- Transporter-specific settings

### Admin Features (Mobile)
- Dashboard with statistics
- Transporter management (verify, activate/deactivate)
- Customer management
- Service request overview
- Master data management (Business Types, Vehicle Types, Cities, States, Radius)
- Bulk transporter import
- Reports and analytics
- System settings and content management

## Setup Instructions

### Prerequisites
- Node.js 18+
- React Native CLI or Expo CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Installation

```bash
# Navigate to mobile directory
cd idot-mobile

# Install dependencies
npm install

# For iOS
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Configuration

Update the API base URL in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://YOUR_SERVER_IP:8000/api';
```

## Project Structure

```
idot-mobile/
├── App.js                    # Main app entry point
├── src/
│   ├── context/
│   │   └── AuthContext.js    # Authentication state management
│   ├── navigation/
│   │   └── AppNavigator.js   # Role-based navigation
│   ├── screens/
│   │   ├── auth/             # Login, OTP, Registration screens
│   │   ├── common/           # Shared screens (Search, Profile, Favorites, etc.)
│   │   ├── transporter/      # Transporter-specific screens
│   │   └── admin/            # Admin-specific screens
│   ├── services/
│   │   └── api.js            # API service layer
│   └── utils/                # Utility functions
└── package.json
```

## Screen Navigation

### Customer Flow
```
Login → OTP → Home
  ├── Search Transporters → Transporter List → Transporter Profile → Service Request
  ├── My Favorites → Transporter Profile
  ├── My Requests → Request Detail
  ├── Notifications
  └── Settings
```

### Transporter Flow
```
Login → OTP → Transporter Dashboard
  ├── Search Transporters → Transporter List → Transporter Profile
  ├── Incoming Requests → Request Detail (Accept/Decline)
  ├── My Favorites
  ├── My Requests
  ├── My Fleet (View Only)
  ├── Notifications
  └── Settings
```

### Admin Flow
```
Login → OTP → Admin Dashboard
  ├── Transporter Management (Verify/Reject/Activate)
  ├── Customer Management (Activate/Deactivate)
  ├── Service Requests
  ├── Master Data (Business Types, Vehicle Types, Cities, States, Radius)
  ├── Bulk Import
  ├── Reports
  └── Settings
```

## Key Design Decisions

1. **Single App with Role-Based Access** - One React Native app serves all roles
2. **Service Requests = Enquiries** - No booking functionality implemented
3. **Fleet is Admin-Managed** - Transporters view fleet read-only
4. **Service Location/Radius is Admin-Configured** - Transporters cannot modify
5. **Google Maps Integration** - Autocomplete and map picker (to be implemented with API keys)

## Dependencies

```json
{
  "react-native": "0.73.4",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/native-stack": "^6.9.17",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "axios": "^1.6.5",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "react-native-maps": "^1.10.3",
  "react-native-google-places-autocomplete": "^2.5.1",
  "react-native-toast-message": "^2.2.0"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | Backend API URL | `http://localhost:8000/api` |

## Development Notes

- OTP is returned in API response for development (remove in production)
- Google Maps API key needs to be configured
- Push notifications to be implemented with Firebase
- Excel file picker for bulk import needs native module integration
