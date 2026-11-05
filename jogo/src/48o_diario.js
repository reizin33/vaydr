/* ================= diário: histórico da partida, descobertas, estatísticas, missões e perigo das regiões =================
   Tudo que acontece de importante entra no histórico (com dia e hora). Descobertas: lugares, regiões de fauna, oficinas,
   subterrâneos, espécies vistas e manuais. Estatísticas somam o que o jogador fez (caça, couro, roupas, zumbis, distância...).
   Perigo de cada região: zumbis por perto, predadores na população e se é noite. Abre pelo menu de pausa (Diário) ou com J. */
const DIARIO_LIMITE=160;
function diarioNovo(){return{contas:{},ev:[],desc:{},vistos:{}};}
function diarioD(){if(!G.diario||!G.diario.contas)G.diario=diarioNovo();return G.diario;}
function diarioConta(k,n){const D=diarioD();D.contas[k]=(D.contas[k]||0)+(n??1);}
function quandoTxt(tm){const d=Math.floor((tm||0)/1440)+1,h=((tm||0)%1440)/60+6;return'Dia '+d+', '+fmtHora(h%24);}
function diarioEvento(txt,cat){const D=diarioD();const ult=D.ev[D.ev.length-1];if(ult&&ult.txt===txt&&G.tm-ult.tm<30)return;D.ev.push({tm:Math.round(G.tm||0),txt,cat:cat||'geral'});if(D.ev.length>DIARIO_LIMITE)D.ev.splice(0,D.ev.length-DIARIO_LIMITE);}
/* descobre uma vez (lugar, região, oficina, subterrâneo, espécie, manual) */
function diarioDescobre(tipo,id,nome,xp){const D=diarioD(),k=tipo+':'+id;if(D.desc[k])return false;D.desc[k]={tipo,nome,tm:Math.round(G.tm||0)};
  diarioEvento((tipo==='especie'?'Viu pela primeira vez: ':'Descobriu: ')+nome,tipo);if(xp)ganharXP(xp);
  if(G.modo==='jogo'&&tipo!=='especie')feed('Descoberta: '+nome);return true;}
/* procura descobertas perto do jogador (a cada 2 s) */
let diarioT=0;
PASSOS.push(dt=>{diarioT-=dt;if(diarioT>0||!P.alive)return;diarioT=2;
  for(const p of PLACES)if(Math.hypot(P.x-p.x,P.z-p.z)<p.r+4)diarioDescobre('lugar',p.id,p.nome,15);
  if(dentroCidade(P.x,P.z,-4))diarioDescobre('lugar','cidade','Cidade abandonada',20);
  for(const Z of ZONAS_FAUNA)if(zonaDentro(Z,P.x,P.z))diarioDescobre('regiao',Z.id,Z.nome,8);
  for(const e of EST_MUNDO)if(Math.hypot(P.x-e.x,P.z-e.z)<8)diarioDescobre('oficina',e.id,e.nome,10);
  if(RIO.ok&&Math.hypot(P.x-PONTE.x,P.z-PONTE.z)<14)diarioDescobre('lugar','ponte','Ponte do Rio Claro',5);
  if(RIO.ok&&lagoR(P.x,P.z)<1.3)diarioDescobre('lugar','lago','Lago Serra Azul',8);
  for(const b of BICHOS)if(b.vivo&&b.ch.vis&&Math.hypot(b.x-P.x,b.z-P.z)<32)diarioDescobre('especie',b.tipo,FAUNA[b.tipo].nome,3);
  // distância percorrida (a pé)
  if(diarioT===2){const D=diarioD();if(D.px!==undefined&&!CARRO.ativo){const d=Math.hypot(P.x-D.px,P.z-D.pz);if(d<40)D.contas.andou=(D.contas.andou||0)+d;}D.px=P.x;D.pz=P.z;}});
/* perigo de uma região: zumbis perto, predadores na população e noite */
function perigoRegiao(ZN){let z=0;const cx=ZN.rio?rioPonto(0.5)[0]:ZN.x,cz=ZN.rio?rioPonto(0.5)[1]:ZN.z;for(const q of Z)if(q.vivo&&Math.hypot(q.x-cx,q.z-cz)<ZN.r+15)z++;
  const F=faunaEstado().z[ZN.id]||{};let pred=0;for(const sp of['lobo','urso','onca','javali'])pred+=(F[sp]?F[sp].n:0)*(sp==='urso'||sp==='onca'?3:sp==='lobo'?1.5:1);
  const v=z*1.5+pred+((E.n||0)>0.5?3:0);return v>=9?'Alto':v>=4?'Médio':'Baixo';}
