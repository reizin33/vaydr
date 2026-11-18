/* ================= LAN de teste (v10.4.0, 18/11/2026) =================
   Pedido do Himalaia: "crie o LAN para mim testar com os amigos hoje" (antes da fundação do multiplayer, que vem depois).
   Um abre a partida pelo .exe (o servidor fica dentro do próprio jogo: desktop/lan.js) e os amigos entram com o IP dele, na
   mesma rede ou pelo Radmin VPN. Nesta primeira versão, o que é de todos:
   · todo mundo se vê andando, com o nome em cima: cada um aparece com o personagem que criou (corpo, rosto, cabelo, altura) e a
     roupa que está vestindo, com as animações do jogador;
   · a hora do dia e a chuva são as do anfitrião;
   · os ZUMBIS são os mesmos para todos: o jogo do anfitrião decide (nascem, andam, caçam quem estiver mais perto, batem em
     quem estiver do lado); nos convidados eles são bonecos que repetem o que o anfitrião manda, e o golpe, o tiro ou a flecha de
     qualquer um vai para o anfitrião, que aplica;
   · bate-papo: Enter abre a caixa de texto.
   O que ainda é de cada um: baús, portas, construções, itens no chão, animais, carros e o dia (cada mundo segue no seu dia e
   salva normal). Quando o anfitrião abre a mochila, o mapa ou a pausa, o mundo dele (os zumbis) continua andando.
   Protocolo (JSON) no cabeçalho do desktop/lan.js. */
const LAN={on:false,papel:'',ws:null,id:0,anfId:0,nome:'',jog:new Map(),zMap:new Map(),status:'',erro:'',ips:[],porta:47811,hostNome:'',orig:null,alvo:null,visualK:'',visualT:0,
  chat:[],tRede:null,ultMundo:0,ultRender:0,info:{enviados:0,recebidos:0,hits:0,danos:0}};
const LAN_CORES=[[0x8a2f22,0x2a3a5a],[0x2f5a8a,0x3a3028],[0x4a6a2a,0x2a2a30],[0xc9a227,0x3a4a6a],[0x6a2a6a,0x2a2a2a],[0x2a7a7a,0x4a3a2a],[0xb8642a,0x2a3a2a]];
const lanVersao=()=>(window.vaydrPC&&vaydrPC.versao)||'dev';
const lanNoMundo=()=>G.modo!=='menu'&&G.modo!=='criacao'&&G.modo!=='carregando';
function lanMandar(o){const ws=LAN.ws;if(ws&&ws.readyState===1){ws.send(JSON.stringify(o));LAN.info.enviados++;}}

/* ---------- conectar e desligar ---------- */
function lanConectar(url,papel){lanDesligar(true);LAN.papel=papel;LAN.status='Conectando…';LAN.erro='';
  let ws;try{ws=new WebSocket(url);}catch(e){LAN.erro='Endereço inválido.';LAN.papel='';lanTela();return;}
  LAN.ws=ws;lanTela();
  const espera=setTimeout(()=>{if(LAN.ws===ws&&!LAN.on){LAN.erro='Não achei a partida nesse IP. Confira o número, se vocês estão na mesma rede (ou no Radmin) e se o Windows de quem abriu liberou o VAYDR.';try{ws.close();}catch(_){}lanDesligar(true);lanTela();}},12000);
  ws.onopen=()=>{ws.send(JSON.stringify({t:'oi',nome:LAN.nome||'Jogador',papel,versao:lanVersao()}));};
  ws.onmessage=e=>{if(LAN.ws!==ws)return;let m;try{m=JSON.parse(e.data);}catch(_){return;}LAN.info.recebidos++;try{lanReceber(m);}catch(err){console.error('lan',err);}};
  ws.onclose=()=>{clearTimeout(espera);if(LAN.ws!==ws)return;const era=LAN.on;lanDesligar(true);if(era)toast('alerta','A conexão da partida em rede caiu.');lanTela();};
  ws.onerror=()=>{};
  if(!LAN.tRede)LAN.tRede=setInterval(lanRede,100);}
function lanDesligar(quieto){const ws=LAN.ws;LAN.ws=null;if(ws)try{ws.close();}catch(_){}
  const eraAnf=LAN.papel==='anfitriao';LAN.on=false;LAN.id=0;LAN.anfId=0;LAN.papel='';LAN.hostNome='';
  for(const id of[...LAN.jog.keys()])lanJogTirar(id);
  for(let i=Z.length-1;i>=0;i--)if(Z[i].lan)Z.splice(i,1);LAN.zMap.clear();
  lanRestaura();if(eraAnf&&window.vaydrPC&&vaydrPC.lanParar)vaydrPC.lanParar();
  if(!quieto)LAN.status='';lanHud();lanTela();}
/* abrir a partida (só no .exe: o servidor fica no aplicativo) */
async function lanHospedar(){if(!(window.vaydrPC&&vaydrPC.lanHospedar)){LAN.erro='Abrir a partida só funciona no jogo de PC (.exe).';lanTela();return;}
  LAN.erro='';LAN.status='Abrindo a partida…';lanTela();
  let r=null;try{r=await vaydrPC.lanHospedar(LAN.porta);}catch(e){r={ok:false,erro:String(e&&e.message||e)};}
  if(!r||!r.ok){LAN.status='';LAN.erro='Não deu para abrir a partida: '+((r&&r.erro)||'erro desconhecido')+'.';lanTela();return;}
  LAN.ips=(r.ips||[]).map(q=>q.ip);lanConectar('ws://127.0.0.1:'+r.porta,'anfitriao');}
