/* ================= Telas de entrada (versão 10): login por perfil, Jogar sozinho com vários mundos e personagem do perfil =================
   Login ("Quem vai jogar?"): cada pessoa tem o seu perfil neste computador, só com o nome (sem senha), e nele ficam o
   personagem e os mundos. Quando o jogo for para a Steam, o perfil vira a conta Steam.
   Menu do perfil: Continuar (o último mundo), Jogar sozinho, Multiplayer (em breve: ainda não funciona), Personagem,
   Ajustes, Conquistas e recordes, Salvamentos, Como jogar (e Sair do jogo, no PC).
   Jogar sozinho: os mundos do perfil, cada um uma partida separada (o mapa é o mesmo; o dia, a base e as coisas são de
   cada mundo). Criar, jogar, renomear, cópias e apagar, com o dia, o nível e o tempo jogado.
   Personagem: a aparência fica no perfil. Mundo novo começa com ela (dá para ajustar antes de começar, e o ajuste volta
   para o perfil); depois de começar, fica fixa naquele mundo. Perfil novo monta o personagem logo depois do nome.
   Saves: cada mundo tem a sua chave (saveChaves, 48w_save). O primeiro mundo usa nnc_jogo_v1, a chave de antes dos
   perfis: quem já jogava vira o perfil 1 com o "Mundo 1" e continua de onde parou.
   Testes (#teste): entra sozinho no perfil "Teste", com o "Mundo 1" em nnc_jogo_v1 (como antes). Com #teste-login, mostra o login. */
