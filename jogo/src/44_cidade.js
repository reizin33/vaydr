/* ================= cidade: recipientes, portas, janelas, gerador, alarme e estado salvo ================= */
Object.assign(ITEMS,{
  peDeCabra:{nome:'Pé de cabra',icon:'i-pecabra',max:1,tipo:'arma',corpo:true,dano:22,alcance:2.0,tempo:0.6,durMax:220,empurra:0.9,vertical:true,desc:'Força portas trancadas sem chave. Pesado, faz barulho, mas resolve.'},
  chaveFarmacia:{nome:'Chave da farmácia',icon:'i-chave',max:1,tipo:'util',desc:'Abre a farmácia do Hospital São Lucas sem barulho.'},
  antisseptico:{nome:'Antisséptico',icon:'i-antisseptico',max:6,tipo:'cura',vida:15,desc:'Limpa feridas. Cura um pouco.'},
  chaveArsenal:{nome:'Chave do arsenal',icon:'i-chave',max:1,tipo:'util',desc:'Abre o arsenal da delegacia sem forçar (o alarme não toca).'},
  colete:{nome:'Colete tático',icon:'i-camisa',max:1,tipo:'roupa',slot:'tronco',prot:0.22,quente:0.05,desc:'Colete da polícia: protege bem o tronco, mas não esquenta.'}
});
/* saque por recipiente: [item, chance, mín, máx]; sorteio igual ao das caixas (nunca passa do limite de tipos) */
const CID_LOOT={
  ap_cozinha:[['feijao',.45,1,2],['biscoito',.4,1,2],['refri',.3,1,1],['agua',.35,1,2],['garrafa',.2,1,1],['isqueiro',.05,1,1],['faca',.06,1,1]],
  ap_quarto:[['pano',.5,1,3],['mochila',.06,1,1],['pilhas',.12,1,2],['remedios',.1,1,1],['fita',.08,1,1],['taco',.04,1,1],['arco',.02,1,1],['flecha',.05,2,5]],
  ap_gaveta:[['pilhas',.25,1,2],['isqueiro',.15,1,1],['remedios',.18,1,1],['bandagem',.15,1,1],['fita',.12,1,1],['municao9',.06,2,5],['lanterna',.05,1,1],['receita',.03,1,1]],
  deposito:[['tabuas',.35,1,3],['pregos',.3,2,5],['sucata',.35,1,3],['corda',.15,1,1],['fita',.12,1,1],['peDeCabra',.05,1,1],['molotov',.04,1,1]],
  lixo:[['garrafa',.4,1,2],['pano',.35,1,2],['sucata',.3,1,2],['biscoito',.1,1,1]],
  banheiro:[['remedios',.25,1,1],['bandagem',.2,1,2],['antisseptico',.25,1,1],['pano',.2,1,1]],
  escritorio:[['pilhas',.3,1,3],['fita',.25,1,1],['lanterna',.08,1,1],['isqueiro',.1,1,1],['biscoito',.15,1,1],['refri',.15,1,1],['sucata',.15,1,1],['receita',.04,1,1],['mapaSecreto',.02,1,1]],
  recepcao:[['pilhas',.2,1,2],['bandagem',.15,1,1],['lanterna',.08,1,1],['isqueiro',.1,1,1]],
  cofre:[['municao9',.6,4,10],['pistola',.15,1,1],['kit',.25,1,1],['mapaSecreto',.1,1,1],['pecaVeiculo',.06,1,1]],
  cofre_hosp:[['kit',.6,1,2],['remedios',.5,2,4],['municao9',.2,3,6]],
  hosp_carrinho:[['bandagem',.6,1,3],['antisseptico',.45,1,2],['remedios',.3,1,2],['pano',.3,1,2]],
  hosp_armario:[['remedios',.55,1,3],['bandagem',.5,1,2],['antisseptico',.4,1,2],['kit',.12,1,1]],
  hosp_gaveta:[['bandagem',.4,1,2],['remedios',.35,1,2],['antisseptico',.3,1,1],['pilhas',.12,1,2]],
  hosp_deposito:[['pano',.5,2,4],['bandagem',.4,2,3],['antisseptico',.35,1,2],['garrafa',.25,1,2],['agua',.25,1,2]],
  farmacia_rara:[['kit',.45,1,2],['remedios',.7,2,4],['antisseptico',.6,1,3],['bandagem',.5,2,3]],
  laboratorio:[['kit',.3,1,1],['remedios',.5,1,3],['antisseptico',.5,1,2],['receita',.08,1,1],['mapaSecreto',.04,1,1]],
  mercado:[['feijao',.5,1,3],['biscoito',.55,1,3],['refri',.4,1,2],['agua',.4,1,2],['garrafa',.15,1,1]],
  mercado_frio:[['refri',.5,1,3],['agua',.5,1,3]],caixa_loja:[['pilhas',.25,1,2],['isqueiro',.2,1,1],['municao9',.05,2,4]],
  estoque:[['feijao',.6,2,5],['biscoito',.6,2,5],['agua',.5,2,4],['refri',.4,2,4],['pano',.3,2,4],['sucata',.2,1,3]],
  oficina:[['pregos',.5,3,6],['sucata',.55,2,4],['fita',.3,1,2],['peDeCabra',.14,1,1],['machado',.05,1,1],['picareta',.06,1,1],['corda',.2,1,2]],
  pecas:[['pecaVeiculo',.12,1,1],['gasolina',.3,1,1],['sucata',.5,2,4],['pilhas',.2,1,2],['fita',.25,1,1]],
  metro_ferr:[['peDeCabra',.15,1,1],['fita',.35,1,2],['pregos',.4,2,5],['pilhas',.3,1,3],['lanterna',.1,1,1]],
  metro_manut:[['sucata',.5,1,3],['corda',.25,1,2],['pano',.3,1,2],['gasolina',.12,1,1],['tabuas',.25,1,3]],
  metro_tec:[['pilhas',.45,1,3],['lanterna',.2,1,1],['fita',.4,1,2],['corda',.3,1,2],['tabuas',.3,2,4],['pregos',.35,2,6],['gasolina',.1,1,1],['peDeCabra',.08,1,1]],
  metro_vagao:[['pano',.35,1,2],['biscoito',.25,1,2],['agua',.25,1,1],['mochila',.05,1,1],['pistola',.03,1,1],['municao9',.12,2,5],['mochilaRef',.02,1,1]],
  teto:[['pilhas',.3,1,3],['agua',.4,1,2],['feijao',.35,1,2],['corda',.25,1,2],['tabuas',.3,2,4],['kit',.08,1,1],['municao9',.15,3,6],['lanterna',.08,1,1],['mochilaRef',.03,1,1],['molotov',.1,1,2],['flecha',.08,2,6]],
  carro:[['gasolina',.2,1,1],['municao9',.25,2,5],['agua',.3,1,1],['biscoito',.3,1,2],['sucata',.35,1,2],['bandagem',.2,1,1],['faca',.06,1,1],['pistola',.02,1,1]],
  elevador:[['municao9',.5,3,8],['kit',.35,1,1],['lanterna',.25,1,1],['pilhas',.4,1,3],['agua',.3,1,1],['pistola',.1,1,1],['mochilaRef',.05,1,1]],
  fosso:[['pecaVeiculo',.15,1,1],['pilhas',.4,1,3],['fita',.35,1,2],['corda',.3,1,1],['sucata',.5,1,3],['lanterna',.12,1,1]],
  elite:[['municao9',.7,4,10],['kit',.45,1,1],['remedios',.4,1,2],['pistola',.15,1,1],['mochilaRef',.1,1,1],['pecaVeiculo',.08,1,1],['receita',.1,1,1],['molotov',.25,1,2]],
  hotel_mala:[['pano',.55,1,3],['agua',.3,1,1],['biscoito',.3,1,2],['remedios',.18,1,1],['isqueiro',.15,1,1],['pilhas',.2,1,2],['mochila',.08,1,1],['lanterna',.06,1,1],['camisaCouro',.03,1,1]],
  hotel_gaveta:[['pilhas',.3,1,2],['remedios',.2,1,1],['isqueiro',.2,1,1],['fita',.15,1,1],['receita',.04,1,1],['mapaSecreto',.03,1,1]],
  cofre_suite:[['municao9',.5,4,10],['pistola',.25,1,1],['kit',.4,1,1],['mochilaRef',.12,1,1],['mapaSecreto',.15,1,1],['receita',.12,1,1],['pecaVeiculo',.08,1,1]],
  lavanderia:[['pano',.7,2,5],['fita',.15,1,1],['garrafa',.2,1,2]],
  recepcao_pol:[['pilhas',.3,1,2],['lanterna',.15,1,1],['municao9',.25,2,6],['bandagem',.2,1,1]],
  arsenal:[['municao9',.9,6,15],['pistola',.5,1,1],['colete',.45,1,1],['lanterna',.3,1,1],['kit',.2,1,1]],
  arsenal_caixa:[['municao9',.8,8,20],['colete',.2,1,1],['fita',.3,1,2],['pilhas',.35,1,3]],
  vestiario:[['colete',.1,1,1],['pano',.4,1,2],['lanterna',.15,1,1],['pilhas',.25,1,2],['municao9',.2,2,5],['botasCouro',.05,1,1]],
  delegado:[['pilhas',.3,1,2],['isqueiro',.2,1,1],['municao9',.3,2,6],['mapaSecreto',.06,1,1]],
  cofre_pol:[['municao9',.7,6,14],['pistola',.35,1,1],['kit',.3,1,1],['mapaSecreto',.12,1,1]],
  escritorio_pol:[['pilhas',.3,1,2],['fita',.2,1,1],['municao9',.12,2,4],['lanterna',.08,1,1],['biscoito',.15,1,1]],
  cobertura:[['remedios',.3,1,2],['pano',.3,1,2],['refri',.25,1,2],['agua',.25,1,2],['isqueiro',.2,1,1],['lanterna',.12,1,1],['mochilaRef',.08,1,1],['receita',.06,1,1]],
  adega:[['garrafa',.6,1,3],['agua',.3,1,2],['refri',.3,1,2]],
  farmacia_loja:[['remedios',.55,1,3],['bandagem',.5,1,3],['antisseptico',.45,1,2],['kit',.08,1,1]],
  farmacia_balcao:[['remedios',.4,1,2],['bandagem',.3,1,2],['pilhas',.15,1,2]],
  farmacia_estoque:[['remedios',.75,2,5],['bandagem',.6,2,4],['antisseptico',.55,1,3],['kit',.35,1,2]],
  conveniencia:[['biscoito',.55,1,3],['refri',.45,1,3],['agua',.4,1,2],['isqueiro',.25,1,1],['pilhas',.3,1,3],['fita',.15,1,1],['feijao',.3,1,2]],
  padaria:[['biscoito',.6,1,3],['agua',.25,1,1],['refri',.2,1,2],['feijao',.15,1,1]],
  armazem:[['tabuas',.65,3,8],['pregos',.6,4,12],['corda',.35,1,3],['sucata',.5,2,6],['fita',.3,1,2],['pano',.3,2,4]],
  armazem_caixa:[['tabuas',.5,2,6],['pregos',.5,3,8],['sucata',.5,2,5],['gasolina',.12,1,1],['picareta',.05,1,1],['peDeCabra',.06,1,1]],
  porao:[['feijao',.55,2,4],['agua',.5,1,3],['biscoito',.4,1,3],['pano',.3,1,3],['corda',.25,1,2],['pilhas',.25,1,3],['lanterna',.12,1,1],['municao9',.15,2,6],['machado',.05,1,1]],
  esconderijo:[['municao9',.6,4,10],['pistola',.3,1,1],['kit',.4,1,1],['mochilaRef',.15,1,1],['mapaSecreto',.15,1,1],['receita',.12,1,1],['pecaVeiculo',.1,1,1]]};
