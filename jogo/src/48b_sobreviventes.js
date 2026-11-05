/* ================= sobreviventes: gente viva pelo mapa, que você resgata e leva para o acampamento =================
   cada um está num lugar, com um pedido: zumbis em volta, fome, um ferimento, ou só medo. Resgatado, segue você até a
   clareira e passa a morar no acampamento com uma tarefa:
   · vigiar: atira nos zumbis que chegam perto (de cima da torre de vigia, se tiver)
   · cozinhar: faz comida com carne crua e o que a horta der, e guarda nos baús
   · consertar: arruma as construções danificadas
   · buscar material: sai de manhã e volta no fim da tarde com o que achou
   · cuidar dos feridos: cura você e o grupo perto do acampamento e faz bandagens
   Cada um come 1 comida por dia dos baús do acampamento; sem comida por 3 dias, vai embora.
   Zumbi ataca sobrevivente: se ele cair, levante a pessoa (segure E) antes que seja tarde. */
const C_ROUPA=(sub,inf,cor,pelo)=>({sub,inf,cor,pelo:pelo||0});
const SOB_DEF=[
  {id:'cida',nome:'Dona Cida',hab:'cozinhar',rot:'cozinheira',onde:{predio:'Mercado'},pede:'comida',arma:'faca',tint:[1.06,0.94,0.86],
    roupas:[C_ROUPA('troncoLongo',0.013,0x8a3a3a),C_ROUPA('pernas',0.007,0x3d4552),C_ROUPA('pes',0.011,0x2a2420),C_ROUPA('cabeca',0.024,0x6b4a8a,0.15)],
    falas:{pede:'Moço, faz dois dias que eu não como nada... tem alguma coisa aí?',obrigado:'Deus te abençoe! Me leva pro seu acampamento que eu cozinho pra todo mundo.',base:['Comida quente segura qualquer um.','Traz carne que eu asso. Traz da horta que eu faço sopa.','Ninguém passa fome enquanto eu estiver aqui.']}},
  {id:'jorge',nome:'Seu Jorge',hab:'consertar',rot:'mecânico',onde:{predio:'Oficina'},pede:'cercado',arma:'peDeCabra',tint:[0.92,0.86,0.8],
    roupas:[C_ROUPA('troncoLongo',0.013,0x3d5a73),C_ROUPA('pernas',0.007,0x3d5a73),C_ROUPA('pes',0.011,0x1e1a16),C_ROUPA('cabeca',0.022,0x8a7a50)],
    falas:{cerco:'Tem uns três lá fora! Eu tranquei a porta, mas não aguento mais!',obrigado:'Valeu, parceiro. Me leva junto: o que quebrar no seu acampamento, eu arrumo.',base:['Barricada boa é barricada consertada.','Me dá tábua e prego que eu faço milagre.','Esse portão aguenta mais uma noite.']}},
  {id:'marina',nome:'Marina',hab:'vigiar',rot:'vigia',onde:{predio:'Delegacia',andar:1},pede:'cercado',arma:'pistola',tint:[1.0,0.9,0.82],
    roupas:[C_ROUPA('troncoCurto',0.009,0x1f2a3a),C_ROUPA('pernas',0.007,0x1f2a3a),C_ROUPA('pes',0.011,0x111111),C_ROUPA('rosto',0.012,0x2a2d33)],
    falas:{cerco:'Eles entraram na delegacia! Limpa o andar que eu te dou cobertura.',obrigado:'Bom tiro. Eu era da polícia. Me dá um ponto alto que ninguém chega perto do seu acampamento.',base:['Tudo tranquilo no meu setor.','Uma torre de vigia ia ajudar muito.','Eu durmo de dia. De noite, ninguém passa.']}},
  {id:'lucia',nome:'Lúcia',hab:'curar',rot:'enfermeira',onde:{predio:'Hospital'},pede:'bandagem',arma:'faca',tint:[1.04,0.92,0.84],
    roupas:[C_ROUPA('troncoLongo',0.012,0x6fa8a0),C_ROUPA('pernas',0.007,0x6fa8a0),C_ROUPA('pes',0.011,0xd8d8d0),C_ROUPA('cabeca',0.02,0x6fa8a0)],
    falas:{pede:'Eu cortei a perna fugindo deles. Você tem uma bandagem? Eu sei me cuidar, só preciso do material.',obrigado:'Obrigada. Eu era enfermeira daqui. No seu acampamento eu cuido de quem se machucar.',base:['Senta aí que eu vejo esse machucado.','Pano limpo vira bandagem.','Não deixa mordida sem cuidar.']}},
  {id:'tiao',nome:'Tião',hab:'buscar',rot:'batedor',onde:{metro:true},pede:'cercado',arma:'taco',tint:[0.88,0.8,0.72],
    roupas:[C_ROUPA('troncoLongo',0.013,0x5a5a3a),C_ROUPA('pernas',0.007,0x4a4038),C_ROUPA('pes',0.011,0x3a2a1a),C_ROUPA('cabeca',0.024,0x2a2a2a,0.1),C_ROUPA('rosto',0.012,0x7a2a22)],
    falas:{cerco:'Tô encurralado na plataforma! Dá um jeito neles que eu saio!',obrigado:'Ufa. Eu conheço essa cidade de olho fechado. Me deixa sair de dia que eu volto cheio de coisa.',base:['Achei um atalho pelos fundos do mercado.','Amanhã eu vou mais longe.','Quanto menos barulho, mais coisa eu trago.']}},
  {id:'rafa',nome:'Rafa',hab:'buscar',rot:'batedor',onde:{lugar:'fazenda',dx:9,dz:-6},pede:null,arma:'machado',tint:[1.02,0.9,0.8],
    roupas:[C_ROUPA('troncoCurto',0.009,0xb8642a),C_ROUPA('pernas',0.007,0x3a4a6a),C_ROUPA('pes',0.011,0x6b4a2a),C_ROUPA('cabeca',0.024,0xc9a227,0.05)],
    falas:{pede:'Calma, calma! Achei que era um deles... Você tem um lugar seguro?',obrigado:'Uma clareira com fogueira? Bora! Eu corro rápido e acho coisa no mato.',base:['A mata tem mais coisa do que parece.','Vi rastro de cervo perto do rio.','Se eu não voltar até escurecer, não me espera.']}},
  {id:'pedro',nome:'Professor Pedro',hab:'consertar',rot:'professor',onde:{lugar:'vila',dx:-0.5,dz:-2},pede:'bandagem',arma:'porrete',tint:[0.96,0.88,0.8],
    roupas:[C_ROUPA('troncoLongo',0.013,0x7a6a50),C_ROUPA('pernas',0.007,0x4a4a4a),C_ROUPA('pes',0.011,0x3a2a1a)],
    falas:{pede:'Meu braço... um deles me pegou de raspão. Tem uma bandagem? Não foi mordida, juro.',obrigado:'Obrigado, jovem. Eu dava aula de física. Sei montar e consertar quase tudo.',base:['Alavanca, roldana e paciência.','Uma horta bem cuidada vale mais que munição.','Anotei o horário das hordas. Ficam piores na lua cheia.']}},
  {id:'bia',nome:'Bia',hab:'vigiar',rot:'vigia',onde:{lugar:'posto',dx:-4,dz:7},pede:'comida',arma:'arco',tint:[1.0,0.88,0.78],
    roupas:[C_ROUPA('troncoLongo',0.013,0x2a4a2a),C_ROUPA('pernas',0.007,0x2a2a30),C_ROUPA('pes',0.011,0x8a8a8a),C_ROUPA('rosto',0.012,0x3a3a3a)],
    falas:{pede:'Não atira! Eu tô com fome, só isso. Você tem comida?',obrigado:'Valeu. Eu treinava tiro com arco. Me põe de guarda que eu não erro.',base:['Flecha não faz barulho. Gosto disso.','Daqui de cima eu vejo tudo.','Eles vêm sempre pelo mesmo lado.']}}];
