/* ================= água: rio, lago, ponte, natação, beber e encher, pesca e a cabana do pescador =================
   natação: água acima do peito vira nado. Nadar gasta energia (correndo gasta muito); sem energia você se afoga.
     Não dá para usar arma nadando. Zumbi anda pelo fundo, devagar: no fundo do lago ele não te alcança, no rio sim.
     Os afogados (à noite, no lago e no rio) nadam rápido e sobem atrás de quem está na água.
   água rasa: anda devagar e faz barulho. Beira do rio ou do lago: beber (suja) ou encher garrafas (água suja).
   pesca: com a vara na mão, perto da água, aperte E; quando morder, aperte E de novo. Peixe cru vai para a fogueira.
   ponte: a estrada atravessa o rio por uma ponte de concreto (carro passa por cima, zumbi também).
   cabana do pescador e cais na margem norte do Lago Serra Azul. */
iconesNovos({
  'i-vara':'<path d="M4 20 18 4"/><path d="M18 4c1.6 3 2.1 6.2 1 9.4"/><path d="M19 13.4v2.6"/><circle cx="19" cy="17.2" r="1.2"/>',
  'i-peixe':'<path d="M3.5 12c3-4.5 9-5.5 13-1.5l3.5-3v9l-3.5-3c-4 4-10 3-13-1.5z"/><circle cx="8" cy="11.2" r=".8"/>',
  'i-peixe-assado':'<path d="M3.5 14c3-4.5 9-5.5 13-1.5l3.5-3v9l-3.5-3c-4 4-10 3-13-1.5z"/><path d="M9 4.5c0 1 .8 1.3.8 2.3M12.5 3.5c0 1 .8 1.3.8 2.3"/>',
  'i-nadar':'<circle cx="16" cy="6" r="1.8"/><path d="M4 11l5-3 4 2.5 2.5-2"/><path d="M3 16c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0"/><path d="M3 20c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0"/>'});
Object.assign(ITEMS,{
  vara:{nome:'Vara de pesca',icon:'i-vara',max:1,tipo:'util',mao:true,durMax:60,desc:'Na mão, perto do rio ou do lago, aperte E para pescar. Quando o peixe morder, aperte E de novo. No lago morde mais rápido.'},
  peixeCru:{nome:'Peixe cru',icon:'i-peixe',max:10,tipo:'comida',fome:8,vida:-4,desc:'Asse na fogueira. Cru mata pouco a fome e faz mal.'},
  peixeAssado:{nome:'Peixe assado',icon:'i-peixe-assado',max:10,tipo:'comida',fome:30,vida:6,desc:'Leve e nutritivo.'}});
RECIPES.push({faz:'vara',n:1,custo:{graveto:3,corda:1,pregos:1},cat:'ferramentas',etapa:1,est:0});
REPARO.vara={corda:1};
LOOT.pescador=[['vara',1,1,0.7],['corda',1,2,0.5],['gasolina',1,1,0.35],['pastilha',1,2,0.4],['peixeCru',1,2,0.3],['feijao',1,1,0.3],['agua',1,1,0.3],['pregos',1,3,0.3],['cafe',1,1,0.25],['mapaSecreto',1,1,0.06]];
const NADO={fundo:1.3,sai:1.05,vel:2.0,rapido:3.1};
/* ---------- vegetação e pisos: tira árvores, pedras e mato de dentro da água (sem mudar os ids salvos) ---------- */
function aguaLimparVegetacao(){const tira=(x,z,m)=>aguaPerto(x,z,m)||aguaPoi(x,z);
  for(const t of TREES)if(tira(t.x,t.z,1.3)){t.agua=true;if(t.alive){t.alive=false;const c=COLL.find(q=>q.tree===t);if(c)colRemove(c);}}
  for(const r of ROCKS)if(tira(r.x,r.z,1.5)){r.agua=true;if(r.alive){r.alive=false;const c=COLL.find(q=>q.rock===r);if(c)colRemove(c);}}
  for(const b of BUSHES)if(tira(b.x,b.z,1)){b.agua=true;b.frutas=false;}
  for(const p of PICKS)if(tira(p.x,p.z,0.6)){p.agua=true;p.alive=false;}
  for(const L of[GRASS,FLORES,SAMAMBAIAS,FOLHAS_CHAO])for(let i=L.length-1;i>=0;i--)if(tira(L[i].x,L[i].z,0.3))L.splice(i,1);
  /* árvore gigante que nasceu dentro do lago (o sorteio da mata não olha a água): o tronco ficava com 3 a 4 m de água em volta e o
     cipó de baixo começava no fundo do lago. Sai inteira (tronco, galhos, raízes e cipós); as outras gigantes continuam iguais. */
  for(let i=GIGANTES.length-1;i>=0;i--){const T=GIGANTES[i];if(!tira(T.x,T.z,T.R*0.6))continue;
    for(const c of COLL.filter(q=>q.gigante===T))colRemove(c);
    for(const b of T.galhos)if(b.sup){supRemove(b.sup);b.sup=null;}for(const r of T.raizes)if(r.sup){supRemove(r.sup);r.sup=null;}
    for(const v of T.vias){const k=VIAS.indexOf(v);if(k>=0)VIAS.splice(k,1);}
    T.agua=true;GIGANTES.splice(i,1);}}
