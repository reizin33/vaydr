/* ================= Etapa 19: animações e movimentação =================
   As poses continuam no esqueleto do jogo (12 ossos passados para o Mixamo): aqui entram camadas por cima da pose de sempre.
   · Transições: o corpo inclina para a frente ao arrancar e para trás ao frear, deita um pouco na curva, e os joelhos
     dobram ao pousar de um pulo ou queda. Agachado andando, passo curto com os braços na frente (furtivo).
   · Ações com o corpo (ação contextual, sem travar o jogo): pegar do chão (abaixa, pega e levanta), mexer em baú e porta-
     malas, abrir porta, portão, janela e alçapão, apertar interruptor e alavanca, trabalhar na bancada e nas estações
     (depois de fabricar, o personagem martela um pouco na frente da bancada), engatar reboque.
   · Veículos: entra (senta) e sai (levanta) com animação; dirigindo, o personagem aparece sentado com as mãos no volante
     (no guidão da moto, no leme do barco, remando na jangada).
   · Cavalo: monta passando a perna por cima e desce pisando no chão.
   · Primeira pessoa: a mão e o que ela segura acompanham a ação (abaixa para pegar, empurra a porta, martela, aperta). */
const ANIM={coletar:{dur:0.7},bau:{dur:0.75},porta:{dur:0.55},botao:{dur:0.45},fabricar:{dur:1.3},engatar:{dur:0.8},entrar:{dur:0.55},sair:{dur:0.5},desmontar:{dur:0.5}};
function animCtx(tipo,alvo){if(!P.alive||!ANIM[tipo])return;if(P.anim&&P.anim.depois){const f=P.anim.depois;P.anim.depois=null;f();}if(CARRO&&CARRO.ativo&&tipo!=='entrar')return;if(P.escala||P.rola||P.muro||P.nada||P.montado||P.dorme)return;
  P.anim={tipo,t:0,dur:ANIM[tipo].dur,alvo:alvo&&alvo.x!==undefined?{x:alvo.x,z:alvo.z}:null};}
/* mistura alvos {canal:valor} na pose com peso w */
function poseMix(o,alvo,w){if(w<=0)return;for(const k in alvo){const i=+k;o[i]=lerp(o[i],alvo[k],w);}}
const envelope=(t,d,a,b)=>clamp(Math.min(t/(a||0.15),(d-t)/(b||0.18)),0,1);
/* ---------- poses das ações (canais: tronco 3, cabeça 6, braço esq. 9/11, antebraço esq. 12, braço dir. 15/17, antebraço dir. 18, coxas 21/27, joelhos 24/30) ---------- */
const POSE_ABAIXA={3:0.85,6:-0.42,9:-0.3,12:-0.6,15:-0.75,17:0.1,18:-0.2,21:-0.62,24:1.05,27:-0.32,30:0.62};
function poseAcao(o,a,ch){const f=clamp(a.t/a.dur,0,1),w=envelope(a.t,a.dur);let hy=0;
  switch(a.tipo){
    case'coletar':{const b=f<0.5?easeIO(f/0.5):1-easeIO((f-0.5)/0.5);poseMix(o,POSE_ABAIXA,w*b);o[18]=lerp(o[18],-0.2-0.5*smooth(0.4,0.6,f),w*b);hy=-0.2*w*b;break;}
    case'bau':{const b=f<0.4?easeIO(f/0.4):f<0.7?1:1-easeIO((f-0.7)/0.3),lev=smooth(0.35,0.6,f)*(1-smooth(0.75,1,f));
      poseMix(o,{3:0.72-0.12*lev,6:-0.32,9:-0.9-0.35*lev,11:0.05,12:-0.35,15:-0.9-0.35*lev,17:-0.05,18:-0.35,21:-0.6,24:1.05,27:-0.6,30:1.05},w*b);hy=-0.26*w*b;break;}
    case'porta':{const em=smooth(0.15,0.55,f);poseMix(o,{3:0.06+0.1*em,15:-1.35,17:0.12,18:-0.65+0.5*em},w);break;}
    case'botao':{const ap=Math.sin(clamp((f-0.25)/0.5,0,1)*Math.PI);poseMix(o,{15:-1.2,17:0.18,18:-0.95+0.7*ap,6:0.1},w);break;}
    case'fabricar':{const s=Math.sin(a.t*13);poseMix(o,{3:0.28,6:0.25,9:-0.85,11:-0.25,12:-0.95,15:-1.05+0.35*s,17:0.22,18:-0.75-0.3*Math.sin(a.t*13+0.6)},w);break;}
    case'engatar':{const b=f<0.35?easeIO(f/0.35):f<0.7?1:1-easeIO((f-0.7)/0.3);poseMix(o,{3:0.75,6:-0.35,9:-1.0,12:-0.4,15:-1.0,18:-0.4,21:-0.6,24:1.1,27:-0.6,30:1.1},w*b);hy=-0.3*w*b;break;}
    case'sair':{const b=1-easeOut(f);poseMix(o,POSE_SENTADO,b);if(a.de){ch.x=lerp(ch.x,a.de.x,b);ch.z=lerp(ch.z,a.de.z,b);ch.y=lerp(ch.y,a.de.y,b);}break;}
    case'desmontar':{const b=1-easeOut(f);poseMix(o,{3:0.3,21:-0.7,24:1.1,27:-0.4,30:0.8,9:-0.4,15:-0.4},b);if(a.de){ch.x=lerp(ch.x,a.de.x,b);ch.z=lerp(ch.z,a.de.z,b);ch.y=lerp(ch.y,a.de.y,b);}hy=-0.12*b;break;}}
  ch.hipY=(ch.hipY||0)+hy;}
