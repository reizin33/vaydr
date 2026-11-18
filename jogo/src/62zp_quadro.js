/* ================= Quadro de energia da base (v10.3.1, 18/11/2026) =================
   Himalaia: "coloque um módulo ou disjuntor para ligar tudo a ele para controlar a energia da base" (e "pode decidir você").
   O QUADRO DE ENERGIA é o centro da rede:
   · em cima, 4 ENTRADAS: fontes (roda d'água, cata-vento, placa solar, gerador) e baterias. Ele junta tudo sozinho;
   · embaixo, 6 SAÍDAS = 6 CIRCUITOS com disjuntor (de fábrica: Luzes, Portões, Defesas, Cozinha, Água e Oficina; o nome que
     aparece é o das peças ligadas nele). Cada circuito tem a sua chave (liga e desliga), o horário (sempre, só à noite ou só
     com a bateria acima de 30%) e a prioridade;
   · PRIORIDADE: quando a energia não dá para tudo, o quadro corta primeiro os circuitos de prioridade baixa (de fábrica: cozinha,
     água e oficina), depois os de média (luzes e portões), e as defesas por último. Volta sozinho quando sobra energia;
   · DISJUNTOR: um circuito que puxa mais de 2000 W desarma. É só ir ao quadro e religar (e dividir a carga em dois circuitos);
   · GERADOR AUTOMÁTICO: com ele ligado no quadro, o gerador a gasolina liga sozinho quando as baterias da rede caem abaixo de 20%
     e desliga quando passam de 90%: só gasta gasolina quando precisa;
   · para carregar as baterias: a saída delas numa entrada do quadro e um circuito do quadro na entrada delas (ele carrega com o
     que sobra). As luzinhas no quadro mostram cada circuito: verde ligado, amarela desligada ou fora do horário, laranja cortada
     por falta de energia, vermelha desarmada.
   O quadro gasta como o resto e, se os zumbis quebrarem, a base apaga: vale deixar dentro, protegido. */
const QD={LIMITE:2000,nomes:['Luzes','Portões','Defesas','Cozinha','Água','Oficina'],prio:[2,2,1,3,3,3],avisoT:{}};
OBRAS.quadroEnergia={nome:'Quadro de energia',icon:'i-quadro',custo:{sucata:10,chapaFerro:3,fio:8,pregos:4},hp:340,hw:0.55,hd:0.25,solid:true,hCol:1.9,etapa:3,desb:'oficina',
  desc:'O centro da energia da base: até 4 fontes ou baterias nas entradas e 6 circuitos com disjuntor nas saídas. No painel: liga e desliga cada circuito, horário, prioridade e o gerador automático.'};
