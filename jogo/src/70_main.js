/* ================= laço principal e início ================= */
lootDepois();   // saques que esperavam tabelas de módulos posteriores (ver 39_v8.js)
let last=0,perfAcc=0,perfN=0,perfDone=false,perfOk=0,menuT=0,glPerdido=false,cursorJogo=false,modoAntes='menu';
function frame(now){const dt=Math.min(0.05,Math.max(0,(now-last)/1000)||0.016);last=now;if(glPerdido){requestAnimationFrame(frame);return;}const TF0=performance.now();
  try{
  // mouse: some no jogo (preso na tela ou girando a câmera sem trava) e aparece em qualquer painel; ao voltar de um painel, prende de novo
  {const tr=document.pointerLockElement===canvas,cj=G.modo==='jogo'&&cfg.tela==='pc'&&(tr||semTrava||lockPedido);if(cj!==cursorJogo){cursorJogo=cj;document.body.classList.toggle('sem-cursor',cj);}
   if(tr&&G.modo!=='jogo')document.exitPointerLock();
   if(G.modo!==modoAntes){if(G.modo==='jogo')pedirTrava();modoAntes=G.modo;}}
  if(G.modo==='jogo'||G.modo==='morto'){
    /* testes automáticos: __turbo roda vários passos de simulação por quadro e __semRender pula o desenho */
    const tb=Math.max(TESTE?(window.__turbo|0):0,G.dormindo?G.dormindo.k:0);for(let i=1;i<tb&&(G.modo==='jogo'||G.modo==='morto');i++)passoJogo(0.05);
    let dts=dt;if(G.hitstop>0){G.hitstop-=dt;dts=dt*0.12;}   // impacto do golpe: o tempo quase para por um instante
    if(typeof lerControle==='function')lerControle(dt);
    const T0=performance.now();const horda=passoJogo(dts);const T1=performance.now();
    grassT-=dt;if(grassT<=0){grassT=0.6;rebuildGrass();vegT=0;}rebuildVeg();const T2=performance.now();
    updateCamera(dt);if(!(TESTE&&window.__semRender)&&!G.dormindo){render();if(TESTE&&window.__perfSync)gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,PX_SYNC);}const T3=performance.now();updateHUD(dt,horda);audioAmbiente(dt);const T4=performance.now();
    if(TESTE){const pf=window.__perf||(window.__perf={passo:0,veg:0,render:0,hud:0,n:0});pf.passo+=T1-T0;pf.veg+=T2-T1;pf.render+=T3-T2;pf.hud+=T4-T3;pf.n++;}
    // rodando pesado (abaixo de uns 40 quadros por segundo): primeiro baixa a resolução, depois um degrau dos gráficos (se a pessoa não escolheu nos Ajustes);
    // confere de novo até ficar liso três vezes seguidas
    if(!perfDone&&G.t>3){perfAcc+=dt;perfN++;if(perfN>=90){const avg=perfAcc/perfN;perfAcc=0;perfN=0;
      if(avg>0.024&&dpr>1&&(cfg.res||"auto")==="auto"){dpr=Math.max(1,dpr-0.25);resize();perfOk=0;}
      else if(avg>0.025&&!TESTE&&!cfg.grafManual&&cfg.graf!=='baixo'){const ord=['baixo','medio','alto','ultra'];cfg.graf=ord[Math.max(0,ord.indexOf(cfg.graf)-1)];aplicarCfg();perfOk=0;
        feed('Gráficos ajustados para '+({baixo:'Baixo',medio:'Médio',alto:'Alto'}[cfg.graf])+' para rodar mais liso');}
      else if(++perfOk>=3)perfDone=true;}}}
  else if(G.modo==='menu'||G.modo==='carregando'){G.t+=dt;menuT+=dt;computeEnv();updateZombies(dt);updateFx(dt);
    const a=menuT*0.035+2.2;cam.pos=[Math.sin(a)*24,10+Math.sin(menuT*0.1)*1.5,Math.cos(a)*24-3];cam.tgt=[0,1.2,-4];cam.fov=W/H>=1?0.9:1.2;
    cam.fwd=norm([cam.tgt[0]-cam.pos[0],cam.tgt[1]-cam.pos[1],cam.tgt[2]-cam.pos[2]]);cam.right=norm([-cam.fwd[2],0,cam.fwd[0]]);
    cam.up=[cam.right[1]*cam.fwd[2]-cam.right[2]*cam.fwd[1],cam.right[2]*cam.fwd[0]-cam.right[0]*cam.fwd[2],cam.right[0]*cam.fwd[1]-cam.right[1]*cam.fwd[0]];if(!(TESTE&&window.__semRender))render();}
  else if(G.modo==='criacao')criacaoQuadro(dt);
  else{if(G.modo==='foto')fotoCam(dt);G.t+=dt*0.5;computeEnv();if(!(TESTE&&window.__semRender))render();if(AU.ctx)musica(dt);}
  }catch(err){console.error(err);}
  if(TESTE&&window.__perf){window.__perf.total=(window.__perf.total||0)+performance.now()-TF0;}
  requestAnimationFrame(frame);}
