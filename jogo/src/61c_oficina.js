/* ================= Etapa 12 · oficina: estudo, desmanche, recuperação de materiais, armaduras e roupas que sujam =================
   · Mesa de estudo (B → Oficina): estuda uma peça achada no mundo (roupa, facão, pé de cabra, colete da polícia) ou uma
     planta de construção e aprende a receita. O estudo leva horas de jogo e continua com você longe; a peça volta inteira
     (a planta é gasta, como na mochila).
   · Bancada de desmanche (B → Oficina): desmancha as peças grandes arrancadas de carros, máquinas, móveis e destroços de
     avião (leva um tempo; rende conforme a ferramenta e o estado da peça) e desmonta itens da mochila devolvendo mais
     material do que desmontar na mão.
   · Recuperação no mundo: com a ferramenta certa, segure E num carro abandonado, num móvel de casa ou prédio, numa máquina
     ou nos destroços de um avião para arrancar peças. Leva tempo, faz barulho, suja a roupa e pode cortar a mão sem luva.
     O móvel desmontado some da casa; o carro e o avião aguentam algumas vezes.
   · Descobertas novas: estudo (mesa), progresso (de tanto consertar aprende a reforçar a calça) e o Tratado do armeiro
     (baú do ferreiro no acampamento da Serra, ao lado da fornalha velha).
   · Armaduras de malha: capacete, peitoral e calça (anéis feitos na fornalha + couro curtido da estação de couro).
     Protegem muito (sobem o teto de proteção), mas pesam: anda e nada mais devagar, cansa mais, o fôlego volta mais
     devagar, tilinta a cada passo (os zumbis escutam de mais longe) e não esquenta.
   · Roupas reforçadas: jaqueta e calça de couro com placas de chapa.
   · Desgaste das roupas: além dos golpes, a roupa gasta com o uso e suja (lama, chuva, sangue, trabalho, fumaça).
     Roupa suja gasta mais rápido, esquenta menos e fica com cara de suja; lave na água (rio, lago, poço ou uma garrafa
     d'água) pela mochila. Nadar também lava. O conserto continua o mesmo (a malha se conserta com anéis, na bancada ou
     na fornalha). */
iconesNovos({
  'i-mesa-estudo':'<path d="M3 14h18M5 14v6M19 14v6"/><path d="M6.5 14v-3.2c1.8-.9 3.7-.9 5.5 0 1.8-.9 3.7-.9 5.5 0V14"/><path d="M12 10.8V14"/>',
  'i-desmanche':'<path d="M3 15h18M5 15v5M19 15v5"/><path d="M14.6 4.2a3 3 0 0 0-3.8 3.9L6.5 12.4l1.4 1.4 4.3-4.3a3 3 0 0 0 3.9-3.8l-1.8 1.8-1.6-.3-.3-1.6z"/>',
  'i-malha':'<path d="M8.5 4 4 7l1.6 4L7 10.2V20h10v-9.8l1.4.8L20 7l-4.5-3c-.9 1.4-2.1 2-3.5 2s-2.6-.6-3.5-2z"/><path d="M9 12.5h6M9 15.5h6M9 18.2h6" stroke-dasharray="1 1.2"/>',
  'i-capacete-malha':'<path d="M5 13.5a7 7 0 0 1 14 0z"/><path d="M12 6.5V16"/><path d="M5 13.5v3.2l2.2 2.3M19 13.5v3.2L16.8 19" stroke-dasharray="1 1.2"/>',
  'i-calca-malha':'<path d="M7 3h10l1 18h-4l-2-11-2 11H6z"/><path d="M8 7h8M8 10.5h3M13 10.5h3M7.6 14h3M13.4 14h3" stroke-dasharray="1 1.2"/>',
  'i-aneis':'<circle cx="8" cy="9" r="3.2"/><circle cx="15.5" cy="9" r="3.2"/><circle cx="11.8" cy="15.3" r="3.2"/>',
  'i-pecas-carro':'<path d="M3.5 15.5 6 10h9l4.5 5.5v2.5h-16z"/><circle cx="7.5" cy="18" r="1.6"/><circle cx="16" cy="18" r="1.6"/><path d="M9.5 10v5.5M3 7l3 1.5M21 7l-3 1.5"/>',
  'i-pecas-maquina':'<circle cx="10" cy="12" r="2.6"/><path d="M10 5v2.2M10 16.8V19M3 12h2.2M14.8 12H17M5 7l1.6 1.6M13.4 15.4 15 17M5 17l1.6-1.6M13.4 8.6 15 7"/><path d="M17.5 4.5 21 8l-2 2"/>',
  'i-restos-movel':'<path d="M3 17.5 10.5 15l2.2 2.2L21 14.5"/><path d="M4 11l6.5 2M14 9.5l6.5-2.2M6 5.5l3.2 3.2M16.5 4.5l-1 3.5"/>',
  'i-destrocos-aviao':'<path d="M3 13.5 10 12.4l3.6-6.9 2 .9-1.8 6.4 4.7 1v1.9l-4.7 1 1.8 4.4-2 .9-3.6-5.4-7-1.2z"/><path d="m18.5 4 2 2M20.5 4l-2 2"/>',
  'i-jaqueta-ref':'<path d="M8.5 4 4 7l1.6 4L7 10.2V20h10v-9.8l1.4.8L20 7l-4.5-3c-.9 1.4-2.1 2-3.5 2s-2.6-.6-3.5-2z"/><rect x="8.5" y="11.5" width="2.6" height="3.2" rx=".5"/><rect x="12.9" y="11.5" width="2.6" height="3.2" rx=".5"/>',
  'i-calca-ref':'<path d="M7 3h10l1 18h-4l-2-11-2 11H6z"/><rect x="7.6" y="13" width="2.4" height="2.6" rx=".5"/><rect x="14" y="13" width="2.4" height="2.6" rx=".5"/>',
  'i-lavar':'<path d="M12 3.5c2.8 3.6 4.4 6.3 4.4 8.4a4.4 4.4 0 0 1-8.8 0c0-2.1 1.6-4.8 4.4-8.4z"/><path d="M4 19c1.4 0 1.4 1 2.8 1s1.4-1 2.8-1 1.4 1 2.8 1 1.4-1 2.8-1 1.4 1 2.8 1"/>'});

/* ---------- estado salvo do módulo ---------- */
function e12Novo(){return{estudos:{},prog:{},recup:{},movRem:[]};}
function E12(){if(!G.e12||typeof G.e12!=='object')G.e12=e12Novo();return G.e12;}
const e12Cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
function e12Hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

/* ---------- itens novos ---------- */
Object.assign(ITEMS,{
  pecasCarro:{nome:'Peças de carro',icon:'i-pecas-carro',max:4,tipo:'material',desc:'Lataria, molas, parafusos e fios arrancados de um carro. Na bancada de desmanche viram sucata, chapa de ferro, pregos, pano e, com sorte, uma peça de motor.'},
  pecasMaquina:{nome:'Peças de máquina',icon:'i-pecas-maquina',max:4,tipo:'material',desc:'Engrenagens, eixos e chapas de uma máquina ou aparelho velho. Na bancada de desmanche viram sucata, barra de ferro, pregos e às vezes um fusível.'},
  restosMovel:{nome:'Restos de móveis',icon:'i-restos-movel',max:6,tipo:'material',desc:'Tampos, pés e gavetas de um móvel desmontado. Na bancada de desmanche viram tábuas, pregos, madeira e pano.'},
  destrocosAviao:{nome:'Destroços de avião',icon:'i-destrocos-aviao',max:4,tipo:'material',desc:'Pedaços da fuselagem, cabos e assentos de um avião caído. Na bancada de desmanche viram chapa de ferro, sucata, corda, pano, linha e fusíveis.'},
  aneisFerro:{nome:'Anéis de malha',icon:'i-aneis',max:10,tipo:'material',desc:'Um feixe de anéis de ferro rebitados, feito na fornalha. É a base das armaduras de malha e do conserto delas.'},
  capaceteMalha:{nome:'Capacete com malha',icon:'i-capacete-malha',max:1,tipo:'roupa',slot:'cabeca',mat:'metal',malha:true,prot:0.1,quente:0.04,chuva:0.12,peso:2.2,durMax:340,
    arm:{vel:0.01,som:0.2,nado:0.1,cap:0.05},desc:'Elmo de chapa com um capuz de malha que desce pelo pescoço. Segura golpe e mordida na cabeça, mas pesa, tilinta e não esquenta nada.'},
  peitoralMalha:{nome:'Peitoral de malha',icon:'i-malha',max:1,tipo:'roupa',slot:'tronco',mat:'metal',malha:true,prot:0.26,quente:0.03,chuva:0,peso:8.5,durMax:480,
    arm:{vel:0.06,som:0.5,nado:0.35,cap:0.1},desc:'Cota de malha sobre um gibão de couro: quase nenhuma mordida passa. Em troca pesa (cansa correndo e afunda na água), tilinta a cada passo e não esquenta. Ocupa o lugar da jaqueta.'},
  calcaMalha:{nome:'Calça de malha',icon:'i-calca-malha',max:1,tipo:'roupa',slot:'pernas',mat:'metal',malha:true,prot:0.14,quente:0.03,chuva:0,peso:5.5,durMax:420,
    arm:{vel:0.05,som:0.35,nado:0.25,cap:0.06},desc:'Perneiras de malha com joelheiras de chapa. Protege as pernas das mordidas, mas pesa e faz barulho.'},
  jaquetaReforcada:{nome:'Jaqueta reforçada',icon:'i-jaqueta-ref',max:1,tipo:'roupa',slot:'tronco',mat:'couro',prot:0.2,quente:0.22,chuva:0.4,fogo:0.1,peso:3.4,durMax:320,
    arm:{cap:0.03},desc:'Jaqueta de couro com placas de chapa no peito, nas costas, nos ombros e nos antebraços. Protege bem mais que a jaqueta comum, esquenta quase igual e pesa menos que a malha.'},
  calcaReforcada:{nome:'Calça reforçada',icon:'i-calca-ref',max:1,tipo:'roupa',slot:'pernas',mat:'couro',prot:0.15,quente:0.14,chuva:0.32,peso:2.6,durMax:300,
    arm:{cap:0.02},desc:'Calça de couro com joelheiras e placas nas coxas. Aguenta mais mordida que a calça comum sem o peso da malha.'}});
