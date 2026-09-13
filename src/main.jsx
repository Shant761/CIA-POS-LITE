import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search, Minus, Plus, Banknote, CreditCard, QrCode, ReceiptText,
  BarChart3, Package, Settings, Wifi, CheckCircle2, X, Menu,
  ChevronLeft, Printer, UserPlus, MoreHorizontal, Trash2, ShoppingBag,
  Users, ScanLine, Smartphone, WalletCards
} from 'lucide-react';
import './styles.css';

const PRODUCTS = [
  { id: 1, name: 'Американо', price: 900, category: 'Кофе', emoji: '☕' },
  { id: 2, name: 'Капучино', price: 1200, category: 'Кофе', emoji: '🥛' },
  { id: 3, name: 'Латте', price: 1400, category: 'Кофе', emoji: '🧋' },
  { id: 4, name: 'Вода', price: 500, category: 'Напитки', emoji: '💧' },
  { id: 5, name: 'Кола 0.5', price: 700, category: 'Напитки', emoji: '🥤' },
  { id: 6, name: 'Круассан', price: 1000, category: 'Еда', emoji: '🥐' },
  { id: 7, name: 'Сэндвич', price: 2200, category: 'Еда', emoji: '🥪' },
  { id: 8, name: 'Чизкейк', price: 1800, category: 'Десерты', emoji: '🍰' },
  { id: 9, name: 'Печенье', price: 650, category: 'Десерты', emoji: '🍪' },
  { id: 10, name: 'Сок', price: 800, category: 'Напитки', emoji: '🧃' },
  { id: 11, name: 'Хот-дог', price: 1900, category: 'Еда', emoji: '🌭' },
  { id: 12, name: 'Чай', price: 750, category: 'Чай', emoji: '🍵' },
];

const fmt = (value) => new Intl.NumberFormat('ru-RU').format(value) + ' ֏';