const TESTE=location.hash.startsWith('#teste');if(TESTE)window.__bootFeito=false;   // os testes (run.py) esperam a montagem do mundo terminar
if(location.hash.includes('rapido')){window.__semRender=true;window.__turbo=6;}
let contT=0;
function passoJogo(dt){G.t+=dt;if(TESTE&&window.__cadaPasso)window.__cadaPasso(dt);updateClock(dt);computeEnv();updatePlayer(dt);updateCarro(dt);updateBichos(dt);updateCao(dt);updateOlhos(dt);updateVulto(dt);updateSustosMata(dt);updateCaixas(dt);updateLanterna(dt);
  updateEnergia(dt);updateAlarme(dt);updateInfestacao(dt);updateHordas(dt);updateAtracao(dt);updateFumaca(dt);updateChegada(dt);updateManchas(dt);contT-=dt;if(contT<=0){contT=2;updateConts();}const horda=updateZombies(dt);updateSobrev(dt);updateArmas2(dt);updateChefe(dt);updateAmbiente(dt);updateBase(dt);updateZumbis2(dt);updateArmas3(dt);updateLesoes(dt);updateEfeitos(dt);updateHistoria(dt);passosNovos(dt);updateFx(dt);if(OBRA.ativo)obraAlvo();
  G.salvarT-=dt;if(G.salvarT<=0&&G.modo==='jogo')salvarJogo();return horda;}
function cenaMenu(){G.hora=20.9;P.alive=false;P.x=SPAWN[0];P.z=SPAWN[1];P.y=ground(P.x,P.z);
  for(const a of BARRICADE_ARC.angs){const p=a*Math.PI/180;criarObra('barricada',BARRICADE_ARC.r*Math.sin(p),-BARRICADE_ARC.r*Math.cos(p),-p);}criarObra('portao',0,-BARRICADE_ARC.r,0);
  for(let i=0;i<6;i++){const a=-Math.PI/2+(i-2.5)*0.25,r=26+Math.random()*10;criarZ(i===2?'brute':i===4?'screamer':'walker',Math.cos(a)*r,Math.sin(a)*r,{noturno:true,st:'marcha'});}
  P.ch.x=P.x;P.ch.z=P.z;P.ch.y=P.y;P.ch.yaw=Math.PI;poseLoco(P.ch.r,0,0,0,false);}
/* a montagem do mundo vai por etapas (13/11/2026): a tela de carregamento (69_carregamento.js) anda entre uma e outra */
async function boot(){body.dataset.tela=cfg.tela;
  try{dpr=Math.min(window.devicePixelRatio||1,GRAF[cfg.graf].dpr);initGL();if(!GRAF[cfg.graf])cfg.graf='alto';if(cfg.graf==='ultra'&&!cfg.grafManual)cfg.graf='alto';if(GRAF[cfg.graf].sombra&&(GRAF[cfg.graf].sombra!==SHADOW.size||!!GRAF[cfg.graf].casc!==SHADOW.casc))makeShadow(GRAF[cfg.graf].sombra,!!GRAF[cfg.graf].casc);await montarMundoPorEtapas(cargaProgresso);}
  catch(e){console.error(e);$('falha').hidden=false;$('t-titulo').hidden=true;if(TESTE)window.__bootFeito=true;return;}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(glPerdido)return;glPerdido=true;
    try{if(G.modo==='mochila')fecharMochila();if(G.modo==='jogo'||G.modo==='pausa'){salvarJogo();try{sessionStorage.setItem('nnc_voltar','1');}catch(_){}}}catch(_){}
    const f=$('falha');f.innerHTML='O vídeo do navegador reiniciou. Seu jogo foi salvo.<br><button class="btn prim" type="button" id="falha-ok" style="margin-top:12px">Continuar</button>';f.hidden=false;$('falha-ok').onclick=()=>location.reload();});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  mapCtx=mapC.getContext('2d');resize();cenaMenu();computeEnv();rebuildVeg(true);rebuildGrass();aplicarCfg();
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.modo==='jogo')pausar();});
  const hot=window.claude&&window.claude.hot;
  try{if(hot&&typeof hot.snapshot==='function')hot.snapshot(()=>({jogando:G.modo==='jogo'||G.modo==='pausa'}));}catch(_){}
  let volta=false;try{volta=sessionStorage.getItem('nnc_voltar')==='1';sessionStorage.removeItem('nnc_voltar');}catch(_){}
  const voltar=((hot&&hot.data&&hot.data.jogando)||volta)&&temSave();
  cargaPronto();if(TESTE)window.__bootFeito=true;
  last=performance.now();requestAnimationFrame(frame);
  if(voltar&&carregarJogo()){jogar();return;}
  setTimeout(()=>{if(G.modo==='carregando')mostrarMenu();},900);}
