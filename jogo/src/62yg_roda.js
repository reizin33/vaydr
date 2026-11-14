/* ================= Roda de construção (v10.2.2, pedido do Himalaia: "a roda de construir") =================
   No jeito do Rust: com o modo de construção ligado, segure o botão direito do mouse (no controle, segure LB) e aparece no meio da
   tela uma roda com as peças. No anel de dentro ficam os tipos (Muros, Defesa, Casa, Base, Oficina, Plantio) e no de fora as
   peças do tipo apontado, com o desenho, o nome e se dá para fazer (o que falta material fica apagado com um ponto vermelho;
   a peça trancada, com cadeado). Embaixo da roda, o nome e o custo da peça apontada. Aponte com o mouse (no controle, o
   analógico direito: meio caminho escolhe o tipo, todo o caminho escolhe a peça) e solte para escolher; soltando no meio,
   nada muda. Enquanto a roda está aberta a câmera fica parada e o clique esquerdo também escolhe. A rodinha do mouse, as
   teclas 1 a 0 e a barra de peças continuam funcionando como antes. */
const RODA={aberta:false,via:null,vx:0,vy:0,cat:null,catHover:null,peca:null,el:null,ass:''};
const RODA_R={centro:58,cat0:64,cat1:150,pec0:158,pec1:268,max:250};
/* tipos com peças agora (na ordem das abas) e as peças de cada um */
function rodaCats(){const L=obrasOrdem();return OBRA_CATS.filter(c=>L.some(k=>obraCat(k)===c.id)).map(c=>({c,L:L.filter(k=>obraCat(k)===c.id)}));}
function rodaEl(){if(RODA.el)return RODA.el;const st=document.createElement('style');st.textContent=`
#roda-obras{position:fixed;inset:0;z-index:40;pointer-events:none;display:grid;place-items:center}
#roda-obras[hidden]{display:none}
#roda-obras .rd-caixa{position:relative;width:min(580px,82vmin);aspect-ratio:1;margin-top:-4vmin}
body.roda-aberta #obras,body.roda-aberta #obra-cats,body.roda-aberta #obra-acoes,body.roda-aberta #item-nome{visibility:hidden}
#roda-obras svg.rd-anel{position:absolute;inset:0;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 6px 18px rgba(0,0,0,.55))}
#roda-obras .rd-s{fill:rgba(12,14,16,.74);stroke:rgba(255,255,255,.1);stroke-width:1.2}
#roda-obras .rd-s.rdc{fill:rgba(20,22,24,.82)}
#roda-obras .rd-s.ativa{fill:rgba(255,138,61,.13);stroke:rgba(255,138,61,.45)}
#roda-obras .rd-s.mira{fill:rgba(255,138,61,.3);stroke:var(--ember);stroke-width:2}
#roda-obras .rd-s.atual{stroke:rgba(255,220,180,.7);stroke-width:2}
#roda-obras .rd-i{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;width:78px;text-align:center;color:var(--bone)}
#roda-obras .rd-i .ico{width:26px;height:26px}
#roda-obras .rd-i.rdc .ico{width:22px;height:22px}
#roda-obras .rd-i b{font:800 9.5px/1.1 var(--f-ui);letter-spacing:.03em;text-shadow:0 1px 2px #000;max-width:76px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#roda-obras .rd-i.rdc b{text-transform:uppercase;letter-spacing:.08em;color:var(--ash)}
#roda-obras .rd-i.ativa b{color:var(--ember)}
#roda-obras .rd-i.mira b{color:#fff}
#roda-obras .rd-i.mira .ico{opacity:1}
#roda-obras .rd-i.falta .ico{opacity:.42}
#roda-obras .rd-i.falta::after{content:"";position:absolute;top:-2px;right:22px;width:7px;height:7px;border-radius:50%;background:var(--blood-ink)}
#roda-obras .rd-i.trav{opacity:.55}
#roda-obras .rd-meio{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:110px;text-align:center;font:800 10px/1.2 var(--f-ui);color:var(--ash);letter-spacing:.06em;text-transform:uppercase}
#roda-obras .rd-info{position:absolute;left:50%;top:calc(100% + 6px);transform:translateX(-50%);width:max-content;max-width:min(560px,94vw);display:flex;flex-wrap:wrap;justify-content:center;gap:6px 10px;
  padding:8px 14px;border-radius:12px;border:1px solid var(--edge);background:var(--glass-hi);font:600 12px/1.3 var(--f-ui);color:var(--bone)}
#roda-obras .rd-info .cc{display:inline-flex;align-items:center;gap:4px}
#roda-obras .rd-info .cc .ico{width:14px;height:14px}
#roda-obras .rd-info .cc.f{color:#ff8a7a}
#roda-obras .rd-cursor{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;border:2px solid var(--ember);background:rgba(255,138,61,.25)}`;
  document.head.appendChild(st);const el=document.createElement('div');el.id='roda-obras';el.hidden=true;el.setAttribute('aria-hidden','true');
  el.innerHTML='<div class="rd-caixa"><svg class="rd-anel" viewBox="-300 -300 600 600"></svg><div class="rd-itens"></div><div class="rd-meio"></div><div class="rd-cursor"></div><div class="rd-info"></div></div>';
  (document.getElementById('jogo')||document.body).appendChild(el);return RODA.el=el;}