function App() {
  const [cart, setCart] = useState({
    2: { ...PRODUCTS[1], qty: 1 },
    6: { ...PRODUCTS[5], qty: 1 },
  });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все');
  const [activeTab, setActiveTab] = useState('check');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('cash');
  const [success, setSuccess] = useState(false);
  const [receiptPrint, setReceiptPrint] = useState(true);
  const [serviceEnabled, setServiceEnabled] = useState(false);

  const categories = useMemo(() => ['Все', ...new Set(PRODUCTS.map((p) => p.category))], []);
  const filtered = PRODUCTS.filter((p) => {
    const q = query.trim().toLowerCase();
    return (category === 'Все' || p.category === category) && (!q || p.name.toLowerCase().includes(q));
  });
  const lines = Object.values(cart);
  const itemCount = lines.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = lines.reduce((sum, item) => sum + item.qty * item.price, 0);
  const service = serviceEnabled ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + service;

  const add = (product) => setCart((prev) => ({
    ...prev,
    [product.id]: { ...product, qty: (prev[product.id]?.qty || 0) + 1 },
  }));

  const changeQty = (id, delta) => setCart((prev) => {
    const current = prev[id];
    if (!current) return prev;
    const nextQty = current.qty + delta;
    const next = { ...prev };
    if (nextQty <= 0) delete next[id];
    else next[id] = { ...current, qty: nextQty };
    return next;
  });

  const completePayment = () => {
    if (!total) return;
    setPaymentOpen(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setCart({});
    }, 1800);
  };

  return <div className="cia-app">
    <header className="cia-topbar">
      <button className="top-icon" aria-label="Меню"><Menu size={22}/></button>
      <div className="cia-logo"><strong>CIA POS</strong><span>light</span></div>
      <div className="online-state"><i/> Онлайн</div>
    </header>

    <div className="workspace">
      <section className="receipt-side">
        <div className="receipt-tabs">
          <button className={activeTab === 'check' ? 'active' : ''} onClick={() => setActiveTab('check')}>Чек</button>
          <button className={activeTab === 'client' ? 'active' : ''} onClick={() => setActiveTab('client')}>Клиент</button>
          <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>Инфо</button>
        </div>

        {activeTab === 'check' && <>
          <div className="receipt-title-row">
            <div><span className="kicker">Текущий чек</span><h1>Продажа №1042</h1></div>
            <button className="round-danger" onClick={() => setCart({})} aria-label="Очистить чек"><Trash2 size={18}/></button>
          </div>

          <div className="guest-card">
            <div className="guest-head"><span>ГОСТЬ 1</span><button><Users size={17}/> 1</button></div>
            <div className="line-head"><span>Наименование</span><span>Кол-во</span><span>Цена</span><span>Итого</span></div>
            {lines.length === 0 ? <div className="empty-check"><ShoppingBag size={34}/><b>Чек пуст</b><span>Добавьте первый товар</span></div> : lines.map((item) => <div className="receipt-line" key={item.id}>
              <div className="item-name"><div className="mini-art">{item.emoji}</div><div><b>{item.name}</b><small>{item.category}</small></div></div>
              <div className="qty-stepper"><button onClick={() => changeQty(item.id, -1)}><Minus size={14}/></button><b>{item.qty}</b><button onClick={() => changeQty(item.id, 1)}><Plus size={14}/></button></div>
              <span className="unit-price">{fmt(item.price)}</span>
              <b className="row-total">{fmt(item.price * item.qty)}</b>
            </div>)}
          </div>

          <button className="add-guest"><UserPlus size={19}/> ДОБАВИТЬ ГОСТЯ</button>
          <button className="add-product" onClick={() => setCatalogOpen(true)}><Plus size={20}/> Добавить товар</button>

          <div className="bill-options">
            <label className="service-toggle"><span><b>Обслуживание 10%</b><small>Добавить сервисный сбор</small></span><input type="checkbox" checked={serviceEnabled} onChange={(e) => setServiceEnabled(e.target.checked)}/><i/></label>
          </div>

          <div className="totals-block">
            <div><span>Сумма</span><b>{fmt(subtotal)}</b></div>
            {serviceEnabled && <div><span>Обслуживание 10%</span><b>{fmt(service)}</b></div>}
            <div className="to-pay"><span>К оплате</span><strong>{fmt(total)}</strong></div>
          </div>

          <div className="checkout-row">
            <button className="square-action"><MoreHorizontal size={22}/></button>
            <button className="square-action" onClick={() => total && alert('Пречек будет отправлен на выбранный ESC/POS принтер')}><Printer size={21}/></button>
            <button className="pay-main" disabled={!total} onClick={() => setPaymentOpen(true)}>Оплатить</button>
          </div>
        </>}

        {activeTab === 'client' && <div className="simple-tab"><Users size={42}/><h2>Клиент не выбран</h2><p>Позже здесь будут поиск клиента, бонусы и история покупок.</p><button>Добавить клиента</button></div>}
        {activeTab === 'info' && <div className="simple-tab"><ReceiptText size={42}/><h2>Информация о чеке</h2><p>Кассир: Shant · Касса №1 · Смена открыта</p></div>}
      </section>

      <aside className={`catalog-side ${catalogOpen ? 'mobile-open' : ''}`}>
        <div className="catalog-top"><div><span className="kicker">Каталог</span><h2>Все товары</h2></div><button className="catalog-close" onClick={() => setCatalogOpen(false)}><X size={22}/></button></div>
        <div className="search-box"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск товара или штрихкода"/><ScanLine size={20}/></div>
        <div className="category-strip">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="product-cards">{filtered.map((product) => <button className="catalog-card" key={product.id} onClick={() => add(product)}>
          <div className="product-visual">{product.emoji}</div><div><b>{product.name}</b><span>{fmt(product.price)}</span></div><em><Plus size={16}/></em>
        </button>)}</div>
      </aside>
    </div>

    <nav className="bottom-nav">
      <button className="active"><ReceiptText size={21}/><span>Чек</span></button>
      <button onClick={() => setCatalogOpen(true)}><Package size={21}/><span>Товары</span></button>
      <button><BarChart3 size={21}/><span>Отчёты</span></button>
      <button><Settings size={21}/><span>Ещё</span></button>
    </nav>

    {paymentOpen && <div className="payment-screen">
      <div className="payment-sheet">
        <div className="payment-toolbar"><button onClick={() => setPaymentOpen(false)}><ChevronLeft size={24}/> Отменить</button><span>Оплата</span><i/></div>
        <div className="payment-content">
          <p>Итого</p><h2>{fmt(total)}</h2><span className="payment-hint">Выберите способ оплаты</span>

          <div className="payment-summary"><div><span>К оплате</span><b>{fmt(total)}</b></div></div>
          <div className="payment-list">
            <button className={paymentType === 'cash' ? 'selected' : ''} onClick={() => setPaymentType('cash')}><Banknote/><span>Наличными</span><b>{paymentType === 'cash' ? fmt(total) : '0 ֏'}</b></button>
            <button className={paymentType === 'card' ? 'selected' : ''} onClick={() => setPaymentType('card')}><CreditCard/><span>Карточкой</span><b>{paymentType === 'card' ? fmt(total) : '0 ֏'}</b></button>
            <button className={paymentType === 'qr' ? 'selected' : ''} onClick={() => setPaymentType('qr')}><QrCode/><span>IDRAM / QR</span><b>{paymentType === 'qr' ? fmt(total) : '0 ֏'}</b></button>
            <button className={paymentType === 'mixed' ? 'selected' : ''} onClick={() => setPaymentType('mixed')}><WalletCards/><span>Смешанная</span><b>{paymentType === 'mixed' ? 'Настроить' : '0 ֏'}</b></button>
          </div>

          <label className="print-toggle"><span><Printer size={20}/> Напечатать чек</span><input type="checkbox" checked={receiptPrint} onChange={(e) => setReceiptPrint(e.target.checked)}/><i/></label>
          <button className="confirm-pay" onClick={completePayment}>Оплатить {fmt(total)}</button>
        </div>
      </div>
    </div>}

    {success && <div className="success-overlay"><div><CheckCircle2 size={70}/><h2>Оплата успешна</h2><p>Чек №001042</p><strong>{fmt(total)}</strong><span>DEMO · фискализация будет подключена отдельно</span></div></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
