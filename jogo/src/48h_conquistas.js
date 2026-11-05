/* ================= conquistas, recordes (placar) e modo foto =================
   conquistas: valem para todas as partidas deste aparelho; aparecem com aviso dourado quando você consegue.
   recordes: as 10 melhores partidas deste aparelho (noites sobrevividas, depois abates). Quando o jogo está publicado
     como artefato com placar online, dá para mandar o seu melhor recorde com um nome; os outros jogadores veem.
   modo foto: pausa tudo, esconde a tela de jogo e solta a câmera (arrastar gira, roda aproxima, WASD move),
     com filtros e hora do dia; a foto sai em PNG. */
const CONQ=[
  {id:'noite1',nome:'Primeira noite',desc:'Sobreviva a uma noite.',ev:'noiteSobrevivida',meta:1},
  {id:'noite5',nome:'Calejado',desc:'Sobreviva a 5 noites.',ev:'noiteSobrevivida',meta:5},
  {id:'noite15',nome:'Veterano da mata',desc:'Sobreviva a 15 noites.',ev:'noiteSobrevivida',meta:15},
  {id:'noiteLimpa',nome:'Intocável',desc:'Passe uma noite inteira sem cair.',ev:'noiteLimpa',meta:1},
  {id:'luaSangue',nome:'Lua de sangue',desc:'Sobreviva a uma noite de lua de sangue.'},
  {id:'kill100',nome:'Cem a menos',desc:'Derrube 100 zumbis.',ev:'kill',meta:100},
  {id:'kill500',nome:'Exterminador',desc:'Derrube 500 zumbis.',ev:'kill',meta:500},
  {id:'cabeca50',nome:'Mira certeira',desc:'Acerte 50 tiros na cabeça.',ev:'cabeca',meta:50},
  {id:'furtivo10',nome:'Sombra',desc:'Dê 10 golpes furtivos.',ev:'furtivo',meta:10},
  {id:'caramelo',nome:'Melhor amigo',desc:'Adote o Caramelo.'},
  {id:'resgate1',nome:'Ninguém fica para trás',desc:'Leve um sobrevivente para o acampamento.',ev:'sobrevBase',meta:1},
  {id:'grupo6',nome:'Família grande',desc:'Tenha 6 pessoas morando no acampamento.'},
  {id:'colheita',nome:'Mão na terra',desc:'Colha a horta.',ev:'colheita',meta:1},
  {id:'torre',nome:'Sentinela',desc:'Construa uma torre de vigia.',ev:'obraTorre',meta:1},
  {id:'gerador',nome:'Luz no fim da mata',desc:'Abasteça um gerador.',ev:'geradorLigou',meta:1},
  {id:'capacete',nome:'Sem capacete',desc:'Arranque o capacete de um policial zumbi.',ev:'capacete',meta:1},
  {id:'explosaoGas',nome:'Fogo no gás',desc:'Exploda a nuvem de um inchado.',ev:'explosaoGas',meta:1},
  {id:'bomba',nome:'Barulhento',desc:'Estoure uma bomba caseira.',ev:'bomba',meta:1},
  {id:'rifleDuplo',nome:'Dois de uma vez',desc:'Atravesse dois zumbis com um tiro de rifle.',ev:'rifleDuplo',meta:1},
  {id:'curouVirus',nome:'Por um triz',desc:'Cure o vírus com uma seringa.',ev:'curouVirus',meta:1},
  {id:'colosso',nome:'Gigante abatido',desc:'Derrube o Colosso da lua de sangue.'},
  {id:'chefe_acougueiro',nome:'Fim do expediente',desc:'Derrube o Açougueiro.'},
  {id:'chefe_sargento',nome:'Rendição',desc:'Derrube o Sargento.'},
  {id:'chefe_pacienteZero',nome:'Alta médica',desc:'Derrube o Paciente Zero.'},
  {id:'chefe_maquinista',nome:'Fim da linha',desc:'Derrube o Maquinista.'},
  {id:'chefe_fazendeiro',nome:'Colheita amarga',desc:'Derrube o Fazendeiro.'},
  {id:'todosChefes',nome:'Limpeza geral',desc:'Derrube todos os chefes de região.'},
  {id:'resgatado',nome:'Resgatados',desc:'Termine a história do rádio.'},
  {id:'vacina',nome:'A cura',desc:'Termine a história da vacina.'}];
