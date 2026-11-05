/* ================= Etapa 23: preparação para multijogador — só arquitetura =================
   O jogo continua sendo de um jogador: não há rede, servidor, sala, conta nem chat funcionando, e nada aqui manda ou recebe
   dados. Isto só organiza o estado para que, no futuro, ele possa ser sincronizado sem reescrever o jogo:
   · REDE_CFG: os limites que o modo multijogador teria (sala privada com código, até 4 jogadores, chats geral e mercado...).
   · Escopo de cada parte do salvamento: "mundo" (compartilhado por todos da sala: tempo, clima, construções, contêineres, zumbis,
     bichos, veículos, regiões, territórios, eventos, missão principal) ou "jogador" (de cada um: posição, vida, inventário,
     roupas, ferimentos, sono, nível e habilidades, diário, conquistas, aparência). "fixo": versão do salvamento.
   · estadoMundo() e estadoJogador(): o salvamento separado nas duas partes; juntarEstado() monta de volta (é exatamente o
     salvamento de sempre). Um servidor guardaria o mundo, e cada jogador a sua parte.
   · uids: identificador estável para tudo o que um dia vai ser sincronizado (zumbis, bichos, construções, veículos, cavalos,
     itens no chão, contêineres e portas), dado na hora em que alguém pergunta (REDE.uid).
   · Fila de ações: as ações que mudam o mundo (construir, revistar, usar porta, interagir) ficam registradas como comandos
     {tipo, alvo, x, z, t}. Num jogo em rede seriam essas as mensagens para o servidor; aqui só fica a lista das últimas 200.
   · JOGADORES: a lista de jogadores da sessão, com você (local) em primeiro; nome, grupo, clã e território são só campos.
   · Mundo sem ninguém conectado: o que já anda pelo tempo (plantação, bichos que repovoam, contêineres que voltam a ter coisa,
     zumbis guardados das regiões, desafios que recomeçam) é o que um servidor rodaria para "alcançar" o tempo que passou. */
const REDE_CFG=Object.freeze({versao:1,ativo:false,maxJogadores:4,salaPrivada:true,codigoLetras:6,chats:['geral','mercado'],
  futuro:['salas privadas com código de acesso','até 4 jogadores por sala','nomes de jogadores','grupos e clãs','territórios e guerras por território',
    'comércio entre jogadores','chat geral e chat do mercado','máquina de troca na base','mundo andando sem ninguém conectado']});
/* modelo de dados de uma sala (só a forma; nada cria salas) */
const REDE_SALA_MODELO=Object.freeze({codigo:'',privada:true,max:REDE_CFG.maxJogadores,jogadores:[],grupos:[],clas:[],mercado:{ofertas:[]},chat:{geral:[],mercado:[]},criadaEm:0});
/* escopo de cada chave do salvamento (as de fora e as dos módulos, em x8) */
const REDE_ESCOPO={
  fixo:new Set(['v','mv','sv','salvoEm']),
  jogador:new Set(['P','mochila','prog','cama','dicas','mapaAlvo','kills','mortes',
    'aparencia','roupas','lesoes','sono','diario','conquistas','guia','gaviao','peixes']),
  mundo:new Set(['dia','hora','noiteN','noite','final','m','ev','ondas','chuva','tm','caixas','mapaCid','obras','arvores','rochas','arbustos','inter','carro','cao','fab','cid','sob','x8',
    'aereo','cavalos','clima','criacao','cxm','dsf','pds','energia','esporos','fauna','ferrovia','historia','mundo','plantio','pomar','porto','rastros','reboques','regioes','rurais','subsolo','territorios','veiculos','zumbis2','e12']),
  /* partes que misturam as duas coisas e um dia precisam ser divididas (por enquanto vão com o mundo) */
  misto:{e12:'estudos da oficina (de cada jogador) junto com os móveis desmontados das casas (do mundo)',fab:'nível da bancada (da base) junto com o registro do que você fabricou'}};
