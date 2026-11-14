/* ================= Sobrevivente: o personagem realista do jogador (12/11/2026) =================
   O corpo do jogador passa a ser o sobrevivente (male_survivor1: barba grisalha, sem camisa, calça jeans e botas), com pele
   de 22 ossos montada em tools/sobrevivente_rig.py e as animações do Mixamo dele (21j_sobrevivente_dados.js).
   · As poses do jogo continuam por baixo: tudo o que já existia (mirar, golpear, segurar ferramenta, nadar, escalar, dirigir,
     montar, rolar, pular muro, ações de contexto, morrer) continua igual. Os clipes entram por cima só quando o corpo está
     livre, com mistura; com algo na mão, os braços ficam com a pose do jogo (a arma aponta como antes) e as pernas e o
     tronco andam com o clipe; mirando, o tronco e a cabeça também ficam com o jogo.
   · Locomoção pela velocidade de verdade: parado (respira e troca de apoio), andando (frente, de costas, de lado),
     correndo e em disparada; agachado parado e andando; ferido (vida baixa ou perna machucada) parado e mancando; pulo,
     caindo e queda forte (quando a queda machuca). O passo do clipe segue a velocidade do corpo (os pés não escorregam).
   · Roupas viram cascas sobre o corpo (como no Akai); a bermuda do começo não aparece porque ele já está de calça.
   · Configuração "personagem": 'sobrevivente' (padrão) ou 'classico' (o boneco antigo, com as opções da tela de criação). */
const SURV={fase:0,faseP:0,ar:0,pulo:-1,queda:-1,estado:'',w:{},vel:0};
const SURV_ALT=1.74;          // altura dele com a altura do meio da criação (o dono achou o de 1,82 m grande demais)
const SURV_LOCO=['sAnda','sAndaTras','sLadoE','sLadoD','sCorre','sDispara','sAgachadoAnda','sFeridoAnda'];
/* cascas de roupa sobre o corpo dele: subconjunto da malha, quanto incha (m), cor e pelo */
const SURV_CASCAS={
  camiseta:[{sub:'troncoCurto',inf:0.007,cor:0x7c8590,pelo:0}],
  camisaLeve:[{sub:'mangaLonga',inf:0.008,cor:0x2f3742,pelo:0}],
  camisaCouro:[{sub:'troncoCurto',inf:0.009,cor:0x8a5a36,pelo:0},{sub:'gola',inf:0.014,cor:0x5a3820,pelo:0}],
  colete:[{sub:'troncoCurto',inf:0.022,cor:0x3d4430,pelo:0}],
  casacoPele:[{sub:'troncoLongo',inf:0.017,cor:0x7a5638,pelo:0.25},{sub:'golaLonga',inf:0.028,cor:0xd6c29c,pelo:1}],
  casacoGrande:[{sub:'troncoLongo',inf:0.016,cor:0x6c4b2f,pelo:0}],
  calcaCouro:[{sub:'pernas',inf:0.008,cor:0x6b4a30,pelo:0}],
  calcaCargo:[{sub:'pernas',inf:0.008,cor:0x5b5a43,pelo:0}],
  botasCouro:[{sub:'pes',inf:0.012,cor:0x5a3a24,pelo:0}],
  botasTrilha:[{sub:'pes',inf:0.012,cor:0x4a3b2c,pelo:0}],
  gorroPele:[{sub:'cabeca',inf:0.026,cor:0x8c6b4a,pelo:0.55},{sub:'cabecaAba',inf:0.036,cor:0xd6c29c,pelo:1}],
  bone:[{sub:'cabeca',inf:0.02,cor:0x2b3a55,pelo:0}],
  luvasCouro:[{sub:'maos',inf:0.007,cor:0x5a3e28,pelo:0}],
  cinto:[{sub:'cinto',inf:0.012,cor:0x3a2a1c,pelo:0}],
  cinturaoExploracao:[{sub:'cinto',inf:0.02,cor:0x3b3a2c,pelo:0}]};
