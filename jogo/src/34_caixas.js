/* ================= caixas de saque na mata: três tipos, lugar que muda, conteúdo sorteado e reaparecimento salvo =================
   TUDO QUE DÁ PARA AJUSTAR FICA NESTE BLOCO (chances, quantidades, tempos, distâncias e limites por região). */
const CAIXA_CFG={
  nomes:{comum:'Caixa de madeira',suprimentos:'Caixa de suprimentos',escondida:'Caixa escondida'},
  // tempo de reaparecimento em MINUTOS DO RELÓGIO DO JOGO, contados a partir do momento em que a caixa fica vazia
  tempos:{comum:[45,90],suprimentos:[120,240],escondida:[360,720]},
  // quantos TIPOS de item cada caixa pode ter (mínimo, máximo) e a chance de vir vazia
  tipos:{comum:[0,2],suprimentos:[0,2],escondida:[0,3]},
  vazia:{comum:0.08,suprimentos:0.06,escondida:0.05},
  distAnterior:30,     // m: novo lugar longe do lugar anterior da mesma caixa
  distJogador:40,      // m: ao reaparecer, longe do jogador
  distEntreCaixas:22,  // m: entre duas caixas
  distTrocar:35,       // m: a caixa vazia só troca de lugar quando o jogador está pelo menos a essa distância dela
  verDist:{comum:80,suprimentos:80,escondida:26},     // m: até onde o modelo é desenhado (o estado continua valendo de longe)
  raioUsar:{comum:1.9,suprimentos:1.9,escondida:1.5},  // m: distância para interagir
  tempoAbrir:{comum:0.8,suprimentos:1.0,escondida:1.5},// s segurando E
  tentativas:48,       // tentativas de lugar por reaparecimento
  adiar:3,             // minutos do jogo até tentar de novo quando não acha lugar bom
  // regiões da mata em volta da clareira: fatia em graus (0 = norte, 90 = leste) e faixa de distância da clareira
  regioes:[
    {id:'norte',nome:'Mata Norte',a0:-50,a1:40,r0:28,r1:146,max:{comum:4,suprimentos:2,escondida:1}},
    {id:'leste',nome:'Mata Leste',a0:40,a1:130,r0:28,r1:146,max:{comum:3,suprimentos:2,escondida:1}},
    {id:'sul',nome:'Mata Sul',a0:130,a1:220,r0:28,r1:146,max:{comum:4,suprimentos:2,escondida:1}},
    {id:'oeste',nome:'Mata Oeste',a0:220,a1:310,r0:28,r1:146,max:{comum:4,suprimentos:2,escondida:1}}]};
/* tabelas de saque: [item do jogo, chance configurada, quantidade mínima, quantidade máxima]
   nomes da especificação → itens do jogo: Galhos = Gravetos · Pano rasgado = Tecido · Lata de comida / Comida enlatada = Lata de feijão
   Faca simples = Faca · Machado básico = Machado · Mochila pequena = Mochila improvisada · Ferramenta básica = Picareta
   Mochila melhorada = Mochila reforçada · Arma branca melhorada = Facão · Receita de fabricação = Folha de receita
   Mapa de local secreto = Mapa rabiscado · Peça rara de veículo = Peça de motor */
const CAIXA_LOOT={
  comum:[['graveto',.40,1,3],['madeira',.30,1,2],['pedra',.28,1,3],['fibra',.25,1,3],['pano',.18,1,2],['corda',.10,1,1],['sucata',.08,1,2],['garrafa',.08,1,1],['feijao',.06,1,1],['bandagem',.04,1,1],['faca',.015,1,1],['isqueiro',.01,1,1]],
  suprimentos:[['pano',.30,1,2],['sucata',.25,1,2],['fita',.18,1,1],['corda',.15,1,1],['feijao',.14,1,1],['agua',.12,1,1],['bandagem',.10,1,1],['pilhas',.09,1,2],['filtro',.05,1,1],['lanterna',.04,1,1],['machado',.02,1,1],['mochila',.015,1,1]],
  escondida:[['sucata',.25,1,3],['fita',.20,1,2],['bandagem',.18,1,2],['feijao',.15,1,2],['agua',.12,1,1],['pilhas',.12,1,3],['picareta',.08,1,1],['mochilaRef',.04,1,1],['facao',.03,1,1],['receita',.025,1,1],['mapaSecreto',.01,1,1],['pecaVeiculo',.005,1,1]]};