const SOB_TAREFAS={vigiar:{n:'Vigiar',d:'Fica de guarda e atira nos zumbis que chegam perto (de cima da torre de vigia, se tiver).'},
  cozinhar:{n:'Cozinhar',d:'Faz comida com carne crua e com o que a horta der, e guarda nos baús.'},
  consertar:{n:'Consertar',d:'Arruma as construções danificadas do acampamento.'},
  buscar:{n:'Buscar material',d:'Sai de manhã e volta no fim da tarde com material achado.'},
  curar:{n:'Cuidar dos feridos',d:'Cura você e o grupo perto do acampamento e faz bandagens.'},
  descansar:{n:'Descansar',d:'Fica perto da fogueira, sem trabalhar.'}};
const SOB_BUSCA=[['madeira',2,5,0.8],['pedra',1,3,0.5],['tabuas',1,3,0.45],['pano',1,3,0.5],['sucata',1,3,0.5],['pregos',2,5,0.35],['corda',1,2,0.3],['fibra',2,4,0.4],
  ['frutas',2,4,0.4],['feijao',1,1,0.25],['carneCrua',1,2,0.3],['municao9',2,5,0.12],['flecha',2,4,0.15],['remedios',1,1,0.12],['gasolina',1,1,0.08],['sementes',1,3,0.3]];
const SOBREV=[];let sobT=0,sobHora=null;
const sobBase=(x,z,m)=>{const c=baseCentro();return d2(x,z,c[0],c[1])<(m||30)*(m||30);};   // centro: o marco da base (Etapa 16) ou a fogueira da clareira
const sobAtivo=s=>s.st==='segue'||s.st==='aguarda'||s.st==='base';
/* ---------- onde cada um está esperando ---------- */
function lugarSobrev(d){const o=d.onde;
  if(o.predio){const p=CID.predios.find(q=>q.nome.indexOf(o.predio)>=0);if(p){const f=Math.min(o.andar||0,(p.salas.length||1)-1),L=(p.salas[f]||[]).filter(s=>!/corredor|escada|poco|banheiro|elevador|telhado|sacada/.test(s.tipo||''));
      let best=null,ba=0;for(const s of L){const a=(s.u1-s.u0)*(s.v1-s.v0);if(a>ba){ba=a;best=s;}}
      if(best){const w=pw(p,(best.u0+best.u1)/2,(best.v0+best.v1)/2);return{x:w[0],y:best.y,z:w[1]};}}}
  if(o.metro&&CID.metro&&CID.metro.partes){const s=CID.metro.partes.find(q=>/Plataforma/.test(q.nome))||CID.metro.partes[0];if(s)return{x:s.x0+2.5,y:s.y,z:(s.z0+s.z1)/2};}
  const pl=placeById(o.lugar||'clareira');let x=pl.x+(o.dx||0),z=pl.z+(o.dz||0);
  for(let k=0;k<30&&!pontoLivre(x,z,0.6);k++){const a=k*2.4,r=1+k*0.4;x=pl.x+(o.dx||0)+Math.cos(a)*r;z=pl.z+(o.dz||0)+Math.sin(a)*r;}
  return{x,y:ground(x,z),z};}
function sobrevNovo(d,i){const l=lugarSobrev(d),ch=newChar(MESH.surv,0.96+((i*37)%7)*0.012);ch.tint=d.tint.slice();ch.roupas=d.roupas;
  return{id:d.id,def:d,nome:d.nome,i,st:'espera',tarefa:d.hab,hp:100,hpMax:100,fome:0,x:l.x,y:l.y,z:l.z,ox:l.x,oy:l.y,oz:l.z,yaw:Math.random()*6.28,ch,ph:0,amp:0,t:0,
    danoT:0,flash:0,atkT:Math.random(),golpeT:0,tiroT:0,caidoT:0,pronto:!d.pede||d.pede!=='cercado'?false:false,cercoFeito:false,conhecido:false,falaT:0,stuck:0,lastX:l.x,lastZ:l.z,desvio:0,desvioS:1,travado:0,
    paradoT:0,alvo:null,mortoT:0,sentado:0,anim:'pe',hx:0,hz:0,hy:0};}
function sobrevInicio(){SOBREV.length=0;if(!MESH.surv)return;SOB_DEF.forEach((d,i)=>SOBREV.push(sobrevNovo(d,i)));sobHora=null;}
function sobrevSalvar(){return SOBREV.map(s=>({id:s.id,st:s.st,tarefa:s.tarefa,hp:Math.round(s.hp),fome:s.fome,x:+s.x.toFixed(2),y:+s.y.toFixed(2),z:+s.z.toFixed(2),cf:s.cercoFeito?1:0,c:s.conhecido?1:0,exp:s.exp||null,ea:s.expAtual||null,vo:s.volta||0}));}
function sobrevCarregar(L){sobrevInicio();if(!Array.isArray(L))return;for(const q of L){const s=SOBREV.find(o=>o.id===q.id);if(!s)continue;s.exp=q.exp||null;s.expAtual=q.ea||null;s.volta=q.vo||0;
  s.st=q.st==='caido'?'base':q.st;s.tarefa=SOB_TAREFAS[q.tarefa]?q.tarefa:s.def.hab;s.hp=Math.max(30,q.hp||100);s.fome=q.fome||0;s.cercoFeito=!!q.cf;s.conhecido=!!q.c;
  if(s.st==='segue'||s.st==='aguarda'){s.st='segue';sobTeleporte(s,true);}else if(s.st==='fora'){const c=baseCentro();s.x=c[0];s.z=c[1]+12;s.y=ground(s.x,s.z);}
  else if(s.st!=='espera'&&s.st!=='pede'){s.x=q.x;s.y=q.y;s.z=q.z;}}}
