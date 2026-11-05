/* ================= progressão: nível, melhorias e tarefas do rádio ================= */
const PERKS=[
  {id:'pele',nome:'Pele grossa',desc:'+15 de vida máxima.',max:3,ico:'i-coracao'},
  {id:'forca',nome:'Braço forte',desc:'+12% de dano corpo a corpo.',max:4,ico:'i-machado'},
  {id:'mira',nome:'Mão firme',desc:'+15% de dano com armas de fogo, arco e besta.',max:3,ico:'i-pistola'},
  {id:'folego',nome:'Fôlego',desc:'Correr cansa 15% menos e a energia volta mais rápido.',max:3,ico:'i-energia'},
  {id:'lenhador',nome:'Lenhador',desc:'+1 madeira a cada árvore cortada ou socada.',max:2,ico:'i-madeira'},
  {id:'catador',nome:'Catador',desc:'25% de chance de achar um item a mais ao revistar.',max:3,ico:'i-mochila'},
  {id:'silencio',nome:'Passos leves',desc:'Você faz 20% menos barulho.',max:2,ico:'i-barulho'},
  {id:'metab',nome:'Estômago forte',desc:'Fome e sede caem 15% mais devagar.',max:2,ico:'i-fome'},
  {id:'constr',nome:'Construtor',desc:'Defesas que você constrói aguentam 25% a mais.',max:2,ico:'i-martelo'},
  {id:'corrida',nome:'Corredor',desc:'Corre 8% mais rápido.',max:2,ico:'i-correr'},
  {id:'medico',nome:'Primeiros socorros',desc:'Bandagens e kits curam 30% a mais.',max:2,ico:'i-kit'}];
const perk=id=>(G.perks&&G.perks[id])||0;
function vidaMax(){return Math.round((100+15*perk('pele'))*(P.lesoes&&P.lesoes.virus>50?0.75:1)*(P.lesoes&&P.lesoes.ferida?0.8:1));}
function xpProx(){return 60+G.nivel*45;}
function ganharXP(n){if(!n||!G.nivel)return;G.xp+=Math.round(n);let sub=false;while(G.xp>=xpProx()){G.xp-=xpProx();G.nivel++;G.pontos++;sub=true;}
  hudXP(n);if(sub){sfx('nivel');toast('habilidade','Nível '+G.nivel+'! Abra a mochila, aba Nível, e escolha uma melhoria.');}}
function aprender(id){const p=PERKS.find(q=>q.id===id);if(!p||G.pontos<=0||perk(id)>=p.max)return;G.perks[id]=perk(id)+1;G.pontos--;
  if(id==='pele')P.vida=Math.min(vidaMax(),P.vida+15);sfx('nivel');feed(p.nome+' '+G.perks[id]+'/'+p.max);invRender();hudXP(0);salvarJogo();}