/* ---- sorteio do conteúdo ----
   Amostragem sistemática ponderada: com a ordem dos itens embaralhada, um único número u em [0,1) e os pontos u, u+1, u+2...
   pegam os itens cujos intervalos acumulados contêm algum ponto. Cada item entra com probabilidade exatamente igual à sua chance
   (quando a soma das chances cabe no limite de tipos) e a caixa recebe floor(soma) ou ceil(soma) tipos — nunca passa do limite.
   Se a soma das chances passar do limite de tipos, todas são reduzidas na mesma proporção (fator = limite/soma).
   Chance efetiva = chance configurada × fator × (1 − chance de vir vazia). Veja chancesEfetivas(). */
function sortearConteudo(cat,R){R=R||Math.random;const tab=CAIXA_LOOT[cat],mx=CAIXA_CFG.tipos[cat][1];
  if(R()<CAIXA_CFG.vazia[cat])return[];
  let soma=0;for(const e of tab)soma+=e[1];const fator=soma>mx?mx/soma:1;
  const ord=tab.slice();for(let i=ord.length-1;i>0;i--){const j=Math.floor(R()*(i+1));const t=ord[i];ord[i]=ord[j];ord[j]=t;}
  const u=R(),out=[];let a=0;
  for(const e of ord){const b=a+e[1]*fator;if(Math.ceil(b-u)-Math.ceil(a-u)>=1&&out.length<mx)out.push(lootItem(e[0],randi(R,e[2],e[3]),R));a=b;}
  return out;}
function chancesEfetivas(cat){const tab=CAIXA_LOOT[cat],mx=CAIXA_CFG.tipos[cat][1],v=CAIXA_CFG.vazia[cat];let soma=0;for(const e of tab)soma+=e[1];const f=soma>mx?mx/soma:1;
  return{fator:f,vazia:v,mediaTipos:+(soma*f*(1-v)).toFixed(3),itens:tab.map(e=>[e[0],e[1],+(e[1]*f*(1-v)).toFixed(4)])};}

/* ---- estado lógico (salvo) separado do desenho ---- */
const CAIXAS=[];let caixaAcc=0;
const caixaRegiao=id=>CAIXA_CFG.regioes.find(r=>r.id===id);
function dentroRegiao(reg,x,z){const r=Math.hypot(x,z);if(r<reg.r0||r>reg.r1)return false;let a=Math.atan2(x,-z)*180/Math.PI;while(a<reg.a0)a+=360;while(a>=reg.a0+360)a-=360;return a<reg.a1;}
function pontoNaRegiao(reg,R){const a=(reg.a0+(reg.a1-reg.a0)*R())*Math.PI/180,r=Math.sqrt(reg.r0*reg.r0+(reg.r1*reg.r1-reg.r0*reg.r0)*R());return[Math.sin(a)*r,-Math.cos(a)*r];}
/* checagens só na hora de escolher o lugar (nunca a cada quadro) */
function lugarCaixaValido(c,x,z,longeDoJogador){
  if(Math.hypot(x,z)>MAP_R-6||Math.hypot(x-FIRE[0],z-FIRE[2])<24)return false;
  if(mata(x,z)<(c.cat==='escondida'?0.9:0.8))return false;                 // dentro da mata
  if(!freeSpot(x,z,1.4))return false;                                        // fora de lugares e estradas; longe de troncos, rochas e paredes
  const g=ground(x,z);for(const[dx,dz]of[[0.7,0],[-0.7,0],[0,0.7],[0,-0.7]])if(Math.abs(ground(x+dx,z+dz)-g)>0.3)return false; // chão sem barranco
  for(const b of BUSHES)if((b.x-x)**2+(b.z-z)**2<2.6)return false;
  for(const p of PICKS)if(p.alive&&(p.x-x)**2+(p.z-z)**2<0.7)return false;
  for(const o of OB)if((o.x-x)**2+(o.z-z)**2<9)return false;
  for(const s of SINISTROS)if((s.x-x)**2+(s.z-z)**2<4)return false;
  if(c.ant&&Math.hypot(x-c.ant[0],z-c.ant[1])<CAIXA_CFG.distAnterior)return false;
  for(const o of CAIXAS)if(o!==c&&o.x!==undefined&&o.estado!=='espera'&&Math.hypot(o.x-x,o.z-z)<CAIXA_CFG.distEntreCaixas)return false;
  if(longeDoJogador&&Math.hypot(x-P.x,z-P.z)<CAIXA_CFG.distJogador)return false;
  return true;}
