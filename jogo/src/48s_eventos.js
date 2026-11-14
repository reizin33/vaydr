/* ================= eventos do mundo: enchente, incêndio na mata, estrada bloqueada, infestação, comboio abandonado e fartura =================
   O mundo muda sozinho. Chuva forte por horas faz o rio subir (as margens baixas alagam, o carro afoga, nada-se onde antes
   se andava) e, quando a água baixa, ela deixa entulho com coisas na beira. Muitos dias sem chuva deixam a mata seca: um
   incêndio pode começar longe (fumaça no céu) e passar de árvore em árvore; quando apaga, às vezes revela um esconderijo
   enterrado. Depois de tempestade, árvores caem e fecham uma estrada (o carro não passa; machado limpa). Hordas fazem ninho
   num lugar por alguns dias (destrua o ninho e limpe a área para ganhar o saque). Um comboio do Exército pode aparecer
   tombado na estrada da cidade, cheio de caixas e de soldados mortos. E tem os dias bons: frutas em todo arbusto ou
   cardume no rio e no lago (o peixe morde bem mais rápido). Tudo aparece no mapa, no rádio e no diário, e fica salvo. */
const EVM={maxAtivos:3,
  locais:{posto:{x:92,z:-9,r:16,nome:'Posto de gasolina'},vila:{x:62,z:-72,r:20,nome:'Vila'},fazenda:{x:-72,z:60,r:20,nome:'Fazenda'},torre:{x:-44,z:-110,r:12,nome:'Torre de rádio'},
    trem:{x:38,z:-58,r:10,nome:'Trem abandonado'},estacao:{x:156,z:-54,r:10,nome:'Estação ferroviária'}},
  peso:{estrada:0.24,infestacao:0.22,comboio:0.12,frutas:0.12,cardume:0.1},chanceDia:0.62};
iconesNovos({'i-fogo-mata':'<path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-4-9 0 4-4 6-4 12 0 5 3 8 7 8Z"/>',
  'i-onda':'<path d="M2 12c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2M2 17c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2"/>',
  'i-tronco':'<path d="M3 15 19 7M5 19 21 11M3 15l2 4M19 7l2 4"/><circle cx="20" cy="9" r="1.5"/>'});
function mundoNovo(){return{ev:[],cheia:{nivel:0,alvo:0,fim:0,chuva:0,ativa:false},fogo:null,seco:0,cardume:0,frutas:0,id:1,tocos:[],ultTm:null};}
function mundoD(){return G.mundo||(G.mundo=mundoNovo());}
function evAviso(kind,txt,diario){toast(kind,txt);sfx(kind==='radio'?'missao':'apito');if(diario&&typeof diarioEvento==='function')diarioEvento(diario,'evento');}
function evLongeDoAcampamento(x,z,m){return d2(x,z,FIRE[0],FIRE[2])>(m||45)**2;}
/* ---------- enchente ---------- */
function cheiaPasso(dm){const M=mundoD(),C=M.cheia;
  if(!C.ativa){C.chuva=clamp(C.chuva+(G.chuva>0.6?dm*G.chuva:-dm*0.4),0,200);
    if(C.chuva>110&&RIO.ok){C.ativa=true;C.alvo=1.0+Math.random()*0.5;C.fim=G.tm+8*60;C.chuva=0;
      evAviso('clima','O rio está subindo! As margens baixas vão alagar. Cuidado com o carro perto da água.','Enchente do Rio Claro');}}
  else{if(G.tm>C.fim)C.alvo=0;const v=dm/60*0.3;C.nivel=C.nivel<C.alvo?Math.min(C.alvo,C.nivel+v):Math.max(C.alvo,C.nivel-v*0.8);
    if(C.alvo===0&&C.nivel<=0.001){C.ativa=false;C.nivel=0;cheiaEntulho();evAviso('clima','A água baixou. A enchente deixou entulho na beira do rio: pode ter coisa boa no meio.','A enchente baixou');}}
  RIO.enchente=C.nivel;if(typeof AGUA!=='undefined'&&AGUA&&Math.abs((RIO.enchenteMalha||0)-C.nivel)>0.08){RIO.enchenteMalha=C.nivel;AGUA.rio=aguaMalhaRio();}}
LOOT.enchente=[['tabuas',1,3,0.6],['sucata',1,3,0.6],['garrafa',1,2,0.5],['pano',1,2,0.5],['corda',1,1,0.3],['gasolina',1,1,0.15],['pregos',2,5,0.3],['peixeCru',1,2,0.25]];
function cheiaEntulho(){for(let i=0;i<6;i++){const s=0.15+Math.random()*0.75,p=rioPonto(s),w=RIO.larg(s)+2+Math.random()*4,l=Math.random()<0.5?-1:1,x=p[0]-p[3]*w*l,z=p[1]+p[2]*w*l;
  if(lagoR(x,z)<1.1||(aguaNivel(x,z)!==null&&aguaProf(x,z)>0.2))continue;const L=rollLoot('enchente').filter(q=>ITEMS[q[0]]);if(L.length)soltarItens(L,x,z);}}
