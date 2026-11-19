/* ================= O bondinho do Plano Inclinado volta a andar (v10.8.6) =================
   Himalaia (19/11/2026): "itens que se conectam, coisas que se conectam". O bondinho da Cidade Alta estava parado no meio da
   subida, de enfeite. Agora é um conserto de verdade, ligado a lugares e itens:
   · no painel do motor (parede da casa das máquinas, lá em cima): 1 fusível, 1 óleo de motor e 1 fio. A própria casa das
     máquinas guarda o fusível e o fio na primeira revista; o óleo de motor vem das oficinas e do posto;
   · ligado, o bondinho sobe até a estação de cima. Nas estações (embaixo no Largo do Plano, em cima na Praça do Mirante) dá
     para chamar; dentro, E parte e Espaço sai. A viagem leva uns 18 s;
   · o motor e o cabo fazem barulho: os zumbis de perto vão esperar na estação;
   · quem estiver nos trilhos na frente dele é empurrado para a escadaria do lado (o zumbi apanha);
   · entra no "O que fazer" como Conserto, e nas ligações dos itens (fusível, óleo de motor e fio: "Serve para").
   O carro foi refeito com janelas abertas, bancos, barras e porta (dá para ver quem vai dentro), sobre truques nos trilhos;
   o cabo corre no meio dos trilhos, sobre roldanas. */
CA_BONDE_MOVEL=true;
const BONDE={ok:false,R:null,col:null,loot:null,malha:null,estat:null,v:0,vMax:2.3,ac:0.8,somT:0,barT:0,colT:0,tMin:2.9,tMax:0,xOff:-1.15,painel:null};
const BONDE_CUSTO={fusivel:1,oleoMotor:1,fio:1};
ATIV_TIPOS.conserto={nome:'Conserto',cor:'#c8e06a',l:'F'};
function bondeD(){const D=ativD();if(!D.bonde||typeof D.bonde!=='object')D.bonde={ligado:false,t:null,alvo:null};const S=D.bonde;
  if(BONDE.R&&!isFinite(S.t))S.t=BONDE.R.L*0.55;if(S.alvo!=null&&!isFinite(S.alvo))S.alvo=null;return S;}
function bondePose(t){const R=BONDE.R,c=R.pt(t);return{x:c[0]+BONDE.xOff,z:c[1],y:R.yEm(t),inc:Math.atan2(R.yEm(t+2.4)-R.yEm(t-2.4),4.8)};}
/* ponto do carro (local: x para a escadaria, y para cima, z para baixo da encosta) no mundo */
function bondeW(q,lx,ly,lz){const c=Math.cos(q.inc),s=Math.sin(q.inc);return[q.x+lx,q.y+0.35+ly*c-lz*s,q.z+ly*s+lz*c];}
function bondeEstacao(t){return Math.abs(t-BONDE.tMin)<0.3?'baixo':Math.abs(t-BONDE.tMax)<0.3?'cima':null;}

/* ---------- montagem: acha o carro parado (colisão e saque) e o painel ---------- */
function bondeMontar(){if(BONDE.ok||!CA.ok||!CA.plano||!CA.plano.carro)return;const pl=CA.plano,R=pl.R,c=pl.carro;
  BONDE.R=R;BONDE.tMax=R.L-BONDE.tMin;BONDE.xOff=c.x-R.pt(R.L*0.55)[0];
  const velho=COLL.find(q=>q.t===1&&q.calta&&Math.abs(q.x-c.x)<0.01&&Math.abs(q.z-c.z)<0.01&&Math.abs(q.hw-1.1)<0.01&&Math.abs(q.hd-2.6)<0.01);if(velho)colRemove(velho);
  BONDE.loot=INTER.find(q=>q.id==='calta-bonde')||null;
  const m=pl.maq,px=m.x+1.87,pz=m.z+1.45;BONDE.painel={x:px,z:pz,g:Math.max(m.g,ground(px+0.5,pz))};
  BONDE.ok=true;bondeColisor();}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{bondeMontar();}catch(e){console.error('bondinho',e);}return r;};}
