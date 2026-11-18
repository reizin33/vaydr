/* ================= Campo largado: fazenda, sítios e estradas de terra (v10.3.6, 18/11/2026) =================
   Etapa 3 (mundo largado), depois da vila. O campo também estava arrumado demais:
   · as casas dos seis sítios desbotaram como as da vila (a parede perdeu metade do tom, a telha escureceu); a casa e o celeiro
     da fazenda também (10_world: o vermelho do celeiro virou vermelho velho, o telhado de zinco enferrujou);
   · o mato tomou os terreiros: moitas encostadas nas paredes da casa e do celeiro, capim alto ao longo das cercas (onde ninguém
     roça mais) e nos cantos do quintal;
   · tralha largada no terreiro: pneus velhos, tambores (alguns tombados), galões, caixas, sacos de adubo, tocos, uma escada
     caída;
   · as estradas de terra viraram duas trilhas de pneu com capim no meio (o mato voltou no meio e nas beiras);
   · uma carcaça queimada atrás do celeiro da fazenda, com o porta-malas para revistar.
   Árvore caída na estrada não entra aqui: o jogo já tem o evento da estrada bloqueada (depois de tempestade).
   Nada some do que já tinha. As moitas novas entram no fim da lista (os números das outras não mudam) e o resto entra depois
   da mata nascer: os jogos salvos continuam valendo. Os canteiros de plantar (plantação da fazenda e hortas dos sítios), os
   pontos de usar (poço, bancada, porta-malas), as portas e os veículos parados ficam livres. */
const CAMPO_LARG={info:null};
/* cores das casas dos sítios: a lista fica dentro de sitiosMontar e nasce de novo a cada montagem (mudar no lugar não acumula) */
{const _pr=predioRural;predioRural=function(sp){
  if(sp&&typeof sp.local==='string'&&sp.local.startsWith('sitio')&&Array.isArray(sp.cores)&&!sp.cores.larg){const c=sp.cores;c[0]=vlMix(c[0],0x837c70,0.58);c[3]=vlMix(c[3],0x3a3530,0.6);c.larg=true;}
  return _pr.apply(this,arguments);};}
/* lugar livre para mato e tralha */
const CL_VEIC=[[-57,49],[-79,63],[-76.5,63.5]];   // a caminhonete e o triciclo da fazenda (que sai de dentro do celeiro) ficam livres
function clLivre(x,z,r){if(pointBlocked(x,z,r))return false;if(typeof ruralCasaEm==='function'&&ruralCasaEm(x,z,r+0.3))return false;
  for(const p of RURAIS)for(const e of(p.entradas||[]))if(Math.hypot(e.x-x,e.z-z)<1.9)return false;
  for(const o of INTER)if(Math.abs(o.x-x)<3.2&&Math.abs(o.z-z)<3.2&&Math.hypot(o.x-x,o.z-z)<1.7+r)return false;
  for(const c of PLANTIO_DEF)if(segDist(x,z,c.ax,c.az,c.bx,c.bz)<1.1+r)return false;
  for(const v of CL_VEIC)if(Math.hypot(v[0]-x,v[1]-z)<4.2)return false;
  if(typeof EST_MUNDO!=='undefined')for(const e of EST_MUNDO)if(Math.hypot(e.x-x,e.z-z)<2.6)return false;
  return true;}
const clNaEstrada=(x,z,m)=>{const ri=roadInfo(x,z);return!!ri.road&&ri.d<ri.road.w/2+(m||0);};
function clMoita(info,R,x,z,s){if(!clLivre(x,z,0.4))return false;if(BUSHES.some(b=>Math.abs(b.x-x)<1.3&&Math.abs(b.z-z)<1.3))return false;
  BUSHES.push({id:BUSHES.length,x,z,y:ground(x,z),s:s||0.75+R()*0.45,r:R()*6.283,frutas:R()<0.25,cresce:0,t:0.85+R()*0.3,cidade:true});info.moitas++;return true;}
