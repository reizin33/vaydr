/* ================= oficinas especializadas, conservação de comida, metal, melhorias de armas, ferimentos graves e abrigo =================
   Estações (construídas na base ou achadas no mundo): estação de couro e costura (48m), bancada de armas (conserto mais barato
   e melhorias: empunhadura de couro, lâmina afiada, corda de tendão, mira ajustada), fornalha (carvão e barra de ferro com o minério
   da Serra Velha; faz pregos, faca de caça, machado, picareta e chapa de ferro), defumador e secador (carne e peixe defumados, charque)
   e a oficina mecânica (a bancada nível 2 ou a oficina do posto: óleo improvisado com gordura e peça de motor com barra de ferro).
   Comida: carne e peixe crus, assados e defumados têm validade; nos baús envelhecem pela metade e na despensa a um quarto.
   O que passa da validade vira comida estragada (faz mal; serve de isca no laço e de adubo na horta).
   Ferida grave: golpe muito forte (urso, onça, chefes) baixa a vida máxima até ser tratada (sutura ou kit médico) ou sarar com comida e sono.
   Abrigo: dentro de prédios, da cabana, da barraca, debaixo de telhado construído (e nos subterrâneos) a chuva não molha e o frio pesa menos. */
iconesNovos({
  'i-minerio':'<path d="m5 15 3-7 5-2 5 4 1 6-5 3-6-1z"/><path d="m9 10 2 2M14 9l1 3M10 15l2-1"/>',
  'i-barra':'<path d="M3 15 7 9h14l-4 6z"/><path d="M7 9v0M3 15v2h14l4-6v-2"/>',
  'i-carvao':'<path d="M6 16c-1.5-3 1-6 4-6 .5-2.5 4-3.5 6-1 2.5 0 3.5 3 2 5 .5 2-1 3.5-3 3H8c-1 0-1.6-.4-2-1z"/>',
  'i-chapa':'<rect x="4" y="6" width="16" height="12" rx="1"/><circle cx="7" cy="9" r=".6"/><circle cx="17" cy="9" r=".6"/><circle cx="7" cy="15" r=".6"/><circle cx="17" cy="15" r=".6"/>',
  'i-carne-def':'<path d="M6 17c-2-2-2-6 1-9s7-4 10-1 2 8-1 10-8 2-10 0z"/><path d="M9 9c1 1 3 1 4 0M8 13c1.5 1 5 1 7-1"/>',
  'i-estragado':'<path d="M6 17c-2-2-2-6 1-9s7-4 10-1 2 8-1 10-8 2-10 0z"/><path d="m9 10 1.5 1.5M13 9l-1 2M10 14h4"/>',
  'i-adubo':'<path d="M6 9h12l-1.5 11h-9z"/><path d="M9 9c0-3 1.5-5 3-5s3 2 3 5"/><path d="M10 13h.01M14 15h.01M12 17h.01"/>',
  'i-sutura':'<path d="M4 20 18 6"/><path d="M8 8c2 0 2 2 4 2s2-2 4-2"/><path d="M8 14c2 0 2 2 4 2s2-2 4-2"/>',
  'i-forja':'<path d="M4 20h16M6 20V9l6-5 6 5v11"/><path d="M10 20v-5a2 2 0 0 1 4 0v5"/><path d="M11 12c0-1.5 2-1.5 2-3"/>'});