/* ---------- tela ---------- */
let diarioAba='hist',diarioVolta='t-pausa';
function abrirDiario(volta){diarioVolta=volta||'t-pausa';if(G.modo==='jogo')pausar();tela('t-diario');diarioRender();}
function diarioRender(){const D=diarioD(),el=$('dr-lista');if(!el)return;for(const b of document.querySelectorAll('.dr-aba'))b.setAttribute('aria-pressed',String(b.dataset.aba===diarioAba));
  let h='',res='';const li=(ico,t,s,ok)=>'<li class="'+(ok?'ok':'')+'">'+svgUse(ico)+'<span><b>'+t+'</b>'+(s?'<small>'+s+'</small>':'')+'</span></li>';
  if(diarioAba==='hist'){res=D.ev.length+' registros · '+quandoTxt(G.tm);for(let i=D.ev.length-1;i>=0;i--){const e=D.ev[i];h+=li(DIARIO_ICO[e.cat]||'i-livro',e.txt,quandoTxt(e.tm),true);}if(!D.ev.length)h=li('i-livro','Nada anotado ainda','Explore, cace, construa: o diário anota sozinho.');}
  else if(diarioAba==='desc'){const L=Object.entries(D.desc);res=L.length+' descobertas';
    const grupos=[['lugar','Lugares'],['regiao','Regiões'],['oficina','Oficinas'],['subsolo','Subterrâneos'],['especie','Espécies vistas'],['manual','Manuais e documentos']];
    for(const[t,n]of grupos){const G2=L.filter(([k,v])=>v.tipo===t);if(!G2.length)continue;h+='<li class="dr-grupo">'+n+' ('+G2.length+')</li>';
      for(const[k,v]of G2){let s=quandoTxt(v.tm);if(t==='regiao'){const Z=faunaZona(k.split(':')[1]);if(Z)s+=' · '+Z.hab+' · perigo '+perigoRegiao(Z).toLowerCase();}
        if(t==='especie'){const sp=k.split(':')[1];s+=' · dificuldade '+FAUNA[sp].dif.toLowerCase()+' · caçados: '+(D.contas['caca_'+sp]||0);}h+=li(DIARIO_ICO[t]||'i-mapa',v.nome,s,true);}}
    if(!L.length)h=li('i-mapa','Nenhuma descoberta ainda','Ande pelo mapa: lugares, regiões, oficinas e bichos entram aqui.');}
  else if(diarioAba==='est'){const C=D.contas,F=faunaEstado();res='Dia '+G.dia+' · nível '+G.nivel;
    const L=[['Dias sobrevividos',G.dia],['Zumbis derrubados',G.kills||0],['Mortes',G.mortes||0],['Bichos caçados',Object.values(F.mortos||{}).reduce((a,b)=>a+b,0)],['Carcaças esfoladas',C.esfolou||0],
      ['Couros curtidos',C.curtiu||0],['Peças fabricadas',G.fab&&G.fab.reg?G.fab.reg.fab:0],['Consertos',G.fab&&G.fab.reg?G.fab.reg.cons:0],['Comida cozinhada',C.cozinhou||0],['Peixes pescados',C.peixes||0],
      ['Noites dormidas',C.dormiu||0],['Veículos achados',C.veiculos||0],['Distância a pé',Math.round((C.andou||0)/100)/10+' km'],['Rastros lidos',C.rastros||0]];
    for(const[n,v]of L)h+=li('i-grade',n,String(v),true);
    for(const sp of FAUNA_TIPOS){const n=(F.mortos||{})[sp]||0;if(n)h+=li('i-faca',FAUNA[sp].pl[0].toUpperCase()+FAUNA[sp].pl.slice(1)+' caçados',String(n),true);}}
  else{const T=(G.tarefas||[]).length;res='Missão principal e tarefas do rádio';
    {const mi=missaoInfo();h+=li('i-radio','Missão principal: '+mi.n,mi.t,!!(G.m&&G.m.fim));}
    const fe=D.ev.filter(e=>e.cat==='missao');for(let i=fe.length-1;i>=0;i--)h+=li('i-check',fe[i].txt,quandoTxt(fe[i].tm),true);
    for(const t of G.tarefas||[]){const TT=tarefaDef(t.id);if(TT)h+=li('i-alvo',TT.txt(t.meta||1),(t.n||0)+' de '+(t.meta||1),false);}if(!T&&!fe.length)h+=li('i-alvo','Sem tarefas no momento','');}
  $('dr-resumo').textContent=res;el.innerHTML=h;}
const DIARIO_ICO={lugar:'i-mapa',regiao:'i-mapa',oficina:'i-oficina',subsolo:'i-cadeado',especie:'i-pele',manual:'i-livro',caca:'i-faca',clima:'i-chuva',missao:'i-check',combate:'i-alerta',geral:'i-livro'};
TELAS_NOVAS.push('t-diario');
{const ab=document.querySelectorAll('.dr-aba');for(const b of ab)b.addEventListener('click',()=>{diarioAba=b.dataset.aba;diarioRender();});
 const v=document.getElementById('dr-voltar');if(v)v.addEventListener('click',()=>tela(diarioVolta));
 const p=document.getElementById('p-diario');if(p)p.addEventListener('click',()=>abrirDiario('t-pausa'));}
window.addEventListener('keydown',e=>{if(e.code==='KeyJ'&&G.modo==='jogo'&&!e.repeat){abrirDiario('t-pausa');}});
/* ganchos: o que entra sozinho no diário */
V8.novo.diario=()=>{G.diario=diarioNovo();};
V8.salvar.diario=()=>G.diario;
V8.carregar.diario=s=>{G.diario=s&&s.contas?s:diarioNovo();if(!G.diario.desc)G.diario.desc={};if(!G.diario.ev)G.diario.ev=[];};