/* capim: o alto (cerca, cantos do quintal, terreiro) é maior que o capim de sempre e parte dele está seco (amarelado) */
function clCapim(info,R,x,z,s,livre,alto){if(livre?!clLivre(x,z,0.25):pointBlocked(x,z,0.25))return false;
  const g={x,z,y:ground(x,z)-0.02,r:R()*6.283,s:alto?1.05+R()*0.75:s,t:0.72+R()*0.33};
  if(alto&&R()<0.4){g.tr=1.18+R()*0.15;g.tg=0.9+R()*0.1;g.tb=0.52+R()*0.12;}
  GRASS.push(g);info.capim++;return true;}
/* tralha: [modelo, altura do meio quando tombado (deitado de lado; medida dos modelos), chance de tombar] */
const CL_TRALHA=[['pneuVelho',0.08,0.75],['pneuVelho',0.08,0.75],['tamborVelho',0.32,0.5],['tambor2',0.24,0.5],['galaoVerde'],['caixaMadeira2'],['caixaMadeira'],['sacosAdubo'],
  ['tocoCorte'],['tocoCorte2'],['escadaMadeira',0.25,1],['caixaPlastico'],['botijao',0.17,0.5]];
function clTralha(info,R,x,z,fixo){if(!prpOk()||!clLivre(x,z,0.45)||clNaEstrada(x,z,0.4))return false;
  const e=fixo?CL_TRALHA.find(q=>q[0]===fixo):CL_TRALHA[Math.floor(R()*CL_TRALHA.length)];if(!e||!prpTem(e[0]))return false;
  const tomba=e[1]!==undefined&&R()<e[2];
  prpReg(PRP.mundo,e[0],x,ground(x,z)+(tomba?e[1]:0),z,R()*6.283,[1,1,1],tomba?Math.PI/2:0,0,0.6,70);info.tralha++;return true;}
