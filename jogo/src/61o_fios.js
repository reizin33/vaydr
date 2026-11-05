/* ================= Etapa 17: painel de energia, tela de fios e fios no mundo =================
   · Painel (segure E numa peça elétrica, ou toque nas que não guardam nada): estado da peça e da rede, e os botões de cada uma
     (interruptor liga e desliga, horário do temporizador, quem o sensor percebe, filtro da esteira, ligar e abastecer o gerador).
   · Tela de fios (U, botão Fios no modo de construção ou no painel): vista de cima das peças elétricas por perto. Arraste de uma
     peça até outra para ligar a saída da primeira na entrada da segunda; toque numa peça para ver os fios dela; toque num fio
     para cortar. Ligar e cortar pedem um alicate na mochila (ele gasta um pouco a cada fio).
   · Os fios aparecem no mundo, pendurados entre as peças. */
ESTACOES.energia={nome:'Energia',icon:'i-energia',ir:'',chip:'Energia'};
const ELET_ALT={gerador:0.95,bateriaBase:0.8,interruptor:1.15,temporizador:1.15,sensor:1.2,divisor:0.95,luminaria:1.85,poste:2.9,geladeira:1.7,freezer:0.85,esteira:0.55,
  bestaAuto:0.7,armCartucho:0.25,lancaChamas:0.95,lamparina:0.35,lampParede:0.3,arame:0.9,bombaAgua:0.9,fervedor:0.9,barrilAgua:1.0,poco:1.05,antenaBase:1.6,fornalha:1.0,
  defumador:1.2,portaMadeira:2.0,portao:1.6,portaoFerro:1.6,portaoGrande:2.4,armadilhaUrso:0.12,filtroAgua:1.0};
const ELET_CURTO={gerador:'Gerador',bateriaBase:'Baterias',interruptor:'Interruptor',temporizador:'Temporizador',sensor:'Sensor',divisor:'Divisor',luminaria:'Lâmpada',poste:'Poste',
  lamparina:'Lamparina',lampParede:'Lamparina',arame:'Arame',bombaAgua:'Bomba',fervedor:'Fervedor',barrilAgua:'Barril',poco:'Poço',antenaBase:'Antena',fornalha:'Fornalha',defumador:'Defumador',
  portaMadeira:'Porta',portao:'Portão',portaoFerro:'Portão',portaoGrande:'Portão',armadilhaUrso:'Mandíbula',geladeira:'Geladeira',freezer:'Freezer',esteira:'Esteira',bestaAuto:'Besta',
  armCartucho:'Cartucho',lancaChamas:'Lança-chamas',filtroAgua:'Filtro'};
const ELET_ART={geladeira:'a geladeira',freezer:'o freezer',bestaAuto:'a besta automática',armCartucho:'a armadilha de cartucho',lancaChamas:'o lança-chamas'};
/* filtro de água da Etapa 13 entra na rede: com energia filtra o dobro */
ELET.filtroAgua={w:80,p:'consumo',ent:1,sai:0};
{const _ae=aguaEstado;aguaEstado=function(o){const k=_ae.apply(this,arguments);return o&&o.tipo==='filtroAgua'&&energiaFiado(o)&&o.energ?k*2:k;};}
ENER.fv=0;
{const _l=ligarFio,_c=cortarFio,_car=V8.carregar.energia,_nv=V8.novo.energia;ligarFio=function(){const r=_l.apply(this,arguments);if(!r)ENER.fv++;return r;};
  cortarFio=function(){ENER.fv++;return _c.apply(this,arguments);};V8.carregar.energia=function(){ENER.fv++;return _car.apply(this,arguments);};V8.novo.energia=function(){ENER.fv++;return _nv.apply(this,arguments);};}
const redeEletDe=o=>ENER.redes.find(r=>r.L.includes(o))||null;
const temAlicate=()=>P.inv.find(s=>s&&s.id==='alicate'&&!(s.dur<=0))||null;
const wTxt=w=>w>=1000?(w/1000).toFixed(w%1000?1:0).replace('.',',')+' kW':Math.round(w)+' W';
const whTxt=w=>w>=1000?(w/1000).toFixed(1).replace('.',',')+' kWh':Math.round(w)+' Wh';
function eletNome(o){return OBRAS[o.tipo]?OBRAS[o.tipo].nome:o.tipo;}
/* uma linha curta com o estado da peça */
function eletEstado(o){const d=ELET[o.tipo],e=o.ext||{};if(!d)return'';const fi=energiaFiado(o);
  if(d.p==='fonte'){const c=Math.round((e.comb||0)*100);if(!(e.comb>0))return'sem gasolina';if(e.ligado===false)return'desligado · '+c+'% no tanque';return(fi?(o.rodando?'funcionando':'parado, ninguém puxa'):'ligado, sem fio')+' · '+c+'% no tanque';}
  if(d.p==='bateria')return Math.round((e.carga||0)/d.cap*100)+'% ('+whTxt(e.carga||0)+')'+(o.energ?' · carregando':'');
  if(d.p==='logica'){const on=logicaLigada(o);let t=o.tipo==='interruptor'?(on?'ligado':'desligado'):o.tipo==='temporizador'?'das '+(e.h0??18)+'h às '+(e.h1??6)+'h · '+(on?'deixando passar':'fechado'):
      o.tipo==='sensor'?(on?'percebeu movimento':'esperando')+' · '+({zumbi:'zumbis',gente:'gente',todos:'todos'}[e.modo||'zumbi']):'3 saídas';return t+(fi?(o.energ?' · com energia':' · sem energia'):' · sem fio');}
  if(!fi)return'sem fio · gasta '+wTxt(d.w);return(o.energ?'com energia':'sem energia')+' · gasta '+wTxt(querW(o)||d.w);}
/* ---------- painel ---------- */
function painelVolta(){const o=ENER.painel;ENER.painel=null;if(o&&o._estVolta){o.estTipo=o._estVolta.t;o.nome=o._estVolta.n;delete o._estVolta;}}
let _abrirEst=null;
function abrirEnergia(o){if(!eletDe(o)||G.modo!=='jogo')return;painelVolta();eidDe(o);eletMapa();energiaResolver(0);o._estVolta={t:o.estTipo,n:o.nome};o.estTipo='energia';o.nome=eletNome(o);ENER.painel=o;
  (_abrirEst||abrirEstacao)(o);if(G.modo!=='estacao')painelVolta();}