const CID_CFG={tipos:3,vazia:0.12,tempo:{
  /* reaparecimento em minutos de jogo; cofre e sala trancada não voltam */
  ap_cozinha:2880,ap_quarto:4320,ap_gaveta:4320,deposito:4320,lixo:1440,banheiro:2880,escritorio:4320,recepcao:4320,hosp_carrinho:2880,hosp_armario:2880,hosp_gaveta:2880,hosp_deposito:2880,
  mercado:2880,mercado_frio:2880,estoque:4320,teto:5760,oficina:4320,pecas:5760,metro_ferr:5760,metro_manut:4320,metro_vagao:5760,metro_tec:5760,carro:4320,
  hotel_mala:5760,hotel_gaveta:4320,lavanderia:2880,recepcao_pol:4320,vestiario:5760,escritorio_pol:4320,cobertura:7200,adega:4320,farmacia_loja:2880,farmacia_balcao:2880,
  conveniencia:2880,padaria:2880,armazem:4320,armazem_caixa:5760},abrir:{caixas:1.3,cofre:2.2,portaMalas:1.0}};
function sortearTab(tab,mx,vazia,R){R=R||Math.random;if(R()<vazia)return[];let soma=0;for(const e of tab)soma+=e[1];const fator=soma>mx?mx/soma:1;
  const ord=tab.slice();for(let i=ord.length-1;i>0;i--){const j=Math.floor(R()*(i+1));const t=ord[i];ord[i]=ord[j];ord[j]=t;}
  const u=R(),out=[];let a=0;for(const e of ord){const b=a+e[1]*fator;if(Math.ceil(b-u)-Math.ceil(a-u)>=1&&out.length<mx)out.push(lootItem(e[0],randi(R,e[2],e[3]),R));a=b;}return out;}
