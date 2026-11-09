const SEP="     ·     ";
const unit=POEMS.map(p=>`${p[0]} — ${p[1]}`.toLowerCase()).join(SEP)+SEP;

// ---------- one continuous line round the whole frame ----------
const ring=document.getElementById('ring'),loop=document.getElementById('loop'),crawl=document.getElementById('crawl'),measure=document.getElementById('measure');
// each poem is its own piece of the line, so a click lands on the right one in every browser
{const pieces=POEMS.map((q,k)=>`<tspan data-k="${k}">${`${q[0]} — ${q[1]}`.toLowerCase().replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</tspan><tspan>${SEP}</tspan>`).join('');
 crawl.innerHTML=pieces+pieces}
measure.textContent=unit;
let unitLen=0,off=0,last=0,started=false;
function frame(){
  const W=innerWidth,H=innerHeight,t=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--t'))||38,i=t/2,r=26;
  ring.setAttribute('viewBox',`0 0 ${W} ${H}`);
  loop.setAttribute('d',`M${i+r} ${i}H${W-i-r}A${r} ${r} 0 0 1 ${W-i} ${i+r}V${H-i-r}A${r} ${r} 0 0 1 ${W-i-r} ${H-i}H${i+r}A${r} ${r} 0 0 1 ${i} ${H-i-r}V${i+r}A${r} ${r} 0 0 1 ${i+r} ${i}Z`);
  unitLen=measure.getComputedTextLength();
  if(!started&&unitLen){started=true;off=Math.random()*unitLen}
}
let paused=false;
function tick(ts){
  if(last&&unitLen&&!paused){off=(off+(ts-last)*.03)%unitLen;crawl.setAttribute('startOffset',-off)}
  last=ts;requestAnimationFrame(tick);
}

// ---------- the knotted cords ----------
const FILL=["#D1A877","#F3EEE2","#D9A441","#E58AA9","#C9714F","#B6B2FF","#93C24A","#D1A877","#F6CE1D","#F3EEE2"];
const branch=document.getElementById('branch'),scene=document.getElementById('scene'),card=document.getElementById('card');
const reduce=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
function rng(seed){return()=>((seed=Math.imul(seed^seed>>>15,seed|1)^seed+Math.imul(seed^seed>>>7,seed|61),(seed^seed>>>14)>>>0)/4294967296)}
const f=p=>p[0].toFixed(1)+' '+p[1].toFixed(1);

// a painted cord: a wavy centre line with a pressure profile that thins toward the end
function cordPath(pt,w){
  const N=40,lt=[],rt=[];let tip;
  for(let k=0;k<=N;k++){const t=k/N,[cx,cy]=pt(t),[ax,ay]=pt(Math.min(1,t+.01)),[bx,by]=pt(Math.max(0,t-.01));
    let dx=ax-bx,dy=ay-by;const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;
    const hw=w/2*(1-.65*Math.pow(t,2))+.5;lt.push([cx-dy*hw,cy+dx*hw]);rt.push([cx+dy*hw,cy-dx*hw]);tip=[cx,cy]}
  return 'M'+lt.map(f).join('L')+'L'+f(tip)+'L'+rt.reverse().map(f).join('L')+'Z';
}
// the main cord: heavy at the tag, thinning to the left, with a twist drawn over it
function mainCord(W){
  const N=50,top=[],bot=[],mid=[];
  for(let k=0;k<=N;k++){const t=k/N,x=W-W*t,y=Math.sin(t*4.6)*3+t*6,hw=(13*(1-.6*t)+1)/2;top.push([x,y-hw]);bot.push([x,y+hw]);mid.push([x,y,hw])}
  let twist='';for(let k=0;k<N;k++){const [x,y,hw]=mid[k];twist+=`M${(x-hw*.6).toFixed(1)} ${(y+hw*.85).toFixed(1)}L${(x+hw*.6).toFixed(1)} ${(y-hw*.85).toFixed(1)}`}
  return {body:'M'+top.map(f).join('L')+'L'+bot.reverse().map(f).join('L')+'Z',twist};
}