const TAREFAS=[
  {id:'matar',txt:n=>'Abata '+n+' zumbis',ev:'kill',meta:()=>8+Math.min(10,G.dia*2),xp:60,rec:[['municao9',6]]},
  {id:'furtivo',txt:n=>'Dê '+n+' golpes furtivos',ev:'furtivo',meta:()=>3,xp:70,rec:[['faca',1]],dica:'Agachado (C), chegue por trás de um zumbi distraído.'},
  {id:'arvores',txt:n=>'Derrube '+n+' árvores',ev:'arvore',meta:()=>3,xp:45,rec:[['tabuas',6]]},
  {id:'construir',txt:n=>'Construa '+n+' defesas',ev:'obra',meta:()=>3,xp:55,rec:[['sucata',2],['pregos',4]]},
  {id:'revistar',txt:n=>'Revistar '+n+' lugares',ev:'busca',meta:()=>5,xp:55,rec:[['kit',1]]},
  {id:'frutas',txt:n=>'Colha frutas '+n+' vezes',ev:'colheita',meta:()=>4,xp:35,rec:[['agua',2]]},
  {id:'fabricar',txt:n=>'Fabrique '+n+' itens',ev:'fabricar',meta:()=>5,xp:40,rec:[['pano',4]]},
  {id:'cabeca',txt:n=>'Acerte '+n+' tiros na cabeça',ev:'cabeca',meta:()=>3,xp:70,rec:[['municao9',10]],req:()=>invCount('pistola')>0},
  {id:'bruto',txt:()=>'Derrube um brutamonte',ev:'killBrute',meta:()=>1,xp:130,rec:[['facao',1]],min:3},
  {id:'gritador',txt:n=>'Mate '+n+' gritadores',ev:'killScreamer',meta:()=>2,xp:70,rec:[['bandagem',3]],min:2},
  {id:'corredor',txt:n=>'Mate '+n+' corredores',ev:'killRunner',meta:()=>3,xp:70,rec:[['refri',2]],min:2},
  {id:'noite',txt:()=>'Sobreviva a uma noite sem cair',ev:'noiteLimpa',meta:()=>1,xp:100,rec:[['feijao',3]]},
  {id:'cacar',txt:n=>'Cace '+n+' animais',ev:'caca',meta:()=>3,xp:60,rec:[['carneAssada',2]],dica:'Cervos e coelhos fogem quando veem você. Agachado dá para chegar perto.'},
  {id:'assar',txt:n=>'Asse '+n+' carnes',ev:'assar',meta:()=>4,xp:40,rec:[['agua',2]]},
  {id:'esfolar',txt:n=>'Tire a pele de '+n+' bichos',ev:'esfolar',meta:()=>2,xp:50,rec:[['pano',3]],dica:'Com faca ou machado, segure E perto do bicho abatido.'},
  {id:'costurar',txt:n=>'Faça '+n+' peça de roupa',ev:'roupa',meta:()=>1,xp:60,rec:[['pano',2],['bandagem',1]],dica:'Couro e pele viram roupas na bancada (aba Fabricar).'},
  {id:'consertar',txt:()=>'Conserte uma ferramenta',ev:'consertar',meta:()=>1,xp:45,rec:[['pregos',4]],dica:'Perto da bancada, toque na ferramenta gasta na mochila e escolha Consertar.',req:()=>P.inv.some(s=>{const c=s&&custoConserto(s);return!!(c&&Object.keys(c).length);})},
  {id:'rochas',txt:n=>'Quebre '+n+' rochas',ev:'rocha',meta:()=>3,xp:45,rec:[['pedra',6]],req:()=>invCount('picareta')>0}];
const tarefaDef=id=>TAREFAS.find(q=>q.id===id);
function novaTarefa(){const ativos=new Set(G.tarefas.map(t=>t.id));
  const pool=TAREFAS.filter(t=>!ativos.has(t.id)&&(!t.min||G.dia>=t.min)&&(!t.req||t.req())&&t.id!==G.ultimaTarefa);
  if(!pool.length)return;const T=pool[Math.floor(Math.random()*pool.length)];G.tarefas.push({id:T.id,n:0,meta:T.meta()});}
function encherTarefas(){if(!G.tarefas)G.tarefas=[];for(let i=0;i<4&&G.tarefas.length<3;i++)novaTarefa();}
function progresso(ev,k){conqEvento(ev,k);if(!G.tarefas)return;let feito=false;
  for(const t of G.tarefas){const T=tarefaDef(t.id);if(!T||T.ev!==ev||t.n>=t.meta)continue;t.n=Math.min(t.meta,t.n+(k||1));if(t.n>=t.meta){feito=true;concluirTarefa(t,T);}}
  if(feito){G.tarefas=G.tarefas.filter(t=>t.n<t.meta);encherTarefas();}hudTarefa();invRender();}
function concluirTarefa(t,T){G.tarefaN=(G.tarefaN||0)+1;G.ultimaTarefa=t.id;if(typeof diarioEvento==='function')diarioEvento('Tarefa do rádio concluída: '+T.txt(t.meta).toLowerCase(),'missao');for(const[id,n]of T.rec)ganhar(id,n);ganharXP(T.xp);sfx('missao');
  toast('radio','Tarefa cumprida: '+T.txt(t.meta).toLowerCase()+'. Deixei '+T.rec.map(r=>r[1]+' '+ITEMS[r[0]].nome.toLowerCase()).join(' e ')+' na sua mochila.');}
function tarefaTop(){let best=null,bk=-1;for(const t of G.tarefas||[]){const k=t.n/t.meta;if(k>bk){bk=k;best=t;}}return best;}
/* morte de zumbi: xp, tarefas */
function zMorreu(z){zMorreuEsp(z);const xp=(ZS[z.tipo]&&ZS[z.tipo].xp)||{walker:10,runner:14,screamer:16,brute:45,emboscada:15,sentinela:22,elite:90,colosso:400}[z.tipo]||10;ganharXP(xp);progresso('kill');
  if(z.tipo==='brute')progresso('killBrute');else if(z.tipo==='screamer')progresso('killScreamer');else if(z.tipo==='runner')progresso('killRunner');}
