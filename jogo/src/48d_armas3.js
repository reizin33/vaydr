/* ================= armas novas: espingarda, rifle com luneta, besta, bomba caseira e isca de barulho =================
   espingarda: 8 bagos de chumbo espalhados; de perto derruba e atravessa capacete; de longe perde força. Recarrega de cartucho em cartucho.
   rifle: mire (botão direito) para olhar pela luneta; o tiro atravessa até 2 zumbis.
   besta: silenciosa, atira na hora e arma de novo em 1,5 s; virotes recolhem como flecha.
   bomba caseira: pavio de 2,5 s; estoura e derruba tudo em volta (também construções). Muito barulho.
   isca de barulho: despertador numa lata; toca 12 s e chama os zumbis até ela. */
Object.assign(ITEMS,{
  espingarda:{nome:'Espingarda',icon:'i-espingarda',max:1,tipo:'arma',fogo:true,longa:true,dano:14,chumbo:8,abre:0.075,pente:5,tempo:0.9,barulho:80,municao:'cartucho',porCartucho:true,
    desc:'Calibre 12. De perto derruba qualquer um, até de capacete e colete. Espalha: de longe perde força. Recarrega um cartucho por vez. Muito barulho.'},
  cartucho:{nome:'Cartucho calibre 12',icon:'i-cartucho',max:30,tipo:'municao',desc:'Munição da espingarda.'},
  rifle:{nome:'Rifle com luneta',icon:'i-rifle',max:1,tipo:'arma',fogo:true,longa:true,luneta:true,dano:125,pente:5,tempo:1.15,barulho:95,municao:'balaRifle',atravessa:2,recarga:2.0,
    desc:'Mire (botão direito, ou segure atirar no celular) para olhar pela luneta: sem ela o tiro espalha. Um tiro atravessa até dois zumbis. Muito barulho.'},
  balaRifle:{nome:'Bala de rifle',icon:'i-bala-rifle',max:30,tipo:'municao',desc:'Munição do rifle.'},
  besta:{nome:'Besta',icon:'i-besta',max:1,tipo:'arma',fogo:true,longa:true,besta:true,dano:80,pente:1,tempo:0.25,barulho:4,municao:'virote',recarga:1.5,
    desc:'Silenciosa e forte. Atira na hora, mas demora para armar de novo. Os virotes podem ser recolhidos.'},
  virote:{nome:'Virote',icon:'i-virote',max:30,tipo:'municao',desc:'Flecha curta e pesada da besta. Depois do tiro, passe por cima para recolher.'},
  bombaCaseira:{nome:'Bomba caseira',icon:'i-bomba',max:5,tipo:'arma',arremesso:true,bomba:true,desc:'Cano com pólvora e pregos. Jogue e se afaste: estoura em 2,5 segundos e derruba tudo em volta, até construção. Faz muito barulho.'},
  isca:{nome:'Isca de barulho',icon:'i-isca',max:5,tipo:'arma',arremesso:true,isca:true,desc:'Despertador numa lata. Jogue longe: toca por 12 segundos e os zumbis vão até lá. Ótimo para passar escondido.'}});
RECIPES.push(
  {faz:'cartucho',n:3,custo:{sucata:2,pregos:2},cat:'armas',etapa:3,est:2,desb:{item:'espingarda'}},
  {faz:'balaRifle',n:2,custo:{sucata:4},cat:'armas',etapa:3,est:2,desb:{item:'rifle'}},
  {faz:'besta',n:1,custo:{madeira:3,corda:2,sucata:3,pregos:2},cat:'armas',etapa:3,est:2,desb:{oficina:true}},
  {faz:'virote',n:4,custo:{graveto:2,sucata:1},cat:'armas',etapa:2,est:1,desb:{item:'besta'}},
  {faz:'bombaCaseira',n:2,custo:{sucata:3,gasolina:1,pregos:4,fita:1},cat:'armas',etapa:3,est:2,desb:{item:'gasolina'}},
  {faz:'isca',n:2,custo:{sucata:2,pilhas:1,fita:1},cat:'armas',etapa:2,est:1,desb:{item:'pilhas'}});
