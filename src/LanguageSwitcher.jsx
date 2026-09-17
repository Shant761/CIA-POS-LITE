import React from'react';
import{LANGS,useLanguage}from'./services/i18n';
export default function LanguageSwitcher({compact=false}){const{lang,setLang}=useLanguage();return <div className={'language-switcher '+(compact?'compact':'')} role="group" aria-label="Language">{LANGS.map(x=><button key={x.code} className={lang===x.code?'active':''} onClick={()=>setLang(x.code)}>{x.label}</button>)}</div>}
