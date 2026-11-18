/* ================= Sirene e holofote (v10.3.1, 18/11/2026) =================
   Da lista combinada com o Himalaia depois do quadro novo. Duas peças de defesa da aba Energia (precisam da oficina):
   · SIRENE (80 W): toca enquanto recebe energia. Com um sensor de movimento antes dela (sensor → sirene), quando um zumbi
     chega ela toca, a luz vermelha gira e o aviso diz de que lado ele vem, mesmo com você longe (até 150 m). O barulho atrai
     os zumbis de perto (até 45 m): é aviso, não esconderijo.
   · HOLOFOTE (250 W): à noite, com energia, acende um facho forte. Sem zumbi por perto ele varre devagar a frente dele (para
     onde você estava olhando quando construiu); quando um zumbi chega a até 35 m, o facho vira e segue o zumbi. Com sensor,
     temporizador ou interruptor no meio, acende só quando precisa (e gasta menos). */
const SIREH={aviso:150,barulho:45,alc:35,T:0,m:null,F_T:0};
iconesNovos({'i-sirene':'<path d="M12 21V12"/><path d="M8.5 12h7l-1-5.5h-5z"/><path d="M12 3.5v-1M6.5 5.5l-.8-.8M17.5 5.5l.8-.8M5 9H4M20 9h-1"/><path d="M9 21h6"/>',
  'i-holofote':'<path d="M12 21V13M8 21h8"/><path d="M8.5 13h7"/><circle cx="12" cy="8.5" r="4"/><path d="M15.5 6 21 3.5M16 9h5.5M15.5 11l5.5 2.5"/>'});
Object.assign(OBRAS,{
  sirene:{nome:'Sirene',icon:'i-sirene',custo:{sucata:4,chapaFerro:1,fio:2,pilhas:1},hp:150,hw:0.18,hd:0.18,solid:false,peq:true,hCol:2.3,etapa:3,desb:'oficina',
    desc:'Toca enquanto recebe energia: ponha um sensor de movimento antes dela e ela avisa quando um zumbi chega e de que lado. O barulho atrai os zumbis de perto.'},
  holofote:{nome:'Holofote',icon:'i-holofote',custo:{sucata:6,chapaFerro:2,fio:3},hp:220,hw:0.32,hd:0.32,solid:true,hCol:2.6,etapa:3,desb:'oficina',
    desc:'À noite, com energia, acende um facho forte: varre a frente dele e segue o zumbi que chegar a até 35 m.'}});
