import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Banknote,
  CreditCard,
  QrCode,
  ReceiptText,
  BarChart3,
  Package,
  Settings,
  Wifi,
  CheckCircle2,
  X,
  Menu,
  ChevronRight,
} from 'lucide-react';
import './styles.css';

const PRODUCTS = [
  { id: 1, name: 'Американо', price: 900, category: 'Кофе', emoji: '☕' },
  { id: 2, name: 'Капучино', price: 1200, category: 'Кофе', emoji: '🥛' },
  { id: 3, name: 'Латте', price: 1400, category: 'Кофе', emoji: '🧋' },
  { id: 4, name: 'Вода', price: 500, category: 'Напитки', emoji: '💧' },
  { id: 5, name: 'Кола', price: 700, category: 'Напитки', emoji: '🥤' },
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
  const [cart, setCart] = useState({});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const categories = ['Все', ...new Set(PRODUCTS.map((p) => p.category))];
  const filtered = PRODUCTS.filter((p) => {
    const q = query.trim().toLowerCase();
    return (category === 'Все' || p.category === category) && (!q || p.name.toLowerCase().includes(q));
  });

  const lines = Object.values(cart);
  const count = lines.reduce((sum, item) => sum + item.qty, 0);
  const total = lines.reduce((sum, item) => sum + item.qty * item.price, 0);

  const add = (product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: { ...product, qty: (prev[product.id]?.qty || 0) + 1 },
    }));
  };

  const changeQty = (id, delta) => {
    setCart((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const qty = current.qty + delta;
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = { ...current, qty };
      return next;
    });
  };

  const clear = () => setCart({});

  const pay = (method) => {
    if (!total) return;
    setPaymentOpen(false);
    setSuccess(true);
    setTimeout(() => {
      clear();
      setSuccess(false);
      setMobileCartOpen(false);
    }, 1700);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">CIA</div>
          <div>
            <strong>CIA POS Lite</strong>
            <span>Касса №1 · Смена открыта</span>
          </div>
        </div>
        <div className="top-status">
          <span className="status-pill"><Wifi size={16}/> HDM онлайн</span>
          <button className="icon-button" aria-label="Меню"><Menu size={20}/></button>
        </div>
      </header>

      <main className="pos-layout">
        <section className="catalog-panel">
          <div className="catalog-head">
            <div>
              <p className="eyebrow">Продажа</p>
              <h1>Новый чек</h1>
            </div>
            <div className="search-wrap">
              <Search size={19}/>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Найти товар"
                aria-label="Поиск товара"
              />
            </div>
          </div>

          <div className="category-row" role="tablist" aria-label="Категории">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? 'category-chip active' : 'category-chip'}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {filtered.map((product) => (
              <button key={product.id} className="product-card" onClick={() => add(product)}>
                <div className="product-emoji" aria-hidden>{product.emoji}</div>
                <div className="product-info">
                  <strong>{product.name}</strong>
                  <span>{product.category}</span>
                  <b>{fmt(product.price)}</b>
                </div>
                <div className="add-badge"><Plus size={18}/></div>
              </button>
            ))}
          </div>
        </section>

        <aside className={`cart-panel ${mobileCartOpen ? 'mobile-open' : ''}`}>
          <div className="cart-head">
            <div>
              <p className="eyebrow">Корзина</p>
              <h2>{count ? `${count} поз.` : 'Пусто'}</h2>
            </div>
            <div className="cart-actions">
              {count > 0 && <button className="text-button danger" onClick={clear}>Очистить</button>}
              <button className="icon-button mobile-close" onClick={() => setMobileCartOpen(false)} aria-label="Закрыть корзину"><X size={20}/></button>
            </div>
          </div>

          <div className="cart-list">
            {lines.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-icon"><ShoppingCart size={28}/></div>
                <strong>Добавьте товары</strong>
                <span>Нажмите на карточку товара слева</span>
              </div>
            ) : lines.map((item) => (
              <div className="cart-line" key={item.id}>
                <div className="cart-line-main">
                  <div className="mini-emoji">{item.emoji}</div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{fmt(item.price)}</span>
                  </div>
                </div>
                <div className="qty-control">
                  <button onClick={() => changeQty(item.id, -1)} aria-label="Уменьшить"><Minus size={16}/></button>
                  <b>{item.qty}</b>
                  <button onClick={() => changeQty(item.id, 1)} aria-label="Увеличить"><Plus size={16}/></button>
                </div>
                <strong className="line-total">{fmt(item.price * item.qty)}</strong>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div><span>Сумма</span><strong>{fmt(total)}</strong></div>
            <div><span>Скидка</span><strong>0 ֏</strong></div>
            <div className="grand-total"><span>К оплате</span><strong>{fmt(total)}</strong></div>
            <button className="pay-button" disabled={!total} onClick={() => setPaymentOpen(true)}>
              Оплатить <ChevronRight size={20}/>
            </button>
          </div>
        </aside>
      </main>

      <nav className="bottom-nav" aria-label="Основная навигация">
        <button className="active"><ShoppingCart size={21}/><span>Продажа</span></button>
        <button><ReceiptText size={21}/><span>Чеки</span></button>
        <button><Package size={21}/><span>Товары</span></button>
        <button><BarChart3 size={21}/><span>Отчёты</span></button>
        <button><Settings size={21}/><span>Ещё</span></button>
      </nav>

      {count > 0 && (
        <button className="mobile-cart-bar" onClick={() => setMobileCartOpen(true)}>
          <span><ShoppingCart size={20}/> {count} поз.</span>
          <strong>{fmt(total)}</strong>
        </button>
      )}

      {paymentOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPaymentOpen(false)}>
          <section className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">Оплата</p>
                <h2 id="payment-title">{fmt(total)}</h2>
              </div>
              <button className="icon-button" onClick={() => setPaymentOpen(false)} aria-label="Закрыть"><X size={21}/></button>
            </div>
            <p className="payment-note">Выберите способ оплаты. После подтверждения продажа будет отправлена на фискализацию.</p>
            <div className="payment-methods">
              <button onClick={() => pay('cash')}><Banknote size={26}/><span><strong>Наличные</strong><small>Оплата наличными</small></span></button>
              <button onClick={() => pay('card')}><CreditCard size={26}/><span><strong>Карта</strong><small>Банковский терминал</small></span></button>
              <button onClick={() => pay('idram')}><QrCode size={26}/><span><strong>IDRAM / QR</strong><small>Безналичная оплата</small></span></button>
            </div>
          </section>
        </div>
      )}

      {success && (
        <div className="success-toast" role="status" aria-live="polite">
          <CheckCircle2 size={22}/>
          <span><strong>Оплата принята</strong><small>Чек отправлен на HDM</small></span>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
