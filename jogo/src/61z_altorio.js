/* ================= Etapa 22: Alto do Rio Claro, a região nova do planalto =================
   Sobe-se pela Trilha da Serra (sai do fim da rua da vila e segue o rio para o norte), com marcos amarelos e, na encosta ao lado
   da cachoeira, degraus de madeira com corrimão. No alto:
   · Bloqueio do Exército: sacos de areia, cancela, barraca e o jipe tombado; a caixa militar com cronômetro do bloqueio.
   · Pousada Alto do Rio Claro: recepção e três chalés (casas de verdade: portas, móveis, gavetas e moradores), a van da pousada,
     bancos e a roda de fogueira.
   · Galpão da Pousada, o prédio-desafio: o quadro de força está sem fusível (tem um na caixa de ferramentas do Posto do
     Guarda-Parque); com o fusível, a alavanca liga o gerador, abre o portão do almoxarifado e dispara a sirene. No almoxarifado
     a mesa do gerente guarda o cartão, que abre a sala do cofre. Recomeça 5 dias depois de concluído (com você longe).
   · Campo dos passeios de balão (barracão, biruta, cesto reserva) e o balão caído na beira da serra: revistar o cesto do piloto
     e desmontar o balão (tecido, corda, cano, sucata e peças).
   · Posto do Guarda-Parque e o Mirante, a torre de vigia no pico: lá de cima, segure E para observar e o mapa ganha o Alto
     inteiro (e o minimapa mostra mais longe por um tempo).
   · Marco de pedras do pico: um esconderijo, sempre com recompensa.
   · Nascente, córrego e a Cachoeira do Rio Claro, que cai no poço onde o rio começa (dá para beber e encher garrafas na nascente).
   · Bichos do planalto (zona de fauna nova) e os zumbis da região: aparecem quando você chega perto; quando você vai embora, os
     que sobraram ficam guardados como número e voltam quando você voltar (mais alguns por dia que passou).
   As malhas do Alto carregam pela distância (61y_regioes): longe ficam só os marcos de longe, muito longe são liberadas. */

/* ---------- prédios (montados junto com os sítios, antes da vegetação, para as árvores não nascerem dentro) ---------- */
const ARC_P={};
function arcPredios(C,N){const R=rng(22301);
  const casa=(nome,x,z,frente,cor)=>predioRural({nome,tipo:'casa',casa:true,frente,x,z,W:7.6,D:7.4,andares:1,cores:CASA_CORES[cor%CASA_CORES.length],margem:1.0,frenteQ:2.4,fundoQ:1.4,semMureta:true,varanda:1.8,local:'alto',temPorao:false});
  ARC_P.recepcao=predioRural({nome:'Recepção da Pousada',tipo:'conveniencia',frente:'E',x:42,z:-232,W:10,D:9,andares:1,local:'alto',placa:'POUSADA'});
  ARC_P.chale1=casa('Chalé 1 da pousada',20,-224,'E',1);ARC_P.chale2=casa('Chalé 2 da pousada',14,-242,'E',3);ARC_P.chale3=casa('Chalé 3 da pousada',30,-252,'N',7);
  ARC_P.galpao=predioRural({nome:'Galpão da Pousada',tipo:'armazem',frente:'W',x:58,z:-258,W:16,D:13,andares:1,local:'alto',placa:'GALPAO'});
  ARC_P.posto=predioRural({nome:'Posto do Guarda-Parque',tipo:'casa',casa:true,frente:'W',x:92,z:-270,W:8,D:7.6,andares:1,cores:[0x7a8a62,0xe0e2d0,0x6b5a4c,0x3f3a30],margem:1.0,frenteQ:2.4,fundoQ:1.4,semMureta:true,varanda:1.8,local:'alto',temPorao:false});
  for(const k of['chale1','chale2','chale3','posto'])tabuasJanelas(ARC_P[k],0.25);
  // a van da pousada, largada no pátio (porta-malas aberto)
  {const t=carMesh(C,34,-222,0.5,0xe8e4dc,R,true);interAdd({id:'alto-van',kind:'bau',x:t.tx,z:t.tz,label:'Revistar o porta-malas da van',sub:'van da pousada',tabela:'carro',respawn:4});}
  ZSPAWN.alto=[[30,-238],[22,-232],[36,-246],[50,-252],[64,-266],[88,-246],[100,-226],[80,-276],[86,-266],[72,-204],[76,-212],[44,-222]];
  arcDesafioMontar();arcMontar();}
{const _s=sitios;sitios=function(C,N,R){_s.apply(this,arguments);try{arcPredios(C,N);}catch(e){console.error('prédios do Alto',e);}};}

/* ================= prédio-desafio: Galpão da Pousada ================= */
iconesNovos({'i-cartaoP':'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>'});
Object.assign(ITEMS,{cartaoPousada:{nome:'Cartão da pousada',icon:'i-cartaoP',max:1,tipo:'util',desc:'Cartão magnético do gerente da Pousada Alto do Rio Claro. Abre a sala do cofre do galpão: passe na porta dela.'}});
const GALP={p:null};
function pdsD(){if(!G.pds||typeof G.pds!=='object')G.pds={fus:false,luz:false,cartao:false,fim:0,visto:false};return G.pds;}
function arcDesafioMontar(){const p=ARC_P.galpao;if(!p)return;GALP.p=p;
  const W=p.W,D=p.D,E=0.25,vB=D-E-5.2,ya=p.y0,S0=p.salas[0]||[],sal=S0.find(s=>s.tipo==='galpao'),dep=S0.find(s=>s.tipo==='estoque'),esc=S0.find(s=>s.tipo==='escritorio_loja');
  const PT=CID.portas.filter(d=>d.p===p&&d.f===0);GALP.portao=PT.find(d=>d.sA===sal&&d.sB===dep);GALP.cofre=PT.find(d=>d.sA===sal&&d.sB===esc);GALP.fundos=PT.find(d=>d.sA===dep&&d.sB==='fora');
  for(const[d,k]of[[GALP.portao,'galpaoPortao'],[GALP.cofre,'galpaoCartao'],[GALP.fundos,'galpaoFundos']])if(d){d.desafio=k;d.estado='desafio';d.tipo='metal';d.hpMax=d.hp=900;d.alarme=false;portaColisor(d);}
  const vQ=vB-0.06,uQ=W*0.3+1.5;GALP.vQ=vQ;GALP.ya=ya;GALP.quadro={u:uQ,v:vQ-0.45};GALP.alavanca={u:uQ+0.9,v:vQ-0.45};
  peca(p,uQ-0.32,uQ+0.32,ya+0.8,ya+1.5,vQ-0.16,vQ,0x4a4f52,0.6);peca(p,uQ-0.26,uQ+0.26,ya+0.86,ya+1.44,vQ-0.19,vQ-0.15,0x2a2d30,0.6);
  peca(p,uQ+0.78,uQ+1.02,ya+0.95,ya+1.35,vQ-0.08,vQ,0x3a3d40,0.6);
  const uL=W*0.8-0.95;peca(p,uL-0.09,uL+0.09,ya+1.1,ya+1.38,vQ-0.07,vQ,0x1e2226,0.6);peca(p,uL-0.05,uL+0.05,ya+1.3,ya+1.34,vQ-0.08,vQ-0.07,0xd84a2a,0.6,0);
  // gerador a diesel no galpão (enfeite) e o letreiro da pousada
  {const u=W*0.16,v=vB-1.2;peca(p,u-0.9,u+0.9,ya,ya+1.1,v-0.55,v+0.55,0x2f5a3a,0.6);peca(p,u-0.7,u+0.7,ya+1.1,ya+1.25,v-0.4,v+0.4,0x1e2a22,0.6);peca(p,u+0.95,u+1.05,ya+0.4,ya+2.4,v-0.05,v+0.05,0x55595c,0.6);}
  if(dep)GALP.mesa=contExtra(p,dep,'mesa','desafioMesa',dsfLivreU(p,W*0.36,W*0.54,D-E-0.75,0.8),D-E-0.75,ya,0,'pds',{sufixo:'m',desafio:'galpaoCartao'});
  if(esc)GALP.armario=contExtra(p,esc,'armarioArmas','desafioCofre',dsfLivreU(p,W*0.66,W-E-0.9,D-E-0.45,0.7),D-E-0.45,ya,Math.PI,'pds',{sufixo:'a',desafio:'galpaoCofre'});
  // o fusível: caixa de ferramentas do posto do guarda-parque
  const q=ARC_P.posto;if(q){const S=(q.salas[0]||[]).filter(s=>s&&!/escada|telhado|corredor|banheiro|varanda/.test(s.tipo)).sort((a,b)=>(b.u1-b.u0)*(b.v1-b.v0)-(a.u1-a.u0)*(a.v1-a.v0)),s=S[0];
    if(s){const v=s.v1-0.4,u=dsfLivreU(q,s.u0+0.6,s.u1-0.6,v,0.45);GALP.caixa=contExtra(q,s,'caixaFerr','desafioFusivel',u,v,q.y0,Math.PI,'pds',{sufixo:'f',desafio:'galpaoFusivel'});}}}