function acharLugar(c,longeDoJogador,R){R=R||Math.random;const reg=caixaRegiao(c.reg);
  const sins=c.cat==='escondida'?SINISTROS.filter(s=>dentroRegiao(reg,s.x,s.z)):null;   // as escondidas gostam de lugares sinistros
  for(let t=0;t<CAIXA_CFG.tentativas;t++){let x,z;
    if(sins&&sins.length&&R()<0.5){const s=sins[Math.floor(R()*sins.length)],a=R()*6.283,d=4+R()*5;x=s.x+Math.cos(a)*d;z=s.z+Math.sin(a)*d;if(!dentroRegiao(reg,x,z))continue;}
    else[x,z]=pontoNaRegiao(reg,R);
    if(lugarCaixaValido(c,x,z,longeDoJogador))return[x,z];}
  return null;}
function encherCaixa(c,pos,R){R=R||Math.random;c.x=pos[0];c.z=pos[1];c.y=ground(c.x,c.z);c.yaw=R()*6.283;
  const it=sortearConteudo(c.cat,R),n=CAIXA_CFG.tipos[c.cat][1];c.itens=new Array(n).fill(null);it.forEach((e,i)=>{c.itens[i]=Object.assign(newItem(e[0],e[1]),e[2]||{});});
  c.estado='cheia';c.prox=0;}
function caixasConfig(){const out=[];for(const reg of CAIXA_CFG.regioes)for(const cat of['escondida','suprimentos','comum'])for(let i=0;i<(reg.max[cat]||0);i++)out.push({id:'cx-'+reg.id+'-'+cat+'-'+i,cat,reg:reg.id});return out;}
function caixasNovo(){CAIXAS.length=0;for(const k of caixasConfig()){const c=Object.assign(k,{estado:'espera',itens:[],prox:0,ant:null});CAIXAS.push(c);
    const p=acharLugar(c,false);if(p)encherCaixa(c,p);else c.prox=(G.tm||0)+CAIXA_CFG.adiar;}}
/* saves antigos não têm caixas: elas nascem agora. Caixas que mudaram na configuração são criadas ou descartadas sem mexer no resto */
function caixasCarregar(lista){if(!Array.isArray(lista)){caixasNovo();return;}CAIXAS.length=0;const salvas={};for(const s of lista)if(s&&s.id)salvas[s.id]=s;
  for(const k of caixasConfig()){const s=salvas[k.id],c=Object.assign(k,{estado:'espera',itens:[],prox:0,ant:null});CAIXAS.push(c);
    if(s&&(s.estado==='cheia'||s.estado==='saqueada'||s.estado==='espera')){c.estado=s.estado;c.prox=+s.prox||0;c.ant=Array.isArray(s.ant)?s.ant:null;
      if(typeof s.x==='number'&&typeof s.z==='number'&&c.estado!=='espera'){c.x=s.x;c.z=s.z;c.y=ground(c.x,c.z);c.yaw=+s.yaw||0;}else if(c.estado!=='espera'){c.estado='espera';}
      const n=CAIXA_CFG.tipos[c.cat][1];c.itens=new Array(n).fill(null);if(Array.isArray(s.itens))s.itens.slice(0,n).forEach((it,i)=>{if(it&&ITEMS[it.id]&&it.n>0)c.itens[i]=it;});
      const vaziaDeProposito=Array.isArray(s.itens)&&s.itens.length>0&&s.itens.every(q=>!q);   // caixa que já nasceu vazia (sorteio): continua igual
      if(c.estado==='cheia'&&!c.itens.some(Boolean)&&!vaziaDeProposito)caixaEsvaziou(c);   // save estranho: vazia sem tempo marcado ganha um tempo de espera normal
      if(c.estado==='saqueada'&&!(c.prox>0))caixaEsvaziou(Object.assign(c,{estado:'cheia'}));}
    else{const p=acharLugar(c,true);if(p)encherCaixa(c,p);else c.prox=(G.tm||0)+CAIXA_CFG.adiar;}}}