for(const[t,e]of[['celeiro',['cartucho',2,5,0.14]],['celeiro',['espingarda',1,1,0.04]],['casa',['cartucho',1,3,0.05]],['oficina',['bombaCaseira',1,1,0.05]],['carro',['cartucho',1,2,0.05]]])if(LOOT[t])LOOT[t].push(e);
for(const[t,e]of[['arsenal',['espingarda',.22,1,1]],['arsenal',['cartucho',.5,4,10]],['arsenal',['balaRifle',.25,3,8]],['arsenal_caixa',['rifle',.1,1,1]],['arsenal_caixa',['cartucho',.4,4,8]],
  ['cobertura',['rifle',.08,1,1]],['cobertura',['balaRifle',.2,2,6]],['cofre_pol',['rifle',.12,1,1]],['vestiario',['cartucho',.12,2,4]],['deposito',['bombaCaseira',.03,1,1]],
  ['deposito',['isca',.04,1,1]],['ap_gaveta',['isca',.03,1,1]],['armazem',['besta',.03,1,1]],['armazem',['virote',.08,3,8]],['hotel_mala',['cartucho',.04,2,4]]])if(CID_LOOT[t])CID_LOOT[t].push(e);
/* ---------- malhas na mão (osso 11: cano em -y, topo em +z) ---------- */
function armas3Meshes(){const R=rng(91),mk=f=>{const g=new GB(512,8);f(g);return litMesh(g.data());},aco=lin(0x2c2f33),aco2=lin(0x4a4f55),mad=lin(0x6a4a2c),mad2=lin(0x553a22);
  MESH.arma.espingarda=mk(g=>{add(g,boxTris(0.034,0.06,0.11),mat(0,0.01,0.02),mad2);add(g,boxTris(0.045,0.16,0.07),mat(0,-0.05,0.075),aco);
    add(g,cylTris(0.012,0.012,0.62,8),mat(0,-0.12,0.098,Math.PI,0,0),aco2);add(g,cylTris(0.011,0.011,0.5,8),mat(0,-0.12,0.068,Math.PI,0,0),aco);
    add(g,boxTris(0.05,0.15,0.045),mat(0,-0.42,0.066),mad,{j:0.05,rnd:R});add(g,boxTris(0.04,0.34,0.06,{bx:0.9}),mat(0,0.2,0.035,-0.18,0,0),mad,{j:0.05,rnd:R});
    add(g,boxTris(0.044,0.03,0.09),mat(0,0.37,0.005,-0.18,0,0),lin(0x1a1a1a));});
  MESH.arma.rifle=mk(g=>{add(g,boxTris(0.034,0.06,0.11),mat(0,0.01,0.02),mad2);add(g,boxTris(0.042,0.2,0.06),mat(0,-0.06,0.072),aco);
    add(g,cylTris(0.01,0.012,0.7,8),mat(0,-0.16,0.088,Math.PI,0,0),aco2);add(g,boxTris(0.05,0.42,0.05,{bx:0.85}),mat(0,-0.32,0.055),mad,{j:0.05,rnd:R});
    add(g,boxTris(0.04,0.36,0.065,{bx:0.9}),mat(0,0.21,0.035,-0.16,0,0),mad,{j:0.05,rnd:R});
    add(g,cylTris(0.018,0.018,0.26,10),mat(0,0.06,0.145,Math.PI,0,0),lin(0x161819));for(const y of[0.07,-0.2])add(g,cylTris(0.026,0.026,0.05,10),mat(0,y,0.145,Math.PI,0,0),lin(0x161819));
    add(g,cylTris(0.02,0.02,0.002,10),mat(0,-0.25,0.145,Math.PI,0,0),lin(0x5a8aa8),{e:0.4});for(const y of[0.0,-0.13])add(g,boxTris(0.012,0.012,0.04),mat(0,y,0.118),aco);
    add(g,cylTris(0.007,0.007,0.06,6),mat(0.03,0.02,0.09,0,0,Math.PI/2),aco2);add(g,icoTris(0.012,0.1,R),mat(0.062,0.02,0.09),aco2);});
  MESH.arma.besta=mk(g=>{add(g,boxTris(0.034,0.06,0.11),mat(0,0.01,0.02),mad2);add(g,boxTris(0.04,0.62,0.05),mat(0,-0.12,0.07),mad,{j:0.05,rnd:R});
    add(g,boxTris(0.038,0.3,0.06,{bx:0.9}),mat(0,0.24,0.04,-0.16,0,0),mad,{j:0.05,rnd:R});
    for(const s of[-1,1]){add(g,boxTris(0.3,0.024,0.03),mm(mat(s*0.15,-0.42,0.08),mat(0,0,0,0,0,s*0.22)),aco2);}
    add(g,cylTris(0.003,0.003,0.56,4),mat(0.28,-0.36,0.085,0,0,Math.PI/2),lin(0xd8d0c0));add(g,cylTris(0.006,0.006,0.34,5),mat(0,-0.05,0.1,Math.PI,0,0),lin(0x8a6a40));
    add(g,cylTris(0,0.011,0.04,4),mat(0,-0.39,0.1,Math.PI,0,0),aco);add(g,boxTris(0.016,0.05,0.03),mat(0,0.06,-0.01),aco);});
  MESH.arma.bombaCaseira=mk(g=>{add(g,cylTris(0.032,0.032,0.17,10),mat(0,0,-0.07,Math.PI/2,0,0),lin(0x5a5e62),{j:0.05,rnd:R});
    for(const z of[-0.08,0.1])add(g,cylTris(0.038,0.038,0.03,10),mat(0,0,z,Math.PI/2,0,0),lin(0x3a3d40));add(g,boxTris(0.07,0.075,0.05),mat(0,0,0.02),lin(0x2a2a2a));
    add(g,cylTris(0.004,0.004,0.07,4),mat(0,0,0.13,Math.PI/2+0.4,0,0),lin(0x8a7a50));add(g,icoTris(0.009,0.1,R),mat(0,0.03,0.19),lin(0xffa040),{e:2.5});});
  MESH.arma.isca=mk(g=>{add(g,cylTris(0.04,0.04,0.1,10),mat(0,0,-0.03,Math.PI/2,0,0),lin(0xb8642a),{j:0.05,rnd:R});add(g,cylTris(0.041,0.041,0.012,10),mat(0,0,0.07,Math.PI/2,0,0),lin(0x9aa0a6));
    for(const s of[-1,1])add(g,icoTris(0.018,0.1,R),mat(s*0.022,0,0.09),lin(0xc8b040));add(g,boxTris(0.02,0.02,0.02),mat(0,0.03,0.0),lin(0xff3020),{e:1.5});});}