let open=-1;
function draw(){
  const W=branch.clientWidth,H=branch.clientHeight;if(!W||!H)return;
  const narrow=W<520,r=rng(17),n=narrow?10:Math.max(14,Math.round(W/30)),gap=W/(n+.4);
  const slots=[...new Set((narrow?[.16,.37,.58,.79,.98]:[.32,.47,.62,.78,.94]).map(q=>Math.round(q*(n-1))))];
  const rows=[.2,.42,.64].map(q=>q*H); // knot rows sit at the same height on every cord, as on a khipu
  let s=`<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Projects">`;
  for(let i=0;i<n;i++){
    const x=gap*(i+.6)+(r()-.5)*gap*.3,p=slots.indexOf(i),isP=p>=0;
    const w=isP?(narrow?7:9)+r()*2:(narrow?3.5:4.5)+r()*3;
    const L=isP?H*(.74+r()*.1):H*(.42+r()*.42);
    const amp=4+r()*9,ph=r()*6.28,drift=(r()-.4)*16;
    const pt=t=>[x+drift*Math.pow(t,1.3)+Math.sin(t*Math.PI*1.6+ph)*amp*t,L*t];
    const col=isP?PROJ[p].c:FILL[i%FILL.length];
    let knots='';
    rows.forEach((y,ri)=>{ if(y>L-14)return;
      const count=ri===2?1:Math.floor(r()*(isP?5:4));
      for(let k=0;k<count;k++){const yy=y+k*(w+4),[kx]=pt(yy/L);
        knots+=ri===2&&!k?`<ellipse cx="${kx.toFixed(1)}" cy="${(yy+6).toFixed(1)}" rx="${(w*.95).toFixed(1)}" ry="${(w*2.2).toFixed(1)}"/>`
                         :`<circle cx="${kx.toFixed(1)}" cy="${yy.toFixed(1)}" r="${(w*.95).toFixed(1)}"/>`}
    });
    const [tx,ty]=pt(1);
    const style=`transform-origin:${x.toFixed(1)}px 0px`;
    const body=`<path d="${cordPath(pt,w)}" fill="${col}" filter="url(#brushV)"/><g fill="${col}" filter="url(#brushV)">${knots}</g>`;
    if(isP){const q=PROJ[p];
      s+=`<g class="cord proj" data-p="${p}" style="${style}" role="button" tabindex="0" aria-label="${q.name}, ${q.med}. Open.">
        <path d="${cordPath(pt,30)}" fill="transparent"/>${body}
        <text class="lab" x="${tx.toFixed(1)}" y="${(ty+26+(narrow&&p%2?20:0)).toFixed(1)}" text-anchor="middle" font-family="EB Garamond,Garamond,serif" font-style="italic" font-weight="500" font-size="${narrow?16:20}" fill="${q.c}">${q.name.toLowerCase()}</text></g>`;
    }else{
      s+=`<g class="cord" style="${style}" opacity="${(.6+r()*.35).toFixed(2)}" aria-hidden="true">${body}</g>`;
    }
  }
  const m=mainCord(W);
  s+=`<g class="main"><path d="${m.body}" fill="#D9A441" filter="url(#brushH)"/><path d="${m.twist}" stroke="#9C6F22" stroke-width="1.6" opacity=".55" fill="none"/>
      <circle cx="${W-14}" cy="2" r="13" fill="#D9A441" filter="url(#brushV)"/><circle cx="${W-2}" cy="6" r="8" fill="#D9A441" filter="url(#brushV)"/></g></svg>`;
  branch.innerHTML=s;
  branch.querySelectorAll('.proj').forEach(g=>{
    g.addEventListener('click',()=>pick(+g.dataset.p,g));
    g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(+g.dataset.p,g)}});
  });
  if(open>=0){scene.classList.add('focus');const g=branch.querySelector(`.proj[data-p="${open}"]`);g&&g.classList.add('sel')}
}
function pick(p,g){
  if(open===p){close();return}
  branch.querySelectorAll('.cord').forEach(b=>b.classList.remove('sel'));
  g.classList.add('sel','shake');setTimeout(()=>g.classList.remove('shake'),720);
  open=p;scene.classList.add('focus');const q=PROJ[p];
  card.style.setProperty('--k',q.c);
  card.innerHTML=`<h2>${q.name}</h2><div class="med">${q.med}, 2026</div><span class="dot"></span><p>${q.pitch}</p>${q.live?`<a class="live${q.wide?' stack':''}" href="${q.live}" target="_blank" rel="noopener">${q.shot?`<span class="ph shot${q.wide?' wide':''}"><img src="${q.shot}" alt="The ${q.name} home screen"></span>`:`<span class="ph"><i></i><b>live</b></span>`}<span class="lt">${q.liveLabel||'Open the live prototype'}<small>${q.live.replace(/^https?:\/\//,'').replace(/\/$/,'')} ↗</small></span></a>`:''}
    <div class="row"><span class="st">${q.status}</span><button id="back">put it back</button></div>`;
  card.hidden=false;requestAnimationFrame(()=>card.classList.add('show'));
  document.getElementById('back').onclick=close;
}
function close(){
  const was=open;open=-1;scene.classList.remove('focus');card.classList.remove('show');
  branch.querySelectorAll('.cord').forEach(b=>b.classList.remove('sel'));
  setTimeout(()=>{if(open<0){card.hidden=true;card.innerHTML=''}},reduce()?0:460);
  const g=branch.querySelector(`.proj[data-p="${was}"]`);g&&g.focus({preventScroll:true});
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open>=0)close()});
scene.addEventListener('click',e=>{if(open>=0&&!e.target.closest('.proj')&&!e.target.closest('.card'))close()});

new ResizeObserver(()=>draw()).observe(branch);
draw();frame();
addEventListener('resize',frame);
// ---------- click a poem in the crawl to read it whole ----------
const crawlText=document.getElementById('crawlText'),poemCard=document.getElementById('poem');
const starts=[];{let n=0;POEMS.forEach(p=>{starts.push(n);n+=`${p[0]} — ${p[1]}`.length+SEP.length})}
let hovering=false;
crawlText.addEventListener('pointerenter',()=>{hovering=true;paused=true});
crawlText.addEventListener('pointerleave',()=>{hovering=false;paused=!poemCard.hidden});
crawlText.addEventListener('click',e=>{
  let el=e.target.closest&&e.target.closest('tspan[data-k]');
  if(!el){const pt=ring.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const hit=document.elementFromPoint(e.clientX,e.clientY);el=hit&&hit.closest&&hit.closest('tspan[data-k]')}
  if(!el)return;
  showPoem(+el.dataset.k,e.clientX,e.clientY);
});
function showPoem(k,x,y){
  const q=FULL[k];
  // a poem can carry a recording: set "audio" to the file's address and a play button appears
  poemCard.innerHTML=`<button id="poemClose">close</button><h3 id="poemTitle">${q.t}</h3><div class="by">${q.a}</div>${q.audio?`<audio class="voice" controls preload="none" src="${q.audio}"></audio>`:''}${q.listen?`<a class="listen" href="${q.listen.href}" target="_blank" rel="noopener"><i></i>${q.listen.label} ↗</a>`:''}<p class="lines"></p>`;
  poemCard.querySelector('.lines').textContent=q.l.join('\n');
  poemCard.hidden=false;paused=true;
  const w=poemCard.offsetWidth,h=poemCard.offsetHeight,m=44;
  poemCard.style.left=Math.max(m,Math.min(innerWidth-w-m,x-w/2))+'px';
  poemCard.style.top=Math.max(m,Math.min(innerHeight-h-m,y<innerHeight/2?y+18:y-h-18))+'px';
  requestAnimationFrame(()=>poemCard.classList.add('show'));
  document.getElementById('poemClose').onclick=hidePoem;
  document.getElementById('poemClose').focus({preventScroll:true});
}
function hidePoem(){if(poemCard.hidden)return;const au=poemCard.querySelector('audio');au&&au.pause();poemCard.classList.remove('show');paused=hovering;setTimeout(()=>{if(!poemCard.classList.contains('show'))poemCard.hidden=true},reduce()?0:300)}
document.addEventListener('keydown',e=>{if(e.key==='Escape')hidePoem()});
document.addEventListener('pointerdown',e=>{if(!poemCard.hidden&&!poemCard.contains(e.target)&&e.target!==crawlText&&!crawlText.contains(e.target))hidePoem()});


// ---------- pages ----------
// Reading list: one line per book — title, author, spine colour, text colour, and Emma's one-line recommendation ("" until written).
// Spine colours follow a common edition of each book.
// first publication year; the shelf runs oldest to newest, then by author's surname
const surname=a=>(a||'').split(' ').slice(-1)[0];
BOOKS.sort((x,y)=>((YEAR[x[0]]||9999)-(YEAR[y[0]]||9999))||surname(x[1]).localeCompare(surname(y[1])));
const shelves=document.getElementById('shelves'),reading=document.getElementById('reading'),bkcard=document.getElementById('bkcard');
const STY=['','s-caps','s-it','s-bold','s-caps','','s-it'];
// soften each spine colour and give it a gentle top-to-bottom drift, like the Exit West spine
function mute(c){
  if(!/^#/.test(c))return c;
  let [r,g,b]=[1,3,5].map(k=>parseInt(c.slice(k,k+2),16)/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,sat=0,l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;sat=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}
  sat=sat*.62;l=.18+l*.7;
  const hsl=(hh,ss,ll)=>`hsl(${hh.toFixed(0)} ${(ss*100).toFixed(0)}% ${(Math.max(.06,Math.min(.92,ll))*100).toFixed(0)}%)`;
  return `linear-gradient(180deg,${hsl(h-6,sat*1.05,l+.06)},${hsl(h,sat,l)} 55%,${hsl(h+12,sat*.95,l-.07)})`;
}
const books=BOOKS.map((b,i)=>{const r=rng(31+i);return {thumb:(b[6]&&b[6].thumb)||'',t:b[0],a:b[1],c:mute(b[2]),tc:b[3],rec:b[4],link:b[5]||'',
  w:(.75+r()*.55).toFixed(2),h:Math.round(Math.min(100,70+(b[0].length+(b[1]?b[1].split(' ').slice(-1)[0].length:0))*.75+r()*6)),st:(b[6]&&b[6].st!==undefined)?b[6].st:STY[i%STY.length],ac:(b[6]&&b[6].ac)||'',r:((r()-.5)*1.1).toFixed(2),pm:r()<.5?'50%':'1px'}});
let shelfW=0;
function shelve(){
  const W=shelves.clientWidth;if(!W||W===shelfW)return;shelfW=W;
  // as many spines per shelf as fit at a real spine's width, so the books fill the shelf edge to edge
  const per=Math.max(5,Math.min(books.length,Math.floor(W/34))),rows=Math.ceil(books.length/per),size=Math.ceil(books.length/rows);
  const avail=document.getElementById('v-reading-list').clientHeight-shelves.offsetTop-90;
  shelves.style.setProperty('--per',size);
  const rowh=rows===1?Math.max(440,Math.min(600,avail)):Math.max(W<600?400:300,Math.min(460,Math.floor(avail/2)-34));
  shelves.style.setProperty('--rowh',rowh+'px');
  let html='';
  for(let r=0;r<rows;r++){const slice=books.slice(r*size,(r+1)*size);
    html+=`<div class="shelf">${slice.map((b,k)=>{const i=r*size+k;
      const last=k===slice.length-1&&r===rows-1;
      return `<button class="bk ${b.st}${last?' lean':''}" data-i="${i}" style="--w:${b.w};--h:${b.h}%;--c:${b.c};--tc:${b.tc};${b.ac?`--ac:${b.ac};`:''}--r:${b.r}deg;--pmr:${b.pm}${last?';margin-left:'+Math.round(rowh*b.h/100*.1)+'px':''}" aria-label="${b.t}${b.a?', '+b.a:''}">${b.a?`<span class="au">${b.a.split(' ').slice(-1)[0]}</span>`:'<span></span>'}<span class="ti">${b.t}</span><span class="pm"></span></button>`}).join('')}</div><div class="plank"></div>`}
  shelves.innerHTML=html;
  shelves.querySelectorAll('.bk').forEach(el=>{
    el.addEventListener('click',()=>pickBook(+el.dataset.i,el));
    const lean=on=>{const p=el.previousElementSibling,n=el.nextElementSibling;
      if(p)p.classList.toggle('nl',on);if(n&&!n.classList.contains('lean'))n.classList.toggle('nr',on)};
    el.addEventListener('pointerenter',()=>lean(true));el.addEventListener('pointerleave',()=>lean(false));
    el.addEventListener('focus',()=>lean(true));el.addEventListener('blur',()=>lean(false));
  });
}
let bookOpen=-1;
function pickBook(i,el){
  if(bookOpen===i){closeBook();return}
  shelves.querySelectorAll('.bk').forEach(x=>x.classList.toggle('sel',x===el));
  el.classList.add('pull');bookOpen=i;const b=books[i];
  setTimeout(()=>{if(bookOpen!==i)return;reading.classList.add('focus');
    bkcard.style.setProperty('--c',b.c);bkcard.style.setProperty('--tc',b.tc);
    bkcard.classList.remove('opened');
    bkcard.innerHTML=`<div class="bk3d"><div class="leaf pg">`+
      (b.rec?`<q${b.rec.length>120?' class="long"':''}>${b.rec}</q>`:`<q class="todo">Recommendation to come.</q>`)+
      (b.link?`<a class="vid" href="${b.link}" target="_blank" rel="noopener"><span class="scr${b.thumb?' th':''}"${b.thumb?` style="background-image:url(${b.thumb})"`:''}><i></i></span><span class="vt">Watch the video series<small>opens on YouTube ↗</small></span></a>`:'')+`<button id="bkClose">close the book</button></div>`+
      `<div class="leaf lid"><div class="face front"><h3>${b.t}</h3><p>${b.a||''}</p></div><div class="face inside"><h3>${b.t}</h3><p>${b.a||''}${YEAR[b.t]?` · ${YEAR[b.t]}`:''}</p></div></div></div>`;
    bkcard.hidden=false;requestAnimationFrame(()=>{bkcard.classList.add('show');setTimeout(()=>{if(bookOpen===i)bkcard.classList.add('opened')},reduce()?0:380)});
    document.getElementById('bkClose').onclick=closeBook;},reduce()?0:430);
}
function closeBook(){if(bookOpen<0)return;bookOpen=-1;bkcard.classList.remove('opened');
  const t=reduce()?0:850;setTimeout(()=>{if(bookOpen>=0)return;bkcard.classList.remove('show');reading.classList.remove('focus');
    shelves.querySelectorAll('.bk').forEach(x=>x.classList.remove('sel','pull','nl','nr'))},t);
  setTimeout(()=>{if(bookOpen<0)bkcard.hidden=true},t+380)}
document.getElementById('v-reading-list').addEventListener('click',e=>{if(bookOpen>=0&&!e.target.closest('.bk')&&!e.target.closest('.bkcard'))closeBook()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeBook()});
new ResizeObserver(()=>shelve()).observe(shelves);


// ---------- contact: a text conversation ----------
// Fill these in and the last message will show them. Nothing is sent anywhere by this page itself.
const thread=document.getElementById('thread'),composer=document.getElementById('composer'),say=document.getElementById('say'),sendBtn=document.getElementById('send');
const vc=document.getElementById('v-contact');
let soundOn=true,ac=null,run=0,waiting=null;
function blip(f=660,d=.09){if(!soundOn)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();
  const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(f,ac.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.5,ac.currentTime+d);
  g.gain.setValueAtTime(.0001,ac.currentTime);g.gain.exponentialRampToValueAtTime(.12,ac.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d+.08);
  o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.1)}catch(e){}}
const wait=ms=>new Promise(r=>setTimeout(r,reduce()?0:ms));
const down=()=>requestAnimationFrame(()=>vc.scrollTo({top:vc.scrollHeight,behavior:reduce()?'auto':'smooth'}));
const esc=t=>t.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function emma(text){
  const id=run;const t=document.createElement('div');t.className='msg typing last';t.innerHTML='<span class="av">E</span><span class="b"><i></i><i></i><i></i></span>';
  thread.querySelectorAll('.msg:not(.me)').forEach(m=>m.classList.remove('last'));thread.appendChild(t);down();
  await wait(Math.min(1400,450+text.length*14));if(id!==run)return false;
  t.classList.remove('typing');t.querySelector('.b').innerHTML=text;blip(520);down();await wait(220);return id===run;
}
function mine(text){thread.querySelectorAll('.status').forEach(x=>x.remove());
  const m=document.createElement('div');m.className='msg me';m.innerHTML=`<span class="b">${esc(text)}</span>`;thread.appendChild(m);
  const st=document.createElement('div');st.className='status';st.textContent='Delivered';thread.appendChild(st);blip(880,.06);down()}
function ask(type,placeholder){
  return new Promise(res=>{
    composer.classList.remove('off');say.disabled=false;say.type=type;say.value='';say.placeholder=placeholder;sendBtn.disabled=true;say.focus({preventScroll:true});
    waiting=v=>{waiting=null;composer.classList.add('off');say.disabled=true;say.value='';sendBtn.disabled=true;mine(v);res(v)};
  });
}
say.addEventListener('input',()=>{sendBtn.disabled=!say.value.trim()||(say.type==='email'&&!say.checkValidity())});
composer.addEventListener('submit',e=>{e.preventDefault();const v=say.value.trim();if(!v||!waiting||(say.type==='email'&&!say.checkValidity()))return;waiting(v)});
async function chat(){
  const id=++run;thread.innerHTML='';composer.classList.add('off');say.disabled=true;sendBtn.disabled=true;say.placeholder='Message';
  if(!await emma('Want to work together?'))return;
  if(!await emma('Have some thoughts on the readings?'))return;
  if(!await emma('Drop me a line. (you're sending me a real email!)'))return;
  const msg=await ask('text','Message');if(id!==run)return;
  if(!await emma('Thank you. What’s the best email to reach you?'))return;
  const from=await ask('email','Your email');if(id!==run)return;
  if(!await emma('Here is your message, ready to send:'))return;
  const subject='A message from your website';
  const body=`Hi Emma,\n\n${msg}\n\n${from}`;
  const note=document.createElement('div');note.className='note';
  note.innerHTML=`<dl><dt>to</dt><dd>Emma</dd><dt>subject</dt><dd>${esc(subject)}</dd></dl><pre></pre>`;
  note.querySelector('pre').textContent=body;thread.appendChild(note);down();say.placeholder='Message ready above';
  // send it for real through Formspree; Emma's address is held there, never in this page
  const err=await deliver(from,msg,subject);if(id!==run)return;
  if(!err){await emma(`Sent. I’ll reply to ${esc(from)}.`)}
  else{
    const acts=document.createElement('div');acts.className='acts';
    acts.innerHTML=`<p class="err">${esc(err)} You can copy the message and send it another way.</p><button type="button" id="cp">copy message</button>`;
    note.appendChild(acts);down();
    acts.querySelector('#cp').onclick=async e=>{const b=e.currentTarget;try{await navigator.clipboard.writeText(`Subject: ${subject}\n\n`+body);b.textContent='copied'}
      catch(er){const sel=getSelection(),rg=document.createRange();rg.selectNodeContents(note.querySelector('pre'));sel.removeAllRanges();sel.addRange(rg);b.textContent='selected — press copy'}};
  }
  if(CONTACT.linkedin){await wait(400);if(id!==run)return;await emma(`You can also find me on LinkedIn: <a href="${esc(CONTACT.linkedin)}" target="_blank" rel="noopener">${esc(CONTACT.linkedin)}</a>`)}
}
let lastSent=0;
async function deliver(from,msg,subject){
  if(!CONTACT.formspree)return 'Sending is not set up yet.';
  if(Date.now()-lastSent<30000)return 'Please wait a moment before sending another message.';
  const trap=document.getElementById('hp');
  try{
    const r=await fetch(`https://formspree.io/f/${encodeURIComponent(CONTACT.formspree)}`,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},
      body:JSON.stringify({email:from,message:msg,_subject:subject,_gotcha:trap?trap.value:''})});
    if(r.ok){lastSent=Date.now();return ''}
    const j=await r.json().catch(()=>({}));
    return (j.errors&&j.errors[0]&&j.errors[0].message?j.errors[0].message+'.':`The message could not be sent (error ${r.status}).`);
  }catch(e){return 'The message could not be sent. Check your connection.'}
}
document.getElementById('again').onclick=chat;
document.getElementById('snd').onclick=e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'sound on':'sound off';e.currentTarget.setAttribute('aria-pressed',soundOn)};