function caixasSalvar(){return CAIXAS.map(c=>({id:c.id,cat:c.cat,reg:c.reg,estado:c.estado,x:c.x===undefined?null:+c.x.toFixed(2),z:c.z===undefined?null:+c.z.toFixed(2),
  yaw:+(c.yaw||0).toFixed(2),itens:c.itens,prox:+(c.prox||0).toFixed(1),ant:c.ant?[+c.ant[0].toFixed(1),+c.ant[1].toFixed(1)]:null}));}
/* saque */
function caixaEsvaziou(c){if(c.estado!=='cheia')return;c.estado='saqueada';c.itens=c.itens.map(()=>null);const[a,b]=CAIXA_CFG.tempos[c.cat];c.prox=G.tm+a+Math.random()*(b-a);
  if(G.mapaAlvo===c.id)G.mapaAlvo=null;}
function abrirCaixaMata(c){if(c.estado!=='cheia'){feed('Vazia. Alguém já levou tudo',true);return;}
  if(!c.vista){c.vista=true;ganharXP(c.cat==='escondida'?14:c.cat==='suprimentos'?8:4);progresso('busca');}
  sfx('bau');barulho(P.x,P.z,5,true);
  if(!c.itens.some(Boolean)){caixaEsvaziou(c);feed('Estava vazia',true);return;}
  bauAberto={itens:c.itens,saque:true,caixa:c,nome:CAIXA_CFG.nomes[c.cat]};bauMsg='';abrirMochila('bau');}
function caixaConferir(c){if(c&&c.estado==='cheia'&&!c.itens.some(Boolean))caixaEsvaziou(c);}
/* reaparecimento: confere de tempos em tempos (não a cada quadro) */
function updateCaixas(dt){caixaAcc+=dt;if(caixaAcc<1)return;caixaAcc=0;if(G.tm===undefined)return;
  for(const c of CAIXAS){if(c.estado==='cheia'||G.tm<c.prox)continue;
    if(c.estado==='saqueada'&&c.x!==undefined&&Math.hypot(c.x-P.x,c.z-P.z)<CAIXA_CFG.distTrocar)continue;   // não some na frente do jogador
    const reg=caixaRegiao(c.reg),ativas=CAIXAS.filter(o=>o.reg===c.reg&&o.cat===c.cat&&o.estado==='cheia').length;
    if(!reg||ativas>=(reg.max[c.cat]||0)){c.prox=G.tm+CAIXA_CFG.adiar;continue;}
    if(c.x!==undefined)c.ant=[c.x,c.z];
    const p=acharLugar(c,true);
    if(!p){c.estado='espera';c.x=c.z=undefined;c.prox=G.tm+CAIXA_CFG.adiar;continue;}   // sem lugar bom: fica pendente e tenta depois
    encherCaixa(c,p);}}
function caixaEscondidaMaisPerto(){let best=null,bd=1e9;for(const c of CAIXAS)if(c.cat==='escondida'&&c.estado==='cheia'&&c.x!==undefined){const d=Math.hypot(c.x-P.x,c.z-P.z);if(d<bd){bd=d;best=c;}}return best;}