/* ---------- conversa ---------- */
function sobFala(s,txt){if(!txt)return;toast('grupo',s.nome+': '+txt);s.falaT=6;}
function sobrevInter(tryIt){for(const s of SOBREV){if(s.st==='morto'||s.st==='foi'||s.st==='fora'||!s.ch.vis)continue;if(Math.abs(s.x-P.x)>3||Math.abs(s.z-P.z)>3)continue;
  tryIt({k:'sobrev',o:s},s.x,s.z,s.st==='caido'?2.3:2.4,s.st==='caido'?3:2.2,-0.5,s.y);}}
function cercoVivo(s){for(const z of Z)if(z.vivo&&z.cerco===s.id)return true;return false;}
function sobrevTexto(s){
  if(s.st==='caido')return{t:'Levantar '+s.nome,s:'segure para ajudar ('+Math.ceil(s.caidoT)+' s)',hold:true,dur:1.8};
  if(s.st==='espera'||s.st==='pede'){const pd=s.def.pede;
    if(pd==='cercado'&&cercoVivo(s))return{t:s.nome+' está encurralada'.replace('encurralada',/a$/.test(s.nome)?'encurralada':'encurralado'),s:'acabe com os zumbis em volta'};
    if(pd==='comida'){const c=invComida();return{t:c?'Dar comida a '+s.nome:s.nome+' está com fome',s:c?ITEMS[c.id].nome+' · vem para o acampamento':'precisa de qualquer comida'};}
    if(pd==='bandagem'){const b=invCount('bandagem')||invCount('kit');return{t:b?'Fazer curativo em '+s.nome:s.nome+' está ferido'.replace('ferido',/a$/.test(s.nome)?'ferida':'ferido'),s:b?'usa uma bandagem':'precisa de bandagem ou kit médico'};}
    return{t:'Falar com '+s.nome,s:'chamar para o acampamento'};}
  if(s.st==='segue')return{t:'Mandar '+s.nome+' esperar aqui',s:'segue você até o acampamento'};
  if(s.st==='aguarda')return{t:'Chamar '+s.nome,s:'vem com você de novo'};
  if(s.st==='base')return{t:'Falar com '+s.nome,s:SOB_TAREFAS[s.tarefa].n.toLowerCase()+(s.fome?' · com fome':'')};
  return null;}
function resgatar(s){s.st='segue';s.pronto=true;s.conhecido=true;ganharXP(40);progresso('resgate');sfx('missao');sobFala(s,s.def.falas.obrigado);
  dica('resgate1','corpo','Resgatou alguém! Leve até a clareira: lá a pessoa fica no acampamento e você escolhe a tarefa dela (segure perto e aperte E).');}
function sobrevFalar(s){
  if(s.st==='caido'){s.st=s.antes||'base';s.hp=45;s.caidoT=0;s.danoT=3;skParar(s.ch,4);sfx('pegar');feed(s.nome+' levantou');return;}
  if(s.st==='espera'||s.st==='pede'){const pd=s.def.pede;
    if(pd==='cercado'&&cercoVivo(s)){sobFala(s,s.def.falas.cerco);return;}
    if(pd==='comida'){const c=invComida();if(!c){sobFala(s,s.def.falas.pede);return;}c.n--;if(c.n<=0)P.inv[P.inv.indexOf(c)]=null;hudBarra();invRender();feed('Deu '+ITEMS[c.id].nome.toLowerCase()+' a '+s.nome);}
    if(pd==='bandagem'){const id=invCount('bandagem')?'bandagem':invCount('kit')?'kit':null;if(!id){sobFala(s,s.def.falas.pede);return;}invRemove(id,1);hudBarra();invRender();feed('Curativo feito em '+s.nome);}
    resgatar(s);return;}
  if(s.st==='segue'){s.st='aguarda';s.ax=s.x;s.az=s.z;feed(s.nome+': espero aqui');sfx('clique');return;}
  if(s.st==='aguarda'){s.st='segue';feed(s.nome+': tô indo');sfx('clique');return;}
  if(s.st==='base')abrirGrupo(s);}
/* ---------- painel do grupo ---------- */
let grupoSel=null;
function abrirGrupo(s){grupoSel=s;G.modo='grupo';if(document.pointerLockElement)document.exitPointerLock();IN.attack=false;$('t-grupo').hidden=false;grupoRender();
  if(s.falaT<=0&&Math.random()<0.7){const L=s.def.falas.base;$('g-fala').textContent='“'+L[Math.floor(Math.random()*L.length)]+'”';}}
function fecharGrupo(){$('t-grupo').hidden=true;if(G.modo==='grupo')G.modo='jogo';grupoSel=null;if(typeof pedirTrava==='function')pedirTrava();}
function grupoRender(){const s=grupoSel;if(!s)return;$('g-nome').textContent=s.nome;$('g-hab').textContent=s.def.rot;
  if(!$('g-fala').textContent)$('g-fala').textContent='“'+s.def.falas.base[0]+'”';
  $('g-vida').style.width=Math.round(100*s.hp/s.hpMax)+'%';$('g-fome').textContent=s.fome?'Com fome há '+s.fome+(s.fome>1?' dias':' dia'):'Comeu hoje';$('g-fome').classList.toggle('ruim',s.fome>0);
  let h='';for(const k in SOB_TAREFAS){const T=SOB_TAREFAS[k],on=s.tarefa===k,hab=s.def.hab===k;
    h+='<button type="button" class="g-tar'+(on?' on':'')+'" data-t="'+k+'" aria-pressed="'+on+'"><b>'+T.n+(hab?' <i>★</i>':'')+'</b><span>'+T.d+'</span></button>';}
  $('g-tarefas').innerHTML=h+(typeof grupoExtra==='function'?grupoExtra(s):'');
  const outros=SOBREV.filter(o=>o!==s&&(o.st==='base'||o.st==='fora'||o.st==='caido'));
  $('g-lista').innerHTML=outros.length?'<h3>No acampamento</h3>'+outros.map(o=>'<div><b>'+o.nome+'</b><span>'+(o.st==='fora'?'fora, buscando material':o.st==='caido'?'caído!':SOB_TAREFAS[o.tarefa].n)+'</span></div>').join(''):'';
  const nb=bausBase().length;$('g-aviso').hidden=nb>0;}