/* lugares da margem que também precisam de chão livre (cais, cabana) */
const AGUA_POI=[{x:72.2,z:84,r:5.5},{x:77.5,z:80.5,r:5}];
function aguaPoi(x,z){for(const p of AGUA_POI)if(Math.hypot(x-p.x,z-p.z)<p.r)return true;return false;}
/* cor do chão na beira (lama e areia) e embaixo d'água */
function aguaCorChao(x,z,c){if(x<-26||z<-190||!RIO.ok)return c;let d=1e9;{const di=ilhaD(x,z);if(di<LAGO.ilha.r+1.5)return mixc(lin(0x8a7a5c),c,smooth(LAGO.ilha.r-0.5,LAGO.ilha.r-2.5,di));}const q=rioPerto(x,z);d=q.d-RIO.larg(q.s);const r=lagoR(x,z);d=Math.min(d,(r-1)*Math.min(LAGO.a,LAGO.b));
  if(d>3.5)return c;const lama=lin(0x4f4130),areia=lin(0x8a7a5c);if(d<0)return mixc(lama,lin(0x2f2a22),smooth(0,-2,d));return mixc(mixc(areia,lama,smooth(1.8,0,d)),c,smooth(0.5,3.5,d));}
/* altura do chão para veículos: terreno ou o tabuleiro da ponte */
function ponteAlt(x,z){const dx=x-PONTE.x,dz=z-PONTE.z;if(Math.abs(dx)<PONTE.hw&&Math.abs(dz)<PONTE.hd)return PONTE.y;return -1e9;}
function chaoVeic(x,z){return Math.max(ground(x,z),ponteAlt(x,z));}
/* profundidade da água para quem anda por cima do chão ou da ponte (na ponte é zero) */
function aguaProfVeic(x,z){const n=aguaNivel(x,z);if(n===null)return 0;return Math.max(0,n-chaoVeic(x,z));}
/* ---------- malhas: superfície da água (rio e lago), ponte, cais e cabana ---------- */
let AGUA=null;
const AGUA_VS=`layout(location=0) in vec3 aPos;layout(location=1) in vec4 aD;uniform mat4 uViewProj;out vec3 vW;out vec4 vD;void main(){vW=aPos;vD=aD;gl_Position=uViewProj*vec4(aPos,1.0);}`;
const AGUA_FS=`precision highp float;precision highp sampler2DShadow;in vec3 vW;in vec4 vD;uniform float uTime,uChuva,uNoite;uniform vec3 uCeu;
${GLSL_LUZ}
out vec4 o;
float hN(vec2 q){return texture(uNoise,q).r;}
void main(){vec2 fl=vD.xy*vD.z;vec2 p=vW.xz;float t=uTime;
vec2 q1=p*0.075-fl*t*0.05,q2=p*0.19+fl*t*0.03+vec2(t*0.011,-t*0.008);
float e=0.012;float a1=hN(q1),a2=hN(q2);
float hx=(hN(q1+vec2(e,0.0))-a1)*0.9+(hN(q2+vec2(e,0.0))-a2)*0.6,hz=(hN(q1+vec2(0.0,e))-a1)*0.9+(hN(q2+vec2(0.0,e))-a2)*0.6;
if(uChuva>0.01){vec2 q3=p*1.6+vec2(t*0.7,-t*0.5);float a3=hN(q3);hx+=(hN(q3+vec2(e,0.0))-a3)*uChuva*1.4;hz+=(hN(q3+vec2(0.0,e))-a3)*uChuva*1.4;}
vec3 n=normalize(vec3(-hx*6.0,1.0,-hz*6.0));
vec3 dv=uCam-vW;float dist=length(dv);vec3 V=dv/max(dist,0.001);
float fr=0.025+0.975*pow(1.0-max(dot(n,V),0.0),5.0);
vec3 R=reflect(-V,n);vec3 ceu=mix(uFog,uCeu,clamp(R.y*1.4,0.0,1.0));
float prof=vD.w;
vec3 fundo=mix(vec3(0.045,0.085,0.07),vec3(0.008,0.03,0.04),clamp(prof/3.2,0.0,1.0));
vec3 L=luz(vW,vec3(0.0,1.0,0.0));
vec3 col=mix(fundo*L*1.5,ceu*(1.0-0.5*uNoite),fr*0.9);
float sp=pow(max(dot(R,uDirD),0.0),220.0)*sombra(vW,vec3(0.0,1.0,0.0));col+=uDirC*sp*2.2;
float espuma=(1.0-smoothstep(0.0,0.3,prof))*(0.55+0.45*a2);col+=L*vec3(0.14,0.15,0.14)*espuma;
float a=clamp(0.5+prof*0.2,0.5,0.93);a=mix(a,1.0,fr*0.7);a*=smoothstep(0.0,0.06,prof+0.04);
vec4 c=acabar(col,vW,0.0);o=vec4(c.rgb,a);}`;
/* rio na enchente: cada seção vai de uma beira alagada à outra (o alcance de cada lado), com a água entrando um pouco por baixo
   do chão no fim, para a beira ficar onde o chão encontra a água */
