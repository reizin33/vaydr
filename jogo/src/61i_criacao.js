/* ================= Etapa 15: agricultura e animais =================
   ÉPOCA DE PLANTIO: cada cultura tem a sua estação (milho, abóbora, tomate e feijão gostam de primavera e verão e quase não
   crescem no inverno; batata e cenoura aguentam outono e inverno). O canteiro mostra se é época boa ou não.
   SEMENTES SELECIONADAS: 4 sementes + 1 adubo (na mão) dão 2 selecionadas: crescem 35% mais rápido e colhem um a mais.
   ADUBO: da composteira ou do biodigestor. Perto de uma horta ou de um canteiro crescendo, use pela mochila: adianta um terço.
   COMPOSTEIRA (B → Plantio): ponha restos (esterco, comida estragada, frutas, fibras); 4 porções viram 1 adubo em 10 horas.
   GALINHAS: andam soltas perto da fazenda e dos sítios. Agachado, segure E perto de uma para pegar. Num galinheiro (B → Animais)
   com milho (ou sementes, feijão) e água, cada galinha põe um ovo por dia; com duas ou mais, nasce pintinho a cada dois dias
   (vira galinha em três dias), até 8 por galinheiro. Sem comida ou água por dois dias, uma galinha morre.
   VACA, OVELHA, CABRA E COELHO: domam como o cavalo (agachado, comida na mão, confiança cheia e uma corda). Domado, ele segue você;
   perto de um curral (B → Animais), segure E nele → "Pôr no curral". No curral, com um cocho com comida e um bebedouro com água:
   vaca dá leite todo dia, cabra a cada dois dias, ovelha dá lã a cada três (tosquiar precisa de faca). Casal da mesma espécie
   tem filhote (vaca a cada 6 dias, ovelha e cabra a cada 4, coelho a cada 2), até 8 animais por curral; o filhote cresce em 3 dias.
   Todo bicho do curral e do galinheiro faz esterco (recolha no painel).
   BEBEDOURO: encha com garrafas ou ligue com canos na rede de água (Etapa 13): enche sozinho da caixa ou do barril.
   COLMEIA: um enxame chega em um dia se tiver flor, horta ou pomar perto. Dá mel e cera a cada dois dias. Colher sem fumigador
   dá ferroada. MEL mata a fome e cura um pouco; CERA é material.
   BIODIGESTOR: esterco e restos viram gás e adubo; com gás, o fogareiro em cima cozinha como uma fogueira (gasta o gás).
   Os animais selvagens continuam selvagens: só cavalo, vaca, ovelha, cabra, coelho e galinha se domesticam. */

/* ---------- itens, ícones e receitas ---------- */
iconesNovos({
  'i-ovo':'<path d="M12 3c3.6 0 6.5 5.4 6.5 10a6.5 6.5 0 0 1-13 0C5.5 8.4 8.4 3 12 3z"/>',
  'i-leite':'<path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z"/><path d="M7 12h10"/>',
  'i-mel':'<path d="M6 9h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M8 9V6h8v3M6 13c2 1.5 4 1.5 6 0s4-1.5 6 0"/>',
  'i-cera':'<path d="M12 4l7 4v8l-7 4-7-4V8z"/><path d="M12 4v16M5 8l14 8M19 8 5 16"/>',
  'i-esterco':'<path d="M5 18c0-2 2-3 4-3 0-2 1.5-3.5 3-3.5s3 1.5 3 3.5c2 0 4 1 4 3s-2 2.5-7 2.5S5 20 5 18z"/><path d="M9 8c.6-1 .6-2 0-3M13 7c.6-1 .6-2 0-3"/>',
  'i-galinha':'<path d="M8 20h8M10 20v-2M14 20v-2"/><path d="M5 11c0 4 3 7 7 7s6-2.5 6-6l2-1-2-1c-.5-3-2.5-5-5-5-2 0-3.5 1.5-3.5 3.5 0 1.2.5 2 1.5 2.5H5z"/><path d="M14.5 5.5 15 3l1.2 2"/>',
  'i-fumigador':'<path d="M7 9h8v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z"/><path d="M15 12h3l2-2M9 9V7h4v2"/><path d="M10 5c0-1 1-1.5 1-2.5M13 5c0-1 1-1.5 1-2.5"/>',
  'i-galinheiro':'<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5M7 13h1.5"/>',
  'i-curral':'<path d="M3 8h18M3 13h18M3 18h18M5 6v14M12 6v14M19 6v14"/>',
  'i-bebedouro':'<path d="M3 11h18l-2 6H5z"/><path d="M6 17v3M18 17v3M7 13.5h10"/>',
  'i-colmeia':'<path d="M5 8h14v4H5zM6 12h12v4H6zM7 16h10v4H7z"/><path d="M9 6c0-1.5 1.3-2.5 3-2.5S15 4.5 15 6"/><path d="M11 18.5h2"/>',
  'i-composteira':'<path d="M4 8h16v12H4z"/><path d="M4 12h16M4 16h16M8 8V5h8v3"/>',
  'i-biodigestor':'<path d="M4 14a8 6 0 0 1 16 0v5H4z"/><path d="M12 8V5M10 5h4M17 11l2-2"/><path d="M11 15c0-1.5 2-2 2-3.5"/>',
  'i-estabulo':'<path d="M3 11 12 5l9 6"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6M9 14l6 6M15 14l-6 6"/>',
  'i-cerca':'<path d="M5 20V7l1.5-2L8 7v13M16 20V7l1.5-2L19 7v13"/><path d="M3 10h18M3 15h18"/>'});
Object.assign(ITEMS,{
  ovo:{nome:'Ovo',icon:'i-ovo',max:20,tipo:'comida',fome:5,validade:120,desc:'Do galinheiro. Cru mata pouco a fome; cozido na fogueira rende bem mais.'},
  ovoCozido:{nome:'Ovo cozido',icon:'i-ovo',max:20,tipo:'comida',fome:13,vida:1,validade:48,desc:'Ovo cozido na fogueira.'},
  leite:{nome:'Leite',icon:'i-leite',max:6,tipo:'comida',fome:8,sede:18,validade:48,desc:'Ordenhado da vaca ou da cabra no curral. Mata a fome e a sede.'},
  mel:{nome:'Mel',icon:'i-mel',max:10,tipo:'comida',fome:7,vida:4,desc:'Da colmeia. Não estraga, dá energia e cura um pouco.'},
  cera:{nome:'Cera de abelha',icon:'i-cera',max:20,tipo:'material',desc:'Da colmeia. Impermeabiliza e vira vela.'},
  esterco:{nome:'Esterco',icon:'i-esterco',max:30,tipo:'material',desc:'Dos animais do curral, do galinheiro e do cavalo. Vira adubo na composteira e gás no biodigestor.'},
  adubo:{nome:'Adubo',icon:'i-adubo',max:20,tipo:'util',acao:'Adubar',desc:'Da composteira ou do biodigestor. Perto de uma horta ou de um canteiro crescendo, adianta a colheita em um terço.'},
  sementesBoas:{nome:'Sementes selecionadas',icon:'i-sementes',max:30,tipo:'material',desc:'As melhores sementes, separadas e adubadas. Num canteiro, crescem 35% mais rápido e colhem um a mais.'},
  galinha:{nome:'Galinha',icon:'i-galinha',max:4,tipo:'util',desc:'Galinha viva. Solte num galinheiro (toque E no galinheiro).'},
  fumigador:{nome:'Fumigador',icon:'i-fumigador',max:1,tipo:'util',durMax:30,desc:'Lata com pano queimando devagar: a fumaça acalma as abelhas. Com ele na mochila, colher a colmeia não dá ferroada.'},
  vela:{nome:'Vela',icon:'i-cera',max:10,tipo:'material',desc:'Vela de cera de abelha. Vai na lamparina (a de pôr no chão e a de parede) no lugar dos 2 gravetos.'}});
RECIPES.push(
  {faz:'sementesBoas',n:2,custo:{sementes:4,adubo:1},cat:'materiais',etapa:1,est:0,desb:{item:'adubo'}},
  {faz:'fumigador',n:1,custo:{sucata:1,pano:1,fibra:2},cat:'ferramentas',etapa:1,est:0,desb:{item:'mel'}},
  {faz:'vela',n:2,custo:{cera:1,fibra:1},cat:'materiais',etapa:1,est:0,desb:{item:'cera'}});
COZINHA.push({de:'ovo',para:'ovoCozido',n1:'ovo',nn:'ovos',xp:2,assa:true});

/* ---------- época de plantio: cada cultura tem a sua estação (no lugar do fator geral da estação) ---------- */
const PLANTIO_EPOCA={milho:[1.25,1.1,0.6,0.15],batata:[1,0.75,1.15,0.85],abobora:[1.25,1.1,0.7,0.15],tomate:[1.1,1.25,0.7,0.2],cenoura:[1,0.8,1.2,1],feijaoVerde:[1.2,1.05,0.7,0.2]};
const EPOCA_NOMES=['primavera','verão','outono','inverno'];
function epocaK(id){const e=PLANTIO_EPOCA[id];return e?e[typeof estacaoIdx==='function'?estacaoIdx():0]:1;}
function epocaTxt(id){const k=epocaK(id);return k>=1.1?'época boa':k>=0.8?'época razoável':k>=0.4?'fora de época: cresce devagar':'fora de época: quase não cresce';}
function epocaMelhor(id){const e=PLANTIO_EPOCA[id];if(!e)return'';return e.map((k,i)=>k>=1.1?EPOCA_NOMES[i]:null).filter(Boolean).join(' e ')||'qualquer época';}
const plantioM=()=>G.plantioM&&typeof G.plantioM==='object'?G.plantioM:(G.plantioM={});   // canteiros plantados com semente selecionada
function canteiroRitmo(d){const C=culturaDe(d),geral=typeof estacao==='function'?estacao().horta:1;return plantioRitmo()/Math.max(0.05,geral)*epocaK(C.id)*(plantioM()[d.id]?1.35:1);}
{const i=PASSOS.findIndex(f=>f&&f.name==='plantioCresce');const novo=function plantioCresce(dt){const S=plantioD(),base=dt/(PLANTIO_CFG.horas*30);if(!(base>0))return;
    for(const d of PLANTIO_DEF){const c=S[d.id];if(c>=0&&c<1)S[d.id]=Math.min(1,c+base*canteiroRitmo(d));}};
  if(i>=0)PASSOS[i]=novo;else PASSOS.push(novo);}
{const K=INTER_K.canteiro,_tx=K.texto,_us=K.usar;
  K.texto=function(d){const r=_tx.apply(this,arguments),c=plantioD()[d.id];if(!r)return r;
    if(!(c>=0)){const C=PLANTIO_CULT[plantioSel()],boas=invCount('sementesBoas');if(!invCount('sementes')&&!boas)return r;
      return Object.assign({},r,{s:r.s.replace(/\(.*\)$/,'('+(boas?boas+' selecionada'+(boas>1?'s':''):sementesTxt(invCount('sementes')))+')')+' · '+epocaTxt(C.id)});}
    if(c<1){const C=culturaDe(d),h=Math.max(1,Math.ceil((1-c)*PLANTIO_CFG.horas/Math.max(0.05,canteiroRitmo(d))));
      return Object.assign({},r,{s:'pronto em umas '+h+' h · '+epocaTxt(C.id)+(plantioM()[d.id]?' · semente selecionada':'')+(invCount('adubo')?' · dá para adubar (mochila)':'')});}
    return r;};
  K.usar=function(d){const S=plantioD(),c=S[d.id];
    if(!(c>=0)&&invCount('sementesBoas')>0){const ci=plantioSel(),C=PLANTIO_CULT[ci];invRemove('sementesBoas',1);S[d.id]=0;plantioC()[d.id]=ci;plantioM()[d.id]=1;sfx('pegar');
      feed('Plantou '+C.nome+' com semente selecionada ('+epocaTxt(C.id)+')');hudBarra();if(typeof diarioConta==='function')diarioConta('plantou',1);return;}
    const m=c>=1&&plantioM()[d.id],cul=c>=1?culturaDe(d):null;const r=_us.apply(this,arguments);
    if(m&&cul&&S[d.id]===-1){delete plantioM()[d.id];ganhar(cul.id,1);if(Math.random()<0.35)ganhar('sementesBoas',1);}
    return r;};}
/* adubo (e a farinha de osso) servem na horta e no canteiro crescendo */
function adubarPerto(i,k){let alvo=null,bd=4*4,ehH=false;for(const o of OB){if(o.tipo!=='horta'||(o.ext.cresce||0)>=1)continue;const q=d2(o.x,o.z,P.x,P.z);if(q<bd){bd=q;alvo=o;ehH=true;}}
  const S=plantioD();for(const d of PLANTIO_DEF){const c=S[d.id];if(!(c>=0&&c<1))continue;const mx=(d.ax+d.bx)/2,mz=(d.az+d.bz)/2,q=d2(mx,mz,P.x,P.z);if(q<bd){bd=q;alvo=d;ehH=false;}}
  if(!alvo){feed('Chegue perto de uma horta ou de um canteiro crescendo para adubar',true);return false;}
  if(ehH){alvo.ext.cresce=Math.min(1,(alvo.ext.cresce||0)+k);feed('Adubou a horta: '+Math.round(alvo.ext.cresce*100)+'%');}
  else{S[alvo.id]=Math.min(1,S[alvo.id]+k);feed('Adubou o canteiro de '+culturaDe(alvo).nome+': '+Math.round(S[alvo.id]*100)+'%');}
  gastarUm(i);sfx('pegar');invRender();hudBarra();return false;}
