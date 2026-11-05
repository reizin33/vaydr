/* ================= itens, receitas, construções e saque ================= */
const ITEMS={
  machado:{nome:'Machado de incêndio',icon:'i-machado',max:1,tipo:'arma',corpo:true,dano:34,alcance:2.3,tempo:0.66,vertical:true,durMax:170,corta:true,esfola:true,rende:0.5,desc:'Corta árvores e zumbis. Gasta com o uso.'},
  machadoPedra:{nome:'Machado improvisado',icon:'i-machado-pedra',max:1,tipo:'arma',corpo:true,dano:24,alcance:2.15,tempo:0.72,vertical:true,durMax:90,corta:true,esfola:true,rende:0.15,desc:'Feito à mão. Corta árvores e zumbis, mas quebra rápido.'},
  porrete:{nome:'Clava improvisada',icon:'i-porrete',max:1,tipo:'arma',corpo:true,dano:21,alcance:2.1,tempo:0.58,durMax:70,empurra:1.1,desc:'Um pedaço de pau grosso. Fraco, mas afasta os zumbis.'},
  picareta:{nome:'Picareta',icon:'i-picareta',max:1,tipo:'arma',corpo:true,dano:26,alcance:2.2,tempo:0.72,vertical:true,durMax:150,minera:true,desc:'Quebra rochas para tirar pedra.'},
  faca:{nome:'Faca',icon:'i-faca',max:1,tipo:'arma',corpo:true,dano:20,alcance:1.8,tempo:0.38,durMax:220,esfola:true,desc:'Rápida e silenciosa, mas fraca. Tira a pele dos bichos.'},
  facaPedra:{nome:'Faca de pedra',icon:'i-faca-pedra',max:1,tipo:'arma',corpo:true,dano:13,alcance:1.7,tempo:0.4,durMax:70,esfola:true,desc:'Pedra lascada amarrada num cabo. Fraca para brigar, mas tira a pele dos bichos.'},
  lanca:{nome:'Lança improvisada',icon:'i-lanca',max:1,tipo:'arma',corpo:true,dano:27,alcance:2.85,tempo:0.6,durMax:60,empurra:0.9,desc:'Graveto com ponta de pedra. Alcance maior: mantém os zumbis longe.'},
  taco:{nome:'Taco de beisebol',icon:'i-taco',max:1,tipo:'arma',corpo:true,dano:28,alcance:2.25,tempo:0.55,durMax:150,empurra:1.6,desc:'Empurra os zumbis para longe a cada golpe.'},
  tacoCravado:{nome:'Taco com pregos',icon:'i-taco-cravado',max:1,tipo:'arma',corpo:true,dano:37,alcance:2.25,tempo:0.56,durMax:190,empurra:1.4,desc:'Um taco cravado de pregos, feito na oficina. Bate forte e ainda empurra.'},
  facao:{nome:'Facão',icon:'i-facao',max:1,tipo:'arma',corpo:true,dano:44,alcance:2.15,tempo:0.5,durMax:190,esfola:true,desc:'A melhor arma de corte. Raro.'},
  pistola:{nome:'Pistola',icon:'i-pistola',max:1,tipo:'arma',fogo:true,dano:30,pente:8,tempo:0.3,barulho:55,municao:'municao9',desc:'Tiro na cabeça mata rápido. Mirando (botão direito) o tiro sai mais certeiro. O barulho chama os zumbis.'},
  arco:{nome:'Arco de caça',icon:'i-arco',max:1,tipo:'arma',arco:true,dano:45,durMax:140,municao:'flecha',desc:'Silencioso. Segure para puxar a corda e solte para atirar: quanto mais puxa, mais longe e mais forte. As flechas podem ser recolhidas.'},
  flecha:{nome:'Flecha',icon:'i-flecha',max:30,tipo:'municao',desc:'Graveto reto com ponta de pedra e penas. Depois do tiro, passe por cima da flecha para recolher (algumas quebram).'},
  molotov:{nome:'Coquetel molotov',icon:'i-molotov',max:5,tipo:'arma',arremesso:true,desc:'Garrafa com gasolina e um pano. O arco do voo aparece na tela: clique para jogar. O fogo dura uns 10 segundos, queima zumbis e passa de um para o outro. Faz barulho.'},
  municao9:{nome:'Munição 9mm',icon:'i-municao',max:60,tipo:'municao',desc:'Balas para a pistola.'},
  madeira:{nome:'Madeira',icon:'i-madeira',max:60,tipo:'material',desc:'Soque ou corte árvores, ou junte galhos no chão.'},
  tabuas:{nome:'Tábuas',icon:'i-tabuas',max:60,tipo:'material',desc:'Feitas de madeira. Servem para construir.'},
  pedra:{nome:'Pedra',icon:'i-pedra',max:60,tipo:'material',mao:true,desc:'Pedras soltas no chão da mata. Na mão, servem para bater nas árvores e tirar madeira. Rochas grandes, só com a picareta.'},
  pano:{nome:'Tecido',icon:'i-pano',max:30,tipo:'material',desc:'Roupas, lençóis e cortinas de casas, mercados e caçambas. Vira bandagem, mochila e roupa.'},
  graveto:{nome:'Gravetos',icon:'i-graveto',max:40,tipo:'material',desc:'Galhos finos do chão. Viram ferramentas, lança e fogueira.'},
  fibra:{nome:'Fibras vegetais',icon:'i-fibra',max:40,tipo:'material',desc:'Colhidas das touceiras e dos arbustos. Amarram as ferramentas e viram corda.'},
  corda:{nome:'Corda',icon:'i-corda',max:20,tipo:'material',desc:'Trançada com 5 fibras. Usada em mochilas, roupas e abrigos.'},
  couro:{nome:'Couro de cervo',icon:'i-couro',max:12,tipo:'material',desc:'Tirado do cervo. Vira botas, calça, camisa e casaco.'},
  peleCoelho:{nome:'Pele de coelho',icon:'i-pele',max:12,tipo:'material',desc:'Macia e quente. Vira gorro e forra o casaco.'},
  botasCouro:{nome:'Botas de couro',icon:'i-botas',max:1,tipo:'roupa',slot:'pes',prot:0.05,silencio:0.25,desc:'Protegem os pés e deixam os passos mais silenciosos.'},
  calcaCouro:{nome:'Calça de couro',icon:'i-calca',max:1,tipo:'roupa',slot:'pernas',prot:0.1,quente:0.15,desc:'Couro grosso: aguenta arranhão e mordida.'},
  camisaCouro:{nome:'Camisa de couro',icon:'i-camisa',max:1,tipo:'roupa',slot:'tronco',prot:0.13,quente:0.2,desc:'Leve e resistente. Protege o tronco.'},
  casacoPele:{nome:'Casaco de pele',icon:'i-casaco',max:1,tipo:'roupa',slot:'tronco',prot:0.2,quente:0.6,desc:'Couro forrado de pele: protege mais e esquenta nas noites frias.'},
  mochila:{nome:'Mochila improvisada',icon:'i-mochila',max:1,tipo:'roupa',slot:'costas',prot:0,espaco:18,desc:'Tecido, corda e couro. Vai nas costas e libera mais 18 espaços.'},
  mochilaRef:{nome:'Mochila reforçada',icon:'i-mochila-ref',max:1,tipo:'roupa',slot:'costas',prot:0.02,espaco:24,desc:'Mais tecido e couro, com fivelas pregadas. Libera 24 espaços.'},
  gorroPele:{nome:'Gorro de pele',icon:'i-gorro',max:1,tipo:'roupa',slot:'cabeca',prot:0.04,quente:0.3,desc:'Gorro de caçador com abas nas orelhas. Esquenta a cabeça.'},
  sucata:{nome:'Sucata',icon:'i-sucata',max:30,tipo:'material',desc:'Metal velho de carros, oficinas e caçambas. Na bancada vira pregos, faca, taco e munição.'},
  pregos:{nome:'Pregos',icon:'i-pregos',max:40,tipo:'material',desc:'Achados em oficinas, celeiros e casas, ou feitos de sucata na bancada. Montam baú, muro, portão e a oficina.'},
  remedios:{nome:'Remédios',icon:'i-remedio',max:10,tipo:'material',desc:'Caixas de remédio da farmácia e das casas. Com bandagens, viram kit médico.'},
  isqueiro:{nome:'Isqueiro',icon:'i-isqueiro',max:1,tipo:'util',desc:'Acende fogo na hora: com ele na mochila, a fogueira não precisa de fibra.'},
  fita:{nome:'Fita adesiva',icon:'i-fita',max:10,tipo:'util',acao:'Remendar',desc:'Remenda a ferramenta gasta em qualquer lugar: devolve 35% do estado (primeiro a que está na mão).'},
  pilhas:{nome:'Pilhas',icon:'i-pilha',max:10,tipo:'util',acao:'Trocar pilhas',desc:'Carga para a lanterna de mão: cada troca enche metade.'},
  filtro:{nome:'Filtro improvisado',icon:'i-filtro',max:1,tipo:'util',acao:'Filtrar chuva',desc:'Pano e carvão num gargalo. Na chuva, enche todas as garrafas vazias com água boa.'},
  lanterna:{nome:'Lanterna de mão',icon:'i-lanterna',max:1,tipo:'util',desc:'Com ela na mochila, a luz (F) fica forte e vai mais longe. Gasta pilha.'},
  receita:{nome:'Folha de receita',icon:'i-livro',max:5,tipo:'util',acao:'Ler',desc:'Anotações de outro sobrevivente. Ensina receitas que você ainda não sabe.'},
  mapaSecreto:{nome:'Mapa rabiscado',icon:'i-mapa',max:3,tipo:'util',acao:'Ler',desc:'Um X marcado na mata. Mostra na bússola onde tem uma caixa escondida.'},
  pecaVeiculo:{nome:'Peça de motor',icon:'i-peca',max:1,tipo:'util',acao:'Usar na caminhonete',desc:'Peça rara. Perto da caminhonete, deixa a lataria nova.'},
  feijao:{nome:'Lata de feijão',icon:'i-lata',max:10,tipo:'comida',fome:38,desc:'Mata bem a fome.'},
  biscoito:{nome:'Pacote de biscoito',icon:'i-biscoito',max:10,tipo:'comida',fome:18,desc:'Um lanche rápido.'},
  frutas:{nome:'Frutas silvestres',icon:'i-frutas',max:20,tipo:'comida',fome:9,sede:5,desc:'Colhidas nos arbustos.'},
  cogumelo:{nome:'Cogumelo',icon:'i-cogumelo',max:20,tipo:'comida',fome:7,vida:-4,desc:'Alimenta pouco e faz um pouco mal cru.'},
  carneCrua:{nome:'Carne crua',icon:'i-carne',max:12,tipo:'comida',fome:10,vida:-6,desc:'Asse na fogueira. Crua mata pouco a fome e faz mal.'},
  carneAssada:{nome:'Carne assada',icon:'i-carne-assada',max:12,tipo:'comida',fome:42,vida:6,desc:'Comida de verdade: enche a barriga e recupera um pouco de vida.'},
  agua:{nome:'Garrafa d’água',icon:'i-agua',max:6,tipo:'bebida',sede:42,vira:'garrafa',desc:'Encha de novo no barril da clareira ou no poço.'},
  garrafa:{nome:'Garrafa vazia',icon:'i-garrafa',max:6,tipo:'garrafa',desc:'Encha no barril da clareira ou no poço da fazenda.'},
  refri:{nome:'Refrigerante',icon:'i-refri',max:6,tipo:'bebida',sede:26,fome:5,energia:40,desc:'Mata a sede e devolve energia.'},
  bandagem:{nome:'Bandagem',icon:'i-bandagem',max:10,tipo:'cura',vida:25,desc:'Cura um pouco.'},
  kit:{nome:'Kit médico',icon:'i-kit',max:5,tipo:'cura',vida:65,desc:'Cura muito. Monte na bancada com bandagens e remédios.'},
  gasolina:{nome:'Galão de gasolina',icon:'i-gasolina',max:4,tipo:'material',desc:'Abastece a caminhonete da fazenda. Cada galão enche metade do tanque.'},
  bateria:{nome:'Bateria de carro',icon:'i-bateria',max:1,tipo:'missao',desc:'Peça do transmissor da torre.'},
  cabo:{nome:'Rolo de cabo',icon:'i-cabo',max:1,tipo:'missao',desc:'Peça do transmissor da torre.'},
  antena:{nome:'Antena',icon:'i-antena',max:1,tipo:'missao',desc:'Peça do transmissor da torre.'}
};
/* cat: aba da fabricação · etapa: 1 básica, 2 intermediária, 3 avançada · est: 0 na mão, 1 bancada, 2 oficina
   desb: como libera (sem desb = conhecida desde o início) · alt: substituto aceito no lugar de um material */