/* ---------- incêndio na mata ---------- */
let fogoT=0;
function arvoreComFogo(t,dur){if(!t||!t.alive||t.fogo||t.agua)return false;t.fogo=true;t.fogoT=dur||18+Math.random()*16;t.fogo0=t.fogoT;t.fogoEt=0;const g=ground(t.x,t.z);CHAMAS.push({x:t.x,y:g,z:t.z,r:1.9,t:0,dur:t.fogoT+3,rr:0,mata:true});return true;}
function incendioComecar(t,motivo){const M=mundoD();if(M.fogo)return false;if(!arvoreComFogo(t,26))return false;M.fogo={x:t.x,z:t.z,ids:[t.id],n:1,dia:G.dia,motivo:motivo||'seca'};
  const lugar=typeof zonaEm==='function'&&zonaEm(t.x,t.z)?zonaEm(t.x,t.z).nome:'na mata';
  evAviso('alerta','Fumaça subindo '+(lugar==='na mata'?'na mata':'perto de '+lugar)+'! A mata está pegando fogo. Fique longe do vento e da fumaça.','Incêndio na mata'+(lugar!=='na mata'?' ('+lugar+')':''));return true;}
function incendioDeRaio(t){if(Math.random()<0.35)incendioComecar(t,'raio');}
function incendioPasso(dt){const M=mundoD(),F=M.fogo;if(!F)return;fogoT-=dt;if(fogoT>0)return;fogoT=1.5;const chuva=G.chuva>0.4;
  const vivos=[];for(const id of F.ids){const t=TREES[id];if(!t||!t.fogo)continue;t.fogoT-=1.5*(chuva?3:1);
    if(t.fogoT<=0){t.fogo=false;if(t.alive){t.alive=false;colRemove(COLL.find(c=>c.tree===t)||{});vegDirty=true;M.tocos.push({id:t.id,x:t.x,z:t.z,dia:G.dia});}continue;}vivos.push(id);
    {const et=Math.floor(clamp(1-t.fogoT/(t.fogo0||30),0,1)*6);if(et!==t.fogoEt){t.fogoEt=et;vegDirty=true;}}   // v10.2.2: a árvore escurece e perde a folha aos poucos (rebuildVeg)
    if(F.n<70&&vivos.length<26)for(const c of colQuery(t.x,t.z,7)){const q=c.tree;if(!q||!q.alive||q.fogo||q.agua)continue;if(d2(q.x,q.z,t.x,t.z)>49)continue;if(Math.random()<(chuva?0.02:0.16)){if(arvoreComFogo(q)){F.ids.push(q.id);F.n++;}}}
    if(!(typeof fogo3dOk==='function'&&fogo3dOk())&&Math.random()<0.5)part(t.x+(Math.random()-0.5)*2,ground(t.x,t.z)+4+Math.random()*4,t.z+(Math.random()-0.5)*2,(Math.random()-0.5)*0.5,2+Math.random(),(Math.random()-0.5)*0.5,7,1.4+Math.random(),[0.22,0.2,0.19,0.4],false,-0.25);}
  F.ids=F.ids.filter(id=>TREES[id]&&TREES[id].fogo);
  if(!F.ids.length){M.fogo=null;const tem=F.n>=6&&Math.random()<0.75;if(tem)M.ev.push({id:M.id++,tipo:'esconderijo',x:F.x+(Math.random()-0.5)*3,z:F.z+(Math.random()-0.5)*3,dia:G.dia,aberto:false});
    evAviso('alerta','O fogo apagou. '+F.n+' árvores queimaram.'+(tem?' No meio das cinzas apareceu um alçapão que estava escondido no mato.':''),'O incêndio apagou'+(tem?': apareceu um esconderijo':''));}}
function fogoSecoPasso(dm){const M=mundoD();M.seco=G.chuva>0.15?0:M.seco+dm/60;if(M.fogo||M.seco<30||G.hora<11||G.hora>17)return;
  if(Math.random()<dm/60*0.06){for(let k=0;k<50;k++){const t=TREES[Math.floor(Math.random()*TREES.length)];if(!t||!t.alive||t.agua)continue;const d=Math.hypot(t.x-P.x,t.z-P.z);
    if(d<70||d>170||!evLongeDoAcampamento(t.x,t.z,60)||dentroCidade(t.x,t.z,8))continue;if(incendioComecar(t,'seca'))break;}}}