/* o painel de energia não toma o lugar do painel normal da peça (fornalha, barril...): ao fechar, volta como era */
{const _ae=abrirEstacao;_abrirEst=_ae;abrirEstacao=function(st){if(G.modo==='jogo')painelVolta();return _ae.apply(this,arguments);};
  const _fe=fecharEstacao;fecharEstacao=function(){const r=_fe.apply(this,arguments);if(G.modo!=='estacao')painelVolta();return r;};}
PASSOS.push(function painelEnergiaVolta(){if(ENER.painel&&G.modo!=='estacao')painelVolta();});
function vagaE(icon,t,s,f,pronta){return'<div class="es-vaga'+(pronta?' pronta':'')+'">'+svgUse(icon)+'<span><b>'+t+'</b><small>'+s+'</small></span>'+(f!==undefined&&f!==null?barraHTML(f):'')+'</div>';}
ESTACAO_UI.energia={resumo:o=>eletEstado(o),
  render(o){const d=ELET[o.tipo]||{},e=o.ext||(o.ext={}),fi=energiaFiado(o),R=redeEletDe(o),D=OBRAS[o.tipo];let c='<div class="es-lista">';
    c+=vagaE(D.icon,eletNome(o),eletEstado(o),d.p==='bateria'?(e.carga||0)/d.cap:d.p==='fonte'?(e.comb||0):null,!!(o.energ||o.rodando));
    if(R){const nG=R.L.filter(q=>ELET[q.tipo].p==='fonte').length,nB=R.L.filter(q=>ELET[q.tipo].p==='bateria').length;
      c+=vagaE('i-energia','Rede: '+R.L.length+' peça'+(R.L.length>1?'s':''),(R.falta?'FALTA ENERGIA · ':'')+'pede '+wTxt(R.D)+' · gerador '+(nG?wTxt(R.Pg):'nenhum')+(nB?' · baterias '+whTxt(R.carga)+' de '+whTxt(R.cap):''),R.cap?R.carga/R.cap:null,!R.falta&&R.D>0);}
    c+='</div>';const A=[],nf=ENER.fios.filter(f=>f.a===e.eid||f.b===e.eid).length;
    let info='';
    switch(o.tipo){
      case'gerador':{const gas=invCount('gasolina');A.push({id:'tog',t:e.ligado===false?'Ligar o gerador':'Desligar o gerador',s:fi?'com fio: trabalha quando alguém puxa energia':'sem fio: acende os postes perto à noite',ok:true,prim:e.ligado===false&&(e.comb||0)>0});
        A.push({id:'abastecer',t:'Abastecer',s:gas?'1 galão de gasolina (tem '+gas+')':'sem gasolina na mochila',ok:gas>0&&(e.comb||0)<=0.6});
        info='Com fio, o gerador produz até '+wTxt(ELET.gerador.prod)+' e gasta mais gasolina quanto mais a rede puxa. Sobra vai para as baterias ligadas na saída dele.';break;}
      case'bateriaBase':info='Entrada: ligue a saída do gerador aqui para carregar (até '+wTxt(d.taxa)+'). Saídas (2): o que gasta. Quando o gerador para ou não dá conta, as baterias seguram a rede.';break;
      case'interruptor':A.push({id:'tog',t:e.on===false?'Ligar':'Desligar',s:'o que está depois dele '+(e.on===false?'volta a receber energia':'fica sem energia'),ok:true,prim:true});info='Toque E no interruptor para ligar e desligar sem abrir o painel.';break;
      case'temporizador':{const h0=e.h0??18,h1=e.h1??6;A.push({id:'t_noite',t:'À noite',s:'das 18h às 6h',ok:!(h0===18&&h1===6)},{id:'t_dia',t:'De dia',s:'das 6h às 18h',ok:!(h0===6&&h1===18)},
          {id:'t_h0',t:'Começa às '+((h0+1)%24)+'h',s:'agora começa às '+h0+'h',ok:true},{id:'t_h1',t:'Termina às '+((h1+1)%24)+'h',s:'agora termina às '+h1+'h',ok:true});
        info='Agora são '+Math.floor(G.hora)+'h: '+(horaNo(h0,h1)?'a energia passa.':'a energia não passa.');break;}
      case'sensor':{const m=e.modo||'zumbi',r=e.r||10,sg=e.seg||6,prox={zumbi:'gente',gente:'todos',todos:'zumbi'}[m];
        A.push({id:'s_modo',t:'Perceber: '+{zumbi:'gente',gente:'todos',todos:'só zumbis'}[m],s:'agora percebe '+{zumbi:'só zumbis',gente:'gente (você, sobreviventes, carro)',todos:'zumbis e gente'}[m],ok:true},
          {id:'s_r',t:'Alcance: '+(r>=15?5:r+5)+' m',s:'agora '+r+' m',ok:true},{id:'s_seg',t:'Fica ligado '+(sg>=30?6:sg>=15?30:15)+' s',s:'depois de perceber, agora '+sg+' s',ok:true});
        info='Ponha um portão, uma lâmpada ou uma defesa depois do sensor: eles só recebem energia quando ele percebe movimento.';void prox;break;}
      case'divisor':info='Uma entrada e três saídas: leva a mesma rede para até três peças (ou para outros divisores).';break;
      case'esteira':{const f=e.filtro||'tudo',i=EST_FILTROS.findIndex(q=>q[0]===f),nx=EST_FILTROS[(i+1)%EST_FILTROS.length];
        A.push({id:'filtro',t:'Filtro: '+nx[1].toLowerCase(),s:'agora leva: '+(EST_FILTROS[i]||EST_FILTROS[0])[1].toLowerCase(),ok:true});
        info='Ponha um baú (ou fornalha, defumador) atrás da esteira e outro na frente: com energia ela leva uma coisa a cada 3 s. '+(o.estado?'Agora: '+o.estado+'.':'');break;}
      case'geladeira':case'freezer':info='Toque E para abrir. '+(o.energ?(o.tipo==='freezer'?'Ligado: a comida dentro não envelhece.':'Ligada: a comida dentro envelhece a 10%.'):'Sem energia: guarda como um baú.');break;
      case'bestaAuto':info='Ponha flechas dentro (toque E). Com energia, atira sozinha no zumbi mais perto até 18 m. Flechas dentro: '+(o.itens||[]).reduce((s,q)=>s+(q&&q.id==='flecha'?q.n:0),0)+'.';break;
      case'armCartucho':info='Ponha cartuchos dentro. Com energia, dispara quando um zumbi passa na frente (até 5 m). Cartuchos dentro: '+(o.itens||[]).reduce((s,q)=>s+(q&&q.id==='cartucho'?q.n:0),0)+'.';break;
      case'lancaChamas':info='Ponha óleo de motor dentro. Com energia, queima os zumbis na frente (até 6 m). Óleo: '+(o.itens||[]).reduce((s,q)=>s+(q&&q.id==='oleoMotor'?q.n:0),0)+' (+'+(e.oleo||0)+' jatos no tanque).';break;
      case'luminaria':info='Luz forte e branca enquanto recebe energia. Ponha um interruptor, um temporizador ou um sensor no fio para controlar.';break;
      default:info='';}
    if(ELET[o.tipo]&&ELET[o.tipo].p==='consumo'&&!['geladeira','freezer','bestaAuto','armCartucho','lancaChamas','esteira','luminaria'].includes(o.tipo))info=(ENERGIA_FAZ[o.tipo]||'')+(info?' '+info:'');
    if(ELET_ART[o.tipo])A.unshift({id:'abrir',t:'Abrir '+ELET_ART[o.tipo],s:(o.itens||[]).filter(Boolean).length+' de '+BAU_N+' espaços usados',ok:true,prim:true});
    const temEnt=d.ent>0&&!ENER.fios.some(f=>f.b===e.eid);
    if(temEnt&&d.p!=='bateria')A.push({id:'auto',t:'Ligar na fonte mais perto',s:'gasta fio da mochila (tem '+invCount('fio')+')',ok:invCount('fio')>0});
    A.push({id:'fios',t:'Tela de fios',s:temAlicate()?'ligar e cortar com o mouse ou o dedo':'ver; para ligar e cortar precisa de alicate',ok:true,prim:!fi&&!ELET_ART[o.tipo]&&o.tipo!=='interruptor'});
    if(nf)A.push({id:'cortar',t:'Cortar os fios desta peça',s:nf+' fio'+(nf>1?'s':'')+(temAlicate()?' · o fio volta para a mochila':' · precisa de alicate'),ok:!!temAlicate()});
    return{sub:fi?(o.energ||o.rodando||(d.p==='bateria'&&(e.carga||0)>0.5)?'Ligada na rede':'Ligada, mas sem energia agora'):'Sem fio: ligue na tela de fios',corpo:c+(info?'<p class="es-info">'+info+'</p>':''),acoes:A};},
  acao(o,id){const e=o.ext||(o.ext={});
    switch(id){
      case'abrir':fecharEstacao();abrirBau(o);return'';
      case'tog':if(o.tipo==='interruptor'){e.on=e.on===false;energiaResolver(0);energiaEfeitos(0);sfx('clique',o.x,o.z,0.7);return e.on?'Ligado.':'Desligado.';}
        if(o.tipo==='gerador'){e.ligado=e.ligado===false;energiaResolver(0);energiaEfeitos(0);sfx(e.ligado?'motor':'clique',o.x,o.z,0.8);return e.ligado?'Gerador ligado.':'Gerador desligado.';}return'';
      case'abastecer':{if(!invCount('gasolina'))return'Sem gasolina na mochila.';if((e.comb||0)>0.6)return'O tanque ainda está cheio.';invRemove('gasolina',1);e.comb=Math.min(1,(e.comb||0)+0.5);e.ligado=true;progresso('geradorLigou');sfx('motor',o.x,o.z,0.8);energiaResolver(0);return'Gerador abastecido.';}
      case't_noite':e.h0=18;e.h1=6;break;case't_dia':e.h0=6;e.h1=18;break;case't_h0':e.h0=((e.h0??18)+1)%24;break;case't_h1':e.h1=((e.h1??6)+1)%24;break;
      case's_modo':e.modo={zumbi:'gente',gente:'todos',todos:'zumbi'}[e.modo||'zumbi'];break;case's_r':e.r=(e.r||10)>=15?5:(e.r||10)+5;break;case's_seg':e.seg=(e.seg||6)>=30?6:(e.seg||6)>=15?30:15;break;
      case'filtro':{const i=EST_FILTROS.findIndex(q=>q[0]===(e.filtro||'tudo'));e.filtro=EST_FILTROS[(i+1)%EST_FILTROS.length][0];break;}
      case'auto':{const b=autoLigar(o,true);if(!b)return invCount('fio')?'Nenhuma fonte livre a até 25 m (gerador, baterias, divisor, interruptor...).':'Sem fio na mochila.';return'Ligada em '+eletNome(b).toLowerCase()+' ('+fioCusto(b,o)+' fio'+(fioCusto(b,o)>1?'s':'')+').';}
      case'fios':fecharEstacao();abrirFios(o);return'';
      case'cortar':{const s=temAlicate();if(!s)return'Precisa de um alicate.';const L=ENER.fios.filter(f=>f.a===e.eid||f.b===e.eid);for(const f of L)cortarFio(f);gastar(s,1);return'Cortou '+L.length+' fio'+(L.length>1?'s':'')+'.';}}
    energiaResolver(0);sfx('clique');return'';}};