UTIL_ACOES.adubo=(i)=>adubarPerto(i,0.34);
UTIL_ACOES.farinhaOsso=(i)=>adubarPerto(i,0.34);

/* ---------- construções novas e onde aparecem no menu B ---------- */
const owl=(o,u,v)=>{const c=Math.cos(o.yaw),s=Math.sin(o.yaw);return[o.x+u*c+v*s,o.z-u*s+v*c];};   // ponto local (u,v) da peça no mundo
Object.assign(OBRAS,{
  composteira:{nome:'Composteira',icon:'i-composteira',custo:{tabuas:4,pregos:2},hp:120,hw:0.6,hd:0.6,solid:true,hCol:1.0,etapa:1,estacao:'composteira',
    desc:'Caixa de tábuas para restos: esterco, comida estragada, frutas e fibras. Quatro porções viram um adubo em 10 horas.'},
  biodigestor:{nome:'Biodigestor',icon:'i-biodigestor',custo:{tabuas:6,sucata:6,pregos:4},hp:220,hw:0.85,hd:0.85,solid:true,hCol:1.4,etapa:2,estacao:'biodigestor',
    desc:'Tanque fechado: esterco e restos viram gás e adubo. Com gás, o fogareiro em cima cozinha como uma fogueira.'},
  galinheiro:{nome:'Galinheiro',icon:'i-galinheiro',custo:{tabuas:8,pregos:4,madeira:2},hp:220,hw:1.15,hd:0.85,solid:true,hCol:1.7,etapa:1,estacao:'galinheiro',
    desc:'Casinha com poleiro e ninhos. Solte galinhas (pegue as que andam soltas perto da fazenda e dos sítios), dê milho e água: ovos todo dia e pintinhos.'},
  curral:{nome:'Curral',icon:'i-curral',custo:{madeira:12,tabuas:6,pregos:6},hp:420,hw:4,hd:3,solid:false,etapa:1,estacao:'curral',montar:curralMontar,
    desc:'Cercado de 8 por 6 metros com porteira e um abrigo. Vacas, ovelhas, cabras e coelhos domados ficam aqui; ponha um cocho e um bebedouro dentro.'},
  bebedouro:{nome:'Bebedouro',icon:'i-bebedouro',custo:{tabuas:3,pregos:2},hp:100,hw:0.75,hd:0.3,solid:true,hCol:0.7,etapa:1,estacao:'bebedouro',agua:'bebedouro',peq:true,
    desc:'Cocho de água para os animais. Encha com garrafas ou ligue com canos numa caixa d\'água ou num barril da rede: enche sozinho.'},
  colmeia:{nome:'Colmeia',icon:'i-colmeia',custo:{tabuas:4,pregos:2},hp:90,hw:0.3,hd:0.3,solid:true,hCol:0.95,etapa:1,estacao:'colmeia',
    desc:'Caixa de abelhas. Perto de flores, de uma horta ou de árvores de fruta, um enxame chega em um dia. Mel e cera a cada dois dias.'}});
Object.assign(OBRAS,{
  cerca:{nome:'Cerca',icon:'i-cerca',custo:{madeira:2,pregos:1},hp:80,hw:1.0,hd:0.08,solid:true,hCol:1.25,etapa:1,
    desc:'Dois metros de cerca de madeira. Bicho e gente não passam por ela: para fechar pasto, horta ou o caminho até o curral.'},
  estabulo:{nome:'Estábulo',icon:'i-estabulo',custo:{madeira:8,tabuas:10,pregos:8},hp:380,hw:1.6,hd:1.4,solid:false,etapa:1,montar:estabuloMontar,
    desc:'Baia coberta para o cavalo. No painel do cavalo, "Deixar no estábulo" com ele perto: fica protegido na baia, descansa e sara mais rápido.'}});
Object.assign(ESTACOES,{
  composteira:{nome:'Composteira',icon:'i-composteira',ir:'uma composteira (B → Plantio)',chip:'Composteira'},
  biodigestor:{nome:'Biodigestor',icon:'i-biodigestor',ir:'um biodigestor (B → Plantio)',chip:'Biodigestor'},
  galinheiro:{nome:'Galinheiro',icon:'i-galinheiro',ir:'um galinheiro (B → Animais)',chip:'Galinheiro'},
  curral:{nome:'Curral',icon:'i-curral',ir:'um curral (B → Animais)',chip:'Curral'},
  bebedouro:{nome:'Bebedouro',icon:'i-bebedouro',ir:'um bebedouro (B → Animais)',chip:'Bebedouro'},
  colmeia:{nome:'Colmeia',icon:'i-colmeia',ir:'uma colmeia (B → Animais)',chip:'Colmeia'},
  cria:{nome:'Animal',icon:'i-curral',ir:'',chip:'Animal'}});
{const an=OBRA_CATS.find(c=>c.id==='animais'),pl=OBRA_CATS.find(c=>c.id==='plantio');
  for(const k of['galinheiro','curral','bebedouro','colmeia','cerca','estabulo'])if(an&&!an.t.includes(k))an.t.push(k);
  for(const k of['composteira','biodigestor'])if(pl&&!pl.t.includes(k))pl.t.push(k);
  for(const k of['galinheiro','curral','bebedouro','colmeia','composteira','biodigestor','cerca','estabulo']){if(!OBRA_ORDEM.includes(k))OBRA_ORDEM.push(k);if(!OBRAS_CHAO.includes(k))OBRAS_CHAO.push(k);}}
/* curral: cerca com porteira na frente (os colisores são as cercas, o miolo é livre) */
function curralMontar(o){const D=OBRAS.curral,hw=D.hw,hd=D.hd,y0=o.y-0.3,y1=o.y+1.3,cs=[];
  const seg=(u0,v0,u1,v1)=>{const[cx,cz]=owl(o,(u0+u1)/2,(v0+v1)/2);const lu=Math.abs(u1-u0)/2,lv=Math.abs(v1-v0)/2;cs.push(colBox(cx,cz,Math.max(0.08,lu),Math.max(0.08,lv),o.yaw,{solid:true,obra:o,y0,y1}));};
  seg(-hw,hd,hw,hd);seg(-hw,-hd,-hw,hd);seg(hw,-hd,hw,hd);seg(-hw,-hd,-1.1,-hd);seg(1.1,-hd,hw,-hd);o.cols=cs;o.col=null;}
const curralLocal=(o,x,z)=>{const c=Math.cos(o.yaw),s=Math.sin(o.yaw),dx=x-o.x,dz=z-o.z;return[dx*c-dz*s,dx*s+dz*c];};
const curralDentro=(o,x,z,m)=>{const c=Math.cos(o.yaw),s=Math.sin(o.yaw),dx=x-o.x,dz=z-o.z,u=dx*c-dz*s,v=dx*s+dz*c,D=OBRAS.curral;m=m||0;return Math.abs(u)<D.hw-m&&Math.abs(v)<D.hd-m;};
/* estábulo: paredes nos fundos e nos lados, frente aberta (o cavalo entra) */
function estabuloMontar(o){const D=OBRAS.estabulo,hw=D.hw,hd=D.hd,y0=o.y-0.3,y1=o.y+2.3,cs=[];
  const seg=(u0,v0,u1,v1)=>{const[cx,cz]=owl(o,(u0+u1)/2,(v0+v1)/2);cs.push(colBox(cx,cz,Math.max(0.08,Math.abs(u1-u0)/2),Math.max(0.08,Math.abs(v1-v0)/2),o.yaw,{solid:true,obra:o,y0,y1}));};
  seg(-hw,hd,hw,hd);seg(-hw,-hd,-hw,hd);seg(hw,-hd,hw,hd);o.cols=cs;o.col=null;}
function estabuloPerto(h,r){let best=null,bd=(r||8)**2;for(const o of OB){if(o.tipo!=='estabulo'||o.hp<=0)continue;const d=d2(o.x,o.z,h.x,h.z);if(d<bd){bd=d;best=o;}}return best;}
function naBaia(h){if(!h||h.modo!=='amarrado')return null;for(const o of OB)if(o.tipo==='estabulo'&&o.hp>0&&d2(o.x,o.z,h.fx??h.x,h.fz??h.z)<1.2*1.2)return o;return null;}
if(ESTACAO_UI.cavalo){const U=ESTACAO_UI.cavalo,_ac=U.acao,_rd=U.render;
  U.acao=function(h,id){if(id==='fica'){const e=estabuloPerto(h,8);if(e){const p=owl(e,0,0.1);h.modo='amarrado';h.fx=p[0];h.fz=p[1];h.baiaTm=G.tm;return h.nome+' ficou na baia do estábulo';}}return _ac.apply(this,arguments);};
  U.render=function(h){const r=_rd.apply(this,arguments);if(naBaia(h))r.corpo=r.corpo.replace('Amarrado no poste.','No estábulo: protegido, descansa e sara mais rápido.');
    else if(h.modo==='segue'&&estabuloPerto(h,8)){const a=(r.acoes||[]).find(q=>q.id==='fica');if(a){a.t='Deixar no estábulo';a.s='baia coberta: descansa e sara mais rápido';}}return r;};}
let baiaT=0;
PASSOS.push(function baias(dt){baiaT-=dt;if(baiaT>0)return;baiaT=2;if(typeof CAVALOS==='undefined')return;for(const h of CAVALOS){if(!h.vivo)continue;const e=naBaia(h);if(!e){h.baiaTm=null;continue;}
  const dm=Math.max(0,Math.min(240,G.tm-(h.baiaTm??G.tm)));h.baiaTm=G.tm;if(!(dm>0))continue;if(h.fome<75&&h.hp<h.hpMax)h.hp=Math.min(h.hpMax,h.hp+h.hpMax*dm/60*0.06);h.folego=Math.min(100,h.folego+dm*1.5);}});

/* o painel do curral também abre na porteira */
INTERS.push(function curralPorteira(tryIt){if(P.montado||CARRO.ativo)return;for(const o of OB){if(o.tipo!=='curral'||o.hp<=0||Math.abs(o.x-P.x)>8||Math.abs(o.z-P.z)>8)continue;
  const[gx,gz]=owl(o,0,-OBRAS.curral.hd);tryIt({k:'estacao',o},gx,gz,2.2,1.4,-0.6,o.y);}});

/* ---------- composteira ---------- */
const COMPOSTO={esterco:{n:1,p:1},carneEstragada:{n:1,p:1},frutas:{n:2,p:1},fibra:{n:4,p:1},tomate:{n:2,p:1}};
const COMP_CFG={porLote:4,horas:10,lotes:2};
function compPasso(o){const e=o.ext;e.lotes=e.lotes||[];e.pronto=e.pronto||0;e.porcoes=e.porcoes||0;
  for(let i=e.lotes.length-1;i>=0;i--)if(G.tm>=e.lotes[i]){e.lotes.splice(i,1);e.pronto=Math.min(9,e.pronto+1);}
  while(e.porcoes>=COMP_CFG.porLote&&e.lotes.length<COMP_CFG.lotes){e.porcoes-=COMP_CFG.porLote;e.lotes.push(G.tm+COMP_CFG.horas*60);}}
function porRestos(e,tab,cap){let n=0;for(const k in tab){const q=tab[k];while(invCount(k)>=q.n&&(e.porcoes||0)<cap){invRemove(k,q.n);e.porcoes=(e.porcoes||0)+q.p;n++;}}return n;}
ESTACAO_UI.composteira={resumo:o=>{const e=o.ext;compPasso(o);return(e.pronto?e.pronto+' adubo pronto · ':'')+(e.lotes||[]).length+' curtindo · '+(e.porcoes||0)+' porções';},
  render(o){compPasso(o);const e=o.ext;let c='<div class="es-lista">';
    for(let i=0;i<COMP_CFG.lotes;i++){const f=(e.lotes||[])[i];c+=f?'<div class="es-vaga"><span><b>Adubo curtindo</b><small>faltam '+horasTxt(f-G.tm)+'</small></span>'+barraHTML(1-(f-G.tm)/(COMP_CFG.horas*60))+'</div>':'<div class="es-vaga vazia"><span>Vaga livre: junte '+COMP_CFG.porLote+' porções</span></div>';}
    c+='</div><p class="es-info">Porções esperando: <b>'+(e.porcoes||0)+'</b> de '+COMP_CFG.porLote+'. Vale 1 porção: 1 esterco, 1 comida estragada, 2 frutas, 2 tomates ou 4 fibras. Adubo pronto: <b>'+(e.pronto||0)+'</b>.</p>';
    const tem=Object.keys(COMPOSTO).filter(k=>invCount(k)>=COMPOSTO[k].n);
    return{sub:'Restos viram adubo em '+COMP_CFG.horas+' horas',corpo:c,acoes:[{id:'por',t:'Pôr os restos da mochila',s:tem.length?tem.map(k=>ITEMS[k].nome.toLowerCase()).join(', '):'esterco, comida estragada, frutas, fibras',ok:tem.length>0,prim:!e.pronto},
      {id:'tirar',t:'Recolher adubo',s:(e.pronto||0)+' pronto',ok:(e.pronto||0)>0,prim:!!e.pronto}]};},
  acao(o,id){const e=o.ext;if(id==='por'){const n=porRestos(e,COMPOSTO,12);compPasso(o);return n?'Pôs '+n+' porç'+(n>1?'ões':'ão'):'Nada para pôr';}
    if(id==='tirar'){const n=e.pronto||0;if(!n)return'Nada pronto';const l=invAdd('adubo',n);e.pronto=l;return(n-l)+' adubo na mochila'+(l?' (mochila cheia)':'');}return'';}};

