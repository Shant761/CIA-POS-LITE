const CASHIERS_KEY='cia-pos-cashiers';
const SESSION_KEY='cia-pos-cashier-session';
const DEFAULT_CASHIERS=[{id:'admin',name:'Администратор',role:'admin',pin:'1234',active:true}];
const read=(key,f)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??f}catch{return f}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
export const getCashiers=()=>{const list=read(CASHIERS_KEY,null);if(Array.isArray(list)&&list.length)return list;write(CASHIERS_KEY,DEFAULT_CASHIERS);return DEFAULT_CASHIERS};
export const getCashierSession=()=>read(SESSION_KEY,null);
export function loginCashier(pin){const cashier=getCashiers().find(x=>x.active!==false&&String(x.pin)===String(pin));if(!cashier)return null;const session={id:cashier.id,name:cashier.name,role:cashier.role||'cashier',loggedAt:new Date().toISOString()};write(SESSION_KEY,session);window.dispatchEvent(new Event('cia-pos-cashier-changed'));return session}
export function logoutCashier(){localStorage.removeItem(SESSION_KEY);window.dispatchEvent(new Event('cia-pos-cashier-changed'))}
export function saveCashier(data){const list=getCashiers(),id=data.id||`cashier-${Date.now()}`,next={id,name:String(data.name||'Кассир').trim(),role:data.role||'cashier',pin:String(data.pin||'').replace(/\D/g,'').slice(0,4),active:data.active!==false};if(next.pin.length!==4)throw new Error('PIN должен состоять из 4 цифр');const out=list.some(x=>x.id===id)?list.map(x=>x.id===id?next:x):[...list,next];write(CASHIERS_KEY,out);return next}
