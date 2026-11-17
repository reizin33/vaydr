/* ================= Pichações nas paredes da cidade (v10.2.6, 17/11/2026) =================
   Himalaia: "torne o ambiente mais pós-apocalíptico de cidade destruída mesmo". Nas paredes do térreo dos prédios dos bairros
   da cidade (os mesmos do kit, 62zc), frases pichadas com spray por quem passou por ali: SOCORRO, NÃO ENTRE, INFECTADOS, ELES
   OUVEM, RÁDIO 104,3, FOMOS PRA SERRA, DEUS NOS AJUDE, QUARENTENA. Em vermelho, preto, branco ou laranja, um pouco tortas, com
   escorrido e falhas do spray.
   · Não cobrem janela, porta, vitrine, letreiro, sacada nem escada (as mesmas regras das peças do kit) nem parede encostada em
     outro prédio; sorteio fixo por prédio (o mundo é sempre o mesmo).
   · A textura das frases é feita na hora (canvas, 1024 x 1024, uma frase por faixa de 128 px), com recorte pela transparência;
     uma malha só para a cidade toda, sem sombra, desenhada só com a câmera perto da cidade. */
const PICH={frases:['SOCORRO','NÃO ENTRE','INFECTADOS','ELES OUVEM','RÁDIO 104,3','FOMOS PRA SERRA','DEUS NOS AJUDE','QUARENTENA'],
  cores:[0x9a1f1a,0x161514,0xd6d1c4,0xb8601e],larg:[0.3,0.4,0.45,0.45,0.5,0.7,0.7,0.5],url:null,lista:[],malha:null,tex:null,box:null,dist:140,info:null};
/* o atlas: letras brancas (a cor vem da malha), com escorridos e falhas; guarda a largura usada de cada frase */
function pichAtlas(){const cv=document.createElement('canvas');cv.width=1024;cv.height=1024;const c=cv.getContext('2d'),R=rng(31337),FT='"Arial Black","Impact","Arial",sans-serif';
  c.fillStyle='#fff';c.strokeStyle='#fff';c.lineCap='round';
  PICH.frases.forEach((t,i)=>{const y0=i*128,x0=16;let px=86;c.font='900 '+px+'px '+FT;let w=c.measureText(t).width;
    if(w>980){px=Math.floor(px*980/w);c.font='900 '+px+'px '+FT;w=c.measureText(t).width;}
    const yb=y0+22+px*0.78;c.save();c.beginPath();c.rect(0,y0,1024,128);c.clip();
    c.shadowColor='#fff';c.shadowBlur=5;for(let k=0;k<3;k++)c.fillText(t,x0+(R()-0.5)*3,yb+(R()-0.5)*3);c.shadowBlur=0;
    for(let k=0;k<Math.floor(w/40);k++){const x=x0+R()*w,y1=Math.min(y0+124,yb+8+R()*26),lw=2+R()*3;c.lineWidth=lw;c.beginPath();c.moveTo(x,yb-6);c.lineTo(x,y1);c.stroke();
      c.beginPath();c.arc(x,y1,lw*0.75,0,6.2832);c.fill();}   // escorridos
    c.globalCompositeOperation='destination-out';for(let k=0;k<Math.floor(w*0.35);k++){c.beginPath();c.arc(x0+R()*w,y0+8+R()*112,0.8+R()*2.4,0,6.2832);c.fill();}   // falhas do spray
    c.globalCompositeOperation='source-over';c.restore();PICH.larg[i]=Math.min(1,(w+x0+14)/1024);});
  return cv.toDataURL('image/png');}
