/* ================= Etapa 22 (extra, "se for viável"): o balão de ar quente do Campo dos balões — consertar e voar =================
   O cesto reserva do campo vira balão de novo: conserte com 8 tecidos, 4 cordas, 2 sucatas e 1 peça de máquina (o tecido e a
   corda saem do balão caído e do barracão). O maçarico queima gás: cada botijão (no barracão do campo) dá uns 3 minutos de chama.
   · Subir: perto do cesto, E. No cesto, Espaço acende o maçarico por uns segundos (o ar esquenta e o balão sobe); C abre a
     válvula de cima (solta ar quente e desce mais rápido). Sem chama o ar esfria devagar e o balão desce sozinho.
   · Não dá para dirigir: o vento leva. O vento de cima sopra para outro lado que o de baixo — subindo ou descendo você escolhe
     para onde ir. As teclas de andar só empurram um pouco.
   · Lá de cima o minimapa mostra longe. Teto de 140 m sobre o chão. Na beira do mapa o vento devolve o balão.
   · Pousou (no chão, ar frio), E sai do cesto. O balão fica onde pousou e o gás que sobrou fica nele. */
iconesNovos({'i-botijao':'<path d="M8 7h8v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z"/><path d="M10 3h4v4h-4zM8 12h8"/>'});
Object.assign(ITEMS,{botijaoGas:{nome:'Botijão de gás',icon:'i-botijao',max:4,tipo:'material',desc:'Botijão pequeno de gás, cheio. Alimenta o maçarico do balão do Campo dos balões (cada um dá uns 3 minutos de chama).'}});
LOOT.barracaoBalao=[['botijaoGas',1,2,1.0],['corda',1,2,0.6],['pano',2,4,0.6],['sucata',1,3,0.5],['kitFerramentas',1,1,0.2],['lanterna',1,1,0.3]];
const BALAO_CUSTO={pano:8,corda:4,sucata:2,pecasMaquina:1},BALAO_GAS=180,BALAO_TETO=140;
function balD(){const A=arcD();if(!A.voo||typeof A.voo!=='object'){const c=ARC_LAY.campo?ARC_LAY.campo.cesto:{x:88.5,z:-243};A.voo={st:'quebrado',x:c.x,z:c.z,y:ground(c.x,c.z),gas:0};}return A.voo;}
const BV={calor:0,vy:0,queima:0,vent:0,ar:0};   // estado do voo que não precisa ir no save
/* consertar, subir, abastecer, sair */
INTERS.push(tryIt=>{if(P.y<-20)return;const B=balD();if(P.balao){tryIt({k:'balaoCesto',o:B},P.x,P.z,3,6,-2,P.y);return;}
  if(Math.abs(P.x-B.x)>4||Math.abs(P.z-B.z)>4)return;tryIt({k:'balaoCesto',o:B},B.x,B.z,2.4,2.4,-1.2,B.y);});