CHAPEUS.capaceteMalha=1;
/* no corpo do Akai (sobreviventes que usam o modelo de pele): cascas da mesma cor */
Object.assign(SK_CASCAS,{
  capaceteMalha:[{sub:'cabeca',inf:0.03,cor:0x8d939a,pelo:0.15},{sub:'cabecaAba',inf:0.042,cor:0x5f656b,pelo:0.5}],
  peitoralMalha:[{sub:'troncoLongo',inf:0.017,cor:0x7c8288,pelo:0.6},{sub:'golaLonga',inf:0.026,cor:0x4a3424,pelo:0}],
  calcaMalha:[{sub:'pernas',inf:0.014,cor:0x7c8288,pelo:0.6},{sub:'cinto',inf:0.022,cor:0x3a2818,pelo:0}],
  jaquetaReforcada:[{sub:'troncoLongo',inf:0.014,cor:0x5e3d26,pelo:0},{sub:'golaLonga',inf:0.022,cor:0x6c7176,pelo:0.1}],
  calcaReforcada:[{sub:'pernas',inf:0.01,cor:0x5a3d27,pelo:0},{sub:'cinto',inf:0.018,cor:0x2a1d14,pelo:0}]});

/* ---------- receitas novas (todas entram no Manual de Sobrevivência sozinhas) ---------- */
const PROG_CONSERTOS=5;
RECIPES.push(
  {faz:'camiseta',n:1,custo:{pano:3,linha:1},cat:'roupas',etapa:1,est:'couro',desb:{estudo:'camiseta'}},
  {faz:'bermuda',n:1,custo:{pano:2,linha:1},cat:'roupas',etapa:1,est:'couro',desb:{estudo:'bermuda'}},
  {faz:'bone',n:1,custo:{pano:2,linha:1},cat:'roupas',etapa:1,est:'couro',desb:{estudo:'bone'}},
  {faz:'bandana',n:1,custo:{pano:1},cat:'roupas',etapa:1,est:0,desb:{estudo:'bandana'}},
  {faz:'camisaLeve',n:1,custo:{pano:4,linha:2},cat:'roupas',etapa:2,est:'couro',desb:{estudo:'camisaLeve'}},
  {faz:'calcaCargo',n:1,custo:{pano:5,linha:2,corda:1},cat:'roupas',etapa:2,est:'couro',desb:{estudo:'calcaCargo'}},
  {faz:'mochilaPequena',n:1,custo:{pano:4,linha:2,corda:1},cat:'roupas',etapa:2,est:'couro',desb:{estudo:'mochilaPequena'}},
  {faz:'cinto',n:1,custo:{couroPequeno:1,linha:1,sucata:1},cat:'roupas',etapa:2,est:'couro',desb:{estudo:'cinto'}},
  {faz:'botasTrilha',n:1,custo:{couroCurtido:2,linha:2,pano:1},cat:'roupas',etapa:2,est:'couro',desb:{estudo:'botasTrilha'}},
  {faz:'jaquetaReforcada',n:1,custo:{camisaCouro:1,chapaFerro:2,couroCurtido:1,linha:2,pregos:4},cat:'roupas',etapa:3,est:'couro',desb:{estudo:'colete'}},
  {faz:'calcaReforcada',n:1,custo:{calcaCouro:1,chapaFerro:1,couroCurtido:1,linha:2},cat:'roupas',etapa:3,est:'couro',desb:{prog:'consertos'}},
  {faz:'facao',n:1,custo:{barraFerro:2,madeira:1,couroPequeno:1},cat:'armas',etapa:2,est:'forja',desb:{estudo:'facao'}},
  {faz:'peDeCabra',n:1,custo:{barraFerro:2},cat:'ferramentas',etapa:2,est:'forja',desb:{estudo:'peDeCabra'}},
  {faz:'aneisFerro',n:1,custo:{barraFerro:1,carvao:1},cat:'materiais',etapa:3,est:'forja',desb:{manual:'tratadoArmeiro'}},
  {faz:'capaceteMalha',n:1,custo:{chapaFerro:1,aneisFerro:1,couroCurtido:1,linha:1},cat:'roupas',etapa:3,est:'forja',desb:{manual:'tratadoArmeiro'}},
  {faz:'peitoralMalha',n:1,custo:{aneisFerro:4,couroCurtido:2,pano:2,linha:2},cat:'roupas',etapa:3,est:'forja',desb:{manual:'tratadoArmeiro'}},
  {faz:'calcaMalha',n:1,custo:{aneisFerro:3,couroCurtido:1,pano:1,linha:2},cat:'roupas',etapa:3,est:'forja',desb:{manual:'tratadoArmeiro'}});
MANUAIS.tratadoArmeiro={nome:'Tratado do armeiro',local:'serra-ferreiro',onde:'no baú do ferreiro, no acampamento da Serra (ao lado da fornalha velha)',
  ensina:'a fazer anéis de malha e as armaduras de malha (capacete, peitoral e calça) na fornalha'};

/* ---------- descobertas novas: estudo e progresso ---------- */
function progFeito(id){const E=E12();if(E.prog[id])return true;if(id==='consertos')return!!(G.fab&&G.fab.reg&&G.fab.reg.cons>=PROG_CONSERTOS);return false;}
{const _re=receitaEstado;receitaEstado=function(r){const d=r&&r.desb;if(d&&d.estudo)return E12().estudos[d.estudo]?'nova':'travada';if(d&&d.prog)return progFeito(d.prog)?'nova':'travada';return _re.apply(this,arguments);};}
{const _dt=desbTexto;desbTexto=function(r){const d=r&&r.desb;
  if(d&&d.estudo){const it=ITEMS[d.estudo];return'Estude '+(it?it.nome.toLowerCase():d.estudo)+' numa mesa de estudo (B → Oficina → Mesa de estudo). Primeiro ache a peça no mundo.';}
  if(d&&d.prog==='consertos'){const f=Math.max(0,PROG_CONSERTOS-(G.fab&&G.fab.reg?G.fab.reg.cons:0));return'Aprende sozinho de tanto consertar: conserte mais '+f+' peça'+(f===1?'':'s')+' (roupas, armas ou ferramentas).';}
  return _dt.apply(this,arguments);};}
{const _rc=receitaComo;receitaComo=function(r){const d=r&&r.desb;if(d&&d.estudo)return'estudando '+(ITEMS[d.estudo]?ITEMS[d.estudo].nome.toLowerCase():d.estudo)+' na mesa de estudo';
  if(d&&d.prog==='consertos')return'de tanto consertar';return _rc.apply(this,arguments);};}
/* na aba Fabricar, receita ainda bloqueada não mostra materiais nem jeito de fazer (igual ao manual) */
{const _fd=fabDetalhe;fabDetalhe=function(){_fd.apply(this,arguments);const r=RECIPES[fabSel];if(!r||receitaEstado(r)!=='travada')return;const d=ITEMS[r.faz],el=$('fab-info');if(!el||!d)return;
  el.innerHTML=detTopo(r.nome||d.nome,d.icon,null)+'<div class="chips"><span class="chip-e e'+r.etapa+'">'+ETAPA_NOME[r.etapa]+'</span><span class="chip-e">'+estNome(r.est)+'</span></div>'+
    '<p>'+d.desc+'</p><div class="trava">'+svgUse('i-cadeado')+'<p><b>Bloqueada.</b> '+desbTexto(r)+'</p></div>'+
    '<p class="det-nota">'+svgUse('i-livro')+'<span>Os materiais e o jeito de fazer aparecem quando você descobrir a receita. Todas as receitas estão no Manual de Sobrevivência (N).</span></p>';};}
let e12ProgT=0;
PASSOS.push(function e12Progresso(dt){e12ProgT-=dt;if(e12ProgT>0)return;e12ProgT=2;if(!G.fab||G.modo!=='jogo')return;const E=E12();
  if(!E.prog.consertos&&G.fab.reg&&G.fab.reg.cons>=PROG_CONSERTOS){E.prog.consertos=1;diarioAprendeu(RECIPES.filter(r=>r.desb&&r.desb.prog==='consertos'),'de tanto consertar');sfx('missao');
    toast('habilidade','De tanto consertar, você pegou o jeito: agora sabe reforçar a calça de couro com placas de ferro (estação de couro).');}});

/* ---------- estações novas ---------- */
Object.assign(ESTACOES,{
  estudo:{nome:'Mesa de estudo',icon:'i-mesa-estudo',ir:'uma mesa de estudo (construa: B → Oficina)',chip:'Mesa de estudo'},
  desmanche:{nome:'Bancada de desmanche',icon:'i-desmanche',ir:'uma bancada de desmanche (construa: B → Oficina)',chip:'Bancada de desmanche'}});
Object.assign(OBRAS,{
  mesaEstudo:{nome:'Mesa de estudo',icon:'i-mesa-estudo',custo:{tabuas:6,pregos:4,pano:1},hp:120,hw:0.78,hd:0.44,solid:true,hCol:0.85,peq:true,etapa:2,estacao:'estudo',base:true},
  bancadaDesmanche:{nome:'Bancada de desmanche',icon:'i-desmanche',custo:{tabuas:6,pregos:6,sucata:6,corda:1},hp:220,hw:1.08,hd:0.5,solid:true,hCol:1.0,etapa:2,estacao:'desmanche',base:true}});
