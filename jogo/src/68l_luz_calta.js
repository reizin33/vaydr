/* ================= A luz da Cidade Alta (v10.8.6) =================
   Himalaia (19/11/2026): "coisas que se conectam". Conserto novo, como o bondinho: a cabine de força da Cidade Alta (o
   transformador do bairro, ao lado da casa das máquinas do bondinho, na Praça do Mirante) religa a iluminação com 2 fusíveis,
   3 fios e 1 fita. Daí em diante, à noite:
   · os postes coloniais do bairro acendem (o brilho de cada lanterna e a luz de verdade do poste mais perto);
   · zumbi não entra na luz de poste aceso (fica na beira, como na luz dos abrigos): debaixo do poste ele não alcança você, e
     as ruas acesas viram um caminho mais seguro à noite (mas entre um poste e outro ainda é escuro);
   · entra no "O que fazer" como Conserto e nas ligações dos itens (fusível, fio e fita: "Serve para").
   Junto: a luz das salas do Hospital com o gerador ligado voltou (a chamada tinha ficado dentro de um comentário na v10.2.2). */
const LUZCA={ok:false,cab:null,malha:null,r:4.6,lamps:[],chk:0};
const LUZCA_CUSTO={fusivel:2,fio:3,fita:1};
function luzcaD(){const D=ativD();if(!D.luzCalta||typeof D.luzCalta!=='object')D.luzCalta={ligado:false};return D.luzCalta;}
function luzcaNoite(){return(E.n||0)>0.3;}
function luzcaAcesa(){return LUZCA.ok&&luzcaD().ligado&&luzcaNoite()&&luzcaPostes().length>0;}
/* a cabine: o primeiro lugar livre ao lado da casa das máquinas ou na beira de trás da praça (porta virada para a praça, +z) */
function luzcaMontar(){if(LUZCA.ok||!CA.ok||!CA.plano)return;
  const m=CA.plano.maq,cands=[[m.x-3.4,m.z],[m.x-3.4,m.z+1.2],[294.5,-137.6],[290.5,-137.6],[296.5,-133.5]];let c=null;
  for(const[x,z]of cands){const g=ground(x,z);if(bloqueadoAlto(x,z,1.15,g+0.3)||bloqueadoAlto(x,z+1.4,0.5,g+0.3))continue;if(Math.abs(ground(x+0.8,z)-g)>0.6||Math.abs(ground(x,z+0.6)-g)>0.6)continue;c={x,z,g};break;}
  if(!c)return;LUZCA.cab=c;colBox(c.x,c.z,0.82,0.52,0,{solid:true,y0:c.g-0.3,y1:c.g+2.25,calta:true});
  LUZCA.ok=true;}
