/* ================= Atividades: o que fazer no mapa, abrigos para reativar e corridas (v10.8.0, 19/11/2026) =================
   Pedido do Himalaia: "está faltando jogabilidade, coisas para fazer, itens que se conectam, coisas que se conectam, desafios ...
   hoje o jogo se baseia em matar zumbi". O jogo já tinha muita coisa (territórios, sobreviventes, destroços de avião, caixas
   militares com cronômetro, o Armazém Norte, eventos do mundo), mas escondida. Agora:
   · O que fazer: no mapa grande (M) a lista das atividades mais perto, com ícone no mapa, distância, o que falta e o prêmio.
     "Rastrear" põe a marca na bússola. Atividade em lugar que você ainda não explorou aparece com "?" (sem nome).
   · Abrigos (zonas seguras): limpe os zumbis em volta e religue a luz no quadro de força (fio, fita e fusível). Abrigo aceso:
     cama (dormir e acordar ali se cair), baú, bancada e a luz que espanta os zumbis de perto.
   · Corridas: começa na placa, 3-2-1, pontos de passagem com coluna de luz, cronômetro e medalha (bronze, prata e ouro), cada
     medalha com o seu prêmio (uma vez). O melhor tempo fica salvo. */
const ATIV={fontes:[],cache:null,cacheT:-9};
const ATIV_TIPOS={abrigo:{nome:'Abrigo',cor:'#7fd3ff',l:'A'},corrida:{nome:'Corrida',cor:'#ffd45a',l:'C'},territorio:{nome:'Território',cor:'#e8834a',l:'T'},
  sobrevivente:{nome:'Sobrevivente',cor:'#9be38b',l:'S'},destroco:{nome:'Destroço',cor:'#c9c3b5',l:'D'},cofre:{nome:'Desafio',cor:'#ff6a5a',l:'!'},evento:{nome:'Evento',cor:'#ff4a3d',l:'E'}};
function ativFonte(f){ATIV.fontes.push(f);}
function ativTodas(){if(ATIV.cache&&Math.abs((G.t||0)-ATIV.cacheT)<1)return ATIV.cache;const L=[];
  for(const f of ATIV.fontes){try{const r=f();if(r)for(const a of r)if(a&&isFinite(a.x)&&isFinite(a.z))L.push(a);}catch(e){}}ATIV.cache=L;ATIV.cacheT=G.t||0;return L;}
const ativLimpa=()=>{ATIV.cache=null;};
function ativD(){if(!G.ativ||typeof G.ativ!=='object')G.ativ={rastreio:null,corridas:{},abrigos:{}};const D=G.ativ;if(!D.corridas)D.corridas={};if(!D.abrigos)D.abrigos={};return D;}
function ativRastreada(){const id=ativD().rastreio;if(!id)return null;const a=ativTodas().find(q=>q.id===id);return a&&!a.feito?a:null;}
function ativConhecida(a){return typeof mapaConhecido!=='function'||mapaConhecido(a.x,a.z,a.r||14);}
const ativEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function ativRumo(dx,dz){const a=(Math.atan2(dx,-dz)*180/Math.PI+360+22.5)%360;return['norte','nordeste','leste','sudeste','sul','sudoeste','oeste','noroeste'][Math.floor(a/45)];}
function ativTempo(t){if(!isFinite(t))return'—';const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(1);}
function ativCusto(c){return Object.entries(c).map(([k,q])=>q+' '+((ITEMS[k]&&ITEMS[k].nome)||k).toLowerCase()).join(', ');}
function ativFalta(c){const f=[];for(const k in c){const t=invCount(k),q=c[k];if(t<q)f.push((q-t)+' '+((ITEMS[k]&&ITEMS[k].nome)||k).toLowerCase());}return f;}
function ativPremio(L){return L.map(([k,q])=>(q>1?q+' ':'')+((ITEMS[k]&&ITEMS[k].nome)||k).toLowerCase()).join(', ');}
function ativDar(L){for(const[k,q]of L){if(ITEMS[k])ganhar(k,q);}if(typeof invRender==='function')invRender();}
V8.novo.ativ=()=>{G.ativ=null;ativD();CORR.ativa=null;ativLimpa();};
V8.salvar.ativ=()=>ativD();
V8.carregar.ativ=s=>{G.ativ=s&&typeof s==='object'?s:null;ativD();CORR.ativa=null;ativLimpa();};