ELET.quadroEnergia={p:'logica',ent:4,sai:6,quadro:true};
E17_OBRAS.push('quadroEnergia');OBRA_ORDEM.push('quadroEnergia');if(!OBRAS_CHAO.includes('quadroEnergia'))OBRAS_CHAO.push('quadroEnergia');
if(typeof OBRAS_PREDIO!=='undefined'&&!OBRAS_PREDIO.includes('quadroEnergia'))OBRAS_PREDIO.push('quadroEnergia');
{const c=OBRA_CATS.find(q=>q.id==='energia');if(c&&!c.t.includes('quadroEnergia'))c.t.unshift('quadroEnergia');}
iconesNovos({'i-quadro':'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M7 7h10M7 11h2M11 11h2M15 11h2"/><path d="M7.5 14.5v3M11.5 14.5v3M15.5 14.5v3"/>'});
BASE_DICAS.quadroEnergia='Quadro de energia: com o alicate, ligue as fontes e baterias nas entradas de cima e cada circuito (saídas de baixo) no que ele vai alimentar. Toque E para o painel.';
ELET_CURTO.quadroEnergia='Quadro';ELET_ALT.quadroEnergia=1.2;
if(typeof PINO_TIPO!=='undefined')PINO_TIPO.quadroEnergia={e:[[-0.36,1.66,0.14],[-0.12,1.66,0.14],[0.12,1.66,0.14],[0.36,1.66,0.14]],s:[[-0.4,0.62,0.14],[-0.24,0.62,0.14],[-0.08,0.62,0.14],[0.08,0.62,0.14],[0.24,0.62,0.14],[0.4,0.62,0.14]]};
/* estado de cada circuito (fica salvo com a peça) */
function qdCirc(q,k){const e=q.ext||(q.ext={});if(!Array.isArray(e.circ))e.circ=[];const c=e.circ[k]||(e.circ[k]={});if(c.on===undefined)c.on=true;if(!c.modo)c.modo='sempre';if(!c.prio)c.prio=QD.prio[k];return c;}
function qdRede(q){return ENER.redes.find(r=>r.L.includes(q))||null;}
function qdBat(q){const r=qdRede(q);return r&&r.cap>0?r.carga/r.cap:null;}
function qdHorario(q,c){if(c.modo==='noite')return(E.n||0)>0.3;if(c.modo==='bat'){const b=qdBat(q);return b===null||b>=0.3;}return true;}
function quadroPassa(q,k){if(q.hp<=0)return false;const c=qdCirc(q,k);return c.on&&!c.des&&!(q.cortados&&q.cortados.has(k))&&qdHorario(q,c);}
/* o que cada circuito alimenta (só por ele: atravessa interruptor, sensor, divisor...) e quanto pede agora */
function qdCircuitos(q){const id=q.ext&&q.ext.eid,out=[];if(!id)return out;const saidas=new Map();for(const f of ENER.fios){if(!saidas.has(f.a))saidas.set(f.a,[]);saidas.get(f.a).push(f.b);}
  const S=saidas.get(id)||[];
  for(let k=0;k<6;k++){const r={k,ids:[],D:0,pecas:[]};if(k<S.length){const vis=new Set([id]),fila=[S[k]];
      while(fila.length){const b=fila.shift();if(vis.has(b))continue;vis.add(b);const o=eletPorEid(b);if(!o)continue;const d=ELET[o.tipo];
        if(d.p==='consumo'){r.pecas.push(o);r.D+=querW(o);}else if(d.p==='bateria'){r.pecas.push(o);}
        else if(d.p==='logica'&&!d.quadro&&logicaLigada(o))for(const x of saidas.get(b)||[])fila.push(x);}}
    r.ligado=k<S.length;out.push(r);}return out;}
function qdNome(q,k,r){const L=(r||qdCircuitos(q)[k]).pecas;if(!L.length)return QD.nomes[k];const cont={};for(const o of L){const n=ELET_CURTO[o.tipo]||eletNome(o);cont[n]=(cont[n]||0)+1;}
  return Object.entries(cont).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([n,c])=>c>1?n+' ×'+c:n).join(', ');}
/* falta energia: o quadro corta circuito por circuito (prioridade baixa primeiro, o que pede mais primeiro) até caber */
{const _er=energiaResolver;energiaResolver=function(dtMin){const Qs=OB.filter(o=>o.tipo==='quadroEnergia'&&o.hp>0&&o.ext&&o.ext.eid);if(!Qs.length)return _er.apply(this,arguments);
  const antes=new Map(Qs.map(q=>[q,q.cortados?[...q.cortados].join():'']));for(const q of Qs)q.cortados=new Set();
  for(let it=0;it<7;it++){_er(0);let mudou=false;
    for(const q of Qs){const R=qdRede(q);if(!R||!R.falta)continue;const C=qdCircuitos(q).filter(r=>r.ligado&&r.D>0&&quadroPassa(q,r.k));if(!C.length)continue;
      C.sort((a,b)=>qdCirc(q,b.k).prio-qdCirc(q,a.k).prio||b.D-a.D);q.cortados.add(C[0].k);mudou=true;}
    if(!mudou)break;}
  const r=_er(dtMin);
  for(const q of Qs){const k=[...q.cortados].join();if(k!==antes.get(q)&&k&&d2(q.x,q.z,P.x,P.z)<60*60)feed('Faltou energia: o quadro desligou '+[...q.cortados].map(i=>'o circuito '+(i+1)).join(' e ')+' (prioridade baixa primeiro)',true);}
  return r;};}
