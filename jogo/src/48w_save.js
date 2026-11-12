/* ================= salvamento seguro: conferência, cópias, recuperação e cópia em arquivo =================
   Toda vez que o jogo salva, o save novo é conferido antes de gravar (posição, dia, inventário, números válidos). Se algo
   estiver errado, o save bom que já existe não é trocado por um quebrado. A gravação anterior vira a "cópia anterior" e,
   quando o dia vira, fica guardada a "cópia do começo do dia". Ao abrir o jogo, se o save principal estiver danificado
   (não abre, faltam partes, valores impossíveis), o jogo usa a cópia anterior e depois a do começo do dia, e avisa.
   Itens e construções que não existem mais nesta versão saem sem travar o carregamento (migração).
   Caiu e o jogo foi salvo com você caído? Ao continuar, você acorda na clareira (ou na sua cama) e a mochila segue onde caiu.
   Tela "Salvamento": mostra as cópias, volta para uma delas, baixa o jogo como arquivo e abre um jogo de um arquivo
   (para guardar fora do aparelho ou levar para outro). */
let SAVE_BAK,SAVE_DIA,SAVE_RUIM,SAVE_FONTES;const SAVE_SV=2;
/* cada mundo tem a sua chave (62q_perfis); o primeiro mundo continua em nnc_jogo_v1, o save de antes dos perfis */
function saveChaves(k){SAVE_KEY=k;SAVE_BAK=k+'_bak';SAVE_DIA=k+'_dia';SAVE_RUIM=k+'_danificado';SAVE_FONTES=[[SAVE_KEY,'principal'],[SAVE_BAK,'anterior'],[SAVE_DIA,'do começo do dia']];}
saveChaves(SAVE_KEY);
const fin=v=>typeof v==='number'&&isFinite(v);
function saveValido(s){if(!s||typeof s!=='object'||Array.isArray(s))return'não é um jogo salvo';if(s.v!==1)return'versão desconhecida';
  if(!fin(s.dia)||s.dia<1)return'dia inválido';if(!fin(s.hora))return'hora inválida';
  if(!s.P||typeof s.P!=='object')return'sem os dados do personagem';if(!fin(s.P.x)||!fin(s.P.z)||Math.abs(s.P.x)>5000||Math.abs(s.P.z)>5000)return'posição inválida';
  if(!Array.isArray(s.P.inv))return'sem inventário';if(!s.m||typeof s.m!=='object')return'sem a missão';
  if(s.obras!==undefined&&!Array.isArray(s.obras))return'construções danificadas';return'';}
/* migração e limpeza: itens que sumiram desta versão viram espaço vazio, pilhas voltam ao máximo, números ruins viram padrão */
function saveMigrar(s){const lim=q=>{if(!q||typeof q!=='object'||!ITEMS[q.id]||!(q.n>0))return null;q.n=Math.min(Math.floor(q.n)||1,ITEMS[q.id].max||99);if(q.dur!==undefined&&!fin(q.dur))delete q.dur;return q;};
  s.P.inv=s.P.inv.map(lim);if(s.mochila&&Array.isArray(s.mochila.itens)){s.mochila.itens=s.mochila.itens.map(lim).filter(Boolean);if(!s.mochila.itens.length||!fin(s.mochila.x))s.mochila=null;}else s.mochila=null;
  if(Array.isArray(s.obras))s.obras=s.obras.filter(o=>Array.isArray(o)&&OBRAS[o[0]]&&fin(o[1])&&fin(o[2])).map(o=>{if(!fin(o[3]))o[3]=0;if(Array.isArray(o[6]))o[6]=o[6].map(lim);return o;});
  for(const k of['vida','fome','sede','energia'])s.P[k]=fin(s.P[k])?clamp(s.P[k],0,100):(k==='vida'?65:60);
  if(!fin(s.P.y))delete s.P.y;if(!fin(s.P.yaw))s.P.yaw=0;if(!fin(s.tm))delete s.tm;s.hora=((s.hora%24)+24)%24;
  s.sv=SAVE_SV;return s;}
function saveLer(k){try{const t=localStorage.getItem(k);return t?JSON.parse(t):null;}catch(_){return null;}}
function fontesSave(){const R=[];for(const[k,nome]of SAVE_FONTES){let t=null;try{t=localStorage.getItem(k);}catch(_){}if(!t)continue;let s=null;try{s=JSON.parse(t);}catch(_){}
    const m=saveValido(s);if(m){if(k===SAVE_KEY){try{localStorage.setItem(SAVE_RUIM,t);}catch(_){}}continue;}R.push({k,nome,s});}return R;}
