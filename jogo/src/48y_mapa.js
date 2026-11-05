/* ================= mapa grande (tecla M, ou tocar no minimapa) =================
   Mostra a região inteira: lugares com nome, estradas, rio e lago, cidade com quarteirões e prédios, casas da vila e dos sítios,
   suas construções, o objetivo da missão, a mochila caída, o carro, o cachorro e quem você já conhece.
   Zumbis não aparecem (o minimapa continua mostrando os que estão perto). O jogo fica parado enquanto o mapa está aberto. */
TELAS_NOVAS.push('t-mapa');
let mapaVolta='jogo';
function abrirMapa(){if(G.modo!=='jogo')return;mapaVolta='jogo';G.modo='mapa';IN.attack=false;IN.mx=IN.mz=0;if(document.pointerLockElement)document.exitPointerLock();
  tela('t-mapa');desenharMapaGrande();sfx('clique');}
function fecharMapa(){if(G.modo!=='mapa')return;G.modo=mapaVolta;tela(null);sfx('clique');}
function desenharMapaGrande(){const c=$('mapa-g');if(!c)return;const css=Math.max(240,Math.min(c.clientWidth||600,1100)),dp=Math.min(2,window.devicePixelRatio||1),Wd=Math.round(css*dp);
  if(c.width!==Wd){c.width=Wd;c.height=Wd;}const g=c.getContext('2d');if(!g)return;const n=0;   // o mapa usa sempre as cores de dia (fica legível à noite)
  const x0=-MAP_R-6,x1=Math.max(CIDADE.x1+8,typeof MAPA_MAR!=='undefined'?MAPA_MAR.x1:0),z0=Math.min(-MAP_R,CIDADE.z0,typeof MAPA_Z0!=='undefined'?MAPA_Z0:0)-6,z1=Math.max(MAP_R,CIDADE.z1)+6,lado=Math.max(x1-x0,z1-z0),k=Wd/lado,ox=(lado-(x1-x0))/2,oz=(lado-(z1-z0))/2;
  const X=x=>(x-x0+ox)*k,Y=z=>(z-z0+oz)*k;
  g.clearRect(0,0,Wd,Wd);g.fillStyle='#121a12';g.fillRect(0,0,Wd,Wd);
  // a mata (disco do mapa) e a cidade
  g.fillStyle='#24331e';g.beginPath();g.arc(X(0),Y(0),MAP_R*k,0,Math.PI*2);g.fill();
  g.fillStyle='#3a3a38';g.fillRect(X(CIDADE.x0),Y(CIDADE.z0),(CIDADE.x1-CIDADE.x0)*k,(CIDADE.z1-CIDADE.z0)*k);
  for(const p of PLACES){g.fillStyle='#3c5431';g.beginPath();g.arc(X(p.x),Y(p.z),p.r*k,0,Math.PI*2);g.fill();}
  g.lineCap='round';g.lineJoin='round';
  for(const r of ROADS){g.strokeStyle=r.cor==='asfalto'?'#6d6b66':'#8b7759';g.lineWidth=Math.max(1.5,r.w*k*0.8);g.beginPath();r.pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke();}
  for(const f of MAPA_DESENHOS){try{f(g,X,Y,k,n,1e4);}catch(e){}}
  g.fillStyle='#6d6b64';for(const q of CID.quadras)g.fillRect(X(q.x0),Y(q.z0),(q.x1-q.x0)*k,(q.z1-q.z0)*k);
  for(const p of CID.predios){if(p.rural)continue;g.fillStyle=p.tipo==='hospital'?'#c9d3cf':'#a59f93';g.fillRect(X(p.x0),Y(p.z0),(p.x1-p.x0)*k,(p.z1-p.z0)*k);}
  g.fillStyle='#a07a4a';for(const o of OB){const D=OBRAS[o.tipo];if(!D)continue;g.save();g.translate(X(o.x),Y(o.z));g.rotate(-o.yaw);g.fillRect(-D.hw*k,-Math.max(D.hd,0.25)*k,D.hw*2*k,Math.max(D.hd,0.25)*2*k);g.restore();}
  // marcas
  const marca=(x,z,cor,raio)=>{g.fillStyle=cor;g.beginPath();g.arc(X(x),Y(z),raio*dp,0,Math.PI*2);g.fill();g.strokeStyle='#070a09';g.lineWidth=1.3*dp;g.stroke();};
  marca(FIRE[0],FIRE[2],'#ffcf8a',4);marca(TOWER[0],TOWER[1],'#ff5a4a',3.4);
  if(CARRO.comb>0||invCount('gasolina')||d2(CARRO.x,CARRO.z,P.x,P.z)<60*60)marca(CARRO.x,CARRO.z,'#e0c77e',3.6);
  if(P.mochila)marca(P.mochila.x,P.mochila.z,'#97c76e',4.2);
  if(CAO.ativo&&CAO.st!=='carro')marca(CAO.x,CAO.z,'#e0a35c',3.2);
  if(G.ev&&G.ev.ativo)marca(G.ev.x,G.ev.z,'#ff4a3d',4.2);
  try{mapaSobrev(marca,P.x,P.z,1e4);}catch(e){}try{mapaChefesR(marca);}catch(e){}
  const mi=missaoInfo();if(mi.alvo){marca(mi.alvo.x,mi.alvo.z,'#ff8a3d',6);g.strokeStyle='#ff8a3d';g.lineWidth=2*dp;g.beginPath();g.arc(X(mi.alvo.x),Y(mi.alvo.z),11*dp,0,Math.PI*2);g.stroke();}
  // nomes dos lugares
  g.font=`700 ${Math.round(12*dp)}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';
  // nomes sem sair da tela e sem um cobrir o outro: tenta em cima, embaixo, à direita e à esquerda do lugar
  const usados=[],hT=15*dp;
  const nome=(t,cx,cy,r)=>{const w=g.measureText(t).width+8*dp;const opc=[[cx,cy-r-9*dp],[cx,cy+r+10*dp],[cx+r+w/2+4*dp,cy],[cx-r-w/2-4*dp,cy]];
    let pos=null;for(const[x0,y0]of opc){const x=clamp(x0,w/2+2,Wd-w/2-2),y=clamp(y0,hT,Wd-hT),R={a:x-w/2,b:x+w/2,c:y-hT/2,d:y+hT/2};
      if(!usados.some(q=>R.a<q.b&&R.b>q.a&&R.c<q.d&&R.d>q.c)){pos=[x,y,R];break;}}
    if(!pos){const x=clamp(cx,w/2+2,Wd-w/2-2),y=clamp(cy-r-9*dp,hT,Wd-hT);pos=[x,y,{a:x-w/2,b:x+w/2,c:y-hT/2,d:y+hT/2}];}
    usados.push(pos[2]);g.lineWidth=3.5*dp;g.strokeStyle='rgba(7,10,9,.85)';g.strokeText(t,pos[0],pos[1]);g.fillStyle='#ece4d2';g.fillText(t,pos[0],pos[1]);};
  nome('Cidade',X((CIDADE.x0+CIDADE.x1)/2),Y(CIDADE.z0)+14*dp,0);
  for(const p of PLACES)if(p.nome)nome(p.nome,X(p.x),Y(p.z),p.r*k);
  // você (seta na direção que está olhando)
  const px=X(P.x),py=Y(P.z),f=[Math.sin(P.yaw),Math.cos(P.yaw)],s=11*dp;g.save();g.translate(px,py);g.fillStyle='#ece4d2';g.strokeStyle='#070a09';g.lineWidth=2*dp;g.beginPath();
  g.moveTo(f[0]*s,f[1]*s);g.lineTo(-f[1]*s*0.7-f[0]*s*0.7,f[0]*s*0.7-f[1]*s*0.7);g.lineTo(-f[0]*s*0.25,-f[1]*s*0.25);g.lineTo(f[1]*s*0.7-f[0]*s*0.7,-f[0]*s*0.7-f[1]*s*0.7);g.closePath();g.stroke();g.fill();g.restore();
  // norte
  g.font=`800 ${Math.round(13*dp)}px system-ui,sans-serif`;g.fillStyle='#e8ab43';g.fillText('N',Wd/2,14*dp);}
$('mapa-x').addEventListener('click',fecharMapa);
$('minimapa').addEventListener('click',()=>{if(G.modo==='jogo')abrirMapa();});
// este arquivo vem antes do 60_ui no jogo montado: o atalho do mapa para o evento aqui (senão o Esc que fecha o mapa abriria a pausa)
window.addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;
  if(e.code==='KeyM'&&!e.repeat){if(G.modo==='jogo'&&!OBRA.ativo){abrirMapa();e.stopImmediatePropagation();}else if(G.modo==='mapa'){fecharMapa();e.stopImmediatePropagation();}}
  else if(e.code==='Escape'&&G.modo==='mapa'){fecharMapa();e.stopImmediatePropagation();}});
window.addEventListener('resize',()=>{if(G.modo==='mapa')desenharMapaGrande();});
