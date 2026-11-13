/* ================= sons gravados (v10.1) =================
   Os efeitos mais ouvidos usam gravações de verdade (licença CC0, ver 45b_sons_dados.js): passos na grama, no asfalto e
   na água, golpe no ar, golpe acertando, machado na madeira, picareta na pedra, madeira e vidro quebrando, martelo, galho
   estalando, zumbi gemendo, atacando, morrendo e rugindo, dor do jogador, pistola, espingarda, rifle, explosão, arma sem
   bala, recarga, cachorro, uivo, tosse, trovão, baú e pegar item.
   Cada som tem várias gravações; nunca toca a mesma duas vezes seguidas e cada vez sai com o tom um pouco diferente.
   O caminho do som é o mesmo de antes (volume, distância, lado esquerdo/direito e eco). Enquanto as gravações carregam, ou
   se alguma falhar, toca o som feito por código de antes. */
const SGRAV={buf:{},pronto:false,carregando:false,ult:{}};
/* volume de cada grupo (ajustado medindo o jogo com tools/p246_som.py) */
const SGRAV_NIVEL={passo_grama:2.4,passo_asf:2.2,passo_agua:1.0,golpe:0.6,acerto:0.8,madeira:1.0,pedra:0.7,quebrar:1.1,vidro:0.7,construir:0.85,galho:1.8,
  gemido:0.32,ataqueZ:0.32,morteZ:0.34,rugido:0.95,dor:0.48,tiro:1.8,espingarda:1.0,rifle:1,explosao:1.2,vazio:0.3,recarga:0.75,latido:0.4,uivo:1,tosse:0.6,trovao:0.6,bau:0.38,pegar:0.5};
/* tom por tipo de zumbi: colosso e brutamontes mais graves, corredor e gritador mais agudos */
function sgravTomZ(ty){return ty==='colosso'?0.72:ty==='brute'?0.84:ty==='runner'?1.12:ty==='screamer'?1.2:1;}
/* qual gravação vale para cada efeito (null: continua o som por código) */
function sgravEscolha(nome,extra){
  switch(nome){
    case'passo':return extra==='agua'?{k:'passo_agua'}:extra==='asf'?{k:'passo_asf'}:extra==='terra'?{k:'passo_grama',r:0.86,g:1.1}:{k:'passo_grama'};
    case'golpe':case'acerto':case'pedra':case'quebrar':case'vidro':case'construir':case'galho':case'dor':case'vazio':case'recarga':case'tosse':case'bau':case'pegar':return{k:nome};
    case'madeira':return{k:'madeira'};
    case'gemido':return{k:'gemido',r:sgravTomZ(extra||'walker'),g:extra==='colosso'?1.2:1};
    case'ataqueZ':return{k:'ataqueZ',r:sgravTomZ(extra||'walker')};
    case'morteZ':return{k:'morteZ',r:sgravTomZ(extra||'walker')};
    case'rugido':return{k:'rugido',eco:0.6};
    case'tiro':return{k:'tiro',eco:0.5};
    case'espingarda':return{k:'espingarda',eco:0.6};
    case'rifle':return{k:'rifle',eco:0.7};
    case'explosao':return{k:'explosao',eco:0.9};
    case'latido':return{k:'latido'};
    case'uivo':return{k:'uivo',eco:0.8,longe:true};
    case'trovao':return{k:'trovao',eco:0.9,dl:extra||1};
  }
  return null;}
function sgravTocar(nome,extra,out,t,ctx,eco,pn){const e=sgravEscolha(nome,extra);if(!e)return false;const L=SGRAV.buf[e.k];if(!L||!L.length)return false;
  let i=Math.floor(Math.random()*L.length);if(L.length>1&&i===SGRAV.ult[e.k])i=(i+1)%L.length;SGRAV.ult[e.k]=i;
  const s=ctx.createBufferSource();s.buffer=L[i];s.playbackRate.value=(e.r||1)*(0.95+Math.random()*0.1);
  const g=ctx.createGain();g.gain.value=(e.g||1)*(SGRAV_NIVEL[e.k]??1);s.connect(g).connect(out);s.start(t+(e.dl||0));
  if(e.longe){if(pn)pn.pan.value=(Math.random()-0.5)*1.6;out.gain.value=Math.min(out.gain.value,0.3);}   // uivo: sempre de longe, de um lado
  if(e.eco)eco(e.eco);
  return true;}
/* carrega o banco quando o som do jogo nasce (precisa do AudioContext); não trava nada: decodifica em segundo plano */
/* a etapa "Sons" da tela de carregamento (13/11/2026) já tira os sons do texto (base64) para bytes; no primeiro clique
   (audioInit) só falta o navegador decodificar o áudio. Sem o preparo, a conversão é feita aqui, como antes */
function sgravBytes(uri){const bin=atob(uri.slice(uri.indexOf(',')+1)),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
function sgravPreparar(){if(SGRAV.pre||SGRAV.carregando||typeof SOM_DADOS==='undefined')return;const pre={};
  for(const k in SOM_DADOS)pre[k]=SOM_DADOS[k].map(uri=>{try{return sgravBytes(uri);}catch(_){return null;}});SGRAV.pre=pre;}
function sgravCarregar(){const ctx=AU.ctx;if(!ctx||SGRAV.carregando||typeof SOM_DADOS==='undefined')return;SGRAV.carregando=true;
  const tarefas=[],pre=SGRAV.pre;SGRAV.pre=null;
  for(const k in SOM_DADOS){SGRAV.buf[k]=[];SOM_DADOS[k].forEach((uri,j)=>tarefas.push(new Promise(fim=>{try{
    const u=(pre&&pre[k]&&pre[k][j])||sgravBytes(uri);
    let feito=false;const ok=b=>{if(feito)return;feito=true;SGRAV.buf[k].push(b);fim();},erro=()=>{if(feito)return;feito=true;fim();};
    const p=ctx.decodeAudioData(u.buffer,ok,erro);if(p&&p.then)p.then(ok,erro);}catch(_){fim();}})));}
  Promise.all(tarefas).then(()=>{SGRAV.pronto=true;});}
{const _ai=audioInit;audioInit=function(){_ai.apply(this,arguments);try{sgravCarregar();}catch(e){console.error('sons gravados',e);}};}