const POSE_SENTADO={3:-0.04,6:0.04,9:-0.92,11:0.12,12:-0.72,15:-0.92,17:-0.12,18:-0.72,21:-1.45,24:1.4,27:-1.45,30:1.4};
/* ---------- camada no animarJogador: transições e ações ---------- */
{const _aj=animarJogador;animarJogador=function(dt){_aj.apply(this,arguments);const o=P.ch.r,ch=P.ch;
  /* inclina ao arrancar e frear; deita na curva */
  const sp=Math.hypot(P.vx||0,P.vz||0),acc=dt>0?(sp-(P._spAnt||0))/dt:0;P._spAnt=sp;P._acc=lerp(P._acc||0,clamp(acc,-12,12),Math.min(1,dt*6));
  const yawR=dt>0?angDiff(P._bodyAnt??P.body,P.body)/dt:0;P._bodyAnt=P.body;
  if(P.noChao&&!P.escala&&!P.rola){o[3]+=clamp(P._acc*0.018,-0.12,0.16);o[6]-=clamp(P._acc*0.009,-0.06,0.08);
    const alvoRoll=sp>1.2?clamp(-yawR*sp*0.012,-0.16,0.16):0;ch.roll=lerp(ch.roll||0,alvoRoll,Math.min(1,dt*6));}
  else ch.roll=lerp(ch.roll||0,0,Math.min(1,dt*6));
  /* pouso: os joelhos dobram conforme a queda */
  const po=clamp((P.pouso||0)*4,0,1);if(po>0.02){poseMix(o,{3:0.28,21:-0.55,24:1.0,27:-0.55,30:1.0},po);ch.hipY=(ch.hipY||0)-0.18*po;}
  /* agachado andando: furtivo, braços na frente */
  const k=P.agK||0;if(k>0.4&&P.amp>0.1)poseMix(o,{9:-0.55,12:-0.95,15:-0.55,18:-0.95},0.65*k*Math.min(1,P.amp*2));
  /* pescando: vara na frente; mordeu, puxa aos trancos; ao lançar, o braço vai atrás e solta */
  if(P.pesca){const p=P.pesca,lan=clamp((p.t||0)/0.5,0,1),jog=lan<1?Math.sin(lan*Math.PI):0,tr=p.mordeu?Math.sin(G.t*18)*0.18:Math.sin(G.t*1.3)*0.03;
    poseMix(o,{3:0.08,15:-1.05-0.9*jog+tr,17:0.15,18:-0.45+0.2*jog,9:-0.85,11:-0.2,12:-0.75},1);if(p.mordeu)o[3]-=0.12;}
  /* ação contextual */
  const a=P.anim;if(a){a.t+=dt;if(a.alvo){const yaw=Math.atan2(a.alvo.x-P.x,a.alvo.z-P.z);P.body=angLerp(P.body,yaw,1-Math.exp(-dt*12));}
    if(a.depois&&a.t>=(a.tDepois||0.3)){const f=a.depois;a.depois=null;f();}
    if(a.t>=a.dur){if(a.depois){const f=a.depois;a.depois=null;f();}if(P.anim===a)P.anim=null;}else poseAcao(o,a,ch);}};}