/* ---- itens novos que saem das caixas ---- */
const lanternaForte=()=>!!P.inv&&(P.bat||0)>0&&invCount('lanterna')>0;
function updateLanterna(dt){if(P.lanterna&&!CARRO.ativo&&(P.bat||0)>0&&invCount('lanterna')>0){P.bat=Math.max(0,P.bat-dt*0.28);if(P.bat<=0)feed('A pilha da lanterna acabou',true);}}
function custoObra(k){if(k==='fogueira'&&invCount('isqueiro')>0)return{graveto:6,pedra:4};return OBRAS[k].custo;}
function gastarUm(i){const s=P.inv[i];if(!s)return;s.n--;if(s.n<=0){P.inv[i]=null;if(P.sel===i)P.aim=0;}}
function ferramentaGasta(){const ok=s=>s&&ITEMS[s.id].durMax&&s.dur<ITEMS[s.id].durMax*0.97;const s0=selItem();if(ok(s0))return s0;let best=null;
  for(const s of P.inv)if(ok(s)&&(!best||s.dur/ITEMS[s.id].durMax<best.dur/ITEMS[best.id].durMax))best=s;return best;}
function usarUtil(i){const s=P.inv[i];if(!s)return;const d=ITEMS[s.id];
  switch(s.id){
    case'fita':{const t=ferramentaGasta();if(!t){feed('Nenhuma ferramenta gasta',true);return;}const D=ITEMS[t.id];t.dur=Math.min(D.durMax,t.dur+Math.round(D.durMax*0.35));gastarUm(i);sfx('construir');feed('Remendou: '+D.nome.toLowerCase());break;}
    case'pilhas':{if(!invCount('lanterna')){feed('Precisa da lanterna de mão',true);return;}if((P.bat||0)>=99){feed('A lanterna já está carregada',true);return;}P.bat=Math.min(100,(P.bat||0)+50);gastarUm(i);sfx('clique');feed('Pilhas trocadas: '+Math.round(P.bat)+'%');break;}
    case'filtro':{if(G.chuva<0.4){feed('Só dá para filtrar água da chuva',true);return;}const g=invCount('garrafa'),cn=cantisEncher(false);if(!g&&!cn){feed('Precisa de garrafas vazias ou de um cantil',true);return;}
      if(g){invRemove('garrafa',g);const l=invAdd('agua',g);if(l)soltarItens([['agua',l]],P.x,P.z,P.y);}sfx('pegar');feed('Encheu '+[g?g+(g>1?' garrafas':' garrafa'):'',cn?(cn>1?cn+' cantis':'o cantil'):''].filter(Boolean).join(' e ')+' com água da chuva');break;}
    case'receita':{const falta=Object.keys(MANUAIS).filter(k=>!G.fab.manuais[k]);gastarUm(i);if(falta.length)acharManual(falta[Math.floor(Math.random()*falta.length)]);else{ganharXP(40);feed('Você já conhecia essas receitas');}break;}
    case'mapaSecreto':{const c=caixaEscondidaMaisPerto();let ce=null,de=1e9;for(const q of CID.conts)if(q.oculto&&q.estado==='fechado'){const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<de){de=d;ce=q;}}
      gastarUm(i);if(ce&&(!c||de<Math.hypot(c.x-P.x,c.z-P.z))){G.mapaCid=ce.id;G.mapaAlvo=null;toast('corpo','O mapa marca um esconderijo no '+ce.p.nome+'. Siga o X na bússola: é atrás de um painel solto na parede.');break;}
      if(!c){feed('O X do mapa aponta um lugar já saqueado',true);break;}G.mapaAlvo=c.id;toast('corpo','O mapa marca uma caixa escondida. Siga o X na bússola.');break;}
    default:if(UTIL_ACOES[s.id]){if(UTIL_ACOES[s.id](i,s)===false)return;break;}feed(d.desc);}
  invRender();hudBarra();}
