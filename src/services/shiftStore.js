const ACTIVE_KEY='cia-pos-active-shift';
const HISTORY_KEY='cia-pos-shift-history';

const readJson=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
const writeJson=(key,value)=>localStorage.setItem(key,JSON.stringify(value));

export function getActiveShift(){return readJson(ACTIVE_KEY,null)}
export function getShiftHistory(){return readJson(HISTORY_KEY,[])}

export function openShift({cashier='Касса №1',openingCash=0}={}){
 const current=getActiveShift();
 if(current?.status==='open')return current;
 const shift={
  id:`SHIFT-${Date.now()}`,
  number:Number(localStorage.getItem('cia-pos-shift-seq')||0)+1,
  status:'open',cashier,openingCash:Number(openingCash||0),openedAt:new Date().toISOString(),
  salesCount:0,gross:0,cash:0,card:0,qr:0,mixed:0,refunds:0,refundAmount:0,sales:[]
 };
 localStorage.setItem('cia-pos-shift-seq',String(shift.number));
 writeJson(ACTIVE_KEY,shift);
 return shift;
}

export function recordSale({total=0,paymentType='cash',mode='shop',items=[],tableId=null}={}){
 const shift=getActiveShift();
 if(!shift||shift.status!=='open')throw new Error('Смена закрыта. Сначала откройте смену.');
 const amount=Number(total||0);
 const sale={id:`SALE-${Date.now()}`,createdAt:new Date().toISOString(),total:amount,paymentType,mode,tableId,items:items.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price}))};
 const next={...shift,salesCount:shift.salesCount+1,gross:shift.gross+amount,[paymentType]:(shift[paymentType]||0)+amount,sales:[...shift.sales,sale]};
 writeJson(ACTIVE_KEY,next);
 return next;
}

export function closeShift({closingCash=null}={}){
 const shift=getActiveShift();
 if(!shift||shift.status!=='open')throw new Error('Нет открытой смены.');
 const expectedCash=Number(shift.openingCash||0)+Number(shift.cash||0)-Number(shift.refundAmount||0);
 const actual=closingCash===null||closingCash===''?expectedCash:Number(closingCash);
 const closed={...shift,status:'closed',closedAt:new Date().toISOString(),expectedCash,closingCash:actual,cashDifference:actual-expectedCash};
 const history=getShiftHistory();
 writeJson(HISTORY_KEY,[closed,...history].slice(0,120));
 localStorage.removeItem(ACTIVE_KEY);
 return closed;
}
