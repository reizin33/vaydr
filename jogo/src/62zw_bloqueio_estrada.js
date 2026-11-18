/* ================= Bloqueio da quarentena e a estrada largada (v10.3.4, 18/11/2026) =================
   Etapa 3 do plano combinado com o Himalaia (1 movimento, 2 clima, 3 mundo largado). Na estrada, logo antes do corredor de
   tapume da entrada da cidade, ficou o bloqueio que o Exército montou para segurar a quarentena:
   · muros de sacos de areia dos dois lados da pista e barreiras de concreto em zigue-zague, 10 m uma fileira da outra: o carro
     passa costurando, primeiro pela pista da direita (sul), depois pela da esquerda (norte); tambores, o blindado parado no acostamento do lado de dentro
     e o caminhão-baú do outro lado;
   · malas, caixas e sacos largados no asfalto (o povo foi revistado ali), dois carros queimados que ficaram esperando para sair
     da cidade (dá para revistar o porta-malas) e uma caixa militar atrás dos sacos de areia (munição, ração, curativo...);
   · na estrada toda, da clareira até a cidade: poeira e terra cobrindo o asfalto em manchas e mato nascendo na beira e no meio.
   Os modelos são os mesmos da Base Militar (escaneados). A colisão deles e o mato entram depois da mata nascer: a mata não muda
   e os jogos salvos continuam valendo. */
const BLOQ={nome:'Bloqueio da quarentena',info:null};
/* coordenadas da pista: x ao longo da estrada e v para o lado (+ = norte); giros na convenção do mat() */
const bloqAng=x=>Math.atan2(roadZ(x+1)-roadZ(x-1),2);
function bloqP(x,v){const a=bloqAng(x);return[x-v*Math.sin(a),roadZ(x)+v*Math.cos(a)];}
const bloqAo=x=>-bloqAng(x),bloqComp=x=>Math.PI/2-bloqAng(x),bloqTrav=x=>-(Math.PI/2+bloqAng(x));   // modelo com x ao longo / com z ao longo / atravessado
/* os modelos escaneados entram na lista de lugares (desenho, limpeza do mato em volta); a altura sai do chão embaixo deles */
function bloqLugar(id,m,x,v,yaw,o){if(typeof LUGX==='undefined'||!LUGX[m])return null;const p=bloqP(x,v),L=Object.assign({id:'bq_'+id,m,nome:BLOQ.nome,x:p[0],z:p[1],yaw,dist:150,semChao:true},o||{});
  let s=0,n=0;const R=lugRet(L,0);for(let u=-0.5;u<=0.5;u+=0.25)for(let w=-0.5;w<=0.5;w+=0.25){const q=lugMundo(L,u*2*R.hx,w*2*R.hz);s+=ground(q[0],q[1]);n++;}L.y=s/n;
  LUGARES.push(L);if(typeof LUG!=='undefined')LUG.info[L.id]={x:L.x,z:L.z,y:+L.y.toFixed(2)};return L;}
const BLOQ_LUG=[];
(function bloqMontar(){if(typeof LUGARES==='undefined'||typeof roadZ!=='function')return;const A=bloqAo,C=bloqComp,T=bloqTrav,add=(...a)=>{const L=bloqLugar(...a);if(L)BLOQ_LUG.push(L);};
  // sacos de areia: dois trechos de cada lado, encostados na beira da pista
  add('sacos0','sacosAreia',143.2,4.4,A(143.2));add('sacos1','sacosAreia',147.9,4.4,A(147.9),{limpa:1});
  add('sacos2','sacosAreia',149.6,-4.4,A(149.6));add('sacos3','sacosAreia',154.3,-4.4,A(154.3),{limpa:1});
  // barreiras em zigue-zague: a de cá fecha a pista do norte, a de lá a do sul (3 m de passagem em cada uma)
  add('barr0','barreira',145,0.95,T(145));add('barr1','barreira',145,2.5,T(145));   // 10 m entre uma fileira e outra: dá para o carro costurar
  add('barr2','barreira',155.5,-0.95,T(155.5));add('barr3','barreira',155.5,-2.5,T(155.5));
  add('barr4','barreira',140.6,-3.6,A(140.6)+0.5);add('barr5','barreira',158.6,3.4,A(158.6)-0.4);   // empurradas para a beira
  // tambores e a caixa militar (atrás dos sacos do norte, no fim do muro)
  add('tambor0','tambor',142.2,5.6,0.3);add('tambor1','tambor',142.9,6.0,1.1);add('tambor2','tambor',155.6,-5.3,0.6);
  add('caixa','caixaMilitar',150.6,6.1,A(150.6)+0.25);
  // o blindado no acostamento do norte e o caminhão-baú do sul, já dentro do corredor da entrada
  add('blindado','blindado',160.5,5.8,C(160.5)+Math.PI);add('bau','caminhaoBau',163.2,-5.6,A(163.2)+Math.PI,{limpa:1});
  // os dois carros que ficaram esperando para sair (virados para fora da cidade)
  add('carro0','carroDestruido',167.4,4.3,A(167.4)+Math.PI+0.08);add('carro1','carroDestruido',170.6,-3.7,A(170.6)+Math.PI-0.12);})();