const ENERGIA_FAZ={poste:'Com energia, acende à noite.',lamparina:'Com energia, acende sozinha (e apaga quando a energia acaba).',lampParede:'Com energia, acende sozinha (e apaga quando a energia acaba).',
  arame:'Com energia, dá choque em quem encosta.',bombaAgua:'Com energia, bombeia sozinha a água do poço.',fervedor:'Com energia, ferve sem gastar lenha.',barrilAgua:'Com energia, purifica a água suja que você despejar (6 L por hora).',
  poco:'Com energia, a bomba elétrica dentro dele enche o dobro.',antenaBase:'Com energia, o rádio traz uma oferta a mais por dia.',fornalha:'Com energia, trabalha 50% mais rápido.',defumador:'Com energia, trabalha 50% mais rápido.',
  portaMadeira:'Abre quando a energia chega e fecha quando ela acaba (ponha um interruptor ou um sensor no meio).',portao:'Abre quando recebe energia (além de abrir para você chegar perto).',
  portaoFerro:'Abre quando recebe energia (além de abrir para você chegar perto).',portaoGrande:'Abre quando recebe energia (além de abrir para você ou o carro).',armadilhaUrso:'Com energia, se arma sozinha depois de pegar alguém.',
  filtroAgua:'Com energia, filtra o dobro.'};