Object.assign(ITEMS,{
  minerioFerro:{nome:'Minério de ferro',icon:'i-minerio',max:20,tipo:'material',desc:'Pedra com ferro. Sai das pedras com picareta (mais nas da Serra Velha). Vira barra na fornalha.'},
  carvao:{nome:'Carvão',icon:'i-carvao',max:20,tipo:'material',desc:'Madeira queimada devagar na fornalha. Esquenta o bastante para derreter ferro.'},
  barraFerro:{nome:'Barra de ferro',icon:'i-barra',max:12,tipo:'material',desc:'Ferro fundido na fornalha. Vira pregos, lâminas, ferramentas e chapas.'},
  chapaFerro:{nome:'Chapa de ferro',icon:'i-chapa',max:8,tipo:'material',desc:'Chapa batida na fornalha. Reforça portas e paredes da base.'},
  carneDefumada:{nome:'Carne defumada',icon:'i-carne-def',max:12,tipo:'comida',fome:30,vida:3,validade:240,desc:'Defumada no defumador: dura uns 10 dias.'},
  carneSeca:{nome:'Charque',icon:'i-carne-def',max:12,tipo:'comida',fome:26,sede:-4,validade:360,desc:'Carne salgada e seca: dura uns 15 dias, mas dá sede.'},
  peixeDefumado:{nome:'Peixe defumado',icon:'i-carne-def',max:12,tipo:'comida',fome:24,vida:2,validade:200,desc:'Peixe defumado: dura uns 8 dias.'},
  carneEstragada:{nome:'Comida estragada',icon:'i-estragado',max:20,tipo:'comida',fome:4,vida:-8,desc:'Passou da validade. Faz mal se comer; serve de isca no laço e de adubo na horta.'},
  farinhaOsso:{nome:'Farinha de osso',icon:'i-adubo',max:20,tipo:'util',acao:'Adubar a horta',desc:'Ossos moídos (ou comida estragada curtida). Perto de uma horta, adianta a colheita em um terço.'},
  sutura:{nome:'Kit de sutura',icon:'i-sutura',max:5,tipo:'cura',trata:'ferida',vida:5,desc:'Agulha, linha e antisséptico: fecha a ferida grave na hora (a vida máxima volta).'}});
/* validade em horas de jogo (sem microgerenciamento: só carne e peixe estragam) */
Object.assign(ITEMS.carneCrua,{validade:24});Object.assign(ITEMS.carneAssada,{validade:48});
if(ITEMS.peixeCru)Object.assign(ITEMS.peixeCru,{validade:18});if(ITEMS.peixeAssado)Object.assign(ITEMS.peixeAssado,{validade:40});
/* oficinas construídas na base */
Object.assign(OBRAS,{
  bancadaArmas:{nome:'Bancada de armas',icon:'i-oficina',custo:{tabuas:6,sucata:4,pregos:4},hp:200,hw:0.95,hd:0.45,solid:true,etapa:2,estacao:'armas',base:true},
  fornalha:{nome:'Fornalha',icon:'i-forja',custo:{pedra:14,tabuas:2,sucata:2},hp:320,hw:0.75,hd:0.75,solid:true,etapa:3,estacao:'forja',base:true,luz:true},
  defumador:{nome:'Defumador',icon:'i-carne-def',custo:{tabuas:5,pedra:6,pregos:2},hp:160,hw:0.8,hd:0.6,solid:true,etapa:2,estacao:'conserva',base:true},
  despensa:{nome:'Despensa',icon:'i-bau',custo:{tabuas:8,pregos:4,sal:1},hp:180,hw:0.6,hd:0.38,solid:true,bau:true,etapa:2,conserva:0.25,base:true}});