function aguaMalhaCheia(){const ex=RIO.enchente||0;if(!RIO.alc||Math.abs(RIO.alc.nivel-ex)>0.06)cheiaAlcance();
  const g=new GB(1<<16,7),N=Math.ceil(RIO.L/1.4),K=12,linhas=[];
  for(let i=0;i<=N;i++){const s=i/N,p=rioPonto(s);if(lagoR(p[0],p[1])<0.93)break;const w=RIO.larg(s),y=rioNivel(s)+cheiaEx(s),nx=-p[3],nz=p[2],vel=lerp(0.9,0.45,s),
      we=w+cheiaAlc(s,-1)+1.2,wd=w+cheiaAlc(s,1)+1.2,lin2=[];
    for(let c=0;c<=2*K;c++){const o=c<K?-we*(K-c)/K:wd*(c-K)/K,x=p[0]+nx*o,z=p[1]+nz*o;lin2.push([x,y,z,p[2],p[3],vel,Math.max(0,y-ground(x,z))]);}linhas.push(lin2);}
  for(let i=0;i<linhas.length-1;i++)for(let c=0;c<2*K;c++){const a=linhas[i][c],b=linhas[i][c+1],d=linhas[i+1][c+1],e=linhas[i+1][c];
    for(const v of[a,b,d,a,d,e])g.v7(v[0],v[1],v[2],v[3],v[4],v[5],v[6]);}
  return unMesh(g.data());}
function aguaMalhaRio(){if((RIO.enchente||0)>0.02)return aguaMalhaCheia();const g=new GB(1<<15,7),N=Math.ceil(RIO.L/1.4),COL=6,linhas=[];
  for(let i=0;i<=N;i++){const s=i/N,p=rioPonto(s);if(lagoR(p[0],p[1])<0.93)break;const ex=RIO.enchente||0,w=RIO.larg(s)+1.1+ex*4,y=rioNivel(s)+ex,nx=-p[3],nz=p[2],vel=lerp(0.9,0.45,s),lin2=[];
    for(let c=0;c<=COL;c++){const u=-1+2*c/COL,x=p[0]+nx*w*u,z=p[1]+nz*w*u;lin2.push([x,y,z,p[2],p[3],vel,Math.max(0,y-ground(x,z))]);}linhas.push(lin2);}
  for(let i=0;i<linhas.length-1;i++)for(let c=0;c<COL;c++){const a=linhas[i][c],b=linhas[i][c+1],d=linhas[i+1][c+1],e=linhas[i+1][c];
    for(const v of[a,b,d,a,d,e])g.v7(v[0],v[1],v[2],v[3],v[4],v[5],v[6]);}
  return unMesh(g.data());}
function aguaMalhaLago(){const g=new GB(1<<14,7),Lk=LAGO.nivel,AN=84,RS=[0,0.3,0.6,0.85,0.97,1.08],pt=(k,j)=>{const a=k/AN*6.283,rr=RS[j],
    f=1+0.07*Math.sin(3*a+0.7)+0.05*Math.sin(5*a+2.1),x=LAGO.x+Math.cos(a)*LAGO.a*rr*f,z=LAGO.z+Math.sin(a)*LAGO.b*rr*f;return[x,Lk,z,0.3,0.2,0.15,Math.max(0,Lk-ground(x,z))];};
  for(let j=0;j<RS.length-1;j++)for(let k=0;k<AN;k++){const a=pt(k,j),b=pt(k+1,j),c=pt(k+1,j+1),d=pt(k,j+1);
    if(j===0){for(const v of[a,c,d])g.v7(...v);}else for(const v of[a,b,c,a,c,d])g.v7(...v);}
  return unMesh(g.data());}