/* ---------- interações ---------- */
INTERS.push(function eletrInter(tryIt){if(!P.alive||CARRO.ativo)return;for(const o of OB){const d=ELET[o.tipo];if(!d||o.hp<=0||Math.abs(o.x-P.x)>4||Math.abs(o.z-P.z)>4)continue;
  if(E17_OBRAS.includes(o.tipo)&&!OBRAS[o.tipo].bau)tryIt({k:'eletr',o},o.x,o.z,o.tipo==='esteira'?2.2:1.9,1.5,-0.6,o.y);}});
INTER_K.eletr={texto:o=>{const n=eletNome(o),s=eletEstado(o);if(o.tipo==='interruptor'){const on=(o.ext||{}).on!==false;return{t:on?'Desligar o interruptor':'Ligar o interruptor',s:s+' · segure: painel',alt:true,dur:0.6};}return{t:n,s:s+' · toque: painel'};},
  usar:(o,seg)=>{if(o.tipo==='interruptor'&&!seg){INTER_K.eletr.curto(o);return;}abrirEnergia(o);},
  curto:o=>{if(o.tipo!=='interruptor'){abrirEnergia(o);return;}const e=o.ext||(o.ext={});e.on=e.on===false;energiaResolver(0);energiaEfeitos(0);sfx('clique',o.x,o.z,0.8);feed(e.on?'Interruptor ligado':'Interruptor desligado');}};
INTER_K.guarda=Object.assign(INTER_K.guarda||{},{curto:o=>abrirBau(o)});
INTER_K.baseObra=Object.assign(INTER_K.baseObra||{},{curto:o=>baseInteragir(o)});
{const _ti=textoInter;textoInter=function(a){const r=_ti.apply(this,arguments);if(!a||!a.o||!r)return r;const o=a.o;
  if(a.k==='guarda'&&ELET[o.tipo]){const n=(o.itens||[]).filter(Boolean).length;return{t:'Abrir '+(ELET_ART[o.tipo]||eletNome(o).toLowerCase()),s:(energiaFiado(o)?o.energ?'com energia':'sem energia':'sem fio')+' · '+n+' de '+BAU_N+' · segure: energia',alt:true,dur:0.7};}
  if(a.k==='baseObra'&&OBRAS[o.tipo]&&OBRAS[o.tipo].gerador)return Object.assign({},r,{s:(r.s?r.s+' · ':'')+'segure: energia e fios',alt:true,dur:0.7});
  return r;};}
{const _ia=interagir;interagir=function(seg){const a=alvoInter;if(seg&&a&&a.o&&((a.k==='guarda'&&ELET[a.o.tipo])||(a.k==='baseObra'&&OBRAS[a.o.tipo]&&OBRAS[a.o.tipo].gerador))){abrirEnergia(a.o);return;}return _ia.apply(this,arguments);};}
/* gerador sem fio continua como antes; o painel liga também quem está perto */
/* ---------- tela de fios ---------- */
TELAS.push('t-fios');
const FT={o:null,cx:0,cz:0,k:1,W:0,H:0,nos:[],sel:null,selFio:null,arr:null,ligando:false,msg:'',volta:'jogo',zoom:1,panX:0,panZ:0,base:null,pan:null};
function abrirFios(o){if(G.modo!=='jogo'&&G.modo!=='estacao')return;if(G.modo==='estacao')fecharEstacao();FT.o=o||null;FT.sel=o&&eletDe(o)?o:null;FT.selFio=null;FT.ligando=false;FT.arr=null;FT.zoom=1;FT.panX=FT.panZ=0;FT.base=null;FT.pan=null;
  FT.msg=temAlicate()?'Arraste de uma peça até outra para ligar. Toque num fio para cortar.':'Sem alicate: dá para ver, mas não para ligar nem cortar. Faça um na bancada (ferramentas).';
  G.modo='fios';IN.attack=false;IN.mx=IN.mz=0;if(document.pointerLockElement)document.exitPointerLock();eletMapa();energiaResolver(0);tela('t-fios');fiosRender(true);sfx('clique');dica('telaFios','corpo','Tela de fios: arraste da peça que dá energia (gerador, baterias, interruptor...) até a que gasta. Cada 4 m gasta 1 fio elétrico.');}
function fecharFios(){if(G.modo!=='fios')return;G.modo='jogo';tela(null);FT.arr=null;if(typeof pedirTrava==='function'&&!OBRA.ativo)pedirTrava();sfx('clique');}
/* o que aparece: peças elétricas a até 40 m do centro (a peça de onde abriu, ou você); a vista começa enquadrando o que está a até 18 m.
   Roda do mouse ou + e − aproximam; arrastar o fundo move a vista; ⌖ volta ao começo. */
