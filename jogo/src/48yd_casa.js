/* ================= casa de dois andares, bancada construível, fabricação na mão só do básico e cantil =================
   Fabricação: longe de uma bancada, a aba Fabricar mostra só o básico de sobrevivência feito na mão (machado, faca e picareta
   de pedra, lança, flechas, corda, linha, bandagem, tala e sutura). O resto pede bancada: a da clareira ou uma construída
   (B → Bancada de trabalho: 6 madeira, 4 pedras e 2 cordas, tudo do começo do jogo). As receitas das estações aparecem perto delas.
   Casa: pilar de madeira (segura a plataforma a 2,6 m do chão), escada de madeira (anda-se por ela, do chão até a beirada da
   plataforma), porta de madeira (E abre e fecha; fechada, zumbi arromba), janela no chão e no alto (dá para olhar e atirar,
   não para passar). Paredes, portas e janelas encaixam numa grade de 3 m: entre pilares ou na ponta de outra parede.
   Cantil: 5 goles. Enche no barril e no poço (limpa), com o filtro na chuva (limpa) ou no rio e no lago (suja: ferva na fogueira
   ou use uma pastilha de cloro). Sai em casas, carros e caixas de suprimento, ou na bancada com sucata e couro. */
iconesNovos({
  'i-bancada':'<path d="M3 9h18v3H3z"/><path d="M5 12v8M19 12v8M5 16.5h14"/><path d="M13.5 9V6.6l3.4-1.6 1.1 1.8-2.6 1.3V9"/>',
  'i-pilar':'<path d="M9.5 4h5v15h-5z"/><path d="M6.5 20.5h11M7.5 3.5h9"/><path d="M11.5 7.5v3M12.8 13v3"/>',
  'i-escada-mad':'<path d="M4 20.5 17 4.5M8.5 21 21 6"/><path d="m7.6 16.6 3.6 3M10.3 13.2l3.6 3M13 9.9l3.6 3M15.7 6.6l3.6 3"/>',
  'i-porta':'<path d="M6.5 21V4.6A1.6 1.6 0 0 1 8.1 3h7.8a1.6 1.6 0 0 1 1.6 1.6V21"/><path d="M4 21h16"/><path d="M14.6 12.4h.01" stroke-width="2.6"/>',
  'i-janela':'<rect x="4" y="4" width="16" height="16" rx="1.2"/><path d="M12 4v16M4 11.5h16"/>',
  'i-cantil':'<path d="M10.5 2.8h3v2.6h-3z"/><path d="M12 5.4c3.6 0 6.3 2.9 6.3 6.6 0 4.6-2.8 8.8-6.3 8.8S5.7 16.6 5.7 12c0-3.7 2.7-6.6 6.3-6.6z"/><path d="M6.3 9.8c3.7 1.8 7.7 1.8 11.4 0"/>'});

/* ---------- fabricação: o que dá para fazer na mão ---------- */
const RECEITAS_MAO=new Set(['machadoPedra','facaPedra','picareta','lanca','flecha','corda','linha','bandagem','tala','sutura']);
for(const r of RECIPES)if(!r.est&&!RECEITAS_MAO.has(r.faz))r.est=1;
/* a receita aparece na lista? na mão sempre; as da bancada perto de uma bancada; as das estações perto da estação */
function receitaVisivel(r){if(!r.est)return true;if(typeof r.est==='string')return pertoEstacao(r.est);return pertoBancada();}
/* nome da aba Fabricar conforme o lugar */
function fabAbaNome(){if(pertoBancada())return G.fab.nv>=2?'Oficina':'Bancada';
  for(const t of['couro','forja','armas','conserva'])if(pertoEstacao(t))return ESTACOES[t].chip;return'Na mão';}

/* ---------- bancada de trabalho construída ---------- */
function bancadaPerto(){let best=null,bd=3.0*3.0;for(const o of OB){if(o.tipo!=='bancadaTrab')continue;const d=d2(o.x,o.z,P.x,P.z);if(d<bd&&Math.abs(o.y-P.y)<1.6){bd=d;best=o;}}return best;}

/* ---------- peças novas ---------- */
const PILAR_H=2.6,CANTIL_GOLES=5;
Object.assign(OBRAS,{
  bancadaTrab:{nome:'Bancada de trabalho',icon:'i-bancada',custo:{madeira:6,pedra:4,corda:2},hp:200,hw:0.95,hd:0.42,solid:true,peq:true,etapa:1},
  pilar:{nome:'Pilar de madeira',icon:'i-pilar',custo:{madeira:4,corda:1},hp:420,hw:0.13,hd:0.13,solid:true,etapa:1,montar:pilarMontar,alvo:alvoPilar},
  escadaMadeira:{nome:'Escada de madeira',icon:'i-escada-mad',custo:{tabuas:6,pregos:4},hp:200,hw:0.6,hd:1.6,solid:true,alto:'escadaM',etapa:2},
  paredeCasa:{nome:'Parede de tábuas',icon:'i-parede',custo:{tabuas:5,pregos:2},hp:260,hw:1.5,hd:0.14,solid:true,etapa:2,alvo:alvoParede},
  portaMadeira:{nome:'Porta de madeira',icon:'i-porta',custo:{tabuas:6,pregos:4},hp:280,hw:1.5,hd:0.14,solid:true,etapa:2,montar:portaMontar,alvo:alvoParede},
  janela:{nome:'Janela',icon:'i-janela',custo:{tabuas:5,pregos:3},hp:240,hw:1.5,hd:0.14,solid:true,etapa:2,montar:janelaMontar,alvo:alvoParede},
  janelaAlta:{nome:'Janela',icon:'i-janela',custo:{tabuas:5,pregos:3},hp:200,hw:1.5,hd:0.08,solid:true,alto:'borda',etapa:2}});
