/* ================= Etapa 16 (continuação): serrote e pá, alçapão com escada de mão e cadeado, porão e esconderijo =================
   SERROTE (bancada, ferramentas): abre um quadrado no piso de cima. É ele que corta o lugar do ALÇAPÃO COM ESCADA (aba Casa):
   de dentro da casa, mire embaixo do piso de cima onde quer a abertura; a escada de mão fica do lado de onde você mira.
   Sobe-se pela escada (E perto do pé); com o alçapão fechado, chegar em cima empurra a tampa. Em cima, toque E perto da abertura
   abre e fecha a tampa (fechada, dá para pisar). Cadeado com senha (segure E): de baixo, a tampa fechada só abre com a senha;
   de cima abre normal. É mais um modelo da escada interna (reta, caracol ou alçapão): o painel troca de um para o outro.
   PÁ (bancada, ferramentas): cava. O PORÃO (aba Casa) vai no chão do térreo, dentro da casa: um alçapão no chão e, lá embaixo,
   um cômodo de pedra e terra (escuro e fresco, a chuva não chega; dá para pôr baú, cama e lamparina). Lá embaixo, segure E na
   escada para cavar mais cômodos (até 4, com pá ou picareta). Cadeado com senha: de cima, só com a senha; de baixo abre normal.
   Com um tapete por cima (2 panos), o alçapão do porão fica escondido: vira esconderijo. */
iconesNovos({
  'i-serrote':'<path d="M3.5 15.5 15 7l3.5 3.5L7 19z"/><path d="M6.5 14.2l1.2 1.2M9.3 12.1l1.2 1.2M12.1 10l1.2 1.2"/><path d="M15 7l2.2-2.6 3.4 3.4-2.1 2.7"/>',
  'i-pa':'<path d="M20.5 3.5 14 10"/><path d="M18.5 2.5l3 3"/><path d="M14 10l-1.6-1.6-6.2 3.3a3 3 0 0 0-.7 4.8l1.5 1.5a3 3 0 0 0 4.8-.7l3.3-6.2z"/>',
  'i-alcapao':'<rect x="4" y="11" width="16" height="9" rx="1"/><path d="M4 11 8 4h12"/><path d="M8 4v7"/><path d="M11 15.5h2"/>',
  'i-porao':'<path d="M3 11 12 4l9 7"/><path d="M5 10v3.5h14V10"/><path d="M8.5 13.5v3h3v3h4"/><path d="M5 20h14"/>'});
Object.assign(ITEMS,{
  serrote:{nome:'Serrote',icon:'i-serrote',max:1,tipo:'util',durMax:24,desc:'Lâmina dentada com cabo de madeira. Abre um quadrado no piso de cima para o alçapão com escada (construir: aba Casa). Gasta um pouco a cada abertura.'},
  pa:{nome:'Pá',icon:'i-pa',max:1,tipo:'util',mao:true,durMax:40,desc:'Pá de ferro com cabo comprido. Cava o porão embaixo da casa (construir: aba Casa) e mais cômodos lá embaixo. Gasta com o uso.'}});
RECIPES.push(
  {faz:'serrote',n:1,custo:{sucata:2,madeira:1,pregos:1},cat:'ferramentas',etapa:1,est:0},
  {faz:'pa',n:1,custo:{sucata:3,madeira:2,corda:1},cat:'ferramentas',etapa:1,est:0});
const temSerrote=()=>P.inv.find(s=>s&&s.id==='serrote'&&!(s.dur<=0))||null;
const temPa=()=>P.inv.find(s=>s&&(s.id==='pa'||(ITEMS[s.id]&&ITEMS[s.id].minera))&&!(s.dur<=0))||null;

/* ---------- cadeado com senha (alçapão e porão): "dentro" é o lado protegido; do outro lado, fechado, só com a senha ---------- */
function trancaAcoes(e,dentro){const A=[];
  if(!e.cad)A.push({id:'cadPor',t:'Pôr cadeado com senha',s:custoTxt(CAD_CUSTO),ok:invHas(CAD_CUSTO),prim:true});
  else if(dentro){if(!e.senha)A.push({id:'cadSenha',t:'Escolher a senha',s:'4 números',prim:true});
    else{A.push({id:'cadArma',t:e.cad==='fechado'?'Deixar o cadeado aberto':'Fechar o cadeado',s:e.cad==='fechado'?'qualquer um passa':'do outro lado, só com a senha'});A.push({id:'cadSenha',t:'Trocar a senha',s:'4 números'});}
    A.push({id:'cadTirar',t:'Tirar o cadeado',s:'devolve 1 sucata'});}
  else if(e.cad==='fechado'&&e.senha)A.push({id:'cadDigitar',t:'Digitar a senha',s:'abre',prim:true});
  return A;}
function trancaSenha(o,nome){abrirTeclado({x:o.x,z:o.z,titulo:o.ext.senha?'Senha nova do cadeado':'Escolha a senha do cadeado',
  definir:t=>{o.ext.senha=t;o.ext.cad='fechado';sfx('bipe',o.x,o.z,0.6);toast('corpo','Senha do cadeado do '+nome+': '+t+'. Do lado de fora, só abre com ela.');}});}
function trancaTeclado(o,nome,abrir){abrirTeclado({x:o.x,z:o.z,titulo:'Cadeado do '+nome,codigo:()=>o.ext.senha,abrir:()=>{sfx('bipe',o.x,o.z,0.6);abrir();}});}
function trancaAcao(o,id,nome,abrir){const e=o.ext;
  if(id==='cadPor'){if(e.cad)return'Já tem cadeado.';if(!invHas(CAD_CUSTO))return'Faltam materiais.';pagar(CAD_CUSTO);e.cad='aberto';sfx('construir',o.x,o.z);fecharEstacao();trancaSenha(o,nome);return'';}
  if(id==='cadSenha'){fecharEstacao();trancaSenha(o,nome);return'';}
  if(id==='cadArma'){e.cad=e.cad==='fechado'?'aberto':'fechado';sfx('clique');return e.cad==='fechado'?'Cadeado fechado: do outro lado, só com a senha.':'Cadeado aberto: qualquer um passa.';}
  if(id==='cadTirar'){delete e.cad;delete e.senha;invAdd('sucata',1);sfx('clique');return'Cadeado tirado.';}
  if(id==='cadDigitar'){fecharEstacao();trancaTeclado(o,nome,abrir);return'';}
  return null;}