for(const k of['bancadaArmas','fornalha','defumador','despensa']){OBRA_ORDEM.push(k);OBRAS_CHAO.push(k);if(typeof OBRAS_PREDIO!=='undefined'&&k!=='fornalha')OBRAS_PREDIO.push(k);}
function oficinasGeo(R){const mk=f=>{const g=new GB(2048,8);f(g);return litMesh(g.data());},mad=lin(0x6b4e30),mad2=lin(0x54402c),aco=lin(0x6a7076),esc=lin(0x2b2b2b),ped=lin(0x6d6a64),ped2=lin(0x57544f);
  MESH.obra.bancadaArmas=mk(g=>{add(g,bvTris(1.8,0.08,0.8),mat(0,0.86,0),mad,{j:0.05,rnd:R});for(const sx of[-1,1])for(const sz of[-1,1])add(g,bvTris(0.08,0.86,0.08),mat(sx*0.82,0.43,sz*0.33),mad2);
    add(g,bvTris(1.7,0.05,0.7),mat(0,0.3,0),mad2,{j:0.05,rnd:R});add(g,bvTris(0.25,0.18,0.18),mat(-0.6,0.99,0.1),aco);add(g,cylTris(0.03,0.03,0.25,6),mat(-0.6,1.08,0.22,Math.PI/2,0,0),esc);
    add(g,bvTris(1.6,0.6,0.04),mat(0,1.3,-0.38),mad,{j:0.05,rnd:R});for(let i=0;i<4;i++)add(g,bvTris(0.04,0.04,0.12),mat(-0.5+i*0.33,1.4,-0.32),aco);
    add(g,bvTris(0.5,0.05,0.07),mat(-0.3,1.38,-0.3,0,0,0.3),esc);add(g,bvTris(0.06,0.4,0.05),mat(0.35,1.3,-0.33),lin(0x7a5a3a));add(g,bvTris(0.5,0.12,0.2),mat(0.4,0.96,0.05),lin(0x4a5a3a));});
  MESH.obra.fornalha=mk(g=>{add(g,cylTris(0.62,0.75,1.1,9),mat(0,0,0),ped,{j:0.15,rnd:R});add(g,cylTris(0.3,0.55,0.55,9),mat(0,1.1,0),ped2,{j:0.15,rnd:R});
    add(g,cylTris(0.16,0.2,0.9,8),mat(0,1.6,0),ped2,{j:0.12,rnd:R});add(g,bvTris(0.5,0.42,0.1),mat(0,0.45,0.68),lin(0x1a1410));add(g,bvTris(0.42,0.08,0.3),mat(0,0.25,0.8),aco);
    add(g,icoTris(0.16,0.3,R),mat(0,0.42,0.6),lin(0xff7a30),{e:2.2});add(g,bvTris(0.5,0.5,0.5),mat(1.05,0.25,0),lin(0x55595c));add(g,bvTris(0.62,0.08,0.24),mat(1.05,0.54,0),esc);});
  MESH.obra.defumador=mk(g=>{add(g,bvTris(1.3,1.6,0.95),mat(0,0.8,0),mad,{j:0.08,rnd:R});add(g,bvTris(1.45,0.08,1.1,{tx:0.6}),mat(0,1.66,0),mad2);add(g,cylTris(0.1,0.1,0.6,7),mat(0.35,1.66,0.2),ped2);
    add(g,bvTris(0.6,0.5,0.06),mat(0,0.55,0.49),lin(0x2a1e14));for(let i=0;i<3;i++)add(g,bvTris(0.16,0.3,0.06),mat(-0.3+i*0.3,1.3,0.5),lin(0x7a3a24),{j:0.12,rnd:R});
    add(g,bvTris(0.9,0.35,0.6),mat(0,0.18,0),ped,{j:0.12,rnd:R});});
  MESH.obra.despensa=mk(g=>{add(g,bvTris(1.15,0.7,0.7),mat(0,0.35,0),lin(0x5a6a72),{j:0.05,rnd:R});add(g,bvTris(1.2,0.06,0.75),mat(0,0.73,0),lin(0x48565c));
    add(g,bvTris(0.3,0.06,0.03),mat(0,0.5,0.36),aco);for(const s of[-1,1])add(g,bvTris(0.04,0.66,0.72),mat(s*0.6,0.35,0),lin(0x48565c));});}
INIT_MALHAS.push(()=>oficinasGeo(rng(731)));
/* oficinas achadas no mundo */
EST_MUNDO.push(
  {id:'armasBase',estTipo:'armas',malha:'bancadaArmas',x:-101,z:-21.5,yaw:Math.PI,ext:{},nome:'Bancada do arsenal da base militar'},
  {id:'fornalhaSerra',estTipo:'forja',malha:'fornalha',x:-90,z:-74,yaw:0.6,ext:{},nome:'Fornalha velha do acampamento da Serra'},
  {id:'defumadorFazenda',estTipo:'conserva',malha:'defumador',x:-82,z:50,yaw:1.2,ext:{},nome:'Defumador da fazenda'},
  {id:'defumadorLago',estTipo:'conserva',malha:'defumador',x:81,z:84,yaw:-0.6,ext:{},nome:'Defumador da cabana do pescador'},
  {id:'oficinaPosto',estTipo:'mecanica',malha:'bancadaArmas',x:99,z:-15,yaw:0,ext:{},nome:'Oficina do posto'});
