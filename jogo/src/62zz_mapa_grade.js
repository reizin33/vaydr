/* ================= Mapa com grade, escala, ruínas e o bloqueio (v10.3.7, 18/11/2026) =================
   Etapa 3 (mundo largado), a terceira das opções que o Himalaia topou ("pode continuar"). O mapa grande (M) continua com tudo o
   que já tinha e ganha:
   · grade de 100 em 100 m, com letras nas colunas (de oeste para leste) e números nas linhas (de norte para sul): dá para
     combinar um lugar ("a caixa está no D4"), e o alto do mapa diz em que quadrado você está;
   · barra de escala (0, 50 e 100 m) no canto de baixo;
   · as ruínas da cidade: a faixa por onde cada prédio alto tombou, os esqueletos de concreto e o prédio que desabou em
     panqueca (entulho riscado); e o Bloqueio da quarentena na estrada, com a barreira listrada e o nome;
   · a legenda ganha "Ruína" e "Bloqueio". */
const MAPA_GRADE={passo:100,x0:0,z0:0};
const mapaLetra=i=>i<26?String.fromCharCode(65+i):String.fromCharCode(65+Math.floor(i/26)-1)+String.fromCharCode(65+i%26);
/* quadrado da grade de um ponto (com a origem do último desenho do mapa) */
function mapaQuadro(x,z){const G_=MAPA_GRADE;return mapaLetra(Math.max(0,Math.floor((x-G_.x0)/G_.passo)))+(Math.floor((z-G_.z0)/G_.passo)+1);}
/* entulho riscado dentro do caminho atual */
function mapaRiscar(g,x0,y0,x1,y1,passo,cor,lw){g.save();g.clip();g.strokeStyle=cor;g.lineWidth=lw;g.beginPath();
  for(let t=x0-(y1-y0);t<x1;t+=passo){g.moveTo(t,y1);g.lineTo(t+(y1-y0),y0);}g.stroke();g.restore();}