/* os postes entram na lista quando o bairro é desenhado (caPoste roda no desenho, depois do buildWorld): a lista vem na primeira vez que precisa */
function luzcaPostes(){if(!LUZCA.lamps.length&&CA.postes&&CA.postes.length){const vis=new Set();for(const p of CA.postes){const k=Math.round(p[0]*10)+','+Math.round(p[2]*10);if(vis.has(k))continue;vis.add(k);LUZCA.lamps.push({x:p[0],y:p[1],z:p[2],g:ground(p[0],p[2]-0.5)});}}return LUZCA.lamps;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{luzcaMontar();}catch(e){console.error('luz da Cidade Alta',e);}return r;};}
function luzcaGeo(){const g=new GB(1<<12,8),R=rng(68112),c=LUZCA.cab,y=c.g,B=(x0,x1,y0,y1,z0,z1,cor,o)=>add(g,boxTris(x1-x0,y1-y0,z1-z0),mat(c.x+(x0+x1)/2,y+(y0+y1)/2,c.z+(z0+z1)/2),lin(cor),Object.assign({j:0.03,rnd:R},o||{}));
  B(-0.8,0.8,-0.2,2.1,-0.5,0.5,0xb8b4a8);B(-0.9,0.9,2.1,2.22,-0.6,0.6,0x8a857c);B(-0.85,0.85,-0.2,0.12,-0.55,0.55,0x7d786e);   // corpo, laje e base
  B(-0.45,0.45,0.15,1.95,0.5,0.53,0x5a6a5a);for(let k=0;k<6;k++)B(-0.35,0.35,1.25+k*0.1,1.28+k*0.1,0.53,0.56,0x46524a);   // porta de chapa com veneziana
  B(0.3,0.36,0.95,1.1,0.53,0.58,0x2a2a2a);B(-0.28,0.28,1.98,2.07,0.5,0.56,0xd8b020);   // maçaneta e a faixa amarela
  textoBlocos(g,mat(c.x-0.24,y+2.0,c.z+0.565),'PERIGO',0.012,0x1a1a1a);
  /* o transformador em cima: tambor, aletas e três isoladores */
  add(g,cylTris(0.3,0.3,0.7,12),mat(c.x+0.3,y+2.22,c.z-0.1),lin(0x6a7470),{j:0.03,rnd:R});for(let k=0;k<3;k++)add(g,cylTris(0.04,0.06,0.22,6),mat(c.x+0.12+k*0.18,y+2.92,c.z-0.1),lin(0x7a5a3a));
  for(const s of[-1,1])B(s>0?0.6:-0.04,s>0?0.64:0,2.25,2.85,-0.32,0.12,0x5a6460);
  return g.data();}
etapaMalha('fim','luzCalta',1,()=>{if(!LUZCA.ok)return;try{LUZCA.malha=litMesh(luzcaGeo());}catch(e){console.error('luz da Cidade Alta (desenho)',e);LUZCA.malha=null;}});
DESENHO.opaco.push(function luzcaDesenho(Pg){if(LUZCA.malha&&d2(LUZCA.cab.x,LUZCA.cab.z,cam.pos[0],cam.pos[2])<220*220)drawStat(Pg,LUZCA.malha,ID);});
/* o brilho das lanternas (de noite, com a luz religada) e a lâmpada da cabine (vermelha desligada, verde ligada) */
DESENHO.aditivo.push(function luzcaBrilho(){if(!LUZCA.ok)return;const c=LUZCA.cab,S=luzcaD();
  if(d2(c.x,c.z,cam.pos[0],cam.pos[2])<90*90){if(S.ligado)bb(c.x+0.55,c.g+1.75,c.z+0.56,0.08,0.35,1,0.4,0.85);else bb(c.x+0.55,c.g+1.75,c.z+0.56,0.07,1,0.25,0.15,0.45+0.25*Math.sin((G.t||0)*5));}
  if(!luzcaAcesa())return;const n=E.n||0,k=smooth(0.3,0.6,n);
  for(const L of LUZCA.lamps){const dd=d2(L.x,L.z,cam.pos[0],cam.pos[2]);if(dd>170*170)continue;bb(L.x,L.y,L.z,0.95,1,0.8,0.5,0.42*k);bb(L.x,L.y,L.z,0.32,1,0.92,0.75,0.85*k);}});
/* a luz de verdade: o poste aceso mais perto (até 30 m) ilumina em volta */
{const _lc=luzesCidade;luzesCidade=function(put){try{_lc.apply(this,arguments);}catch(e){}try{if(!luzcaAcesa())return;let b=null,bd=30*30;for(const L of LUZCA.lamps){const d=d2(L.x,L.z,P.x,P.z);if(d<bd){bd=d;b=L;}}
    if(b)put(b.x,b.y-0.25,b.z,13,scl([1,0.84,0.6],lerp(1.3,3.6,E.n||0)));}catch(e){}};}