function grupoTarefa(k){const s=grupoSel;if(!s||!SOB_TAREFAS[k])return;s.tarefa=k;sfx('clique');grupoRender();
  const f={vigiar:'Deixa comigo. Ninguém chega perto.',cozinhar:'Vou ver o que tem nos baús para cozinhar.',consertar:'Vou dar uma olhada no que está quebrado.',buscar:'Amanhã cedo eu saio e volto antes de escurecer.',curar:'Quem se machucar, vem falar comigo.',descansar:'Um descanso cai bem.',transportar:'Eu busco o que os territórios produzirem.',expedicao:'Escolha para onde eu vou.'}[k];
  $('g-fala').textContent='“'+f+'”';}
/* ---------- baús do acampamento: comida do grupo e o que eles produzem ---------- */
function bausBase(){return OB.filter(o=>OBRAS[o.tipo]&&OBRAS[o.tipo].bau&&o.itens&&sobBase(o.x,o.z,34));}
function tirarDaBase(filtro){for(const b of bausBase())for(let i=0;i<b.itens.length;i++){const it=b.itens[i];if(it&&filtro(it)){it.n--;const id=it.id;if(it.n<=0)b.itens[i]=null;return id;}}return null;}
function contarBase(filtro){let n=0;for(const b of bausBase())for(const it of b.itens)if(it&&filtro(it))n+=it.n;return n;}
function depositarBase(itens){const sobra=[];for(const[id,n0]of itens){let n=n0;const d=ITEMS[id];if(!d)continue;
    for(const b of bausBase()){for(let i=0;i<b.itens.length&&n>0;i++){const it=b.itens[i];if(it&&it.id===id&&it.n<d.max&&mesmaQual(it,d.qual?1:undefined)){const k=Math.min(n,d.max-it.n);it.n+=k;n-=k;}}
      for(let i=0;i<b.itens.length&&n>0;i++)if(!b.itens[i]){const k=Math.min(n,d.max);b.itens[i]=newItem(id,k);n-=k;}if(n<=0)break;}
    if(n>0)sobra.push([id,n]);}
  if(sobra.length){const c=baseCentro();soltarItens(sobra,c[0]+1.5,c[1]+1.5);}return sobra.length===0;}
const ehComida=it=>{const d=ITEMS[it.id];return d&&d.tipo==='comida'&&(d.vida||0)>=0;};
function nomesItens(L){return L.map(([id,n])=>n+' '+ITEMS[id].nome.toLowerCase()).join(', ');}
/* ---------- amanhecer: todos comem; cozinheiro, curandeiro e o resto produzem ---------- */
function sobrevAmanhece(){const grupo=SOBREV.filter(s=>s.st==='base'||s.st==='fora');if(!grupo.length)return;
  for(const s of SOBREV)if(s.st==='base'&&s.tarefa==='cozinhar'){const k=s.def.hab==='cozinhar'?4:3,feito=[];let n=0;
    while(n<k){const c=tirarDaBase(it=>it.id==='carneCrua');if(!c)break;feito.push(['carneAssada',1]);n++;}
    while(n<k&&contarBase(it=>it.id==='milho'||it.id==='batata'||it.id==='abobora')>=2){tirarDaBase(it=>it.id==='milho'||it.id==='batata'||it.id==='abobora');tirarDaBase(it=>it.id==='milho'||it.id==='batata'||it.id==='abobora');feito.push(['sopa',1]);n++;}
    const junta={};for(const[id,q]of feito)junta[id]=(junta[id]||0)+q;const L=Object.entries(junta);
    if(L.length){depositarBase(L);setTimeout(()=>toast('grupo',s.nome+' cozinhou: '+nomesItens(L)+'. Está nos baús.'),3200);}
    else setTimeout(()=>toast('grupo',s.nome+': não tem nada para cozinhar. Guarde carne crua ou o que a horta der nos baús.'),3200);}
  {let fezSeringa=false;for(const s of SOBREV)if(s.st==='base'&&s.tarefa==='curar'){const q=s.def.hab==='curar'?2:1;depositarBase([['bandagem',q]]);
    if(!fezSeringa&&contarBase(it=>it.id==='remedios')>=2){fezSeringa=true;tirarDaBase(it=>it.id==='remedios');tirarDaBase(it=>it.id==='remedios');depositarBase([['seringa',1]]);setTimeout(()=>toast('grupo',s.nome+' preparou uma seringa antiviral com os remédios do baú.'),3600);}}}
  let comeram=0,famintos=[];
  for(const s of grupo){const c=tirarDaBase(ehComida);if(c){s.fome=0;comeram++;}else{s.fome++;famintos.push(s);}}
  for(const s of famintos){if(s.fome>=3){s.st='foi';s.ch.vis=false;setTimeout(()=>toast('alerta',s.nome+' foi embora: três dias sem comida no acampamento.'),4200);}}
  const fic=famintos.filter(s=>s.st!=='foi');
  if(fic.length)setTimeout(()=>toast('grupo','Faltou comida nos baús para '+fic.map(s=>s.nome).join(', ')+'. Sem comer por 3 dias, a pessoa vai embora.'),3800);
  if(!bausBase().length)dica('semBauBase','grupo','O grupo pega comida dos baús da clareira. Construa um baú perto da fogueira e guarde comida lá.');}
/* buscador sai de manhã e volta no fim da tarde */
function sobrevSaem(){for(const s of SOBREV)if(s.st==='base'&&s.tarefa==='buscar'&&s.hp>40){s.st='fora';s.ch.vis=false;s.saiu=G.dia;}}
function sobrevVoltam(){for(const s of SOBREV){if(s.st!=='fora'||s.expAtual)continue;s.st='base';const a=-0.4+s.i*0.3,c=baseCentro();s.x=c[0]+Math.sin(a)*13;s.z=c[1]+Math.cos(a)*13;s.y=ground(s.x,s.z);
    const k=s.def.hab==='buscar'?1.5:1,L=[];for(const[id,a0,b0,ch]of SOB_BUSCA)if(Math.random()<ch*k)L.push([id,a0+Math.floor(Math.random()*(b0-a0+1))]);if(!L.length)L.push(['madeira',3]);
    depositarBase(L);if(Math.random()<0.12){s.hp=Math.max(25,s.hp-45);s.danoT=8;}
    toast('grupo',s.nome+' voltou com: '+nomesItens(L)+'.'+(s.hp<60?' Voltou machucado.':''));}}