function bondeColisor(){if(!BONDE.ok)return;if(BONDE.col){colRemove(BONDE.col);BONDE.col=null;}const S=bondeD(),q=bondePose(S.t);
  BONDE.col=colBox(q.x,q.z,1.1,2.6,0,{solid:true,y0:q.y-0.5,y1:q.y+3.0,calta:true,bonde:true});
  /* o saque (revistar o bondinho) fica na ponta do carro do lado da estação mais perto (a porta do lado é para entrar) */
  const it=BONDE.loot;if(it){const fim=S.t<BONDE.R.L/2?1:-1,w=bondeW(q,0,0,fim*3.1);it.x=w[0];it.z=w[2];it.y=BONDE.R.yEm(S.t-fim*3.1);it.yChk=it.y;it.sub=S.ligado?'pela janela da '+(fim>0?'frente de baixo':'frente de cima'):'parado no meio da subida';}}

/* ---------- o carro (local; desenhado com a matriz do lugar na subida) ---------- */
function bondeGeoCarro(){const g=new GB(1<<13,8),R=rng(28431),A=(t,m,c,o)=>add(g,t,m,lin(c),Object.assign({j:0.03,rnd:R},o||{})),
    B=(x0,x1,y0,y1,z0,z1,c,o)=>A(boxTris(x1-x0,y1-y0,z1-z0),mat((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),c,o);
  const am=0xc8a428,am2=0xb08a20,az=0x2a5a8a,cz=0x5a5e60,es=0x2a2c2e,ma=0x6b4e30,hw=1.1,hl=2.6;
  /* truques e rodas nos trilhos (os trilhos ficam a -0,70 e +0,45 do meio do carro) */
  for(const sz of[-1,1]){B(-0.9,0.7,-0.2,0.02,sz*1.75-0.4,sz*1.75+0.4,es);for(const sx of[-0.7,0.45])A(cylTris(0.2,0.2,0.1,10),mat(sx+0.05,-0.15,sz*1.75,0,0,Math.PI/2),0x3a3c3e);}
  /* chassi e piso de tábua */
  B(-hw,hw,0,0.3,-hl,hl,cz);B(-1.04,1.04,0.3,0.36,-2.52,2.52,ma);
  /* laterais de baixo com a faixa azul; a porta do lado da escadaria (+x), no meio */
  for(const sx of[-1,1]){const x0=Math.min(sx*hw-0.03,sx*hw+0.03),x1=Math.max(sx*hw-0.03,sx*hw+0.03);B(x0,x1,0.3,1.3,-hl,hl,am);B(x0-0.006,x1+0.006,0.8,0.95,-hl-0.005,hl+0.005,az);}
  B(hw+0.03,hw+0.05,0.4,2.3,-0.42,0.42,am2);B(hw+0.05,hw+0.08,1.0,1.08,0.2,0.34,0x2a2a2a);
  /* frentes (de baixo e de cima): painel com a faixa e as colunas das janelas */
  for(const sz of[-1,1]){const z0=Math.min(sz*hl-0.03,sz*hl+0.03),z1=Math.max(sz*hl-0.03,sz*hl+0.03);B(-hw,hw,0.3,1.3,z0,z1,am);B(-hw-0.006,hw+0.006,0.8,0.95,z0-0.006,z1+0.006,az);
    for(const x of[-hw+0.05,-0.04,hw-0.05])B(x-0.05,x+0.05,1.3,2.45,z0,z1,am);}
  B(-0.16,0.16,1.0,1.14,hl+0.03,hl+0.07,0xf4e8c0,{e:0.5});B(-0.16,0.16,1.0,1.14,-hl-0.07,-hl-0.03,0x8a2a22,{e:0.25});   // farol embaixo, lanterna em cima
  /* colunas das janelas (abertas, sem vidro) e a viga de cima */
  for(const sx of[-1,1]){for(const z of(sx>0?[-hl,-1.55,-0.47,0.47,1.55,hl]:[-hl,-1.3,0,1.3,hl]))B(sx*hw-0.04,sx*hw+0.04,1.3,2.45,z-0.05,z+0.05,am);B(sx*hw-0.05,sx*hw+0.05,2.38,2.5,-hl,hl,am);}
  /* teto */
  B(-1.22,1.22,2.5,2.6,-hl-0.12,hl+0.12,0x6a6e70);B(-0.8,0.8,2.6,2.68,-hl,hl,0x5a5e60);
  /* banco de madeira na parede de oeste, as barras de segurar e o corrimão do teto */
  B(-1.02,-0.56,0.36,0.78,-2.2,2.2,ma);B(-1.06,-0.98,0.78,1.28,-2.2,2.2,0x5a4028);
  for(const z of[-1.6,0,1.6])A(cylTris(0.025,0.025,2.12,6),mat(0.35,0.36,z),0x9a9ea2);B(0.33,0.37,2.2,2.24,-2.3,2.3,0x9a9ea2);
  textoBlocos(g,mat(hw+0.04,1.62,0.95,0,Math.PI/2,0),'2',0.06,az);
  return g.data();}
/* o cabo no meio dos trilhos, sobre roldanas, e o painel do motor na parede da casa das máquinas */
function bondeGeoEstat(){const g=new GB(1<<13,8),R=rng(28432),Rp=BONDE.R,xc=Rp.P0[0]-Rp.w/2+0.55+0.575;
  const seg=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz);add(g,boxTris(0.03,0.03,len),mat((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,-Math.asin(dy/len),Math.atan2(dx,dz),0),lin(0x1c1c1c));};
  let prev=null;for(let t=0;t<=Rp.L+1e-6;t+=1){const p=Rp.pt(Math.min(t,Rp.L)),q=[xc,Rp.yEm(t)+0.14,p[1]];if(prev)seg(prev,q);prev=q;}
  for(let t=2;t<Rp.L-1;t+=4){const p=Rp.pt(t);add(g,cylTris(0.07,0.07,0.16,8),mat(xc+0.08,Rp.yEm(t)+0.08,p[1],0,0,Math.PI/2),lin(0x3a3c3e));}
  const Pn=BONDE.painel,y=Pn.g;add(g,boxTris(0.14,0.75,0.55),mat(Pn.x,y+1.4,Pn.z),lin(0x5a6470),{j:0.03,rnd:R});add(g,boxTris(0.03,0.6,0.42),mat(Pn.x+0.08,y+1.4,Pn.z),lin(0x6e7884));
  add(g,boxTris(0.05,1.03,0.05),mat(Pn.x-0.02,y+0.5,Pn.z+0.2),lin(0x3a3c3e));
  textoBlocos(g,mat(Pn.x+0.1,y+1.86,Pn.z+0.17,0,Math.PI/2,0),'MOTOR',0.018,0xf0ece0);
  return g.data();}
