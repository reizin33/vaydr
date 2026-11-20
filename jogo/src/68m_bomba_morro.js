/* ================= A motobomba da caixa-d'água do Morro do Sabiá (v10.8.6) =================
   Himalaia (19/11/2026): "coisas que se conectam". Conserto novo: no pé da caixa-d'água do morro (a torre mais alta, ao lado
   do Largo, perto do Abrigo do Sabiá) a motobomba que enchia a caixa está parada. Com 1 peças de máquina, 1 óleo de motor e
   2 fios ela volta a funcionar e a bica do pé da torre dá água limpa:
   · E bebe até matar a sede; segure E enche as garrafas vazias e os cantis da mochila;
   · a motobomba liga sozinha de vez em quando (o barulho do motor chama os zumbis de perto);
   · entra no "O que fazer" como Conserto e nas ligações dos itens (peças de máquina, óleo de motor e fio). */
const BOMBA={ok:false,p:null,bica:null,malha:null,somT:0,jatoT:0};
const BOMBA_CUSTO={pecasMaquina:1,oleoMotor:1,fio:2};
function bombaD(){const D=ativD();if(!D.bombaMorro||typeof D.bombaMorro!=='object')D.bombaMorro={ligada:false};return D.bombaMorro;}
/* lugar: fora das pernas da torre, no chão perto do pé dela; a bica fica 1,4 m para o lado */
function bombaMontar(){if(BOMBA.ok||typeof MOR==='undefined'||!MOR.ok||!MOR.torre)return;const T=MOR.torre;
  for(const a of[0,Math.PI/2,-Math.PI/2,Math.PI,Math.PI/4,-Math.PI/4,3*Math.PI/4,-3*Math.PI/4]){const fx=Math.sin(a),fz=Math.cos(a),x=T.x+fx*3.6,z=T.z+fz*3.6;
    const bx=x+fz*1.4,bz=z-fx*1.4,g=ground(x,z),gb=ground(bx,bz);if(bloqueadoAlto(x,z,0.75,g+0.3)||bloqueadoAlto(bx,bz,0.55,gb+0.3))continue;   /* a caixa lá em cima não conta (pointBlocked ignora a altura) */
    if(Math.abs(g-T.g)>1.3||Math.abs(gb-g)>0.5)continue;
    BOMBA.p={x,z,g,yaw:a};BOMBA.bica={x:bx,z:bz,g:gb,yaw:a};break;}
  if(!BOMBA.p)return;const p=BOMBA.p,b=BOMBA.bica;
  colBox(p.x,p.z,0.55,0.4,p.yaw,{solid:true,y0:p.g-0.3,y1:p.g+0.75,morro:true});colBox(b.x,b.z,0.42,0.3,b.yaw,{solid:true,y0:b.g-0.3,y1:b.g+0.62,morro:true});
  BOMBA.ok=true;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{bombaMontar();}catch(e){console.error('bomba do morro',e);}return r;};}