const RECIPES=[
  {faz:'machadoPedra',n:1,custo:{pedra:1,graveto:2,fibra:3},alt:{fibra:['corda',1]},cat:'ferramentas',etapa:1,est:0},
  {faz:'facaPedra',n:1,custo:{pedra:1,graveto:1,fibra:2},alt:{fibra:['corda',1]},cat:'ferramentas',etapa:1,est:0},
  {faz:'picareta',n:1,custo:{pedra:2,graveto:2,fibra:3},alt:{fibra:['corda',1]},cat:'ferramentas',etapa:1,est:0},
  {faz:'faca',n:1,custo:{sucata:2,madeira:1},cat:'ferramentas',etapa:2,est:1,desb:{item:'sucata'}},
  {faz:'lanca',n:1,custo:{graveto:2,pedra:1,fibra:3},alt:{fibra:['corda',1]},ferramenta:'lamina',cat:'armas',etapa:1,est:0},
  {faz:'porrete',n:1,custo:{madeira:2,pano:2},cat:'armas',etapa:1,est:0},
  {faz:'taco',n:1,custo:{madeira:4,sucata:1},cat:'armas',etapa:2,est:1,desb:{item:'sucata'}},
  {faz:'tacoCravado',n:1,custo:{taco:1,pregos:6},cat:'armas',etapa:3,est:2,desb:{oficina:true}},
  {faz:'flecha',n:4,custo:{graveto:2,pedra:1,fibra:1},ferramenta:'lamina',cat:'armas',etapa:1,est:0},
  {faz:'arco',n:1,custo:{madeira:2,corda:2,fibra:2},cat:'armas',etapa:2,est:1},
  {faz:'molotov',n:2,custo:{garrafa:2,gasolina:1,pano:2},cat:'armas',etapa:2,est:1,desb:{item:'gasolina'}},
  {faz:'municao9',n:3,custo:{sucata:3},cat:'armas',etapa:3,est:2,desb:{oficina:true}},
  {faz:'mochila',n:1,custo:{pano:5,corda:3,couro:2},cat:'roupas',etapa:2,est:1},
  {faz:'botasCouro',n:1,custo:{couro:2,corda:1},cat:'roupas',etapa:2,est:1,desb:{item:'couro'}},
  {faz:'calcaCouro',n:1,custo:{couro:3,pano:2,corda:1},cat:'roupas',etapa:2,est:1,desb:{item:'couro'}},
  {faz:'camisaCouro',n:1,custo:{couro:3,pano:2,fibra:2},alt:{fibra:['corda',1]},cat:'roupas',etapa:2,est:1,desb:{item:'couro'}},
  {faz:'gorroPele',n:1,custo:{peleCoelho:2,pano:1},cat:'roupas',etapa:2,est:1,desb:{item:'peleCoelho'}},
  {faz:'casacoPele',n:1,custo:{couro:2,peleCoelho:3,pano:3,corda:1},cat:'roupas',etapa:3,est:1,desb:{manual:'cadernoCaca'}},
  {faz:'mochilaRef',n:1,custo:{pano:8,corda:4,couro:3,pregos:2},cat:'roupas',etapa:3,est:2,desb:{oficina:true}},
  {faz:'bandagem',n:1,custo:{pano:2},cat:'cura',etapa:1,est:0},
  {faz:'kit',n:1,custo:{bandagem:2,remedios:1,pano:1},cat:'cura',etapa:3,est:1,desb:{manual:'guiaSocorros'}},
  {faz:'corda',n:1,custo:{fibra:5},cat:'materiais',etapa:1,est:0},
  {faz:'tabuas',n:3,custo:{madeira:2},cat:'materiais',etapa:1,est:0},
  {faz:'pregos',n:3,custo:{sucata:1},cat:'materiais',etapa:2,est:1,desb:{item:'sucata'}}
];
const OBRAS={
  barricada:{nome:'Barricada',icon:'i-barricada',custo:{tabuas:4,madeira:2},hp:200,hw:1.45,hd:0.55,solid:true,etapa:1},
  muro:{nome:'Muro de madeira',icon:'i-muro',custo:{tabuas:6,pregos:3},hp:300,hw:1.5,hd:0.16,solid:true,etapa:2},
  muroPedra:{nome:'Muro de pedra',icon:'i-muro-pedra',custo:{pedra:8,tabuas:2},hp:750,hw:1.5,hd:0.26,solid:true,etapa:3,desb:'noite1'},
  estacas:{nome:'Estacas',icon:'i-estacas',custo:{madeira:5},hp:150,hw:1.0,hd:0.55,solid:false,armadilha:true,etapa:1},
  portao:{nome:'Portão',icon:'i-portao',custo:{tabuas:8,pregos:4,sucata:2},hp:420,hw:1.5,hd:0.16,solid:true,portao:true,etapa:3,desb:'noite1'},
  fogueira:{nome:'Fogueira',icon:'i-fogueira',custo:{graveto:6,pedra:4,fibra:2},hp:120,hw:0.55,hd:0.55,solid:true,luz:true,etapa:1},
  bau:{nome:'Baú',icon:'i-bau',custo:{tabuas:6,pregos:4},hp:180,hw:0.54,hd:0.34,solid:true,bau:true,etapa:2}
};
const BAU_N=16;
const OBRA_ORDEM=['barricada','muro','muroPedra','estacas','portao','fogueira','bau'];
/* saque por lugar: [item, mín, máx, chance]. Mata = natureza; posto = metal e peças; fazenda = madeira, corda e ferramentas; vila = comida, tecido e remédios */
const LOOT={
  inicio:[['feijao',1,1,1],['agua',1,1,1],['pano',2,2,1],['biscoito',1,1,1]],
  lenha:[['madeira',6,9,1]],
  mercado:[['feijao',1,2,0.6],['biscoito',1,3,0.8],['refri',1,2,0.6],['agua',1,2,0.6],['pano',1,2,0.3]],
  oficina:[['gasolina',1,1,0.3],['sucata',2,4,0.9],['pregos',2,5,0.6],['tabuas',2,4,0.5],['municao9',3,6,0.35],['picareta',1,1,0.12],['machado',1,1,0.1],['pano',1,2,0.4],['molotov',1,1,0.08]],
  carro:[['gasolina',1,1,0.2],['municao9',2,5,0.35],['agua',1,1,0.35],['biscoito',1,2,0.35],['sucata',1,2,0.4],['pregos',1,3,0.15],['bandagem',1,1,0.25],['remedios',1,1,0.1],['faca',1,1,0.08],['pistola',1,1,0.03],['refri',1,1,0.25]],
  lixo:[['pano',1,3,0.7],['sucata',1,2,0.5],['pregos',1,2,0.25],['garrafa',1,2,0.5],['biscoito',1,1,0.2]],
  casa:[['feijao',1,2,0.6],['agua',1,1,0.4],['pano',1,3,0.6],['bandagem',1,1,0.3],['remedios',1,1,0.2],['pregos',1,3,0.2],['municao9',2,4,0.22],['taco',1,1,0.06],['facao',1,1,0.03],['pistola',1,1,0.04],['garrafa',1,1,0.3],['flecha',2,5,0.1],['arco',1,1,0.03]],
  celeiro:[['gasolina',1,1,0.15],['tabuas',3,6,0.7],['pano',1,3,0.6],['madeira',3,6,0.6],['corda',1,2,0.35],['pregos',2,4,0.5],['taco',1,1,0.35],['picareta',1,1,0.3],['machado',1,1,0.12],['sucata',1,3,0.5],['arco',1,1,0.14],['flecha',3,8,0.35]],
  farmacia:[['bandagem',1,3,0.9],['remedios',1,3,0.85],['kit',1,1,0.45],['pano',1,2,0.4]],
  suprimentos:[['gasolina',1,2,0.6],['municao9',8,14,1],['kit',1,1,0.8],['remedios',1,2,0.6],['pregos',3,6,0.5],['feijao',2,3,1],['agua',2,2,1],['facao',1,1,0.25],['pistola',1,1,0.35],['sucata',2,3,0.6],['molotov',1,2,0.45],['flecha',4,8,0.3]],
  zumbi:[['pano',1,1,0.22],['municao9',1,3,0.05],['sucata',1,1,0.07]]
};
function rollLoot(tab,R){R=R||Math.random;const out=[];for(const[id,a,b,ch]of LOOT[tab]||[])if(R()<ch)out.push(lootItem(id,randi(R,a,b),R));
  if(!out.length&&LOOT[tab]&&LOOT[tab].length){const e=LOOT[tab][0];out.push(lootItem(e[0],e[1],R));}return out;}