const contNome=c=>c.tipo==='portaMalas'?'o porta-malas':c.tipo==='caixas'&&c.metro?'as malas':(CONT_DEF[c.tipo]||{nome:'o móvel'}).nome;
/* primeira abertura sorteia; o que sobra fica guardado; vazio volta a encher depois do tempo (se o tipo volta) */
function contEncher(c){const it=sortearTab(CID_LOOT[c.tabela]||CID_LOOT.lixo,c.tipo==='cofre'?3:CID_CFG.tipos,c.tipo==='cofre'?0:CID_CFG.vazia);
  if(c.sala&&c.sala.tipo==='recepcao'&&c.sala.p.tipo==='hospital'&&!G.cid.chaveDada){it.unshift(['chaveFarmacia',1]);G.cid.chaveDada=true;}
  if(c.tabela==='delegado'&&!G.cid.chaveArsenal){it.unshift(['chaveArsenal',1]);G.cid.chaveArsenal=1;}
  if(c.sala&&c.sala.tipo==='portaria'&&!G.cid.bilhete){G.cid.bilhete=1;setTimeout(()=>toast('corpo','Um bilhete do zelador, preso na gaveta: "O morador do 2º andar guardava coisa boa atrás de um painel solto na parede. Ninguém achou."'),400);}
  c.itens=new Array(Math.max(4,it.length)).fill(null);it.forEach((e,i)=>{c.itens[i]=Object.assign(newItem(e[0],e[1]),e[2]||{});});c.estado=c.itens.some(Boolean)?'vasculhado':'vazio';if(c.estado==='vazio')c.t=G.tm||0;}
function contConferir(c){if(c&&c.estado==='vasculhado'&&!(c.itens||[]).some(Boolean)){c.estado='vazio';c.t=G.tm||0;}}
function abrirCont(c){if(c.estado==='fechado'){contEncher(c);ganharXP(c.tipo==='cofre'?20:4);progresso('busca');}
  sfx('bau');barulho(P.x,P.z,c.tipo==='cofre'?9:5,true);
  if(c.estado==='vazio'||!(c.itens||[]).some(Boolean)){contConferir(c);feed('Vazio',true);return;}
  bauAberto={itens:c.itens,saque:true,caixa:c,nome:contNome(c).replace(/^(o|a|os|as) /,'').replace(/^./,m=>m.toUpperCase()),aoMudar:()=>contConferir(c)};bauMsg='';abrirMochila('bau');}
function updateConts(){if(G.tm===undefined)return;for(const c of CID.conts){if(c.estado!=='vazio')continue;const T=CID_CFG.tempo[c.tabela];if(!T)continue;
  if(G.tm-c.t>T&&Math.hypot(c.x-P.x,c.z-P.z)>30){c.estado='fechado';c.itens=null;}}}

/* ---------- portas ---------- */
function portaColisor(d){colRemove(d.col);d.col=null;if(d.estado==='aberta'||d.estado==='quebrada')return;
  d.col=colBox(d.x,d.z,d.larg/2,0.09,d.yaw,{solid:true,y0:d.y,y1:d.y+2.2,porta:d});}
const portaFechada=d=>d.estado!=='aberta'&&d.estado!=='quebrada';
function portaEstado(d,e){d.estado=e;portaColisor(d);G.cid.portas[d.id]=[e,Math.round(d.hp)];if(d.poco)elevadorVias(d.poco);}
function danoPorta(d,dano,porZumbi){if(!portaFechada(d))return;d.hp-=d.estado==='travada'?dano*0.5:dano;poeira(d.x,d.y+1.0,d.z,3);sfx(d.tipo==='metal'?'quebrar':'madeira',d.x,d.z,0.7);
  if(porZumbi)barulho(d.x,d.z,10,false);
  if(d.hp<=0){d.hp=0;portaEstado(d,'quebrada');poeira(d.x,d.y+1,d.z,14);sfx('quebrar',d.x,d.z);barulho(d.x,d.z,22,false);if(d.alarme)dispararAlarme(d.p,d.x,d.z);
    if(Math.hypot(d.x-P.x,d.z-P.z)<25)feed(porZumbi?'Arrombaram uma porta!':'A porta cedeu',porZumbi);}
  else G.cid.portas[d.id]=[d.estado,Math.round(d.hp)];}
function temChave(d){return d.chave&&invCount(d.chave)>0;}
function temPeDeCabra(){return P.inv.find(s=>s&&s.id==='peDeCabra');}
function portaTexto(d){const E=d.estado;if(OB.some(o=>o.tipo==='tabuasPorta'&&o.ext&&o.ext.porta===d.id))return{t:'Porta pregada com tábuas',s:'só passa se arrancar as tábuas'};
  if(d.tipo==='elevador'){if(E==='emperrada')return temPeDeCabra()?{t:'Forçar a porta do elevador',s:'pé de cabra · faz barulho · segure',hold:true,dur:2.4}:{t:'Porta do elevador emperrada',s:'precisa de um pé de cabra'};return null;}
  if(E==='aberta')return{t:'Fechar a porta',s:d.tipo==='vidro'?'porta de vidro':'segure para fechar e travar',alt:true,dur:0.7};
  if(E==='fechada')return{t:'Abrir a porta',s:'segure para travar',alt:true,dur:0.7};
  if(E==='travada')return{t:'Destravar a porta',s:'travada por dentro'};
  if(E==='eletronica')return energia()?{t:'Abrir a porta',s:'fechadura eletrônica com energia'}:{t:'Porta eletrônica sem energia',s:'ligue o gerador do hospital'};
  if(E==='trancada'){if(temChave(d))return{t:'Destrancar com a chave',s:ITEMS[d.chave].nome};if(temPeDeCabra())return{t:'Forçar a porta',s:'pé de cabra · faz barulho · segure',hold:true,dur:2.0};
    return{t:'Porta trancada',s:d.chave?'precisa da '+ITEMS[d.chave].nome.toLowerCase()+' ou de um pé de cabra':'precisa de pé de cabra, ou quebre a golpes'};}
  return null;}
