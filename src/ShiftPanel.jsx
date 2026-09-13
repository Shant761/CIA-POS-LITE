import React,{useMemo,useState}from'react';
import{ChevronLeft,Clock3,Banknote,CreditCard,QrCode,ReceiptText,LockKeyhole,PlayCircle}from'lucide-react';
import{closeShift,getActiveShift,getShiftHistory,openShift}from'./services/shiftStore';

const fmt=v=>new Intl.NumberFormat('ru-RU').format(Number(v||0))+' ֏';
const dt=v=>v?new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v)):'—';

export default function ShiftPanel({onBack,onShiftChange}){
 const[active,setActive]=useState(()=>getActiveShift());
 const[history,setHistory]=useState(()=>getShiftHistory());
 const[openingCash,setOpeningCash]=useState('');
 const[closingCash,setClosingCash]=useState('');
 const[busy,setBusy]=useState(false);
 const expected=useMemo(()=>active?Number(active.openingCash||0)+Number(active.cash||0)-Number(active.refundAmount||0):0,[active]);
 const refresh=()=>{const s=getActiveShift();setActive(s);setHistory(getShiftHistory());onShiftChange?.(s)};
 const start=()=>{setBusy(true);try{openShift({cashier:'Касса №1',openingCash:Number(openingCash||0)});setOpeningCash('');refresh()}finally{setBusy(false)}};
 const finish=()=>{if(!window.confirm('Закрыть текущую смену? После закрытия новые продажи потребуют открытия новой смены.'))return;setBusy(true);try{closeShift({closingCash:closingCash===''?null:Number(closingCash)});setClosingCash('');refresh()}catch(e){alert(e.message)}finally{setBusy(false)}};
 return <div className="shift-page"><header className="shift-toolbar"><button onClick={onBack}><ChevronLeft/> Назад</button><h1>Смена</h1><span/></header><main className="shift-content">{!active?<section className="shift-card shift-empty"><PlayCircle/><span className="shift-status closed">Смена закрыта</span><h2>Открыть новую смену</h2><p>Данные пока сохраняются локально на этом устройстве.</p><label>Наличные в кассе при открытии<input inputMode="numeric" value={openingCash} onChange={e=>setOpeningCash(e.target.value.replace(/[^0-9]/g,''))} placeholder="0"/></label><button className="shift-primary" disabled={busy} onClick={start}>Открыть смену</button></section>:<><section className="shift-card"><div className="shift-head"><div><span className="shift-status open">Смена открыта</span><h2>Смена №{active.number}</h2><p><Clock3/> Открыта {dt(active.openedAt)}</p></div><div className="shift-total"><span>Продажи</span><strong>{fmt(active.gross)}</strong><small>{active.salesCount} чеков</small></div></div><div className="shift-stats"><div><Banknote/><span>Наличные</span><b>{fmt(active.cash)}</b></div><div><CreditCard/><span>Карта</span><b>{fmt(active.card)}</b></div><div><QrCode/><span>IDRAM / QR</span><b>{fmt(active.qr)}</b></div><div><ReceiptText/><span>Открытие кассы</span><b>{fmt(active.openingCash)}</b></div></div></section><section className="shift-card close-card"><div><span className="section-kicker">Закрытие смены</span><h3>Ожидаемые наличные: {fmt(expected)}</h3><p>Можно пересчитать кассу и указать фактическую сумму. Разница сохранится в отчёте смены.</p></div><label>Фактически в кассе<input inputMode="numeric" value={closingCash} onChange={e=>setClosingCash(e.target.value.replace(/[^0-9]/g,''))} placeholder={String(expected)}/></label><button className="shift-close" disabled={busy} onClick={finish}><LockKeyhole/> Закрыть смену</button></section></>}{history.length>0&&<section className="shift-card history-card"><span className="section-kicker">Последние смены</span>{history.slice(0,8).map(s=><div className="history-row" key={s.id}><div><b>Смена №{s.number}</b><span>{dt(s.openedAt)} → {dt(s.closedAt)}</span></div><div><strong>{fmt(s.gross)}</strong><small>{s.salesCount} чеков · разница {fmt(s.cashDifference)}</small></div></div>)}</section>}</main></div>;
}