const CQ=(()=>{const s=store.get('nnc_conq');return s&&typeof s==='object'?{f:s.f||{},c:s.c||{}}:{f:{},c:{}};})();
function conqSalvar(){store.set('nnc_conq',CQ);}
function conquista(id){const d=CONQ.find(c=>c.id===id);if(!d||CQ.f[id])return;CQ.f[id]=Date.now();conqSalvar();if(typeof diarioEvento==='function')diarioEvento('Conquista: '+d.nome,'missao');
  setTimeout(()=>{toast('conquista',d.nome+' · '+d.desc);sfx('nivel');},400);
  if(id.startsWith('chefe_')&&CONQ.filter(c=>c.id.startsWith('chefe_')).every(c=>CQ.f[c.id]))conquista('todosChefes');}
function conqEvento(ev,k){let mudou=false;for(const d of CONQ){if(d.ev!==ev)continue;mudou=true;}if(!mudou)return;
  CQ.c[ev]=(CQ.c[ev]||0)+(k||1);conqSalvar();for(const d of CONQ)if(d.ev===ev&&CQ.c[ev]>=d.meta)conquista(d.id);}
function conqAmanhece(){if(!G.noiteN)return;G.noitesSob=(G.noitesSob||0)+1;conqEvento('noiteSobrevivida',1);if(G.luaSangueVivo)conquista('luaSangue');G.luaSangueVivo=false;
  if(SOBREV.filter(s=>s.st==='base').length>=6)conquista('grupo6');salvarRecorde();}
/* ---------- recordes ---------- */
function recordeAtual(){return{id:G.runId||'x',noites:G.noitesSob||0,dias:G.dia||1,abates:G.kills||0,chefes:(G.chefesMortos||0)+(G.chefes||0),ts:Date.now()};}
function salvarRecorde(){const L=(store.get('nnc_recordes')||[]).filter(q=>q&&typeof q==='object');const r=recordeAtual();const i=L.findIndex(q=>q.id===r.id);if(i>=0)L[i]=r;else L.push(r);
  L.sort((a,b)=>b.noites-a.noites||b.abates-a.abates);store.set('nnc_recordes',L.slice(0,10));}
function melhorRecorde(){const L=store.get('nnc_recordes')||[];return L[0]||recordeAtual();}
/* placar online: só existe quando a página roda publicada com o banco de dados ligado */
let DBP=null,USERP=null,placarIniciado=false;
async function placarOnlineInit(){if(placarIniciado)return DBP;placarIniciado=true;if(!window.claude||typeof claude.use!=='function')return null;
  try{DBP=await claude.use('db');USERP=await claude.use('user');}catch(e){DBP=null;}return DBP;}
async function placarOnlineLer(){if(!DBP)return null;const s=await DBP.collection('placar').orderBy('noites','desc').limit(25).get();
  return s.docs.map(d=>d.data()).filter(Boolean).sort((a,b)=>(b.noites||0)-(a.noites||0)||(b.abates||0)-(a.abates||0));}
async function placarOnlineEnviar(nome){if(!DBP||!USERP)throw{code:'unavailable'};const id=await USERP.id();if(!id)throw{code:'sem_id'};const r=melhorRecorde();
  await DBP.doc('placar/'+id).set({nome:String(nome||'Sobrevivente').trim().slice(0,24)||'Sobrevivente',noites:r.noites|0,dias:r.dias|0,abates:r.abates|0,chefes:r.chefes|0,ts:Date.now()});}
/* ---------- tela de conquistas e recordes ---------- */
let conqAba='conq',conqVolta='t-menu';
function abrirConquistas(volta){conqVolta=volta||'t-menu';tela('t-conquistas');conqRender();placarOnlineInit().then(db=>{const b=$('cq-aba-online');if(b)b.hidden=!db;});}
function conqRender(){const el=$('cq-lista');if(!el)return;for(const b of document.querySelectorAll('#t-conquistas [data-aba]'))b.setAttribute('aria-pressed',String(b.dataset.aba===conqAba));
  const feitas=CONQ.filter(c=>CQ.f[c.id]).length;$('cq-resumo').textContent=feitas+' de '+CONQ.length+' conquistas';$('cq-online').hidden=conqAba!=='online';
  if(conqAba==='conq'){el.innerHTML=CONQ.map(c=>{const ok=!!CQ.f[c.id],p=c.meta>1&&!ok?' · '+Math.min(c.meta,CQ.c[c.ev]||0)+'/'+c.meta:'';
      return'<li class="cq'+(ok?' ok':'')+'">'+svgUse(ok?'i-trofeu':'i-cadeado')+'<div><b>'+c.nome+'</b><small>'+c.desc+p+'</small></div></li>';}).join('');return;}
  if(conqAba==='rec'){const L=store.get('nnc_recordes')||[];el.innerHTML=L.length?L.map((r,i)=>'<li class="rec"><span class="pos">'+(i+1)+'</span><div><b>'+r.noites+(r.noites===1?' noite':' noites')+'</b><small>'+r.abates+' zumbis · '+r.dias+(r.dias===1?' dia':' dias')+(r.chefes?' · '+r.chefes+(r.chefes===1?' chefe':' chefes'):'')+' · '+new Date(r.ts).toLocaleDateString('pt-BR')+'</small></div></li>').join(''):'<li class="vazio">Nenhuma partida ainda. Sobreviva a uma noite para entrar aqui.</li>';return;}
  el.innerHTML='<li class="vazio">Carregando o placar…</li>';placarOnlineLer().then(L=>{if(conqAba!=='online')return;
    el.innerHTML=L&&L.length?L.map((r,i)=>{const li=document.createElement('li');li.className='rec';li.innerHTML='<span class="pos">'+(i+1)+'</span><div><b></b><small></small></div>';li.querySelector('b').textContent=r.nome||'Sobrevivente';
      li.querySelector('small').textContent=(r.noites|0)+' noites · '+(r.abates|0)+' zumbis'+(r.chefes?' · '+r.chefes+' chefes':'');return li.outerHTML;}).join(''):'<li class="vazio">Ninguém no placar ainda. Seja o primeiro.</li>';})
    .catch(()=>{el.innerHTML='<li class="vazio">O placar online não abriu agora. Seus recordes continuam salvos neste aparelho.</li>';});}