/* setor de anel: ângulos a partir do alto, no sentido do relógio */
function rodaSetor(r0,r1,a0,a1){const P=(r,a)=>(r*Math.sin(a)).toFixed(1)+','+(-r*Math.cos(a)).toFixed(1),g=a1-a0>Math.PI?1:0;
  return'M'+P(r1,a0)+' A'+r1+','+r1+' 0 '+g+' 1 '+P(r1,a1)+' L'+P(r0,a1)+' A'+r0+','+r0+' 0 '+g+' 0 '+P(r0,a0)+' Z';}
/* o que está sob o cursor da roda (vx, vy em pixels da roda de 600) */
function rodaMira(){const C=rodaCats(),r=Math.hypot(RODA.vx,RODA.vy);let a=Math.atan2(RODA.vx,-RODA.vy);if(a<0)a+=Math.PI*2;
  RODA.peca=null;RODA.catHover=null;if(r<RODA_R.centro||!C.length)return;
  if(r<RODA_R.pec0-4){const n=C.length,i=Math.round(a/(Math.PI*2/n))%n;RODA.cat=RODA.catHover=C[i].c.id;return;}
  const G=C.find(q=>q.c.id===RODA.cat)||C[0],n=G.L.length,i=Math.round(a/(Math.PI*2/n))%n;RODA.peca=G.L[i];}