/* ================= no mapa: ícones e a lista "O que fazer" ================= */
MAPA_SOBRE.push(function mapaAtividades(g,X,Y,k,dp){const id=ativD().rastreio;
  for(const a of ativTodas()){const T=ATIV_TIPOS[a.tipo]||ATIV_TIPOS.evento,con=ativConhecida(a),x=X(a.x),y=Y(a.z),r=(a.feito?5:7)*dp;
    g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=a.feito?'#5a5f5a':con?T.cor:'#3a3f3a';g.fill();g.lineWidth=1.4*dp;g.strokeStyle='#070a09';g.stroke();
    g.fillStyle=a.feito?'#d8dcd8':con?'#101410':'#d8dcd8';g.font='800 '+Math.round(r*1.25)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(a.feito?'✓':con?T.l:'?',x,y+0.6*dp);
    if(a.id===id){g.beginPath();g.arc(x,y,r+4.5*dp,0,Math.PI*2);g.strokeStyle='#7fd3ff';g.lineWidth=2.2*dp;g.stroke();}}});
const CSS_ATIV=`.mapa-cartao.com-ativ{width:min(96vw,1180px)}
.mapa-corpo{display:flex;gap:14px;align-items:flex-start;justify-content:center;min-height:0}
.mapa-corpo #mapa-g{flex:0 0 auto;width:min(calc(100% - 314px),calc(94vh - 150px));margin:0}
.mapa-ativ{flex:0 0 300px;max-height:calc(94vh - 150px);overflow:auto;display:flex;flex-direction:column;gap:6px;font:500 13px/1.3 var(--f-ui)}
.mapa-ativ h3{margin:0 0 4px;font:700 14px/1.2 var(--f-ui);letter-spacing:.06em;text-transform:uppercase}
.mapa-ativ h3 small{font-weight:600;color:var(--dim);margin-left:6px;text-transform:none;letter-spacing:0}
.at-i{display:grid;grid-template-columns:22px 1fr auto;gap:8px;align-items:center;padding:7px 8px;border-radius:8px;background:rgba(255,255,255,.045)}
.at-i.at-ras{background:rgba(127,211,255,.12);outline:1px solid rgba(127,211,255,.55)}
.at-i i{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font:800 11px/1 var(--f-ui);color:#101410;font-style:normal;border:1px solid #070a09}
.at-i b{display:block;font-weight:700}.at-i small{display:block;color:var(--dim);font-size:12px;margin-top:2px}.at-i .at-p{color:#d8c27a}
.at-i .btn{width:auto;padding:5px 9px;font-size:12px;white-space:nowrap}.at-vazio{color:var(--dim);margin:0}
@media (max-width:820px){.mapa-corpo{flex-direction:column;align-items:center}.mapa-corpo #mapa-g{width:min(100%,calc(62vh - 150px))}.mapa-ativ{flex-basis:auto;width:100%;max-height:30vh}}`;
function ativPainel(){let el=$('mapa-ativ');if(el)return el;const cv=$('mapa-g');if(!cv||!cv.parentNode)return null;
  const st=document.createElement('style');st.textContent=CSS_ATIV;document.head.appendChild(st);
  const corpo=document.createElement('div');corpo.className='mapa-corpo';cv.parentNode.insertBefore(corpo,cv);corpo.appendChild(cv);
  el=document.createElement('aside');el.id='mapa-ativ';el.className='mapa-ativ';el.setAttribute('aria-label','O que fazer');corpo.appendChild(el);
  el.addEventListener('click',e=>{const b=e.target.closest('[data-rastrear]');if(!b)return;const D=ativD(),id=b.dataset.rastrear;D.rastreio=D.rastreio===id?null:id;sfx('clique');ativLista();desenharMapaGrande();});
  const c=document.querySelector('#t-mapa .mapa-cartao');if(c)c.classList.add('com-ativ');return el;}