function survLigado(){return typeof SKT!=='undefined'&&!!SKT.surv&&SKT.surv.pronto&&!(cfg&&cfg.personagem==='classico')&&G.modo!=='criacao';}
/* troca o corpo do jogador (e volta para o clássico se a configuração mudar) */
function survAplicar(){const ch=P.ch;if(!ch)return;const quer=survLigado(),ap=MESH.jogador&&MESH.jogador.ap;
  if(quer&&!ch.surv){ch.sk=skNovo(SKT.surv);ch.proc=false;ch.surv=true;ch.procOmbro=0;SKT.surv.cascas=SURV_CASCAS;SURV.estado='';}
  else if(!quer&&ch.surv){ch.sk=skNovo(SKT.akai);ch.proc=true;ch.surv=false;ch.procOmbro=ap?APAR.portes[ap.porte].ombro:0;ch.s=ap?APAR.alturas[ap.altura]:1;}
  if(ch.surv)ch.s=(ap?APAR.alturas[ap.altura]:1)*SURV_ALT/(SKT.surv.alt||1.82);}
{const _aa=aplicarAparencia;aplicarAparencia=function(){const r=_aa.apply(this,arguments);try{if(P.ch)P.ch.surv=false;survAplicar();}catch(e){console.error('sobrevivente',e);}return r;};}
/* a pele dele no braço da primeira pessoa (o tom da textura) */
{const _bf=bracoFPMesh;bracoFPMesh=function(){const J=MESH.jogador;if(!P.ch||!P.ch.surv||!J||!J.spec)return _bf.apply(this,arguments);
  const c=J.spec.c.skin;J.spec.c.skin=0xb07c5c;const k0=J.bracos;J.bracos=J.bracosSurv||(J.bracosSurv={});try{return _bf.apply(this,arguments);}finally{J.spec.c.skin=c;J.bracos=k0;}};}

/* ---------- mistura de clipes ---------- */
const _SA=new Float32Array(SK_N*4),_SH=[0,0,0];
function survZerar(L){L.n=0;L.hy=0;L.hx=0;L.hz=0;}
/* soma o clipe nome no tempo t com peso w na pose L (média por nlerp acumulado) */
function survSoma(L,nome,t,w){const a=SKA[nome];if(!a||w<=0.001)return;skAmostra(a,t,_SA,_SH);L.n+=w;const k=w/L.n;
  if(k>=0.999){L.D.set(_SA);}else for(let b=0;b<SK_N;b++)qnlerp(L.D,b*4,L.D,b*4,_SA,b*4,k);
  L.hy=lerp(L.hy,_SH[1],k);L.hx=lerp(L.hx,_SH[0],k);L.hz=lerp(L.hz,_SH[2],k);}
const survDur=n=>SKA[n]?SKA[n].dur:1;
/* distância de um ciclo (2 passos) na velocidade natural do clipe, na escala do Akai */
function survCiclo(n){const c=SKCLIP[n],v=c&&c.vel?Math.hypot(c.vel[0],c.vel[2]):1.2;return Math.max(0.4,v*survDur(n));}