const trancado=e=>e.cad==='fechado'&&!!e.senha;
const trancaInfo=(e,dentro)=>'Cadeado: '+(e.cad?(e.cad==='fechado'?'<b>fechado</b>':'aberto')+(e.senha?(dentro?' · senha <b>'+e.senha+'</b>':' · senha ••••'):' · sem senha'):'nenhum');

/* ---------- ALÇAPÃO COM ESCADA (modelo 'alcapao' da escada interna) ---------- */
const ALC={a:0.55};
OBRAS.alcapao={nome:'Alçapão com escada',icon:'i-alcapao',custo:{tabuas:6,pregos:4,corda:1},hp:200,hw:0.6,hd:0.6,solid:false,etapa:2,
  desc:'Abertura quadrada no piso de cima (precisa de serrote) com tampa e escada de mão embaixo. Aceita cadeado com senha.'};
OBRA_ORDEM.push('alcapao');{const i=OBRAS_CHAO.indexOf('escadaCaracol');OBRAS_CHAO.splice(i>=0?i+1:OBRAS_CHAO.length,0,'alcapao');}
{const cs=OBRA_CATS.find(c=>c.id==='casa');if(cs&&!cs.t.includes('alcapao')){const i=cs.t.indexOf('escadaCaracol');cs.t.splice(i>=0?i+1:cs.t.length,0,'alcapao');}}
BASE_DICAS.alcapao='Alçapão pronto: suba pela escada de mão (E no pé dela). Com a tampa fechada, chegar em cima empurra a tampa; lá em cima, toque E perto da abertura para abrir ou fechar. Segure E para pôr cadeado com senha.';
{const _cr=criarObra;criarObra=function(tipo,x,z,yaw,hp,aberto,y,ext){if(tipo==='alcapao'){tipo='escadaInterna';ext=Object.assign({},ext||{},{mod:'alcapao'});}return _cr.call(this,tipo,x,z,yaw,hp,aberto,y,ext);};}
{const _bc=baseColocada;baseColocada=function(o){if(o&&o.tipo==='escadaInterna'&&o.ext&&o.ext.mod==='alcapao'){dica('obra_alcapao','corpo',BASE_DICAS.alcapao);return;}return _bc.apply(this,arguments);};}
/* lugar: abertura com centro (cu,cv) no sistema da plataforma; a escada fica na beirada (lu,lv), do lado de quem olha */
function alcEm(p,cu,cv,lu,lv){const kp=modK(p),a=ALC.a,c=localW(p,cu,cv),fg=ground(c[0],c[1]),h=p.y-fg,lim=1.5*kp-a-0.15;
  const r={x:c[0],z:c[1],y:p.y,yaw:p.yaw,ext:Object.assign({mod:'alcapao',px:+p.x.toFixed(2),pz:+p.z.toFixed(2),py:+p.y.toFixed(2),cu:+cu.toFixed(2),cv:+cv.toFixed(2),lu,lv,h:+h.toFixed(2)},kp>1.01?{m:4}:{})},no=m=>Object.assign(r,{ok:false,motivo:m});
  if(Math.abs(cu)>lim+0.01||Math.abs(cv)>lim+0.01)return no('Perto demais da beirada do piso');
  if(h<1.6)return no('Baixo demais para escada');if(h>3.6)return no('Alto demais para a escada de mão');
  if(OB.some(q=>q.tipo==='escadaInterna'&&platDaEscada(q)===p))return no('Esse piso já tem escada ou abertura (uma por plataforma)');
  for(const q of OB){const Dq=OBRAS[q.tipo];if(q===p||!Dq||!(Dq.bau||Dq.peq||q.tipo==='lamparina'||q.tipo==='armarioFerro'||Dq.alto==='borda'))continue;if(Math.abs(q.y-p.y)>0.4)continue;const l=paraLocal(p,q.x,q.z);
    if(Math.abs(l[0]-cu)<a+0.35&&Math.abs(l[1]-cv)<a+0.35)return no('Tire o que está em cima, no lugar da abertura');}
  {const t=[cu+lu*(a+0.45),cv+lv*(a+0.45)];if(Math.abs(t[0])>1.5*kp-0.2||Math.abs(t[1])>1.5*kp-0.2)return no('Sem lugar para sair em cima: afaste da beirada');}
  const ign=q=>q.obra&&(q.obra.tipo==='plataforma'||q.obra.tipo==='pilar');
  for(const d of[a-0.3,a-0.9]){const w=localW(p,cu+lu*d,cv+lv*d),gy=ground(w[0],w[1]);if(Math.abs(gy-fg)>0.4)return no('O chão é torto embaixo da abertura');if(bloqueadoChao(w[0],w[1],0.1,gy,ign))return no('Tem coisa no caminho da escada');}
  r.ok=true;return r;}