function bombaGeo(){const g=new GB(1<<12,8),R=rng(68213),T=MOR.torre,p=BOMBA.p,b=BOMBA.bica;
  const box=(c,u0,u1,y0,y1,v0,v1,cor,o)=>{const M=mat(c.x,c.g,c.z,0,c.yaw,0);add(g,boxTris(u1-u0,y1-y0,v1-v0),mm(M,mat((u0+u1)/2,(y0+y1)/2,(v0+v1)/2)),lin(cor),Object.assign({j:0.04,rnd:R},o||{}));};
  /* motobomba: base de concreto, motor verde com aletas, voluta e o tanquinho de gasolina */
  box(p,-0.6,0.6,-0.1,0.12,-0.45,0.45,0xa8a298);box(p,-0.45,0.1,0.12,0.6,-0.28,0.28,0x3d6a4a);for(let k=0;k<5;k++)box(p,-0.43+k*0.11,-0.39+k*0.11,0.6,0.66,-0.26,0.26,0x2f5a3c);
  box(p,-0.25,0.0,0.6,0.78,-0.15,0.15,0xb83a2a);add(g,cylTris(0.2,0.2,0.18,12),mm(mat(p.x,p.g,p.z,0,p.yaw,0),mat(0.32,0.32,0,0,0,Math.PI/2)),lin(0x5a6a72));
  /* cano da bomba até a caixa, subindo pela perna da torre mais perto */
  const L=Math.atan2(p.x-T.x,p.z-T.z),ux=Math.sign(Math.sin(L))||1,uz=Math.sign(Math.cos(L))||1,px=T.x+ux*1.9,pz=T.z+uz*1.9;
  const seg=(a,c,cor,w)=>{const dx=c[0]-a[0],dy=c[1]-a[1],dz=c[2]-a[2],len=Math.hypot(dx,dy,dz);if(len<0.01)return;add(g,boxTris(w,w,len),mat((a[0]+c[0])/2,(a[1]+c[1])/2,(a[2]+c[2])/2,-Math.asin(dy/len),Math.atan2(dx,dz),0),lin(cor));};
  const sx=p.x+Math.cos(p.yaw)*0.32,sz=p.z-Math.sin(p.yaw)*0.32;   // a voluta (u = 0,32 no sistema da bomba)
  seg([sx,p.g+0.32,sz],[px,p.g+0.32,pz],0x5a6a72,0.09);seg([px,p.g+0.32,pz],[px,T.yb,pz],0x5a6a72,0.09);
  /* bica: tanque de concreto e a torneira na ponta do cano que desce da caixa */
  box(b,-0.42,0.42,-0.1,0.6,-0.3,0.3,0xb8b2a4);box(b,-0.36,0.36,0.45,0.61,-0.24,0.24,0x5a6e7a);
  const cb=mat(b.x,b.g,b.z,0,b.yaw,0),W=(u,y,v)=>{const q=[u*Math.cos(b.yaw)+v*Math.sin(b.yaw),v*Math.cos(b.yaw)-u*Math.sin(b.yaw)];return[b.x+q[0],b.g+y,b.z+q[1]];};
  const t0=W(0,1.05,-0.32),t1=W(0,1.05,0.05);seg(t0,t1,0x8a8e90,0.05);seg(W(0,1.05,-0.32),[px,b.g+1.05,pz],0x5a6a72,0.07);
  add(g,boxTris(0.05,0.08,0.05),mm(cb,mat(0,0.98,0.05)),lin(0x8a8e90));add(g,boxTris(0.12,0.03,0.03),mm(cb,mat(0,1.12,-0.05)),lin(0xb83a2a));
  return g.data();}
etapaMalha('fim','bombaMorro',1,()=>{if(!BOMBA.ok)return;try{BOMBA.malha=litMesh(bombaGeo());}catch(e){console.error('bomba do morro (desenho)',e);BOMBA.malha=null;}});
DESENHO.opaco.push(function bombaDesenho(Pg){if(BOMBA.malha&&d2(BOMBA.p.x,BOMBA.p.z,cam.pos[0],cam.pos[2])<200*200)drawStat(Pg,BOMBA.malha,ID);});
DESENHO.sombra.push((Pg,perto)=>{if(BOMBA.malha&&d2(BOMBA.p.x,BOMBA.p.z,P.x,P.z)<(perto?50:90)**2)drawStat(Pg,BOMBA.malha,ID);});
function bombaTorneira(){const b=BOMBA.bica,v=0.05;return[b.x+Math.sin(b.yaw)*v,b.g+0.98,b.z+Math.cos(b.yaw)*v];}
/* ligada: o motor trabalha de vez em quando; a água cai da bica quando alguém usa */
PASSOS.push(function bombaPasso(dt){if(!BOMBA.ok||G.modo!=='jogo'||!bombaD().ligada)return;const p=BOMBA.p;if(d2(p.x,p.z,P.x,P.z)>70*70)return;
  BOMBA.somT-=dt;if(BOMBA.somT<=0){BOMBA.somT=1.0;const on=Math.sin((G.t||0)*0.05)>0.2;if(on){sfx('motor',p.x,p.z,0.45);if(Math.random()<0.12)barulho(p.x,p.z,18,false,p.g);}}
  if(BOMBA.jatoT>0){BOMBA.jatoT-=dt;const t=bombaTorneira();if(Math.random()<dt*50)part(t[0]+(Math.random()-0.5)*0.02,t[1],t[2]+(Math.random()-0.5)*0.02,(Math.random()-0.5)*0.1,-1.2,(Math.random()-0.5)*0.1,0.45,0.035,[0.7,0.82,0.95,0.6],false,9.8);}});
INTERS.push(tryIt=>{if(!BOMBA.ok||P.bonde)return;const p=BOMBA.p,b=BOMBA.bica;if(Math.abs(P.x-p.x)>5||Math.abs(P.z-p.z)>5)return;
  tryIt({k:'bombaMotor',o:bombaD()},p.x+Math.sin(p.yaw)*0.75,p.z+Math.cos(p.yaw)*0.75,1.6,2.2,-0.8,p.g);
  tryIt({k:'bombaBica',o:bombaD()},b.x+Math.sin(b.yaw)*0.6,b.z+Math.cos(b.yaw)*0.6,1.5,2.0,-0.8,b.g);});