function portaUsar(d,segurado){const E=d.estado;if(OB.some(o=>o.tipo==='tabuasPorta'&&o.ext&&o.ext.porta===d.id)){feed('Pregada com tábuas',true);return;}
  if(d.tipo==='elevador'){if(E!=='emperrada')return;const pc=temPeDeCabra();if(pc&&segurado){gastar(pc,5);portaEstado(d,'aberta');sfx('elevador',d.x,d.z);barulho(P.x,P.z,18,true,P.y);
      feed('Porta do elevador aberta à força');dica('poco','alerta','Poço do elevador aberto: cuidado com a queda. A cabine ficou presa entre o 1º e o 2º andar.');elevadorAcordar(d.p);return;}
    feed('Emperrada',true);sfx('vazio');return;}
  if(E==='aberta'){portaEstado(d,segurado&&d.tipo!=='vidro'?'travada':'fechada');sfx('madeira',d.x,d.z,0.4);if(segurado&&d.tipo!=='vidro')feed('Porta fechada e travada');return;}
  if(E==='fechada'){if(segurado){portaEstado(d,'travada');sfx('madeira',d.x,d.z,0.4);feed('Porta travada: aguenta o dobro');return;}portaEstado(d,'aberta');sfx('madeira',d.x,d.z,0.35);barulho(d.x,d.z,4,true);return;}
  if(E==='travada'){portaEstado(d,'fechada');sfx('clique');feed('Porta destravada');return;}
  if(E==='eletronica'){if(energia()){portaEstado(d,'aberta');sfx('clique');}else feed('Sem energia',true);return;}
  if(E==='trancada'){if(temChave(d)){portaEstado(d,'aberta');sfx('clique');feed('Destrancou com a chave');return;}
    const pc=temPeDeCabra();if(pc&&segurado){gastar(pc,4);portaEstado(d,'aberta');sfx('quebrar',d.x,d.z,0.8);barulho(P.x,P.z,18,true);feed('Porta forçada');if(d.alarme)dispararAlarme(d.p,d.x,d.z);return;}
    feed('Trancada',true);sfx('vazio');}}
/* golpe sem alvo vivo acerta porta fechada na frente */
function golpePorta(dano){const fx=Math.sin(P.body),fz=Math.cos(P.body);let best=null,bd=2.1;
  for(const d of CID.portas){if(!portaFechada(d)||Math.abs(d.y-P.y)>1.2)continue;const dx=d.x-P.x,dz=d.z-P.z,dd=Math.hypot(dx,dz);if(dd<bd&&(dx*fx+dz*fz)/(dd||1)>0.4){bd=dd;best=d;}}
  if(!best)return false;danoPorta(best,dano*0.7,false);barulho(P.x,P.z,14,true);sfx('acerto');return true;}

/* ---------- janelas quebradas: dá para pular ---------- */
function janelaLados(j){const nx=Math.sin(j.yaw),nz=Math.cos(j.yaw);return{fora:{x:j.x+nx*0.9,z:j.z+nz*0.9},dentro:{x:j.x-nx*0.9,z:j.z-nz*0.9}};}
/* onde se cai do outro lado: o ponto precisa estar livre de parede, móvel e obra (móvel encostado na janela tapa a passagem).
   Tenta um pouco mais longe e um pouco de lado; guarda a resposta por uns segundos (a janela é consultada pelas rotas dos zumbis). */
function janelaPouso(j,paraDentro){j._pouso=j._pouso||{};const k=paraDentro?'d':'f',c=j._pouso[k];if(c&&G.t-c.t<4)return c.r;
  const nx=Math.sin(j.yaw),nz=Math.cos(j.yaw),s=paraDentro?-1:1,tx=-nz,tz=nx;let r=null;
  achou:for(const d of[0.9,1.2,1.5])for(const l of[0,0.35,-0.35]){const x=j.x+nx*d*s+tx*l,z=j.z+nz*d*s+tz*l,y=paraDentro?j.y:chaoEm(x,z,j.y+0.5);
    if(!pointBlocked(x,z,0.3)&&!bloqueadoAlto(x,z,0.3,y)){r={x,z,y};break achou;}}
  j._pouso[k]={t:G.t,r};return r;}
function pularJanela(j){const nx=Math.sin(j.yaw),nz=Math.cos(j.yaw),deFora=(P.x-j.x)*nx+(P.z-j.z)*nz>0,alvo=janelaPouso(j,deFora);
  if(!alvo){feed('Tem um móvel ou entulho do outro lado da janela: não dá para passar',true);sfx('vazio');return;}
  const y=alvo.y;P.x=alvo.x;P.z=alvo.z;P.y=chaoEm(alvo.x,alvo.z,y+0.5);P.vy=0;P.vx=P.vz=0;const yy=deFora?j.yaw+Math.PI:j.yaw;P.yaw=yy;P.body=yy;P.travaAnda=0.25;
  sfx('passo',undefined,undefined,0.5,'terra');barulho(P.x,P.z,6,true);dica('janela','corpo','Janelas quebradas do térreo são rotas de fuga: os zumbis também passam por elas, mas mais devagar.');}

/* ---------- gerador do hospital e energia ---------- */
const energia=()=>G.cid&&G.cid.energia>0;
function geradorTexto(){return energia()?{t:'Desligar o gerador',s:'faz barulho enquanto roda'}:{t:'Ligar o gerador',s:invCount('gasolina')?'usa 1 galão de gasolina · 3 horas de luz':'precisa de 1 galão de gasolina'};}
function geradorUsar(){if(energia()){G.cid.energia=0;feed('Gerador desligado');sfx('clique');return;}
  if(!invCount('gasolina')){feed('Precisa de gasolina',true);sfx('vazio');return;}invRemove('gasolina',1);G.cid.energia=180;sfx('construir');
  toast('alerta','O gerador pegou! O hospital tem luz e as portas eletrônicas abrem por 3 horas. O barulho vai atrair gente... e coisa pior.');hudBarra();}
let geradorT=0;
function updateEnergia(dt){if(!energia())return;const rate=(G.hora>=6&&G.hora<20)?1/30:1/24;G.cid.energia=Math.max(0,G.cid.energia-dt*rate*60);
  geradorT-=dt;if(geradorT<=0){geradorT=4;const g=CID.predios.find(p=>p.gerador);if(g){barulho(g.gerador.x,g.gerador.z,26,false);sfx('motor',g.gerador.x,g.gerador.z,0.5);}}
  if(!energia()){for(const d of CID.portas)if(d.tipo==='eletronica'&&d.estado==='aberta'&&Math.hypot(d.x-P.x,d.z-P.z)>4)portaEstado(d,'eletronica');toast('alerta','O gerador do hospital parou.');}}