function alvoAlcapao(x,z,yaw){const p=platDaCasa();if(!p)return{x,z,y:ground(x,z),yaw,ok:false,motivo:'Entre na casa: o alçapão vai no piso de cima, mirando de baixo'};
  const kp=modK(p),lim=1.5*kp-ALC.a-0.15,l=paraLocal(p,x,z),cu=clamp(Math.round(l[0]*4)/4,-lim,lim),cv=clamp(Math.round(l[1]*4)/4,-lim,lim),lp=paraLocal(p,P.x,P.z),du=lp[0]-cu,dv=lp[1]-cv;
  let lu=0,lv=0;if(Math.abs(du)>Math.abs(dv))lu=du>0?1:-1;else lv=dv>0?1:-1;
  const r=alcEm(p,cu,cv,lu,lv);if(r.ok&&!temSerrote())return Object.assign(r,{ok:false,motivo:'Precisa de um serrote para abrir o piso (bancada: ferramentas)'});return r;}
OBRAS.alcapao.alvo=alvoAlcapao;
/* abertura no piso de cima */
{const _fe=furoDaEscada;furoDaEscada=function(p,e){if(!e||e.mod!=='alcapao')return _fe.apply(this,arguments);const kp=modK(p),a=ALC.a;return[(e.cu-a)/kp,(e.cu+a)/kp,(e.cv-a)/kp,(e.cv+a)/kp];};}
/* malha: escada de mão presa na beirada (no sistema do alçapão: centro da abertura, piso de cima em y=0, eixos da plataforma) */
function geoAlcapao(e){const g=new GB(4096,8),R=rng(Math.round((e.h||3)*100)+313),C=k=>lin(COR_CASA[k]),h=e.h||3,a=ALC.a,lu=e.lu||0,lv=e.lv||0,pu=-lv,pv=lu;
  const d=a-0.07,inc=0.12;   // a escada encosta na beirada em cima e abre um pouco embaixo
  for(const sd of[-1,1]){const x0=lu*(d-inc)+pu*sd*0.22,z0=lv*(d-inc)+pv*sd*0.22,x1=lu*d+pu*sd*0.22,z1=lv*d+pv*sd*0.22,L=Math.hypot(h+0.95,inc);
    add(g,boxTris(0.06,L,0.06),mat((x0+x1)/2,(0.95-h)/2,(z0+z1)/2,lv*Math.atan2(inc,h),0,-lu*Math.atan2(inc,h)),C('esc'),{j:0.06,rnd:R});}
  const n=Math.round(h/0.3);for(let i=1;i<n;i++){const t=i/n,y=-h+h*t,o=d-inc*(1-t);add(g,boxTris(Math.abs(pu)*0.46+0.04,0.04,Math.abs(pv)*0.46+0.04),mat(lu*o,y,lv*o),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});}
  for(const sd of[-1,1])add(g,boxTris(0.08,0.06,0.08),mat(lu*d+pu*sd*0.22,0.95,lv*d+pv*sd*0.22),C('mad'));
  return g.data();}
function alcSups(o){const e=o.ext,a=ALC.a;if(o.sups)for(const s of o.sups)supRemove(s);o.sups=[];if(o.colTampa){colRemove(o.colTampa);o.colTampa=null;}
  if(!e.aberta)o.sups.push(supAdd({t:'ret',x:o.x,z:o.z,hw:a,hd:a,yaw:o.yaw,y:o.y,dono:o}));
  else{const lu=e.lu||0,lv=e.lv||0,w=localW(o,-lu*(a+0.03),-lv*(a+0.03));o.colTampa=colBox(w[0],w[1],lu?0.04:a,lv?0.04:a,o.yaw,{solid:true,obra:o,y0:o.y,y1:o.y+1.1});}}
function alcMontar(o){const e=o.ext,a=ALC.a,h=e.h||3,fg=o.y-h,lu=e.lu||0,lv=e.lv||0,ru=Math.atan2(lu,lv),
    cl=localW(o,lu*(a-0.32),lv*(a-0.32)),b=localW(o,lu*(a-0.95),lv*(a-0.95)),t=localW(o,lu*(a+0.45),lv*(a+0.45)),rumo=o.yaw+ru;
  o.cols=[];alcSups(o);
  const v=viaReta(cl[0],cl[1],fg,o.y,rumo,{x:b[0],y:fg,z:b[1]},{x:t[0],y:o.y,z:t[1],rumo},o);v.tipo='escada';o.via=v;VIAS.push(v);
  o.mesh=litMesh(geoAlcapao(e));o.abre=e.aberta?1:0;}
{const _em=escadaIntMontar;escadaIntMontar=function(o){if(o.ext&&o.ext.mod==='alcapao')return alcMontar(o);return _em.apply(this,arguments);};OBRAS.escadaInterna.montar=escadaIntMontar;}
{const _ge=geoEscadaInt;geoEscadaInt=function(e){if(e&&e.mod==='alcapao')return geoAlcapao(e);return _ge.apply(this,arguments);};}
{const _oe=obraEsc;obraEsc=function(o){if(o&&o.ext&&o.ext.mod==='alcapao')return null;return _oe.apply(this,arguments);};}
/* desmontar tira também o colisor da tampa aberta */
{const _da=desmontarAlto;desmontarAlto=function(o){if(o&&o.colTampa&&o.tipo==='escadaInterna'){colRemove(o.colTampa);o.colTampa=null;}return _da.apply(this,arguments);};}
{const _fa=fantasmaAlto;fantasmaAlto=function(){if(OBRA.tipo==='alcapao'&&OBRA.ext&&OBRA.ext.h){const e=OBRA.ext,k='a'+e.h.toFixed(2)+'_'+e.lu+e.lv;
  if(k!==fantasmaK){if(fantasmaM)liberarMesh(fantasmaM);const g=new GB(4096,8);const d=geoAlcapao(e);fantasmaM=meshAlto(d);fantasmaK=k;}return fantasmaM;}return _fa.apply(this,arguments);};}
