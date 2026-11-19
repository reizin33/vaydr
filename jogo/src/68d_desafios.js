/* ================= Desafio "Segurar a posição" (v10.8.2) =================
   Himalaia (19/11/2026): "desafios, coisas para fazer; hoje o jogo se baseia em matar zumbi, só isso". Um desafio de verdade:
   num ponto marcado (sinalizador vermelho no chão), acenda o sinalizador e aguente 90 s dentro da área enquanto as levas de
   zumbis chegam de todos os lados (cada leva maior, com corredor e brutamonte no fim). Sair da área por mais de 6 s ou cair
   perde. A primeira vitória em cada lugar dá o prêmio grande; repetir (uma vez por dia do jogo) dá munição e experiência.
   Lugares: a Feira da Rua do Morro, o Largo da Matriz (Cidade Alta) e o Posto da estrada.
   Aparece no "O que fazer" (letra R) e no mapa. */
const POSICOES=[],RES={ativo:null,t:0,leva:0,fora:0,hud:null,ids:[]};
const RES_DUR=90,RES_FORA=6;
/* levas: [segundo, [tipos]] */
const RES_LEVAS=[[0,['walker','walker','walker','walker','walker']],[20,['walker','walker','walker','walker','walker','runner']],
  [42,['walker','walker','walker','walker','walker','walker','runner','screamer']],[64,['walker','walker','walker','walker','walker','runner','runner','brute']]];
function posicaoNova(o){const R=Object.assign({r:13,xp:150,premio:[],repete:[['municao9',10]]},o);POSICOES.push(R);return R;}
function posicaoD(id){const D=ativD();if(!D.posicoes)D.posicoes={};if(!D.posicoes[id])D.posicoes[id]={feito:false,vitorias:0,dia:-1};return D.posicoes[id];}
/* o lugar fica pronto quando a região dele existe (o mundo monta antes); devolve {x,y,z} ou null */
function posicaoLugar(R){if(R.p)return R.p;let p=null;try{p=R.lugar();}catch(e){p=null;}if(p&&isFinite(p.x)&&isFinite(p.z)){if(!isFinite(p.y))p.y=chaoEm(p.x,p.z,40);R.p=p;}return R.p||null;}
ativFonte(()=>POSICOES.map(R=>{const p=posicaoLugar(R);if(!p)return null;const S=posicaoD(R.id),hoje=S.dia===(G.dia|0);
  return{id:'posicao-'+R.id,tipo:'posicao',nome:'Segurar a posição: '+R.nome,x:p.x,z:p.z,r:R.r,feito:S.feito&&hoje,
    falta:S.feito?(hoje?'já segurou hoje (volte amanhã)':'repetir: '+ativPremio(R.repete)):'aguente '+RES_DUR+' s dentro da área',
    premio:S.feito?ativPremio(R.repete):ativPremio(R.premio)};}).filter(Boolean));
ATIV_TIPOS.posicao={nome:'Segurar a posição',cor:'#ff7a52',l:'R'};
/* sinalizador no chão: começa o desafio */
INTERS.push(tryIt=>{if(RES.ativo||(typeof CORR!=='undefined'&&CORR.ativa))return;for(const R of POSICOES){const p=posicaoLugar(R);if(!p||Math.abs(P.x-p.x)>3||Math.abs(P.z-p.z)>3||Math.abs(P.y-p.y)>2)continue;tryIt({k:'posicaoIni',o:R},p.x,p.z,2.2,2.4,-1,p.y);}});
INTER_K.posicaoIni={texto:R=>{const S=posicaoD(R.id),hoje=S.feito&&S.dia===(G.dia|0);
    if(hoje)return{t:'Sinalizador apagado',s:'você já segurou esta posição hoje · volte amanhã'};
    return{t:'Acender o sinalizador: segurar a posição',s:'aguente '+RES_DUR+' s na área · prêmio: '+ativPremio(S.feito?R.repete:R.premio)+' · segure',hold:true,dur:1.2};},
  usar:(R,seg)=>{const S=posicaoD(R.id);if(S.feito&&S.dia===(G.dia|0)){sfx('vazio');return;}if(!seg)return;posicaoComecar(R);}};