const PF_TESTE=location.hash.startsWith('#teste');   // o TESTE de 70_main ainda não existe quando este arquivo roda
const PF_KEY='vaydr_perfis_v1',PF_SEM='vaydr_sem_mundo',PF_MUNDOS_MAX=10,PF_MAX=8,PF_SUF=['','_bak','_dia','_danificado'];
const pfId=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const pfNome=(t,n)=>String(t==null?'':t).replace(/[<>&"]/g,'').replace(/\s+/g,' ').trim().slice(0,n||20);
const pfEsc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function pfPerfilObj(nome){return{id:pfId('p'),nome,criado:Date.now(),usado:Date.now(),ap:null,mundos:[],ultimoMundo:null};}
function pfMundoObj(nome,chave){return{id:pfId('m'),nome,chave,criado:Date.now(),usado:Date.now(),dia:1,nivel:1,tempo:0};}
/* primeira vez nesta versão: o jogo que já existia vira o perfil 1 com o Mundo 1 */
function pfMigrar(){const R={v:1,ultimo:null,lista:[]};
  const leg=['nnc_jogo_v1','nnc_jogo_v1_bak','nnc_jogo_v1_dia'].map(saveLer).find(s=>s&&!saveValido(s));
  if(leg){const ap=leg.aparencia&&typeof leg.aparencia==='object'?aparLimpa(leg.aparencia):null;
    const p=pfPerfilObj(pfNome((ap&&ap.nome)||store.get('nnc_nome'))||'Sobrevivente');p.ap=ap;
    const m=pfMundoObj('Mundo 1','nnc_jogo_v1');m.dia=fin(leg.dia)?leg.dia:1;m.nivel=leg.prog&&fin(leg.prog.nivel)?leg.prog.nivel:1;m.usado=m.criado=fin(leg.salvoEm)?leg.salvoEm:Date.now();
    p.mundos.push(m);p.ultimoMundo=m.id;R.lista.push(p);R.ultimo=p.id;}
  return R;}
const pfValido=o=>!!o&&o.v===1&&Array.isArray(o.lista)&&o.lista.every(p=>p&&typeof p.id==='string'&&typeof p.nome==='string'&&Array.isArray(p.mundos)&&
  p.mundos.every(m=>m&&typeof m.id==='string'&&typeof m.chave==='string'&&typeof m.nome==='string'));
let PERFIS=store.get(PF_KEY);if(!pfValido(PERFIS)){PERFIS=pfMigrar();store.set(PF_KEY,PERFIS);}
let PERFIL=null,MUNDO=null,PF_CRIA=null;   // perfil e mundo em uso; PF_CRIA: a tela do personagem foi aberta para 'mundo', 'perfil' ou 'primeiro'
function pfGravar(){if(!store.set(PF_KEY,PERFIS))console.warn('perfis: não deu para gravar');}
const pfAchar=id=>PERFIS.lista.find(p=>p.id===id)||null;
const pfTemSave=m=>['','_bak','_dia'].some(s=>{const x=saveLer(m.chave+s);return!!x&&!saveValido(x);});
/* o perfil e o mundo seguem num recarregamento da página (o vídeo reiniciou, por exemplo) */
function pfSessao(){try{if(PERFIL)sessionStorage.setItem('vaydr_sessao',JSON.stringify({p:PERFIL.id,m:MUNDO?MUNDO.id:null}));else sessionStorage.removeItem('vaydr_sessao');}catch(_){}}
function pfUsarMundo(m){MUNDO=m||null;saveChaves(m?m.chave:PF_SEM);if(PERFIL&&m)PERFIL.ultimoMundo=m.id;pfSessao();}
function pfEntrar(p){PERFIL=p;p.usado=Date.now();PERFIS.ultimo=p.id;pfUsarMundo(p.mundos.find(m=>m.id===p.ultimoMundo)||p.mundos[0]||null);pfGravar();}
function pfSair(){PERFIL=null;pfUsarMundo(null);}
/* chave de um mundo novo: nnc_jogo_v1 se estiver livre e vazia; se não, uma só dele */
function pfChaveNova(){const usadas=new Set();for(const p of PERFIS.lista)for(const m of p.mundos)usadas.add(m.chave);
  const vazia=k=>!['','_bak','_dia'].some(s=>{try{return!!localStorage.getItem(k+s);}catch(_){return false;}});
  if(!usadas.has('nnc_jogo_v1')&&vazia('nnc_jogo_v1'))return'nnc_jogo_v1';
  let k;do{k='vaydr_mundo_'+pfId('');}while(usadas.has(k));return k;}
function pfApagarMundo(m){for(const s of PF_SUF)store.del(m.chave+s);PERFIL.mundos=PERFIL.mundos.filter(x=>x!==m);
  if(PERFIL.ultimoMundo===m.id)PERFIL.ultimoMundo=PERFIL.mundos[0]?PERFIL.mundos[0].id:null;if(MUNDO===m)pfUsarMundo(PERFIL.mundos[0]||null);pfGravar();}
function pfApagarPerfil(p){for(const m of p.mundos)for(const s of PF_SUF)store.del(m.chave+s);PERFIS.lista=PERFIS.lista.filter(x=>x!==p);
  if(PERFIS.ultimo===p.id)PERFIS.ultimo=PERFIS.lista[0]?PERFIS.lista[0].id:null;if(PERFIL===p)pfSair();pfGravar();}
function pfProxNome(){const usados=new Set(PERFIL?PERFIL.mundos.filter(pfTemSave).map(m=>m.nome):[]);let n=usados.size+1;while(usados.has('Mundo '+n))n++;return'Mundo '+n;}   // o 2º mundo é Mundo 2, mesmo se o 1º tiver outro nome
function pfAutoTeste(){if(PERFIL)return;let p=pfAchar(PERFIS.ultimo)||PERFIS.lista[0];if(!p){p=pfPerfilObj('Teste');PERFIS.lista.push(p);}
  if(!p.mundos.length){const m=pfMundoObj('Mundo 1',pfChaveNova());p.mundos.push(m);p.ultimoMundo=m.id;}pfEntrar(p);}
/* começo: volta a sessão desta aba; nos testes, entra sozinho; no jogo, espera o login */
{let s=null;try{s=JSON.parse(sessionStorage.getItem('vaydr_sessao')||'null');}catch(_){}
 const p=s&&pfAchar(s.p);if(p){PERFIL=p;pfUsarMundo(p.mundos.find(m=>m.id===s.m)||null);}else saveChaves(PF_SEM);
 if(PF_TESTE&&!location.hash.includes('login'))pfAutoTeste();}
/* o save gravado atualiza o mundo (dia, nível, quando) e o tempo jogado */
{const _g=gravarSave;gravarSave=function(s){const r=_g.apply(this,arguments);
  if(r&&MUNDO&&s){MUNDO.dia=fin(s.dia)?s.dia:MUNDO.dia;MUNDO.nivel=s.prog&&fin(s.prog.nivel)?s.prog.nivel:MUNDO.nivel;MUNDO.usado=Date.now();if(PERFIL)PERFIL.usado=MUNDO.usado;pfGravar();}return r;};}
let pfT=performance.now();
HUDS.push(function pfTempoJogado(){const t=performance.now(),d=Math.min(1,(t-pfT)/1000);pfT=t;if(MUNDO&&G.modo==='jogo')MUNDO.tempo=(MUNDO.tempo||0)+d;});
const pfTempo=s=>{s=Math.round(s||0);if(s<60)return'menos de 1 min';const h=Math.floor(s/3600),mi=Math.floor(s%3600/60);return h?h+' h '+String(mi).padStart(2,'0')+' min':mi+' min';};
const pfQuando=ms=>new Date(ms).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
function pfAvatar(p){const ap=aparLimpa(p&&p.ap||APAR_PADRAO);try{return criaCabeloSvg(ap,ap.cabelo);}catch(_){return'';}}
function pfEspacoTexto(){let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=k.length+(localStorage.getItem(k)||'').length;}}catch(_){}
  const mb=n*2/1048576;return'Espaço usado pelo jogo neste aparelho: '+(mb<0.1?'menos de 0,1':mb.toFixed(1).replace('.',','))+' MB'+(mb>4?'. Está ficando cheio: apague os mundos que você não usa mais.':'');}