function lanEntrar(txt){txt=String(txt||'').trim().replace(/^ws:\/\//,'').replace(/\/.*$/,'');
  if(!/^[\w.-]+(:\d{2,5})?$/.test(txt)){LAN.erro='Digite o IP que aparece na tela de quem abriu a partida (por exemplo 192.168.0.12).';lanTela();return;}
  try{store.set('vaydr_lan_ip',txt);}catch(_){}lanConectar('ws://'+(txt.includes(':')?txt:txt+':'+LAN.porta),'convidado');}

/* ---------- mensagens que chegam ---------- */
function lanReceber(m){switch(m.t){
  case'recusa':LAN.erro=m.motivo||'A partida recusou a entrada.';lanTela();break;
  case'bemvindo':LAN.on=true;LAN.id=m.id;LAN.anfId=m.anfitriaoId;LAN.status=LAN.papel==='anfitriao'?'Partida aberta':'Conectado';LAN.erro='';
    if(LAN.papel==='convidado')lanLimpaZumbisLocais();lanTela();lanHud();sfx('missao');break;
  case'lista':{const vistos=new Set();for(const j of m.jogadores||[]){vistos.add(j.id);if(j.anfitriao)LAN.hostNome=j.nome;if(j.id===LAN.id)continue;
      let q=LAN.jog.get(j.id);if(!q){q=lanJogNovo(j);LAN.jog.set(j.id,q);lanChatAdd(null,j.nome+' entrou na partida.');LAN.visualT=0;}q.nome=j.nome;q.anf=!!j.anfitriao;}
    for(const id of[...LAN.jog.keys()])if(!vistos.has(id))lanJogTirar(id);lanTela();lanHud();break;}
  case'saiu':if(m.anfitriao&&LAN.papel==='convidado'){toast('alerta',(m.nome||'O anfitrião')+' fechou a partida. Seu mundo segue sozinho.');lanDesligar(false);break;}
    if(LAN.jog.has(m.id)){lanJogTirar(m.id);lanChatAdd(null,(m.nome||'Alguém')+' saiu.');lanHud();}break;
  case'eu':{const q=LAN.jog.get(m.de);if(q)lanJogEstado(q,m);break;}
  case'visual':{const q=LAN.jog.get(m.de);if(!q)break;const k=JSON.stringify([m.ap||null,m.roupa||{}]);if(k!==q.visualK){q.visualK=k;q.ap=m.ap||null;q.roupa=m.roupa||{};q.tipoOk=false;}break;}
  case'mundo':if(LAN.papel==='convidado')lanMundo(m);break;
  case'dano':if(LAN.papel==='convidado'&&lanNoMundo()&&P.alive){LAN.info.danos++;ferirJogador(+m.d||0,typeof m.x==='number'?{x:m.x,z:m.z}:null);}break;
  case'hitZ':if(LAN.papel==='anfitriao'){const z=Z.find(q=>q.id===m.id);if(z&&z.vivo){LAN.info.hits++;ferirZ(z,clamp(+m.d||0,0,500),+m.kx||0,+m.kz||0,!!m.f);}}break;
  case'chat':{const q=LAN.jog.get(m.de);lanChatAdd(q?q.nome:'?',String(m.txt||'').slice(0,160));sfx('clique');break;}}}

/* ---------- o que cada um manda, 10 vezes por segundo ---------- */
function lanRede(){if(!LAN.on)return;
  const no=lanNoMundo()&&!!P.ch;
  lanMandar(no?{t:'eu',m:1,x:+P.x.toFixed(2),y:+P.y.toFixed(2),z:+P.z.toFixed(2),r:+(P.body??P.yaw??0).toFixed(2),vx:+(P.vx||0).toFixed(2),vz:+(P.vz||0).toFixed(2),ar:P.noChao||P.voo?0:1,
    a:P.agachado?1:0,g:P.acao?(P.acao.tipo==='tiro'?2:P.acao.tipo==='golpe'?1:0):0,vivo:P.alive?1:0,c:CARRO&&CARRO.ativo?1:0,i:(selItem&&selItem()||{}).id||''}:{t:'eu',m:0});
  // o personagem que a pessoa criou (corpo, rosto, cabelo, altura) e a roupa que está vestindo: quando muda e de 5 em 5 s
  if(no){const v=lanMeuVisual(),k=JSON.stringify(v);LAN.visualT-=0.1;if(k!==LAN.visualK||LAN.visualT<=0){LAN.visualK=k;LAN.visualT=5;lanMandar(Object.assign({t:'visual'},v));}}
  if(LAN.papel==='anfitriao'&&no)lanMandaMundo();}
function lanMeuVisual(){let ap=null;try{ap=typeof mhAp==='function'?mhAp():(G.aparencia||(MESH.jogador&&MESH.jogador.ap));ap=ap?aparLimpa(ap):null;}catch(_){}
  const R=P.roupa||{},roupa={};for(const k in R)if(typeof R[k]==='string'&&R[k])roupa[k]=R[k];return{ap,roupa};}
const LAN_ST_MANDA=new Set(['golpe','grito','sobe','dorme','morrendo','morto','sumindo','quebra']);
function lanMandaMundo(){const perto=[[P.x,P.z]];for(const q of LAN.jog.values())if(q.m&&q.ok)perto.push([q.tx,q.tz]);
  const L=[];for(const z of Z){if(z.lan)continue;let ok=false;for(const p of perto)if(Math.abs(p[0]-z.x)<150&&Math.abs(p[1]-z.z)<150){ok=true;break;}if(!ok)continue;
    L.push([z.id,z.tipo,+z.x.toFixed(2),+z.y.toFixed(2),+z.z.toFixed(2),+(z.ch.yaw||0).toFixed(2),LAN_ST_MANDA.has(z.st)?z.st:'',z.vivo?1:0,+(z.hp/(z.hpMax||1)).toFixed(2)]);}
  lanMandar({t:'mundo',h:+G.hora.toFixed(3),c:+(G.chuva||0).toFixed(2),ca:+(G.chuvaAlvo||0).toFixed(2),z:L});}

/* ---------- convidado: o mundo do anfitrião ---------- */
function lanLimpaZumbisLocais(){for(let i=Z.length-1;i>=0;i--)if(!Z[i].lan)Z.splice(i,1);}
{const _cz=criarZ;criarZ=function(){if(LAN.on&&LAN.papel==='convidado'&&!LAN.criando)return null;return _cz.apply(this,arguments);};}   // o convidado não cria zumbi: vêm do anfitrião
function lanMundo(m){LAN.ultMundo=performance.now();if(!lanNoMundo())return;
  if(typeof m.h==='number')G.hora=m.h;if(typeof m.c==='number'){G.chuva=m.c;G.chuvaAlvo=m.ca??m.c;}
  const vistos=new Set();
  for(const e of m.z||[]){const[id,tipo,x,y,zz,yaw,st,vivo,hp]=e;if(!ZS[tipo])continue;vistos.add(id);let z=LAN.zMap.get(id);if(z&&Z.indexOf(z)<0)z=null;
    if(!z&&!vivo)continue;   // já morto no anfitrião: não nasce boneco só para morrer
    if(!z){LAN.criando=true;try{z=criarZ(tipo,x,zz,{y,st:'lan',lan:true,lanId:id});}finally{LAN.criando=false;}if(!z)continue;z.ch.yaw=yaw;LAN.zMap.set(id,z);z.lanStAnt='';}
    z.lanH={x,y,z:zz,yaw,st:st||'',vivo:!!vivo};z.hpMax=Math.max(1,z.hpMax||1);z.hp=Math.max(1,z.hpMax*(hp||0.01));}
  for(const[id,z]of[...LAN.zMap]){if(vistos.has(id))continue;LAN.zMap.delete(id);const i=Z.indexOf(z);if(i>=0)Z.splice(i,1);}}
/* um zumbi-boneco, no começo de cada passo dele (40_game: updateZombies) */
function lanZBoneco(z,dt){const h=z.lanH;if(!h)return;z.ouvir=null;z.viu=0;z.desvio=0;
  const st=h.st;
  if(!h.vivo||st==='morrendo'||st==='morto'||st==='sumindo'){if(z.vivo){z.vivo=false;z.st='morrendo';z.t=0;sfx('morteZ',z.x,z.z,0.8,z.tipo);}z.lanStAnt=st;return;}
  if(!z.vivo){z.vivo=true;z.st='lan';z.sink=0;z.ch.pitch=0;z.ch.roll=0;}   // morreu só aqui (espeto, queda): no anfitrião está vivo
  if(st==='golpe'){if(z.lanStAnt!=='golpe'){z.st='golpe';z.t=0;z.bateu=false;z.mira='p';}else if(z.st!=='golpe')z.st='lan';}
  else if(st==='sobe'){if(z.lanStAnt!=='sobe'){z.st='sobe';z.t=0;}}
  else if(st==='grito'){if(z.lanStAnt!=='grito'){z.st='grito';z.t=0;z.gritou=false;}else if(z.st!=='grito')z.st='lan';}
  else if(st==='dorme')z.st='dorme';
  else z.st='lan';
  z.lanStAnt=st;z.lanPose=st==='quebra'?'quebra':'';if(z.lanPose)z.ph+=(dt||0.016)*5.5;
  const dx=h.x-z.x,dz=h.z-z.z,d=Math.hypot(dx,dz);
  if(d>5||(z.st!=='lan'&&d>1.2)){z.x=h.x;z.z=h.z;z.y=h.y;z.ch.x=z.x;z.ch.z=z.z;}   // longe demais (ou parado num golpe): pula para o lugar
  z.lanTx=h.x;z.lanTz=h.z;z.lanSpd=d<0.12?0:Math.min(Math.max(d*4,0.7),9);
  if(z.lanSpd===0)z.ch.yaw=angLerp(z.ch.yaw,h.yaw,0.25);}
/* golpe, tiro ou flecha num boneco: quem aplica é o anfitrião */
{const _fz=ferirZ;ferirZ=function(z,dmg,kx,kz,forte){if(z&&z.lan){if(!LAN.on||!(dmg>0)||!z.vivo)return;z.flash=0.15;z.flinch=0.32;
    try{sangue(z.x,z.y+1.2*(z.ch.s||1),z.z,6,(kx||kz)?norm([kx,0.25,kz]):null,dmg>60);}catch(_){}
    lanMandar({t:'hitZ',id:z.lanId,d:Math.round(dmg*10)/10,kx:+(kx||0).toFixed(2),kz:+(kz||0).toFixed(2),f:forte?1:0});return;}
  return _fz.apply(this,arguments);};}

/* ---------- anfitrião: o zumbi caça quem estiver mais perto ---------- */
/* no passo de cada zumbi, se um convidado está mais perto que o anfitrião, o "jogador" daquele passo é o convidado (o resto do
   código do zumbi continua o mesmo); o golpe nele vira uma mensagem de dano para o jogo dele */
function lanZAlvo(z){const o=LAN.orig||(LAN.orig={x:P.x,y:P.y,z:P.z,alive:P.alive,agK:P.agK});
  let best=null,bd=o.alive?Math.hypot(o.x-z.x,o.z-z.z)-0.3:1e9;
  for(const q of LAN.jog.values()){if(!q.m||!q.ok||!q.vivo||q.c||Math.abs(q.ty-z.y)>6)continue;const d=Math.hypot(q.tx-z.x,q.tz-z.z);if(d<bd){bd=d;best=q;}}   // posição que chegou pela rede (a do desenho anda atrás)
  if(best){P.x=best.tx;P.y=best.ty;P.z=best.tz;P.alive=true;P.agK=best.a?1:0;LAN.alvo=best;}
  else if(LAN.alvo){P.x=o.x;P.y=o.y;P.z=o.z;P.alive=o.alive;P.agK=o.agK;LAN.alvo=null;}}
function lanRestaura(){const o=LAN.orig;if(o){P.x=o.x;P.y=o.y;P.z=o.z;P.alive=o.alive;P.agK=o.agK;}LAN.orig=null;LAN.alvo=null;}
function lanZAntes(z,dt){if(z.lan){if(LAN.papel==='convidado')lanZBoneco(z,dt);return;}if(LAN.papel==='anfitriao'&&LAN.jog.size)lanZAlvo(z);}
{const _uz=updateZombies;updateZombies=function(){try{return _uz.apply(this,arguments);}finally{if(LAN.orig)lanRestaura();}};}
{const _zb=zBateu;zBateu=function(z,emJogador){return _zb.call(this,z,emJogador&&!LAN.alvo);};}   // mordida e sangramento de golpe no convidado não ficam no anfitrião
{const _fj=ferirJogador;ferirJogador=function(d,src){if(LAN.alvo){const q=LAN.alvo;lanMandar({t:'dano',para:q.id,d:Math.round(d*10)/10,x:src?+src.x.toFixed(1):undefined,z:src?+src.z.toFixed(1):undefined});return;}
  return _fj.apply(this,arguments);};}
/* com a partida aberta, o mundo do anfitrião não para na mochila, no mapa ou na pausa (os amigos continuam jogando) */
function lanMundoSegue(dt){if(!LAN.on||LAN.papel!=='anfitriao'||!LAN.jog.size)return;if(!['mochila','mapa','pausa','diario','estacao','veiculo','grupo','teclado','doc'].includes(G.modo))return;
  try{updateClock(dt);updateZombies(dt);}catch(e){console.error('lan',e);}}

/* ---------- os outros jogadores: boneco, nome e animação ---------- */
function lanJogNovo(j){const k=LAN.jog.size;return{id:j.id,nome:j.nome,anf:!!j.anfitriao,ch:null,x:0,y:0,z:0,r:0,tx:0,ty:0,tz:0,tr:0,v:0,a:0,g:0,vivo:1,m:0,ok:false,t:0,
  ph:0,amp:0,i:k+2,sentado:0,golpeT:0,tiroT:0,def:{arma:'machado'},cor:LAN_CORES[(j.id*3+1)%LAN_CORES.length],tag:null};}
function lanJogTirar(id){const q=LAN.jog.get(id);if(!q)return;if(q.tag)q.tag.remove();LAN.jog.delete(id);if(LAN.alvo===q)lanRestaura();}
function lanJogEstado(q,m){q.t=performance.now();q.m=m.m?1:0;if(!q.m)return;
  q.tx=+m.x||0;q.ty=+m.y||0;q.tz=+m.z||0;q.tr=+m.r||0;q.vx=+m.vx||0;q.vz=+m.vz||0;q.v=Math.hypot(q.vx,q.vz);q.ar=m.ar?1:0;q.a=m.a?1:0;q.vivo=m.vivo?1:0;q.c=m.c?1:0;
  if(m.g&&!q.g){if(m.g===2)q.tiroT=0.45;else q.golpeT=0.5;}q.g=m.g||0;q.def.arma=/arco/i.test(m.i||'')?'arco':'machado';
  if(!q.ok){q.x=q.tx;q.y=q.ty;q.z=q.tz;q.r=q.tr;q.ok=true;}}
/* o boneco de cada um é o personagem que a pessoa criou: o mesmo corpo do MakeHuman (62zb: homem ou mulher, pele, olhos,
   sobrancelha, cabelo, barba), a altura escolhida e as roupas 3D e cascas que ela está vestindo; anda com as animações do
   sobrevivente (as mesmas do jogador). Se a aparência ainda não chegou (ou o corpo for o clássico antigo), fica o sobrevivente. */
function lanTipoDe(q){if(!q.ap||typeof mhTipo!=='function'||typeof mhUsa!=='function')return null;let t=null;
  try{if(!mhUsa(q.ap))return null;const R0=P.roupa;P.roupa=q.roupa||{};try{t=mhTipo(q.ap);}finally{P.roupa=R0;}}catch(e){console.error('lan: personagem',e);t=null;}
  return t&&t.pronto?t:null;}
function lanBoneco(q){if(typeof MESH==='undefined'||!MESH.surv)return q.ch;
  if(!q.ch){q.ch=newChar(MESH.surv,0.98);q.ch.tint=[1,1,1];q.tipoOk=false;}
  const ch=q.ch,agora=performance.now();
  // de vez em quando (e quando a aparência ou a roupa mudam) confere o tipo: mantém o corpo dele no guarda-volumes do 62zb
  if(!q.tipoOk||agora-(q.tipoT||0)>3000){q.tipoT=agora;const t=lanTipoDe(q),sv=typeof SKT!=='undefined'&&SKT.surv&&SKT.surv.pronto?SKT.surv:null,alvo=t||sv;
    if(alvo&&(!ch.sk||ch.sk.t!==alvo)){ch.sk=skNovo(alvo);ch.gt=null;}
    const ap=q.ap||{},alt=(typeof APAR!=='undefined'&&APAR.alturas[ap.altura??2])||1;
    if(t){ch.mh=true;ch.s=alt*MH_ALT[t.mh.g]/(t.alt||1.8);}else if(alvo===sv&&sv){ch.mh=false;ch.s=alt*SURV_ALT/(sv.alt||1.82);}else ch.s=0.98;
    // cascas (gorro, luvas, cinto...): a mesma regra do jogador (skCascas), desenhadas como as dos sobreviventes
    const TAB=(ch.sk&&ch.sk.t&&ch.sk.t.cascas)||(typeof SK_CASCAS!=='undefined'?SK_CASCAS:{}),L=[];
    for(const sl of(typeof ROUPA_SLOTS!=='undefined'?ROUPA_SLOTS:[])){const id=(q.roupa||{})[sl],c=id&&TAB[id];if(c)for(const k of c)L.push(k);}
    ch.roupas=L.length?L:null;q.tipoOk=!!t||!q.ap;}
  return ch;}
/* locomoção pelos clipes do sobrevivente (a mesma mistura do 62z: survLoco), com a velocidade que chega pela rede */
function lanLoco(q,ch,dt){const s=ch.sk;if(!s||!s.t||!s.t.pronto||typeof survSoma!=='function'||typeof SKA==='undefined'||!SKA.sParado||s.t===SKT.akai)return false;
  if(!s.loco)s.loco={D:new Float32Array(SK_N*4),m:new Float32Array(SK_N).fill(1),w:0,hy:0,hx:0,hz:0,hyJogo:0,n:0};
  const L=s.loco;L.w=approach(L.w,q.vivo&&!q.c?1:0,dt*6);if(L.w<=0.001)return true;
  const esc=s.t.hip/SKT.akai.hip,k=1/(ch.s||1)/esc,b=q.r,vx=q.vx||0,vz=q.vz||0,sp=Math.hypot(vx,vz)*k;
  const fr=(vx*Math.sin(b)+vz*Math.cos(b))*k,lat=(vx*Math.cos(b)-vz*Math.sin(b))*k;
  survZerar(L);q.faseP=(q.faseP||0)+dt;
  if(q.ar&&sp<6)survSoma(L,'sCaindo',q.faseP%survDur('sCaindo'),1);
  else{const ag=q.a,nP=ag?'sAgachado':'sParado',wMov=smooth(0.18,0.75,sp);let lista;
    if(ag)lista=[['sAgachadoAnda',1]];
    else{const ang=Math.atan2(lat,fr),af=Math.abs(ang),wF=clamp(1-af/(Math.PI/2),0,1),wT=clamp((af-Math.PI/2)/(Math.PI/2),0,1),wL=1-wF-wT,lado=ang>0?'sLadoE':'sLadoD';
      const wRun=smooth(1.6,3.0,sp),wSpr=smooth(4.6,5.8,sp),fw=wF*(1-wRun),fc=wF*wRun*(1-wSpr),fs=wF*wRun*wSpr;
      lista=[['sAnda',fw],['sCorre',fc],['sDispara',fs],[lado,wL*(1-wRun*0.5)],['sCorre',wL*wRun*0.5],['sAndaTras',wT]];}
    let soma=0,ciclo=0;for(const[n,w]of lista){if(w<=0)continue;soma+=w;ciclo+=w*survCiclo(n);}ciclo=soma>0?ciclo/soma:1;
    q.fase=((q.fase||0)+dt*Math.max(sp,0.35)/ciclo)%1;
    survSoma(L,nP,q.faseP%survDur(nP),1-wMov);for(const[n,w]of lista)if(w>0.001)survSoma(L,n,q.fase*survDur(n),wMov*w/Math.max(soma,1e-6));}
  for(let i=0;i<SK_N;i++)L.m[i]=1;
  if(q.golpeT>0||q.tiroT>0)for(let i=SKI.LeftShoulder;i<=SKI.RightHand;i++)L.m[i]=0;   // golpeando ou atirando: os braços ficam com a pose do jogo
  L.hyJogo=0;return true;}
function lanAnima(dt){const agora=performance.now();
  for(const q of LAN.jog.values()){const ch=lanBoneco(q);if(!ch)continue;const vivo=q.m&&q.ok&&agora-q.t<4000;ch.vis=vivo&&d2(q.x,q.z,cam.pos[0],cam.pos[2])<130*130;if(!vivo)continue;
    const d=Math.hypot(q.tx-q.x,q.tz-q.z);if(d>8){q.x=q.tx;q.z=q.tz;q.y=q.ty;}else{const k=1-Math.exp(-dt*10);q.x+=(q.tx-q.x)*k;q.z+=(q.tz-q.z)*k;q.y+=(q.ty-q.y)*k;}
    q.r=angLerp(q.r,q.tr,1-Math.exp(-dt*12));
    const v=q.c?0:q.v;if(v>0.3){q.amp=approach(q.amp,v>3.6?1:0.75,dt*4);q.ph+=dt*(v>3.6?11:7.5)*Math.min(1,v/2+0.3);}else q.amp=approach(q.amp,0,dt*5);
    q.golpeT=Math.max(0,q.golpeT-dt);q.tiroT=Math.max(0,q.tiroT-dt);
    ch.x=q.x;ch.y=q.y;ch.z=q.z;ch.yaw=q.r;ch.roll=0;
    if(!q.vivo){ch.pitch=-1.45;ch.y=q.y+0.12;poseLoco(ch.r,0,0,0,false);if(ch.sk&&ch.sk.loco)ch.sk.loco.w=0;continue;}
    ch.pitch=0;try{poseSobrev(q,q.golpeT>0?'golpe':q.tiroT>0?'mira':q.a?'agacha':'pe',dt);}catch(_){poseLoco(ch.r,q.ph,q.amp,G.t+q.i,q.amp>0.85);}
    try{lanLoco(q,ch,dt);}catch(e){console.error('lan: animação',e);}}}
{const _cs=charsSobrev;charsSobrev=function(chars){_cs.apply(this,arguments);for(const q of LAN.jog.values())if(q.ch&&q.ch.vis)chars.push(q.ch);};}
/* nomes em cima de cada um */
const LAN_V4=new Float32Array(4);
function lanNomes(){const box=$('lan-nomes');if(!box)return;const W_=innerWidth,H_=innerHeight,mostra=LAN.on&&lanNoMundo()&&G.modo!=='foto';
  for(const q of LAN.jog.values()){if(!q.tag){q.tag=document.createElement('div');q.tag.className='lan-tag'+(q.anf?' anf':'');box.appendChild(q.tag);}
    q.tag.textContent=q.nome+(q.vivo?'':' (caído)');
    if(!mostra||!q.ch||!q.ch.vis){q.tag.hidden=true;continue;}
    const x=q.x,y=q.y+2.05,z=q.z,M=VP;const cx=M[0]*x+M[4]*y+M[8]*z+M[12],cy=M[1]*x+M[5]*y+M[9]*z+M[13],cw=M[3]*x+M[7]*y+M[11]*z+M[15];
    if(cw<0.2){q.tag.hidden=true;continue;}const sx=(cx/cw*0.5+0.5)*W_,sy=(1-(cy/cw*0.5+0.5))*H_;if(sx<-60||sx>W_+60||sy<-30||sy>H_+30){q.tag.hidden=true;continue;}
    q.tag.hidden=false;q.tag.style.transform='translate('+Math.round(sx)+'px,'+Math.round(sy)+'px) translate(-50%,-100%)';
    const dd=Math.hypot(x-cam.pos[0],z-cam.pos[2]);q.tag.style.opacity=String(clamp(1.25-dd/90,0.35,1));}}
{const _r=render;render=function(){const t=performance.now(),dt=Math.min(0.1,(t-(LAN.ultRender||t))/1000);LAN.ultRender=t;
  if(LAN.on&&LAN.jog.size)try{lanAnima(dt);}catch(e){console.error('lan',e);}
  const r=_r.apply(this,arguments);if(LAN.on)try{lanNomes();}catch(e){}return r;};}

/* ---------- bate-papo e o quadrinho da partida no jogo ---------- */
function lanChatAdd(nome,txt){LAN.chat.push({nome,txt,t:performance.now()});if(LAN.chat.length>40)LAN.chat.shift();lanHud();}
function lanHud(){const el=$('lan-hud');if(!el)return;el.hidden=!LAN.on;if(!LAN.on)return;
  const nomes=[LAN.nome+(LAN.papel==='anfitriao'?' (você, anfitrião)':' (você)')];for(const q of LAN.jog.values())nomes.push(q.nome+(q.anf?' (anfitrião)':''));
  $('lan-hud-topo').textContent='Em rede · '+nomes.length+(nomes.length>1?' jogando':' jogando (esperando os amigos)');$('lan-hud-nomes').textContent=nomes.join(' · ');
  const L=$('lan-hud-chat');L.textContent='';const agora=performance.now(),abre=!$('lan-chat-in').hidden;
  for(const c of LAN.chat.slice(-7)){if(!abre&&agora-c.t>14000)continue;const p=document.createElement('p');if(c.nome){const b=document.createElement('b');b.textContent=c.nome+': ';p.appendChild(b);}else p.className='sis';
    p.appendChild(document.createTextNode(c.txt));L.appendChild(p);}}
setInterval(()=>{if(LAN.on)lanHud();},2000);
function lanChatAbrir(){const i=$('lan-chat-in');i.hidden=false;i.value='';i.focus();lanHud();}
function lanChatFechar(){const i=$('lan-chat-in');i.hidden=true;i.blur();lanHud();}
window.addEventListener('keydown',e=>{if(!LAN.on||G.modo!=='jogo'||e.repeat)return;if(e.code!=='Enter'&&e.code!=='NumpadEnter')return;if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName||''))return;e.preventDefault();lanChatAbrir();});