/* ---------- estado do corpo a cada quadro ---------- */
function survLoco(ch,dt){const s=ch.sk;
  if(!s.loco)s.loco={D:new Float32Array(SK_N*4),m:new Float32Array(SK_N).fill(1),w:0,hy:0,hx:0,hz:0,hyJogo:0,n:0};
  const L=s.loco;
  const livre=(P.alive||G.modo==='criacao')&&!(CARRO&&CARRO.ativo)&&!P.montado&&!P.nada&&!P.escala&&!P.muro&&!P.rola&&!P.dorme&&!P.anim&&!(P.ch.sk.clip&&P.ch.sk.cwAlvo>0);
  L.w=approach(L.w,livre?1:0,dt*(livre?5:9));
  if(L.w<=0.001){SURV.estado='';return;}
  const esc=s.t.hip/SKT.akai.hip,sp=Math.hypot(P.vx||0,P.vz||0)/(ch.s||1)/esc;     // velocidade na escala do Akai
  const b=P.body??P.yaw,fr=(P.vx*Math.sin(b)+P.vz*Math.cos(b))/(ch.s||1)/esc,lat=(P.vx*Math.cos(b)-P.vz*Math.sin(b))/(ch.s||1)/esc;
  const ferido=(P.vida<28)||(typeof pernaRuim==='function'&&pernaRuim());
  // no ar: pulo (uma vez) e depois caindo; pouso forte (a queda machucou): queda
  // no palco da criação o corpo não tem física: conta como no chão (sem isso ele "caía" parado no ar)
  const voando=!!P.voo&&!P.noChao;   // v10.2.2: voo do modo criativo, corpo de pé (o 62_criativo.js inclina para a frente)
  const chao=P.noChao||G.modo==='criacao'||voando;
  if(!chao){SURV.ar+=dt;if(SURV.pulo>=0)SURV.pulo+=dt;}else{SURV.ar=0;SURV.pulo=-1;}
  if(SURV.queda>=0){SURV.queda+=dt;if(SURV.queda>survDur('sQueda')-0.05||(SURV.queda>0.9&&sp>0.6))SURV.queda=-1;}
  survZerar(L);let estado;
  if(voando){estado='voando';SURV.queda=-1;survSoma(L,'sParado',(SURV.faseP+=dt)%survDur('sParado'),1);}
  else if(SURV.queda>=0){estado='queda';survSoma(L,'sQueda',SURV.queda,1);}
  else if(!chao&&SURV.pulo>=0&&SURV.pulo<survDur('sPulo')*0.55){estado='pulo';survSoma(L,'sPulo',0.1+SURV.pulo,1);}
  else if(!chao&&SURV.ar>0.28){estado='caindo';SURV.faseP+=dt;survSoma(L,'sCaindo',SURV.faseP%survDur('sCaindo'),1);}
  else{
    // no chão (ou acabou de sair dele): parado e passos misturados pela velocidade e pela direção
    const ag=P.agachado,nP=ag?'sAgachado':ferido?'sFeridoParado':(P.energia<25||SURV.cansado>0?'sRespira':'sParado');
    const wMov=smooth(0.18,0.75,sp);
    let lista;
    if(ag)lista=[['sAgachadoAnda',1]];
    else if(ferido)lista=[['sFeridoAnda',1]];
    else{const ang=Math.atan2(lat,fr),af=Math.abs(ang);
      // direção: frente, lados e costas (mistura entre as duas mais perto)
      const wF=clamp(1-af/(Math.PI/2),0,1),wT=clamp((af-Math.PI/2)/(Math.PI/2),0,1),wL=1-wF-wT,lado=ang>0?'sLadoE':'sLadoD';
      // ritmo: andar até 1,9 m/s, correr até 4,8, disparada acima (o "andar" normal do jogo é 3,7 m/s: sai um trote)
      const wRun=smooth(1.6,3.0,sp),wSpr=smooth(4.6,5.8,sp),fw=wF*(1-wRun),fr_=wF*wRun*(1-wSpr),fs=wF*wRun*wSpr;
      lista=[['sAnda',fw],['sCorre',fr_],['sDispara',fs],[lado,wL*(1-wRun*0.5)],['sCorre',wL*wRun*0.5],['sAndaTras',wT]];}
    // fase única dos passos: avança pela distância andada sobre a distância do ciclo misturado
    let soma=0,ciclo=0;for(const[n,w]of lista){if(w<=0)continue;soma+=w;ciclo+=w*survCiclo(n);}ciclo=soma>0?ciclo/soma:1;
    SURV.fase=(SURV.fase+dt*Math.max(sp,0.35)/ciclo)%1;
    survSoma(L,nP,(SURV.faseP+=dt)%survDur(nP),1-wMov);
    for(const[n,w]of lista)if(w>0.001)survSoma(L,n,SURV.fase*survDur(n),wMov*w/Math.max(soma,1e-6));
    estado=sp<0.18?'parado':ag?'agachado':ferido?'ferido':sp>4.6?'disparada':sp>2?'correndo':'andando';}
  // pouso: o corpo afunda um pouco (o mesmo do jogo)
  if(P.pouso>0)L.hy-=P.pouso*1.1;
  SURV.estado=estado;
  // máscara: com algo na mão (ou mirando, golpeando, usando) os braços ficam com a pose do jogo
  const d=selDef(),acao=P.acao&&P.acao.tipo,mira=(P.aim||0)>0.25||acao==='arco'||acao==='golpe'||acao==='mirar';
  // v10.2.2: só o que aparece na mão (arma, ferramenta, lanterna, pedra...) usa os braços da pose do jogo. Antes qualquer coisa
  // escolhida (chave, mapa, bilhete, utensílio sem modelo) também usava, e os braços ficavam tortos segurando nada.
  const sid=selItem()?selItem().id:null,naMao=!!(d&&sid&&MESH.arma&&MESH.arma[sid]&&(d.tipo==='arma'||d.mao));
  const maoCheia=naMao||!!acao;
  for(let i=0;i<SK_N;i++)L.m[i]=1;
  if(maoCheia&&estado!=='queda')for(let i=SKI.LeftShoulder;i<=SKI.RightHand;i++)L.m[i]=0;
  if(mira&&estado!=='queda')for(const i of[SKI.Spine1,SKI.Spine2,SKI.Neck,SKI.Head])L.m[i]=0.15;
  L.hyJogo=0;}
{const _sp=skPose;skPose=function(ch,dt){if(ch===P.ch){try{if(ch.surv!==survLigado())survAplicar();if(ch.surv)survLoco(ch,dt);}catch(e){console.error('sobrevivente',e);}}return _sp.apply(this,arguments);};}
/* pulo: marca a saída do chão (o clipe começa no agachar); pouso forte: queda com as mãos no chão */
{const _pl=pular;pular=function(){const ant=P.vy;const r=_pl.apply(this,arguments);if(P.vy>4&&ant<=4)SURV.pulo=0;return r;};}
{const _po=pousar;pousar=function(chao){const imp=-P.vy;const r=_po.apply(this,arguments);if(P.ch&&P.ch.surv&&imp>ESC_CFG.danoQueda-1.5)SURV.queda=0;return r;};}
/* depois de correr muito: respira ofegante parado por um tempo */
PASSOS.push(function survCansaco(dt){if(!P.ch||!P.ch.surv)return;SURV.cansado=Math.max(0,(SURV.cansado||0)-dt);if(P.correndo&&P.energia<40)SURV.cansado=6;});
/* ajuste "Personagem" (vai para a seção Jogo): o sobrevivente realista ou o boneco clássico da tela de criação */
{const ok=$('aj-ok');if(ok&&!$('aj-personagem'))ok.insertAdjacentHTML('beforebegin','<div class="opcao" id="aj-personagem-l"><span class="rot">Personagem</span><div class="segs" id="aj-personagem"><button type="button" data-v="sobrevivente">Sobrevivente realista</button><button type="button" data-v="classico">Clássico (da criação)</button></div></div>');
 const el=$('aj-personagem');if(el)el.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;sfx('clique');cfg.personagem=b.dataset.v;saveCfg();survMarcaAjuste();});}
function survMarcaAjuste(){const el=$('aj-personagem');if(el)el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===(cfg.personagem||'sobrevivente'))));}
{const _a=ajustesUI;ajustesUI=function(){const r=_a.apply(this,arguments);try{survMarcaAjuste();}catch(e){}return r;};}
