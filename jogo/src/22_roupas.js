/* ================= roupas: vagas do corpo, efeitos (proteção, calor, chuva, peso, bolsos), desgaste e geometria ================= */
const ROUPA_SLOTS=['cabeca','rosto','camiseta','tronco','maos','cintura','pernas','pes','costas'],
  ROUPA_NOME={cabeca:'Cabeça',rosto:'Rosto',camiseta:'Camiseta',tronco:'Tronco',maos:'Mãos',cintura:'Cintura',pernas:'Pernas',pes:'Pés',costas:'Costas'},
  ROUPA_ICO={cabeca:'i-gorro',rosto:'i-mascara',camiseta:'i-camiseta',tronco:'i-camisa',maos:'i-luva',cintura:'i-cinto',pernas:'i-calca',pes:'i-botas',costas:'i-mochila'};
const BOLSOS=6,ESPACO_MOCHILA=18;
/* qualidade (couro e roupa feita dele): Baixa, Comum, Boa, Excepcional → durabilidade e efeito */
const QUAL_DUR=[0.75,1,1.25,1.5],QUAL_EF=[0.9,1,1.08,1.15];
function durMaxDe(s){const d=ITEMS[s.id];if(!d||!d.durMax)return 0;return Math.round(d.durMax*QUAL_DUR[s.q??1]*Math.max(0.5,1-0.1*(s.rep||0))*(s.up&&s.up.cabo?1.25:1));}
function nomeItem(s){const d=ITEMS[s.id];if(!d)return s.id;return d.nome+(s.q!==undefined&&d.qual!==false&&(d.qual||d.tipo==='roupa')?' ('+QUAL_NOME[s.q].toLowerCase()+')':'');}
function espacoCostas(id){return id?(ITEMS[id].espaco||ESPACO_MOCHILA):0;}
function bolsosExtra(){let n=0;for(const s of ROUPA_SLOTS){const id=P.roupa&&P.roupa[s];if(id&&ITEMS[id]&&ITEMS[id].bolsos)n+=ITEMS[id].bolsos;}return n;}
function invLimite(){return BAR_N+BOLSOS+bolsosExtra()+espacoCostas(P.roupa&&P.roupa.costas);}
function roupaGeometry(P,id,op){op=op||{};const g=new GB(4096,8),M=corpoMedidas(P),R=rng(id.length*31+7);
  const put=(b,tris,m,col,j)=>add(g,tris,m,col,{b,j:j===undefined?0.05:j,rnd:R});
  const ra=M.braco.R,rl=M.coxa.R,T=P.torsoH;
  if(id==='camisaCouro'){const cu=lin(0x8a5a36),es=lin(0x5a3820);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0,0.955,0.013,18),ID,cu);for(const[t,m]of ombrosTris(P,0.013))put(1,t,m,cu);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0,0.06,0.019,16),ID,es);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0.9,0.975,0.022,16),ID,es);
    for(const s of[1,-1]){const b=s>0?3:5;put(b,ellipTris(ra*1.12+0.014,ra*1.25+0.012,ra*1.06+0.014,12,8),mat(-s*0.008,-0.01,0),cu);
      put(b,parteCorpo(M,F_BRACO,'braco',0,0.5,0.013,12),ID,cu);put(b,parteCorpo(M,F_BRACO,'braco',0.43,0.5,0.018,12),ID,es);}
    const fz=M.tronco.R*M.tronco.sz;for(let i=0;i<3;i++){const y=T*(0.72+i*0.07);for(const s of[1,-1])put(1,bevelTris(0.05,0.008,0.008,0.003),mat(0,y,fz*0.84+0.03-i*0.004,0,0,s*0.55),lin(0xd8c08a),0);}}
  if(id==='casacoPele'){const co=lin(0x7a5638),pe=lin(0xd6c29c),es=lin(0x4a3220);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0,0.95,0.028,18),ID,co);for(const[t,m]of ombrosTris(P,0.028))put(1,t,m,co);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0.84,1,0.05,16),ID,pe,0.12);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0,0.07,0.04,16),ID,pe,0.12);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0.05,0.86,0.032,3,{a0:-0.05,a1:0.05}),ID,es);
    const fz=M.tronco.R*M.tronco.sz;for(let i=0;i<4;i++)put(1,latheTris([[0.009,-0.025],[0.011,0.025]],8,1,1,{capB:true,capT:true}),mat(0.02,T*(0.2+i*0.17),fz*(i<3?0.98:0.9)+0.04,0,0,Math.PI/2),lin(0xcdb58a),0);
    put(0,parteCorpo(M,F_PELVE,'pelve',0.25,1,0.036,14),ID,co);put(0,parteCorpo(M,F_PELVE,'pelve',0.25,0.36,0.046,14),ID,pe,0.12);
    for(const s of[1,-1]){const b=s>0?3:5,l=s>0?4:6;put(b,ellipTris(ra*1.12+0.026,ra*1.25+0.022,ra*1.06+0.026,12,8),mat(-s*0.008,-0.01,0),co);
      put(b,parteCorpo(M,F_BRACO,'braco',0,1,0.024,12),ID,co);put(l,ellipTris(ra*0.77+0.024,ra*0.84+0.02,ra*0.74+0.024,10,6),ID,co);
      put(l,parteCorpo(M,F_ANTEB,'antebraco',0,0.8,0.022,12),ID,co);put(l,parteCorpo(M,F_ANTEB,'antebraco',0.72,0.9,0.034,12),ID,pe,0.12);}}
  if(id==='calcaCouro'){const cu=lin(0x6b4a30),es=lin(0x46301e);
    put(0,parteCorpo(M,F_PELVE,'pelve',0,1,0.012,14,{capB:true}),ID,cu);
    put(0,latheTris([[M.pelve.R*0.95,0.05],[M.pelve.R*0.96,0.09]],14,1,M.pelve.sz,{dr:0.02}),ID,lin(0x2a1d14));
    put(0,bevelTris(0.05,0.04,0.012,0.006),mat(0,0.07,M.pelve.R*M.pelve.sz*0.96+0.022),lin(0xb9a06a),0);
    for(const s of[1,-1]){const u=s>0?7:9,l=s>0?8:10;put(u,parteCorpo(M,F_COXA,'coxa',0,1,0.013,12),ID,cu);
      put(u,parteCorpo(M,F_COXA,'coxa',0.05,0.95,0.016,2,{a0:s*Math.PI/2-0.025,a1:s*Math.PI/2+0.025}),ID,es);
      put(l,ellipTris(rl*0.75+0.013,rl*0.82+0.012,rl*0.76+0.013,10,6),ID,cu);put(l,ellipTris(rl*0.6,rl*0.62,0.014,10,6),mat(0,-0.01,rl*0.76+0.012),es);
      put(l,parteCorpo(M,F_CANELA,'canela',0,0.9,0.012,12),ID,cu);}}
  if(id==='botasCouro'){const cu=lin(0x5a3a24),so=lin(0x241a12);
    for(const s of[1,-1]){const l=s>0?8:10,fy=-P.shin-P.foot/2;
      put(l,parteCorpo(M,F_CANELA,'canela',0.62,1,0.022,12),ID,cu);put(l,parteCorpo(M,F_CANELA,'canela',0.6,0.67,0.03,12),ID,lin(0x6e4a2e));
      put(l,bevelTris(P.legW*1.0,P.foot+0.03,P.legW*1.78,0.034,{tz:0.9,tx:0.94}),mat(0,fy+0.01,0.056),cu);
      put(l,bevelTris(P.legW*1.04,0.03,P.legW*1.82,0.01),mat(0,-P.shin-P.foot+0.004,0.056),so);
      for(let i=0;i<3;i++)put(l,boxTris(0.05,0.007,0.008),mat(0,-P.shin*(0.88-i*0.07),M.canela.R*0.6+0.03,0,0,0),lin(0xcdb58a),0);}}
  if(id==='mochila'||id==='mochilaRef'||id==='mochilaPequena'||id==='mochilaExpedicao'){const ref=id==='mochilaRef'||id==='mochilaExpedicao',k=id==='mochilaPequena'?0.82:id==='mochilaExpedicao'?1.28:ref?1.13:1,T=P.torsoH,fzc=M.tronco.R*M.tronco.sz,mz=-(fzc*0.98)-0.105*k+(op.dz||0),my=T*(ref?0.47:0.5)+(op.dy||0),
      pq=id==='mochilaPequena',ve=lin(pq?0x2c3036:ref?0x5e4934:0x56603a),vd=lin(pq?0x22262b:ref?0x47372a:0x434b2e),vb=lin(pq?0x2a2e33:ref?0x52402e:0x4a5331),al=lin(pq?0x1c1e22:ref?0x2e2a24:0x3a4128),fv=lin(0xa9a69c);
    put(1,latheTris([[0.1,-0.21],[0.148,-0.17],[0.165,-0.06],[0.162,0.08],[0.14,0.17],[0.08,0.22],[0,0.235]].map(([r,y])=>[r*k,y*k]),16,1.15,0.6,{capB:true}),mat(0,my,mz),ve);
    put(1,ellipTris(0.17*k,0.05,0.115*k,14,8),mat(0,my+0.185*k,mz+0.012),vd);put(1,ellipTris(0.125*k,0.09*k,0.055,14,8),mat(0,my-0.1*k,mz-0.085*k),vb);
    for(const s of[1,-1])put(1,ellipTris(0.045*k,0.085*k,0.062*k,10,7),mat(s*0.18*k,my-0.05*k,mz-0.005),vb);
    put(1,latheTris([[0.055,-0.215],[0.082,-0.195],[0.09,-0.155],[0.09,0.155],[0.082,0.195],[0.055,0.215]],14,1,1,{capB:true,capT:true}),mat(0,my+0.3*k,mz+0.01,0,0,Math.PI/2),lin(ref?0x4f5c3b:0x7a5537));
    for(const x of[-0.11,0.11])put(1,latheTris([[0.094,-0.014],[0.094,0.014]],14,1,1),mat(x,my+0.3*k,mz+0.01,0,0,Math.PI/2),lin(0x2f2a22),0);
    if(ref){for(const s of[1,-1]){put(1,bevelTris(0.04,0.2,0.016,0.006),mat(s*0.07,my-0.02,mz-0.112*k-0.012,0,0,0),al);put(1,boxTris(0.05,0.035,0.012),mat(s*0.07,my-0.1,mz-0.112*k-0.022),fv,0);}
      put(1,ellipTris(0.1,0.075,0.045,12,7),mat(0,my+0.07,mz-0.118*k),vd);}
    if(!op.semAlca)for(const s of[1,-1]){const x=s*0.12;put(1,bevelTris(0.05,0.018,0.3,0.007),mat(x,T+0.008,-0.02,0.12,0,0),al);
      put(1,bevelTris(0.05,0.34,0.018,0.007),mat(x,T*0.68,fzc*0.98+0.012,0.08,0,0),al);if(ref)put(1,boxTris(0.055,0.03,0.014),mat(x,T*0.5,fzc*0.98+0.022),fv,0);}}
  if(id==='gorroPele'){const co=lin(0x8c6b4a),pe=lin(0xd8c4a0),H=M.cabeca;
    put(2,parteCorpo(M,P.fCab||F_CABECA,'cabeca',0.6,1,0.022,16,{capT:true}),ID,co);
    put(2,parteCorpo(M,P.fCab||F_CABECA,'cabeca',0.55,0.7,0.036,16),ID,pe,0.12);
    for(const s of[1,-1])put(2,bevelTris(0.05,0.13,0.1,0.02,{bx:0.85,bz:0.8}),mat(s*(H.R+0.03),H.y0+H.h*0.44,-0.01,0,0,s*0.08),pe,0.12);}
  roupaGeoNova(put,P,id,M);   // roupas achadas no mundo (23_aparencia)
  return g.data();}
