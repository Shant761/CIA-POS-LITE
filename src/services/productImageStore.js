const DB_NAME='cia-pos-media-v1';
const STORE='product-images';
const openDb=()=>new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
const tx=(mode,fn)=>openDb().then(db=>new Promise((resolve,reject)=>{const t=db.transaction(STORE,mode),s=t.objectStore(STORE),r=fn(s);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);t.oncomplete=()=>db.close()}));
export const getProductImage=id=>id?tx('readonly',s=>s.get(id)):Promise.resolve(null);
export const putProductImage=(id,blob)=>tx('readwrite',s=>s.put(blob,id));
export const deleteProductImage=id=>id?tx('readwrite',s=>s.delete(id)):Promise.resolve();
export async function compressProductImage(file,{maxSize=512,quality=.74}={}){if(!file?.type?.startsWith('image/'))throw new Error('Выберите изображение.');const bitmap=await createImageBitmap(file),scale=Math.min(1,maxSize/Math.max(bitmap.width,bitmap.height)),w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale)),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(bitmap,0,0,w,h);bitmap.close?.();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));if(!blob)throw new Error('Не удалось сжать фото.');return blob;}
export const blobUrl=blob=>blob?URL.createObjectURL(blob):null;