/* acerta a posição das estações do mundo num lugar livre perto do ponto pedido (antes de criar o colisor) */
function estLivre(e){if(!pointBlocked(e.x,e.z,1.2))return;for(let r=1;r<8;r+=0.75)for(let k=0;k<12;k++){const a=k/12*6.283,x=e.x+Math.cos(a)*r,z=e.z+Math.sin(a)*r;if(!pointBlocked(x,z,1.2)&&!(RIO.ok&&aguaPerto(x,z,1))){e.x=x;e.z=z;return;}}}
INIT_MALHAS.unshift(()=>{for(const e of EST_MUNDO)if(!e.col)estLivre(e);});

/* ---------- processos com tempo: fornalha e defumador (continuam com você longe; aparecem na tela da estação) ---------- */
const PROCESSOS={
  forja:{vagas:3,rec:[{id:'carvao',nome:'Queimar carvão',de:{madeira:3},para:['carvao',2],h:1},{id:'barra',nome:'Fundir barra de ferro',de:{minerioFerro:2,carvao:1},para:['barraFerro',1],h:2}]},
  conserva:{vagas:6,rec:[{id:'defCarne',nome:'Defumar carne',de:{carneCrua:2,madeira:1},para:['carneDefumada',2],h:4},{id:'defPeixe',nome:'Defumar peixe',de:{peixeCru:2,madeira:1},para:['peixeDefumado',2],h:3},
    {id:'charque',nome:'Fazer charque (secar com sal)',de:{carneCrua:2,sal:1},para:['carneSeca',2],h:6,manual:'manualConserva'},{id:'farinha',nome:'Curtir comida estragada em adubo',de:{carneEstragada:3},para:['farinhaOsso',1],h:8}]}};
MANUAIS.manualConserva={nome:'Manual de conservação',local:'vila-mercado',onde:'no mercado da vila',ensina:'a fazer charque: carne salgada e seca que dura 15 dias'};
function procRender(st,tipo,titulo){const D=PROCESSOS[tipo],L=st.ext.proc||(st.ext.proc=[]);let c='<div class="es-lista">';
  for(let i=0;i<D.vagas;i++){const it=L[i];if(!it){c+='<div class="es-vaga vazia">'+svgUse(ESTACOES[tipo].icon)+'<span>Vaga livre</span></div>';continue;}
    const R=D.rec.find(r=>r.id===it.r),pr=G.tm>=it.fim,f=1-(it.fim-G.tm)/(it.fim-it.ini),out=ITEMS[R.para[0]];
    c+='<div class="es-vaga'+(pr?' pronta':'')+'">'+svgUse(out.icon)+'<span><b>'+R.para[1]+' '+out.nome.toLowerCase()+'</b><small>'+(pr?'Pronto para recolher':R.nome+' · faltam '+horasTxt(it.fim-G.tm))+'</small></span>'+(pr?'':barraHTML(f))+'</div>';}
  c+='</div>';const A=[],livre=L.length<D.vagas,pr=L.filter(c=>G.tm>=c.fim).length;
  A.push({id:'recolher',t:'Recolher o que ficou pronto',s:pr?pr+' pronto'+(pr>1?'s':''):'nada pronto ainda',ok:pr>0,prim:pr>0});
  for(const R of D.rec){const sabe=!R.manual||G.fab.manuais[R.manual],ok=sabe&&livre&&invHas(R.de);
    A.push({id:'proc:'+R.id,t:R.nome,s:sabe?Object.entries(R.de).map(([k,n])=>Math.min(invCount(k),99)+'/'+n+' '+ITEMS[k].nome.toLowerCase()).join(' · ')+' → '+R.para[1]+' '+ITEMS[R.para[0]].nome.toLowerCase()+' · '+horasTxt(R.h*60):'aprenda no '+MANUAIS[R.manual].nome+' ('+MANUAIS[R.manual].onde+')',ok});}
  return{sub:titulo,corpo:c,acoes:A};}