function ativLista(){const el=ativPainel();if(!el)return;const D=ativD(),T0=ativTodas(),L=T0.filter(a=>!a.feito).map(a=>({a,d:Math.hypot(a.x-P.x,a.z-P.z)})).sort((p,q)=>p.d-q.d);
  let h='<h3>O que fazer <small>'+T0.filter(a=>a.feito).length+' de '+T0.length+' feitas</small></h3>';
  for(const{a,d}of L.slice(0,14)){const T=ATIV_TIPOS[a.tipo]||ATIV_TIPOS.evento,con=ativConhecida(a),ras=D.rastreio===a.id;
    h+='<div class="at-i'+(ras?' at-ras':'')+'"><i style="background:'+(con?T.cor:'#3a3f3a')+(con?'':';color:#d8dcd8')+'">'+(con?T.l:'?')+'</i><div><b>'+(con?ativEsc(a.nome):T.nome+' num lugar que você não explorou')+'</b>'
      +'<small>'+Math.round(d)+' m · '+ativRumo(a.x-P.x,a.z-P.z)+(con&&a.falta?' · '+ativEsc(a.falta):'')+'</small>'+(con&&a.premio?'<small class="at-p">'+ativEsc(a.premio)+'</small>':'')+'</div>'
      +'<button class="btn" type="button" data-rastrear="'+a.id+'">'+(ras?'Rastreando':'Rastrear')+'</button></div>';}
  if(!L.length)h+='<p class="at-vazio">Tudo feito por aqui.</p>';el.innerHTML=h;}
{const _dm=desenharMapaGrande;desenharMapaGrande=function(){const r=_dm.apply(this,arguments);try{ativLista();}catch(e){console.error('atividades',e);}return r;};}
/* bússola: a atividade rastreada (azul) e, na corrida, o próximo ponto (amarelo) */
function ativMarca(id,ico,cor,x,z,yaw,W2,lim,k){const m=busMarca(id,ico,cor),dx=x-P.x,dz=z-P.z,d=angDiff(yaw,Math.atan2(dx,-dz)),vis=Math.abs(d)<lim;
  if(vis!==m.v){m.v=vis;m.el.style.visibility=vis?'visible':'hidden';}if(vis)m.el.style.transform='translateX('+(W2+d*k).toFixed(1)+'px)';
  const dd=Math.round(Math.hypot(dx,dz));if(m.d!==dd){m.d=dd;m.b.textContent=dd+' m';}}
{const _hb=hudBussola;hudBussola=function(){_hb.apply(this,arguments);try{if(!busFita.offsetParent)return;const W2=busFita.clientWidth/2,lim=Math.PI*0.55,k=W2/lim,yaw=Math.atan2(cam.fwd[0],-cam.fwd[2]);
    const a=ativRastreada();if(a)ativMarca('ativ','i-alvo','#7fd3ff',a.x,a.z,yaw,W2,lim,k);
    const C=CORR.ativa;if(C&&CORR.i<C.pts.length){const p=C.pts[CORR.i];ativMarca('corrida','i-alvo','#ffd45a',p.x,p.z,yaw,W2,lim,k);}}catch(e){}};}