/* ---------- luneta ---------- */
function lunetaAtiva(){const d=selDef();return!!(d&&d.luneta&&P.aim>0.6&&P.alive&&!CARRO.ativo&&!P.escala&&!P.muro&&G.modo==='jogo');}
function lunetaK(){const d=selDef();return d&&d.luneta&&P.alive&&!CARRO.ativo?clamp((P.aim-0.3)/0.7,0,1):0;}
function hudLuneta(){const el=document.getElementById('luneta');if(!el)return;const on=lunetaAtiva();if(el.hidden===on)el.hidden=!on;}
/* ---------- tiro: o que o raio acerta primeiro (zumbi, bicho ou obstáculo) ---------- */
function tiroHit(o,dir,maxT,ign){let hit=null,ht=maxT,head=false,hr=null,hc=null;
  for(const z of Z){if(!z.vivo||(ign&&ign.has(z)))continue;const C=zCorpo(z),r=raySeg(o,dir,C.a,C.b);if(r.dist<C.r&&r.t<ht&&r.t>0.2){ht=r.t;hit=z;head=r.u>C.cab;hr=r;hc=C;}}
  let bicho=null;for(const b of BICHOS){if(!b.vivo)continue;const h=bichoAlt(b),r=raySeg(o,dir,[b.x,b.y+h*0.3,b.z],[b.x,b.y+h,b.z]);if(r.dist<bichoHitR(b)&&r.t<ht){ht=r.t;bicho=b;hit=null;}}
  let block=null;for(let t=1;t<ht;t+=0.5){const x=o[0]+dir[0]*t,y=o[1]+dir[1]*t,z=o[2]+dir[2]*t;if(y<ground(x,z)){block=[x,y,z];ht=t;hit=null;bicho=null;break;}
    const c=bloqueiaTiro(x,y,z);if(c){block=[x,y,z];ht=t;hit=null;bicho=null;break;}
    if(emPredios(x,z,2)&&bloqueadoAlto(x,z,0.02,y-0.3)){block=[x,y,z];ht=t;hit=null;bicho=null;break;}}
  return{z:hit,head,t:ht,b:bicho,block,r:hr,C:hc};}