/* ---------- visual das telas novas ---------- */
{const st=document.createElement('style');st.textContent=`
.lg-caixa{display:grid;gap:12px;width:min(420px,100%);justify-self:center;padding:18px;border-radius:14px;background:rgba(10,14,12,.72);border:1px solid var(--edge);
  box-shadow:0 18px 50px var(--shadow);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);text-align:left}
.lg-t{margin:0;font:700 26px/1 var(--f-display);letter-spacing:.1em;text-transform:uppercase;color:var(--bone);text-align:center}
.lg-sub{margin:0!important;font:600 14px/1.4 var(--f-ui)!important;letter-spacing:0!important;text-transform:none!important;color:var(--ash);text-align:center}
.lg-lista{display:grid;gap:8px;max-height:min(46vh,330px);overflow-y:auto}
.lg-perfil{appearance:none;display:flex;align-items:center;gap:12px;width:100%;padding:8px 12px 8px 8px;border-radius:11px;border:1px solid var(--edge);
  background:rgba(255,255,255,.04);color:var(--bone);text-align:left;cursor:pointer;font:inherit}
.lg-perfil:hover,.lg-perfil:focus-visible{border-color:var(--ember);background:rgba(194,85,29,.16);outline:none}
.lg-av{flex:none;width:46px;height:46px;border-radius:10px;overflow:hidden;background:#1a1f22;border:1px solid var(--edge)}
.lg-av svg{display:block;width:100%;height:100%}
.lg-i{display:grid;gap:3px;min-width:0;flex:1}.lg-i b{font:800 17px/1.1 var(--f-ui);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lg-i small{font:600 13px/1.2 var(--f-ui);color:var(--ash);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lg-ent{flex:none;font:800 12px/1 var(--f-ui);letter-spacing:.12em;text-transform:uppercase;color:var(--ember)}
.lg-novo{display:grid;gap:8px}.lg-novo label{font:800 12px/1 var(--f-ui);letter-spacing:.12em;text-transform:uppercase;color:var(--ash)}
.lg-novo input,.sz-ren,.aj-pf-nome{width:100%;min-width:0;padding:11px 12px;border-radius:9px;border:1px solid var(--edge-hi);background:rgba(0,0,0,.3);color:var(--bone);font:700 16px/1 var(--f-ui)}
.lg-novo input:focus,.sz-ren:focus,.aj-pf-nome:focus{outline:2px solid var(--ember);outline-offset:1px}
.lg-bts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lg-bts .btn{width:100%}.lg-bts .btn[hidden]{display:none}.lg-bts:has(#lg-cancelar[hidden]){grid-template-columns:1fr}
.lg-msg{margin:0!important;min-height:1em;font:600 13px/1.3 var(--f-ui)!important;letter-spacing:0!important;text-transform:none!important;color:#ffb08a!important;text-align:center}
#lg-mais{width:100%}
.m-perfil{display:flex;align-items:center;gap:10px;width:min(320px,100%);justify-self:center;padding:6px 8px;border-radius:12px;background:rgba(10,14,12,.55);border:1px solid var(--edge);text-align:left}
.m-perfil .lg-av{width:38px;height:38px;border-radius:9px}
.m-pn{display:grid;gap:2px;min-width:0;flex:1}.m-pn small{font:800 10.5px/1 var(--f-ui);letter-spacing:.16em;text-transform:uppercase;color:var(--ash)}
.m-pn b{font:800 16px/1.1 var(--f-ui);color:var(--bone);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m-trocar{appearance:none;flex:none;padding:7px 11px;border-radius:8px;border:1px solid var(--edge-hi);background:transparent;color:var(--bone);font:800 12.5px/1 var(--f-ui);cursor:pointer}
.m-trocar:hover,.m-trocar:focus-visible{border-color:var(--ember);color:#fff}
#m-continuar{flex-direction:column;gap:2px;line-height:1.1}#m-continuar small{font:600 12px/1 var(--f-ui);opacity:.82}
#m-multi small{font:700 11px/1 var(--f-ui);letter-spacing:.08em;text-transform:uppercase;opacity:.9;margin-left:2px}
.m-sec{display:grid;grid-template-columns:1fr 1fr;gap:8px}.menu-col .m-sec .btn{min-height:40px;font-size:14px;padding:0 10px}.m-sec .btn[hidden]{display:none}
.sz{width:min(620px,100%)}.sz-topo{display:grid;gap:6px}.sz-topo p b{color:var(--bone)}
.sz-lista{list-style:none;margin:0;padding:0;display:grid;gap:8px;max-height:min(50vh,420px);overflow-y:auto}
.sz-m{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px 12px;border-radius:11px;border:1px solid var(--edge);background:rgba(255,255,255,.035)}
.sz-m.atual{border-color:rgba(255,138,61,.55)}
.sz-i{display:grid;gap:3px;min-width:0;flex:1 1 200px}.sz-i b{font:800 17px/1.15 var(--f-ui);color:var(--bone);overflow-wrap:anywhere}.sz-i small{font:600 13px/1.25 var(--f-ui);color:var(--ash)}
.sz-bts{display:flex;flex-wrap:wrap;gap:6px}.cartao .sz-bts .btn{width:auto;min-height:36px;padding:0 12px;font-size:13.5px}
.cartao .sz-bts .sz-apagar.sim{background:rgba(227,73,62,.22);border-color:var(--blood);color:var(--blood-ink)}
.sz-vazio{padding:14px;border-radius:11px;border:1px dashed var(--edge-hi);color:var(--ash);font:600 14px/1.4 var(--f-ui);text-align:center}
.cartao .sz-msg{min-height:1em;font-size:13.5px;color:#f2d36b}.cartao .sz-espaco{font-size:12.5px;color:var(--dim)}
.cr-mundo{display:grid;gap:6px;font:800 12px/1 var(--f-ui);letter-spacing:.12em;text-transform:uppercase;color:var(--ash)}.cr-mundo[hidden]{display:none}
.cr-mundo input{padding:10px 12px;border-radius:9px;border:1px solid var(--edge-hi);background:rgba(0,0,0,.3);color:var(--bone);font:700 15px/1 var(--f-ui);letter-spacing:0;text-transform:none}`;
 document.head.appendChild(st);}