/* disjuntor: circuito com mais de 2000 W desarma; gerador automático pela carga das baterias */
let qdT=0;
PASSOS.push(function quadroPasso(dt){qdT-=dt;if(qdT>0)return;qdT=0.5;let mexeu=false;
  for(const q of OB){if(q.tipo!=='quadroEnergia'||q.hp<=0||!q.ext||!q.ext.eid)continue;
    for(const r of qdCircuitos(q)){if(!r.ligado||!quadroPassa(q,r.k)||r.D<=QD.LIMITE)continue;const c=qdCirc(q,r.k);c.des=true;mexeu=true;
      if(d2(q.x,q.z,P.x,P.z)<70*70){feed('Disjuntor do circuito '+(r.k+1)+' desarmou: '+wTxt(r.D)+' (o limite é '+wTxt(QD.LIMITE)+'). Religue no quadro e divida a carga.',true);sfx('clique',q.x,q.z,1);
        for(let i=0;i<10;i++)part(q.x,(q.y||0)+1.1,q.z,(Math.random()-0.5)*2,1+Math.random()*1.5,(Math.random()-0.5)*2,0.35,0.06,[1,0.85,0.4,1],true,9.8);}}
    if(q.ext.genAuto){const R=qdRede(q),b=R&&R.cap>0?R.carga/R.cap:null;if(b!==null)for(const g of R.L){if(g.tipo!=='gerador')continue;const e=g.ext||(g.ext={});
        if(b<0.2&&e.ligado===false&&(e.comb||0)>0){e.ligado=true;mexeu=true;}else if(b>0.9&&e.ligado!==false){e.ligado=false;mexeu=true;}}}}
  if(mexeu){energiaResolver(0);energiaEfeitos(0);}});