LOOT.esconderijo=[['municao9',8,16,0.7],['balaRifle',4,10,0.5],['remedios',1,3,0.6],['seringa',1,1,0.4],['gasolina',1,2,0.5],['racao',2,3,0.6],['kit',1,1,0.35],['pistola',1,1,0.2],['bombaCaseira',1,2,0.3]];
/* ---------- estrada bloqueada ---------- */
function estradaComecar(){const M=mundoD();for(let k=0;k<30;k++){const ri=[0,1,2,4][Math.floor(Math.random()*4)],r=ROADS[ri];if(!r)continue;const i=Math.floor(Math.random()*(r.pts.length-1)),a=r.pts[i],b=r.pts[i+1],t=0.2+Math.random()*0.6,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t);
    if(Math.hypot(x-P.x,z-P.z)<50||!evLongeDoAcampamento(x,z,40)||dentroCidade(x,z,6))continue;if(M.ev.some(e=>Math.hypot(e.x-x,e.z-z)<40))continue;
    const yaw=Math.atan2(b[0]-a[0],b[1]-a[1]),tr=[];for(let j=0;j<2+(Math.random()<0.5?1:0);j++){const o=(j-1)*1.6+(Math.random()-0.5)*0.6,cx=x+Math.sin(yaw)*o,cz=z+Math.cos(yaw)*o;
      tr.push({x:cx,z:cz,yaw:yaw+Math.PI/2+(Math.random()-0.5)*0.5,L:r.w+3.5+Math.random()*1.5,r:0.3+Math.random()*0.12,hp:3});}
    const e={id:M.id++,tipo:'estrada',x,z,road:ri,troncos:tr,dia:G.dia};M.ev.push(e);estradaMontar(e);
    const lugar=ri===0?'na estrada da cidade':ri===1?'na estrada da fazenda':ri===2?'na estrada da vila':'na estrada da base';
    evAviso('alerta','Árvores caíram e fecharam a pista '+lugar+'. De carro não passa; com machado dá para limpar.','Estrada bloqueada '+lugar);return true;}return false;}
function estradaMontar(e){for(const t of e.troncos){if(t.hp<=0||t.col)continue;const g=ground(t.x,t.z),c=Math.cos(t.yaw),s=Math.sin(t.yaw),hx=s*t.L/2,hz=c*t.L/2;
  t.col=colBox(t.x,t.z,t.r,t.L/2,t.yaw,{solid:true,y0:g-0.4,y1:g+t.r*2+0.05,tronco:true,evTronco:t});
  t.sup=supAdd({t:'seg',ax:t.x-hx,ay:ground(t.x-hx,t.z-hz)+t.r,az:t.z-hz,bx:t.x+hx,by:ground(t.x+hx,t.z+hz)+t.r,bz:t.z+hz,r0:t.r,r1:t.r*0.85,larg:0.9,topo:0.95});}}
function troncoRemover(t){t.hp=0;if(t.col){colRemove(t.col);t.col=null;}if(t.sup){supRemove(t.sup);t.sup=null;}}
/* ---------- infestação (ninho de zumbis num lugar) ---------- */
function infestacaoComecar(){const M=mundoD(),L=Object.keys(EVM.locais).filter(k=>{const l=EVM.locais[k];return evLongeDoAcampamento(l.x,l.z,60)&&!M.ev.some(e=>e.tipo==='infestacao'&&e.local===k)&&Math.hypot(l.x-P.x,l.z-P.z)>50;});
  if(!L.length)return false;const k=L[Math.floor(Math.random()*L.length)],l=EVM.locais[k];
  const e={id:M.id++,tipo:'infestacao',local:k,x:l.x+(Math.random()-0.5)*6,z:l.z+(Math.random()-0.5)*6,restantes:7+Math.floor(Math.random()*5)+Math.min(6,Math.floor(G.dia/3)),ninho:120,dia:G.dia,ate:G.dia+3};M.ev.push(e);
  evAviso('radio','Alguém no rádio: tem uma horda fazendo ninho '+(k==='posto'?'no posto de gasolina':k==='vila'?'na vila':k==='fazenda'?'na fazenda':k==='torre'?'na torre de rádio':k==='trem'?'no trem abandonado':'na estação de trem')+'. Se for lá, vá armado.','Ninho de zumbis: '+l.nome);return true;}
const NINHO_Z=new Map();
function infestacaoPasso(e){const d=Math.hypot(e.x-P.x,e.z-P.z);
  if(!NINHO_Z.has(e.id)&&e.restantes>0&&d<75&&P.y>SUB_FUNDO){const L=[];for(let i=0;i<e.restantes;i++){const a=Math.random()*6.283,r=3+Math.random()*11,x=e.x+Math.cos(a)*r,z=e.z+Math.sin(a)*r;
      if(pointBlocked(x,z,0.4)||ruralCasaEm(x,z,0.3))continue;const R=Math.random(),t=R<0.15?'runner':R<0.25?'rastejante':R<0.3&&G.dia>=6?'brute':'walker';const q=criarZ(t,x,z,{st:'vaga'});if(q){q.ninhoEv=e.id;q.hx=e.x;q.hz=e.z;L.push(q);}}
    e.restantes=L.length;NINHO_Z.set(e.id,L);}   // conta só os que nasceram de verdade
  const L=NINHO_Z.get(e.id);if(L){for(let i=L.length-1;i>=0;i--){const q=L[i];if(!q.vivo||Z.indexOf(q)<0){if(!q.vivo)e.restantes=Math.max(0,e.restantes-1);L.splice(i,1);}}
    // sumiram sem morrer (o mundo recolheu de longe): voltam para o ninho na próxima vez que você chegar perto
    if(!L.length&&e.restantes>0)NINHO_Z.delete(e.id);
    if(d>140&&L.length){for(const q of L){const i=Z.indexOf(q);if(i>=0)Z.splice(i,1);}NINHO_Z.delete(e.id);}}
  if(e.restantes<=0&&e.ninho<=0&&!e.fim)evFim(e,'limpo');}