INTER_K.balaoCesto={texto:()=>{const B=balD();
    if(P.balao){if(B.st==='voando')return{t:'Voando · gás '+Math.ceil(B.gas/BALAO_GAS*100)+'%',s:'Espaço acende o maçarico (sobe) · C solta ar (desce) · o vento leva'};
      return{t:'Sair do balão',s:'gás '+Math.ceil(B.gas/BALAO_GAS*100)+'% · Espaço acende o maçarico para subir'};}
    if(B.st==='quebrado')return invHas(BALAO_CUSTO)?{t:'Consertar o balão',s:'usa 8 tecidos, 4 cordas, 2 sucatas e 1 peça de máquina · segure',hold:true,dur:4}:
      {t:'Balão sem conserto',s:'precisa de 8 tecidos, 4 cordas, 2 sucatas e 1 peça de máquina (o balão caído e o barracão ajudam)'};
    if(B.gas<=1&&!invCount('botijaoGas'))return{t:'Balão sem gás',s:'traga um botijão de gás (tem no barracão do campo)'};
    return{t:'Subir no balão',s:B.gas<=1?'põe um botijão no maçarico':'gás '+Math.ceil(B.gas/BALAO_GAS*100)+'%'};},
  usar:(o,seg)=>{const B=balD();
    if(P.balao){if(B.st!=='voando')balaoSair();return;}
    if(B.st==='quebrado'){if(!seg)return;if(!invHas(BALAO_CUSTO)){feed('Falta material para o balão',true);sfx('vazio');return;}invPay(BALAO_CUSTO);B.st='parado';
      if(ARC_LAY.campo&&ARC_LAY.campo.cestoCol){colRemove(ARC_LAY.campo.cestoCol);ARC_LAY.campo.cestoCol=null;}balaoCampoRemonta();
      sfx('construir');feed('Balão consertado');ganharXP(60);hudBarra();invRender();if(typeof diarioEvento==='function')diarioEvento('Consertou o balão do Campo dos balões','geral');
      dica('balao','corpo','Balão pronto! Precisa de gás: cada botijão dá uns 3 minutos de chama. No cesto, Espaço sobe e C desce; o vento leva.');return;}
    if(B.gas<=1){if(!invCount('botijaoGas')){feed('Sem gás',true);sfx('vazio');return;}invRemove('botijaoGas',1);B.gas+=BALAO_GAS;feed('Botijão no maçarico');invRender();}
    balaoEntrar();}};
function balaoEntrar(){const B=balD();if(P.escala)return;P.balao=true;P.agachado=false;P.vx=P.vz=0;P.vy=0;BV.calor=0;BV.vy=0;BV.queima=0;BV.vent=0;
  P.x=B.x;P.z=B.z;P.y=B.y+0.08;sfx('pegar');feed('No cesto: Espaço acende o maçarico');}
function balaoSair(){const B=balD();P.balao=false;const a=P.yaw+Math.PI/2;let x=B.x+Math.sin(a)*1.6,z=B.z+Math.cos(a)*1.6;if(pointBlocked(x,z,0.35)||!dentroMapa(x,z,1)){x=B.x-Math.sin(a)*1.6;z=B.z-Math.cos(a)*1.6;}
  P.x=x;P.z=z;P.y=chaoEm(x,z,B.y+1);P.vy=0;P.noChao=true;B.st='parado';sfx('clique');}