/* ferramentas e armas achadas vêm usadas (45% a 85%): o conserto na bancada tem valor */
function lootItem(id,n,R){const d=ITEMS[id];if(d&&d.durMax)return[id,n,{dur:Math.round(d.durMax*(0.45+(R||Math.random)()*0.4))}];return[id,n];}

/* ---------- inventário: 6 na mão + 6 bolsos + até 24 na mochila ---------- */
const INV_N=50,BAR_N=6;
function newItem(id,n){const d=ITEMS[id],it={id,n:n||1};if(d.durMax)it.dur=d.durMax;if(d.fogo)it.mun=0;if(d.validade)it.v=Math.round((G.tm||0)+d.validade*60);return it;}
function invCount(id){let n=0;for(const s of P.inv)if(s&&s.id===id)n+=s.n;return n;}
function invHas(cost){for(const k in cost)if(invCount(k)<cost[k])return false;return true;}
function invRemove(id,n){for(let pass=0;pass<2;pass++)for(let i=pass?0:BAR_N;i<(pass?BAR_N:INV_N)&&n>0;i++){const s=P.inv[i];if(!s||s.id!==id)continue;const k=Math.min(n,s.n);s.n-=k;n-=k;if(s.n<=0)P.inv[i]=null;}return n===0;}
function invPay(cost){for(const k in cost)invRemove(k,cost[k]);}
/* qualidade: pilhas só se juntam com a mesma qualidade; a validade (comida) vira a média */
function mesmaQual(s,q){return(s.q===undefined?undefined:s.q)===(q===undefined?undefined:q)||(s.q===undefined&&q===1)||(s.q===1&&q===undefined);}
function juntarPilha(s,k,extra){if(extra&&extra.v!==undefined&&s.v!==undefined)s.v=Math.round((s.v*s.n+extra.v*k)/(s.n+k));else if(extra&&extra.v!==undefined)s.v=extra.v;}
/* paga a receita gastando o melhor material primeiro; devolve a qualidade média do que tinha qualidade (ou null) */
function invPayQ(cost){let soma=0,n=0;for(const k in cost){let falta=cost[k];const d=ITEMS[k];
    if(!d||!d.qual){invRemove(k,falta);continue;}
    while(falta>0){let bi=-1,bq=-1;for(let i=0;i<INV_N;i++){const s=P.inv[i];if(s&&s.id===k&&(s.q??1)>bq){bq=s.q??1;bi=i;}}if(bi<0)break;
      const s=P.inv[bi],t=Math.min(falta,s.n);s.n-=t;falta-=t;soma+=bq*t;n+=t;if(s.n<=0)P.inv[bi]=null;}}
  return n?Math.round(soma/n):null;}
