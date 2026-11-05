/* ================= sobreviventes trabalhando nas estações da base (Etapa 6) =================
   De dia, cada um vai até a estação do seu trabalho, trabalha um tempo (com a animação e o barulho) e o resultado vai para
   os baús da clareira. Tudo usa o que está nos baús da base:
   · cozinhar: colhe a horta madura; enche o defumador com carne ou peixe crus (2 crus + 1 madeira; charque com sal, se você
     já aprendeu) e guarda nos baús o que ficou pronto. A fogueira continua: de manhã ela assa carne e faz sopa.
   · consertar: o que estiver quebrado na base vem primeiro (como antes). Sem nada quebrado: fornalha (minério e carvão viram
     barra de ferro; madeira vira carvão quando falta), conserto das ferramentas e armas gastas guardadas nos baús (na bancada de
     armas sai 30% mais barato) e tábuas na bancada (2 madeiras → 3 tábuas) quando há pouca tábua.
   · cuidar dos feridos: continua curando você e o grupo; com pano nos baús, costura bandagens (na estação de costura, na
     bancada ou na barraca). Quem do grupo estiver muito ferido deita no colchão da base até sarar (mais rápido com enfermeira).
   · descansar: deita no colchão da base, se tiver.
   · transportar: leva para os baús o que chegou pela troca do rádio (caixa de trocas); de manhã já trazia a produção dos territórios.
   · buscar material e expedição: quando voltam, guardam o que acharam nos baús.
   · vigiar: continua na torre de vigia (ou de guarda na borda do acampamento).
   Só de dia: de noite todos ficam na fogueira (menos vigia e enfermeira) e as estações seguem trabalhando sozinhas.
   Cada estação atende uma pessoa por vez. O painel da pessoa mostra o que ela está fazendo e o que fez hoje; no fim da tarde,
   o rádio da clareira resume o trabalho do grupo (e fica no registro). */
const OF_RAIO=34;
function ofObras(tipo){return OB.filter(o=>o.tipo===tipo&&o.hp>0&&sobBase(o.x,o.z,OF_RAIO)&&Math.abs((o.y??0)-ground(o.x,o.z))<0.7);}
function ofOcupada(o,s){return SOBREV.some(q=>q!==s&&q.of&&q.of.o===o);}
function ofEstacao(tipos,s,filtro){let best=null,bd=1e18;for(const t of tipos)for(const o of ofObras(t)){if(ofOcupada(o,s)||(s.ofEvita&&s.ofEvita[o.id]>G.t))continue;if(filtro&&!filtro(o))continue;
  const d=d2(o.x,o.z,s.x,s.z);if(d<bd){bd=d;best=o;}}return best;}
function ofPosto(o,s){const D=OBRAS[o.tipo]||{},r=Math.max(D.hw||0.5,D.hd||0.5)+0.6,a0=Math.atan2(s.x-o.x,s.z-o.z);
  for(let k=0;k<8;k++){const a=a0+(k%2?1:-1)*Math.ceil(k/2)*0.785,x=o.x+Math.sin(a)*r,z=o.z+Math.cos(a)*r;if(!pointBlocked(x,z,0.3))return[x,z];}
  return[o.x+Math.sin(a0)*r,o.z+Math.cos(a0)*r];}
