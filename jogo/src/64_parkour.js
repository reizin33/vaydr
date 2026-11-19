/* ================= Movimento solto, com cara de Dying Light (v10.5.0, 19/11/2026) =================
   Pedido do Himalaia: "jogabilidade dura" (andar, correr e pular; câmera; combate; sistemas). Esta parte é o movimento:
   · agarrar a beirada no ar: pulando (ou caindo) de frente para uma beirada que a mão alcança, o personagem agarra e sobe
     (as animações de subir do Mixamo, 41b). Dá para pular de uma laje para outra e, se faltar pouco, agarrar a borda;
   · correndo, sobe mais alto: parede de até 3,4 m (andando, até 2,75 m como antes);
   · correndo de frente para mureta, carro, caixa ou laje baixa (0,55 a 1,35 m), passa por cima sozinho, sem parar e sem
     apertar o pulo; termina andando para a frente (antes parava e travava um instante);
   · pulo correndo vai mais longe (+12% para a frente);
   · rolamento na queda: apertando C (agachar) logo antes de bater no chão, o personagem rola: queda média não machuca e
     queda alta machuca bem menos (e não quebra a perna);
   · 1ª pessoa: a câmera balança com a corrida e inclina um pouco nas curvas e nos passos de lado;
   · 3ª pessoa: em Ajustes > Jogo, "Lado da câmera" (direita, no meio ou esquerda do ombro). */
const PK={grabCd:0,vaultCd:0,rolaPedido:-9,roll:0,yaw0:null};
const PK_CFG={maxCorrendo:3.4,vaultMin:0.55,vaultMax:1.35,vaultVel:3.4,saltoLongo:1.12,maoAlcance:2.15,maoMin:0.5};
/* acha uma beirada na frente: topo entre (P.y+min) e (P.y+max), com vão antes dela e espaço livre em cima para ficar de pé */
function pkBeirada(yaw,min,max,dists){const fx=Math.sin(yaw),fz=Math.cos(yaw);
  for(const d of dists){const x=P.x+fx*d,z=P.z+fz*d,h=chaoEm(x,z,P.y+max-0.55+0.01),dh=h-P.y;
    if(!(dh>=min&&dh<=max))continue;
    const hm=chaoEm(P.x+fx*Math.max(0.12,d-0.4),P.z+fz*Math.max(0.12,d-0.4),P.y+0.4);if(hm>h-0.45)continue;   // é borda, não ladeira
    const xs=P.x+fx*(d+0.35),zs=P.z+fz*(d+0.35),hs=chaoEm(xs,zs,h+0.1),em=Math.abs(hs-h)<0.25;
    const yTop=em?hs:h,px=em?xs:x,pz=em?zs:z;
    if(bloqueadoAlto(px,pz,0.26,yTop+0.06))continue;
    if(emPredios(px,pz,2)){const teto=tetoEm(px,yTop+0.3,pz);if(teto!==null&&teto-yTop<1.75)continue;}
    return{x:px,z:pz,y:yTop,dh:yTop-P.y,yaw};}
  return null;}
const pkLivre=()=>P.alive&&!CARRO.ativo&&!P.escala&&!P.muro&&!P.rola&&!P.nada&&!P.montado&&!P.balao&&!P.trilho&&!P.voo&&!P.dorme&&!(typeof OBRA!=='undefined'&&OBRA.ativo)&&P.y>-20;
function pkYaw(){const mv=Math.hypot(IN.mx,IN.mz)>0.15;return mv?P.yaw+Math.atan2(-IN.mx,IN.mz):P.body;}
/* correndo, a parede pode ser mais alta */
{const _am=alvoMuro;alvoMuro=function(){if(!P.correndo)return _am.apply(this,arguments);const m0=MURO.max;MURO.max=PK_CFG.maxCorrendo;try{return _am.apply(this,arguments);}finally{MURO.max=m0;}};}
/* pulo correndo vai mais longe */
{const _pu=pular;pular=function(){const vy0=P.vy,corria=P.correndo;const r=_pu.apply(this,arguments);
  if(corria&&!P.muro&&P.vy>vy0+3){P.vx*=PK_CFG.saltoLongo;P.vz*=PK_CFG.saltoLongo;P.vy+=0.35;}return r;};}
/* passar por cima e agarrar a beirada (a cada passo de simulação) */
PASSOS.push(function pkPasso(dt){PK.grabCd=Math.max(0,PK.grabCd-dt);PK.vaultCd=Math.max(0,PK.vaultCd-dt);
  if(!pkLivre()||P.acao||P.energia<6||(typeof pernaRuim==='function'&&pernaRuim()))return;
  const fwd=IN.mz>0.35||Math.hypot(P.vx,P.vz)>2.5;
  /* no ar: a mão alcança a beirada (subindo devagar ou caindo) */
  if(!P.noChao&&PK.grabCd<=0&&fwd&&P.vy<3.2&&(P.air===undefined||P.air>0.25)){
    const a=pkBeirada(pkYaw(),PK_CFG.maoMin,PK_CFG.maoAlcance,[0.45,0.65,0.85]);
    if(a){PK.grabCd=0.5;comecarMuro(a,a.dh>1.25?'pendurado':'subirTopo');if(P.muro)P.muro.pk='agarrou';return;}}
  /* correndo no chão: mureta, carro, caixa ou laje baixa na frente: passa por cima sem parar */
  if(P.noChao&&P.correndo&&PK.vaultCd<=0&&IN.mz>0.5){
    const a=pkBeirada(pkYaw(),PK_CFG.vaultMin,PK_CFG.vaultMax,[0.55,0.8]);
    if(a){PK.vaultCd=0.6;const C0=MURO_CLIP.subirTopo;MURO_CLIP.subirTopo=Object.assign({},C0,{vel:PK_CFG.vaultVel});
      try{comecarMuro(a,'subirTopo');}finally{MURO_CLIP.subirTopo=C0;}if(P.muro){P.muro.pk='passou';P.muro.vel=Math.max(5,Math.hypot(P.vx,P.vz));}}}});