OBRA_ORDEM.push('mesaEstudo','bancadaDesmanche');
for(const L of[OBRAS_CHAO,typeof OBRAS_PREDIO!=='undefined'?OBRAS_PREDIO:null,typeof OBRAS_ALTO!=='undefined'?OBRAS_ALTO:null])if(L)for(const k of['mesaEstudo','bancadaDesmanche'])if(!L.includes(k))L.push(k);
{const c=OBRA_CATS.find(q=>q.id==='oficina');if(c)for(const k of['mesaEstudo','bancadaDesmanche'])if(!c.t.includes(k))c.t.push(k);}
INIT_MALHAS.push(function e12Malhas(){const R=rng(1212),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());};
  MESH.obra.mesaEstudo=mk(g=>{const md=lin(0x6b4e30),md2=lin(0x54402c),pap=lin(0xe6dcc0),capa=lin(0x7a2f22),capa2=lin(0x2f4a5a),ferro=lin(0x55595c);
    add(g,bvTris(1.5,0.06,0.85),mat(0,0.76,0),md,{j:0.06,rnd:R});
    for(const x of[-0.68,0.68])for(const z of[-0.36,0.36])add(g,bvTris(0.07,0.73,0.07),mat(x,0.365,z),md2);
    add(g,bvTris(0.46,0.18,0.72),mat(0.44,0.63,0),md2,{j:0.05,rnd:R});add(g,boxTris(0.1,0.02,0.02),mat(0.44,0.64,0.37),ferro);
    add(g,boxTris(0.46,0.012,0.32),mat(-0.18,0.796,0.04),capa);for(const s of[-1,1])add(g,boxTris(0.21,0.014,0.29),mat(-0.18+s*0.108,0.806,0.04,0,0,s*0.07),pap);
    for(let i=0;i<5;i++)add(g,boxTris(0.16,0.003,0.004),mat(-0.29,0.815,-0.06+i*0.045,0,0,0.07),lin(0x6a604c));
    add(g,boxTris(0.25,0.06,0.18),mat(0.45,0.82,-0.2,0,0.2,0),capa2);add(g,boxTris(0.23,0.05,0.17),mat(0.44,0.875,-0.2,0,0.4,0),capa);
    add(g,boxTris(0.21,0.008,0.29),mat(0.22,0.794,0.22,0,-0.3,0),pap);add(g,boxTris(0.02,0.012,0.17),mat(0.3,0.802,0.2,0,-0.6,0),lin(0x2b2b2b));
    add(g,cylTris(0.04,0.045,0.03,8),mat(-0.6,0.79,-0.26),ferro);add(g,cylTris(0.022,0.022,0.12,8),mat(-0.6,0.815,-0.26),lin(0xe8e0c8));add(g,cylTris(0.009,0.002,0.035,5),mat(-0.6,0.935,-0.26),lin(0xffc66a),{e:2});
    add(g,cylTris(0.17,0.17,0.04,10),mat(-0.25,0.45,-0.64),md);for(let i=0;i<3;i++){const a=i*2.09;add(g,cylTris(0.02,0.025,0.45,5),mat(-0.25+Math.cos(a)*0.12,0,-0.64+Math.sin(a)*0.12),md2);}});
  MESH.obra.bancadaDesmanche=mk(g=>{const md=lin(0x5e4630),md2=lin(0x4a3726),aco=lin(0x55595c),aco2=lin(0x3d4246),fer=lin(0x7a4a2a),ver=lin(0x8a2a22);
    add(g,bvTris(2.1,0.08,0.95),mat(0,0.9,0),md,{j:0.06,rnd:R});for(const x of[-0.98,0.98])for(const z of[-0.4,0.4])add(g,bvTris(0.1,0.86,0.1),mat(x,0.43,z),md2);
    add(g,bvTris(2.0,0.04,0.85),mat(0,0.25,0),md2,{j:0.06,rnd:R});
    add(g,bvTris(2.1,0.9,0.04),mat(0,1.42,-0.45),md2,{j:0.05,rnd:R});for(const x of[-1.0,1.0])add(g,bvTris(0.07,1.04,0.07),mat(x,1.38,-0.45),md);
    for(let i=0;i<8;i++)for(let k=0;k<3;k++)add(g,boxTris(0.015,0.015,0.01),mat(-0.85+i*0.24,1.18+k*0.22,-0.425),lin(0x2b2620));
    add(g,boxTris(0.22,0.12,0.18),mat(0.82,1.0,0.2),aco);add(g,boxTris(0.06,0.12,0.18),mat(0.68,1.0,0.2),aco2);add(g,cylTris(0.012,0.012,0.3,6),mm(mat(0.82,1.0,0.3),mat(0,0,0,Math.PI/2,0,0)),aco2);
    add(g,boxTris(0.5,0.12,0.01),mat(-0.55,1.52,-0.42),lin(0xb0b4b8));add(g,boxTris(0.13,0.14,0.03),mat(-0.86,1.52,-0.42),ver);
    add(g,boxTris(0.05,0.3,0.015),mat(0.0,1.45,-0.42,0,0,0.3),aco);add(g,boxTris(0.1,0.05,0.02),mat(0.05,1.6,-0.42,0,0,0.3),aco);
    add(g,boxTris(0.03,0.28,0.03),mat(0.4,1.42,-0.42),lin(0x8a6a45));add(g,boxTris(0.14,0.05,0.05),mat(0.4,1.58,-0.42),aco2);
    add(g,cylTris(0.12,0.12,0.03,12),mat(-0.3,0.94,0.15),aco2);add(g,cylTris(0.05,0.05,0.035,8),mat(-0.3,0.95,0.15),aco);
    add(g,boxTris(0.45,0.02,0.3),mat(0.25,0.95,0.05,0,0.3,0.05),lin(0x6b6f74));add(g,cylTris(0.07,0.07,0.16,10),mat(-0.75,0.94,-0.18),lin(0x8a2a22));
    for(let i=0;i<6;i++)add(g,boxTris(0.2+R()*0.2,0.06+R()*0.08,0.15+R()*0.2),mat(-0.8+i*0.3,0.32,(R()-0.5)*0.4,R()*0.4,R()*3,R()*0.4),R()<0.5?fer:aco2,{j:0.1,rnd:R});
    add(g,boxTris(0.06,0.75,1.0),mat(1.2,0.4,0.05,0,0,-0.18),lin(0x3d5a73),{j:0.05,rnd:R});add(g,boxTris(0.07,0.3,0.7),mat(1.25,0.62,0.05,0,0,-0.18),lin(0x1c2830));});});

/* ---------- mesa de estudo ---------- */
const ESTUDOS={camiseta:{h:1},bermuda:{h:1},bone:{h:1},bandana:{h:0.5},camisaLeve:{h:1.5},calcaCargo:{h:1.5},mochilaPequena:{h:1.5},cinto:{h:1},botasTrilha:{h:2},
  colete:{h:3},facao:{h:2},peDeCabra:{h:2},plantaFerro:{h:1,planta:true},plantaEstufa:{h:1,planta:true},plantaRadio:{h:1,planta:true}};
function estudoEnsina(id){return RECIPES.filter(r=>r.desb&&r.desb.estudo===id);}
function estudoSabe(id){const E=ESTUDOS[id];if(!E)return true;if(E.planta)return!!(G.fab&&G.fab.reg&&G.fab.reg.marcos[id]!==undefined);return!!E12().estudos[id];}
function estudoTexto(id){const E=ESTUDOS[id];if(E.planta)return'ensina a construir '+(typeof PLANTAS!=='undefined'&&PLANTAS[id]?PLANTAS[id]:'a obra da planta');
  const L=estudoEnsina(id).map(r=>(r.nome||ITEMS[r.faz].nome).toLowerCase());return'ensina a fazer '+listaE(L);}
ESTACAO_UI.estudo={resumo:st=>{const e=st.ext&&st.ext.est;return e?(G.tm>=e.fim?'estudo pronto':'estudando: '+ITEMS[e.id].nome.toLowerCase()):'mesa livre';},
  render(st){const e=st.ext.est;let c='<div class="es-lista">';
    if(e){const d=ITEMS[e.id],pr=G.tm>=e.fim,f=1-(e.fim-G.tm)/Math.max(1,e.fim-e.ini);
      c+='<div class="es-vaga'+(pr?' pronta':'')+'">'+svgUse(d.icon)+'<span><b>'+d.nome+'</b><small>'+(pr?'Estudo pronto: recolha para aprender':'Estudando · faltam '+horasTxt(e.fim-G.tm))+'</small></span>'+(pr?'':barraHTML(f))+'</div>';}
    else c+='<div class="es-vaga vazia">'+svgUse('i-mesa-estudo')+'<span>Nada na mesa</span></div>';
    c+='</div>';const A=[];
    if(e)A.push({id:'recolher',t:G.tm>=e.fim?'Recolher e aprender':'Estudando…',s:G.tm>=e.fim?(ESTUDOS[e.id].planta?'a planta é gasta no estudo':'a peça volta inteira para a mochila'):'faltam '+horasTxt(e.fim-G.tm),ok:G.tm>=e.fim,prim:G.tm>=e.fim});
    const vistos=new Set();
    for(const s of P.inv){if(!s||!ESTUDOS[s.id]||vistos.has(s.id))continue;vistos.add(s.id);const sabe=estudoSabe(s.id);
      A.push({id:'est:'+s.id,t:'Estudar: '+ITEMS[s.id].nome.toLowerCase(),s:sabe?'você já sabe isso':estudoTexto(s.id)+' · '+horasTxt(ESTUDOS[s.id].h*60),ok:!sabe&&!e});}
    const lista=Object.keys(ESTUDOS).filter(k=>!ESTUDOS[k].planta).map(k=>ITEMS[k].nome.toLowerCase());
    c+='<p class="es-info">Ponha na mesa uma peça achada no mundo e estude como foi feita: aprende a receita. O estudo leva horas e continua com você longe; a peça volta inteira. As plantas de construção também se estudam aqui (a planta é gasta).<br>Dá para estudar: '+listaE(lista)+' e as plantas.</p>';
    if(!vistos.size&&!e)c+='<p class="es-info">Nada na mochila que dê para estudar agora.</p>';
    return{sub:'Estude peças e plantas para aprender receitas novas.',corpo:c,acoes:A};},
  acao(st,id){const e=st.ext.est;
    if(id==='recolher'){if(!e)return'';if(G.tm<e.fim)return'Ainda estudando: faltam '+horasTxt(e.fim-G.tm)+'.';st.ext.est=null;return estudoConcluir(e);}
    if(id.startsWith('est:')){const k=id.slice(4);if(e)return'Já tem uma peça na mesa.';if(!ESTUDOS[k])return'';if(estudoSabe(k))return'Você já sabe isso.';
      const i=P.inv.findIndex(s=>s&&s.id===k);if(i<0)return'A peça não está na mochila.';const s=P.inv[i],ex=exDe(s);
      gastarUm(i);st.ext.est={id:k,ex:ex||null,ini:G.tm,fim:G.tm+ESTUDOS[k].h*60};sfx('estudo');dica('estudo','corpo','A mesa de estudo trabalha no seu tempo: vá fazer outra coisa e volte para recolher. A peça não se perde.');
      return'Começou a estudar: '+ITEMS[k].nome.toLowerCase()+' (pronto em '+horasTxt(ESTUDOS[k].h*60)+').';}
    return'';}};