etapaMalha('fim','bonde',1,()=>{if(!BONDE.ok)return;try{BONDE.malha=litMesh(bondeGeoCarro());BONDE.estat=litMesh(bondeGeoEstat());}catch(e){console.error('bondinho (desenho)',e);BONDE.malha=null;BONDE.estat=null;}});
const BONDE_M=new Float32Array(16);
function bondeMatriz(){const q=bondePose(bondeD().t);return trs(BONDE_M,q.x,q.y+0.35,q.z,q.inc,0,0,1,1,1);}
DESENHO.opaco.push(function bondeDesenho(Pg){if(!BONDE.ok||!BONDE.malha)return;const q=bondePose(bondeD().t);if(d2(q.x,q.z,cam.pos[0],cam.pos[2])>240*240)return;
  drawStat(Pg,BONDE.malha,bondeMatriz());if(BONDE.estat)drawStat(Pg,BONDE.estat,ID);});
DESENHO.sombra.push((Pg,perto)=>{if(!BONDE.ok||!BONDE.malha)return;const q=bondePose(bondeD().t);if(d2(q.x,q.z,P.x,P.z)>(perto?60:130)**2)return;drawStat(Pg,BONDE.malha,bondeMatriz());});
/* luzes: o farol acende andando; a lâmpada do painel (vermelha desligado, verde ligado) */
DESENHO.aditivo.push(function bondeLuzes(){if(!BONDE.ok)return;const S=bondeD(),q=bondePose(S.t);if(d2(q.x,q.z,cam.pos[0],cam.pos[2])>140*140)return;
  const Pn=BONDE.painel,pis=0.6+0.4*Math.sin((G.t||0)*5);
  if(S.ligado)bb(Pn.x+0.12,Pn.g+1.65,Pn.z-0.14,0.09,0.35,1,0.4,0.9);else bb(Pn.x+0.12,Pn.g+1.65,Pn.z-0.14,0.08,1,0.25,0.15,0.5*pis);
  if(S.ligado){const w=bondeW(q,0,1.07,2.66),k=S.alvo!=null?1:0.35;bb(w[0],w[1],w[2],0.42,1,0.86,0.6,0.5*k);
    const v=bondeW(q,0,1.07,-2.66);bb(v[0],v[1],v[2],0.22,1,0.2,0.12,0.45*k);}});

