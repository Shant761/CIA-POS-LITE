import React,{useEffect,useState}from'react';
import{Search,X,Check}from'lucide-react';
import{loadAtgClassifier,searchAtg}from'./services/atgClassifier';
import'./atg-picker.css';

export default function AtgPicker({value='',onSelect,onClose}){
 const[query,setQuery]=useState(value||''),[items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let alive=true;loadAtgClassifier().then(()=>{if(!alive)return;setLoading(false);setItems(searchAtg(value||'',30))}).catch(e=>{if(alive){setLoading(false);setError(e.message||'Не удалось загрузить классификатор ԱՏԳԱԱ')}});return()=>{alive=false}},[]);
 const change=e=>{const q=e.target.value;setQuery(q);setItems(searchAtg(q,30))};
 return <div className="atg-picker-bg" onMouseDown={e=>{if(e.target===e.currentTarget)onClose?.()}}><div className="atg-picker"><div className="atg-picker-head"><div><span>ԱՏԳԱԱ</span><h3>Классификатор товаров</h3></div><button type="button" onClick={onClose}><X/></button></div><div className="atg-picker-search"><Search/><input autoFocus value={query} onChange={change} placeholder="Код или название, например 2202 или ջուր"/></div>{loading?<div className="atg-picker-state">Загрузка классификатора…</div>:error?<div className="atg-picker-state error">{error}</div>:<div className="atg-picker-list">{items.length?items.map(item=><button type="button" key={item.code} className={'atg-picker-item '+(String(value)===item.code?'selected':'')} onClick={()=>onSelect?.(item)}><strong>{item.code}</strong><span>{item.name}</span>{String(value)===item.code&&<Check/>}</button>):<div className="atg-picker-state">Ничего не найдено</div>}</div>}</div></div>;
}
