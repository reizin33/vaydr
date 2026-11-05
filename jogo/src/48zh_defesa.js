/* ================= Etapa 10: defesa e interiores =================
   Porta de madeira: toque E abre e fecha; segure E abre o painel da porta.
   · cadeado com senha de 4 números (2 sucatas e 1 prego): o teclado fica do lado onde você está ao instalar (o lado de fora).
     De fora, a porta fechada só abre com a senha; por dentro abre pela maçaneta. Dá para deixar o cadeado aberto, trocar a senha
     ou tirar o cadeado. Zumbi não usa cadeado: arromba.
   · tranca por dentro (2 tábuas e 2 pregos): passada, ninguém abre de fora, nem com a senha, e a porta leva 40% menos dano.
   · reforço com chapas (2 chapas de ferro e 4 pregos, ou 8 sucatas e 6 pregos): +480 de vida. Também dá para construir a
     "Porta reforçada" pronta, na aba Casa.
   Janela da casa: toque E abre e fecha a persiana; segure E abre o painel da janela.
   · persiana fechada tampa o vão (não entra tiro nem olhar, e a luz de dentro quase não sai);
   · tábuas empilhadas (5 tábuas e 4 pregos: aguentam 300 de pancada e tampam o vão) ou cruzadas em X (2 tábuas e 2 pregos:
     aguentam 120 e deixam olhar e atirar). O zumbi quebra as tábuas antes da janela. Tábuas do lado da persiana prendem a persiana.
   Janelas dos prédios e casas: além das tábuas empilhadas, as tábuas em X (mais baratas e mais fracas).
   Muros: paliçada alta de troncos apontados (3,4 m), muralha de pedra grossa com ameias e o portão grande (6 m, duas folhas,
   abre sozinho quando você ou o carro chegam perto; zumbi não passa). Encaixam na ponta dos muros, das paredes e uns dos outros.
   Revestimento de metal (aba Casa): mire uma parede ou janela da casa; as chapas vão do lado onde você está (+520 de vida).
   Na porta vira o reforço.
   Armadilha de mandíbula: prende o zumbi (ou o bicho) que pisar e machuca; depois aperte E para armar de novo.
   Consertar tudo (modo construção, botão ou tecla T): conserta de uma vez o que está danificado na base (perto da clareira ou
   perto de você), gastando material conforme o estrago; o mais danificado vem primeiro.
   Móveis (aba nova): cama de madeira, mesa, cadeira, estante (guarda 16 espaços) e a lamparina de parede, que encaixa em
   parede, janela, porta, muro e paliçada. O colchão, o baú, a despensa, o armário e a lamparina passam para essa aba.
   Conforto: a cama, móveis e luz acesa por perto e um teto em cima contam pontos (até 6). Dormir com mais conforto descansa
   mais rápido e cura mais ao acordar.
   À noite, a luz das lamparinas e do fogo dentro de casa sai pelas janelas. Sons da casa: passos no assoalho, persiana,
   tranca, cadeado, rangido do portão grande e da casa à noite.
   Geladeira e freezer ficam para a Etapa 17 (energia). */
iconesNovos({
  'i-palicada':'<path d="M5 21V7.5l1.5-3 1.5 3V21M10.5 21V6.5l1.5-3 1.5 3V21M16 21V7.5l1.5-3 1.5 3V21"/><path d="M3.5 11.5h17M3.5 17h17"/>',
  'i-muralha':'<path d="M3 21V9h2.6V6h3v3h2V6h3v3h2V6h3v3H21v12z"/><path d="M3 14h18M8 14v3.5M16 14v3.5M12 17.5V21M3 17.5h18"/>',
  'i-portao-grande':'<path d="M2.5 21V4.5M21.5 21V4.5M2 4h20"/><path d="M4.5 20.5V7l3.5-1 3.5 1v13.5M12.5 20.5V7l3.5-1 3.5 1v13.5"/><path d="M4.5 11h7M12.5 11h7M4.5 16h7M12.5 16h7"/>',
  'i-porta-ref':'<path d="M6.5 21V4.6A1.6 1.6 0 0 1 8.1 3h7.8a1.6 1.6 0 0 1 1.6 1.6V21"/><path d="M4 21h16M6.5 8h11M6.5 15.5h11"/><path d="M9 5.6h.01M15 5.6h.01M9 18h.01M15 18h.01" stroke-width="2.4"/>',
  'i-tabuas-x':'<rect x="4" y="4" width="16" height="16" rx="1.2"/><path d="m5.5 6.5 13 11M18.5 6.5l-13 11"/>',
  'i-mesa':'<path d="M2.5 9.5h19"/><path d="M5 9.5V20M19 9.5V20M5 13.5h14"/>',
  'i-cadeira':'<path d="M7.5 3v18M7.5 12.5H17V21"/><path d="M7.5 7.5H12"/>',
  'i-estante':'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M5 9h14M5 15h14M8 6.5h2.5M13 12.5h3M8 18.5h4"/>',
  'i-lamp-parede':'<path d="M4 3.5v17"/><path d="M4 8h5.5v3"/><path d="M8 11h3.2l.8 1.2v5.3a2 2 0 0 1-4 0v-5.3z"/><path d="M10 14.5v.01" stroke-width="2.4"/>',
  'i-armadilha':'<path d="M3 16h18"/><path d="M5 16a7 7 0 0 1 14 0"/><path d="m7 12.5 1 2 1-2.8 1 2.6 1-2.9 1 2.9 1-2.9 1 2.6 1-2.8 1 2"/><circle cx="12" cy="19" r="1.4"/>',
  'i-moveis':'<path d="M2.5 11h11"/><path d="M4 11v9M12 11v9"/><path d="M16 4v16M16 13h5.5v7M21.5 13V8.5"/>'});

/* ---------- peças novas ---------- */
Object.assign(OBRAS,{
  palicada:{nome:'Paliçada',icon:'i-palicada',custo:{madeira:8,corda:2},hp:520,hw:1.5,hd:0.2,solid:true,hCol:3.4,etapa:2,alvo:alvoSegMuro,pts:7},
  muralha:{nome:'Muralha de pedra',icon:'i-muralha',custo:{pedra:14,tabuas:2},hp:1700,hw:1.5,hd:0.42,solid:true,hCol:3.15,etapa:3,desb:'noite1',alvo:alvoSegMuro,pts:12},
  portaoGrande:{nome:'Portão grande',icon:'i-portao-grande',custo:{tabuas:16,pregos:10,sucata:4,corda:2},hp:1300,hw:3.0,hd:0.25,solid:true,portao:true,etapa:3,desb:'noite1',montar:portaoGrandeMontar,alvo:alvoSegMuro,pts:16},
  portaReforcada:{nome:'Porta reforçada',icon:'i-porta-ref',custo:{tabuas:6,pregos:6,sucata:8},hp:760,hw:1.5,hd:0.14,solid:true,etapa:2,alvo:alvoParede},
  revestimento:{nome:'Revestimento de metal',icon:'i-chapa',custo:{sucata:8,pregos:6},hp:520,hw:1.5,hd:0.1,solid:false,etapa:2},
  tabuasJanelaX:{nome:'Tábuas em X na janela',icon:'i-tabuas-x',custo:{tabuas:2,pregos:2},hp:120,hw:0.7,hd:0.1,solid:true,etapa:1,montar:tabuasXMontar},
  armadilhaUrso:{nome:'Armadilha de mandíbula',icon:'i-armadilha',custo:{sucata:5,pregos:2,corda:1},hp:140,hw:0.42,hd:0.42,solid:false,armadilha:true,etapa:2},
  camaMadeira:{nome:'Cama de madeira',icon:'i-cama',custo:{tabuas:8,pregos:4,pano:4},hp:140,hw:0.62,hd:1.05,solid:true,hCol:0.62,peq:true,etapa:2},
  mesa:{nome:'Mesa',icon:'i-mesa',custo:{tabuas:6,pregos:4},hp:110,hw:0.75,hd:0.45,solid:true,hCol:0.8,peq:true,etapa:2},
  cadeira:{nome:'Cadeira',icon:'i-cadeira',custo:{tabuas:3,pregos:2},hp:70,hw:0.25,hd:0.25,solid:true,hCol:0.95,peq:true,etapa:2},
  prateleira:{nome:'Estante',icon:'i-estante',custo:{tabuas:6,pregos:4},hp:130,hw:0.55,hd:0.2,solid:true,bau:true,peq:true,etapa:2},
  lampParede:{nome:'Lamparina de parede',icon:'i-lamp-parede',custo:{sucata:2,pano:1,graveto:2},hp:50,hw:0.15,hd:0.15,solid:false,luz:true,lamp:true,etapa:2,montar:lampParedeMontar}});
OBRA_ORDEM.push('palicada','muralha','portaoGrande','portaReforcada','revestimento','tabuasJanelaX','armadilhaUrso','camaMadeira','mesa','cadeira','prateleira','lampParede');
{const ins=(L,depois,...ks)=>{if(!L)return;const i=L.indexOf(depois);L.splice(i>=0?i+1:L.length,0,...ks.filter(k=>!L.includes(k)));},add=(L,...ks)=>{if(L)for(const k of ks)if(!L.includes(k))L.push(k);};
  ins(OBRAS_CHAO,'muroPedra','palicada','muralha');ins(OBRAS_CHAO,'portao','portaoGrande');ins(OBRAS_CHAO,'portaMadeira','portaReforcada');
  add(OBRAS_CHAO,'revestimento','armadilhaUrso','camaMadeira','mesa','cadeira','prateleira','lampParede');
  add(OBRAS_ALTO,'revestimento','camaMadeira','mesa','cadeira','prateleira','lampParede');
  ins(OBRAS_PREDIO,'tabuasJanela','tabuasJanelaX');add(OBRAS_PREDIO,'armadilhaUrso','camaMadeira','mesa','cadeira','prateleira');
  if(OBRAS_CHAO.includes('tabuasJanela'))ins(OBRAS_CHAO,'tabuasJanela','tabuasJanelaX');}
/* abas do menu: muros e defesa ganham as peças novas; a aba Móveis junta o que é de dentro de casa.
   As abas são criadas pela interface (60_ui.js, que carrega depois deste arquivo): a mudança é feita assim que tudo carrega. */
