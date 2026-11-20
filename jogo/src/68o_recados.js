/* ================= Recados do bairro: 12 bilhetes deixados pelos moradores (v10.8.7) =================
   Himalaia (19/11/2026): "faltam coisas para fazer" (e não só matar zumbi). Uma coleção para achar explorando: 12 recados de
   quem morava ou trabalhava aqui, largados onde a pessoa estava (barraca da Feira, lajes e caixa-d'água do Morro do Sabiá,
   telhado e torre da Matriz na Cidade Alta, bilheteria do Plano Inclinado, Hotel Imperial, Hospital, Torre Atlântica, cais
   do Porto Velho e bar da Vila São José). Cada um conta um pedaço de como foi e dá uma dica de verdade do jogo (onde tem
   peça, o que o botijão faz, como acender um abrigo...). O papel brilha de leve quando você chega perto.
   · E lê o recado (a tela de documento) e ele entra na coleção; 4, 8 e 12 recados dão prêmio (o último, um mapa secreto);
   · no "O que fazer": "Recados do bairro, N de 12", apontando a região do recado mais perto que falta (sem o lugar exato). */
const REC={ok:false,lista:[],malha:null,dica:0};
const REC_TEXTOS={
  feira:['Recado na barraca de utilidades','Sexta-feira de feira e ninguém veio. Os caminhões de verdura não passaram do túnel.<br><br>Deixei o botijão atrás da barraca. Se alguém precisar, um tiro nele resolve muita coisa: foi o que o sargento disse na rua de baixo.<br><br>— Seu Abílio, da barraca das panelas'],
  laje1:['Bilhete preso no varal','Mãe, subi para a laje da Dona Jurema. Daqui dá para ir de laje em laje até a escadaria sem pisar no beco. Eles não sobem.<br><br>Se você ler isso, vem por cima.<br><br>— Léo'],
  laje2:['Caderno do mototaxista','Corrida para o hospital: cancelada. Corrida para o cais: cancelada.<br><br>A prefeitura fechou o tapume e só sobrou o buraco no fim da rua de cima. Quem ainda tiver moto, desce pela ladeira da Feira e não para.<br><br>— Baiano, ponto do Sabiá'],
  caixa:['Anotação do zelador da caixa-d\'água','A motobomba parou de novo. Falta peça de máquina e óleo de motor, e uns fios novos.<br><br>Sem ela a caixa seca em três dias e o morro inteiro fica sem água. Peça de máquina tem nos contêineres do porto.<br><br>— Seu Nonato'],
  telhado:['Diário rasgado num telhado','Terceiro dia em cima dos telhados da Cidade Alta. Lá de baixo eles andam em roda, devagar, como se esperassem alguma coisa. À noite é pior.<br><br>Se a luz das ruas voltasse, eu descia. A cabine de força fica do lado da casa das máquinas do bondinho.<br><br>— R.'],
  sino:['Bilhete do sacristão','O padre mandou tocar o sino para chamar o povo para a igreja. Veio gente. Veio coisa pior junto.<br><br>Não toque esse sino, a não ser que queira todos eles aqui no largo.<br><br>— Tonho, sacristão da Matriz'],
  bilheteria:['Aviso da bilheteria do Plano Inclinado','BONDINHO PARADO POR FALTA DE ENERGIA.<br><br>O fusível de reserva fica na casa das máquinas, lá em cima. O óleo do motor acabou: procurar na oficina ou no posto. Com isso no painel do motor, o bondinho volta a subir.<br><br>— Administração'],
  hotel:['Bilhete da recepção do Hotel Imperial','Aos hóspedes: o elevador parou entre o primeiro e o segundo andar. Usem a escada e não forcem a porta do poço.<br><br>Pedimos que fiquem nos quartos até a polícia chegar.<br><br>— Recepção'],
  hospital:['Bilhete da enfermeira do plantão','Fechamos a farmácia. O gerador está nos fundos do térreo: com ele ligado as salas acendem, mas o barulho chama eles para dentro.<br><br>Escolha o que importa mais.<br><br>— Sueli, enfermeira'],
  torre:['Post-it no alto da Torre Atlântica','Daqui de cima dá para ver o mar, o farol e o porto. Os navios não voltaram.<br><br>Se a água acabar, tem uma bica no pé da caixa-d\'água do Morro do Sabiá. Só funciona com a motobomba ligada.<br><br>— Marcos, do TI'],
  cais:['Bilhete do pescador','Tirei a bateria do barco e deixei aqui no cais. Com dois fios dá para acender umas lâmpadas e passar a noite.<br><br>Luz acesa, eles não chegam perto.<br><br>— Seu Dito'],
  vila:['Recado no balcão do bar','Fiado só amanhã. E o amanhã não veio.<br><br>A gasolina do gerador acabou. Quem tiver dois galões e um óleo de motor pode ligar de novo a luz do largo da igreja.<br><br>— Dona Neusa, Bar da Vila']};