function estudoConcluir(e){const id=e.id,d=ITEMS[id];sfx('missao');ganharXP(ESTUDOS[id].planta?40:25);progresso('estudar');
  if(ESTUDOS[id].planta){const ja=G.fab.reg.marcos[id]!==undefined;marco(id);if(!ja){if(typeof diarioDescobre==='function')diarioDescobre('manual',id,d.nome);const D=diarioD();if(!D.rec)D.rec={};
      if(D.rec['planta:'+id]===undefined){D.rec['planta:'+id]=Math.round(G.tm||0);diarioEvento('Estudou a planta na mesa: agora sabe construir '+(PLANTAS[id]||d.nome.toLowerCase()),'receita');}}
    toast('habilidade','Você estudou a planta: agora dá para construir '+(PLANTAS[id]||d.nome.toLowerCase())+' (menu de construção).');return'Planta estudada.';}
  E12().estudos[id]=1;const rs=estudoEnsina(id);diarioAprendeu(rs,'estudando '+d.nome.toLowerCase());
  const left=invAdd(id,1,e.ex||null);if(left)soltarItens([[id,left,e.ex||null]],P.x,P.z,P.y);
  toast('habilidade','Estudou '+d.nome.toLowerCase()+': agora sabe fazer '+listaE(rs.map(r=>(r.nome||ITEMS[r.faz].nome).toLowerCase()))+'. Está no Manual e na aba Fabricar.');
  return'Aprendeu: '+listaE(rs.map(r=>(r.nome||ITEMS[r.faz].nome).toLowerCase()))+'.'+(left?' A mochila estava cheia: a peça ficou no chão.':'');}

/* ---------- bancada de desmanche ---------- */
const DESMANCHE={
  pecasCarro:{min:30,saida:[['sucata',2,3],['chapaFerro',1,1,0.6],['pregos',2,4],['pano',1,1,0.5],['corda',1,1,0.35],['pecaVeiculo',1,1,0.12],['oleoMotor',1,1,0.1]]},
  pecasMaquina:{min:35,saida:[['sucata',2,3],['barraFerro',1,1,0.5],['pregos',2,3],['fusivel',1,1,0.25],['pecaVeiculo',1,1,0.08]]},
  restosMovel:{min:20,saida:[['tabuas',2,3],['pregos',1,3],['pano',1,2,0.45],['madeira',1,1,0.4]]},
  destrocosAviao:{min:40,saida:[['chapaFerro',1,1],['sucata',2,3],['corda',1,2,0.5],['pano',1,2,0.5],['fusivel',1,1,0.35],['linha',1,2,0.3]]}};
const DM_VAGAS=2,DM_ESTADO=['boas','gastas','enferrujadas'];
/* itens que não têm receita: o que a bancada tira deles */
const DESMANCHE_FIXO={lanterna:{pilhas:1,sucata:1},facao:{barraFerro:1,sucata:1},peDeCabra:{barraFerro:1},pistola:{sucata:3,pregos:2},colete:{chapaFerro:1,pano:2},
  mascaraGas:{sucata:1,pano:1,carvao:1},isqueiro:{sucata:1}};
function kitNaMochila(){return P.inv.find(s=>s&&s.id==='kitFerramentas'&&!(s.dur<=0))||null;}
function desmancheSaida(id,cond,kit){const D=DESMANCHE[id],f=[1,0.8,0.6][cond]??1,out={};
  for(const[k,a,b,ch]of D.saida){if(!ITEMS[k])continue;if(ch!==undefined&&Math.random()>=ch+(kit?0.15:0))continue;let n=a+Math.floor(Math.random()*(b-a+1));
    n=Math.round(n*f);if(ch===undefined)n=Math.max(1,n+(kit?1:0));if(n>0)out[k]=(out[k]||0)+n;}
  return out;}
function desmancheProvaveis(id){return listaE(DESMANCHE[id].saida.map(([k])=>ITEMS[k]?ITEMS[k].nome.toLowerCase():k));}
function retornoBancada(s){const d=ITEMS[s.id];if(!d||!['arma','roupa','util'].includes(d.tipo))return null;
  const q=d.durMax&&s.dur!==undefined?clamp(s.dur/Math.max(1,durMaxDe(s)),0,1):1,kit=!!kitNaMochila();
  let base=DESMANCHE_FIXO[s.id]||DESMONTE_FIXO[s.id],fator=kit?1.25:1,soMat=false;
  if(!base){const r=RECIPES.find(r=>r.faz===s.id);if(!r||(r.n||1)>1)return null;base=r.custo;fator=kit?0.9:0.75;soMat=true;}
  const out={};for(const k in base){if(!ITEMS[k]||(soMat&&ITEMS[k].tipo!=='material'))continue;const v=Math.floor(base[k]*fator*(0.4+0.6*q)+1e-6);if(v>0)out[k]=v;}
  if(!Object.keys(out).length){const k=Object.keys(base).find(k=>ITEMS[k]&&(!soMat||ITEMS[k].tipo==='material'));if(k)out[k]=1;}
  return Object.keys(out).length?out:null;}
let e12DesmPend=-1;
ESTACAO_UI.desmanche={cat:'materiais',
  resumo:st=>{const L=st.ext&&st.ext.dm||[];return L.length?L.filter(j=>G.tm>=j.fim).length+' pronto · '+L.length+' na bancada':'bancada livre';},
  render(st){const L=st.ext.dm||(st.ext.dm=[]),kit=kitNaMochila();let c='<div class="es-lista">';
    for(let i=0;i<DM_VAGAS;i++){const j=L[i];if(!j){c+='<div class="es-vaga vazia">'+svgUse('i-desmanche')+'<span>Vaga livre</span></div>';continue;}
      const pr=G.tm>=j.fim,f=1-(j.fim-G.tm)/Math.max(1,j.fim-j.ini);
      c+='<div class="es-vaga'+(pr?' pronta':'')+'">'+svgUse(ITEMS[j.id].icon)+'<span><b>'+ITEMS[j.id].nome+' ('+DM_ESTADO[j.cond]+')</b><small>'+(pr?'Pronto: '+(Object.keys(j.out).length?custoLista(j.out):'só ferrugem, nada que preste'):'Desmanchando · faltam '+horasTxt(j.fim-G.tm))+'</small></span>'+(pr?'':barraHTML(f))+'</div>';}
    c+='</div><p class="es-info">Peças grandes arrancadas de carros, máquinas, móveis e aviões (segure E neles com a ferramenta certa) viram material aqui. Leva um tempo e continua com você longe. '+
      (kit?'Com o kit de ferramentas na mochila sai mais e mais rápido.':'Com o kit de ferramentas na mochila sairia mais e mais rápido.')+' Desmontar itens aqui devolve mais material que na mão.</p>';
    const A=[],pr=L.filter(j=>G.tm>=j.fim).length;
    A.push({id:'recolher',t:'Recolher o material',s:pr?pr+' pronto'+(pr>1?'s':''):'nada pronto ainda',ok:pr>0,prim:pr>0});
    for(const id in DESMANCHE){const n=invCount(id);A.push({id:'dm:'+id,t:'Desmanchar '+ITEMS[id].nome.toLowerCase()+(n?' ('+n+')':''),
      s:n?horasTxt(DESMANCHE[id].min*(kit?0.75:1))+' · rende '+desmancheProvaveis(id):'nenhuma na mochila',ok:!!n&&L.length<DM_VAGAS});}
    for(let i=0;i<INV_N;i++){const s=P.inv[i];if(!s)continue;const ret=retornoBancada(s);if(!ret)continue;const d=ITEMS[s.id],conf=e12DesmPend===i;
      A.push({id:'desm:'+i,t:(conf?'Confirmar: desmontar ':'Desmontar ')+d.nome.toLowerCase(),s:'devolve '+custoLista(ret)+(d.durMax&&s.dur!==undefined?' · estado '+Math.round(s.dur/Math.max(1,durMaxDe(s))*100)+'%':'')});}
    return{sub:'Desmancha peças grandes e desmonta itens, com tempo e ferramenta.',corpo:c,acoes:A};},
  acao(st,id){const L=st.ext.dm||(st.ext.dm=[]);
    if(id==='recolher'){let n=0,cheio=false;for(let i=L.length-1;i>=0;i--){const j=L[i];if(G.tm<j.fim)continue;
        for(const k of Object.keys(j.out)){const left=invAdd(k,j.out[k]);if(left){j.out[k]=left;cheio=true;}else delete j.out[k];}
        if(!Object.keys(j.out).length){L.splice(i,1);n++;}}
      if(n){sfx('pegar');ganharXP(3*n);progresso('desmanche');diarioConta('desmanchou',n);}invRender();
      return n?(cheio?'Recolheu parte; a mochila encheu e o resto ficou na bancada.':'Recolheu o material.'):cheio?'Mochila cheia: libere espaço.':'Nada pronto ainda.';}
    if(id.startsWith('dm:')){const k=id.slice(3);if(!DESMANCHE[k])return'';if(L.length>=DM_VAGAS)return'A bancada está ocupada: espere uma vaga.';if(!invCount(k))return'Você não tem '+ITEMS[k].nome.toLowerCase()+'.';
      const kit=kitNaMochila(),cond=Math.random()<0.45?0:Math.random()<0.65?1:2;invRemove(k,1);if(kit)gastar(kit,1);
      const min=DESMANCHE[k].min*(kit?0.75:1);L.push({id:k,cond,ini:G.tm,fim:G.tm+min,out:desmancheSaida(k,cond,!!kit)});sfx('desmancheMetal');
      dica('bancadaDesm','corpo','A bancada de desmanche trabalha sozinha: volte depois e recolha. Peças em bom estado rendem mais.');
      return ITEMS[k].nome+' ('+DM_ESTADO[cond]+') na bancada: pronto em '+horasTxt(min)+'.';}
    if(id.startsWith('desm:')){const i=+id.slice(5),s=P.inv[i];if(!s){e12DesmPend=-1;return'';}const ret=retornoBancada(s);if(!ret)return'Isso não dá para desmontar.';
      if(e12DesmPend!==i){e12DesmPend=i;return'Toque de novo para confirmar: '+ITEMS[s.id].nome.toLowerCase()+' vira '+custoLista(ret)+'.';}
      e12DesmPend=-1;const kit=kitNaMochila();P.inv[i]=null;if(P.sel===i)P.aim=0;if(kit)gastar(kit,1);
      for(const k in ret){const left=invAdd(k,ret[k]);if(left)soltarItens([[k,left]],P.x,P.z,P.y);}
      G.fab.reg.desm++;sfx('quebrar');ganharXP(2);return'Desmontou '+ITEMS[s.id].nome.toLowerCase()+': '+custoLista(ret)+'.';}
    return'';}};