/* gravar: confere, guarda a anterior e só então troca */
let saveErroT=0;
function gravarSave(s){const m=saveValido(s);if(m){saveFalhou(m);return false;}let txt;try{s.sv=SAVE_SV;s.salvoEm=Date.now();txt=JSON.stringify(s);JSON.parse(txt);}catch(e){console.error(e);saveFalhou('não deu para montar o save');return false;}
  try{const ant=localStorage.getItem(SAVE_KEY);if(ant&&ant!==txt){let a=null;try{a=JSON.parse(ant);}catch(_){}if(!saveValido(a))localStorage.setItem(SAVE_BAK,ant);}}catch(_){}
  try{localStorage.setItem(SAVE_KEY,txt);}catch(e){// sem espaço: abre mão da cópia do começo do dia e tenta de novo
    try{localStorage.removeItem(SAVE_DIA);localStorage.removeItem(SAVE_RUIM);localStorage.setItem(SAVE_KEY,txt);}catch(e2){saveFalhou('sem espaço neste aparelho');return false;}}
  G.salvoEm=s.salvoEm;return true;}
function saveFalhou(m){console.warn('salvamento recusado: '+m);if(G.t-saveErroT<60)return;saveErroT=G.t;if(typeof toast==='function'&&(G.modo==='jogo'||G.modo==='pausa'))toast('alerta','Não deu para salvar agora ('+m+'). O último jogo salvo continua guardado.');}
/* virada do dia: guarda o save da noite como cópia do começo do dia (o jogo salva de novo logo depois) */
AMANHECE.push(()=>{try{const t=localStorage.getItem(SAVE_KEY);if(t)localStorage.setItem(SAVE_DIA,t);}catch(_){}});
/* carregar: a primeira fonte boa que abrir sem erro */
function carregarJogo(){for(const f of fontesSave()){try{carregarSave(saveMigrar(f.s));saveAvisoFonte(f);return true;}catch(e){console.error('carregar ('+f.nome+')',e);
    if(f.k===SAVE_KEY){try{localStorage.setItem(SAVE_RUIM,localStorage.getItem(SAVE_KEY));}catch(_){}}}}
  resetMundo();return false;}
function temSave(){return fontesSave().length>0;}
/* há algo gravado, mas nada abre (o menu avisa em vez de mostrar "Continuar") */
function saveDanificado(){for(const[k]of SAVE_FONTES){try{if(localStorage.getItem(k))return true;}catch(_){}}return false;}
function apagarSaves(){for(const[k]of SAVE_FONTES)store.del(k);}
let saveAviso=null;
function saveAvisoFonte(f){saveAviso=f.k===SAVE_KEY?null:'O último salvamento estava danificado. O jogo abriu a cópia '+f.nome+(f.s.dia?' (dia '+f.s.dia+')':'')+'.';
  if(saveAviso)setTimeout(()=>{if(saveAviso&&G.modo==='jogo'){toast('alerta',saveAviso);saveAviso=null;}},1800);}
/* caiu e salvou caído: acorda na clareira (ou na cama), a mochila fica onde caiu */
function saveDepoisDeCarregar(s){if(!(s.P.vida>0)){renascer();feed('Você acordou na clareira. A mochila ficou onde você caiu.');}}
/* ---------- cópia em arquivo ---------- */
async function saveBaixar(){if(G.modo==='jogo'||G.modo==='pausa')salvarJogo();let t=null;try{t=localStorage.getItem(SAVE_KEY);}catch(_){}
  if(!t){saveMsg('Ainda não há jogo salvo para baixar.',true);return false;}
  const s=JSON.parse(t),blob=new Blob([t],{type:'application/json'}),nome='vaydr-jogo-dia'+(s.dia||1)+'-'+new Date().toISOString().slice(0,10)+'.json';let ok=false;
  try{const dl=window.claude&&typeof claude.use==='function'?await claude.use('downloads'):null;if(dl){await dl.save({filename:nome,data:blob});ok=true;}}catch(e){if(e&&e.code==='declined'){saveMsg('Cópia cancelada.');return false;}}
  if(!ok){try{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nome;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},4000);ok=true;}catch(_){}}
  saveMsg(ok?'Cópia salva: '+nome:'Não deu para baixar a cópia neste aparelho.',!ok);window.__saveBaixado=ok?t:null;return ok;}
let saveArquivo=null;
function saveAbrirTexto(txt){let s=null;try{s=JSON.parse(txt);}catch(_){}const m=saveValido(s);if(m){saveMsg('Esse arquivo não é um jogo do VAYDR que dê para abrir ('+m+').',true);saveArquivo=null;saveRender();return false;}
  saveArquivo=s;saveMsg('Arquivo pronto: dia '+s.dia+'. Toque em "Abrir este jogo" para trocar.');saveRender();return true;}