/* ================= abrigos ================= */
const ABRIGOS=[],ABRIGO_CUSTO={fio:2,fita:1,fusivel:1};
function abrigoNovo(o){const A=Object.assign({r:24,custo:ABRIGO_CUSTO},o);ABRIGOS.push(A);return A;}
function abrigoD(id){const D=ativD();if(!D.abrigos[id])D.abrigos[id]={limpo:false,ligado:false,bau:null};return D.abrigos[id];}
function abrigoZumbis(A){let n=0;for(const z of Z)if(z.vivo&&z.st!=='morrendo'&&z.st!=='morto'&&z.st!=='sumindo'&&!z.lan&&Math.hypot(z.x-A.x,z.z-A.z)<A.r&&Math.abs(z.y-(A.y??z.y))<14)n++;return n;}
function abrigoPronto(A){return!A.ok||A.ok();}
ativFonte(()=>ABRIGOS.filter(abrigoPronto).map(A=>{const S=abrigoD(A.id),n=S.limpo?0:abrigoZumbis(A);
  return{id:'abrigo-'+A.id,tipo:'abrigo',nome:A.nome,x:A.x,z:A.z,r:A.r,feito:S.ligado,falta:!S.limpo?(n?'limpe a área: '+n+' zumbi'+(n>1?'s':''):'chegue perto para limpar a área'):'religue a luz: '+ativCusto(A.custo),premio:'Cama, baú, bancada e lugar para voltar'};}));
let abT=0;
PASSOS.push(function abrigosPasso(dt){abT-=dt;if(abT>0)return;abT=0.5;if(G.modo!=='jogo')return;
  for(const A of ABRIGOS){if(!abrigoPronto(A))continue;const S=abrigoD(A.id),d=Math.hypot(P.x-A.x,P.z-A.z);
    if(!S.limpo&&P.alive&&d<A.r+6&&abrigoZumbis(A)===0){S.limpo=true;ativLimpa();sfx('missao');toast('corpo',A.nome+': área limpa. Religue a luz no quadro de força ('+ativCusto(A.custo)+').');
      if(typeof diarioEvento==='function')diarioEvento('Limpou a área do '+A.nome,'geral');}
    /* luz acesa: os zumbis não chegam perto (recuam até a beira da luz) */
    const L=A.luzes||[];for(const q of L){const i=FIRES.findIndex(f=>f.abrigo===A.id&&f.qi===q.i);if(S.ligado&&i<0)FIRES.push({x:q.x,y:q.y,z:q.z,lamp:true,eletrica:true,abrigo:A.id,qi:q.i});else if(!S.ligado&&i>=0)FIRES.splice(i,1);}
  }});
/* luz acesa: zumbi não entra no círculo da luz (fica na beira, como os mortos na luz das zonas seguras); quem caçava você lá dentro
   desiste e vai embora para fora. Todo quadro, só com abrigo aceso perto */
PASSOS.push(function abrigosLuz(dt){if(G.modo!=='jogo')return;for(const A of ABRIGOS){if(!abrigoPronto(A))continue;const S=abrigoD(A.id);if(!S.ligado||Math.hypot(P.x-A.x,P.z-A.z)>A.r+90)continue;
  const rIn=A.r*0.55,dentro=Math.hypot(P.x-A.x,P.z-A.z)<rIn;
  for(const z of Z){if(!z.vivo||z.chefe||z.lan||z.st==='morrendo'||z.st==='morto'||z.st==='sumindo'||z.st==='derrubado')continue;
    const dx=z.x-A.x,dz=z.z-A.z,dd=Math.hypot(dx,dz);if(dd>rIn+0.5||Math.abs(z.y-(A.y??z.y))>6)continue;const ux=dd>0.01?dx/dd:1,uz=dd>0.01?dz/dd:0;
    if(dd<rIn){z.x=A.x+ux*rIn;z.z=A.z+uz*rIn;}
    if(dentro&&(z.st==='caca'||z.st==='golpe'||z.st==='alerta')){z.st='alerta';z.ax=A.x+ux*(A.r+8);z.az=A.z+uz*(A.r+8);z.ay=ground(z.ax,z.az);z.ouvir=null;z.viu=0;}}}});
