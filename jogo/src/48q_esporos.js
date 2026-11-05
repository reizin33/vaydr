/* ================= mata hostil, esporos e o capítulo 5 (Projeto Esporo) =================
   A mata hostil nasce nos lugares abandonados (torre de rádio, vila, posto, mina, periferia da cidade, celeiro velho) e cresce
   em cima das obras que você larga por dias. Três plantas: bulbo de esporos (solta uma nuvem que pesa no pulmão), trepadeira
   (prende os pés: anda mais devagar) e espinheiro (corta quem passa). Cada uma cresce em três fases (broto, jovem, adulta)
   a cada manhã; as adultas brotam mudas em volta. Fogo (molotov, fogueira por perto) mata e impede que ela chegue;
   facão, machado e faca cortam e dão fibra hostil e bulbo seco.
   Esporos: na nuvem e no laboratório a barra sobe (bandana segura um pouco, máscara de pano mais, máscara de gás quase tudo);
   a partir de 30% você tosse (faz barulho), a partir de 60% a vista fica turva e acima de 75% a vida cai. Longe da nuvem
   a barra baixa sozinha; o chá de bulbo e o remédio ajudam. Zumbis que andam na mata ficam "esporados": mais resistentes.
   Capítulo 5: depois da vacina, a Dra. Helena descobre o Projeto Esporo. O caminho passa pelo bunker, pela estação escondida
   e pelo laboratório embaixo da torre. No núcleo, a escolha: queimar (a mata seca e morre; o laboratório pega fogo e você
   precisa sair) ou colher a cepa (a centrífuga da base faz um soro: os esporos não pegam mais em você, mas a mata continua).
   Cada escolha tem o seu final, com o resumo da partida, e depois dá para continuar jogando. */
const ESP={max:90,focoMax:16,espalha:0.28,cresce:0.5,raio:[2.4,7.5],nuvem:4.4,expoS:6.5,recS:1.1,minDist:1.8,
  focos:[{id:'torre',nome:'Torre de rádio',x:-46,z:-104,r:15,ini:10,max:22},{id:'vila',nome:'Vila',x:62,z:-72,r:19,ini:7},{id:'posto',nome:'Posto de gasolina',x:94,z:-14,r:11,ini:4},
    {id:'mina',nome:'Mina velha',x:-82,z:-90,r:9,ini:4},{id:'periferia',nome:'Periferia da cidade',x:164,z:-66,r:12,ini:5},{id:'celeiro',nome:'Celeiro velho',x:-88,z:74,r:8,ini:3},{id:'trem',nome:'Trem abandonado',x:36,z:-57,r:7,ini:3}]};
const ESP_T={
  bulbo:{nome:'Bulbo de esporos',hp:[12,30,55],r:0.55,rende:[{},{bulboSeco:1},{bulboSeco:1,fibraHostil:1}],peso:0.4},
  trepadeira:{nome:'Trepadeira hostil',hp:[10,24,40],r:1.35,lento:0.6,rende:[{},{fibraHostil:1},{fibraHostil:3}],peso:0.35},
  espinheiro:{nome:'Espinheiro',hp:[12,30,48],r:0.85,fere:5,rende:[{},{fibraHostil:1},{fibraHostil:2}],peso:0.25}};
iconesNovos({
  'i-esporo':'<circle cx="12" cy="12" r="3"/><circle cx="5" cy="7" r="1.5"/><circle cx="19" cy="6" r="1.2"/><circle cx="18" cy="17" r="1.6"/><circle cx="6" cy="18" r="1.1"/><path d="M12 9V4M15 12h4M12 15v4M9 12H5"/>',
  'i-bulbo':'<path d="M12 21v-6M12 15c-4 0-6-3-6-6a6 6 0 0 1 12 0c0 3-2 6-6 6Z"/><circle cx="10" cy="9" r=".8"/><circle cx="14" cy="10" r=".8"/>',
  'i-fibra-h':'<path d="M4 20c4-6 6-10 8-16M8 20c2-5 5-8 9-11M14 20c1-3 3-5 6-6"/>'});
Object.assign(ITEMS,{
  fibraHostil:{nome:'Fibra hostil',icon:'i-fibra-h',max:30,tipo:'material',desc:'Fibra dura da mata hostil. Três fazem uma corda boa.'},
  bulboSeco:{nome:'Bulbo seco',icon:'i-bulbo',max:12,tipo:'material',desc:'Bulbo de esporos cortado e murcho. Fervido na fogueira com água vira um chá que limpa o pulmão.'},
  chaBulbo:{nome:'Chá de bulbo',icon:'i-agua',max:6,tipo:'bebida',sede:14,desc:'Chá amargo de bulbo fervido. Baixa bastante os esporos no pulmão.'},
  mascaraPano:{nome:'Máscara de pano com carvão',icon:'i-pano',max:1,tipo:'roupa',slot:'rosto',mat:'tecido',esporos:0.62,peso:0.08,durMax:70,desc:'Pano dobrado com carvão moído no meio. Filtra boa parte dos esporos.'},
  cepa:{nome:'Cepa viva',icon:'i-cepa',max:1,tipo:'util',desc:'Uma amostra viva do núcleo do Projeto Esporo numa garrafa. Na centrífuga da base vira um soro.'},
  soroEsporo:{nome:'Soro contra esporos',icon:'i-seringa',max:3,tipo:'cura',vida:10,desc:'Feito da cepa na centrífuga. Uma dose: os esporos não pegam mais em você.'}});