function ofBauPerto(s){let best=null,bd=1e18;for(const b of bausBase()){if(Math.abs((b.y??0)-ground(b.x,b.z))>0.7)continue;const d=d2(b.x,b.z,s.x,s.z);if(d<bd){bd=d;best=b;}}return best;}
function ofBase(id){return contarBase(it=>it.id===id);}
function ofTira(id,n){for(let i=0;i<n;i++)if(!tirarDaBase(it=>it.id===id))return false;return true;}
function ofHoje(s){if(!s.ofHoje||s.ofHoje.dia!==G.dia)s.ofHoje={dia:G.dia,n:{},txt:[]};return s.ofHoje;}
function ofAnota(s,chave,txt){const h=ofHoje(s);h.n[chave]=(h.n[chave]||0)+1;if(txt){h.txt.push(txt);if(h.txt.length>6)h.txt.shift();s.ofUlt=txt;}}
/* guarda um item inteiro (com estado e validade) nos baús da base; devolve true se coube todo */
function ofGuardaSlot(it){const d=ITEMS[it.id];if(!d)return false;
  if(it.dur===undefined&&d.max>1)for(const b of bausBase())for(let i=0;i<b.itens.length&&it.n>0;i++){const q=b.itens[i];
    if(q&&q.id===it.id&&q.n<d.max&&q.dur===undefined&&mesmaQual(q,it.q)){const k=Math.min(it.n,d.max-q.n);q.n+=k;it.n-=k;if(it.v!==undefined)q.v=Math.min(q.v??Infinity,it.v);}}
  if(it.n<=0)return true;for(const b of bausBase()){const i=b.itens.indexOf(null);if(i>=0){b.itens[i]=it;return true;}}return false;}
function ofBauCabe(it){const d=ITEMS[it.id];if(!d)return false;for(const b of bausBase())for(const q of b.itens){if(!q)return true;
  if(it.dur===undefined&&q.id===it.id&&q.dur===undefined&&q.n<d.max&&mesmaQual(q,it.q))return true;}return false;}
/* processos com tempo das oficinas (defumador e fornalha), usando os baús da base */
function ofProcPronto(o){return(o.ext.proc||[]).some(c=>G.tm>=c.fim);}
function ofProcPode(o,tipo,rid){const P0=PROCESSOS[tipo],R=P0&&P0.rec.find(r=>r.id===rid);if(!R||(o.ext.proc||[]).length>=P0.vagas)return false;
  if(R.manual&&!(G.fab&&G.fab.manuais&&G.fab.manuais[R.manual]))return false;for(const k in R.de)if(ofBase(k)<R.de[k])return false;return true;}
function ofProcCarrega(o,tipo,rid){if(!ofProcPode(o,tipo,rid))return null;const R=PROCESSOS[tipo].rec.find(r=>r.id===rid);for(const k in R.de)ofTira(k,R.de[k]);
  (o.ext.proc||(o.ext.proc=[])).push({r:R.id,ini:G.tm,fim:G.tm+R.h*60});return R;}
function ofProcRecolhe(o,tipo){const P0=PROCESSOS[tipo],L=o.ext.proc||[],sai=[];
  for(let i=L.length-1;i>=0;i--){const it=L[i];if(G.tm<it.fim)continue;const R=P0.rec.find(r=>r.id===it.r);L.splice(i,1);if(R)sai.push([R.para[0],it.n||R.para[1]]);}
  if(sai.length)depositarBase(sai);return sai;}
/* ferramenta ou arma gasta guardada nos baús, e quanto custa o conserto na bancada (30% menos na bancada de armas) */
function ofItemGasto(){for(const b of bausBase())for(const it of b.itens){if(!it||it.dur===undefined||SOBREV.some(q=>q.of&&q.of.it===it))continue;const d=ITEMS[it.id];if(!d||!d.durMax)continue;
  const mx=durMaxDe(it);if(mx>0&&it.dur<mx*0.6&&(REPARO[it.id]||REPARO_ARMAS[it.id]))return it;}return null;}
function ofCustoReparo(it,o){const b=REPARO[it.id]||REPARO_ARMAS[it.id];if(!b)return null;const f=1-it.dur/Math.max(1,durMaxDe(it)),k=o.tipo==='bancadaArmas'?0.7:1,c={};
  for(const q in b)c[q]=Math.max(1,Math.ceil(b[q]*f*k));return c;}
function ofTemCusto(c){for(const k in c)if(ofBase(k)<c[k])return false;return true;}
/* ---------- os trabalhos de cada tarefa (na ordem de prioridade) ---------- */
const OF_REPOUSO={id:'repousar',txt:'deitado no colchão, se recuperando',anim:'senta',fica:true,
  acha:s=>{if(s.hp>=s.hpMax*0.5)return null;const o=ofEstacao(['cama'],s);return o&&{o,deita:true};},
  enquanto:(s,j,dt)=>{const cura=SOBREV.some(q=>q!==s&&q.st==='base'&&q.tarefa==='curar');s.hp=Math.min(s.hpMax,s.hp+(cura?3:1.5)*dt);if(s.hp>=s.hpMax*0.9){ofAnota(s,'repouso','sarou no colchão');return false;}return true;}};