INTERS.push(tryIt=>{for(const A of ABRIGOS){if(!abrigoPronto(A)||Math.hypot(P.x-A.x,P.z-A.z)>A.r+6)continue;const S=abrigoD(A.id);
    if(A.quadro)tryIt({k:'abrigoQuadro',o:A},A.quadro.x,A.quadro.z,1.6,2.4,-1,A.quadro.y);
    if(S.ligado){if(A.cama)tryIt({k:'abrigoCama',o:A},A.cama.x,A.cama.z,1.5,2.4,-1,A.cama.y);if(A.bau)tryIt({k:'abrigoBau',o:A},A.bau.x,A.bau.z,1.4,2.4,-1,A.bau.y);}}});
INTER_K.abrigoQuadro={texto:A=>{const S=abrigoD(A.id);if(S.ligado)return{t:'Quadro de força do abrigo',s:'a luz está acesa'};
    if(!S.limpo){const n=abrigoZumbis(A);return{t:'Quadro de força sem luz',s:n?'limpe a área antes: '+n+' zumbi'+(n>1?'s':'')+' por perto':'limpando a área…'};}
    const f=ativFalta(A.custo);return f.length?{t:'Quadro de força sem luz',s:'falta '+f.join(', ')}:{t:'Religar a luz do abrigo',s:'gasta '+ativCusto(A.custo)+' · segure',hold:true,dur:2.4};},
  usar:(A,seg)=>{const S=abrigoD(A.id);if(S.ligado||!S.limpo)return;if(ativFalta(A.custo).length){sfx('vazio');return;}if(!seg)return;
    for(const k in A.custo)invRemove(k,A.custo[k]);S.ligado=true;ativLimpa();sfx('construir');sfx('missao');ganharXP(80);P.shake=Math.max(P.shake||0,0.15);
    toast('habilidade',A.nome+' aceso! Cama (dormir e voltar aqui se cair), baú e bancada. A luz não deixa os zumbis chegarem perto.');
    if(typeof diarioEvento==='function')diarioEvento('Religou a luz do '+A.nome+': abrigo pronto','geral');if(typeof invRender==='function')invRender();}};
INTER_K.abrigoCama={texto:A=>({t:'Cama do abrigo',s:'toque: salvar e voltar aqui se cair · segure: dormir',hold:true,dur:0.8,alt:true}),
  usar:(A,seg)=>{const c=A.cama;G.cama={x:c.x,y:c.y,z:c.z,vagao:true,abrigo:A.id};if(seg&&typeof sonoComecar==='function'){sonoComecar({cama:true,x:c.x,y:c.y,z:c.z});return;}
    salvarJogo();P.vida=Math.min(vidaMax(),P.vida+5);toast('corpo','Jogo salvo. Se cair, você acorda no '+A.nome+'.');sfx('pegar');},
  curto:A=>{const c=A.cama;G.cama={x:c.x,y:c.y,z:c.z,vagao:true,abrigo:A.id};salvarJogo();toast('corpo','Jogo salvo. Se cair, você acorda no '+A.nome+'.');sfx('pegar');}};
INTER_K.abrigoBau={texto:A=>({t:'Baú do abrigo',s:'guarde o que quiser aqui'}),usar:A=>{const S=abrigoD(A.id);if(!S.bau)S.bau=new Array(BAU_N).fill(null);abrirBau({itens:S.bau,nome:'Baú: '+A.nome});}};
{const _pb=pertoBancada;pertoBancada=function(){if(_pb.apply(this,arguments))return true;for(const A of ABRIGOS){if(!A.bancada||!abrigoD(A.id).ligado)continue;if(Math.hypot(P.x-A.bancada.x,P.z-A.bancada.z)<2.6&&Math.abs(P.y-A.bancada.y)<1.6)return true;}return false;};}
/* lâmpadas do abrigo aceso: brilho de noite */
DESENHO.aditivo.push(function abrigoBrilho(){const n=E.n||0;for(const A of ABRIGOS){if(!A.luzes||!abrigoPronto(A)||!abrigoD(A.id).ligado)continue;if(d2(A.x,A.z,cam.pos[0],cam.pos[2])>140*140)continue;
  for(const q of A.luzes)bb(q.x,q.y,q.z,0.22+0.5*n,1,0.9,0.65,0.35+0.55*n);}});