function rodaDesenhar(){const el=rodaEl(),C=rodaCats(),G=C.find(q=>q.c.id===RODA.cat)||C[0];if(!G)return;
  const ass=RODA.cat+'|'+RODA.catHover+'|'+RODA.peca+'|'+OBRA.tipo;
  /* o cursor anda sempre; o resto só muda quando muda o que está apontado */
  const cx=el.querySelector('.rd-cursor'),k=el.querySelector('.rd-caixa').clientWidth/600;cx.style.left=(300+RODA.vx)*k+'px';cx.style.top=(300+RODA.vy)*k+'px';
  if(ass===RODA.ass)return;RODA.ass=ass;
  const nc=C.length,sc=Math.PI*2/nc,np=G.L.length,sp=Math.PI*2/np,rc=(RODA_R.cat0+RODA_R.cat1)/2,rp=(RODA_R.pec0+RODA_R.pec1)/2;let svg='',it='';
  const pos=(r,a)=>'left:'+((300+r*Math.sin(a))/6).toFixed(2)+'%;top:'+((300-r*Math.cos(a))/6).toFixed(2)+'%';
  C.forEach((q,i)=>{const a=i*sc,ativa=q.c.id===G.c.id,mira=q.c.id===RODA.catHover;
    svg+='<path class="rd-s rdc'+(ativa?' ativa':'')+(mira?' mira':'')+'" d="'+rodaSetor(RODA_R.cat0,RODA_R.cat1,a-sc/2+0.012,a+sc/2-0.012)+'"/>';
    it+='<div class="rd-i rdc'+(ativa?' ativa':'')+(mira?' mira':'')+'" style="'+pos(rc,a)+'">'+svgUse(q.c.ico)+'<b>'+q.c.nome+'</b></div>';});
  G.L.forEach((kk,i)=>{const a=i*sp,D=OBRAS[kk],lib=obraLiberada(kk),tem=lib&&invHas(custoObra(kk)),mira=kk===RODA.peca,atual=kk===OBRA.tipo;
    svg+='<path class="rd-s'+(mira?' mira':'')+(atual?' atual':'')+'" d="'+rodaSetor(RODA_R.pec0,RODA_R.pec1,a-sp/2+0.008,a+sp/2-0.008)+'"/>';
    it+='<div class="rd-i'+(mira?' mira':'')+(tem?'':lib?' falta':' trav')+'" style="'+pos(rp,a)+'">'+svgUse(lib?D.icon:'i-cadeado')+'<b>'+obraNomeCurto(D)+'</b></div>';});
  el.querySelector('svg').innerHTML=svg;el.querySelector('.rd-itens').innerHTML=it;
  const alvo=RODA.peca||(RODA.catHover?null:OBRA.tipo);
  el.querySelector('.rd-meio').textContent=RODA.peca?'':RODA.catHover?(OBRA_CATS.find(c=>c.id===RODA.catHover)||{}).nome||'':'solte no meio para não mudar';
  el.querySelector('.rd-info').innerHTML=alvo?obraNomeHTML(alvo):'Solte para escolher este tipo';}
function rodaAbrir(via){if(RODA.aberta||!OBRA.ativo||G.modo!=='jogo')return;const C=rodaCats();if(!C.length)return;
  RODA.aberta=true;RODA.via=via;RODA.vx=RODA.vy=0;RODA.cat=obraCat(OBRA.tipo);RODA.catHover=RODA.peca=null;RODA.ass='';IN.aim=false;IN.attack=false;
  const el=rodaEl();el.hidden=false;document.body.classList.add('roda-aberta');rodaDesenhar();sfx('clique');}
function rodaFechar(escolher){if(!RODA.aberta)return;RODA.aberta=false;if(RODA.el)RODA.el.hidden=true;document.body.classList.remove('roda-aberta');if(!escolher||!OBRA.ativo)return;
  let k=RODA.peca;if(!k&&RODA.catHover){const L=obrasOrdem().filter(q=>obraCat(q)===RODA.catHover),u=OBRA.ultimo&&OBRA.ultimo[RODA.catHover];k=L.includes(u)?u:L[0];}
  if(k&&k!==OBRA.tipo){OBRA.tipo=k;motivoMostrado=null;hudObras();sfx('clique');}}
function rodaMover(dx,dy){RODA.vx+=dx;RODA.vy+=dy;const r=Math.hypot(RODA.vx,RODA.vy);if(r>RODA_R.max){RODA.vx*=RODA_R.max/r;RODA.vy*=RODA_R.max/r;}rodaMira();rodaDesenhar();}
/* mouse: segurar o botão direito construindo abre; mexer aponta (a câmera não gira); soltar escolhe; o esquerdo também escolhe */
window.addEventListener('mousedown',e=>{if(G.modo!=='jogo'||cfg.tela!=='pc')return;
  if(RODA.aberta){e.stopImmediatePropagation();e.preventDefault();if(e.button===0)rodaFechar(true);return;}
  if(e.button===2&&OBRA.ativo&&(document.pointerLockElement===canvas||semTrava)){e.stopImmediatePropagation();e.preventDefault();rodaAbrir('mouse');
    if(semTrava){const k=(RODA.el.querySelector('.rd-caixa').clientWidth||600)/600;RODA.cx0=e.clientX;RODA.cy0=e.clientY;RODA.k=k;}}},true);