/* ---------- andar: acelera, freia na estação, barulho, empurra quem está nos trilhos ---------- */
PASSOS.push(function bondePasso(dt){if(P.bonde&&!P.alive)P.bonde=false;if(!BONDE.ok||G.modo!=='jogo')return;const S=bondeD();if(S.alvo==null){BONDE.v=0;return;}
  const dir=Math.sign(S.alvo-S.t),rest=Math.abs(S.alvo-S.t);
  BONDE.v=Math.max(0.25,Math.min(BONDE.vMax,Math.sqrt(2*BONDE.ac*rest),BONDE.v+BONDE.ac*dt));const passo=BONDE.v*dt;
  if(passo>=rest){S.t=S.alvo;S.alvo=null;BONDE.v=0;bondeColisor();bondeChegou();return;}
  S.t+=dir*passo;BONDE.colT-=dt;if(BONDE.colT<=0){BONDE.colT=0.2;bondeColisor();}
  const q=bondePose(S.t);
  BONDE.somT-=dt;if(BONDE.somT<=0){BONDE.somT=0.85;sfx('motor',q.x,q.z,0.75);if(Math.random()<0.35)sfx('rangido',q.x,q.z,0.35);}
  BONDE.barT-=dt;if(BONDE.barT<=0){BONDE.barT=2.5;barulho(q.x,q.z,32,false,q.y);}
  /* na frente do carro (no sentido em que anda): empurra para a escadaria */
  const dentro=(x,y,z)=>{const dx=x-q.x,dz=z-q.z;return Math.abs(dx)<1.3&&Math.abs(dz)<2.9&&Math.abs(y-(q.y-dz*Math.tan(q.inc)))<2.2;};
  const fora=x=>BONDE.R.P0[0]+1.25+Math.random()*0.6;
  for(const z of Z){if(!z.vivo||z.st==='morrendo'||!dentro(z.x,z.y,z.z))continue;z.x=fora();ZHIT={k:'golpe'};ferirZ(z,32,2.5,dir*-1.5,1);if(z.vivo&&ZS[z.tipo]&&ZS[z.tipo].hp<900){z.st='atordoado';z.t=0.8;}sfx('golpe',z.x,z.z,0.7);}
  if(!P.bonde&&P.alive&&dentro(P.x,P.y,P.z)&&(!BONDE.empurrouT||G.t-BONDE.empurrouT>1.2)){BONDE.empurrouT=G.t;P.x=fora();P.y=chaoEm(P.x,P.z,P.y+1.2);ferirJogador(8,{x:q.x,z:q.z});feed('O bondinho te jogou para a escadaria',true);}});
function bondeChegou(){const S=bondeD(),e=bondeEstacao(S.t),q=bondePose(S.t);sfx('clique',q.x,q.z,0.9);sfx('elevador',q.x,q.z,0.6);
  if(P.bonde){feed(e==='cima'?'Chegou lá em cima: Praça do Mirante, Cidade Alta':'Chegou embaixo: Largo do Plano');dica('bondeSair','corpo','Bondinho parado na estação: Espaço sai; E volta.');}}
function bondeIr(t){const S=bondeD();if(!S.ligado||S.alvo!=null)return;if(Math.abs(t-S.t)<0.05)return;S.alvo=clamp(t,BONDE.tMin,BONDE.tMax);BONDE.v=0;BONDE.somT=0;BONDE.barT=1.2;sfx('elevador',P.x,P.z,0.7);}

/* ---------- dentro do carro: preso no piso (como no cesto do balão) ---------- */
function bondeEntrar(){const S=bondeD();if(P.escala||P.balao||CARRO.ativo||!P.alive)return;P.bonde=true;P.agachado=false;P.vx=P.vz=P.vy=0;bondeLevar(0);sfx('passo',P.x,P.z,0.5);
  dica('bondeDentro','corpo','No bondinho: E parte para a outra estação; parado, Espaço sai pela porta do lado da escadaria.');}