/* ================= corridas ================= */
const CORRIDAS=[],CORR={ativa:null,t:0,i:0,falou:0,hud:null};
function corridaNova(o){const C=Object.assign({r:3.2},o);for(const p of C.pts){p.r=p.r||C.r;p.h=p.h||3.2;}CORRIDAS.push(C);return C;}
function corridaD(id){const D=ativD();if(!D.corridas[id])D.corridas[id]={melhor:null,medalha:null};return D.corridas[id];}
const MEDALHAS=['bronze','prata','ouro'],MEDALHA_NOME={bronze:'bronze',prata:'prata',ouro:'ouro'};
function corridaMedalha(C,t){return t<=C.tempos.ouro?'ouro':t<=C.tempos.prata?'prata':t<=C.tempos.bronze?'bronze':null;}
ativFonte(()=>CORRIDAS.filter(C=>!C.ok||C.ok()).map(C=>{const S=corridaD(C.id);
  return{id:'corrida-'+C.id,tipo:'corrida',nome:C.nome,x:C.ini.x,z:C.ini.z,r:20,feito:S.medalha==='ouro',
    falta:S.melhor?'seu melhor: '+ativTempo(S.melhor)+(S.medalha?' ('+MEDALHA_NOME[S.medalha]+')':''):'comece na placa',
    premio:'ouro '+ativTempo(C.tempos.ouro)+': '+ativPremio(C.premios.ouro)};}));
INTERS.push(tryIt=>{if(CORR.ativa)return;for(const C of CORRIDAS){if(C.ok&&!C.ok())continue;const q=C.ini;if(Math.abs(P.x-q.x)>3||Math.abs(P.z-q.z)>3||Math.abs(P.y-q.y)>1.4)continue;tryIt({k:'corridaIni',o:C},q.x,q.z,2.6,2.6,-1,q.y);}});
INTER_K.corridaIni={texto:C=>{const S=corridaD(C.id);return{t:'Começar a corrida: '+C.nome,s:(S.melhor?'seu melhor '+ativTempo(S.melhor)+' · ':'')+'ouro '+ativTempo(C.tempos.ouro)+' · prata '+ativTempo(C.tempos.prata)+' · bronze '+ativTempo(C.tempos.bronze)};},
  usar:C=>corridaComecar(C)};
function corridaComecar(C){if(CORR.ativa||!P.alive)return;CORR.ativa=C;CORR.t=-3;CORR.i=0;CORR.falou=4;sfx('clique');ativLimpa();
  toast('corpo',C.nome+': passe pelas colunas de luz na ordem. '+(C.dica||'Por cima dos telhados é mais rápido.'));}
function corridaFim(C,ok){const t=CORR.t;CORR.ativa=null;corridaHud(null);ativLimpa();if(!ok)return;
  const S=corridaD(C.id),m=corridaMedalha(C,t),antes=S.medalha,ia=antes?MEDALHAS.indexOf(antes):-1,im=m?MEDALHAS.indexOf(m):-1,novo=S.melhor===null||t<S.melhor;
  if(novo)S.melhor=+t.toFixed(2);let pr=[];if(im>ia){for(let k=ia+1;k<=im;k++){const md=MEDALHAS[k];pr=pr.concat(C.premios[md]||[]);ganharXP(C.xp[md]||0);}S.medalha=m;}
  if(pr.length)ativDar(pr);sfx(m?'missao':'clique');
  toast(m?'habilidade':'corpo',C.nome+': '+ativTempo(t)+(m?' · medalha de '+MEDALHA_NOME[m]+'!':' · sem medalha (bronze em '+ativTempo(C.tempos.bronze)+')')+(novo&&S.melhor!==null?' · novo recorde':'')+(pr.length?' · prêmio: '+ativPremio(pr):''));
  if(m&&typeof diarioEvento==='function')diarioEvento(C.nome+': '+ativTempo(t)+' (medalha de '+MEDALHA_NOME[m]+')','geral');}