let defesaAbasFeitas=false;
function defesaAbas(){if(defesaAbasFeitas||typeof OBRA_CATS==='undefined')return;defesaAbasFeitas=true;
  const c=id=>OBRA_CATS.find(q=>q.id===id),MOV=['camaMadeira','cama','mesa','cadeira','prateleira','bau','despensa','armarioFerro','lamparina','lampParede'];
  c('muros').t.push('palicada','muralha','portaoGrande');c('defesa').t.push('armadilhaUrso');c('casa').t.push('portaReforcada','revestimento','tabuasJanelaX');
  const b=c('base');b.t=b.t.filter(k=>!MOV.includes(k));OBRA_CATS.splice(OBRA_CATS.indexOf(c('casa'))+1,0,{id:'moveis',nome:'Móveis',ico:'i-moveis',t:MOV});}
setTimeout(()=>{try{defesaAbas();}catch(e){console.error('abas da defesa',e);}},0);
{const _h=hudObras;hudObras=function(){try{defesaAbas();}catch(_){}return _h.apply(this,arguments);};}
Object.assign(BASE_DICAS,{
  portaMadeira:'Porta pronta. Toque E abre e fecha. Segure E para pôr cadeado com senha, tranca por dentro ou chapas de reforço.',
  janela:'Janela pronta. Dá para olhar e atirar por ela. Toque E abre e fecha a persiana; segure E para pregar tábuas (empilhadas ou em X).',
  janelaAlta:'Janela pronta. Dá para olhar e atirar por ela. Toque E abre e fecha a persiana; segure E para pregar tábuas.',
  palicada:'Paliçada de pé: troncos de 3,4 m, difícil de passar. A próxima encaixa na ponta, e o portão grande também.',
  muralha:'Muralha de pedra pronta: o muro mais forte que dá para levantar com pedra. Encaixe a próxima na ponta.',
  portaoGrande:'Portão grande pronto: abre sozinho quando você ou o carro chegam perto. Zumbi não passa.',
  armadilhaUrso:'Armadilha armada: o primeiro zumbi ou bicho que pisar fica preso e se machuca. Depois aperte E para armar de novo.',
  camaMadeira:'Cama pronta. Toque E: vira seu ponto de volta. Segure E: dormir. Móveis, luz acesa e teto perto da cama deixam o sono mais confortável.',
  mesa:'Mesa pronta. Móveis perto da cama deixam o sono mais confortável.',cadeira:'Cadeira pronta. Móveis perto da cama deixam o sono mais confortável.',
  prateleira:'Estante pronta: guarda 16 espaços, como o baú (aperte E).',lampParede:'Lamparina de parede acesa. À noite a luz sai pelas janelas. E apaga e acende.'});

/* lado de um ponto em relação à peça: +1 na frente (z local positivo), -1 atrás */
const ladoDe=(o,x,z)=>((x-o.x)*Math.sin(o.yaw)+(z-o.z)*Math.cos(o.yaw))>=0?1:-1;
const pagar=c=>{invPay(c);if(typeof anotarGasto==='function')anotarGasto(c);};
function custoChapa(){return invCount('chapaFerro')>=2?{chapaFerro:2,pregos:4}:{sucata:8,pregos:6};}
{const _co=custoObra;custoObra=function(k){if(k==='revestimento')return custoChapa();if(k==='portaReforcada'&&invCount('chapaFerro')>=2)return{tabuas:6,pregos:6,chapaFerro:2};return _co.apply(this,arguments);};}

/* ---------- porta: cadeado com senha, tranca por dentro e reforço ---------- */
const CAD_CUSTO={sucata:2,pregos:1},TRANCA_CUSTO={tabuas:2,pregos:2},REFORCO_HP=480;
function portaDentro(o){const E=o.ext;return E.dentro?ladoDe(o,P.x,P.z)===E.dentro:true;}
function portaTocar(o){const E=o.ext;if(E.aberta){portaAlternar(o);return;}
  const dentro=portaDentro(o);
  if(E.tr==='passada'){if(dentro){E.tr='livre';sfx('tranca',o.x,o.z,0.8);portaAlternar(o);feed('Você levantou a tranca e abriu a porta');}
    else{sfx('portaPresa',o.x,o.z,0.9);barulho(o.x,o.z,5,true,o.y);feed('Trancada por dentro',true);}return;}
  if(E.cad==='fechado'&&E.senha&&!dentro){portaTeclado(o);return;}
  portaAlternar(o);}
function portaTeclado(o){abrirTeclado({x:o.x,z:o.z,titulo:'Cadeado da porta',codigo:()=>o.ext.senha,abrir:()=>{sfx('bipe',o.x,o.z,0.6);if(!o.ext.aberta)portaAlternar(o);feed('Senha certa: porta aberta');}});}
function portaSenhaNova(o){abrirTeclado({x:o.x,z:o.z,titulo:o.ext.senha?'Senha nova do cadeado':'Escolha a senha do cadeado',
  definir:t=>{o.ext.senha=t;o.ext.cad='fechado';sfx('bipe',o.x,o.z,0.6);toast('corpo','Senha do cadeado: '+t+'. De fora, a porta fechada só abre com ela; por dentro abre normal.');}});}
function portaReforcar(o){const c=custoChapa();if(o.ext.reforco)return'Essa porta já tem chapas.';if(!invHas(c))return'Faltam materiais: '+custoTxt(c)+'.';
  pagar(c);o.ext.reforco=1;o.hpMax+=REFORCO_HP;o.hp+=REFORCO_HP;sfx('construir',o.x,o.z);sfx('chapa',o.x,o.z,0.6);barulho(o.x,o.z,12,true,o.y);ganharXP(8);return'Porta reforçada com chapas: agora aguenta '+Math.round(o.hpMax)+'.';}
/* teclado: título de quem abriu e o modo "escolher a senha" (sem conferir código) */
{const _ab=abrirTeclado;abrirTeclado=function(d){_ab.apply(this,arguments);const h=document.querySelector('#t-teclado h2');if(h)h.textContent=(d&&d.titulo)||'Teclado';};
  const _tt=tecladoTecla;tecladoTecla=function(k){const d=tecladoPorta;
    if(d&&d.definir&&k==='ok'){const msg=$('tc-msg');if(tecladoTxt.length<4){sfx('erroBip');if(msg)msg.textContent='A senha tem 4 números';return;}
      const t=tecladoTxt;fecharTeclado();d.definir(t);return;}
    return _tt.apply(this,arguments);};}
function abrirPainelPorta(o){abrirEstacao({estTipo:'__porta',o,ext:o.ext,nome:o.ext.reforco?'Porta reforçada':'Porta de madeira'});}
ESTACAO_UI.__porta={render(st){const o=st.o,E=o.ext,dentro=portaDentro(o),A=[];st.nome=E.reforco?'Porta reforçada':'Porta de madeira';
    const L=['Vida: <b>'+Math.round(o.hp)+' de '+Math.round(o.hpMax)+'</b>'+(E.reforco?' · com chapas de ferro':''),
      'Cadeado: '+(E.cad?(E.cad==='fechado'?'<b>fechado</b>':'aberto')+(E.senha?(dentro?' · senha <b>'+E.senha+'</b>':' · senha ••••'):' · sem senha'):'nenhum'),
      'Tranca: '+(E.tr?(E.tr==='passada'?'<b>passada</b>':'levantada'):'nenhuma'),
      E.dentro?'Você está do lado de <b>'+(dentro?'dentro':'fora')+'</b>.':'O teclado do cadeado fica do lado onde você está; a tranca, do lado de dentro.'];
    if(!E.cad)A.push({id:'cadPor',t:'Pôr cadeado com senha',s:custoTxt(CAD_CUSTO)+' · o teclado fica deste lado',ok:invHas(CAD_CUSTO)&&(!E.dentro||!dentro),prim:true});
    else if(dentro){if(!E.senha)A.push({id:'cadSenha',t:'Escolher a senha',s:'4 números',prim:true});
      else{A.push({id:'cadArma',t:E.cad==='fechado'?'Deixar o cadeado aberto':'Fechar o cadeado',s:E.cad==='fechado'?'qualquer um abre a porta':'de fora, só abre com a senha'});A.push({id:'cadSenha',t:'Trocar a senha',s:'4 números'});}
      A.push({id:'cadTirar',t:'Tirar o cadeado',s:'devolve 1 sucata'});}
    else if(E.cad==='fechado'&&E.senha&&!E.aberta)A.push({id:'cadDigitar',t:'Digitar a senha',s:'abre a porta',prim:true});
    if(!E.tr)A.push({id:'trPor',t:'Pôr tranca por dentro',s:E.dentro&&!dentro?'a tranca vai do lado de dentro':custoTxt(TRANCA_CUSTO)+' · fica deste lado',ok:invHas(TRANCA_CUSTO)&&(!E.dentro||dentro)});
    else A.push({id:'trAlt',t:E.tr==='passada'?'Levantar a tranca':'Passar a tranca',s:!dentro?'só por dentro':E.tr==='passada'?'a porta volta a abrir':E.aberta?'feche a porta antes':'ninguém abre de fora',ok:dentro&&(E.tr==='passada'||!E.aberta)});
    if(!E.reforco){const c=custoChapa();A.push({id:'reforcar',t:'Reforçar com chapas',s:custoTxt(c)+' · +'+REFORCO_HP+' de vida',ok:invHas(c)});}
    {const c=custoReparoObra(o);if(c)A.push({id:'consertar',t:'Consertar a porta',s:custoTxt(c),ok:invHas(c)});}
    return{sub:'Toque E abre e fecha. Zumbi não usa cadeado: arromba. Com a tranca passada a porta segura mais as pancadas.',corpo:'<p class="es-info">'+L.join('<br>')+'</p>',acoes:A};},
  acao(st,id){const o=st.o,E=o.ext;if(!OB.includes(o))return'A porta não existe mais.';const dentro=portaDentro(o);
    if(id==='cadPor'){if(E.cad)return'Já tem cadeado.';if(!invHas(CAD_CUSTO))return'Faltam materiais.';pagar(CAD_CUSTO);E.cad='aberto';E.dentro=-ladoDe(o,P.x,P.z);sfx('construir',o.x,o.z);fecharEstacao();portaSenhaNova(o);return'';}
    if(id==='cadSenha'){fecharEstacao();portaSenhaNova(o);return'';}
    if(id==='cadArma'){E.cad=E.cad==='fechado'?'aberto':'fechado';sfx('clique');return E.cad==='fechado'?'Cadeado fechado: de fora, só com a senha.':'Cadeado aberto: a porta abre para qualquer um.';}
    if(id==='cadTirar'){delete E.cad;delete E.senha;if(!E.tr)delete E.dentro;invAdd('sucata',1);sfx('clique');return'Cadeado tirado.';}
    if(id==='cadDigitar'){fecharEstacao();portaTeclado(o);return'';}
    if(id==='trPor'){if(E.tr)return'Já tem tranca.';if(E.dentro&&!dentro)return'A tranca vai do lado de dentro.';if(!invHas(TRANCA_CUSTO))return'Faltam materiais.';pagar(TRANCA_CUSTO);E.tr='livre';if(!E.dentro)E.dentro=ladoDe(o,P.x,P.z);sfx('construir',o.x,o.z);return'Tranca pronta. Feche a porta e passe a tranca.';}
    if(id==='trAlt'){if(!dentro)return'Só dá para mexer na tranca por dentro.';if(E.tr==='passada'){E.tr='livre';sfx('tranca',o.x,o.z,0.8);return'Tranca levantada.';}
      if(E.aberta)return'Feche a porta antes.';E.tr='passada';sfx('tranca',o.x,o.z,0.8);return'Tranca passada: ninguém abre de fora.';}
    if(id==='reforcar'){const m=portaReforcar(o);st.nome=E.reforco?'Porta reforçada':'Porta de madeira';return m;}
    if(id==='consertar')return consertarUma(o);
    return'';}};