/* efeitos: cada peça conta pelo estado dela (rasgada não protege; abaixo de 30% protege menos) e pela qualidade */
function roupaItem(slot){const id=P.roupa&&P.roupa[slot];return id?ITEMS[id]:null;}
function roupaInfoDe(slot){if(!P.roupaInfo)P.roupaInfo={};const id=P.roupa[slot];if(!id)return null;let I=P.roupaInfo[slot];if(!I||I.id!==id){I=P.roupaInfo[slot]={id,dur:ITEMS[id].durMax||0,q:1,rep:0};}return I;}
function roupaMax(slot){const I=roupaInfoDe(slot);return I?durMaxDe(I):0;}
function roupaEf(slot){const id=P.roupa&&P.roupa[slot];if(!id)return 0;const d=ITEMS[id];if(!d.durMax)return 1;const I=roupaInfoDe(slot),mx=durMaxDe(I);if(I.dur<=0)return 0;const f=I.dur/mx;return QUAL_EF[I.q??1]*(f<0.3?0.6+0.4*f/0.3:1);}
function somaRoupa(k){let v=0;for(const s of ROUPA_SLOTS){const d=roupaItem(s);if(d&&d[k])v+=d[k]*roupaEf(s);}return v;}
function protecao(){return Math.min(0.45,somaRoupa('prot'));}
function chuvaRoupa(){return Math.min(0.85,somaRoupa('chuva'));}
function esporosRoupa(){let v=0;for(const s of ROUPA_SLOTS){const d=roupaItem(s);if(d&&d.esporos)v=Math.max(v,d.esporos*roupaEf(s));}return v;}
function fogoRoupa(){return Math.min(0.6,somaRoupa('fogo'));}
function pesoRoupa(){let v=0;for(const s of ROUPA_SLOTS){const d=roupaItem(s);if(d&&d.peso)v+=d.peso;}return v;}
function calorRoupa(){const q=somaRoupa('quente'),m=P.molhado||0;return Math.min(1,q*(1-0.4*m*(1-chuvaRoupa())));}
function pertoDoFogo(){if(Math.hypot(P.x-FIRE[0],P.z-FIRE[2])<7)return true;for(const f of FIRES)if(!f.lamp&&Math.hypot(P.x-f.x,P.z-f.z)<6)return true;return false;}
function comFrio(){if(!P.alive||CARRO.ativo||pertoDoFogo())return false;const ab=typeof abrigado==='function'&&abrigado(),cal=calorRoupa()+(ab?0.35:0);return((E.n||0)>0.6&&cal<0.99)||climaFrio()*(ab?0.5:1)>cal+0.01;}
function itemDeRoupa(id,I){const it=newItem(id,1);if(I){if(I.dur!==undefined)it.dur=I.dur;if(I.q!==undefined)it.q=I.q;if(I.rep)it.rep=I.rep;}return it;}
/* vestir: troca com o que estava na vaga; os espaços que deixam de existir (bolsos, mochila) precisam estar vazios */
function vestir(i){const s=P.inv[i];if(!s)return;const d=ITEMS[s.id];if(!d||d.tipo!=='roupa')return;const slot=d.slot,velho=P.roupa[slot],vI=velho?Object.assign({},roupaInfoDe(slot)):null;
  P.roupa[slot]=s.id;const lim=invLimite();P.roupa[slot]=velho;
  for(let k=lim;k<INV_N;k++)if(k!==i&&P.inv[k]){feed(slot==='costas'?'Esvazie os últimos espaços da mochila antes de trocar':'Esvazie os últimos espaços antes de trocar',true);return;}
  let k=i;if(velho&&i>=lim){k=P.inv.findIndex((x,j)=>j<lim&&j!==i&&!x);if(k<0){feed('Sem espaço para guardar a peça que você tirou',true);return;}}
  P.roupa[slot]=s.id;if(!P.roupaInfo)P.roupaInfo={};P.roupaInfo[slot]={id:s.id,dur:s.dur??(d.durMax?durMaxDe(s):0),q:s.q??1,rep:s.rep||0};
  P.inv[i]=null;if(velho)P.inv[k]=itemDeRoupa(velho,vI);sfx('pegar');feed('Vestiu: '+nomeItem(s).toLowerCase());
  if(slot==='tronco'||slot==='pernas')dica('roupa','corpo','Roupas protegem dos golpes, esquentam e seguram a chuva. Cada peça gasta com os golpes e o uso: veja o estado na mochila e conserte com remendo, linha e agulha.');
  if(typeof progresso==='function')progresso('vestir');}
function tirarRoupa(slot){const id=P.roupa[slot];if(!id)return false;const I=Object.assign({},roupaInfoDe(slot));P.roupa[slot]=null;const lim=invLimite();P.roupa[slot]=id;
  for(let k=lim;k<INV_N;k++)if(P.inv[k]){feed(slot==='costas'?'Esvazie a mochila antes de tirar':'Esvazie os últimos espaços antes de tirar',true);return false;}
  const k=P.inv.findIndex((x,j)=>j<lim&&!x);if(k<0){feed('Mochila cheia',true);return false;}
  P.roupa[slot]=null;if(P.roupaInfo)delete P.roupaInfo[slot];P.inv[k]=itemDeRoupa(id,I);sfx('clique');return true;}