/* ---------- grade, rótulos e escala ---------- */
MAPA_SOBRE.push(function mapaGrade(g,X,Y,k,dp,Wd){const st=MAPA_GRADE.passo,wx=px=>(px-X(0))/k,wz=py=>(py-Y(0))/k;
  const xa=wx(0),xb=wx(Wd),za=wz(0),zb=wz(Wd);let gx0=Math.floor(xa/st)*st,gz0=Math.floor(za/st)*st;
  if(X(gx0+st)<18*dp)gx0+=st;if(Y(gz0+st)<26*dp+18*dp)gz0+=st;   // a tira cortada na beira do mapa não leva letra: a grade começa no primeiro quadrado que aparece
  MAPA_GRADE.x0=gx0;MAPA_GRADE.z0=gz0;
  g.save();g.strokeStyle='rgba(236,228,210,0.13)';g.lineWidth=Math.max(1,dp);g.beginPath();
  for(let x=gx0+st;x<xb;x+=st){const p=Math.round(X(x))+0.5;g.moveTo(p,0);g.lineTo(p,Wd);}
  for(let z=gz0+st;z<zb;z+=st){const p=Math.round(Y(z))+0.5;g.moveTo(0,p);g.lineTo(Wd,p);}g.stroke();
  // letras no alto (menos onde fica o N) e números na esquerda, no meio de cada quadrado
  g.font=`700 ${Math.round(10.5*dp)}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.lineWidth=3*dp;g.strokeStyle='rgba(7,10,9,.8)';g.fillStyle='rgba(236,228,210,.62)';
  // (o rótulo vai no meio da parte que aparece do quadrado: o da beira, cortado pelo mapa, também ganha o dele)
  for(let i=0,x=gx0;x<xb;i++,x+=st){const a=Math.max(X(x),0),b=Math.min(X(x+st),Wd),c=(a+b)/2;if(b-a<18*dp||Math.abs(c-Wd/2)<16*dp)continue;const t=mapaLetra(i);g.strokeText(t,c,13*dp);g.fillText(t,c,13*dp);}
  for(let j=0,z=gz0;z<zb;j++,z+=st){const a=Math.max(Y(z),26*dp),b=Math.min(Y(z+st),Wd-40*dp),c=(a+b)/2;if(b-a<18*dp)continue;const t=String(j+1);g.strokeText(t,11*dp,c);g.fillText(t,11*dp,c);}
  // escala: 0, 50 e 100 m (200 m se o mapa estiver muito pequeno)
  const m=100*k<60*dp?200:100,L=m*k,x0=16*dp,y0=Wd-20*dp,h=5*dp;
  g.fillStyle='rgba(7,10,9,.55)';g.fillRect(x0-6*dp,y0-20*dp,L+40*dp,30*dp);
  g.fillStyle='#ece4d2';g.fillRect(x0,y0,L/2,h);g.fillStyle='#2c2a26';g.fillRect(x0+L/2,y0,L/2,h);g.strokeStyle='#ece4d2';g.lineWidth=Math.max(1,dp);g.strokeRect(x0+0.5,y0+0.5,L,h);
  g.font=`700 ${Math.round(10*dp)}px system-ui,sans-serif`;g.textBaseline='alphabetic';g.fillStyle='#ece4d2';
  g.textAlign='left';g.fillText('0',x0-1*dp,y0-4*dp);g.textAlign='center';g.fillText(String(m/2),x0+L/2,y0-4*dp);g.textAlign='left';g.fillText(m+' m',x0+L-4*dp,y0-4*dp);
  g.restore();
  const el=$('mapa-onde');if(el)el.textContent='Você está no '+mapaQuadro(P.x,P.z);});
/* ---------- ruínas da cidade ---------- */
MAPA_SOBRE.push(function mapaRuinas(g,X,Y,k,dp){if(typeof CAOS==='undefined'||!CAOS.ruinas||!CAOS.ruinas.length)return;const R=CAOS.ruinas,cor='#4d4741',risco='rgba(20,18,16,.75)',lw=Math.max(1,0.9*dp);
  g.save();g.lineJoin='round';
  for(let i=0;i<R.length;i++){const r=R[i];
    if(r.tipo==='torre'&&R[i+1]&&R[i+1].tipo==='torre (quebra)'){const q=R[i+1];i++;   // o toco em pé e o prédio deitado até onde ele quebrou
      const ax=X(r.x),ay=Y(r.z),bx=X(q.x),by=Y(q.z),L=Math.hypot(bx-ax,by-ay)||1,hw=Math.max(3*dp,4.2*k),nx=-(by-ay)/L*hw,ny=(bx-ax)/L*hw;
      g.beginPath();g.moveTo(ax+nx,ay+ny);g.lineTo(bx+nx*1.15,by+ny*1.15);g.lineTo(bx-nx*1.15,by-ny*1.15);g.lineTo(ax-nx,ay-ny);g.closePath();g.fillStyle=cor;g.fill();
      mapaRiscar(g,Math.min(ax,bx)-hw*2,Math.min(ay,by)-hw*2,Math.max(ax,bx)+hw*2,Math.max(ay,by)+hw*2,3.2*dp,risco,lw);
      g.beginPath();g.moveTo(ax+nx,ay+ny);g.lineTo(bx+nx*1.15,by+ny*1.15);g.lineTo(bx-nx*1.15,by-ny*1.15);g.lineTo(ax-nx,ay-ny);g.closePath();g.strokeStyle='rgba(7,10,9,.85)';g.lineWidth=1.2*dp;g.stroke();
      g.fillStyle='#8a8278';g.beginPath();g.arc(ax,ay,Math.max(2*dp,3*k),0,Math.PI*2);g.fill();g.stroke();continue;}
    const s=Math.max(4*dp,(r.tipo==='panqueca'?5.5:6.5)*k),x=X(r.x),y=Y(r.z);   // esqueleto e panqueca: quadrado de entulho
    g.beginPath();g.rect(x-s,y-s,s*2,s*2);g.fillStyle=r.tipo==='esqueleto'?'#5c5650':cor;g.fill();mapaRiscar(g,x-s,y-s,x+s,y+s,(r.tipo==='esqueleto'?4.5:3)*dp,risco,lw);
    g.beginPath();g.rect(x-s,y-s,s*2,s*2);g.strokeStyle='rgba(7,10,9,.85)';g.lineWidth=1.2*dp;g.stroke();}
  g.restore();});
/* ---------- bloqueio da quarentena ---------- */
function mapaBloqPonto(){if(typeof BLOQ_LUG==='undefined'||!BLOQ_LUG.length||typeof bloqP!=='function')return null;
  let sx=0;for(const L of BLOQ_LUG)sx+=L.x;const x=sx/BLOQ_LUG.length,p=bloqP(x,0);return{x:p[0],z:p[1],a:bloqAng(x)};}
MAPA_SOBRE.push(function mapaBloqueio(g,X,Y,k,dp){const b=mapaBloqPonto();if(!b)return;const x=X(b.x),y=Y(b.z),L=Math.max(18*dp,11*k),h=Math.max(5.5*dp,2*k);
  g.save();g.translate(x,y);g.rotate(b.a+Math.PI/2);   // atravessada na pista
  g.fillStyle='#ece4d2';g.fillRect(-L/2,-h/2,L,h);g.fillStyle='#c8321e';for(let i=0;i<5;i+=2)g.fillRect(-L/2+i*L/5,-h/2,L/5,h);
  g.strokeStyle='#070a09';g.lineWidth=1.2*dp;g.strokeRect(-L/2,-h/2,L,h);g.restore();});
/* o nome entra no arranjo dos nomes dos lugares (48y: em cima, embaixo, à direita ou à esquerda, sem cobrir outro nome) */
MAPA_NOMES.push(()=>{const b=mapaBloqPonto();return b?{t:'Bloqueio',x:b.x,z:b.z,px:9}:null;});
/* ---------- topo e legenda ---------- */
{const h=document.querySelector('#t-mapa .mapa-topo h2');if(h&&!$('mapa-onde'))h.insertAdjacentHTML('beforeend',' <span id="mapa-onde" class="mapa-onde"></span>');
 const lg=document.querySelector('#t-mapa .mapa-leg');if(lg&&!lg.querySelector('.leg-ruina'))lg.insertAdjacentHTML('beforeend',
  '<span class="leg-ruina"><i class="leg-q" style="background:repeating-linear-gradient(135deg,#4d4741 0 3px,#161412 3px 4.5px)"></i>Ruína</span>'+
  '<span class="leg-bloq"><i class="leg-q" style="background:repeating-linear-gradient(90deg,#c8321e 0 3px,#ece4d2 3px 6px)"></i>Bloqueio</span>');}
