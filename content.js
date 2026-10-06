(()=>{"use strict";
const KEY="som-pack-open-revealed-v2",ROOT="sompo-overlay";
const text=e=>(e?.innerText||e?.textContent||"").replace(/\s+/g," ").trim();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const gradeRx=/^(10(?:[,.]0{1,2})?|[1-9](?:[,.]\d{1,2})?)$/;
const bad=/^(cijfer|resultaat|gemiddelde|rapport|vak|weging|datum|toets|onderwerp)$/i;
function gradeFrom(el){const raw=text(el).replace(/\s/g,"").replace(",",".");return gradeRx.test(raw)&&+raw>=1&&+raw<=10?raw:null}
function collect(){
 const found=[],seen=new Set();
 for(const el of [...document.querySelectorAll("td,[role=cell],button,a,span,div")]){
  if(el.children.length>2)continue; const g=gradeFrom(el); if(!g)continue;
  const box=el.closest("tr,[role=row],li,article")||el.parentElement; if(!box)continue;
  const parts=[...box.querySelectorAll("th,td,[role=cell]")].map(text).filter(Boolean);
  const subject=parts.find(x=>x.length>=2&&!bad.test(x)&&!gradeRx.test(x)&&x.length<80)||"Cijfer";
  const wm=text(box).match(/(?:weging|weight)\s*[:\-]?\s*(\d+(?:[,.]\d+)?)\s*x?/i);
  const weight=(wm?.[1]||parts.find(x=>/^\d+(?:[,.]\d+)?x$/i.test(x))||"1").replace(",",".");
  const key=[location.pathname,subject,g,weight,text(box).slice(0,250)].join("|");
  if(!seen.has(key)){seen.add(key);found.push({el,g,subject,weight,key})}
 }
 return found
}
async function revealed(){return (await chrome.storage.local.get(KEY))[KEY]||{}}
async function mark(k){const r=await revealed();r[k]=Date.now();await chrome.storage.local.set({[KEY]:r})}
async function enhance(){
 const r=await revealed();
 for(const item of collect()){
  if(item.el.dataset.sompo)continue; item.el.dataset.sompo="1";
  const wrap=document.createElement("span");wrap.className="sompo-grade-wrap";item.el.parentNode.insertBefore(wrap,item.el);wrap.appendChild(item.el);
  const cover=document.createElement("button");cover.className="sompo-reveal";cover.innerHTML="<span>✦</span><span>ONTHUL</span>";wrap.appendChild(cover);
  if(r[item.key]){cover.remove();item.el.classList.add("sompo-revealed")}
  else{item.el.classList.add("sompo-hidden");cover.onclick=()=>openReveal(item)}
 }
}
function openReveal(item){
 mark(item.key);
 document.getElementById(ROOT)?.remove();
 const root=document.createElement("div");root.id=ROOT;
 root.innerHTML='<div class="sompo-blackout"></div><div class="sompo-packscene"><div class="sompo-pack"><small>SOM</small><strong>PACK</strong><i></i></div><div class="sompo-opening">OPENING...</div></div>';
 document.body.appendChild(root);
 setTimeout(()=>{
  root.innerHTML='<div class="sompo-blackout"></div><div class="sompo-result"><div class="sompo-result-card"><div class="sompo-label">SPECIAL GRADE</div><div class="sompo-grade">'+esc(item.g)+'</div><div class="sompo-subject">'+esc(item.subject)+'</div><div class="sompo-details"><span>WEGING<b>'+esc(item.weight)+'×</b></span><span>CIJFER<b>'+esc(item.g)+'</b></span></div></div><button class="sompo-back">TERUG NAAR SOMTODAY</button></div>';
  root.querySelector(".sompo-back").onclick=()=>{root.remove();location.reload()}
 },2300)
}
enhance();
new MutationObserver(enhance).observe(document.body,{subtree:true,childList:true});
})();