function bondeSair(){const S=bondeD(),q=bondePose(S.t);P.bonde=false;const w=bondeW(q,1.85,0,0.3);P.x=w[0];P.z=w[2];P.y=chaoEm(P.x,P.z,q.y+1.6);P.vx=P.vz=P.vy=0;P.noChao=true;sfx('passo',P.x,P.z,0.5);}
function bondeLevar(dt){const S=bondeD();if(!P.alive||!BONDE.ok){P.bonde=false;return;}const q=bondePose(S.t),w=bondeW(q,0.3,0.36,0.6);
  P.x=w[0];P.y=w[1];P.z=w[2];P.vx=P.vz=P.vy=0;P.noChao=true;P.agachado=false;if(dt>0&&typeof sobreviver==='function')sobreviver(dt,false);
  const ch=P.ch;if(ch){ch.x=P.x;ch.z=P.z;ch.y=P.y;ch.yaw=P.yaw;}}
{const _np=nadoPasso;nadoPasso=function(dt){if(P.bonde){bondeLevar(dt);return true;}return _np.apply(this,arguments);};}
{const _pl=pular;pular=function(){if(P.bonde){if(bondeD().alvo==null)bondeSair();else feed('Espere o bondinho parar',true);return;}return _pl.apply(this,arguments);};}
/* a câmera de fora não bate no próprio bondinho (senão gruda nas costas de quem vai dentro) */
{const _cb=camBloqueio;camBloqueio=function(x,y,z,teto){const c=P.bonde&&BONDE.col;if(!c)return _cb.apply(this,arguments);c.solid=false;try{return _cb.apply(this,arguments);}finally{c.solid=true;}};}
/* viajar entre abrigos de dentro do bondinho, não */
{const _av=abrigoViajar;abrigoViajar=function(){if(P.bonde){feed('Saia do bondinho antes',true);sfx('vazio');return;}return _av.apply(this,arguments);};}
/* dentro do carro, só a parede protege: zumbi de fora não alcança */
{const _fj=ferirJogador;ferirJogador=function(d,src){if(P.bonde&&src&&src.vivo!==undefined)return;return _fj.apply(this,arguments);};}

/* ---------- o que se usa: painel, entrar, chamar e, dentro, partir ---------- */
INTERS.push(tryIt=>{if(!BONDE.ok||!CALTA_LIGADO)return;const S=bondeD();
  if(P.bonde){tryIt({k:'bondeDentro',o:S},P.x,P.z,3,9,-2,P.y);return;}
  const Pn=BONDE.painel;if(Math.abs(P.x-Pn.x)<4&&Math.abs(P.z-Pn.z)<4)tryIt({k:'bondePainel',o:S},Pn.x+0.55,Pn.z,1.7,2.4,-0.8,Pn.g);
  if(!S.ligado)return;const q=bondePose(S.t);
  if(S.alvo==null){const w=bondeW(q,1.55,0,0.6);if(Math.abs(P.x-w[0])<4&&Math.abs(P.z-w[2])<4)tryIt({k:'bondeEntrar',o:S},w[0],w[2],1.9,1.8,-0.6,q.y);}
  for(const[t,nome]of[[BONDE.tMin,'baixo'],[BONDE.tMax,'cima']]){if(S.alvo==null&&bondeEstacao(S.t)===nome)continue;if(S.alvo!=null&&Math.abs(S.alvo-t)<0.3)continue;
    const c=BONDE.R.pt(t),x=BONDE.R.P0[0]+1.5,z=c[1]+(nome==='baixo'?1.6:-1.6),y=BONDE.R.yEm(t+(nome==='baixo'?-1.6:1.6));
    if(Math.abs(P.x-x)<5&&Math.abs(P.z-z)<5)tryIt({k:'bondeChamar',o:{t,nome}},x,z,2.6,1.4,-1,y);}});