function bocaArma(d){if(cfg.cam==='1'||lunetaAtiva())return[cam.pos[0]+cam.fwd[0]*0.9+cam.right[0]*0.12-cam.up[0]*0.1,cam.pos[1]+cam.fwd[1]*0.9-0.1,cam.pos[2]+cam.fwd[2]*0.9+cam.right[2]*0.12-cam.up[2]*0.1];
  return xf(P.ch.m.subarray(11*16,12*16),0,d.longa?-0.72:-0.17,d.longa?0.09:0.075);}
function espalhar(d,a){const u=Math.abs(d[1])<0.95?[0,1,0]:[1,0,0],r=norm([d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]]),s=norm([d[1]*r[2]-d[2]*r[1],d[2]*r[0]-d[0]*r[2],d[0]*r[1]-d[1]*r[0]]);
  const ang=Math.random()*6.283,m=Math.sqrt(Math.random())*a,ca=Math.cos(ang)*m,sa=Math.sin(ang)*m;return norm([d[0]+r[0]*ca+s[0]*sa,d[1]+r[1]*ca+s[1]*sa,d[2]+r[2]*ca+s[2]*sa]);}
function assistCel(o,dir){if(cfg.tela!=='celular'||lunetaAtiva())return dir;
  for(const z of Z){if(!z.vivo||!z.ch.vis)continue;const C=zCorpo(z),r=raySeg(o,dir,C.a,C.b);if(r.dist<C.r&&r.t>0.2&&r.t<45)return dir;}   // a mira já pega num zumbi: vale onde o jogador mirou (cabeça, perna...)
  let best=null,bc=Math.cos(0.12);for(const z of Z){if(!z.vivo||!z.ch.vis)continue;const C=zCorpo(z),hy=(C.a[1]+C.b[1])/2+(ZS[z.tipo].baixo||ZS[z.tipo].cao?0:0.45*(z.ch.s||1)),cx=(C.a[0]+C.b[0])/2,cz=(C.a[2]+C.b[2])/2;
    const v=[cx-o[0],hy-o[1],cz-o[2]],l=Math.hypot(v[0],v[1],v[2]);if(l>45)continue;const c=(v[0]*dir[0]+v[1]*dir[1]+v[2]*dir[2])/l;if(c>bc){bc=c;best=[v[0]/l,v[1]/l,v[2]/l];}}return best||dir;}
