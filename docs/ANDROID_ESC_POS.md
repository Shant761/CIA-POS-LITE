# CIA POS Lite — Android ESC/POS LAN printing

## Target flow

CIA POS React UI -> Capacitor Android -> `CiaEscPos` native plugin -> TCP socket -> ESC/POS printer (`IP:9100`).

The browser/PWA build stays usable, but raw TCP printing is intentionally available only in the native Android build.

## Build the Android APK

```bash
npm install
npm run build
npm run cap:sync
cd android
./gradlew assembleDebug
```

Use JDK 21 and Android SDK API 36. The APK is written to
`android/app/build/outputs/apk/debug/app-debug.apk`.

The Android project, native raster renderer, LAN printer discovery and
`CiaEscPos` plugin registration are already included in the repository.

## Android permission

Ensure this exists in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

For normal LAN TCP printing no Bluetooth permission is required.

## First hardware test

1. Connect phone and printer to the same local network.
2. Find printer IP, for example `192.168.1.50`.
3. Use TCP port `9100` unless the printer uses another RAW port.
4. From CIA POS printer settings, save the IP/port.
5. Call `printTest()` from `src/services/escposPrinter.js`.
6. Printer should initialize, print the CIA POS test ticket, feed paper and cut when enabled.

## Important

Receipts are rendered to a bitmap and sent as ESC/POS raster data, so Armenian
and Cyrillic text do not depend on printer code pages.

Do not expose port 9100 to the public internet. Printer and Android POS should stay on a trusted local network.