PASSOS.push(function corridaPasso(dt){const C=CORR.ativa;if(!C)return;if(G.modo!=='jogo')return;
  if(!P.alive){toast('corpo','Corrida perdida.');corridaFim(C,false);return;}
  CORR.t+=dt;if(CORR.t<0){const s=Math.ceil(-CORR.t);if(s!==CORR.falou){CORR.falou=s;sfx('clique');}corridaHud(C);return;}
  if(CORR.falou!==0){CORR.falou=0;sfx('missao');}
  const p=C.pts[CORR.i];if(p&&Math.hypot(P.x-p.x,P.z-p.z)<p.r&&P.y>p.y-1.2&&P.y<p.y+p.h){CORR.i++;sfx('pegar');if(CORR.i>=C.pts.length){corridaFim(C,true);return;}}
  if(CORR.t>C.tempos.bronze*1.8){toast('corpo',C.nome+': tempo esgotado.');corridaFim(C,false);return;}
  const q=C.pts[CORR.i];if(q&&Math.hypot(P.x-q.x,P.z-q.z)>320){toast('corpo',C.nome+': você saiu do caminho.');corridaFim(C,false);return;}
  corridaHud(C);});
function corridaHud(C){let el=CORR.hud;if(!C){if(el)el.hidden=true;return;}
  if(!el){el=document.createElement('div');el.id='corrida-hud';el.setAttribute('aria-live','off');
    el.style.cssText='position:fixed;left:50%;top:86px;transform:translateX(-50%);z-index:30;padding:8px 16px;border-radius:12px;background:rgba(10,14,12,.72);color:#f0ece0;font:700 15px/1.25 var(--f-ui,system-ui);text-align:center;pointer-events:none;letter-spacing:.02em;box-shadow:0 2px 12px rgba(0,0,0,.35)';
    (document.body).appendChild(el);CORR.hud=el;}
  el.hidden=false;const S=corridaD(C.id),t=CORR.t;
  el.innerHTML=t<0?'<span style="font-size:28px">'+Math.ceil(-t)+'</span>':'<span style="font-size:22px;font-variant-numeric:tabular-nums">'+ativTempo(t)+'</span><br><small style="font-weight:600;color:#c8c2b4">'+C.nome+' · ponto '+(CORR.i+1)+' de '+C.pts.length+(S.melhor?' · seu melhor '+ativTempo(S.melhor):'')+' · ouro '+ativTempo(C.tempos.ouro)+'</small>';}
/* colunas de luz: o ponto da vez forte, o seguinte fraco; a placa de largada brilha quando não tem corrida */
DESENHO.aditivo.push(function corridaBrilho(){const C=CORR.ativa,pul=0.75+0.25*Math.sin((G.t||0)*5);
  if(C){for(let j=0;j<2;j++){const p=C.pts[CORR.i+j];if(!p)break;const a=j?0.18:0.55*pul;for(let y=0;y<7;y+=0.45)bb(p.x,p.y+y,p.z,0.55-y*0.04,1,0.82,0.25,a*(1-y/8));bb(p.x,p.y+0.2,p.z,1.4,1,0.82,0.25,a*0.6);}return;}
  for(const K of CORRIDAS){if(K.ok&&!K.ok())continue;const q=K.ini;if(d2(q.x,q.z,cam.pos[0],cam.pos[2])>70*70)continue;for(let y=2.6;y<4.4;y+=0.45)bb(q.x,q.y+y,q.z,0.32,1,0.82,0.25,0.3*pul);}});