/* ---------- login: "Quem vai jogar?" ---------- */
$('t-menu').insertAdjacentHTML('afterend',`<div class="tela clara" id="t-login" hidden><div class="titulo">
  <h1 class="logo"><span>Sobreviver é construir</span>VAYDR</h1>
  <section class="lg-caixa" aria-labelledby="lg-t"><h2 class="lg-t" id="lg-t">Quem vai jogar?</h2><p class="lg-sub" id="lg-sub"></p>
    <div class="lg-lista" id="lg-lista" role="list"></div>
    <form class="lg-novo" id="lg-novo" hidden autocomplete="off"><label for="lg-nome">Nome do perfil</label>
      <input id="lg-nome" maxlength="20" placeholder="Seu nome ou apelido" spellcheck="false">
      <div class="lg-bts"><button type="button" class="btn" id="lg-cancelar">Cancelar</button><button type="submit" class="btn prim" id="lg-criar">Criar perfil</button></div></form>
    <p class="lg-msg" id="lg-msg" role="status"></p>
    <button class="btn" id="lg-mais" type="button">Novo perfil</button></section>
  <span class="versao" id="lg-versao"></span></div></div>
<div class="tela" id="t-sozinho" hidden><div class="cartao sz">
  <header class="sz-topo"><h2>Jogar sozinho</h2><p>Os mundos de <b id="sz-perfil"></b>. Cada mundo é uma partida separada, com o seu dia, a sua base e as suas coisas.</p></header>
  <ul class="sz-lista" id="sz-lista"></ul><div id="sz-acoes"></div><p class="sz-msg" id="sz-msg" role="status"></p><p class="sz-espaco" id="sz-espaco"></p>
  <button class="btn" id="sz-voltar" type="button">Voltar</button></div></div>`);