const OF_GUARDAR={id:'guardar',txt:'guardando nos baús o que achou',anim:'agacha',min:6,
  acha:s=>{if(s.guardar!==G.dia)return null;const b=ofBauPerto(s);if(!b){s.guardar=null;return null;}return{bau:b};},
  faz:s=>{s.guardar=null;return{chave:'guardou',txt:'guardou nos baús o que achou'};}};
const OFICIOS={
  cozinhar:[
    {id:'horta',txt:'colhendo a horta',anim:'agacha',min:4,
      acha:s=>{const o=ofEstacao(['horta'],s,o=>(o.ext.cresce||0)>=1);return o&&{o,deita:true};},
      faz:(s,j)=>{const o=j.o;if((o.ext.cresce||0)<1)return null;const L=colheita();depositarBase(L);o.ext.cresce=0;sfx('pegar',o.x,o.z,0.5);
        if(s.colheuDia!==G.dia){s.colheuDia=G.dia;toast('grupo',s.nome+' colheu a horta: '+nomesItens(L)+'.');}return{chave:'horta',txt:'colheu a horta: '+nomesItens(L)};}},
    {id:'defRecolhe',txt:'tirando do defumador o que ficou pronto',anim:'cozinha',min:6,
      acha:s=>{if(!bausBase().length)return null;const o=ofEstacao(['defumador'],s,ofProcPronto);return o&&{o};},
      faz:(s,j)=>{const L=ofProcRecolhe(j.o,'conserva');return L.length?{chave:'defRecolhe',txt:'guardou nos baús '+nomesItens(L)}:null;}},
    {id:'defumar',txt:'enchendo o defumador',anim:'cozinha',min:10,
      acha:s=>{for(const rid of['defCarne','defPeixe','charque']){const o=ofEstacao(['defumador'],s,o=>ofProcPode(o,'conserva',rid));if(o)return{o,rid};}return null;},
      faz:(s,j)=>{const R=ofProcCarrega(j.o,'conserva',j.rid);if(!R)return null;sfx('fogo',j.o.x,j.o.z,0.4);
        return{chave:'defumar',txt:R.nome.toLowerCase()+' ('+Object.entries(R.de).map(([k,n])=>n+' '+ITEMS[k].nome.toLowerCase()).join(' + ')+')'};}}],
  consertar:[
    {id:'forjaRecolhe',txt:'tirando da fornalha o que ficou pronto',anim:'martela',min:6,
      acha:s=>{if(!bausBase().length)return null;const o=ofEstacao(['fornalha'],s,ofProcPronto);return o&&{o};},
      faz:(s,j)=>{const L=ofProcRecolhe(j.o,'forja');return L.length?{chave:'forjaRecolhe',txt:'guardou nos baús '+nomesItens(L)}:null;}},
    {id:'fundir',txt:'pondo minério e carvão na fornalha',anim:'martela',min:10,
      acha:s=>{const o=ofEstacao(['fornalha'],s,o=>ofProcPode(o,'forja','barra'));return o&&{o,rid:'barra'};},
      faz:(s,j)=>ofProcCarrega(j.o,'forja',j.rid)?(sfx('fogo',j.o.x,j.o.z,0.5),{chave:'fundir',txt:'fundindo barra de ferro'}):null},
    {id:'carvao',txt:'queimando madeira em carvão',anim:'martela',min:10,
      acha:s=>{if(ofBase('carvao')>=4||ofBase('madeira')<8)return null;const o=ofEstacao(['fornalha'],s,o=>(o.ext.proc||[]).length<2&&ofProcPode(o,'forja','carvao'));return o&&{o,rid:'carvao'};},
      faz:(s,j)=>ofProcCarrega(j.o,'forja',j.rid)?(sfx('fogo',j.o.x,j.o.z,0.5),{chave:'carvao',txt:'queimando madeira em carvão'}):null},
    {id:'reparo',txt:'consertando ferramenta na bancada',anim:'martela',min:40,
      acha:s=>{const it=ofItemGasto();if(!it)return null;for(const t of['bancadaArmas','bancadaTrab']){const o=ofEstacao([t],s);if(o&&ofTemCusto(ofCustoReparo(it,o)))return{o,it};}return null;},
      faz:(s,j)=>{const it=j.it;if(!bausBase().some(b=>b.itens.includes(it))||it.dur>=durMaxDe(it)*0.6)return null;const c=ofCustoReparo(it,j.o);if(!c||!ofTemCusto(c))return null;
        for(const k in c)ofTira(k,c[k]);it.dur=durMaxDe(it);return{chave:'reparo',txt:'consertou '+ITEMS[it.id].nome.toLowerCase()+' ('+Object.entries(c).map(([k,n])=>n+' '+ITEMS[k].nome.toLowerCase()).join(', ')+')'};}},
    {id:'tabuas',txt:'fazendo tábuas na bancada',anim:'martela',min:30,
      acha:s=>{if((ofHoje(s).n.tabuas||0)>=6||ofBase('madeira')<6||ofBase('tabuas')>=24)return null;const o=ofEstacao(['bancadaTrab'],s);return o&&{o};},
      faz:()=>{if(!ofTira('madeira',2))return null;depositarBase([['tabuas',3]]);return{chave:'tabuas',txt:'fez 3 tábuas com 2 madeiras'};}}],
  curar:[
    {id:'bandagem',txt:'costurando bandagens',anim:'cozinha',min:30,
      acha:s=>{if((ofHoje(s).n.bandagem||0)>=4||ofBase('pano')<2||ofBase('bandagem')>=10||!bausBase().length)return null;
        const o=ofEstacao(['estacaoCouro'],s)||ofEstacao(['bancadaTrab'],s);return o?{o}:{pos:[TENT[0]+1.6,TENT[1]+1.0],olha:[TENT[0],TENT[1]]};},
      faz:()=>{if(!ofTira('pano',2))return null;depositarBase([['bandagem',1]]);return{chave:'bandagem',txt:'costurou 1 bandagem com 2 panos'};}}],
  descansar:[{id:'colchao',txt:'descansando no colchão',anim:'senta',fica:true,acha:s=>{const o=ofEstacao(['cama'],s);return o&&{o,deita:true};}}],
  transportar:[
    {id:'trocas',txt:'levando as trocas para os baús',anim:'agacha',min:6,
      acha:s=>{const D=G.terr;if(!D||!D.caixaTrocas||!D.caixaTrocas.some(it=>it&&ofBauCabe(it)))return null;return{pos:[CAIXA_TROCAS.x+0.9,CAIXA_TROCAS.z+0.7],olha:[CAIXA_TROCAS.x,CAIXA_TROCAS.z]};},
      faz:s=>{const b=ofBauPerto(s);return b?{leva:b}:null;},
      entrega:()=>{const D=G.terr,L=D&&D.caixaTrocas,mov=[];if(!L)return null;
        for(let i=0;i<L.length;i++){const it=L[i];if(!it)continue;const n0=it.n;if(ofGuardaSlot(it)){L[i]=null;mov.push([it.id,n0]);}else if(it.n<n0)mov.push([it.id,n0-it.n]);}
        return mov.length?{chave:'trocas',txt:'guardou nos baús as trocas: '+nomesItens(mov)}:null;}}],
  buscar:[OF_GUARDAR],expedicao:[OF_GUARDAR],vigiar:[]};