INTER_K.portaMad={texto:o=>{const E=o.ext;let t;
    if(E.aberta)t='Fechar a porta';else if(E.tr==='passada')t=portaDentro(o)?'Levantar a tranca e abrir':'Porta trancada por dentro';
    else if(E.cad==='fechado'&&E.senha&&!portaDentro(o))t='Abrir com a senha';else t='Abrir a porta';
    return{t,s:'toque: '+(E.aberta?'fechar':'abrir')+' · segure: cadeado, tranca e reforço',alt:true,dur:0.7};},
  curto:o=>portaTocar(o),usar:(o,seg)=>{if(seg)abrirPainelPorta(o);else portaTocar(o);}};

/* ---------- janela: persiana e tábuas ---------- */
const TAB_JAN={pilha:{nome:'tábuas empilhadas',custo:{tabuas:5,pregos:4},hp:300,s:'aguentam 300 e tampam o vão'},x:{nome:'tábuas em X',custo:{tabuas:2,pregos:2},hp:120,s:'aguentam 120; ainda dá para olhar e atirar'}};
/* colisor que tampa o vão (persiana fechada ou tábuas empilhadas) */
function janelaTampa(o){const E=o.ext,precisa=!!(E.fechada||E.tab==='pilha');
  if(precisa&&!o.colTampa){const y=o.y,k=modK(o),kh=modKH(o);o.colTampa=colBox(o.x,o.z,0.62*k,o.tipo==='janelaAlta'?0.1:0.13*k,o.yaw,{solid:true,obra:o,y0:y+0.92*kh,y1:y+1.98*kh});(o.cols||(o.cols=[])).push(o.colTampa);}
  else if(!precisa&&o.colTampa){colRemove(o.colTampa);if(o.cols){const i=o.cols.indexOf(o.colTampa);if(i>=0)o.cols.splice(i,1);}o.colTampa=null;}}
const persianaPresa=o=>!!(o.ext.tab&&o.ext.tabLado===1);
function persianaAlternar(o){const E=o.ext;if(persianaPresa(o)){feed('A persiana está presa pelas tábuas',true);sfx('vazio');return;}
  E.fechada=!E.fechada;if(!E.fechada)delete E.fechada;janelaTampa(o);sfx('persiana',o.x,o.z,0.8);barulho(o.x,o.z,4,true,o.y);feed(E.fechada?'Persiana fechada':'Persiana aberta');}
ESTACAO_UI.__janela={render(st){const o=st.o,E=o.ext,A=[];
    const L=['Vida da janela: <b>'+Math.round(o.hp)+' de '+Math.round(o.hpMax)+'</b>'+(E.metal?' · com chapas de metal':''),
      'Persiana: '+(E.fechada?'<b>fechada</b> (tampa o vão)':'aberta'),
      'Tábuas: '+(E.tab?'<b>'+TAB_JAN[E.tab].nome+'</b> · aguentam mais '+Math.max(0,Math.ceil(E.tabHp||0))+' de pancada':'nenhuma')];
    A.push({id:'persiana',t:E.fechada?'Abrir a persiana':'Fechar a persiana',s:persianaPresa(o)?'presa pelas tábuas':E.fechada?'volta a dar para olhar e atirar':'tampa o vão: não entra tiro nem olhar',ok:!persianaPresa(o)});
    if(!E.tab)for(const k of['pilha','x']){const T=TAB_JAN[k];A.push({id:'tab:'+k,t:'Pregar '+T.nome,s:custoTxt(T.custo)+' · '+T.s,ok:invHas(T.custo)});}
    else A.push({id:'tirarTab',t:'Arrancar as tábuas',s:'devolve '+Math.floor(TAB_JAN[E.tab].custo.tabuas/2)+' tábua'+(Math.floor(TAB_JAN[E.tab].custo.tabuas/2)>1?'s':'')});
    {const c=custoReparoObra(o);if(c)A.push({id:'consertar',t:'Consertar a janela',s:custoTxt(c),ok:invHas(c)});}
    return{sub:'Toque E abre e fecha a persiana. O zumbi quebra as tábuas antes da janela.',corpo:'<p class="es-info">'+L.join('<br>')+'</p>',acoes:A};},
  acao(st,id){const o=st.o,E=o.ext;if(!OB.includes(o))return'A janela não existe mais.';
    if(id==='persiana'){persianaAlternar(o);return'';}
    if(id.startsWith('tab:')){const k=id.slice(4),T=TAB_JAN[k];if(!T)return'';if(E.tab)return'Já tem tábuas.';if(!invHas(T.custo))return'Faltam materiais.';
      pagar(T.custo);E.tab=k;E.tabHp=T.hp;E.tabLado=ladoDe(o,P.x,P.z);janelaTampa(o);sfx('construir',o.x,o.z);barulho(o.x,o.z,10,true,o.y);ganharXP(3);
      return(k==='pilha'?'Tábuas empilhadas pregadas: o vão ficou tampado.':'Tábuas em X pregadas: dá para olhar e atirar pelos vãos.');}
    if(id==='tirarTab'){if(!E.tab)return'';const n=Math.floor(TAB_JAN[E.tab].custo.tabuas/2);delete E.tab;delete E.tabHp;delete E.tabLado;janelaTampa(o);invAdd('tabuas',n);sfx('madeira',o.x,o.z,0.6);return'Tábuas arrancadas (voltaram '+n+').';}
    if(id==='consertar')return consertarUma(o);
    return'';}};
INTER_K.janelaObra={texto:o=>{const E=o.ext,presa=persianaPresa(o);
    return{t:presa?'Janela com '+TAB_JAN[E.tab].nome:E.fechada?'Abrir a persiana':'Fechar a persiana',s:(presa?'a persiana está presa':'toque: '+(E.fechada?'abrir':'fechar'))+' · segure: tábuas e persiana',alt:true,dur:0.7};},
  curto:o=>persianaAlternar(o),usar:(o,seg)=>{if(seg)abrirEstacao({estTipo:'__janela',o,ext:o.ext,nome:'Janela'});else persianaAlternar(o);}};

/* ---------- tábuas em X nas janelas da cidade e das casas ---------- */
function tabuasXMontar(o){const j=CID.janelas[o.ext.janela];o.col=colBox(o.x,o.z,j?j.larg/2+0.1:0.7,0.12,o.yaw,{solid:true,obra:o,y0:o.y,y1:o.y+2.4});}
{const _jt=janelaTapada;janelaTapada=function(j){return OB.some(o=>o.tipo==='tabuasJanelaX'&&o.ext&&o.ext.janela===j.id)||_jt.apply(this,arguments);};}

/* ---------- dano: tábuas da janela levam primeiro; tranca passada segura a porta; chapa soa como metal ---------- */
{const _d=danoObra;danoObra=function(o,d){const E=o&&o.ext;
  if(E&&E.tab&&E.tabHp>0){E.tabHp-=d;poeira(o.x,o.y+1.4,o.z,3);sfx('madeira',o.x,o.z,0.7);
    if(E.tabHp<=0){const nome=TAB_JAN[E.tab]?TAB_JAN[E.tab].nome:'tábuas';delete E.tab;delete E.tabHp;delete E.tabLado;janelaTampa(o);sfx('quebrar',o.x,o.z,0.8);poeira(o.x,o.y+1.4,o.z,10);
      if(Math.hypot(o.x-P.x,o.z-P.z)<60)toast('alerta','As '+nome+' da janela quebraram.');}
    return;}
  if(o&&o.tipo==='portaMadeira'&&E&&!E.aberta&&E.tr==='passada')d*=0.6;
  if(E&&(E.metal||E.reforco)){o.hp-=d;poeira(o.x,o.y+0.6,o.z,2);sfx('chapa',o.x,o.z,0.5);if(o.hp<=0)destruirObra(o);return;}
  return _d.call(this,o,d);};}

/* ---------- criar, destruir e colocar ---------- */
{const _c=criarObra;criarObra=function(tipo,x,z,yaw,hp,aberto,y,ext){let ref=0;
  if(tipo==='portaReforcada'){tipo='portaMadeira';ext=Object.assign({},ext||{},{reforco:1});ref=OBRAS.portaReforcada.hp;}
  const o=_c.call(this,tipo,x,z,yaw,hp,aberto,y,ext);
  if(ref){o.hpMax=ref;if(hp===undefined)o.hp=ref;}
  if(tipo==='janela'||tipo==='janelaAlta'){o.pers=o.ext.fechada?1:0;janelaTampa(o);}
  else if(tipo==='prateleira')o.nome='Estante';
  else if(tipo==='armadilhaUrso'&&o.ext.armada===undefined)o.ext.armada=true;
  return o;};}
