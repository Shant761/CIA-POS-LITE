import test from 'node:test';
import assert from 'node:assert/strict';

class MemoryStorage {
  constructor(){this.data=new Map()}
  getItem(key){return this.data.get(key)??null}
  setItem(key,value){this.data.set(key,String(value))}
  removeItem(key){this.data.delete(key)}
  clear(){this.data.clear()}
}

globalThis.localStorage=new MemoryStorage();
const store=await import('../src/services/shiftStore.js');

test.beforeEach(()=>localStorage.clear());

test('mixed payment allocates cash and card correctly',()=>{
  store.openShift({openingCash:100});
  store.recordSale({total:1100,subtotal:1000,serviceRate:10,serviceAmount:100,paymentType:'mixed',payments:{cash:500,card:600,qr:0},items:[]});
  const shift=store.closeShift({closingCash:600});
  assert.equal(shift.cash,500);
  assert.equal(shift.card,600);
  assert.equal(shift.expectedCash,600);
  assert.equal(shift.cashDifference,0);
  assert.equal(shift.sales[0].serviceAmount,100);
});

test('rejects a payment split that does not equal the receipt total',()=>{
  store.openShift();
  assert.throws(()=>store.recordSale({total:1000,paymentType:'mixed',payments:{cash:200,card:700}}),/совпадать/);
});

test('keeps history beyond 120 shifts',()=>{
  for(let i=0;i<121;i++){store.openShift();store.closeShift()}
  assert.equal(store.getShiftHistory().length,121);
});