if(location.hash.startsWith('#teste'))window.__nnc={ev:s=>eval(s),pausar,missaoInfoT:missaoInfo,CONQ,CQ,conquista,conqEvento,conqAmanhece,salvarRecorde,melhorRecorde,abrirConquistas,conqRender,fotoAbrir,fotoFechar,fotoTirar,fotoUI,FOTO,placarOnlineInit,get conqAba(){return conqAba;},set conqAba(v){conqAba=v;},capAjuste,histInfo,histMontarPontos,HIST_PONTOS,centrifugaUsar,histAmanhece,ondaBase,BASEM,geradorBaseObra,histVacina,baseMilitarObras,updateHistoria,histLab,recarregar,vidaMax,virusNivel,impactoJogador,telaSangue,MANCHAS,marcarFerida,poca,CAPACETES,lesao,lesaoMordida,curaLesoes,updateLesoes,usarItem,lesaoVel,pernaRuim,BOMBAS,ISCAS,explosao,lunetaAtiva,tiroHit,atirarEsp,aterrissar,lancarMolotov,GRAF,FOLHAS,SOBREV,GAS,VOMITOS,CHEFES_R,zCorpo,gasNuvem,estourarInchado,explodirGas,updateChefesR,lugarChefeR,chefeRNascer,ondaCaes,popularDia2,tipoCidade2,ouvirBoatoChefe,raySeg,zArmadura,CHEFE_R_DEF,get ZHIT(){return ZHIT;},set ZHIT(v){ZHIT=v;},atirar,updateBase,baseInteragir,baseTexto,colherHortas,arameZumbi,TORRE_H,colheita,ganhar,LOOT,criarObraT:criarObra,SOB_DEF,sobrevFalar,abrirGrupo,fecharGrupo,grupoTarefa,sobrevAmanhece,sobrevSaem,sobrevVoltam,depositarBase,bausBase,ferirSobrev,contarBase,criarChefe,chefeVivo,CHEFE,ZS,FLOG,rolar,FLECHAS,CHAMAS,ARREMESSOS,ARCO_POSE,pontoMira,quebrarMolotov,acender,selecionar,hudBarra,aplicarCfg,E,rolar,alvoMuro,comecarMuro,ferirJogador,pular,SKA,SKT,FIRE,SPAWN,camDistGet:()=>camDist,COLL,CGRID,PART,NOISE,DROPS,RINGS,EMBERS,SMOKE,OLHOS,SGRID,INTER,bairroEm,BAIRROS,predioCasa,updatePostos,pular,ferirZ,elevadorVias,elevadorAcordar,alcapaoAbrir,entulhoRemover,fumacaApagar,painelExaminar,observarCidade,updateFumaca,dividirHorda,juntarHordas,updateHordas,rotaRuas,noRua,tamHorda,vedadoEm2,cidSurto,barulho,contextoObra,renascer,dormirAqui,janelaTapada,navRota,navProximo,zonaDe,nivelInfestacao,nascerCidade,updateInfestacao,hordaNova,enxerga,cidNovo,cidSalvar,cidCarregar,abrirCont,portaUsar,portaEstado,danoPorta,pularJanela,geradorUsar,golpePorta,naAgua,CID_LOOT,sortearTab,get bau(){return bauAberto;},CID,salaEm,interiorEm,tetoEm,BURACOS,obraAlvo,apoioPlat,alvoPonte,alvoPlat,alvoBorda,obrasVisiveis,lugarAlto,escadaRecolher,lampAlternar,revalidarPlats,destruirObra,serializar,FIRES,interagir,set alvo(v){alvoInter=v;},GIGANTES,VIAS,SUPS,SAMAMBAIAS,TRONCOS,viaPerto,comecarEscalada,chaoEm,ground,CAIXAS,CAIXA_CFG,CAIXA_LOOT,sortearConteudo,chancesEfetivas,updateCaixas,caixasCarregar,caixasSalvar,abrirCaixaMata,acharLugar,lugarCaixaValido,dentroRegiao,usarUtil,lanternaForte,custoObra,zLevantar,VULTO,SINISTROS,consertar,desmontar,melhorarBancada,acharManual,receitaEstado,custoConserto,retornoDesmonte,obraLiberada,custoReceita,podeFabricar,rollLoot,inicioDia,colocarObra,modoObra,invLimite,BENCH,revistar:id=>{const o=INTER.find(i=>i.id===id);alvoInter={k:'inter',o};interagir(true);},MESH,ZMESH,fabricar,vestir,tirarRoupa,protecao,calorRoupa,comFrio,ferirBicho,RECIPES,abrirMochila,CAO,caoInicio,entrarCarro,sairCarro,ferirCao,caoAmanhece,destruirObra,OBRAS,BICHOS,criarBicho,DROPS2:()=>DROPS,CARRO,AU,IN,G,P,Z,OB,INTER,TREES,ROCKS,DROPS,ITEMS,invAdd,criarZ,cfg,OBRA,interAtual,textoInter,get alvo(){return alvoInter;},invCount,salvarJogo,carregarJogo,E:()=>E,cam};
requestAnimationFrame(()=>setTimeout(boot,40));