function fiosVista(){const c=FT.o&&FT.o.hp>0?FT.o:P,L=OB.filter(o=>eletDe(o)&&d2(o.x,o.z,c.x,c.z)<40*40);for(const o of L)eidDe(o);
  const area=$('fios-area'),W=area.clientWidth||640,H=area.clientHeight||480;FT.W=W;FT.H=H;FT.L=L;
  if(!FT.base){let x0=c.x,x1=c.x,z0=c.z,z1=c.z;for(const o of L.concat([P])){if(d2(o.x,o.z,c.x,c.z)>18*18)continue;x0=Math.min(x0,o.x);x1=Math.max(x1,o.x);z0=Math.min(z0,o.z);z1=Math.max(z1,o.z);}
    const pad=3,sx=Math.max(12,x1-x0+pad*2),sz=Math.max(12,z1-z0+pad*2);FT.base={k:Math.min(W/sx,H/sz),cx:(x0+x1)/2,cz:(z0+z1)/2};}
  FT.k=FT.base.k*FT.zoom;FT.cx=FT.base.cx+FT.panX;FT.cz=FT.base.cz+FT.panZ;}
function fiosZoom(f,mx,my){const k0=FT.k||1,z=clamp(FT.zoom*f,0.35,5);if(z===FT.zoom)return;mx=mx??FT.W/2;my=my??FT.H/2;const wx=FT.cx+(mx-FT.W/2)/k0,wz=FT.cz+(my-FT.H/2)/k0;
  FT.zoom=z;const k1=FT.base.k*z;FT.panX=wx-(mx-FT.W/2)/k1-FT.base.cx;FT.panZ=wz-(my-FT.H/2)/k1-FT.base.cz;fiosRender(true);}
const fx_=x=>FT.W/2+(x-FT.cx)*FT.k,fz_=z=>FT.H/2+(z-FT.cz)*FT.k;
function fiosRender(tudo){const area=$('fios-area'),nos=$('fios-nos');if(!area||!nos)return;fiosVista();
  /* nós (botões): reaproveita os que já existem */
  const pos=[];for(const o of FT.L){let x=fx_(o.x),y=fz_(o.z);for(const p of pos)if(Math.hypot(p[0]-x,p[1]-y)<24){y+=24;}pos.push([x,y]);o._fx=x;o._fy=y;}
  /* nome embaixo só quando cabe (senão aparece ao escolher, passar o mouse ou focar) */
  let h='';FT.L.forEach((o,i)=>{const x=o._fx,y=o._fy,perto=pos.some((p,j)=>j!==i&&Math.abs(p[0]-x)<58&&Math.abs(p[1]-y)<40);
    const d=ELET[o.tipo],R=redeEletDe(o),cls=['fio-no'];if(o.energ||o.rodando||(d.p==='bateria'&&(o.ext.carga||0)>0.5))cls.push('on');if(R&&R.falta)cls.push('falta');if(FT.sel===o)cls.push('sel');
    if(FT.arr&&FT.arr.alvo===o)cls.push(FT.arr.ok?'alvo':'ruim');if(!energiaFiado(o))cls.push('solto');if(perto)cls.push('sem-nome');
    h+='<button type="button" class="'+cls.join(' ')+'" data-eid="'+o.ext.eid+'" style="left:'+x.toFixed(1)+'px;top:'+y.toFixed(1)+'px" aria-label="'+eletNome(o)+': '+eletEstado(o)+'">'+svgUse(OBRAS[o.tipo].icon)+
      (d.sai?'<i class="pt sai"></i>':'')+(d.ent?'<i class="pt ent"></i>':'')+'<small>'+(ELET_CURTO[o.tipo]||eletNome(o))+'</small></button>';});
  if(tudo||nos.dataset.v!==h){const foco=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.eid:null;nos.innerHTML=h;nos.dataset.v=h;
    if(foco){const b=nos.querySelector('[data-eid="'+foco+'"]');if(b)b.focus({preventScroll:true});}}
  fiosDesenhar();fiosLado();const m=$('fios-msg');if(m)m.textContent=FT.msg||'';}
function fioPontos(f){const a=eletPorEid(f.a),b=eletPorEid(f.b);if(!a||!b)return null;const ax=a._fx??fx_(a.x),ay=a._fy??fz_(a.z),bx=b._fx??fx_(b.x),by=b._fy??fz_(b.z);return[ax,ay,bx,by,a,b];}
function fiosDesenhar(){const c=$('fios-c');if(!c)return;const dp=Math.min(2,window.devicePixelRatio||1),W=Math.round(FT.W*dp),H=Math.round(FT.H*dp);if(c.width!==W||c.height!==H){c.width=W;c.height=H;}
  const g=c.getContext('2d');if(!g)return;g.setTransform(dp,0,0,dp,0,0);g.clearRect(0,0,FT.W,FT.H);g.fillStyle='#10140f';g.fillRect(0,0,FT.W,FT.H);
  /* grade de 4 m (o tamanho de 1 fio) */
  const passo=FIO_M*FT.k;g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=1;if(passo>6){const ox=((FT.W/2-FT.cx*FT.k)%passo+passo)%passo,oy=((FT.H/2-FT.cz*FT.k)%passo+passo)%passo;g.beginPath();
    for(let x=ox;x<FT.W;x+=passo){g.moveTo(x,0);g.lineTo(x,FT.H);}for(let y=oy;y<FT.H;y+=passo){g.moveTo(0,y);g.lineTo(FT.W,y);}g.stroke();}
  /* alcance de 30 m da peça escolhida */
  if(FT.sel&&FT.sel.hp>0){g.strokeStyle='rgba(232,197,71,.18)';g.setLineDash([6,6]);g.beginPath();g.arc(FT.sel._fx??fx_(FT.sel.x),FT.sel._fy??fz_(FT.sel.z),FIO_MAX*FT.k,0,Math.PI*2);g.stroke();g.setLineDash([]);}
  /* fios */
  for(const f of ENER.fios){const p=fioPontos(f);if(!p)continue;const[ax,ay,bx,by,a]=p,viva=!!(a.energ||a.rodando||(ELET[a.tipo].p==='bateria'&&(a.ext.carga||0)>0.5)),sel=FT.selFio===f||(FT.sel&&(FT.sel===a||FT.sel===p[5]));
    g.strokeStyle=FT.selFio===f?'#ffffff':viva?'#e8c547':'#77806f';g.lineWidth=FT.selFio===f?4:sel?3:2.2;g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.stroke();
    const mx=(ax+bx)/2,my=(ay+by)/2,an=Math.atan2(by-ay,bx-ax);g.fillStyle=g.strokeStyle;g.beginPath();g.moveTo(mx+Math.cos(an)*7,my+Math.sin(an)*7);g.lineTo(mx+Math.cos(an+2.5)*6,my+Math.sin(an+2.5)*6);g.lineTo(mx+Math.cos(an-2.5)*6,my+Math.sin(an-2.5)*6);g.fill();
    if(f.n){g.fillStyle='rgba(16,20,15,.85)';g.fillRect(mx+6,my-16,18,13);g.fillStyle='#cfc8b4';g.font='600 10px system-ui,sans-serif';g.fillText(f.n,mx+9,my-6);}}
  /* fio sendo puxado */
  if(FT.arr&&FT.arr.mov){const a=FT.arr.de;g.strokeStyle=FT.arr.alvo?(FT.arr.ok?'#8fd16a':'#d0603f'):'#e8e2d0';g.lineWidth=2.5;g.setLineDash([7,5]);g.beginPath();g.moveTo(a._fx,a._fy);g.lineTo(FT.arr.x,FT.arr.y);g.stroke();g.setLineDash([]);}
  /* você */
  const px=fx_(P.x),py=fz_(P.z);g.fillStyle='#ece4d2';g.beginPath();g.arc(px,py,5,0,Math.PI*2);g.fill();g.strokeStyle='#ece4d2';g.lineWidth=2;g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.sin(P.yaw)*12,py+Math.cos(P.yaw)*12);g.stroke();
  g.fillStyle='#8a8676';g.font='600 11px system-ui,sans-serif';g.fillText('grade: '+FIO_M+' m = 1 fio',8,FT.H-8);}