/* tampa: abre e fecha (de cima, livre; de baixo, empurrando ao subir; com cadeado fechado, de baixo só com a senha) */
function alcTampa(o,abrir,silencio){if(!!o.ext.aberta===!!abrir)return;o.ext.aberta=!!abrir;alcSups(o);if(!silencio)sfx('portaMad',o.x,o.z,0.8);}
function alcEmCima(o){return P.y>o.y-0.6;}
{const _ue=updateEscalada;updateEscalada=function(dt){const e=P.escala,o=e&&e.v&&e.v.dono;
  if(o&&o.tipo==='escadaInterna'&&o.ext&&o.ext.mod==='alcapao'&&!o.ext.aberta){const H=Math.max(0.5,e.v.altura()),uMax=Math.max(0.05,(H-1.85)/H);
    if(e.u>=uMax-0.01&&IN.mz>0.2){e.u=uMax;
      if(trancado(o.ext)){if(G.t-(o.tecT||-9)>1.5){o.tecT=G.t;feed('O alçapão está trancado: digite a senha',true);trancaTeclado(o,'alçapão',()=>{alcTampa(o,true);feed('Senha certa: alçapão aberto');});}}
      else{alcTampa(o,true);feed('Você empurrou a tampa do alçapão');}}
    else if(e.u>uMax)e.u=uMax;}
  return _ue.apply(this,arguments);};}
{const _ce=comecarEscalada;comecarEscalada=function(vp){const o=vp&&vp.v&&vp.v.dono;
  if(o&&o.tipo==='escadaInterna'&&o.ext&&o.ext.mod==='alcapao'&&!o.ext.aberta&&vp.u===1){feed('Abra o alçapão antes (toque E perto dele)',true);sfx('vazio');return;}return _ce.apply(this,arguments);};}
INTERS.push(function alcInter(tryIt){if(!P.alive||CARRO.ativo||P.escala)return;for(const o of OB){if(o.tipo!=='escadaInterna'||!o.ext||o.ext.mod!=='alcapao'||Math.abs(o.x-P.x)>4||Math.abs(o.z-P.z)>4)continue;
  if(!alcEmCima(o))continue;const e=o.ext,pu=-(e.lv||0),pv=e.lu||0;
  for(const q of[[0,0],[pu*(ALC.a+0.45),pv*(ALC.a+0.45)],[-pu*(ALC.a+0.45),-pv*(ALC.a+0.45)],[-(e.lu||0)*(ALC.a+0.45),-(e.lv||0)*(ALC.a+0.45)]]){const w=localW(o,q[0],q[1]);
    tryIt({k:'alcTampa',o},w[0],w[1],1.3,e.aberta?1.0:3.0,-0.8,o.y);}}});
INTER_K.alcTampa={texto:o=>({t:o.ext.aberta?'Fechar o alçapão':'Abrir o alçapão',s:'toque: '+(o.ext.aberta?'fechar':'abrir')+' · segure: cadeado e modelo da escada',alt:true,dur:0.6}),
  usar:(o,seg)=>{if(seg){o.estTipo='escadaInt';o.nome='Alçapão com escada';abrirEstacao(o);return;}alcTampa(o,!o.ext.aberta);},curto:o=>alcTampa(o,!o.ext.aberta)};
/* tampa: desenho (gira na dobradiça) e animação */
INIT_MALHAS.push(function malhaTampa(){const R=rng(5151),g=new GB(2048,8),a=ALC.a,C=k=>lin(COR_CASA[k]);
  for(let i=0;i<4;i++)add(g,boxTris(2*a-0.02,0.05,(2*a)/4-0.02),mat(0,0.025,(i+0.5)*(2*a)/4),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});
  for(const z of[0.25,2*a-0.25])add(g,boxTris(2*a-0.1,0.03,0.08),mat(0,0.065,z),C('esc'));
  add(g,boxTris(0.16,0.04,0.05),mat(0,0.07,2*a-0.1),lin(0x3a3a38));for(const x of[-a+0.2,a-0.2])add(g,boxTris(0.12,0.03,0.1),mat(x,0.05,0.03),lin(0x3a3a38));
  MESH.alcTampa=litMesh(g.data());
  const t=new GB(2048,8);add(t,boxTris(1.4,0.02,1.0),mat(0,0.01,0),lin(0x7a3a2a),{j:0.06,rnd:R});for(const z of[-0.4,-0.2,0,0.2,0.4])add(t,boxTris(1.36,0.022,0.05),mat(0,0.012,z),lin(0xb8995a));
  for(const x of[-0.72,0.72])for(let i=0;i<6;i++)add(t,boxTris(0.06,0.01,0.03),mat(x,0.012,-0.42+i*0.17),lin(0xd8c8a0));MESH.tapete=litMesh(t.data());});
DESENHO.opaco.push(function alcTampas(Pg){if(!MESH.alcTampa)return;for(const o of OB){if(o.tipo!=='escadaInterna'||!o.ext||o.ext.mod!=='alcapao'||d2(o.x,o.z,cam.pos[0],cam.pos[2])>90*90)continue;
  const e=o.ext,lu=e.lu||0,lv=e.lv||0,a=ALC.a,w=localW(o,-lu*a,-lv*a),yaw=o.yaw+Math.atan2(lu,lv);drawStat(Pg,MESH.alcTampa,mat(w[0],o.y+0.005,w[1],-(o.abre||0)*Math.PI*0.5,yaw,0));}});
PASSOS.push(function alcAnima(dt){for(const o of OB){if(o.tipo!=='escadaInterna'||!o.ext||o.ext.mod!=='alcapao')continue;const alvo=o.ext.aberta?1:0;if(o.abre!==alvo)o.abre=approach(o.abre||0,alvo,dt*3);}});