/* dicas no painel quando falta estação ou material */
function ofDica(s){const t=s.tarefa;if(!bausBase().length&&t!=='vigiar'&&t!=='descansar')return'Sem baú perto da fogueira, não tem onde pegar material nem guardar o que fizer.';
  if(t==='cozinhar'&&!ofObras('defumador').length)return'Com um defumador na base, ela enche com a carne crua dos baús e guarda o que ficar pronto (dura dias).';
  if(t==='cozinhar')return'Guarde carne ou peixe crus e madeira nos baús: ela leva para o defumador.';
  if(t==='consertar'&&!ofObras('fornalha').length&&!ofObras('bancadaTrab').length&&!ofObras('bancadaArmas').length)return'Com bancada, bancada de armas ou fornalha na base, trabalha nelas quando nada está quebrado.';
  if(t==='consertar')return'Sem nada quebrado: fornalha (minério e carvão nos baús), ferramentas gastas nos baús e tábuas (madeira nos baús).';
  if(t==='curar')return ofBase('pano')<2?'Com pano nos baús, ela costura bandagens.':'Cura quem estiver perto e costura bandagens com o pano dos baús.';
  if(t==='descansar')return ofObras('cama').length?'':'Com um colchão na base, descansa nele.';
  if(t==='transportar')return'Leva para os baús o que chega na caixa de trocas e, de manhã, a produção dos territórios.';
  if(t==='vigiar')return ofObras('torreVigia').length?'':'Com uma torre de vigia, fica lá em cima e enxerga mais longe.';
  return'';}