RECIPES.push(
  {faz:'corda',n:1,nome:'Corda (de fibra hostil)',custo:{fibraHostil:3},cat:'materiais',etapa:1,est:0,desb:{item:'fibraHostil'}},
  {faz:'mascaraPano',n:1,custo:{pano:2,carvao:2,linha:1},cat:'roupas',etapa:1,est:0,desb:{item:'bulboSeco'}},
  {faz:'chaBulbo',n:1,custo:{bulboSeco:1,agua:1},cat:'cura',etapa:1,est:'fogo',desb:{item:'bulboSeco'}});
const ESP_PL=[];   // plantas vivas: {t,x,z,e,hp,f,yaw,s,obra}
function espD(){if(!G.esp)G.esp=espNovo();return G.esp;}
function espNovo(){return{nucleo:null,soro:false,expo:0,cap5:{ativo:false,espera:0,fim:false,escolha:null,centrif:null},fogoLab:null,mortas:0,cortadas:0,queimadas:0};}
/* ---------- onde a mata pode nascer ---------- */
function espPontoOk(x,z,dmin){if(Math.hypot(x,z)>MAP_R-6)return false;if(dentroCidade(x,z,1)||ruralCasaEm(x,z,0.6))return false;
  if(RIO.ok){const n=aguaNivel(x,z);if(n!==null&&n>ground(x,z)-0.15)return false;}
  if(pointBlocked(x,z,0.6))return false;if(d2(x,z,FIRE[0],FIRE[2])<26*26)return false;
  for(const f of FIRES)if(!f.lamp&&!f.eletrica&&d2(x,z,f.x,f.z)<14*14)return false;
  for(const p of ESP_PL)if(d2(p.x,p.z,x,z)<(dmin||ESP.minDist)**2)return false;
  return true;}
function espTipoSorteio(R){R=R||Math.random;let t=R()*(ESP_T.bulbo.peso+ESP_T.trepadeira.peso+ESP_T.espinheiro.peso);for(const k in ESP_T){t-=ESP_T[k].peso;if(t<=0)return k;}return'bulbo';}
function espNova(t,x,z,e,f,obra){const p={t,x,z,e,hp:ESP_T[t].hp[e],f:f||null,yaw:Math.random()*6.283,s:0.85+Math.random()*0.3,obra:obra||null};ESP_PL.push(p);return p;}
function espSemear(){ESP_PL.length=0;const R=rng(4417+Math.floor(Math.random()*1e6));
  for(const F of ESP.focos)for(let i=0,k=0;i<F.ini&&k<F.ini*12;k++){const a=R()*6.283,r=Math.sqrt(R())*F.r,x=F.x+Math.cos(a)*r,z=F.z+Math.sin(a)*r;if(!espPontoOk(x,z))continue;
    espNova(espTipoSorteio(R),x,z,R()<0.55?2:1,F.id);i++;}}
function espFocoDe(x,z){for(const F of ESP.focos)if(Math.hypot(x-F.x,z-F.z)<F.r+10)return F;return null;}
/* ---------- crescer, espalhar e tomar as obras largadas (a cada manhã) ---------- */
function espAmanhece(){const D=espD();if(!ESP_PL.length&&!D.semeou)return;
  if(D.nucleo==='queimado'){for(let i=ESP_PL.length-1;i>=0;i--){const p=ESP_PL[i];p.e--;if(p.e<0){ESP_PL.splice(i,1);D.mortas++;}else p.hp=Math.min(p.hp,ESP_T[p.t].hp[p.e]);}return;}
  const novas=[];
  for(const p of ESP_PL){if(p.e<2&&Math.random()<ESP.cresce){p.e++;p.hp=ESP_T[p.t].hp[p.e];}
    if(p.e===2&&Math.random()<ESP.espalha&&ESP_PL.length+novas.length<ESP.max){const F=p.f?ESP.focos.find(f=>f.id===p.f):null;
      if(F&&ESP_PL.filter(q=>q.f===F.id).length+novas.filter(q=>q.f===F.id).length>=(F.max||ESP.focoMax))continue;
      for(let k=0;k<8;k++){const a=Math.random()*6.283,r=ESP.raio[0]+Math.random()*(ESP.raio[1]-ESP.raio[0]),x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;
        if(!espPontoOk(x,z)||novas.some(q=>d2(q.x,q.z,x,z)<ESP.minDist**2))continue;novas.push({t:espTipoSorteio(),x,z,f:p.f});break;}}}
  for(const q of novas)espNova(q.t,q.x,q.z,0,q.f);
  // obras largadas (ninguém passa perto há 3 dias e sem fogo por perto): a trepadeira toma conta e vai estragando (até a metade)
  for(const o of OB){if(!o.ext||o.tipo==='fogueira'||o.tipo==='geradorBase'||o.tipo==='torreVigia'||o.tipo==='poste')continue;const v=o.ext.visto??G.dia;if(G.dia-v<3)continue;
    if(d2(o.x,o.z,FIRE[0],FIRE[2])<26*26)continue;let fogo=false;for(const f of FIRES)if(!f.lamp&&d2(o.x,o.z,f.x,f.z)<14*14){fogo=true;break;}if(fogo)continue;
    const tem=ESP_PL.find(p=>p.obra===o.id);
    if(tem){if(tem.e<2){tem.e++;tem.hp=ESP_T.trepadeira.hp[tem.e];}o.hp=Math.max(o.hpMax*0.5,o.hp-o.hpMax*0.1);o.ext.mata=true;continue;}
    if(Math.random()<0.3&&ESP_PL.length<ESP.max){const a=Math.random()*6.283;espNova('trepadeira',o.x+Math.cos(a)*0.6,o.z+Math.sin(a)*0.6,0,null,o.id);o.ext.mata=true;}}}