function pdsPos(o,dv){return pw(GALP.p,o.u,o.v+(dv||0));}
function pdsPortasConferir(){const D=pdsD();if(GALP.portao)portaEstado(GALP.portao,D.luz?'aberta':'desafio');if(GALP.cofre)portaEstado(GALP.cofre,D.cartao?'aberta':'desafio');if(GALP.fundos&&GALP.fundos.estado!=='desafio')portaEstado(GALP.fundos,'desafio');}
const ehGalpao=d=>!!(d&&typeof d.desafio==='string'&&d.desafio.startsWith('galpao'));
{const _t=dsfPortaTexto;dsfPortaTexto=function(d){if(!ehGalpao(d))return _t.apply(this,arguments);const D=pdsD();
  if(d.desafio==='galpaoPortao')return{t:'Portão de aço do almoxarifado',s:D.fus?'puxe a alavanca do gerador':'sem energia: o quadro de força está sem fusível'};
  if(d.desafio==='galpaoCartao')return invCount('cartaoPousada')?{t:'Passar o cartão na porta',s:'sala do cofre da pousada'}:{t:'Sala do cofre (leitor de cartão)',s:'precisa do cartão do gerente'};
  return{t:'Porta dos fundos de aço',s:'travada por dentro'};};}
{const _u=dsfPortaUsar;dsfPortaUsar=function(d){if(!ehGalpao(d))return _u.apply(this,arguments);const D=pdsD();
  if(d.desafio==='galpaoCartao'&&invCount('cartaoPousada')){invRemove('cartaoPousada',1);D.cartao=true;D.fim=G.dia;portaEstado(d,'aberta');sfx('bipe',d.x,d.z,1);sfx('portaMetal',d.x,d.z,0.9);
    toast('corpo','O leitor aceitou o cartão: a sala do cofre da pousada abriu.');ganharXP(150);hudBarra();invRender();
    if(typeof diarioEvento==='function')diarioEvento('Abriu a sala do cofre do Galpão da Pousada','missao');return;}
  feed(d.desafio==='galpaoPortao'?'Sem energia':'Trancada',true);sfx('vazio');};}
function pdsLigar(){const D=pdsD();if(!D.fus||D.luz)return;D.luz=true;const p=GALP.p,w=pdsPos(GALP.alavanca);sfx('puxar',w[0],w[1],1);sfx('motor',w[0],w[1],0.8);sfx('alarme',w[0],w[1],1.3);
  if(GALP.portao){portaEstado(GALP.portao,'aberta');sfx('portaMetal',GALP.portao.x,GALP.portao.z,1);}barulho(w[0],w[1],55,false);
  toast('alerta','O gerador pegou: o portão do almoxarifado abriu e a sirene do galpão disparou! Vem zumbi da mata.');
  if(typeof diarioEvento==='function')diarioEvento('Ligou o gerador do Galpão da Pousada','missao');
  const n=Math.min(9,4+Math.floor(G.dia/4));for(let i=0;i<n;i++)for(let t=0;t<12;t++){const f=pw(p,p.W/2+(Math.random()-0.5)*18,-8-Math.random()*10);if(!pontoLivre(f[0],f[1]))continue;
    const q=criarZ(Math.random()<0.3?'runner':'walker',f[0],f[1],{st:'alerta'});if(q){q.ax=w[0];q.az=w[1];q.ay=GALP.ya;q.arc=true;}break;}
  const dep=(p.salas[0]||[]).find(s=>s.tipo==='estoque');if(dep)for(let i=0;i<2;i++)for(let t=0;t<12;t++){const u=dep.u0+0.8+Math.random()*(dep.u1-dep.u0-1.6),v=dep.v0+0.8+Math.random()*(dep.v1-dep.v0-1.6),f=pw(p,u,v);
    if(bloqueadoAlto(f[0],f[1],0.4,GALP.ya))continue;const q=criarZ('emboscada',f[0],f[1],{y:GALP.ya,cidade:true,hx:f[0],hz:f[1]});if(q)q.st='dorme';break;}}
INTERS.push(tryIt=>{const p=GALP.p;if(!p||P.y<-20||Math.abs(P.y-GALP.ya)>1.6)return;const c=pw(p,p.W/2,p.D/2);if(Math.abs(P.x-c[0])>16||Math.abs(P.z-c[1])>16)return;
  for(const k of['quadro','alavanca']){const w=pdsPos(GALP[k]);tryIt({k:'pds_'+k,o:GALP[k]},w[0],w[1],1.8,1.5,0.1,GALP.ya);}});
INTER_K.pds_quadro={texto:()=>{const D=pdsD();if(!D.fus)return invCount('fusivel')?{t:'Pôr o fusível no quadro do gerador',s:'o quadro está sem fusível'}:{t:'Quadro do gerador sem fusível',s:'ache um fusível: caixa de ferramentas do Posto do Guarda-Parque, oficinas'};
    return D.luz?{t:'Quadro do gerador ligado',s:'a energia do galpão está ligada'}:{t:'Quadro do gerador: fusível no lugar',s:'agora puxe a alavanca do lado'};},
  usar:()=>{const D=pdsD();if(D.fus){feed(D.luz?'Ligado':'Puxe a alavanca do lado');return;}if(!invCount('fusivel')){feed('Falta um fusível',true);sfx('vazio');return;}
    invRemove('fusivel',1);D.fus=true;sfx('clique');sfx('construir');feed('Fusível no lugar');hudBarra();invRender();}};
INTER_K.pds_alavanca={texto:()=>{const D=pdsD();if(D.luz)return{t:'Alavanca do gerador (ligada)',s:'o portão do almoxarifado está aberto'};
    return D.fus?{t:'Puxar a alavanca do gerador',s:'abre o portão do almoxarifado · a sirene vai tocar',hold:true,dur:1.0}:{t:'Alavanca do gerador',s:'sem fusível no quadro, não acontece nada'};},
  usar:(o,seg)=>{const D=pdsD();if(!D.fus){sfx('puxar');feed('Nada: falta o fusível no quadro',true);return;}if(!D.luz&&seg)pdsLigar();}};
{const _ce=contEncher;contEncher=function(c){_ce.apply(this,arguments);if(!c||typeof c.desafio!=='string'||!c.desafio.startsWith('galpao'))return;const D=pdsD();
  if(c.desafio==='galpaoCartao'&&!D.cartao&&!invCount('cartaoPousada'))dsfPoe(c,'cartaoPousada',1);
  if(c.desafio==='galpaoFusivel'&&!D.fus&&!invCount('fusivel'))dsfPoe(c,'fusivel',1);
  if(c.desafio==='galpaoCofre'){const pl=['plantaEstufa','plantaRadio','plantaFerro'].find(id=>ITEMS[id]&&!(G.fab&&G.fab.reg&&G.fab.reg.marcos&&G.fab.reg.marcos[id]!==undefined)&&!invCount(id));
    if(pl)dsfPoe(c,pl,1);garanteMinimo(c,4,[['balaRifle',14],['kit',1],['municao9',20],['colete',1],['sutura',1]]);}};}
let pdsT=0;
PASSOS.push(dt=>{if(!GALP.p)return;pdsT-=dt;if(pdsT>0)return;pdsT=2;const D=pdsD(),c=pw(GALP.p,GALP.p.W/2,GALP.p.D/2),d=Math.hypot(P.x-c[0],P.z-c[1]);
  if(!D.visto&&d<22&&Math.abs(P.y-GALP.ya)<3){D.visto=true;if(typeof diarioDescobre==='function')diarioDescobre('lugar','galpaoPousada','Galpão da Pousada: gerador sem fusível, almoxarifado e sala do cofre',10);
    toast('corpo','Galpão da Pousada: o almoxarifado e a sala do cofre estão trancados. O quadro do gerador, perto do portão, está sem fusível.');}
  if(D.fim&&G.dia>=D.fim+5&&d>70){Object.assign(D,{fus:false,luz:false,cartao:false,fim:0});for(const q of[GALP.mesa,GALP.armario,GALP.caixa])if(q){q.estado='fechado';q.itens=null;q.t=0;}pdsPortasConferir();}});
DESENHO.opaco.push(function pdsDesenho(Pg){const p=GALP.p;if(!p||!MESH.dsfLuz)return;const c=pw(p,p.W/2,p.D/2);if(d2(c[0],c[1],cam.pos[0],cam.pos[2])>60*60)return;const D=pdsD();
  const l=pw(p,GALP.quadro.u,GALP.vQ-0.2);drawStat(Pg,D.luz?MESH.dsfLuz.v:D.fus?MESH.dsfLuz.a:MESH.dsfLuz.r,mat(l[0],GALP.ya+1.62,l[1],0,p.yaw,0));
  const a=pw(p,GALP.alavanca.u,GALP.vQ-0.14);drawStat(Pg,MESH.dsfAlav,mat(a[0],GALP.ya+(D.luz?0.86:1.32),a[1],0,p.yaw,0));});
V8.novo.pds=()=>{G.pds=null;pdsD();if(GALP.p)pdsPortasConferir();};
V8.salvar.pds=()=>pdsD();
V8.carregar.pds=s=>{G.pds=s&&typeof s==='object'?s:null;pdsD();pdsPortasConferir();};

/* ---------- caixa militar com cronômetro do bloqueio (usa o sistema da Etapa 7) ---------- */
CXM_DEF.push({id:'cxmAlto',nome:'Caixa militar do bloqueio',ax:77,az:-211});

/* ---------- fauna do planalto ---------- */
ZONAS_FAUNA.push({id:'alto',nome:'Alto do Rio Claro',x:ARC.x,z:ARC.z,r:58,hab:'campos de altitude e mata de araucária',f:{cervo:4,javali:2,lobo:3,urso:1,coelho:3}});