function procAcao(st,tipo,id){const D=PROCESSOS[tipo],L=st.ext.proc||(st.ext.proc=[]);
  if(id==='recolher'){let n=0,cheio=false;for(let i=L.length-1;i>=0;i--){const it=L[i];if(G.tm<it.fim)continue;const R=D.rec.find(r=>r.id===it.r);const left=invAdd(R.para[0],R.para[1]);if(left){if(left<R.para[1]){it.n=left;}cheio=true;continue;}L.splice(i,1);n++;}
    if(n){sfx('pegar');ganharXP(2*n);progresso(tipo==='forja'?'fundir':'conservar');}return n?(cheio?'Recolheu parte; a mochila encheu.':'Recolhido.'):cheio?'Mochila cheia.':'Nada pronto ainda.';}
  if(id.startsWith('proc:')){const R=D.rec.find(r=>r.id===id.slice(5));if(!R)return'';if(R.manual&&!G.fab.manuais[R.manual])return'Você ainda não sabe fazer isso.';if(L.length>=D.vagas)return'Sem vaga livre.';if(!invHas(R.de))return'Faltam: '+faltaLista(R.de)+'.';
    invPay(R.de);anotarGasto(R.de);L.push({r:R.id,ini:G.tm,fim:G.tm+R.h*60});sfx('construir');
    if(tipo==='forja')dica('forja','corpo','A fornalha trabalha sozinha: volte depois e recolha. Barra de ferro vira pregos, faca de caça, machado, picareta e chapa (receitas da fornalha, na aba Fabricar).');
    else dica('defumar','corpo','Defumar e secar fazem a carne durar dias. Comida dentro de baú envelhece pela metade; na despensa, a um quarto.');
    return R.nome+': pronto em '+horasTxt(R.h*60)+'.';}
  return'';}
ESTACAO_UI.forja={cat:'materiais',resumo:st=>{const L=st.ext.proc||[];return L.length?L.filter(c=>G.tm>=c.fim).length+' pronto · '+L.length+' na fornalha':'fornalha apagada';},
  render:st=>{const r=procRender(st,'forja','Queima madeira em carvão e funde o minério da Serra em barras de ferro. As receitas de ferro (pregos, faca de caça, machado, picareta, chapa) ficam na aba Fabricar, perto da fornalha.');r.acoes.push({id:'__costura',t:'Receitas da fornalha',s:'pregos, faca de caça, ferramentas e chapa'});return r;},
  acao:(st,id)=>procAcao(st,'forja',id)};
ESTACAO_UI.conserva={cat:'cura',resumo:st=>{const L=st.ext.proc||[];return L.length?L.filter(c=>G.tm>=c.fim).length+' pronto · '+L.length+' no defumador':'defumador vazio';},
  render:st=>procRender(st,'conserva','Defuma carne e peixe (duram dias) e seca charque com sal. Comida estragada vira adubo para a horta.'),acao:(st,id)=>procAcao(st,'conserva',id)};
/* ---------- bancada de armas: conserto mais barato (vale para armas de fogo) e melhorias da arma ---------- */
const REPARO_ARMAS={pistola:{sucata:2},espingarda:{sucata:3,madeira:1},rifle:{sucata:3,pano:1},besta:{madeira:1,corda:1,sucata:1},arco:{corda:1,madeira:1},facaCaca:{barraFerro:1}};
const MELHORIAS={cabo:{nome:'Empunhadura de couro',desc:'+25% de durabilidade',custo:{couroPequeno:1,linha:1},serve:d=>d.corpo},
  fio:{nome:'Lâmina afiada',desc:'+15% de dano',custo:{pedra:1,gordura:1},serve:d=>d.corpo&&(d.corta||d.esfola)},
  corda:{nome:'Corda de tendão',desc:'+15% de dano',custo:{tendao:2},serve:d=>d.arco||d.besta},
  mira:{nome:'Mira ajustada',desc:'+10% de dano',custo:{sucata:2,pano:1},serve:d=>d.fogo&&!d.besta}};
