/* ================= Etapa 14: fauna e domesticação · peixes =================
   Dez espécies nos rios e no Lago Serra Azul, ligadas à pesca que já existe (vara de pesca, peixe cru, assado e defumado):
   lambari, tilápia, traíra, piau, mandi, cascudo, tucunaré, pacu, dourado e bagre. O que morde depende do lugar (rio ou lago),
   da hora (mandi e bagre mordem mais de noite; traíra ao entardecer e de noite) e da chuva (dourado sobe o rio com chuva).
   Cada peixe tem peso: peixe pequeno rende 1 peixe cru, peixe grande rende até 5. Peixe grande puxa forte: a janela para
   puxar é mais curta. O diário guarda as espécies pescadas, quantas de cada e o maior de cada uma.
   Na água perto de você, de vez em quando um peixe pula (com o respingo e as ondinhas). */
const PEIXES={
  lambari:{nome:'Lambari',onde:{rio:6,lago:4},kg:[0.03,0.12],noite:0.8,janela:1.6,cor:0xc8ccc4,tam:0.5},
  tilapia:{nome:'Tilápia',onde:{rio:2,lago:6},kg:[0.3,1.4],noite:0.7,janela:1.4,cor:0x8a9a88,tam:0.9},
  traira:{nome:'Traíra',onde:{rio:3,lago:4},kg:[0.4,2.5],noite:1.8,janela:1.0,cor:0x5a5a3a,tam:1.0},
  piau:{nome:'Piau',onde:{rio:4},kg:[0.2,1.2],noite:0.8,janela:1.3,cor:0xb0a070,tam:0.9},
  mandi:{nome:'Mandi',onde:{rio:3},kg:[0.1,0.6],noite:3,dia:0.35,janela:1.4,cor:0xa8a090,tam:0.7},
  cascudo:{nome:'Cascudo',onde:{rio:2.5},kg:[0.2,0.9],noite:1.6,janela:1.5,cor:0x3a3428,tam:0.8},
  tucunare:{nome:'Tucunaré',onde:{lago:3},kg:[0.5,3.0],noite:0.4,janela:0.95,cor:0x9aa040,tam:1.1},
  pacu:{nome:'Pacu',onde:{lago:2.5},kg:[0.8,4.0],noite:0.8,janela:1.05,cor:0x6a6a70,tam:1.15},
  dourado:{nome:'Dourado',onde:{rio:0.6},kg:[1.5,6.0],noite:0.7,chuva:2.5,janela:0.8,cor:0xe0a830,tam:1.35},
  bagre:{nome:'Bagre',onde:{rio:1.5,lago:2},kg:[0.5,3.5],noite:2.6,dia:0.4,janela:1.1,cor:0x6a6050,tam:1.2}};
function peixeLocal(x,z){return lagoR(x,z)<1?'lago':'rio';}
function peixeSorteia(x,z){const L=peixeLocal(x,z),noite=(E.n||0)>0.5,tarde=G.hora>=17&&G.hora<19.5,chuva=(G.chuva||0)>0.4,inv=typeof estacaoIdx==='function'&&estacaoIdx()===3;const W=[];
  for(const k in PEIXES){const F=PEIXES[k];let w=F.onde[L]||0;if(!w)continue;w*=noite?F.noite:(F.dia||1);if(tarde&&k==='traira')w*=1.6;if(chuva&&F.chuva)w*=F.chuva;if(inv&&k!=='lambari'&&k!=='bagre')w*=0.8;W.push([k,w]);}
  let t=W.reduce((s,q)=>s+q[1],0)*Math.random();for(const[k,w]of W){t-=w;if(t<=0)return k;}return W.length?W[0][0]:'lambari';}