AMANHECE.push(espAmanhece);
/* quem passa perto da obra "visita" ela (a mata só toma o que ficou largado) */
let espVisT=0;
PASSOS.push(dt=>{espVisT-=dt;if(espVisT>0)return;espVisT=2;for(const o of OB){if(!o.ext)continue;if(d2(o.x,o.z,P.x,P.z)<30*30&&Math.abs((o.y||0)-P.y)<15)o.ext.visto=G.dia;}});
/* ---------- cortar e queimar ---------- */
function espPlantaFrente(alc,fx,fz){let best=null,bd=1e9;for(const p of ESP_PL){const dx=p.x-P.x,dz=p.z-P.z,dd=Math.hypot(dx,dz),r=ESP_T[p.t].r*(0.5+0.25*p.e)*p.s;
    if(dd>alc+r||(dd>0.4&&(dx*fx+dz*fz)/dd<0.25))continue;if(Math.abs(ground(p.x,p.z)-P.y)>1.6)continue;if(dd<bd){bd=dd;best=p;}}return best;}
GOLPE_ALVOS.push((s,d,fx,fz)=>{const p=espPlantaFrente((d.alcance||1.7)+0.2,fx,fz);if(!p)return false;
  const dano=(d.dano||9)*(d.corta?1.6:d.lamina||ITEMS[s&&s.id]&&ITEMS[s.id].esfola?1.3:0.6);espFerir(p,dano,'corte');return true;});
function espFerir(p,dano,como){p.hp-=dano;sfx('galho',p.x,p.z);lascas(p.x,ground(p.x,p.z)+0.5,p.z,[0.28,0.36,0.16,1],5);
  if(p.t==='bulbo'&&p.e===2&&como==='corte'&&espD().nucleo!=='queimado'){espNuvemParticulas(p,10);const d=Math.hypot(p.x-P.x,p.z-P.z);if(d<2.6)espExpor(9*(1-d/2.6));}
  if(p.hp<=0)espMorre(p,como);}
function espMorre(p,como){const i=ESP_PL.indexOf(p);if(i<0)return;ESP_PL.splice(i,1);const D=espD();
  if(como==='fogo'){D.queimadas++;for(let k=0;k<8;k++)part(p.x+(Math.random()-0.5),ground(p.x,p.z)+0.3+Math.random(),p.z+(Math.random()-0.5),(Math.random()-0.5)*0.6,0.8+Math.random(),(Math.random()-0.5)*0.6,1.6,0.22,[0.2,0.18,0.16,0.5],false,-0.4);return;}
  D.cortadas++;const R=ESP_T[p.t].rende[p.e]||{};for(const id in R)ganhar(id,R[id]);if(p.e>0)ganharXP(3+p.e*2);
  if(typeof diarioConta==='function')diarioConta('mataCortada',1);if(p.obra)feed('Você limpou a mata da sua obra');}
/* ---------- esporos no ar e no pulmão ---------- */
function espIntensidade(x,y,z){const D=espD();let v=0;
  if(y<SUB_FUNDO){const s=salaSubEm(x,y+0.3,z);if(s&&s.esporos&&D.nucleo!=='queimado')v=s.esporos*(D.nucleo==='colhido'?0.75:1);return Math.min(1,v);}
  if(D.nucleo==='queimado')return 0;
  for(const p of ESP_PL){if(p.t!=='bulbo'||p.e<1)continue;const r=(p.e===2?ESP.nuvem:ESP.nuvem*0.55)*p.s,dx=p.x-x,dz=p.z-z;if(Math.abs(dx)>r||Math.abs(dz)>r)continue;const d=Math.hypot(dx,dz);if(d<r)v=Math.max(v,(1-d/r)*(p.e===2?1:0.5));}
  return Math.min(1,v);}