/* ---------- lugares do Alto (descoberta, mapa) ---------- */
const ARC_POIS=[
  {id:'bloqueio',nome:'Bloqueio do Exército',x:72,z:-208,r:14},{id:'pousada',nome:'Pousada Alto do Rio Claro',x:30,z:-238,r:22},
  {id:'galpao',nome:'Galpão da Pousada',x:58,z:-258,r:14},{id:'campo',nome:'Campo dos balões',x:90,z:-242,r:12},
  {id:'balao',nome:'Balão caído',x:104,z:-221,r:14},{id:'posto',nome:'Posto do Guarda-Parque',x:92,z:-270,r:12},
  {id:'mirante',nome:'Mirante do pico',x:76,z:-282,r:12},{id:'marco',nome:'Marco de pedras',x:94,z:-283,r:8},
  {id:'cachoeira',nome:'Cachoeira do Rio Claro',x:44,z:-190,r:18}];
function arcD(){const D=regD().alto;if(!D.vistos)D.vistos={};if(D.zVivos===undefined)D.zVivos=-1;if(!D.zDia)D.zDia=0;return D;}
let arcDescT=0;
PASSOS.push(dt=>{arcDescT-=dt;if(arcDescT>0||!P.alive)return;arcDescT=1.5;if(Math.hypot(P.x-ARC.x,P.z-ARC.z)>ARC.r+60&&!(P.z<-150&&P.x>10&&P.x<90))return;const D=arcD();
  for(const q of ARC_POIS)if(!D.vistos[q.id]&&Math.hypot(P.x-q.x,P.z-q.z)<q.r){D.vistos[q.id]=1;if(typeof diarioDescobre==='function')diarioDescobre('lugar','alto_'+q.id,q.nome,8);}});
MAPA_DESENHOS.push(function mapaAltoLugares(g,X,Y,k,n,range){const D=regD().alto;if(!D||!D.vistos)return;const s=Math.max(2.5,k*1.8);
  for(const q of ARC_POIS){if(!D.vistos[q.id]&&!D.mapeada)continue;const x=X(q.x),y=Y(q.z);g.fillStyle=q.id==='galpao'?(pdsD().cartao?'#7fbf6a':'#e0b04a'):q.id==='balao'?'#d8584a':'#e8d6a0';
    g.strokeStyle='#070a09';g.lineWidth=1.2;g.beginPath();g.moveTo(x,y-s*1.3);g.lineTo(x+s,y);g.lineTo(x,y+s*1.3);g.lineTo(x-s,y);g.closePath();g.fill();g.stroke();
    if(range>=1e3){g.font=`600 ${Math.max(10,Math.round(g.canvas.width/96))}px system-ui,sans-serif`;g.textAlign='left';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle='rgba(7,10,9,.8)';g.strokeText(q.nome,x+s+3,y);g.fillStyle='#ece4d2';g.fillText(q.nome,x+s+3,y);}}});

/* ================= montagem: colisão, pisos, escadas e pontos de interação (uma vez, no começo) ================= */
const ARC_LAY={};
function arcMontar(){const R=rng(22311);
  // bloqueio: dois muros de sacos de areia em curva, a cancela, a barraca e o jipe tombado
  {const b=ARC_L.bloqueio,L=ARC_LAY.bloqueio={sacos:[],cx:b.x,cz:b.z};
    for(const[a0,a1,r]of[[2.5,4.1,5.2],[-0.9,0.7,5.6]]){const n=Math.round((a1-a0)*r/0.62);for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,x=b.x+Math.cos(a)*r,z=b.z+Math.sin(a)*r;L.sacos.push([x,z,a+Math.PI/2]);}
      for(let i=0;i<n;i+=2){const a=a0+(a1-a0)*(i+1)/n,x=b.x+Math.cos(a)*r,z=b.z+Math.sin(a)*r;colBox(x,z,0.75,0.32,a+Math.PI/2,{solid:true,y0:ground(x,z)-0.3,y1:ground(x,z)+0.95});}}
    L.cancela={x:b.x-1.5,z:b.z+5.2,yaw:0.15};{const c=L.cancela;for(const s of[-1.9,1.9]){const q=[c.x+Math.cos(c.yaw)*s,c.z-Math.sin(c.yaw)*s];colCircle(q[0],q[1],0.14);}}
    L.barraca={x:b.x+5.5,z:b.z-4.0,yaw:-0.6};{const t=L.barraca;colBox(t.x,t.z,1.65,2.05,t.yaw,{solid:true});const f=[t.x+Math.sin(t.yaw)*2.6,t.z+Math.cos(t.yaw)*2.6];
      interAdd({id:'alto-barraca',kind:'bau',x:f[0],z:f[1],label:'Revistar a barraca do Exército',sub:'catres e caixas de munição',tabela:'militar',respawn:4});}
    L.jipe={x:b.x-6.2,z:b.z-3.4,yaw:1.1};{const j=L.jipe;colBox(j.x,j.z,1.15,2.1,j.yaw,{solid:true});const f=[j.x+Math.cos(j.yaw)*1.7,j.z-Math.sin(j.yaw)*1.7];
      interAdd({id:'alto-jipe',kind:'bau',x:f[0],z:f[1],label:'Revistar o jipe tombado',sub:'jipe do Exército',tabela:'militar',respawn:5});}
    L.placa={x:b.x-3.2,z:b.z+6.4,yaw:Math.PI+0.2};colCircle(L.placa.x,L.placa.z,0.12);
    L.caixotes=[[b.x+3.4,b.z+2.2],[b.x+4.1,b.z+2.9],[b.x+3.7,b.z+1.4]];for(const c of L.caixotes)colBox(c[0],c[1],0.38,0.3,0.3,{solid:true,y0:ground(c[0],c[1])-0.2,y1:ground(c[0],c[1])+0.62});}
  // pousada: placa de entrada, bancos e a roda de fogueira
  {const p=ARC_L.pousada,L=ARC_LAY.pousada={placa:{x:52,z:-226,yaw:-Math.PI/2+0.2},fogo:{x:30,z:-236},bancos:[]};
    for(const s of[-1,1]){const q=[L.placa.x,L.placa.z+s*2.1];colCircle(q[0],q[1],0.13);}
    for(let i=0;i<4;i++){const a=i/4*6.283+0.4,x=L.fogo.x+Math.cos(a)*2.6,z=L.fogo.z+Math.sin(a)*2.6;L.bancos.push([x,z,-a+Math.PI/2]);colBox(x,z,0.85,0.25,-a+Math.PI/2,{solid:true,y0:ground(x,z)-0.2,y1:ground(x,z)+0.55});}
    colCircle(L.fogo.x,L.fogo.z,0.75,{solid:true,y0:ground(L.fogo.x,L.fogo.z)-0.2,y1:ground(L.fogo.x,L.fogo.z)+0.35});}
  // campo dos balões: barracão, biruta, cesto reserva e botijões
  {const c=ARC_L.campo,L=ARC_LAY.campo={barracao:{x:c.x+5,z:c.z-6,yaw:-0.3},biruta:{x:c.x-4,z:c.z+5},cesto:{x:c.x-1.5,z:c.z-1}};
    {const b=L.barracao;colBox(b.x,b.z,2.1,1.7,b.yaw,{solid:true});const f=[b.x-Math.sin(b.yaw)*2.3,b.z-Math.cos(b.yaw)*2.3];interAdd({id:'alto-barracao',kind:'bau',x:f[0],z:f[1],label:'Revistar o barracão dos balões',sub:'gás, cordas, tecido e ferramentas',tabela:'barracaoBalao',respawn:4});}
    colCircle(L.biruta.x,L.biruta.z,0.1);L.cestoCol=colBox(L.cesto.x,L.cesto.z,0.62,0.55,0.4,{solid:true,y0:ground(L.cesto.x,L.cesto.z)-0.2,y1:ground(L.cesto.x,L.cesto.z)+1.05});}
  // balão caído: cesto tombado, maçarico e botijões; o envelope (tecido) estendido no chão e preso numa árvore
  {const b=ARC_L.balao,L=ARC_LAY.balao={x:b.x,z:b.z,yaw:-2.2};const y=ground(b.x,b.z);L.y=y;
    colBox(b.x,b.z,0.75,0.7,L.yaw,{solid:true,y0:y-0.3,y1:y+1.25});
    const f=[b.x-Math.sin(L.yaw)*1.4,b.z-Math.cos(L.yaw)*1.4];L.frente=f;
    interAdd({id:'alto-cesto',kind:'bau',x:f[0],z:f[1],label:'Revistar o cesto do balão',sub:'bolsa do piloto',tabela:'balaoCesto',respawn:0,once:true});}
  // mirante: torre de vigia de madeira no pico, com escada, piso lá em cima e guarda-corpo
  {const m=ARC_L.mirante,g=ground(m.x,m.z),H=11,L=ARC_LAY.mirante={x:m.x,z:m.z,g,H,top:g+H,meio:1.7};
    for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]])colCircle(m.x+sx*2.25,m.z+sz*2.25,0.2);
    supAdd({t:'ret',x:m.x,z:m.z,hw:L.meio,hd:L.meio,yaw:0,y:L.top,dono:'mirante'});
    const T=L.top;colBox(m.x,m.z-L.meio,L.meio,0.08,0,{solid:true,y0:T,y1:T+1.1});colBox(m.x-L.meio,m.z,0.08,L.meio,0,{solid:true,y0:T,y1:T+1.1});colBox(m.x+L.meio,m.z,0.08,L.meio,0,{solid:true,y0:T,y1:T+1.1});
    colBox(m.x-1.05,m.z+L.meio,0.62,0.08,0,{solid:true,y0:T,y1:T+1.1});colBox(m.x+1.05,m.z+L.meio,0.62,0.08,0,{solid:true,y0:T,y1:T+1.1});
    const via=viaReta(m.x,m.z+L.meio+0.12,g,T,Math.PI,{x:m.x,y:g,z:m.z+L.meio+0.85},{x:m.x,y:T,z:m.z+L.meio-0.6,rumo:Math.PI},{id:'mirante'});via.tipo='escada';VIAS.push(via);L.via=via;}
  // marco de pedras do pico (esconderijo)
  {const m=ARC_L.marco;colCircle(m.x,m.z,0.85);interAdd({id:'alto-marco',kind:'bau',x:m.x+1.2,z:m.z+0.6,label:'Mexer nas pedras do marco',sub:'tem algo escondido entre as pedras',tabela:'esconderijo',respawn:6});}
  // posto do guarda-parque: mastro, placa e a caixa-d'água
  {const p=ARC_L.posto,L=ARC_LAY.posto={mastro:{x:p.x-7,z:p.z+5},placa:{x:p.x-7.5,z:p.z-3,yaw:Math.PI/2}};colCircle(L.mastro.x,L.mastro.z,0.12);colCircle(L.placa.x,L.placa.z,0.12);}
  // nascente: beber e encher garrafas
  {const n=ARC_L.nascente;interAdd({id:'alto-nascente',kind:'agua',x:n.x+1.6,z:n.z+1.2,label:'Nascente do Rio Claro',sub:'beber ou encher garrafas'});}
  // cachoeira: pedras grandes na beira do poço e ao lado da queda (não dá para subir pela água)
  {const L=ARC_LAY.cachoeira={pedras:[]};for(const[x,z,s]of[[40.5,-185.5,1.4],[47.6,-186.2,1.3],[39.5,-181.6,1.0],[48.8,-182.4,1.1],[42.1,-188.6,1.2],[46.2,-189.2,1.15]]){L.pedras.push([x,z,s]);colCircle(x,z,0.8*s);}}}