/* lamparina de parede cai junto com a parede onde está */
{const _x=destruirObra;destruirObra=function(o){const tinha=OB.includes(o);_x.apply(this,arguments);if(!tinha||!PAREDE_LAMP.has(o.tipo))return;
  for(const q of OB.slice())if(q.tipo==='lampParede'&&d2(q.x,q.z,o.x,o.z)<3*3&&!lampHost(q))_x(q);};}
{const _co=colocarObra;colocarObra=function(){if(OBRA.ativo&&OBRA.tipo==='revestimento')return revestirColocar();return _co.apply(this,arguments);};}
/* mira das peças que encaixam numa coisa que já existe (parede, janela da cidade): vale no chão, no alto e dentro dos prédios */
const ALVO_PROPRIO=new Set(['revestimento','lampParede','tabuasJanelaX']);
{const _oa=obraAlvo;obraAlvo=function(){const t=OBRA.tipo;if(!ALVO_PROPRIO.has(t))return _oa.apply(this,arguments);
  const ctxO=contextoObra();if(ctxO!==OBRA.ctx){OBRA.ctx=ctxO;if(!obrasVisiveis().includes(OBRA.tipo))OBRA.tipo=obrasVisiveis()[0];hudObras();if(OBRA.tipo!==t)return _oa.apply(this,arguments);}
  else if(OBRA.tipo!==OBRA.tipoMostrado&&obrasVisiveis().includes(OBRA.tipo))hudObras();
  const r=t==='revestimento'?alvoRevestir():t==='lampParede'?alvoLampParede():alvoAbertura('janela');
  OBRA.x=r.x;OBRA.z=r.z;OBRA.y=r.y;OBRA.yaw=r.yaw;OBRA.ext=r.ext||null;OBRA.motivo=r.ok?'':(r.motivo||'Não cabe aqui');OBRA.ok=!!r.ok&&invHas(custoObra(t));OBRA.alvoObra=r.obra||null;hudMotivo();};}

/* ---------- muros: paliçada, muralha e portão grande encaixam na ponta de muros e paredes ---------- */
const SEG_MURO=new Set(['muro','muroPedra','muroFerro','portao','portaoFerro','paredeCasa','portaMadeira','janela','palicada','muralha','portaoGrande']);
function alvoSegMuro(x,z,yaw){const D=OBRAS[OBRA.tipo],hw=D.hw;let best=null,bd=2.2*2.2;const g0=ground(x,z);
  const ocupada=(cx,cz)=>OB.some(o=>SEG_MURO.has(o.tipo)&&d2(o.x,o.z,cx,cz)<0.3*0.3);
  const cand=(cx,cz,cyaw)=>{const d=d2(cx,cz,x,z);if(d>=bd||ocupada(cx,cz))return;bd=d;best={x:cx,z:cz,yaw:cyaw};};
  for(const o of OB){if(!SEG_MURO.has(o.tipo)||d2(o.x,o.z,x,z)>(hw+8)**2||Math.abs(o.y-g0)>1.5)continue;const ho=OBRAS[o.tipo].hw,s=Math.sin(o.yaw),c=Math.cos(o.yaw);
    for(const sx of[-1,1]){const w=localW(o,sx*(ho+hw),0);cand(w[0],w[1],o.yaw);   // em linha
      const e=localW(o,sx*ho,0);for(const sz of[-1,1])cand(e[0]+s*sz*hw,e[1]+c*sz*hw,o.yaw+Math.PI/2);}}   // de canto
  if(!best)return null;
  if(Math.cos(yaw-best.yaw)<0)best.yaw+=Math.PI;
  const r={x:best.x,z:best.z,y:ground(best.x,best.z),yaw:best.yaw},q={x:r.x,z:r.z,yaw:r.yaw};
  for(let lx=-hw+0.4;lx<=hw-0.4+1e-6;lx+=0.45)for(const lz of[-(D.hd-0.03),D.hd-0.03]){const w=localW(q,lx,lz);
    if(bloqueadoChao(w[0],w[1],0.08,r.y,c=>c.obra&&SEG_MURO.has(c.obra.tipo)))return Object.assign(r,{ok:false,motivo:'Tem coisa no caminho'});}
  {const c=Math.cos(r.yaw),s=Math.sin(r.yaw),dx=P.x-r.x,dz=P.z-r.z,lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)<hw+0.3&&Math.abs(lz)<D.hd+0.45)return Object.assign(r,{ok:false,motivo:'Perto demais de você'});}
  if(!dentroMapa(r.x,r.z,3))return Object.assign(r,{ok:false,motivo:'Longe demais'});
  r.ok=true;return r;}
/* portão grande: dois pilares (bloqueiam todo mundo) e as folhas (você e o carro passam, zumbi não) */
function portaoGrandeMontar(o){const y=o.y,A=(lx,hw,hd,portao)=>{const w=localW(o,lx,0);return colBox(w[0],w[1],hw,hd,o.yaw,{solid:true,obra:o,portao,y0:y-0.3,y1:y+3.5});};
  o.cols=[A(-3.2,0.32,0.32,false),A(3.2,0.32,0.32,false),A(0,2.88,0.2,true)];o.abre=o.abre||0;}

/* ---------- revestimento de metal ---------- */
const REVESTE=new Set(['paredeCasa','janela','portaMadeira','paredeAlta','janelaAlta']);
function alvoRevestir(){const f=lookDir(P.yaw,0),ax=P.x+f[0]*1.3,az=P.z+f[2]*1.3;let best=null,bd=1.7;
  for(const o of OB){if(!REVESTE.has(o.tipo)||Math.abs(o.y-P.y)>1.6)continue;const a=localW(o,-1.5,0),b=localW(o,1.5,0),d=segDist(ax,az,a[0],a[1],b[0],b[1]);if(d<bd){bd=d;best=o;}}
  if(!best)return{x:P.x+f[0]*1.6,z:P.z+f[2]*1.6,y:P.y,yaw:P.yaw,ok:false,motivo:'Mire uma parede, janela ou porta da casa'};
  const o=best,lado=ladoDe(o,P.x,P.z),r={x:o.x,z:o.z,y:o.y,yaw:o.yaw+(lado<0?Math.PI:0),ext:{lado},obra:o};
  if(o.tipo==='portaMadeira'&&o.ext.reforco)return Object.assign(r,{ok:false,motivo:'Essa porta já tem chapas'});
  if(o.tipo!=='portaMadeira'&&o.ext.metal)return Object.assign(r,{ok:false,motivo:'Essa parede já tem chapas'});
  return Object.assign(r,{ok:true});}
function revestir(o,lado){if(o.tipo==='portaMadeira'){o.ext.reforco=1;o.hpMax+=REFORCO_HP;o.hp+=REFORCO_HP;return;}
  o.ext.metal=1;o.ext.metalLado=lado||1;const add=OBRAS.revestimento.hp;o.hpMax+=add;o.hp+=add;}
function revestirColocar(){obraAlvo();if(!obraLiberada('revestimento')){feed('Ainda não liberado',true);sfx('vazio');return;}
  const c=custoObra('revestimento');if(!invHas(c)){feed('Faltam materiais',true);sfx('vazio');return;}if(!OBRA.ok||!OBRA.alvoObra||!OB.includes(OBRA.alvoObra)){feed(OBRA.motivo||'Mire uma parede da casa',true);sfx('vazio');return;}
  const o=OBRA.alvoObra;pagar(c);revestir(o,OBRA.ext&&OBRA.ext.lado);ganharXP(6);progresso('obra');sfx('construir');sfx('chapa',o.x,o.z,0.7);barulho(P.x,P.z,12,true);poeira(o.x,o.y+0.6,o.z,6);
  feed(o.tipo==='portaMadeira'?'Porta reforçada com chapas':'Chapas de metal pregadas: '+OBRAS[o.tipo].nome.toLowerCase()+' com '+Math.round(o.hpMax)+' de vida');
  dica('revestimento','corpo','Chapas pregadas. Cada parede, janela ou porta revestida aguenta muito mais pancada. Conserte tudo de uma vez no modo construção (botão Consertar tudo ou tecla T).');
  hudObras();hudBarra();}

/* ---------- lamparina de parede ---------- */
const PAREDE_LAMP=new Set(['paredeCasa','janela','portaMadeira','paredeAlta','janelaAlta','muro','muroPedra','muroFerro','palicada','muralha']);
const LAMP_Y=1.62;
function alvoLampParede(){const f=lookDir(P.yaw,0),ax=P.x+f[0]*1.2,az=P.z+f[2]*1.2;let best=null,bd=1.5;
  for(const o of OB){if(!PAREDE_LAMP.has(o.tipo)||Math.abs(o.y-P.y)>1.3)continue;const D=OBRAS[o.tipo],s=Math.sin(o.yaw),c=Math.cos(o.yaw),dx=ax-o.x,dz=az-o.z,lx=dx*c-dz*s,lz=dx*s+dz*c;
    if(Math.abs(lx)>D.hw+0.3)continue;const d=Math.max(0,Math.abs(lz)-D.hd);if(d<bd){bd=d;best={o,lx:clamp(lx,-D.hw+0.25,D.hw-0.25),lado:ladoDe(o,P.x,P.z)};}}
  if(!best)return{x:P.x+f[0]*1.2,z:P.z+f[2]*1.2,y:P.y+LAMP_Y,yaw:P.yaw,ok:false,motivo:'Mire uma parede, muro ou paliçada'};
  const o=best.o,D=OBRAS[o.tipo];let lx=best.lx;if((o.tipo==='janela'||o.tipo==='janelaAlta'||o.tipo==='portaMadeira')&&Math.abs(lx)<0.86)lx=(lx<0?-1:1)*0.98;
  const w=localW(o,lx,(D.hd+0.17)*best.lado),r={x:w[0],z:w[1],y:o.y+LAMP_Y,yaw:o.yaw+(best.lado<0?Math.PI:0),ext:{},obra:o};
  if(OB.some(q=>q.tipo==='lampParede'&&d2(q.x,q.z,r.x,r.z)<0.6*0.6&&Math.abs(q.y-r.y)<0.5))return Object.assign(r,{ok:false,motivo:'Já tem lamparina aqui'});
  return Object.assign(r,{ok:true});}
function lampParedeMontar(o){o.cols=[];}
/* parede onde a lamparina está presa (atrás dela) */
function lampHost(q){const bx=q.x-Math.sin(q.yaw)*0.2,bz=q.z-Math.cos(q.yaw)*0.2;
  for(const o of OB){if(!PAREDE_LAMP.has(o.tipo)||Math.abs(o.y+LAMP_Y-q.y)>0.6)continue;const D=OBRAS[o.tipo];if(noRet(bx,bz,o.x,o.z,o.yaw,D.hw,D.hd,0.25))return o;}return null;}

