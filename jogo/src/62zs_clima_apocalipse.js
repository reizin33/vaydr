/* ================= Clima de fim de mundo: cor, poeira e os sons de longe (v10.3.3, 18/11/2026) =================
   Himalaia: "está faltando aquilo de jogo pós-apocalíptico" (marcou: visual, mundo largado, perigo e tensão, som).
   COR: menos saturada (o verde vivo de desenho apaga), sombras frias e acinzentadas, a luz alta empoeirada, o horizonte com
   poeira, um véu de poeira de dia, céu fechado mais vezes, a vinheta mais forte e o granulado de filme (também no gráfico
   Baixo). Ajustes → Gráficos → Cores: "Fim do mundo" (padrão) ou "Vivas" (como era).
   SONS DE LONGE: de tempos em tempos, longe de você (e mais vezes à noite), alguma coisa acontece no mundo: tiros (de um a três,
   de pistola ou de rifle), um grito comprido, um uivo à noite, metal rangendo, e muito de vez em quando uma explosão. Dentro de
   prédio e no subsolo, não. */
const APOC={T:24,fila:[]};
function apocLigado(){return cfg.cores!=='vivas';}
function apocCor(e){const n=e.n||0,k=e.k||0,r=e.r||0,d=1-n;
  e.sat*=0.84;
  e.lift=mixc(e.lift,[0.93,0.98,1.02],0.5*d);
  e.gain=mixc(e.gain,[1.05,1.0,0.9],0.45*d);
  e.vig=Math.max(e.vig||0.62,lerp(0.82,1.1,n));
  e.mist=Math.min(0.85,(e.mist||0)+0.08*d*(1-k));
  e.cloud=clamp((e.cloud||0.4)+0.1,0.1,0.96);
  e.hor=mixc(e.hor,[0.66,0.64,0.58],0.18*d*(1-r));
  if(e.fogSun)e.fogSun=mixc(e.fogSun,[0.8,0.72,0.6],0.15*d);}
{const _ca=climaAmbiente;climaAmbiente=function(e){const r=_ca.apply(this,arguments);try{if(apocLigado())apocCor(e);}catch(err){console.error('cor do fim do mundo',err);}return r;};}
/* ---------- sons de longe ---------- */
function apocLonge(){const a=Math.random()*6.283,d=34+Math.random()*11;return[P.x+Math.cos(a)*d,P.z+Math.sin(a)*d];}
function apocEvento(){const n=E.n||0,R=Math.random(),p=apocLonge(),agora=G.t;
  if(R<0.34){const rifle=Math.random()<0.35,q=1+Math.floor(Math.random()*3);for(let i=0;i<q;i++)APOC.fila.push({t:agora+i*(0.25+Math.random()*0.7),s:rifle?'rifle':'tiro',x:p[0],z:p[1],v:0.55});}
  else if(R<0.58)APOC.fila.push({t:agora,s:'gritoLonge',x:p[0],z:p[1],v:0.7});
  else if(R<0.74&&n>0.45)APOC.fila.push({t:agora,s:'uivo',x:p[0],z:p[1],v:0.6});
  else if(R<0.94)APOC.fila.push({t:agora,s:'rangido',x:p[0],z:p[1],v:0.8});
  else APOC.fila.push({t:agora,s:'explosao',x:p[0],z:p[1],v:0.35});}
PASSOS.push(function apocSons(dt){if(G.modo!=='jogo'||!AU.ctx)return;
  for(let i=APOC.fila.length-1;i>=0;i--){const q=APOC.fila[i];if(G.t>=q.t){APOC.fila.splice(i,1);sfx(q.s,q.x,q.z,q.v);}}
  APOC.T-=dt;if(APOC.T>0)return;const n=E.n||0;APOC.T=lerp(26,14,n)+Math.random()*lerp(40,24,n);
  if(P.y<-20||(typeof salaEm==='function'&&salaEm(P.x,P.y+0.4,P.z))||CARRO.ativo)return;apocEvento();});