function ninhoFerir(e,dano){if(e.ninho<=0)return;e.ninho-=dano;sfx('golpe',e.x,e.z);sangue(e.x,ground(e.x,e.z)+0.5,e.z,5,null,false);if(e.ninho<=0){e.ninho=0;feed('O ninho foi destruído');barulho(e.x,e.z,30,false);
  if(e.restantes<=0)evFim(e,'limpo');else feed('Ainda tem '+e.restantes+' zumbis do ninho por perto',true);}}
GOLPE_ALVOS.push((s,d,fx,fz)=>{const M=G.mundo;if(!M)return false;for(const e of M.ev){if(e.tipo!=='infestacao'||e.fim||e.ninho<=0)continue;const dx=e.x-P.x,dz=e.z-P.z,dd=Math.hypot(dx,dz);
  if(dd<(d.alcance||1.7)+1.2&&(dd<0.6||(dx*fx+dz*fz)/dd>0.3)){ninhoFerir(e,(d.dano||9)*(d.corta?1.3:1));return true;}}return false;});
/* ---------- comboio abandonado ---------- */
function comboioComecar(){const M=mundoD();if(M.ev.some(e=>e.tipo==='comboio'&&!e.fim))return false;const r=ROADS[0];
  for(let k=0;k<20;k++){const x=60+Math.random()*95,z=roadZ(x);if(Math.hypot(x-P.x,z-P.z)<60||!evLongeDoAcampamento(x,z,50))continue;const yaw=Math.atan2(8,roadZ(x+4)-roadZ(x-4));
    const vs=[{tipo:'caminhao',dx:-6,lado:-1.2,rot:0.15,tomb:false},{tipo:'caminhao',dx:2,lado:1.6,rot:-0.5,tomb:true},{tipo:'jipe',dx:9,lado:-1.0,rot:0.35,tomb:false}].map(v=>{const c=Math.cos(yaw),s=Math.sin(yaw);
      return Object.assign(v,{x:x+s*v.dx+c*v.lado,z:z+c*v.dx-s*v.lado,yaw:yaw+v.rot});});
    const cx=vs.map((v,i)=>({x:v.x+Math.cos(v.yaw)*(v.tipo==='jipe'?1.6:2.2),z:v.z-Math.sin(v.yaw)*(v.tipo==='jipe'?1.6:2.2),itens:null,aberta:false}));
    const e={id:M.id++,tipo:'comboio',x,z,yaw,vs,caixas:cx,soldados:4+Math.floor(Math.random()*3),dia:G.dia};M.ev.push(e);comboioMontar(e);
    evAviso('radio','...aqui é a patrulha do Exército... perdemos contato com o comboio de suprimentos na estrada da cidade, entre o posto e a cidade... quem estiver ouvindo, cuidado.','Comboio do Exército perdido na estrada da cidade');return true;}return false;}
function comboioMontar(e){if(e.cols)return;e.cols=[];for(const v of e.vs){const L=v.tipo==='jipe'?3.6:6.4,W=v.tipo==='jipe'?1.8:2.4;e.cols.push(colBox(v.x,v.z,W/2,L/2,v.yaw,{solid:true,veicMorto:true}));}}
const COMBOIO_Z=new Map();
function comboioPasso(e){const d=Math.hypot(e.x-P.x,e.z-P.z);if(!COMBOIO_Z.has(e.id)&&e.soldados>0&&d<70){const L=[];for(let i=0;i<e.soldados;i++){const a=Math.random()*6.283,r=4+Math.random()*9,x=e.x+Math.cos(a)*r,z=e.z+Math.sin(a)*r;
    if(pointBlocked(x,z,0.4))continue;const q=criarZ(ZS.sentinela&&Math.random()<0.5?'sentinela':'walker',x,z,{st:'vaga'});if(q){q.comboioEv=e.id;q.hx=e.x;q.hz=e.z;L.push(q);}}COMBOIO_Z.set(e.id,L);}
  const L=COMBOIO_Z.get(e.id);if(L)for(let i=L.length-1;i>=0;i--){const q=L[i];if(!q.vivo){e.soldados=Math.max(0,e.soldados-1);L.splice(i,1);}else if(Z.indexOf(q)<0)L.splice(i,1);}
  if(e.caixas.every(c=>c.aberta&&c.itens&&!c.itens.some(Boolean))&&!e.fim)evFim(e,'saqueado');}
LOOT.comboio=[['municao9',6,14,0.7],['balaRifle',4,10,0.6],['racao',2,4,0.8],['gasolina',1,2,0.6],['kit',1,1,0.4],['colete',1,1,0.25],['rifle',1,1,0.15],['bandagem',1,3,0.6],['agua',1,3,0.6],['mascaraGas',1,1,0.15]];
/* ---------- fim de evento e diretor (cada manhã) ---------- */
function evFim(e,como){e.fim=como;e.fimDia=G.dia;const M=mundoD();
  if(e.tipo==='infestacao'&&como==='limpo'){soltarItens([['municao9',6,{}],['racao',2,{}],['remedios',1,{}]].map(q=>[q[0],q[1]]).filter(q=>ITEMS[q[0]]),e.x,e.z);ganharXP(90);evAviso('corpo','Ninho destruído e área limpa! Ficou o que eles juntaram.','Limpou o ninho: '+(EVM.locais[e.local]||{}).nome);
    if(typeof conquista==='function')conquista('ninho');}
  if(e.tipo==='estrada'&&como==='limpa'){ganharXP(30);evAviso('corpo','Estrada liberada!','Liberou a estrada');}
  if(e.tipo==='comboio'&&como==='saqueado'){ganharXP(40);if(typeof diarioEvento==='function')diarioEvento('Saqueou o comboio do Exército','evento');}}