/* ---------- quem dispara cada ação ---------- */
const ANIM_K={pick:'coletar',bush:'coletar',drop:'coletar',mochila:'coletar',caixaMata:'bau',guarda:'bau',porta:'porta',janela:'porta',portaMad:'porta',alcTampa:'porta',poraoCasa:'porta',
  poraoCasaSobe:'porta',eletr:'botao',painel:'botao',estacao:'fabricar',reboque:'engatar',escadaBaixar:'bau',lamp:'botao',baseObra:'coletar',camaObra:null,cao:null,veic:null};
function animDoAlvo(a){if(!a)return null;const k=a.k,o=a.o;if(k==='inter')return o&&o.kind==='bau'?'bau':o&&o.kind==='bancada'?'fabricar':o&&o.kind==='agua'?'coletar':null;
  if(k==='baseObra'&&o&&OBRAS[o.tipo]&&OBRAS[o.tipo].gerador)return'botao';return ANIM_K[k]||null;}
function alvoPos(a){const o=a&&a.o;if(!o)return null;if(o.x!==undefined)return{x:o.x,z:o.z};if(o.v&&o.v.base)return{x:o.v.base.x,z:o.v.base.z};return null;}
{const _ia=interagir;interagir=function(seg){const a=alvoInter,antes=P.acao;const r=_ia.apply(this,arguments);
  /* toque que vira "segurar" (ou espera soltar) ainda não fez nada: a animação sai quando a ação acontece */
  if(P.acao&&P.acao!==antes&&P.acao.tipo==='revistar'&&!P.acao.done)return r;
  const t=animDoAlvo(a);if(t&&G.modo==='jogo'&&!(P.anim&&P.anim.t===0))animCtx(t,alvoPos(a));return r;};}
{const _us=usarSolta;usarSolta=function(){const ac=P.acao,a=ac&&ac.tipo==='revistar'&&!ac.done?ac.alvo:null;const r=_us.apply(this,arguments);
  if(a&&!P.acao){const t=animDoAlvo(a);if(t&&G.modo==='jogo'&&!(P.anim&&P.anim.t===0))animCtx(t,alvoPos(a));}return r;};}
/* fabricar: depois de fechar a mochila (ou a estação), o personagem trabalha um pouco na bancada */
{const _fb=fabricar;fabricar=function(i,quieto){const r=_fb.apply(this,arguments);if(r)P.animPend='fabricar';return r;};}
{const _ea=estAcao;estAcao=function(id){const st=estAberta;const r=_ea.apply(this,arguments);if(st&&/^proc:|^__|^cav|^m_|^t_|^s_|^tog|^curt/.test(id))P.animPend='fabricar';return r;};}
PASSOS.push(function animPendente(){if(P.animPend&&G.modo==='jogo'){const t=P.animPend;P.animPend=null;let alvo=null,bd=4*4;
  for(const o of OB){const D=OBRAS[o.tipo];if(!D||!(D.estacao||o.tipo==='bancadaTrab'))continue;const d=d2(o.x,o.z,P.x,P.z);if(d<bd){bd=d;alvo=o;}}
  if(!alvo){const b=INTER.find(i=>i.kind==='bancada'&&d2(i.x,i.z,P.x,P.z)<4*4);if(b)alvo=b;}animCtx(t,alvo);}});
/* baú e estações de trabalho: o personagem abaixa (ou estende as mãos) e abre de verdade antes da tela aparecer.
   (nos testes automáticos antigos a tela abre na hora, como antes; os testes novos ligam window.__animAtraso) */
const atrasoAbrir=()=>!(TESTE&&!window.__animAtraso)&&String(cfg.animAbre??1)!=='0';
{const _ab=abrirBau;abrirBau=function(o){if(G.modo!=='jogo'||!atrasoAbrir()||!o||o.x===undefined||(P.anim&&P.anim.depois))return _ab.apply(this,arguments);
  animCtx('bau',o);if(!P.anim||P.anim.tipo!=='bau')return _ab.apply(this,arguments);P.anim.depois=()=>{if(G.modo==='jogo')_ab(o);};P.anim.tDepois=0.34;};}
{const _ae=abrirEstacao;abrirEstacao=function(st){const D=st&&OBRAS[st.tipo];if(G.modo!=='jogo'||!atrasoAbrir()||!D||!D.estacao||st.estTipo==='energia'||(P.anim&&P.anim.depois))return _ae.apply(this,arguments);
  animCtx('fabricar',st);if(!P.anim||P.anim.tipo!=='fabricar')return _ae.apply(this,arguments);P.anim.dur=0.6;P.anim.depois=()=>{if(G.modo==='jogo')_ae(st);};P.anim.tDepois=0.3;};}
{const _am=abrirMochila;abrirMochila=function(aba){const a=alvoInter;if(aba==='fabricar'&&G.modo==='jogo'&&atrasoAbrir()&&a&&a.k==='inter'&&a.o&&a.o.kind==='bancada'&&!(P.anim&&P.anim.depois)){
    animCtx('fabricar',a.o);if(P.anim&&P.anim.tipo==='fabricar'){P.anim.dur=0.6;P.anim.depois=()=>{if(G.modo==='jogo')_am('fabricar');};P.anim.tDepois=0.3;return;}}return _am.apply(this,arguments);};}
