const SOLD_KEY='cia-pos-sold-datamatrix';
const read=(key,f=[])=>{try{return JSON.parse(localStorage.getItem(key)||'null')??f}catch{return f}};
const write=(key,v)=>localStorage.setItem(key,JSON.stringify(v));
const clean=v=>String(v??'').replace(/^\uFEFF/,'').trim();
export const getSoldMarks=()=>read(SOLD_KEY,[]);
export const isMarkSold=code=>getSoldMarks().some(x=>x.code===clean(code));
export function getMarkingNeed(items=[]){return items.filter(i=>i.markingRequired).map(i=>({productId:i.id,productName:i.name,required:Number(i.qty)||0,codes:Array.isArray(i.markingCodes)?i.markingCodes:[]}));}
export function getMissingMarkCount(items=[]){return getMarkingNeed(items).reduce((sum,i)=>sum+Math.max(0,i.required-i.codes.length),0)}
export function addMarkToCart(cart,productId,rawCode){const code=clean(rawCode);if(!code)throw new Error('Data Matrix пустой');if(isMarkSold(code))throw new Error('Этот Data Matrix уже был продан');const all=Object.values(cart||{}).flatMap(i=>i.markingCodes||[]);if(all.includes(code))throw new Error('Этот Data Matrix уже добавлен в чек');const item=cart?.[productId];if(!item||!item.markingRequired)throw new Error('Товар не требует Data Matrix');const codes=[...(item.markingCodes||[])];if(codes.length>=Number(item.qty||0))throw new Error('Все единицы товара уже промаркированы');codes.push(code);return{...cart,[productId]:{...item,markingCodes:codes}}}
export function trimMarksToQty(item){if(!item?.markingRequired)return item;return{...item,markingCodes:(item.markingCodes||[]).slice(0,Math.max(0,Number(item.qty)||0))}}
export function commitSoldMarks(items=[],saleReference=''){const now=new Date().toISOString(),sold=getSoldMarks(),existing=new Set(sold.map(x=>x.code)),rows=[];for(const item of items.filter(i=>i.markingRequired)){const codes=item.markingCodes||[];if(codes.length!==Number(item.qty||0))throw new Error(`${item.name}: Data Matrix ${codes.length}/${item.qty}`);for(const code of codes){if(existing.has(code))throw new Error(`Data Matrix уже продан: ${code}`);existing.add(code);rows.push({code,productId:item.id,productName:item.name,saleReference,createdAt:now})}}write(SOLD_KEY,[...rows,...sold].slice(0,20000));return rows}
