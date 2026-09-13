import { CapacitorConfig } from '@capacitor/cli';

/** @type {CapacitorConfig} */
const config = {
  appId: 'am.ciasoft.poslite',
  appName: 'CIA POS Lite',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
  },
};

export default config;