/* trilha da serra: entra depois do mundo montado (a mata do círculo nasce igual a antes). As árvores que ficaram em cima do
   caminho saem (como na beira do rio e na ferrovia), a trilha entra nas estradas (desenho no chão e no mapa) e vêm os marcos,
   os degraus de madeira com corrimão e as placas. */
function arcTrilhaMontar(){const pts=ARC_L.trilha.concat(ARC_L.degraus.slice(1)),dTr=(x,z)=>{let b=1e9;for(let i=0;i<pts.length-1;i++){const d=segDist(x,z,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]);if(d<b)b=d;}return b;};
  let nt=0,nr=0;for(const t of TREES){if(t.agua||t.z>-74||t.z<-216||t.x<14||t.x>86)continue;if(dTr(t.x,t.z)<1.7){t.agua=true;t.alive=false;const c=COLL.find(q=>q.tree===t);if(c)colRemove(c);nt++;}}
  for(const r of ROCKS){if(!r.alive||r.z>-74||r.z<-216||r.x<14||r.x>86)continue;if(dTr(r.x,r.z)<1.2+r.s*0.85){r.alive=false;const c=COLL.find(q=>q.rock===r);if(c)colRemove(c);nr++;}}
  ROADS.push({w:1.8,pts:ARC_L.trilha,cor:'trilha',serra:true});ARC_LAY.trilhaLimpa={arvores:nt,pedras:nr};
  {const L=ARC_LAY.trilha={marcos:[],degraus:[],corrimao:[]};const pts=ARC_L.trilha.concat(ARC_L.degraus.slice(1));let acc=8;
    for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],Ls=Math.hypot(dx,dz),nx=-dz/Ls,nz=dx/Ls;
      for(let s=0;s<Ls;s+=1){acc+=1;if(acc<15)continue;const x=a[0]+dx*s/Ls+nx*1.6,z=a[1]+dz*s/Ls+nz*1.6;if(pointBlocked(x,z,0.3))continue;acc=0;L.marcos.push([x,z]);colCircle(x,z,0.08);}}
    const d=ARC_L.degraus;for(let i=0;i<d.length-1;i++){const a=d[i],b=d[i+1],dx=b[0]-a[0],dz=b[1]-a[1],Ls=Math.hypot(dx,dz),yaw=Math.atan2(dx,dz),nx=-dz/Ls,nz=dx/Ls;
      for(let s=0.4;s<Ls;s+=0.85){const x=a[0]+dx*s/Ls,z=a[1]+dz*s/Ls;L.degraus.push([x,z,yaw]);}
      for(let s=0;s<Ls;s+=2.8){const x=a[0]+dx*s/Ls+nx*1.0,z=a[1]+dz*s/Ls+nz*1.0;L.corrimao.push([x,z]);colCircle(x,z,0.07);}}
    {const a=ARC_L.trilha[0],b=ARC_L.trilha[1],yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);L.placa={x:a[0]+Math.sin(yaw)*3+Math.cos(yaw)*1.9,z:a[1]+Math.cos(yaw)*3-Math.sin(yaw)*1.9,yaw:yaw};colCircle(L.placa.x,L.placa.z,0.1);}
    {const a=ARC_L.degraus[0],b=ARC_L.degraus[1],yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);L.placa2={x:a[0]-Math.cos(yaw)*1.8,z:a[1]+Math.sin(yaw)*1.8,yaw};colCircle(L.placa2.x,L.placa2.z,0.1);}}
}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{arcTrilhaMontar();}catch(e){console.error('trilha da serra',e);}try{bordaMontar();}catch(e){console.error('borda de mata',e);}return r;};}

/* ================= malhas do Alto (carregadas pela distância) ================= */
LOOT.balaoCesto=[['sinalizador',1,1,0.85],['lanterna',1,1,0.45],['pilhas',1,2,0.6],['racao',1,2,0.6],['agua',1,2,0.6],['bandagem',1,2,0.55],['corda',1,1,0.5],['kit',1,1,0.25]];
const ARC_PECAS=[];
function arcPeca(id,x,z,r,f,o){const q=Object.assign({id,x,z,r,f,mesh:null,ms:0},o||{});ARC_PECAS.push(q);return q;}
const gbArc=f=>{const g=new GB(1<<14,8);f(g);return g.data();};
function placaMadeira(g,M,linhas,R,cor){const m=lin(0x6b4a2e),w=Math.max(...linhas.map(t=>t.length))*0.115+0.5,h=linhas.length*0.42+0.25;
  for(const s of[-w/2+0.12,w/2-0.12])add(g,cylTris(0.06,0.07,1.25+h,6),mm(M,mat(s,0,0)),m,{j:0.06,rnd:R});
  add(g,bvTris(w,h,0.06),mm(M,mat(0,1.25+h/2,0)),lin(0x8a6a45),{j:0.05,rnd:R});
  linhas.forEach((t,i)=>textoBlocos(g,mm(M,mat(0,1.25+h-0.32-i*0.42,0.04)),t,0.028,cor||0xf0e6c8));}
/* a trilha em duas peças (marcos e a placa da vila; degraus, corrimão e a placa da subida): cada quadro monta só uma */
arcPeca('trilha',50,-140,190,()=>gbArc(g=>{const R=rng(31),L=ARC_LAY.trilha,pau=lin(0x5a4330),am=lin(0xd8b030);
  for(const[x,z]of L.marcos){const y=ground(x,z);add(g,cylTris(0.07,0.08,1.15,6),mat(x,y-0.1,z),pau,{j:0.08,rnd:R});add(g,cylTris(0.075,0.075,0.2,6),mat(x,y+0.82,z),am);}
  {const p=L.placa;placaMadeira(g,mat(p.x,ground(p.x,p.z),p.z,0,p.yaw+Math.PI,0),['TRILHA DA SERRA','ALTO DO RIO CLARO'],R);}}));
arcPeca('degraus',63,-186,170,()=>gbArc(g=>{const R=rng(33),L=ARC_LAY.trilha,pau=lin(0x5a4330);
  for(const[x,z,yaw]of L.degraus){const y=ground(x,z);add(g,cylTris(0.09,0.1,1.5,7),mm(mat(x,y+0.04,z,0,yaw,0),mat(-0.75,0,0,0,0,-Math.PI/2)),lin(0x5e4630),{j:0.1,rnd:R});
    for(const s of[-0.6,0.6]){const q=[x+Math.cos(yaw)*s,z-Math.sin(yaw)*s];add(g,cylTris(0.03,0.03,0.3,5),mat(q[0],y-0.15,q[1]),pau);}}
  for(let i=0;i<L.corrimao.length;i++){const[x,z]=L.corrimao[i],y=ground(x,z);add(g,cylTris(0.06,0.07,1.05,6),mat(x,y-0.05,z),pau,{j:0.08,rnd:R});
    if(i>0){const[px,pz]=L.corrimao[i-1],py=ground(px,pz);if(Math.hypot(px-x,pz-z)<4)add(g,cylTris(0.025,0.025,Math.hypot(px-x,py-y,pz-z),5),alignY(px,py+0.95,pz,x-px,y-py,z-pz),lin(0xb8a070));}}
  {const p=L.placa2;placaMadeira(g,mat(p.x,ground(p.x,p.z),p.z,0,p.yaw+Math.PI,0),['CACHOEIRA','SUBIDA'],R);}}));