/* depois da mata: colisão dos modelos, os pontos de revistar, a tralha largada e o mato na estrada */
function bloqColisao(){let n=0;for(const q of BLOQ_PLACA.placas){colBox(q.x,q.z,1.3,0.12,q.yaw,{solid:true,y0:-0.2,y1:2.4});n++;}for(const L of BLOQ_LUG){const X=LUGX[L.m];if(!X)continue;for(const b of X.col||[]){const p=lugMundo(L,b[0],b[1]);colBox(p[0],p[1],b[2],b[3],L.yaw,{lugar:L.id});n++;}}return n;}
function bloqSaque(){const cx=BLOQ_LUG.find(L=>L.id==='bq_caixa');if(cx){const p=lugMundo(cx,0,-0.95);interAdd({id:'bloq-caixa',kind:'bau',x:p[0],z:p[1],label:'Revistar a caixa militar',tabela:'militar',respawn:4});}
  for(const k of['0','1']){const L=BLOQ_LUG.find(q=>q.id==='bq_carro'+k);if(!L)continue;const p=lugMundo(L,-2.7,0);interAdd({id:'bloq-carro'+k,kind:'bau',x:p[0],z:p[1],label:'Revistar o porta-malas',tabela:'carro',respawn:4});}}
function bloqTralha(){if(typeof prpOk!=='function'||!prpOk())return 0;const R=rng(14141);let n=0;
  const M=(id,x,v,yaw,rx,dy)=>{if(!prpTem(id))return;const p=bloqP(x,v);prpReg(PRP.mundo,id,p[0],ground(p[0],p[1])+(dy||0),p[1],yaw,[1,1,1],rx||0,0,0.5,90);n++;};
  for(let i=0;i<6;i++)M('mala',145+R()*15,(R()-0.5)*4.2,R()*6.283,R()<0.4?Math.PI/2:0,R()<0.4?0.12:0);
  for(let i=0;i<4;i++)M('caixaPapelao',144+R()*16,(R()-0.5)*4.6,R()*6.283);
  for(let i=0;i<5;i++)M('sacoLixo',143+R()*18,(R()<0.5?-1:1)*(2.4+R()*1.4),R()*6.283);
  M('lixeiraVelha',158.8,-3.4,1.2,Math.PI/2,0.3);
  return n;}
/* mato na beira e nas rachaduras do asfalto (entra no fim da lista do capim: só enfeite, nada é salvo) */
function bloqMato(){const R=rng(23232);let n=0;
  for(let x=14;x<170;x+=0.9+R()*1.6){const r=R();let v;if(r<0.62)v=(R()<0.5?-1:1)*(2.15+R()*0.8);else if(r<0.82)v=(R()-0.5)*0.5;else v=(R()-0.5)*4.4;
    const p=bloqP(x,v);if(typeof aguaPerto==='function'&&aguaPerto(p[0],p[1],0.6))continue;if(pointBlocked(p[0],p[1],0.3))continue;
    const k=1+(R()<0.35?1:0);for(let j=0;j<k;j++){const q=[p[0]+(R()-0.5)*0.6,p[1]+(R()-0.5)*0.6];GRASS.push({x:q[0],z:q[1],y:ground(q[0],q[1])-0.02,r:R()*6.283,s:0.45+R()*0.45,t:0.7+R()*0.35});n++;}}
  return n;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);const info={};
  try{info.col=bloqColisao();}catch(e){console.error('bloqueio (colisão)',e);}
  try{bloqSaque();}catch(e){console.error('bloqueio (saque)',e);}
  try{info.tralha=bloqTralha();}catch(e){console.error('bloqueio (tralha)',e);}
  try{info.mato=bloqMato();}catch(e){console.error('bloqueio (mato)',e);}
  info.modelos=BLOQ_LUG.length;BLOQ.info=info;return r;};}