function espProtecao(){return clamp(typeof esporosRoupa==='function'?esporosRoupa():0,0,0.97);}
function espExpor(v){const D=espD();if(D.soro)v*=0.05;P.esporo=clamp((P.esporo||0)+v*(1-espProtecao()),0,100);}
let espTosseT=4,espAvisou=0,espPartT=0,espZT=0,espLentoT=0,espFereT=0;
PASSOS.push(dt=>{if(!P.alive){P.lentoMata=1;return;}const D=espD(),k=espIntensidade(P.x,P.y,P.z);
  if(k>0.02){const v=dt*ESP.expoS*k*(P.correndo?1.35:1);espExpor(v);
    // o filtro da máscara gasta devagar na nuvem
    if(P.roupa&&P.roupa.rosto&&typeof roupaInfoDe==='function'){const I=roupaInfoDe('rosto');if(I&&I.dur>0)I.dur=Math.max(0,I.dur-dt*0.05*k);}
    if(!espAvisou&&k>0.15){espAvisou=1;dica('esporos','corpo','Esporos! A barra verde sobe na nuvem da mata hostil. Bandana ou máscara no rosto seguram; longe da nuvem ela baixa sozinha.');}}
  else P.esporo=Math.max(0,(P.esporo||0)-dt*ESP.recS*(abrigado()?1.4:1));
  D.expo=P.esporo;
  // tosse (faz barulho), vista turva e o pulmão pesando
  if(P.esporo>=30){espTosseT-=dt;if(espTosseT<=0){espTosseT=(P.esporo>70?4:8)+Math.random()*6;sfx('tosse');barulho(P.x,P.z,10,true);if(espAvisou<2){espAvisou=2;feed('Tossindo: tem esporo no pulmão',true);}}}
  if(P.esporo>=75){P.vida-=dt*(P.esporo>=99?0.9:0.35);if(P.vida<=0){G.causa='esporos';morrer();}}
  // mata no chão: trepadeira prende, espinheiro corta (só na superfície)
  espLentoT-=dt;if(espLentoT<=0){espLentoT=0.15;let lento=1,fere=0;if(P.y>SUB_FUNDO&&!CARRO.ativo)for(const p of ESP_PL){if(p.e<1)continue;const T=ESP_T[p.t],r=T.r*(0.55+0.25*p.e)*p.s;if(Math.abs(p.x-P.x)>r||Math.abs(p.z-P.z)>r)continue;
      if(Math.hypot(p.x-P.x,p.z-P.z)<r){if(T.lento)lento=Math.min(lento,p.e===2?T.lento:0.8);if(T.fere)fere=Math.max(fere,T.fere*(p.e===2?1:0.5));}}
    P.lentoMata=lento;espFereT-=0.15;if(fere&&espFereT<=0&&(Math.hypot(P.vx||0,P.vz||0)>0.5||IN.mx||IN.mz)){espFereT=0.8;ferirJogador(fere*(1-0.5*(typeof protecao==='function'?protecao():0)),null);feed('Os espinhos cortam',true);}}
  // fogo mata a mata (molotov, chamas da tempestade)
  for(const c of CHAMAS){if((c.k??1)<0.05&&c.t>0.5)continue;for(let i=ESP_PL.length-1;i>=0;i--){const p=ESP_PL[i];if(d2(p.x,p.z,c.x,c.z)<(c.r+0.9)**2&&Math.abs(c.y-ground(p.x,p.z))<3){p.hp-=dt*45;if(p.hp<=0)espMorre(p,'fogo');}}}
  // partículas da nuvem
  espPartT-=dt;if(espPartT<=0){espPartT=0.25;if(D.nucleo!=='queimado'){if(P.y>SUB_FUNDO){for(const p of ESP_PL)if(p.t==='bulbo'&&p.e===2&&d2(p.x,p.z,P.x,P.z)<40*40&&Math.random()<0.6)espNuvemParticulas(p,1);}
      else{const s=salaSubEm(P.x,P.y+0.3,P.z);if(s&&s.esporos>0.2)for(let i=0;i<Math.ceil(s.esporos*3);i++)part(P.x+(Math.random()-0.5)*9,P.y+0.3+Math.random()*2.4,P.z+(Math.random()-0.5)*9,(Math.random()-0.5)*0.3,0.05,(Math.random()-0.5)*0.3,4,0.06+Math.random()*0.05,[0.72,0.86,0.34,0.5],true,0);}}}
  // zumbis que andam na mata ficam esporados (mais vida, cor esverdeada)
  espZT-=dt;if(espZT<=0){espZT=1;if(D.nucleo!=='queimado')for(const z of Z){if(!z.vivo||z.espChk)continue;z.espChk=true;let perto=z.y<SUB_FUNDO?(()=>{const s=salaSubEm(z.x,z.y+0.3,z.z);return!!(s&&s.esporos>0.2);})():false;
      if(!perto)for(const p of ESP_PL)if(p.e===2&&d2(p.x,p.z,z.x,z.z)<12*12){perto=true;break;}
      if(perto&&!ZS[z.tipo].chefe&&z.tipo!=='colosso'){z.esporado=true;z.hp*=1.35;z.hpMax*=1.35;z.tint=[0.8,1.02,0.66];}}}});
function espNuvemParticulas(p,n){const g=ground(p.x,p.z);for(let i=0;i<n;i++){const a=Math.random()*6.283,r=Math.random()*ESP.nuvem*0.7;
  part(p.x+Math.cos(a)*r*0.4,g+0.7+Math.random()*0.6,p.z+Math.sin(a)*r*0.4,Math.cos(a)*0.35,0.12+Math.random()*0.2,Math.sin(a)*0.35,4.5,0.1+Math.random()*0.08,[0.74,0.86,0.36,0.42],true,0);}}
/* chá e remédio limpam o pulmão; o soro deixa imune */
USO_EXTRA.push((id)=>{if(id==='chaBulbo'){P.esporo=Math.max(0,(P.esporo||0)-45);feed('O chá aliviou o pulmão');}else if(id==='remedios'&&(P.esporo||0)>0){P.esporo=Math.max(0,P.esporo-20);}
  else if(id==='soroEsporo'){const D=espD();P.esporo=0;if(!D.soro){D.soro=true;feed('Soro tomado: os esporos não pegam mais em você');if(typeof diarioEvento==='function')diarioEvento('Tomou o soro contra esporos','missao');
    if(!D.cap5.fim)setTimeout(()=>mostrarFimEsporo('cepa'),2500);}}});
/* ---------- interface: chip e vista turva ---------- */
HUDS.push(()=>{const v=P.esporo||0,el=$('vx-esporo');if(el){const on=v>=1;if(el.hidden===on)el.hidden=!on;if(on){const b=el.querySelector('b'),t=Math.round(v)+'%';if(b.textContent!==t)b.textContent=t;el.classList.toggle('alto',v>=75);}}
  const tv=$('esporo-tela');if(tv){const o=v<45?0:Math.min(0.75,(v-45)/55*0.75);if(o<0.01){if(!tv.hidden)tv.hidden=true;}else{tv.hidden=false;tv.style.opacity=o.toFixed(3);}}});