/* luzes do prédio com gerador: até 2 pontos de luz nas salas mais perto do jogador */
function luzesCidade(put){if(!energia())return;const p=CID.predios.find(q=>q.gerador);if(!p)return;const s=salaEm(P.x,P.y+0.3,P.z);if(!s||s.p!==p)return;
  const L=(p.salas[s.f]||[]).filter(q=>q.tipo!=='escada').map(q=>[d2(q.x,q.z,P.x,P.z),q]).sort((a,b)=>a[0]-b[0]).slice(0,2);for(const[,q]of L)put(q.x,q.y+2.7,q.z,11,[1.6,1.55,1.4]);}

/* ---------- alarme antigo: dispara e chama zumbis ---------- */
function dispararAlarme(p,x,z){G.cid.alarme={x,z,t:45,p:p?p.id:-1};toast('alerta','Um alarme antigo disparou! Todo zumbi por perto vai vir ver o que é.');}
function updateAlarme(dt){const a=G.cid&&G.cid.alarme;if(!a)return;a.t-=dt;if((a.t%1.2)<dt){barulho(a.x,a.z,70,false);sfx('alarme',a.x,a.z,0.9);}if(a.t<=0)G.cid.alarme=null;}

/* ---------- interação ---------- */
function cidInter(tryIt){if(!emPredios(P.x,P.z,6))return;
  for(const c of CID.conts){if(Math.abs(c.x-P.x)>2.4||Math.abs(c.z-P.z)>2.4)continue;if(c.oculto&&!c.revelado){tryIt({k:'painel',o:c},c.x,c.z,1.6,0.5,0.3,c.sala?c.sala.y:c.y);continue;}tryIt({k:'cont',o:c},c.x,c.z,1.9,1.0,-0.4,c.y);}
  for(const d of CID.portas){if(d.estado==='quebrada'||(d.tipo==='elevador'&&d.estado!=='emperrada')||Math.abs(d.x-P.x)>2.4||Math.abs(d.z-P.z)>2.4)continue;tryIt({k:'porta',o:d},d.x,d.z,1.8,0.9,-0.5,d.y);}
  for(const a of CID.alcapoes){if(a.aberto||Math.abs(a.x-P.x)>1.8||Math.abs(a.z-P.z)>1.8)continue;if(Math.abs(a.y-P.y)<0.6)tryIt({k:'alcapao',o:a},a.x,a.z,1.1,3.0,-0.6,a.y);
    else if(Math.abs(a.el.yc-P.y)<0.6)tryIt({k:'alcapao',o:a,dentro:true},a.x,a.z,1.4,2.0,-1,P.y);}
  for(const e of CID.entulhos)if(e.ativo&&Math.abs(e.x-P.x)<2.6&&Math.abs(e.z-P.z)<2.6)tryIt({k:'entulho',o:e},e.x,e.z,2.0,1.0,-0.3,e.y);
  for(const f of CID.fumacas)if(f.ativo&&Math.abs(f.x-P.x)<2.6&&Math.abs(f.z-P.z)<2.6)tryIt({k:'fumaca',o:f},f.x,f.z,2.2,1.2,-0.5,f.y);
  for(const m of CID.mirantes)if(Math.abs(m.x-P.x)<2.4&&Math.abs(m.z-P.z)<2.4&&Math.abs(m.y-P.y)<1.2)tryIt({k:'mirante',o:m},m.x,m.z,2.0,0.6,-0.2,m.y);
  for(const b of CID.bombas||[])if(Math.abs(b.x-P.x)<2.2&&Math.abs(b.z-P.z)<2.6)tryIt({k:'bomba',o:b},b.x,b.z,2.0,1.0,-0.4,b.y);
  for(const a of CID.poroes)if(!a.aberto&&Math.abs(a.x-P.x)<1.8&&Math.abs(a.z-P.z)<1.8&&Math.abs(a.y-P.y)<0.6)tryIt({k:'porao',o:a},a.x,a.z,1.5,1.4,-0.6,a.y);
  for(const j of CID.janelas){if(!j.quebrada||j.f>0||Math.abs(j.x-P.x)>2||Math.abs(j.z-P.z)>2||janelaTapada(j))continue;tryIt({k:'janela',o:j},j.x,j.z,1.5,0.6,-0.3,P.y);}
  for(const p of CID.predios)if(p.gerador&&Math.abs(p.gerador.x-P.x)<2.6&&Math.abs(p.gerador.z-P.z)<2.6)tryIt({k:'gerador',o:p.gerador},p.gerador.x,p.gerador.z,2.2,1.5,-0.5,p.gerador.y);
  for(const pa of CID.passarelas)if(pa.quebrada)for(const e of pa.pontas)tryIt({k:'passarela',o:Object.assign(pa,{})},e[0],e[1],1.8,1.4,-0.5,pa.y);}
function cidTexto(a){const o=a.o;switch(a.k){
  case'cont':{if(o.estado==='vazio')return{t:'Vasculhado: '+contNome(o).replace(/^(o|a|os|as) /,''),s:'vazio por enquanto'};const ab=o.estado==='vasculhado';
    return{t:(ab?'Abrir ':'Vasculhar ')+contNome(o),s:ab?'ainda tem coisa':'segure para vasculhar',hold:!ab,dur:CID_CFG.abrir[o.tipo]||0.9};}
  case'porta':return portaTexto(o);
  case'janela':return{t:'Pular a janela',s:'janela quebrada · aperte Espaço',tecla:'Espaço'};   // pula com o Espaço (62e_menus), não segurando E
  case'gerador':return geradorTexto();
  case'passarela':return{t:'Consertar a passarela',s:invHas({tabuas:3,pregos:2})?'usa 3 tábuas e 2 pregos':'precisa de 3 tábuas e 2 pregos',hold:true,dur:1.6};
  case'alcapao':return a.dentro?{t:'Empurrar o alçapão do teto',s:'dá para subir pelo teto da cabine'}:{t:'Abrir o alçapão da cabine',s:'dá para descer dentro do elevador'};
  case'entulho':{const f=ferramentaEntulho();return{t:'Tirar o entulho da escada',s:(f?ITEMS[f.id].nome.toLowerCase():'com as mãos, demora')+' · faz barulho · segure',hold:true,dur:f?3.2:6.5};}
  case'fumaca':return invCount('agua')>=2?{t:'Apagar o foco de fogo',s:'usa 2 águas · segure',hold:true,dur:1.4}:{t:'Foco de fogo abafado',s:'precisa de 2 águas para apagar'};
  case'painel':return{t:'Examinar a parede',s:'um painel parece solto · segure',hold:true,dur:1.4};
  case'mirante':return{t:'Observar a cidade',s:'mostra zumbis e hordas no minimapa por um tempo · segure',hold:true,dur:1.2};
  case'porao':return{t:'Abrir o alçapão do chão',s:'parece levar a um porão'};
  case'bomba':return G.cid.bombaDia===G.dia?{t:'Bomba sem pressão',s:'volta a juntar combustível amanhã'}:{t:'Bombear combustível',s:'bomba manual · 1 galão por dia · faz barulho · segure',hold:true,dur:3.0};}
  return null;}