TELAS.push('t-login','t-sozinho');
function pfLoginRender(){const lista=PERFIS.lista.slice().sort((a,b)=>(b.usado||0)-(a.usado||0));
  $('lg-lista').innerHTML=lista.map(p=>{const m=p.mundos.find(x=>x.id===p.ultimoMundo)||p.mundos[0];
    return'<button type="button" class="lg-perfil" role="listitem" data-id="'+p.id+'"><span class="lg-av">'+pfAvatar(p)+'</span><span class="lg-i"><b>'+pfEsc(p.nome)+'</b><small>'+
      (m?pfEsc(m.nome)+' · dia '+m.dia+(p.mundos.length>1?' · '+p.mundos.length+' mundos':''):'Nenhum mundo ainda')+'</small></span><span class="lg-ent">Entrar</span></button>';}).join('');
  $('lg-sub').textContent=lista.length?'Escolha o seu perfil. Cada perfil tem o seu personagem e os seus mundos.':'Crie o seu perfil para começar. Ele guarda o seu personagem e os seus mundos neste computador.';
  if(!lista.length)pfLoginNovo(true);else $('lg-mais').hidden=!$('lg-novo').hidden||lista.length>=PF_MAX;}
function pfLoginNovo(on){$('lg-novo').hidden=!on;$('lg-mais').hidden=on||PERFIS.lista.length>=PF_MAX;$('lg-cancelar').hidden=!PERFIS.lista.length;$('lg-msg').textContent='';
  if(on){$('lg-nome').value='';setTimeout(()=>$('lg-nome').focus(),30);}}
function pfMostrarLogin(){G.modo='menu';tela('t-login');hudEl.classList.add('oculto');$('lg-novo').hidden=true;$('lg-msg').textContent='';pfLoginRender();
  const v=document.querySelector('#t-menu .versao');$('lg-versao').textContent=v&&v.firstChild?String(v.firstChild.textContent).trim():'';}
$('lg-lista').addEventListener('click',e=>{const b=e.target.closest('[data-id]'),p=b&&pfAchar(b.dataset.id);if(!p)return;sfx('clique');try{audioInit();}catch(_){}pfEntrar(p);mostrarMenu();});
$('lg-mais').addEventListener('click',()=>{sfx('clique');pfLoginNovo(true);});
$('lg-cancelar').addEventListener('click',()=>{sfx('clique');pfLoginNovo(false);});
$('lg-novo').addEventListener('submit',e=>{e.preventDefault();const nome=pfNome($('lg-nome').value),msg=t=>{$('lg-msg').textContent=t;};
  if(!nome)return msg('Escreva um nome para o perfil.');
  if(PERFIS.lista.some(p=>p.nome.toLowerCase()===nome.toLowerCase()))return msg('Já existe um perfil com esse nome.');
  if(PERFIS.lista.length>=PF_MAX)return msg('Este computador já tem '+PF_MAX+' perfis. Apague um em Ajustes, Conta e perfil.');
  const p=pfPerfilObj(nome);PERFIS.lista.push(p);pfEntrar(p);sfx('clique');try{audioInit();}catch(_){}
  pfAbrirPersonagem('primeiro');});   // perfil novo: o personagem vem logo depois do nome