/* ---------- a tela do Multiplayer (lobby) ---------- */
{const st=document.createElement('style');st.textContent=`
#lan-nomes{position:fixed;inset:0;pointer-events:none;z-index:4;overflow:hidden}
.lan-tag{position:absolute;left:0;top:0;font:700 13px/1.1 var(--f-ui);color:#ece4d2;background:rgba(10,14,12,.62);padding:3px 8px;border-radius:3px;white-space:nowrap;text-shadow:0 1px 2px #000;will-change:transform}
.lan-tag.anf::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#ff8a3d;margin-right:6px;vertical-align:1px}
#lan-hud{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:calc(92px + env(safe-area-inset-bottom,0px));width:min(330px,40vw);z-index:5;display:grid;gap:4px;pointer-events:none;font:600 13px/1.35 var(--f-ui);color:#e8e4d8}
#lan-hud-topo{font:800 11px/1 var(--f-ui);letter-spacing:.12em;text-transform:uppercase;color:#8fcaff}
#lan-hud-nomes{color:#c3c7bb;font-size:12px}
#lan-hud-chat p{margin:0;padding:3px 8px;background:rgba(10,14,12,.6);border-radius:3px;text-shadow:0 1px 2px #000;overflow-wrap:anywhere}
#lan-hud-chat p.sis{color:#a8bfd3;font-style:italic}
#lan-hud-chat b{color:#ffcf8a}
#lan-chat-in{pointer-events:auto;font:600 14px/1.2 var(--f-ui);padding:8px 10px;border-radius:4px;border:1px solid rgba(143,202,255,.6);background:rgba(10,14,12,.88);color:#ece4d2;outline:none}
.mp-lan{display:grid;gap:14px}
.mp-lan .mp-op{border-style:solid}
.mp-lan label{display:grid;gap:6px;font:700 13px/1.2 var(--f-ui);color:#a8bfd3}
.mp-lan input{font:600 16px/1.2 var(--f-ui);padding:10px 12px;border-radius:6px;border:1px solid rgba(143,202,255,.35);background:rgba(8,12,17,.7);color:#e4f2ff;min-width:0}
.mp-lan .mp-linha{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.mp-lan .mp-linha input{flex:1 1 160px}
.mp-ips{display:grid;gap:4px;font:700 15px/1.35 var(--f-ui);color:#e4f2ff}.mp-ips small{font:600 12px/1.35 var(--f-ui);color:#a8bfd3}
.mp-ips code{font:800 20px/1.2 ui-monospace,Consolas,monospace;color:#ffcf8a;letter-spacing:.02em;user-select:all}
.mp-estado{min-height:1.4em;font:700 14px/1.45 var(--f-ui);color:#cfe7ff}.mp-estado.erro{color:#ffb4a0}
.mp-jog{display:flex;flex-wrap:wrap;gap:6px}.mp-jog span{padding:4px 10px;border-radius:999px;background:rgba(98,184,255,.16);font:700 13px/1.2 var(--f-ui);color:#e4f2ff}
.mp-acoes{display:flex;gap:10px;flex-wrap:wrap}`;document.head.appendChild(st);}
{document.body.insertAdjacentHTML('beforeend','<div id="lan-nomes" aria-hidden="true"></div><div id="lan-hud" hidden><div id="lan-hud-topo"></div><div id="lan-hud-nomes"></div><div id="lan-hud-chat"></div>'+
   '<input id="lan-chat-in" type="text" maxlength="160" placeholder="Mensagem para a partida (Enter manda, Esc fecha)" autocomplete="off" hidden></div>');
 const ci=$('lan-chat-in');
 ci.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();const t=ci.value.trim();if(t){lanMandar({t:'chat',txt:t.slice(0,160)});lanChatAdd(LAN.nome,t.slice(0,160));}lanChatFechar();}
   else if(e.key==='Escape'){e.preventDefault();lanChatFechar();}});
 ci.addEventListener('blur',()=>{if(!ci.hidden)setTimeout(()=>{if(document.activeElement!==ci)lanChatFechar();},50);});}
{const esq=document.querySelector('#t-multi .mp-esq');if(esq){esq.innerHTML='<span class="vl-tag">Teste de LAN</span><h3>Jogar junto</h3>'+
  '<p>Um abre a partida e os amigos entram com o IP dele, na mesma rede ou pelo Radmin VPN. Vocês se veem, conversam (Enter), ficam na mesma hora e no mesmo clima, e os <b>zumbis são os mesmos para todos</b>: o jogo de quem abriu decide. Baús, portas, construções e itens ainda são de cada um.</p>'+
  '<div class="mp-lan"><label>Seu nome na partida<input id="lan-nome" maxlength="20" autocomplete="off"></label>'+
  '<div class="mp-ops"><div class="mp-op"><b>Abrir a partida e chamar os amigos</b><span>O seu mundo vira o da partida. Se o Windows perguntar, clique em Permitir.</span>'+
  '<div class="mp-linha"><button class="btn prim" id="lan-hospedar" type="button">Abrir a partida</button></div><div class="mp-ips" id="lan-ips" hidden></div></div>'+
  '<div class="mp-op"><b>Entrar na partida de um amigo</b><span>Digite o IP que aparece na tela de quem abriu.</span>'+
  '<div class="mp-linha"><input id="lan-ip" placeholder="192.168.0.12" inputmode="decimal" autocomplete="off"><button class="btn" id="lan-entrar" type="button">Entrar</button></div></div></div>'+
  '<div class="mp-estado" id="lan-estado" role="status"></div><div class="mp-jog" id="lan-jog"></div>'+
  '<div class="mp-acoes"><button class="btn prim" id="lan-jogar" type="button" hidden>Escolher o mundo e jogar</button><button class="btn" id="lan-sair" type="button" hidden>Sair da partida</button></div></div>'+
  '<p class="mp-nota">Teste: cada um entra com o próprio personagem, a sua mochila e o seu mundo (que salva normal). O dia de cada mundo continua o seu.</p>';}
 // o painel do lobby (montado no 62t): deixa de dizer "Em breve"
 const pan=document.querySelector('.vl-pan[data-k="multi"]');if(pan){const tg=pan.querySelector('.vl-tag');if(tg)tg.textContent='Teste de LAN';
   const ms=pan.querySelector('.vl-mais');if(ms)ms.innerHTML='<span>Abrir a partida e chamar os amigos</span><span>Entrar na partida de um amigo</span>';}
 const mb=$('m-multi');if(mb&&typeof VL_SETA!=='undefined')mb.innerHTML='Jogar junto'+VL_SETA;}