function fiosLado(){const el=$('fios-lado');if(!el)return;const al=temAlicate(),nf=invCount('fio');let h='<p class="fl-inv">'+svgUse('i-fio')+'<b>'+nf+'</b> fio'+(nf===1?'':'s')+' · '+(al?svgUse('i-alicate')+'alicate '+Math.round((al.dur??80)/(ITEMS.alicate.durMax||80)*100)+'%':'<span class="perigo">sem alicate</span>')+'</p>';
  if(FT.selFio){const p=fioPontos(FT.selFio);if(p){h+='<div class="fl-card"><b>Fio</b><small>'+eletNome(p[4])+' → '+eletNome(p[5])+' · '+Math.round(Math.hypot(p[4].x-p[5].x,p[4].z-p[5].z))+' m'+(FT.selFio.n?' · '+FT.selFio.n+' fio'+(FT.selFio.n>1?'s':''):'')+'</small></div>'+
      '<button class="btn perigo" type="button" data-fa="cortarSel"'+(al?'':' disabled')+'>Cortar este fio</button><button class="btn" type="button" data-fa="limpar">Voltar</button>';}}
  else if(FT.sel&&FT.sel.hp>0){const o=FT.sel,d=ELET[o.tipo],e=o.ext;h+='<div class="fl-card">'+svgUse(OBRAS[o.tipo].icon)+'<b>'+eletNome(o)+'</b><small>'+eletEstado(o)+'</small><small>'+(d.ent?'entrada: '+(ENER.fios.some(f=>f.b===e.eid)?'ligada':'livre'):'sem entrada')+' · '+(d.sai?'saídas: '+fiosSaida(o)+' de '+d.sai:'sem saída')+'</small></div>';
    if(FT.ligando)h+='<p class="fl-dica">Toque na peça que vai receber a energia.</p><button class="btn" type="button" data-fa="cancelar">Cancelar</button>';
    else{if(d.sai)h+='<button class="btn prim" type="button" data-fa="ligar"'+(al&&fiosSaida(o)<d.sai?'':' disabled')+'>Ligar a saída em outra peça</button>';
      const L=ENER.fios.filter(f=>f.a===e.eid||f.b===e.eid);for(const f of L){const q=eletPorEid(f.a===e.eid?f.b:f.a);if(!q)continue;
        h+='<button class="btn" type="button" data-fa="cortar" data-fi="'+ENER.fios.indexOf(f)+'"'+(al?'':' disabled')+'><span>Cortar: '+(f.a===e.eid?'→ ':'← ')+eletNome(q).toLowerCase()+'</span><small>'+(f.n||0)+' fio'+(f.n===1?'':'s')+' volta'+(f.n===1?'':'m')+'</small></button>';}
      if(d.ent&&!ENER.fios.some(f=>f.b===e.eid)&&d.p!=='bateria')h+='<button class="btn" type="button" data-fa="auto"'+(nf?'':' disabled')+'>Ligar na fonte mais perto</button>';
      h+='<button class="btn" type="button" data-fa="painel">Painel da peça</button>';}}
  else h+='<p class="fl-dica">'+(FT.L&&FT.L.length?'Toque numa peça para ver os fios dela, ou arraste de uma peça até outra para ligar.':'Nenhuma peça elétrica por perto. Construa na aba Energia (B).')+'</p>';
  const R=FT.sel?redeEletDe(FT.sel):null;if(R)h+='<p class="fl-rede">Rede: '+R.L.length+' peças · pede '+wTxt(R.D)+(R.Pg?' · gerador '+wTxt(R.Pg):'')+(R.cap?' · baterias '+Math.round(R.carga/R.cap*100)+'%':'')+(R.falta?' · <span class="perigo">falta energia</span>':'')+'</p>';
  el.innerHTML=h;}
function fiosLigar(a,b){const s=temAlicate();if(!s){FT.msg='Precisa de um alicate na mochila para ligar fios.';sfx('vazio');return false;}
  const m=ligarFio(a,b);if(m){FT.msg=m+'.';sfx('vazio');return false;}gastar(s,1);const f=ENER.fios[ENER.fios.length-1];FT.msg='Ligou '+eletNome(a).toLowerCase()+' → '+eletNome(b).toLowerCase()+' ('+f.n+' fio'+(f.n>1?'s':'')+').';
  progresso('fioLigado');ganharXP(1);return true;}