INTER_K.bombaMotor={texto:S=>{if(S.ligada)return{t:'Motobomba da caixa-d’água',s:'funcionando · a bica dá água limpa'};const f=ativFalta(BOMBA_CUSTO);
    return f.length?{t:'Motobomba parada',s:'falta '+f.join(', ')}:{t:'Consertar a motobomba',s:'gasta '+ativCusto(BOMBA_CUSTO)+' · segure',hold:true,dur:2.6};},
  usar:(S,seg)=>{if(S.ligada)return;if(ativFalta(BOMBA_CUSTO).length){sfx('vazio');return;}if(!seg)return;
    for(const k in BOMBA_CUSTO)invRemove(k,BOMBA_CUSTO[k]);S.ligada=true;ativLimpa();sfx('construir');sfx('missao');sfx('motor',BOMBA.p.x,BOMBA.p.z,1);ganharXP(100);P.shake=Math.max(P.shake||0,0.1);
    toast('habilidade','A motobomba voltou a encher a caixa-d’água do morro. A bica do pé da torre dá água limpa: E bebe, segurar E enche garrafas e cantis.');
    if(typeof diarioEvento==='function')diarioEvento('Consertou a motobomba da caixa-d’água do Morro do Sabiá','geral');if(typeof progresso==='function')progresso('conserto');if(typeof invRender==='function')invRender();}};
INTER_K.bombaBica={texto:S=>S.ligada?{t:'Beber da bica',s:'segure E: encher garrafas e cantis',hold:true,dur:1.4}:{t:'Bica seca',s:'a motobomba da caixa-d’água está parada'},
  usar:(S,seg)=>{if(!S.ligada){sfx('vazio');return;}BOMBA.jatoT=1.2;sfx('gota',BOMBA.bica.x,BOMBA.bica.z,1);
    if(!seg){P.sede=100;sfx('pegar');feed('Bebeu água da bica');if(typeof hudBarra==='function')hudBarra();return;}
    const gar=invCount('garrafa');let cn=0;try{cn=typeof cantisEncher==='function'?cantisEncher(false):0;}catch(e){}
    if(gar){invRemove('garrafa',gar);const l=invAdd('agua',gar);if(l)soltarItens([['agua',l]],P.x,P.z,P.y);}
    P.sede=100;sfx('pegar');feed(gar||cn?'Encheu '+[gar?gar+(gar>1?' garrafas':' garrafa'):'',cn?(cn>1?cn+' cantis':'o cantil'):''].filter(Boolean).join(' e ')+' com água limpa':'Sem garrafa vazia nem cantil para encher');
    if(typeof invRender==='function')invRender();if(typeof hudBarra==='function')hudBarra();}};
ativFonte(()=>{if(!BOMBA.ok||typeof MORRO_LIGADO!=='undefined'&&!MORRO_LIGADO)return[];const S=bombaD(),p=BOMBA.p,f=S.ligada?[]:ativFalta(BOMBA_CUSTO);
  return[{id:'bomba-morro',tipo:'conserto',nome:'Consertar a motobomba da caixa-d’água',x:p.x,z:p.z,r:12,feito:!!S.ligada,
    falta:S.ligada?'':f.length?'falta '+f.join(', ')+' (pé da caixa-d’água do Morro do Sabiá)':'segure E na motobomba',premio:'água limpa na bica do morro (beber e encher garrafas)'}];});
if(typeof LIGA_EXTRA!=='undefined')for(const k of['pecasMaquina','oleoMotor','fio']){(LIGA_EXTRA[k]=LIGA_EXTRA[k]||[]).push('consertar a motobomba da caixa-d’água do Morro do Sabiá');}
/* conquistas novas (valem para todas as partidas do aparelho, como as outras) */
if(typeof CONQ!=='undefined'){if(!CONQ.some(d=>d.id==='consertos3'))CONQ.push({id:'consertos3',nome:'Mãos à obra',desc:'Faça 3 consertos na cidade (o bondinho, a luz da Cidade Alta, a motobomba do morro).',ev:'conserto',meta:3});
  if(!CONQ.some(d=>d.id==='botijao10'))CONQ.push({id:'botijao10',nome:'Gás de cozinha',desc:'Derrube 10 zumbis com botijão de gás.',ev:'killBoti',meta:10});}
