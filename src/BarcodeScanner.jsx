import React,{useEffect,useRef,useState}from'react';
import{Camera,X,ScanLine}from'lucide-react';
import{getProducts}from'./services/productStore';

const WANTED=['ean_13','ean_8','upc_a','upc_e','code_128','code_39','itf'];

export default function BarcodeScanner({onDetected,onClose}){
 const videoRef=useRef(null),streamRef=useRef(null),timerRef=useRef(null),busyRef=useRef(false),detectedRef=useRef(false),onDetectedRef=useRef(onDetected),onCloseRef=useRef(onClose),[error,setError]=useState(''),[ready,setReady]=useState(false);
 useEffect(()=>{onDetectedRef.current=onDetected;onCloseRef.current=onClose},[onDetected,onClose]);
 useEffect(()=>{let alive=true;const stop=()=>{if(timerRef.current){clearInterval(timerRef.current);timerRef.current=null}streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null};
  const handleDetected=value=>{const normalized=String(value||'').trim();if(!normalized)return;const found=getProducts().find(p=>String(p.barcode||'').trim()===normalized);if(found){onDetectedRef.current?.(normalized);return}localStorage.setItem('cia-pos-pending-barcode',normalized);onCloseRef.current?.();setTimeout(()=>{const settingsButton=document.querySelector('.cia-topbar .top-icon');settingsButton?.click()},80)};
  (async()=>{try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Камера недоступна. Откройте CIA POS через HTTPS или Android-приложение.');
   if(!('BarcodeDetector'in globalThis))throw new Error('Сканер штрихкодов не поддерживается этим браузером.');
   const supported=await globalThis.BarcodeDetector.getSupportedFormats();const formats=WANTED.filter(x=>supported.includes(x));if(!formats.length)throw new Error('EAN/UPC сканирование не поддерживается на этом устройстве.');
   const detector=new globalThis.BarcodeDetector({formats});const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
   if(!alive){stream.getTracks().forEach(t=>t.stop());return}streamRef.current=stream;const video=videoRef.current;if(!video){stop();return}video.srcObject=stream;await video.play();if(!alive)return;setReady(true);
   timerRef.current=setInterval(async()=>{if(!alive||detectedRef.current||busyRef.current||!videoRef.current||videoRef.current.readyState<2)return;busyRef.current=true;try{const codes=await detector.detect(videoRef.current);const value=String(codes?.[0]?.rawValue||'').trim();if(value&&!detectedRef.current){detectedRef.current=true;stop();handleDetected(value)}}catch{}finally{busyRef.current=false}},220);
  }catch(e){if(alive){setReady(false);setError(e?.message||'Не удалось открыть камеру')}}})();
  return()=>{alive=false;stop()};
 },[]);
 return <div className="barcode-scanner-bg"><div className="barcode-scanner"><div className="barcode-scanner-head"><span><ScanLine/> Сканировать штрихкод</span><button type="button" onClick={onClose}><X/></button></div><div className="barcode-camera"><video ref={videoRef} playsInline muted autoPlay/><div className="barcode-frame"><i/><i/><i/><i/></div>{!ready&&!error&&<div className="barcode-camera-state"><Camera/>Открываем камеру…</div>}{error&&<div className="barcode-camera-state error">{error}</div>}</div><p>{error?'Закройте окно и проверьте разрешение камеры.':'Наведите камеру на EAN/UPC штрихкод товара'}</p></div></div>
}