const REC_REGIAO={feira:'Feira da Rua do Morro',laje1:'Morro do Sabiá',laje2:'Morro do Sabiá',caixa:'Morro do Sabiá',telhado:'Cidade Alta',sino:'Cidade Alta',bilheteria:'Largo do Plano',
  hotel:'Hotel Imperial',hospital:'Hospital São Lucas',torre:'Torre Atlântica',cais:'Porto Velho',vila:'Vila São José'};
const REC_PREMIOS={4:[['kit',1],['bandagem',2]],8:[['municao9',20],['fusivel',1]],12:[['mapaSecreto',1]]};
function recD(){const D=ativD();if(!D.recados||typeof D.recados!=='object')D.recados={achados:{}};if(!D.recados.achados)D.recados.achados={};return D.recados;}
const recAchados=()=>Object.keys(recD().achados).filter(k=>REC_TEXTOS[k]).length;
/* um ponto livre perto de (x,z), no mesmo chão (y); tenta em volta e devolve null se não achar */
function recPerto(x,z,y,r){for(const a of[0,1.6,3.2,4.8,0.8,2.4,4.0,5.6]){for(const d of[r||0.6,(r||0.6)+0.4,0.3]){const px=x+Math.sin(a)*d,pz=z+Math.cos(a)*d,c=chaoEm(px,pz,y+0.6);
  if(!Number.isFinite(c)||Math.abs(c-y)>0.25||bloqueadoAlto(px,pz,0.18,c+0.05))continue;return{x:px,y:c,z:pz};}}return null;}
function recMontar(){if(REC.ok)return;REC.ok=true;const L=REC.lista,R=rng(70141),poe=(id,p)=>{if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))L.push({id,x:p.x,y:p.y,z:p.z,yaw:R()*6.28});};
  /* Feira: em cima do balcão de uma barraca */
  try{const B=(FEIRA.barracas||[]).filter(b=>isFinite(b.y0));if(B.length){const b=B[Math.floor(R()*B.length)],xb=b.cx-b.lado*b.d/2+b.lado*0.31;poe('feira',{x:xb,y:b.y0+0.92,z:b.cz+(R()-0.5)*(b.w*0.5)});}}catch(e){}
  /* Morro: duas lajes com saque e o alto da caixa-d'água */
  try{const S=INTER.filter(q=>/^morro-s/.test(q.id));for(const[id,i]of[['laje1',Math.floor(S.length*0.2)],['laje2',Math.floor(S.length*0.7)]]){const q=S[i];if(q)poe(id,recPerto(q.x,q.z,q.y,0.7));}}catch(e){}
  try{const T=MOR.torre;if(T&&isFinite(T.top))poe('caixa',recPerto(T.x+0.7,T.z+0.7,T.top,0.2));}catch(e){}
  /* Cidade Alta: um telhado com saque, a torre do sino e a bilheteria do Plano Inclinado */
  try{const S=INTER.filter(q=>/^calta-t/.test(q.id));const q=S[Math.floor(S.length*0.5)];if(q)poe('telhado',recPerto(q.x,q.z,q.y,0.6));}catch(e){}
  try{const t=CA.torre;if(t&&isFinite(t.yS))poe('sino',recPerto(t.x,t.z,t.yS,0.8));}catch(e){}
  try{const Rp=CA.plano&&CA.plano.R;if(Rp){const bx=Rp.P0[0]+5.2,bz=Rp.P0[1]+0.6+1.8;poe('bilheteria',recPerto(bx+0.4,bz+1.6,ground(bx+0.4,bz+1.6),0.3));}}catch(e){}
  /* prédios da cidade: perto de um móvel (gaveta, armário...) do andar mais alto do Hotel e da Torre, e de um andar do Hospital */
  try{for(const[id,re,alto]of[['hotel',/Hotel Imperial/,true],['torre',/Torre Atl/,true],['hospital',/Hospital/,false]]){const C=CID.conts.filter(c=>c.p&&re.test(c.p.nome||'')&&!c.oculto&&isFinite(c.y));
      if(!C.length)continue;C.sort((a,b)=>alto?b.y-a.y:a.y-b.y);const c=C[alto?0:Math.min(C.length-1,2)],fx=Math.sin(c.yaw||0),fz=Math.cos(c.yaw||0);
      poe(id,recPerto(c.x+fx*0.9,c.z+fz*0.9,c.y,0.3));}}catch(e){}
  /* Porto Velho: no cais, perto do acampamento; Vila: no balcão do bar (ou do lado de fora) */
  try{if(typeof ABR2_CAIS!=='undefined'){const q=ABR2_CAIS;poe('cais',recPerto(q.x-3.2,q.z+2.6,chaoEm(q.x-3.2,q.z+2.6,6),0.4));}}catch(e){}
  try{const bar=Object.values(VILA).find(p=>p&&/Bar/.test(p.nome||''));if(bar&&isFinite(bar.x0)){const x=(bar.x0+bar.x1)/2,z=(bar.z0+bar.z1)/2;poe('vila',recPerto(x,z,chaoEm(x,z,(bar.y0||ground(x,z))+1),0.5));}}catch(e){}}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{recMontar();}catch(e){console.error('recados',e);}return r;};}