/* ---------- painel da escada: modelo 'alcapao' entra na troca, e o alçapão ganha o cadeado ---------- */
function alcCandidatos(p,o){const kp=modK(p),lim=1.5*kp-ALC.a-0.15,C=[];let base=[0,0];if(o){const l=paraLocal(p,o.x,o.z);base=[clamp(l[0],-lim,lim),clamp(l[1],-lim,lim)];}
  for(const c of[base,[0,0],[lim,0],[-lim,0],[0,lim],[0,-lim]])for(const l of[[0,-1],[0,1],[1,0],[-1,0]])C.push([Math.round(c[0]*4)/4,Math.round(c[1]*4)/4,l[0],l[1]]);return C;}
{const _et=escadaTrocar;escadaTrocar=function(o,mod,inv){const alc=o.ext&&o.ext.mod==='alcapao';if(mod!=='alcapao'&&!alc)return _et.apply(this,arguments);
  const p=platDaEscada(o);if(!p)return'Sem o piso de cima';const e0=Object.assign({},o.ext),velho=[o.x,o.z,o.y,o.yaw];
  if(mod==='alcapao'){if(alc&&!inv)return'Já é alçapão';tirarDoMundo(o);let r=null;
    const cand=alc&&inv?[[e0.cu,e0.cv,-(e0.lu||0),-(e0.lv||0)]]:alcCandidatos(p,o);
    for(const c of cand){r=alcEm(p,c[0],c[1],c[2],c[3]);if(r.ok)break;}
    if(!r||!r.ok){porNoMundo(o,velho[0],velho[1],velho[2],velho[3],e0);return(r&&r.motivo)||'Não cabe aqui';}
    for(const k of['cad','senha','aberta'])if(e0[k]!==undefined)r.ext[k]=e0[k];
    porNoMundo(o,r.x,r.z,r.y,r.yaw,r.ext);if(escadaPisa(o)){tirarDoMundo(o);porNoMundo(o,velho[0],velho[1],velho[2],velho[3],e0);return'Saia da frente: a escada nova vai onde você está';}
    sfx('construir');return inv?'A escada de mão foi para o outro lado':'Escada trocada para alçapão com escada de mão';}
  /* de alçapão para reta ou caracol: o modelo novo vai sem o cadeado (ele volta para a mochila) */
  const su=(e0.cu||0)>=0?1:-1,sv=(e0.cv||0)>=0?1:-1,cand=[];
  if(mod==='caracol'){if(modK(p)<1.01)return'A escada caracol só cabe na casa de 4 m';for(const[a,b]of[[su,sv],[su,-sv],[-su,sv],[-su,-sv]])for(const q of[1,-1])cand.push([a,b,q]);}
  else{const ks=[su>0?0:2,sv>0?3:1];for(const k of[...ks,...[0,1,2,3].filter(q=>!ks.includes(q))])for(const d of[1,-1])cand.push([k,d]);}
  tirarDoMundo(o);let r=null;for(const c of cand){r=mod==='caracol'?caracolEm(p,c[0],c[1],c[2]):retaEm(p,c[0],c[1]);if(r&&r.ok)break;}
  if(!r||!r.ok){porNoMundo(o,velho[0],velho[1],velho[2],velho[3],e0);return(r&&r.motivo)||'Não cabe aqui';}
  porNoMundo(o,r.x,r.z,r.y,r.yaw,r.ext);if(escadaPisa(o)){tirarDoMundo(o);porNoMundo(o,velho[0],velho[1],velho[2],velho[3],e0);return'Saia da frente: a escada nova vai onde você está';}
  if(e0.cad)invAdd('sucata',1);sfx('construir');return mod==='caracol'?'Escada trocada para caracol':'Escada trocada para reta';};}
{const U=ESTACAO_UI.escadaInt,_r=U.render,_a=U.acao;
  U.resumo=o=>o.ext&&o.ext.mod==='caracol'?'Caracol':o.ext&&o.ext.mod==='alcapao'?'Alçapão':'Reta';
  U.render=function(o){const e=o.ext||{},alc=e.mod==='alcapao',r=_r.apply(this,arguments);
    r.acoes=r.acoes.filter(a=>a.id!=='inv');for(const a of r.acoes)if(a.id==='m_reta'&&alc){a.ok=true;a.s='encostada numa parede';}else if(a.id==='m_caracol'&&alc){a.ok=modK(o)>1.01;a.s=modK(o)>1.01?'num canto, em volta de um poste':'só na casa de 4 m';}
    r.acoes.push({id:'m_alcapao',t:'Alçapão com escada de mão',s:alc?'atual':'abertura pequena, tampa e cadeado',ok:!alc,prim:false});
    r.acoes.push({id:'inv',t:alc?'Escada de mão do outro lado':'Inverter o sentido',s:alc?'a escada muda de beirada':e.mod==='caracol'?'gira para o outro lado':'o pé vai para o outro lado',ok:true});
    if(alc){const dentro=alcEmCima(o);r.sub='Sobe '+(e.h||2.6).toFixed(1).replace('.',',')+' m · alçapão '+(e.aberta?'aberto':'fechado');
      r.corpo='<p class="es-info">Tampa '+(e.aberta?'<b>aberta</b>':'<b>fechada</b> (dá para pisar)')+'. '+trancaInfo(e,dentro)+'. '+(dentro?'Você está em cima (lado de dentro).':'Você está embaixo: com o cadeado fechado, a tampa só abre com a senha.')+'</p><p class="es-info">Trocar o modelo não gasta material: a escada é refeita no mesmo andar e a abertura muda junto.</p>';
      r.acoes.unshift({id:'tampa',t:e.aberta?'Fechar a tampa':'Abrir a tampa',s:dentro||!trancado(e)?'':'precisa da senha',ok:dentro||!trancado(e),prim:true},...trancaAcoes(e,dentro));}
    return r;};
  U.acao=function(o,id){const alc=o.ext&&o.ext.mod==='alcapao';
    if(alc){if(id==='tampa'){if(!alcEmCima(o)&&trancado(o.ext))return'Trancado: digite a senha';alcTampa(o,!o.ext.aberta);return o.ext.aberta?'Alçapão aberto':'Alçapão fechado';}
      const t=trancaAcao(o,id,'alçapão',()=>{alcTampa(o,true);feed('Senha certa: alçapão aberto');});if(t!==null)return t;
      if(id==='inv')return escadaTrocar(o,'alcapao',true);}
    if(id==='m_alcapao')return escadaTrocar(o,'alcapao',false);
    return _a.apply(this,arguments);};}
{const _ep=escadaPontos;escadaPontos=function(o){const e=o.ext||{};if(e.mod!=='alcapao')return _ep.apply(this,arguments);const a=ALC.a,h=e.h||3,fg=o.y-h,b=localW(o,(e.lu||0)*(a-0.95),(e.lv||0)*(a-0.95));
  return[[b[0],b[1],fg]];};}