function danoUp(s){if(!s||!s.up)return 1;return 1+(s.up.fio?0.15:0)+(s.up.corda?0.15:0)+(s.up.mira?0.1:0);}
function custoArma(s){const d=ITEMS[s.id],b=REPARO[s.id]||REPARO_ARMAS[s.id];if(!b||!d.durMax||s.dur===undefined)return null;const f=1-s.dur/durMaxDe(s);if(f<0.03)return{};
  const c={};for(const k in b)c[k]=Math.max(1,Math.ceil(b[k]*f*0.7));return c;}
ESTACAO_UI.armas={resumo:()=>'conserto e melhorias',
  render(st){const A=[];let c='<div class="es-lista">',tem=0;
    for(let i=0;i<INV_N;i++){const s=P.inv[i];if(!s)continue;const d=ITEMS[s.id];if(!d||d.tipo!=='arma'||(!d.dano&&!d.fogo&&!d.arco))continue;tem++;
      const ups=Object.keys(s.up||{}).map(k=>MELHORIAS[k].nome.toLowerCase());
      c+='<div class="es-vaga">'+svgUse(d.icon)+'<span><b>'+d.nome+'</b><small>'+(d.durMax?'estado '+Math.round(s.dur/Math.max(1,durMaxDe(s))*100)+'%':'')+(ups.length?' · '+ups.join(', '):'')+'</small></span></div>';
      const cc=custoArma(s);if(cc&&Object.keys(cc).length)A.push({id:'cons:'+i,t:'Consertar '+d.nome.toLowerCase(),s:custoLista(cc)+' (30% mais barato aqui)',ok:invHas(cc)});
      for(const k in MELHORIAS){const M=MELHORIAS[k];if(!M.serve(d)||(s.up&&s.up[k]))continue;A.push({id:'up:'+k+':'+i,t:M.nome+' · '+d.nome.toLowerCase(),s:M.desc+' · '+custoLista(M.custo),ok:invHas(M.custo)});}}
    c+='</div>';if(!tem)c='<p class="es-info">Traga armas na mochila para consertar ou melhorar.</p>';
    return{sub:'Conserta armas (inclusive as de fogo, arco e besta) gastando 30% menos e faz melhorias que ficam na arma.',corpo:c,acoes:A};},
  acao(st,id){const p=id.split(':'),i=+p[p.length-1],s=P.inv[i];if(!s)return'';const d=ITEMS[s.id];
    if(p[0]==='cons'){const cc=custoArma(s);if(!cc||!invHas(cc))return'Faltam materiais.';invPay(cc);anotarGasto(cc);s.dur=durMaxDe(s);G.fab.reg.cons++;sfx('construir');ganharXP(3);progresso('consertar');return'Consertou: '+d.nome.toLowerCase()+'.';}
    if(p[0]==='up'){const M=MELHORIAS[p[1]];if(!M||!invHas(M.custo))return'Faltam materiais.';invPay(M.custo);anotarGasto(M.custo);s.up=Object.assign({},s.up||{},{[p[1]]:1});
      if(p[1]==='cabo'&&s.dur!==undefined)s.dur=Math.round(s.dur*1.25);sfx('construir');ganharXP(6);progresso('melhorar');return M.nome+' em '+d.nome.toLowerCase()+'.';}
    return'';}};
