/* ================= Fios no mundo, como no Rust (v10.3.1, 18/11/2026) =================
   Himalaia: "esses fios estão muito soltos, melhore essa jogabilidade... os itens, as chaves que podem mexer, como fazer os cabos, a
   parte do painel solar... consegue fazer igual do Rust?". Agora:
   · ALICATE NA MÃO = ferramenta de fio. Com ele na barra (1 a 6) e escolhido, aparecem as tomadas das peças elétricas por perto:
     amarela = saída, verde = entrada (apagada = ocupada). Mire numa saída e clique: o fio sai dela. Clique no chão, na parede ou
     no muro para PRENDER o fio ali (até 10 pontos: ele segue o caminho que você fizer). Clique numa entrada para ligar. Botão
     direito desfaz o último ponto (ou cancela); numa tomada já ligada, corta o fio dela (o fio volta para a mochila).
     O fio gasta 1 a cada 4 m do caminho de verdade (com as voltas). A tela de fios (U) continua para ver a rede de cima.
   · Os fios saem das TOMADAS de cada peça (não do meio dela) e não ficam soltos no ar: preso nos pontos que você escolheu, ou,
     ligado pela tela de fios, desce até o chão e corre rente ao chão, com grampos, e sobe na outra peça.
   · BOTÃO (aba Energia): aperte E e ele deixa a energia passar por alguns segundos (portão que abre e fecha sozinho, alarme...).
   · PLACA SOLAR: gera mais virada para o sol (gire com R antes de pôr; ela fica de frente para onde você olha). */
const FIOM={de:null,pts:[],alvo:null,cur:null,prev:null,prevSig:'',t:0,max:10,alc:5.5,hint:null,ultMsg:'',msgT:0,cubos:null};
/* tomadas (no espaço da peça: x para o lado, y altura, z para a frente). Peça sem desenho próprio: na frente, a meia altura */
const PINO_TIPO={interruptor:{e:[[-0.07,1.0,0.06]],s:[[0.07,1.0,0.06]]},temporizador:{e:[[-0.07,1.0,0.06]],s:[[0.07,1.0,0.06]]},sensor:{e:[[-0.07,1.0,0.06]],s:[[0.07,1.0,0.06]]},
  botao:{e:[[-0.07,1.0,0.06]],s:[[0.07,1.0,0.06]]},divisor:{e:[[-0.2,0.9,0.08]],s:[[-0.02,0.9,0.08],[0.07,0.9,0.08],[0.16,0.9,0.08]]},
  combinador:{e:[[-0.16,0.9,0.08],[-0.06,0.9,0.08]],s:[[0.16,0.9,0.08]]},bateriaBase:{e:[[-0.42,0.6,0.33]],s:[[0.3,0.6,0.33],[0.42,0.6,0.33]]},
  luminaria:{e:[[0,0.3,0.05]]},poste:{e:[[0,0.45,0.1]]},rodaDagua:{s:[[1.28,0.45,0.1],[1.28,0.45,-0.1]]},cataVento:{s:[[0.3,0.5,0.46],[0.42,0.5,0.46]]},
  placaSolar:{s:[[0,0.42,-0.3]]}};
function pinosDe(o){const d=ELET[o.tipo];if(!d||o.hp<=0)return[];const D=OBRAS[o.tipo]||{},T=PINO_TIPO[o.tipo];let Ent=T&&T.e||[],Sai=T&&T.s||[];
  if(!T){const h=clamp((ELET_ALT[o.tipo]??D.hCol??1)*0.55,0.2,1.6),z=(D.hd||0.3)+0.03;Ent=[];Sai=[];for(let i=0;i<d.ent;i++)Ent.push([-0.14-0.1*i,h,z]);for(let i=0;i<d.sai;i++)Sai.push([0.14+0.12*i,h,z]);}
  const c=Math.cos(o.yaw||0),s=Math.sin(o.yaw||0),W=l=>[o.x+l[0]*c+l[2]*s,(o.y??ground(o.x,o.z))+l[1],o.z-l[0]*s+l[2]*c],out=[];
  /* via: pontos por onde o fio passa logo ao sair da tomada (o quadro: das entradas de cima o fio sobe e desce por trás do poste) */
  for(let i=0;i<d.ent;i++){const t={o,k:'e',i,p:W(Ent[i]||Ent[Ent.length-1]||[0,0.5,0.3])};if(T&&T.ev&&T.ev[i])t.via=T.ev[i].map(W);out.push(t);}
  for(let i=0;i<d.sai;i++){const t={o,k:'s',i,p:W(Sai[i]||Sai[Sai.length-1]||[0.15,0.5,0.3])};if(T&&T.sv&&T.sv[i])t.via=T.sv[i].map(W);out.push(t);}return out;}