/* ---------- galinhas: a ave (no chão, cisca, crista e barbela), as soltas perto da fazenda e dos sítios, e o galinheiro ---------- */
AVE_SP.galinha={nome:'Galinha',esc:2.3,grupo:[2,4],foge:4,voo:4,bate:18,hab:'galinheiro',corpo:[0.04,0.042,0.066],perna:0.03,cab:0.024,bico:[0.012,0.006],cauda:[0.04,0.05,0.9],asa:[0.08,0.05],
  cor:{corpo:0xb87a3a,barriga:0xa86a32,asa:0x8a5a2a,cabeca:0xb87a3a,bico:0xe0b030,perna:0xe0b030,cauda:0x2a2a20,marca:0xd02020}};
{const _acg=aveCorpoGeo;aveCorpoGeo=function(g,sp,pousada,R){_acg.apply(this,arguments);if(sp!=='galinha')return;const{hy,hz}=aveForma(sp),cb=AVE_SP.galinha.cab,c=lin(0xd02020);
  for(let i=0;i<3;i++)add(g,ellipTris(0.004,0.012,0.008,6,4),mat(0,hy+cb*0.95,hz-cb*0.3+i*cb*0.4),c,{j:0.02,rnd:R});add(g,ellipTris(0.005,0.012,0.006,6,4),mat(0,hy-cb*0.9,hz+cb*0.75),c,{j:0.02,rnd:R});};}
{const _sc=SONS.aveCanto;SONS.aveCanto=function(A){if(A.extra!=='galinha')return _sc.apply(this,arguments);const{voz,r}=A;for(let i=0;i<3;i++)voz(0.08,620*r(),520,900,1800,0.12,i*0.15,0.2);};}
{const _aa=aveAmeaca;aveAmeaca=function(b){if(b.casa)return null;const r=_aa.apply(this,arguments);
  if(r&&b.sp==='galinha'&&r.x===P.x&&r.z===P.z&&!P.montado&&(P.agK||0)>0.5&&Math.hypot(P.vx,P.vz)<2.2&&Math.hypot(P.x-b.x,P.z-b.z)>0.7)return null;   // agachado e devagar dá para chegar perto
  return r;};}
{const _ap=avePasso;avePasso=function(b,dt){
  if(b.sp==='galinha'){if(b.st==='foge'){b.st='corre';b.t=1.1+Math.random()*0.6;b.v=3.4;}   // galinha não voa longe: sai correndo batendo as asas
    if(b.st==='voa'){b.st='chao';b.y=ground(b.x,b.z);b.t=1;}
    if(b.st==='corre'){b.t-=dt;b.fase+=dt*AVE_SP.galinha.bate;b.bate=1;b.roll=0;b.pitch=-0.15;const nx=b.x+Math.sin(b.yaw)*b.v*dt,nz=b.z+Math.cos(b.yaw)*b.v*dt;
      if(aveChaoOk(nx,nz)&&!pointBlocked(nx,nz,0.15)){b.x=nx;b.z=nz;}else b.yaw+=Math.PI*0.6;b.y=ground(b.x,b.z)+Math.abs(Math.sin(b.t*9))*0.08;
      if(b.t<=0){b.st='chao';b.t=1+Math.random()*2;b.pitch=0;b.bate=0;b.y=ground(b.x,b.z);}return;}}
  if(b.sp==='galinha'&&b.st==='chao'){const c=b.casa||b.sitio;if(c){const d=Math.hypot(b.x-c.x,b.z-c.z),lim=b.casa?2.8:6;
      if(d>lim){b.yaw=Math.atan2(c.x-b.x,c.z-b.z);b.x+=Math.sin(b.yaw)*dt*0.6;b.z+=Math.cos(b.yaw)*dt*0.6;}}}
  return _ap.apply(this,arguments);};}
/* soltas perto da fazenda e dos sítios (voltam aos poucos) */
function galSitios(){const L=[];const f=PLACES.find(p=>p.id==='fazenda');if(f)L.push({id:'faz',x:f.x,z:f.z,r:Math.min(14,f.r*0.5)});
  RURAIS.forEach((p,i)=>{if(i%2===0)L.push({id:'r'+i,x:(p.bx0+p.bx1)/2,z:(p.bz0+p.bz1)/2,r:Math.max(p.bx1-p.bx0,p.bz1-p.bz0)/2+3});});return L;}
function e15(){if(!G.e15||typeof G.e15!=='object')G.e15={gal:{}};if(!G.e15.gal)G.e15.gal={};return G.e15;}
let galSpawnT=3;
PASSOS.push(function galinhasSoltas(dt){if(G.modo!=='jogo'||!MESH.ave||P.y<-20||(E.n||0)>0.6)return;   // de noite estão no poleiro
  galSpawnT-=dt;if(galSpawnT>0)return;galSpawnT=3;const S=e15().gal;
  for(const s of galSitios()){const d=Math.hypot(s.x-P.x,s.z-P.z),st=S[s.id]||(S[s.id]={n:3,tm:G.tm});
    if(st.n<3&&G.tm-st.tm>3*1440){st.n++;st.tm=G.tm;}
    if(d>70)continue;const tem=AVES.filter(b=>b.sp==='galinha'&&b.sitio&&b.sitio.id===s.id).length;
    for(let k=tem;k<st.n;k++){for(let t=0;t<8;t++){const a=Math.random()*6.283,r=s.r+1+Math.random()*3,x=s.x+Math.cos(a)*r,z=s.z+Math.sin(a)*r;
        if(!dentroMapa(x,z,4)||pointBlocked(x,z,0.3)||salaEm(x,ground(x,z)+0.4,z))continue;if(Math.hypot(x-P.x,z-P.z)<12)continue;const b=criarAve('galinha',x,z,{g:++aveGrupoId});b.sitio={id:s.id,x,z};break;}}}});
INTERS.push(function galPegar(tryIt){if(!P.alive||P.montado||CARRO.ativo||(P.agK||0)<0.5)return;for(const b of AVES){if(b.sp!=='galinha'||!b.sitio||b.st!=='chao')continue;
  if(Math.abs(b.x-P.x)>2.2||Math.abs(b.z-P.z)>2.2)continue;tryIt({k:'pegarGalinha',o:{x:b.x,z:b.z,b}},b.x,b.z,2.0,2.6,-0.8);}});
INTER_K.pegarGalinha={texto:()=>({t:'Pegar a galinha',s:'segure, agachado e quieto',hold:true,dur:1.1}),
  usar:(o,seg)=>{const b=o&&o.b;if(!seg||!b||!AVES.includes(b)||Math.hypot(b.x-P.x,b.z-P.z)>2.6){feed('A galinha escapou',true);return;}
    if(invAdd('galinha',1)){feed('Mochila cheia',true);return;}AVES.splice(AVES.indexOf(b),1);const st=e15().gal[b.sitio.id];if(st){st.n=Math.max(0,st.n-1);st.tm=G.tm;}
    sfx('aveCanto',P.x,P.z,0.8,'galinha');feed('Pegou uma galinha. Solte num galinheiro (B → Animais).');invRender();hudBarra();
    dica('galinha','corpo','Galinha na mochila! Construa um galinheiro (B → Animais), toque E nele e solte a galinha. Com milho e água ela põe um ovo por dia.');}};
/* galinheiro: comida, água, ovos, pintinhos, esterco */
const GAL_CFG={cap:8,ovosMax:12,pintoDias:2,cresceDias:3,comidaPor:{milho:3,sementes:1,feijaoVerde:2,abobora:2},aguaGarrafa:4,aguaMax:12,comidaMax:20};
function galPasso(o){const e=o.ext;if(e.g===undefined){Object.assign(e,{g:0,pin:[],comida:0,agua:0,ovos:0,esterco:0,tmUlt:G.tm,semCA:0,prox:G.tm+GAL_CFG.pintoDias*1440,acO:0,acE:0});}
  const dm=Math.max(0,Math.min(4320,G.tm-e.tmUlt));e.tmUlt=G.tm;if(!(dm>0))return;const dia=dm/1440,n=e.g+e.pin.length*0.4;
  // água do bebedouro perto (até 5 m) enche a vasilha
  if(e.agua<GAL_CFG.aguaMax)for(const b of OB){if(b.tipo!=='bebedouro'||!b.ext||!(b.ext.agua>0)||d2(b.x,b.z,o.x,o.z)>25)continue;const q=Math.min(b.ext.agua,GAL_CFG.aguaMax-e.agua);b.ext.agua-=q;e.agua+=q;if(e.agua>=GAL_CFG.aguaMax)break;}
  const ok=e.comida>0&&e.agua>0;e.comida=Math.max(0,e.comida-n*dia);e.agua=Math.max(0,e.agua-n*0.5*dia);
  if(ok){e.semCA=0;e.acO+=e.g*dia;const k=Math.floor(e.acO);if(k>0){e.acO-=k;e.ovos=Math.min(GAL_CFG.ovosMax,e.ovos+k);}}
  else if(e.g+e.pin.length>0){e.semCA+=dm;if(e.semCA>=2880){e.semCA=1440;if(e.pin.length)e.pin.pop();else e.g--;if(Math.hypot(o.x-P.x,o.z-P.z)<150)toast('perigo','Uma galinha morreu no galinheiro: faltou '+(e.comida<=0?'comida':'água')+'.');}}
  e.acE+=n*dia*0.5;const ke=Math.floor(e.acE);if(ke>0){e.acE-=ke;e.esterco=Math.min(10,e.esterco+ke);}
  for(let i=e.pin.length-1;i>=0;i--)if(G.tm-e.pin[i]>=GAL_CFG.cresceDias*1440){e.pin.splice(i,1);e.g++;}
  if(G.tm>=e.prox){e.prox=G.tm+GAL_CFG.pintoDias*1440;if(ok&&e.g>=2&&e.g+e.pin.length<GAL_CFG.cap&&Math.random()<0.75){e.pin.push(G.tm);if(Math.hypot(o.x-P.x,o.z-P.z)<60)feed('Nasceu um pintinho no galinheiro');}}}