/* ================= o que já existia no jogo, agora na lista ================= */
ativFonte(()=>typeof TERR_DEF==='undefined'?[]:TERR_DEF.map(d=>{const T=terrD().t[d.id],dono=!!(T&&T.dono);
  return{id:'terr-'+d.id,tipo:'territorio',nome:'Tomar: '+d.nome,x:d.x,z:d.z,r:d.r,feito:dono,falta:'limpe os zumbis e finque a bandeira do grupo',premio:'Produz toda manhã: '+Object.keys(d.prod).map(k=>((ITEMS[k]&&ITEMS[k].nome)||k).toLowerCase()).join(', ')};}));
ativFonte(()=>typeof SOBREV==='undefined'?[]:SOBREV.filter(s=>s.st==='espera'||s.st==='segue').map(s=>({id:'sobrev-'+s.id,tipo:'sobrevivente',nome:'Resgatar '+s.nome,x:s.ox??s.x,z:s.oz??s.z,r:12,feito:false,
  falta:s.st==='segue'?'leve até o acampamento':'fale com '+s.nome.split(' ')[0],premio:'Mora no acampamento e trabalha para o grupo'})));
ativFonte(()=>typeof AEREO==='undefined'?[]:AEREO.destrocos.map(d=>({id:'destroco-'+d.id,tipo:'destroco',nome:d.nome,x:d.x,z:d.z,r:16,feito:!!(aereoD().docs||{})[d.id],falta:'ache o documento a bordo',premio:'Saque e sinalizador'})));
ativFonte(()=>typeof CXM_DEF==='undefined'?[]:CXM_DEF.map(d=>{const c=cxmD()[d.id];return{id:'cxm-'+d.id,tipo:'cofre',nome:d.nome,x:d.ax,z:d.az,r:12,feito:c.st==='aberta',falta:c.st==='contando'?'aguente até abrir':'segure E para ligar e defenda 2 minutos',premio:'Munição, kit e às vezes uma arma'};}));
ativFonte(()=>{if(typeof DSF==='undefined'||!DSF.p)return[];const D=dsfD(),p=DSF.p;return[{id:'dsf-armazem',tipo:'cofre',nome:'Armazém Norte',x:(p.x0+p.x1)/2,z:(p.z0+p.z1)/2,r:20,feito:!!D.cartao&&!!D.luz,
  falta:!D.fus?'ache um fusível e religue o quadro de força':!D.luz?'puxe a alavanca do quadro':'ache o cartão na mesa do supervisor',premio:'Armário de equipamento da sala de segurança'}];});
ativFonte(()=>{if(typeof mundoD!=='function')return[];const M=mundoD(),L=[];for(const e of M.ev||[]){if(!e||e.fim||!isFinite(e.x)||!isFinite(e.z))continue;
  const nome={infestacao:'Ninho de zumbis',comboio:'Comboio tombado',estrada:'Estrada bloqueada',incendio:'Incêndio na mata'}[e.tipo];if(!nome)continue;
  L.push({id:'ev-'+e.tipo+'-'+Math.round(e.x)+'_'+Math.round(e.z),tipo:'evento',nome,x:e.x,z:e.z,r:20,feito:false,falta:e.tipo==='infestacao'?'destrua o ninho e limpe a área':e.tipo==='comboio'?'revistar as caixas':'',premio:e.tipo==='infestacao'?'Saque do ninho':''});}return L;});
/* depois de morrer: acorda no abrigo da cama escolhida (o renascer já trata G.cama.vagao); se a luz apagou, volta para a barraca */
{const _rn=renascer;renascer=function(){if(G.cama&&G.cama.abrigo){const A=ABRIGOS.find(q=>q.id===G.cama.abrigo);if(!A||!abrigoD(A.id).ligado)G.cama=null;}return _rn.apply(this,arguments);};}
