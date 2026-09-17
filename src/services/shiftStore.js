import{recordStockSale}from'./stockStore';

const ACTIVE_KEY='cia-pos-active-shift';
const HISTORY_KEY='cia-pos-shift-history';

const readJson=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
const writeJson=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const uid=prefix=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const money=value=>{const n=Number(value);if(!Number.isFinite(n)||n<0)throw new Error('Некорректная сумма.');return n};

export function getActiveShift(){return readJson(ACTIVE_KEY,null)}
export function getShiftHistory(){return readJson(HISTORY_KEY,[])}

export function openShift({cashier='Касса №1',openingCash=0}={}){
 const current=getActiveShift();
 if(current?.status==='open')return current;
 const shift={
  id:uid('SHIFT'),
  number:Number(localStorage.getItem('cia-pos-shift-seq')||0)+1,
  status:'open',cashier,openingCash:Number(openingCash||0),openedAt:new Date().toISOString(),
  salesCount:0,gross:0,cash:0,card:0,qr:0,mixed:0,refunds:0,refundAmount:0,sales:[]
 };
 localStorage.setItem('cia-pos-shift-seq',String(shift.number));
 writeJson(ACTIVE_KEY,shift);
 return shift;
}

export function recordSale({total=0,subtotal=0,serviceRate=0,serviceAmount=0,discount=0,paymentType='cash',payments=null,mode='shop',items=[],tableId=null}={}){
 const shift=getActiveShift();
 if(!shift||shift.status!=='open')throw new Error('Смена закрыта. Сначала откройте смену.');
 const amount=money(total),parts=payments||{[paymentType]:amount};
 const normalized={cash:money(parts.cash||0),card:money(parts.card||0),qr:money(parts.qr||0)};
 if(Math.abs(Object.values(normalized).reduce((s,v)=>s+v,0)-amount)>0.001)throw new Error('Сумма способов оплаты должна совпадать с итогом чека.');
 const sale={id:uid('SALE'),createdAt:new Date().toISOString(),subtotal:money(subtotal),serviceRate:money(serviceRate),serviceAmount:money(serviceAmount),discount:money(discount),total:amount,paymentType,payments:normalized,mode,tableId,items:items.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price}))};
 const next={...shift,salesCount:shift.salesCount+1,gross:shift.gross+amount,cash:shift.cash+normalized.cash,card:shift.card+normalized.card,qr:shift.qr+normalized.qr,mixed:paymentType==='mixed'?(shift.mixed||0)+amount:shift.mixed||0,sales:[...shift.sales,sale]};
 writeJson(ACTIVE_KEY,next);
 recordStockSale({items:sale.items,reference:sale.id,mode:sale.mode,tableId:sale.tableId});
 return next;
}

export function closeShift({closingCash=null}={}){
 const shift=getActiveShift();
 if(!shift||shift.status!=='open')throw new Error('Нет открытой смены.');
 const expectedCash=Number(shift.openingCash||0)+Number(shift.cash||0)-Number(shift.refundAmount||0);
 const actual=closingCash===null||closingCash===''?expectedCash:Number(closingCash);
 const closed={...shift,status:'closed',closedAt:new Date().toISOString(),expectedCash,closingCash:actual,cashDifference:actual-expectedCash};
 const history=getShiftHistory();
 writeJson(HISTORY_KEY,[closed,...history]);
 localStorage.removeItem(ACTIVE_KEY);
 return closed;
}
