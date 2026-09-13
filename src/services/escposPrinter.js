import { Capacitor, registerPlugin } from '@capacitor/core';

const CiaEscPos = registerPlugin('CiaEscPos');

const ensureNative = () => {
  if (!Capacitor.isNativePlatform()) {
    const error = new Error('Реальная ESC/POS печать доступна в Android-приложении CIA POS Lite. В браузере можно только настроить принтер.');
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

const formatDateTime = (value = new Date()) => new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
}).format(value);

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

  const items = (sale?.items || []).map((item) => ({
    name: String(item.name || ''),
    qty: Number(item.qty || 0),
    price: Number(item.price || 0),
  }));
  const subtotal = Number(sale?.subtotal ?? items.reduce((sum, item) => sum + item.qty * item.price, 0));
  const discount = Number(sale?.discount || 0);
  const total = Number(sale?.total ?? Math.max(0, subtotal - discount));

  return CiaEscPos.printPrecheck({
    ...target,
    title: String(sale?.businessName || 'CIA POS LITE'),
    subtitle: 'ПРЕЧЕК · НЕ ФИСКАЛЬНЫЙ',
    receiptNo: String(sale?.receiptNo || ''),
    cashier: String(sale?.cashier || ''),
    dateTime: String(sale?.dateTime || formatDateTime()),
    items,
    subtotal,
    discount,
    total,
    footer: String(sale?.footer || 'Շնորհակալություն · Спасибо'),
  });
}

export function isNativePrinterAvailable() {
  return Capacitor.isNativePlatform();
}