arcPeca('bloqueio',72,-208,170,()=>gbArc(g=>{const R=rng(32),L=ARC_LAY.bloqueio,saco=[lin(0x8a7a52),lin(0x7a6a46),lin(0x968660)],oliva=lin(0x4a5634),oliva2=lin(0x3a442a);
  for(const[x,z,yaw]of L.sacos){const y=ground(x,z);for(let k=0;k<3;k++)add(g,bvTris(0.56,0.27,0.34),mat(x+(k%2)*0.05,y+0.12+k*0.26,z,0,yaw+(k%2)*0.1,0),saco[(k+Math.round(x))%3],{j:0.1,rnd:R});}
  {const c=L.cancela,M=mat(c.x,ground(c.x,c.z),c.z,0,c.yaw,0);for(const s of[-1.9,1.9])add(g,bvTris(0.2,1.1,0.2),mm(M,mat(s,0.55,0)),lin(0x55595c));
    const Mb=mm(M,mat(-1.9,1.02,0,0,0,1.22));for(let i=0;i<8;i++)add(g,boxTris(0.47,0.1,0.1),mm(Mb,mat(0.24+i*0.47,0,0)),lin(i%2?0xd83a2a:0xece6d8));add(g,bvTris(0.3,0.3,0.3),mm(M,mat(-1.9,1.05,0)),lin(0x3a3d40));}
  {const t=L.barraca,M=mat(t.x,ground(t.x,t.z),t.z,0,t.yaw,0);add(g,boxTris(3.3,0.06,4.1),mm(M,mat(0,0.03,0)),lin(0x3a3f2a));
    for(const s of[-1,1])add(g,boxTris(0.05,2.35,4.1),mm(M,mat(s*0.82,1.0,0,0,0,s*0.6)),oliva,{j:0.04,rnd:R});
    add(g,boxTris(3.2,1.1,0.05),mm(M,mat(0,0.55,-2.04)),oliva2);for(const s of[-1,1])add(g,boxTris(1.0,1.6,0.05),mm(M,mat(s*1.05,0.65,2.03,0,s*0.5,0)),oliva2);
    for(const z of[-2.1,2.1])add(g,cylTris(0.04,0.04,2.0,5),mm(M,mat(0,0,z)),lin(0x6b5a40));add(g,cylTris(0.03,0.03,4.3,5),mm(M,mat(0,1.98,-2.15,Math.PI/2,0,0)),lin(0x6b5a40));
    for(const s of[-0.9,0.9]){add(g,bvTris(0.7,0.35,1.9),mm(M,mat(s,0.25,-0.6)),lin(0x55603a));}add(g,bvTris(0.5,0.3,0.35),mm(M,mat(0,0.15,-1.6)),lin(0x4a5a3a));}
  {const j=L.jipe,y=ground(j.x,j.z),M=mm(mat(j.x,y,j.z,0,j.yaw,0),mat(0,0.95,0,0,0,Math.PI/2+0.08));
    add(g,bvTris(1.7,0.75,3.6),mm(M,mat(0,0,0)),oliva,{j:0.05,rnd:R});add(g,bvTris(1.55,0.55,1.6),mm(M,mat(0,0.6,-0.6)),oliva2,{j:0.05,rnd:R});
    add(g,boxTris(1.4,0.5,0.05),mm(M,mat(0,0.62,0.5,-0.3,0,0)),lin(0x1c2830));for(const sx of[-0.85,0.85])for(const sz of[-1.15,1.15])add(g,cylTris(0.38,0.38,0.28,10),mm(M,mat(sx,-0.35,sz,0,0,Math.PI/2)),lin(0x181818));
    add(g,cylTris(0.36,0.36,0.25,10),mm(M,mat(0,0.2,-1.95,Math.PI/2,0,0)),lin(0x181818));textoBlocos(g,mm(M,mat(0,0.05,1.81)),'EB',0.05,0xe8e4d8);}
  placaMadeira(g,mat(L.placa.x,ground(L.placa.x,L.placa.z),L.placa.z,0,L.placa.yaw,0),['AREA ISOLADA','EXERCITO'],R,0xf2d24a);
  for(const[x,z]of L.caixotes){const y=ground(x,z);add(g,bvTris(0.72,0.55,0.6),mat(x,y+0.27,z,0,0.3,0),lin(0x56603a),{j:0.08,rnd:R});add(g,boxTris(0.74,0.06,0.62),mat(x,y+0.4,z,0,0.3,0),lin(0x3a442a));}}),{sombra:true});
arcPeca('pousada',30,-236,170,()=>gbArc(g=>{const R=rng(33),L=ARC_LAY.pousada;
  {const p=L.placa,M=mat(p.x,ground(p.x,p.z),p.z,0,p.yaw,0),m=lin(0x5a4330);for(const s of[-2.1,2.1])add(g,cylTris(0.14,0.16,3.4,8),mm(M,mat(0,0,s)),m,{j:0.06,rnd:R});
    add(g,bvTris(0.16,0.2,4.8),mm(M,mat(0,3.3,0)),m);add(g,bvTris(0.07,0.7,3.9),mm(M,mat(0,2.75,0)),lin(0x8a6a45),{j:0.05,rnd:R});
    textoBlocos(g,mm(M,mat(0.05,2.9,0,0,Math.PI/2,0)),'POUSADA',0.06,0xf0e6c8);textoBlocos(g,mm(M,mat(0.05,2.48,0,0,Math.PI/2,0)),'ALTO DO RIO CLARO',0.04,0xf0e6c8);}
  {const f=L.fogo,y=ground(f.x,f.z);for(let i=0;i<11;i++){const a=i/11*6.283;add(g,icoSubTris(0.18,0.35,R,1),mat(f.x+Math.cos(a)*0.72,y+0.06,f.z+Math.sin(a)*0.72,0,0,0,1.2,0.7,1),lin(0x6e6c64),{j:0.1,rnd:R});}
    add(g,cylTris(0.62,0.62,0.04,12),mat(f.x,y+0.01,f.z),lin(0x1e1a16));for(let i=0;i<4;i++){const a=i*1.6;add(g,cylTris(0.06,0.07,0.9,6),alignY(f.x-Math.cos(a)*0.4,y+0.05,f.z-Math.sin(a)*0.4,Math.cos(a),0.35,Math.sin(a)),lin(0x2a2018));}}
  for(const[x,z,yaw]of L.bancos)propBanco(g,mat(x,ground(x,z),z,0,yaw,0));}),{sombra:true});
arcPeca('campo',90,-242,160,()=>gbArc(g=>{const R=rng(34),L=ARC_LAY.campo,m=lin(0x6b5034);
  {const b=L.barracao,M=mat(b.x,ground(b.x,b.z),b.z,0,b.yaw,0);for(const sx of[-2,2])for(const sz of[-1.6,1.6])add(g,bvTris(0.14,2.6,0.14),mm(M,mat(sx,1.3,sz)),m,{j:0.05,rnd:R});
    for(const s of[-1,1])add(g,boxTris(4.0,2.5,0.06),mm(M,mat(0,1.25,s*1.62)),lin(0x8a6a45),{j:0.05,rnd:R});add(g,boxTris(0.06,2.5,3.2),mm(M,mat(2.02,1.25,0)),lin(0x8a6a45),{j:0.05,rnd:R});
    add(g,boxTris(4.6,0.07,3.9),mm(M,mat(0,2.75,0,0.08,0,0)),lin(0x7a7f84),{j:0.05,rnd:R});placaMadeira(g,mm(M,mat(-2.3,0,2.2,0,-Math.PI/2,0)),['PASSEIOS','DE BALAO'],R,0xd8584a);
    for(let i=0;i<3;i++)add(g,cylTris(0.17,0.17,0.62,10),mm(M,mat(0.9+i*0.42,0,1.1)),lin(0xd8d0c0),{j:0.05,rnd:R});add(g,bvTris(1.5,0.5,1.0),mm(M,mat(-0.8,0.25,0.4)),lin(0xb8302a),{j:0.08,rnd:R});}
  {const b=L.biruta,y=ground(b.x,b.z);add(g,cylTris(0.05,0.06,5.2,6),mat(b.x,y,b.z),lin(0x9aa1a6));for(let i=0;i<4;i++){const r0=0.32-i*0.06,r1=r0-0.06;add(g,cylTris(r1,r0,0.45,10),mm(mat(b.x,y+5.0,b.z,0,0.7,0),mat(0,0,0.05+i*0.45,Math.PI/2,0,0)),lin(i%2?0xece6d8:0xe0602a));}}
  if(typeof balD!=='function'||balD().st==='quebrado'){const c=L.cesto,y=ground(c.x,c.z),M=mat(c.x,y,c.z,0,0.4,0);add(g,bvTris(1.2,1.05,1.05),mm(M,mat(0,0.52,0)),lin(0x8a6a3a),{j:0.08,rnd:R});
    for(let i=0;i<5;i++)add(g,boxTris(1.22,0.03,1.07),mm(M,mat(0,0.12+i*0.2,0)),lin(0x6a4a2a));
    for(let i=0;i<3;i++)add(g,icoSubTris(0.45,0.4,R,1),mm(M,mat(1.3+i*0.5,0.15,(R()-0.5)*0.6,0,R()*6,0,1.5,0.35,1.1)),lin([0xc8302a,0xe8b830,0x2a5a9a][i]),{j:0.1,rnd:R});}}));