/* paredes de 3 m que encaixam umas nas outras e entre pilares */
const PAREDES=new Set(['muro','muroPedra','portao','muroFerro','portaoFerro','paredeCasa','portaMadeira','janela']);
for(const k of PAREDES)if(OBRAS[k]&&!OBRAS[k].alvo)OBRAS[k].alvo=alvoParede;
/* altura do colisor das peças do chão (as outras usam 2,45 m): o que fica embaixo de uma plataforma não bloqueia quem anda em cima */
Object.assign(OBRAS.antenaBase||{},{hCol:6});Object.assign(OBRAS.poste||{},{hCol:3.4});Object.assign(OBRAS.estufa||{},{hCol:2.9});
OBRA_ORDEM.push('bancadaTrab','pilar','escadaMadeira','paredeCasa','portaMadeira','janela','janelaAlta');
{const ins=(L,depois,...ks)=>{const i=L.indexOf(depois);L.splice(i>=0?i+1:L.length,0,...ks.filter(k=>!L.includes(k)));};
  ins(OBRAS_CHAO,'muro','paredeCasa','portaMadeira','janela');ins(OBRAS_CHAO,'fogueira','bancadaTrab');ins(OBRAS_CHAO,'plataforma','pilar','escadaMadeira');
  ins(OBRAS_ALTO,'paredeAlta','janelaAlta');ins(OBRAS_ALTO,'escadaCorda','escadaMadeira');ins(OBRAS_ALTO,'bau','bancadaTrab');
  ins(OBRAS_PREDIO,'bau','bancadaTrab');ins(OBRAS_TELHADO,'bau','bancadaTrab');}
Object.assign(BASE_DICAS,{
  bancadaTrab:'Bancada pronta. Perto dela a aba Fabricar mostra todas as receitas: tábuas, munição, armas e o resto. Aperte E nela para abrir.',
  pilar:'Pilar de pé. Ponha outros a 4 m (eles encaixam na grade) e depois a plataforma: mire perto dos pilares e ela fica em cima deles, a 3 m do chão. Paredes, porta e janela encaixam entre os pilares.',
  escadaMadeira:'Escada de madeira pronta: é só subir andando. Ela ocupa essa beirada da plataforma.',
  paredeCasa:'Parede pronta. Paredes, porta e janela encaixam na ponta umas das outras e entre os pilares (grade de 4 m).',
  portaMadeira:'Porta pronta. Aperte E para abrir e fechar. Fechada, zumbi só passa arrombando.',
  janela:'Janela pronta. Dá para olhar e atirar por ela, mas não dá para passar.',
  janelaAlta:'Janela pronta. Dá para olhar e atirar por ela, mas não dá para passar.'});

/* peça do chão embaixo de uma plataforma: o colisor dela não passa do piso (no chão torto, a parede podia furar o piso de cima
   e virar um degrau invisível para quem anda no andar de cima). Vale ao criar a peça e ao criar a plataforma em cima dela. */
function tetoSobPlat(o){const D=OBRAS[o.tipo];if(!D||D.alto||o.tipo==='escadaInterna')return;const cs=[o.col,...(o.cols||[])].filter(c=>c&&c.y1!==undefined);if(!cs.length)return;
  for(const p of OB){if(p.tipo!=='plataforma'||p.y-o.y<1.2||p.y-o.y>4.5)continue;
    for(const c of cs)if(c.y1>p.y-0.26&&noRet(c.x,c.z,p.x,p.z,p.yaw,1.5*modK(p),1.5*modK(p),0.35))c.y1=Math.min(c.y1,Math.max(c.y0+0.05,p.y-0.26));}}
function casaAjusteTeto(o){if(o.tipo==='escadaInterna'){const p=platDaEscada(o);if(p)remontarPlat(p);return;}   // abre o piso de cima
  if(o.tipo==='plataforma'){for(const q of OB)if(q!==o&&Math.abs(q.x-o.x)<3.5*modK(o)&&Math.abs(q.z-o.z)<3.5*modK(o))tetoSobPlat(q);}else tetoSobPlat(o);}
/* colisor bloqueando a peça no chão (altura y): ignora o que está bem acima (plataforma no alto) ou abaixo; ign descarta colisores */
function bloqueadoChao(x,z,r,y,ign){for(const c of colQuery(x,z,r+1)){if(!c.solid||c.sub)continue;if(c.y1!==undefined&&(c.y0>=y+2.0||c.y1<=y+0.05))continue;if(ign&&ign(c))continue;
  if(c.t===0){if(Math.hypot(x-c.x,z-c.z)<r+c.r)return c;}else{const dx=x-c.x,dz=z-c.z,lx=dx*c.c-dz*c.s,lz=dx*c.s+dz*c.c,cx=clamp(lx,-c.hw,c.hw),cz=clamp(lz,-c.hd,c.hd);if(Math.hypot(lx-cx,lz-cz)<r)return c;}}return null;}
/* mesma ideia do pointBlocked, mas o colisor com faixa de altura só bloqueia dentro dela (tiro passando pela janela ou por cima da plataforma) */
function bloqueiaTiro(x,y,z){for(const c of colQuery(x,z,1.02)){if(!c.solid||c.sub)continue;
  if(c.y1!==undefined){if(!(y<c.y1&&y>c.y0-0.05))continue;}else if(!(y<(c.tree?6:3.6)))continue;
  if(c.t===0){if(Math.hypot(x-c.x,z-c.z)<0.02+c.r)return c;}else{const dx=x-c.x,dz=z-c.z,lx=dx*c.c-dz*c.s,lz=dx*c.s+dz*c.c,cx=clamp(lx,-c.hw,c.hw),cz=clamp(lz,-c.hd,c.hd);if(Math.hypot(lx-cx,lz-cz)<0.02)return c;}}
  return null;}