/* ---------- veículos: entra e sai com animação; dirigindo, aparece sentado ---------- */
/* onde fica o quadril de quem dirige (no espaço do veículo) e a pose */
const MOTORISTA={caminhonete:{pose:'carro',h:[0.42,0.86,0.12]},sedan:{pose:'carro',h:[0.38,0.5,-0.18]},moto:{pose:'moto',h:[0,1.1,-0.2]},triciclo:{pose:'moto',h:[0,1.07,-0.22]},
  barco:{pose:'leme',h:[0,0.76,-1.55]},jangada:{pose:'remo',h:[0,0.5,-0.3]},heli:{pose:'carro',h:[0.4,1.02,1.05]}};
function motoristaVisivel(){return!!(CARRO&&CARRO.ativo&&P.alive&&cfg.cam!=='1'&&camDist>0.75&&MOTORISTA[CARRO.tipo]);}
function poseMotorista(o,v,dt){const T=VT(v),tipo=(MOTORISTA[v.tipo]||{}).pose||'carro',st=v.steer||0;o.fill(0);poseMix(o,POSE_SENTADO,1);
  if(tipo==='carro'){o[15]+=-0.05+st*0.12;o[9]+=-0.05-st*0.12;o[17]=-0.15-st*0.1;o[11]=0.15-st*0.1;}
  else if(tipo==='moto'){poseMix(o,{3:0.35,6:-0.25,9:-0.95,11:0.2,12:-0.35,15:-0.95,17:-0.2,18:-0.35,21:-1.05,22:0,23:0.32,24:1.35,27:-1.05,29:-0.32,30:1.35},1);o[3]+=Math.min(0.15,Math.abs(v.v)*0.01);}
  else if(tipo==='leme'){poseMix(o,{15:-0.35,17:-0.45,18:-0.6,9:-0.2,12:-0.4},1);}
  else if(tipo==='remo'){const s=Math.sin(G.t*3.4)*Math.min(1,Math.abs(v.v)/1.5+Math.abs(IN.mz||0));poseMix(o,{3:0.25+0.15*s,9:-1.2-0.5*s,12:-0.6,15:-1.2+0.5*s,18:-0.6},1);}}
{const _up=updatePlayer;updatePlayer=function(dt){const r=_up.apply(this,arguments);if(P.alive&&CARRO&&CARRO.ativo){const v=CARRO,T=VT(v),ch=P.ch,a=T.assento||[0,1.3,0];
    const M=MOTORISTA[v.tipo],h=M&&M.h?carroLocal(M.h[0],M.h[1],M.h[2],v):carroLocal(a[0],a[1]-0.78,a[2]-0.12,v),hip=ch.sk&&ch.sk.t&&ch.sk.t.pronto?ch.sk.t.hip*(ch.s||1):(ch.bones&&ch.bones[0]?ch.bones[0].o[1]*(ch.s||1):0.95);
    ch.x=h[0];ch.z=h[2];ch.y=h[1]-hip;ch.yaw=v.yaw;ch.pitch=v.pitch||0;ch.roll=v.roll||0;poseMotorista(ch.r,v,dt);ch.hipY=0;
    const e=P.anim&&P.anim.tipo==='entrar'?P.anim:null;if(e){e.t+=dt;const f=clamp(e.t/e.dur,0,1),b=1-easeOut(f);if(e.de){ch.x=lerp(ch.x,e.de.x,b);ch.z=lerp(ch.z,e.de.z,b);ch.y=lerp(ch.y,e.de.y,b);}
      const o=ch.r,B=new Float32Array(36);poseLoco(B,0,0,G.t,false);for(let i=0;i<36;i++)o[i]=lerp(o[i],B[i],b);if(e.t>=e.dur)P.anim=null;}}return r;};}
{const _ev=entrarVeic;entrarVeic=function(v){const de={x:P.x,y:P.y,z:P.z};const r=_ev.apply(this,arguments);if(v&&CARRO===v&&v.ativo)P.anim={tipo:'entrar',t:0,dur:ANIM.entrar.dur,de};return r;};}
{const _sc=sairCarro;sairCarro=function(){const era=CARRO&&CARRO.ativo,ch=P.ch,de=era&&motoristaVisivel()?{x:ch.x,y:ch.y,z:ch.z}:null;const r=_sc.apply(this,arguments);if(era&&CARRO&&!CARRO.ativo)P.anim={tipo:'sair',t:0,dur:ANIM.sair.dur,alvo:null,de};return r;};}
/* ---------- cavalo: monta passando a perna por cima; desce pisando no chão ---------- */
{const _pm=poseMontado;poseMontado=function(h,dt){_pm.apply(this,arguments);const t=P.mtT||0;if(t<0.6){const o=P.ch.r,f=clamp(t/0.6,0,1),b=1-easeOut(f),lev=Math.sin(f*Math.PI);
    o[27]=lerp(o[27],-1.6,lev*0.8);o[29]=lerp(o[29],-0.7,lev);o[30]=lerp(o[30],0.6,lev*0.6);o[3]=lerp(o[3],0.45,b);o[9]=lerp(o[9],-1.1,b);o[15]=lerp(o[15],-1.1,b);}};}
{const _dc=descerDoCavalo;descerDoCavalo=function(forcado){const h=P.montado,de=h?{x:P.ch.x,y:P.ch.y,z:P.ch.z}:null;const r=_dc.apply(this,arguments);if(de&&!forcado){P.anim={tipo:'desmontar',t:0,dur:ANIM.desmontar.dur,alvo:null,de};}return r;};}
/* ---------- primeira pessoa: a mão acompanha a ação ---------- */
{const _vm=viewModel;viewModel=function(o){const id=_vm.apply(this,arguments);const a=P.anim;if(!a||cfg.cam!=='1')return id;const f=clamp(a.t/a.dur,0,1),w=envelope(a.t,a.dur);let dx=0,dy=0,dz=0;
  switch(a.tipo){case'coletar':{const b=f<0.5?easeIO(f/0.5):1-easeIO((f-0.5)/0.5);dy=-0.32*b;dz=-0.12*b;dx=-0.05*b;break;}
    case'bau':case'engatar':{const b=f<0.4?easeIO(f/0.4):f<0.7?1:1-easeIO((f-0.7)/0.3);dy=-0.28*b+0.12*smooth(0.4,0.65,f)*(1-smooth(0.75,1,f));dz=-0.1*b;break;}
    case'porta':dz=-0.28*smooth(0.1,0.55,f)*w;dx=-0.06*w;break;
    case'botao':dz=-0.22*Math.sin(clamp((f-0.2)/0.6,0,1)*Math.PI);break;
    case'fabricar':dy=0.07*Math.sin(a.t*13)*w-0.08*w;dz=-0.05*w;break;}
  o[12]+=dx;o[13]+=dy;o[14]+=dz;return id;};}
/* ---------- render: o motorista sentado aparece em terceira pessoa (50_render chama motoristaVisivel) ---------- */
/* ajuste: abrir baú e bancada na hora (sem a animação antes) */
{const _aj=ajustesUI;ajustesUI=function(){const r=_aj.apply(this,arguments);const el=$('aj-animabre');if(el)el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===String(cfg.animAbre??1))));return r;};
  const el=$('aj-animabre');if(el)el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cfg.animAbre=+b.dataset.v;saveCfg();ajustesUI();sfx('clique');});}
/* ajuda */
{const p=document.querySelector('#t-ajuda [data-e18p]');if(p&&!document.querySelector('#t-ajuda [data-e19p]'))p.insertAdjacentHTML('afterend','<p data-e19p>Animações: o personagem abaixa para pegar coisas do chão, abaixa e levanta a tampa do baú, empurra portas, aperta interruptores e trabalha na bancada depois de fabricar. Dirigindo, aparece sentado com as mãos no volante (na moto, inclinado no guidão); monta no cavalo passando a perna por cima. Em primeira pessoa, a mão acompanha. Nos Ajustes dá para abrir o baú e a bancada na hora, sem a animação.</p>');}
