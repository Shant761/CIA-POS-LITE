import React,{useEffect,useRef,useState}from'react';
import{Camera,X,ScanLine}from'lucide-react';

const WANTED=['ean_13','ean_8','upc_a','upc_e','code_128','code_39','itf'];

export default function BarcodeScanner({onDetected,onClose}){
 const videoRef=useRef(null),streamRef=useRef(null),timerRef=useRef(null),busyRef=useRef(false),[error,setError]=useState(''),[ready,setReady]=useState(false);
 useEffect(()=>{let alive=true;const stop=()=>{if(timerRef.current)clearInterval(timerRef.current);streamRef.current?.getTracks().forEach(t=>t.stop())};(async()=>{try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Камера недоступна');
   if(!('BarcodeDetector'in globalThis))throw new Error('Сканер штрихкодов не поддерживается этим браузером');
   const supported=await globalThis.BarcodeDetector.getSupportedFormats();const formats=WANTED.filter(x=>supported.includes(x));if(!formats.length)throw new Error('EAN/UPC сканирование не поддерживается');
   const detector=new globalThis.BarcodeDetector({formats});const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});if(!alive){stream.getTracks().forEach(t=>t.stop());return}streamRef.current=stream;const video=videoRef.current;video.srcObject=stream;await video.play();setReady(true);
   timerRef.current=setInterval(async()=>{if(busyRef.current||video.readyState<2)return;busyRef.current=true;try{const codes=await detector.detect(video);const value=String(codes?.[0]?.rawValue||'').trim();if(value){stop();onDetected(value)}}catch{}finally{busyRef.current=false}},180);
  }catch(e){setError(e?.message||'Не удалось открыть камеру')}})();return()=>{alive=false;stop()}},[onDetected]);
 return <div className="barcode-scanner-bg"><div className="barcode-scanner"><div className="barcode-scanner-head"><span><ScanLine/> Сканировать штрихкод</span><button onClick={onClose}><X/></button></div><div className="barcode-camera"><video ref={videoRef} playsInline muted/><div className="barcode-frame"><i/><i/><i/><i/></div>{!ready&&!error&&<div className="barcode-camera-state"><Camera/>Открываем камеру…</div>}{error&&<div className="barcode-camera-state error">{error}</div>}</div><p>Наведите камеру на EAN/UPC штрихкод товара</p></div></div>
}