function saveUsar(s,origem){try{const ant=localStorage.getItem(SAVE_KEY);if(ant)localStorage.setItem(SAVE_BAK,ant);localStorage.setItem(SAVE_KEY,JSON.stringify(s));}catch(_){saveMsg('Não deu para gravar neste aparelho (sem espaço?).',true);return false;}
  if(!carregarJogo()){saveMsg('Não deu para abrir esse jogo.',true);return false;}jogar();setTimeout(()=>toast('corpo','Jogo aberto: '+origem+' (dia '+G.dia+').'),600);return true;}
/* ---------- tela ---------- */
let saveVolta='t-pausa',saveConfirma=null;
function abrirSalvamento(volta){saveVolta=volta||(G.modo==='menu'?'t-menu':'t-pausa');saveConfirma=null;saveArquivo=null;saveMsg('');tela('t-salvo');saveRender();}
function saveMsg(t,ruim){const el=$('sv-msg');if(!el)return;el.textContent=t||'';el.classList.toggle('ruim',!!ruim);}
function saveRender(){const el=$('sv-lista');if(!el)return;const quando=ms=>ms?new Date(ms).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';let h='';
  for(const[k,nome]of SAVE_FONTES){let t=null;try{t=localStorage.getItem(k);}catch(_){}let s=null;try{s=t?JSON.parse(t):null;}catch(_){}const m=t?saveValido(s):'vazia';
    const tit=k===SAVE_KEY?'Jogo salvo (principal)':'Cópia '+nome;
    h+='<li class="'+(m?'':'ok')+'">'+svgUse(m?'i-alerta':'i-disquete')+'<span><b>'+tit+'</b><small>'+(m?(t?'danificada: '+m:'ainda não existe'):'dia '+s.dia+' · '+String(Math.floor(s.hora)).padStart(2,'0')+'h'+(s.salvoEm?' · salvo em '+quando(s.salvoEm):''))+'</small></span>'+
      (!m&&k!==SAVE_KEY?'<button type="button" class="btn" data-copia="'+k+'">'+(saveConfirma===k?'Toque de novo: voltar':'Voltar para esta')+'</button>':'')+'</li>';}
  if(saveArquivo)h+='<li class="ok">'+svgUse('i-mochila')+'<span><b>Jogo do arquivo</b><small>dia '+saveArquivo.dia+(saveArquivo.salvoEm?' · salvo em '+quando(saveArquivo.salvoEm):'')+'</small></span><button type="button" class="btn prim" data-copia="arquivo">'+(saveConfirma==='arquivo'?'Toque de novo: abrir':'Abrir este jogo')+'</button></li>';
  el.innerHTML=h;}
iconesNovos({'i-disquete':'<path d="M5 3h11l3 3v15H5zM8 3v6h7V3M8 21v-7h8v7"/>'});
TELAS_NOVAS.push('t-salvo');
{const L=$('sv-lista');if(L)L.addEventListener('click',e=>{const b=e.target.closest('[data-copia]');if(!b)return;const k=b.dataset.copia;sfx('clique');
    if(saveConfirma!==k){saveConfirma=k;saveRender();return;}saveConfirma=null;
    if(k==='arquivo'){if(saveArquivo)saveUsar(saveArquivo,'do arquivo');return;}const s=saveLer(k);if(!s||saveValido(s)){saveMsg('Essa cópia não abre mais.',true);saveRender();return;}saveUsar(s,'cópia '+SAVE_FONTES.find(f=>f[0]===k)[1]);});
 const ba=$('sv-baixar');if(ba)ba.addEventListener('click',()=>{sfx('clique');saveBaixar();});
 const inp=$('sv-arquivo'),ab=$('sv-abrir');if(ab&&inp){ab.addEventListener('click',()=>{sfx('clique');inp.value='';inp.click();});
   inp.addEventListener('change',()=>{const f=inp.files&&inp.files[0];if(!f)return;if(f.size>20e6){saveMsg('Arquivo grande demais para ser um jogo salvo.',true);return;}const r=new FileReader();r.onload=()=>saveAbrirTexto(String(r.result));r.onerror=()=>saveMsg('Não deu para ler o arquivo.',true);r.readAsText(f);});}
 const v=$('sv-voltar');if(v)v.addEventListener('click',()=>{sfx('clique');if(saveVolta==='t-menu')mostrarMenu();else tela(saveVolta);});
 const p=$('p-salvo');if(p)p.addEventListener('click',()=>abrirSalvamento('t-pausa'));const mm=$('m-salvo');if(mm)mm.addEventListener('click',()=>abrirSalvamento('t-menu'));}
