const remoteUrl = String(process.env.CIA_POS_WEB_URL || '').trim();

/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'am.ciasoft.poslite',
  appName: 'CIA POS Lite',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
};

// Development/managed-web mode.
// Leave CIA_POS_WEB_URL empty for the normal offline APK bundled from dist.
// Set it only when intentionally building an APK that should load Vite from
// a trusted LAN/HTTPS address. Native Capacitor plugins (ESC/POS) remain available.
if (remoteUrl) {
  const parsed = new URL(remoteUrl);
  const isHttps = parsed.protocol === 'https:';
  const isLocalHttp = parsed.protocol === 'http:' && (
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1' ||
    /^10\./.test(parsed.hostname) ||
    /^192\.168\./.test(parsed.hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(parsed.hostname)
  );

  if (!isHttps && !isLocalHttp) {
    throw new Error('CIA_POS_WEB_URL must use HTTPS, or HTTP on a private/local address');
  }

  config.server = {
    url: parsed.toString().replace(/\/$/, ''),
    cleartext: isLocalHttp,
  };

  if (isLocalHttp) {
    config.android.allowMixedContent = true;
  }
}

export default config;