function ponteGeo(){const g=new GB(4096,8),R=rng(91),X=PONTE.x,Z=PONTE.z,Y=PONTE.y,HW=PONTE.hw,HD=PONTE.hd,con=lin(0x8a8780),con2=lin(0x6f6c66),asf=lin(0x2e2e2c),ferro=lin(0x55595c);
  add(g,boxTris(HW*2,0.55,HD*2),mat(X,Y-0.28,Z),con,{j:0.04,rnd:R});add(g,boxTris(HW*2-0.2,0.04,HD*2-1.1),mat(X,Y+0.01,Z),asf);
  for(const s of[-1,1]){add(g,boxTris(HW*2,0.22,0.5),mat(X,Y+0.1,Z+s*(HD-0.25)),con2,{j:0.05,rnd:R});
    for(let i=0;i<=10;i++){const x=X-HW+0.4+i*(HW*2-0.8)/10;add(g,boxTris(0.12,1.0,0.12),mat(x,Y+0.62,Z+s*(HD-0.12)),ferro);}
    for(const y of[0.7,1.08])add(g,boxTris(HW*2-0.6,0.07,0.07),mat(X,Y+y,Z+s*(HD-0.12)),ferro);}
  for(let i=-3;i<=3;i++)add(g,boxTris(1.2,0.012,0.12),mat(X+i*2.4,Y+0.035,Z),lin(0x9a8a40));
  for(const px of[-3.6,3.6]){const gy=ground(X+px,Z);add(g,boxTris(0.9,Y-gy+0.2,HD*1.6),mat(X+px,(Y+gy)/2-0.2,Z),con2,{j:0.05,rnd:R});}
  for(const s of[-1,1]){const gx=X+s*(HW-0.6),gy=ground(gx,Z);add(g,boxTris(1.2,Math.max(0.4,Y-gy+0.6),HD*2+0.4),mat(gx,(Y+gy)/2-0.3,Z),con2,{j:0.05,rnd:R});}
  return litMesh(g.data());}
function caisGeo(){const g=new GB(4096,8),R=rng(92),Lk=LAGO.nivel,mad=lin(0x6a5038),mad2=lin(0x54402c),y=Lk+0.55;
  for(let i=0;i<14;i++)add(g,boxTris(2.4,0.07,0.36),mat(72.2+(R()-0.5)*0.04,y,83.6+i*0.62),mixc(mad,mad2,R()),{j:0.08,rnd:R});
  for(const sx of[-1.05,1.05])for(let i=0;i<4;i++){const z=84+i*2.6,gy=ground(72.2+sx,z);add(g,cylTris(0.11,0.13,y-gy+0.4,7),mat(72.2+sx,gy-0.3,z),mad2,{j:0.06,rnd:R});}
  // cabana do pescador (paredes de tábua, telhado de zinco, porta virada para o lago)
  const cx=77.5,cz=80.5,gy=ground(cx,cz),W=3.6,D=3.0,H=2.4;
  add(g,boxTris(W+0.3,0.25,D+0.3),mat(cx,gy+0.05,cz),lin(0x5a5550));
  for(const s of[-1,1])add(g,boxTris(0.12,H,D),mat(cx+s*W/2,gy+H/2+0.15,cz),mad,{j:0.06,rnd:R});
  add(g,boxTris(W,H,0.12),mat(cx,gy+H/2+0.15,cz-D/2),mad,{j:0.06,rnd:R});
  for(const s of[-1,1])add(g,boxTris(W/2-0.55,H,0.12),mat(cx+s*(W/4+0.27),gy+H/2+0.15,cz+D/2),mad,{j:0.06,rnd:R});
  add(g,boxTris(1.1,0.5,0.12),mat(cx,gy+H-0.1,cz+D/2),mad);
  add(g,boxTris(W+0.8,0.08,D+0.9),mm(mat(cx,gy+H+0.35,cz),mat(0,0,0,0.12,0,0)),lin(0x7a7f84),{j:0.05,rnd:R});
  add(g,boxTris(1.4,0.5,0.6),mat(cx-0.9,gy+0.4,cz-0.9),mad2);add(g,boxTris(1.8,0.25,0.75),mat(cx+0.8,gy+0.35,cz-1.0),lin(0x4a5a3a));
  for(let i=0;i<3;i++)add(g,cylTris(0.015,0.02,2.2,5),mat(cx-1.7+i*0.15,gy+0.15,cz+1.3,0.2,0,0.1),lin(0x8a6a45));
  return litMesh(g.data());}