/* ---------- desenho ---------- */
INIT_MALHAS.push(()=>{const R=rng(5150),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());};
  MESH.espBulbo=mk(g=>{for(let i=0;i<5;i++){const a=i/5*6.283+R()*0.4;add(g,cylTris(0.035,0.06,0.7,5),alignY(Math.cos(a)*0.05,0,Math.sin(a)*0.05,Math.cos(a),0.25,Math.sin(a)),lin(0x3a3424),{j:0.12,rnd:R});}
    add(g,cylTris(0.07,0.11,0.62,7),mat(0,0,0),lin(0x4a5a2a),{j:0.08,rnd:R});
    add(g,icoSubTris(0.36,0.25,R,2),mat(0,0.86,0,0,0,0,1,1.22,1),lin(0x5e6a2c),{j:0.14,rnd:R});for(let i=0;i<7;i++){const a=i/7*6.283;add(g,boxTris(0.03,0.62,0.03),mm(mat(Math.cos(a)*0.33,0.86,Math.sin(a)*0.33,0,-a,0),mat(0,0,0,0,0,0.25)),lin(0x5a2a4a),{j:0.1,rnd:R});}
    for(let i=0;i<9;i++){const a=R()*6.283,h=0.62+R()*0.5,rr=0.3+0.06*Math.sin(h*4);add(g,icoTris(0.05+R()*0.04,0.3,R),mat(Math.cos(a)*rr,h,Math.sin(a)*rr),lin(0xc8e070),{e:1.3,j:0.1,rnd:R});}
    for(let i=0;i<6;i++){const a=i/6*6.283;add(g,boxTris(0.16,0.02,0.5,{tx:0.4}),mm(mat(Math.cos(a)*0.22,0.06,Math.sin(a)*0.22,0,-a+Math.PI/2,0),mat(0,0,0,0.35,0,0)),lin(0x34482a),{j:0.12,rnd:R});}
    for(let i=0;i<4;i++){const a=R()*6.283;add(g,icoSubTris(0.1,0.3,R,1),mat(Math.cos(a)*0.38,0.95+R()*0.25,Math.sin(a)*0.38),lin(0x7a8a3a),{j:0.1,rnd:R});}});
  MESH.espTrepa=mk(g=>{for(let i=0;i<16;i++){const a=R()*6.283,l=0.6+R()*0.9,x0=Math.cos(a)*R()*0.3,z0=Math.sin(a)*R()*0.3,x1=x0+Math.cos(a)*l,z1=z0+Math.sin(a)*l;
      add(g,cylTris(0.025,0.04,l,5),alignY(x0,0.04,z0,x1-x0,0.08*(R()-0.3),z1-z0),lin(R()<0.5?0x3a4a28:0x4a3444),{j:0.1,rnd:R});
      for(let k=0;k<3;k++){const t=0.3+k*0.25;add(g,boxTris(0.12,0.015,0.08),mat(x0+(x1-x0)*t,0.08,z0+(z1-z0)*t,0,R()*6,0),lin(0x2e4a26),{j:0.15,rnd:R});}}
    for(let i=0;i<6;i++){const a=R()*6.283,r=R()*1.0;add(g,icoTris(0.05,0.3,R),mat(Math.cos(a)*r,0.08,Math.sin(a)*r),lin(0xb0d060),{e:0.9,j:0.1,rnd:R});}
    for(let i=0;i<5;i++){const a=R()*6.283,r=0.2+R()*0.5;add(g,cylTris(0.02,0.04,0.35+R()*0.3,5),alignY(Math.cos(a)*r,0,Math.sin(a)*r,(R()-0.5)*0.6,1,(R()-0.5)*0.6),lin(0x4a3444),{j:0.1,rnd:R});}});
  MESH.espEspinho=mk(g=>{for(let i=0;i<10;i++){const a=i/10*6.283+R()*0.5,l=0.7+R()*0.6,dx=Math.cos(a)*0.6,dz=Math.sin(a)*0.6,dy=0.7+R()*0.5,L=Math.hypot(dx,dy,dz);
      add(g,cylTris(0.02,0.045,l,5),alignY(0,0,0,dx,dy,dz),lin(0x4a2a24),{j:0.12,rnd:R});
      for(let k=1;k<5;k++){const t=k/5*l/L,px=dx*t,py=dy*t,pz=dz*t;add(g,cylTris(0,0.018,0.09,4),alignY(px,py,pz,-dz+(R()-0.5),0.3,dx+(R()-0.5)),lin(0x8a6a50),{j:0.1,rnd:R});}}
    for(let i=0;i<5;i++)add(g,icoTris(0.05,0.3,R),mat((R()-0.5)*0.9,0.5+R()*0.6,(R()-0.5)*0.9),lin(0x6a1a2a),{j:0.1,rnd:R});});});
const ESP_MALHA={bulbo:'espBulbo',trepadeira:'espTrepa',espinheiro:'espEspinho'},ESP_ESC=[0.42,0.72,1];
function espDesenhar(Pg,sombra){if(!MESH.espBulbo||!ESP_PL.length||cam.pos[1]<SUB_FUNDO)return;const D=espD(),seca=D.nucleo==='queimado',lim=sombra?40*40:140*140,cx=sombra?P.x:cam.pos[0],cz=sombra?P.z:cam.pos[2];
  if(seca&&!sombra)gl.uniform3f(Pg.u.uTint,0.62,0.5,0.38);
  for(const p of ESP_PL){if(d2(p.x,p.z,cx,cz)>lim)continue;const s=ESP_ESC[p.e]*p.s,b=p.t==='bulbo'&&!seca?1+0.03*Math.sin(G.t*1.7+p.x):1;
    drawStat(Pg,MESH[ESP_MALHA[p.t]],mat(p.x,ground(p.x,p.z)-0.02,p.z,0,p.yaw,0,s,s*b,s));}
  if(seca&&!sombra)gl.uniform3f(Pg.u.uTint,1,1,1);}