window.addEventListener('mouseup',e=>{if(!RODA.aberta||RODA.via!=='mouse')return;if(e.button===2){e.stopImmediatePropagation();rodaFechar(true);}},true);
window.addEventListener('mousemove',e=>{if(!RODA.aberta||RODA.via!=='mouse')return;e.stopImmediatePropagation();
  if(document.pointerLockElement===canvas){const mx=e.movementX||0,my=e.movementY||0;if(Math.abs(mx)+Math.abs(my)>400)return;rodaMover(mx*1.1,my*1.1);return;}
  const k=RODA.k||1;RODA.vx=0;RODA.vy=0;rodaMover((e.clientX-RODA.cx0)/k,(e.clientY-RODA.cy0)/k);},true);
window.addEventListener('wheel',e=>{if(RODA.aberta){e.stopImmediatePropagation();e.preventDefault();}},{capture:true,passive:false});
window.addEventListener('keydown',e=>{if(RODA.aberta&&e.code==='Escape'){e.stopImmediatePropagation();e.preventDefault();rodaFechar(false);}},true);
/* controle: construindo, tocar LB troca a aba (como antes); SEGURAR LB abre a roda (LT e X já desmontam e movem a peça).
   O analógico direito aponta (meio caminho = tipo, todo o caminho = peça); soltar LB escolhe. */
{const _lc=lerControle;lerControle=function(dt){const gp=GP.ativo&&G.modo==='jogo'&&typeof padAtual==='function'?padAtual():null;
  if(gp&&OBRA.ativo){const lb=!!(gp.buttons[4]&&(gp.buttons[4].pressed||gp.buttons[4].value>0.5));
    if(lb){GP.ant[4]=true;RODA.lbT=(RODA.lbT||0)+dt;if(RODA.lbT>=0.22&&!RODA.aberta)rodaAbrir('pad');}   // o laço de sempre não vê o aperto (a aba só troca ao soltar, se foi um toque)
    else if(RODA.lbT>0){if(RODA.aberta&&RODA.via==='pad')rodaFechar(true);else if(typeof padAbaObra==='function')padAbaObra();RODA.lbT=0;}
    if(RODA.aberta&&RODA.via==='pad'){const rx=gp.axes[2]||0,ry=gp.axes[3]||0,m=Math.hypot(rx,ry);
      if(m>0.3){const r=m<0.72?(RODA_R.cat0+RODA_R.cat1)/2:(RODA_R.pec0+RODA_R.pec1)/2-12;RODA.vx=rx/m*r;RODA.vy=ry/m*r;rodaMira();}rodaDesenhar();}}
  else RODA.lbT=0;
  const y0=P.yaw,p0=P.pitch,r=_lc.apply(this,arguments);if(RODA.aberta){P.yaw=y0;P.pitch=p0;IN.aim=false;}return r;};}
/* sai do modo de construção, abre um painel ou morre: a roda fecha sem mudar nada */
PASSOS.push(function rodaVigia(){if(RODA.aberta&&(!OBRA.ativo||G.modo!=='jogo'||!P.alive))rodaFechar(false);});
/* dica na primeira vez que constrói (PC e controle) */
{const _mo=modoObra;modoObra=function(on){const r=_mo.apply(this,arguments);if(OBRA.ativo){if(cfg.tela==='pc')dica('obraRoda','corpo',GP.ativo?'Segure LB para abrir a roda de construção: aponte com o analógico direito e solte LB para escolher a peça (um toque em LB continua trocando a aba).':'Segure o botão direito do mouse para abrir a roda de construção: aponte a peça e solte para escolher.');}else rodaFechar(false);return r;};}