/* em qual tomada cada fio está: pela ordem dos fios de cada peça */
function fioTomadas(){const sai=new Map(),ent=new Map(),r=new Map();for(const f of ENER.fios){const a=sai.get(f.a)||0,b=ent.get(f.b)||0;sai.set(f.a,a+1);ent.set(f.b,b+1);r.set(f,[a,b]);}return r;}
function tomadaOcupada(t){const id=t.o.ext&&t.o.ext.eid;if(!id)return false;const L=ENER.fios.filter(f=>t.k==='s'?f.a===id:f.b===id);return L.length>t.i;}
function fioDaTomada(t){const id=t.o.ext&&t.o.ext.eid;if(!id)return null;const L=ENER.fios.filter(f=>t.k==='s'?f.a===id:f.b===id);return L[t.i]||L[L.length-1]||null;}
/* o caminho do fio: tomada → pontos presos → tomada; sem pontos, rente ao chão (desce, corre com grampos e sobe) */
const chaoFio=(x,z,yRef)=>{let y=typeof chaoEm==='function'?chaoEm(x,z,yRef):ground(x,z);if(!(y>-1e8))y=ground(x,z);const n=aguaNivel(x,z);if(n!==null&&n>y+0.05)y=n+0.12;return y+0.035;};
function fioCaminho(A0,B0,pts,va,vb){if(pts&&pts.length)va=vb=null;   // com pontos presos, quem decide o caminho é o jogador
  const A=va&&va.length?va[va.length-1]:A0,B=vb&&vb.length?vb[vb.length-1]:B0;let C;
  if(pts&&pts.length)C={L:[A,...pts,B],chao:false};
  else{const dh=Math.hypot(B[0]-A[0],B[2]-A[2]);if(dh<2.2)C={L:[A,B],chao:false,curto:true};
    else{const ya=chaoFio(A[0],A[2],A[1]),yb=chaoFio(B[0],B[2],B[1]),L=[A,[A[0],Math.min(A[1],ya),A[2]]],n=Math.ceil(dh);
      for(let i=1;i<n;i++){const t=i/n,x=A[0]+(B[0]-A[0])*t,z=A[2]+(B[2]-A[2])*t,yr=A[1]+(B[1]-A[1])*t;L.push([x,chaoFio(x,z,yr),z]);}
      L.push([B[0],Math.min(B[1],yb),B[2]],B);C={L,chao:true};}}
  if(va&&va.length)C.L=[A0,...va.slice(0,-1),...C.L];if(vb&&vb.length)C.L=[...C.L,...vb.slice(0,-1).reverse(),B0];return C;}