/* ---------- zumbis: quem eles atacam (jogador, Caramelo ou sobrevivente) ---------- */
function aliadoPerto(z,dp){let best=null,bd=4;
  if(caoAtivoLivre()){const d=Math.hypot(CAO.x-z.x,CAO.z-z.z);if(d<bd&&(d<dp-0.3||!P.alive)){bd=d;best={tipo:'cao',ref:CAO,x:CAO.x,z:CAO.z,d};}}
  for(const s of SOBREV){if(!sobAtivo(s)||Math.abs(s.y-z.y)>1.7)continue;const d=Math.hypot(s.x-z.x,s.z-z.z);if(d<bd&&(d<dp-0.3||!P.alive)){bd=d;best={tipo:'sob',ref:s,x:s.x,z:s.z,d};}}
  return best;}
function aliadoValido(a){return a&&(a.tipo==='cao'?caoAtivoLivre():sobAtivo(a.ref));}
function aliadoPos(a){return a.tipo==='cao'?[CAO.x,CAO.z]:[a.ref.x,a.ref.z];}
function ferirAliado(a,d){if(a.tipo==='cao')ferirCao(d);else ferirSobrev(a.ref,d);}
function ferirSobrev(s,d){if(!sobAtivo(s))return;s.hp-=d*DIF[cfg.dif].dano*0.7;s.flash=0.15;s.danoT=6;sangue(s.x,s.y+1.2,s.z,5);
  if(s.hp<=0){s.hp=0;s.antes=s.st==='segue'||s.st==='aguarda'?'segue':'base';s.st='caido';s.caidoT=45;s.ch.pitch=0;
    if(s.ch.sk)skTocar(s.ch,'zLevantar',{ext:true,ini:0,peso:1,mix:3,rot:Math.PI,reinicia:true});
    toast('alerta',s.nome+' caiu! Levante (segure E perto) em até 45 segundos ou perde a pessoa.');sfx('dor',s.x,s.z,0.8);}}
/* ---------- combate dos sobreviventes ---------- */
const SOB_DIST={pistola:22,arco:24};
function sobrevLuta(s,dt){s.atkT-=dt;s.golpeT=Math.max(0,s.golpeT-dt);s.tiroT=Math.max(0,s.tiroT-dt);if(s.atkT>0)return null;
  const alc=SOB_DIST[s.def.arma]||0;if(s.naTorre&&!alc)return null;const vigia=s.st==='base'&&s.tarefa==='vigiar',R=alc?(vigia?alc*(s.naTorre?1.3:1):alc*0.7):2.4;let best=null,bd=R*R;
  for(const z of Z){if(!z.vivo||!z.ch.vis||Math.abs(z.y-s.y)>(s.naTorre?6:1.8))continue;if(z.st==='sobe'||z.st==='dorme')continue;const q=d2(z.x,z.z,s.x,s.z);if(q<bd){bd=q;best=z;}}
  if(!best)return null;const d=Math.sqrt(bd),dx=best.x-s.x,dz=best.z-s.z;
  if(d<2.4){s.atkT=0.95+Math.random()*0.3;s.golpeT=0.5;s.yaw=Math.atan2(dx,dz);sfx('golpe',s.x,s.z,0.7);
    const forte=s.def.arma==='machado'||s.def.arma==='taco'||s.def.arma==='peDeCabra';ferirZ(best,(forte?22:15)*(0.85+Math.random()*0.3),dx/(d||1)*0.6,dz/(d||1)*0.6,0);sfx('acerto',s.x,s.z,0.6);return best;}
  if(alc){s.atkT=s.def.arma==='arco'?1.5:1.25;s.tiroT=0.45;s.yaw=Math.atan2(dx,dz);const arco=s.def.arma==='arco';sfx(arco?'arco':'tiro',s.x,s.z,arco?0.7:0.8);
    if(!arco){barulho(s.x,s.z,32,false,s.y);const m=xf(s.ch.m.subarray(11*16,12*16),WGRIP.pistola[0],WGRIP.pistola[1],WGRIP.pistola[2]);for(let i=0;i<4;i++)part(m[0],m[1],m[2],dx/d*3+(Math.random()-0.5),Math.random()-0.2,dz/d*3+(Math.random()-0.5),0.12,0.06,[1,0.75,0.35,1],true,0);}
    if(Math.random()<(s.def.hab==='vigiar'?0.78:0.6)){const head=Math.random()<0.25;sangue(best.x,best.y+(head?1.6:1.2)*(best.ch.s||1),best.z,head?8:5);ferirZ(best,(arco?34:30)*(head?2:1),dx/d*0.4,dz/d*0.4,head?1:0);}
    return best;}
  return null;}
/* ---------- movimento ---------- */
function sobTeleporte(s,atras){const b=P.body;for(let k=0;k<12;k++){const a=b+Math.PI+(Math.random()-0.5)*1.6,r=(atras?2:4)+Math.random()*3,x=P.x+Math.sin(a)*r,z=P.z+Math.cos(a)*r;
    const y=chaoEm(x,z,P.y+0.4);if(Math.abs(y-P.y)<0.8&&!bloqueadoAlto(x,z,0.35,y+0.2)){s.x=x;s.z=z;s.y=y;s.desvio=0;s.travado=0;return true;}}
  s.x=P.x;s.z=P.z;s.y=P.y;return false;}
function sobAndar(s,tx,tz,spd,dt){let dx=tx-s.x,dz=tz-s.z;const dd=Math.hypot(dx,dz);if(dd<0.05)return 0;dx/=dd;dz/=dd;
  if(s.desvio>0){s.desvio-=dt;const px=-dz*s.desvioS,pz=dx*s.desvioS;dx=dx*0.35+px;dz=dz*0.35+pz;}
  const v=Math.min(spd,dd/Math.max(dt,1e-3));s.x+=dx*v*dt;s.z+=dz*v*dt;s.yaw=angLerp(s.yaw,Math.atan2(dx,dz),1-Math.exp(-dt*8));
  collide(s,0.3,c=>c.solid&&!c.portao);
  s.stuck+=dt;if(s.stuck>1.2){const mv=Math.hypot(s.x-s.lastX,s.z-s.lastZ);if(mv<0.3*spd/2&&s.desvio<=0){s.desvio=0.9;s.desvioS=Math.random()<0.5?-1:1;s.travado++;}else s.travado=0;s.stuck=0;s.lastX=s.x;s.lastZ=s.z;}
  return v;}