function mundoAmanhece(){const M=mundoD();
  // limpa os encerrados há mais de 1 dia; ninho que ninguém limpou some depois de 3 dias
  for(const e of M.ev){if(!e.fim&&e.tipo==='infestacao'&&G.dia>e.ate){e.fim='sumiu';e.fimDia=G.dia;}if(!e.fim&&e.tipo==='comboio'&&G.dia-e.dia>8){e.fim='sumiu';e.fimDia=G.dia;}}
  for(let i=M.ev.length-1;i>=0;i--){const e=M.ev[i];if(e.fim&&G.dia-(e.fimDia||G.dia)>=1&&e.tipo!=='estrada'){if(e.cols)for(const c of e.cols)colRemove(c);M.ev.splice(i,1);}else if(e.tipo==='estrada'&&e.fim)M.ev.splice(i,1);}
  // tocos de árvore queimada: a mata volta depois de 6 dias
  for(let i=M.tocos.length-1;i>=0;i--){const q=M.tocos[i];if(G.dia-q.dia>=6){const t=TREES[q.id];if(t)colRemove(COLL.find(c=>c.queimada===t)||{});if(t&&!t.alive&&!t.agua){t.alive=true;t.hp=5;if(!COLL.find(c=>c.tree===t))colCircle(t.x,t.z,TREE_R*t.s,{tree:t});vegDirty=true;}M.tocos.splice(i,1);}}
  if(G.dia<2||Math.random()>EVM.chanceDia)return;const ativos=M.ev.filter(e=>!e.fim&&e.tipo!=='esconderijo').length;if(ativos>=EVM.maxAtivos)return;
  const pesos=Object.assign({},EVM.peso);if(G.dia<3)pesos.infestacao=0;if(G.dia<4)pesos.comboio=0;if((G.clima&&G.clima.atual==='tempestade')||G.chuva>0.5)pesos.estrada*=2.2;
  let tot=0;for(const k in pesos)tot+=pesos[k];let r=Math.random()*tot,esc=null;for(const k in pesos){r-=pesos[k];if(r<=0){esc=k;break;}}
  if(esc==='estrada')estradaComecar();else if(esc==='infestacao')infestacaoComecar();else if(esc==='comboio')comboioComecar();
  else if(esc==='frutas'){for(const b of BUSHES)if(!b.agua){b.frutas=true;}vegDirty=true;M.frutas=G.dia;evAviso('clima','Época de frutas: os arbustos amanheceram carregados.','Fartura de frutas');}
  else if(esc==='cardume'){M.cardume=G.tm+24*60;evAviso('clima','Cardume subindo o rio! Hoje o peixe morde bem mais rápido no rio e no lago.','Cardume no rio');}}
AMANHECE.push(mundoAmanhece);
function peixeMult(){const M=G.mundo;return M&&M.cardume>G.tm?0.42:1;}
/* ---------- passo ---------- */
let evT=0;
PASSOS.push(dt=>{const M=mundoD();if(M.ultTm===null||M.ultTm>G.tm)M.ultTm=G.tm;const dm=G.tm-M.ultTm;
  if(dm>=1){M.ultTm=G.tm;cheiaPasso(dm);fogoSecoPasso(dm);}
  incendioPasso(dt);
  evT-=dt;if(evT>0)return;evT=1;for(const e of M.ev){if(e.fim)continue;if(e.tipo==='infestacao')infestacaoPasso(e);else if(e.tipo==='comboio')comboioPasso(e);
    else if(e.tipo==='estrada'&&e.troncos.every(t=>t.hp<=0))evFim(e,'limpa');}});
/* ---------- interações ---------- */
INTERS.push(tryIt=>{const M=G.mundo;if(!M||P.y<SUB_FUNDO)return;for(const e of M.ev){if(e.fim&&e.tipo!=='comboio')continue;if(Math.abs(e.x-P.x)>20||Math.abs(e.z-P.z)>20)continue;
  if(e.tipo==='estrada'){for(const t of e.troncos)if(t.hp>0&&d2(t.x,t.z,P.x,P.z)<9)tryIt({k:'evTronco',o:t},t.x,t.z,2.6,2.2,-0.8);}
  else if(e.tipo==='esconderijo'){tryIt({k:'evEsconderijo',o:e},e.x,e.z,2.0,2.4,-0.6);}
  else if(e.tipo==='infestacao'&&e.ninho>0){tryIt({k:'evNinho',o:e},e.x,e.z,2.4,1.8,-0.5);}
  else if(e.tipo==='comboio'){for(const c of e.caixas)if(!(c.aberta&&c.itens&&!c.itens.some(Boolean)))tryIt({k:'evCaixaComboio',o:c},c.x,c.z,1.9,2,-0.6);}}});