/* ---------- menu do perfil ---------- */
{const col=document.querySelector('#t-menu .menu-col'),novo=$('m-novo');
 col.insertAdjacentHTML('beforebegin','<div class="m-perfil" id="m-perfil"><span class="lg-av" id="m-perfil-av"></span><span class="m-pn"><small>Perfil</small><b id="m-perfil-n"></b></span><button type="button" class="m-trocar" id="m-trocar">Trocar</button></div>');
 const mk=(id,html)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.id=id;b.innerHTML=html;return b;};
 const multi=mk('m-multi','Multiplayer <small>em breve</small>');multi.disabled=true;multi.title='O multiplayer ainda não funciona: ele vem na próxima etapa.';
 col.insertBefore(mk('m-sozinho','Jogar sozinho'),novo);col.insertBefore(multi,novo);
 // os botões de apoio ficam em duas colunas, para o menu caber em telas baixas
 const sec=document.createElement('div');sec.className='m-sec';col.insertBefore(sec,novo);sec.append(mk('m-personagem','Personagem'));
 for(const id of['m-ajustes','m-criativo','m-conq','m-salvo','m-ajuda','m-sair']){const b=$(id);if(b)sec.append(b);}
 // "Novo jogo" vira "Novo mundo" dentro de Jogar sozinho, sem os ouvintes antigos (que confirmavam e apagavam o save)
 const nv=novo.cloneNode(true);novo.remove();nv.textContent='Novo mundo';nv.classList.add('prim');$('sz-acoes').append(nv);}
{const _mm=mostrarMenu;mostrarMenu=function(){
  if(!PERFIL){if(PF_TESTE&&!location.hash.includes('login'))pfAutoTeste();else{pfMostrarLogin();return;}}
  const r=_mm.apply(this,arguments);pfMenuAtualiza();return r;};}
function pfMenuAtualiza(){if(!PERFIL)return;$('m-perfil-n').textContent=PERFIL.nome;$('m-perfil-av').innerHTML=pfAvatar(PERFIL);
  const c=$('m-continuar'),tem=!c.hidden&&MUNDO;c.innerHTML=tem?'Continuar<small>'+pfEsc(MUNDO.nome)+' · dia '+MUNDO.dia+'</small>':'Continuar';
  $('m-sozinho').classList.toggle('prim',!tem);}
$('m-trocar').addEventListener('click',()=>{sfx('clique');pfSair();pfMostrarLogin();});
$('m-sozinho').addEventListener('click',()=>{sfx('clique');pfAbrirSozinho();});
$('m-personagem').addEventListener('click',()=>{sfx('clique');try{audioInit();}catch(_){}pfAbrirPersonagem('perfil');});
{const _t=tela;tela=function(id){const r=_t.apply(this,arguments);if(id==='t-sozinho')pfSoloRender();else if(id==='t-menu'&&PERFIL)pfMenuAtualiza();return r;};}