INTER_K.bondePainel={texto:S=>{if(S.ligado)return{t:'Painel do motor do bondinho',s:'ligado · o bondinho anda'};const f=ativFalta(BONDE_CUSTO);
    return f.length?{t:'Painel do motor do bondinho',s:'falta '+f.join(', ')+(invCount('oleoMotor')?'':' (óleo de motor: oficinas e posto)')}:{t:'Religar o motor do bondinho',s:'gasta '+ativCusto(BONDE_CUSTO)+' · segure',hold:true,dur:2.4};},
  usar:(S,seg)=>{if(S.ligado)return;if(ativFalta(BONDE_CUSTO).length){sfx('vazio');return;}if(!seg)return;
    for(const k in BONDE_CUSTO)invRemove(k,BONDE_CUSTO[k]);S.ligado=true;ativLimpa();bondeColisor();sfx('construir');sfx('missao');sfx('motor',BONDE.painel.x,BONDE.painel.z,1);ganharXP(120);P.shake=Math.max(P.shake||0,0.12);
    toast('habilidade','O bondinho voltou a andar! Ele vem para a estação de cima. Nas estações dá para chamar; dentro, E parte. O barulho do motor chama os zumbis para a estação.');
    if(typeof diarioEvento==='function')diarioEvento('Religou o bondinho do Plano Inclinado','geral');
    if(typeof progresso==='function')progresso('conserto');bondeIr(BONDE.tMax);if(typeof invRender==='function')invRender();}};
INTER_K.bondeEntrar={texto:S=>{const e=bondeEstacao(S.t);return{t:'Entrar no bondinho',s:e==='baixo'?'sobe para a Cidade Alta':e==='cima'?'desce para o Largo do Plano':'parado no meio da subida'};},
  usar:()=>bondeEntrar()};
INTER_K.bondeChamar={texto:o=>{const S=bondeD();return{t:'Chamar o bondinho',s:S.alvo!=null?'ele está andando':'ele está '+(bondeEstacao(S.t)==='cima'?'lá em cima':bondeEstacao(S.t)==='baixo'?'lá embaixo':'no meio da subida')};},
  usar:o=>{const S=bondeD();if(S.alvo!=null){sfx('vazio');return;}sfx('clique');bondeIr(o.t);feed('O bondinho está vindo');}};
INTER_K.bondeDentro={texto:S=>{if(S.alvo!=null){const sobe=S.alvo>S.t;return{t:sobe?'Subindo para a Cidade Alta':'Descendo para o Largo do Plano',s:'chega em '+Math.max(1,Math.ceil(Math.abs(S.alvo-S.t)/Math.max(0.8,BONDE.v||BONDE.vMax)))+' s'};}
    const e=bondeEstacao(S.t);return{t:e==='cima'?'Descer para o Largo do Plano':e==='baixo'?'Subir para a Cidade Alta':'Seguir para a estação de cima',s:'E parte · Espaço sai'};},
  usar:S=>{if(S.alvo!=null)return;const e=bondeEstacao(S.t);bondeIr(e==='cima'?BONDE.tMin:BONDE.tMax);}};

/* ---------- no "O que fazer", nas ligações dos itens e no jogo salvo ---------- */
ativFonte(()=>{if(!BONDE.ok||!CALTA_LIGADO)return[];const S=bondeD(),Pn=BONDE.painel,f=S.ligado?[]:ativFalta(BONDE_CUSTO);
  return[{id:'bonde',tipo:'conserto',nome:'Religar o bondinho do Plano Inclinado',x:Pn.x,z:Pn.z,r:12,feito:!!S.ligado,
    falta:S.ligado?'':f.length?'falta '+f.join(', ')+' (painel do motor, na casa das máquinas lá em cima)':'segure E no painel do motor',premio:'o bondinho volta a subir e descer a encosta'}];});
if(typeof LIGA_EXTRA!=='undefined')for(const k of['fusivel','oleoMotor','fio']){(LIGA_EXTRA[k]=LIGA_EXTRA[k]||[]).push('religar o bondinho do Plano Inclinado (Cidade Alta)');}
V8.novo.bonde=()=>{P.bonde=false;if(!BONDE.ok)return;bondeD();BONDE.v=0;bondeColisor();};
V8.carregar.bonde=()=>{P.bonde=false;if(!BONDE.ok)return;const S=bondeD();if(S.alvo!=null){S.t=S.alvo;S.alvo=null;}BONDE.v=0;bondeColisor();};