function posicaoComecar(R){if(RES.ativo||!P.alive)return;const p=posicaoLugar(R);if(!p)return;RES.ativo=R;RES.t=-3;RES.leva=0;RES.fora=0;RES.ids=[];
  sfx('alarme');ativLimpa();barulho(p.x,p.z,60,true,p.y);
  toast('corpo',R.nome+': o sinalizador chamou atenção. Aguente '+RES_DUR+' s dentro da área (o círculo vermelho). Sair por mais de '+RES_FORA+' s perde.');}
/* um ponto livre para nascer zumbi a 24-34 m, mais ou menos na mesma altura e fora de casa */
function posicaoNascer(p,tipo){for(let k=0;k<40;k++){const a=Math.random()*Math.PI*2,d=24+Math.random()*10,x=p.x+Math.sin(a)*d,z=p.z+Math.cos(a)*d;
    if(!dentroMapa(x,z,3)||pointBlocked(x,z,0.6))continue;const y=chaoEm(x,z,p.y+1.2);if(!isFinite(y)||Math.abs(y-p.y)>(k<25?2.0:3.5))continue;   // nada de nascer em cima de telhado de barraca
    if(typeof ruralCasaEm==='function'&&ruralCasaEm(x,z,0.3))continue;
    const q=criarZ(tipo,x,z,{y});if(!q)return null;q.st='caca';q.viu=0;q.lx=P.x;q.lz=P.z;q.ly=P.y;q.posicao=true;return q;}return null;}
function posicaoFim(R,ok,motivo){RES.ativo=null;posicaoHud(null);ativLimpa();
  if(!ok){sfx('vazio');toast('corpo',R.nome+': '+(motivo||'posição perdida')+'.');return;}
  const S=posicaoD(R.id),primeira=!S.feito,pr=primeira?R.premio:R.repete;S.feito=true;S.vitorias++;S.dia=G.dia|0;
  if(pr.length)ativDar(pr);ganharXP(primeira?R.xp:Math.round(R.xp*0.35));sfx('missao');P.shake=Math.max(P.shake||0,0.12);
  toast('habilidade',R.nome+': posição segura!'+(pr.length?' Prêmio: '+ativPremio(pr):'')+(primeira?'':' (repetição)'));
  if(typeof diarioEvento==='function')diarioEvento('Segurou a posição: '+R.nome+(primeira?'':' (de novo)'),'geral');}
PASSOS.push(function posicaoPasso(dt){const R=RES.ativo;if(!R||G.modo!=='jogo')return;const p=posicaoLugar(R);
  if(!P.alive){posicaoFim(R,false,'você caiu');return;}
  RES.t+=dt;if(RES.t<0){posicaoHud(R);return;}
  while(RES.leva<RES_LEVAS.length&&RES.t>=RES_LEVAS[RES.leva][0]){for(const t of RES_LEVAS[RES.leva][1]){const q=posicaoNascer(p,t);if(q)RES.ids.push(q.id);}RES.leva++;sfx('gemido',p.x,p.z,1,'walker');
    if(RES.leva>1)toast('corpo','Leva '+RES.leva+' de '+RES_LEVAS.length+' chegando!');}
  /* os zumbis do desafio sabem onde você está */
  for(const z of Z)if(z.posicao&&z.vivo&&(z.st==='vaga'||z.st==='alerta'||z.st==='marcha')){z.st='caca';z.viu=0;z.lx=P.x;z.lz=P.z;z.ly=P.y;}
  const dentro=Math.hypot(P.x-p.x,P.z-p.z)<R.r&&Math.abs(P.y-p.y)<5;RES.fora=dentro?0:RES.fora+dt;
  if(RES.fora>RES_FORA){posicaoFim(R,false,'você abandonou a posição');return;}
  if(RES.t>=RES_DUR){posicaoFim(R,true);return;}
  posicaoHud(R);});