ESTACAO_UI.galinheiro={resumo:o=>{galPasso(o);const e=o.ext;return e.g+' galinha'+(e.g===1?'':'s')+(e.pin.length?' e '+e.pin.length+' pintinho'+(e.pin.length>1?'s':''):'')+(e.ovos?' · '+e.ovos+' ovo'+(e.ovos>1?'s':''):'');},
  render(o){galPasso(o);const e=o.ext,cm=Object.keys(GAL_CFG.comidaPor).find(k=>invCount(k)>0),ag=invCount('agua')?'agua':invCount('aguaSuja')?'aguaSuja':null;
    let c='<div class="es-lista">'+cavMedidor('Comida',Math.min(1,e.comida/GAL_CFG.comidaMax),e.comida>0?'dá para uns '+Math.max(1,Math.floor(e.comida/Math.max(1,e.g+e.pin.length*0.4)))+' dia(s)':'acabou')+
      cavMedidor('Água',e.agua/GAL_CFG.aguaMax,Math.round(e.agua)+' L de '+GAL_CFG.aguaMax+' L')+'</div>';
    c+='<p class="es-info">'+e.g+' galinha'+(e.g===1?'':'s')+', '+e.pin.length+' pintinho'+(e.pin.length===1?'':'s')+' (cabem '+GAL_CFG.cap+'). Ovos: <b>'+e.ovos+'</b>. Esterco: <b>'+e.esterco+'</b>.'+(e.g>=2?' Com comida e água nasce pintinho a cada dois dias.':'')+'</p>';
    const A=[{id:'ovos',t:'Recolher ovos',s:e.ovos+' pronto'+(e.ovos===1?'':'s'),ok:e.ovos>0,prim:e.ovos>0},
      {id:'comida',t:'Pôr comida',s:cm?ITEMS[cm].nome.toLowerCase()+' (tem '+invCount(cm)+')':'milho, sementes, feijão ou abóbora',ok:!!cm&&e.comida<GAL_CFG.comidaMax},
      {id:'agua',t:'Pôr água',s:ag?'1 garrafa = '+GAL_CFG.aguaGarrafa+' L':'garrafa d\'água (ou bebedouro a até 5 m)',ok:!!ag&&e.agua<GAL_CFG.aguaMax},
      {id:'soltar',t:'Soltar galinha aqui',s:invCount('galinha')?'tem '+invCount('galinha'):'pegue as soltas perto da fazenda',ok:invCount('galinha')>0&&e.g+e.pin.length<GAL_CFG.cap},
      {id:'esterco',t:'Recolher esterco',s:e.esterco+'',ok:e.esterco>0},{id:'pegar',t:'Pegar uma galinha',s:'para levar a outro galinheiro',ok:e.g>0},
      {id:'abater',t:e.abaterConf?'Confirmar: abater':'Abater uma galinha',s:e.abaterConf?'toque de novo':'carne crua',ok:e.g>0}];
    return{sub:'Galinhas, ovos e pintinhos',corpo:c,acoes:A};},
  acao(o,id){const e=o.ext;galPasso(o);if(id!=='abater')e.abaterConf=false;
    switch(id){
      case'ovos':{const l=invAdd('ovo',e.ovos);const n=e.ovos-l;e.ovos=l;if(n){if(typeof diarioConta==='function')diarioConta('ovos',n);progresso&&progresso('colheita');}return n?n+' ovo'+(n>1?'s':'')+' na mochila':'Mochila cheia';}
      case'comida':{const k=Object.keys(GAL_CFG.comidaPor).find(q=>invCount(q)>0);if(!k)return'Sem comida para galinha';let n=0;while(invCount(k)>0&&e.comida<GAL_CFG.comidaMax){invRemove(k,1);e.comida+=GAL_CFG.comidaPor[k];n++;}return'Pôs '+n+' '+ITEMS[k].nome.toLowerCase();}
      case'agua':{let n=0;while(e.agua<GAL_CFG.aguaMax){const k=invCount('agua')?'agua':invCount('aguaSuja')?'aguaSuja':null;if(!k)break;invRemove(k,1);invAdd('garrafa',1);e.agua=Math.min(GAL_CFG.aguaMax,e.agua+GAL_CFG.aguaGarrafa);n++;}return n?'Pôs água ('+n+' garrafa'+(n>1?'s':'')+')':'Sem garrafa d\'água';}
      case'soltar':{let n=0;while(invCount('galinha')>0&&e.g+e.pin.length<GAL_CFG.cap){invRemove('galinha',1);e.g++;n++;}sfx('aveCanto',o.x,o.z,0.7,'galinha');
        dica('galinheiro','corpo','Galinhas no galinheiro! Ponha milho (ou sementes, feijão, abóbora) e água. Cada galinha alimentada põe um ovo por dia; duas ou mais fazem pintinhos.');return n+' galinha'+(n>1?'s':'')+' no galinheiro';}
      case'esterco':{const l=invAdd('esterco',e.esterco);const n=e.esterco-l;e.esterco=l;return n+' esterco na mochila';}
      case'pegar':if(e.g<=0)return'';if(invAdd('galinha',1))return'Mochila cheia';e.g--;return'Pegou uma galinha';
      case'abater':if(e.g<=0)return'';if(!e.abaterConf){e.abaterConf=true;return'Toque de novo para confirmar';}e.abaterConf=false;e.g--;ganhar('carneCrua',1);return'Abateu uma galinha';}
    return'';}};
/* as galinhas do galinheiro ciscam em volta dele */
function galVisuais(o){const e=o.ext;if(e.g===undefined)return;const quer=Math.min(6,e.g)+Math.min(4,e.pin.length);o.__aves=(o.__aves||[]).filter(b=>AVES.includes(b));
  while(o.__aves.length>quer){const b=o.__aves.pop();const i=AVES.indexOf(b);if(i>=0)AVES.splice(i,1);}
  while(o.__aves.length<quer){const pinto=o.__aves.length>=Math.min(6,e.g),a=Math.random()*6.283,r=1.3+Math.random()*1.2,x=o.x+Math.cos(a)*r,z=o.z+Math.sin(a)*r;
    const b=criarAve('galinha',x,z,{g:++aveGrupoId});b.casa=o;if(pinto){b.s*=0.45;b.pinto=true;}o.__aves.push(b);}}
let galVisT=0;
PASSOS.push(function galinheiros(dt){if(G.modo!=='jogo')return;galVisT-=dt;if(galVisT>0)return;galVisT=2;for(let i=AVES.length-1;i>=0;i--){const b=AVES[i];if(b.casa&&(!OB.includes(b.casa)||b.casa.hp<=0))AVES.splice(i,1);}   // galinheiro desmontado: as galinhas de enfeite somem
  for(const o of OB){if(o.tipo!=='galinheiro'||o.hp<=0)continue;galPasso(o);
  if(Math.hypot(o.x-P.x,o.z-P.z)<70&&MESH.ave&&!((E.n||0)>0.6))galVisuais(o);else if(o.__aves){for(const b of o.__aves){const i=AVES.indexOf(b);if(i>=0)AVES.splice(i,1);}o.__aves=[];}}});

/* ---------- vaca, ovelha, cabra e coelho: domar, levar, curral, produtos, filhotes ---------- */
const CRIA_SP={
  vaca:{com:{feno:0.3,milho:0.3,abobora:0.25,cenoura:0.25,batata:0.2,frutas:0.15},prod:{id:'leite',cada:1440,n:2,acao:'Ordenhar'},filhote:6,esterco:1},
  ovelha:{com:{feno:0.3,milho:0.3,cenoura:0.3,frutas:0.2,maca:0.35},prod:{id:'la',cada:4320,n:3,acao:'Tosquiar',lamina:true},filhote:4,esterco:0.5},
  cabra:{com:{feno:0.3,milho:0.3,frutas:0.3,cenoura:0.3,maca:0.35,abobora:0.25},prod:{id:'leite',cada:2880,n:1,acao:'Ordenhar'},filhote:4,esterco:0.5},
  coelho:{com:{cenoura:0.45,frutas:0.3,feijaoVerde:0.3,maca:0.3},prod:null,filhote:2,esterco:0.25}};
const CRIA_CFG={cap:8,cresceDias:3,fomeH:2.2,sedeH:2.6,max:16};
const CRIACAO=[];
const criaNome=b=>FAUNA[b.tipo].nome+(b.nasc!==undefined&&b.nasc!==null&&G.tm-b.nasc<CRIA_CFG.cresceDias*1440?' (filhote)':'');
function criaComida(tipo){const C=CRIA_SP[tipo];if(!C)return null;let best=null,bv=-1;for(const k in C.com)if(invCount(k)>0&&C.com[k]>bv){bv=C.com[k];best=k;}return best;}
function calmoComCria(b,dp){return P.alive&&!CARRO.ativo&&!P.montado&&(P.agK||0)>0.5&&!P.correndo&&Math.hypot(P.vx,P.vz)<2.4&&dp<18&&!!criaComida(b.tipo);}
{const _fp=faunaPercebe;faunaPercebe=function(b,S,dt,dp){if(!CRIA_SP[b.tipo]||b.domado)return _fp.apply(this,arguments);const a0=b.alerta;_fp.apply(this,arguments);
  if(calmoComCria(b,dp)&&b.golpeadoT<=0){const g=b.alerta-a0;if(g>0)b.alerta=a0+g*0.06*(1-0.8*(b.conf||0));b.alerta=Math.min(b.alerta,0.55);}};}
{const _fr=faunaRotina;faunaRotina=function(b,S,dt,dp){if(CRIA_SP[b.tipo]&&!b.domado){if(!(calmoComCria(b,dp)&&dp<12))b.conf=Math.max(0,(b.conf||0)-dt*0.0015);
    if(b.maoT>0){b.maoT-=dt;b.st='come';b.vAlvo=0;b.yaw=angLerp(b.yaw,Math.atan2(P.x-b.x,P.z-b.z),1-Math.exp(-dt*4));return;}
    if((b.conf||0)>0.25&&calmoComCria(b,dp)&&dp<14&&b.st!=='foge'){if(dp>2.3){b.st='explora';b.rx=P.x-b.x;b.rz=P.z-b.z;b.vAlvo=S.anda*0.8;b.t=0.5;return;}
      b.st='come';b.vAlvo=0;b.t=2;b.yaw=angLerp(b.yaw,Math.atan2(P.x-b.x,P.z-b.z),1-Math.exp(-dt*3));return;}}
  return _fr.apply(this,arguments);};}
INTERS.push(function criaInter(tryIt){if(!P.alive||CARRO.ativo||P.nada||P.montado)return;
  for(const b of BICHOS){if(!CRIA_SP[b.tipo]||!b.vivo||Math.abs(b.x-P.x)>4||Math.abs(b.z-P.z)>4)continue;const r=Math.max(2.2,FAUNA[b.tipo].r*b.ch.s+1.8);
    if(b.domado)tryIt({k:'cria',o:b},b.x,b.z,r,3.2,-0.7);else if(b.st!=='foge')tryIt({k:'criaDomar',o:b},b.x,b.z,r+0.6,3.2,-0.7);}});
INTER_K.criaDomar={texto:b=>{const c=b.conf||0,f=criaComida(b.tipo),nm=FAUNA[b.tipo].nome.toLowerCase(),pct=Math.round(c*100)+'%';
    if(c>=0.97)return invCount('corda')?{t:'Laçar com a corda e levar a '+nm,s:'segure · confiança cheia',hold:true,dur:2.0}:{t:FAUNA[b.tipo].nome+' calma (confiança cheia)',s:'precisa de uma corda'};
    if(!f)return{t:FAUNA[b.tipo].nome+' arisca',s:'traga '+Object.keys(CRIA_SP[b.tipo].com).map(k=>ITEMS[k]?ITEMS[k].nome.toLowerCase():k).slice(0,3).join(', ')+' e chegue agachado'};
    return{t:'Oferecer '+ITEMS[f].nome.toLowerCase()+' na mão',s:((P.agK||0)>0.5?'segure, devagar':'agache')+' · confiança '+pct,hold:true,dur:1.8};},
  usar:(b,seg)=>{if(!seg||!b.vivo||b.domado)return;const c=b.conf||0;
    if(c>=0.97){if(!invRemove('corda',1)){feed('Precisa de uma corda',true);return;}if(CRIACAO.length>=CRIA_CFG.max){feed('Você já cuida de muitos animais',true);return;}domarCria(b);return;}
    const f=criaComida(b.tipo);if(!f)return;if((P.agK||0)<0.5){b.alerta=1.2;faunaFugir(b,{x:P.x,z:P.z},6);feed('Assustou: chegue agachado',true);return;}
    invRemove(f,1);b.conf=Math.min(1,c+CRIA_SP[b.tipo].com[f]);if(b.conf>0.97)b.conf=1;b.alerta=0;b.maoT=2;sfx('cavaloCome',b.x,b.z,0.6);
    feed(b.conf>=0.97?FAUNA[b.tipo].nome+' confia em você. Segure E com uma corda para levar.':FAUNA[b.tipo].nome+' comeu da sua mão · confiança '+Math.round(b.conf*100)+'%');invRender();hudBarra();}};
function domarCria(b){const F=faunaEstado();if(b.zona&&F.z[b.zona]&&F.z[b.zona][b.tipo])F.z[b.zona][b.tipo].n=Math.max(0,F.z[b.zona][b.tipo].n-1);
  for(const o of BICHOS)if(o.lider===b)o.lider=null;
  Object.assign(b,{domado:true,cria:true,zona:null,lider:null,conf:1,modo:'segue',fome:35,sede:35,prodTm:G.tm,nasc:null,curral:null,tmUlt:G.tm,st:'explora',t:2,v:0,alerta:0,amea:null,cid:++CRIA_ID});
  CRIACAO.push(b);faunaSom(b,'idle');ganharXP(12);
  toast('corpo',FAUNA[b.tipo].nome+' domada! Ela vem atrás de você. Perto de um curral (B → Animais), segure E nela → Pôr no curral.');
  if(typeof diarioEvento==='function')diarioEvento('Domou: '+FAUNA[b.tipo].nome.toLowerCase(),'caca');}
let CRIA_ID=0;
/* os domados não rodam a rotina dos selvagens: tira antes, devolve depois */
{const _ub=updateBichos;updateBichos=function(dt){for(let i=BICHOS.length-1;i>=0;i--){const b=BICHOS[i];if(b.cria&&b.domado&&b.vivo)BICHOS.splice(i,1);}
  _ub.apply(this,arguments);if(!ZMESH.bicho_coelho)return;
  for(let i=CRIACAO.length-1;i>=0;i--){const b=CRIACAO[i];if(!b.vivo){CRIACAO.splice(i,1);continue;}if(!BICHOS.includes(b))BICHOS.push(b);criaIA(b,dt);}};}
{const _fm=faunaMorre;faunaMorre=function(b){const era=b.cria&&b.domado;const r=_fm.apply(this,arguments);if(era){const i=CRIACAO.indexOf(b);if(i>=0)CRIACAO.splice(i,1);}return r;};}
function curralDe(b){if(!b.curral)return null;for(const o of OB)if(o.tipo==='curral'&&o.hp>0&&d2(o.x,o.z,b.curral.x,b.curral.z)<1)return o;return null;}
function criaCresce(b){if(b.nasc===null||b.nasc===undefined)return;const k=clamp((G.tm-b.nasc)/(CRIA_CFG.cresceDias*1440),0,1);const S=FAUNA[b.tipo];
  b.ch.s=lerp(0.5,b.sAdulto||1,k);b.hpMax=S.hp*b.ch.s;if(k>=1){b.nasc=null;}}