/* lugares no acampamento */
function sobCasa(s){const a=0.5+s.i*0.78,r=4.6,f=baseFogo();return[f[0]+Math.sin(a)*r,f[1]+Math.cos(a)*r];}
function sobAssento(s){const a=0.2+s.i*0.785,r=2.3,f=baseFogo();return[f[0]+Math.sin(a)*r,f[1]+Math.cos(a)*r];}
function sobPosto(s){const tw=OB.find(o=>o.tipo==='torreVigia'&&sobBase(o.x,o.z,40)&&!SOBREV.some(q=>q!==s&&q.torreDe===o));
  if(tw){const b=tw.via?tw.via.base:{x:tw.x,z:tw.z};return{x:tw.x,z:tw.z,y:tw.y+(tw.alturaPlat||TORRE_H),torre:tw,bx:b.x,bz:b.z};}
  const vig=SOBREV.filter(q=>q.st==='base'&&q.tarefa==='vigiar'),k=Math.max(0,vig.indexOf(s)),a=(k%2?-0.55:0.55)+Math.floor(k/2)*0.25+Math.PI;
  return{x:Math.sin(a)*8.6,z:Math.cos(a)*8.6,y:null};}
/* quem cuida dos feridos: cura você perto do acampamento e quem do grupo estiver perto dela */
function sobCuraEfeito(s,dt){if(sobBase(P.x,P.z,10)&&P.alive&&P.vida<vidaMax()){P.vida=Math.min(vidaMax(),P.vida+(s.def.hab==='curar'?2:1.2)*dt);if(!s.curouT||G.t-s.curouT>40){s.curouT=G.t;feed(s.nome+' está cuidando de você');}}
  for(const q of SOBREV)if(q!==s&&sobAtivo(q)&&q.hp<q.hpMax&&d2(q.x,q.z,s.x,s.z)<12*12)q.hp=Math.min(q.hpMax,q.hp+1.5*dt);}
function obraParaConsertar(s){let best=null,bv=1;for(const o of OB){if(!sobBase(o.x,o.z,36)||o.hp>=o.hpMax)continue;const f=o.hp/o.hpMax;if(f<bv){bv=f;best=o;}}return best;}
/* ---------- atualização ---------- */
function updateSobrev(dt){if(!SOBREV.length)return;const h=G.hora,noite=G.noite||h>=19.6||h<5.6;
  if(sobHora!==null){if(crossed(sobHora,h,7.6))sobrevSaem();if(crossed(sobHora,h,17.2))sobrevVoltam();}sobHora=h;
  // zumbis percebem sobreviventes por perto
  sobT-=dt;if(sobT<=0){sobT=0.4;for(const z of Z){if(!z.vivo||!(z.st==='vaga'||z.st==='marcha'||z.st==='alerta'||z.st==='guarda'||z.st==='volta'))continue;
      for(const s of SOBREV){if(!sobAtivo(s)||s.naTorre||Math.abs(s.y-z.y)>2)continue;if(d2(s.x,s.z,z.x,z.z)<6.5*6.5){z.st='caca';z.viu=1;z.lx=s.x;z.lz=s.z;z.ly=s.y;break;}}}}
  for(const s of SOBREV)updateUmSobrev(s,dt,noite);}