const temMachado=()=>{for(const s of P.inv)if(s&&ITEMS[s.id]&&ITEMS[s.id].corta)return s;return null;};
INTER_K.evTronco={texto:t=>temMachado()?{t:'Cortar o tronco caído',s:'segure · '+t.hp+' golpe'+(t.hp>1?'s':''),hold:true,dur:1.6}:{t:'Tronco caído na estrada',s:'precisa de machado'},
  usar:(t,seg)=>{const s=temMachado();if(!s){feed('Precisa de um machado',true);return;}if(!seg)return;gastar(s,3);t.hp--;sfx('madeira',t.x,t.z);lascas(t.x,ground(t.x,t.z)+0.5,t.z,[0.5,0.38,0.24,1]);
    if(t.hp<=0){troncoRemover(t);ganhar('madeira',3);feed('Tronco cortado');}}};
INTER_K.evEsconderijo={texto:e=>({t:e.aberto?'Revistar o esconderijo':'Abrir o alçapão queimado',s:'achado depois do incêndio'}),
  usar:e=>{if(!e.itens){e.itens=new Array(BAU_N).fill(null);let i=0;for(const[id,n,ex]of rollLoot('esconderijo')){if(i>=BAU_N)break;if(ITEMS[id])e.itens[i++]=Object.assign(newItem(id,n),ex||{});}e.aberto=true;ganharXP(25);
    if(typeof diarioDescobre==='function')diarioDescobre('lugar','esconderijo'+e.id,'Esconderijo revelado pelo fogo',10);}
    abrirBau({itens:e.itens,nome:'Esconderijo enterrado',saque:true,aoMudar:()=>{if(!e.itens.some(Boolean)){e.fim='saqueado';e.fimDia=G.dia;}}});}};
INTER_K.evNinho={texto:e=>({t:'Ninho de zumbis',s:(invCount('gasolina')&&(invCount('isqueiro')||invCount('molotov'))?'segure: queimar (1 galão) · ':'')+'bata até destruir · '+e.restantes+' zumbis do ninho',hold:!!(invCount('gasolina')&&(invCount('isqueiro')||invCount('molotov'))),dur:2}),
  usar:(e,seg)=>{if(!seg)return;if(!(invCount('gasolina')&&(invCount('isqueiro')||invCount('molotov'))))return;invRemove('gasolina',1);CHAMAS.push({x:e.x,y:ground(e.x,e.z),z:e.z,r:2.6,t:0,dur:14,rr:0});ninhoFerir(e,999);}};
INTER_K.evCaixaComboio={texto:c=>({t:c.aberta?'Revistar a caixa do comboio':'Abrir a caixa militar do comboio',s:''}),
  usar:c=>{if(!c.itens){c.itens=new Array(BAU_N).fill(null);let i=0;for(const[id,n,ex]of rollLoot('comboio')){if(i>=BAU_N)break;if(ITEMS[id])c.itens[i++]=Object.assign(newItem(id,n),ex||{});}c.aberta=true;ganharXP(10);}
    abrirBau({itens:c.itens,nome:'Caixa do comboio',saque:true,aoMudar:()=>{}});}};
