import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, ShoppingCart, Minus, Plus, Banknote, CreditCard, QrCode, ReceiptText, BarChart3, Package, Settings, Wifi, WifiOff, CheckCircle2, X, Menu, ChevronRight, ChevronLeft, Printer, PlusCircle, RotateCw, SlidersHorizontal } from 'lucide-react';
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
const defaultPrinter = { name: 'ESC/POS', ip: '192.168.1.100', port: '9100', paper: '80', precheck: true, bar: false, kitchen: false, autoCut: true };

function Switch({ checked, onChange }) {
  return <button type="button" className={`switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}><span /></button>;
}

function Devices({ onBack }) {
  const [printers, setPrinters] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cia-pos-printers') || '[]'); } catch { return []; }
  });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultPrinter);
  const [toast, setToast] = useState('');

  useEffect(() => { localStorage.setItem('cia-pos-printers', JSON.stringify(printers)); }, [printers]);

  const openNew = () => { setForm(defaultPrinter); setEditing(-1); };
  const openEdit = (index) => { setForm(printers[index]); setEditing(index); };
  const save = () => {
    if (!form.name.trim() || !form.ip.trim()) return;
    setPrinters((prev) => editing === -1 ? [...prev, form] : prev.map((p, i) => i === editing ? form : p));
    setEditing(null);
    setToast('Настройки принтера сохранены');
    setTimeout(() => setToast(''), 1800);
  };
  const test = () => {
    setToast('Тестовый чек отправлен · DEMO');
    setTimeout(() => setToast(''), 2200);
  };

  if (editing !== null) return <main className="devices-page">
    <div className="devices-toolbar"><button className="back-button" onClick={() => setEditing(null)}><ChevronLeft size={20}/> Устройства</button><h1>Настройки</h1><button className="icon-button" onClick={() => setEditing(null)}><X size={20}/></button></div>
    <section className="printer-settings-card">
      <div className="printer-title-row"><div><div className="printer-name-line"><Printer size={28}/><input className="printer-name-input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></div><p><span className="dot online"/> Готов к настройке</p></div><SlidersHorizontal size={24}/></div>
      <div className="connection-grid">
        <label>IP-адрес<input value={form.ip} onChange={(e)=>setForm({...form,ip:e.target.value})} placeholder="192.168.1.100"/></label>
        <label>Порт<input value={form.port} onChange={(e)=>setForm({...form,port:e.target.value})} inputMode="numeric" placeholder="9100"/></label>
        <label>Ширина бумаги<select value={form.paper} onChange={(e)=>setForm({...form,paper:e.target.value})}><option value="58">58 мм</option><option value="80">80 мм</option></select></label>
      </div>
      <div className="settings-section"><h3>Назначение</h3><div className="setting-row"><span><strong>Пречек</strong><small>Печать предварительного чека</small></span><Switch checked={form.precheck} onChange={(v)=>setForm({...form,precheck:v})}/></div><div className="setting-row"><span><strong>Bar</strong><small>Заказы для бара</small></span><Switch checked={form.bar} onChange={(v)=>setForm({...form,bar:v})}/></div><div className="setting-row"><span><strong>Kitchen</strong><small>Заказы на кухню</small></span><Switch checked={form.kitchen} onChange={(v)=>setForm({...form,kitchen:v})}/></div></div>
      <div className="settings-section"><h3>Параметры</h3><div className="setting-row"><span><strong>Автоотрезка</strong><small>Отрезать чек после печати</small></span><Switch checked={form.autoCut} onChange={(v)=>setForm({...form,autoCut:v})}/></div></div>
      <button className="outline-action" onClick={test}><Printer size={19}/> Напечатать тестовый чек</button>
      <button className="primary-action" onClick={save}>Сохранить принтер</button>
    </section>
    {toast && <div className="success-toast"><CheckCircle2 size={22}/><span><strong>{toast}</strong><small>Реальная TCP-печать будет следующим этапом</small></span></div>}
  </main>;

  return <main className="devices-page">
    <div className="devices-toolbar"><button className="back-button" onClick={onBack}><ChevronLeft size={20}/> Функции</button><h1>Устройства</h1><span className="toolbar-spacer"/></div>
    <section className="devices-card">
      <div className="section-label">Принтеры</div>
      {printers.length === 0 ? <div className="no-devices"><Printer size={36}/><strong>Принтеры не добавлены</strong><span>Добавьте сетевой ESC/POS принтер по IP и порту</span></div> : printers.map((p,i)=><button className="device-row" key={`${p.ip}-${i}`} onClick={()=>openEdit(i)}><div className="device-icon"><Printer size={23}/></div><div className="device-info"><strong>{p.name}</strong><span><span className="dot online"/> LAN · {p.ip}:{p.port} · {p.paper} мм</span></div><ChevronRight size={20}/></button>)}
      <div className="device-actions"><button onClick={openNew}><PlusCircle size={20}/> Добавить ESC/POS</button><button onClick={()=>setToast('Поиск в сети будет добавлен на следующем этапе')}><RotateCw size={20}/> Обновить</button></div>
    </section>
    {toast && <div className="success-toast"><Wifi size={22}/><span><strong>{toast}</strong><small>Сейчас доступно ручное добавление по IP</small></span></div>}
  </main>;
}

function App() {
  const [view, setView] = useState('sale');
  const [cart, setCart] = useState({});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [precheckSuccess, setPrecheckSuccess] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const categories = useMemo(() => ['Все', ...new Set(PRODUCTS.map((p) => p.category))], []);
  const filtered = PRODUCTS.filter((p) => { const q=query.trim().toLowerCase(); return (category==='Все'||p.category===category)&&(!q||p.name.toLowerCase().includes(q)); });
  const lines = Object.values(cart);
  const count = lines.reduce((s,i)=>s+i.qty,0);
  const total = lines.reduce((s,i)=>s+i.qty*i.price,0);
  const add=(p)=>setCart(prev=>({...prev,[p.id]:{...p,qty:(prev[p.id]?.qty||0)+1}}));
  const changeQty=(id,d)=>setCart(prev=>{const c=prev[id];if(!c)return prev;const q=c.qty+d,n={...prev};if(q<=0)delete n[id];else n[id]={...c,qty:q};return n;});
  const clear=()=>setCart({});
  const printPrecheck=()=>{if(!total)return;setPrecheckSuccess(true);setTimeout(()=>setPrecheckSuccess(false),2200);};
  const pay=()=>{if(!total)return;setPaymentOpen(false);setSuccess(true);setTimeout(()=>{clear();setSuccess(false);setMobileCartOpen(false);},1700);};

  if (view === 'devices') return <Devices onBack={()=>setView('sale')}/>;

  return <div className="app-shell">
    <header className="topbar"><div className="brand-block"><div className="brand-mark">CIA</div><div><strong>CIA POS Lite</strong><span>Касса №1 · Смена открыта</span></div></div><div className="top-status"><span className="status-pill"><Wifi size={16}/> HDM онлайн</span><button className="icon-button" aria-label="Меню" onClick={()=>setView('devices')}><Menu size={20}/></button></div></header>
    <main className="pos-layout"><section className="catalog-panel"><div className="catalog-head"><div><p className="eyebrow">Продажа</p><h1>Новый чек</h1></div><div className="search-wrap"><Search size={19}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Найти товар"/></div></div><div className="category-row">{categories.map(item=><button key={item} className={category===item?'category-chip active':'category-chip'} onClick={()=>setCategory(item)}>{item}</button>)}</div><div className="product-grid">{filtered.map(p=><button key={p.id} className="product-card" onClick={()=>add(p)}><div className="product-emoji">{p.emoji}</div><div className="product-info"><strong>{p.name}</strong><span>{p.category}</span><b>{fmt(p.price)}</b></div><div className="add-badge"><Plus size={18}/></div></button>)}</div></section>
      <aside className={`cart-panel ${mobileCartOpen?'mobile-open':''}`}><div className="cart-head"><div><p className="eyebrow">Корзина</p><h2>{count?`${count} поз.`:'Пусто'}</h2></div><div className="cart-actions">{count>0&&<button className="text-button danger" onClick={clear}>Очистить</button>}<button className="icon-button mobile-close" onClick={()=>setMobileCartOpen(false)}><X size={20}/></button></div></div><div className="cart-list">{lines.length===0?<div className="empty-cart"><div className="empty-icon"><ShoppingCart size={28}/></div><strong>Добавьте товары</strong><span>Нажмите на карточку товара слева</span></div>:lines.map(i=><div className="cart-line" key={i.id}><div className="cart-line-main"><div className="mini-emoji">{i.emoji}</div><div><strong>{i.name}</strong><span>{fmt(i.price)}</span></div></div><div className="qty-control"><button onClick={()=>changeQty(i.id,-1)}><Minus size={16}/></button><b>{i.qty}</b><button onClick={()=>changeQty(i.id,1)}><Plus size={16}/></button></div><strong className="line-total">{fmt(i.price*i.qty)}</strong></div>)}</div><div className="cart-summary"><div><span>Сумма</span><strong>{fmt(total)}</strong></div><div><span>Скидка</span><strong>0 ֏</strong></div><div className="grand-total"><span>К оплате</span><strong>{fmt(total)}</strong></div><div className="checkout-actions"><button className="precheck-button" disabled={!total} onClick={printPrecheck}><Printer size={19}/> Пречек</button><button className="pay-button" disabled={!total} onClick={()=>setPaymentOpen(true)}>Оплатить <ChevronRight size={20}/></button></div></div></aside></main>
    <nav className="bottom-nav"><button className="active"><ShoppingCart size={21}/><span>Продажа</span></button><button><ReceiptText size={21}/><span>Чеки</span></button><button><Package size={21}/><span>Товары</span></button><button><BarChart3 size={21}/><span>Отчёты</span></button><button onClick={()=>setView('devices')}><Settings size={21}/><span>Ещё</span></button></nav>
    {count>0&&<button className="mobile-cart-bar" onClick={()=>setMobileCartOpen(true)}><span><ShoppingCart size={20}/> {count} поз.</span><strong>{fmt(total)}</strong></button>}
    {paymentOpen&&<div className="modal-backdrop" onMouseDown={()=>setPaymentOpen(false)}><section className="payment-modal" onMouseDown={(e)=>e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">Оплата</p><h2>{fmt(total)}</h2></div><button className="icon-button" onClick={()=>setPaymentOpen(false)}><X size={21}/></button></div><p className="payment-note">Выберите способ оплаты. После подтверждения продажа будет отправлена на фискализацию.</p><div className="payment-methods"><button onClick={pay}><Banknote size={26}/><span><strong>Наличные</strong><small>Оплата наличными</small></span></button><button onClick={pay}><CreditCard size={26}/><span><strong>Карта</strong><small>Банковский терминал</small></span></button><button onClick={pay}><QrCode size={26}/><span><strong>IDRAM / QR</strong><small>Безналичная оплата</small></span></button></div></section></div>}
    {success&&<div className="success-toast"><CheckCircle2 size={22}/><span><strong>Оплата принята</strong><small>DEMO: фискализация пока не подключена</small></span></div>}
    {precheckSuccess&&<div className="success-toast precheck-toast"><Printer size={22}/><span><strong>Пречек · DEMO</strong><small>Заказ остаётся открытым · без реальной печати</small></span></div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