/* ---------- Jogar sozinho: os mundos do perfil ---------- */
let szConfirma=null,szRenomeia=null;
function pfAbrirSozinho(){szConfirma=szRenomeia=null;$('sz-msg').textContent='';G.modo='menu';tela('t-sozinho');}
function pfSoloRender(){if(!PERFIL)return;$('sz-perfil').textContent=PERFIL.nome;
  const L=PERFIL.mundos.slice().sort((a,b)=>(b.usado||0)-(a.usado||0));
  $('sz-lista').innerHTML=L.length?L.map(m=>{const tem=pfTemSave(m),ren=szRenomeia===m.id;
    return'<li class="sz-m'+(MUNDO===m?' atual':'')+'" data-id="'+m.id+'"><span class="sz-i">'+
      (ren?'<input class="sz-ren" id="sz-ren" maxlength="24" aria-label="Nome do mundo" value="'+pfEsc(m.nome)+'">':'<b>'+pfEsc(m.nome)+'</b>')+
      '<small>'+(tem?'Dia '+m.dia+' · nível '+m.nivel+' · '+pfTempo(m.tempo)+' jogado'+(m.usado?' · '+pfQuando(m.usado):''):'Sem jogo salvo')+'</small></span><span class="sz-bts">'+
      (ren?'<button type="button" class="btn prim" data-a="ren-ok">Salvar nome</button><button type="button" class="btn" data-a="ren-x">Cancelar</button>':
        (tem?'<button type="button" class="btn prim" data-a="jogar">Jogar</button>':'')+'<button type="button" class="btn" data-a="renomear">Renomear</button>'+
        (tem?'<button type="button" class="btn" data-a="copias">Cópias</button>':'')+
        '<button type="button" class="btn sz-apagar'+(szConfirma===m.id?' sim':'')+'" data-a="apagar">'+(szConfirma===m.id?'Toque de novo para apagar':'Apagar')+'</button>')+'</span></li>';}).join(''):
    '<li class="sz-vazio">Você ainda não tem mundos. Toque em "Novo mundo" para começar o primeiro.</li>';
  const cheio=PERFIL.mundos.length>=PF_MUNDOS_MAX&&PERFIL.mundos.every(pfTemSave),nv=$('m-novo');nv.disabled=cheio;nv.classList.add('prim');
  nv.title=cheio?'Este perfil já tem '+PF_MUNDOS_MAX+' mundos. Apague um para criar outro.':'';
  $('sz-espaco').textContent=pfEspacoTexto();if(szRenomeia){const i=$('sz-ren');if(i){i.focus();i.select();}}}
$('sz-lista').addEventListener('click',e=>{const b=e.target.closest('[data-a]'),li=b&&b.closest('[data-id]'),m=li&&PERFIL&&PERFIL.mundos.find(x=>x.id===li.dataset.id);if(!m)return;
  sfx('clique');const a=b.dataset.a;if(a!=='apagar')szConfirma=null;$('sz-msg').textContent='';
  if(a==='jogar'){pfUsarMundo(m);pfGravar();try{audioInit();}catch(_){}if(carregarJogo())jogar();else{$('sz-msg').textContent='Não deu para abrir este mundo. Veja as cópias dele em "Cópias".';pfSoloRender();}return;}
  if(a==='renomear'){szRenomeia=m.id;pfSoloRender();return;}
  if(a==='ren-x'){szRenomeia=null;pfSoloRender();return;}
  if(a==='ren-ok'){const n=pfNome($('sz-ren').value,24);if(n)m.nome=n;szRenomeia=null;pfGravar();pfSoloRender();return;}
  if(a==='copias'){pfUsarMundo(m);pfGravar();abrirSalvamento('t-sozinho');return;}
  if(a==='apagar'){if(szConfirma!==m.id){szConfirma=m.id;pfSoloRender();return;}szConfirma=null;pfApagarMundo(m);$('sz-msg').textContent='O mundo "'+m.nome+'" foi apagado.';pfSoloRender();}});
$('sz-lista').addEventListener('keydown',e=>{if(e.target.id!=='sz-ren')return;e.stopPropagation();
  if(e.key==='Enter'){e.preventDefault();const b=document.querySelector('#sz-lista [data-a="ren-ok"]');if(b)b.click();}else if(e.key==='Escape'){e.preventDefault();szRenomeia=null;pfSoloRender();}});
$('sz-voltar').addEventListener('click',()=>{sfx('clique');szConfirma=szRenomeia=null;mostrarMenu();});
$('m-novo').addEventListener('click',()=>{try{audioInit();}catch(_){}if(!PERFIL||$('m-novo').disabled)return;sfx('clique');pfAbrirPersonagem('mundo');});