/* o serrote gasta um pouco a cada abertura */
{const _co=colocarObra;colocarObra=function(){const t=OBRA.ativo&&!OBRA.mov?OBRA.tipo:null,n0=OB.length,r=_co.apply(this,arguments);
  if(t==='alcapao'&&OB.length>n0){const s=temSerrote();if(s)gastar(s,2);}
  if(t==='porao'&&OB.length>n0){const s=temPa();if(s)gastar(s,s.id==='pa'?4:6);}return r;};}

/* ---------- PORÃO (aba Casa): alçapão no chão do térreo e cômodos lá embaixo (Y_SUB) ---------- */
const POR={L:4.4,max:4,h:2.8};
OBRAS.porao={nome:'Porão',icon:'i-porao',custo:{tabuas:10,pregos:6,pedra:6,corda:2},hp:700,hw:0.75,hd:0.75,solid:false,etapa:2,montar:porMontar,
  desc:'Cave embaixo da casa (precisa de pá ou picareta): um alçapão no chão do térreo leva a um cômodo lá embaixo. Dá para cavar mais cômodos, pôr cadeado com senha e esconder o alçapão com um tapete.'};
OBRA_ORDEM.push('porao');{const i=OBRAS_CHAO.indexOf('alcapao');OBRAS_CHAO.splice(i>=0?i+1:OBRAS_CHAO.length,0,'porao');}
{const cs=OBRA_CATS.find(c=>c.id==='casa');if(cs&&!cs.t.includes('porao')){const i=cs.t.indexOf('alcapao');cs.t.splice(i>=0?i+1:cs.t.length,0,'porao');}}
BASE_DICAS.porao='Porão pronto: toque E no alçapão para descer. Lá embaixo é escuro e fresco (lanterna ou lamparina) e dá para guardar coisas. Segure E na escada de baixo para cavar mais cômodos; segure E no alçapão para pôr cadeado ou esconder com um tapete.';
const porRet=(o,i,j)=>{const L=POR.L,x=o.x+i*L,z=o.z+j*L;return[x-L/2,x+L/2,z-L/2,z+L/2];};
const sobrepoe=(a,b,m)=>a[0]<b[1]+m&&a[1]>b[0]-m&&a[2]<b[3]+m&&a[3]>b[2]-m;
function porLivre(R,o){for(const s of SUB.salas){if(o&&s.c&&s.c.dono===o)continue;if(sobrepoe(R,[s.x0,s.x1,s.z0,s.z1],1.5))return false;}return true;}
function alvoPorao(x,z,yaw){const p=platDaCasa(),r={x:Math.round(x*4)/4,z:Math.round(z*4)/4,y:0,yaw:p?p.yaw:yaw},no=m=>Object.assign(r,{ok:false,motivo:m});r.y=ground(r.x,r.z);
  if(!p)return no('Cave dentro da casa: o porão vai no chão do térreo, embaixo do piso de cima');
  if(OB.some(q=>q.tipo==='porao'))return no('Você já tem um porão: desça e cave mais cômodos lá embaixo');
  if(!temPa())return no('Precisa de uma pá (ou picareta) para cavar');
  if(Math.hypot(P.x-r.x,P.z-r.z)<1.1)return no('Perto demais de você');
  const ign=q=>q.obra&&q.obra.tipo==='plataforma';for(const[lx,lz]of[[0,0],[0.7,0.7],[-0.7,0.7],[0.7,-0.7],[-0.7,-0.7]]){const w=localW(r,lx,lz);if(bloqueadoChao(w[0],w[1],0.1,r.y,ign))return no('Tem coisa no caminho');if(Math.abs(ground(w[0],w[1])-r.y)>0.35)return no('O chão é torto aqui');}
  if(!porLivre(porRet(r,0,0)))return no('Tem túnel e rocha lá embaixo: cave em outro lugar');
  r.ext={salas:[[0,0]]};r.ok=true;return r;}
OBRAS.porao.alvo=alvoPorao;
function porMontar(o){const e=o.ext;if(!Array.isArray(e.salas)||!e.salas.length)e.salas=[[0,0]];
  const c={id:'porao'+o.id,nome:'Porão',tipo:'porao',salas:[],cor:{piso:0x5a4c3e,par:0x6c5c4a,teto:0x463a2e},seed:977+o.id,dono:o},S=[];
  e.salas.forEach(([i,j],k)=>{const R=porRet(o,i,j);S.push(subSala(c,k?'Porão ('+(k+1)+')':'Porão',R[0],R[1],R[2],R[3],{h:POR.h,escura:0.9}));});
  for(let a=0;a<S.length;a++)for(let b=a+1;b<S.length;b++){const A=e.salas[a],B=e.salas[b];if(Math.abs(A[0]-B[0])+Math.abs(A[1]-B[1])===1)subLiga(S[a],S[b],1.4);}
  o.cols=[];for(const s of S){s.paredes=subParedes(s);for(const p of s.paredes)o.cols.push(colBox((p.x0+p.x1)/2,(p.z0+p.z1)/2,(p.x1-p.x0)/2,(p.z1-p.z0)/2,0,{solid:true,obra:o,y0:s.y-0.5,y1:s.teto+0.3,sub:true}));}
  if(o.sups)for(const q of o.sups)supRemove(q);o.sups=S.map(s=>supAdd({t:'ret',x:(s.x0+s.x1)/2,z:(s.z0+s.z1)/2,hw:(s.x1-s.x0)/2,hd:(s.z1-s.z0)/2,yaw:0,y:s.y,dono:o}));   // piso de verdade: dá para construir lá embaixo
  o.sub=c;o.subM=subGeo(c);}
