(()=>{"use strict";
const KEY="som-pack-open-revealed-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=s=>String(s||"").replace(/\\s+/g," ").trim();
function parseGrades(){
  const out=[], seen=new Set();
  const rows=[...document.querySelectorAll("tr,[role=row]")];
  for(const row of rows){
    const t=norm(row.innerText); if(!t)continue;
    const m=t.match(/(^|\\s)([1-9](?:[.,]\\d{1,2})?|10(?:[.,]0{1,2})?)(?=\\s|$)/);
    if(!m)continue;
    const grade=m[2].replace(",",".");
    if(Number(grade)<1||Number(grade)>10)continue;
    const cells=[...row.querySelectorAll("th,td,[role=cell]")].map(x=>norm(x.innerText)).filter(Boolean);
    const subject=cells.find(x=>!/^([1-9](?:[.,]\\d{1,2})?|10(?:[.,]0{1,2})?)$/.test(x)&&x.length<80)||"Cijfer";
    const weight=(t.match(/(?:weging|weight)\\s*[:\\-]?\\s*(\\d+(?:[.,]\\d+)?)/i)||[])[1]||cells.find(x=>/^(?:[1-9]|10)(?:[.,]\\d+)?x$/i.test(x))||"1";
    const id=btoa(unescape(encodeURIComponent(subject+"|"+grade+"|"+weight+"|"+t))).replace(/=+$/,"");
    if(!seen.has(id)){seen.add(id);out.push({id,subject,grade,weight});}
  }
  if(!out.length){
    const text=document.body.innerText||"";
    for(const m of text.matchAll(/([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ &'/-]{2,40})\\s+(?:weging\\s*)?([1-9](?:[.,]\\d{1,2})?|10(?:[.,]0{1,2})?)(?:\\s*(?:weging|x)\\s*(\\d+(?:[.,]\\d+)?))?/gi)){
      const subject=norm(m[1]); const grade=m[2].replace(",","."); if(Number(grade)>10)continue;
      const weight=m[3]||"1"; const id=btoa(unescape(encodeURIComponent(subject+"|"+grade+"|"+weight))).replace(/=+$/,"");
      if(!seen.has(id)){seen.add(id);out.push({id,subject,grade,weight});}
    }
  }
  return out;
}
async function getRevealed(){return (await chrome.storage.local.get(KEY))[KEY]||{}}
async function saveRevealed(id){const r=await getRevealed();r[id]=true;await chrome.storage.local.set({[KEY]:r});}
function inject(){
 if(document.getElementById("sompo-root"))return;
 const root=document.createElement("div");root.id="sompo-root";root.innerHTML='<div class="sompo-backdrop"></div><section class="sompo-app"><header><b>SOM <i>PACK OPENER</i></b><button id="sompo-close">×</button></header><main id="sompo-main"></main></section>';
 document.body.appendChild(root);root.querySelector("#sompo-close").onclick=()=>root.remove();render();
}
async function render(){
 const main=document.querySelector("#sompo-main"); if(!main)return;
 const grades=parseGrades(), rev=await getRevealed();
 main.innerHTML='<div class="sompo-title"><small>YOUR GRADES</small><h1>PACKS</h1><p>Elke score kan één keer worden onthuld.</p></div><div class="sompo-grid">'+(grades.length?grades.map(g=>'<article class="sompo-card '+(rev[g.id]?"revealed":"")+'"><div class="card-glow"></div><div class="card-sub">'+esc(g.subject)+'</div><div class="blur-grade">'+(rev[g.id]?esc(g.grade):"??")+'</div><div class="card-meta">WEGING <strong>'+esc(g.weight)+'×</strong></div>'+(rev[g.id]?'<div class="opened">ONTHULD</div>':'<button data-id="'+esc(g.id)+'">ONTHUL</button>')+'</article>').join(""):'<div class="empty">Geen cijfers gevonden. Open in Somtoday de pagina met je cijfers en probeer opnieuw.</div>')+'</div>';
 main.querySelectorAll("button[data-id]").forEach(b=>b.onclick=()=>reveal(grades.find(g=>g.id===b.dataset.id)));
}
async function reveal(g){
 await saveRevealed(g.id);
 const main=document.querySelector("#sompo-main");
 main.innerHTML='<div class="reveal-stage"><div class="pack" id="pack"><div class="pack-shine"></div><span>SOM</span><strong>PACK</strong></div><div class="reveal-copy">OPENING...</div></div>';
 setTimeout(()=>{main.innerHTML='<div class="final-stage"><div class="final-card"><div class="fc-top">SOM • SPECIAL GRADE</div><div class="final-grade">'+esc(g.grade)+'</div><div class="final-subject">'+esc(g.subject)+'</div><div class="final-info"><span>WEGING <b>'+esc(g.weight)+'×</b></span><span>CIJFER <b>'+esc(g.grade)+'</b></span></div></div><button class="continue">TERUG NAAR PACKS</button></div>';main.querySelector(".continue").onclick=render},2400);
}
chrome.runtime?.onMessage?.addListener(m=>{if(m?.type==="open")inject()});
window.addEventListener("keydown",e=>{if(e.key==="Escape")document.getElementById("sompo-root")?.remove()});
})();