function criaIA(b,dt){const S=FAUNA[b.tipo],dp=Math.hypot(b.x-P.x,b.z-P.z),dm=Math.max(0,Math.min(240,G.tm-(b.tmUlt??G.tm)));b.tmUlt=G.tm;
  b.t-=dt;b.flash=Math.max(0,(b.flash||0)-dt);b.golpeadoT=Math.max(0,(b.golpeadoT||0)-dt);criaCresce(b);
  b.fome=clamp((b.fome||0)+dm/60*CRIA_CFG.fomeH,0,100);b.sede=clamp((b.sede||0)+dm/60*CRIA_CFG.sedeH,0,100);
  if(b.fome>=100||b.sede>=100){b.hp-=b.hpMax*dm/60*0.04;if(b.hp<=0){b.hp=1;faunaMorre(b,'fome',1);if(dp<150)toast('perigo',criaNome(b)+' morreu de '+(b.fome>=100?'fome':'sede')+'.');return;}}
  else if(b.fome<70&&b.sede<70&&b.hp<b.hpMax)b.hp=Math.min(b.hpMax,b.hp+b.hpMax*dm/60*0.05);
  const C=curralDe(b);if(b.modo==='curral'&&!C){b.modo='fica';b.fx=b.x;b.fz=b.z;}
  let tx=null,tz=null,vA=0,st=null;b.alvoObra=null;
  // comer no cocho e beber no bebedouro (do curral, ou a até 8 m)
  const perto=(tipo,ok)=>{let best=null,bd=1e9;for(const o of OB){if(o.tipo!==tipo||o.hp<=0||!ok(o))continue;if(C?!curralDentro(C,o.x,o.z,-0.2):d2(o.x,o.z,b.x,b.z)>64)continue;const d=d2(o.x,o.z,b.x,b.z);if(d<bd){bd=d;best=o;}}return best;};
  const quer=b.sede>35?'bebe':b.fome>35?'come':null;
  if(quer&&b.modo!=='segue'){const alvo=quer==='bebe'?perto('bebedouro',o=>o.ext&&o.ext.agua>0.5):perto('cocho',o=>o.itens&&o.itens.some(s=>s&&CRIA_SP[b.tipo].com[s.id]!==undefined));
    if(alvo){const d=Math.hypot(alvo.x-b.x,alvo.z-b.z),enc=OBRAS[alvo.tipo].hw+S.r*b.ch.s+0.5;
      if(d>enc){tx=alvo.x;tz=alvo.z;vA=S.anda;st='explora';b.alvoObra=alvo;b.alvoEnc=enc;}
      else{st='come';b.yaw=angLerp(b.yaw,Math.atan2(alvo.x-b.x,alvo.z-b.z),1-Math.exp(-dt*3));b.comeT=(b.comeT||0)+dt;
        if(b.comeT>3){b.comeT=0;if(quer==='bebe'){const q=Math.min(alvo.ext.agua,4);alvo.ext.agua-=q;b.sede=Math.max(0,b.sede-q*12);}
          else{for(const s of alvo.itens){if(!s||CRIA_SP[b.tipo].com[s.id]===undefined)continue;s.n--;b.fome=Math.max(0,b.fome-(s.id==='feno'?35:22));if(s.n<=0)alvo.itens[alvo.itens.indexOf(s)]=null;break;}}
          if(dp<30)sfx('cavaloCome',b.x,b.z,0.4);}}}}
  if(tx===null&&st===null){
    if(b.modo==='segue'&&P.alive&&!CARRO.ativo){const bb=P.body,gx=P.x-Math.sin(bb)*2.6+Math.cos(bb)*0.9,gz=P.z-Math.cos(bb)*2.6-Math.sin(bb)*0.9,dg=Math.hypot(gx-b.x,gz-b.z);
      if(dp>60){b.modo='fica';b.fx=b.x;b.fz=b.z;}else if(dg>1.3&&dp>1.8){tx=gx;tz=gz;vA=dg>8?S.trota:S.anda*1.2;st='explora';}}
    else if(b.modo==='curral'&&C){if(!curralDentro(C,b.x,b.z,0.6)){const D=OBRAS.curral,[u,v]=curralLocal(C,b.x,b.z);   // de fora: vai até a porteira e entra por ela
        const p=curralDentro(C,b.x,b.z,0)?[C.x,C.z]:Math.abs(u)<0.9&&v<-D.hd+0.8&&v>-D.hd-2.2?owl(C,0,-D.hd+1.8):owl(C,clamp(u*0.3,-0.4,0.4),-D.hd-1.6);tx=p[0];tz=p[1];vA=S.anda;st='explora';}
      else{if(b.t<=0){b.t=4+Math.random()*8;const D=OBRAS.curral;b.pasto=Math.random()<0.5?null:owl(C,(Math.random()-0.5)*(D.hw-1)*2,(Math.random()-0.5)*(D.hd-1)*2);}
        if(b.pasto&&Math.hypot(b.pasto[0]-b.x,b.pasto[1]-b.z)>0.6){tx=b.pasto[0];tz=b.pasto[1];vA=S.anda*0.7;st='explora';}}}
    else{const ax=b.fx??b.x,az=b.fz??b.z,da=Math.hypot(ax-b.x,az-b.z);if(da>4){tx=ax;tz=az;vA=S.anda;st='explora';}}}
  if(st===null)st='come';b.st=st;b.vAlvo=vA;if(tx!==null){b.rx=tx-b.x;b.rz=tz-b.z;}
  criaMove(b,S,dt);
  b.ch.vis=dp<110;b.ch.tint=b.flash>0?[2.2,1.3,1.3]:[1,1,1];if(b.ch.vis)faunaPose(b,S,dt);
  b.somT=(b.somT||10)-dt;if(b.somT<=0){b.somT=16+Math.random()*30;if(dp<35)faunaSom(b,'idle');}}
/* andar dos domados: olha pouco à frente (o curral é pequeno) e, chegando no cocho ou no bebedouro, vai reto até encostar */
function criaMove(b,S,dt){let va=b.st==='come'?0:(b.vAlvo||0);
  if(va>0.05){let dx=b.rx,dz=b.rz;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const rr=S.r*b.ch.s,look=rr+0.7;
    const perto=b.alvoObra&&l<(b.alvoEnc||2)+1.3;
    const livre=(ax,az)=>{const x=b.x+ax*look,z=b.z+az*look;return dentroMapa(x,z,4)&&!pointBlocked(x,z,rr*0.6)&&!(RIO.ok&&aguaNivel(x,z)!==null&&aguaProfVeic(x,z)>0.5);};
    if(!perto&&!livre(dx,dz)){let ok=false;for(const a of[0.6,-0.6,1.2,-1.2,1.9,-1.9,2.6,-2.6]){const c=Math.cos(a),s2=Math.sin(a),nx=dx*c-dz*s2,nz=dx*s2+dz*c;if(livre(nx,nz)){dx=nx;dz=nz;ok=true;break;}}if(!ok)va=0;}
    b.yaw=angLerp(b.yaw,Math.atan2(dx,dz),1-Math.exp(-dt*4));}
  b.v=approach(b.v||0,va,dt*(va>(b.v||0)?S.corre:S.corre*2));if(b.v<0.01){b.y=chaoBicho(b.x,b.z);return;}
  const ox=b.x,oz=b.z;b.x+=Math.sin(b.yaw)*b.v*dt;b.z+=Math.cos(b.yaw)*b.v*dt;collide(b,S.r*b.ch.s,c=>c.solid);
  if(!dentroMapa(b.x,b.z,4)){b.x=ox;b.z=oz;b.v=0;}b.y=chaoBicho(b.x,b.z);}
const criaProdPronto=b=>{const P0=CRIA_SP[b.tipo].prod;return!!P0&&b.nasc===null&&b.fome<70&&b.sede<70&&G.tm-(b.prodTm||0)>=P0.cada;};
function criaTirarProd(b){const P0=CRIA_SP[b.tipo].prod;if(!P0||!criaProdPronto(b))return 0;if(P0.lamina&&!temLamina()){feed('Precisa de uma faca para tosquiar',true);return 0;}
  const l=invAdd(P0.id,P0.n);if(l>=P0.n){feed('Mochila cheia',true);return 0;}b.prodTm=G.tm;sfx('pegar');return P0.n-l;}
INTER_K.cria={texto:b=>{const C=CRIA_SP[b.tipo],pr=criaProdPronto(b);return{t:criaNome(b)+(b.modo==='curral'?' · no curral':b.modo==='segue'?' · seguindo':''),
    s:(pr?C.prod.acao.toLowerCase()+' pronto · ':'')+'toque: '+(b.modo==='segue'?'esperar':'seguir')+' · segure: cuidar',alt:true,dur:0.55};},
  curto:b=>{if(b.modo==='segue'){b.modo='fica';b.fx=b.x;b.fz=b.z;feed(FAUNA[b.tipo].nome+' vai esperar aqui');}else{b.modo='segue';feed(FAUNA[b.tipo].nome+' vem com você');}},
  usar:(b,seg)=>{if(seg){b.estTipo='cria';b.nome=criaNome(b);abrirEstacao(b);}else INTER_K.cria.curto(b);}};
function curralPerto(b,r){let best=null,bd=(r||15)**2;for(const o of OB){if(o.tipo!=='curral'||o.hp<=0)continue;const d=d2(o.x,o.z,b.x,b.z);if(d<bd){bd=d;best=o;}}return best;}
const curralAnimais=o=>CRIACAO.filter(b=>b.vivo&&b.modo==='curral'&&b.curral&&d2(o.x,o.z,b.curral.x,b.curral.z)<1);
ESTACAO_UI.cria={resumo:b=>criaNome(b),
  render(b){const C=CRIA_SP[b.tipo],pr=C.prod,f=criaComida(b.tipo),cu=curralPerto(b);
    let c='<div class="es-lista">'+cavMedidor('Vida',b.hp/b.hpMax,Math.round(b.hp)+' de '+Math.round(b.hpMax))+cavMedidor('Fome',1-b.fome/100,b.fome>70?'com fome':'alimentada')+cavMedidor('Sede',1-b.sede/100,b.sede>70?'com sede':'bebeu')+
      (pr?cavMedidor(pr.acao,Math.min(1,(G.tm-(b.prodTm||0))/pr.cada),criaProdPronto(b)?'pronto: '+pr.n+' '+ITEMS[pr.id].nome.toLowerCase():b.nasc!==null?'filhote ainda':'em '+horasTxt(pr.cada-(G.tm-(b.prodTm||0)))):'')+'</div>';
    c+='<p class="es-info">'+(b.modo==='curral'?'No curral: come no cocho e bebe no bebedouro de lá.':b.modo==='segue'?'Seguindo você.':'Esperando aqui.')+'</p>';
    const A=[];if(pr)A.push({id:'prod',t:pr.acao,s:pr.lamina?'precisa de faca':'',ok:criaProdPronto(b),prim:criaProdPronto(b)});
    A.push({id:'comer',t:'Dar comida',s:f?ITEMS[f].nome.toLowerCase():'nada que ela coma',ok:!!f&&b.fome>3});
    if(b.modo!=='curral')A.push({id:'curral',t:'Pôr no curral',s:cu?'o curral a '+Math.round(Math.hypot(cu.x-b.x,cu.z-b.z))+' m':'nenhum curral perto (15 m)',ok:!!cu,prim:!!cu&&!criaProdPronto(b)});
    A.push({id:b.modo==='segue'?'fica':'segue',t:b.modo==='segue'?'Esperar aqui':'Seguir você',s:''});
    A.push({id:'abater',t:b.abaterConf?'Confirmar: abater':'Abater',s:b.abaterConf?'toque de novo':'vira carcaça para esfolar'});
    return{sub:FAUNA[b.tipo].nome+' domada',corpo:c,acoes:A};},
  acao(b,id){if(id!=='abater')b.abaterConf=false;
    switch(id){case'prod':{const n=criaTirarProd(b);return n?n+' '+ITEMS[CRIA_SP[b.tipo].prod.id].nome.toLowerCase()+' na mochila':'Ainda não';}
      case'comer':{const f=criaComida(b.tipo);if(!f)return'';invRemove(f,1);b.fome=Math.max(0,b.fome-30);return'Comeu '+ITEMS[f].nome.toLowerCase();}
      case'curral':{const cu=curralPerto(b);if(!cu)return'Nenhum curral perto';if(curralAnimais(cu).length>=CRIA_CFG.cap)return'O curral está cheio ('+CRIA_CFG.cap+')';b.modo='curral';b.curral={x:cu.x,z:cu.z};
        dica('curral','corpo','No curral o animal come no cocho e bebe no bebedouro que estiverem dentro dele. Casal da mesma espécie, alimentado, tem filhote.');return FAUNA[b.tipo].nome+' vai para o curral';}
      case'fica':b.modo='fica';b.fx=b.x;b.fz=b.z;return'Vai esperar aqui';case'segue':b.modo='segue';return'Vem com você';
      case'abater':if(!b.abaterConf){b.abaterConf=true;return'Toque de novo para confirmar';}fecharEstacao();ferirBicho(b,99999,0,0,'abate');return'';}
    return'';}};