DESENHO.opaco.push(Pg=>espDesenhar(Pg,false));DESENHO.sombra.push(Pg=>espDesenhar(Pg,true));
MAPA_DESENHOS.push((g,X,Y,k,n)=>{if(!ESP_PL.length)return;g.fillStyle=espD().nucleo==='queimado'?'rgba(120,96,60,.6)':n>0.5?'rgba(110,150,50,.55)':'rgba(140,190,60,.6)';
  for(const p of ESP_PL){if(p.e<1)continue;g.beginPath();g.arc(X(p.x),Y(p.z),p.e===2?2.2:1.4,0,6.283);g.fill();}});
/* ---------- capítulo 5: Projeto Esporo ---------- */
const CAP5_FALAS={
  a:'Aqui é a Helena. Lendo os papéis da base eu achei uma coisa pior que o vírus: o Projeto Esporo. Aquela mata estranha que cresce nas casas abandonadas não é natural.',
  b:'Tem um bunker embaixo da Base Militar, um alçapão perto da tenda branca. Os militares tinham um laboratório embaixo da torre de rádio. Leve máscara: os esporos pesam no pulmão.',
  nucleo:'Você chegou no núcleo? Então a decisão é sua. Queimar acaba com a mata hostil. Colher a cepa me deixa fazer um soro, mas a mata continua viva.',
  queimou:'Eu vi a fumaça subindo da torre... Saia daí agora! O laboratório inteiro vai pegar fogo.',
  cepa:'Você colheu a cepa? Leve para a centrífuga da base. Ela precisa do gerador da base com gasolina e roda até o amanhecer.',
  soro:'O soro está pronto na centrífuga. Tome uma dose: os esporos não vão mais pegar em você.'};
function cap5Radio(k,atraso){setTimeout(()=>{toast('radio',CAP5_FALAS[k]);sfx('missao');},atraso||0);}
let cap5T=0;
PASSOS.push(dt=>{const D=espD(),C=D.cap5;if(G.modo!=='jogo')return;
  if(!C.ativo&&!C.fim&&G.hist&&G.hist.fim2){C.espera=(C.espera||0)+dt;if(C.espera>40){C.ativo=true;cap5Radio('a');cap5Radio('b',8000);hudMissao(true);if(typeof diarioEvento==='function')diarioEvento('Capítulo 5: Projeto Esporo','missao');}}
  cap5T-=dt;if(cap5T<=0){cap5T=1;if(C.ativo&&!C.avisouNucleo&&cap5Na('Núcleo do Projeto Esporo')){C.avisouNucleo=true;cap5Radio('nucleo',600);hudMissao(true);}}
  // laboratório pegando fogo depois de queimar o núcleo: fumaça e calor até você sair
  const F=D.fogoLab;if(F&&!F.saiu){const L=P.y<SUB_FUNDO&&salaSubEm(P.x,P.y+0.3,P.z);const noLab=L&&(L.c.id==='lab'||L.c.id==='tunel2');
    if(noLab){F.t=(F.t||0)+dt;P.fumaca=Math.min(0.85,Math.max(P.fumaca||0,F.t/60));if(F.t>35)P.vida-=dt*(F.t>75?2.2:0.9);if(P.vida<=0&&P.alive){G.causa='fogo';morrer();}
      if(Math.random()<dt*6)part(P.x+(Math.random()-0.5)*8,Y_SUB+2.6,P.z+(Math.random()-0.5)*8,(Math.random()-0.5)*0.4,-0.05,(Math.random()-0.5)*0.4,3,0.5,[0.12,0.11,0.1,0.45],false,0);}
    else if(P.y>SUB_FUNDO||!noLab){if(P.y>SUB_FUNDO){F.saiu=true;P.fumaca=0;setTimeout(()=>mostrarFimEsporo('queimado'),1800);}}}});
function cap5Na(nome){const S=G.sub;if(!S)return false;const s=SUB.salas.find(q=>q.nome===nome);return!!(s&&S.salaVista&&S.salaVista[s.id]);}
function cap5Info(){const D=G.esp;if(!D)return null;const C=D.cap5;if(!C||!C.ativo)return null;const S=G.sub||{visitou:{},docs:{},abertas:{},salaVista:{}},X=BASEM.x,Zc=BASEM.z;
  if(C.fim)return{n:C.escolha==='queimado'?'Fim · A mata respira':'Fim · A cepa',t:C.escolha==='queimado'?'A mata hostil está secando. Continue sobrevivendo.':'Os esporos não pegam mais em você. Continue sobrevivendo.',alvo:null};
  const n='Capítulo 5 · Projeto Esporo',e=SUB.entradas.find(q=>q.id==='bunker');
  if(D.nucleo==='colhido'){const cf=C.centrif;if(!cf)return{n,t:invCount('cepa')?'Leve a cepa para a centrífuga, na tenda branca da base (o gerador da base precisa de gasolina).':'A cepa ficou para trás: pegue de volta e leve para a centrífuga da base.',alvo:{x:X+4.2,z:Zc+9.6}};
    if(!cf.pronta)return{n,t:'A centrífuga roda até o amanhecer. Não deixe o gerador da base cair.',alvo:{x:X+5,z:Zc-8}};
    return{n,t:invCount('soroEsporo')?'Tome uma dose do soro (mochila ou barra rápida).':'Pegue o soro na centrífuga da base.',alvo:invCount('soroEsporo')?null:{x:X+4.2,z:Zc+9.6}};}
  if(D.nucleo==='queimado')return{n,t:'O laboratório está pegando fogo: saia pela escada da torre ou pelo túnel até a estação.',alvo:null};
  if(!S.visitou.bunker&&!S.visitou.lab)return{n,t:'Ache o alçapão do bunker embaixo da Base Militar, perto da tenda branca.',alvo:{x:e.sup[0],z:e.sup[1]}};
  if(!S.docs.ordem77&&!S.visitou.lab)return{n,t:'No bunker, leia o terminal da sala de comando: ele tem o código do túnel do laboratório.',alvo:{x:-103.6,y:Y_SUB,z:-40.4}};
  if(!cap5Na('Plataforma escondida')&&!S.visitou.lab)return{n,t:'Chegue à estação escondida: ligue o gerador do bunker (1 galão) e siga o túnel de serviço, ou entre pela mina com a chave (abrigo da vila).',alvo:{x:-93,y:Y_SUB,z:-31}};
  const portaLab=SUB.portas.find(d=>d.tranca.tipo==='codigo'&&d.tranca.cod==='lab');
  if(!S.visitou.lab&&!(portaLab&&portaLab.aberta))return{n,t:'Na sala de controle da estação (código do arsenal) fica a porta do túnel do laboratório (código do comando).',alvo:{x:-77,y:Y_SUB,z:-77}};
  if(!cap5Na('Núcleo do Projeto Esporo'))return{n,t:'No laboratório: pegue o cartão no armário da segurança e chegue ao núcleo. Use máscara: o ar está cheio de esporos.',alvo:{x:-36,y:Y_SUB,z:-121}};
  return{n,t:'Decida: queimar o núcleo (2 galões de gasolina e isqueiro) ou colher a cepa viva (garrafa vazia).',alvo:{x:-36,y:Y_SUB,z:-120}};}