/* ---------- máquina de trabalho de cada um (chamada pelo movimento dos sobreviventes, de dia) ---------- */
function ofLista(s){const L=[];if(s.tarefa!=='vigiar')L.push(OF_REPOUSO);for(const J of OFICIOS[s.tarefa]||[])L.push(J);return L;}
function ofProcura(s){for(const J of ofLista(s)){let r=null;try{r=J.acha(s);}catch(e){console.error('oficio '+J.id,e);}
  if(r)return Object.assign({J,tar:s.tarefa,fase:'vai',t0:G.t,ini:null},r);}return null;}
function ofPos(j,s){if(j.pos)return j.pos;const a=j.o||j.bau;if(!a)return null;j.pos=j.deita?[a.x,a.z]:ofPosto(a,s);return j.pos;}
function ofConclui(s,j,r){s.of=null;s.ofT=0.6;if(r)ofAnota(s,r.chave||j.J.id,r.txt);}
function sobOficio(s,dt){let j=s.of;
  if(j&&(j.tar!==s.tarefa||(j.o&&(!OB.includes(j.o)||j.o.hp<=0))||(j.bau&&!OB.includes(j.bau))||(j.bau2&&!OB.includes(j.bau2)))){s.of=j=null;}
  // consertar: obra quebrada na base vem antes (o trabalho de sempre cuida); quem está ferido no colchão continua lá
  if(s.tarefa==='consertar'&&(!j||j.J!==OF_REPOUSO)&&obraParaConsertar(s)){s.of=null;return null;}
  if(!j){s.ofT=(s.ofT||0)-dt;if(s.ofT>0)return null;s.ofT=1.5;j=s.of=ofProcura(s);if(!j)return null;}
  const J=j.J;
  if(j.fase==='vai'||j.fase==='leva'){const p=j.fase==='leva'?j.levaPos:ofPos(j,s);if(!p){s.of=null;return null;}
    if(Math.hypot(p[0]-s.x,p[1]-s.z)>(j.deita?0.6:0.9)){
      if(G.t-j.t0>45){// travou no caminho: quem leva entrega assim mesmo; quem ia trabalhar evita a estação por um tempo
        if(j.fase==='leva'){ofConclui(s,j,J.entrega(s,j));return null;}if(j.o)(s.ofEvita||(s.ofEvita={}))[j.o.id]=G.t+90;s.of=null;s.ofT=4;return null;}
      return{alvo:p};}
    if(j.fase==='leva'){ofConclui(s,j,J.entrega(s,j));return{alvo:null,anim:'agacha',olha:[j.bau2.x,j.bau2.z]};}
    j.fase='trab';j.ini=G.tm;}
  const a=j.o||j.bau,olha=j.olha||(a&&!j.deita?[a.x,a.z]:null);
  if(J.fica){if(J.enquanto&&!J.enquanto(s,j,dt)){s.of=null;s.ofT=1;}return{alvo:null,anim:J.anim,olha};}
  if(J.anim==='martela'){s.batT=(s.batT||0)-dt;if(s.batT<=0&&a){s.batT=0.8;sfx('madeira',a.x,a.z,0.35);}}
  if(G.tm-j.ini<(J.min||8))return{alvo:null,anim:J.anim||'martela',olha};
  let r=null;try{r=J.faz(s,j);}catch(e){console.error('oficio '+J.id,e);}
  if(r&&r.leva){j.fase='leva';j.bau2=r.leva;j.levaPos=ofPosto(r.leva,s);j.t0=G.t;return{alvo:j.levaPos};}
  ofConclui(s,j,r);return{alvo:null,anim:'pe',olha};}