function updateUmSobrev(s,dt,noite){const ch=s.ch;s.t+=dt;s.flash=Math.max(0,s.flash-dt);s.falaT-=dt;s.danoT-=dt;
  ch.tint=s.flash>0?[2.2,1.3,1.3]:s.def.tint;s.torre=null;
  if(s.st==='foi'){ch.vis=false;return;}
  if(s.st==='fora'){ch.vis=false;return;}
  const dxp=P.x-s.x,dzp=P.z-s.z,dp=Math.hypot(dxp,dzp);let tx=null,tz=null,spd=0,anim='pe',olha=dp<10,ty=null;
  if(s.st==='morto'){s.mortoT+=dt;ch.vis=s.mortoT<90&&dp<100;if(ch.sk)ch.sk.ct=0;ch.x=s.x;ch.z=s.z;ch.y=s.y;return;}
  if(s.st==='caido'){s.caidoT-=dt;if(ch.sk)ch.sk.ct=0;ch.x=s.x;ch.z=s.z;ch.y=s.y;ch.vis=dp<100;
    const cura=SOBREV.find(q=>q!==s&&q.st==='base'&&q.tarefa==='curar'&&d2(q.x,q.z,s.x,s.z)<14*14);if(cura&&s.caidoT<41){s.st=s.antes||'base';s.hp=40;skParar(ch,4);feed(cura.nome+' levantou '+s.nome);return;}
    if(s.caidoT<=0){s.st='morto';s.mortoT=0;toast('alerta',s.nome+' não resistiu.');sfx('morteZ',s.x,s.z,0.5);}return;}
  if(sobAtivo(s)&&s.danoT<=0&&s.hp<s.hpMax)s.hp=Math.min(s.hpMax,s.hp+1.2*dt);
  // primeiro encontro: aparecem os zumbis do cerco
  if((s.st==='espera'||s.st==='pede')&&dp<40&&Math.abs(P.y-s.y)<4){if(s.st==='espera'){s.st='pede';s.conhecido=true;}
    if(s.def.pede==='cercado'&&!s.cercoFeito){s.cercoFeito=true;const n=3+(Math.random()<0.5?1:0);
      for(let k=0;k<n;k++){for(let t=0;t<14;t++){const a=Math.random()*6.283,r=3.5+Math.random()*3.5,x=s.x+Math.cos(a)*r,z=s.z+Math.sin(a)*r,y=chaoEm(x,z,s.y+0.4);
          if(Math.abs(y-s.y)<0.6&&!bloqueadoAlto(x,z,0.4,y+0.2)){const q=criarZ(k===3?'runner':'walker',x,z,{y,cerco:s.id,cidade:dentroCidade(x,z,2),st:'vaga',hx:x,hz:z});if(q){q.st='caca';q.viu=0;q.lx=P.x;q.lz=P.z;q.ly=P.y;}break;}}}
      dica('cerco','alerta','Tem alguém encurralado por zumbis aqui perto. Acabe com eles e fale com a pessoa.');}
    if(s.falaT<=0&&dp<9&&!(s.def.pede==='cercado'&&!cercoVivo(s))){sobFala(s,s.def.pede==='cercado'?s.def.falas.cerco:s.def.falas.pede);s.falaT=40;}}
  // combate (quem já está com você)
  let lutou=null;if(sobAtivo(s))lutou=sobrevLuta(s,dt);
  switch(s.st){
    case'espera':case'pede':{olha=dp<14;anim=s.def.pede==='cercado'&&cercoVivo(s)?'agacha':dp<14?'acena':'pe';break;}
    case'aguarda':{const d=Math.hypot(s.ax-s.x,s.az-s.z);if(d>0.8){tx=s.ax;tz=s.az;spd=3;}break;}
    case'segue':{
      if(CARRO.ativo){s.noCarro=true;ch.vis=false;s.x=CARRO.x;s.z=CARRO.z;s.y=CARRO.y;return;}
      if(s.noCarro){s.noCarro=false;sobTeleporte(s,true);}
      const amigos=SOBREV.filter(q=>q.st==='segue'),k=amigos.indexOf(s),b=P.body,back=1.8+Math.floor(k/2)*1.1,side=(k%2?-1:1)*1.1,gx=P.x-Math.sin(b)*back+Math.cos(b)*side,gz=P.z-Math.cos(b)*back-Math.sin(b)*side,dg=Math.hypot(gx-s.x,gz-s.z);
      if(dp>40||(Math.abs(P.y-s.y)>2.4&&dp>5)||s.travado>=3)sobTeleporte(s,false);
      if(!(dg<0.5||(dp<2.4&&dg<1.6))){tx=gx;tz=gz;const pv=Math.hypot(P.vx,P.vz);spd=dg>6?6.4:clamp(pv+dg*0.9,1.3,6.2);}
      if(sobBase(s.x,s.z,24)&&sobBase(P.x,P.z,32)){s.st='base';progresso('sobrevBase');s.ch.tint=s.def.tint;toast('grupo',s.nome+' chegou ao acampamento. Fale com '+(/a$/.test(s.nome)?'ela':'ele')+' (E) para escolher a tarefa.');
        dica('grupo1','grupo','Cada pessoa do grupo come 1 comida por dia dos baús da clareira. A estrela ★ no painel mostra no que ela é melhor.');}
      break;}
    case'base':{const tar=s.tarefa;let alvo=null;
      if(tar==='vigiar'){const p=sobPosto(s);alvo=[p.x,p.z];if(p.torre){s.torreDe=p.torre;alvo=[p.bx,p.bz];if(d2(s.x,s.z,p.bx,p.bz)<1.3*1.3||s.naTorre){s.naTorre=true;s.x=p.x;s.z=p.z;s.y=p.y;s.torre=p.torre;alvo=null;}}else{s.torreDe=null;s.naTorre=false;}
        if(!noite&&!p.torre){const a=Math.sin(s.t*0.12+s.i)*0.6;alvo=[p.x+Math.cos(a)*1.8,p.z+Math.sin(a)*1.8];}anim=lutou?'mira':'pe';}
      else{s.torreDe=null;if(s.naTorre){s.naTorre=false;const tw=OB.find(o=>o.tipo==='torreVigia'&&d2(o.x,o.z,s.x,s.z)<4);if(tw){const b=tw.via?tw.via.base:{x:tw.x+Math.sin(tw.yaw)*1.9,z:tw.z+Math.cos(tw.yaw)*1.9};s.x=b.x;s.z=b.z;s.y=ground(s.x,s.z);}}
        // de dia, quem tem trabalho numa estação da base vai até ela e trabalha (48zd_oficio)
        const of=!noite&&typeof sobOficio==='function'?sobOficio(s,dt):null;
        if(of){alvo=of.alvo;if(of.anim)anim=of.anim;if(of.olha)s.yaw=angLerp(s.yaw,Math.atan2(of.olha[0]-s.x,of.olha[1]-s.z),1-Math.exp(-dt*5));if(tar==='curar')sobCuraEfeito(s,dt);}
        else if(noite&&tar!=='curar'){alvo=sobAssento(s);if(d2(s.x,s.z,alvo[0],alvo[1])<0.7*0.7){anim='senta';const f=baseFogo();s.yaw=angLerp(s.yaw,Math.atan2(f[0]-s.x,f[1]-s.z),1-Math.exp(-dt*3));alvo=null;}}
        else if(tar==='cozinhar'){const a=0.3+s.i,f=baseFogo(),q=[f[0]+Math.sin(a)*1.5,f[1]+Math.cos(a)*1.5];alvo=q;if(d2(s.x,s.z,q[0],q[1])<0.6*0.6){alvo=null;anim='cozinha';s.yaw=angLerp(s.yaw,Math.atan2(f[0]-s.x,f[1]-s.z),1-Math.exp(-dt*4));}
          colherHortas(s,dt);}
        else if(tar==='consertar'){const o=obraParaConsertar(s);if(o){const D=OBRAS[o.tipo],r=Math.max(D.hw,D.hd)+0.7,ang=Math.atan2(s.x-o.x,s.z-o.z),q=[o.x+Math.sin(ang)*r,o.z+Math.cos(ang)*r];alvo=q;
            if(d2(s.x,s.z,q[0],q[1])<0.9*0.9){alvo=null;anim='martela';s.yaw=angLerp(s.yaw,Math.atan2(o.x-s.x,o.z-s.z),1-Math.exp(-dt*5));o.hp=Math.min(o.hpMax,o.hp+(s.def.hab==='consertar'?7:4.5)*dt);
              s.batT=(s.batT||0)-dt;if(s.batT<=0){s.batT=0.75;sfx('madeira',o.x,o.z,0.45);poeira(o.x,o.y+0.6,o.z,1);}}}
          else{alvo=sobCasa(s);}}
        else if(tar==='curar'){alvo=[TENT[0]+1.5,TENT[1]+1.2];sobCuraEfeito(s,dt);}
        else alvo=noite?sobAssento(s):sobCasa(s);
        if(alvo&&!of&&tar!=='consertar'&&tar!=='cozinhar'&&d2(s.x,s.z,alvo[0],alvo[1])<0.8*0.8){alvo=null;if(tar==='descansar'||noite)anim='senta';}}
      if(alvo){tx=alvo[0];tz=alvo[1];spd=d2(s.x,s.z,alvo[0],alvo[1])>36?3.4:2.0;}
      break;}}
  if(s.golpeT>0)anim='golpe';else if(s.tiroT>0)anim='mira';
  // movimento
  let v=0;if(tx!==null&&spd>0&&!s.torre){v=sobAndar(s,tx,tz,spd,dt);if(v>0.05){s.amp=approach(s.amp,v>3.6?1:0.75,dt*4);s.ph+=dt*(v>3.6?11:7.5)*Math.min(1,v/2+0.3);s.paradoT=0;}}
  if(v<=0.05){s.amp=approach(s.amp,0,dt*5);s.paradoT+=dt;if(olha&&P.alive&&anim==='pe')s.yaw=angLerp(s.yaw,Math.atan2(dxp,dzp),1-Math.exp(-dt*2));}
  if(!s.torre)s.y=chaoEm(s.x,s.z,s.y+0.3);
  ch.x=s.x;ch.z=s.z;ch.y=s.y;ch.yaw=s.yaw;ch.pitch=0;ch.vis=dp<95;if(!ch.vis)return;
  poseSobrev(s,anim,dt);}
