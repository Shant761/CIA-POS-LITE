# CIA POS Lite — Raster/Bitmap ESC/POS printing

## Decision

All printable CIA POS documents are rendered to a monochrome Android `Bitmap` first and only then converted to ESC/POS raster bytes (`GS v 0`). We do not depend on printer code pages for receipt text.

This gives one rendering path for Russian, Armenian and English and keeps layout identical across compatible 58 mm and 80 mm thermal printers.

## Pipeline

`CIA POS React -> Capacitor -> CiaEscPosPlugin -> ReceiptBitmapRenderer -> Bitmap -> EscPosRasterEncoder -> TCP/IP:9100 -> ESC/POS printer`

Only printer control commands remain ESC/POS-native: initialization, raster image command, paper feed and cutter.

## Standard precheck template v1

```text
             CIA POS LITE
       ПРЕЧЕК · НЕ ФИСКАЛЬНЫЙ
--------------------------------
Чек                         #1042
Дата              13.09.2026 12:45
Кассир                      Shant
--------------------------------
Капучино
2 × 1 200                  2 400

Круассан
1 × 1 000                  1 000
--------------------------------
Сумма                      3 400
Скидка                         0

ИТОГО                      3 400
             AMD / ֏
--------------------------------
        НЕ ФИСКАЛЬНЫЙ ЧЕК
          ՈՉ ՖԻՍԿԱԼ ՉԵԿ

      Շնորհակալություն · Спасибо
```

## Paper profiles

- 80 mm: 576 px bitmap width.
- 58 mm: 384 px bitmap width.
- Layout wraps long product names automatically.
- Text is rendered by Android Canvas using the system sans-serif font, so Armenian/Cyrillic are rendered as pixels rather than printer glyphs.

## Native source files

- `native/android/ReceiptBitmapRenderer.kt` — receipt/test bitmap layout.
- `native/android/EscPosRasterEncoder.kt` — monochrome conversion and `GS v 0` raster encoding.
- `native/android/CiaEscPosPlugin.kt` — TCP socket transport and Capacitor methods.
- `src/services/escposPrinter.js` — React/Capacitor bridge and receipt payload normalization.

## Next validation

1. Generate the Capacitor `android/` project.
2. Copy/register the native plugin sources in the Android app package `am.ciasoft.poslite`.
3. Build and install APK on an Android device connected to the same LAN as the printer.
4. Configure printer IP and port 9100.
5. Run `printTest` and verify Armenian/Russian/English glyphs, width and cutter.
6. Connect the Sale screen `Пречек` button to `printPrecheck` and test a real cart.

## Compatibility note

`GS v 0` is widely supported by ESC/POS-compatible thermal printers, but individual devices can differ in printable width, cutter command support and buffer limits. Keep manual paper width selection and test-print validation per printer model.