// ---------- About me ----------
// Edit these to update the page; the current book should match a title on the reading list.

// languages: click to cycle through hellos
{const bio=document.getElementById('bio');if(ABOUT.bio){bio.textContent=ABOUT.bio;bio.classList.remove('tbd')}else bio.textContent='A few lines about me will go here.'}
// collage: the piece you point at comes forward, the rest fade
{const col=document.getElementById('collage');col.querySelectorAll('.piece').forEach(pc=>{
  const on=()=>{col.classList.add('focus');pc.classList.add('hot')},off=()=>{col.classList.remove('focus');pc.classList.remove('hot')};
  pc.addEventListener('pointerenter',on);pc.addEventListener('pointerleave',off);pc.addEventListener('focus',on);pc.addEventListener('blur',off)})}
let hi=0;const helloW=document.getElementById('helloW'),helloL=document.getElementById('helloL');
const HAND='<svg viewBox="0 0 40 46" aria-label="a hand signing hello"><path d="M12 44 C6 36 5 28 6 22 L7 14 C7 11 11 11 11 14 L11 22 L12 6 C12 3 16 3 16 6 L16 21 L18 3 C18 0 22 0 22 3 L21 21 L24 6 C24 3 28 3 28 6 L26 23 L30 17 C32 14 36 16 34 19 L27 33 C25 38 22 42 20 44 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M33 4 C36 6 37 9 37 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
function showHello(){const [w,l]=ABOUT.hellos[hi];helloW.innerHTML=w==='ASL'?HAND:esc(w);helloL.textContent=l}
showHello();
document.getElementById('hello').addEventListener('click',()=>{helloW.classList.add('out');setTimeout(()=>{hi=(hi+1)%ABOUT.hellos.length;showHello();helloW.classList.remove('out')},reduce()?0:180)});
// corsica: an ink outline from rough coordinates; click to pin the Lavezzi islands and show the line
(function(){
  const pts=[[9.41,43.02],[9.46,42.98],[9.47,42.88],[9.46,42.80],[9.45,42.70],[9.47,42.60],[9.51,42.50],[9.54,42.38],[9.56,42.25],[9.56,42.12],[9.47,42.00],
    [9.40,41.90],[9.40,41.75],[9.37,41.62],[9.30,41.52],[9.26,41.43],[9.22,41.38],[9.10,41.40],[9.00,41.45],[8.88,41.52],[8.80,41.60],[8.73,41.70],[8.65,41.78],
    [8.72,41.86],[8.78,41.92],[8.62,41.93],[8.60,42.02],[8.67,42.10],[8.58,42.17],[8.55,42.25],[8.62,42.33],[8.57,42.38],[8.66,42.48],[8.73,42.56],[8.85,42.62],
    [8.95,42.64],[9.07,42.69],[9.18,42.72],[9.28,42.69],[9.33,42.75],[9.34,42.85],[9.35,42.95],[9.37,43.00]];
  const X=lon=>(lon-8.5)*.743*125+2,Y=lat=>(43.06-lat)*125+3,P=pts.map(([a,b])=>[X(a),Y(b)]),n=P.length;
  // smooth the coastline (closed Catmull-Rom) so it reads as a drawn line
  let d=`M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
  for(let i=0;i<n;i++){const p0=P[(i-1+n)%n],p1=P[i],p2=P[(i+1)%n],p3=P[(i+2)%n];
    d+=`C${(p1[0]+(p2[0]-p0[0])/6).toFixed(1)} ${(p1[1]+(p2[1]-p0[1])/6).toFixed(1)} ${(p2[0]-(p3[0]-p1[0])/6).toFixed(1)} ${(p2[1]-(p3[1]-p1[1])/6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`}
  document.getElementById('shore').setAttribute('d',d+'Z');
  const lx=X(9.36),ly=Y(41.90);
  document.getElementById('pin').innerHTML=`<circle cx="${lx}" cy="${ly}" r="1.8" fill="#F6CE1D"/><circle cx="${lx}" cy="${ly}" r="4" fill="none" stroke="#F6CE1D" stroke-width="1" vector-effect="non-scaling-stroke"/><text x="${lx-6.5}" y="${ly+1.8}" text-anchor="end" font-family="EB Garamond,Garamond,serif" font-style="italic" font-size="5.6" fill="#EFE6D3">Corsica</text>`;
  const isl=document.getElementById('island');
  isl.addEventListener('click',()=>{const on=isl.classList.toggle('on');isl.setAttribute('aria-expanded',on);
    document.getElementById('islandHint').textContent='Corsica'});
})();
// fountain pen: ink that thins as the pen moves faster
(function(){
  const pad=document.getElementById('pad'),cv=document.getElementById('ink'),cx=cv.getContext('2d');let last=null,dpr=1;
  function size(){const r=pad.getBoundingClientRect();if(!r.width)return;dpr=devicePixelRatio||1;const img=cv.width?cx.getImageData(0,0,cv.width,cv.height):null;
    cv.width=r.width*dpr;cv.height=r.height*dpr;cx.scale(dpr,dpr);if(img)cx.putImageData(img,0,0)}
  new ResizeObserver(size).observe(pad);
  const pos=e=>{const r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now()}};
  const pen=pad.querySelector('.pen');let tid=0;
  const place=p=>{pen.style.left=(p.x-1.4)+'px';pen.style.top=(p.y-8.4)+'px'};
  const rest=()=>{pad.classList.remove('lifted','track','down');pen.style.left='';pen.style.top='';last=null};
  cv.addEventListener('pointerenter',e=>{pad.classList.add('lifted');place(pos(e));clearTimeout(tid);tid=setTimeout(()=>pad.classList.add('track'),reduce()?0:300)});
  cv.addEventListener('pointerleave',e=>{if(last)return;rest()});
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);const p=pos(e);last=p;
    pad.classList.add('lifted','down');if(e.pointerType!=='mouse')pad.classList.add('track');place(p)});
  cv.addEventListener('pointermove',e=>{const p=pos(e);if(pad.classList.contains('lifted'))place(p);if(!last)return;
    const d=Math.hypot(p.x-last.x,p.y-last.y),v=d/Math.max(1,p.t-last.t);
    cx.strokeStyle='rgba(28,38,80,.92)';cx.lineCap='round';cx.lineWidth=Math.max(.8,3.2-v*1.6);
    cx.beginPath();cx.moveTo(last.x,last.y);cx.lineTo(p.x,p.y);cx.stroke();last=p});
  const up=e=>{last=null;pad.classList.remove('down');
    const r=cv.getBoundingClientRect();if(e.pointerType!=='mouse'||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)rest()};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  document.getElementById('clearInk').addEventListener('click',()=>{cx.clearRect(0,0,cv.width,cv.height)});
})();
// reading now: the same spine as on the shelf; click to open it there
(function(){
  const k=BOOKS.findIndex(b=>b[0]===ABOUT.reading);if(k<0)return;const b=books[k];
  const cov=document.getElementById('nowCover');cov.src=ABOUT.cover;cov.alt=`Cover of ${b.t} by ${b.a}`;
  document.getElementById('nowT').innerHTML=`<em>${esc(b.t)}</em><small>${esc(b.a)}</small>`;
  document.getElementById('nowread').addEventListener('click',()=>{location.hash='reading-list';
    setTimeout(()=>{const el=shelves.querySelector(`.bk[data-i="${k}"]`);el&&pickBook(k,el)},reduce()?50:500)});
})();
const VIEWS={about:'v-about',products:'v-products',writings:'v-writings','reading-list':'v-reading-list',contact:'v-contact'};
function route(){
  const v=VIEWS[location.hash.slice(1)];
  document.querySelectorAll('.page').forEach(pg=>pg.hidden=pg.id!==v);
  scene.hidden=!!v;if(v){if(open>=0)close();hidePoem()}else closeBook();
  if(v==='v-reading-list'){shelfW=0;requestAnimationFrame(shelve)}
  if(v==='v-contact'&&!thread.children.length)chat();
}
addEventListener('hashchange',route);route();
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(frame);
if(!reduce())requestAnimationFrame(tick);