Object.assign(ELET,{sirene:{p:'consumo',w:80},holofote:{p:'consumo',w:250}});
for(const k of['sirene','holofote']){E17_OBRAS.push(k);OBRA_ORDEM.push(k);if(!OBRAS_CHAO.includes(k))OBRAS_CHAO.push(k);}
if(typeof OBRAS_PREDIO!=='undefined'&&!OBRAS_PREDIO.includes('sirene'))OBRAS_PREDIO.push('sirene');
{const c=OBRA_CATS.find(q=>q.id==='energia');if(c)for(const k of['holofote','sirene'])if(!c.t.includes(k)){const i=c.t.indexOf('sensor');c.t.splice(i>=0?i+1:c.t.length,0,k);}}
ELET_CURTO.sirene='Sirene';ELET_CURTO.holofote='Holofote';ELET_ALT.sirene=1.0;ELET_ALT.holofote=1.0;
if(typeof PINO_TIPO!=='undefined'){PINO_TIPO.sirene={e:[[0,0.55,0.07]]};PINO_TIPO.holofote={e:[[0,0.6,0.12]]};}
BASE_DICAS.sirene='Sirene: ligue um sensor de movimento antes dela. Quando um zumbi chega, ela toca e avisa de que lado.';
BASE_DICAS.holofote='Holofote: à noite, com energia, varre a frente dele e segue o zumbi que chegar a até 35 m.';
ENERGIA_FAZ.sirene='Toca enquanto recebe energia (ponha um sensor de movimento antes dela): avisa de que lado o zumbi vem e atrai os de perto.';
ENERGIA_FAZ.holofote='À noite acende um facho forte: varre a frente dele e segue o zumbi que chegar a até 35 m.';
/* ---------- sirene: toca, gira a luz e avisa ---------- */
PASSOS.push(function sirenePasso(dt){SIREH.T-=dt;if(SIREH.T>0)return;SIREH.T=0.25;
  for(const o of OB){if(o.tipo!=='sirene'||o.hp<=0)continue;if(!o.energ){o.tocando=false;continue;}
    if(!o.tocando){o.tocando=true;o.sirT=0;const d=Math.hypot(o.x-P.x,o.z-P.z);
      if(d<SIREH.aviso){let zb=null,zd=30*30;for(const z of Z){if(!z.vivo)continue;const q=d2(z.x,z.z,o.x,o.z);if(q<zd){zd=q;zb=z;}}
        toast('alerta','Sirene tocando '+(d<8?'aqui perto':'a '+direcao(o.x-P.x,o.z-P.z)+' ('+Math.round(d)+' m)')+(zb?': zumbi chegando pelo '+direcao(zb.x-o.x,zb.z-o.z)+' dela.':'.'));}}
    o.sirT-=0.25;if(o.sirT<=0){o.sirT=5.2;sfx('sirene',o.x,o.z,1);barulho(o.x,o.z,SIREH.barulho);}}});
{const _ee=eletEstado;eletEstado=function(o){if(o.tipo==='sirene'&&energiaFiado(o))return(o.energ?'tocando':'quieta, esperando energia')+' · gasta '+wTxt(80);
  if(o.tipo==='holofote'&&energiaFiado(o))return(o.energ?((E.n||0)>0.25?(o.holoZ&&o.holoZ.vivo?'seguindo um zumbi':'aceso, varrendo'):'com energia, acende à noite'):'sem energia')+' · gasta '+wTxt(250);
  return _ee.apply(this,arguments);};}
/* ---------- holofote: varre a frente e segue o zumbi mais perto ---------- */
function holoAlvo(o){let b=null,bd=SIREH.alc*SIREH.alc;for(const z of Z){if(!z.vivo)continue;const q=d2(z.x,z.z,o.x,o.z);if(q<bd){bd=q;b=z;}}return b;}
function holoDir(o){const cp=Math.cos(o.hPit||0);return[Math.sin(o.hYaw||0)*cp,Math.sin(o.hPit||0),Math.cos(o.hYaw||0)*cp];}
function holoCab(o){const d=holoDir(o),y=(o.y||0)+2.35;return[o.x+d[0]*0.3,y+d[1]*0.3,o.z+d[2]*0.3];}
function holoFim(o){const d=holoDir(o),h=holoCab(o);let L=SIREH.alc;if(d[1]<-0.02){const g=ground(h[0]+d[0]*10,h[2]+d[2]*10);L=Math.min(L,Math.max(2,(h[1]-g)/(-d[1])));}return[h[0]+d[0]*L,h[1]+d[1]*L,h[2]+d[2]*L];}
PASSOS.push(function holofotePasso(dt){for(const o of OB){if(o.tipo!=='holofote'||o.hp<=0)continue;const aceso=!!o.energ&&(E.n||0)>0.25;o.aceso=aceso;if(!aceso){o.holoZ=null;continue;}
    o.holoBusca=(o.holoBusca||0)-dt;if(o.holoBusca<=0){o.holoBusca=0.4;o.holoZ=holoAlvo(o);}
    const hy=(o.y||0)+2.35;let ay,ap;
    if(o.holoZ&&o.holoZ.vivo){const z=o.holoZ,dx=z.x-o.x,dz=z.z-o.z;ay=Math.atan2(dx,dz);ap=Math.atan2((z.y??ground(z.x,z.z))+1.1-hy,Math.max(0.5,Math.hypot(dx,dz)));}
    else{o.holoFase=(o.holoFase||0)+dt*0.35;ay=(o.yaw||0)+Math.sin(o.holoFase)*1.0;ap=-0.2;}
    const k=Math.min(1,dt*(o.holoZ?4:2));o.hYaw=o.hYaw===undefined?ay:o.hYaw+angDiff(o.hYaw,ay)*k;o.hPit=o.hPit===undefined?ap:o.hPit+(ap-o.hPit)*k;}});
