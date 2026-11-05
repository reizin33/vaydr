/* ================= couro e roupas: materiais dos bichos, curtimento, estação de couro e costura, desgaste e conserto =================
   Materiais (com qualidade: baixa, comum, boa, excepcional): couro pequeno (coelho, raposa), couro comum (ovelha, cabra, cervo, javali, lobo),
   couro grande (vaca, urso) e couro resistente (onça). Bruto sai da carcaça; curtido sai da estação de couro (couro bruto + gordura ou sal,
   algumas horas de jogo). Peças simples aceitam couro bruto; jaqueta, calça, mochila reforçada, casaco grande e o equipamento de exploração
   pedem couro curtido. Ossos viram agulha; tendão e lã viram linha; lã vira pano; gordura curte couro e vira óleo improvisado.
   Roupas: proteção (golpes e mordidas), calor, chuva, peso, durabilidade e bolsos. Gastam com golpes, fogo e (botas) com a caminhada;
   rasgada não protege mais até ser consertada (remendo ou pano + linha + agulha). Conserto fora da estação baixa um pouco o máximo da peça. */
iconesNovos({
  'i-camiseta':'<path d="M8 4 4 6.5 5.5 10 8 9v11h8V9l2.5 1L20 6.5 16 4c-.6 1.6-2.2 2.5-4 2.5S8.6 5.6 8 4z"/>',
  'i-luva':'<path d="M8 21v-5l-3-4.5c-.6-1 .8-2.2 1.7-1.3L8 12V5a1.2 1.2 0 0 1 2.4 0v5V4a1.2 1.2 0 0 1 2.4 0v6V5a1.2 1.2 0 0 1 2.4 0v6-3.5a1.2 1.2 0 0 1 2.4 0V15l-1.6 6z"/>',
  'i-cinto':'<path d="M3 9h18v6H3z"/><path d="M10 8.5h4v7h-4z"/><path d="M12 12h3"/>',
  'i-bermuda':'<path d="M6 4h12l1.5 12-5.5 1-2-7-2 7-5.5-1z"/><path d="M6 7h12"/>',
  'i-bone':'<path d="M4 15c0-5 3.6-9 8-9s8 4 8 9z"/><path d="M4 15h16.5c.8 0 1.5.6 1.5 1.3 0 .4-.3.7-.7.7H12"/><path d="M12 6v3"/>',
  'i-agulha':'<path d="m4 20 13.5-13.5"/><path d="M19.6 4.4a1.5 1.5 0 0 1 0 2.1l-1.4 1.4-2.1-2.1 1.4-1.4a1.5 1.5 0 0 1 2.1 0z"/><path d="M17 8.5c2 2.5-1 5.5-4 4.5"/>',
  'i-linha':'<rect x="7" y="4" width="10" height="16" rx="1.5"/><path d="M7 8h10M7 16h10M9.5 10.5l5 3"/>',
  'i-remendo':'<path d="M5 5h14v14H5z"/><path d="M8 5v-1M12 5v-1M16 5v-1M8 20v-1M12 20v-1M16 20v-1M5 8H4M5 12H4M5 16H4M20 8h-1M20 12h-1M20 16h-1"/>',
  'i-osso':'<path d="M7.5 15.5 15.5 7.5"/><path d="M6 13.5a2.3 2.3 0 1 0-1.5 3.9 2.3 2.3 0 1 0 3.9-1.5"/><path d="M17.8 10.5a2.3 2.3 0 1 0 1.5-3.9A2.3 2.3 0 1 0 15.4 5"/>',
  'i-gordura':'<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>',
  'i-la':'<circle cx="12" cy="12" r="7.5"/><path d="M5.5 9c4 1 9 4 11.5 9M8 5.5c3 2.5 6 6.5 7.5 11.5M14 4.7c1.6 2 2.6 4.4 3 7"/>',
  'i-tendao':'<path d="M5 19c3-2 2-6 5-8s4-6 9-7"/><path d="M7 20c3-2 2-6 5-8s4-6 9-7"/>',
  'i-couro-grande':'<path d="M6 3c2.5 1.6 9.5 1.6 12 0 .6 2.3 2.4 3.4 3.6 3.4-1.2 3.5-1.2 8 0 11.5-1.2 0-3 1.1-3.6 3.4-2.5-1.6-9.5-1.6-12 0-.6-2.3-2.4-3.4-3.6-3.4 1.2-3.5 1.2-8 0-11.5C3.6 6.4 5.4 5.3 6 3z"/><path d="M9 10h6M9 14h6"/>',
  'i-couro-resistente':'<path d="M7 4c2 1.5 8 1.5 10 0 .5 2 2 3 3 3-1 3-1 7 0 10-1 0-2.5 1-3 3-2-1.5-8-1.5-10 0-.5-2-2-3-3-3 1-3 1-7 0-10 1 0 2.5-1 3-3z"/><circle cx="10" cy="10" r="1"/><circle cx="14.5" cy="12" r="1"/><circle cx="10.5" cy="15" r="1"/>',
  'i-curtido':'<path d="M7 4c2 1.5 8 1.5 10 0 .5 2 2 3 3 3-1 3-1 7 0 10-1 0-2.5 1-3 3-2-1.5-8-1.5-10 0-.5-2-2-3-3-3 1-3 1-7 0-10 1 0 2.5-1 3-3z"/><path d="m9 12 2 2 4-4"/>',
  'i-varal':'<path d="M4 21V5M20 21V5M3 6h18"/><path d="M7 6v8c1.5 1.2 3.5 1.2 5 0V6M13.5 6v6c1.2 1 3 1 4.5 0V6"/>',
  'i-laco':'<path d="M12 21V11"/><circle cx="12" cy="7" r="4"/><path d="M8.5 9 5 13"/>',
  'i-sal':'<path d="M8 8h8l1 12H7z"/><path d="M9 8V5.5a3 3 0 0 1 6 0V8"/><path d="M10 12h.01M13 14h.01M11 16h.01"/>',
  'i-casaco-grande':'<path d="M8 3 3 6v14h5v-9M16 3l5 3v14h-5v-9"/><path d="M8 3c1 2 2.5 3 4 3s3-1 4-3M8 11h8v10H8z"/><path d="M12 6v15"/>',
  'i-cinturao':'<path d="M3 9h18v5H3z"/><path d="M5 14v4h4v-4M15 14v4h4v-4M10.5 8.5h3v6h-3z"/>',
  'i-mochila-exp':'<path d="M7 7a5 5 0 0 1 10 0v13H7z"/><path d="M7 12h10M10 7V4.5h4V7M4 10v8M20 10v8"/>',
  'i-relogio':'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  'i-faca-caca':'<path d="M14 4 7 15l2 2 9-9z"/><path d="m7 15-3 5M9 17l-1.5 1.5"/><path d="M14 4l3.5-.5L18 8"/>'});
Object.assign(ITEMS,{
  couroPequeno:{nome:'Couro pequeno',icon:'i-pele',max:12,tipo:'material',qual:true,desc:'De coelho e raposa. Vira remendo, gorro e o forro do casaco.'},
  couroGrande:{nome:'Couro grande',icon:'i-couro-grande',max:8,tipo:'material',qual:true,desc:'De vaca e urso. Curtido na estação de couro, vira o casaco grande e a mochila de expedição.'},
  couroResistente:{nome:'Couro resistente',icon:'i-couro-resistente',max:8,tipo:'material',qual:true,desc:'Couro de onça, grosso e firme. Curtido, vira o equipamento de exploração reforçado.'},
  couroCurtido:{nome:'Couro comum curtido',icon:'i-curtido',max:12,tipo:'material',qual:true,desc:'Couro comum preparado na estação de couro. Vira jaqueta, calça e mochila reforçada.'},
  couroGrandeCurtido:{nome:'Couro grande curtido',icon:'i-curtido',max:8,tipo:'material',qual:true,desc:'Couro grande preparado. Peças grandes e exigentes.'},
  couroResistenteCurtido:{nome:'Couro resistente curtido',icon:'i-curtido',max:8,tipo:'material',qual:true,desc:'Couro de onça preparado. Receitas especiais de exploração.'},
  ossos:{nome:'Ossos',icon:'i-osso',max:20,tipo:'material',desc:'Viram agulha de costura e pontas de flecha; moídos, viram farinha de osso para a horta.'},
  gordura:{nome:'Gordura animal',icon:'i-gordura',max:12,tipo:'material',desc:'Curte o couro (1 por couro na estação) e vira óleo improvisado para motor na oficina.'},
  la:{nome:'Lã',icon:'i-la',max:20,tipo:'material',desc:'Da ovelha. Vira linha, pano e forra o saco de dormir.'},
  tendao:{nome:'Tendão',icon:'i-tendao',max:12,tipo:'material',desc:'Seco, vira linha forte (3 linhas) ou corda de arco.'},
  linha:{nome:'Linha',icon:'i-linha',max:30,tipo:'material',desc:'Para costurar roupa e consertar. Sai de fibra, lã, tendão ou pano desfiado; também aparece nas casas.'},
  remendo:{nome:'Remendo de couro',icon:'i-remendo',max:12,tipo:'material',desc:'Pedaço de couro pronto para costurar. Conserta roupa de couro (com linha e agulha).'},
  sal:{nome:'Sal',icon:'i-sal',max:12,tipo:'material',desc:'Curte couro no lugar da gordura e seca carne (charque). Aparece em cozinhas e mercados.'},
  agulhaOsso:{nome:'Agulha de osso',icon:'i-agulha',max:1,tipo:'util',costura:true,durMax:30,desc:'Feita de osso. Com ela na mochila você costura consertos em qualquer lugar.'},
  agulha:{nome:'Agulha de aço',icon:'i-agulha',max:1,tipo:'util',costura:true,durMax:120,desc:'Agulha de verdade, de uma caixa de costura. Dura bem mais que a de osso.'},
  laco:{nome:'Laço de caça',icon:'i-laco',max:6,tipo:'util',desc:'Arme no chão (perto de mato e rastros): coelhos e raposas que passam ficam presos. Volte depois para ver.'},
  facaCaca:{nome:'Faca de caça',icon:'i-faca-caca',max:1,tipo:'arma',corpo:true,dano:24,alcance:1.85,tempo:0.38,durMax:260,esfola:true,esfolaQ:1,desc:'Lâmina boa de verdade. Esfola com capricho: o couro sai uma qualidade melhor.'},
  // roupas novas (achadas no mundo)
  bermuda:{nome:'Bermuda simples',icon:'i-bermuda',max:1,tipo:'roupa',slot:'pernas',mat:'tecido',prot:0,quente:0.02,chuva:0,peso:0.2,durMax:70,desc:'Bermuda de tecido fino. Cobre, mas não protege nem esquenta.'},
  camiseta:{nome:'Camiseta básica',icon:'i-camiseta',max:1,tipo:'roupa',slot:'camiseta',mat:'tecido',prot:0.01,quente:0.05,chuva:0,peso:0.15,durMax:70,desc:'Camiseta clara de algodão. Primeira camada: esquenta um pouco por baixo da jaqueta.'},
  camisaLeve:{nome:'Camisa de manga longa',icon:'i-camisa',max:1,tipo:'roupa',slot:'tronco',mat:'tecido',prot:0.03,quente:0.1,chuva:0.05,peso:0.3,durMax:90,desc:'Camisa escura de tecido grosso, mangas dobradas. Protege de arranhão leve.'},
  calcaCargo:{nome:'Calça cargo',icon:'i-calca',max:1,tipo:'roupa',slot:'pernas',mat:'tecido',prot:0.04,quente:0.08,chuva:0.06,peso:0.6,durMax:110,bolsos:2,desc:'Calça resistente com bolsos laterais: +2 espaços de bolso.'},
  botasTrilha:{nome:'Botas de trilha',icon:'i-botas',max:1,tipo:'roupa',slot:'pes',mat:'couro',prot:0.03,quente:0.06,chuva:0.2,peso:0.9,durMax:150,silencio:0.1,desc:'Botas marrons de trilha. Seguram a água das poças e gastam com a caminhada.'},
  cinto:{nome:'Cinto simples',icon:'i-cinto',max:1,tipo:'roupa',slot:'cintura',mat:'couro',peso:0.2,durMax:160,bolsos:1,desc:'Cinto de couro com uma bolsinha: +1 espaço de bolso.'},
  mochilaPequena:{nome:'Mochila pequena',icon:'i-mochila',max:1,tipo:'roupa',slot:'costas',mat:'tecido',espaco:8,peso:0.4,durMax:120,desc:'Mochila escura e pequena: libera 8 espaços. É só um começo.'},
  bone:{nome:'Boné',icon:'i-bone',max:1,tipo:'roupa',slot:'cabeca',mat:'tecido',prot:0.005,chuva:0.08,peso:0.1,durMax:80,desc:'Boné velho. Tira um pouco da chuva do rosto.'},
  bandana:{nome:'Bandana',icon:'i-pano',max:1,tipo:'roupa',slot:'rosto',mat:'tecido',esporos:0.35,peso:0.05,durMax:60,desc:'Pano amarrado no rosto: filtra parte dos esporos e da poeira.'},
  // roupas de couro (fabricadas)
  luvasCouro:{nome:'Luvas de couro',icon:'i-luva',max:1,tipo:'roupa',slot:'maos',mat:'couro',prot:0.03,quente:0.12,chuva:0.05,peso:0.2,durMax:130,espinho:0.6,desc:'Protegem as mãos de espinhos, arame e mordidas e esquentam um pouco.'},
  casacoGrande:{nome:'Casaco de couro grande',icon:'i-casaco-grande',max:1,tipo:'roupa',slot:'tronco',mat:'couro',prot:0.18,quente:0.7,chuva:0.6,fogo:0.2,peso:2.8,durMax:280,desc:'Couro grande curtido, longo e pesado. O mais quente e o que melhor segura a chuva.'},
  cinturaoExploracao:{nome:'Equipamento de exploração reforçado',icon:'i-cinturao',max:1,tipo:'roupa',slot:'cintura',mat:'couro',prot:0.04,fogo:0.1,peso:0.8,durMax:320,bolsos:4,esfolaRapido:0.3,desc:'Cinturão de couro de onça com bolsas e bainha: +4 espaços de bolso e esfola 30% mais rápido.'},
  mochilaExpedicao:{nome:'Mochila de expedição',icon:'i-mochila-exp',max:1,tipo:'roupa',slot:'costas',mat:'couro',prot:0.02,peso:2.0,durMax:340,espaco:32,desc:'Couro grande curtido com reforço de couro de onça: libera 32 espaços.'}});
/* roupas que já existiam: atributos novos e nomes do pedido */
Object.assign(ITEMS.couro,{nome:'Couro comum',qual:true,desc:'De ovelha, cabra, cervo, javali e lobo. Bruto serve para botas, luvas e a mochila simples; curtido vira jaqueta e calça.'});
Object.assign(ITEMS.peleCoelho,{desc:'Pele de coelho antiga: serve no lugar do couro pequeno nas receitas.'});
Object.assign(ITEMS.botasCouro,{nome:'Botas reforçadas',mat:'couro',prot:0.05,quente:0.1,chuva:0.4,peso:1.2,durMax:220,silencio:0.25,desc:'Couro grosso e sola costurada: protegem, seguram a água e deixam os passos mais silenciosos.'});
Object.assign(ITEMS.calcaCouro,{nome:'Calças de couro',mat:'couro',prot:0.1,quente:0.15,chuva:0.35,peso:1.4,durMax:200,desc:'Couro curtido: aguenta arranhão e mordida e segura a chuva.'});
Object.assign(ITEMS.camisaCouro,{nome:'Jaqueta de couro',icon:'i-casaco',mat:'couro',prot:0.13,quente:0.25,chuva:0.45,fogo:0.1,peso:1.6,durMax:200,desc:'Jaqueta de couro curtido: protege o tronco, esquenta e segura a chuva.'});
Object.assign(ITEMS.casacoPele,{mat:'couro',prot:0.15,quente:0.6,chuva:0.3,peso:2.0,durMax:180});
Object.assign(ITEMS.gorroPele,{mat:'couro',prot:0.04,quente:0.3,chuva:0.15,peso:0.2,durMax:120});
Object.assign(ITEMS.mochila,{nome:'Mochila simples de couro',mat:'couro',peso:0.9,durMax:200,desc:'Couro e tecido costurados: libera 18 espaços.'});
Object.assign(ITEMS.mochilaRef,{mat:'couro',peso:1.4,durMax:260,desc:'Couro curtido com fivelas: libera 24 espaços.'});
if(ITEMS.colete)Object.assign(ITEMS.colete,{mat:'metal',chuva:0.1,peso:3.0,durMax:250});
if(ITEMS.mascaraGas)Object.assign(ITEMS.mascaraGas,{slot:'rosto',mat:'metal',esporos:0.95,peso:0.5,durMax:150,desc:'Filtra o gás verde dos inchados e os esporos da mata hostil. Vai no rosto.'});
Object.assign(ITEMS.facaPedra,{esfolaQ:-1});Object.assign(ITEMS.machado,{esfolaQ:-1});Object.assign(ITEMS.machadoPedra,{esfolaQ:-1});
/* receitas: as de roupa passam para a estação de couro e costura (est:'couro') */
const recDe=id=>RECIPES.find(r=>r.faz===id);
function recMuda(id,o){const r=recDe(id);if(r){for(const k of['alt','desb'])if(!(k in o))delete r[k];Object.assign(r,o);}else RECIPES.push(Object.assign({faz:id,n:1,cat:'roupas',etapa:2},o));}
recMuda('mochila',{custo:{couro:3,pano:3,linha:2},est:'couro',etapa:2});
recMuda('botasCouro',{custo:{couro:2,linha:1,corda:1},est:'couro',desb:{item:'couro'}});
recMuda('calcaCouro',{custo:{couroCurtido:3,linha:2,pano:1},est:'couro',desb:{item:'couroCurtido'}});
recMuda('camisaCouro',{custo:{couroCurtido:3,linha:2,pano:1},est:'couro',desb:{item:'couroCurtido'}});
recMuda('gorroPele',{custo:{couroPequeno:2,linha:1},alt:{couroPequeno:['peleCoelho',2]},est:'couro',desb:{item:'couroPequeno'}});
recMuda('casacoPele',{custo:{couroCurtido:2,couroPequeno:3,pano:2,linha:2},alt:{couroPequeno:['peleCoelho',3]},est:'couro',etapa:3,desb:{manual:'cadernoCaca'}});
recMuda('mochilaRef',{custo:{couroCurtido:4,pano:3,linha:3,pregos:2},est:'couro',etapa:3,desb:{item:'couroCurtido'}});
RECIPES.push(
  {faz:'remendo',n:2,custo:{couroPequeno:1},alt:{couroPequeno:['peleCoelho',1]},cat:'materiais',etapa:1,est:0,ferramenta:true,desb:{item:'couroPequeno'}},
  {faz:'linha',n:1,nome:'Linha (de fibra)',custo:{fibra:3},cat:'materiais',etapa:1,est:0},
  {faz:'linha',n:2,nome:'Linha (de lã)',custo:{la:1},cat:'materiais',etapa:1,est:0,desb:{item:'la'}},
  {faz:'linha',n:3,nome:'Linha forte (de tendão)',custo:{tendao:1},cat:'materiais',etapa:1,est:0,ferramenta:true,desb:{item:'tendao'}},
  {faz:'pano',n:2,nome:'Pano (de lã)',custo:{la:3},cat:'materiais',etapa:1,est:0,desb:{item:'la'}},
  {faz:'corda',n:1,nome:'Corda (de tendão)',custo:{tendao:2},cat:'materiais',etapa:1,est:0,desb:{item:'tendao'}},
  {faz:'agulhaOsso',n:1,custo:{ossos:1},cat:'ferramentas',etapa:1,est:0,ferramenta:true,desb:{item:'ossos'}},
  {faz:'laco',n:2,custo:{corda:1,graveto:2},cat:'ferramentas',etapa:1,est:0},
  {faz:'luvasCouro',n:1,custo:{couro:2,linha:1},cat:'roupas',etapa:2,est:'couro',desb:{item:'couro'}},
  {faz:'casacoGrande',n:1,custo:{couroGrandeCurtido:2,pano:3,linha:2},cat:'roupas',etapa:3,est:'couro',desb:{item:'couroGrandeCurtido'}},
  {faz:'cinturaoExploracao',n:1,custo:{couroResistenteCurtido:2,linha:3,sucata:2,corda:1},cat:'roupas',etapa:3,est:'couro',desb:{item:'couroResistenteCurtido'}},
  {faz:'mochilaExpedicao',n:1,custo:{couroGrandeCurtido:2,couroResistenteCurtido:1,pano:4,linha:4,sucata:2},cat:'roupas',etapa:3,est:'couro',desb:{item:'couroGrandeCurtido'}});
/* onde achar (casas, lojas, armários, hospitais, acampamentos) */
for(const[t,e]of[['casa',['linha',1,3,0.35]],['casa',['agulha',1,1,0.12]],['casa',['sal',1,2,0.25]],['casa',['camiseta',1,1,0.12]],['casa',['bermuda',1,1,0.08]],['casa',['bone',1,1,0.08]],
  ['casa',['camisaLeve',1,1,0.07]],['casa',['calcaCargo',1,1,0.05]],['mercado',['sal',1,3,0.4]],['mercado',['linha',1,2,0.2]],['celeiro',['linha',1,2,0.3]],['celeiro',['laco',1,2,0.25]],
  ['celeiro',['facaCaca',1,1,0.06]],['celeiro',['cinto',1,1,0.12]],['celeiro',['botasTrilha',1,1,0.06]],['oficina',['cinto',1,1,0.1]],['lixo',['linha',1,1,0.2]],['carro',['bone',1,1,0.06]],
  ['carro',['mochilaPequena',1,1,0.05]],['suprimentos',['mochilaPequena',1,1,0.25]],['suprimentos',['bandana',1,1,0.2]],['suprimentos',['botasTrilha',1,1,0.15]],['pescador',['facaCaca',1,1,0.25]],
  ['pescador',['laco',1,2,0.4]],['pescador',['linha',1,3,0.4]]])if(LOOT[t])LOOT[t].push(e);
for(const[t,e]of[['ap_cozinha',['sal',.35,1,2]],['ap_gaveta',['linha',.25,1,2]],['ap_gaveta',['agulha',.08,1,1]],['ap_quarto',['camiseta',.18,1,1]],['ap_quarto',['camisaLeve',.1,1,1]],
  ['ap_quarto',['calcaCargo',.08,1,1]],['ap_quarto',['bermuda',.1,1,1]],['ap_quarto',['bone',.1,1,1]],['lavanderia',['camiseta',.3,1,2]],['lavanderia',['camisaLeve',.2,1,1]],['lavanderia',['calcaCargo',.15,1,1]],
  ['hotel_mala',['camiseta',.25,1,1]],['hotel_mala',['bermuda',.15,1,1]],['hotel_mala',['bone',.12,1,1]],['conveniencia',['sal',.3,1,2]],['armazem_caixa',['botasTrilha',.08,1,1]],['vestiario',['camiseta',.25,1,1]],['vestiario',['botasTrilha',.1,1,1]],['vestiario',['calcaCargo',.12,1,1]],
  ['vestiario',['mochilaPequena',.1,1,1]],['vestiario',['cinto',.15,1,1]],['hosp_armario',['bandana',.15,1,1]],['hosp_armario',['linha',.2,1,2]],['hosp_deposito',['agulha',.12,1,1]],
  ['estoque',['linha',.25,1,3]],['estoque',['sal',.25,1,3]],['estoque',['camiseta',.12,1,1]],['deposito',['mochilaPequena',.08,1,1]],['deposito',['botasTrilha',.08,1,1]],
  ['armazem',['mochilaPequena',.08,1,1]],['armazem',['cinto',.1,1,1]]])if(typeof CID_LOOT!=='undefined'&&CID_LOOT[t])CID_LOOT[t].push(e);
/* cascas das roupas novas sobre o corpo (cor e região) */
Object.assign(SK_CASCAS,{
  camiseta:[{sub:'troncoCurto',inf:0.004,cor:0xcfc3a6,pelo:0}],
  camisaLeve:[{sub:'troncoLongo',inf:0.011,cor:0x2e3540,pelo:0},{sub:'golaLonga',inf:0.016,cor:0x262b33,pelo:0}],
  calcaCargo:[{sub:'pernas',inf:0.006,cor:0x2f3330,pelo:0}],
  bermuda:[{sub:'pernasCurtas',inf:0.006,cor:0x3a4048,pelo:0}],
  botasTrilha:[{sub:'pes',inf:0.012,cor:0x5a3e28,pelo:0}],
  cinto:[{sub:'cinto',inf:0.014,cor:0x4a3020,pelo:0}],
  cinturaoExploracao:[{sub:'cinto',inf:0.02,cor:0x8a6a3a,pelo:0.2}],
  luvasCouro:[{sub:'maos',inf:0.008,cor:0x5a3e28,pelo:0}],
  bone:[{sub:'cabeca',inf:0.014,cor:0x3a4a3a,pelo:0},{sub:'cabecaAba',inf:0.024,cor:0x2e3a2e,pelo:0}],
  bandana:[{sub:'rosto',inf:0.012,cor:0x7a2a22,pelo:0}],
  casacoGrande:[{sub:'troncoLongo',inf:0.02,cor:0x6a4a2e,pelo:0.1},{sub:'golaLonga',inf:0.028,cor:0x4a3220,pelo:0}]});
SK_CASCAS.camisaCouro=[{sub:'troncoLongo',inf:0.013,cor:0x6a4430,pelo:0},{sub:'golaLonga',inf:0.019,cor:0x4a2e1e,pelo:0}];

/* habilidades novas da caça (lista de melhorias do nível) */
PERKS.push({id:'rastreador',nome:'Leitor de rastros',desc:'Vê os rastros de mais longe; no nível 2 lê o tamanho do grupo e se o bicho está perto.',max:2,ico:'i-olho'},
  {id:'esfolador',nome:'Esfolador',desc:'Esfola 30% mais rápido; no nível 2 o couro sai uma qualidade melhor.',max:2,ico:'i-faca'});

/* ---------- desgaste das roupas ---------- */
const ROUPA_PESO_GOLPE={tronco:0.3,camiseta:0.1,pernas:0.2,cabeca:0.08,rosto:0.04,maos:0.1,cintura:0.06,pes:0.07,costas:0.05};
function roupaGastar(dano,tipo){if(!P.roupa)return;const vagas=ROUPA_SLOTS.filter(s=>P.roupa[s]&&ITEMS[P.roupa[s]].durMax);if(!vagas.length)return;
  if(tipo==='fogo'){for(const s of vagas)roupaDesgasta(s,dano*(ITEMS[P.roupa[s]].mat==='couro'?0.5:1));return;}
  let tot=0;for(const s of vagas)tot+=ROUPA_PESO_GOLPE[s]||0.05;let r=Math.random()*tot;
  for(const s of vagas){r-=ROUPA_PESO_GOLPE[s]||0.05;if(r<=0){roupaDesgasta(s,dano*0.55);if(s==='tronco'&&P.roupa.camiseta)roupaDesgasta('camiseta',dano*0.15);return;}}}
function roupaDesgasta(slot,q){const I=roupaInfoDe(slot);if(!I||!ITEMS[I.id].durMax||I.dur<=0)return;const mx=durMaxDe(I),antes=I.dur/mx;I.dur=Math.max(0,I.dur-q);const f=I.dur/mx,nm=ITEMS[I.id].nome.toLowerCase();
  if(I.dur<=0){toast('corpo','Sua peça rasgou: '+nm+'. Rasgada ela não protege nem esquenta. Conserte com '+(ITEMS[I.id].mat==='tecido'?'pano':'remendo')+', linha e agulha.');sfx('quebrar');}
  else if(antes>0.25&&f<=0.25)feed('Desgastada: '+nm+' ('+Math.round(f*100)+'%)',true);}
/* botas gastam andando; fogo gasta tudo */
let roupaPassoD=0;
PASSOS.push(dt=>{if(!P.alive||CARRO.ativo||P.nada)return;const v=Math.hypot(P.vx||0,P.vz||0);if(v>0.5&&P.noChao){roupaPassoD+=v*dt;if(roupaPassoD>150){roupaPassoD=0;if(P.roupa.pes)roupaDesgasta('pes',1);}}
  if(P.queima>0)roupaGastar(dt*2,'fogo');});

/* ---------- conserto das roupas: material da peça + linha, com agulha na mochila ---------- */
const REPARO_ROUPA={couro:{remendo:3,linha:2},tecido:{pano:2,linha:1},metal:{sucata:2,pano:1}};
function temAgulha(){for(const s of P.inv)if(s&&ITEMS[s.id]&&ITEMS[s.id].costura)return s;return null;}
function custoRoupa(id,I){const d=ITEMS[id];if(!d||!d.durMax)return null;const b=REPARO_ROUPA[d.mat||'tecido'],f=1-I.dur/durMaxDe(Object.assign({id},I));if(f<0.03)return{};
  const c={};for(const k in b)c[k]=Math.max(1,Math.ceil(b[k]*f));return c;}
function roupaRef(ref){if(typeof ref==='string'){const I=roupaInfoDe(ref);return I?{id:I.id,I,vestida:ref}:null;}const s=P.inv[ref];if(!s||!ITEMS[s.id]||ITEMS[s.id].tipo!=='roupa')return null;
  if(s.dur===undefined&&ITEMS[s.id].durMax)s.dur=durMaxDe(s);return{id:s.id,I:s,inv:ref};}
function consertoInfo(ref){const R=roupaRef(ref);if(!R)return null;const c=custoRoupa(R.id,R.I);if(!c)return null;const d=ITEMS[R.id],metal=d.mat==='metal';
  const ferr=metal?(pertoBancada()?'bancada':null):temAgulha()?'agulha':null,est=pertoEstacao('couro');
  return{c,vazio:!Object.keys(c).length,ferr,metal,est,ok:Object.keys(c).length>0&&!!ferr&&invHas(c)};}
function consertarRoupa(ref){const R=roupaRef(ref),info=consertoInfo(ref);if(!R||!info)return false;
  if(info.vazio){feed('Está inteira',true);return false;}
  if(!info.ferr){feed(info.metal?'Isso se conserta na bancada':'Precisa de uma agulha (de osso ou de aço) na mochila',true);return false;}
  if(!invHas(info.c)){feed('Faltam: '+faltaLista(info.c),true);return false;}
  invPay(info.c);anotarGasto(info.c);if(info.ferr==='agulha')gastar(temAgulha(),1);
  if(!info.est&&!info.metal)R.I.rep=(R.I.rep||0)+1;   // remendo improvisado: a peça perde um pouco do máximo
  R.I.dur=durMaxDe(Object.assign({id:R.id},R.I));G.fab.reg.cons++;sfx('construir');ganharXP(4);progresso('consertar');
  feed('Consertou: '+ITEMS[R.id].nome.toLowerCase()+(info.est||info.metal?'':' (remendo improvisado: máximo '+Math.round(durMaxDe(Object.assign({id:R.id},R.I))/ITEMS[R.id].durMax*100)+'%)'));
  dica('consertoRoupa','corpo','Consertar fora da estação de couro deixa a peça um pouco mais fraca a cada vez. Na estação de couro e costura o conserto fica perfeito.');
  invRender();hudBarra();return true;}

/* ---------- estações de trabalho: construídas na base ou achadas no mundo ---------- */
const ESTACOES={
  couro:{nome:'Estação de couro e costura',icon:'i-varal',ir:'uma estação de couro (construa na base ou ache a da fazenda)',chip:'Estação de couro'},
  armas:{nome:'Bancada de armas',icon:'i-oficina',ir:'uma bancada de armas (base militar, delegacia ou construída)',chip:'Bancada de armas'},
  forja:{nome:'Fornalha',icon:'i-fogueira',ir:'uma fornalha (construa na base ou ache a da Serra Velha)',chip:'Fornalha'},
  conserva:{nome:'Defumador e secador',icon:'i-carne',ir:'um defumador (fazenda, cabana do lago ou construído)',chip:'Defumador'},
  mecanica:{nome:'Oficina mecânica',icon:'i-oficina',ir:'a oficina (bancada nível 2) ou a oficina do posto',chip:'Oficina'},
  fogo:{nome:'Fogueira acesa',icon:'i-fogueira',ir:'uma fogueira acesa',chip:'Fogueira'}};
const EST_MUNDO=[];
function estTipo(st){return st.estTipo||(OBRAS[st.tipo]&&OBRAS[st.tipo].estacao)||null;}
function estacoesPerto(tipo,r){r=r||3.4;const out=[];for(const o of OB){const D=OBRAS[o.tipo];if(D&&D.estacao===tipo&&d2(o.x,o.z,P.x,P.z)<r*r&&Math.abs((o.y||0)-P.y)<2.5)out.push(o);}
  for(const e of EST_MUNDO)if(e.estTipo===tipo&&d2(e.x,e.z,P.x,P.z)<r*r)out.push(e);return out;}
function pertoEstacao(tipo){if(tipo==='fogo')return pertoDoFogo();if(tipo==='mecanica'&&pertoBancada()&&G.fab&&G.fab.nv>=2)return true;return estacoesPerto(tipo).length>0;}
function estNome(est){if(!est)return EST_NOME[0];if(typeof est==='string')return ESTACOES[est]?ESTACOES[est].chip:est;return EST_NOME[est]||EST_NOME[1];}
function estIcone(est){if(typeof est==='string')return ESTACOES[est]?ESTACOES[est].icon:'i-martelo';return est>1?'i-oficina':'i-martelo';}
/* estação de couro construída na base */
Object.assign(OBRAS,{estacaoCouro:{nome:'Estação de couro',icon:'i-varal',custo:{tabuas:6,pregos:4,corda:2},hp:160,hw:1.1,hd:0.45,solid:true,etapa:2,estacao:'couro',base:true}});
OBRA_ORDEM.push('estacaoCouro');OBRAS_CHAO.push('estacaoCouro');if(typeof OBRAS_PREDIO!=='undefined')OBRAS_PREDIO.push('estacaoCouro');if(typeof OBRAS_TELHADO!=='undefined')OBRAS_TELHADO.push('estacaoCouro');
function estacaoCouroGeo(g,R){const mad=lin(0x6b4e30),mad2=lin(0x54402c),cou=lin(0x9a6a44),cou2=lin(0x7a5236);
  for(const sx of[-1,1])add(g,boxTris(0.1,1.6,0.1),mat(sx*1.0,0.8,0),mad2,{j:0.06,rnd:R});add(g,boxTris(2.2,0.08,0.08),mat(0,1.55,0),mad,{j:0.05,rnd:R});
  add(g,boxTris(2.0,0.06,0.06),mat(0,0.35,0),mad,{j:0.05,rnd:R});
  for(let i=0;i<3;i++){const x=-0.62+i*0.62;add(g,boxTris(0.5,0.95,0.03,{tx:0.8,bx:1.1}),mat(x,0.95,0,0.04*(i-1),0,0),i===1?cou2:cou,{j:0.1,rnd:R});
    for(const sx of[-1,1])add(g,cylTris(0.006,0.006,0.25,3),mat(x+sx*0.22,1.4,0,0,0,sx*0.4),lin(0xb9a77a));}
  add(g,boxTris(0.9,0.06,0.5),mat(0.4,0.7,0.55),mad,{j:0.05,rnd:R});for(const sx of[-1,1])for(const sz of[-1,1])add(g,boxTris(0.06,0.7,0.06),mat(0.4+sx*0.4,0.35,0.55+sz*0.2),mad2);
  add(g,boxTris(0.3,0.04,0.2),mat(0.3,0.75,0.55),cou,{j:0.1,rnd:R});add(g,cylTris(0.03,0.03,0.08,8),mat(0.62,0.73,0.6),lin(0x8a7a5a));}
INIT_MALHAS.push(()=>{const R=rng(613),g=new GB(2048,8);estacaoCouroGeo(g,R);MESH.obra.estacaoCouro=litMesh(g.data());});
/* estação velha do curtume da fazenda (achada no mundo) */
EST_MUNDO.push({id:'curtumeFazenda',estTipo:'couro',x:-60.5,z:74.5,yaw:0.4,ext:{},nome:'Curtume velho da fazenda'});
let estMundoMontado=false;
function estMundoMontar(){if(estMundoMontado)return;estMundoMontado=true;for(const e of EST_MUNDO){e.y=ground(e.x,e.z);e.col=colBox(e.x,e.z,1.1,0.45,e.yaw,{solid:true,estacao:e});}}
INIT_MALHAS.push(()=>{estMundoMontar();});
DESENHO.opaco.push(Pg=>{for(const e of EST_MUNDO){const m=MESH.obra[e.estTipo==='couro'?'estacaoCouro':e.malha];if(m&&d2(e.x,e.z,cam.pos[0],cam.pos[2])<120*120)drawStat(Pg,m,mat(e.x,e.y,e.z,0,e.yaw,0));}});
DESENHO.sombra.push((Pg,perto)=>{for(const e of EST_MUNDO){const m=MESH.obra[e.estTipo==='couro'?'estacaoCouro':e.malha];if(m&&d2(e.x,e.z,P.x,P.z)<(perto?60:120)**2)drawStat(Pg,m,mat(e.x,e.y,e.z,0,e.yaw,0));}});
INTERS.push(tryIt=>{for(const o of OB){const D=OBRAS[o.tipo];if(D&&D.estacao&&Math.abs(o.x-P.x)<4&&Math.abs(o.z-P.z)<4)tryIt({k:'estacao',o},o.x,o.z,2.2,1.6,-0.5,o.y);}
  for(const e of EST_MUNDO)if(Math.abs(e.x-P.x)<4&&Math.abs(e.z-P.z)<4)tryIt({k:'estacao',o:e},e.x,e.z,2.2,1.6,-0.5,e.y);});
INTER_K.estacao={texto:o=>{const t=estTipo(o),E=ESTACOES[t];const U=ESTACAO_UI[t],s=U&&U.resumo?U.resumo(o):'';return{t:'Usar: '+(o.nome||E.nome).toLowerCase(),s:s||'toque para abrir'};},usar:o=>abrirEstacao(o)};
/* ---------- tela das estações ---------- */
const ESTACAO_UI={};let estAberta=null,estMsg='';
function abrirEstacao(st){if(G.modo!=='jogo')return;estAberta=st;estMsg='';G.modo='estacao';IN.attack=false;IN.mx=IN.mz=0;tela('t-estacao');estRender();if(document.pointerLockElement)document.exitPointerLock();sfx('bau');}
function fecharEstacao(){if(G.modo!=='estacao')return;G.modo='jogo';tela(null);estAberta=null;if(typeof pedirTrava==='function')pedirTrava();}
function estRender(){const st=estAberta;if(!st)return;const t=estTipo(st),E=ESTACOES[t],U=ESTACAO_UI[t];if(!st.ext)st.ext={};
  $('es-nome').textContent=st.nome||E.nome;const r=U?U.render(st):{sub:'',corpo:'',acoes:[]};$('es-sub').textContent=r.sub||'';$('es-corpo').innerHTML=r.corpo||'';$('es-msg').textContent=estMsg;
  let h='';for(const a of r.acoes||[])h+='<button class="btn'+(a.prim?' prim':'')+'" type="button" data-ea="'+a.id+'"'+(a.ok===false?' disabled':'')+'><span>'+a.t+'</span>'+(a.s?'<small>'+a.s+'</small>':'')+'</button>';
  $('es-acoes').innerHTML=h;}
function estAcao(id){const st=estAberta;if(!st)return;const U=ESTACAO_UI[estTipo(st)];if(!U)return;if(id==='__costura'){fecharEstacao();abrirMochila('fabricar');if(typeof fabCat!=='undefined'){fabCat=U.cat||'roupas';invRender();}return;}
  estMsg=U.acao(st,id)||'';estRender();invRender();hudBarra();}
function horasTxt(min){min=Math.max(0,Math.ceil(min));const h=Math.floor(min/60),m=min%60;return h?(h+'h'+(m?' '+m+'min':'')):m+'min';}
function barraHTML(f){return'<span class="es-barra"><i style="width:'+Math.round(clamp(f,0,1)*100)+'%"></i></span>';}
/* curtimento: couro bruto + 1 gordura (ou 1 sal) → couro curtido depois de algumas horas de jogo (continua enquanto você está longe) */
const CURTIR={couro:{para:'couroCurtido',h:4},couroGrande:{para:'couroGrandeCurtido',h:6},couroResistente:{para:'couroResistenteCurtido',h:8}};
const CURT_VAGAS=4;
function curtTempo(id){return CURTIR[id].h*60*(G.fab&&G.fab.manuais&&G.fab.manuais.manualCurtidor?0.65:1);}
function curtInsumo(){return invCount('gordura')>0?'gordura':invCount('sal')>0?'sal':null;}
function melhorQual(id){let b=null;for(const s of P.inv)if(s&&s.id===id&&(b===null||(s.q??1)>b))b=s.q??1;return b;}
/* qualidade que a receita vai dar (gasta o melhor material primeiro, como no fabricar) */
function qualEsperada(cost){let soma=0,n=0;for(const k in cost){const d=ITEMS[k];if(!d||!d.qual)continue;const L=[];for(const s of P.inv)if(s&&s.id===k)for(let i=0;i<s.n;i++)L.push(s.q??1);
    L.sort((a,b)=>b-a);for(let i=0;i<Math.min(cost[k],L.length);i++){soma+=L[i];n++;}}return n?Math.round(soma/n):null;}
function tirarUmQ(id,q){for(let i=0;i<INV_N;i++){const s=P.inv[i];if(s&&s.id===id&&(s.q??1)===q){s.n--;if(s.n<=0)P.inv[i]=null;return true;}}return false;}
ESTACAO_UI.couro={cat:'roupas',
  resumo:st=>{const L=(st.ext.curt||[]),pr=L.filter(c=>G.tm>=c.fim).length;return L.length?(pr?pr+' pronto'+(pr>1?'s':'')+' · ':'')+L.length+' de '+CURT_VAGAS+' no varal':'varal vazio';},
  render(st){const L=st.ext.curt||(st.ext.curt=[]);let c='<div class="es-lista">';
    for(let i=0;i<CURT_VAGAS;i++){const it=L[i];if(!it){c+='<div class="es-vaga vazia">'+svgUse('i-varal')+'<span>Vaga livre</span></div>';continue;}
      const pr=G.tm>=it.fim,f=1-(it.fim-G.tm)/(it.fim-it.ini);c+='<div class="es-vaga'+(pr?' pronta':'')+'">'+svgUse(ITEMS[CURTIR[it.id].para].icon)+'<span><b>'+ITEMS[CURTIR[it.id].para].nome+' ('+QUAL_NOME[it.q].toLowerCase()+')</b><small>'+(pr?'Pronto para recolher':'Curtindo · faltam '+horasTxt(it.fim-G.tm))+'</small></span>'+(pr?'':barraHTML(f))+'</div>';}
    c+='</div><p class="es-info">Cada couro bruto gasta <b>1 gordura</b> ou <b>1 sal</b>. Na mochila: gordura '+invCount('gordura')+' · sal '+invCount('sal')+'. O couro curta sozinho, mesmo com você longe'+(G.fab.manuais.manualCurtidor?' (com a técnica do manual: 35% mais rápido)':'')+'.</p>';
    const A=[],ins=curtInsumo(),livre=L.length<CURT_VAGAS;
    for(const id in CURTIR){const n=invCount(id),q=melhorQual(id);A.push({id:'curtir:'+id,t:'Curtir '+ITEMS[id].nome.toLowerCase()+(n?' ('+n+')':''),s:n?(ins?horasTxt(curtTempo(id))+' · gasta 1 '+ITEMS[ins].nome.toLowerCase()+(q!==null?' · '+QUAL_NOME[q].toLowerCase():''):'falta gordura ou sal'):'nenhum na mochila',ok:!!(n&&ins&&livre)});}
    const pr=L.filter(c=>G.tm>=c.fim).length;A.unshift({id:'recolher',t:'Recolher couro pronto',s:pr?pr+' pronto'+(pr>1?'s':''):'nada pronto ainda',ok:pr>0,prim:pr>0});
    A.push({id:'__costura',t:'Costurar roupas e mochilas',s:'abre as receitas da estação'});
    return{sub:'Curte couro bruto e costura roupas, botas, luvas e mochilas. Consertos aqui ficam perfeitos.',corpo:c,acoes:A};},
  acao(st,id){const L=st.ext.curt||(st.ext.curt=[]);
    if(id==='recolher'){let n=0,cheio=false;for(let i=L.length-1;i>=0;i--){const it=L[i];if(G.tm<it.fim)continue;const left=invAdd(CURTIR[it.id].para,1,{q:it.q});if(left){cheio=true;continue;}L.splice(i,1);n++;}
      if(n){sfx('pegar');ganharXP(3*n);progresso('curtir');if(typeof diarioConta==='function')diarioConta('curtiu',n);}return n?(cheio?'Recolheu '+n+'; a mochila encheu e o resto ficou no varal.':'Recolheu '+n+' couro'+(n>1?'s':'')+' curtido'+(n>1?'s':'')+'.'):cheio?'Mochila cheia: libere espaço.':'Nada pronto ainda.';}
    if(id.startsWith('curtir:')){const cid=id.slice(7);if(L.length>=CURT_VAGAS)return'O varal está cheio.';const ins=curtInsumo();if(!ins)return'Precisa de 1 gordura ou 1 sal para cada couro.';
      const q=melhorQual(cid);if(q===null)return'Você não tem esse couro.';tirarUmQ(cid,q);invRemove(ins,1);anotarGasto({[cid]:1,[ins]:1});
      L.push({id:cid,q,ini:G.tm,fim:G.tm+curtTempo(cid)});sfx('construir');dica('curtir','corpo','Couro no varal! Ele curte sozinho com o passar das horas, mesmo se você sair. Volte e recolha o couro curtido.');
      return ITEMS[cid].nome+' no varal: pronto em '+horasTxt(curtTempo(cid))+'.';}
    return'';}};
/* manual do curtidor: técnica que acelera o curtimento (fica na casa da fazenda, junto do caderno de caça) */
MANUAIS.manualCurtidor={nome:'Manual do curtidor',local:'faz-celeiro',onde:'no celeiro da fazenda',ensina:'a técnica de curtir couro 35% mais rápido'};

/* ---------- salvar e carregar: estado das peças vestidas e das estações achadas no mundo ---------- */
V8.novo.roupas=()=>{P.roupaInfo={};for(const e of EST_MUNDO)e.ext={};};
V8.salvar.roupas=()=>({info:P.roupaInfo||{},est:EST_MUNDO.map(e=>({id:e.id,ext:e.ext}))});
V8.carregar.roupas=s=>{P.roupaInfo={};if(s&&s.info)for(const k in s.info){const I=s.info[k];if(I&&P.roupa[k]===I.id)P.roupaInfo[k]=I;}
  for(const e of EST_MUNDO){const q=s&&s.est&&s.est.find(x=>x.id===e.id);e.ext=q&&q.ext?q.ext:{};}};
TELAS_NOVAS.push('t-estacao');
{const ac=document.getElementById('es-acoes');if(ac)ac.addEventListener('click',e=>{const b=e.target.closest('[data-ea]');if(b&&!b.disabled)estAcao(b.dataset.ea);});
 const fe=document.getElementById('es-fechar');if(fe)fe.addEventListener('click',fecharEstacao);}
window.addEventListener('keydown',e=>{if(G.modo==='estacao'&&(e.code==='Escape'||e.code==='KeyE'||e.code==='Tab')){e.preventDefault();e.stopImmediatePropagation();fecharEstacao();}},true);
