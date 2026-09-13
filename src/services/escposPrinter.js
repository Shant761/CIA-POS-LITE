import { Capacitor, registerPlugin } from '@capacitor/core';

const CiaEscPos = registerPlugin('CiaEscPos');

const ensureNative = () => {
  if (!Capacitor.isNativePlatform()) {
    const error = new Error('ESC/POS TCP printing is available in the Android app. Open CIA POS Lite through the Capacitor Android build.');
    error.code = 'NATIVE_REQUIRED';
    throw error;
  }
};

const normalizePrinter = (printer) => ({
  host: String(printer?.ip || '').trim(),
  port: Number(printer?.port || 9100),
  paper: Number(printer?.paper || 80),
  autoCut: printer?.autoCut !== false,
});

export async function printTest(printer) {
  ensureNative();
  const target = normalizePrinter(printer);
  if (!target.host) throw new Error('Укажите IP-адрес принтера');
  return CiaEscPos.printTest(target);
}

export async function printPrecheck(printer, sale) {
  ensureNative();
  const target = normalizePrinter(printer);
  if (!target.host) throw new Error('Укажите IP-адрес принтера');

  return CiaEscPos.printPrecheck({
    ...target,
    title: 'CIA POS LITE',
    receiptNo: String(sale?.receiptNo || ''),
    items: (sale?.items || []).map((item) => ({
      name: String(item.name || ''),
      qty: Number(item.qty || 0),
      price: Number(item.price || 0),
    })),
    total: Number(sale?.total || 0),
  });
}

export function isNativePrinterAvailable() {
  return Capacitor.isNativePlatform();
}