function caminhoComp(L){let s=0;for(let i=1;i<L.length;i++)s+=Math.hypot(L[i][0]-L[i-1][0],L[i][1]-L[i-1][1],L[i][2]-L[i-1][2]);return s;}
/* malha de um caminho: fio de borracha (com pouca barriga entre pontos no ar), conector nas pontas e grampos no chão */
function fioGeoCaminho(g,C,cor,cor2,grampo){const L=C.L;
  for(let i=0;i<L.length-1;i++){const A=L[i],B=L[i+1],l=Math.hypot(B[0]-A[0],B[1]-A[1],B[2]-A[2]);if(l<1e-3)continue;const sag=C.chao?0:Math.min(0.35,(C.curto?0.05:0.015)*l),n=sag>0.02?Math.max(2,Math.ceil(l/0.9)):1;
    const pt=t=>[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t-sag*4*t*(1-t),A[2]+(B[2]-A[2])*t];
    for(let k=0;k<n;k++){const p=pt(k/n),q=pt((k+1)/n),dx=q[0]-p[0],dy=q[1]-p[1],dz=q[2]-p[2],ll=Math.hypot(dx,dy,dz);if(ll<1e-4)continue;
      add(g,boxTris(0.034,0.034,ll+0.012),mat((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2,-Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(dx,dz),0),cor);}}
  add(g,boxTris(0.06,0.06,0.06),mat(L[0][0],L[0][1],L[0][2]),cor2);const Z=L[L.length-1];add(g,boxTris(0.06,0.06,0.06),mat(Z[0],Z[1],Z[2]),cor2);
  if(grampo){if(C.chao){let acc=0;for(let i=2;i<L.length-2;i++){acc+=Math.hypot(L[i][0]-L[i-1][0],L[i][2]-L[i-1][2]);if(acc>=2.4){acc=0;add(g,boxTris(0.09,0.03,0.03),mat(L[i][0],L[i][1]+0.02,L[i][2],0,Math.atan2(L[i+1][0]-L[i-1][0],L[i+1][2]-L[i-1][2])+Math.PI/2,0),grampo);}}}
    else for(let i=1;i<L.length-1;i++)add(g,boxTris(0.07,0.07,0.07),mat(L[i][0],L[i][1],L[i][2]),grampo);}}
/* troca o desenho dos fios do 61o: saem das tomadas e seguem o caminho */
fiosMontar=function(){const g=new GB(4096,8),cor=lin(0x1d1d1b),cor2=lin(0x3a3226),gr=lin(0x55595c),T=fioTomadas();
  for(const f of ENER.fios){const a=eletPorEid(f.a),b=eletPorEid(f.b);if(!a||!b)continue;const ix=T.get(f)||[0,0],pa=pinosDe(a).filter(t=>t.k==='s'),pb=pinosDe(b).filter(t=>t.k==='e');
    const ta=pa[ix[0]]||pa[0]||{p:[a.x,a.y+1,a.z]},tb=pb[ix[1]]||pb[0]||{p:[b.x,b.y+1,b.z]};fioGeoCaminho(g,fioCaminho(ta.p,tb.p,f.pts,ta.via,tb.via),cor,cor2,gr);}
  return g.n?litMesh(g.data()):null;};
{const _fa=fiosAssinatura;fiosAssinatura=function(){let s=_fa.apply(this,arguments);for(const f of ENER.fios)if(f.pts)s+='p'+f.pts.length;for(const o of OB)if(ELET[o.tipo])s+=Math.round((o.yaw||0)*100);return s;};}

/* ---------- a ferramenta: alicate na mão ---------- */
function fiomAtivo(){const s=selItem();return!!(s&&s.id==='alicate'&&!(s.dur<=0)&&G.modo==='jogo'&&P.alive&&!OBRA.ativo&&!CARRO.ativo&&cfg.tela==='pc');}
function fiomTomadasPerto(){const L=[];for(const o of OB){if(!ELET[o.tipo]||o.hp<=0||d2(o.x,o.z,P.x,P.z)>11*11)continue;eidDe(o);for(const t of pinosDe(o))L.push(t);}return L;}
function fiomMira(){const L=fiomTomadasPerto(),cw=W/2,ch=H/2,R=Math.max(26,H*0.045);let best=null,bd=R;
  for(const t of L){if(d2(t.p[0],t.p[2],P.x,P.z)>FIOM.alc*FIOM.alc)continue;const s=project(t.p);if(!s)continue;const d=Math.hypot(s[0]-cw,s[1]-ch);if(d<bd){bd=d;best=t;}}
  FIOM.alvo=best;FIOM.lista=L;
  let cur=null;if(best)cur=best.p.slice();else if(FIOM.de){const pm=pontoMira((cfg.cam==='1'?0:camDist)+FIOM.alc+1),dc=Math.hypot(pm[0]-cam.pos[0],pm[1]-cam.pos[1],pm[2]-cam.pos[2]);
    if(dc<(cfg.cam==='1'?0:camDist)+FIOM.alc&&d2(pm[0],pm[2],P.x,P.z)<FIOM.alc*FIOM.alc)cur=pm;}
  FIOM.cur=cur;}
function fiomUltimo(){return FIOM.pts.length?FIOM.pts[FIOM.pts.length-1]:FIOM.de.p;}
function fiomComp(fim){const L=[FIOM.de.p,...FIOM.pts];if(fim)L.push(fim);return caminhoComp(L);}
function fiomMsg(t){FIOM.ultMsg=t;FIOM.msgT=2.2;}
function fiomCancelar(m){FIOM.de=null;FIOM.pts=[];if(m)fiomMsg(m);}
function fiomClique(){const t=FIOM.alvo,al=temAlicate();
  if(!FIOM.de){if(!t){fiomMsg('Mire numa tomada amarela (saída) para puxar um fio.');sfx('vazio');return;}
    if(t.k!=='s'){fiomMsg('Comece numa saída (tomada amarela). Esta é a entrada de '+eletNome(t.o).toLowerCase()+'.');sfx('vazio');return;}
    if(tomadaOcupada(t)){fiomMsg('Essa saída já tem fio: botão direito corta.');sfx('vazio');return;}
    if(invCount('fio')<1){fiomMsg('Sem fio na mochila (bancada: sucata e linha dão 4).');sfx('vazio');return;}
    FIOM.de=t;FIOM.pts=[];sfx('clique',t.p[0],t.p[2],0.7);return;}
  const a=FIOM.de.o;
  if(t&&t.k==='e'){const b=t.o,m=b===a?'Escolha outra peça':podeLigar(a,b);if(m){fiomMsg(m+'.');sfx('vazio');return;}
    if(tomadaOcupada(t)){fiomMsg('Essa entrada já tem fio.');sfx('vazio');return;}
    const L=fiomComp(t.p),n=Math.max(1,Math.ceil(L/FIO_M));if(L>45){fiomMsg('Fio comprido demais ('+Math.round(L)+' m; até 45 m).');sfx('vazio');return;}
    if(invCount('fio')<n){fiomMsg('Faltam fios: precisa de '+n+' (tem '+invCount('fio')+').');sfx('vazio');return;}
    invRemove('fio',n);ENER.fios.push({a:eidDe(a),b:eidDe(b),n,pts:FIOM.pts.map(q=>q.map(v=>Math.round(v*100)/100))});ENER.fv++;eletMapa();energiaResolver(0);energiaEfeitos(0);
    if(al)gastar(al,1);progresso('fioLigado');ganharXP(1);sfx('clique',t.p[0],t.p[2],0.9);feed('Fio ligado: '+eletNome(a).toLowerCase()+' → '+eletNome(b).toLowerCase()+' ('+n+' fio'+(n>1?'s':'')+')');fiomCancelar();return;}
  if(t&&t.k==='s'){fiomMsg('Termine numa entrada (tomada verde).');sfx('vazio');return;}
  if(!FIOM.cur){fiomMsg('Longe demais: prenda o fio mais perto.');sfx('vazio');return;}
  if(FIOM.pts.length>=FIOM.max){fiomMsg('No máximo '+FIOM.max+' pontos: ligue numa entrada.');sfx('vazio');return;}
  if(Math.hypot(FIOM.cur[0]-fiomUltimo()[0],FIOM.cur[1]-fiomUltimo()[1],FIOM.cur[2]-fiomUltimo()[2])<0.25)return;
  FIOM.pts.push(FIOM.cur.slice());sfx('clique',FIOM.cur[0],FIOM.cur[2],0.4);}
function fiomDireito(){if(FIOM.de){if(FIOM.pts.length){FIOM.pts.pop();sfx('clique');}else{fiomCancelar('Fio cancelado.');sfx('clique');}return;}
  const t=FIOM.alvo;if(!t)return;const f=fioDaTomada(t);if(!f){fiomMsg('Essa tomada não tem fio.');return;}const al=temAlicate();
  const a=eletPorEid(f.a),b=eletPorEid(f.b);cortarFio(f);if(al)gastar(al,1);feed('Fio cortado'+(a&&b?': '+eletNome(a).toLowerCase()+' → '+eletNome(b).toLowerCase():'')+(f.n?' ('+f.n+' fio'+(f.n>1?'s':'')+' de volta)':''));}
window.addEventListener('mousedown',e=>{if(!fiomAtivo())return;if(!document.pointerLockElement&&!semTrava)return;if(e.button!==0&&e.button!==2)return;
  e.stopImmediatePropagation();e.preventDefault();if(e.button===0)fiomClique();else fiomDireito();},true);
window.addEventListener('keydown',e=>{if(!fiomAtivo()||e.repeat)return;if(e.code==='Backspace'&&FIOM.de){e.preventDefault();fiomDireito();}});
/* dica embaixo da mira */
{const st=document.createElement('style');st.textContent='.fio-hint{position:fixed;left:50%;top:calc(50% + 34px);transform:translateX(-50%);z-index:5;max-width:min(560px,86vw);padding:7px 12px;border-radius:9px;background:rgba(12,15,13,.78);border:1px solid rgba(255,255,255,.1);color:#ece4d2;font:600 13.5px/1.35 var(--f-ui,system-ui),sans-serif;text-align:center;pointer-events:none}.fio-hint b{color:#ffcf8a}.fio-hint small{display:block;color:#a9a392;font-weight:600;font-size:12px;margin-top:2px}.fio-hint .ok{color:#8fd16a}.fio-hint .ruim{color:#e2735a}';document.head.appendChild(st);
  const el=document.createElement('div');el.className='fio-hint';el.hidden=true;el.setAttribute('aria-live','polite');document.body.appendChild(el);FIOM.hint=el;}
function fiomTexto(){const t=FIOM.alvo,nf=invCount('fio');let h='',s='';
  if(!FIOM.de){if(t){const est=eletEstado(t.o),oc=tomadaOcupada(t);h='<b>'+eletNome(t.o)+'</b> · '+(t.k==='s'?'saída':'entrada')+(ELET[t.o.tipo][t.k==='s'?'sai':'ent']>1?' '+(t.i+1):'')+(est?' · '+est:'');
      s=oc?'botão direito: cortar o fio desta tomada':t.k==='s'?'clique para puxar um fio daqui':'comece numa saída (amarela) e termine aqui';}
    else{h='Alicate: mire numa tomada <b>amarela</b> (saída) e clique para puxar um fio';s='verde = entrada · apagada = ocupada · '+nf+' fio'+(nf===1?'':'s')+' na mochila';}}
  else{const fim=t&&t.k==='e'?t.p:FIOM.cur,L=fiomComp(fim),n=Math.max(1,Math.ceil(L/FIO_M));
    if(t&&t.k==='e'){const m=t.o===FIOM.de.o?'Escolha outra peça':podeLigar(FIOM.de.o,t.o)||(tomadaOcupada(t)?'Essa entrada já tem fio':'');h=m?'<span class="ruim">'+m+'</span>':'Ligar em <b>'+eletNome(t.o)+'</b> · '+L.toFixed(1).replace('.',',')+' m = <span class="'+(nf>=n?'ok':'ruim')+'">'+n+' fio'+(n>1?'s':'')+'</span> (tem '+nf+')';}
    else h='Puxando fio de <b>'+eletNome(FIOM.de.o)+'</b> · '+L.toFixed(1).replace('.',',')+' m = '+n+' fio'+(n>1?'s':'')+' (tem '+nf+')';
    s='clique no chão, no muro ou na parede para prender ('+FIOM.pts.length+' de '+FIOM.max+') · clique numa entrada verde para ligar · botão direito desfaz';}
  if(FIOM.msgT>0)s='<span class="ruim">'+FIOM.ultMsg+'</span>';return h+'<small>'+s+'</small>';}
let FIOM_TXT='';
HUDS.push(function fiomHud(dt){const on=fiomAtivo();if(!on){if(FIOM.de)fiomCancelar();if(FIOM.hint&&!FIOM.hint.hidden)FIOM.hint.hidden=true;FIOM.alvo=null;return;}
  FIOM.msgT=Math.max(0,FIOM.msgT-(dt||0.016));fiomMira();const h=fiomTexto();if(h!==FIOM_TXT){FIOM_TXT=h;FIOM.hint.innerHTML=h;}FIOM.hint.hidden=false;
  if(FIOM.de&&d2(FIOM.de.p[0],FIOM.de.p[2],P.x,P.z)>40*40)fiomCancelar('Fio cancelado: você se afastou demais.');});
/* desenho: tomadas e o fio sendo puxado */
const _MFM=M4();
INIT_MALHAS.push(function malhasFiom(){const mk=(c,e,k)=>{const g=new GB(64,8);add(g,boxTris(k,k,k),mat(0,0,0),lin(c),{e});return litMesh(g.data());};
  FIOM.cubos={s:mk(0xffb23c,0.9,0.075),e:mk(0x3fe0a8,0.9,0.075),usado:mk(0x5a5e58,0,0.06),alvo:mk(0xffffff,1.4,0.11)};});
DESENHO.opaco.push(function fiomDesenho(Pg){if(!fiomAtivo()||!FIOM.cubos)return;const L=FIOM.lista||[];
  for(const t of L){const c=t===FIOM.alvo?FIOM.cubos.alvo:tomadaOcupada(t)?FIOM.cubos.usado:FIOM.cubos[t.k];trs(_MFM,t.p[0],t.p[1],t.p[2],0,G.t*0.8,0,1,1,1);drawStat(Pg,c,_MFM);}
  if(!FIOM.de){if(FIOM.prev){liberarMesh(FIOM.prev);FIOM.prev=null;FIOM.prevSig='';}return;}
  const fim=FIOM.alvo&&FIOM.alvo.k==='e'?FIOM.alvo.p:FIOM.cur,sig=FIOM.pts.length+':'+(fim?fim.map(v=>v.toFixed(2)).join(','):'-');
  if(sig!==FIOM.prevSig){FIOM.prevSig=sig;if(FIOM.prev)liberarMesh(FIOM.prev);const g=new GB(512,8),L2=[FIOM.de.p,...FIOM.pts];if(fim)L2.push(fim);
    if(L2.length>1)fioGeoCaminho(g,{L:L2,chao:false},lin(0x2a2a26),lin(0xffb23c),lin(0x9aa0a4));FIOM.prev=g.n?litMesh(g.data()):null;}
  if(FIOM.prev)drawStat(Pg,FIOM.prev,ID);});

/* ---------- botão (aperte E: a energia passa por alguns segundos) ---------- */
OBRAS.botao={nome:'Botão',icon:'i-botao',custo:{sucata:1,fio:1},hp:60,hw:0.15,hd:0.12,solid:false,peq:true,etapa:1,desc:'Aperte E: deixa a energia passar por alguns segundos (5, 10 ou 30). Bom para portão, alarme e luz.'};
ELET.botao={p:'logica',ent:1,sai:1};E17_OBRAS.push('botao');OBRA_ORDEM.push('botao');if(!OBRAS_CHAO.includes('botao'))OBRAS_CHAO.push('botao');
if(typeof OBRAS_PREDIO!=='undefined'&&!OBRAS_PREDIO.includes('botao'))OBRAS_PREDIO.push('botao');if(!OBRAS_ALTO.includes('botao'))OBRAS_ALTO.push('botao');
{const c=OBRA_CATS.find(q=>q.id==='energia');if(c&&!c.t.includes('botao')){const i=c.t.indexOf('interruptor');c.t.splice(i>=0?i+1:c.t.length,0,'botao');}}
iconesNovos({'i-botao':'<rect x="5" y="9" width="14" height="11" rx="2"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/><circle cx="12" cy="14.5" r="2.2"/>'});
BASE_DICAS.botao='Botão: ponha entre a fonte e o que você quer acionar. Aperte E: a energia passa por alguns segundos.';
ELET_CURTO.botao='Botão';
{const _l=logicaLigada;logicaLigada=function(o){if(o.tipo==='botao')return(o.botaoAte||0)>G.t;return _l.apply(this,arguments);};}
{const K=INTER_K.eletr,_t=K.texto,_u=K.usar;
  K.texto=function(o){if(o.tipo==='botao'){const on=(o.botaoAte||0)>G.t,sg=(o.ext&&o.ext.seg)||5;return{t:on?'Botão (passando energia)':'Apertar o botão',s:'deixa passar '+sg+' s · segure: painel',alt:true,dur:0.6};}return _t.apply(this,arguments);};
  K.usar=function(o,seg){if(o.tipo==='botao'&&!seg){const sg=(o.ext&&o.ext.seg)||5;o.botaoAte=G.t+sg;energiaResolver(0);energiaEfeitos(0);sfx('clique',o.x,o.z,0.9);feed('Botão: energia por '+sg+' s');return;}return _u.apply(this,arguments);};}
{const U=ESTACAO_UI.energia,_r=U.render,_a=U.acao;
  U.render=function(o){const r=_r.apply(this,arguments);if(o.tipo!=='botao'||!r)return r;const sg=(o.ext&&o.ext.seg)||5,nx=sg>=30?5:sg>=10?30:10;
    r.acoes.unshift({id:'b_seg',t:'Passar '+nx+' s',s:'agora deixa passar '+sg+' s',ok:true},{id:'b_aperta',t:'Apertar',s:'a energia passa por '+sg+' s',ok:true,prim:true});
    r.corpo=(r.corpo||'')+'<p class="es-info">Aperte E no botão (sem abrir o painel) e a energia passa pelo tempo escolhido: o portão abre e fecha sozinho, a luz acende e apaga.</p>';return r;};
  U.acao=function(o,id){if(o.tipo==='botao'&&(id==='b_seg'||id==='b_aperta')){const e=o.ext||(o.ext={});const sg=e.seg||5;if(id==='b_seg')e.seg=sg>=30?5:sg>=10?30:10;else{o.botaoAte=G.t+sg;energiaResolver(0);energiaEfeitos(0);}sfx('clique');return'';}return _a.apply(this,arguments);};}
{const _ee=eletEstado;eletEstado=function(o){if(o.tipo==='botao'){const on=(o.botaoAte||0)>G.t;return(on?'passando energia':'esperando o aperto')+(energiaFiado(o)?(o.energ?' · com energia':' · sem energia'):' · sem fio');}return _ee.apply(this,arguments);};}
/* a rede precisa saber quando o tempo do botão acaba (sem esperar a próxima conta de meio segundo) */
PASSOS.push(function botaoPasso(){for(const o of OB){if(o.tipo!=='botao'||!o.botaoAte)continue;if(o.botaoAte<=G.t){o.botaoAte=0;energiaResolver(0);energiaEfeitos(0);}}});
{const MESH_BOTAO=()=>{const R=rng(3),g=new GB(512,8),cin=lin(0x8d969f),mad=lin(0x6e5235),verm=lin(0xc8261d);add(g,boxTris(0.24,0.32,0.1),mat(0,1.1,0),cin,{j:0.04,rnd:R});add(g,boxTris(0.06,1.0,0.06),mat(0,0.5,-0.02),mad,{j:0.06,rnd:R});
    add(g,cylTris(0.06,0.06,0.05,10),mat(0,1.12,0.05,Math.PI/2,0,0),verm,{e:0.2});return litMesh(g.data());};INIT_MALHAS.push(()=>{MESH.obra.botao=MESH_BOTAO();});}

/* ---------- manual ---------- */
MANUAL_EXTRA.push(()=>{const G_=(id,nome,icon,desc,est,ferr,proc,obs)=>({id,sec:'eletricidade',nome,icon,trav:false,como:'desde o começo',desc,ing:{},est:{nome:est,icon,onde:''},ferr,proc,res:null,obs,tipo:'Guia'});
  return[G_('x:fiosMundo','Puxar fios com o alicate na mão','i-alicate','Como no Rust: com o alicate na mão, os fios se ligam direto no mundo, presos onde você quiser.','Onde: em qualquer lugar, perto das peças elétricas',
      ['Alicate de eletricista na barra (1 a 6), escolhido','Fio elétrico na mochila (bancada: sucata e linha dão 4)'],
      ['Ponha o alicate na barra e escolha: aparecem as tomadas das peças por perto (amarela = saída, verde = entrada, apagada = ocupada).',
       'Mire numa saída e clique: o fio sai dela. Clique no chão, no muro ou na parede para prender o fio ali (até 10 pontos).',
       'Clique numa entrada verde para ligar. O fio gasta 1 a cada 4 m do caminho que você fez.',
       'Botão direito desfaz o último ponto (ou cancela). Numa tomada já ligada, o botão direito corta o fio (ele volta para a mochila).'],
      ['A tela de fios (U) continua: dá a vista de cima da rede. Os fios ligados por lá correm rentes ao chão.','Placa solar: gera mais virada para o sol (gire com R antes de pôr).']),
    G_('x:botao','Botão','i-botao','Aperte E: a energia passa por alguns segundos.','Onde: aba Energia',['Nenhuma'],
      ['Ligue entre a fonte e o que você quer acionar (portão, lâmpada, alarme).','No painel dá para escolher 5, 10 ou 30 segundos.'],
      ['Junto com o sensor e o temporizador, faz a base trabalhar sozinha.'])];});