/* ---------- poses ---------- */
function poseSobrev(s,anim,dt){const o=s.ch.r,k=s.sentado=approach(s.sentado||0,anim==='senta'?1:anim==='agacha'||anim==='cozinha'?0.6:0,dt*3);
  poseLoco(o,s.ph,s.amp,G.t+s.i,s.amp>0.85);
  if(k>0.01){o[21]-=1.45*k;o[24]+=1.6*k;o[27]-=1.45*k;o[30]+=1.6*k;o[3]+=0.25*k;o[9]-=0.45*k;o[15]-=0.45*k;o[12]-=0.6*k;o[18]-=0.6*k;}
  s.ch.hipY=-0.5*k+(s.amp>0.1?-Math.abs(Math.sin(s.ph))*0.03*s.amp:0);
  if(anim==='acena'){const w=Math.sin(G.t*7);S3(o,5,-2.7,0,-0.35+w*0.25);S3(o,6,-0.5+w*0.3,0,0);}
  else if(anim==='golpe'){const B=new Float32Array(36);B.set(o);poseMelee(B,clamp(1-s.golpeT/0.5,0,1),s.def.arma==='machado'||s.def.arma==='peDeCabra');for(let i=3;i<21;i++)o[i]=B[i];o[33]=B[33];}
  else if(anim==='mira'){if(s.def.arma==='arco'){poseArco(o,1,s.tiroT>0.2?1:0.4);}else poseAim(o,1,s.tiroT>0.3?1:0);}
  else if(anim==='martela'){const B=new Float32Array(36);B.set(o);poseMelee(B,(s.t*1.3)%1,true);for(let i=3;i<21;i++)o[i]=B[i];}
  else if(anim==='cozinha'){S3(o,5,-1.0+Math.sin(s.t*3)*0.25,0,0.2);S3(o,6,-0.9,0,0);S3(o,3,-0.7,0,-0.2);S3(o,4,-0.8,0,0);}}
/* ---------- desenho ---------- */
function charsSobrev(chars){for(const s of SOBREV)if(s.ch.vis&&s.st!=='foi'&&s.st!=='fora'&&d2(s.x,s.z,P.x,P.z)<90*90)chars.push(s.ch);}
const _MSA=new Float32Array(16);
function desenharSobrevArmas(Pg){for(const s of SOBREV){if(!s.ch.vis||s.st==='morto'||s.st==='caido'||s.st==='foi'||s.st==='fora')continue;if(d2(s.x,s.z,cam.pos[0],cam.pos[2])>40*40)continue;
  const id=s.def.arma;if(id==='arco'){if(!MESH.flecha)arma2Mesh();const H=s.ch.m.subarray(4*16,5*16);mul(_MSA,H,trs(_MS,0,-0.27,0,s.tiroT>0||s.golpeT>0||(s.st==='base'&&s.tarefa==='vigiar')?0:1.75,0,0,1,1,1));drawStat(Pg,MESH.arcoM,_MSA);continue;}
  const m=MESH.arma[id];if(m)drawStat(Pg,m,s.ch.m.subarray(11*16,12*16));}}
function skCascasNpc(chars){let prog=false;for(const c of chars){if(!c.roupas||c===P.ch||!c.sk||!c.sk.t.pronto||!c.vis)continue;const t=c.sk.t;
    if(!prog){setLit(PSKC);prog=true;}gl.uniformMatrix4fv(PSKC.u.uSk,false,c.sk.skin);gl.uniform1f(PSKC.u.uIntS,interiorEm(c.x,c.y+0.3,c.z));gl.uniform3fv(PSKC.u.uTint,c.tint||[1,1,1]);gl.bindVertexArray(t.mesh.vao);
    for(const k of c.roupas){const sb=t.sub[k.sub];if(!sb||!sb.n)continue;gl.uniform1f(PSKC.u.uInfla,k.inf);gl.uniform3fv(PSKC.u.uCor,k.lin||(k.lin=lin(k.cor)));gl.uniform1f(PSKC.u.uPelo,k.pelo||0);gl.drawElements(gl.TRIANGLES,sb.n,t.mesh.tipo,sb.off);}}
  if(prog)gl.uniform1f(PSKC.u.uIntS,0);}
/* marcadores no minimapa: azul = no acampamento ou com você, amarelo = pedindo ajuda (já ouviu falar) */
function mapaSobrev(marca,sx,sz,range){for(const s of SOBREV){if(s.st==='foi'||s.st==='morto'||s.st==='fora')continue;
  if(s.st==='espera'&&!s.conhecido)continue;const cor=s.st==='caido'?'#ff4a3d':(s.st==='espera'||s.st==='pede')?'#f2d36b':'#6fb7e8';if(s.st==='base'&&d2(s.x,s.z,sx,sz)>range*range)continue;marca(s.x,s.z,cor,s.st==='pede'||s.st==='espera'?3:2.4);}}
/* o rádio conta de um sobrevivente por dia */
function sobrevRadio(){const L=SOBREV.filter(s=>s.st==='espera'&&!s.conhecido);if(!L.length)return;const s=L[Math.floor(Math.random()*L.length)];s.conhecido=true;
  const onde=s.def.onde.predio?(CID.predios.find(p=>p.nome.indexOf(s.def.onde.predio)>=0)||{nome:'a cidade'}).nome:s.def.onde.metro?'a estação do metrô':(placeById(s.def.onde.lugar)||{nome:'a mata'}).nome.toLowerCase();
  setTimeout(()=>toast('radio','Captei um pedido de socorro. Parece que tem alguém vivo em '+(s.def.onde.lugar?'':'')+onde+'. Está no seu mapa em amarelo.'),9000);}