function aguaMontar(){aguaNiveis();
  AGUA={prog:program(AGUA_VS,AGUA_FS,GDEF),rio:aguaMalhaRio(),lago:aguaMalhaLago()};
  PONTE.y=Math.max(ground(PONTE.x-PONTE.hw,PONTE.z),ground(PONTE.x+PONTE.hw,PONTE.z),ground(PONTE.x-PONTE.hw+1,PONTE.z+2),ground(PONTE.x+PONTE.hw-1,PONTE.z-2))+0.16;
  MESH.ponte=ponteGeo();MESH.cais=caisGeo();
  // ponte: piso para andar, guarda-corpos e pilares (só bloqueiam na altura de cada coisa)
  supAdd({t:'ret',x:PONTE.x,z:PONTE.z,hw:PONTE.hw,hd:PONTE.hd,yaw:0,y:PONTE.y,dono:'ponte'});
  for(const s of[-1,1])colBox(PONTE.x,PONTE.z+s*(PONTE.hd-0.12),PONTE.hw,0.12,0,{solid:true,y0:PONTE.y,y1:PONTE.y+1.1,ponte:true});
  for(const px of[-3.6,3.6]){const gy=ground(PONTE.x+px,PONTE.z);colBox(PONTE.x+px,PONTE.z,0.45,PONTE.hd*0.8,0,{solid:true,y0:gy-1,y1:PONTE.y-0.55,ponte:true});}
  // cais: piso sobre a água
  supAdd({t:'ret',x:72.2,z:87.6,hw:1.2,hd:4.3,yaw:0,y:LAGO.nivel+0.58,dono:'cais'});
  // cabana: paredes com a porta virada para o lago
  {const cx=77.5,cz=80.5,W=3.6,D=3.0;colBox(cx-W/2,cz,0.08,D/2,0,{solid:true});colBox(cx+W/2,cz,0.08,D/2,0,{solid:true});colBox(cx,cz-D/2,W/2,0.08,0,{solid:true});
    for(const s of[-1,1])colBox(cx+s*(W/4+0.27),cz+D/2,W/4-0.27,0.08,0,{solid:true});colBox(cx-0.9,cz-0.9,0.7,0.3,0,{solid:true});
    interAdd({id:'cabana-bau',kind:'bau',x:cx-0.9,z:cz-0.4,label:'Revistar o armário do pescador',tabela:'pescador',respawn:4});}}
INIT_MALHAS.push(aguaMontar);
/* ---------- desenho ---------- */
function desenharAgua(){if(!AGUA)return;const Pg=AGUA.prog,u=Pg.u,post=POSTX.ok&&!!GDEF;
  const perto=d2(PONTE.x,PONTE.z,cam.pos[0],cam.pos[2])<400*400;if(!perto)return;
  setLit(Pg);gl.uniform1f(u.uChuva,E.r||0);gl.uniform1f(u.uNoite,E.n||0);gl.uniform3fv(u.uCeu,post?toLin(E.zen,E.exp):E.zen);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);gl.disable(gl.CULL_FACE);
  gl.bindVertexArray(AGUA.rio.vao);gl.drawArrays(gl.TRIANGLES,0,AGUA.rio.count);
  if(d2(LAGO.x,LAGO.z,cam.pos[0],cam.pos[2])<260*260){gl.bindVertexArray(AGUA.lago.vao);gl.drawArrays(gl.TRIANGLES,0,AGUA.lago.count);}
  gl.disable(gl.BLEND);gl.depthMask(true);}