/* ---------- recuperação de materiais no mundo ---------- */
const RECUP_TIPOS={
  carro:{peca:'pecasCarro',usos:3,dur:4,ruido:15,corte:0.12,ferr:'mec',som:'desmancheMetal'},
  viatura:{peca:'pecasCarro',usos:3,dur:4,ruido:15,corte:0.12,ferr:'mec',som:'desmancheMetal'},
  ambulancia:{peca:'pecasCarro',usos:4,dur:4,ruido:15,corte:0.12,ferr:'mec',som:'desmancheMetal'},
  caminhao:{peca:'pecasCarro',usos:5,dur:4.5,ruido:16,corte:0.12,ferr:'mec',som:'desmancheMetal'},
  onibus:{peca:'pecasCarro',usos:6,dur:4.5,ruido:16,corte:0.12,ferr:'mec',som:'desmancheMetal'},
  aviao:{peca:'destrocosAviao',usos:6,dur:5,ruido:14,corte:0.18,ferr:'mec',som:'desmancheMetal'},
  maquina:{peca:'pecasMaquina',usos:2,dur:4,ruido:13,corte:0.1,ferr:'mec',som:'desmancheMetal'},
  conteiner:{peca:'pecasMaquina',usos:3,dur:4.5,ruido:16,corte:0.12,ferr:'mec',som:'desmancheMetal'},
  movel:{peca:'restosMovel',usos:1,dur:2.6,ruido:8,corte:0.03,ferr:'movel',som:'desmancheMadeira'}};
const RECUP_VEIC={carro:['o carro abandonado',2.15,0.95],viatura:['a viatura',2.15,0.95],ambulancia:['a ambulância',2.8,1.1],caminhao:['o caminhão',4.1,1.25],onibus:['o ônibus',5.8,1.3],conteiner:['o contêiner',3.05,1.25]};
const RECUP_MOVEIS={mesa:'a mesa',mesaC:'a mesa da cozinha',mesinha:'a mesinha',cadeira:'a cadeira',comoda:'a cômoda',criado:'o criado-mudo',rack:'o rack',banco:'o banco',palete:'o palete',sofa:'o sofá',poltrona:'a poltrona'};
const RECUP_ESTOF={sofa:2,poltrona:1};
const RECUP_MAQ={empilhadeira:['a empilhadeira',3],fogao:['o fogão',1],maca:['a maca de hospital',1]};
const AVIAO_USOS={cessna:4,carga:8,heli:6},ESTADO_PECA=['inteiro','enferrujado','destruído'];
let RECUP=null,recupEspera=0;
function recupFerr(tipo){const kit=kitNaMochila(),pc=P.inv.find(s=>s&&s.id==='peDeCabra');
  if(tipo==='mec')return kit?{s:kit,nome:'o kit de ferramentas',k:0.8,gasta:1}:pc?{s:pc,nome:'o pé de cabra',k:1,gasta:3}:null;
  const mc=P.inv.find(s=>s&&(s.id==='machado'||s.id==='machadoPedra'));
  return mc?{s:mc,nome:'o '+ITEMS[mc.id].nome.toLowerCase(),k:0.85,gasta:2}:pc?{s:pc,nome:'o pé de cabra',k:1,gasta:2}:kit?{s:kit,nome:'o kit de ferramentas',k:1.1,gasta:1}:null;}
function recupFaltaFerr(tipo){return tipo==='mec'?'precisa do kit de ferramentas ou de um pé de cabra':'precisa de um machado, pé de cabra ou kit de ferramentas';}
function recupRestante(T){return T.usos-((E12().recup||{})[T.key]||0);}
function temCoisaEmCima(m){const top=m.y+m.h;for(const q of m.p.pecas||[]){const u0=q[0],u1=q[1],y0=q[2],v0=q[4],v1=q[5];if(y0<top-0.06||y0>top+0.4)continue;if(u0<m.u1-0.02&&u1>m.u0+0.02&&v0<m.v1-0.02&&v1>m.v0+0.02)return true;}
  for(const c of CID.conts){if(c.p!==m.p||c.y<top-0.06||c.y>top+0.4)continue;if(c.u-c.hw<m.u1&&c.u+c.hw>m.u0&&c.v-c.hd<m.v1&&c.v+c.hd>m.v0)return true;}return false;}
function recupMontar(){if(typeof CID==='undefined'||!CID.predios.length||!COLL.length)return;const A={pts:[],alvos:{}};
  const novo=(key,tipo,nome,usos,ex)=>{const T=Object.assign({key,tipo,nome,usos,cond:e12Hash(key)%3},ex||{});A.alvos[key]=T;return T;};
  const ponto=(T,x,z,y,r,sc)=>A.pts.push({alvo:T,x,z,y,r:r||1.8,score:sc??0.5});
  const veic=(k,x,z,yaw,y)=>{const V=RECUP_VEIC[k],T=novo('v:'+Math.round(x)+':'+Math.round(z),k,V[0],RECUP_TIPOS[k].usos);let n=0;
    for(const[du,dv]of[[0,V[1]+0.6],[V[2]+0.55,0],[-V[2]-0.55,0]]){const px=x+du*Math.cos(yaw)+dv*Math.sin(yaw),pz=z-du*Math.sin(yaw)+dv*Math.cos(yaw);
      if(pointBlocked(px,pz,0.25))continue;ponto(T,px,pz,y===undefined?ground(px,pz):y,1.9,0.5);if(++n>=2)break;}};
  for(const it of INTER){if(it.kind!=='bau'||it.tabela!=='carro')continue;let best=null,bd=9;
    for(const c of COLL){if(c.t!==1||Math.abs(c.hw-0.95)>0.02||Math.abs(c.hd-2.15)>0.02)continue;const d=Math.hypot(c.x-it.x,c.z-it.z);if(d>2.3&&d<3.2&&d<bd){bd=d;best=c;}}
    if(best)veic('carro',best.x,best.z,best.yaw);}
  for(const p of CID.props)if(RECUP_VEIC[p.k]&&!(p.k==='conteiner'&&p.nivel))veic(p.k,p.x,p.z,p.yaw||0);
  const colMap=new Map();for(const c of COLL)if(c.movel&&c.predio!==undefined)colMap.set(c.predio+':'+c.movel+':'+Math.round(c.x*10)+':'+Math.round(c.z*10),c);
  for(const m of CID.moveis){const mv=RECUP_MOVEIS[m.k],mq=RECUP_MAQ[m.k];if((!mv&&!mq)||!m.p||temCoisaEmCima(m))continue;
    const p=m.p,cu=(m.u0+m.u1)/2,cv=(m.v0+m.v1)/2,w=pw(p,cu,cv),key='m:'+p.id+':'+m.k+':'+Math.round(m.u0*10)+':'+Math.round(m.v0*10)+':'+Math.round(m.y*10);
    const T=novo(key,mv?'movel':'maquina',mv||mq[0],mv?1:mq[1],{m,col:colMap.get(p.id+':'+m.k+':'+Math.round(w[0]*10)+':'+Math.round(w[1]*10))||null,estof:RECUP_ESTOF[m.k]||0});
    ponto(T,w[0],w[1],m.y,1.5+Math.max(m.u1-m.u0,m.v1-m.v0)*0.4,0.3);}
  if(typeof AEREO!=='undefined')for(const d of AEREO.destrocos){if(!d.pts||!d.pts.cols)continue;
    const T=novo('a:'+d.id,'aviao','os destroços do '+(d.tipo==='heli'?'helicóptero':'avião'),AVIAO_USOS[d.tipo]||5,{heli:d.tipo==='heli',carga:d.tipo==='carga'}),c=Math.cos(d.yaw),s=Math.sin(d.yaw);
    for(const[p,hw,hd]of d.pts.cols)for(const[du,dv]of[[hw+0.6,0],[-hw-0.6,0],[0,hd+0.6],[0,-hd-0.6]]){const x=p[0]+du*c+dv*s,z=p[1]-du*s+dv*c;
      if(pointBlocked(x,z,0.25))continue;ponto(T,x,z,ground(x,z),2.0,0.45);}}
  RECUP=A;recupAplicarMoveis();}