/* curral: produtos, esterco e filhotes */
function curralPasso(o){const e=o.ext;if(e.tmUlt===undefined){e.tmUlt=G.tm;e.esterco=0;e.acE=0;e.prox={};}const dm=Math.max(0,Math.min(4320,G.tm-e.tmUlt));e.tmUlt=G.tm;const L=curralAnimais(o);
  for(const b of L){e.acE+=dm/1440*(CRIA_SP[b.tipo].esterco||0.5)*(b.nasc!==null?0.4:1);}const ke=Math.floor(e.acE);if(ke>0){e.acE-=ke;e.esterco=Math.min(12,e.esterco+ke);}
  for(const sp in CRIA_SP){const A=L.filter(b=>b.tipo===sp&&b.nasc===null&&b.fome<70&&b.sede<70);if(A.length<2){e.prox[sp]=undefined;continue;}
    if(e.prox[sp]===undefined){e.prox[sp]=G.tm+CRIA_SP[sp].filhote*1440;continue;}
    if(G.tm>=e.prox[sp]){e.prox[sp]=G.tm+CRIA_SP[sp].filhote*1440;if(L.length<CRIA_CFG.cap){const m=A[0],a=Math.random()*6.283,x=m.x+Math.cos(a)*0.8,z=m.z+Math.sin(a)*0.8;
        const f=criarBicho(sp,x,z,{var:m.var,s:0.5});if(f){Object.assign(f,{domado:true,cria:true,zona:null,lider:null,conf:1,modo:'curral',curral:{x:o.x,z:o.z},fome:20,sede:20,prodTm:G.tm,nasc:G.tm,sAdulto:m.sAdulto||m.ch.s||1,tmUlt:G.tm,cid:++CRIA_ID});
          const i=BICHOS.indexOf(f);if(i>=0)BICHOS.splice(i,1);CRIACAO.push(f);if(Math.hypot(o.x-P.x,o.z-P.z)<80)feed('Nasceu um filhote de '+FAUNA[sp].nome.toLowerCase()+' no curral');
          if(typeof diarioEvento==='function')diarioEvento('Nasceu um filhote de '+FAUNA[sp].nome.toLowerCase(),'caca');}}}}}
ESTACAO_UI.curral={resumo:o=>{curralPasso(o);const L=curralAnimais(o);return L.length+(L.length===1?' animal':' animais')+' · esterco '+o.ext.esterco;},
  render(o){curralPasso(o);const L=curralAnimais(o),cont={},prontos=L.filter(criaProdPronto);for(const b of L){const k=b.tipo+(b.nasc!==null&&b.nasc!==undefined?':f':'');cont[k]=(cont[k]||0)+1;}
    const cocho=OB.find(q=>q.tipo==='cocho'&&q.hp>0&&curralDentro(o,q.x,q.z,-0.2)),beb=OB.find(q=>q.tipo==='bebedouro'&&q.hp>0&&curralDentro(o,q.x,q.z,-0.2));
    const comida=cocho?cocho.itens.filter(Boolean).reduce((t,s)=>t+(['feno','milho','abobora','cenoura','batata','frutas','maca','feijaoVerde'].includes(s.id)?s.n:0),0):0;
    let c='<p class="es-info">'+(L.length?Object.entries(cont).map(([k,n])=>{const[t,f]=k.split(':'),S=FAUNA[t];return f?n+(n>1?' filhotes de ':' filhote de ')+S.nome.toLowerCase():n+' '+(n>1?S.pl:S.nome.toLowerCase());}).join(', '):'Nenhum animal. Leve um animal domado até aqui e, no painel dele, "Pôr no curral".')+' (cabem '+CRIA_CFG.cap+')<br>'+
      'Cocho: '+(cocho?comida+' porções':'<b>falta um cocho dentro</b>')+' · Bebedouro: '+(beb?Math.round(beb.ext.agua||0)+' L':'<b>falta um bebedouro dentro</b>')+'<br>Esterco: '+o.ext.esterco+'. Casal da mesma espécie, com comida e água, tem filhote.</p>';
    const ord=prontos.filter(b=>CRIA_SP[b.tipo].prod.id==='leite').length,tos=prontos.filter(b=>CRIA_SP[b.tipo].prod.id==='la').length;
    return{sub:'Vacas, ovelhas, cabras e coelhos domados',corpo:c,acoes:[{id:'ordenhar',t:'Ordenhar',s:ord?ord+' pronta'+(ord>1?'s':''):'nenhuma pronta',ok:ord>0,prim:ord>0},{id:'tosquiar',t:'Tosquiar',s:tos?tos+' pronta'+(tos>1?'s':'')+' · precisa de faca':'nenhuma pronta',ok:tos>0},
      {id:'esterco',t:'Recolher esterco',s:String(o.ext.esterco),ok:o.ext.esterco>0}]};},
  acao(o,id){curralPasso(o);const L=curralAnimais(o).filter(criaProdPronto);
    if(id==='ordenhar'||id==='tosquiar'){const alvo=id==='ordenhar'?'leite':'la';let n=0;for(const b of L)if(CRIA_SP[b.tipo].prod.id===alvo)n+=criaTirarProd(b);return n?n+' '+ITEMS[alvo].nome.toLowerCase()+' na mochila':'Nada pronto';}
    if(id==='esterco'){const l=invAdd('esterco',o.ext.esterco);const n=o.ext.esterco-l;o.ext.esterco=l;return n+' esterco na mochila';}return'';}};
let curralT=0;
PASSOS.push(function currais(dt){if(G.modo!=='jogo')return;curralT-=dt;if(curralT>0)return;curralT=3;for(const o of OB)if(o.tipo==='curral'&&o.hp>0)curralPasso(o);});

/* ---------- bebedouro: garrafas ou a rede de água (enche da caixa ou do barril ligados por cano) ---------- */
const BEB_CFG={cap:40,garrafa:4};
ESTACAO_UI.bebedouro={resumo:o=>Math.round(o.ext.agua||0)+' L de '+BEB_CFG.cap+' L',
  render(o){const e=o.ext;e.agua=e.agua||0;const R=typeof redeDe==='function'?redeDe(o):[o],lig=R.length>1;
    return{sub:'Água para os animais',corpo:'<div class="es-lista">'+cavMedidor('Água',e.agua/BEB_CFG.cap,Math.round(e.agua)+' L de '+BEB_CFG.cap+' L')+'</div><p class="es-info">'+
      (lig?'Ligado na rede de água: enche sozinho da caixa d\'água ou do barril.':'Encha com garrafas, ou ligue com canos (B → Água → Cano) numa caixa d\'água ou num barril da rede.')+' Os animais do curral e as galinhas perto (5 m) bebem daqui.</p>',
      acoes:[{id:'encher',t:'Encher com garrafas',s:'1 garrafa = '+BEB_CFG.garrafa+' L · tem '+(invCount('agua')+invCount('aguaSuja')),ok:invCount('agua')+invCount('aguaSuja')>0&&e.agua<BEB_CFG.cap,prim:true}]};},
  acao(o,id){const e=o.ext;if(id!=='encher')return'';let n=0;while(e.agua<BEB_CFG.cap){const k=invCount('aguaSuja')?'aguaSuja':invCount('agua')?'agua':null;if(!k)break;invRemove(k,1);invAdd('garrafa',1);e.agua=Math.min(BEB_CFG.cap,e.agua+BEB_CFG.garrafa);n++;}
    return n?'Encheu com '+n+' garrafa'+(n>1?'s':''):'Sem garrafa d\'água';}};
if(typeof aguaPasso==='function'){const _ap=aguaPasso;aguaPasso=function(dm){_ap.apply(this,arguments);if(!(dm>0))return;
  for(const b of OB){if(b.tipo!=='bebedouro'||b.hp<=0)continue;const e=b.ext;e.agua=e.agua||0;if(e.agua>=BEB_CFG.cap)continue;const R=redeDe(b);if(R.length<2)continue;
    let falta=Math.min(BEB_CFG.cap-e.agua,dm*0.5);for(const q of R){if(falta<=0)break;if(q.tipo==='caixaAgua'&&q.ext.agua>0){const t=Math.min(q.ext.agua,falta);q.ext.agua-=t;e.agua+=t;falta-=t;}
      else if(q.tipo==='barrilAgua'&&q.ext.limpa>0){const t=Math.min(q.ext.limpa,falta);q.ext.limpa-=t;e.agua+=t;falta-=t;}}}};}

if(typeof redeResumo==='function'){const _rr=redeResumo;redeResumo=function(o){const r=_rr.apply(this,arguments),B=redeDe(o).filter(q=>q.tipo==='bebedouro');
  if(!B.length||!/^Rede:/.test(r))return r;return r.replace(/\.$/,' · bebedouro'+(B.length>1?'s':'')+': '+B.map(q=>Math.round((q.ext&&q.ext.agua)||0)+' L').join(', ')+'.');};}

/* ---------- colmeia: enxame, mel e cera; sem fumigador, ferroada ---------- */
const COL_CFG={chega:1440,cada:2880,melMax:6,ceraMax:3};
function florPerto(o){let n=0;for(const f of FLORES){if(Math.abs(f.x-o.x)>30||Math.abs(f.z-o.z)>30)continue;if(d2(f.x,f.z,o.x,o.z)<900){n++;if(n>=12)break;}}
  for(const q of OB)if((q.tipo==='horta'||OBRAS[q.tipo]&&OBRAS[q.tipo].pomar)&&d2(q.x,q.z,o.x,o.z)<625)n+=4;
  for(const f of FRUTEIRAS)if(d2(f.x,f.z,o.x,o.z)<625)n+=3;
  if(typeof PLANTIO_DEF!=='undefined')for(const d of PLANTIO_DEF)if(d2((d.ax+d.bx)/2,(d.az+d.bz)/2,o.x,o.z)<625)n+=2;return n;}
function colPasso(o){const e=o.ext;if(e.desde===undefined){e.desde=G.tm;e.enxame=false;e.mel=0;e.cera=0;}
  if(!e.enxame){if(G.tm-e.desde>=COL_CFG.chega&&florPerto(o)>=3){e.enxame=true;e.prodTm=G.tm;if(Math.hypot(o.x-P.x,o.z-P.z)<60)toast('corpo','Um enxame de abelhas chegou na colmeia!');}return;}
  while(G.tm-e.prodTm>=COL_CFG.cada){e.prodTm+=COL_CFG.cada;const f=florPerto(o);e.mel=Math.min(COL_CFG.melMax,e.mel+(f>=10?3:2));e.cera=Math.min(COL_CFG.ceraMax,e.cera+1);}}
ESTACAO_UI.colmeia={resumo:o=>{colPasso(o);const e=o.ext;return!e.enxame?'esperando um enxame':e.mel+' de mel · '+e.cera+' de cera';},
  render(o){colPasso(o);const e=o.ext,f=florPerto(o);
    if(!e.enxame)return{sub:'Colmeia vazia',corpo:'<p class="es-info">'+(f>=3?'Tem flor por perto: um enxame deve chegar em '+horasTxt(Math.max(0,COL_CFG.chega-(G.tm-e.desde)))+'.':'Sem flor, horta ou árvore de fruta por perto (30 m): nenhum enxame vai chegar aqui.')+'</p>',acoes:[]};
    return{sub:'Colmeia com abelhas',corpo:'<div class="es-lista">'+cavMedidor('Mel',e.mel/COL_CFG.melMax,e.mel+' de '+COL_CFG.melMax)+cavMedidor('Cera',e.cera/COL_CFG.ceraMax,e.cera+' de '+COL_CFG.ceraMax)+'</div><p class="es-info">Enche a cada dois dias'+(f>=10?' (muita flor: mais mel)':'')+'. '+(invCount('fumigador')?'Com o fumigador, as abelhas ficam calmas.':'Sem fumigador, colher dá ferroada.')+'</p>',
      acoes:[{id:'colher',t:'Colher mel e cera',s:invCount('fumigador')?'usa o fumigador':'sem fumigador: ferroadas!',ok:e.mel+e.cera>0,prim:true}]};},
  acao(o,id){colPasso(o);const e=o.ext;if(id!=='colher'||!(e.mel+e.cera))return'';const fu=P.inv.find(s=>s&&s.id==='fumigador');
    if(fu){gastar(fu,1);for(let i=0;i<14;i++)part(o.x+(Math.random()-0.5)*0.4,o.y+0.9,o.z+(Math.random()-0.5)*0.4,(Math.random()-0.5)*0.4,0.5+Math.random()*0.4,(Math.random()-0.5)*0.4,2.5,0.35,[0.75,0.75,0.72,0.35],false,-0.05);}
    else{const n=2+Math.floor(Math.random()*2);for(let i=0;i<n;i++)ferirJogador(5,null);o.ext.raivaAte=G.t+6;sfx('abelhas',o.x,o.z,1);}
    const m=e.mel-invAdd('mel',e.mel),c=e.cera-invAdd('cera',e.cera);e.mel-=m;e.cera-=c;if(typeof diarioConta==='function')diarioConta('mel',m);
    return(fu?'':'Ai! Ferroadas! ')+'Colheu '+m+' de mel e '+c+' de cera';}};