/* onde: até duas frases por prédio (72% dos prédios), no térreo, num trecho livre de parede com a calçada na frente */
function pichGerar(){PICH.lista.length=0;PICH.malha=null;PICH.box=null;if(typeof kitPredios!=='function'||typeof CID==='undefined'||!CID.predios||!CID.predios.length)return;
  if(!PICH.url)PICH.url=pichAtlas();   // mede as frases (a largura de cada uma decide o tamanho na parede)
  let ps=[];try{ps=kitPredios();}catch(e){return;}
  /* três faixas da parede do térreo: no meio (entre as janelas), embaixo das janelas (letra menor) e em cima das janelas do
     térreo (quem subiu em alguma coisa); depois da 1ª captura (só 7 na cidade toda) entram mais prédios e mais tentativas */
  for(const p of ps){const R=rng(77000+p.id*97);if(R()>0.72)continue;const V=kitVaos(p),ld=kitLados(p),n=R()<0.4?2:1,topo=kitTopo(p)-0.35;let feitas=0;
    for(let t=0;t<18&&feitas<n;t++){const s='FBLR'[Math.floor(R()*4)],L=ld[s],f=Math.floor(R()*PICH.frases.length),fx=R();
      const H=fx<0.4?0.78+R()*0.36:fx<0.75?0.42+R()*0.12:0.6+R()*0.25,W=H*PICH.larg[f]*8;
      const y=fx<0.4?p.y0+0.85+R()*0.75:fx<0.75?p.y0+0.12+R()*0.18:p.y0+2.3+R()*0.45;
      if(W>L.L-1.2||y+H>topo)continue;const a=0.6+W/2+R()*(L.L-1.2-W);
      if(!kitLivre(V[s],a-W/2,a+W/2,y,y+H,0.1))continue;
      const fr=L.uv(a,0.6),wf=pw(p,fr[0],fr[1]);if(pointBlocked(wf[0],wf[1],0.25))continue;   // parede encostada em outro prédio ou tapada
      V[s].push({s,a,a0:a-W/2,a1:a+W/2,y0:y,y1:y+H,k:'pich'});
      PICH.lista.push({p,s,a,y,W,H,f,cor:PICH.cores[Math.floor(R()*PICH.cores.length)],rol:(R()-0.5)*0.12});feitas++;}}
  PICH.info={n:PICH.lista.length};}
{const _gc=gerarCidade;gerarCidade=function(){const r=_gc.apply(this,arguments);try{pichGerar();}catch(e){console.error('pichações',e);}return r;};}
function pichMalha(){const n=PICH.lista.length;if(!n)return null;const f=new Float32Array(n*66),uv=new Float32Array(n*12),M=M4();let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  PICH.lista.forEach((q,i)=>{const L=kitLados(q.p)[q.s],w0=L.uv(q.a,0.03),w=pw(q.p,w0[0],w0[1]),c=lin(q.cor),v0=q.f/8,v1=(q.f+1)/8,u1=PICH.larg[q.f];
    trs(M,w[0],q.y,w[1],0,L.yaw,q.rol,1,1,1);const nx=Math.sin(L.yaw),nz=Math.cos(L.yaw);
    const cs=[[-q.W/2,0,0,v1],[q.W/2,0,u1,v1],[q.W/2,q.H,u1,v0],[-q.W/2,0,0,v1],[q.W/2,q.H,u1,v0],[-q.W/2,q.H,0,v0]];
    cs.forEach(([lx,ly,uu,vv],k)=>{const o=(i*6+k)*11,X=M[0]*lx+M[4]*ly+M[12],Y=M[1]*lx+M[5]*ly+M[13],Z=M[2]*lx+M[6]*ly+M[14];
      f[o]=X;f[o+1]=Y;f[o+2]=Z;f[o+3]=c[0];f[o+4]=c[1];f[o+5]=c[2];f[o+6]=0;f[o+7]=0;f[o+8]=nx;f[o+9]=0;f[o+10]=nz;uv[(i*6+k)*2]=uu;uv[(i*6+k)*2+1]=vv;
      x0=Math.min(x0,X);x1=Math.max(x1,X);z0=Math.min(z0,Z);z1=Math.max(z1,Z);});});
  PICH.box=[x0,x1,z0,z1];return texMesh(f,uv,PICH.tex);}
function pichDesenhar(Pg){if(!PICH.lista.length||!Pg.u.uUseTex||cam.pos[1]<SUB_FUNDO)return;
  try{if(!PICH.tex){const t=skTextura(PICH.url||(PICH.url=pichAtlas()),true,()=>{t.pronta=true;});PICH.tex=t;}if(!PICH.tex.pronta)return;
    if(!PICH.malha)PICH.malha=pichMalha();const m=PICH.malha,b=PICH.box;if(!m||!b)return;
    const cx=cam.pos[0],cz=cam.pos[2];if(Math.hypot(Math.max(b[0]-cx,0,cx-b[1]),Math.max(b[2]-cz,0,cz-b[3]))>PICH.dist)return;
    gl.uniformMatrix4fv(Pg.u.uModel,false,ID);gl.bindVertexArray(m.vao);gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,PICH.tex);gl.activeTexture(gl.TEXTURE0);
    gl.uniform1f(Pg.u.uUseTex,2);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-4);gl.drawArrays(gl.TRIANGLES,0,m.count);
    gl.disable(gl.POLYGON_OFFSET_FILL);gl.uniform1f(Pg.u.uUseTex,0);}
  catch(e){PICH.lista.length=0;console.error('pichações (desenho)',e);}}
DESENHO.opaco.push(pichDesenhar);