/* ---------- armadilha de mandíbula ---------- */
function armadilhaFecha(o,a,bicho){o.ext.armada=false;const forte=!bicho&&ZS[a.tipo]&&ZS[a.tipo].hp>=900;a.presoT=bicho?8:forte?1.5:6;a.presoX=a.x;a.presoZ=a.z;
  sfx('armadilha',o.x,o.z,1);barulho(o.x,o.z,12,false);o.hp=Math.max(1,o.hp-6);
  if(bicho){ferirBicho(a,60,0,0,'armadilha');}
  else{a.hp-=55;a.flash=0.08;if(a.hp<=0&&a.vivo){a.vivo=false;a.st='morrendo';a.t=0;G.kills++;zMorreu(a);}}
  if(Math.hypot(o.x-P.x,o.z-P.z)<40)feed(bicho?'Um bicho caiu na armadilha!':'Um zumbi caiu na armadilha!');}
function armadilhaPassos(dt){for(const o of OB){if(o.tipo!=='armadilhaUrso'||o.ext.armada===false)continue;
    for(const z of Z){if(!z.vivo||z.presoT>0||Math.abs(z.x-o.x)>0.6||Math.abs(z.z-o.z)>0.6||d2(z.x,z.z,o.x,o.z)>0.5*0.5)continue;if(z.y!==undefined&&Math.abs(z.y-o.y)>1)continue;armadilhaFecha(o,z,false);break;}
    if(o.ext.armada===false)continue;
    for(const b of BICHOS){if(!b.vivo||b.presoT>0||d2(b.x,b.z,o.x,o.z)>0.55*0.55)continue;armadilhaFecha(o,b,true);break;}}
  for(const z of Z)if(z.presoT>0){z.presoT=Math.max(0,z.presoT-dt);if(z.vivo){z.x=z.presoX;z.z=z.presoZ;}}
  for(const b of BICHOS)if(b.presoT>0){b.presoT=Math.max(0,b.presoT-dt);if(b.vivo){b.x=b.presoX;b.z=b.presoZ;}}}
INTER_K.armadilha={texto:o=>o.ext.armada===false?{t:'Armar a armadilha',s:'abre a mandíbula de novo'}:{t:'Desarmar a armadilha',s:'armada: prende quem pisar'},
  usar:o=>{o.ext.armada=o.ext.armada===false;sfx(o.ext.armada?'tranca':'armadilha',o.x,o.z,0.6);feed(o.ext.armada?'Armadilha armada':'Armadilha desarmada');}};

/* ---------- consertar: uma peça (painéis) e tudo de uma vez (modo construção) ---------- */
const REPARO_MAT=new Set(['tabuas','madeira','pedra','pregos','sucata','chapaFerro','barraFerro','corda']);
function custoReparoObra(o){const D=OBRAS[o.tipo];if(!D||o.hp>=o.hpMax-0.5)return null;const f=clamp(1-o.hp/o.hpMax,0,1),base={},c={};
  const soma=k=>{for(const i in k)base[i]=(base[i]||0)+k[i];};soma(o.ext&&o.ext.reforco&&o.tipo==='portaMadeira'?OBRAS.portaReforcada.custo:D.custo||{});if(o.ext&&o.ext.metal)soma(OBRAS.revestimento.custo);
  for(const k in base){if(!REPARO_MAT.has(k))continue;const n=Math.ceil(base[k]*f*0.5);if(n>0)c[k]=n;}
  if(!Object.keys(c).length)c.tabuas=1;return c;}
function consertarUma(o){const c=custoReparoObra(o);if(!c)return'Não precisa de conserto.';if(!invHas(c))return'Faltam materiais: '+custoTxt(c)+'.';
  pagar(c);o.hp=o.hpMax;sfx('construir',o.x,o.z);ganharXP(2);hudBarra();return OBRAS[o.tipo].nome+' consertada.';}
const obraDaBase=o=>sobBase(o.x,o.z,40)||d2(o.x,o.z,P.x,P.z)<35*35;
/* simular=true só calcula. Devolve quantas consertaria, quantas ficam por falta de material e o gasto. */
function consertarTudo(simular){const L=OB.filter(o=>OBRAS[o.tipo]&&o.hp<o.hpMax-0.5&&obraDaBase(o)).sort((a,b)=>a.hp/a.hpMax-b.hp/b.hpMax);
  const gasto={},tem=k=>invCount(k);let n=0,falta=0,primeiraFalta=null;
  for(const o of L){const c=custoReparoObra(o);if(!c)continue;let ok=true;for(const k in c)if(tem(k)<(gasto[k]||0)+c[k]){ok=false;break;}
    if(!ok){falta++;if(!primeiraFalta)primeiraFalta=c;continue;}for(const k in c)gasto[k]=(gasto[k]||0)+c[k];n++;if(!simular)o.hp=o.hpMax;}
  if(!simular&&n){pagar(gasto);sfx('construir');ganharXP(Math.min(30,2*n));hudBarra();}
  return{n,falta,total:L.length,gasto,primeiraFalta};}
function consertarTudoUI(){const r=consertarTudo(false);
  if(!r.total){feed('Nada danificado na base');sfx('clique');return r;}
  if(!r.n){feed('Falta material para consertar: '+custoTxt(r.primeiraFalta),true);sfx('vazio');return r;}
  toast('corpo','Consertou '+r.n+(r.n>1?' construções':' construção')+' da base: gastou '+custoTxt(r.gasto)+'.'+(r.falta?' Faltou material para '+r.falta+'.':''));hudObras();return r;}
{const b=$('o-consertar');if(b)b.addEventListener('click',()=>{consertarTudoUI();sfx('clique');});}
window.addEventListener('keydown',e=>{if(e.code==='KeyT'&&G.modo==='jogo'&&OBRA.ativo&&!e.repeat&&!(e.target&&e.target.tagName==='INPUT')){e.preventDefault();consertarTudoUI();}});
let consertoHudT=0;
HUDS.push(function hudConsertarTudo(dt){if(!OBRA.ativo)return;consertoHudT-=dt||0.016;if(consertoHudT>0)return;consertoHudT=0.5;const b=$('o-consertar');if(!b)return;
  const r=consertarTudo(true),t=$('o-consertar-t');if(t)t.textContent=r.total?'Consertar tudo ('+r.total+')':'Consertar tudo';b.disabled=!r.total;
  const dica2=!r.total?'Nada danificado na base':r.n?'Conserta '+r.n+' de '+r.total+': '+custoTxt(r.gasto):'Falta material: '+custoTxt(r.primeiraFalta);b.title=dica2;b.setAttribute('aria-label','Consertar tudo. '+dica2);});

/* ---------- móveis: estante, cama de madeira e o conforto do sono ---------- */
function confortoEm(x,y,z,base){const tem={};
  for(const q of OB){if(d2(q.x,q.z,x,z)>7*7)continue;const qy=q.tipo==='lampParede'?q.y-LAMP_Y:(q.y??0);if(Math.abs(qy-y)>2.4)continue;
    if(q.tipo==='mesa'||q.tipo==='cadeira'||q.tipo==='prateleira')tem[q.tipo]=1;else if((q.tipo==='lampParede'||q.tipo==='lamparina')&&!q.ext.apagada)tem.luz=1;}
  const teto=OB.some(q=>tetoCobre(q,x,z,y));
  return{n:Math.min(6,base+Object.keys(tem).length+(teto?1:0)),teto,tem:Object.keys(tem)};}
function confortoCama(o){if(o.confT!==undefined&&G.t-o.confT<0.5&&o.confT<=G.t)return o.conf;o.confT=G.t;o.conf=confortoEm(o.x,o.y,o.z,o.tipo==='camaMadeira'?2:1);return o.conf;}
{const _sc=sonoComecar;sonoComecar=function(lugar){_sc.apply(this,arguments);const d=G.dormindo;if(!d||d.conforto!==undefined||!lugar)return;let c=null;
  if(lugar.cama&&lugar.x!==undefined){const o=OB.find(q=>(q.tipo==='cama'||q.tipo==='camaMadeira')&&Math.abs(q.x-lugar.x)<0.01&&Math.abs(q.z-lugar.z)<0.01);if(o)c=confortoCama(o).n;}
  else if(lugar.barraca)c=confortoEm(P.x,P.y,P.z,1).n;else if(lugar.saco)c=confortoEm(P.x,P.y,P.z,0).n;
  if(c!==null){d.conforto=c;d.taxa*=1+0.07*c;}};}
{const _sa=sonoAcordar;sonoAcordar=function(motivo){const d=G.dormindo;_sa.apply(this,arguments);
  if(d&&d.conforto&&!motivo&&P.alive){const b=2*d.conforto;P.vida=Math.min(vidaMax(),P.vida+b);feed('Conforto '+d.conforto+' de 6: acordou com +'+b+' de vida');}};}
{const _ti=textoInter;textoInter=function(a){
  if(a&&a.k==='guarda'&&a.o&&a.o.tipo==='prateleira'){const n=a.o.itens.filter(Boolean).length;return{t:'Abrir a estante',s:n?n+' de '+BAU_N+' espaços usados':'vazia'};}
  if(a&&a.k==='camaObra'&&a.o&&OB.includes(a.o)){const c=confortoCama(a.o);return{t:a.o.tipo==='camaMadeira'?'Cama de madeira':'Colchão',s:'toque: salva e vira seu ponto de volta · segure: dormir · conforto '+c.n+' de 6',alt:true,dur:0.8};}
  return _ti.apply(this,arguments);};}
/* sobreviventes: descansam e se recuperam também na cama de madeira (antes no colchão) */
if(typeof OF_REPOUSO!=='undefined'){OF_REPOUSO.acha=s=>{if(s.hp>=s.hpMax*0.5)return null;const o=ofEstacao(['camaMadeira','cama'],s);return o&&{o,deita:true};};
  if(OFICIOS.descansar&&OFICIOS.descansar[0])OFICIOS.descansar[0].acha=s=>{const o=ofEstacao(['camaMadeira','cama'],s);return o&&{o,deita:true};};
  const _od=ofDica;ofDica=function(s){if(s.tarefa==='descansar'&&ofObras('camaMadeira').length)return'';return _od.apply(this,arguments);};}

/* ---------- interações das peças novas ---------- */
INTERS.push(tryIt=>{for(const o of OB){if(Math.abs(o.x-P.x)>4||Math.abs(o.z-P.z)>4)continue;
  if(o.tipo==='janela'||o.tipo==='janelaAlta')tryIt({k:'janelaObra',o},o.x,o.z,2.0,1.2,-0.6,o.y);
  else if(o.tipo==='lampParede')tryIt({k:'lamp',o},o.x,o.z,2.0,0.8,-0.6,o.y-LAMP_Y);
  else if(o.tipo==='armadilhaUrso')tryIt({k:'armadilha',o},o.x,o.z,1.8,0.9,-0.5,o.y);
  else if(o.tipo==='camaMadeira')tryIt({k:'camaObra',o},o.x,o.z,2.0,1.0,-0.5,o.y);}});