SONS.abelhas=({noise,tone})=>{noise(1.2,'bandpass',230,210,4,0.16);tone(1.2,'sawtooth',220,232,0.025);};
let colT=0,beeT=0;
PASSOS.push(function colmeias(dt){if(G.modo!=='jogo')return;colT-=dt;beeT-=dt;const zum=beeT<=0;if(zum)beeT=2;
  for(const o of OB){if(o.tipo!=='colmeia'||o.hp<=0)continue;if(colT<=0)colPasso(o);const e=o.ext;if(!e.enxame)continue;const d=Math.hypot(o.x-P.x,o.z-P.z);if(d>28)continue;
    const brava=(e.raivaAte||0)>G.t;if(zum&&d<6)sfx('abelhas',o.x,o.z,brava?0.9:0.4);}if(colT<=0)colT=3;});
/* abelhas: bichinhos pequenos voando em volta da caixa (e em volta de você quando estão bravas) */
DESENHO.opaco.push(function abelhasVoando(Pg){if(!MESH.abelha)return;for(const o of OB){if(o.tipo!=='colmeia'||o.hp<=0||!o.ext||!o.ext.enxame)continue;if(d2(o.x,o.z,cam.pos[0],cam.pos[2])>30*30)continue;
  const brava=(o.ext.raivaAte||0)>G.t,n=brava?16:9;for(let i=0;i<n;i++){const h=i*2.399+o.id*0.7,sp=(1.3+(i%5)*0.4)*(i%2?1:-1),a=G.t*sp+h,r=brava?0.45+0.25*Math.sin(G.t*2.3+i):0.3+((i*37)%10)/10*1.2;
    const cx=brava?P.x:o.x,cz=brava?P.z:o.z,cy=brava?P.y+1.35:o.y+0.95,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,y=cy+Math.sin(G.t*3.1+h)*0.3+(brava?0:((i*13)%7)/7*0.5);
    drawStat(Pg,MESH.abelha,mat(x,y,z,0,-a+(sp>0?0:Math.PI),0));}}});

/* ---------- biodigestor: gás (fogareiro que cozinha) e adubo ---------- */
const BIO_CFG={porH:0.25,gasPor:20,gasMax:100,cozinha:6,aduboPor:4};
const BIO_RESTOS={esterco:{n:1,p:1},carneEstragada:{n:1,p:1},frutas:{n:2,p:1},tomate:{n:2,p:1}};
function bioPasso(o){const e=o.ext;if(e.tmUlt===undefined){Object.assign(e,{tmUlt:G.tm,carga:0,gas:0,adubo:0,acA:0});}const dm=Math.max(0,Math.min(4320,G.tm-e.tmUlt));e.tmUlt=G.tm;
  if(e.carga>0&&dm>0){const q=Math.min(e.carga,dm/60*BIO_CFG.porH);e.carga-=q;e.gas=Math.min(BIO_CFG.gasMax,e.gas+q*BIO_CFG.gasPor);e.acA+=q/BIO_CFG.aduboPor;const k=Math.floor(e.acA);if(k>0){e.acA-=k;e.adubo=Math.min(9,e.adubo+k);}}
  const fi=FIRES.findIndex(f=>f.bio===o);if(e.gas>=3&&o.hp>0){if(fi<0)FIRES.push({x:o.x,y:o.y+1.15,z:o.z,poste:o,bio:o,semChama:true});}else if(fi>=0)FIRES.splice(fi,1);}
ESTACAO_UI.biodigestor={resumo:o=>{bioPasso(o);const e=o.ext;return'gás '+Math.round(e.gas)+'%'+(e.adubo?' · '+e.adubo+' adubo':'');},
  render(o){bioPasso(o);const e=o.ext,tem=Object.keys(BIO_RESTOS).filter(k=>invCount(k)>=BIO_RESTOS[k].n);
    return{sub:'Esterco e restos viram gás e adubo',corpo:'<div class="es-lista">'+cavMedidor('Gás',e.gas/BIO_CFG.gasMax,Math.round(e.gas)+'%'+(e.gas>=3?' · o fogareiro cozinha (segure E perto dele com comida crua)':''))+
      cavMedidor('Carga',Math.min(1,e.carga/12),e.carga>0?e.carga.toFixed(1)+' porções digerindo':'vazio')+'</div><p class="es-info">Vale 1 porção: 1 esterco, 1 comida estragada, 2 frutas ou 2 tomates. Cada porção dá gás para cozinhar umas três vezes; quatro porções dão um adubo. Adubo pronto: <b>'+e.adubo+'</b>.</p>',
      acoes:[{id:'por',t:'Pôr esterco e restos',s:tem.length?tem.map(k=>ITEMS[k].nome.toLowerCase()).join(', '):'esterco, comida estragada, frutas',ok:tem.length>0,prim:true},{id:'adubo',t:'Recolher adubo',s:String(e.adubo),ok:e.adubo>0}]};},
  acao(o,id){bioPasso(o);const e=o.ext;if(id==='por'){const n=porRestosBio(e);return n?'Pôs '+n+' porç'+(n>1?'ões':'ão'):'Nada para pôr';}
    if(id==='adubo'){const l=invAdd('adubo',e.adubo);const n=e.adubo-l;e.adubo=l;return n+' adubo na mochila';}return'';}};
function porRestosBio(e){let n=0;for(const k in BIO_RESTOS){const q=BIO_RESTOS[k];while(invCount(k)>=q.n&&e.carga<20){invRemove(k,q.n);e.carga+=q.p;n++;}}return n;}
let bioT=0;
PASSOS.push(function biodigestores(dt){if(G.modo!=='jogo')return;bioT-=dt;if(bioT>0)return;bioT=2;for(let i=FIRES.length-1;i>=0;i--){const f=FIRES[i];if(f.bio&&(!OB.includes(f.bio)||f.bio.hp<=0))FIRES.splice(i,1);}
  for(const o of OB)if(o.tipo==='biodigestor')bioPasso(o);});
/* cozinhar no fogareiro do biodigestor gasta o gás */
{const _cz=cozinhar;cozinhar=function(){let bio=null,bd=1e9,fogo=Math.hypot(P.x-FIRE[0],P.z-FIRE[2])<7;for(const f of FIRES){if(f.lamp)continue;const d=Math.hypot(P.x-f.x,P.z-f.z);if(d>=6)continue;if(f.bio){if(d<bd){bd=d;bio=f.bio;}}else fogo=true;}
  const r=_cz.apply(this,arguments);if(bio&&!fogo){bio.ext.gas=Math.max(0,bio.ext.gas-BIO_CFG.cozinha);bioPasso(bio);}return r;};}

/* ---------- malhas das construções novas ---------- */
INIT_MALHAS.push(function criacaoMalhas(){const R=rng(2121),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());},O=MESH.obra,o={j:0.05,rnd:R};
  const mad=lin(0x7a5a3a),mad2=lin(0x5e4329),mad3=lin(0x8e6a46),tel=lin(0x8e4a36),arame=lin(0x9a9a92),palha=lin(0xc9b46a),cinza=lin(0x6a6a66),branco=lin(0xe8e2d0);
  O.composteira=mk(g=>{for(const s of[1,-1]){add(g,bvTris(1.15,0.9,0.06),mat(0,0.45,s*0.56),mad,o);add(g,bvTris(0.06,0.9,1.15),mat(s*0.56,0.45,0),mad2,o);}
    for(let i=0;i<3;i++)add(g,boxTris(1.18,0.03,0.08),mat(0,0.2+i*0.28,0.6),mad3,o);add(g,boxTris(1.0,0.12,1.0),mat(0,0.52,0),lin(0x4a3a22),o);
    for(let i=0;i<6;i++)add(g,icoTris(0.12,0.4,R),mat((R()-0.5)*0.7,0.62,(R()-0.5)*0.7),lin(R()<0.5?0x5a4a2a:0x6a7a34),o);});
  O.biodigestor=mk(g=>{add(g,latheTris([[0.86,0],[0.86,0.5],[0.72,0.85],[0.42,1.05],[0.0001,1.12]],14,1,1),mat(0,0,0),lin(0x3d5a3a),o);
    add(g,cylTris(0.9,0.9,0.08,14),mat(0,0,0),cinza,o);add(g,cylTris(0.05,0.05,0.5,6),mat(0.55,0.6,0,0,0,-0.6),cinza,o);
    add(g,cylTris(0.035,0.035,0.25,6),mat(0,1.05,0),arame,o);for(let i=0;i<3;i++){const a=i*2.09;add(g,boxTris(0.03,0.03,0.22),mat(Math.cos(a)*0.09,1.3,Math.sin(a)*0.09,0,a,0),lin(0x2a2a28),o);}
    add(g,cylTris(0.12,0.12,0.04,10),mat(0,1.28,0),lin(0x2a2a28),o);add(g,boxTris(0.5,0.35,0.06),mat(-0.62,0.25,0.35,0,0.5,0),mad2,o);});
  MESH.bioChama=mk(g=>{for(let i=0;i<6;i++){const a=i/6*6.283;add(g,cylTris(0,0.025,0.09,5),mat(Math.cos(a)*0.06,0,Math.sin(a)*0.06),lin(0x3a7aff),{j:0,rnd:R,e:1.6});}});
  O.galinheiro=mk(g=>{for(const s of[1,-1])for(const t of[1,-1])add(g,boxTris(0.1,0.5,0.1),mat(s*0.85,0.22,t*0.52),mad2,o);   // pés: a casinha fica suspensa
    add(g,boxTris(1.9,0.85,1.2),mat(0,0.88,0),mad,o);for(let i=0;i<4;i++)add(g,boxTris(1.93,0.035,1.23),mat(0,0.56+i*0.21,0),mad3,o);   // corpo de tábuas
    add(g,roofTris(1.2,0.42,1.9),mat(0,1.3,0,0,Math.PI/2,0),mad,o);for(const s of[1,-1])add(g,boxTris(2.2,0.05,0.86),mat(0,1.53,s*0.33,s*0.61,0,0),tel,o);add(g,boxTris(2.2,0.07,0.08),mat(0,1.76,0),mad2,o);
    add(g,boxTris(0.36,0.42,0.03),mat(-0.5,0.76,-0.615),lin(0x2a2018),o);   // portinha
    {const a=Math.atan2(0.5,0.9);add(g,boxTris(0.34,0.035,1.03),mat(-0.5,0.29,-1.07,-a,0,0),mad3,o);for(let i=0;i<5;i++){const k=(i+0.5)/5;add(g,boxTris(0.34,0.03,0.03),mat(-0.5,0.55-0.5*k,-0.62-0.9*k),mad2,o);}}   // rampa com travessas
    add(g,boxTris(0.42,0.34,0.8),mat(1.16,0.8,0),mad,o);add(g,boxTris(0.5,0.04,0.86),mat(1.2,1.0,0,0,0,-0.35),tel,o);add(g,boxTris(0.36,0.06,0.72),mat(1.16,0.66,0),palha,o);});   // ninhos do lado
  O.curral=mk(g=>{const D=OBRAS.curral,hw=D.hw,hd=D.hd,poste=(u,v)=>add(g,cylTris(0.07,0.08,1.45,6),mat(u,-0.25,v),mad2,o),trilho=(u0,v0,u1,v1)=>{const L=Math.hypot(u1-u0,v1-v0),a=Math.atan2(u1-u0,v1-v0);
      for(const y of[0.45,0.85,1.15])add(g,boxTris(0.06,0.09,L),mat((u0+u1)/2,y,(v0+v1)/2,0,a,0),mad,o);};
    const P2=[[-hw,-hd],[-hw,hd],[hw,hd],[hw,-hd]];for(const[u,v]of P2)poste(u,v);for(let k=-hw+2;k<hw;k+=2){poste(k,hd);}for(let k=-hd+2;k<hd;k+=2){poste(-hw,k);poste(hw,k);}
    poste(-1.1,-hd);poste(1.1,-hd);poste(-hw+2,-hd);poste(hw-2,-hd);
    trilho(-hw,hd,hw,hd);trilho(-hw,-hd,-hw,hd);trilho(hw,-hd,hw,hd);trilho(-hw,-hd,-1.1,-hd);trilho(1.1,-hd,hw,-hd);
    {const u=-1.1,v0=-hd-0.06,L=2.05;for(const y of[0.32,0.72,1.08])add(g,boxTris(0.06,0.09,L),mat(u,y,v0-L/2),mad3,o);   // porteira aberta (folha virada para fora)
      for(const v of[v0,v0-L+0.04])add(g,boxTris(0.07,1.1,0.07),mat(u,0.65,v),mad2,o);add(g,boxTris(0.05,0.07,Math.hypot(L,0.76)),mat(u,0.7,v0-L/2,Math.atan2(0.76,L),0,0),mad2,o);}
    for(const[u,v]of[[hw-0.2,hd-0.2],[hw-2.2,hd-0.2],[hw-0.2,hd-2.0],[hw-2.2,hd-2.0]])add(g,cylTris(0.06,0.06,2.1,6),mat(u,-0.1,v),mad2,o);
    add(g,boxTris(2.4,0.06,2.2),mat(hw-1.2,2.05,hd-1.1,-0.12,0,0),tel,o);add(g,boxTris(2.0,0.25,1.6),mat(hw-1.2,0.0,hd-1.1),palha,o);});
  O.bebedouro=mk(g=>{add(g,boxTris(1.5,0.08,0.6),mat(0,0.45,0),mad,o);for(const s of[1,-1]){add(g,boxTris(1.5,0.25,0.06),mat(0,0.6,s*0.28),mad,o);add(g,boxTris(0.06,0.25,0.6),mat(s*0.72,0.6,0),mad2,o);
      for(const t of[1,-1])add(g,boxTris(0.08,0.45,0.08),mat(s*0.62,0.2,t*0.22),mad2,o);}});
  MESH.bebAgua=mk(g=>add(g,boxTris(1.36,0.02,0.48),mat(0,0,0),lin(0x3a6a8a),{j:0,rnd:R}));
  O.cerca=mk(g=>{for(const u of[-0.95,0.95])add(g,cylTris(0.06,0.07,1.3,6),mat(u,-0.1,0),mad2,o);for(const y of[0.45,0.9])add(g,boxTris(2.0,0.09,0.05),mat(0,y,0),mad,o);
    add(g,boxTris(0.05,0.08,0.05),mat(0,1.15,0),mad3,o);});
  O.estabulo=mk(g=>{const D=OBRAS.estabulo,hw=D.hw,hd=D.hd;for(const u of[-hw,hw])for(const v of[-hd,hd])add(g,boxTris(0.14,2.5,0.14),mat(u,1.15,v),mad2,o);
    for(let i=0;i<7;i++){const y=0.15+i*0.3;add(g,boxTris(hw*2,0.26,0.06),mat(0,y,hd),i%2?mad:mad3,o);for(const u of[-hw,hw])add(g,boxTris(0.06,0.26,hd*2),mat(u,y,0),i%2?mad3:mad,o);}
    add(g,boxTris(hw*2+0.5,0.07,hd*2+0.7),mat(0,2.45,0.05,-0.14,0,0),tel,o);add(g,boxTris(hw*2+0.5,0.12,0.12),mat(0,2.3,-hd-0.2),mad2,o);
    add(g,boxTris(hw*1.7,0.18,hd*1.6),mat(0,0.02,0.1),palha,o);add(g,boxTris(1.0,0.32,0.36),mat(0,0.45,hd-0.3),mad,o);add(g,boxTris(0.9,0.12,0.3),mat(0,0.62,hd-0.3),palha,o);});
  MESH.abelha=mk(g=>{add(g,ellipTris(0.011,0.01,0.017,6,4),mat(0,0,0),lin(0xd8a020),{j:0,rnd:R});add(g,ellipTris(0.0105,0.0095,0.006,6,3),mat(0,0,-0.006),lin(0x1a1610),{j:0,rnd:R});
    for(const s2 of[1,-1])add(g,boxTris(0.022,0.002,0.012),mat(s2*0.013,0.009,0.002,0,0,s2*0.3),lin(0xe8eef2),{j:0,rnd:R});});
  O.colmeia=mk(g=>{for(let i=0;i<3;i++)add(g,bvTris(0.5,0.22,0.42),mat(0,0.42+i*0.23,0),i===1?lin(0xd8b84a):branco,o);add(g,boxTris(0.6,0.05,0.52),mat(0,1.12,0),tel,o);
    add(g,boxTris(0.18,0.03,0.04),mat(0,0.34,0.22),lin(0x2a2018),o);for(const s of[1,-1])for(const t of[1,-1])add(g,boxTris(0.05,0.32,0.05),mat(s*0.2,0.16,t*0.16),mad2,o);});});
{const _dob=desenharObra;desenharObra=function(Pg,o){const r=_dob.apply(this,arguments);if(!o)return r;
  if(o.tipo==='bebedouro'&&MESH.bebAgua&&o.ext&&o.ext.agua>0.5)drawStat(Pg,MESH.bebAgua,mat(o.x,o.y+0.5+Math.min(0.2,o.ext.agua/BEB_CFG.cap*0.2),o.z,0,o.yaw,0));
  return r;};}