/* zumbi não entra na luz do poste (fica na beira); se não enxerga você, quem caçava vai para o escuro */
PASSOS.push(function luzcaZumbis(dt){if(G.modo!=='jogo'||!luzcaAcesa())return;if(typeof caDist==='function'&&caDist()>120)return;const R=LUZCA.r;
  const perto=LUZCA.lamps.filter(L=>Math.abs(L.x-P.x)<90&&Math.abs(L.z-P.z)<90);if(!perto.length)return;
  let sob=null;for(const L of perto)if(Math.hypot(P.x-L.x,P.z-L.z)<R&&Math.abs(P.y-L.g)<3){sob=L;break;}
  for(const z of Z){if(!z.vivo||z.chefe||z.lan||z.st==='morrendo'||z.st==='morto'||z.st==='sumindo'||z.st==='derrubado')continue;
    for(const L of perto){const dx=z.x-L.x,dz=z.z-L.z;if(Math.abs(dx)>R+0.6||Math.abs(dz)>R+0.6||Math.abs(z.y-L.g)>3)continue;const dd=Math.hypot(dx,dz);if(dd>R+0.4)continue;
      const ux=dd>0.01?dx/dd:1,uz=dd>0.01?dz/dd:0;if(dd<R){const nx=L.x+ux*R,nz=L.z+uz*R;if(!pointBlocked(nx,nz,0.3)){z.x=nx;z.z=nz;}}
      if(sob===L&&(z.st==='caca'||z.st==='golpe'||z.st==='alerta')){z.st='alerta';z.ax=L.x+ux*(R+7);z.az=L.z+uz*(R+7);z.ay=ground(z.ax,z.az);z.ouvir=null;z.viu=0;}
      break;}}});

/* ---------- a cabine: religar ---------- */
INTERS.push(tryIt=>{if(!LUZCA.ok||P.bonde)return;const c=LUZCA.cab;if(Math.abs(P.x-c.x)>4||Math.abs(P.z-c.z)>4)return;tryIt({k:'luzCabine',o:luzcaD()},c.x,c.z+0.95,1.7,2.4,-0.8,c.g);});
INTER_K.luzCabine={texto:S=>{if(S.ligado)return{t:'Cabine de força da Cidade Alta',s:'ligada · os postes acendem à noite'};const f=ativFalta(LUZCA_CUSTO);
    return f.length?{t:'Cabine de força sem energia',s:'falta '+f.join(', ')}:{t:'Religar a luz da Cidade Alta',s:'gasta '+ativCusto(LUZCA_CUSTO)+' · segure',hold:true,dur:2.6};},
  usar:(S,seg)=>{if(S.ligado)return;if(ativFalta(LUZCA_CUSTO).length){sfx('vazio');return;}if(!seg)return;
    for(const k in LUZCA_CUSTO)invRemove(k,LUZCA_CUSTO[k]);S.ligado=true;ativLimpa();sfx('construir');sfx('missao');sfx('clique',LUZCA.cab.x,LUZCA.cab.z,1);ganharXP(120);P.shake=Math.max(P.shake||0,0.1);
    toast('habilidade','A luz da Cidade Alta voltou! À noite os postes acendem e os zumbis não entram na luz deles: debaixo do poste eles não alcançam você.');
    if(typeof diarioEvento==='function')diarioEvento('Religou a luz da Cidade Alta','geral');if(typeof progresso==='function')progresso('conserto');if(typeof invRender==='function')invRender();}};
ativFonte(()=>{if(!LUZCA.ok||!CALTA_LIGADO)return[];const S=luzcaD(),c=LUZCA.cab,f=S.ligado?[]:ativFalta(LUZCA_CUSTO);
  return[{id:'luz-calta',tipo:'conserto',nome:'Religar a luz da Cidade Alta',x:c.x,z:c.z,r:12,feito:!!S.ligado,
    falta:S.ligado?'':f.length?'falta '+f.join(', ')+' (cabine de força da Praça do Mirante)':'segure E na cabine de força',premio:'os postes acendem à noite e os zumbis não entram na luz'}];});
if(typeof LIGA_EXTRA!=='undefined')for(const k of['fusivel','fio','fita']){(LIGA_EXTRA[k]=LIGA_EXTRA[k]||[]).push('religar a luz da Cidade Alta');}