const localW=(o,lx,lz)=>{const c=Math.cos(o.yaw),s=Math.sin(o.yaw);return[o.x+lx*c+lz*s,o.z-lx*s+lz*c];};

/* ---------- pilar: segura a plataforma; encaixa numa grade de 3 m com os outros pilares e nos cantos de plataformas baixas ---------- */
function alvoPilar(x,z,yaw){const L=ALTO_CFG.lado;let best=null,bd=1.8*1.8;
  const cand=(cx,cz,cyaw,top,k)=>{const d=d2(cx,cz,x,z);if(d>=bd)return;if(OB.some(o=>o.tipo==='pilar'&&d2(o.x,o.z,cx,cz)<0.09))return;bd=d;best={x:cx,z:cz,yaw:cyaw,top,k};};
  for(const o of OB){if(d2(o.x,o.z,x,z)>81)continue;
    if(o.tipo==='pilar'){const ko=modK(o);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){if(!i&&!j)continue;const w=localW(o,i*L*ko,j*L*ko);cand(w[0],w[1],o.yaw,o.ext.top,ko);}}
    else if(o.tipo==='plataforma'){const hg=o.y-ground(o.x,o.z),ko=modK(o);if(hg<1.4||hg>3.6*modKH(o))continue;for(const p of cantos(o.x,o.z,o.yaw,1.5*ko,1.5*ko))cand(p[0],p[1],o.yaw,o.y,ko);}}
  let r;
  if(best){const g=ground(best.x,best.z),h=best.top-g;r={x:best.x,z:best.z,y:g,yaw:best.yaw,ext:modExt(best.k||1,{top:+best.top.toFixed(2)})};
    if(h<1.4)return Object.assign(r,{ok:false,motivo:'O chão aqui é alto demais: o pilar não cabe embaixo'});if(h>((best.k||1)>1?4.2:3.6))return Object.assign(r,{ok:false,motivo:'Fundo demais: o pilar não alcança'});}
  else{const g=ground(x,z),l3=TESTE&&window.__casa3;r={x,z,y:g,yaw,ext:l3?{top:+(g+PILAR_H).toFixed(2)}:{top:+(g+PILAR_H*CASA_KH).toFixed(2),m:CASA_M}};}   // pilar sozinho: começa uma casa nova (4 m; os testes antigos pedem a de 3 m)
  if(bloqueadoChao(r.x,r.z,0.16,r.y))return Object.assign(r,{ok:false,motivo:'Tem coisa no caminho'});
  if(Math.hypot(P.x-r.x,P.z-r.z)<0.6)return Object.assign(r,{ok:false,motivo:'Perto demais de você'});
  if(!dentroMapa(r.x,r.z,3))return Object.assign(r,{ok:false,motivo:'Longe demais'});
  r.ok=true;return r;}
function pilarMontar(o){const top=typeof o.ext.top==='number'?o.ext.top:o.y+PILAR_H;o.ext.top=+top.toFixed(2);const h=Math.max(0.6,top-o.y);
  o.cols=[colBox(o.x,o.z,0.13*modK(o),0.13*modK(o),o.yaw,{solid:true,obra:o,y0:o.y-0.3,y1:top-0.28})];o.mesh=litMesh(geoPilar(h));}
/* plataforma em cima de pilar: a casa da grade mais perto da mira que tem um pilar num canto */
function alvoCelulaPilar(rx,rz){const H=ALTO_CFG.lado/2;let best=null,bd=2.8*2.8;
  for(const o of OB){if(o.tipo!=='pilar'||d2(o.x,o.z,rx,rz)>64)continue;const ko=modK(o);
    for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]]){const w=localW(o,sx*H*ko,sz*H*ko),d=d2(w[0],w[1],rx,rz);if(d>=bd)continue;
      if(OB.some(p=>p.tipo==='plataforma'&&d2(p.x,p.z,w[0],w[1])<1&&Math.abs(p.y-o.ext.top)<0.5))continue;bd=d;best={x:w[0],z:w[1],y:o.ext.top,yaw:o.yaw,k:ko};}}
  return best;}
/* tem pilar segurando uma plataforma nesse lugar e altura? */
function pilarSob(x,z,yaw,y,k){k=k||1;for(const o of OB)if(o.tipo==='pilar'&&Math.abs(o.ext.top-y)<0.3&&noRet(o.x,o.z,x,z,yaw,1.5*k,1.5*k,0.2))return o;return null;}