/* a luz do facho: um ponto de luz forte onde ele bate (os 2 holofotes acesos mais perto de você) */
{const _lc=luzesCidade;luzesCidade=function(put){_lc.apply(this,arguments);if((E.n||0)<0.25)return;let n=0;
  const L=OB.filter(o=>o.tipo==='holofote'&&o.aceso&&o.hYaw!==undefined&&d2(o.x,o.z,P.x,P.z)<100*100).sort((a,b)=>d2(a.x,a.z,P.x,P.z)-d2(b.x,b.z,P.x,P.z));
  for(const o of L){if(n>=2)break;const e=holoFim(o);put(e[0],e[1]+1.3,e[2],14,scl([0.92,0.96,1],4.4*(E.n||0)));n++;}};}
/* ---------- desenho ---------- */
const _MSH=M4();
INIT_MALHAS.push(function malhasSireneHolofote(){const R=rng(7373),A=(g,t,m,c,o)=>add(g,t,m,c,Object.assign({j:0.05,rnd:R},o||{})),mad=lin(0x6b5034),aco=lin(0x6a7076),aco2=lin(0x464b50),cinza=lin(0x9aa1a3),
    verm=lin(0xc8261d),ama=lin(0xe0b12a),PI2=Math.PI/2,mk=f=>{const g=new GB(2048,8);f(g);return litMesh(g.data());};
  /* sirene: poste, caixinha de ligação, a corneta virada para a frente e a base da luz giratória */
  MESH.obra.sirene=mk(g=>{A(g,bvTris(0.09,2.1,0.09),mat(0,1.05,0),mad);A(g,bvTris(0.16,0.2,0.1),mat(0,0.55,0.03),aco);A(g,boxTris(0.06,0.02,0.02),mat(0,0.62,0.085),ama);
    A(g,cylTris(0.035,0.035,0.18,8),mat(0,1.92,0.05,PI2,0,0),aco2);A(g,cylTris(0.17,0.05,0.26,14,{bottom:true}),mat(0,1.92,0.48,-PI2,0,0),cinza);
    A(g,bvTris(0.16,0.05,0.16),mat(0,2.12,0),aco2);});
  /* holofote: tripé de cano, coluna, a forquilha (a cabeça gira por cima) */
  MESH.obra.holofote=mk(g=>{for(let i=0;i<3;i++){const a=i/3*Math.PI*2,x=Math.sin(a)*0.55,z=Math.cos(a)*0.55;A(g,cylTris(0.025,0.03,Math.hypot(0.55,1.4),6),alignY(x,0,z,-x,1.4,-z),aco);}
    A(g,cylTris(0.045,0.05,2.2,8),mat(0,0,0),aco2);A(g,bvTris(0.16,0.12,0.16),mat(0,0.6,0.06),aco);
    A(g,boxTris(0.5,0.04,0.06),mat(0,2.2,0),aco2);for(const x of[-0.23,0.23])A(g,boxTris(0.04,0.22,0.06),mat(x,2.3,0),aco2);});
  SIREH.m={luz:mk(g=>{A(g,cylTris(0.07,0.07,0.12,12),mat(0,0,0),verm,{e:0.15});A(g,boxTris(0.02,0.1,0.15),mat(0,0.06,0),lin(0xf0d0c0),{e:0.1});}),
    luzOn:mk(g=>{A(g,cylTris(0.07,0.07,0.12,12),mat(0,0,0),lin(0xff3020),{e:1.4});A(g,boxTris(0.02,0.1,0.15),mat(0,0.06,0),lin(0xffe0d0),{e:1.6});}),
    cab:mk(g=>{A(g,cylTris(0.2,0.17,0.42,16),mat(0,0,-0.24,PI2,0,0),aco2);A(g,cylTris(0.215,0.215,0.04,16),mat(0,0,0.16,PI2,0,0),aco);
      for(const x of[-0.2,0.2])A(g,cylTris(0.03,0.03,0.05,8),mat(x,0,-0.02,0,0,PI2),aco);}),
    lente:mk(g=>A(g,cylTris(0.185,0.185,0.012,16),mat(0,0,0.19,PI2,0,0),lin(0x8a8f94),{e:0.05})),
    lenteOn:mk(g=>A(g,cylTris(0.185,0.185,0.012,16),mat(0,0,0.19,PI2,0,0),lin(0xfff6e0),{e:2.2}))};});