/* chamado no começo de atirar() para as armas novas */
function atirarEsp(s,d){
  if(d.besta){atirarBesta(s,d);return;}
  s.mun--;P.recuo=d.chumbo?1.8:1.5;P.flash=0.08;P.shake=d.chumbo?0.65:0.5;sfx(d.chumbo?'espingarda':'rifle');barulho(P.x,P.z,d.barulho,true);hudBarra();
  const o=cam.pos.slice(),mz=bocaArma(d);let dir0=assistCel(o,cam.fwd.slice());P.muzzle=mz;
  for(let i=0;i<(d.chumbo?12:7);i++)part(mz[0],mz[1],mz[2],dir0[0]*3+(Math.random()-0.5),dir0[1]*3+(Math.random()-0.5),dir0[2]*3+(Math.random()-0.5),0.17,d.chumbo?0.08:0.06,[1,0.75,0.35,1],true,0);
  for(let i=0;i<4;i++)part(mz[0],mz[1],mz[2],dir0[0]*0.8+(Math.random()-0.5)*0.4,0.3+Math.random()*0.3,dir0[2]*0.8+(Math.random()-0.5)*0.4,1.4,0.16,[0.6,0.6,0.6,0.25],false,-0.2);
  if(d.chumbo){const acum=new Map();let algumaCab=false,bichoAcerto=null;const ab=abreTiro(s.id)||d.abre;
    for(let k=0;k<d.chumbo;k++){const dir=espalhar(dir0,ab),h=tiroHit(o,dir,45);
      if(h.z){const p=[o[0]+dir[0]*h.t,o[1]+dir[1]*h.t,o[2]+dir[2]*h.t],reg=regiaoTiro(h.z,h.r,h.C,o,dir),a=acum.get(h.z)||{dmg:0,head:false,n:0,p:null,regs:{}};
        a.dmg+=danoTiro(s.id,reg,distJogador(p),h.z,s);a.head=a.head||reg==='cabeca';a.regs[reg]=(a.regs[reg]||0)+1;a.n++;a.p=p;acum.set(h.z,a);}
      else if(h.b){bichoAcerto=h.b;}else if(h.block)faiscas(h.block[0],h.block[1],h.block[2]);}
    if(bichoAcerto)ferirBicho(bichoAcerto,danoBicho(s.id,s)*4,dir0[0],dir0[2],'bala');
    for(const[z,a]of acum){sangue(a.p[0],a.p[1],a.p[2],6+a.n*2,dir0,a.n>=4);marcarFerida(z,a.p,a.head);if(a.n>=3)jatoChao(z.x+dir0[0]*1.2,z.y,z.z+dir0[2]*1.2,0.3+a.n*0.05,Math.atan2(dir0[0],dir0[2]));
      ZHIT={k:'bala',head:a.head,arma:'espingarda',regs:a.regs};const kb=a.n>=4?2.4:1.2;ferirZ(z,a.dmg,dir0[0]*kb,dir0[2]*kb,1);algumaCab=algumaCab||a.head;}
    if(acum.size){marcarAcerto(algumaCab);if(algumaCab)progresso('cabeca');G.hitstop=Math.max(G.hitstop||0,0.06);}
    return;}
  // rifle: atravessa até d.atravessa zumbis (o segundo leva menos); sem a luneta o tiro espalha
  let oo=o,ign=new Set(),n=0,ult=null;{const a=abreTiro(s.id);if(a>0)dir0=espalhar(dir0,a);}
  while(n<(d.atravessa||1)){const h=tiroHit(oo,dir0,140,ign);
    if(h.b&&!h.z){ferirBicho(h.b,danoBicho(s.id,s),dir0[0],dir0[2],'bala');ult=[oo[0]+dir0[0]*h.t,oo[1]+dir0[1]*h.t,oo[2]+dir0[2]*h.t];break;}
    if(!h.z){if(h.block){faiscas(h.block[0],h.block[1],h.block[2]);ult=h.block;}break;}
    const p=[oo[0]+dir0[0]*h.t,oo[1]+dir0[1]*h.t,oo[2]+dir0[2]*h.t],reg=regiaoTiro(h.z,h.r,h.C,oo,dir0),head=reg==='cabeca';sangue(p[0],p[1],p[2],head?20:10,dir0,true);marcarFerida(h.z,p,head);jatoChao(h.z.x+dir0[0]*1.3,h.z.y,h.z.z+dir0[2]*1.3,0.35,Math.atan2(dir0[0],dir0[2]));
    ZHIT=zhitDe('bala',s.id,reg);ferirZ(h.z,danoTiro(s.id,reg,distJogador(p),h.z,s)*(n?(BALANCO.armas.rifle.atravessaK||0.65):1),dir0[0]*1.2,dir0[2]*1.2,1);
    marcarAcerto(head);if(head)progresso('cabeca');ign.add(h.z);n++;oo=p;ult=p;G.hitstop=Math.max(G.hitstop||0,0.05);}
  if(n>=2){feed('Dois de uma vez!');progresso('rifleDuplo');}
  // rastro da bala
  {const fim=ult||[o[0]+dir0[0]*60,o[1]+dir0[1]*60,o[2]+dir0[2]*60],L=Math.hypot(fim[0]-mz[0],fim[1]-mz[1],fim[2]-mz[2]);for(let t=1;t<L;t+=1.6){const k=t/L;part(lerp(mz[0],fim[0],k),lerp(mz[1],fim[1],k),lerp(mz[2],fim[2],k),0,0,0,0.12,0.025,[1,0.9,0.6,0.7],true,0);}}}