function geoBalao(desmontado){return gbArc(g=>{const R=rng(35),L=ARC_LAY.balao,y=L.y,M=mat(L.x,y,L.z,0,L.yaw,0),vime=lin(0x8a6a3a),ferro=lin(0x55595c);
  // cesto tombado de lado, maçarico e botijões
  {const C=mm(M,mat(0,0.62,0,0,0,Math.PI/2-0.15));add(g,bvTris(1.25,1.15,1.2),C,vime,{j:0.1,rnd:R});for(let i=0;i<5;i++)add(g,boxTris(1.27,0.035,1.22),mm(C,mat(0,-0.45+i*0.22,0)),lin(0x6a4a2a));
    add(g,boxTris(1.3,0.08,1.25),mm(C,mat(0,0.6,0)),lin(0x4a3424));}
  for(const s of[-0.45,0.45])add(g,cylTris(0.025,0.025,1.4,5),mm(M,mat(0.6,0.5,s,0,0,-Math.PI/2+0.3)),ferro);add(g,cylTris(0.2,0.22,0.35,10),mm(M,mat(2.0,0.25,0,0,0,-Math.PI/2+0.3)),lin(0x3a3d40));
  if(!desmontado){for(let i=0;i<2;i++)add(g,cylTris(0.16,0.16,0.6,10),mm(M,mat(-0.4+i*0.5,0.16,1.3+i*0.2,Math.PI/2,0.3,0)),lin(0xc8c8c0),{j:0.05,rnd:R});
    // cordas do cesto até a boca do envelope
    for(let i=0;i<4;i++){const a=[(R()-0.5)*0.8,0.9,(R()-0.5)*0.8],b=[3.8+R()*0.6,0.25,(R()-0.5)*2.2];const A=[L.x,0,L.z];
      const tr=(p)=>{const c=Math.cos(L.yaw),s=Math.sin(L.yaw);return[L.x+p[0]*c+p[2]*s,y+p[1],L.z-p[0]*s+p[2]*c];};const pa=tr(a),pb=tr(b);add(g,cylTris(0.012,0.012,Math.hypot(pb[0]-pa[0],pb[1]-pa[1],pb[2]-pa[2]),4),alignY(pa[0],pa[1],pa[2],pb[0]-pa[0],pb[1]-pa[1],pb[2]-pa[2]),lin(0xc8b890));}
    // envelope murcho: faixas coloridas, dobras e a ponta presa no alto (numa árvore da beira)
    const cores=[lin(0xc8302a),lin(0xe8b830),lin(0x2a5a9a),lin(0xe8e4dc),lin(0xc8302a),lin(0x2a8a5a)],NU=24,NV=12,UL=17,VL=11;
    const pt=(i,j)=>{const u=i/NU,v=j/NV-0.5,lx=4.2+u*UL,lz=v*VL*(0.55+0.45*Math.sin(u*Math.PI)),c=Math.cos(L.yaw),s=Math.sin(L.yaw),wx=L.x+lx*c+lz*s,wz=L.z-lx*s+lz*c;
      let h=ground(wx,wz)+0.08+Math.abs(Math.sin(u*9+v*5))*0.28*Math.sin(u*Math.PI)+Math.max(0,1-Math.abs(v)*2.2)*0.35*Math.sin(u*Math.PI);
      if(u>0.72)h+=Math.pow((u-0.72)/0.28,1.6)*5.5*(1-Math.abs(v)*1.2);return[wx,h,wz];};
    for(let i=0;i<NU;i++){const T=[];for(let j=0;j<NV;j++){const a=pt(i,j),b=pt(i,j+1),c=pt(i+1,j+1),d=pt(i+1,j);T.push([a,b,c],[a,c,d]);}add(g,T,ID,cores[Math.floor(i/4)%cores.length],{j:0.06,rnd:R,keepWind:true});}}
  else for(let i=0;i<5;i++)add(g,icoSubTris(0.35,0.4,R,1),mm(M,mat(4.5+i*1.6,0.12,(R()-0.5)*2,0,R()*6,0,1.4,0.3,1.0)),lin(0xc8302a),{j:0.15,rnd:R});});}
const ARC_BALAO=arcPeca('balao',104,-221,260,()=>geoBalao(!!arcD().balaoDesm),{sombra:true,marco:true});
arcPeca('mirante',76,-282,340,()=>gbArc(g=>{const R=rng(36),L=ARC_LAY.mirante,m=lin(0x6b4a2e),m2=lin(0x5a3e26),x=L.x,z=L.z,g0=L.g,T=L.top;
  const perna=(sx,sz,h)=>{const k=lerp(2.25,1.6,h/L.H);return[x+sx*k,g0+h,z+sz*k];},cs=[[1,1],[1,-1],[-1,-1],[-1,1]];
  const viga=(a,b,w,c)=>{const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],Ln=Math.hypot(d[0],d[1],d[2]);add(g,boxTris(w,Ln,w),mm(alignY(a[0],a[1],a[2],d[0],d[1],d[2]),mat(0,Ln/2,0)),c||m,{j:0.06,rnd:R});};
  for(const q of cs)viga(perna(q[0],q[1],-0.5),perna(q[0],q[1],L.H+2.4),0.24);
  for(let h=1.5;h<L.H-1;h+=3)for(let i=0;i<4;i++){const q=cs[i],r=cs[(i+1)%4];viga(perna(q[0],q[1],h),perna(r[0],r[1],h+3),0.12,m2);viga(perna(r[0],r[1],h),perna(q[0],q[1],h+3),0.12,m2);viga(perna(q[0],q[1],h),perna(r[0],r[1],h),0.14,m2);}
  add(g,bvTris(L.meio*2+0.3,0.16,L.meio*2+0.3),mat(x,T-0.08,z),lin(0x7a5a3a),{j:0.05,rnd:R});
  for(const[a,b]of[[[-1,-1],[1,-1]],[[-1,-1],[-1,1]],[[1,-1],[1,1]]]){const p=[x+a[0]*L.meio,T+1.0,z+a[1]*L.meio],q=[x+b[0]*L.meio,T+1.0,z+b[1]*L.meio];viga(p,q,0.08,m2);viga([p[0],T+0.5,p[2]],[q[0],T+0.5,q[2]],0.06,m2);}
  for(const s of[-1,1]){viga([x+s*L.meio,T+1.0,z+L.meio],[x+s*0.45,T+1.0,z+L.meio],0.08,m2);}
  for(const q of cs)viga([x+q[0]*L.meio,T,z+q[1]*L.meio],[x+q[0]*L.meio,T+2.3,z+q[1]*L.meio],0.1,m2);
  add(g,cylTris(0.05,2.6,1.1,4),mat(x,T+2.3,z,0,Math.PI/4,0),lin(0x7a3a2a),{j:0.05,rnd:R});
  // escada (dois montantes e degraus)
  for(const s of[-0.32,0.32])viga([x+s,g0-0.2,z+L.meio+0.12],[x+s,T+1.0,z+L.meio+0.12],0.07,lin(0x8a6a45));for(let h=0.3;h<L.H+0.9;h+=0.33)add(g,boxTris(0.64,0.05,0.05),mat(x,g0+h,z+L.meio+0.12),lin(0x8a6a45));
  // binóculo de mesa e a placa
  add(g,cylTris(0.04,0.05,1.1,6),mat(x-0.9,T,z-0.9),lin(0x3a3d40));add(g,cylTris(0.07,0.06,0.45,8),mm(mat(x-0.9,T+1.15,z-0.9,0,0.6,0),mat(0,0,-0.2,Math.PI/2-0.15,0,0)),lin(0x2f3133));
  placaMadeira(g,mat(x+2.6,ground(x+2.6,z+3.4),z+3.4,0,Math.PI,0),['MIRANTE'],R);}),{sombra:true,marco:true});
arcPeca('marco',94,-283,90,()=>gbArc(g=>{const R=rng(37),m=ARC_L.marco,y=ground(m.x,m.z);let h=0;for(let i=0;i<13;i++){const r=0.38-i*0.02,a=R()*6.283,o=i<6?0.45:i<10?0.22:0;
    add(g,icoSubTris(r,0.35,R,1),mat(m.x+Math.cos(a)*o,y+h+r*0.6,m.z+Math.sin(a)*o,R(),R()*6,R(),1.2,0.75,1.1),mixc(lin(0x6e6c64),lin(0x8a877e),R()),{j:0.1,rnd:R,crease:40});if(i===5||i===9)h+=0.45;}
  add(g,boxTris(0.12,0.12,0.02),mat(m.x,y+1.3,m.z+0.34),lin(0xd8b030));}));
arcPeca('posto',92,-270,160,()=>gbArc(g=>{const R=rng(38),L=ARC_LAY.posto;{const p=L.mastro,y=ground(p.x,p.z);add(g,cylTris(0.05,0.07,6.5,6),mat(p.x,y,p.z),lin(0x9aa1a6));
    add(g,boxTris(0.02,0.7,1.1),mat(p.x,y+5.9,p.z+0.58,0,0,0),lin(0x2a8a4a));add(g,boxTris(0.022,0.32,0.5),mat(p.x,y+5.95,p.z+0.6),lin(0xe8c830));}
  placaMadeira(g,mat(L.placa.x,ground(L.placa.x,L.placa.z),L.placa.z,0,L.placa.yaw,0),['GUARDA PARQUE'],R);}));