/* ---------- paredes, porta e janela: encaixe na grade (entre pilares ou na ponta de outra parede) ---------- */
function alvoParede(x,z,yaw){const L=ALTO_CFG.lado,H=L/2;let best=null,bd=1.7*1.7;const g0=ground(x,z);
  const ocupada=(cx,cz,cy)=>OB.some(o=>PAREDES.has(o.tipo)&&d2(o.x,o.z,cx,cz)<0.2&&Math.abs(o.y-cy)<1.2);
  const cand=(cx,cz,cyaw,k)=>{const d=d2(cx,cz,x,z);if(d>=bd)return;if(ocupada(cx,cz,ground(cx,cz)))return;bd=d;best={x:cx,z:cz,yaw:cyaw,k};};
  for(const o of OB){if(d2(o.x,o.z,x,z)>100)continue;const ko=modK(o);
    if(o.tipo==='pilar'){for(const[lx,lz,dy]of[[H,0,0],[-H,0,0],[0,H,Math.PI/2],[0,-H,Math.PI/2]]){const w=localW(o,lx*ko,lz*ko);cand(w[0],w[1],o.yaw+dy,ko);}}
    else if(PAREDES.has(o.tipo)&&Math.abs(o.y-g0)<1.5){for(const sx of[-1,1]){const w=localW(o,sx*L*ko,0);cand(w[0],w[1],o.yaw,ko);for(const sz of[-1,1]){const q=localW(o,sx*H*ko,sz*H*ko);cand(q[0],q[1],o.yaw+Math.PI/2,ko);}}}}
  if(!best)return null;
  if(Math.cos(yaw-best.yaw)<0)best.yaw+=Math.PI;   // o giro (R) escolhe o lado de fora
  const kk=CASA_ESCALA.has(OBRA.tipo)?(best.k||1):1,r={x:best.x,z:best.z,y:ground(best.x,best.z),yaw:best.yaw,ext:modExt(kk,undefined)},o={x:r.x,z:r.z,yaw:r.yaw};
  for(const lx of[-0.9,-0.45,0,0.45,0.9])for(const lz of[-0.07,0.07]){const w=localW(o,lx*kk,lz);if(bloqueadoChao(w[0],w[1],0.08,r.y,c=>c.obra&&c.obra.tipo==='pilar'))return Object.assign(r,{ok:false,motivo:'Tem coisa no caminho'});}
  {const c=Math.cos(r.yaw),s=Math.sin(r.yaw),dx=P.x-r.x,dz=P.z-r.z,lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)<1.75*kk&&Math.abs(lz)<0.5)return Object.assign(r,{ok:false,motivo:'Perto demais de você'});}
  if(!dentroMapa(r.x,r.z,3))return Object.assign(r,{ok:false,motivo:'Longe demais'});
  r.ok=true;return r;}
/* porta: paredes dos lados, batente e a folha (colisor que some quando abre) */
function portaMontar(o){const y=o.y,k=modK(o),kh=modKH(o),A=(lx,hw,y0,y1,folha)=>{const w=localW(o,lx*k,0);return colBox(w[0],w[1],hw*k,(folha?0.08:0.13)*k,o.yaw,{solid:true,obra:o,y0:y+y0*kh,y1:y+y1*kh});};
  o.cols=[A(-1.04,0.46,-0.3,2.45),A(1.04,0.46,-0.3,2.45),A(0,0.58,-0.3,2.25,true),A(0,0.58,2.1,2.45)];o.folha=o.cols[2];
  o.folha.solid=!o.ext.aberta;o.abre=o.ext.aberta?1:0;}
/* janela: paredes dos lados, peitoril embaixo e verga em cima; o vão fica livre para o tiro e a vista */
function janelaMontar(o){const y=o.y,k=modK(o),kh=modKH(o),A=(lx,hw,y0,y1)=>{const w=localW(o,lx*k,0);return colBox(w[0],w[1],hw*k,0.13*k,o.yaw,{solid:true,obra:o,y0:y+y0*kh,y1:y+y1*kh});};
  o.cols=[A(-1.04,0.46,-0.3,2.45),A(1.04,0.46,-0.3,2.45),A(0,0.6,-0.3,0.95),A(0,0.6,1.95,2.45)];}
function janelaAltaMontar(o){const y=o.y,k=modK(o),kh=modKH(o),A=(lx,hw,y0,y1)=>{const w=localW(o,lx*k,0);return colBox(w[0],w[1],hw*k,0.1,o.yaw,{solid:true,obra:o,y0:y+y0*kh,y1:y+y1*kh});};
  o.cols=[A(-1.04,0.46,0,2.5),A(1.04,0.46,0,2.5),A(0,0.6,0,0.95),A(0,0.6,1.95,2.5)];}
function portaAlternar(o){const ab=!o.ext.aberta;o.ext.aberta=ab;if(o.folha)o.folha.solid=!ab;sfx('portaMad',o.x,o.z,0.8);barulho(o.x,o.z,4,true,o.y);feed(ab?'Porta aberta':'Porta fechada');}
function obraConsertar(o){if(invCount('tabuas')<2){feed('Precisa de 2 tábuas',true);return;}invRemove('tabuas',2);o.hp=Math.min(o.hpMax,o.hp+o.hpMax*0.5);sfx('construir');feed(OBRAS[o.tipo].nome+' consertada');hudBarra();}

/* ---------- escada de madeira: da beirada de uma plataforma até o chão, rampa andável com corrimão ----------
   Começa com um patamar plano (ESC_PAT) na altura do piso: chegando por ele a cabeça já passa da beirada da plataforma. */