function cidInteragir(a,segurado){const o=a.o;switch(a.k){case'cont':abrirCont(o);return true;case'porta':portaUsar(o,segurado);return true;case'janela':return true;case'gerador':geradorUsar();return true;
  case'bomba':{if(G.cid.bombaDia===G.dia){feed('Sem pressão hoje',true);sfx('vazio');return true;}if(invAdd('gasolina',1)>0){feed('Mochila cheia',true);sfx('vazio');return true;}
    G.cid.bombaDia=G.dia;sfx('motor',o.x,o.z,0.5);barulho(P.x,P.z,12,true,P.y);feed('+1 galão de gasolina');hudBarra();dica('bomba','corpo','A bomba manual do posto junta um pouco de combustível por dia. Volte amanhã.');return true;}
  case'porao':poraoAbrir(o);return true;
  case'alcapao':alcapaoAbrir(o);return true;case'entulho':entulhoRemover(o);return true;case'fumaca':fumacaApagar(o);return true;case'painel':painelExaminar(o);return true;case'mirante':observarCidade(o);return true;
  case'passarela':{if(!invHas({tabuas:3,pregos:2})){feed('Faltam tábuas ou pregos',true);sfx('vazio');return true;}invPay({tabuas:3,pregos:2});o.quebrada=false;passarelaPiso(o);G.cid.passarelas=G.cid.passarelas||{};G.cid.passarelas[o.id]=1;sfx('construir');barulho(P.x,P.z,10,true,P.y);feed('Passarela consertada');hudBarra();return true;}}return false;}

/* ---------- água acumulada (metrô): anda devagar ---------- */
function naAgua(x,y,z){if(RIO.ok&&!dentroCidade(x,z,1)){const n=aguaNivel(x,z);return n!==null&&y<n-0.15;}if(!CID.aguas.length||!dentroCidade(x,z,1))return false;for(const a of CID.aguas)if(x>a.x0&&x<a.x1&&z>a.z0&&z<a.z1&&y<a.y&&y>a.yMin)return true;return false;}

/* ---------- estado salvo da cidade ---------- */
function cidNovo(){G.cid={portas:{},janelas:{},energia:0,alarme:null,chaveDada:false,hordas:[],inf:0,alcapoes:{},elevZ:{},entulhos:{},fumacas:{},revelados:{},visitados:{},bilhete:0};
  for(const a of CID.alcapoes){a.aberto=false;if(!a.sup)a.sup=retL(a.p,a.r[0],a.r[1],a.r[2],a.r[3],a.y);}
  for(const e of CID.entulhos){e.ativo=true;if(!e.col)e.col=boxL(e.p,e.u0,e.u1,e.v0,e.v1,e.y,e.y+2.3,{entulho:true});}
  for(const f of CID.fumacas){f.ativo=true;f.resto=0;}
  for(const a of CID.poroes){a.aberto=false;a.via.recolhida=true;if(!a.sup)a.sup=retL(a.p,a.r[0],a.r[2],a.r[1],a.r[3],a.y);}
  for(const c of CID.conts){c.estado='fechado';c.itens=null;c.t=0;}
  for(const d of CID.portas){d.hp=d.hpMax;d.estado=d.estado0??d.estado;d.estado0=d.estado;portaColisor(d);}
  for(const j of CID.janelas){j.quebrada=j.quebrada0??j.quebrada;j.quebrada0=j.quebrada;}
  for(const pa of CID.passarelas||[]){pa.quebrada=pa.quebrada0;if(pa.quebrada&&pa.sup){supRemove(pa.sup);pa.sup=null;}}G.cid.passarelas={};
  for(const c of CID.conts)if(c.oculto)c.revelado=false;
  for(const p of CID.predios)if(p.poco)elevadorVias(p.poco);}
function cidSalvar(){const conts={};for(const c of CID.conts)if(c.estado!=='fechado')conts[c.id]=[c.estado,c.itens||0,Math.round(c.t||0)];
  return{poroes:G.cid.poroes||{},bombaDia:G.cid.bombaDia||0,celasZ:G.cid.celasZ||{},bairros:G.cid.bairros||{},chaveArsenal:G.cid.chaveArsenal||0,postos:G.cid.postos||{},alcapoes:G.cid.alcapoes,elevZ:G.cid.elevZ,entulhos:G.cid.entulhos,fumacas:G.cid.fumacas,revelados:G.cid.revelados,visitados:G.cid.visitados,bilhete:G.cid.bilhete||0,
    passarelas:G.cid.passarelas||{},portas:G.cid.portas,energia:+(G.cid.energia||0).toFixed(1),alarme:G.cid.alarme,chaveDada:!!G.cid.chaveDada,conts,janelas:CID.janelas.filter(j=>j.quebrada!==j.quebrada0).map(j=>j.id),
    hordas:(G.cid.hordas||[]).map(h=>({x:+h.x.toFixed(1),z:+h.z.toFixed(1),n:(h.membros.length?h.membros.filter(z=>z.vivo).length:h.n)+(h.extra||0)}))};}