/* Espaço e C (teclado, controle e toque passam por pular e agachar) */
{const _pl=pular;pular=function(){if(P.balao){const B=balD();if(B.gas>0){BV.queima=Math.min(6,BV.queima+2.4);sfx('fogo',P.x,P.z,0.9);}else feed('Sem gás',true);return;}return _pl.apply(this,arguments);};}
{const _ag=agachar;agachar=function(on){if(P.balao){if(on===false)return;BV.vent=Math.min(4,BV.vent+1.6);sfx('gas',P.x,P.z,0.5);return;}return _ag.apply(this,arguments);};}
/* o voo: no lugar do andar a pé (pelo mesmo gancho do nado) */
{const _np=nadoPasso;nadoPasso=function(dt){if(P.balao){balaoPasso(dt);return true;}return _np.apply(this,arguments);};}
function balaoVento(alt){const w=E.wind||[0.6,0.25],f=Math.hypot(w[0],w[1])||0.5,a0=Math.atan2(w[1],w[0]),a=a0+smooth(15,120,alt)*2.6;return[Math.cos(a)*f*1.5,Math.sin(a)*f*1.5];}
function balaoPasso(dt){const B=balD();if(!P.alive){P.balao=false;return;}
  if(BV.queima>0&&B.gas>0){BV.queima-=dt;B.gas=Math.max(0,B.gas-dt);BV.calor=Math.min(1,BV.calor+dt*0.32);if(Math.random()<dt*14)part(B.x,B.y+2.6,B.z,(Math.random()-0.5)*0.4,2.4,(Math.random()-0.5)*0.4,0.35,0.32,[1,0.6,0.2,1],true,-2);}
  else{BV.queima=0;BV.calor=Math.max(0,BV.calor-dt*0.045);}
  if(BV.vent>0){BV.vent-=dt;BV.calor=Math.max(0,BV.calor-dt*0.22);}
  const g=ground(B.x,B.z),agua=typeof aguaNivel==='function'?aguaNivel(B.x,B.z):null,piso=Math.max(g,agua!==null?agua:-1e9),alt=B.y-piso;
  BV.vy=approach(BV.vy,(BV.calor-0.42)*6.5,dt*1.4);let y=B.y+BV.vy*dt;
  if(y<=piso){y=piso;if(BV.vy<-3.5){P.vida-=Math.min(40,(-BV.vy-3.5)*12);sfx('golpe');feed('Pouso duro',true);}BV.vy=Math.max(0,BV.vy);if(BV.calor<0.42){if(B.st==='voando')feed('Pousou');B.st='parado';}}
  else if(alt>0.4)B.st='voando';
  if(y>piso+BALAO_TETO){y=piso+BALAO_TETO;BV.vy=Math.min(0,BV.vy);}
  B.y=y;
  if(B.st==='voando'){const v=balaoVento(alt),sy=Math.sin(P.yaw),cy=Math.cos(P.yaw),ex=(sy*IN.mz-cy*IN.mx)*0.8,ez=(cy*IN.mz+sy*IN.mx)*0.8;
    let nx=B.x+(v[0]+ex)*dt,nz=B.z+(v[1]+ez)*dt;
    if(!dentroMapa(nx,nz,10)){const dx=-nx,dz=-nz,dl=Math.hypot(dx,dz)||1;nx=B.x+dx/dl*2.2*dt;nz=B.z+dz/dl*2.2*dt;if(!dentroMapa(nx,nz,0)){nx=B.x;nz=B.z;}}
    B.x=nx;B.z=nz;if(alt>35)G.obsAte=Math.max(G.obsAte||0,G.t+4);}
  P.x=B.x;P.z=B.z;P.y=B.y+0.08;P.vx=P.vz=0;P.vy=0;P.noChao=true;P.agachado=false;   // de pé no fundo do cesto (a borda na cintura)
  if(typeof sobreviver==='function')sobreviver(dt,false);
  const ch=P.ch;if(ch){ch.x=P.x;ch.z=P.z;ch.y=P.y;ch.yaw=P.yaw;}}