/* pedra na encosta: o chão em volta decide até onde ela desce (o lado de baixo não fica no ar) e até onde sobe (no máximo o dobro da altura) */
function arcPedraY(x,z,rr,baixo,cima){let mn=1e9,mx=-1e9;for(let k=0;k<12;k++){const a=k/12*6.2832,gq=ground(x+Math.cos(a)*rr,z+Math.sin(a)*rr);if(gq<mn)mn=gq;if(gq>mx)mx=gq;}
  const g0=ground(x,z),y0=g0-baixo,y1=g0+cima,b=Math.min(y0,mn-0.15*(baixo+cima)),t=Math.max(y1,Math.min(mx+0.12*(baixo+cima),b+2*(baixo+cima)));return[(b+t)/2,(t-b)/2];}
arcPeca('cachoeira',44,-188,120,()=>gbArc(g=>{const R=rng(39);for(const[x,z,s]of ARC_LAY.cachoeira.pedras){const[yc,hy]=arcPedraY(x,z,1.2*s,1.0*s,0.6*s);add(g,icoSubTris(1,0.4,R,1),mat(x,yc,z,R()*0.5,R()*6,R()*0.5,1.3*s,hy,1.1*s),lin(0x5e5c55),{j:0.15,rnd:R,crease:58});}
  for(let i=0;i<10;i++){const z=-191+i*0.9+(R()-0.5)*0.4,x=44+(R()<0.5?-1:1)*(1.3+R()*0.6),r0=0.35+R()*0.3,[yc,hy]=arcPedraY(x,z,1.1*r0,0.05+0.7*r0,0.7*r0-0.05);add(g,icoSubTris(r0,0.4,R,1),mat(x,yc,z,R(),R()*6,R(),1.2,hy/r0,1),lin(0x55534c),{j:0.15,rnd:R,crease:58});}}));

/* fila de carga: uma peça por quadro (sem travar); muito longe: tudo liberado */
const ARC_FILA=[],ARC_CARGA=[];   // ARC_CARGA: o que foi carregado e quanto tempo levou (os testes leem)
function arcLiberar(){for(const q of ARC_PECAS)if(q.mesh){liberarMesh(q.mesh);q.mesh=null;}ARC_FILA.length=0;}
function arcEnfileirar(){for(const q of ARC_PECAS)if(!q.mesh&&!ARC_FILA.includes(q))ARC_FILA.push(q);}
PASSOS.push(function arcCarrega(){if(!ARC_FILA.length||!ARC_LAY.trilha)return;const q=ARC_FILA.shift();const t0=performance.now();try{q.mesh=litMesh(q.f());}catch(e){console.error('peça do Alto',q.id,e);}
  q.ms=performance.now()-t0;ARC_CARGA.push([q.id,Math.round(q.ms*10)/10]);if(ARC_CARGA.length>60)ARC_CARGA.shift();});
DESENHO.opaco.push(function arcDesenho(Pg){const cx=cam.pos[0],cz=cam.pos[2];for(const q of ARC_PECAS){if(!q.mesh||d2(q.x,q.z,cx,cz)>q.r*q.r)continue;drawStat(Pg,q.mesh,ID);}});
DESENHO.sombra.push((Pg,perto)=>{for(const q of ARC_PECAS){if(!q.mesh||!q.sombra)continue;if(d2(q.x,q.z,P.x,P.z)>(perto?70:150)**2)continue;drawStat(Pg,q.mesh,ID);}});

/* ================= zumbis da região: povoam perto, ficam guardados como número longe ================= */
const ARC_ZMAX=12;
function arcVivos(){return Z.filter(z=>z.vivo&&z.arc&&z.st!=='morrendo'&&z.st!=='morto'&&z.st!=='sumindo');}
/* um zumbi da região num dos pontos de nascer (longe de você e em lugar livre) */
function arcCriarZ(i){const pts=ZSPAWN.alto||[];if(!pts.length)return false;
  for(let t=0;t<10;t++){const b=pts[(i+t)%pts.length],x=b[0]+(Math.random()-0.5)*7,z=b[1]+(Math.random()-0.5)*7;if(!pontoLivre(x,z)||Math.hypot(x-P.x,z-P.z)<22)continue;
    const mil=Math.hypot(x-ARC_L.bloqueio.x,z-ARC_L.bloqueio.z)<14,tipo=mil&&ZS.sentinela&&Math.random()<0.6?'sentinela':Math.random()<0.18?'runner':'walker';
    const q=criarZ(tipo,x,z,{st:'vaga'});if(q){q.arc=true;q.hx=x;q.hz=z;return true;}break;}
  return false;}
/* os que não acharam lugar agora ficam na conta (faltam) e nascem depois, quando der: o número guardado não some */
function arcPovoar(){const D=arcD();if(arcVivos().length)return 0;let n;
  if(D.zVivos<0||!D.zDia)n=ARC_ZMAX;else n=Math.min(ARC_ZMAX,D.zVivos+Math.max(0,(G.dia||1)-D.zDia)*2);
  D.zDia=G.dia||1;let k=0;for(let i=0;i<n;i++)if(arcCriarZ(i))k++;
  ARC_POV.faltam=n-k;D.zVivos=n;return k;}
function arcGuardarZumbis(){ARC_POV.feito=false;const D=arcD();let n=ARC_POV.faltam||0;ARC_POV.faltam=0;for(const z of arcVivos()){if(z.st==='caca'&&Math.hypot(z.x-P.x,z.z-P.z)<60){n++;continue;}n++;z.vivo=false;z.st='sumindo';z.t=2.2;}
  for(let i=Z.length-1;i>=0;i--){const z=Z[i];if(z.arc&&!z.vivo&&z.st==='sumindo')Z.splice(i,1);}D.zVivos=n;D.zDia=G.dia||1;return n;}
/* morreu um zumbi da região: o número guardado acompanha */
let arcZT=0;
PASSOS.push(dt=>{arcZT-=dt;if(arcZT>0)return;arcZT=1;if(REG_ESTADO.alto!=='perto'||!ARC_POV.feito)return;const D=arcD();const v=arcVivos().length+(ARC_POV.faltam||0);if(D.zVivos>v)D.zVivos=v;});   // só depois de povoar
REG_GANCHOS.push(function arcNivel(r,nv,antes){if(r.id!=='alto')return;
  if(nv==='muitoLonge')arcLiberar();else arcEnfileirar();
  if(nv!=='perto'&&antes==='perto')arcGuardarZumbis();});
/* os zumbis da região só aparecem quando você chega perto do planalto de verdade (no corredor do vale ou a 45 m da beira) */
let arcPovT=0;
PASSOS.push(dt=>{arcPovT-=dt;if(arcPovT>0)return;arcPovT=1;if(!P.alive||G.modo!=='jogo'||REG_ESTADO.alto!=='perto')return;
  const d=Math.hypot(P.x-ARC.x,P.z-ARC.z)-ARC.r;if((d<45||(dentroARC(P.x,P.z,0)&&P.z<-150))&&!arcVivos().length&&!ARC_POV.feito){ARC_POV.feito=true;arcPovoar();}
  else if(ARC_POV.feito&&ARC_POV.faltam>0&&arcCriarZ(Math.floor(Math.random()*64)))ARC_POV.faltam--;});
const ARC_POV={feito:false,faltam:0};
V8.novo.alto=()=>{arcLiberar();ARC_POV.feito=false;ARC_POV.faltam=0;for(const k in REG_ESTADO)delete REG_ESTADO[k];};
V8.carregar.alto=()=>{ARC_POV.feito=false;ARC_POV.faltam=0;for(const k in REG_ESTADO)delete REG_ESTADO[k];for(let i=Z.length-1;i>=0;i--)if(Z[i].arc)Z.splice(i,1);
  if(ARC_BALAO.mesh){liberarMesh(ARC_BALAO.mesh);ARC_BALAO.mesh=null;}regT=0;};

/* ================= balão caído: desmontar ================= */
INTERS.push(tryIt=>{const L=ARC_LAY.balao;if(!L||Math.abs(P.x-L.x)>9||Math.abs(P.z-L.z)>9||P.y<-20)return;if(arcD().balaoDesm)return;
  const c=Math.cos(L.yaw),s=Math.sin(L.yaw),x=L.x+4.6*c,z=L.z-4.6*s;tryIt({k:'arcBalao',o:L},x,z,2.6,1.2);});
INTER_K.arcBalao={texto:()=>{const fer=invCount('faca')||invCount('facao')||invCount('machado');return{t:'Desmontar o balão',s:(fer?'corta o tecido e solta o maçarico':'com as mãos demora mais')+' · segure',hold:true,dur:fer?4.5:8};},
  usar:(o,seg)=>{if(!seg)return;const D=arcD();if(D.balaoDesm)return;D.balaoDesm=G.dia||1;const ganho=[['pano',6],['corda',3],['sucata',3],['pecasMaquina',1]];let msg=[];
    const chao=[];for(const[id,n]of ganho){if(!ITEMS[id])continue;const sobra=invAdd(id,n);if(sobra>0)chao.push([id,sobra]);msg.push(n+' '+ITEMS[id].nome.toLowerCase());}if(chao.length)soltarItens(chao,P.x,P.z,P.y);
    sfx('construir');barulho(P.x,P.z,10,true,P.y);feed('Balão desmontado: '+msg.join(', '));hudBarra();invRender();ganharXP(40);
    if(typeof diarioEvento==='function')diarioEvento('Desmontou o balão caído no Alto do Rio Claro','geral');
    if(ARC_BALAO.mesh){liberarMesh(ARC_BALAO.mesh);ARC_BALAO.mesh=null;}if(!ARC_FILA.includes(ARC_BALAO))ARC_FILA.push(ARC_BALAO);}};