function lanTela(){const e=$('lan-estado');if(!e)return;const ni=$('lan-nome');if(ni&&document.activeElement!==ni)ni.value=LAN.nome;
  e.className='mp-estado'+(LAN.erro?' erro':'');e.textContent=LAN.erro||(LAN.on?(LAN.papel==='anfitriao'?'Partida aberta. Agora escolha o mundo e jogue: os amigos entram quando quiserem.':'Você entrou na partida de '+(LAN.hostNome||'um amigo')+'. Agora escolha um mundo seu e jogue.'):LAN.status);
  const ips=$('lan-ips');if(ips){const mostra=LAN.on&&LAN.papel==='anfitriao';ips.hidden=!mostra;
    if(mostra)ips.innerHTML='<small>Seus amigos digitam:</small>'+(LAN.ips.length?LAN.ips.map(ip=>'<code>'+ip+'</code>').join(''):'<code>(sem rede: conecte o PC na rede ou no Radmin)</code>')+'<small>No Radmin, use o IP que começa com 26.</small>';}
  const j=$('lan-jog');if(j){j.textContent='';if(LAN.on){const L=[LAN.nome+' (você)'];for(const q of LAN.jog.values())L.push(q.nome+(q.anf?' (abriu)':''));for(const n of L){const s=document.createElement('span');s.textContent=n;j.appendChild(s);}}}
  const pc=!!(window.vaydrPC&&vaydrPC.lanHospedar),h=$('lan-hospedar');if(h){h.disabled=LAN.on||!pc;h.title=pc?'':'Só no jogo de PC (.exe)';}
  const en=$('lan-entrar');if(en)en.disabled=LAN.on;const ip=$('lan-ip');if(ip)ip.disabled=LAN.on;
  const jg=$('lan-jogar'),sa=$('lan-sair');if(jg)jg.hidden=!LAN.on;if(sa)sa.hidden=!LAN.on&&!LAN.ws;}
{try{LAN.nome=(typeof PERFIL!=='undefined'&&PERFIL&&PERFIL.nome)||store.get('vaydr_lan_nome')||'';}catch(_){}
 const ni=$('lan-nome');if(ni){ni.addEventListener('input',()=>{LAN.nome=ni.value.replace(/[<>]/g,'').slice(0,20);try{store.set('vaydr_lan_nome',LAN.nome);}catch(_){}});ni.addEventListener('keydown',e=>e.stopPropagation());}
 const ip=$('lan-ip');if(ip){try{ip.value=store.get('vaydr_lan_ip')||'';}catch(_){}ip.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();$('lan-entrar').click();}});}
 const nomeOk=()=>{if(!LAN.nome.trim())LAN.nome=(typeof PERFIL!=='undefined'&&PERFIL&&PERFIL.nome)||'Jogador';return true;};
 if($('lan-hospedar'))$('lan-hospedar').addEventListener('click',()=>{sfx('clique');nomeOk();lanHospedar();});
 if($('lan-entrar'))$('lan-entrar').addEventListener('click',()=>{sfx('clique');nomeOk();lanEntrar($('lan-ip').value);});
 if($('lan-sair'))$('lan-sair').addEventListener('click',()=>{sfx('clique');lanDesligar(false);});
 if($('lan-jogar'))$('lan-jogar').addEventListener('click',()=>{sfx('clique');const b=$('m-sozinho');if(b)b.click();});
 {const mm=$('m-multi');if(mm)mm.addEventListener('click',()=>{if(!LAN.nome&&typeof PERFIL!=='undefined'&&PERFIL)LAN.nome=PERFIL.nome||'';lanTela();});}}
lanTela();