/* quem buscou material ou voltou de expedição vai guardar nos baús */
{const _v=sobrevVoltam;sobrevVoltam=function(){const fora=SOBREV.filter(s=>s.st==='fora'&&!s.expAtual);_v.apply(this,arguments);for(const s of fora)if(s.st==='base')s.guardar=G.dia;};}
{const _e=expVoltam;expVoltam=function(){const fora=SOBREV.filter(s=>s.st==='fora'&&s.expAtual);_e.apply(this,arguments);for(const s of fora)if(s.st==='base')s.guardar=G.dia;};}
/* ---------- painel da pessoa: o que está fazendo e o que fez hoje ---------- */
function oficioTexto(s){if(!s||s.st!=='base')return'';const h=ofHoje(s),noite=G.noite||G.hora>=19.6||G.hora<5.6;let t='';
  if(s.of)t='<b>Agora:</b> '+s.of.J.txt+'.';else if(noite&&s.tarefa!=='vigiar'&&s.tarefa!=='curar')t='<b>Agora:</b> descansando na fogueira (de noite as estações trabalham sozinhas).';
  else{const d=ofDica(s);t=d?'<b>Sem trabalho na estação agora.</b> '+d:'<b>Agora:</b> '+(SOB_TAREFAS[s.tarefa]||{n:''}).n.toLowerCase()+'.';}
  if(h.txt.length)t+='<small>Hoje: '+h.txt.slice(-3).join(' · ')+'</small>';return t;}
{const _gr=grupoRender;grupoRender=function(){_gr.apply(this,arguments);const el=$('g-agora');if(!el)return;const t=oficioTexto(grupoSel);el.hidden=!t;el.innerHTML=t;};}
/* ---------- fim da tarde: o rádio resume o trabalho do grupo ---------- */
const OF_RESUMO={horta:n=>'colheu a horta',defRecolhe:n=>'tirou do defumador o que ficou pronto',defumar:n=>'encheu o defumador '+(n>1?n+' vezes':'uma vez'),
  forjaRecolhe:n=>'tirou da fornalha o que ficou pronto',fundir:n=>'fundiu ferro '+(n>1?n+' vezes':'uma vez'),carvao:n=>'fez carvão',reparo:n=>'consertou '+n+(n>1?' ferramentas':' ferramenta'),
  tabuas:n=>'fez '+3*n+' tábuas',bandagem:n=>'costurou '+n+(n>1?' bandagens':' bandagem'),trocas:n=>'guardou as trocas nos baús',guardou:n=>'guardou o que achou',repouso:n=>'sarou no colchão'};
let ofResHora=null;
PASSOS.push(()=>{if(typeof SOBREV==='undefined')return;const h=G.hora;if(ofResHora!==null&&crossed(ofResHora,h,19.3)&&G.modo==='jogo'){const L=[];
    for(const s of SOBREV){if(s.st!=='base'||!s.ofHoje||s.ofHoje.dia!==G.dia)continue;const p=Object.entries(s.ofHoje.n).map(([k,n])=>OF_RESUMO[k]?OF_RESUMO[k](n):null).filter(Boolean);if(p.length)L.push(s.nome+' '+listaE(p));}
    if(L.length){const txt='Trabalho do grupo hoje: '+L.join('; ')+'.';toast('grupo',txt);terrRegistro(txt,'grupo');}}
  ofResHora=h;});