/* núcleo: queimar ou colher a cepa */
const NUCLEO={x:-36,z:-122},NUCLEO_Q={x:-36,z:-120.1},NUCLEO_C={x:-37.85,z:-122};
INTERS.push(tryIt=>{if(P.y>SUB_FUNDO)return;const D=espD();if(D.nucleo)return;if(Math.abs(P.x-NUCLEO.x)>5||Math.abs(P.z-NUCLEO.z)>5)return;
  tryIt({k:'nucleoQ',o:NUCLEO_Q},NUCLEO_Q.x,NUCLEO_Q.z,1.9,2.6,-0.5,Y_SUB);tryIt({k:'nucleoC',o:NUCLEO_C},NUCLEO_C.x,NUCLEO_C.z,1.9,2.6,-0.5,Y_SUB);});
const temFogoMao=()=>invCount('isqueiro')>0||invCount('molotov')>0;
INTER_K.nucleoQ={texto:()=>{const ok=invCount('gasolina')>=2&&temFogoMao();return{t:'Queimar o núcleo',s:ok?'segure: 2 galões de gasolina e fogo':'precisa de 2 galões de gasolina e isqueiro (ou molotov)',hold:ok,dur:3};},
  usar:(o,seg)=>{if(!(invCount('gasolina')>=2&&temFogoMao())){feed('Precisa de 2 galões de gasolina e isqueiro (ou um molotov)',true);sfx('vazio');return;}if(!seg)return;nucleoQueimar();}};
INTER_K.nucleoC={texto:()=>{const ok=invCount('garrafa')>0;return{t:'Colher a cepa viva',s:ok?'segure: enche uma garrafa vazia':'precisa de uma garrafa vazia',hold:ok,dur:2.2};},
  usar:(o,seg)=>{if(!invCount('garrafa')){feed('Precisa de uma garrafa vazia',true);sfx('vazio');return;}if(!seg)return;nucleoColher();}};
function nucleoQueimar(){const D=espD();invRemove('gasolina',2);if(!invCount('isqueiro')&&invCount('molotov'))invRemove('molotov',1);D.nucleo='queimado';D.fogoLab={t:0,saiu:false};
  CHAMAS.push({x:NUCLEO.x,y:Y_SUB,z:NUCLEO.z,r:2.4,t:0,dur:90,rr:0});sfx('explosao',NUCLEO.x,NUCLEO.z,0.8);sfx('fogo',NUCLEO.x,NUCLEO.z);ganharXP(250);
  for(const s of SUB.salas)if(s.c.id==='lab'||s.c.id==='tunel2')s.esporos=0;
  if(typeof diarioEvento==='function')diarioEvento('Queimou o núcleo do Projeto Esporo','missao');
  D.cap5.ativo=true;cap5Radio('queimou',800);feed('O núcleo pegou fogo! Saia do laboratório.',true);hudMissao(true);}
function nucleoColher(){const D=espD();invRemove('garrafa',1);ganhar('cepa',1);D.nucleo='colhido';ganharXP(200);sfx('missao');
  if(typeof diarioEvento==='function')diarioEvento('Colheu a cepa viva do núcleo','missao');D.cap5.ativo=true;cap5Radio('cepa',1200);hudMissao(true);}
/* centrífuga da base: cepa → soro (roda até o amanhecer) */
INTERS.push(tryIt=>{const D=espD();if(D.nucleo!=='colhido'||P.y<SUB_FUNDO)return;const X=BASEM.x+4.2,Zc=BASEM.z+9.6;if(Math.abs(P.x-X)>4||Math.abs(P.z-Zc)>4)return;
  const cf=D.cap5.centrif;if(cf&&cf.pegou)return;tryIt({k:'centrifCepa',o:D},X,Zc,2.0,2.8,-0.6);});