/* desenho: envelope cheio (gomos coloridos), cesto, maçarico e cordas */
function geoBalaoVoo(){const g=new GB(1<<14,8),R=rng(2219),cores=[0xc8302a,0xe8b830,0x2a5a9a,0xe8e4dc,0x2a8a5a,0xe8b830].map(lin),N=12,M=10,H=9.5,Rm=5.4,base=3.2;
  const pt=(i,j)=>{const a=i/N*Math.PI*2,t=j/M,r=t<0.08?lerp(0.9,2.2,t/0.08):Rm*Math.sin(Math.PI*Math.min(1,0.2+t*0.85))*(t>0.5?1:0.75+0.5*t),y=base+t*H;return[Math.cos(a)*r,y,Math.sin(a)*r];};
  for(let i=0;i<N;i++){const T=[];for(let j=0;j<M;j++){const a=pt(i,j),b=pt(i,j+1),c=pt(i+1,j+1),d=pt(i+1,j);T.push([a,c,b],[a,d,c]);}add(g,T,ID,cores[i%cores.length],{j:0.04,rnd:R});}
  add(g,cylTris(0.01,1.2,0.25,12),mat(0,base+H-0.05,0),lin(0xe8e4dc));
  /* v10.2.2 ("jogador em pé no balão"): o cesto era uma caixa maciça e a pessoa aparecia em cima dela ou cortada na tampa. Agora o
     cesto é oco, de vime: fundo, quatro paredes, faixas trançadas por fora e a borda de couro na altura da cintura; a pessoa fica dentro */
  {const vime=lin(0x8a6a3a),trama=lin(0x6a4a2a),couro=lin(0x3e2a1a),W=1.25,Hc=1.05,e=0.05;
    add(g,boxTris(W,0.08,W),mat(0,0.04,0),trama,{j:0.05,rnd:R});
    for(const s of[-1,1]){add(g,boxTris(W,Hc,e),mat(0,Hc/2,s*(W/2-e/2)),vime,{j:0.06,rnd:R});add(g,boxTris(e,Hc,W-2*e),mat(s*(W/2-e/2),Hc/2,0),vime,{j:0.06,rnd:R});}
    for(let i=0;i<5;i++){const y=0.12+i*0.2;for(const s of[-1,1]){add(g,boxTris(W+0.02,0.03,0.02),mat(0,y,s*(W/2+0.005)),trama);add(g,boxTris(0.02,0.03,W+0.02),mat(s*(W/2+0.005),y,0),trama);}}
    for(const s of[-1,1]){add(g,boxTris(W+0.06,0.07,0.09),mat(0,Hc+0.02,s*(W/2)),couro,{j:0.05,rnd:R});add(g,boxTris(0.09,0.07,W+0.06),mat(s*(W/2),Hc+0.02,0),couro,{j:0.05,rnd:R});}}
  for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]]){add(g,cylTris(0.02,0.02,2.3,4),alignY(sx*0.6,1.0,sz*0.6,-sx*0.35,2.2,-sz*0.35),lin(0x55595c));add(g,cylTris(0.012,0.012,2.4,4),alignY(sx*0.55,3.0,sz*0.55,sx*0.9,2.2,sz*0.9),lin(0xc8b890));}
  add(g,cylTris(0.22,0.18,0.35,10),mat(0,2.85,0),lin(0x3a3d40));for(const s of[-0.4,0.4])add(g,cylTris(0.15,0.15,0.55,10),mat(s,0.06,0.35),lin(0xc8c8c0));
  return litMesh(g.data());}
let BALAO_M=null;
INIT_MALHAS.push(()=>{BALAO_M=geoBalaoVoo();});
DESENHO.opaco.push(function balaoDesenho(Pg){if(!BALAO_M)return;const B=balD();if(B.st==='quebrado')return;if(d2(B.x,B.z,cam.pos[0],cam.pos[2])>700*700)return;
  drawStat(Pg,BALAO_M,mat(B.x,B.y,B.z,0,0.3,0));});
DESENHO.sombra.push((Pg,perto)=>{if(!BALAO_M)return;const B=balD();if(B.st==='quebrado'||d2(B.x,B.z,P.x,P.z)>(perto?70:150)**2)return;drawStat(Pg,BALAO_M,mat(B.x,B.y,B.z,0,0.3,0));});
/* com o balão consertado, o cesto reserva sai do desenho do campo (ele é o cesto do balão) */
function balaoCampoRemonta(){const q=ARC_PECAS.find(p=>p.id==='campo');if(q&&q.mesh){liberarMesh(q.mesh);q.mesh=null;if(!ARC_FILA.includes(q))ARC_FILA.push(q);}}
V8.carregar.balaoVoo=()=>{P.balao=false;const A=arcD();if(A.voo&&A.voo.st==='voando'){A.voo.st='parado';A.voo.y=ground(A.voo.x,A.voo.z);}
  if(A.voo&&A.voo.st!=='quebrado'&&ARC_LAY.campo&&ARC_LAY.campo.cestoCol){colRemove(ARC_LAY.campo.cestoCol);ARC_LAY.campo.cestoCol=null;}balaoCampoRemonta();};
V8.novo.balaoVoo=()=>{P.balao=false;const L=ARC_LAY.campo;if(L&&!L.cestoCol){const c=L.cesto;L.cestoCol=colBox(c.x,c.z,0.62,0.55,0.4,{solid:true,y0:ground(c.x,c.z)-0.2,y1:ground(c.x,c.z)+1.05});balaoCampoRemonta();}};