function recGeo(){const g=new GB(1<<9,8),R=rng(70142);add(g,boxTris(0.21,0.012,0.15),mat(0,0.006,0),lin(0xe8e0c8),{j:0.04,rnd:R});
  add(g,boxTris(0.16,0.004,0.004),mat(0,0.0135,-0.03),lin(0x3a3a4a));add(g,boxTris(0.12,0.004,0.004),mat(-0.02,0.0135,0.0),lin(0x3a3a4a));add(g,boxTris(0.14,0.004,0.004),mat(0.0,0.0135,0.03),lin(0x3a3a4a));
  return g.data();}
etapaMalha('fim','recados',1,()=>{try{REC.malha=litMesh(recGeo());}catch(e){console.error('recados (desenho)',e);REC.malha=null;}});
const REC_M=new Float32Array(16);
DESENHO.opaco.push(function recadosDesenho(Pg){if(!REC.malha)return;const A=recD().achados;for(const r of REC.lista){if(A[r.id]||d2(r.x,r.z,cam.pos[0],cam.pos[2])>45*45)continue;drawStat(Pg,REC.malha,trs(REC_M,r.x,r.y+0.005,r.z,0,r.yaw,0,1,1,1));}});
DESENHO.aditivo.push(function recadosBrilho(){const A=recD().achados,pul=0.55+0.45*Math.sin((G.t||0)*3.2);for(const r of REC.lista){if(A[r.id])continue;const dd=d2(r.x,r.z,P.x,P.z);if(dd>14*14)continue;
  const k=1-Math.sqrt(dd)/14;bb(r.x,r.y+0.12,r.z,0.16+0.1*pul,1,0.95,0.75,(0.25+0.35*pul)*k);}});
/* ler: a tela de documento (a mesma dos papéis do subsolo); a coleção e os prêmios */
function recLer(r){const T=REC_TEXTOS[r.id];if(!T||G.modo!=='jogo')return;const D=recD(),novo=!D.achados[r.id];D.achados[r.id]=true;const n=recAchados();
  G.modo='doc';tela('t-doc');$('doc-tit').textContent=T[0];$('doc-txt').innerHTML=T[1]+'<br><br><small>Recados do bairro: '+n+' de 12</small>';if(document.pointerLockElement)document.exitPointerLock();sfx('clique');
  if(!novo)return;ativLimpa();ganharXP(25);if(typeof diarioEvento==='function')diarioEvento('Achou um recado: '+T[0]+' ('+n+' de 12)','geral');
  const pr=REC_PREMIOS[n];if(pr){ativDar(pr);ganharXP(n*20);setTimeout(()=>toast('habilidade','Recados do bairro: '+n+' de 12! Prêmio: '+ativPremio(pr)+(n===12?'. A coleção está completa.':'.')),400);}}
INTERS.push(tryIt=>{if(!REC.ok||P.bonde)return;const A=recD().achados;for(const r of REC.lista){if(A[r.id]||Math.abs(r.x-P.x)>2.4||Math.abs(r.z-P.z)>2.4)continue;tryIt({k:'recado',o:r},r.x,r.z,1.5,2.6,-0.6,r.y);}});
INTER_K.recado={texto:r=>({t:'Ler o recado',s:(REC_TEXTOS[r.id]||['?'])[0]+' · recados: '+recAchados()+' de 12'}),usar:r=>recLer(r)};
PASSOS.push(function recadosPasso(dt){if(!REC.ok||G.modo!=='jogo'||REC.dica)return;const A=recD().achados;
  for(const r of REC.lista){if(A[r.id])continue;if(Math.hypot(r.x-P.x,r.z-P.z)<5&&Math.abs(r.y-P.y)<2.5){REC.dica=1;dica('recados','corpo','Um papel no chão: os moradores deixaram recados pelo bairro (12 ao todo). E lê; 4, 8 e 12 dão prêmio.');break;}}});
/* "O que fazer": a região do recado mais perto que falta (o lugar exato, só achando) */
ATIV_TIPOS.colecao={nome:'Coleção',cor:'#e8d27a',l:'K'};
ativFonte(()=>{if(!REC.ok||!REC.lista.length)return[];const A=recD().achados,n=recAchados(),falta=REC.lista.filter(r=>!A[r.id]);
  let b=null,bd=1e18;for(const r of falta){const d=d2(r.x,r.z,P.x,P.z);if(d<bd){bd=d;b=r;}}
  const R=rng(Math.floor((b?b.x*7+b.z*13:1))),ox=b?(R()-0.5)*24:0,oz=b?(R()-0.5)*24:0,prox=[4,8,12].find(k=>k>n);
  return[{id:'recados',tipo:'colecao',nome:'Recados do bairro ('+n+' de 12)',x:b?b.x+ox:P.x,z:b?b.z+oz:P.z,r:22,feito:!b,
    falta:b?'o mais perto que falta fica para os lados de: '+(REC_REGIAO[b.id]||'?')+' (um papel no chão, que brilha de perto)':'',premio:prox?'com '+prox+': '+ativPremio(REC_PREMIOS[prox]):'coleção completa'}];});