DESENHO.opaco.push(function bioChamas(Pg){if(!MESH.bioChama)return;for(const o of OB){if(o.tipo!=='biodigestor'||!o.ext||!(o.ext.gas>=3))continue;if(d2(o.x,o.z,cam.pos[0],cam.pos[2])>40*40)continue;
  const k=1+Math.sin(G.t*20+o.id)*0.15;drawStat(Pg,MESH.bioChama,mat(o.x,o.y+1.3,o.z,0,G.t*2,0,1,k,1));}});
DESENHO.aditivo.push(function bioBrilho(){for(const o of OB){if(o.tipo!=='biodigestor'||!o.ext||!(o.ext.gas>=3))continue;if(d2(o.x,o.z,cam.pos[0],cam.pos[2])>40*40)continue;bb(o.x,o.y+1.36,o.z,0.32,0.35,0.55,1,0.45);}});

/* ---------- salvar e carregar: os animais da criação ---------- */
const CRIA_CAMPOS=['cid','modo','fx','fz','fome','sede','prodTm','nasc','curral','hp','hpMax','sAdulto'];
V8.novo.criacao=()=>{CRIACAO.length=0;CRIA_ID=0;G.e15={gal:{}};G.plantioM={};};
V8.salvar.criacao=()=>({id:CRIA_ID,gal:e15().gal,pm:Object.assign({},plantioM()),L:CRIACAO.filter(b=>b.vivo).map(b=>{const o={t:b.tipo,v:b.var||'',s:+b.ch.s.toFixed(3),x:+b.x.toFixed(2),z:+b.z.toFixed(2),yaw:+b.yaw.toFixed(2)};
  for(const k of CRIA_CAMPOS)o[k]=typeof b[k]==='number'?Math.round(b[k]*1000)/1000:b[k];return o;})});
V8.carregar.criacao=s=>{CRIACAO.length=0;s=s||{};CRIA_ID=s.id||0;G.e15={gal:s.gal&&typeof s.gal==='object'?s.gal:{}};G.plantioM=s.pm&&typeof s.pm==='object'?s.pm:{};
  for(const c of s.L||[]){if(!CRIA_SP[c.t])continue;const b=criarBicho(c.t,c.x,c.z,{var:c.v||'',s:c.s,yaw:c.yaw});if(!b)continue;for(const k of CRIA_CAMPOS)if(c[k]!==undefined)b[k]=c[k];
    Object.assign(b,{domado:true,cria:true,zona:null,lider:null,conf:1,tmUlt:G.tm,st:'explora',t:2,v:0});if(b.modo==='segue'){b.modo='fica';b.fx=b.x;b.fz=b.z;}
    const i=BICHOS.indexOf(b);if(i>=0)BICHOS.splice(i,1);CRIACAO.push(b);CRIA_ID=Math.max(CRIA_ID,b.cid||0);}};

/* ---------- manual, diário e ajuda ---------- */
{const _ms=mnSecReceita;mnSecReceita=function(r){if(['sementesBoas'].includes(r.faz))return'agricultura';if(['fumigador','vela'].includes(r.faz))return'animais';return _ms.apply(this,arguments);};
 const _mo=mnSecObra;mnSecObra=function(k,tab){if(['galinheiro','curral','bebedouro','colmeia','cerca','estabulo'].includes(k))return'animais';if(['composteira','biodigestor'].includes(k))return'agricultura';return _mo.apply(this,arguments);};}
MANUAL_EXTRA.push(()=>[{id:'x:epoca',sec:'agricultura',nome:'Época de plantio de cada cultura',icon:'i-horta',trav:false,como:'desde o começo',desc:'Cada cultura cresce melhor numa estação. Fora de época cresce devagar, ou quase nada no inverno.',
    ing:{},est:{nome:'Onde: canteiros da fazenda e dos sítios',icon:'i-horta',onde:''},ferr:['Sementes (ou sementes selecionadas)'],
    proc:PLANTIO_CULT.map(C=>plantioMai(C.nome)+': melhor na '+epocaMelhor(C.id)+'.'),res:null,
    obs:['A estação muda a cada '+(typeof DIAS_ESTACAO!=='undefined'?DIAS_ESTACAO:7)+' dias. O canteiro mostra se é época boa.','Semente selecionada cresce 35% mais rápido e colhe um a mais.','Adubo (composteira ou biodigestor) adianta um terço da colheita: use pela mochila perto do canteiro ou da horta.','Chuva acelera; de noite cresce mais devagar.'],tipo:'Guia'},
  {id:'x:criacao',sec:'animais',nome:'Criação: galinhas, vacas, ovelhas, cabras e coelhos',icon:'i-curral',trav:false,como:'desde o começo',desc:'Como domar, onde manter, o que dão e como têm filhotes.',
    ing:{},est:{nome:'Onde: currais e galinheiros na base',icon:'i-curral',onde:''},ferr:['Corda (para levar o animal domado)','Faca (para tosquiar)'],
    proc:['Galinhas: andam soltas perto da fazenda e dos sítios. Agachado, segure E perto de uma para pegar e solte no galinheiro (toque E nele).',
      'Galinheiro: milho (ou sementes, feijão, abóbora) e água; cada galinha põe um ovo por dia; com duas ou mais nasce pintinho a cada dois dias (até 8).',
      'Vaca, ovelha, cabra e coelho: chegue agachado com a comida certa, segure E para dar na mão até a confiança encher; com uma corda, segure E de novo: ele segue você.',
      'Perto do curral, segure E no animal → Pôr no curral. Ponha um cocho com comida (feno, milho, frutas) e um bebedouro com água dentro do curral.',
      'Vaca dá leite todo dia, cabra a cada dois dias; ovelha dá lã a cada três (tosquiar com faca). Casal da mesma espécie tem filhote (até 8 por curral); filhote cresce em 3 dias.',
      'Todo animal faz esterco: recolha no painel do curral e do galinheiro. Esterco vira adubo e gás.',
      'Cavalo: com um estábulo perto, no painel dele, "Deixar no estábulo": fica na baia, protegido, descansa e sara mais rápido. Cercas (B → Animais) fecham pasto e horta.'],res:null,
    obs:['Sem comida ou água, o animal adoece e pode morrer.','Os bichos selvagens continuam selvagens: lobo, urso, onça, javali, cervo e raposa não se domam.'],tipo:'Guia'},
  {id:'x:colmeia',sec:'animais',nome:'Colmeia, mel e cera',icon:'i-colmeia',trav:false,como:'desde o começo',desc:'Abelhas fazem mel e cera perto de flor.',
    ing:{},est:{nome:'Onde: perto de flores, horta ou pomar',icon:'i-colmeia',onde:''},ferr:['Fumigador (sucata, tecido e fibras)'],
    proc:['Construa a colmeia (B → Animais) perto de flores, de uma horta ou de árvores de fruta (até 30 m).','Em um dia chega um enxame.','A cada dois dias: mel e cera. Segure E na colmeia para colher.'],res:null,
    obs:['Sem o fumigador na mochila, colher dá ferroadas.','Muita flor por perto: mais mel.','Mel não estraga e cura um pouco. Cera vira vela; a vela vai na lamparina no lugar dos gravetos.'],tipo:'Guia'}]);
/* vela: com vela na mochila, a lamparina (chão e parede) leva 1 vela no lugar dos 2 gravetos */
{const _co=custoObra;custoObra=function(k){const c=_co.apply(this,arguments);if((k==='lamparina'||k==='lampParede')&&c&&c.graveto&&invCount('vela')>0){const o=Object.assign({},c);delete o.graveto;o.vela=1;return o;}return c;};}
{const _dr=diarioRender;diarioRender=function(){_dr.apply(this,arguments);if(diarioAba!=='est')return;const el=$('dr-lista');if(!el)return;const D=diarioD().contas||{};
  const L=[['Animais na criação',String(CRIACAO.length)],['Galinhas nos galinheiros',String(OB.filter(o=>o.tipo==='galinheiro').reduce((t,o)=>t+((o.ext&&o.ext.g)||0),0))],['Ovos recolhidos',String(D.ovos||0)],['Mel colhido',String(D.mel||0)]];
  el.insertAdjacentHTML('beforeend',L.map(([n,v])=>'<li class="ok">'+svgUse('i-grade')+'<span><b>'+n+'</b><small>'+v+'</small></span></li>').join(''));};}
{const p=document.querySelector('#t-ajuda [data-e14p]');if(p&&!document.querySelector('#t-ajuda [data-e15p]'))p.insertAdjacentHTML('afterend','<p data-e15p>Criação: pegue galinhas soltas perto da fazenda (agachado, segure E) e solte num galinheiro com milho e água: ovos todo dia. Vacas, ovelhas e cabras se domam como o cavalo, com uma corda no fim; no curral, com cocho e bebedouro, dão leite e lã e têm filhotes. A colmeia perto de flores dá mel. Composteira e biodigestor transformam esterco e restos em adubo (e gás para cozinhar). Cada cultura tem a sua época de plantio.</p>');}