ESTACAO_UI.mecanica={cat:'materiais',resumo:()=>'peças e óleo',render:()=>({sub:'Oficina mecânica: fabrique óleo improvisado, peças de motor e kits. Os consertos do veículo continuam no próprio veículo (segure E perto dele).',corpo:'',acoes:[{id:'__costura',t:'Receitas da oficina',s:'óleo, peças e kits'}]}),acao:()=>''};
/* receitas das estações */
RECIPES.push(
  {faz:'pregos',n:8,nome:'Pregos (de barra de ferro)',custo:{barraFerro:1},cat:'materiais',etapa:2,est:'forja',desb:{item:'barraFerro'}},
  {faz:'facaCaca',n:1,custo:{barraFerro:1,couroPequeno:1,madeira:1},cat:'ferramentas',etapa:2,est:'forja',desb:{item:'barraFerro'}},
  {faz:'machado',n:1,nome:'Machado (forjado)',custo:{barraFerro:2,madeira:2},cat:'ferramentas',etapa:3,est:'forja',desb:{item:'barraFerro'}},
  {faz:'picareta',n:1,nome:'Picareta (forjada)',custo:{barraFerro:2,madeira:2},cat:'ferramentas',etapa:2,est:'forja',desb:{item:'barraFerro'}},
  {faz:'chapaFerro',n:1,custo:{barraFerro:2},cat:'materiais',etapa:3,est:'forja',desb:{item:'barraFerro'}},
  {faz:'oleoMotor',n:1,nome:'Óleo improvisado (de gordura)',custo:{gordura:3,garrafa:1},cat:'materiais',etapa:2,est:'mecanica',desb:{item:'gordura'}},
  {faz:'pecaVeiculo',n:1,nome:'Peça de motor (forjada)',custo:{barraFerro:1,sucata:3},cat:'materiais',etapa:3,est:'mecanica',desb:{item:'barraFerro'}},
  {faz:'farinhaOsso',n:2,custo:{ossos:2},cat:'materiais',etapa:1,est:0,desb:{item:'ossos'}},
  {faz:'sutura',n:1,custo:{linha:1,antisseptico:1,pano:1},cat:'cura',etapa:2,est:0,ferramenta:false,desb:{item:'linha'}});
/* adubo: perto de uma horta, adianta a colheita */
UTIL_ACOES.farinhaOsso=(i,s)=>{let h=null,bd=4*4;for(const o of OB){if(o.tipo!=='horta')continue;const q=d2(o.x,o.z,P.x,P.z);if(q<bd){bd=q;h=o;}}
  if(!h){feed('Chegue perto de uma horta para adubar',true);return false;}if((h.ext.cresce||0)>=1){feed('A horta já está pronta para colher',true);return false;}
  h.ext.cresce=Math.min(1,(h.ext.cresce||0)+0.34);gastarUm(i);sfx('pegar');feed('Adubou a horta: '+Math.round(h.ext.cresce*100)+'%');invRender();hudBarra();return false;};

/* ---------- validade da comida ---------- */
let validT=0,validTm=null;
function validadeDe(id){const d=ITEMS[id];return d&&d.validade?d.validade*60:0;}
function estragar(s){const n=s.n;s.id='carneEstragada';s.n=n;delete s.v;}
function validadePasso(){if(validTm===null){validTm=G.tm;return;}const dm=G.tm-validTm;validTm=G.tm;let virou=0;
  for(const s of P.inv){if(!s||!ITEMS[s.id]||!ITEMS[s.id].validade)continue;if(s.v===undefined)s.v=Math.round(G.tm+validadeDe(s.id));if(s.v<=G.tm){estragar(s);virou++;}}
  for(const o of OB){if(!o.itens)continue;const k=o.conservaK??OBRAS[o.tipo].conserva??0.5;for(const s of o.itens){if(!s||!ITEMS[s.id]||!ITEMS[s.id].validade)continue;if(s.v===undefined)s.v=Math.round(G.tm+validadeDe(s.id));
    s.v+=dm*(1-k);if(s.v<=G.tm)estragar(s);}}
  if(virou){feed('Estragou: '+virou+' tipo'+(virou>1?'s':'')+' de comida na mochila',true);dica('validade','corpo','Carne e peixe estragam: crus em um dia, assados em dois. Defumar ou fazer charque faz durar mais de uma semana; baú e despensa conservam melhor que a mochila.');}}
PASSOS.push(dt=>{validT-=dt;if(validT<=0){validT=5;validadePasso();}});
function validadeTexto(s){if(s.v===undefined)return'';const h=(s.v-G.tm)/60;return h>48?Math.round(h/24)+' dias':h>1?Math.round(h)+' h':'menos de 1 h';}
USO_EXTRA.push((id,d)=>{if(id==='carneEstragada'){if(Math.random()<0.75){P.intox=Math.max(P.intox||0,1);feed('Isso estava estragado. Dor de barriga!',true);}}});