function recupRefazerPredio(p){if(!p||!p.mPerto||typeof geoPredio!=='function')return;const velho=p.mPerto;p.mPerto=litMesh(geoPredio(p,false));if(typeof liberarMesh==='function')liberarMesh(velho);}
{const _gp=geoPredio;geoPredio=function(p,longe){if(longe||!CID.moveis.some(m=>m.removido&&m.p===p))return _gp.apply(this,arguments);
  const todos=CID.moveis;CID.moveis=todos.filter(m=>!m.removido);try{return _gp.apply(this,arguments);}finally{CID.moveis=todos;}};}
/* móveis tirados num jogo salvo somem de novo ao carregar; num jogo novo voltam todos */
function recupAplicarMoveis(){if(!RECUP)return;const L=E12().movRem||[],refazer=new Set();
  for(const T of Object.values(RECUP.alvos)){if(!T.m)continue;const tirar=L.includes(T.key);if(tirar===!!T.m.removido)continue;
    T.m.removido=tirar;if(T.col){if(tirar)colRemove(T.col);else if(!T.col.cells)colAdd(T.col);}refazer.add(T.m.p);}
  for(const p of refazer)recupRefazerPredio(p);}
INTERS.push(function e12Recup(tryIt){if(!P.alive||P.nada||(typeof CARRO!=='undefined'&&CARRO.ativo))return;
  if(!RECUP){if(G.t<recupEspera)return;recupEspera=G.t+3;recupMontar();if(!RECUP)return;}
  const mov=!!recupFerr('movel');
  for(const a of RECUP.pts){if(Math.abs(a.x-P.x)>3||Math.abs(a.z-P.z)>3)continue;const T=a.alvo;if(T.m&&T.m.removido)continue;if(T.tipo==='movel'&&!mov)continue;
    tryIt({k:'recup',o:a},a.x,a.z,a.r,a.score,-0.4,a.y);}});
INTER_K.recup={texto:a=>{const T=a.alvo,D=RECUP_TIPOS[T.tipo],rest=recupRestante(T);
    if(rest<=0)return{t:e12Cap(T.nome)+': já depenado',s:'não sobrou nada que preste'};
    const f=recupFerr(D.ferr);if(!f)return{t:'Desmontar '+T.nome,s:recupFaltaFerr(D.ferr)};
    return{t:'Desmontar '+T.nome,s:'segure · '+ITEMS[D.peca].nome.toLowerCase()+' · '+ESTADO_PECA[T.cond]+(T.usos>1?' · '+rest+' de '+T.usos:''),hold:true,dur:D.dur*f.k*(T.cond===2?1.15:1)};},
  usar:(a,seg)=>{if(!seg){const t=INTER_K.recup.texto(a);if(t&&!t.hold)feed(e12Cap(t.s),true);return;}recupConcluir(a);}};
function recupConcluir(a){const T=a.alvo,D=RECUP_TIPOS[T.tipo];if(recupRestante(T)<=0)return;const f=recupFerr(D.ferr);if(!f){feed(e12Cap(recupFaltaFerr(D.ferr)),true);return;}
  const E=E12();E.recup[T.key]=(E.recup[T.key]||0)+1;
  const n=T.tipo==='movel'?1:T.cond===0?2:T.cond===1?(Math.random()<0.5?2:1):1,ganhos=[[D.peca,n]];
  if(T.estof&&temLamina())ganhos.push(['pano',T.estof]);if(T.heli&&Math.random()<0.25)ganhos.push(['pecasRotor',1]);if(T.carga&&Math.random()<0.3)ganhos.push(['pano',2]);
  for(const[id,k]of ganhos){const left=invAdd(id,k);if(left)soltarItens([[id,left]],P.x,P.z,P.y);}
  gastar(f.s,f.gasta);P.energia=Math.max(0,P.energia-5);barulho(P.x,P.z,D.ruido,true,P.y);sfx(D.som);sujar(['maos','tronco','pernas'],0.05);
  {const luva=P.roupa&&P.roupa.maos;if(Math.random()<D.corte*(luva?0.25:1)){if(typeof lesao==='function')lesao('sangramento');
    feed(T.tipo==='movel'?'Uma farpa grossa entrou na mão':luva?'A lataria rasgou a luva e cortou a mão':'Cortou a mão na lataria',true);if(luva)roupaDesgasta('maos',6);}}
  if(T.m){T.m.removido=true;if(T.col)colRemove(T.col);if(!E.movRem.includes(T.key))E.movRem.push(T.key);recupRefazerPredio(T.m.p);}
  ganharXP(4);progresso('desmanche');diarioConta('desmontou',1);
  if(!E.prog['rec_'+T.tipo]){E.prog['rec_'+T.tipo]=1;diarioEvento('Desmontou '+T.nome+' e levou as peças','geral');}
  feed('Tirou '+nomesItens(ganhos)+(!T.m&&recupRestante(T)<=0?' · não sobrou mais nada':''));
  dica('desmanche','corpo','Peças grandes viram material na bancada de desmanche (B → Oficina). Com o kit de ferramentas na mochila sai mais.');invRender();hudBarra();}
/* barulho de ferramenta enquanto segura */
let e12BatidaT=0;
PASSOS.push(function e12Batidas(dt){const a=P.acao;if(!a||a.tipo!=='revistar'||!a.alvo||a.alvo.k!=='recup'||a.done)return;e12BatidaT-=dt;if(e12BatidaT>0)return;e12BatidaT=0.5+Math.random()*0.25;
  const D=RECUP_TIPOS[a.alvo.o.alvo.tipo];sfx(D.som,undefined,undefined,0.45);barulho(P.x,P.z,D.ruido*0.5,true,P.y);});

/* ---------- Tratado do armeiro: baú do ferreiro ao lado da fornalha velha da Serra ---------- */
let BAU_FERREIRO=null;
INIT_MALHAS.push(function e12BauFerreiro(){const f=EST_MUNDO.find(e=>e.id==='fornalhaSerra');if(!f)return;let x=f.x+2.6,z=f.z+0.8;
  busca:for(let r=2.4;r<7;r+=0.6)for(let k=0;k<14;k++){const a=k/14*6.283+0.4,tx=f.x+Math.cos(a)*r,tz=f.z+Math.sin(a)*r;if(!pointBlocked(tx,tz,0.9)&&!(RIO.ok&&aguaPerto(tx,tz,1))){x=tx;z=tz;break busca;}}
  const yaw=Math.atan2(f.x-x,f.z-z),y=ground(x,z);BAU_FERREIRO={x,z,y,yaw};colBox(x,z,0.54,0.34,yaw,{solid:true,y0:y-0.2,y1:y+0.8});
  interAdd({id:'serra-ferreiro',kind:'bau',x,z,r:1.9,label:'Revistar o baú do ferreiro',sub:'o ferreiro do acampamento guardava as coisas dele aqui',tabela:'oficina',respawn:4});});
DESENHO.opaco.push(function e12DesenhoBau(Pg){const b=BAU_FERREIRO;if(!b||!MESH.obra.bau||d2(b.x,b.z,cam.pos[0],cam.pos[2])>100*100)return;drawStat(Pg,MESH.obra.bau,mat(b.x,b.y,b.z,0,b.yaw,0));});
DESENHO.sombra.push(function e12SombraBau(Pg,perto){const b=BAU_FERREIRO;if(!b||!MESH.obra.bau||d2(b.x,b.z,P.x,P.z)>(perto?50:100)**2)return;drawStat(Pg,MESH.obra.bau,mat(b.x,b.y,b.z,0,b.yaw,0));});

/* ---------- armaduras: proteção, peso, barulho e cansaço ---------- */
function armaduraEf(){const o={vel:0,som:0,nado:0,cap:0,peso:0,n:0};if(!P.roupa)return o;
  for(const s of ROUPA_SLOTS){const id=P.roupa[s],d=id&&ITEMS[id];if(!d||!d.arm)continue;const a=d.arm;o.vel+=a.vel||0;o.som+=a.som||0;o.nado+=a.nado||0;
    if(roupaEf(s)>0)o.cap+=a.cap||0;if(d.malha){o.n++;o.peso+=d.peso||0;}}return o;}
{const _p=protecao;protecao=function(){const a=armaduraEf();if(!a.cap)return _p.apply(this,arguments);return Math.min(0.45+a.cap,somaRoupa('prot'));};}
{const _lv=lesaoVel;lesaoVel=function(){const v=_lv.apply(this,arguments),a=armaduraEf();return a.vel?v*(1-a.vel):v;};}
let e12PassoN=null;
PASSOS.push(function e12Armadura(dt){if(!P.alive||G.modo!=='jogo'||(typeof CARRO!=='undefined'&&CARRO.ativo))return;const a=armaduraEf();if(!a.n&&!a.som)return;
  if(a.som>0&&P.passoN!==e12PassoN){e12PassoN=P.passoN;const sp=Math.hypot(P.vx||0,P.vz||0);
    if(sp>0.6&&P.noChao&&!P.nada){barulho(P.x,P.z,a.som*(P.correndo?16:P.agachado?4:9),true,P.y);if(Math.random()<0.75)sfx('malha',undefined,undefined,P.agachado?0.08:P.correndo?0.34:0.2);}}
  if(a.n){if(!P.correndo&&P.energia<100&&P.energia>0)P.energia=Math.max(0,P.energia-dt*4*Math.min(1,a.peso/16));
    if(P.nada&&a.nado)P.energia=Math.max(0,P.energia-dt*9*a.nado);}});