function porDesmontar(o){if(!o.sub)return;for(const s of o.sub.salas){const i=SUB.salas.indexOf(s);if(i>=0)SUB.salas.splice(i,1);}if(o.subM)liberarMesh(o.subM);o.sub=null;o.subM=null;}
{const _db=desmontarBase;desmontarBase=function(o){if(o&&o.tipo==='porao')porDesmontar(o);return _db.apply(this,arguments);};}
/* descer e subir (a tela escurece, como nos outros subterrâneos) */
const porBaixo=o=>[o.x+0.75,o.z+0.2];
function porDescer(o){sfx('escadaSub');subFade(()=>{const q=porBaixo(o);subIr(q[0],Y_SUB,q[1],o.yaw+Math.PI/2);
  dica('porao','corpo','Porão: escuro e fresco, a chuva não chega. Acenda a lanterna (F) ou ponha uma lamparina. Segure E na escada para cavar mais cômodos.');});}
function porSubir(o){sfx('escadaSub');subFade(()=>{let best=null;for(const[dx,dz]of[[1.2,0],[-1.2,0],[0,1.2],[0,-1.2],[1,1],[-1,-1]]){const w=localW(o,dx,dz);if(!pointBlocked(w[0],w[1],0.3)){best=w;break;}}best=best||localW(o,1.2,0);
  const y=ground(best[0],best[1]);subIr(best[0],y,best[1],o.yaw);P.y=chaoEm(P.x,P.z,y+0.3);});}
const porDentro=()=>P.y<SUB_FUNDO;
INTERS.push(function porInter(tryIt){if(!P.alive||CARRO.ativo)return;for(const o of OB){if(o.tipo!=='porao')continue;
  if(porDentro()){const q=porBaixo(o);if(Math.abs(q[0]-P.x)<4&&Math.abs(q[1]-P.z)<4)tryIt({k:'poraoCasaSobe',o},o.x,o.z,2.2,2.6,-1,Y_SUB);}
  else if(Math.abs(o.x-P.x)<3&&Math.abs(o.z-P.z)<3)tryIt({k:'poraoCasa',o},o.x,o.z,1.9,2.2,-1,o.y);}});
INTER_K.poraoCasa={texto:o=>{const e=o.ext;if(e.tapete)return{t:'Tapete',s:'toque: levantar e descer · segure: porão',alt:true,dur:0.7};
    return{t:trancado(e)?'Porão: alçapão com cadeado':'Descer ao porão',s:'toque: '+(trancado(e)?'digitar a senha':'descer')+' · segure: cadeado e tapete',alt:true,dur:0.7};},
  usar:(o,seg)=>{if(seg){o.estTipo='porao';o.nome='Porão';abrirEstacao(o);return;}INTER_K.poraoCasa.curto(o);},
  curto:o=>{if(trancado(o.ext)){trancaTeclado(o,'porão',()=>porDescer(o));return;}porDescer(o);}};
INTER_K.poraoCasaSobe={texto:o=>({t:'Subir: porão',s:'toque: subir · segure: cavar mais cômodos e cadeado',alt:true,dur:0.7}),
  usar:(o,seg)=>{if(seg){o.estTipo='porao';o.nome='Porão';abrirEstacao(o);return;}porSubir(o);},curto:o=>porSubir(o)};
ESTACOES.porao={nome:'Porão',icon:'i-porao',ir:'',chip:'Porão'};
const POR_LADOS=[['n',0,-1,'norte'],['s',0,1,'sul'],['o',-1,0,'oeste'],['l',1,0,'leste']];
function porCavar(o,lado){const e=o.ext,L=POR_LADOS.find(q=>q[0]===lado);if(!L)return'';if(!porDentro())return'Desça ao porão para cavar';
  if(e.salas.length>=POR.max)return'O porão já tem '+POR.max+' cômodos';const f=temPa();if(!f)return'Precisa de uma pá (ou picareta)';
  const s=salaSubEm(P.x,P.y+0.3,P.z),k=s&&o.sub?o.sub.salas.indexOf(s):-1,base=k>=0?e.salas[k]:e.salas[0],ni=base[0]+L[1],nj=base[1]+L[2];
  if(e.salas.some(q=>q[0]===ni&&q[1]===nj))return'Já tem cômodo desse lado';
  if(!porLivre(porRet(o,ni,nj),o))return'Rocha dura desse lado: cave para outro';
  if(P.energia<20)return'Cansado demais para cavar';
  porDesmontar(o);for(const c of o.cols||[])colRemove(c);o.cols=null;e.salas.push([ni,nj]);porMontar(o);
  gastar(f,f.id==='pa'?3:5);P.energia=Math.max(0,P.energia-20);sfx('passo',undefined,undefined,1,'terra');sfx('quebrar',P.x,P.z,0.5);poeira(P.x,P.y+1,P.z,10);ganharXP(8);return'Cômodo novo cavado ao '+L[3];}