/* ---------- painel do quadro ---------- */
{const st=document.createElement('style');st.textContent=`.qd-lista{display:grid;gap:6px;margin-top:8px}
.qd-c{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;align-items:center;padding:8px 10px;border-radius:9px;background:rgba(255,255,255,.04);border-left:4px solid #5a5e58}
.qd-c.on{border-left-color:#5fd36b}.qd-c.fora{border-left-color:#e8c547}.qd-c.cort{border-left-color:#ef8a3c}.qd-c.des{border-left-color:#e2493a}
.qd-c b{font:800 14px/1.2 var(--f-ui);color:var(--bone)}.qd-c small{display:block;font:600 12px/1.3 var(--f-ui);color:var(--ash)}
.qd-bt{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end}.qd-bt button{appearance:none;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:var(--bone);border-radius:7px;padding:5px 8px;font:700 12px/1 var(--f-ui);cursor:pointer}
.qd-bt button.al{background:#c8261d;border-color:#ef5a4d}.qd-bt button:hover{background:rgba(255,255,255,.12)}`;document.head.appendChild(st);}
{const c=$('es-corpo');if(c)c.addEventListener('click',e=>{const b=e.target.closest('[data-ea]');if(b&&!b.disabled){e.stopPropagation();estAcao(b.dataset.ea);}});}
function qdFontes(q){const id=q.ext.eid,L=[];for(const f of ENER.fios){if(f.b!==id)continue;const a=eletPorEid(f.a);if(!a)continue;const d=ELET[a.tipo];
    L.push(eletNome(a)+': '+(d.p==='fonte'?(fontePot(a)>0?wTxt(fontePot(a)):(a.tipo==='gerador'?((a.ext||{}).ligado===false?'desligado':'sem gasolina'):'parada')):d.p==='bateria'?Math.round((a.ext.carga||0)/d.cap*100)+'%':'—'));}return L;}
{const U=ESTACAO_UI.energia,_r=U.render,_a=U.acao;
  U.render=function(o){const r=_r.apply(this,arguments);if(o.tipo!=='quadroEnergia'||!r)return r;const R=qdRede(o),C=qdCircuitos(o),b=qdBat(o),e=o.ext;
    const gera=R?R.Pg:0,gasta=R?R.D:0,aut=b!==null&&gasta>0?R.carga/gasta:null;
    let h='<div class="es-lista">'+vagaE('i-quadro','Quadro de energia',(gera?'gerando '+wTxt(gera):'nada gerando')+' · gastando '+wTxt(gasta)+(b!==null?' · baterias '+Math.round(b*100)+'%'+(aut!==null?' (dá para '+horasTxt(aut*60)+')':''):''),b,gera>0)+'</div>';
    const F=qdFontes(o);h+='<p class="es-info"><b>Entradas:</b> '+(F.length?F.join(' · '):'nenhuma: ligue fontes e baterias nas tomadas de cima')+'</p><div class="qd-lista">';
    for(const c0 of C){const c=qdCirc(o,c0.k),cort=o.cortados&&o.cortados.has(c0.k),fora=!qdHorario(o,c);
      const cls=!c0.ligado?'':c.des?'des':!c.on?'':cort?'cort':fora?'fora':'on';
      const est=!c0.ligado?'sem fio':c.des?'DESARMADO':!c.on?'desligado':cort?'cortado por falta de energia':fora?(c.modo==='noite'?'espera a noite':'espera a bateria passar de 30%'):'ligado';
      h+='<div class="qd-c '+cls+'"><span><b>'+(c0.k+1)+' · '+(c0.ligado?qdNome(o,c0.k,c0):QD.nomes[c0.k])+'</b><small>'+est+(c0.ligado?' · pede '+wTxt(c0.D):'')+' · prioridade '+['','alta','média','baixa'][c.prio]+' · '+{sempre:'sempre',noite:'só à noite',bat:'só com bateria'}[c.modo]+'</small></span>'+
        '<span class="qd-bt">'+(c.des?'<button type="button" class="al" data-ea="qc_rel_'+c0.k+'">Religar</button>':'<button type="button" data-ea="qc_on_'+c0.k+'">'+(c.on?'Desligar':'Ligar')+'</button>')+
        '<button type="button" data-ea="qc_modo_'+c0.k+'">Horário</button><button type="button" data-ea="qc_prio_'+c0.k+'">Prioridade</button></span></div>';}
    h+='</div><p class="es-info">Falta energia? O quadro corta primeiro a prioridade baixa e volta sozinho quando sobra. Um circuito com mais de '+wTxt(QD.LIMITE)+' desarma: religue e divida a carga. '+
      'Para carregar as baterias: a saída delas numa entrada do quadro e um circuito na entrada delas.</p>';
    r.corpo=h;r.acoes=(r.acoes||[]).filter(a=>a.id!=='auto');
    r.acoes.unshift({id:'q_gen',t:'Gerador automático: '+(e.genAuto?'ligado':'desligado'),s:e.genAuto?'liga com bateria abaixo de 20% e desliga em 90%':'o gerador fica como você deixar',ok:true,prim:!e.genAuto&&R&&R.L.some(g=>g.tipo==='gerador')});
    return r;};
  U.acao=function(o,id){if(o.tipo==='quadroEnergia'){const m=/^qc_(on|modo|prio|rel)_(\d)$/.exec(id);
      if(m){const k=+m[2],c=qdCirc(o,k);if(m[1]==='on')c.on=!c.on;else if(m[1]==='modo')c.modo={sempre:'noite',noite:'bat',bat:'sempre'}[c.modo];else if(m[1]==='prio')c.prio=c.prio>=3?1:c.prio+1;else{c.des=false;}
        energiaResolver(0);energiaEfeitos(0);sfx('clique',o.x,o.z,0.8);return m[1]==='rel'?'Circuito '+(k+1)+' religado.':'';}
      if(id==='q_gen'){const e=o.ext||(o.ext={});e.genAuto=!e.genAuto;sfx('clique');return e.genAuto?'Gerador automático ligado.':'Gerador automático desligado.';}}
    return _a.apply(this,arguments);};}
{const _ee=eletEstado;eletEstado=function(o){if(o.tipo!=='quadroEnergia')return _ee.apply(this,arguments);const C=qdCircuitos(o),lig=C.filter(c=>c.ligado&&quadroPassa(o,c.k)).length,des=C.filter(c=>c.ligado&&qdCirc(o,c.k).des).length,R=qdRede(o);
  return lig+' de 6 circuitos ligados'+(des?' · '+des+' desarmado'+(des>1?'s':''):'')+(R?' · gastando '+wTxt(R.D):'')+(energiaFiado(o)?'':' · sem fio');};}