function invAdd(id,n,extra){const d=ITEMS[id];if(!d)return n;if(n>0)marcarVisto(id);
  const lim=invLimite();
  const q=extra&&extra.q!==undefined?extra.q:(d.qual?1:undefined);if(d.qual&&!(extra&&extra.q!==undefined))extra=Object.assign({},extra||{},{q});
  if(d.validade&&!(extra&&extra.v!==undefined))extra=Object.assign({},extra||{},{v:Math.round((G.tm||0)+d.validade*60)});
  if(d.max>1){for(let i=0;i<lim&&n>0;i++){const s=P.inv[i];if(s&&s.id===id&&s.n<d.max&&mesmaQual(s,q)){const k=Math.min(n,d.max-s.n);juntarPilha(s,k,extra);s.n+=k;n-=k;}}}
  const order=d.tipo==='arma'||d.mao?[...Array(BAR_N).keys(),...Array.from({length:lim-BAR_N},(_,i)=>i+BAR_N)]:[...Array.from({length:lim-BAR_N},(_,i)=>i+BAR_N),...Array(BAR_N).keys()];
  for(const i of order){if(n<=0)break;if(!P.inv[i]){const k=Math.min(n,d.max);P.inv[i]=Object.assign(newItem(id,k),extra||{});n-=k;}}
  return n;}
function invSpace(){let n=0;const lim=invLimite();for(let i=0;i<lim;i++)if(!P.inv[i])n++;return n;}
