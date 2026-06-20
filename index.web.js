/**
 * Web entry point.
 * Uses Expo's registerRootComponent so the app mounts into the #root element
 * in the browser. Native (Android/iOS) continues to use index.js.
 */
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