function atirarBesta(s,d){s.mun--;P.recuo=0.6;sfx('besta');barulho(P.x,P.z,d.barulho,true,P.y);hudBarra();
  const v=62,o=cfg.cam==='1'||lunetaAtiva()?origemFlecha():(()=>{const m=bocaArma(d);return Math.hypot(m[0]-P.x,m[2]-P.z)>1.4?frentePeito(-0.2,1.45):m;})();
  const dir=dirBalistica(o,pontoMira(120),v,ARCO.g);
  FLECHAS.push({x:o[0],y:o[1],z:o[2],vx:dir[0]*v,vy:dir[1]*v,vz:dir[2]*v,dx:dir[0],dy:dir[1],dz:dir[2],t:0,k:1,voa:true,dano:d.dano*danoUp(s),danoBicho:danoBicho('besta',s)*(1+0.1*perk('mira')),item:'virote',arma:'besta'});   // "Mão firme" entra uma vez só, no acerto
  dica('besta','corpo','Besta: atira na hora e é silenciosa. Depois de cada tiro ela arma de novo sozinha (R). Os virotes podem ser recolhidos.');
  if(invCount('virote')>0)setTimeout(()=>{if(selItem()===s&&!P.acao&&s.mun<=0)recarregar();},350);}
/* ---------- bombas e iscas no chão ---------- */
const BOMBAS=[],ISCAS=[];
function aterrissar(b,p){if(b.tipo==='bombaCaseira'){BOMBAS.push({x:p[0],y:chaoEm(p[0],p[2],p[1]+0.5),z:p[2],t:b.t,fuse:2.5,rot:Math.random()*6.28});sfx('madeira',p[0],p[2],0.5);return;}
  if(b.tipo==='isca'){ISCAS.push({x:p[0],y:chaoEm(p[0],p[2],p[1]+0.5),z:p[2],t:0,bip:0,rot:Math.random()*6.28});sfx('madeira',p[0],p[2],0.4);
    dica('isca','corpo','A isca está tocando: os zumbis por perto vão até ela por uns 12 segundos. Aproveite para passar ou para pegá-los juntos.');return;}
  quebrarMolotov(p[0],p[1],p[2]);}
function explosao(x,y,z,R,dano){sfx('explosao',x,z,1.7);barulho(x,z,70,false,y);RINGS.push({x,z,y:y+0.3,a:0},{x,z,y:y+0.3,a:-0.25});
  P.shake=Math.max(P.shake,1.1*clamp(1-Math.hypot(P.x-x,P.z-z)/35,0,1));
  for(let i=0;i<46;i++){const a=Math.random()*6.283,u=Math.random(),v=4+Math.random()*9;part(x,y+0.4,z,Math.cos(a)*v*(1-u*0.5),1.5+u*7,Math.sin(a)*v*(1-u*0.5),0.35+Math.random()*0.45,0.16+Math.random()*0.14,[1,0.5+Math.random()*0.35,0.12,1],true,2);}
  for(let i=0;i<20;i++)part(x+(Math.random()-0.5)*1.5,y+0.5,z+(Math.random()-0.5)*1.5,(Math.random()-0.5)*2,1+Math.random()*2.5,(Math.random()-0.5)*2,2.6,0.5,[0.2,0.19,0.18,0.45],false,-0.3);
  for(let i=0;i<14;i++)part(x,y+0.3,z,(Math.random()-0.5)*14,3+Math.random()*6,(Math.random()-0.5)*14,1.2,0.05,[0.3,0.28,0.26,1],false,9.8);
  if(MANCHAS.length>=60)MANCHAS.shift();MANCHAS.push({x,y:chaoEm(x,z,y+0.5),z,r:R*0.6,rot:Math.random()*6.28,t:0,s:Math.random(),q:1});
  for(const q of Z){if(!q.vivo)continue;const d=Math.hypot(q.x-x,q.z-z);if(d>R||Math.abs(q.y-y)>3)continue;const k=1-0.65*d/R;ZHIT={k:'fogo'};
    ferirZ(q,dano*k*(q.tipo==='colosso'?0.5:1),(q.x-x)/(d||1)*4*k,(q.z-z)/(d||1)*4*k,1);if(q.vivo&&q.tipo!=='colosso'){q.st='atordoado';q.t=0.6+k;}}
  for(const b of BICHOS)if(b.vivo&&Math.hypot(b.x-x,b.z-z)<R)ferirBicho(b,200,b.x-x,b.z-z,'explosao');
  {const d=Math.hypot(P.x-x,P.z-z);if(P.alive&&d<R*1.1&&Math.abs(P.y-y)<3){ferirJogador(60*(1-d/(R*1.1)),{x,z});empurraJogador({x,z},9*(1-d/(R*1.1)));}}
  for(const s of SOBREV)if(sobAtivo(s)&&Math.hypot(s.x-x,s.z-z)<R)ferirSobrev(s,40*(1-Math.hypot(s.x-x,s.z-z)/R));
  if(caoAtivoLivre()&&Math.hypot(CAO.x-x,CAO.z-z)<R)ferirCao(30);
  for(const o of OB.slice())if(Math.hypot(o.x-x,o.z-z)<R+1)danoObra(o,170*(1-0.6*Math.hypot(o.x-x,o.z-z)/(R+1)));
  for(const g of GAS)if(!g.explodiu&&Math.hypot(g.x-x,g.z-z)<R+g.r)explodirGas(g);}
