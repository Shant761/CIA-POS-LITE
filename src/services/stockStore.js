const MOVEMENTS_KEY='cia-pos-stock-movements';
const SUPPLIES_KEY='cia-pos-supplies';
const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const uid=prefix=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
export const getMovements=()=>read(MOVEMENTS_KEY);
export const getSupplies=()=>read(SUPPLIES_KEY);
export const getStockMap=()=>getMovements().reduce((acc,m)=>{acc[m.productId]=(acc[m.productId]||0)+Number(m.qty||0);return acc},{});
export const getStock=productId=>Number(getStockMap()[productId]||0);
export function addMovement({productId,productName='',type,qty,purchasePrice=0,reference='',comment=''}){const movement={id:uid('mov'),createdAt:new Date().toISOString(),productId,productName,type,qty:Number(qty)||0,purchasePrice:Number(purchasePrice)||0,reference,comment};const list=[movement,...getMovements()];write(MOVEMENTS_KEY,list);window.dispatchEvent(new Event('cia-pos-stock-changed'));return movement}
export function createSupply({supplier='',documentNo='',items=[]}){if(!items.length)throw new Error('Добавьте товары в поставку');const id=uid('sup'),createdAt=new Date().toISOString();const normalized=items.map(i=>({...i,qty:Number(i.qty)||0,purchasePrice:Number(i.purchasePrice)||0})).filter(i=>i.productId&&i.qty>0);if(!normalized.length)throw new Error('Укажите количество');const total=normalized.reduce((s,i)=>s+i.qty*i.purchasePrice,0);const supply={id,createdAt,supplier: supplier.trim(),documentNo:documentNo.trim()||id,items:normalized,total,status:'posted'};write(SUPPLIES_KEY,[supply,...getSupplies()]);normalized.forEach(i=>addMovement({productId:i.productId,productName:i.productName,type:'SUPPLY',qty:i.qty,purchasePrice:i.purchasePrice,reference:supply.documentNo,comment:supplier}));return supply}
export function adjustStock(product,desired,comment='Инвентаризация'){const current=getStock(product.id),delta=Number(desired)-current;if(!delta)return null;return addMovement({productId:product.id,productName:product.name,type:'ADJUSTMENT',qty:delta,reference:'inventory',comment})}