/* ---------- luz que sai pelas janelas à noite ---------- */
/* quanto a janela está iluminada por dentro (lamparina ou fogo a até 7 m) e de que lado está a luz; recalculado a cada 0,6 s */
function janelaLuz(o){if(o.luzT!==undefined&&G.t-o.luzT<0.6&&o.luzT<=G.t)return o.luzK;o.luzT=G.t;let best=0,lado=0;const yc=o.y+1.45,s=Math.sin(o.yaw),c=Math.cos(o.yaw);
  for(const f of FIRES){const dx=f.x-o.x,dz=f.z-o.z,d=Math.hypot(dx,dz);if(d>7||Math.abs(f.y+0.3-yc)>2.6)continue;const lz=dx*s+dz*c;if(Math.abs(lz)<0.25)continue;
    const k=(1-d/7)*(f.lamp?1:1.3);if(k>best){best=k;lado=lz>0?1:-1;}}
  o.luzK=Math.min(1,best);o.luzLado=lado;return o.luzK;}
DESENHO.aditivo.push(function luzJanelasBrilho(){const n=E.n||0;if(n<0.25)return;const kn=smooth(0.25,0.6,n);
  for(const o of OB){if(o.tipo!=='janela'&&o.tipo!=='janelaAlta')continue;if(d2(o.x,o.z,cam.pos[0],cam.pos[2])>80*80)continue;const k=janelaLuz(o)*kn;if(k<0.04||!o.luzLado)continue;
    const X=o.ext,f=X.fechada?0.12:X.tab==='pilha'?0.35:X.tab==='x'?0.8:1,fora=-o.luzLado,w=localW(o,0,fora*0.35),w2=localW(o,0,fora*1.3);
    bb(w[0],o.y+1.45,w[1],1.25,1,0.66,0.3,0.24*k*f);bb(w2[0],o.y+1.2,w2[1],2.7,1,0.6,0.28,0.07*k*f);}});

/* ---------- desenho ---------- */
const MJ=new Float32Array(16),MJ2=new Float32Array(16),MJ3=new Float32Array(16);
function desenharJanela(Pg,o){const X=o.ext,alta=o.tipo==='janelaAlta',m=X.metal&&(X.metalLado||1)===1;escTrs(MJ,o,1);
  drawStat(Pg,alta?MESH.obra.janelaAltaBase:MESH.obra.janelaBase,MJ);
  const a=(o.pers||0)*Math.PI,hz=m?0.2:0.12;
  for(const sx of[-1,1]){mul(MJ2,MJ,trs(MJ3,sx*0.62,0,hz,0,-sx*a,0,1,1,1));drawStat(Pg,sx>0?MESH.obra.persianaD:MESH.obra.persianaE,MJ2);}
  if(X.tab){escTrs(MJ2,o,X.tabLado||1);drawStat(Pg,X.tab==='pilha'?MESH.obra.tabJanPilha:MESH.obra.tabJanX,MJ2);}
  if(X.metal){escTrs(MJ2,o,X.metalLado||1);drawStat(Pg,MESH.obra.revJanela,MJ2);}
  if(Pg===PL){const n=E.n||0;if(n>0.2){const k=janelaLuz(o)*smooth(0.2,0.6,n);
    if(k>0.03&&o.luzLado&&ladoDe(o,cam.pos[0],cam.pos[2])!==o.luzLado){const dmg=o.hp/o.hpMax;escTrs(MJ2,o,o.luzLado);
      gl.uniform3f(PL.u.uTint,k,k*0.92,k*0.85);drawStat(PL,MESH.obra.janelaVidro,MJ2);gl.uniform3f(PL.u.uTint,lerp(0.55,1,dmg),lerp(0.5,1,dmg),lerp(0.48,1,dmg));}}}}
function desenharPortaoGrande(Pg,o){trs(MJ,o.x,o.y,o.z,0,o.yaw,0,1,1,1);drawStat(Pg,MESH.obra.portaoGrandeBase,MJ);const a=(o.abre||0)*1.45;
  mul(MJ2,MJ,trs(MJ3,-2.98,0,0,0,-a,0,1,1,1));drawStat(Pg,MESH.obra.portaoGrandeFolhaE,MJ2);
  mul(MJ2,MJ,trs(MJ3,2.98,0,0,0,a,0,1,1,1));drawStat(Pg,MESH.obra.portaoGrandeFolhaD,MJ2);}
{const _dob=desenharObra;desenharObra=function(Pg,o){const t=o.tipo,X=o.ext||{};
  if(!MESH.obra.janelaBase)return _dob.apply(this,arguments);
  if(t==='janela'||t==='janelaAlta'){desenharJanela(Pg,o);return;}
  if(t==='portaoGrande'){desenharPortaoGrande(Pg,o);return;}
  if(t==='armadilhaUrso'){trs(MJ,o.x,o.y,o.z,0,o.yaw,0,1,1,1);drawStat(Pg,X.armada===false?MESH.obra.armadilhaFechada:MESH.obra.armadilhaUrso,MJ);return;}
  _dob.apply(this,arguments);
  if(t==='portaMadeira'){   // o desenho original deixa a base em TMP e a folha em TMP2
    if(X.reforco){drawStat(Pg,MESH.obra.reforcoFolha,TMP2);drawStat(Pg,MESH.obra.reforcoBatente,TMP);}
    if(X.cad){escTrs(MJ,o,X.dentro?-X.dentro:1);drawStat(Pg,MESH.obra.teclado,MJ);}
    if(X.tr){escTrs(MJ,o,X.dentro||1);drawStat(Pg,MESH.obra.trancaSuporte,MJ);drawStat(Pg,X.tr==='passada'&&!X.aberta?MESH.obra.trancaBarra:MESH.obra.trancaEncostada,MJ);}}
  else if((t==='paredeCasa'||t==='paredeAlta')&&X.metal){escTrs(MJ,o,X.metalLado||1);drawStat(Pg,t==='paredeAlta'?MESH.obra.revParedeAlta:MESH.obra.revParede,MJ);}};}