function fiosCortar(f){const s=temAlicate();if(!s){FT.msg='Precisa de um alicate na mochila para cortar fios.';sfx('vazio');return;}const p=fioPontos(f);cortarFio(f);gastar(s,1);FT.selFio=null;
  FT.msg='Cortou o fio'+(p?' '+eletNome(p[4]).toLowerCase()+' → '+eletNome(p[5]).toLowerCase():'')+(f.n?' ('+f.n+' fio'+(f.n>1?'s':'')+' de volta)':'')+'.';}
function fiosAcao(id,el){switch(id){
  case'limpar':FT.selFio=null;break;case'cancelar':FT.ligando=false;break;case'ligar':FT.ligando=true;FT.msg='Toque na peça que vai receber a energia.';break;
  case'cortarSel':if(FT.selFio)fiosCortar(FT.selFio);break;
  case'cortar':{const f=ENER.fios[+el.dataset.fi];if(f)fiosCortar(f);break;}
  case'auto':{const b=FT.sel&&autoLigar(FT.sel,true);FT.msg=b?'Ligada em '+eletNome(b).toLowerCase()+'.':invCount('fio')?'Nenhuma fonte livre a até 25 m.':'Sem fio na mochila.';break;}
  case'painel':{const o=FT.sel;fecharFios();if(o)abrirEnergia(o);return;}}
  fiosRender(true);}
/* mouse e dedo: arrastar de uma peça até outra liga; tocar seleciona; tocar num fio escolhe o fio */
{const area=$('fios-area'),lado=$('fios-lado'),fx=$('fios-x');
  const noEm=(x,y)=>{const el=document.elementFromPoint(x,y),b=el&&el.closest?el.closest('.fio-no'):null;return b?eletPorEid(b.dataset.eid):null;};
  const local=ev=>{const r=area.getBoundingClientRect();return[ev.clientX-r.left,ev.clientY-r.top];};
  if(area){area.addEventListener('pointerdown',ev=>{if(G.modo!=='fios'||(ev.target.closest&&ev.target.closest('.fios-zoom')))return;const o=noEm(ev.clientX,ev.clientY),[x,y]=local(ev);
      if(o){FT.arr={de:o,x0:x,y0:y,x,y,mov:false,alvo:null,ok:false,id:ev.pointerId};try{area.setPointerCapture(ev.pointerId);}catch(_){}ev.preventDefault();return;}
      FT.pan={x0:x,y0:y,px:FT.panX,pz:FT.panZ,id:ev.pointerId,mov:false};try{area.setPointerCapture(ev.pointerId);}catch(_){}});
    const tocaFio=(x,y)=>{
      /* fio mais perto do toque */
      let best=null,bd=10;for(const f of ENER.fios){const p=fioPontos(f);if(!p)continue;const[ax,ay,bx,by]=p,dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy||1,t=clamp(((x-ax)*dx+(y-ay)*dy)/L2,0,1),d=Math.hypot(ax+dx*t-x,ay+dy*t-y);if(d<bd){bd=d;best=f;}}
      FT.selFio=best;if(best){FT.sel=null;FT.ligando=false;FT.msg=temAlicate()?'Fio escolhido: corte no botão ao lado.':'Precisa de um alicate para cortar.';}else{FT.sel=null;FT.ligando=false;}fiosRender(true);};
    area.addEventListener('pointermove',ev=>{const Q=FT.pan;if(Q&&ev.pointerId===Q.id){const[x,y]=local(ev);if(!Q.mov&&Math.hypot(x-Q.x0,y-Q.y0)>6)Q.mov=true;if(Q.mov){FT.panX=Q.px-(x-Q.x0)/FT.k;FT.panZ=Q.pz-(y-Q.y0)/FT.k;fiosRender(true);}return;}
      const A=FT.arr;if(!A||ev.pointerId!==A.id)return;const[x,y]=local(ev);A.x=x;A.y=y;if(!A.mov&&Math.hypot(x-A.x0,y-A.y0)>8)A.mov=true;if(!A.mov)return;
      const o=noEm(ev.clientX,ev.clientY);A.alvo=o&&o!==A.de?o:null;A.ok=!!(A.alvo&&!podeLigar(A.de,A.alvo));fiosDesenhar();
      const nos=$('fios-nos');for(const b of nos.children){b.classList.toggle('alvo',!!(A.alvo&&b.dataset.eid===A.alvo.ext.eid&&A.ok));b.classList.toggle('ruim',!!(A.alvo&&b.dataset.eid===A.alvo.ext.eid&&!A.ok));}});
    const solta=ev=>{const Q=FT.pan;if(Q&&ev.pointerId===Q.id){FT.pan=null;try{area.releasePointerCapture(ev.pointerId);}catch(_){}if(!Q.mov){const[x,y]=local(ev);tocaFio(x,y);}return;}
      const A=FT.arr;if(!A||ev.pointerId!==A.id)return;FT.arr=null;try{area.releasePointerCapture(ev.pointerId);}catch(_){}
      if(A.mov){const o=noEm(ev.clientX,ev.clientY);if(o&&o!==A.de){if(fiosLigar(A.de,o)){FT.sel=o;FT.selFio=null;}}else FT.msg='Solte em cima de outra peça para ligar.';fiosRender(true);return;}
      /* toque simples numa peça */
      const o=A.de;if(FT.ligando&&FT.sel&&FT.sel!==o){if(fiosLigar(FT.sel,o)){FT.ligando=false;}fiosRender(true);return;}
      FT.sel=FT.sel===o&&!FT.ligando?null:o;FT.selFio=null;FT.ligando=false;FT.msg='';fiosRender(true);};
    area.addEventListener('pointerup',solta);area.addEventListener('pointercancel',ev=>{FT.pan=null;if(FT.arr&&ev.pointerId===FT.arr.id){FT.arr=null;fiosRender(true);}});
    area.addEventListener('wheel',ev=>{if(G.modo!=='fios')return;ev.preventDefault();const[x,y]=local(ev);fiosZoom(ev.deltaY<0?1.18:1/1.18,x,y);},{passive:false});
    /* teclado e controle (Enter, A): o clique sem ponteiro faz o mesmo que tocar */
    area.addEventListener('click',ev=>{if(ev.detail!==0)return;const b=ev.target&&ev.target.closest?ev.target.closest('.fio-no'):null;if(!b)return;const o=eletPorEid(b.dataset.eid);if(!o)return;
      if(FT.ligando&&FT.sel&&FT.sel!==o){if(fiosLigar(FT.sel,o))FT.ligando=false;}else{FT.sel=o;FT.selFio=null;}fiosRender(true);});}
  if(lado)lado.addEventListener('click',ev=>{const b=ev.target.closest('[data-fa]');if(!b||b.disabled)return;fiosAcao(b.dataset.fa,b);});
  if(fx)fx.addEventListener('click',()=>fecharFios());
  const zb=$('fios-zoom');if(zb)zb.addEventListener('click',ev=>{const b=ev.target.closest('[data-fz]');if(!b)return;const k=b.dataset.fz;if(k==='mais')fiosZoom(1.3);else if(k==='menos')fiosZoom(1/1.3);else{FT.zoom=1;FT.panX=FT.panZ=0;FT.base=null;fiosRender(true);}});}