/* ---------- ferida grave: golpe muito forte rasga; baixa a vida máxima até tratar ou sarar ---------- */
function feridaGrave(d){if(!P.alive)return;const L=P.lesoes||(P.lesoes=lesNovo());if(L.ferida)return;L.ferida={h:0};
  toast('alerta','Ferida grave! A vida máxima caiu. Feche com um kit de sutura ou kit médico; comendo bem e dormindo, sara em cerca de um dia.');hudBarra();}
let feridaT=0;
PASSOS.push(dt=>{const L=P.lesoes;if(!L||!L.ferida||!P.alive)return;feridaT-=dt;if(feridaT>0)return;feridaT=2;
  const bem=P.fome>40&&P.sede>40,ritmo=(P.dorme?3:1)*(bem?1:0.25),dm=Math.max(0,G.tm-(L.ferida.tm??G.tm));L.ferida.tm=G.tm;L.ferida.h+=dm/60*ritmo;
  if(L.ferida.h>=24){L.ferida=null;toast('corpo','A ferida grave fechou. A vida máxima voltou ao normal.');}});
HUDS.push(()=>{const el=$('vx-ferida');if(!el)return;const on=!!(P.lesoes&&P.lesoes.ferida);if(el.hidden===on)el.hidden=!on;});

/* ---------- abrigo: dentro de construções a chuva não molha e o frio pesa menos ---------- */
function abrigado(){if(CARRO.ativo&&!VT().exposto)return true;if((emPredios(P.x,P.z,2)||P.y<-20)&&interiorEm(P.x,P.y+0.3,P.z)>0.5)return true;if(ferroInteriorEm(P.x,P.y+0.3,P.z))return true;
  if(Math.abs(P.x-77.5)<1.7&&Math.abs(P.z-80.5)<1.4)return true;
  const c=INTER.find(i=>i.id==='cama');if(c&&Math.hypot(c.x-P.x,c.z-P.z)<1.7)return true;
  for(const o of OB){if(o.tipo!=='telhado')continue;if(Math.abs(o.x-P.x)<1.6&&Math.abs(o.z-P.z)<1.6&&o.y>P.y+0.6&&o.y<P.y+4.5)return true;}
  if(typeof subterraneoEm==='function'&&subterraneoEm(P.x,P.y,P.z))return true;return false;}
let abrigoT=0;
HUDS.push(()=>{abrigoT-=1;if(abrigoT>0)return;abrigoT=10;const el=$('vx-abrigo');if(!el)return;const on=abrigado()&&(G.chuva>0.3||(E.n||0)>0.6||(typeof climaFrio==='function'&&climaFrio()>0.2));if(el.hidden===on)el.hidden=!on;});

/* ---------- Serra Velha: pedras grandes com minério (somadas às pedras do mapa, com id próprio) ---------- */
function serraPedras(){const R=rng(777);let n=0;for(let k=0;k<400&&n<46;k++){const a=R()*6.283,r=Math.sqrt(R())*34,x=SERRA.x+Math.cos(a)*r,z=SERRA.z+Math.sin(a)*r;
    if(!dentroMapa(x,z,6)||pointBlocked(x,z,1.6)||Math.hypot(x+108,z+30)<26)continue;const s=0.9+R()*1.4,rk={id:ROCKS.length,x,z,y:ground(x,z)-s*0.25,s,r:R()*6.283,hp:6,alive:true,t:0.75+R()*0.25,serra:true};
    ROCKS.push(rk);colCircle(x,z,0.85*s,{rock:rk});n++;}}
/* ---------- salvar e carregar: processos das oficinas achadas no mundo (as construídas guardam no próprio baú/obra) ---------- */
V8.novo.oficinas=()=>{validTm=null;};
V8.carregar.oficinas=()=>{validTm=null;};
