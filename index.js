import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initApiConfig } from './src/config/api';

// IMPORTANT: registerComponent must run synchronously. Gating it behind an
// await loses the race against the native side's runApplication call and
// crashes with "appName has not been registered". Host resolution runs in
// parallel instead; App.js holds rendering until it finishes.
initApiConfig();

AppRegistry.registerComponent(appName, () => App);