/* ---------- modo foto ---------- */
const FOTO={on:false,yaw:0,pitch:0.18,dist:3.4,px:0,py:0,pz:0,filtro:0,esconde:false,hora0:null,hora:-1,drag:null};
const FILTROS=[['Normal','none'],['Preto e branco','grayscale(1) contrast(1.12)'],['Sépia','sepia(0.85) contrast(1.05)'],['Frio','saturate(0.85) hue-rotate(-14deg) brightness(1.03)'],['Quente','saturate(1.25) sepia(0.22) brightness(1.02)'],['Noir','grayscale(1) contrast(1.55) brightness(0.88)']];
const FOTO_HORAS=[['Agora',null],['Manhã',8.5],['Tarde',14],['Pôr do sol',18.1],['Noite',22.5]];
function fotoAbrir(){if(G.modo!=='jogo'&&G.modo!=='pausa')return;FOTO.on=true;FOTO.modo0=G.modo;G.modo='foto';tela('');hudEl.classList.add('oculto');document.body.classList.add('modo-foto');
  if(document.pointerLockElement)document.exitPointerLock();FOTO.yaw=P.yaw+Math.PI;FOTO.pitch=0.16;FOTO.dist=3.4;FOTO.px=FOTO.py=FOTO.pz=0;FOTO.hora0=G.hora;FOTO.hora=0;
  $('foto-ui').hidden=false;fotoUI();sfx('clique');}
function fotoFechar(){if(!FOTO.on)return;FOTO.on=false;if(FOTO.hora0!==null)G.hora=FOTO.hora0;FOTO.hora0=null;P.ch.vis=true;FOTO.esconde=false;canvas.style.filter='';document.body.classList.remove('modo-foto');
  $('foto-ui').hidden=true;hudEl.classList.remove('oculto');G.modo='pausa';tela('t-pausa');}
function fotoUI(){$('foto-filtro').textContent='Filtro: '+FILTROS[FOTO.filtro][0];$('foto-hora').textContent='Hora: '+FOTO_HORAS[FOTO.hora][0];$('foto-pers').textContent=FOTO.esconde?'Mostrar personagem':'Esconder personagem';
  canvas.style.filter=FILTROS[FOTO.filtro][1]==='none'?'':FILTROS[FOTO.filtro][1];}
function fotoCam(dt){const K=FOTO_TECLAS,sp=4*dt,c=Math.cos(FOTO.yaw),s=Math.sin(FOTO.yaw);
  if(K.KeyW){FOTO.px+=s*sp;FOTO.pz+=c*sp;}if(K.KeyS){FOTO.px-=s*sp;FOTO.pz-=c*sp;}if(K.KeyA){FOTO.px+=c*sp;FOTO.pz-=s*sp;}if(K.KeyD){FOTO.px-=c*sp;FOTO.pz+=s*sp;}
  if(K.KeyE||K.KeyR)FOTO.py+=sp;if(K.KeyQ||K.KeyF)FOTO.py-=sp;const L=Math.hypot(FOTO.px,FOTO.pz);if(L>14){FOTO.px*=14/L;FOTO.pz*=14/L;}FOTO.py=clamp(FOTO.py,-1,6);
  const h=FOTO_HORAS[FOTO.hora][1];if(h!==null)G.hora=h;else if(FOTO.hora0!==null)G.hora=FOTO.hora0;P.ch.vis=!FOTO.esconde;
  const piv=[P.x+FOTO.px,P.y+1.15+FOTO.py,P.z+FOTO.pz],cp=Math.cos(FOTO.pitch),d=[Math.sin(FOTO.yaw)*cp,Math.sin(FOTO.pitch),Math.cos(FOTO.yaw)*cp];
  let x=piv[0]-d[0]*FOTO.dist,y=piv[1]-d[1]*FOTO.dist,z=piv[2]-d[2]*FOTO.dist;const g=chaoEm(x,z,y)+0.25;if(y<g)y=g;
  cam.pos=[x,y,z];cam.tgt=piv;cam.fov=(W/H>=1?0.95:1.2)*(cfg.fov||1);cam.roll=0;cam.fwd=norm([piv[0]-x,piv[1]-y,piv[2]-z]);cam.right=norm([-cam.fwd[2],0,cam.fwd[0]]);
  cam.up=[cam.right[1]*cam.fwd[2]-cam.right[2]*cam.fwd[1],cam.right[2]*cam.fwd[0]-cam.right[0]*cam.fwd[2],cam.right[0]*cam.fwd[1]-cam.right[1]*cam.fwd[0]];}