DESENHO.agua.push(desenharAgua);
DESENHO.opaco.push(Pg=>{if(MESH.ponte&&d2(PONTE.x,PONTE.z,cam.pos[0],cam.pos[2])<230*230)drawStat(Pg,MESH.ponte,ID);if(MESH.cais&&d2(LAGO.x,LAGO.z,cam.pos[0],cam.pos[2])<200*200)drawStat(Pg,MESH.cais,ID);});
DESENHO.sombra.push((Pg,perto)=>{if(MESH.ponte&&d2(PONTE.x,PONTE.z,P.x,P.z)<(perto?70:150)**2)drawStat(Pg,MESH.ponte,ID);if(MESH.cais&&d2(LAGO.x,LAGO.z,P.x,P.z)<(perto?70:150)**2)drawStat(Pg,MESH.cais,ID);});
/* ---------- natação ---------- */
let nadoBarulhoT=0,nadoBolhaT=0;
function nadoPasso(dt){if(!RIO.ok||P.y<-20&&!P.nada)return false;const niv=aguaNivel(P.x,P.z);
  if(!P.nada){if(niv===null)return false;const g=chaoEm(P.x,P.z,Math.min(P.y,niv-0.2));if(niv-g<NADO.fundo)return false;   // em cima da ponte alagada: anda na água, não nada
    if(P.y>niv-0.25)return false;                    // ainda no ar ou em cima de algo
    if(chaoEm(P.x,P.z,P.y)>niv-0.6)return false;   // em cima da ponte ou do cais
    P.nada={t:0};P.vy=0;P.agachado=false;P.acao=null;P.aim=0;P.escala=null;P.rola=null;P.muro=null;IN.attack=false;
    sfx('mergulho',P.x,P.z,0.8);for(let i=0;i<14;i++)part(P.x,niv+0.05,P.z,(Math.random()-0.5)*3,1.5+Math.random()*2.5,(Math.random()-0.5)*3,0.9,0.07+Math.random()*0.06,[0.85,0.9,0.95,0.7],false,9.8);
    barulho(P.x,P.z,14,true,niv);dica('nadar','corpo','Nadando! Nadar gasta energia (correndo gasta muito). Sem energia você se afoga: volte para a margem. Arma não funciona na água. No fundo do lago os zumbis não te alcançam.');
    if(typeof diarioConta==='function')diarioConta('nadou',1);}
  const pisoN=niv===null?ground(P.x,P.z):chaoEm(P.x,P.z,niv-0.2);if(niv===null||niv-pisoN<NADO.sai){const sai=P.nada;P.nada=null;P.noChao=false;P.y=Math.max(P.y,pisoN);if(sai)P.ch.pitch=0;return false;}
  P.nada.t+=dt;
  let mx=IN.mx,mz=IN.mz;const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml;}
  const rapido=IN.run&&ml>0.15&&P.energia>2,spd=(rapido?NADO.rapido:NADO.vel)*(P.energia<=0.5?0.5:1)*lesaoVel();
  const sy=Math.sin(P.yaw),cy=Math.cos(P.yaw),dx=sy*mz-cy*mx,dz=cy*mz+sy*mx,k=1-Math.exp(-dt*3.5);
  P.vx+=(dx*spd-P.vx)*k;P.vz+=(dz*spd-P.vz)*k;
  // correnteza do rio empurra rio abaixo
  if(lagoR(P.x,P.z)>1){const q=rioPerto(P.x,P.z);if(q.d<RIO.larg(q.s)){const c=lerp(0.55,0.25,q.s);P.x+=q.dx*c*dt;P.z+=q.dz*c*dt;}}
  const px0=P.x,pz0=P.z;P.x+=P.vx*dt;P.z+=P.vz*dt;collide(P,0.35,c=>!c.portao&&!(c.y1!==undefined&&c.y0>niv+0.2));
  if(!dentroMapa(P.x,P.z)){voltarMapa(P,px0,pz0);P.vx*=0.3;P.vz*=0.3;}
  P.y=niv-1.32;P.vy=0;P.noChao=false;P.air=0;P.coyote=0;
  const sp=Math.hypot(P.vx,P.vz),mov=sp>0.3;
  P.energia=Math.max(0,P.energia-(rapido&&mov?7:mov?0.9:0.3)*dt);
  if(P.energia<=0.5){P.vida-=4.5*dt;nadoBolhaT-=dt;if(nadoBolhaT<=0){nadoBolhaT=0.8;sfx('bolhas',P.x,P.z,0.6);}if(!G.dicas.afogando){G.dicas.afogando=1;toast('alerta','Você está se afogando! Sem energia não dá para nadar: vá para a parte rasa.');}if(P.vida<=0){G.causa='afogado';morrer();}}
  else if(P.energia>20)G.dicas.afogando=0;
  nadoBarulhoT-=dt;if(nadoBarulhoT<=0&&mov){nadoBarulhoT=rapido?0.45:0.9;barulho(P.x,P.z,rapido?11:6,true,niv);sfx('nado',undefined,undefined,rapido?0.45:0.3);}
  P.recuo=Math.max(0,P.recuo-dt*6);P.shake=Math.max(0,P.shake-dt*3);P.flash=Math.max(0,P.flash-dt);P.hurt=Math.max(0,P.hurt-dt);P.cd-=dt;
  P.acao=null;P.aim=0;IN.atkQ=false;P.agK=0;P.molhado=1;
  sobreviver(dt,rapido);
  let bodyT=mov?Math.atan2(P.vx,P.vz):P.yaw;if(cfg.cam==='1')bodyT=P.yaw;P.body=angLerp(P.body,bodyT,1-Math.exp(-dt*5));
  P.amp=approach(P.amp,mov?1:0.3,dt*3);P.ph+=dt*(rapido?7:4.2);
  const ch=P.ch,inc=mov?1.32:0.35,bx=Math.sin(P.body),bz=Math.cos(P.body),rec=mov?0.8:0.15;
  ch.x=P.x-bx*rec;ch.z=P.z-bz*rec;ch.y=niv-(mov?0.3:1.18)+Math.sin(G.t*2.1)*0.03;ch.yaw=P.body;ch.pitch=inc;poseNado(ch.r,P.ph,mov);
  return true;}
function poseNado(o,ph,mov){o.fill(0);const s=Math.sin(ph),c=Math.cos(ph);
  if(mov){S3(o,2,-0.85,0,0);S3(o,1,-0.15,0,0);
    S3(o,3,-1.6-1.35*s,0,-0.3);S3(o,4,-0.35+0.3*c,0,0);S3(o,5,-1.6+1.35*s,0,0.3);S3(o,6,-0.35-0.3*c,0,0);
    S3(o,7,0.25*Math.sin(ph*2.2),0,0);S3(o,8,0.35+0.25*Math.cos(ph*2.2),0,0);S3(o,9,-0.25*Math.sin(ph*2.2),0,0);S3(o,10,0.35-0.25*Math.cos(ph*2.2),0,0);}
  else{S3(o,3,-0.6-0.4*s,0,-0.9);S3(o,4,-0.4,0,0);S3(o,5,-0.6+0.4*s,0,0.9);S3(o,6,-0.4,0,0);S3(o,7,-0.4+0.3*s,0,0);S3(o,8,0.7,0,0);S3(o,9,-0.4-0.3*s,0,0);S3(o,10,0.7,0,0);}}