INIT_MALHAS.push(function defesaMalhas(){const R=rng(10101),C=k=>lin(COR_CASA[k]),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());},O=MESH.obra;
  const ferro=lin(0x5f6467),ferro2=lin(0x474b4e),ferrugem=lin(0x7a4a2a),preto=lin(0x2b2b2b),tronco=lin(0x5d4129),tronco2=lin(0x6b4b2e),ponta=lin(0x8a6a45),
    pedraA=lin(0x76736b),pedraB=lin(0x8f8b81),md=lin(0x6b4e30),md2=lin(0x7d5c3a);
  const tabua=(g,x,y0,y1,z)=>add(g,bvTris(0.27,y1-y0,0.09),mat(x,(y0+y1)/2,z??0.04),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});
  /* janela sem as folhas (as folhas da persiana são desenhadas à parte, girando) */
  const janelaSem=(g,H,trilhos)=>{for(const x of[-1.35,-1.05,-0.75,0.75,1.05,1.35])tabua(g,x,0,H);
    for(const x of[-0.42,-0.14,0.14,0.42]){tabua(g,x,0,0.92);tabua(g,x,1.98,H);}
    for(const y of trilhos)for(const sx of[-1,1])add(g,bvTris(0.95,0.16,0.08),mat(sx*1.05,y,-0.06),C('esc2'));add(g,bvTris(1.2,0.16,0.08),mat(0,0.5,-0.06),C('esc2'));
    for(const sx of[-1,1])add(g,bvTris(0.1,1.04,0.15),mat(sx*0.6,1.45,0.01),C('esc'));add(g,bvTris(1.36,0.08,0.26),mat(0,0.95,0.04),C('esc'));add(g,bvTris(1.3,0.1,0.15),mat(0,1.94,0.01),C('esc'));
    add(g,bvTris(0.05,0.9,0.05),mat(0,1.45,0),C('esc2'));add(g,bvTris(1.1,0.05,0.05),mat(0,1.45,0),C('esc2'));
    for(const sx of[-1,1])for(const y of[1.2,1.7])add(g,bvTris(0.05,0.07,0.04),mat(sx*0.63,y,0.1),C('aco'));};
  O.janelaBase=mk(g=>janelaSem(g,2.35,[0.5,1.6]));O.janelaAltaBase=mk(g=>janelaSem(g,2.45,[0.4,1.3,2.2]));
  /* folha da persiana com a dobradiça na origem; aberta, as ripas ficam para a parede (fechada, viram para fora) */
  const folhaPers=(g,s)=>{add(g,bvTris(0.6,0.86,0.04),mat(s*0.3,1.45,0),mixc(C('mad'),C('mad2'),0.6),{j:0.06,rnd:R});
    for(let i=0;i<7;i++)add(g,bvTris(0.5,0.028,0.014),mat(s*0.3,1.11+i*0.113,-0.026),C('esc2'));
    for(const y of[1.2,1.7])add(g,bvTris(0.54,0.05,0.02),mat(s*0.3,y,0.026),C('esc2'));add(g,bvTris(0.04,0.1,0.03),mat(s*0.56,1.45,0.035),C('aco'));};
  O.persianaD=mk(g=>folhaPers(g,1));O.persianaE=mk(g=>folhaPers(g,-1));
  O.janelaVidro=mk(g=>add(g,boxTris(1.12,1.0,0.01),mat(0,1.45,0.03),lin(0xffc27a),{e:1.5}));
  /* tábuas na janela da casa, do lado de quem pregou */
  O.tabJanPilha=mk(g=>{for(const[y,r]of[[1.04,0.04],[1.29,-0.03],[1.55,0.05],[1.81,-0.04]]){add(g,bvTris(1.42,0.22,0.05),mat(0,y,0.245,0,0,r),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});
    for(const sx of[-1,1])add(g,boxTris(0.03,0.03,0.02),mat(sx*0.62,y,0.275),C('aco'));}});
  O.tabJanX=mk(g=>{for(const[s,z]of[[1,0.235],[-1,0.285]])add(g,bvTris(1.62,0.18,0.05),mat(0,1.45,z,0,0,s*0.62),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});
    for(const[x,y]of[[-0.55,1.08],[0.55,1.08],[-0.55,1.82],[0.55,1.82],[0,1.45]])add(g,boxTris(0.03,0.03,0.02),mat(x,y,0.315),C('aco'));});
  O.tabuasJanelaX=mk(g=>{for(const[s,z]of[[1,0],[-1,0.05]])add(g,bvTris(1.75,0.18,0.05),mat(0,1.55,z,0,0,s*0.5),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});});
  /* chapas de metal (revestimento) */
  const chapas=(g,x0,x1,y0,y1,z)=>{const w=x1-x0,n=Math.max(1,Math.round(w/0.95));for(let i=0;i<n;i++){const a=x0+i*w/n,b=a+w/n,cx=(a+b)/2,h=y1-y0;
      add(g,boxTris(b-a-0.012,h,0.02),mat(cx,(y0+y1)/2,z),R()<0.25?mixc(ferro,ferrugem,0.6):mixc(ferro,ferro2,R()),{j:0.06,rnd:R});
      for(let k=1;k<5;k++)add(g,boxTris(0.022,h,0.014),mat(a+(b-a)*k/5,(y0+y1)/2,z+0.015),ferro2);
      for(const y of[y0+0.08,y1-0.08])for(const xx of[a+0.06,b-0.06])add(g,boxTris(0.03,0.03,0.014),mat(xx,y,z+0.018),preto);}};
  O.revParede=mk(g=>chapas(g,-1.5,1.5,0.04,2.36,0.16));O.revParedeAlta=mk(g=>chapas(g,-1.5,1.5,0.02,2.48,0.07));
  O.revJanela=mk(g=>{chapas(g,-1.5,-0.66,0.04,2.36,0.16);chapas(g,0.66,1.5,0.04,2.36,0.16);chapas(g,-0.66,0.66,0.04,0.9,0.16);chapas(g,-0.66,0.66,2.0,2.36,0.16);});
  O.revestimento=O.revParede;
  /* porta: chapas na folha e no batente, teclado do cadeado e tranca */
  const portaChapas=(g,ox)=>{add(g,boxTris(1.02,1.94,0.02),mat(ox+0.55,1.04,0.045),mixc(ferro,ferro2,0.4),{j:0.05,rnd:R});
    for(const y of[0.12,0.7,1.35,1.96])for(let i=0;i<5;i++)add(g,boxTris(0.03,0.03,0.014),mat(ox+0.12+i*0.21,y,0.062),preto);
    for(const y of[0.42,1.62])add(g,boxTris(1.02,0.1,0.02),mat(ox+0.55,y,-0.095),ferro2);add(g,bvTris(0.05,0.16,0.05),mat(ox+0.96,1.02,0.08),lin(0x9aa0a4));};
  const batenteChapas=g=>{for(const sx of[-1,1])add(g,boxTris(0.13,2.18,0.02),mat(sx*0.6,1.1,0.095),ferro2);add(g,boxTris(1.34,0.15,0.02),mat(0,2.17,0.095),ferro2);};
  O.reforcoFolha=mk(g=>portaChapas(g,0));O.reforcoBatente=mk(batenteChapas);
  O.teclado=mk(g=>{add(g,bvTris(0.12,0.18,0.04),mat(0.78,1.15,0.11),lin(0x2a2d30));for(let i=0;i<3;i++)for(let j=0;j<3;j++)add(g,boxTris(0.022,0.022,0.01),mat(0.75+i*0.03,1.1+j*0.03,0.133),lin(0x9aa0a4));
    add(g,boxTris(0.06,0.02,0.01),mat(0.78,1.215,0.133),lin(0x30ff6a),{e:1.2});add(g,bvTris(0.07,0.1,0.05),mat(0.66,1.04,0.1),lin(0xb08a3a));add(g,cylTris(0.025,0.025,0.06,8),mat(0.66,1.09,0.1,0,0,0,1,1,0.5),ferro2);});
  O.trancaSuporte=mk(g=>{for(const sx of[-1,1]){add(g,boxTris(0.07,0.16,0.08),mat(sx*0.72,1.0,-0.14),ferro2);add(g,boxTris(0.07,0.05,0.04),mat(sx*0.72,1.1,-0.2),ferro2);}});
  O.trancaBarra=mk(g=>add(g,bvTris(1.62,0.11,0.08),mat(0,1.05,-0.16),mixc(C('esc'),C('mad'),0.3),{j:0.08,rnd:R}));
  O.trancaEncostada=mk(g=>add(g,bvTris(0.11,1.62,0.08),mat(1.02,0.82,-0.17,0,0,0.12),mixc(C('esc'),C('mad'),0.3),{j:0.08,rnd:R}));
  /* fantasma da porta reforçada: a porta de madeira inteira (fechada) com as chapas */
  O.portaReforcada=mk(g=>{for(const x of[-1.35,-1.05,-0.75,0.75,1.05,1.35])tabua(g,x,0,2.35);for(const y of[0.5,1.6])for(const sx of[-1,1])add(g,bvTris(0.95,0.18,0.08),mat(sx*1.05,y,-0.06),C('esc2'));
    for(const sx of[-1,1])add(g,bvTris(0.1,2.2,0.15),mat(sx*0.6,1.1,0.01),C('esc'));add(g,bvTris(1.32,0.14,0.15),mat(0,2.17,0.01),C('esc'));
    for(let k=0;k<4;k++)add(g,bvTris(0.26,2.04,0.06),mat(-0.55+0.15+k*0.268,1.04,0),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});portaChapas(g,-0.55);batenteChapas(g);});
  /* paliçada: troncos apontados de 3,2 a 3,6 m amarrados em dois troncos por dentro */
  O.palicada=mk(g=>{for(let i=0;i<12;i++){const x=-1.375+i*0.25,r=0.11+R()*0.025,h=3.1+R()*0.4;add(g,cylTris(r,r*1.06,h+0.25,7),mat(x,-0.25,0,0,R()*3,0),mixc(tronco,tronco2,R()),{j:0.08,rnd:R});
      add(g,cylTris(0,r,0.4,7),mat(x,h,0,0,R()*3,0),ponta,{j:0.08,rnd:R});}
    for(const y of[0.85,2.35])add(g,cylTris(0.075,0.075,3.05,6),mat(1.52,y,-0.18,0,0,Math.PI/2),tronco2,{j:0.06,rnd:R});
    for(const s of[-1,1])add(g,bvTris(0.1,2.1,0.07),mat(s*1.15,1.55,-0.27,0,0,s*0.45),C('esc'));});
  /* muralha: fiadas de pedra desencontradas, capa e três ameias */
  O.muralha=mk(g=>{const D=0.84;add(g,boxTris(3.04,0.26,D+0.12),mat(0,0.0,0),pedraA);
    for(let r=0;r<5;r++){let x=-1.5,first=true;const off=(r%2)*0.33;while(x<1.49){let w=first?0.4+off:0.6+R()*0.24;first=false;if(x+w>1.5||1.5-(x+w)<0.28)w=1.5-x;
        add(g,bvTris(w-0.025,0.48,D),mat(x+w/2,0.37+r*0.5,0),mixc(pedraA,pedraB,R()),{j:0.1,rnd:R});x+=w;}}
    add(g,boxTris(3.04,0.1,D+0.05),mat(0,2.66,0),lin(0x6a675f));for(const x of[-1.1,0,1.1])add(g,bvTris(0.62,0.5,D-0.02),mat(x,2.96,0),mixc(pedraA,pedraB,R()),{j:0.1,rnd:R});});
  /* portão grande: pilares de tronco sobre pedra, viga em cima e duas folhas de 2,9 m com pontas */
  const postes=g=>{for(const sx of[-1,1]){add(g,bvTris(0.64,0.5,0.64),mat(sx*3.2,0.25,0),mixc(pedraA,pedraB,0.4),{j:0.1,rnd:R});add(g,bvTris(0.38,3.5,0.38),mat(sx*3.2,2.0,0),tronco,{j:0.06,rnd:R});
      add(g,cylTris(0,0.28,0.32,4,{phase:Math.PI/4}),mat(sx*3.2,3.75,0),tronco2);add(g,bvTris(0.12,1.3,0.12),mat(sx*2.78,3.0,0,0,0,sx*0.8),C('esc'));
      for(const y of[0.7,2.6])add(g,bvTris(0.1,0.22,0.12),mat(sx*3.0,y,0),ferro2);}
    add(g,boxTris(6.95,0.3,0.32),mat(0,3.6,0),tronco,{j:0.05,rnd:R});};
  const folhaG=(g,s,ox)=>{for(let i=0;i<12;i++){const x=ox+s*(0.14+i*0.24),h=2.85+((i%3)===1?0.12:0)-R()*0.08;add(g,bvTris(0.23,h,0.08),mat(x,0.08+h/2,0),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});
      add(g,cylTris(0,0.12,0.2,4,{phase:Math.PI/4}),mat(x,0.08+h,0,0,0,0,1,1,0.35),C('mad2'));}
    for(const y of[0.45,1.5,2.5])add(g,bvTris(2.9,0.18,0.08),mat(ox+s*1.47,y,-0.08),C('esc'));add(g,bvTris(0.16,2.6,0.07),mat(ox+s*1.47,1.48,-0.09,0,0,s*-0.62),C('esc'));
    for(const y of[0.45,2.5])add(g,boxTris(1.0,0.09,0.02),mat(ox+s*0.5,y,0.05),ferro2);add(g,bvTris(0.08,0.3,0.12),mat(ox+s*2.86,1.45,0.08),ferro2);};
  O.portaoGrandeBase=mk(postes);O.portaoGrandeFolhaE=mk(g=>folhaG(g,1,0));O.portaoGrandeFolhaD=mk(g=>folhaG(g,-1,0));
  O.portaoGrande=mk(g=>{postes(g);folhaG(g,1,-2.98);folhaG(g,-1,2.98);});
  /* armadilha de mandíbula: aberta (dentes para cima) e fechada (mandíbulas em pé) */
  const seg=(g,p,q,t,col)=>{const dx=q[0]-p[0],dy=q[1]-p[1],dz=q[2]-p[2],L=Math.hypot(dx,dy,dz);add(g,boxTris(t,L+0.01,t),alignY((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2,dx,dy,dz),col);};
  const mandibula=(g,fechada)=>{const metal=lin(0x55595c),dente=lin(0x9aa0a4);add(g,cylTris(0.15,0.16,0.03,12),mat(0,0,0),metal);add(g,cylTris(0.06,0.06,0.04,8),mat(0,0.025,0),lin(0x8a6a2a));
    for(const s of[-1,1]){const pt=a=>fechada?[Math.cos(a)*0.24,0.03+Math.sin(a)*0.24,s*0.015]:[Math.cos(a)*0.24,0.03,s*Math.sin(a)*0.24];
      for(let i=0;i<8;i++){const a0=i/8*Math.PI,a1=(i+1)/8*Math.PI;seg(g,pt(a0),pt(a1),0.025,metal);}
      for(let i=1;i<8;i++){const a=i/8*Math.PI,p=pt(a),dir=fechada?[-Math.cos(a),-Math.sin(a),0]:[0,1,0];add(g,cylTris(0,0.016,0.055,4),alignY(p[0],p[1],p[2],dir[0],dir[1],dir[2]),dente);}}
    for(let i=0;i<4;i++)seg(g,[0.16+i*0.07,0.015,0.01*i],[0.22+i*0.07,0.015,0.01*(i+1)],0.018,metal);add(g,cylTris(0.02,0.03,0.3,6),mat(0.46,-0.18,0.04),lin(0x4a3424));};
  O.armadilhaUrso=mk(g=>mandibula(g,false));O.armadilhaFechada=mk(g=>mandibula(g,true));
  /* móveis */
  O.camaMadeira=mk(g=>{for(const x of[-0.57,0.57])for(const z of[-0.98,0.98])add(g,bvTris(0.09,0.4,0.09),mat(x,0.2,z),md);
    for(const x of[-0.57,0.57])add(g,bvTris(0.07,0.16,2.0),mat(x,0.32,0),md2,{j:0.06,rnd:R});for(const z of[-0.98,0.98])add(g,bvTris(1.2,0.16,0.07),mat(0,0.32,z),md2);
    for(let i=0;i<7;i++)add(g,boxTris(1.1,0.03,0.12),mat(0,0.38,-0.9+i*0.3),md);
    add(g,bvTris(1.2,0.75,0.07),mat(0,0.72,-1.02),md2,{j:0.06,rnd:R});add(g,bvTris(1.3,0.07,0.1),mat(0,1.1,-1.02),md);add(g,bvTris(1.2,0.35,0.07),mat(0,0.5,1.02),md2);
    add(g,bvTris(1.08,0.16,1.9),mat(0,0.48,0),lin(0xb8b0a0),{j:0.04,rnd:R});add(g,bvTris(0.7,0.11,0.34),mat(0,0.61,-0.72),lin(0xe0dccf),{j:0.04,rnd:R});
    add(g,bvTris(1.12,0.05,1.2),mat(0,0.585,0.3),lin(0x7a3b2e),{j:0.05,rnd:R});add(g,bvTris(1.13,0.2,0.03),mat(0,0.49,0.9),lin(0x7a3b2e));});
  O.mesa=mk(g=>{add(g,bvTris(1.5,0.06,0.9),mat(0,0.76,0),md2,{j:0.06,rnd:R});for(const x of[-0.66,0.66])for(const z of[-0.36,0.36])add(g,bvTris(0.07,0.73,0.07),mat(x,0.365,z),md);
    for(const z of[-0.36,0.36])add(g,bvTris(1.3,0.08,0.03),mat(0,0.66,z),md);for(const x of[-0.66,0.66])add(g,bvTris(0.03,0.08,0.66),mat(x,0.66,0),md);
    add(g,cylTris(0.12,0.1,0.02,10),mat(-0.3,0.79,0.1),lin(0xd8d2c4));add(g,cylTris(0.04,0.035,0.1,8),mat(0.25,0.79,-0.12),lin(0x4a6a7a));
    add(g,cylTris(0.03,0.035,0.07,6),mat(0.45,0.79,0.2),lin(0xe8dcc0));add(g,cylTris(0.006,0.006,0.03,4),mat(0.45,0.86,0.2),preto);});
  O.cadeira=mk(g=>{add(g,bvTris(0.46,0.05,0.46),mat(0,0.46,0),md2,{j:0.06,rnd:R});for(const x of[-0.2,0.2])for(const z of[-0.2,0.2])add(g,bvTris(0.045,0.45,0.045),mat(x,0.225,z),md);
    for(const x of[-0.2,0.2])add(g,bvTris(0.045,0.55,0.045),mat(x,0.74,-0.2),md);for(const y of[0.68,0.84,0.98])add(g,bvTris(0.42,0.06,0.03),mat(0,y,-0.2),md2);
    for(const z of[-0.2,0.2])add(g,bvTris(0.38,0.03,0.03),mat(0,0.15,z),md);});
  O.prateleira=mk(g=>{for(const x of[-0.53,0.53])add(g,bvTris(0.04,1.86,0.38),mat(x,0.93,0),md,{j:0.05,rnd:R});
    for(const y of[0.06,0.55,1.05,1.52,1.84])add(g,bvTris(1.04,0.035,0.37),mat(0,y,0),md2,{j:0.05,rnd:R});add(g,boxTris(1.06,1.84,0.015),mat(0,0.93,-0.18),lin(0x5a412a));
    for(let i=0;i<4;i++)add(g,cylTris(0.06,0.06,0.16,8),mat(-0.38+i*0.15,0.57,0.02),lin([0xb08a3a,0x8a9a8a,0xc0b090,0x6a7a5a][i]));
    for(let i=0;i<7;i++){const h=0.22+R()*0.06;add(g,boxTris(0.045,h,0.24),mat(0.05+i*0.055,1.07+h/2,0,0,0,i===6?-0.25:0),lin([0x7a2a22,0x2a4a6a,0x3a5a2a,0x8a6a2a,0x5a2a5a,0x2a2a2a,0x8a3a2a][i]));}
    add(g,cylTris(0.11,0.11,0.12,10),mat(-0.3,1.54,0),lin(0x8a7650));for(let i=0;i<3;i++)add(g,cylTris(0.045,0.045,0.12,8),mat(0.15+i*0.11,0.08,0.05),lin(0x9aa0a4));});
  O.lampParede=mk(g=>{const metal=lin(0x3b3e42);add(g,bvTris(0.1,0.24,0.025),mat(0,0.33,-0.165),metal);add(g,boxTris(0.025,0.025,0.19),mat(0,0.43,-0.075),metal);add(g,boxTris(0.012,0.12,0.012),mat(0,0.37,0),metal);
    add(g,cylTris(0.07,0.08,0.04,8),mat(0,0,0),metal);add(g,cylTris(0.05,0.05,0.2,8),mat(0,0.04,0),lin(0xffc66a),{e:2.2});
    for(const a of[0,1.57,3.14,4.71])add(g,boxTris(0.015,0.2,0.015),mat(Math.cos(a)*0.06,0.14,Math.sin(a)*0.06),metal);add(g,cylTris(0.03,0.08,0.05,8),mat(0,0.24,0),metal);});});