/* ---------- personagem do perfil (a mesma tela da criação, em três jeitos) ---------- */
$('cr-m-sim').insertAdjacentHTML('beforebegin','<label class="cr-mundo" id="cr-mundo-l" hidden><span>Nome do mundo</span><input id="cr-mundo" maxlength="24" autocomplete="off" spellcheck="false"></label>');
const PF_CR_TXT={
  mundo:{tit:'Criação de personagem',sub:'O seu sobrevivente para este mundo novo. O que você ajustar aqui também fica no seu perfil.',ok:'Confirmar e iniciar',
    info:'Esta aparência fica no seu perfil. Depois de começar, ela fica fixa neste mundo; roupas e equipamentos continuam trocáveis.'},
  perfil:{tit:'Seu personagem',sub:'A aparência do seu perfil: vale para os mundos novos e para o multiplayer.',ok:'Salvar personagem',
    info:'Os mundos que já começaram continuam com a aparência de quando começaram.'},
  primeiro:{tit:'Seu personagem',sub:'Monte o seu sobrevivente. Ele vale para todos os seus mundos e para o multiplayer.',ok:'Salvar e continuar',
    info:'Dá para mudar depois em Personagem, no menu. Os mundos que já começaram ficam como estão.'}};
function pfAbrirPersonagem(modo){PF_CRIA=modo;const ap=aparLimpa(PERFIL&&PERFIL.ap||APAR_PADRAO);if(!ap.nome&&PERFIL)ap.nome=PERFIL.nome;CRIA.ap=ap;
  abrirCriacao(false);pfCriaTextos();}
function pfCriaTextos(){const t=PF_CR_TXT[PF_CRIA]||PF_CR_TXT.mundo,q=s=>document.querySelector(s);
  const h=q('#t-criacao .cr-tit h2'),p=q('#t-criacao .cr-tit p'),ok=$('cr-confirmar'),inf=q('#t-criacao .cr-lado .cr-info span');
  if(h)h.textContent=t.tit;if(p)p.textContent=t.sub;if(ok&&ok.firstChild&&ok.firstChild.nodeType===3)ok.firstChild.textContent=t.ok;if(inf)inf.textContent=t.info;
  $('cr-mundo-l').hidden=PF_CRIA!=='mundo';if(PF_CRIA==='mundo')$('cr-mundo').value=pfProxNome();}
function pfSalvarAparencia(){if(!PERFIL)return;PERFIL.ap=aparLimpa(Object.assign({},CRIA.ap,{nome:$('cr-nome').value}));pfGravar();}
{const _cc=criaConfirmar;criaConfirmar=function(){
  if(PF_CRIA==='perfil'||PF_CRIA==='primeiro'){pfSalvarAparencia();PF_CRIA=null;sairCriacao();return;}   // só guarda no perfil e volta ao menu
  return _cc.apply(this,arguments);};}
{const _sc=sairCriacao;sairCriacao=function(){const era=PF_CRIA;PF_CRIA=null;const r=_sc.apply(this,arguments);if(era==='mundo'&&PERFIL)pfAbrirSozinho();return r;};}
{const _cm=criaComecar;criaComecar=function(){
  if(PERFIL&&PF_CRIA!=='perfil'&&PF_CRIA!=='primeiro'){   // mundo novo (também o caminho dos testes: Novo mundo e começar direto)
    pfSalvarAparencia();const nome=pfNome($('cr-mundo').value,24)||pfProxNome();
    let m=PERFIL.mundos.find(x=>!pfTemSave(x));   // um mundo sem jogo salvo é reaproveitado
    if(m){Object.assign(m,{nome,criado:Date.now(),usado:Date.now(),dia:1,nivel:1,tempo:0});}else{m=pfMundoObj(nome,pfChaveNova());PERFIL.mundos.push(m);}
    pfUsarMundo(m);pfGravar();}
  PF_CRIA=null;const r=_cm.apply(this,arguments);
  if(MUNDO&&G.modo==='jogo')salvarJogo();   // o mundo novo já nasce salvo (aparece em Jogar sozinho mesmo se o jogo fechar)
  return r;};}

/* ---------- Lobby: fica em 62t_lobby.js (quatro painéis: Jogar sozinho, Multiplayer, Personagem e Configurações) ---------- */