const ESC_PAT=0.45;
function escadaMedidas(ex,ez,a,y){let L=3.9,fg=0;for(let k=0;k<3;k++){fg=ground(ex+Math.sin(a)*L,ez+Math.cos(a)*L);L=clamp((y-fg)*1.35+ESC_PAT,2.0,5.4);}return{L,fg,h:y-fg};}
/* altura da escada a uma distância d da beirada (patamar e depois a rampa) */
const escadaAltura=(y,h,L,d)=>d<=ESC_PAT?y:y-h*Math.min(1,(d-ESC_PAT)/Math.max(0.1,L-ESC_PAT));
function alvoEscadaMadeira(f){const ax=P.x+f[0]*2.5,az=P.z+f[2]*2.5;let best=null,bd=2.8*2.8;
  for(const o of OB){if(o.tipo!=='plataforma'||d2(o.x,o.z,P.x,P.z)>81||Math.abs(o.y-P.y)>4.2)continue;
    for(let k=0;k<4;k++){const ko=modK(o),a=o.yaw+k*Math.PI/2,ex=o.x+Math.sin(a)*1.5*ko,ez=o.z+Math.cos(a)*1.5*ko,nx=o.x+Math.sin(a)*3*ko,nz=o.z+Math.cos(a)*3*ko;
      if(OB.some(p=>p!==o&&p.tipo==='plataforma'&&d2(p.x,p.z,nx,nz)<0.5&&Math.abs(p.y-o.y)<0.3))continue;   // beirada interna
      const m=escadaMedidas(ex,ez,a,o.y),fx=ex+Math.sin(a)*m.L,fz=ez+Math.cos(a)*m.L,d=segDist(ax,az,ex,ez,fx,fz)**2;if(d<bd){bd=d;best={x:ex,z:ez,y:o.y,yaw:a,m};}}}
  if(!best){const x=P.x+f[0]*2,z=P.z+f[2]*2;return{x,z,y:ground(x,z)+2.6,yaw:P.yaw,ok:false,motivo:'Mire a beirada de uma plataforma: a escada desce dela até o chão'};}
  const m=best.m,r={x:best.x,z:best.z,y:best.y,yaw:best.yaw,ext:{h:+m.h.toFixed(2),L:+m.L.toFixed(2),fg:+m.fg.toFixed(2)}};
  if(OB.some(p=>(OBRAS[p.tipo].alto==='borda'||p.tipo==='escadaMadeira')&&d2(p.x,p.z,r.x,r.z)<0.5&&Math.abs(p.y-r.y)<0.5))return Object.assign(r,{ok:false,motivo:'Essa beirada já está ocupada'});
  if(m.h<1.0)return Object.assign(r,{ok:false,motivo:'Baixo demais para escada'});if(m.h>4.2)return Object.assign(r,{ok:false,motivo:'Alto demais: a escada de madeira vai até 4,2 m (use a de corda)'});
  for(let i=1;i<=8;i++){const t=i/8,yr=escadaAltura(r.y,m.h,m.L,m.L*t);for(const lx of[-0.45,0,0.45]){const w=localW(r,lx,0),px=w[0]+Math.sin(r.yaw)*m.L*t,pz=w[1]+Math.cos(r.yaw)*m.L*t;
      if(ground(px,pz)>yr+0.12)return Object.assign(r,{ok:false,motivo:'O chão sobe no caminho da escada'});
      if(bloqueadoAlto(px,pz,0.1,Math.max(yr-0.1,ground(px,pz)+0.05)))return Object.assign(r,{ok:false,motivo:'Tem coisa no caminho da escada'});}}
  if(OB.some(p=>p.tipo==='escadaMadeira'&&d2(p.x+Math.sin(p.yaw)*p.ext.L/2,p.z+Math.cos(p.yaw)*p.ext.L/2,r.x+Math.sin(r.yaw)*m.L/2,r.z+Math.cos(r.yaw)*m.L/2)<1.5*1.5))return Object.assign(r,{ok:false,motivo:'Encavala em outra escada'});
  {const fx=r.x+Math.sin(r.yaw)*m.L,fz=r.z+Math.cos(r.yaw)*m.L;if(!dentroMapa(fx,fz,3))return Object.assign(r,{ok:false,motivo:'Longe demais'});if(RIO.ok&&aguaProf(fx,fz)>0.3)return Object.assign(r,{ok:false,motivo:'O pé da escada cai na água'});}
  r.ok=true;return r;}
function escadaMadMontar(o,e){const L=e.L||3.9,fg=typeof e.fg==='number'?e.fg:o.y-2.6,sa=Math.sin(o.yaw),ca=Math.cos(o.yaw),c=localW(o,0,0),Lr=L-ESC_PAT;
  o.sups=[supAdd({t:'ret',x:c[0]+sa*(ESC_PAT/2-0.05),z:c[1]+ca*(ESC_PAT/2-0.05),hw:0.56,hd:ESC_PAT/2+0.05,yaw:o.yaw,y:o.y,dono:o}),
    supAdd({t:'ram',x:c[0]+sa*(ESC_PAT+Lr/2),z:c[1]+ca*(ESC_PAT+Lr/2),hw:0.56,hd:Lr/2,yaw:o.yaw,ya:o.y,yb:fg,dono:o})];
  o.cols=[];for(const lx of[-0.62,0.62]){const w=localW(o,lx,0);o.cols.push(colBox(w[0]+sa*L/2,w[1]+ca*L/2,0.05,L/2,o.yaw,{solid:true,obra:o,y0:fg-0.3,y1:o.y-0.05}));}
  o.mesh=litMesh(geoEscadaMad(o.y-fg,L));}

/* ---------- geometria ---------- */
const COR_CASA={mad:0x6e5235,mad2:0x7d6142,esc:0x4a3424,esc2:0x5a412a,pedra:0x6d6a64,corda:0x8a7650,aco:0x55595c};
function geoPilar(h){const g=new GB(1024,8),R=rng(Math.round(h*137)),C=k=>lin(COR_CASA[k]);
  add(g,boxTris(0.44,0.14,0.44),mat(0,0.02,0),C('pedra'),{j:0.12,rnd:R});
  add(g,boxTris(0.24,h,0.24),mat(0,h/2,0),mixc(C('esc'),C('mad'),0.35),{j:0.06,rnd:R});
  for(const y of[0.5,h*0.55])add(g,boxTris(0.25,0.03,0.25),mat(0,y,0),C('esc'));
  for(const y of[h-0.32,h-0.44])add(g,cylTris(0.15,0.15,0.05,8),mat(0,y,0),C('corda'),{j:0.1,rnd:R});
  add(g,boxTris(0.36,0.07,0.36),mat(0,h-0.26,0),C('esc'));return g.data();}