/* zumbis e bichos na água */
function zChaoAgua(z,cz){if(!z.afogado||!RIO.ok)return cz;const n=aguaNivel(z.x,z.z);if(n===null)return cz;
  if(P.nada&&(z.st==='caca'||z.st==='golpe')&&Math.hypot(P.x-z.x,P.z-z.z)<14)return Math.max(cz,n-1.45);return cz;}
/* zumbi comum no fundo não alcança quem nada por cima (o afogado sobe e alcança) */
function zAlcanca(z){if(Math.abs(P.y-z.y)>=1.7)return false;if(P.nada&&!z.afogado&&RIO.ok&&aguaProf(z.x,z.z)>1.45)return false;return true;}
function zVelAgua(z){const n=RIO.ok?aguaNivel(z.x,z.z):null;if(n===null||z.y>n-0.2)return naAgua(z.x,z.y,z.z)?0.55:1;if(z.afogado)return 1.15;return n-z.y>1.1?0.42:0.62;}
/* ---------- beira d'água: beber, encher garrafas e pescar ---------- */
INTERS.push(tryIt=>{if(!RIO.ok||P.nada||CARRO.ativo||!P.alive)return;
  if(P.pesca){tryIt({k:'pescaPuxar',o:P.pesca},P.pesca.x,P.pesca.z,40,99,-2,P.pesca.y);return;}
  if(!aguaPerto(P.x,P.z,4))return;const fx=Math.sin(P.body),fz=Math.cos(P.body);
  for(const d of[0.8,1.5,2.3]){const x=P.x+fx*d,z=P.z+fz*d,n=aguaNivel(x,z);if(n!==null&&Math.abs(n-P.y)<1.4&&n-ground(x,z)>0.15){tryIt({k:'aguaRio',o:{x,y:n,z}},x,z,2.6,1.3,-0.4,n);return;}}
  const n0=aguaNivel(P.x,P.z);if(n0!==null&&n0>P.y+0.12)tryIt({k:'aguaRio',o:{x:P.x,y:n0,z:P.z}},P.x,P.z,1,1.3);});
const segurandoVara=()=>{const s=selItem();return s&&s.id==='vara';};
INTER_K.aguaRio={texto:o=>{if(segurandoVara())return{t:'Pescar',s:lagoR(o.x,o.z)<1?'no lago o peixe morde mais rápido':'jogue a linha e espere morder'};
    const g=invCount('garrafa'),c=cantisPraEncher(true);return g||c?{t:'Encher '+[g?g+(g>1?' garrafas':' garrafa'):'',c?(c>1?c+' cantis':'o cantil'):''].filter(Boolean).join(' e '),s:'água suja: ferva na fogueira ou use pastilha'}:{t:'Beber água do rio',s:'água suja: pode dar dor de barriga'};},
  usar:o=>{if(segurandoVara()){pescaComecar(o);return;}const g=invCount('garrafa'),c=cantisEncher(true);
    if(g||c){if(g){invRemove('garrafa',g);const l=invAdd('aguaSuja',g);if(l)soltarItens([['aguaSuja',l]],P.x,P.z,P.y);}feed('Encheu '+[g?g+(g>1?' garrafas':' garrafa'):'',c?(c>1?c+' cantis':'o cantil'):''].filter(Boolean).join(' e ')+' com água suja');dica('aguaSuja','corpo','Água suja: ferva na fogueira (segure E perto do fogo) ou use pastilha de cloro. Bebida assim pode dar dor de barriga.');}
    else{P.sede=Math.min(100,P.sede+22);if(Math.random()<0.3*(cfg.dif==='facil'?0.6:1))P.intox=Math.max(P.intox||0,180+Math.random()*120);feed('Bebeu água do rio');}
    sfx('pegar');hudBarra();invRender();}};
/* ---------- pesca ---------- */
function pescaComecar(o){if(P.pesca)return;const lago=lagoR(o.x,o.z)<1,noite=(E.n||0)>0.5;
  P.pesca={x:o.x,y:o.y,z:o.z,t:0,morde:((lago?4:7)+Math.random()*(lago?8:12)*(noite?1.4:1)*(G.chuva>0.4?0.7:1))*peixeMult(),mordeu:false,janela:0,px:P.x,pz:P.z};
  sfx('lancar',o.x,o.z,0.5);feed('Linha na água. Espere morder e aperte E.');}
