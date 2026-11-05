/* ================= criação do personagem (antes de cada campanha nova) =================
   Menu → Novo jogo → (se houver jogo salvo, confirma) → esta tela → Confirmar e iniciar → campanha.
   Cada escolha refaz a malha 3D do sobrevivente (23_aparencia): o que aparece no palco é o mesmo corpo do jogo.
   Depois de começar, a aparência fica gravada no save e não muda mais; roupas e equipamentos continuam trocáveis.
   Todo mundo começa só com a bermuda simples vestida, descalço e com a mochila vazia. */
TELAS_NOVAS.push('t-criacao');
APAR.pelesNome=['Muito clara','Clara','Morena clara','Morena','Escura','Muito escura'];
/* palco: começo da noite na clareira, perto da fogueira (ela fica atrás, de luz de recorte) e uma luz de frente que acompanha a câmera */
const CRIA_HORA=19.15,CRIA_PONTO=[FIRE[0]+3.25,FIRE[2]+3.25],CRIA_YAW=1.31,CAP_K=0.9;   // fogueira atrás e à esquerda (150°): a câmera de costas não cai nela
const CRIA={luz:0,ap:null,aba:'rosto',ang:0,angAlvo:0,zoom:0,zoomAlvo:0,girar:false,arr:null,sujo:null,fila:[],apagar:false,volta:null,pend:null,t:0,vista:'frente'};
const CRIA_ABAS={rosto:[['rosto','Formato do rosto'],['pele','Tom de pele'],['olhos','Olhos'],['sobr','Sobrancelhas'],['nariz','Nariz'],['boca','Boca'],['barba','Barba']],
  cabelo:[['cabelo','Penteado'],['corCab','Cor do cabelo e da barba']],corpo:[['altura','Altura'],['porte','Porte físico']]};
const hex6=n=>'#'+(n>>>0).toString(16).padStart(6,'0');
function criaNomeOp(k,i){const A=APAR;switch(k){case'rosto':return A.rostos[i].n;case'pele':return A.pelesNome[i];case'olhos':return A.olhosNome[i];case'sobr':return A.sobrancelhas[i].n;
  case'nariz':return A.narizes[i].n;case'boca':return A.bocas[i].n;case'barba':return A.barbas[i];case'cabelo':return A.cabelos[i];case'corCab':return A.coresCabeloNome[i];case'altura':return A.alturasNome[i];case'porte':return A.portes[i].n;}return'';}