/* ---------- conserto da malha: anéis e sucata, na bancada ou na fornalha ---------- */
{const _cr=custoRoupa;custoRoupa=function(id,I){const d=ITEMS[id];if(!d||!d.malha)return _cr.apply(this,arguments);const f=1-I.dur/durMaxDe(Object.assign({id},I));if(f<0.03)return{};
  return{aneisFerro:Math.max(1,Math.ceil(2*f)),sucata:Math.max(1,Math.ceil(2*f))};};}
{const _ci=consertoInfo;consertoInfo=function(ref){const info=_ci.apply(this,arguments);if(!info||!info.metal||info.ferr)return info;
  if(pertoEstacao('forja')){info.ferr='forja';info.ok=!info.vazio&&invHas(info.c);}return info;};}

/* ---------- sujeira e desgaste pelo uso ---------- */
function sujar(slots,q){if(!P.roupa||!q)return;for(const s of slots){if(!P.roupa[s])continue;const d=ITEMS[P.roupa[s]];if(!d||!d.durMax)continue;const I=roupaInfoDe(s);if(I)I.suj=clamp((I.suj||0)+q,0,1);}}
function sujDe(slot){if(!P.roupa||!P.roupa[slot])return 0;const I=roupaInfoDe(slot);return I&&I.suj||0;}
function sujMedia(){let t=0,n=0;for(const s of ROUPA_SLOTS){if(!P.roupa||!P.roupa[s]||!ITEMS[P.roupa[s]].durMax)continue;t+=sujDe(s);n++;}return n?t/n:0;}
{const _rd=roupaDesgasta;roupaDesgasta=function(slot,q){return _rd.call(this,slot,q*(1+0.8*sujDe(slot)));};}
{const _cal=calorRoupa;calorRoupa=function(){const v=_cal.apply(this,arguments);let t=0,w=0;
  for(const s of ROUPA_SLOTS){const d=roupaItem(s);if(!d||!d.quente)continue;t+=d.quente*sujDe(s);w+=d.quente;}return w?v*(1-0.3*t/w):v;};}
{const _ig=roupaGastar;roupaGastar=function(dano,tipo){const r=_ig.apply(this,arguments);if(tipo!=='fogo'&&dano>0){const L=['tronco','pernas','maos','camiseta'].filter(s=>P.roupa&&P.roupa[s]);if(L.length)sujar([L[Math.floor(Math.random()*L.length)]],dano*0.004);}return r;};}
{const _idr=itemDeRoupa;itemDeRoupa=function(id,I){const it=_idr.apply(this,arguments);if(I&&I.suj)it.suj=I.suj;return it;};}
{const _ve=vestir;vestir=function(i){const s=P.inv[i],d=s&&ITEMS[s.id],suj=s&&s.suj||0;const r=_ve.apply(this,arguments);
  if(d&&d.slot&&P.roupa[d.slot]===s.id&&P.inv[i]!==s&&P.roupaInfo&&P.roupaInfo[d.slot])P.roupaInfo[d.slot].suj=suj;return r;};}
{const _ex=exDe;exDe=function(s){const o=_ex.apply(this,arguments);if(s&&s.suj){const r=o||{};r.suj=s.suj;return r;}return o;};}
{const _si=statsItem;statsItem=function(s,d){const h=_si.apply(this,arguments);if(!d||d.tipo!=='roupa'||!s||!(s.suj>0.02))return h;
  const b=barraStat('Sujeira',s.suj,Math.round(s.suj*100)+'%','#8a6a3a');return h?h.slice(0,-6)+b+'</div>':'<div class="stats-i">'+b+'</div>';};}
/* cor da peça suja no boneco (50_render) */
function roupaTint(slot,base){const s=sujDe(slot);if(s<0.08)return null;const b=base||[1,1,1],k=Math.min(1,s);return[b[0]*(1-0.4*k),b[1]*(1-0.47*k),b[2]*(1-0.55*k)];}
let e12Tm=null;
PASSOS.push(function e12Roupas(dt){if(G.modo!=='jogo'||!P.alive||!P.roupa)return;
  if(P.nada)for(const s of ROUPA_SLOTS){if(!P.roupa[s])continue;const I=roupaInfoDe(s);if(I&&I.suj)I.suj=Math.max(0,I.suj-dt*0.03);}
  {const a=P.acao;if(a&&a.tipo==='revistar'&&a.alvo&&a.alvo.k==='carcaca')sujar(['maos','tronco','camiseta'],dt*0.012);}
  if(P.queima>0)sujar(ROUPA_SLOTS,dt*0.02);
  const tm=G.tm||0;if(e12Tm===null||tm<e12Tm||tm-e12Tm>240){e12Tm=tm;return;}const dm=tm-e12Tm;if(dm<1)return;e12Tm=tm;roupasUso(dm);});
function roupasUso(min){if(CARRO.ativo)return;const mov=Math.hypot(P.vx||0,P.vz||0)>0.6&&P.noChao&&!P.nada,mol=(G.chuva||0)>0.3||(E.wet||0)>0.3;
  for(const s of ROUPA_SLOTS){const id=P.roupa[s],d=id&&ITEMS[id];if(!d||!d.durMax)continue;
    const taxa=(d.mat==='metal'?0.1:d.mat==='couro'?0.2:0.35)*(P.correndo?1.5:1)*(s==='costas'||s==='cintura'?0.5:1);roupaDesgasta(s,taxa*min/60);}
  sujar(ROUPA_SLOTS,0.00012*min);if(mov&&mol){sujar(['pes'],0.004*min);sujar(['pernas'],0.002*min);}if(mov&&P.agachado)sujar(['pernas'],0.002*min);}
/* lavar: na água (rio, lago, poço) ou com uma garrafa d'água; lava o que está vestido e as roupas da mochila */
function aguaParaLavar(){if(P.nada||naAgua(P.x,P.y,P.z))return'rio';if(RIO.ok&&P.y>-20&&aguaPerto(P.x,P.z,2.5))return'rio';
  for(const it of INTER)if(it.kind==='agua'&&Math.hypot(it.x-P.x,it.z-P.z)<3.5)return'poco';return invCount('agua')>0?'garrafa':null;}
function roupasSujas(){let n=0;for(const s of ROUPA_SLOTS)if(sujDe(s)>0.02)n++;for(const s of P.inv)if(s&&ITEMS[s.id]&&ITEMS[s.id].tipo==='roupa'&&(s.suj||0)>0.02)n++;return n;}
function lavarRoupas(){const fonte=aguaParaLavar();if(!fonte){feed('Para lavar precisa de água: rio, lago, poço ou uma garrafa de água',true);return false;}
  let n=0,vest=0;for(const s of ROUPA_SLOTS){if(sujDe(s)>0.02){roupaInfoDe(s).suj=0;n++;vest++;}}
  for(const s of P.inv)if(s&&ITEMS[s.id]&&ITEMS[s.id].tipo==='roupa'&&(s.suj||0)>0.02){s.suj=0;n++;}
  if(!n){feed('As roupas já estão limpas',true);return false;}
  if(fonte==='garrafa'){invRemove('agua',1);const left=invAdd('garrafa',1);if(left)soltarItens([['garrafa',left]],P.x,P.z,P.y);}
  if(vest)P.molhado=Math.max(P.molhado||0,0.55);sfx('lavar');ganharXP(1);diarioConta('lavou',1);
  feed('Lavou '+n+(n>1?' peças':' peça')+(fonte==='garrafa'?' com uma garrafa de água':'')+(vest?': limpas, mas você ficou molhado':''));invRender();hudBarra();return true;}
{const _mr=mochilaRender;mochilaRender=function(){_mr.apply(this,arguments);const det=$('detalhe');if(!det)return;
  let alvo=null;if(roupaSel&&P.roupa[roupaSel])alvo='vestida';else if(invSel>=0&&P.inv[invSel]&&ITEMS[P.inv[invSel].id].tipo==='roupa')alvo='mochila';
  if(!alvo||!roupasSujas())return;const ac=det.querySelector('.det-acoes');const fonte=aguaParaLavar();
  const nota='<p class="det-nota">'+svgUse('i-lavar')+'<span>Roupa suja gasta mais rápido e esquenta menos. '+(fonte?'Dá para lavar aqui'+(fonte==='garrafa'?' com uma garrafa de água':'')+'.':'Lave na água: rio, lago, poço ou com uma garrafa de água.')+'</span></p>';
  const bt='<button class="btn" type="button" data-acao="lavarRoupas"'+(fonte?'':' disabled')+'>'+svgUse('i-lavar')+'Lavar as roupas</button>';
  if(ac){ac.insertAdjacentHTML('beforebegin',nota);ac.insertAdjacentHTML('beforeend',bt);}else det.insertAdjacentHTML('beforeend',nota+'<div class="det-acoes">'+bt+'</div>');};}
{const det=$('detalhe');if(det)det.addEventListener('click',e=>{const b=e.target.closest('[data-acao="lavarRoupas"]');if(!b||b.disabled)return;e.stopImmediatePropagation();lavarRoupas();},true);}