function cidCarregar(s){cidNovo();if(!s)return;G.cid.passarelas=s.passarelas||{};for(const id in G.cid.passarelas){const pa=CID.passarelas[id];if(pa){pa.quebrada=false;passarelaPiso(pa);}}G.cid.energia=+s.energia||0;G.cid.alarme=s.alarme||null;G.cid.chaveDada=!!s.chaveDada;
  const ix={};for(const d of CID.portas)ix[d.id]=d;for(const id in s.portas||{}){const d=ix[id],v=s.portas[id];if(!d||!Array.isArray(v))continue;d.hp=+v[1]||0;portaEstado(d,v[0]);}
  const cx={};for(const c of CID.conts)cx[c.id]=c;for(const id in s.conts||{}){const c=cx[id],v=s.conts[id];if(!c||!Array.isArray(v))continue;c.estado=v[0];c.t=+v[2]||0;
    c.itens=Array.isArray(v[1])?v[1].map(it=>it&&ITEMS[it.id]&&it.n>0?it:null):null;if(c.estado==='vasculhado'&&!c.itens)c.estado='fechado';}
  for(const id of s.janelas||[]){const j=CID.janelas[id];if(j)j.quebrada=!j.quebrada0;}
  G.cid.elevZ=s.elevZ||{};G.cid.postos=s.postos||{};G.cid.bombaDia=s.bombaDia||0;G.cid.celasZ=s.celasZ||{};G.cid.bairros=s.bairros||{};G.cid.chaveArsenal=s.chaveArsenal||0;G.cid.visitados=s.visitados||{};G.cid.bilhete=s.bilhete||0;
  for(const id in s.alcapoes||{}){const a=CID.alcapoes[id];if(a)alcapaoAbrir(a,true);}
  for(const id in s.poroes||{}){const a=CID.poroes[id];if(a)poraoAbrir(a,true);}
  for(const id in s.entulhos||{}){const e=CID.entulhos[id];if(e)entulhoRemover(e,true);}
  for(const id in s.fumacas||{}){const f=CID.fumacas[id];if(f){f.ativo=false;f.resto=0;G.cid.fumacas[id]=0;}}
  for(const id in s.revelados||{}){const c=CID.conts.find(q=>q.id===id);if(c){c.revelado=true;G.cid.revelados[id]=1;}}
  for(const p of CID.predios)if(p.poco)elevadorVias(p.poco);
  /* hordas voltam como grupo no cruzamento mais perto de onde estavam */
  for(const h of s.hordas||[]){if(!(h.n>0))continue;let b=null,bd=1e9;for(const p of rotaRuas()){const d=Math.hypot(p.x-h.x,p.z-h.z);if(d<bd){bd=d;b=p;}}if(b)G.cid.hordas.push({x:b.x,z:b.z,de:b,para:b.viz[0],n:h.n,membros:[],t:0,parado:0});}}

/* ================= elevador quebrado, entulho, fumaça, esconderijo, mirante e chegada nos prédios ================= */
/* escadas de serviço do poço só valem com a porta do andar aberta (e a do alçapão com ele aberto) */
function elevadorVias(EL){if(EL.viaFosso)EL.viaFosso.recolhida=portaFechada(EL.portas[0]);if(EL.viaTeto)EL.viaTeto.recolhida=!EL.portas[2]||portaFechada(EL.portas[2]);
  if(EL.viaAlcapao)EL.viaAlcapao.recolhida=!EL.alcapao.aberto;}
/* a primeira vez que mexem no elevador de um prédio, tem um deles preso na cabine, dormindo */
function elevadorAcordar(p){if(!p||!p.poco||!G.cid||G.cid.elevZ[p.id])return;G.cid.elevZ[p.id]=1;const E=p.poco,w=pw(p,(E.uA+E.uB)/2-0.15,(E.vA+E.vB)/2+0.35);
  const z=criarZ('emboscada',w[0],w[1],{y:E.yc,cidade:true,hx:w[0],hz:w[1]});if(z){z.st='dorme';z.preso=true;}}
function alcapaoAbrir(a,carregando){if(a.aberto)return;a.aberto=true;if(a.sup){supRemove(a.sup);a.sup=null;}G.cid.alcapoes[a.id]=1;elevadorVias(a.el);
  if(carregando)return;sfx('clique');sfx('madeira',a.x,a.z,0.5);barulho(P.x,P.z,8,true,P.y);feed('Alçapão aberto');elevadorAcordar(a.p);}
/* porão de casa: abre o alçapão do chão; às vezes tem um deles lá embaixo */
function poraoAbrir(a,carregando){if(a.aberto)return;a.aberto=true;if(a.sup){supRemove(a.sup);a.sup=null;}a.via.recolhida=false;G.cid.poroes=G.cid.poroes||{};const novo=!G.cid.poroes[a.id];G.cid.poroes[a.id]=1;if(carregando)return;
  sfx('madeira',a.x,a.z,0.6);barulho(P.x,P.z,7,true,P.y);feed('Alçapão aberto: um porão');
  if(novo&&Math.random()<0.35){const s=a.sala,w=pw(a.p,(s.u0+s.u1)/2,(s.v0+s.v1)/2);const z=criarZ('emboscada',w[0],w[1],{y:s.y,cidade:true,hx:w[0],hz:w[1]});if(z){z.st='dorme';z.preso=true;}}}
const ferramentaEntulho=()=>P.inv.find(s=>s&&(s.id==='peDeCabra'||s.id==='picareta'));
function entulhoRemover(e,carregando){if(!e.ativo)return;e.ativo=false;colRemove(e.col);e.col=null;G.cid.entulhos[e.id]=1;if(carregando)return;
  const f=ferramentaEntulho();if(f)gastar(f,3);poeira(e.x,e.y+0.6,e.z,22);sfx('entulho',e.x,e.z);barulho(P.x,P.z,18,true,P.y);invAdd('sucata',2);feed('Escada liberada · +2 sucata');hudBarra();}
function fumacaApagar(f){if(!f.ativo)return;if(invCount('agua')<2){feed('Precisa de 2 águas',true);sfx('vazio');return;}invRemove('agua',2);f.ativo=false;f.resto=1;G.cid.fumacas[f.id]=0;
  sfx('apagar',f.x,f.z);for(let i=0;i<14;i++)part(f.x+(Math.random()-0.5),f.y+0.3,f.z+(Math.random()-0.5),(Math.random()-0.5)*0.6,1.2+Math.random(),(Math.random()-0.5)*0.6,2.5,0.5,[0.75,0.75,0.72,0.5],false,-0.4);
  feed('Fogo apagado. A fumaça vai baixar.');hudBarra();}
function painelExaminar(c){if(c.revelado)return;c.revelado=true;G.cid.revelados[c.id]=1;sfx('madeira',c.x,c.z,0.6);sfx('pegar');barulho(P.x,P.z,5,true,P.y);ganharXP(15);
  toast('corpo','Atrás do painel solto tinha um esconderijo. Alguém guardou isso com cuidado.');}
/* do alto do telhado: o minimapa mostra mais longe e marca as hordas por um tempo */
function observarCidade(m){G.obsAte=G.t+40;G.obsP=m.p.id;let n=0,dn={};for(const z of Z)if(z.vivo&&Math.hypot(z.x-P.x,z.z-P.z)<110){n++;}
  const H=(G.cid.hordas||[]).map(h=>{const q=h.membros.length?h.membros.filter(z=>z.vivo).length:h.n;return direcao(h.x-P.x,h.z-P.z)+' (~'+q+')';});
  toast('corpo','Do alto do '+m.p.nome+': '+(n?n+' zumbi'+(n>1?'s':'')+' à vista':'nenhum zumbi à vista')+(H.length?'. Horda'+(H.length>1?'s':'')+' a '+H.join(', ')+'.':'. Nenhuma horda andando agora.')+' O minimapa mostra mais longe por um tempo.');
  sfx('pegar');progresso&&progresso('busca');}