function escopoDe(k){return REDE_ESCOPO.fixo.has(k)?'fixo':REDE_ESCOPO.jogador.has(k)?'jogador':REDE_ESCOPO.mundo.has(k)?'mundo':null;}
/* o salvamento separado em mundo e jogador (cópias; não mexe no jogo) */
function separarEstado(s){const mundo={},jog={},fixo={};for(const k in s){if(k==='x8')continue;const e=escopoDe(k)||'mundo';(e==='jogador'?jog:e==='fixo'?fixo:mundo)[k]=s[k];}
  const x8=s.x8||{};mundo.x8={};jog.x8={};for(const k in x8)((escopoDe(k)==='jogador')?jog.x8:mundo.x8)[k]=x8[k];
  return{fixo,mundo,jogador:jog};}
const copiaJSON=o=>JSON.parse(JSON.stringify(o));
function estadoMundo(){const p=separarEstado(serializar());return Object.assign({versao:REDE_CFG.versao},copiaJSON(Object.assign({},p.fixo,p.mundo)));}
function estadoJogador(id){const p=separarEstado(serializar());return Object.assign({versao:REDE_CFG.versao,jogador:id||REDE.local},copiaJSON(p.jogador));}
/* junta de volta: dá o salvamento de sempre (o carregamento normal aceita) */
function juntarEstado(m,j){const s={};for(const k in m){if(k==='versao'||k==='x8')continue;s[k]=m[k];}for(const k in j){if(k==='versao'||k==='jogador'||k==='x8')continue;s[k]=j[k];}
  s.x8=Object.assign({},m.x8||{},j.x8||{});return s;}
/* ---------- ids estáveis para sincronizar ---------- */
const REDE={local:'j1',seq:0,acoes:[],maxAcoes:200,
  uid(o,tipo){if(!o)return null;if(!o.uid)o.uid=tipo+':'+(o.id!==undefined&&tipo!=='z'&&tipo!=='b'?o.id:++REDE.seq);return o.uid;}};
function entidadesSync(){const L=[],put=(lista,tipo,f)=>{for(const o of lista||[]){if(f&&!f(o))continue;L.push([REDE.uid(o,tipo),tipo]);}};
  put(Z,'z',z=>z.vivo);put(BICHOS,'b',b=>b.vivo);put(OB,'ob');put(typeof VEICS!=='undefined'?VEICS:[],'v');put(typeof CAVALOS!=='undefined'?CAVALOS:[],'cav');
  put(DROPS,'chao');put(CID.conts,'cont');put(CID.portas,'porta');return L;}
/* ---------- jogadores da sessão (só o local, no jogo de um jogador) ---------- */
const JOGADORES=[{id:'j1',local:true,nome:'Você',grupo:null,cla:null,territorio:null,get ref(){return P;}}];
function jogadorLocal(){return JOGADORES[0];}
/* ---------- fila de ações que mudam o mundo (comandos que um dia iriam para o servidor) ---------- */
function redeAcao(tipo,alvo,x,z,extra){const a={tipo,alvo:alvo||null,x:x!==undefined?Math.round(x*100)/100:null,z:z!==undefined?Math.round(z*100)/100:null,t:Math.round((G.tm||0)*10)/10,j:REDE.local};
  if(extra)a.d=extra;REDE.acoes.push(a);if(REDE.acoes.length>REDE.maxAcoes)REDE.acoes.shift();return a;}
{const _co=colocarObra;colocarObra=function(){const n0=OB.length,r=_co.apply(this,arguments);if(OB.length>n0){const o=OB[OB.length-1];redeAcao('construir',REDE.uid(o,'ob'),o.x,o.z,{tipo:o.tipo});}return r;};}
{const _ac=abrirCont;abrirCont=function(c){if(c)redeAcao('revistar',REDE.uid(c,'cont'),c.x,c.z);return _ac.apply(this,arguments);};}
{const _pu=portaUsar;portaUsar=function(d){const e0=d&&d.estado,r=_pu.apply(this,arguments);if(d&&d.estado!==e0)redeAcao('porta',REDE.uid(d,'porta'),d.x,d.z,{de:e0,para:d.estado});return r;};}
{const _in=interagir;interagir=function(seg){const a=alvoInter,r=_in.apply(this,arguments);
  if(a&&a.k==='inter'&&a.o)redeAcao('interagir',a.o.id,a.o.x,a.o.z,{kind:a.o.kind});return r;};}
V8.novo.rede=()=>{REDE.acoes.length=0;};