/* poeira e terra no asfalto, em manchas (o mesmo canal de terra das trilhas no mapa do chão) */
{const _sd=splatData;splatData=function(){const D=_sd.apply(this,arguments);
  try{const S=SPLAT_S,H=SPLAT_H,ts=2*H/S,R=rng(98989),put=(i,j,v)=>{if(i<0||j<0||i>=S||j>=S)return;const o=(j*S+i)*4+1,b=Math.round(clamp(v,0,1)*255);if(b>D[o])D[o]=b;};
    for(let x=12;x<170;x+=2+R()*4){if(R()<0.4)continue;const v=(R()-0.5)*4.2,c=bloqP(x,v),r=0.7+R()*1.8,k=0.35+R()*0.4,ax=0.6+R()*1.4;
      const i0=Math.floor((c[0]-r*2+H)/ts),i1=Math.ceil((c[0]+r*2+H)/ts),j0=Math.floor((c[1]-r*2+H)/ts),j1=Math.ceil((c[1]+r*2+H)/ts);
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x2=-H+(i+0.5)*ts,z2=-H+(j+0.5)*ts,dx=(x2-c[0])/ax,dz=z2-c[1],d=Math.hypot(dx,dz)+(vnoise(x2*1.3,z2*1.3)-0.5)*0.9;put(i,j,smooth(r,r*0.35,d)*k);}}}
  catch(e){console.error('bloqueio (poeira no asfalto)',e);}return D;};}
/* as placas do bloqueio, pintadas a spray numa chapa branca em dois paus: a de quem chega da mata ("QUARENTENA / PROIBIDA A
   ENTRADA") e a de quem sai da cidade ("ÁREA INFECTADA / PARE PARA REVISTA"). Letras numa textura feita na hora (como as
   pichações da cidade), com escorrido e falha do spray */
const BLOQ_PLACA={frases:['QUARENTENA','PROIBIDA A ENTRADA','ÁREA INFECTADA','PARE PARA REVISTA'],cores:[0x9a1f1a,0x161514,0x9a1f1a,0x161514],url:null,tex:null,larg:[1,1,1,1],malha:null,tmalha:null,placas:[]};
function bloqPlacaAtlas(){const cv=document.createElement('canvas');cv.width=1024;cv.height=512;const c=cv.getContext('2d'),R=rng(5151),FT='"Arial Black","Impact","Arial",sans-serif';
  c.fillStyle='#fff';c.strokeStyle='#fff';c.lineCap='round';
  BLOQ_PLACA.frases.forEach((t,i)=>{const y0=i*128;let px=i%2?70:96;c.font='900 '+px+'px '+FT;let w=c.measureText(t).width;if(w>990){px=Math.floor(px*990/w);c.font='900 '+px+'px '+FT;w=c.measureText(t).width;}
    const x0=(1024-w)/2,yb=y0+18+px*0.8;c.save();c.beginPath();c.rect(0,y0,1024,128);c.clip();c.shadowColor='#fff';c.shadowBlur=4;for(let k=0;k<3;k++)c.fillText(t,x0+(R()-0.5)*3,yb+(R()-0.5)*3);c.shadowBlur=0;
    for(let k=0;k<Math.floor(w/45);k++){const x=x0+R()*w,y1=Math.min(y0+124,yb+6+R()*22),lw=2+R()*2.5;c.lineWidth=lw;c.beginPath();c.moveTo(x,yb-6);c.lineTo(x,y1);c.stroke();}
    c.globalCompositeOperation='destination-out';for(let k=0;k<Math.floor(w*0.3);k++){c.beginPath();c.arc(x0+R()*w,y0+8+R()*112,0.8+R()*2.2,0,6.2832);c.fill();}
    c.globalCompositeOperation='source-over';c.restore();});
  return cv.toDataURL('image/png');}
/* onde ficam: na beira da pista, de frente para quem chega (x, v, para que lado olha: -1 oeste, +1 leste, e quais frases) */
(function(){if(typeof roadZ!=='function')return;for(const[x,v,lado,f]of[[138.6,-5.2,-1,0],[166.2,7.6,1,2]]){const a=bloqAng(x),p=bloqP(x,v),dx=lado*Math.cos(a),dz=lado*Math.sin(a);
  BLOQ_PLACA.placas.push({x:p[0],z:p[1],y:ground(p[0],p[1]),yaw:Math.atan2(dx,dz),f,tilt:(lado<0?0.04:-0.05)});}})();