/* ---------- desenho: o armário, os disjuntores e as luzinhas de cada circuito ---------- */
const _MQD=M4();
INIT_MALHAS.push(function malhasQuadro(){const R=rng(5151),A=(g,t,m,c,o)=>add(g,t,m,c,Object.assign({j:0.04,rnd:R},o||{})),cz=lin(0x8d969f),cz2=lin(0x6a7076),esc=lin(0x22262a),bra=lin(0xd8dcd8),ama=lin(0xc9a227);
  {const g=new GB(2048,8);A(g,bvTris(0.95,1.3,0.22),mat(0,1.15,0),cz);A(g,boxTris(0.89,1.22,0.02),mat(0,1.15,0.115),cz2);for(const x of[-0.38,0.38])A(g,boxTris(0.07,0.55,0.07),mat(x,0.27,-0.02),cz2);
    A(g,boxTris(0.36,0.16,0.02),mat(0,1.46,0.125),lin(0x10301c),{e:0.35});A(g,boxTris(0.2,0.05,0.02),mat(-0.25,1.72,0.125),ama,{e:0.2});
    for(let k=0;k<6;k++){const x=-0.4+k*0.16;A(g,boxTris(0.1,0.16,0.04),mat(x,1.0,0.13),esc);A(g,boxTris(0.03,0.06,0.04),mat(x,1.03,0.16),bra);}
    for(let k=0;k<4;k++)A(g,boxTris(0.12,0.06,0.04),mat(-0.36+k*0.24,1.66,0.13),esc);A(g,boxTris(0.9,0.06,0.04),mat(0,0.62,0.13),esc);
    MESH.obra.quadroEnergia=litMesh(g.data());}
  const luz=(c,e)=>{const g=new GB(64,8);add(g,boxTris(0.05,0.05,0.03),mat(0,0,0),lin(c),{e});return litMesh(g.data());};
  QD.luz={on:luz(0x5fd36b,1.6),fora:luz(0xe8c547,1.4),cort:luz(0xef8a3c,1.5),des:luz(0xe2493a,1.8),sem:luz(0x3a3e3a,0)};});
DESENHO.opaco.push(function quadroLuzes(Pg){if(!QD.luz)return;for(const q of OB){if(q.tipo!=='quadroEnergia'||q.hp<=0||d2(q.x,q.z,cam.pos[0],cam.pos[2])>45*45)continue;
  const C=q.ext&&q.ext.eid?qdCircuitos(q):[],c0=Math.cos(q.yaw||0),s0=Math.sin(q.yaw||0);
  for(let k=0;k<6;k++){const r=C[k],c=qdCirc(q,k),est=!r||!r.ligado?'sem':c.des?'des':!c.on?'sem':q.cortados&&q.cortados.has(k)?'cort':!qdHorario(q,c)?'fora':'on';
    const lx=-0.4+k*0.16,lz=0.14,x=q.x+lx*c0+lz*s0,z=q.z-lx*s0+lz*c0;trs(_MQD,x,(q.y||0)+1.2,z,0,q.yaw||0,0,1,1,1);drawStat(Pg,QD.luz[est],_MQD);}}});
/* ---------- manual ---------- */
MANUAL_EXTRA.push(()=>[{id:'x:quadro',sec:'eletricidade',nome:'Quadro de energia',icon:'i-quadro',trav:false,como:'desde o começo',desc:'O centro da energia da base: junta as fontes e divide a energia em 6 circuitos com disjuntor.',ing:{},
  est:{nome:'Onde: aba Energia (precisa da oficina)',icon:'i-quadro',onde:''},ferr:['Alicate e fio para ligar'],
  proc:['Ligue até 4 fontes ou baterias nas entradas de cima (com o alicate na mão, como os outros fios).','Ligue cada saída de baixo (circuito) no que ela vai alimentar: luzes, portões, defesas, cozinha, água, oficina.',
    'No painel (E): chave de cada circuito, horário (sempre, só à noite, só com bateria acima de 30%) e prioridade.',
    'Faltou energia: o quadro corta primeiro a prioridade baixa e volta sozinho quando sobra. Mais de 2000 W num circuito desarma: religue no painel.',
    'Gerador automático: liga o gerador a gasolina quando as baterias caem abaixo de 20% e desliga em 90%.',
    'Baterias: a saída delas numa entrada do quadro e um circuito do quadro na entrada delas (carregam com a sobra).'],
  res:null,obs:['Luzinhas: verde ligado, amarela fora do horário, laranja cortado por falta de energia, vermelha desarmado.','Se os zumbis quebrarem o quadro, a base apaga: deixe dentro, protegido.'],tipo:'Guia'}]);