/* escada em coordenadas locais: topo na origem (beirada da plataforma), descendo para +z até o pé */
function geoEscadaMad(h,L){const g=new GB(4096,8),R=rng(Math.round(h*100+L*10)),C=k=>lin(COR_CASA[k]),P0=ESC_PAT,Lr=Math.max(0.5,L-P0),S=Math.hypot(Lr,h),th=Math.atan2(h,Lr);
  for(let i=0;i<2;i++)add(g,boxTris(1.06,0.055,0.22),mat(0,-0.03,0.115+i*0.225),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});   // patamar
  for(const x of[-0.52,0.52]){add(g,boxTris(0.07,0.22,P0+0.04),mat(x,-0.14,P0/2),C('esc'),{j:0.06,rnd:R});add(g,boxTris(0.07,0.22,S),mat(x,-h/2-0.1,P0+Lr/2,th,0,0),C('esc'),{j:0.06,rnd:R});}
  const n=Math.max(4,Math.round(h/0.21));for(let k=0;k<n;k++){const t=(k+0.5)/n;add(g,boxTris(1.0,0.055,Lr/n*0.92),mat(0,-h*t-0.03,P0+Lr*t),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});}
  for(const x of[-0.55,0.55]){add(g,boxTris(0.06,0.92,0.06),mat(x,0.46,0.06),C('esc2'));for(const t of[0,0.5,0.96])add(g,boxTris(0.06,0.92,0.06),mat(x,-h*t+0.4,P0+Lr*t),C('esc2'));
    add(g,boxTris(0.055,0.055,P0),mat(x,0.88,P0/2+0.03),C('mad'));add(g,boxTris(0.055,0.055,S),mat(x,-h/2+0.86,P0+Lr/2,th,0,0),C('mad'),{j:0.06,rnd:R});}
  add(g,boxTris(1.18,0.12,0.24),mat(0,-h+0.02,L-0.06),C('pedra'),{j:0.1,rnd:R});add(g,boxTris(1.16,0.1,0.14),mat(0,-0.1,0.04),C('esc'));
  return g.data();}
function casaGeometry(){const R=rng(9393),C=k=>lin(COR_CASA[k]),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());};
  const tabua=(g,x,y0,y1,z)=>add(g,bvTris(0.27,y1-y0,0.09),mat(x,(y0+y1)/2,z??0.04),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});
  const lados=(g,H)=>{for(const x of[-1.35,-1.05,-0.75,0.75,1.05,1.35])tabua(g,x,0,H);for(const y of[0.5,1.6])for(const sx of[-1,1])add(g,bvTris(0.95,0.18,0.08),mat(sx*1.05,y,-0.06),C('esc2'));};
  const portaBase=g=>{lados(g,2.35);for(const sx of[-1,1])add(g,bvTris(0.1,2.2,0.15),mat(sx*0.6,1.1,0.01),C('esc'));add(g,bvTris(1.32,0.14,0.15),mat(0,2.17,0.01),C('esc'));
    for(const x of[-0.42,-0.14,0.14,0.42])add(g,bvTris(0.27,0.11,0.09),mat(x,2.295,0.04),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});};
  /* folha com a dobradiça na origem (no fantasma ela vai no lugar, ox=-0,55) */
  const portaFolha=(g,ox=0)=>{for(let k=0;k<4;k++)add(g,bvTris(0.26,2.04,0.06),mat(ox+0.15+k*0.268,1.04,0),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});
    for(const y of[0.42,1.62])add(g,bvTris(1.0,0.12,0.05),mat(ox+0.55,y,-0.055),C('esc2'));add(g,bvTris(0.09,1.42,0.05),mat(ox+0.55,1.02,-0.055,0,0,-0.68),C('esc2'));
    add(g,bvTris(0.05,0.14,0.05),mat(ox+0.96,1.02,0.055),C('aco'));add(g,bvTris(0.12,0.03,0.03),mat(ox+0.93,1.08,0.07),C('aco'));
    for(const y of[0.32,1.75])add(g,bvTris(0.22,0.05,0.07),mat(ox+0.1,y,0.04),C('aco'));};
  MESH.obra.paredeCasa=mk(g=>{lados(g,2.35);for(const x of[-0.45,-0.15,0.15,0.45])tabua(g,x,0,2.35);for(const y of[0.5,1.6])add(g,bvTris(1.2,0.18,0.08),mat(0,y,-0.06),C('esc2'));});
  MESH.obra.portaMadeiraBase=mk(portaBase);MESH.obra.portaMadeiraFolha=mk(g=>portaFolha(g));MESH.obra.portaMadeira=mk(g=>{portaBase(g);portaFolha(g,-0.55);});
  /* janela: vão de 1,1 m entre 1,0 e 1,9 m, com caixilho em cruz e as duas folhas abertas para fora */
  const janela=(g,H,trilhos)=>{for(const x of[-1.35,-1.05,-0.75,0.75,1.05,1.35])tabua(g,x,0,H);
    for(const x of[-0.42,-0.14,0.14,0.42]){tabua(g,x,0,0.92);tabua(g,x,1.98,H);}
    for(const y of trilhos)for(const sx of[-1,1])add(g,bvTris(0.95,0.16,0.08),mat(sx*1.05,y,-0.06),C('esc2'));add(g,bvTris(1.2,0.16,0.08),mat(0,0.5,-0.06),C('esc2'));
    for(const sx of[-1,1])add(g,bvTris(0.1,1.04,0.15),mat(sx*0.6,1.45,0.01),C('esc'));add(g,bvTris(1.36,0.08,0.26),mat(0,0.95,0.04),C('esc'));add(g,bvTris(1.3,0.1,0.15),mat(0,1.94,0.01),C('esc'));
    add(g,bvTris(0.05,0.9,0.05),mat(0,1.45,0),C('esc2'));add(g,bvTris(1.1,0.05,0.05),mat(0,1.45,0),C('esc2'));
    for(const sx of[-1,1]){add(g,bvTris(0.5,0.86,0.04),mat(sx*0.9,1.45,0.12),mixc(C('mad'),C('mad2'),0.6),{j:0.06,rnd:R});add(g,bvTris(0.44,0.05,0.02),mat(sx*0.9,1.2,0.145),C('esc2'));add(g,bvTris(0.44,0.05,0.02),mat(sx*0.9,1.7,0.145),C('esc2'));}};
  MESH.obra.janela=mk(g=>janela(g,2.35,[0.5,1.6]));MESH.obra.janelaAlta=mk(g=>janela(g,2.45,[0.4,1.3,2.2]));
  /* bancada: mesmo tamanho da bancada da clareira (a oficina encaixa em cima dela) */
  MESH.obra.bancadaTrab=mk(g=>{const wood=lin(0x7a5a3a),dark=lin(0x5a412a);add(g,boxTris(1.7,0.08,0.72),mat(0,0.88,0),wood,{j:0.08,rnd:R});
    for(const p of[[0.78,0.3],[-0.78,0.3],[0.78,-0.3],[-0.78,-0.3]])add(g,boxTris(0.08,0.86,0.08),mat(p[0],0.43,p[1]),dark);add(g,boxTris(1.5,0.05,0.6),mat(0,0.3,0),dark);
    add(g,bvTris(0.2,0.12,0.16),mat(0.72,0.98,0.26),lin(0x4a4e52));add(g,cylTris(0.012,0.012,0.22,5),mat(0.72,1.0,0.36,Math.PI/2,0,0),lin(0x2b2b2b));
    add(g,boxTris(0.5,0.012,0.12,{tz:0.5}),mat(0.08,0.93,-0.14,0,0.4,0),lin(0x9aa1a6));add(g,boxTris(0.12,0.05,0.04),mat(-0.15,0.95,-0.05,0,0.4,0),lin(0x6b4e30));
    add(g,cylTris(0.012,0.014,0.3,5),mat(-0.42,0.935,0.12,Math.PI/2,0.9,0),lin(0x6b4e30));add(g,bvTris(0.1,0.04,0.04),mat(-0.53,0.95,0.24,0,0.9,0),lin(0x3b3e42));
    for(let i=0;i<3;i++)add(g,boxTris(0.2,1.3,0.04),mat(1.0,0.62,-0.3+i*0.25,-0.2,0,-0.2-i*0.04),mixc(wood,dark,R()*0.5),{j:0.1,rnd:R});
    for(let i=0;i<3;i++)add(g,cylTris(0.07,0.07,0.9,7),mat(-0.45+i*0.15,0.08+(i===1?0.12:0),0.05,0,0,Math.PI/2),lin(0x5d4129),{j:0.1,rnd:R});});
  MESH.obra.escadaMadeira=litMesh(geoEscadaMad(2.6,2.6*1.35+ESC_PAT));MESH.obra.pilar=litMesh(geoPilar(PILAR_H));}