function bloqPlacaGeo(){const g=new GB(1<<10,8),R=rng(4040);for(const q of BLOQ_PLACA.placas){const B=mat(q.x,q.y,q.z,0,q.yaw,q.tilt);
    for(const s of[-1,1])add(g,boxTris(0.09,2.3,0.09),mm(B,mat(s*1.05,1.1,-0.06)),lin(0x5b4330),{j:0.12,rnd:R});
    add(g,boxTris(2.6,1.35,0.04),mm(B,mat(0,1.62,0)),mixc(lin(0xd2ccbd),lin(0xb9b2a2),R()),{j:0.06,rnd:R});
    for(let k=0;k<6;k++){const bx=(k%2?1:-1)*(0.95+R()*0.25),by=k<2?1.0+R()*0.08:k<4?2.2+R()*0.08:1.3+R()*0.6;add(g,boxTris(0.18+R()*0.3,0.1+R()*0.18,0.044),mm(B,mat(bx,by,0)),lin(0x8a6c4c));}   // ferrugem nos cantos e na beirada da chapa (longe das letras)
}
  return litMesh(g.data());}
function bloqPlacaTexto(){const n=BLOQ_PLACA.placas.length*2;if(!n)return null;const f=new Float32Array(n*66),uv=new Float32Array(n*12),M=M4();let i=0;
  for(const q of BLOQ_PLACA.placas){trs(M,q.x,q.y,q.z,0,q.yaw,q.tilt,1,1,1);const nx=Math.sin(q.yaw),nz=Math.cos(q.yaw);
    for(const lin2 of[0,1]){const fi=q.f+lin2,c=lin(BLOQ_PLACA.cores[fi]),W=lin2?2.3:2.4,H=lin2?0.42:0.56,y=lin2?1.04:1.5,v0=fi/4,v1=(fi+1)/4;
      const cs=[[-W/2,y,0,v1],[W/2,y,1,v1],[W/2,y+H,1,v0],[-W/2,y,0,v1],[W/2,y+H,1,v0],[-W/2,y+H,0,v0]];
      cs.forEach(([lx,ly,uu,vv],k)=>{const o=(i*6+k)*11,lz=0.03,X=M[0]*lx+M[4]*ly+M[8]*lz+M[12],Y=M[1]*lx+M[5]*ly+M[9]*lz+M[13],Z=M[2]*lx+M[6]*ly+M[10]*lz+M[14];
        f[o]=X;f[o+1]=Y;f[o+2]=Z;f[o+3]=c[0];f[o+4]=c[1];f[o+5]=c[2];f[o+6]=0;f[o+7]=0;f[o+8]=nx;f[o+9]=0;f[o+10]=nz;uv[(i*6+k)*2]=uu;uv[(i*6+k)*2+1]=vv;});i++;}}
  return texMesh(f,uv,BLOQ_PLACA.tex);}
const _MBLOQ=M4();
DESENHO.opaco.push(function bloqPlacaDesenho(Pg){if(!BLOQ_PLACA.placas.length||cam.pos[1]<SUB_FUNDO||d2(cam.pos[0],cam.pos[2],152,7)>170*170)return;
  try{if(!BLOQ_PLACA.malha)BLOQ_PLACA.malha=bloqPlacaGeo();trs(_MBLOQ,0,0,0,0,0,0,1,1,1);drawStat(Pg,BLOQ_PLACA.malha,_MBLOQ);
    if(!Pg.u.uUseTex)return;if(!BLOQ_PLACA.tex){const t=skTextura(BLOQ_PLACA.url||(BLOQ_PLACA.url=bloqPlacaAtlas()),true,()=>{t.pronta=true;});BLOQ_PLACA.tex=t;}if(!BLOQ_PLACA.tex.pronta)return;
    if(!BLOQ_PLACA.tmalha)BLOQ_PLACA.tmalha=bloqPlacaTexto();const m=BLOQ_PLACA.tmalha;if(!m)return;
    gl.uniformMatrix4fv(Pg.u.uModel,false,ID);gl.bindVertexArray(m.vao);gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,BLOQ_PLACA.tex);gl.activeTexture(gl.TEXTURE0);
    gl.uniform1f(Pg.u.uUseTex,2);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-4);gl.drawArrays(gl.TRIANGLES,0,m.count);gl.disable(gl.POLYGON_OFFSET_FILL);gl.uniform1f(Pg.u.uUseTex,0);}
  catch(e){BLOQ_PLACA.placas.length=0;console.error('bloqueio (placas)',e);}});
DESENHO.sombra.push(function bloqPlacaSombra(Pg){if(!BLOQ_PLACA.malha||d2(P.x,P.z,152,7)>120*120)return;trs(_MBLOQ,0,0,0,0,0,0,1,1,1);drawStat(Pg,BLOQ_PLACA.malha,_MBLOQ);});