/* ---------- sons da casa ---------- */
Object.assign(SONS,{
  persiana:({noise,tone,r})=>{noise(0.12,'bandpass',900*r(),500,3,0.25);tone(0.08,'triangle',300*r(),220,0.06,0.1);noise(0.07,'bandpass',1500*r(),900,2,0.2,0.14);},
  tranca:({noise,tone,r})=>{noise(0.18,'bandpass',600*r(),350,4,0.3);tone(0.12,'triangle',180*r(),120,0.12,0.12);noise(0.06,'lowpass',420,200,1,0.45,0.2);},
  portaPresa:({noise,tone,r})=>{for(let i=0;i<3;i++){noise(0.07,'bandpass',700*r(),400,3,0.3,i*0.13);tone(0.05,'square',140*r(),120,0.04,i*0.13);}},
  armadilha:({noise,tone,r})=>{noise(0.08,'highpass',3000,1800,1,0.9);tone(0.25,'square',420*r(),180,0.12);noise(0.3,'bandpass',1800*r(),900,6,0.25,0.03);},
  portaoGrande:({noise,tone,r})=>{tone(1.3,'sawtooth',68*r(),52,0.03);noise(1.2,'bandpass',300*r(),180,6,0.07);tone(0.9,'triangle',210*r(),160,0.02,0.25);},
  passoMadeira:({noise,tone,r,extra})=>{tone(0.09,'sine',130*r(),85,0.22);noise(0.07,'bandpass',700*r(),420,1.6,0.35);if(extra)noise(0.4,'bandpass',420*r(),300,9,0.05,0.04);}});
/* passos no assoalho: em cima de piso construído (plataforma, escada, ponte, torre) o passo soa oco, de madeira */
function noAssoalho(){if(!P.noChao||P.y<-20)return false;const s=supEm(P.x,P.z,P.y,0.2);return!!(s&&s.dono&&OBRAS[s.dono.tipo]);}
{const _s=sfx;sfx=function(nome,x,z,vol,extra){if(nome==='passo'&&x===undefined&&extra!=='agua'&&noAssoalho())return _s.call(this,'passoMadeira',x,z,vol,Math.random()<0.12?1:0);return _s.apply(this,arguments);};}

/* ---------- por passo: persianas, portão grande, armadilhas e rangidos da casa ---------- */
let rangidoT=20;
PASSOS.push(function defesaPassos(dt){
  for(const o of OB){if(o.tipo==='janela'||o.tipo==='janelaAlta'){const a=o.ext.fechada?1:0;if(o.pers!==a)o.pers=approach(o.pers||0,a,dt*3);}
    else if(o.tipo==='portaoGrande'){const perto=d2(o.x,o.z,P.x,P.z)<5.5*5.5||(CARRO.ativo&&d2(o.x,o.z,CARRO.x,CARRO.z)<10*10);const alvo=perto||energiaFiado(o)&&o.energ?1:0;
      if(o.alvoAbre!==alvo){if(o.alvoAbre!==undefined)sfx('portaoGrande',o.x,o.z,0.9);o.alvoAbre=alvo;}o.abre=approach(o.abre||0,alvo,dt*0.9);}}
  armadilhaPassos(dt);
  // a casa range à noite (ou na ventania) quando você está debaixo do seu telhado
  rangidoT-=dt;if(rangidoT<=0){rangidoT=25+Math.random()*35;const vento=typeof climaK==='function'?Math.max(climaK('ventania'),climaK('tempestade')):0;
    if((G.noite||vento>0.4)&&OB.some(q=>tetoCobre(q,P.x,P.z,P.y))){
      const a=Math.random()*6.283;sfx('rangido',P.x+Math.cos(a)*3,P.z+Math.sin(a)*3,0.45);}}});