DESENHO.opaco.push(function sireneHolofoteDesenho(Pg){const M=SIREH.m;if(!M)return;
  for(const o of OB){if(o.hp<=0||(o.tipo!=='sirene'&&o.tipo!=='holofote')||d2(o.x,o.z,cam.pos[0],cam.pos[2])>90*90)continue;
    if(o.tipo==='sirene'){trs(_MSH,o.x,(o.y||0)+2.15,o.z,0,o.tocando?G.t*7:(o.yaw||0),0,1,1,1);drawStat(Pg,o.tocando?M.luzOn:M.luz,_MSH);continue;}
    const yw=o.hYaw===undefined?(o.yaw||0):o.hYaw,pt=o.hPit===undefined?-0.2:o.hPit;trs(_MSH,o.x,(o.y||0)+2.35,o.z,-pt,yw,0,1,1,1);drawStat(Pg,M.cab,_MSH);drawStat(Pg,o.aceso?M.lenteOn:M.lente,_MSH);}});
DESENHO.aditivo.push(function sireneHolofoteBrilho(){const n=E.n||0;
  for(const o of OB){if(o.hp<=0||d2(o.x,o.z,cam.pos[0],cam.pos[2])>120*120)continue;
    if(o.tipo==='sirene'&&o.tocando){const a=G.t*7,y=(o.y||0)+2.21;bb(o.x+Math.sin(a)*0.35,y,o.z+Math.cos(a)*0.35,0.45,1,0.18,0.1,0.55+0.35*n);bb(o.x,y,o.z,0.35,1,0.3,0.2,0.35);continue;}
    if(o.tipo!=='holofote'||!o.aceso||o.hYaw===undefined)continue;const k=Math.min(1,(n-0.25)/0.3);if(k<=0)continue;
    const h=holoCab(o),e=holoFim(o),L=Math.hypot(e[0]-h[0],e[1]-h[1],e[2]-h[2]);bb(h[0],h[1],h[2],0.6,1,0.98,0.9,0.85*k);
    for(let i=1,N=16;i<=N;i++){const t=i/N;bb(h[0]+(e[0]-h[0])*t,h[1]+(e[1]-h[1])*t,h[2]+(e[2]-h[2])*t,0.3+t*L*0.14,0.86,0.92,1,0.06*k*(1-t*0.55));}
    bb(e[0],e[1]+0.15,e[2],2.4,0.92,0.96,1,0.2*k);}});
/* ---------- manual ---------- */
MANUAL_EXTRA.push(()=>{const G_=(id,nome,icon,desc,proc,obs)=>({id,sec:'eletricidade',nome,icon,trav:false,como:'oficina',desc,ing:{},est:{nome:'Onde: aba Energia (precisa da oficina)',icon,onde:''},ferr:['Alicate e fio para ligar'],proc,res:null,obs,tipo:'Guia'});
  return[G_('x:sirene','Sirene','i-sirene','Toca enquanto recebe energia: com um sensor antes, avisa quando zumbi chega.',
      ['Construa a sirene e um sensor de movimento perto do lugar que você quer vigiar.','Fios: fonte (ou um circuito do quadro) → sensor → sirene.','Quando o sensor percebe um zumbi, a sirene toca, a luz vermelha gira e o aviso diz de que lado ele vem (até 150 m de você).'],
      ['O barulho atrai os zumbis de perto (até 45 m).','Ligada direto na fonte, sem sensor, ela toca sem parar.']),
    G_('x:holofote','Holofote','i-holofote','À noite, um facho forte que varre a frente dele e segue o zumbi que chegar perto.',
      ['Construa olhando para onde ele deve vigiar: o facho varre essa direção.','Ligue na energia (gasta 250 W). Ele só acende à noite.','Quando um zumbi chega a até 35 m, o facho vira e segue o zumbi.'],
      ['Com sensor, temporizador ou interruptor no meio, ele acende só quando precisa e gasta menos.','Ponha num circuito de prioridade alta do quadro: numa falta de energia ele é o último a ser cortado.'])];});