INIT_MALHAS.push(casaGeometry);
/* a bancada construída também ganha as ferramentas da oficina (nível 2) */
const M_BANC=new Float32Array(16);
DESENHO.opaco.push(function bancadasOficina(Pg){if(!(G.fab&&G.fab.nv>=2)||!MESH.obra||!MESH.obra.oficina)return;for(const o of OB)if(o.tipo==='bancadaTrab'&&d2(o.x,o.z,cam.pos[0],cam.pos[2])<120*120)drawStat(Pg,MESH.obra.oficina,trs(M_BANC,o.x,o.y,o.z,0,o.yaw,0,1,1,1));});
DESENHO.sombra.push(function bancadasOficinaSombra(Pg){if(!(G.fab&&G.fab.nv>=2)||!MESH.obra||!MESH.obra.oficina)return;for(const o of OB)if(o.tipo==='bancadaTrab'&&d2(o.x,o.z,P.x,P.z)<60*60)drawStat(Pg,MESH.obra.oficina,trs(M_BANC,o.x,o.y,o.z,0,o.yaw,0,1,1,1));});
SONS.portaMad=({noise,tone,r})=>{tone(0.32,'sawtooth',150*r(),95,0.035);tone(0.22,'triangle',420*r(),260,0.03,0.05);noise(0.18,'bandpass',1100*r(),600,5,0.18);noise(0.08,'lowpass',500,200,1,0.35,0.3);};

/* ---------- interação: porta e bancada ---------- */
INTERS.push(tryIt=>{for(const o of OB){if(Math.abs(o.x-P.x)>4||Math.abs(o.z-P.z)>4)continue;
  if(o.tipo==='portaMadeira')tryIt({k:'portaMad',o},o.x,o.z,2.2,1.5,-0.75,o.y);
  else if(o.tipo==='bancadaTrab')tryIt({k:'bancadaTrab',o},o.x,o.z,2.4,1.2,-0.5,o.y);}});
INTER_K.portaMad={texto:o=>{const t=o.ext.aberta?'Fechar a porta':'Abrir a porta';return o.hp<o.hpMax*0.7?{t,s:'toque: '+(o.ext.aberta?'fechar':'abrir')+' · segure: consertar (2 tábuas)',alt:true,dur:0.8}:{t,s:'porta de madeira'};},
  usar:(o,seg)=>{if(seg&&o.hp<o.hpMax*0.7){obraConsertar(o);return;}portaAlternar(o);}};