/* ---------- desenhos das opções (SVG feitos com os mesmos números da malha) ---------- */
function criaContorno(rosto,cx,base,esc){const r=APAR.rostos[rosto],f=r.f||F_CABECA,w=(r.w||1)*esc,h=(r.h||1)*esc;
  const dir=f.map(([t,k])=>[cx+k*21*w,base-t*44*h]),esq=dir.slice().reverse().map(([x,y])=>[2*cx-x,y]);
  return{d:'M'+[...dir,...esq].map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')+'Z',y:t=>base-t*44*h,x:(t)=>{let k=0;for(let i=0;i<f.length-1;i++)if(t>=f[i][0]&&t<=f[i+1][0]){const u=(t-f[i][0])/((f[i+1][0]-f[i][0])||1);k=lerp(f[i][1],f[i+1][1],u);}return k*21*w;}};}
function criaRostoSvg(ap,o){o=o||{};const pele=hex6(APAR.peles[ap.pele]),esc=hex6(hexMix(APAR.peles[ap.pele],0x000000,0.45)),cab=hex6(APAR.coresCabelo[ap.corCab]),C=criaContorno(o.rosto??ap.rosto,32,58,o.esc||0.95);
  const yo=C.y(0.53),xo=C.x(0.53)*0.38,yb=C.y(0.25),yn=C.y(0.4),ear=C.x(0.5);let s='';
  if(o.atras)s+=o.atras;
  s+=`<ellipse cx="${(32-ear-1.5).toFixed(1)}" cy="${(C.y(0.5)).toFixed(1)}" rx="3" ry="5" fill="${pele}" stroke="${esc}" stroke-width="1"/><ellipse cx="${(32+ear+1.5).toFixed(1)}" cy="${(C.y(0.5)).toFixed(1)}" rx="3" ry="5" fill="${pele}" stroke="${esc}" stroke-width="1"/>`;
  s+=`<path d="${C.d}" fill="${pele}" stroke="${esc}" stroke-width="1.2" stroke-linejoin="round"/>`;
  if(o.meio)s+=o.meio(C,pele,esc,cab);
  s+=`<ellipse cx="${32-xo}" cy="${yo}" rx="2.6" ry="1.6" fill="#1d1712"/><ellipse cx="${32+xo}" cy="${yo}" rx="2.6" ry="1.6" fill="#1d1712"/>`;
  s+=`<path d="M${32-xo-4} ${yo-4.5} q4 -2 8 0 M${32+xo-4} ${yo-4.5} q4 -2 8 0" fill="none" stroke="${hex6(hexMix(APAR.coresCabelo[ap.corCab],0,0.15))}" stroke-width="1.8" stroke-linecap="round"/>`;
  s+=`<path d="M32 ${yn-6} l-1.6 6 h3.2" fill="none" stroke="${esc}" stroke-width="1" stroke-linejoin="round"/><path d="M28.5 ${yb} q3.5 1.6 7 0" fill="none" stroke="${hex6(hexMix(APAR.peles[ap.pele],0x7a3a2e,0.6))}" stroke-width="1.6" stroke-linecap="round"/>`;
  if(o.frente)s+=o.frente(C,pele,esc,cab);
  return`<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#1a1f22"/>${s}</svg>`;}
function criaCabeloSvg(ap,e){const cab=hex6(APAR.coresCabelo[ap.corCab]);let atras='';
  if(e===3)atras=`<path d="M15 26 Q14 52 18 62 H46 Q50 52 49 26 Z" fill="${cab}"/>`;
  if(e===5)atras=`<path d="M44 22 q12 6 6 30 q-2 6 -6 4 q4 -14 -4 -26z" fill="${cab}"/>`;
  return criaRostoSvg(ap,{atras,frente:(C)=>{const top=C.y(1),yl=C.y(0.62),xl=C.x(0.62)+2.2;
    if(e===4)return`<path d="M24 ${top+5} q8 -3 16 0" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2" stroke-linecap="round"/>`;
    const capa=`M${32-xl} ${yl} Q${32-xl-1} ${top-2} 32 ${top-3} Q${32+xl+1} ${top-2} ${32+xl} ${yl}`;
    if(e===1)return`<path d="${capa} Q32 ${yl-7} ${32-xl} ${yl}Z" fill="${cab}" fill-opacity=".55"/>`;
    if(e===0)return`<path d="${capa} l-3 -2 l-2 3 l-3 -3 l-3 3 l-3 -3 l-3 3 l-3 -3 l-2 3 l-3 -2 l-2 2Z" fill="${cab}"/>`;
    if(e===2)return`<path d="${capa} L${32+xl} ${C.y(0.42)} Q${32+xl-3} ${C.y(0.55)} ${32+xl-4} ${yl-2} Q32 ${yl-8} ${32-xl+4} ${yl-2} Q${32-xl+3} ${C.y(0.55)} ${32-xl} ${C.y(0.42)}Z" fill="${cab}"/>`;
    if(e===3)return`<path d="${capa} L${32+xl+1} ${C.y(0.3)} Q${32+xl-4} ${C.y(0.6)} ${32+6} ${yl-4} Q32 ${yl-6} ${32-6} ${yl-4} Q${32-xl+4} ${C.y(0.6)} ${32-xl-1} ${C.y(0.3)}Z" fill="${cab}"/>`;
    return`<path d="${capa} Q32 ${yl-6} ${32-xl} ${yl}Z" fill="${cab}"/>`;}});}
function criaBarbaSvg(ap,e){return criaRostoSvg(ap,{frente:(C,pele,esc,cab)=>{const cor=hex6(APAR.coresCabelo[ap.corCab]),y3=C.y(0.34),x3=C.x(0.34),yq=C.y(0),xb=C.x(0.04),yb=C.y(0.25);
  const mand=(op,ext)=>`<path d="M${32-x3} ${y3} L${32-x3} ${y3+3} Q${32-xb-1} ${yq+ext} 32 ${yq+ext+1} Q${32+xb+1} ${yq+ext} ${32+x3} ${y3+3} L${32+x3} ${y3} Q${32+x3-4} ${yb+3} 32 ${yb+4} Q${32-x3+4} ${yb+3} ${32-x3} ${y3}Z" fill="${cor}" fill-opacity="${op}"/>`;
  const bigode=`<path d="M26.5 ${yb-2.2} q5.5 -2.5 11 0 l-1 1.6 q-4.5 -1.4 -9 0z" fill="${cor}"/>`,lab=`<path d="M28.5 ${yb} q3.5 1.6 7 0" fill="none" stroke="${hex6(hexMix(APAR.peles[ap.pele],0x7a3a2e,0.6))}" stroke-width="1.6" stroke-linecap="round"/>`;
  if(e===0)return'';if(e===1)return mand(0.32,0);
  if(e===2)return bigode+`<path d="M28 ${yb+2.5} q4 2 8 0 l-1 ${yq-yb-3} q-3 2 -6 0z" fill="${cor}"/>`+lab;
  if(e===3)return mand(0.88,0.5)+bigode+lab;return mand(1,4)+bigode+lab;}});}
function criaOlhoSvg(ap,i,k){const pele=hex6(APAR.peles[ap.pele]),esc=hex6(hexMix(APAR.peles[ap.pele],0,0.45)),cab=hex6(hexMix(APAR.coresCabelo[ap.corCab],0,0.15)),id='cr-cl-'+k+i;
  let br='';if(k==='sobr'){const S=APAR.sobrancelhas[i],L=S.w*820,th=Math.max(2.2,S.h*560),rs=S.a*48;br=`<path d="M${32-L/2} 23 Q32 ${23-rs*1.4-2} ${32+L/2} ${24.5-rs*0.3}" fill="none" stroke="${cab}" stroke-width="${th.toFixed(1)}" stroke-linecap="round"/>`;}
  const iris=k==='olhos'?hex6(APAR.olhos[i]):hex6(APAR.olhos[ap.olhos]),oy=k==='sobr'?44:33;
  return`<svg viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id="${id}"><path d="M8 ${oy} Q32 ${oy-18} 56 ${oy} Q32 ${oy+16} 8 ${oy}Z"/></clipPath></defs><rect width="64" height="64" fill="${pele}"/>`
    +`<path d="M8 ${oy} Q32 ${oy-18} 56 ${oy} Q32 ${oy+16} 8 ${oy}Z" fill="#efe9de"/><g clip-path="url(#${id})"><circle cx="32" cy="${oy}" r="10" fill="${iris}"/><circle cx="32" cy="${oy}" r="4.3" fill="#0b0a09"/><circle cx="35" cy="${oy-3.5}" r="1.8" fill="#fff" fill-opacity=".85"/></g>`
    +`<path d="M8 ${oy} Q32 ${oy-18} 56 ${oy}" fill="none" stroke="${esc}" stroke-width="2"/>${br}</svg>`;}
function criaNarizSvg(ap,i){const pele=APAR.peles[ap.pele],N=APAR.narizes[i],w=N.w*720,l=N.h*640,sh=hex6(hexMix(pele,0,0.42)),y0=12,y1=y0+l;
  return`<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="${hex6(pele)}"/><path d="M${32-3.5} ${y0} Q${32-4} ${y0+l*0.6} ${32-w/2} ${y1-2}" fill="none" stroke="${sh}" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".7"/>`
    +`<path d="M${32-w/2} ${y1-3} Q${32-w/2-2} ${y1+3} ${32-w/4} ${y1+2} Q32 ${y1+5} ${32+w/4} ${y1+2} Q${32+w/2+2} ${y1+3} ${32+w/2} ${y1-3}" fill="none" stroke="${sh}" stroke-width="1.8" stroke-linecap="round"/>`
    +`<ellipse cx="${32-w*0.22}" cy="${y1+1.6}" rx="${(w*0.12).toFixed(1)}" ry="1.7" fill="${hex6(hexMix(pele,0,0.62))}"/><ellipse cx="${32+w*0.22}" cy="${y1+1.6}" rx="${(w*0.12).toFixed(1)}" ry="1.7" fill="${hex6(hexMix(pele,0,0.62))}"/>`
    +`<ellipse cx="32" cy="${y1-N.d*80}" rx="${(w*0.18).toFixed(1)}" ry="2.4" fill="#fff" fill-opacity=".14"/></svg>`;}
function criaBocaSvg(ap,i){const pele=APAR.peles[ap.pele],B=APAR.bocas[i],w=B.w*1500,h=B.h*1900,lab=hex6(hexMix(pele,0x9a4a3a,0.55)),es=hex6(hexMix(pele,0x3a1a14,0.7));
  return`<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="${hex6(pele)}"/><path d="M${32-w/2} 33 Q${32-w/4} ${33-h*0.62} 32 ${33-h*0.38} Q${32+w/4} ${33-h*0.62} ${32+w/2} 33 Z" fill="${lab}"/>`
    +`<path d="M${32-w/2} 33 Q32 ${33+h*0.85} ${32+w/2} 33 Z" fill="${hex6(hexMix(pele,0x9a4a3a,0.45))}"/><path d="M${32-w/2} 33 Q32 34.5 ${32+w/2} 33" fill="none" stroke="${es}" stroke-width="1.3" stroke-linecap="round"/></svg>`;}
function criaAlturaSvg(i){const k=APAR.alturas[i],h=44*k,y=60-h,s=h/44;
  return`<svg viewBox="0 0 40 64" aria-hidden="true"><path d="M2 60.5h36" stroke="currentColor" stroke-opacity=".35"/><circle cx="20" cy="${(y+4.2*s).toFixed(1)}" r="${(4*s).toFixed(1)}" fill="currentColor"/><path d="M${20-6*s} ${y+10*s} h${12*s} l${1.4*s} ${14*s} h-${3*s} v${h-24*s-0.5} h-${3.6*s} v-${(h-24*s)*0.62} h-${0.8*s} v${(h-24*s)*0.62} h-${3.6*s} v-${h-24*s-0.5} h-${3*s}z" fill="currentColor"/></svg>`;}
function criaPorteSvg(i){const po=APAR.portes[i],o=po.ombro*170,c=po.m.chestW*34,cw=po.m.waistW*34,a=po.m.armW*42;
  return`<svg viewBox="0 0 48 64" aria-hidden="true"><circle cx="24" cy="10" r="6" fill="currentColor"/><path d="M${24-c/2-o/2} 19 Q24 16 ${24+c/2+o/2} 19 L${24+cw/2} 44 L${24-cw/2} 44Z" fill="currentColor"/>`
    +`<path d="M${24-c/2-o/2-0.5} 20 l-${a*0.55} 22 h${a*0.6} l${a*0.45} -16z M${24+c/2+o/2+0.5} 20 l${a*0.55} 22 h-${a*0.6} l-${a*0.45} -16z" fill="currentColor" fill-opacity=".8"/><path d="M${24-cw/2} 45 h${cw} l-1 15 h-${cw/2-2.5} l-1.5 -11 l-1.5 11 h-${cw/2-2.5}z" fill="currentColor" fill-opacity=".65"/></svg>`;}
function criaOpcao(k,i){const ap=CRIA.ap,sel=ap[k]===i,nome=criaNomeOp(k,i),at=`data-k="${k}" data-i="${i}" aria-pressed="${sel}" aria-label="${nome}" title="${nome}"`;
  if(k==='pele')return`<button type="button" class="cr-op cor" style="--c:${hex6(APAR.peles[i])}" ${at}></button>`;
  if(k==='corCab')return`<button type="button" class="cr-op cor" style="--c:${hex6(APAR.coresCabelo[i])}" ${at}></button>`;
  if(k==='altura')return`<button type="button" class="cr-op txt" ${at}>${criaAlturaSvg(i)}<b>${nome}</b></button>`;
  if(k==='porte')return`<button type="button" class="cr-op txt" ${at}>${criaPorteSvg(i)}<b>${nome}</b></button>`;
  let svg='';
  if(k==='rosto')svg=criaRostoSvg(ap,{rosto:i});else if(k==='olhos'||k==='sobr')svg=criaOlhoSvg(ap,i,k);else if(k==='nariz')svg=criaNarizSvg(ap,i);else if(k==='boca')svg=criaBocaSvg(ap,i);
  else if(k==='barba')svg=criaBarbaSvg(ap,i);else if(k==='cabelo')svg=criaCabeloSvg(ap,i);
  return`<button type="button" class="cr-op" ${at}>${svg}</button>`;}
/* ---------- painel de opções ---------- */
const CRIA_ACHADAS=['camiseta','camisaLeve','calcaCargo','botasTrilha','cinto','colete','luvasCouro','casacoGrande'],CRIA_ACESS=['mochilaPequena','bone','bandana','mascaraPano','mascaraGas','gorroPele'];
function criaAba(aba){CRIA.aba=aba;for(const b of document.querySelectorAll('#cr-nav [data-aba]'))b.setAttribute('aria-pressed',String(b.dataset.aba===aba));
  const el=$('cr-opcoes');let h='';const L=CRIA_ABAS[aba];
  if(L)for(const[k,t]of L){const n=APAR[APAR_CAMPOS[k]].length;h+=`<div class="cr-sec"><h3>${t}<small>${criaNomeOp(k,CRIA.ap[k])}</small></h3><div class="cr-ops" role="group" aria-label="${t}">`;for(let i=0;i<n;i++)h+=criaOpcao(k,i);h+='</div></div>';}
  else if(aba==='roupas'){const it=id=>ITEMS[id]?`<li>${svgUse(ITEMS[id].icon)}${ITEMS[id].nome}</li>`:'';
    h=`<div class="cr-sec"><h3>Roupa inicial</h3><div class="cr-info-card">${svgUse('i-bermuda')}<div><b>${ITEMS.bermuda.nome}</b><span>A única peça com que você começa. Cobre, mas não protege nem esquenta.</span><span class="cr-trava">Vestida no começo</span></div></div></div>`
      +`<div class="cr-sec"><h3>Achadas no mundo</h3><p class="cr-texto">Casas, lojas, armários, hospitais e acampamentos guardam roupas. Vista pela mochila: a peça aparece no corpo na hora e a que você tirou volta para a mochila.</p><ul class="cr-lista">${CRIA_ACHADAS.map(it).join('')}</ul></div>`
      +`<div class="cr-sec"><h3>Feitas por você</h3><p class="cr-texto">Couro curtido na estação vira jaqueta, calças, botas, luvas e mochilas melhores.</p></div>`;}
  else{const it=id=>ITEMS[id]?`<li>${svgUse(ITEMS[id].icon)}${ITEMS[id].nome}</li>`:'';
    h=`<div class="cr-sec"><h3>Nenhum acessório inicial</h3><p class="cr-texto">Você começa sem mochila, boné, máscara ou ferramenta. Tudo isso aparece durante a exploração:</p><ul class="cr-lista">${CRIA_ACESS.map(it).join('')}</ul></div>`;}
  el.innerHTML=h;}
const criaIcoAba=a=>{const b=document.querySelector('#cr-nav [data-aba="'+a+'"] svg');return b?b.outerHTML:'';};
function criaResumoHTML(ap){const A=APAR;return[['rosto','Rosto',A.rostos[ap.rosto].n+' · pele '+A.pelesNome[ap.pele].toLowerCase()+' · olhos '+A.olhosNome[ap.olhos].toLowerCase()],
    ['cabelo','Cabelo',A.cabelos[ap.cabelo]+(ap.cabelo===4?'':', '+A.coresCabeloNome[ap.corCab].toLowerCase())+(ap.barba?' · '+A.barbas[ap.barba].toLowerCase():'')],
    ['corpo','Corpo',A.alturasNome[ap.altura]+' · '+A.portes[ap.porte].n.toLowerCase()],['roupas','Roupas',ITEMS.bermuda.nome],['acess','Acessórios','Nenhum']]
  .map(([a,t,v])=>`<li>${criaIcoAba(a)}<div>${t} <span>${v}</span></div></li>`).join('');}
function criaResumo(){$('cr-resumo').innerHTML=criaResumoHTML(CRIA.ap);}
function criaBotoes(){$('cr-girar').setAttribute('aria-pressed',String(CRIA.girar));$('cr-zoom').setAttribute('aria-pressed',String(CRIA.zoomAlvo>0.5));
  $('cr-zoom').querySelector('span').textContent=$('cr-zoom').title=CRIA.zoomAlvo>0.5?'Afastar':'Aproximar';
  for(const b of document.querySelectorAll('#cr-vistas [data-vista]'))b.setAttribute('aria-pressed',String(b.dataset.vista===CRIA.vista));}
/* ---------- abrir, sair e começar ---------- */
const criaRoupaInicial=()=>({cabeca:null,rosto:null,camiseta:null,tronco:null,maos:null,cintura:null,pernas:'bermuda',pes:null,costas:null});
function abrirCriacao(apagar){CRIA.apagar=!!apagar;try{audioInit();}catch(_){}
  if(!CRIA.ap)CRIA.ap=aparLimpa(APAR_PADRAO);
  if(G.modo!=='criacao')CRIA.volta={hora:G.hora,chuva:G.chuva,chuvaAlvo:G.chuvaAlvo,x:P.x,z:P.z,y:P.y,yaw:P.ch.yaw,roupa:P.roupa,alive:P.alive,zs:Z.splice(0)};
  G.modo='criacao';tela('t-criacao');$('cr-modal').hidden=true;hudEl.classList.add('oculto');
  G.hora=CRIA_HORA;G.chuva=G.chuvaAlvo=0;P.alive=false;const[x,z]=CRIA_PONTO;P.x=x;P.z=z;P.y=ground(x,z);
  Object.assign(P.ch,{x,z,y:P.y,yaw:CRIA_YAW,pitch:0,roll:0});if(P.ch.sk){P.ch.sk.clip=null;P.ch.sk.cw=0;P.ch.sk.dyRaiz=0;}P.roupa=criaRoupaInicial();
  CRIA.ang=CRIA.angAlvo=0;CRIA.zoom=CRIA.zoomAlvo=0;CRIA.girar=false;CRIA.vista='frente';CRIA.arr=null;
  aplicarAparencia(CRIA.ap);$('cr-nome').value=CRIA.ap.nome||'';criaAba(CRIA.aba);criaResumo();criaBotoes();CRIA.sujo=G.t-1;CRIA.fila=[];
  try{rebuildVeg(true);rebuildGrass();}catch(_){}}
function sairCriacao(){const v=CRIA.volta;CRIA.volta=null;$('cr-modal').hidden=true;
  if(v){G.hora=v.hora;G.chuva=v.chuva;G.chuvaAlvo=v.chuvaAlvo;P.x=v.x;P.z=v.z;P.y=v.y;P.roupa=v.roupa;P.alive=v.alive;Z.push(...v.zs);Object.assign(P.ch,{x:v.x,z:v.z,y:v.y,yaw:v.yaw});poseLoco(P.ch.r,0,0,0,false);}
  mostrarMenu();try{rebuildVeg(true);rebuildGrass();}catch(_){}}
function criaConfirmar(){CRIA.ap.nome=$('cr-nome').value;$('cr-m-resumo').innerHTML=(CRIA.ap.nome.trim()?`<li><span></span><div>Nome <span>${CRIA.ap.nome.replace(/[<>&]/g,'').trim()}</span></div></li>`:'')+criaResumoHTML(CRIA.ap);
  $('cr-modal').hidden=false;$('cr-m-sim').focus();}
function criaComecar(){const ap=aparLimpa(Object.assign({},CRIA.ap,{nome:$('cr-nome').value}));$('cr-modal').hidden=true;
  if(CRIA.apagar)apagarSaves();CRIA.apagar=false;CRIA.volta=null;CRIA.pend=ap;
  try{novoJogo();}finally{CRIA.pend=null;}
  jogar();}
/* ---------- câmera do palco e fotos (retrato e as três vistas) ---------- */
function criaOlhar(pos,tgt){cam.pos=pos;cam.tgt=tgt;cam.fwd=norm([tgt[0]-pos[0],tgt[1]-pos[1],tgt[2]-pos[2]]);cam.right=norm([-cam.fwd[2],0,cam.fwd[0]]);
  cam.up=[cam.right[1]*cam.fwd[2]-cam.right[2]*cam.fwd[1],cam.right[2]*cam.fwd[0]-cam.right[0]*cam.fwd[2],cam.right[0]*cam.fwd[1]-cam.right[1]*cam.fwd[0]];}
function criaFoco(){const el=$('cr-foco'),r=el&&el.getBoundingClientRect();if(!r||r.width<20||r.height<20)return{x:0,y:0,w:W,h:H};return{x:r.left,y:r.top,w:r.width,h:r.height};}
function criaCamera(modo,hN){const s=P.ch.s||1,sp=MESH.jogador.spec;poseBones(P.ch);const hy=xf(P.ch.m.subarray(32,48),0,0,0)[1];
  const topo=hy+(0.06+sp.headH+0.02)*s,pe=P.y,cab=hy+(0.06+sp.headH*0.48)*s,fy=0.6,th=Math.tan(fy/2),asp=W/H;let ang=0,Hc,cy,nx=0,ny=0;
  if(modo==='palco'){ang=CRIA.ang;const r=criaFoco();nx=(r.x+r.w/2)/W*2-1;ny=1-(r.y+r.h/2)/H*2;hN=2*r.h/H*0.97;   // o corpo inteiro ocupa quase toda a altura da área do personagem
    Hc=lerp(topo-pe+0.06,0.8*s,CRIA.zoom);cy=lerp((topo+pe)/2,cab-0.13*s,CRIA.zoom);}   // de perto: cabeça e ombros
  else if(modo==='retrato'){ang=0.42;Hc=0.47*s;cy=cab-0.06*s;}
  else{ang=modo==='costas'?Math.PI:modo==='lado'?Math.PI/2:0;Hc=topo-pe+0.1;cy=(topo+pe)/2;}
  CRIA.luz=ang;const D=Hc/(hN*th),b=P.ch.yaw+ang,alt=modo==='retrato'?0.03:Math.min(0.3,D*0.045),pos=[P.x+Math.sin(b)*D,cy+alt,P.z+Math.cos(b)*D],c=[P.x,cy,P.z];
  cam.fov=fy;criaOlhar(pos,c);
  if(nx||ny){const ax=nx*D*th*asp,ay=ny*D*th;criaOlhar(pos,[c[0]-cam.right[0]*ax-cam.up[0]*ay,c[1]-cam.right[1]*ax-cam.up[1]*ay,c[2]-cam.right[2]*ax-cam.up[2]*ay]);}}
function criaCapturar(k){const cv=k==='retrato'?$('cr-retrato'):document.querySelector('#cr-vistas [data-vista="'+k+'"] canvas');if(!cv)return false;
  const ar=cv.width/cv.height,ch=Math.min(canvas.height*CAP_K,canvas.width*CAP_K/ar),cw=ch*ar;
  criaCamera(k,2*(ch/canvas.height)*0.95);render();
  try{const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);g.drawImage(canvas,(canvas.width-cw)/2,(canvas.height-ch)/2,cw,ch,0,0,cv.width,cv.height);}catch(e){return false;}
  return true;}
/* pose do palco: em pé, respirando, braços um pouco abertos (para ver mãos e roupa) */
function criaPose(){const o=P.ch.r;poseLoco(o,0,0,CRIA.t,false);o[3*3+2]=0.2;o[5*3+2]=-0.2;o[4*3]=-0.2;o[6*3]=-0.2;o[7*3+2]=0.05;o[9*3+2]=-0.05;}
function criacaoQuadro(dt){G.t+=dt;CRIA.t+=dt;computeEnv();try{updateFx(dt);}catch(_){}
  if(CRIA.girar)CRIA.angAlvo+=dt*0.55;CRIA.ang+=(CRIA.angAlvo-CRIA.ang)*Math.min(1,dt*7);CRIA.zoom+=(CRIA.zoomAlvo-CRIA.zoom)*Math.min(1,dt*6);
  criaPose();
  if(TESTE&&window.__semRender)return;   // testes rápidos sem desenho: as fotos ficam para quando voltar a desenhar
  if(CRIA.sujo!==null&&G.t-CRIA.sujo>0.22){CRIA.fila=['retrato'];CRIA.sujo=null;}   // sujo: hora da última mudança (null = retrato em dia); frente/costas/lado agora giram o personagem grande
  if(CRIA.fila.length)criaCapturar(CRIA.fila.shift());
  criaCamera('palco');render();if(AU.ctx)try{musica(dt);}catch(_){}}
/* ---------- eventos da tela ---------- */
(function criaEventos(){const pal=$('cr-palco');
  $('cr-nav').addEventListener('click',e=>{const b=e.target.closest('[data-aba]');if(!b)return;criaAba(b.dataset.aba);sfx('clique');
    // rosto e cabelo: a câmera chega perto do rosto; corpo, roupas e acessórios: volta para o corpo inteiro (o botão Aproximar/Afastar continua valendo)
    const perto=b.dataset.aba==='rosto'||b.dataset.aba==='cabelo';if((CRIA.zoomAlvo>0.5)!==perto){CRIA.zoomAlvo=perto?1:0;criaBotoes();}});
  $('cr-opcoes').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;const k=b.dataset.k,i=+b.dataset.i;if(CRIA.ap[k]===i)return;
    CRIA.ap[k]=i;aplicarAparencia(CRIA.ap);const y=$('cr-opcoes').scrollTop;criaAba(CRIA.aba);$('cr-opcoes').scrollTop=y;criaResumo();CRIA.sujo=G.t;sfx('clique');
    const nb=document.querySelector('#cr-opcoes [data-k="'+k+'"][data-i="'+i+'"]');if(nb)nb.focus({preventScroll:true});});
  $('cr-aleatorio').addEventListener('click',()=>{const nome=CRIA.ap.nome;CRIA.ap=aparLimpa(Object.assign(aparAleatoria(),{nome}));aplicarAparencia(CRIA.ap);criaAba(CRIA.aba);criaResumo();CRIA.sujo=G.t;sfx('clique');});
  $('cr-nome').addEventListener('input',e=>{CRIA.ap.nome=e.target.value;});
  $('cr-nome').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();criaConfirmar();}});
  $('cr-voltar').addEventListener('click',()=>{sfx('clique');sairCriacao();});
  $('cr-confirmar').addEventListener('click',()=>{sfx('clique');criaConfirmar();});
  $('cr-m-nao').addEventListener('click',()=>{$('cr-modal').hidden=true;$('cr-confirmar').focus();});
  $('cr-m-sim').addEventListener('click',()=>{sfx('clique');criaComecar();});
  $('cr-vistas').addEventListener('click',e=>{const b=e.target.closest('[data-vista]');if(!b)return;const v=b.dataset.vista,a=v==='costas'?Math.PI:v==='lado'?Math.PI/2:0;
    CRIA.vista=v;CRIA.girar=false;CRIA.angAlvo=a+Math.PI*2*Math.round((CRIA.angAlvo-a)/(Math.PI*2));criaBotoes();});
  $('cr-girar').addEventListener('click',()=>{CRIA.girar=!CRIA.girar;if(CRIA.girar)CRIA.vista='';criaBotoes();});
  $('cr-zoom').addEventListener('click',()=>{CRIA.zoomAlvo=CRIA.zoomAlvo>0.5?0:1;criaBotoes();});
  $('cr-reset').addEventListener('click',()=>{CRIA.girar=false;CRIA.vista='frente';CRIA.zoomAlvo=0;CRIA.angAlvo=Math.PI*2*Math.round(CRIA.angAlvo/(Math.PI*2));criaBotoes();});
  pal.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;CRIA.arr={x:e.clientX,a:CRIA.angAlvo,id:e.pointerId};try{pal.setPointerCapture(e.pointerId);}catch(_){}pal.classList.add('arrastando');CRIA.girar=false;CRIA.vista='';criaBotoes();});
  pal.addEventListener('pointermove',e=>{if(!CRIA.arr||e.pointerId!==CRIA.arr.id)return;CRIA.angAlvo=CRIA.arr.a-(e.clientX-CRIA.arr.x)*0.011;});
  const solta=e=>{if(CRIA.arr&&e.pointerId===CRIA.arr.id){CRIA.arr=null;pal.classList.remove('arrastando');}};pal.addEventListener('pointerup',solta);pal.addEventListener('pointercancel',solta);
  pal.addEventListener('wheel',e=>{e.preventDefault();CRIA.zoomAlvo=clamp(CRIA.zoomAlvo-Math.sign(e.deltaY)*0.25,0,1);criaBotoes();},{passive:false});
  window.addEventListener('keydown',e=>{if(G.modo!=='criacao')return;if(e.target&&e.target.tagName==='INPUT')return;
    if(e.key==='Escape'){if(!$('cr-modal').hidden)$('cr-modal').hidden=true;else sairCriacao();e.preventDefault();}
    else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){if(e.target&&e.target.closest&&e.target.closest('.cr-ops'))return;CRIA.girar=false;CRIA.vista='';CRIA.angAlvo+=(e.key==='ArrowLeft'?0.3:-0.3);criaBotoes();}});})();
/* ---------- campanha: aparência gravada e equipamento inicial ---------- */
V8.novo.aparencia=()=>{G.aparencia=aparLimpa(CRIA.pend||APAR_PADRAO);aplicarAparencia(G.aparencia);
  // só a bermuda simples vestida: nenhuma arma, ferramenta, suprimento ou outra roupa
  P.roupa=criaRoupaInicial();if(!P.roupaInfo)P.roupaInfo={};P.roupaInfo.pernas={id:'bermuda',dur:ITEMS.bermuda.durMax||0,q:1,rep:0};if(G.fab&&G.fab.visto)G.fab.visto.bermuda=1;};
V8.salvar.aparencia=()=>G.aparencia||null;
V8.carregar.aparencia=s=>{G.aparencia=aparLimpa(s||APAR_PADRAO);aplicarAparencia(G.aparencia);};