function peixeKg(id){const F=PEIXES[id],u=Math.random();return Math.round(lerp(F.kg[0],F.kg[1],u*u*(0.6+0.4*u))*100)/100;}
const peixeRende=kg=>clamp(Math.round(kg/0.75),1,5);
const kgTxt=kg=>kg<1?Math.round(kg*1000)+' g':(Math.round(kg*10)/10).toString().replace('.',',')+' kg';
function peixesReg(){if(!G.peixes)G.peixes={};return G.peixes;}
function peixeRecorde(id){const r=peixesReg()[id];return r?' · pescados: '+r.n+' · maior: '+kgTxt(r.max):'';}
/* a mordida escolhe a espécie e o peso; peixe grande puxa forte (janela menor) */
{const _up=updatePesca;updatePesca=function(dt){const p=P.pesca,antes=p&&p.mordeu;_up.apply(this,arguments);const q=P.pesca;
  if(q&&q.mordeu&&!antes&&!q.esp){q.esp=peixeSorteia(q.x,q.z);q.kg=peixeKg(q.esp);q.janela=PEIXES[q.esp].janela*(q.kg>2?0.85:1);if(q.kg>=1.5)feed('Peixe grande! Puxa forte: aperte E já!',true);}};
  const i=PASSOS.indexOf(_up);if(i>=0)PASSOS[i]=updatePesca;}
{const K=INTER_K.pescaPuxar,_tx=K.texto;K.texto=function(p){const r=_tx.apply(this,arguments);if(p&&p.mordeu&&p.kg>=1.5)return Object.assign({},r,{s:'agora! peixe grande puxando'});return r;};
 K.usar=function(p){const s=selItem();if(p.mordeu&&p.janela>0){const r=Math.random();sfx('puxar',p.x,p.z,0.6);if(s&&s.id==='vara')gastar(s,1);
    if(r<0.84){const id=p.esp||peixeSorteia(p.x,p.z),kg=p.kg||peixeKg(id),n=peixeRende(kg),F=PEIXES[id];ganhar('peixeCru',n);
      const R=peixesReg(),e=R[id]||(R[id]={n:0,max:0});e.n++;const rec=kg>e.max&&e.n>1;e.max=Math.max(e.max,kg);
      feed('Pegou '+(['traira','tilapia','piau'].includes(id)?'uma ':'um ')+F.nome.toLowerCase()+' de '+kgTxt(kg)+(n>1?' ('+n+' peixes crus)':'')+(rec?' · seu maior '+F.nome.toLowerCase()+'!':''));
      ganharXP(4+Math.round(kg*2));progresso('pesca');if(typeof diarioConta==='function')diarioConta('peixes',1);
      if(typeof diarioDescobre==='function')diarioDescobre('peixe',id,F.nome,2);
      peixePula(p.x,p.z,id,kg,true);dica('peixe','corpo','Peixe! Asse na fogueira: segure E perto do fogo. Cada espécie aparece no diário, com o maior que você pescou.');}
    else{const it=r<0.93?'sucata':'garrafa';ganhar(it,1);feed('Veio lixo no anzol',true);}}
  else feed('Recolheu a linha');P.pesca=null;};}

/* ---------- peixes pulando na água perto de você ---------- */
const PULOS=[];let puloT=6;
function peixePula(x,z,id,kg,saida){const nv=RIO.ok?aguaNivel(x,z):null;if(nv===null)return;const F=PEIXES[id]||PEIXES.lambari,s=clamp(0.6+(kg||0.5)*0.35,0.5,1.9)*F.tam;
  PULOS.push({x,z,y0:nv,t:0,dur:saida?0.5:0.55+Math.random()*0.35,h:saida?0.9:0.35+Math.random()*0.45,yaw:Math.random()*6.283,id,s,dx:saida?(P.x-x)*0.6:(Math.random()-0.5)*1.4,dz:saida?(P.z-z)*0.6:(Math.random()-0.5)*1.4,anel:false});
  RINGS.push({x,z,y:nv+0.02,a:0});if(Math.hypot(x-P.x,z-P.z)<35)sfx('nado',x,z,0.35);}
PASSOS.push(function peixesPulam(dt){if(G.modo!=='jogo'||!RIO.ok||P.y<-20)return;puloT-=dt;
  if(puloT<=0){puloT=5+Math.random()*9;if(aguaPerto(P.x,P.z,38)){for(let k=0;k<10;k++){const a=Math.random()*6.283,d=7+Math.random()*24,x=P.x+Math.sin(a)*d,z=P.z+Math.cos(a)*d;
        if(aguaNivel(x,z)===null||aguaProf(x,z)<0.6)continue;const id=peixeSorteia(x,z);peixePula(x,z,id,peixeKg(id)*0.7,false);break;}}}
  for(let i=PULOS.length-1;i>=0;i--){const q=PULOS[i];q.t+=dt;if(q.t>=q.dur){if(!q.anel){q.anel=true;const x=q.x+q.dx,z=q.z+q.dz;RINGS.push({x,z,y:q.y0+0.02,a:0});}PULOS.splice(i,1);}}});