ESTACAO_UI.porao={resumo:o=>{const n=(o.ext.salas||[]).length;return n+' cômodo'+(n>1?'s':'')+(trancado(o.ext)?' · com cadeado':'')+(o.ext.tapete?' · escondido':'');},
  render(o){const e=o.ext,dentro=porDentro(),n=(e.salas||[]).length,A=[];
    if(dentro){for(const[id,,,nome]of POR_LADOS)A.push({id:'cavar_'+id,t:'Cavar ao '+nome,s:n>=POR.max?'máximo de '+POR.max:temPa()?'pá ou picareta · 20 de energia':'precisa de pá ou picareta',ok:n<POR.max&&!!temPa()});}
    A.push(...trancaAcoes(e,dentro));
    if(!dentro)A.push(e.tapete?{id:'tapeteTira',t:'Tirar o tapete',s:'o alçapão aparece de novo'}:{id:'tapetePor',t:'Esconder com um tapete',s:'2 panos · vira esconderijo',ok:invCount('pano')>=2});
    return{sub:n+' cômodo'+(n>1?'s':'')+' lá embaixo · '+(dentro?'você está dentro':'você está em cima'),
      corpo:'<p class="es-info">'+trancaInfo(e,dentro)+'. '+(e.tapete?'O alçapão está <b>escondido</b> embaixo de um tapete. ':'')+'Lá embaixo é escuro e fresco: a chuva não chega e o frio pesa menos. '+(dentro?'Cave mais cômodos com pá ou picareta (até '+POR.max+').':'O lado de dentro do cadeado é lá embaixo.')+'</p>',acoes:A};},
  acao(o,id){const e=o.ext;if(id.startsWith('cavar_'))return porCavar(o,id.slice(6));
    if(id==='tapetePor'){if(invCount('pano')<2)return'Faltam 2 panos';invRemove('pano',2);e.tapete=true;sfx('clique');return'Alçapão escondido embaixo do tapete';}
    if(id==='tapeteTira'){delete e.tapete;invAdd('pano',2);sfx('clique');return'Tapete tirado';}
    const t=trancaAcao(o,id,'porão',()=>porDescer(o));return t===null?'':t;}};
/* desenho: em cima, o alçapão (ou o tapete); lá embaixo, os cômodos e a escada */
INIT_MALHAS.push(function malhasPorao(){const R=rng(7171),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());},C=k=>lin(COR_CASA[k]);
  MESH.obra.porao=mk(g=>{add(g,boxTris(1.5,0.08,1.5),mat(0,0.04,0),C('esc'),{j:0.06,rnd:R});for(let i=0;i<5;i++)add(g,boxTris(1.26,0.05,0.24),mat(0,0.1,-0.5+i*0.25),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});
    for(const z of[-0.45,0.45])add(g,boxTris(1.2,0.03,0.08),mat(0,0.14,z),C('esc2'));add(g,boxTris(0.06,0.06,0.3),mat(0.45,0.15,0),lin(0x3a3a38));});
  MESH.poraoEscada=mk(g=>{for(const x of[-0.22,0.22])add(g,boxTris(0.06,POR.h+0.2,0.06),mat(x,(POR.h+0.2)/2,0),C('esc'),{j:0.06,rnd:R});for(let i=1;i<9;i++)add(g,boxTris(0.46,0.04,0.04),mat(0,i*0.31,0),C('mad'));
    add(g,boxTris(1.3,0.06,1.3),mat(0,POR.h-0.02,-0.25),C('esc'));});});
{const _do=desenharObra;desenharObra=function(Pg,o){if(o.tipo==='porao'&&o.ext&&o.ext.tapete){if(MESH.tapete)drawStat(Pg,MESH.tapete,mat(o.x,o.y+0.01,o.z,0,o.yaw,0));return;}return _do.apply(this,arguments);};}
DESENHO.opaco.push(function poraoDesenho(Pg){const cy=cam.pos[1];if(P.y>SUB_FUNDO&&cy>SUB_FUNDO)return;for(const o of OB){if(o.tipo!=='porao'||!o.subM||d2(o.x,o.z,cam.pos[0],cam.pos[2])>60*60)continue;
  drawStat(Pg,o.subM,ID);if(MESH.poraoEscada)drawStat(Pg,MESH.poraoEscada,mat(o.x,Y_SUB,o.z,0,o.yaw,0));}});
DESENHO.sombra.push(Pg=>{if(P.y>SUB_FUNDO)return;for(const o of OB)if(o.tipo==='porao'&&o.subM&&d2(o.x,o.z,P.x,P.z)<40*40)drawStat(Pg,o.subM,ID);});
/* não muda de lugar; desmontar só com os cômodos vazios e você em cima */
{const _pm=podeMexer;podeMexer=function(o,acao){if(o&&o.tipo==='porao'){if(acao==='mover')return{ok:false,motivo:'O porão não muda de lugar (desmonte e cave outro)'};
    if(porDentro())return{ok:false,motivo:'Suba antes de desmontar o porão'};
    if(o.sub&&OB.some(q=>q!==o&&q.y<SUB_FUNDO&&o.sub.salas.some(s=>q.x>=s.x0&&q.x<=s.x1&&q.z>=s.z0&&q.z<=s.z1)))return{ok:false,motivo:'Tire o que está dentro do porão antes'};}
  return _pm.apply(this,arguments);};}
/* texto da escada de mão do alçapão */
{const _ti=textoInter;textoInter=function(a){const dn=a&&a.k==='via'&&a.o&&a.o.v&&a.o.v.dono;if(dn&&dn.tipo==='escadaInterna'&&dn.ext&&dn.ext.mod==='alcapao'){const e=dn.ext;
  return{t:a.o.u?'Descer pela escada de mão':'Subir pela escada de mão',s:e.aberta?'alçapão aberto':trancado(e)?'alçapão com cadeado: lá em cima pede a senha':'lá em cima, empurre a tampa'};}return _ti.apply(this,arguments);};}
/* a mira do modo de construção acha o porão pelo alçapão de cima (as paredes dele ficam lá embaixo) */
{const _cx=caixasDaObra;caixasDaObra=function(o){if(o&&o.tipo==='porao')return[[o.x,o.z,o.yaw,0.75,0.75,o.y-0.1,o.y+0.25]];return _cx.apply(this,arguments);};}