/* ---------- sítios ---------- */
function clSitio(info,R,pl){const p=RURAIS.find(q=>q.local===pl.id&&q.casa);if(!p)return;const W=p.W,D=p.D,at=(u,v)=>pw(p,u,v),vr=p.varanda||0;
  // moitas encostadas na casa: nos lados e no fundo; na frente, só nos cantos da varanda
  {const k=5+Math.floor(R()*3);let n=0;for(let i=0;i<40&&n<k;i++){const lado=Math.floor(R()*4),a=R();let u,v;
      if(lado===0){u=a<0.5?-0.8-R()*0.6:W+0.8+R()*0.6;v=-vr-0.2+R()*1.2;}else if(lado===1){u=a*W;v=D+0.75;}else{u=lado===2?-0.75:W+0.75;v=a*D;}
      const w=at(u,v);if(clMoita(info,R,w[0],w[1]))n++;}}
  // capim alto ao longo da cerca (por dentro e por fora; a porteira fica limpa)
  const u0=-10,u1=W+13,v0=D/2-0.5-15,v1=D+(pl.id==='sitio4'?7:10),gate=at(W/2,v0),cerca=[at(u0,v0),at(u1,v0),at(u1,v1),at(u0,v1),at(u0,v0)];
  for(let s=0;s<4;s++){const a=cerca[s],b=cerca[s+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
    for(let t=0.5;t<L;t+=0.55+R()*1.1){const o=(R()<0.5?-1:1)*(0.4+R()*0.7),x=a[0]+(b[0]-a[0])*t/L+nx*o,z=a[1]+(b[1]-a[1])*t/L+nz*o;
      if(Math.hypot(x-gate[0],z-gate[1])<3.4||clNaEstrada(x,z,0.3))continue;clCapim(info,R,x,z,0,true,true);}}
  // capim alto nos cantos do quintal
  for(let i=0;i<34;i++){const u=u0+1+R()*(u1-u0-2),v=v0+1+R()*(v1-v0-2),w=at(u,v);if(ruralCasaEm(w[0],w[1],1.2)||clNaEstrada(w[0],w[1],0.4))continue;clCapim(info,R,w[0],w[1],0,true,true);}
  // tralha largada no terreiro: perto do galpão, no fundo da casa e junto da cerca
  const zonas=[()=>[W+2+R()*9,-2.5-R()*2.5],()=>[W+2+R()*9,6.5+R()*2.5],()=>[-1.5+R()*(W+3),D+1.6+R()*2.2],()=>[u0+0.9+R()*1.2,v0+3+R()*(v1-v0-6)],()=>[u1-0.9-R()*1.2,v0+3+R()*(v1-v0-6)],()=>[-6+R()*4,-6+R()*4]];
  {const k=6+Math.floor(R()*3);let n=0;for(let i=0;i<60&&n<k;i++){const q=zonas[i%zonas.length](),w=at(q[0],q[1]);if(clTralha(info,R,w[0],w[1]))n++;}}}
/* ---------- fazenda ---------- */
function clFazenda(info,R){const f=placeById('fazenda');if(!f)return;const cx=f.x,cz=f.z;
  // as duas construções (10_world: farm): casa e celeiro, com a frente (porta) no +z de cada uma
  const casa={x:cx+7,z:cz-6,yaw:Math.PI*0.85,w:9,d:7},cel={x:cx-11,z:cz+5,yaw:0.15,w:12,d:9};
  const loc=(b,lx,lz)=>{const c=Math.cos(b.yaw),s=Math.sin(b.yaw);return[b.x+lx*c+lz*s,b.z-lx*s+lz*c];};
  const dentro=(b,x,z,m)=>{const dx=x-b.x,dz=z-b.z,c=Math.cos(b.yaw),s=Math.sin(b.yaw),lx=dx*c-dz*s,lz=dx*s+dz*c;return Math.abs(lx)<b.w/2+m&&Math.abs(lz)<b.d/2+m;};
  const plant=(x,z,m)=>x>cx+10-m&&x<cx+28+m&&z>cz+6-m&&z<cz+20+m,terreiro=(x,z)=>Math.hypot(x-(cx-11),z-(cz+10))<6.5;
  // moitas nas paredes (lados e fundo; na frente só nos cantos: a porta da casa e o portão do celeiro ficam livres)
  for(const b of[casa,cel]){const k=6+Math.floor(R()*3);let n=0;for(let i=0;i<40&&n<k;i++){const lado=Math.floor(R()*4),a=R()-0.5;let lx,lz;
      if(lado===0){lx=(a<0?-1:1)*(b.w/2-0.3-R()*0.7);lz=b.d/2+0.85;}else if(lado===1){lx=a*b.w;lz=-b.d/2-0.85;}else{lx=(lado===2?-1:1)*(b.w/2+0.85);lz=a*b.d;}
      const w=loc(b,lx,lz);if(clMoita(info,R,w[0],w[1]))n++;}}
  // capim alto em volta da cerca da plantação (por fora) e pelo terreiro afora
  {const x0=cx+10,z0=cz+6,w=18,dd=14,gx0=x0+w*3/7,gx1=x0+w*4/7;
    for(let x=x0-1;x<x0+w+1;x+=0.6+R()*1.0){for(const[zz,s]of[[z0,-1],[z0+dd,1]]){if(s<0&&x>gx0-1.2&&x<gx1+1.2)continue;clCapim(info,R,x,zz+s*(0.45+R()*0.6),0,true,true);}}
    for(let z=z0-1;z<z0+dd+1;z+=0.6+R()*1.0)for(const[xx,s]of[[x0,-1],[x0+w,1]])clCapim(info,R,xx+s*(0.45+R()*0.6),z,0,true,true);}
  for(let i=0;i<200;i++){const a=R()*6.283,r=5+R()*28,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
    if(dentro(casa,x,z,1.3)||dentro(cel,x,z,1.3)||plant(x,z,0.6)||terreiro(x,z)||clNaEstrada(x,z,0.5))continue;clCapim(info,R,x,z,0,true,true);}
  // tralha: no fundo e nos lados do celeiro, no fundo da casa, perto do trator e dos fardos
  const zonas=[()=>loc(cel,(R()-0.5)*10,-cel.d/2-1.3-R()*2.2),()=>loc(cel,-cel.w/2-1.3-R()*2,(R()-0.5)*7),()=>loc(casa,(R()-0.5)*7,-casa.d/2-1.3-R()*1.8),
    ()=>[cx-2+Math.cos(R()*6.283)*(2.8+R()*1.5),cz-4+Math.sin(R()*6.283)*(2.8+R()*1.5)],()=>[cx-4+R()*6,cz+13.6+R()*2.2]];
  {let n=0;for(let i=0;i<80&&n<13;i++){const w=zonas[i%zonas.length]();if(dentro(casa,w[0],w[1],0.6)||dentro(cel,w[0],w[1],0.6)||plant(w[0],w[1],0.8))continue;if(clTralha(info,R,w[0],w[1]))n++;}}
  // carcaça queimada atrás do celeiro (com colisão e o porta-malas para revistar), deitada ao longo da parede do fundo
  if(prpOk()&&prpTem('L:carroDestruido')){const yaw=Math.PI/2+cel.yaw+0.22;
    for(const lx of[-2.2,0.8,-4.6]){const q=loc(cel,lx,-cel.d/2-3.3),dx=Math.sin(yaw),dz=Math.cos(yaw);
      if(!clLivre(q[0],q[1],1.3)||!clLivre(q[0]+dx*1.6,q[1]+dz*1.6,0.9)||!clLivre(q[0]-dx*1.6,q[1]-dz*1.6,0.9)||clNaEstrada(q[0],q[1],2))continue;
      prpReg(PRP.mundo,'L:carroDestruido',q[0],ground(q[0],q[1]),q[1],yaw+Math.PI/2,[1,1,1],0,0,1,150);colBox(q[0],q[1],0.95,2.15,yaw,{solid:true,y0:-0.2,y1:1.5,carro2:true});
      const t=fwd(yaw,-2.7);interAdd({id:'faz-carcaca',kind:'bau',x:q[0]+t[0],z:q[1]+t[1],label:'Revistar o porta-malas',tabela:'carro',respawn:4});info.carcacas++;break;}}}
/* ---------- estradas de terra: capim no meio e nas beiras ---------- */
const clEstradaVelha=r=>r.cor==='terra'&&!r.vila;
function clEstradas(info,R){for(const r of ROADS){if(!clEstradaVelha(r))continue;
  for(let s=0;s<r.pts.length-1;s++){const a=r.pts[s],b=r.pts[s+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.5)continue;const nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
    for(let t=0.4;t<L;t+=0.7+R()*1.2){const meio=R()<0.42,o=meio?(R()-0.5)*0.4:(R()<0.5?-1:1)*(r.w/2-0.1+R()*0.65),x=a[0]+(b[0]-a[0])*t/L+nx*o,z=a[1]+(b[1]-a[1])*t/L+nz*o;
      if(typeof aguaPerto==='function'&&aguaPerto(x,z,0.6))continue;if(r.cor==='terra'&&dentroCidade(x,z,2))continue;
      clCapim(info,R,x,z,meio?0.32+R()*0.3:0.5+R()*0.45,false);}}}}
/* o capim do meio também no chão: uma faixa de grama no meio da terra (as duas trilhas de pneu ficam de terra) */
{const _sd=splatData;splatData=function(){const D=_sd.apply(this,arguments),S=SPLAT_S,H=SPLAT_H,ts=2*H/S;
  for(const r of ROADS){if(!clEstradaVelha(r))continue;
    for(let s=0;s<r.pts.length-1;s++){const a=r.pts[s],b=r.pts[s+1],m=1.0,
        i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-m+H)/ts)),i1=Math.min(S-1,Math.ceil((Math.max(a[0],b[0])+m+H)/ts)),
        j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-m+H)/ts)),j1=Math.min(S-1,Math.ceil((Math.max(a[1],b[1])+m+H)/ts));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=-H+(i+0.5)*ts,z=-H+(j+0.5)*ts,d=segDist(x,z,a[0],a[1],b[0],b[1]),hw=0.22+vnoise(x*0.8+3,z*0.8-5)*0.3;if(d>hw+0.3)continue;
        const k=smooth(hw+0.3,hw-0.08,d)*(0.5+0.45*vnoise(x*0.33-11,z*0.33+4)),o=(j*S+i)*4+1;D[o]=Math.round(D[o]*(1-k));}}}
  return D;};}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);
  try{const R=rng(70707),info={moitas:0,capim:0,tralha:0,carcacas:0};for(const pl of PLACES)if(pl.sitio)clSitio(info,R,pl);clFazenda(info,R);clEstradas(info,R);CAMPO_LARG.info=info;}
  catch(e){console.error('campo largado',e);}return r;};}