/* no fim de subir/passar correndo, continua andando para a frente (antes parava e travava 0,12 s) */
{const _um=updateMuro;updateMuro=function(dt){const m=P.muro;const r=_um.apply(this,arguments);
  if(m&&!P.muro&&m.pk==='passou'){const v=Math.min(6.5,m.vel||5);P.vx=Math.sin(m.yaw)*v;P.vz=Math.cos(m.yaw)*v;P.travaAnda=0;}
  else if(m&&!P.muro&&m.pk==='agarrou')P.travaAnda=0.05;
  return r;};}
/* rolamento na queda: C no ar pede o rolamento; ao bater no chão, rola e a queda machuca menos */
{const _ag=agachar;agachar=function(on){if(on===undefined&&pkLivre()&&!P.noChao&&(P.air===undefined||P.air>0.6)){PK.rolaPedido=G.t;return;}return _ag.apply(this,arguments);};}
{const _q=queda;queda=function(v){if(G.t-PK.rolaPedido<0.55){const sobra=v-ESC_CFG.danoQueda;
    if(sobra<9*MOV.kq){feed('Rolou e não se machucou');return;}
    return _q.call(this,ESC_CFG.danoQueda+sobra*0.4);}
  return _q.apply(this,arguments);};}
{const _po=pousar;pousar=function(chao){const imp=-P.vy,pediu=G.t-PK.rolaPedido<0.55;const r=_po.apply(this,arguments);
  if(pediu&&imp>5.5&&P.alive){PK.rolaPedido=-9;P.noChao=true;const e=P.energia;P.energia=Math.max(P.energia,ROLA.custo);if(!rolar())P.energia=e;}
  return r;};}
/* câmera da 1ª pessoa: balança na corrida e inclina nas curvas e nos passos de lado */
{const _uc=updateCamera;updateCamera=function(dt){const r=_uc.apply(this,arguments);
  if(cfg.cam!=='1'||CARRO.ativo||!P.alive||P.montado||G.camFix||(typeof G!=='undefined'&&G.modo==='foto'))return r;
  const giro=PK.yaw0===null?0:Math.atan2(Math.sin(P.yaw-PK.yaw0),Math.cos(P.yaw-PK.yaw0))/Math.max(dt,1e-3);PK.yaw0=P.yaw;
  const alvo=clamp(-IN.mx*0.022-giro*0.006,-0.05,0.05)*(P.noChao?1:0.4);PK.roll+=(alvo-PK.roll)*(1-Math.exp(-dt*7));
  const corre=P.runK||0,bob=Math.sin(P.ph*2)*0.028*corre*(P.amp||0),lado=Math.sin(P.ph)*0.018*corre*(P.amp||0);
  if(bob||lado){const R=cam.right;for(let i=0;i<3;i++){cam.pos[i]+=R[i]*lado;cam.tgt[i]+=R[i]*lado;}cam.pos[1]+=bob;cam.tgt[1]+=bob;}
  if(Math.abs(PK.roll)>1e-4){const c=Math.cos(PK.roll),s=Math.sin(PK.roll),R=cam.right,U=cam.up;
    cam.right=[R[0]*c+U[0]*s,R[1]*c+U[1]*s,R[2]*c+U[2]*s];cam.up=[U[0]*c-R[0]*s,U[1]*c-R[1]*s,U[2]*c-R[2]*s];}
  return r;};}
/* Ajustes > Jogo: lado da câmera na 3ª pessoa (o 40_game multiplica o deslocamento do ombro por cfg.camLado) */
{const ref=$('aj-camdist'),op=ref&&ref.closest('.opcao');
 if(op&&!$('aj-camlado')){op.insertAdjacentHTML('afterend','<div class="opcao"><span class="rot">Lado da câmera (3ª pessoa)</span><div class="segs" id="aj-camlado"><button type="button" data-v="1">Direita</button><button type="button" data-v="0">No meio</button><button type="button" data-v="-1">Esquerda</button></div></div>');
   const el=$('aj-camlado');const marca=()=>el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.v===(cfg.camLado??1))));marca();
   el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cfg.camLado=+b.dataset.v;saveCfg();marca();sfx('clique');});
   const _au=ajustesUI;ajustesUI=function(){const r=_au.apply(this,arguments);marca();return r;};}}