function posicaoHud(R){let el=RES.hud;if(!R){if(el)el.hidden=true;return;}
  if(!el){el=document.createElement('div');el.id='posicao-hud';el.setAttribute('aria-live','off');
    el.style.cssText='position:fixed;left:50%;top:86px;transform:translateX(-50%);z-index:30;padding:8px 16px;border-radius:12px;background:rgba(22,8,6,.74);color:#ffe9e0;font:700 15px/1.25 var(--f-ui,system-ui);text-align:center;pointer-events:none;letter-spacing:.02em;box-shadow:0 2px 12px rgba(0,0,0,.35)';
    document.body.appendChild(el);RES.hud=el;}
  el.hidden=false;const t=RES.t;
  if(t<0){el.textContent=R.nome+' · começa em '+Math.ceil(-t);return;}
  const resta=Math.max(0,RES_DUR-t),vivos=Z.filter(z=>z.posicao&&z.vivo).length;
  el.textContent='Segurar a posição · '+ativTempo(resta)+' · leva '+Math.max(1,RES.leva)+'/'+RES_LEVAS.length+' · '+vivos+' zumbi'+(vivos===1?'':'s')+(RES.fora>0?' · VOLTE PARA A ÁREA ('+Math.ceil(RES_FORA-RES.fora)+')':'');}
/* o círculo da área (no chão) e o brilho do sinalizador */
DESENHO.aditivo.push(function posicaoBrilho(){const n=E.n||0;
  for(const R of POSICOES){const p=R.p;if(!p||d2(p.x,p.z,cam.pos[0],cam.pos[2])>150*150)continue;const S=posicaoD(R.id),ativo=RES.ativo===R,apagado=S.feito&&S.dia===(G.dia|0)&&!ativo;
    if(!apagado){const f=ativo?0.75+0.25*Math.sin(G.t*14):0.45+0.15*Math.sin(G.t*3);bb(p.x,p.y+0.35,p.z,ativo?0.9:0.35,1,0.18,0.08,f*(0.5+0.5*n));}
    if(ativo){const N=40;for(let i=0;i<N;i++){const a=i/N*Math.PI*2,x=p.x+Math.sin(a)*R.r,z=p.z+Math.cos(a)*R.r;bb(x,chaoEm(x,z,p.y+2)+0.15,z,0.32,1,0.25,0.1,0.55);}}}});
/* o sinalizador (lata vermelha com tampa, numa base de concreto) em cada lugar */
function posicaoGeo(){const g=new GB(1<<10,8);for(const R of POSICOES){const p=posicaoLugar(R);if(!p)continue;
    add(g,boxTris(0.64,0.12,0.64),mat(p.x,p.y+0.06,p.z),lin(0x6a6258));
    add(g,cylTris(0.11,0.11,0.42,10),mat(p.x,p.y+0.12,p.z),lin(0xb3261e));add(g,cylTris(0.07,0.08,0.08,8),mat(p.x,p.y+0.54,p.z),lin(0x2a2a2a));}
  return g.data();}
let POS_MALHA=null;
etapaMalha('fim','posicoes',1,()=>{try{POS_MALHA=litMesh(posicaoGeo());}catch(e){console.error('posição (desenho)',e);POS_MALHA=null;}});
DESENHO.opaco.push(function posicaoDesenho(Pg){if(POS_MALHA)drawStat(Pg,POS_MALHA,ID);});
/* os três lugares */
posicaoNova({id:'feira',nome:'Feira da Rua do Morro',lugar:()=>FEIRA.ok?{x:FEIRA.rua+0.5,z:(FEIRA.z0+FEIRA.z1)/2}:null,
  premio:[['municao9',24],['kit',1],['fusivel',1]],repete:[['municao9',10],['bandagem',1]]});
posicaoNova({id:'matriz',nome:'Largo da Matriz',lugar:()=>typeof CA!=='undefined'&&CA.ok?{x:236.5,z:-166.5}:null,
  premio:[['molotov',2],['kit',1],['municao9',18]],repete:[['municao9',10],['molotov',1]]});
posicaoNova({id:'posto',nome:'Posto da estrada',lugar:()=>{const q=placeById('posto');return q?{x:q.x,z:q.z}:null;},
  premio:[['gasolina',2],['municao9',20],['bandagem',3]],repete:[['municao9',10],['gasolina',1]]});
/* corrida e desafio não andam juntos */
{const _cc=corridaComecar;corridaComecar=function(C){if(RES.ativo){feed('Termine o desafio antes',true);return;}return _cc.apply(this,arguments);};}