INTER_K.centrifCepa={texto:D=>{const cf=D.cap5.centrif,g=typeof geradorBaseObra==='function'?geradorBaseObra():null;
    if(cf&&cf.pronta)return{t:'Pegar o soro contra esporos',s:'3 doses'};if(cf)return{t:'Centrífuga rodando a cepa',s:'pronta ao amanhecer'};
    if(!invCount('cepa'))return{t:'Centrífuga',s:'traga a cepa viva do laboratório'};
    if(!g||(g.ext.comb||0)<0.45)return{t:'Centrífuga sem energia',s:'o gerador da base precisa de gasolina'};return{t:'Carregar a centrífuga com a cepa',s:'roda até o amanhecer'};},
  usar:D=>{const C=D.cap5,cf=C.centrif,g=typeof geradorBaseObra==='function'?geradorBaseObra():null;
    if(cf&&cf.pronta&&!cf.pegou){cf.pegou=true;ganhar('soroEsporo',3);sfx('missao');hudMissao(true);dica('soro','corpo','Use o soro como qualquer remédio (mochila ou barra rápida). Uma dose basta.');return;}if(cf)return;
    if(!invCount('cepa')){feed('Falta a cepa viva',true);return;}if(!g||(g.ext.comb||0)<0.45){feed('Sem energia: ponha gasolina no gerador da base',true);sfx('vazio');return;}
    invRemove('cepa',1);C.centrif={tm:G.tm,pronta:false,pegou:false};sfx('motor');feed('A centrífuga está rodando a cepa');hudMissao(true);}};
AMANHECE.push(()=>{const D=espD(),cf=D.cap5.centrif;if(cf&&!cf.pronta){const g=typeof geradorBaseObra==='function'?geradorBaseObra():null;if(g&&g.hp>0){cf.pronta=true;cap5Radio('soro',2000);hudMissao(true);}}});
/* ---------- os finais ---------- */
function mostrarFimEsporo(tipo){const D=espD(),C=D.cap5;if(C.fim)return;C.fim=true;C.ativo=true;C.escolha=tipo;conquista(tipo==='queimado'?'mataQueimada':'cepaSoro');
  if(typeof diarioEvento==='function')diarioEvento(tipo==='queimado'?'Final: a mata respira':'Final: a cepa','missao');
  const vivos=typeof SOBREV!=='undefined'?SOBREV.filter(s=>s.st==='base'||s.st==='fora').length:0,cao=typeof CAO!=='undefined'&&CAO.ativo&&CAO.st!=='morto',dias=G.dia,vac=!!(G.hist&&G.hist.fim2);
  const F=[];
  F.push(tipo==='queimado'?'O núcleo queimou. Nos dias seguintes a mata hostil secou e virou palha, e sem os esporos os mortos voltaram a ser só mortos.':
    'Com o soro da Dra. Helena, os esporos não pegam mais em você. A mata hostil continua crescendo, mas agora você anda por ela.');
  if(vac)F.push('A vacina já corria no seu sangue: o vírus também não pega mais.');
  F.push(vivos?(vivos===1?'Um sobrevivente vive na sua base.':vivos+' sobreviventes vivem na sua base.'):'Você seguiu sozinho.');
  if(cao)F.push('Caramelo continua do seu lado.');F.push(dias===1?'Foi 1 dia.':'Foram '+dias+' dias.');
  mostrarFim();const t=$('t-fim');if(t){const h2=t.querySelector('h2');if(h2)h2.textContent=tipo==='queimado'?'A mata respira':'A cepa';$('fim-t').textContent=F.join(' ');}
  const Dd=G.diario&&G.diario.contas||{},F2=typeof faunaEstado==='function'?faunaEstado():{mortos:{}};
  const extra=[['Bichos caçados',Object.values(F2.mortos||{}).reduce((a,b)=>a+b,0)],['Km a pé',Math.round((Dd.andou||0)/100)/10],['Mata cortada',D.cortadas],['Obras de pé',OB.length]];
  $('fim-stats').innerHTML+=extra.map(([k,v])=>'<div><b>'+v+'</b><span>'+k+'</span></div>').join('');hudMissao(true);salvarJogo();}
CONQ.push({id:'mataQueimada',nome:'A mata respira',desc:'Queime o núcleo do Projeto Esporo e saia vivo do laboratório.'},{id:'cepaSoro',nome:'A cepa',desc:'Faça o soro contra esporos com a cepa viva do núcleo.'});
/* ---------- salvar e carregar ---------- */
V8.novo.esporos=()=>{G.esp=espNovo();G.esp.semeou=true;espSemear();P.esporo=0;P.lentoMata=1;for(const s of SUB.salas)s.esporos=s.esporos0;};
V8.salvar.esporos=()=>{const D=espD();D.expo=+(P.esporo||0).toFixed(1);D.pl=ESP_PL.map(p=>[p.t[0],+p.x.toFixed(2),+p.z.toFixed(2),p.e,Math.round(p.hp),p.f||0,+p.yaw.toFixed(2),+p.s.toFixed(2),p.obra??-1]);return D;};
V8.carregar.esporos=s=>{G.esp=Object.assign(espNovo(),s&&typeof s==='object'?s:{});const D=G.esp;D.cap5=Object.assign(espNovo().cap5,D.cap5||{});P.esporo=D.expo||0;P.lentoMata=1;ESP_PL.length=0;
  const tp={b:'bulbo',t:'trepadeira',e:'espinheiro'};if(Array.isArray(D.pl)){for(const q of D.pl){const t=tp[q[0]];if(!t)continue;ESP_PL.push({t,x:q[1],z:q[2],e:clamp(q[3]|0,0,2),hp:q[4],f:q[5]||null,yaw:q[6]||0,s:q[7]||1,obra:q[8]>=0?q[8]:null});}}
  else{D.semeou=true;espSemear();}delete D.pl;
  for(const s of SUB.salas)s.esporos=s.esporos0;if(D.nucleo==='queimado')for(const s of SUB.salas)if(s.c.id==='lab'||s.c.id==='tunel2')s.esporos=0;};