const FOTO_TECLAS={};
window.addEventListener('keydown',e=>{if(!FOTO.on){if(e.code==='KeyP'&&!e.repeat&&G.modo==='jogo'&&!(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))){e.preventDefault();fotoAbrir();}return;}FOTO_TECLAS[e.code]=true;if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();e.stopImmediatePropagation();fotoFechar();}
  else if(e.code==='Equal'||e.code==='NumpadAdd')FOTO.dist=Math.max(0.8,FOTO.dist-0.4);else if(e.code==='Minus'||e.code==='NumpadSubtract')FOTO.dist=Math.min(14,FOTO.dist+0.4);},true);
window.addEventListener('keyup',e=>{FOTO_TECLAS[e.code]=false;},true);
canvas.addEventListener('pointerdown',e=>{if(!FOTO.on)return;FOTO.drag=[e.clientX,e.clientY];try{canvas.setPointerCapture(e.pointerId);}catch(_){}});
canvas.addEventListener('pointermove',e=>{if(!FOTO.on||!FOTO.drag)return;const dx=e.clientX-FOTO.drag[0],dy=e.clientY-FOTO.drag[1];FOTO.drag=[e.clientX,e.clientY];FOTO.yaw-=dx*0.006;FOTO.pitch=clamp(FOTO.pitch+dy*0.005,-0.6,1.35);});
canvas.addEventListener('pointerup',()=>{FOTO.drag=null;});
canvas.addEventListener('wheel',e=>{if(!FOTO.on)return;e.preventDefault();FOTO.dist=clamp(FOTO.dist*(e.deltaY>0?1.1:0.9),0.8,14);},{passive:false});
async function fotoTirar(){if(!FOTO.on)return null;render();const w=canvas.width,h=canvas.height;const c2=document.createElement('canvas');c2.width=w;c2.height=h;const x=c2.getContext('2d');
  const f=FILTROS[FOTO.filtro][1];x.filter=f;x.drawImage(canvas,0,0);x.filter='none';
  const k=Math.max(1,w/1280);x.font='700 '+Math.round(22*k)+'px system-ui, sans-serif';x.textAlign='right';x.fillStyle='rgba(255,255,255,0.82)';x.shadowColor='rgba(0,0,0,0.6)';x.shadowBlur=6*k;
  x.fillText('VAYDR · dia '+(G.dia||1),w-18*k,h-18*k);
  const blob=await new Promise(r=>c2.toBlob(r,'image/png'));if(!blob){feed('Não deu para tirar a foto',true);return null;}
  const nome='vaydr-foto-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.png';sfx('clique');flashFoto();
  let ok=false;try{const dl=window.claude&&typeof claude.use==='function'?await claude.use('downloads'):null;if(dl){await dl.save({filename:nome,data:blob});ok=true;}}catch(e){if(e&&e.code==='declined'){feed('Foto descartada');return blob;}}
  if(!ok){try{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nome;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},4000);ok=true;}catch(_){}}
  feed(ok?'Foto salva: '+nome:'Foto pronta');window.__ultimaFoto=blob;return blob;}
function flashFoto(){const el=$('foto-flash');if(!el)return;el.style.transition='none';el.style.opacity='0.85';requestAnimationFrame(()=>{el.style.transition='opacity .45s ease-out';el.style.opacity='0';});}
V8.novo.conquistas=()=>{G.runId=Math.random().toString(36).slice(2,10);G.noitesSob=0;G.luaSangueVivo=false;};
V8.salvar.conquistas=()=>({runId:G.runId,noitesSob:G.noitesSob||0});
V8.carregar.conquistas=s=>{G.runId=s&&s.runId||Math.random().toString(36).slice(2,10);G.noitesSob=s&&s.noitesSob||0;};