INTER_K.bancadaTrab={texto:o=>o.hp<o.hpMax*0.7?{t:G.fab.nv>=2?'Oficina':'Bancada de trabalho',s:'toque: fabricar · segure: consertar (2 tábuas)',alt:true,dur:0.8}:{t:G.fab.nv>=2?'Oficina':'Bancada de trabalho',s:'fabricar, consertar e melhorar'},
  usar:(o,seg)=>{if(seg&&o.hp<o.hpMax*0.7){obraConsertar(o);return;}abrirMochila('fabricar');}};
/* zumbi quebrando uma construção que está entre ele e você continua quebrando (antes ele largava para correr atrás de você
   assim que te via a menos de 7 m, e nunca derrubava a parede ou a porta com você atrás dela) */
function quebraNoCaminho(z){const o=z.obra;if(!o||o.larg!==undefined||!OBRAS[o.tipo])return false;
  const dx=P.x-z.x,dz=P.z-z.z,d=Math.hypot(dx,dz)||1,ox=o.x-z.x,oz=o.z-z.z,t=(ox*dx+oz*dz)/d;if(t<-0.6||t>d+0.3)return false;
  const D=OBRAS[o.tipo];return Math.abs(ox*dz-oz*dx)/d<Math.max(D.hw,D.hd)+0.5;}
PASSOS.push(function casaPassos(dt){for(const o of OB)if(o.tipo==='portaMadeira'){const a=o.ext.aberta?1:0;if(o.abre!==a)o.abre=approach(o.abre||0,a,dt*2.6);}
  for(const z of Z)if(z.st==='quebra'&&z.obra&&z.obra.tipo==='portaMadeira'&&z.obra.ext&&z.obra.ext.aberta){z.st=z.noturno&&!z.cidade?'marcha':'caca';z.obra=null;}});

/* ---------- cantil ---------- */
ITEMS.cantil={nome:'Cantil',icon:'i-cantil',max:1,tipo:'bebida',sede:30,cantil:CANTIL_GOLES,desc:'Guarda 5 goles. Encha no barril da clareira ou no poço (água limpa), com o filtro na chuva, ou no rio e no lago (água suja: ferva na fogueira ou use uma pastilha). Cada gole tira um pouco da sede.'};
RECIPES.push({faz:'cantil',n:1,custo:{sucata:2,couroPequeno:1},alt:{couroPequeno:['couro',1]},cat:'ferramentas',etapa:2,est:1,desb:{item:'sucata'}});
for(const[t,e]of[['casa',['cantil',1,1,0.05]],['carro',['cantil',1,1,0.05]],['celeiro',['cantil',1,1,0.08]],['suprimentos',['cantil',1,1,0.3]],['militar',['cantil',1,1,0.3]]])if(LOOT[t])LOOT[t].push(e);
for(const[t,e]of[['estoque',['cantil',.08,1,1]],['carro',['cantil',.06,1,1]],['teto',['cantil',.08,1,1]],['deposito',['cantil',.06,1,1]],['metro_vagao',['cantil',.06,1,1]],['conveniencia',['cantil',.06,1,1]]])if(CID_LOOT[t])CID_LOOT[t].push(e);
if(typeof CAIXA_LOOT!=='undefined'&&CAIXA_LOOT.suprimentos)CAIXA_LOOT.suprimentos.push(['cantil',.12,1,1]);
const cantilGoles=s=>Math.max(0,Math.min(CANTIL_GOLES,(s&&s.dur)|0));
function cantilTexto(s){const g=cantilGoles(s);return g?g+' de '+CANTIL_GOLES+' goles · '+(s.mun?'água suja':'água limpa'):'vazio';}
function cantis(){return P.inv.filter(s=>s&&s.id==='cantil');}
/* quantos cantis mudam ao encher: limpa troca tudo (esvazia a suja e enche limpo); suja só completa os que não estão cheios */
function cantisPraEncher(suja){return cantis().filter(s=>suja?cantilGoles(s)<CANTIL_GOLES:(cantilGoles(s)<CANTIL_GOLES||s.mun)).length;}
function cantisEncher(suja){let n=0;for(const s of cantis()){const g=cantilGoles(s);if(suja){if(g>=CANTIL_GOLES)continue;s.dur=CANTIL_GOLES;s.mun=1;n++;}else{if(g>=CANTIL_GOLES&&!s.mun)continue;s.dur=CANTIL_GOLES;s.mun=0;n++;}}
  if(n){hudBarra();invRender();}return n;}
const cantisSujos=()=>cantis().filter(s=>s.mun&&cantilGoles(s)>0);
function cantisFerver(){let n=0;for(const s of cantisSujos()){s.mun=0;n++;}return n;}
function cantilBeber(i){const s=P.inv[i];if(!s)return;const g=cantilGoles(s);
  if(!g){feed('O cantil está vazio. Encha no barril, no poço, no rio ou no lago.',true);sfx('vazio');return;}
  s.dur=g-1;P.sede=clamp(P.sede+ITEMS.cantil.sede,0,100);const suja=!!s.mun;if(!s.dur)s.mun=0;
  if(suja&&Math.random()<(ITEMS.aguaSuja?ITEMS.aguaSuja.suja:0.45)*(cfg.dif==='facil'?0.6:1)){P.intox=Math.max(P.intox||0,200+Math.random()*120);
    setTimeout(()=>toast('corpo','A água suja do cantil te deu dor de barriga: sede e fome caem mais rápido por um tempo. Remédio resolve. Ferva o cantil na fogueira (segure E perto do fogo) ou use uma pastilha.'),600);}
  feed('Bebeu um gole do cantil ('+cantilTexto(s)+')');sfx('pegar');hudBarra();invRender();}