/* ---------- desenho ---------- */
INIT_MALHAS.push(()=>{const R=rng(6060),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());};
  MESH.evTronco=mk(g=>{const L=7,r=0.36;add(g,cylTris(r*0.85,r,L,10,{bottom:true}),alignY(0,0,-L/2,0,0,1),lin(0x5a4430),{j:0.1,rnd:R});add(g,cylTris(r*0.86,r*0.86,0.02,10),alignY(0,0,L/2,0,0,1),lin(0xc8a878),{j:0.06,rnd:R});
    for(let i=0;i<5;i++){const z=-L/2+1+R()*(L-2),a=R()*6.283;add(g,cylTris(0.07,0.03,0.9+R()*0.6,5),alignY(Math.cos(a)*r,Math.sin(a)*r,z,Math.cos(a),Math.abs(Math.sin(a))+0.3,(R()-0.5)*0.4),lin(0x4a3a28),{j:0.1,rnd:R});}
    for(let i=0;i<7;i++)add(g,icoTris(0.45+R()*0.35,0.4,R),mat((R()-0.5)*1.4,0.3+R()*0.9,L/2-0.8-R()*2.6),lin(R()<0.5?0x3a5a2a:0x4a6a32),{j:0.12,rnd:R});});
  MESH.evToco=mk(g=>{add(g,cylTris(0.22,0.28,0.55,8,{top:true}),mat(0,0,0),lin(0x1e1a18),{j:0.1,rnd:R});add(g,cylTris(0.06,0.12,1.4,5),alignY(0.05,0.4,0,0.2,1,0.1),lin(0x161412),{j:0.1,rnd:R});});
  MESH.evNinho=mk(g=>{for(let i=0;i<10;i++){const a=R()*6.283,r=R()*1.1;add(g,icoSubTris(0.35+R()*0.35,0.5,R,1),mat(Math.cos(a)*r,0.2+R()*0.4,Math.sin(a)*r),lin(R()<0.5?0x3a2a24:0x4a3428),{j:0.15,rnd:R});}
    for(let i=0;i<9;i++){const a=R()*6.283;add(g,cylTris(0.03,0.04,0.5+R()*0.4,5),alignY(Math.cos(a)*0.8,0.2,Math.sin(a)*0.8,Math.cos(a+1),0.3,Math.sin(a+1)),lin(0xd8d0b8),{j:0.1,rnd:R});}
    for(let i=0;i<4;i++)add(g,icoTris(0.12,0.3,R),mat((R()-0.5)*1.4,0.15,(R()-0.5)*1.4),lin(0xe0d8c4),{j:0.1,rnd:R});add(g,cylTris(1.6,1.8,0.12,14),mat(0,0,0),lin(0x2a1a14),{j:0.1,rnd:R});});
  const oli=lin(0x4a5236),oli2=lin(0x3c4430),preto=lin(0x1c1c1c);
  MESH.evCaminhao=mk(g=>{add(g,boxTris(2.3,1.3,2.2),mat(0,1.25,2.3),oli,{j:0.04,rnd:R});add(g,boxTris(2.2,0.9,2.0),mat(0,2.3,2.5),oli2,{j:0.04,rnd:R});add(g,boxTris(1.7,0.55,0.06),mat(0,2.25,3.52),lin(0x2a3438),{e:0.02});
    add(g,boxTris(2.3,0.25,5.0),mat(0,0.9,-0.9),oli2);add(g,boxTris(2.3,1.6,4.8,{tx:0.96}),mat(0,1.85,-1.0),lin(0x5a6044),{j:0.06,rnd:R});
    for(const dz of[2.4,-0.6,-2.6])for(const s of[-1,1])add(g,cylTris(0.48,0.48,0.38,12),mm(mat(s*1.05,0.48,dz),mat(0,0,0,0,0,Math.PI/2)),preto);});
  MESH.evJipe=mk(g=>{add(g,boxTris(1.8,0.8,3.6),mat(0,0.85,0),oli,{j:0.04,rnd:R});add(g,boxTris(1.7,0.06,1.0),mat(0,1.6,0.6),oli2);add(g,boxTris(1.6,0.6,0.06),mat(0,1.5,0.9),lin(0x2a3438),{e:0.02});
    for(const dz of[1.2,-1.2])for(const s of[-1,1])add(g,cylTris(0.4,0.4,0.3,12),mm(mat(s*0.92,0.4,dz),mat(0,0,0,0,0,Math.PI/2)),preto);});
  MESH.evCaixa=mk(g=>{add(g,boxTris(1.1,0.7,0.75),mat(0,0.35,0),oli,{j:0.06,rnd:R});add(g,boxTris(1.12,0.08,0.77),mat(0,0.72,0),oli2);add(g,boxTris(0.5,0.12,0.02),mat(0,0.45,0.38),lin(0xd8d0b0));});
  MESH.evAlcapao=mk(g=>{add(g,boxTris(2.6,0.06,2.6),mat(0,0.02,0),lin(0x1e1a18),{j:0.1,rnd:R});add(g,boxTris(1.2,0.1,1.2),mat(0,0.07,0),lin(0x3a2a20),{j:0.1,rnd:R});add(g,boxTris(0.1,0.06,0.4),mat(0.4,0.14,0),lin(0x5a5a58));});});
function evDesenhar(Pg,sombra){const M=G.mundo;if(!M||!MESH.evTronco||cam.pos[1]<SUB_FUNDO)return;const cx=sombra?P.x:cam.pos[0],cz=sombra?P.z:cam.pos[2],lim=sombra?50*50:170*170;
  for(const e of M.ev){if(d2(e.x,e.z,cx,cz)>lim)continue;
    if(e.tipo==='estrada'){for(const t of e.troncos)if(t.hp>0){const g=ground(t.x,t.z);drawStat(Pg,MESH.evTronco,mat(t.x,g+t.r*0.9,t.z,0,t.yaw,0,t.r/0.36,t.r/0.36,t.L/7));}}
    else if(e.tipo==='infestacao'&&e.ninho>0&&!e.fim)drawStat(Pg,MESH.evNinho,mat(e.x,ground(e.x,e.z),e.z));
    else if(e.tipo==='esconderijo')drawStat(Pg,MESH.evAlcapao,mat(e.x,ground(e.x,e.z),e.z));
    else if(e.tipo==='comboio'){for(const v of e.vs){const g=ground(v.x,v.z);drawStat(Pg,v.tipo==='jipe'?MESH.evJipe:MESH.evCaminhao,v.tomb?mm(mat(v.x,g+1.15,v.z,0,v.yaw,0),mat(0,0,0,0,0,Math.PI/2*0.92)):mat(v.x,g,v.z,0,v.yaw,0));}
      if(!sombra)for(const c of e.caixas)if(!(c.aberta&&c.itens&&!c.itens.some(Boolean)))drawStat(Pg,MESH.evCaixa,mat(c.x,ground(c.x,c.z),c.z,0,e.yaw,0));}}
  if(!sombra&&!queimadasSet())for(const q of M.tocos)if(d2(q.x,q.z,cx,cz)<120*120)drawStat(Pg,MESH.evToco,mat(q.x,ground(q.x,q.z),q.z,0,q.x*7%6,0));}