function updatePesca(dt){const p=P.pesca;if(!p)return;if(!P.alive||P.nada||CARRO.ativo||!segurandoVara()||Math.hypot(P.x-p.px,P.z-p.pz)>1.5||G.modo!=='jogo'){P.pesca=null;return;}
  p.t+=dt;if(!p.mordeu&&p.t>=p.morde){p.mordeu=true;p.janela=1.5;sfx('mordePeixe',p.x,p.z,0.8);RINGS.push({x:p.x,z:p.z,y:p.y+0.02,a:0});feed('Mordeu! Aperte E!');}
  if(p.mordeu){p.janela-=dt;if(p.janela<=0){feed('O peixe escapou',true);P.pesca=null;}}}
INTER_K.pescaPuxar={texto:p=>p.mordeu?{t:'Puxar o peixe!',s:'agora!'}:{t:'Pescando...',s:'toque para recolher a linha'},
  usar:p=>{const s=selItem();if(p.mordeu&&p.janela>0){const r=Math.random(),it=r<0.84?'peixeCru':r<0.93?'sucata':'garrafa';ganhar(it,1);sfx('puxar',p.x,p.z,0.6);if(s&&s.id==='vara')gastar(s,1);
      if(it==='peixeCru'){ganharXP(4);progresso('pesca');if(typeof diarioConta==='function')diarioConta('peixes',1);dica('peixe','corpo','Peixe! Asse na fogueira: segure E perto do fogo.');}else feed('Veio lixo no anzol',true);}
    else feed('Recolheu a linha');P.pesca=null;}};
DESENHO.alfa.push(()=>{const p=P.pesca;if(!p)return;const bob=p.mordeu?Math.sin(G.t*30)*0.05-0.05:Math.sin(G.t*2.5)*0.015;bb(p.x,p.y+0.04+bob,p.z,0.07,0.95,0.25,0.2,1);bb(p.x,p.y+0.09+bob,p.z,0.045,0.95,0.95,0.95,1);});
PASSOS.push(updatePesca);
/* ---------- tela embaixo d'água e o rio no minimapa ---------- */
let aguaTelaV=false;
HUDS.push(()=>{const el=$('tela-agua');if(!el||!RIO.ok)return;const n=aguaNivel(cam.pos[0],cam.pos[2]),em=n!==null&&cam.pos[1]<n-0.02&&G.modo==='jogo';if(em!==aguaTelaV){aguaTelaV=em;el.hidden=!em;}});
MAPA_DESENHOS.push((g,X,Y,k,n)=>{if(!RIO.ok)return;g.strokeStyle=n>0.5?'#1d3346':'#3f7fb8';g.lineCap='round';g.lineJoin='round';
  g.lineWidth=Math.max(2,RIO.larg(0.5)*2*k);g.beginPath();RIO.pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke();
  g.fillStyle=n>0.5?'#1d3346':'#3f7fb8';g.beginPath();g.ellipse(X(LAGO.x),Y(LAGO.z),LAGO.a*k,LAGO.b*k,0,0,Math.PI*2);g.fill();
  g.fillStyle=n>0.5?'#24331f':'#4d6b3a';g.beginPath();g.arc(X(LAGO.ilha.x),Y(LAGO.ilha.z),LAGO.ilha.r*k,0,Math.PI*2);g.fill();
  g.fillStyle=n>0.5?'#555':'#9a978f';g.fillRect(X(PONTE.x-PONTE.hw),Y(PONTE.z-PONTE.hd),PONTE.hw*2*k,PONTE.hd*2*k);});
/* ---------- sons ---------- */
Object.assign(SONS,{
  mergulho:({noise,tone,eco})=>{noise(0.7,'lowpass',1800,220,0.7,0.9);noise(0.35,'bandpass',900,400,1.2,0.5,0.05);tone(0.25,'sine',120,60,0.3);eco(0.4);},
  nado:({noise,r})=>{noise(0.32,'bandpass',700*r(),300,1.1,0.35);noise(0.2,'highpass',2600,1800,1,0.12,0.12);},
  bolhas:({tone})=>{for(let i=0;i<5;i++)tone(0.06,'sine',300+Math.random()*500,600+Math.random()*600,0.12,i*0.07+Math.random()*0.03);},
  lancar:({noise,tone})=>{noise(0.25,'bandpass',1800,700,2,0.25);tone(0.12,'sine',300,200,0.08,0.3);noise(0.15,'lowpass',900,300,1,0.25,0.35);},
  mordePeixe:({noise,tone})=>{noise(0.18,'lowpass',1200,300,1,0.6);tone(0.06,'square',1800,1600,0.08);tone(0.06,'square',1800,1600,0.08,0.1);},
  puxar:({noise,tone})=>{noise(0.45,'bandpass',2200,900,3,0.3);noise(0.3,'lowpass',1400,300,1,0.5,0.25);tone(0.15,'sine',500,300,0.08,0.3);}});