/* fumaça: tosse (faz barulho), vista curta para todo mundo, machuca devagar; partículas saindo do foco */
let fumT=0;
function fumacaParticula(f){const r=Math.random()*0.5,a=Math.random()*6.283;part(f.x+Math.cos(a)*r,f.y+0.25,f.z+Math.sin(a)*r,(Math.random()-0.5)*0.35,0.35+Math.random()*0.3,(Math.random()-0.5)*0.35,5+Math.random()*3,0.55,[0.26,0.25,0.24,0.42],false,-0.06);}
function updateFumaca(dt){if(!CID.fumacas.length)return;let alvo=0;const s=dentroCidade(P.x,P.z,4)?salaEm(P.x,P.y+0.3,P.z):null;
  for(const f of CID.fumacas){const dens=f.ativo?1:(f.resto||0);if(dens<=0)continue;const d=Math.hypot(P.x-f.x,P.z-f.z);
    let k=0;if(s&&s===f.sala)k=1;else if(s&&s.p===f.p&&Math.abs(P.y-f.y)<2)k=0.3;alvo=Math.max(alvo,k*dens);
    if(d<40&&Math.random()<dt*7*dens)fumacaParticula(f);if(!f.ativo)f.resto=Math.max(0,f.resto-dt/45);}
  P.fumaca=approach(P.fumaca||0,alvo,dt*0.7);const el=document.getElementById('fumaca');if(el){const o=(P.fumaca*0.62).toFixed(2);if(el.style.opacity!==o)el.style.opacity=o;}
  if(P.fumaca>0.55&&P.alive){fumT-=dt;if(P.vida>8)P.vida-=dt*0.35;
    if(fumT<=0){fumT=(invCount('pano')?6.5:3.4)+Math.random()*2;sfx('tosse');barulho(P.x,P.z,11,true,P.y);
      dica('fumaca','corpo','Fumaça: você tosse, e tossir faz barulho. Lá dentro nem você nem eles enxergam direito. Um pano na mochila ajuda a respirar; 2 águas apagam o foco.');}}}
/* chegando num prédio pela primeira vez: o que tem ali (e o aviso do hospital) */
let chegadaT=0;
function updateChegada(dt){chegadaT-=dt;if(chegadaT>0||!G.cid)return;chegadaT=0.6;if(!dentroCidade(P.x,P.z,2))return;
  {const b=bairroEm(P.x,P.z);G.cid.bairros=G.cid.bairros||{};if(b&&!G.cid.bairros[b.nome]){G.cid.bairros[b.nome]=1;toast(b.risco>1.1?'alerta':'corpo',b.desc);return;}}
  const s=salaEm(P.x,P.y+0.3,P.z);const p=s&&s.p;
  if(!p||G.cid.visitados[p.id])return;G.cid.visitados[p.id]=1;if(p.desc)toast(p.risco?'alerta':'corpo',p.desc);}
/* ================= base dentro de prédio: colchão, tábuas em porta e janela, menu de obras conforme o lugar ================= */
Object.assign(OBRAS,{
  cama:{nome:'Colchão',icon:'i-cama',custo:{pano:6,tabuas:2},hp:80,hw:0.5,hd:1.0,solid:false,cama:true,peq:true,etapa:1},
  tabuasPorta:{nome:'Tábuas na porta',icon:'i-tabuas',custo:{tabuas:4,pregos:4},hp:320,hw:0.6,hd:0.12,solid:true,etapa:1},
  tabuasJanela:{nome:'Tábuas na janela',icon:'i-tabuas',custo:{tabuas:3,pregos:3},hp:220,hw:0.7,hd:0.1,solid:true,etapa:1}});
OBRA_ORDEM.push('cama','tabuasPorta','tabuasJanela');
const OBRAS_PREDIO=['tabuasPorta','tabuasJanela','barricada','muro','bau','lamparina','cama'];
const OBRAS_TELHADO=['plataforma','prancha','barricada','muro','bau','lamparina','cama','fogueira'];
/* onde o jogador está para construir: em cima de plataforma, telhado/sacada, dentro de prédio ou metrô, galho alto, ou chão */
function contextoObra(){const s=supEm(P.x,P.z,P.y,0.25);if(s&&s.dono&&s.dono.tipo==='plataforma')return'alto';
  const z=salaEm(P.x,P.y+0.3,P.z);if(z)return z.tipo==='telhado'||z.tipo==='sacada'?'telhado':'predio';
  return P.y-ground(P.x,P.z)>1.2?'alto':'chao';}
/* porta ou janela mais perto no mesmo andar, para encaixar as tábuas */
function alvoAbertura(tipo){const f=lookDir(P.yaw,0),ax=P.x+f[0]*1.2,az=P.z+f[2]*1.2;let best=null,bd=2.6*2.6;
  const L=tipo==='porta'?CID.portas:CID.janelas;for(const d of L){if(Math.abs(d.y-P.y)>1.2||d.tipo==='elevador')continue;const q=d2(d.x,d.z,ax,az);if(q<bd){bd=q;best=d;}}
  if(!best)return{x:P.x+f[0]*1.6,z:P.z+f[2]*1.6,y:P.y,yaw:P.yaw,ok:false,motivo:tipo==='porta'?'Chegue perto de uma porta':'Chegue perto de uma janela'};
  const yaw=tipo==='porta'?best.yaw:best.yaw+Math.PI/2,r={x:best.x,z:best.z,y:best.y,yaw,ext:tipo==='porta'?{porta:best.id}:{janela:best.id}};
  if(OB.some(o=>(tipo==='porta'?o.ext&&o.ext.porta===best.id:o.ext&&o.ext.janela===best.id)))return Object.assign(r,{ok:false,motivo:'Já está pregada'});
  if(tipo==='porta'&&best.estado==='quebrada'&&best.larg>1.3)return Object.assign(r,{ok:false,motivo:'Vão largo demais: use barricada'});
  if(tipo==='porta'&&Math.hypot(P.x-best.x,P.z-best.z)<0.5)return Object.assign(r,{ok:false,motivo:'Saia do vão da porta'});
  return Object.assign(r,{ok:true});}
function dormirAqui(o){G.cama={x:o.x,y:o.y,z:o.z,id:o.id};salvarJogo();P.vida=Math.min(vidaMax(),P.vida+5);toast('corpo','Jogo salvo. Se cair, você acorda neste colchão.');sfx('pegar');}