/* ================= mirante: observar a região lá de cima ================= */
INTERS.push(tryIt=>{const L=ARC_LAY.mirante;if(!L||Math.abs(P.x-L.x)>3||Math.abs(P.z-L.z)>3)return;tryIt({k:'arcMirante',o:L},L.x,L.z-0.6,2.4,2.2,-1.2,L.top);});
INTER_K.arcMirante={texto:()=>({t:'Observar a região',s:arcD().mapeada?'o Alto já está no mapa · mostra zumbis por perto no minimapa':'do alto dá para ver o Alto inteiro · segure',hold:true,dur:1.5}),
  usar:(o,seg)=>{if(!seg)return;const D=arcD(),novo=!D.mapeada;D.mapeada=true;for(const q of ARC_POIS)D.vistos[q.id]=D.vistos[q.id]||2;G.obsAte=G.t+60;
    let nz=0;for(const z of Z)if(z.vivo&&Math.hypot(z.x-P.x,z.z-P.z)<120)nz++;
    toast('corpo','Do alto do mirante: a pousada, o galpão, o campo dos balões, o balão caído na beira da serra, o bloqueio do Exército e a cachoeira. '+(nz?nz+' zumbi'+(nz>1?'s':'')+' à vista.':'Nenhum zumbi à vista.')+(novo?' Os lugares do Alto entraram no mapa.':''));
    sfx('pegar');if(novo){ganharXP(30);if(typeof diarioEvento==='function')diarioEvento('Observou o Alto do Rio Claro do mirante','geral');}}};

/* ================= nascente, córrego e cachoeira (água) ================= */
const QUEDA_FS=`precision highp float;precision highp sampler2DShadow;in vec3 vW;in vec4 vD;uniform float uTime,uNoite;
${GLSL_LUZ}
out vec4 o;
void main(){float u=vD.x,v=vD.y,t=uTime;float a1=texture(uNoise,vec2(u*0.45+0.13,v*0.16-t*0.85)).r,a2=texture(uNoise,vec2(u*1.1+0.6,v*0.42-t*1.7)).r;
float f=smoothstep(0.38,0.78,a1*0.6+a2*0.55);float borda=smoothstep(0.0,0.18,u)*smoothstep(1.0,0.82,u);
vec3 L=luz(vW,normalize(uCam-vW));vec3 agua=mix(vec3(0.16,0.27,0.29),vec3(0.82,0.88,0.9),f);
float esp=vD.z;vec3 col=agua*L*1.15+vec3(0.06)*esp;float a=(0.5+0.45*f+0.25*esp)*borda;
vec4 c=acabar(col*(1.0-0.45*uNoite),vW,0.0);o=vec4(c.rgb,clamp(a,0.0,0.95));}`;
let QUEDA=null;
function arcAguaMalhas(){if(typeof AGUA_VS==='undefined')return;const prog=program(AGUA_VS,QUEDA_FS,GDEF);
  // córrego: faixa de água no leito, da nascente até a beira
  const gc=new GB(1<<12,7),c=ARC_CORREGO,linhas=[];let total=0;const seg=[];for(let i=0;i<c.length-1;i++){const L=Math.hypot(c[i+1][0]-c[i][0],c[i+1][1]-c[i][1]);seg.push(L);total+=L;}
  for(let s=0;s<=total+1e-3;s+=0.8){let k=0,acc=s;while(k<seg.length-1&&acc>seg[k]){acc-=seg[k];k++;}const a=c[k],b=c[k+1],t=Math.min(1,acc/seg[k]),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,dx=(b[0]-a[0])/seg[k],dz=(b[1]-a[1])/seg[k];
    const larg=s<2.5?2.2:0.95;let gm=1e9;for(const u of[-1,-0.5,0,0.5,1])gm=Math.min(gm,ground(x-dz*larg*u,z+dx*larg*u));const y=gm+(s<2.5?0.3:0.16),lin2=[];
    for(const u of[-1,-0.5,0,0.5,1]){const px=x-dz*larg*u,pz=z+dx*larg*u;lin2.push([px,y,pz,dx,dz,0.9,Math.max(0.05,y-ground(px,pz))]);}linhas.push(lin2);}
  ARC_L.cachoeira.yTopo=linhas.length?linhas[linhas.length-1][2][1]:12;
  for(let i=0;i<linhas.length-1;i++)for(let k=0;k<4;k++){const a=linhas[i][k],b=linhas[i][k+1],d=linhas[i+1][k+1],e=linhas[i+1][k];for(const v of[a,b,d,a,d,e])gc.v7(...v);}
  // queda: lâmina de água descendo a pedra da beira do planalto até o poço do rio (u: largura, v: metros descendo, z: espuma)
  const gq=new GB(1<<12,7),x0=44,zTopo=c[c.length-1][1],zPe=-180.6,yPe=(typeof rioNivel==='function'?rioNivel(0):0.9)+0.02,N=20,W=1.25;ARC_L.cachoeira.yPe=yPe;
  const pts=[];let vAcc=0,ant=null;for(let i=0;i<=N;i++){const t=i/N,z=zTopo+(zPe-zTopo)*t,yg=ground(x0,z),y=i===0?ARC_L.cachoeira.yTopo:Math.max(yPe,Math.min(ARC_L.cachoeira.yTopo,yg+0.18+0.25*Math.sin(t*Math.PI)));
    if(ant)vAcc+=Math.hypot(z-ant[0],y-ant[1]);ant=[z,y];pts.push([z,y,vAcc,smooth(0.75,1,t)]);}
  for(let i=0;i<pts.length-1;i++){const A=pts[i],B=pts[i+1];for(let k=0;k<4;k++){const u0=k/4,u1=(k+1)/4,xa=x0-W+u0*2*W,xb=x0-W+u1*2*W;
      const v=[[xa,A[1],A[0],u0,A[2],A[3],0],[xb,A[1],A[0],u1,A[2],A[3],0],[xb,B[1],B[0],u1,B[2],B[3],0],[xa,B[1],B[0],u0,B[2],B[3],0]];for(const q of[v[0],v[1],v[2],v[0],v[2],v[3]])gq.v7(...q);}}
  QUEDA={prog,corrego:unMesh(gc.data()),queda:unMesh(gq.data())};}
INIT_MALHAS.push(arcAguaMalhas);
DESENHO.agua.push(function arcAguaDesenho(){if(!QUEDA||!AGUA)return;const cx=cam.pos[0],cz=cam.pos[2];if(d2(44,-200,cx,cz)>260*260)return;const post=POSTX.ok&&!!GDEF;
  {const Pg=AGUA.prog,u=Pg.u;setLit(Pg);gl.uniform1f(u.uChuva,E.r||0);gl.uniform1f(u.uNoite,E.n||0);gl.uniform3fv(u.uCeu,post?toLin(E.zen,E.exp):E.zen);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.CULL_FACE);gl.bindVertexArray(QUEDA.corrego.vao);gl.drawArrays(gl.TRIANGLES,0,QUEDA.corrego.count);}
  {const Pg=QUEDA.prog,u=Pg.u;setLit(Pg);gl.uniform1f(u.uNoite,E.n||0);gl.depthMask(false);gl.bindVertexArray(QUEDA.queda.vao);gl.drawArrays(gl.TRIANGLES,0,QUEDA.queda.count);gl.depthMask(true);}
  gl.disable(gl.BLEND);});
/* névoa no pé da cachoeira */
DESENHO.alfa.push(function arcNevoa(){if(!QUEDA||d2(44,-182,cam.pos[0],cam.pos[2])>80*80)return;const y=ARC_L.cachoeira.yPe||0.9,t=G.t;
  for(let i=0;i<7;i++){const a=i*2.1+t*0.3,r=0.6+((i*37)%5)*0.25,k=(Math.sin(t*1.3+i)*0.5+0.5);bb(44+Math.cos(a)*r,y+0.3+k*0.9,-180.9+Math.sin(a)*r*0.6,0.9+k*0.6,0.9,0.93,0.95,0.16*(1-k*0.5));}});
/* barulho de água perto da cachoeira e do córrego */
{const _sr=somRegiaoCalc;somRegiaoCalc=function(){_sr.apply(this,arguments);const r=SOM.reg;if(r.sub)return;const d=Math.min(Math.hypot(P.x-44,P.z+186),arcCorregoD(P.x,P.z)+6);r.rio=Math.max(r.rio,clamp(1-(d-4)/34,0,1));};}
/* modo criativo: o Alto na lista de lugares para ir */
if(typeof admLugares==='function'){const _al=admLugares;admLugares=function(){const L=_al.apply(this,arguments);
  L.push({nome:'Alto do Rio Claro',sub:'pousada',x:36,z:-226},{nome:'Campo dos balões',sub:'Alto do Rio Claro',x:84,z:-238},{nome:'Trilha da Serra',sub:'começo, na vila',x:30,z:-84});return L;};}