window.addEventListener('keydown',e=>{if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName||''))return;
  if(e.code==='KeyU'&&!e.repeat){if(G.modo==='jogo'){e.preventDefault();e.stopImmediatePropagation();abrirFios(OBRA.ativo&&OBRA.mira&&eletDe(OBRA.mira)?OBRA.mira:null);}else if(G.modo==='fios'){e.preventDefault();e.stopImmediatePropagation();fecharFios();}}
  else if(G.modo==='fios'&&(e.code==='Escape'||e.code==='Tab')){e.preventDefault();e.stopImmediatePropagation();if(FT.ligando||FT.selFio){FT.ligando=false;FT.selFio=null;fiosRender(true);}else fecharFios();}});
window.addEventListener('resize',()=>{if(G.modo==='fios'){FT.base=null;fiosRender(true);}});
{const _nv=navVoltar;navVoltar=function(c){if(G.modo==='fios'){if(FT.ligando||FT.selFio){FT.ligando=false;FT.selFio=null;fiosRender(true);}else fecharFios();return;}return _nv.apply(this,arguments);};}
ACOES_TECLA.splice(ACOES_TECLA.findIndex(a=>a.id==='desmontarPeca')+1,0,{id:'telaFios',nome:'Tela de fios (energia)',pad:'KeyU'});
/* botão Fios no modo de construção: aparece na aba Energia ou mirando uma peça elétrica */
{const b=$('o-fios');if(b)b.addEventListener('click',()=>abrirFios(OBRA.mira&&eletDe(OBRA.mira)?OBRA.mira:null));
  const _h=hudObraAlvo;hudObraAlvo=function(){const r=_h.apply(this,arguments);const bf=$('o-fios');if(bf){const cat=OBRA_CATS.find(c=>c.t.includes(OBRA.tipo));bf.hidden=!OBRA.ativo||!!OBRA.mov||!((cat&&cat.id==='energia')||(OBRA.mira&&eletDe(OBRA.mira)));
    const k=bf.querySelector('kbd');if(k)k.textContent=nomeTecla(teclaDe('telaFios'));}return r;};}
/* ---------- fios no mundo: pendurados entre as peças ---------- */
let fiosMesh=null,fiosSig='';
function fiosAssinatura(){let s=ENER.fv+':';for(const f of ENER.fios){const a=eletPorEid(f.a),b=eletPorEid(f.b);if(a&&b)s+=Math.round(a.x*10)+','+Math.round(a.z*10)+','+Math.round(a.y*10)+';'+Math.round(b.x*10)+','+Math.round(b.z*10)+','+Math.round(b.y*10)+'|';}return s;}
function fiosMontar(){const g=new GB(2048,8),cor=lin(0x1d1d1b),cor2=lin(0x3a3226);
  for(const f of ENER.fios){const a=eletPorEid(f.a),b=eletPorEid(f.b);if(!a||!b)continue;const ha=(ELET_ALT[a.tipo]??((OBRAS[a.tipo]&&OBRAS[a.tipo].hCol)||1)),hb=(ELET_ALT[b.tipo]??((OBRAS[b.tipo]&&OBRAS[b.tipo].hCol)||1));
    const A=[a.x,a.y+ha,a.z],B=[b.x,b.y+hb,b.z],L=Math.hypot(B[0]-A[0],B[1]-A[1],B[2]-A[2]);if(L<0.2)continue;const n=Math.max(3,Math.min(14,Math.ceil(L/1.2))),sag=Math.min(1.1,0.05*L+0.05);
    const pt=t=>[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t-sag*4*t*(1-t),A[2]+(B[2]-A[2])*t];
    for(let i=0;i<n;i++){const p=pt(i/n),q=pt((i+1)/n),dx=q[0]-p[0],dy=q[1]-p[1],dz=q[2]-p[2],l=Math.hypot(dx,dy,dz);if(l<1e-4)continue;
      add(g,boxTris(0.032,0.032,l+0.01),mat((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2,-Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(dx,dz),0),cor);}
    /* conector nas pontas */
    add(g,boxTris(0.07,0.07,0.07),mat(A[0],A[1],A[2]),cor2);add(g,boxTris(0.07,0.07,0.07),mat(B[0],B[1],B[2]),cor2);}
  return g.n?litMesh(g.data()):null;}
let fiosT=0;
DESENHO.opaco.push(function fiosDesenho(Pg){if(!ENER.fios.length){if(fiosMesh){liberarMesh(fiosMesh);fiosMesh=null;fiosSig='';}return;}
  if(G.t>=fiosT||!fiosMesh){fiosT=G.t+1;const s=fiosAssinatura();if(s!==fiosSig){fiosSig=s;if(fiosMesh)liberarMesh(fiosMesh);fiosMesh=fiosMontar();}}
  if(fiosMesh)drawStat(Pg,fiosMesh,ID);});