/* ---------- desenho das armaduras e roupas reforçadas no boneco do jogador ---------- */
function malhaFaixas(put,b,M,F,nome,t0,t1,dr,seg,n,cA,cB,op){   // fileiras de anéis: cada fileira em gomos de dois tons (trama) e um sulco escuro fino
  const h=(t1-t0)/n,A0=op&&op.a0!==undefined?op.a0:0,A1=op&&op.a1!==undefined?op.a1:Math.PI*2,k=Math.max(6,Math.round(seg*0.75)),c2=cA.map(v=>v*0.86);
  for(let i=0;i<n;i++){const a=t0+h*i,m=a+h*0.76,z=Math.min(t1,a+h+0.002);
    for(let q=0;q<k;q++){const u0=A0+(A1-A0)*q/k,u1=A0+(A1-A0)*(q+1)/k,o={a0:u0,a1:u1};if(op&&op.capB&&i===0)o.capB=true;put(b,parteCorpo(M,F,nome,a,m,dr,2,o),ID,(q+i)%2?cA:c2,0.06);}
    const o2=Object.assign({},op||{});delete o2.capB;if(i<n-1)delete o2.capT;put(b,parteCorpo(M,F,nome,m,z,dr-0.002,seg,o2),ID,cB,0.03);}}
{const _rgn=roupaGeoNova;roupaGeoNova=function(put,P,id,M){_rgn.apply(this,arguments);
  if(!['capaceteMalha','peitoralMalha','calcaMalha','jaquetaReforcada','calcaReforcada'].includes(id))return;
  const ra=M.braco.R,rl=M.coxa.R,PV=M.pelve,TR=M.tronco,FC=P.fCab||F_CABECA,H=M.cabeca;
  const noTronco=(t,dr)=>{const p=perfil(formaDe(M,F_TRONCO),t,t,TR.R,TR.y0,TR.h)[0];return{y:p[1],z:(p[0]+dr)*TR.sz+p[2]};};
  const A=lin(0x7b7a76),B=lin(0x4c4b48),CL=lin(0x8f8e89),cou=lin(0x4a3424),cv=lin(0x2f2117),me=lin(0xb9a06a),pl=lin(0x7f7d77);
  if(id==='peitoralMalha'){malhaFaixas(put,1,M,F_TRONCO,'tronco',0.02,0.92,0.024,18,20,A,B);for(const[t,m]of ombrosTris(P,0.026))put(1,t,m,lin(0x62615d),0.1);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0.9,0.99,0.034,16),ID,cou);put(1,parteCorpo(M,F_TRONCO,'tronco',0.05,0.12,0.036,16),ID,cv);
    {const q=noTronco(0.085,0.036);put(1,bevelTris(0.05,0.045,0.012,0.004),mat(0,q.y,q.z+0.004),me,0);}
    malhaFaixas(put,0,M,F_PELVE,'pelve',0.2,1,0.042,16,8,A,B);put(0,parteCorpo(M,F_PELVE,'pelve',0.17,0.24,0.048,16),ID,cou);
    for(const s of[1,-1]){const b=s>0?3:5;put(b,ellipTris(ra*1.12+0.026,ra*1.25+0.022,ra*1.06+0.026,12,8),mat(-s*0.008,-0.01,0),lin(0x62615d),0.1);
      malhaFaixas(put,b,M,F_BRACO,'braco',0,0.9,0.022,12,9,A,B);put(b,parteCorpo(M,F_BRACO,'braco',0.84,0.93,0.028,12),ID,cou);}}
  if(id==='calcaMalha'){malhaFaixas(put,0,M,F_PELVE,'pelve',0,1,0.016,14,7,A,B,{capB:true});put(0,latheTris([[PV.R*0.95,0.05],[PV.R*0.96,0.09]],14,1,PV.sz,{dr:0.026}),ID,cv);
    put(0,bevelTris(0.05,0.04,0.012,0.005),mat(0,0.07,PV.R*PV.sz*0.96+0.03),me,0);
    for(const s of[1,-1]){const u=s>0?7:9,l=s>0?8:10;malhaFaixas(put,u,M,F_COXA,'coxa',0,1,0.018,12,11,A,B);
      put(l,ellipTris(rl*0.75+0.018,rl*0.82+0.016,rl*0.76+0.018,10,6),ID,lin(0x62615d),0.1);put(l,ellipTris(rl*0.62,rl*0.7,0.034,10,6),mat(0,-0.012,rl*0.76+0.034),CL,0.04);
      malhaFaixas(put,l,M,F_CANELA,'canela',0,0.92,0.016,12,11,A,B);}}
  if(id==='capaceteMalha'){put(2,parteCorpo(M,FC,'cabeca',0.62,1,0.032,18,{capT:true}),ID,CL,0.04);put(2,parteCorpo(M,FC,'cabeca',0.58,0.67,0.041,18),ID,B,0.04);
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;put(2,ellipTris(0.008,0.008,0.006,6,4),mat(Math.sin(a)*(H.R+0.04),H.y0+H.h*0.625,Math.cos(a)*(H.R*1.05+0.04)),me,0);}
    {const f=frenteCabeca(M,0.56,0.04,FC);put(2,bevelTris(0.024,0.13,0.014,0.005),mat(0,f.y+0.035,f.z+0.012,-0.12,0,0),CL,0.04);}
    malhaFaixas(put,2,M,FC,'cabeca',0.08,0.6,0.034,16,7,A,B,{a0:1.3,a1:Math.PI*2-1.3});malhaFaixas(put,1,M,F_TRONCO,'tronco',0.9,1,0.042,16,3,A,B);}
  if(id==='jaquetaReforcada'){const cu=lin(0x5e3d26),es=lin(0x3e2818);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0,0.955,0.016,18),ID,cu);for(const[t,m]of ombrosTris(P,0.016))put(1,t,m,cu);
    put(1,parteCorpo(M,F_TRONCO,'tronco',0,0.06,0.022,16),ID,es);put(1,parteCorpo(M,F_TRONCO,'tronco',0.9,0.975,0.025,16),ID,es);
    for(const[t,x]of[[0.48,-0.07],[0.48,0.07],[0.7,-0.07],[0.7,0.07]]){const q=noTronco(t,0.02);put(1,bevelTris(0.11,0.1,0.014,0.004),mat(x,q.y,q.z+0.008),pl,0.04);
      put(1,ellipTris(0.006,0.006,0.004,5,3),mat(x-0.042,q.y+0.036,q.z+0.016),me,0);}
    {const q=noTronco(0.6,0.02);put(1,bevelTris(0.24,0.26,0.014,0.004),mat(0,q.y,-q.z-0.006),pl,0.04);}
    for(const s of[1,-1]){const b=s>0?3:5,l=s>0?4:6;put(b,ellipTris(ra*1.12+0.018,ra*1.25+0.016,ra*1.06+0.018,12,8),mat(-s*0.008,-0.01,0),cu);
      put(b,parteCorpo(M,F_BRACO,'braco',0,1,0.016,12),ID,cu);put(b,ellipTris(ra*1.2+0.034,ra*0.95+0.02,ra*1.14+0.034,12,6),mat(-s*0.01,0.012,0),pl,0.04);
      put(l,ellipTris(ra*0.77+0.016,ra*0.84+0.014,ra*0.74+0.016,10,6),ID,cu);put(l,parteCorpo(M,F_ANTEB,'antebraco',0,0.85,0.015,12),ID,cu);
      put(l,parteCorpo(M,F_ANTEB,'antebraco',0.25,0.72,0.027,12),ID,pl,0.04);}}
  if(id==='calcaReforcada'){const cu=lin(0x5a3d27);
    put(0,parteCorpo(M,F_PELVE,'pelve',0,1,0.014,14,{capB:true}),ID,cu);put(0,latheTris([[PV.R*0.95,0.05],[PV.R*0.96,0.09]],14,1,PV.sz,{dr:0.022}),ID,lin(0x2a1d14));
    for(const s of[1,-1]){const u=s>0?7:9,l=s>0?8:10;put(u,parteCorpo(M,F_COXA,'coxa',0,1,0.015,12),ID,cu);put(u,parteCorpo(M,F_COXA,'coxa',0.35,0.78,0.025,8,{a0:-0.9,a1:0.9}),ID,pl,0.04);
      put(l,ellipTris(rl*0.75+0.015,rl*0.82+0.014,rl*0.76+0.015,10,6),ID,cu);put(l,ellipTris(rl*0.62,rl*0.7,0.03,10,6),mat(0,-0.01,rl*0.76+0.03),pl,0.04);
      put(l,parteCorpo(M,F_CANELA,'canela',0,0.9,0.014,12),ID,cu);}}};}

/* ---------- sons ---------- */
Object.assign(SONS,{
  malha:({tone,noise,r})=>{for(let i=0;i<3;i++){const f=(3000+Math.random()*2600)*r();tone(0.05,'triangle',f,f*0.97,0.045,i*0.03+Math.random()*0.02);}noise(0.05,'highpass',5600,4200,1,0.1);},
  desmancheMetal:({tone,noise,r})=>{const f=(520+Math.random()*700)*r();tone(0.18,'triangle',f,f*0.9,0.12);tone(0.1,'square',f*2.6,f*2.4,0.03,0.01);noise(0.12,'bandpass',2600*r(),1600,3,0.35);noise(0.05,'highpass',4500,3500,1,0.2,0.08);},
  desmancheMadeira:({tone,noise,r})=>{noise(0.12,'bandpass',900*r(),500,2,0.6);tone(0.08,'triangle',180*r(),110,0.18);noise(0.06,'highpass',2600,1800,1,0.25,0.07);},
  lavar:({noise,r})=>{for(let i=0;i<4;i++)noise(0.22,'bandpass',(700+Math.random()*900)*r(),500,0.9,0.35,i*0.16);},
  estudo:({noise,tone,r})=>{noise(0.09,'bandpass',3200*r(),2400,1.5,0.25);noise(0.07,'bandpass',2600*r(),2000,1.5,0.18,0.12);tone(0.05,'sine',880,820,0.04,0.2);}});

/* ---------- salvar, carregar e jogo novo ---------- */
V8.novo.e12=()=>{G.e12=e12Novo();e12Tm=null;e12DesmPend=-1;recupAplicarMoveis();};
V8.salvar.e12=()=>E12();
V8.carregar.e12=s=>{const n=e12Novo();if(s&&typeof s==='object'){Object.assign(n.estudos,s.estudos||{});Object.assign(n.prog,s.prog||{});Object.assign(n.recup,s.recup||{});if(Array.isArray(s.movRem))n.movRem=s.movRem.slice();}
  G.e12=n;e12Tm=null;e12DesmPend=-1;recupAplicarMoveis();};