/* v10.2.2 ("olha como fica as árvores quando queimadas"): com a mata de verdade pronta, a árvore queimada fica de pé, carbonizada
   (50_render.js rebuildVeg + 62y mataDistribuir), no lugar do toco com espeto preto; o tronco dela continua sólido */
let QM_SET=null,QM_ASS='';
function queimadasSet(){if(typeof mataLigada!=='function'||!mataLigada()||!mataProntas())return null;const M=G.mundo;if(!M||!Array.isArray(M.tocos))return null;
  let ass=M.tocos.length+':';for(const q of M.tocos)ass+=q.id+',';
  if(ass!==QM_ASS){QM_ASS=ass;QM_SET=new Set(M.tocos.map(q=>q.id));
    for(const id of QM_SET){const t=TREES[id];if(t&&!t.alive&&!t.agua&&!COLL.some(c=>c.queimada===t))colCircle(t.x,t.z,Math.max(0.22,0.3*(t.s||1)),{queimada:t});}}
  return QM_SET;}
DESENHO.opaco.push(Pg=>evDesenhar(Pg,false));DESENHO.sombra.push(Pg=>evDesenhar(Pg,true));
MAPA_DESENHOS.push((g,X,Y,k,n)=>{const M=G.mundo;if(!M)return;const ico=(x,y,cor,f)=>{g.fillStyle=cor;g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1.2;g.beginPath();f(x,y);g.fill();g.stroke();};
  for(const e of M.ev){if(e.fim)continue;const x=X(e.x),y=Y(e.z);
    if(e.tipo==='estrada')ico(x,y,'#e0a040',(x,y)=>{g.rect(x-4,y-1.5,8,3);});
    else if(e.tipo==='infestacao')ico(x,y,'#e3493e',(x,y)=>{g.arc(x,y,4,0,6.283);});
    else if(e.tipo==='comboio')ico(x,y,'#7a8a50',(x,y)=>{g.rect(x-3.5,y-3.5,7,7);});
    else if(e.tipo==='esconderijo')ico(x,y,'#c8a060',(x,y)=>{g.moveTo(x,y-4);g.lineTo(x+4,y+3);g.lineTo(x-4,y+3);g.closePath();});}
  if(M.fogo){const x=X(M.fogo.x),y=Y(M.fogo.z);g.fillStyle='rgba(255,110,40,'+(0.55+0.3*Math.sin(G.t*6))+')';g.beginPath();g.arc(x,y,6,0,6.283);g.fill();}});
CONQ.push({id:'ninho',nome:'Limpa-ninho',desc:'Destrua um ninho de zumbis e limpe a área.'});
if(typeof DIARIO_ICO!=='undefined')DIARIO_ICO.evento='i-alerta';
/* ---------- salvar e carregar ---------- */
V8.novo.mundo=()=>{if(G.mundo)for(const e of G.mundo.ev){if(e.tipo==='estrada')for(const t of e.troncos)troncoRemover(t);if(e.cols)for(const c of e.cols)colRemove(c);}
  G.mundo=mundoNovo();NINHO_Z.clear();COMBOIO_Z.clear();RIO.enchente=0;if(typeof AGUA!=='undefined'&&AGUA&&RIO.enchenteMalha){RIO.enchenteMalha=0;AGUA.rio=aguaMalhaRio();}};
V8.salvar.mundo=()=>{const M=mundoD();return{ev:M.ev.map(e=>{const o=Object.assign({},e);delete o.cols;if(o.troncos)o.troncos=o.troncos.map(t=>({x:t.x,z:t.z,yaw:t.yaw,L:t.L,r:t.r,hp:t.hp}));return o;}),
  cheia:M.cheia,fogo:M.fogo,seco:M.seco,cardume:M.cardume,frutas:M.frutas,id:M.id,tocos:M.tocos};};
V8.carregar.mundo=s=>{V8.novo.mundo();if(!s||typeof s!=='object')return;const M=G.mundo;Object.assign(M,s,{ultTm:null});M.cheia=Object.assign(mundoNovo().cheia,s.cheia||{});M.ev=Array.isArray(s.ev)?s.ev:[];M.tocos=Array.isArray(s.tocos)?s.tocos:[];
  for(const e of M.ev){if(e.tipo==='estrada'&&!e.fim)estradaMontar(e);if(e.tipo==='comboio'&&!(e.fim&&G.dia-(e.fimDia||0)>=1))comboioMontar(e);}
  if(M.fogo){for(const id of M.fogo.ids){const t=TREES[id];if(t&&t.alive)arvoreComFogo(t,8+Math.random()*10);}}
  RIO.enchente=M.cheia.nivel||0;if(typeof AGUA!=='undefined'&&AGUA){RIO.enchenteMalha=RIO.enchente;AGUA.rio=aguaMalhaRio();}};