INIT_MALHAS.push(function peixesMalhas(){MESH.peixe={};const R=rng(1919);
  for(const k in PEIXES){const F=PEIXES[k],c=lin(F.cor),cb=lin(0xe8e4d8),g=new GB(512,8),o={j:0.05,rnd:R};
    add(g,ellipTris(0.035,0.06,0.15,9,6),mat(0,0,0),c,o);add(g,ellipTris(0.03,0.035,0.12,8,5),mat(0,-0.022,0.01),cb,o);
    add(g,boxTris(0.006,0.075,0.06,{tx:1.6}),mat(0,0,-0.17),c,o);add(g,boxTris(0.005,0.035,0.06),mat(0,0.06,-0.01,0.3,0,0),c,o);
    for(const s of[1,-1])add(g,ellipTris(0.008,0.008,0.006,5,4),mat(s*0.026,0.015,0.11),lin(0x0a0a08),{j:0,rnd:R});
    if(k==='tucunare')add(g,ellipTris(0.012,0.012,0.008,6,4),mat(0.03,0.01,-0.11),lin(0x1a2a10),o);
    if(k==='bagre'||k==='mandi')for(const s of[1,-1])add(g,cylTris(0.002,0.003,0.07,4),mat(s*0.02,-0.01,0.14,1.2,0,s*0.5),c,o);
    MESH.peixe[k]=litMesh(g.data());}});
DESENHO.opaco.push(function peixesDesenho(Pg){if(!MESH.peixe)return;for(const q of PULOS){if(d2(q.x,q.z,cam.pos[0],cam.pos[2])>60*60)continue;const u=q.t/q.dur,y=q.y0+Math.sin(u*Math.PI)*q.h,x=q.x+q.dx*u,z=q.z+q.dz*u;
  const yaw=Math.atan2(q.dx,q.dz)||q.yaw,pitch=-Math.cos(u*Math.PI)*1.0;drawStat(Pg,MESH.peixe[q.id]||MESH.peixe.lambari,mat(x,y,z,pitch,yaw,Math.sin(q.t*20)*0.25,q.s,q.s,q.s));}});

/* ---------- diário: estatísticas novas (peixes, cavalos, gavião) ---------- */
{const _dr=diarioRender;diarioRender=function(){_dr.apply(this,arguments);if(diarioAba!=='est')return;const el=$('dr-lista');if(!el)return;const R=peixesReg(),ids=Object.keys(R);
  let maior=null;for(const k of ids)if(!maior||R[k].max>R[maior].max)maior=k;
  const L=[['Espécies de peixe pescadas',ids.length+' de '+Object.keys(PEIXES).length],['Maior peixe',maior?PEIXES[maior].nome+', '+kgTxt(R[maior].max):'nenhum ainda']];
  if(typeof CAVALOS!=='undefined')L.push(['Cavalos domados',String(CAVALOS.length)]);if(typeof GAV!=='undefined')L.push(['Gavião',GAV.domado?GAV.nome+', nível '+gavNivel():'nenhum']);
  let h='';for(const[n,v]of L)h+='<li class="ok">'+svgUse('i-grade')+'<span><b>'+n+'</b><small>'+v+'</small></span></li>';el.insertAdjacentHTML('beforeend',h);};}

/* ---------- salvar e carregar (junto do jogo) ---------- */
V8.novo.peixes=()=>{G.peixes={};PULOS.length=0;};
V8.salvar.peixes=()=>peixesReg();
V8.carregar.peixes=s=>{G.peixes=s&&typeof s==='object'?s:{};PULOS.length=0;};

/* ---------- manual: as espécies, onde e quando ---------- */
MANUAL_EXTRA.push(()=>[{id:'x:peixes',sec:'comida',nome:'Peixes dos rios e do lago',icon:'i-peixe',trav:false,como:'desde o começo',
  desc:'Dez espécies mordem a isca da vara de pesca. Todas viram peixe cru (assado na fogueira ou defumado).',
  ing:{},est:{nome:'Onde: Rio Claro e Lago Serra Azul',icon:'i-vara',onde:''},ferr:['Vara de pesca na mão, perto da água'],
  proc:Object.keys(PEIXES).filter(k=>!PEIXES[k].onde.mar).map(k=>{const F=PEIXES[k],o=Object.keys(F.onde).map(q=>q==='rio'?'rio':'lago').join(' e ');   // os do mar têm guia próprio (Etapa 20)
    return F.nome+': '+o+', de '+kgTxt(F.kg[0])+' a '+kgTxt(F.kg[1])+(F.noite>1.5?'; morde mais de noite':F.noite<0.6?'; morde mais de dia':'')+(F.chuva?'; sobe o rio com chuva':'')+'.';}),
  res:null,obs:['No lago morde mais rápido; de noite e com chuva muda o que aparece.','Peixe grande puxa forte: a janela para puxar é mais curta, mas rende até 5 peixes crus.',
    'O diário (J → Descobertas) guarda cada espécie pescada e o maior de cada uma.'],tipo:'Guia'}]);
