export const PAYMENT_METHODS=['cash','card','qr'];

export function updatePaymentSplit(current,method,rawAmount,total){
 if(!PAYMENT_METHODS.includes(method))throw new Error('Неизвестный способ оплаты.');
 const limit=Math.max(0,Number(total)||0);
 const amount=Math.max(0,Math.min(limit,Number(String(rawAmount).replace(/\\D/g,''))||0));
 const remainder=limit-amount;
 const otherMethods=PAYMENT_METHODS.filter(key=>key!==method&&Number(current?.[key]||0)>0);
 const counterpart=otherMethods.length===1?otherMethods[0]:(method==='cash'?'card':'cash');
 return {cash:0,card:0,qr:0,[method]:amount,[counterpart]:remainder};
}

export function isPaymentSplitValid(payments,total){
 const values=PAYMENT_METHODS.map(key=>Number(payments?.[key]||0));
 const count=values.filter(value=>value>0).length;
 const sum=values.reduce((acc,value)=>acc+value,0);
 return count>=1&&count<=2&&values.every(Number.isFinite)&&values.every(value=>value>=0)&&Math.abs(sum-Number(total||0))<0.001;
}