function updateBombas(dt){
  for(let i=BOMBAS.length-1;i>=0;i--){const b=BOMBAS[i];b.t+=dt;if(Math.random()<dt*30)part(b.x,b.y+0.12,b.z,(Math.random()-0.5)*0.6,0.6+Math.random(),(Math.random()-0.5)*0.6,0.25,0.03,[1,0.7,0.3,1],true,3);
    b.som=(b.som||0)-dt;if(b.som<=0){b.som=0.22;sfx('estalo',b.x,b.z,0.5);}
    if(b.t>=b.fuse){BOMBAS.splice(i,1);explosao(b.x,b.y,b.z,5.2,170);progresso('bomba');}}
  for(let i=ISCAS.length-1;i>=0;i--){const l=ISCAS[i];l.t+=dt;l.bip-=dt;if(l.bip<=0){l.bip=0.5;sfx('isca',l.x,l.z,0.9);barulho(l.x,l.z,34,false,l.y);}
    if(l.t>12){ISCAS.splice(i,1);sfx('clique',l.x,l.z,0.5);}}}
const _MXA=new Float32Array(16);
function desenharArmas3(Pg){for(const b of BOMBAS)drawStat(Pg,MESH.arma.bombaCaseira,trs(_MXA,b.x,b.y+0.04,b.z,Math.PI/2,b.rot,0,1,1,1));
  for(const l of ISCAS){const sh=Math.sin(G.t*40)*0.04;drawStat(Pg,MESH.arma.isca,trs(_MXA,l.x+sh*0.2,l.y+0.05,l.z,-Math.PI/2,l.rot,sh,1,1,1));}}
function bbArmas3(){for(const b of BOMBAS)bb(b.x,b.y+0.15,b.z,0.09+0.04*Math.sin(G.t*30),1,0.7,0.3,0.9);
  for(const l of ISCAS)if(Math.sin(G.t*12)>0)bb(l.x,l.y+0.16,l.z,0.07,1,0.15,0.08,1);}
function resetArmas3(){BOMBAS.length=0;ISCAS.length=0;}
function updateArmas3(dt){updateBombas(dt);hudLuneta();}
/* câmera da luneta: estreita o campo de visão e, em terceira pessoa, olha do olho do personagem */
function lunetaCam(d,shake){const k=lunetaK();if(k<=0)return;cam.fov*=lerp(1,0.3,k);if(!lunetaAtiva()||cfg.cam==='1')return;
  const hy=lerp(1.62,1.12,P.agK||0);cam.pos=[P.x+d[0]*0.1,P.y+hy+shake*0.3,P.z+d[2]*0.1];cam.tgt=[cam.pos[0]+d[0],cam.pos[1]+d[1],cam.pos[2]+d[2]];camDist=0.3;}
