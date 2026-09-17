import React from'react';
import{LANGS,useLanguage}from'./services/i18n';

export default function LanguageSwitcher({compact=false,settings=false}){
 const{lang,setLang}=useLanguage();
 // Language selection belongs to Settings. Legacy placements in the POS header,
 // mode picker and product back office stay mounted in code but render nothing.
 if(!settings)return null;
 return <div className={'language-switcher '+(compact?'compact':'')} role="group" aria-label="Language">{LANGS.map(x=><button key={x.code} className={lang===x.code?'active':''} onClick={()=>setLang(x.code)}>{x.label}</button>)}</div>;
}
