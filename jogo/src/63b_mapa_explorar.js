/* ================= O mapa se desenha conforme você explora (v10.4.2, 18/11/2026) =================
   Pedido do Himalaia ("pode começar", depois da proposta do mapa que vai se completando): o mapa grande mostra só o que você já viu.
   · O mundo é dividido em quadradinhos de 8 m (NEV). Por onde você anda, tudo num raio de 45 m entra no mapa; quanto mais alto
     (telhado, torre, escalada, balão, helicóptero), mais longe: +1,5 m por metro de altura, até +200 m. Observando do mirante
     ou do alto de um prédio (G.obsAte), pelo menos 110 m. No subsolo não conta (você não está vendo a superfície).
   · Do Mirante do Alto (o Alto "mapeado") o planalto inteiro entra no mapa.
   · O que você ainda não viu fica coberto por uma névoa escura, de borda suave; nome de lugar que você não conhece não aparece
     (48y: mapaConhecido). As marcas continuam: você, o objetivo da missão, o acampamento, a torre, a mochila caída, o carro,
     eventos do rádio. O nome das regiões em que você já entrou fica por cima da névoa. No título: "· 12% explorado".
   · Conta desde o começo do jogo, mesmo antes de fabricar o mapa (63a): o mapa sai da bancada já com o que você andou.
   · Jogo salvo de antes desta versão: entram os lugares que o diário já tem como descobertos, a clareira e onde você está.
   · No modo criativo não tem névoa. Nos testes automáticos o mapa vem inteiro (window.__nevoa testa com névoa). */
const NEV={x0:-400,z0:-500,c:8,w:125,h:113,bits:null,ver:1,t:0,tudo:false,migrar:false,alto:false,mC:null,mVer:0,terra:null,terraN:0};
NEV.bits=new Uint8Array(Math.ceil(NEV.w*NEV.h/8));
const NEV_COR=[14,18,16];   // a névoa: escura e sem nada por baixo (o que você já viu se destaca)
const NEV_RAIO=45;
function nevoaAtiva(){return!NEV.tudo&&!(typeof ADM!=='undefined'&&ADM.ativo);}
function nevoaLimpa(){NEV.bits.fill(0);NEV.tudo=false;NEV.alto=false;NEV.migrar=false;NEV.ver++;}
function nevoaTudo(){NEV.bits.fill(255);NEV.tudo=true;NEV.migrar=false;NEV.ver++;}
function nevoaVistoC(a,b){if(a<0||b<0||a>=NEV.w||b>=NEV.h)return true;const i=b*NEV.w+a;return!!(NEV.bits[i>>3]&(1<<(i&7)));}
function nevoaVisto(x,z){return nevoaVistoC(Math.floor((x-NEV.x0)/NEV.c),Math.floor((z-NEV.z0)/NEV.c));}
/* revela os quadradinhos cujo centro está a até r metros de (x,z); devolve quantos eram novos */
function nevoaRevelar(x,z,r){const c=NEV.c,a0=Math.max(0,Math.floor((x-r-NEV.x0)/c)),a1=Math.min(NEV.w-1,Math.floor((x+r-NEV.x0)/c)),
  b0=Math.max(0,Math.floor((z-r-NEV.z0)/c)),b1=Math.min(NEV.h-1,Math.floor((z+r-NEV.z0)/c)),r2=r*r;let novos=0;
  for(let b=b0;b<=b1;b++){const dz=NEV.z0+(b+0.5)*c-z;for(let a=a0;a<=a1;a++){const dx=NEV.x0+(a+0.5)*c-x;if(dx*dx+dz*dz>r2)continue;
    const i=b*NEV.w+a,m=1<<(i&7);if(!(NEV.bits[i>>3]&m)){NEV.bits[i>>3]|=m;novos++;}}}
  if(novos)NEV.ver++;return novos;}
function nevoaRevelarRet(x0,z0,x1,z1){const c=NEV.c;let novos=0;for(let b=0;b<NEV.h;b++){const z=NEV.z0+(b+0.5)*c;if(z<z0||z>z1)continue;
  for(let a=0;a<NEV.w;a++){const x=NEV.x0+(a+0.5)*c;if(x<x0||x>x1)continue;const i=b*NEV.w+a,m=1<<(i&7);if(!(NEV.bits[i>>3]&m)){NEV.bits[i>>3]|=m;novos++;}}}
  if(novos)NEV.ver++;return novos;}
/* você já passou por perto de (x,z)? (algum quadradinho visto a até r metros) */
function nevoaConhece(x,z,r){const c=NEV.c,R=Math.max(r||0,4)+c*0.5,a0=Math.floor((x-R-NEV.x0)/c),a1=Math.floor((x+R-NEV.x0)/c),
  b0=Math.floor((z-R-NEV.z0)/c),b1=Math.floor((z+R-NEV.z0)/c),R2=R*R;
  for(let b=b0;b<=b1;b++){const dz=NEV.z0+(b+0.5)*c-z;for(let a=a0;a<=a1;a++){const dx=NEV.x0+(a+0.5)*c-x;if(dx*dx+dz*dz<=R2&&nevoaVistoC(a,b))return true;}}
  return false;}
mapaConhecido=function(x,z,r){return!nevoaAtiva()||nevoaConhece(x,z,r);};
/* quanto do mundo você já viu: conta só o que é mundo (dentroMapa: a mata, a cidade, o Alto, o mar de barco...) */
function nevoaTerra(){if(NEV.terra)return NEV.terra;const T=new Uint8Array(NEV.w*NEV.h);let n=0;
  for(let b=0;b<NEV.h;b++)for(let a=0;a<NEV.w;a++){let d=false;try{d=dentroMapa(NEV.x0+(a+0.5)*NEV.c,NEV.z0+(b+0.5)*NEV.c,0);}catch(e){}if(d){T[b*NEV.w+a]=1;n++;}}
  NEV.terra=T;NEV.terraN=n;return T;}
function nevoaPct(){const T=nevoaTerra();if(!NEV.terraN)return 0;let v=0;for(let i=0;i<T.length;i++)if(T[i]&&(NEV.bits[i>>3]&(1<<(i&7))))v++;
  const p=v/NEV.terraN*100;return p>0&&p<1?1:Math.min(100,Math.round(p));}
/* salvar e carregar (registro dos módulos: 39_v8) */
function nevoaB64(){let s='';const B=NEV.bits;for(let i=0;i<B.length;i+=4096)s+=String.fromCharCode.apply(null,B.subarray(i,i+4096));return btoa(s);}
function nevoaDeB64(t){try{const s=atob(t),n=Math.min(s.length,NEV.bits.length);for(let i=0;i<n;i++)NEV.bits[i]=s.charCodeAt(i);NEV.ver++;return true;}catch(e){return false;}}
V8.novo.nevoa=()=>{if(TESTE&&!window.__nevoa)nevoaTudo();else nevoaLimpa();};
V8.salvar.nevoa=()=>NEV.tudo?{t:1}:{v:1,b:nevoaB64()};
V8.carregar.nevoa=v=>{if(v&&v.t){nevoaTudo();return;}nevoaLimpa();if(v&&typeof v.b==='string'&&nevoaDeB64(v.b))return;
  if(TESTE&&!window.__nevoa){nevoaTudo();return;}NEV.migrar=true;};   // jogo salvo de antes: monta com o diário no primeiro passo (tudo já carregado)
/* jogo salvo de antes desta versão: o que o diário diz que você já conheceu */
function nevoaMigrar(){let D=null;try{D=typeof diarioD==='function'?diarioD():null;}catch(e){}const desc=D&&D.desc?D.desc:{};
  for(const k in desc){const i=k.indexOf(':');if(k.slice(0,i)!=='lugar')continue;const id=k.slice(i+1),p=PLACES.find(q=>q.id===id);
    if(p){nevoaRevelar(p.x,p.z,p.r+35);continue;}
    if(id==='cidade')nevoaRevelarRet(CIDADE.x0-10,CIDADE.z0-10,CIDADE.x1+10,CIDADE.z1+10);
    else if(id==='ponte'&&typeof PONTE!=='undefined')nevoaRevelar(PONTE.x,PONTE.z,40);
    else if(id==='lago'&&typeof LAGO!=='undefined')nevoaRevelar(LAGO.x,LAGO.z,LAGO.a+30);}
  if(typeof FIRE!=='undefined')nevoaRevelar(FIRE[0],FIRE[2],60);   // a clareira
  nevoaRevelar(P.x,P.z,60);}
/* a cada quarto de segundo: o que está em volta de você entra no mapa */
PASSOS.push(function nevoaPasso(dt){NEV.t-=dt||0;if(NEV.t>0)return;NEV.t=0.25;
  if(NEV.migrar){NEV.migrar=false;try{nevoaMigrar();}catch(e){console.error('nevoa: migrar',e);}}
  if(NEV.tudo||!P.alive)return;
  const gy=ground(P.x,P.z),y=typeof P.y==='number'?P.y:gy;if(y<gy-4)return;   // no subsolo
  let r=NEV_RAIO+Math.min(200,Math.max(0,y-gy)*1.5);if((G.obsAte||0)>G.t)r=Math.max(r,110);
  nevoaRevelar(P.x,P.z,r);
  if(!NEV.alto&&typeof arcD==='function'&&typeof ARC!=='undefined'){let m=false;try{m=!!arcD().mapeada;}catch(e){}
    if(m){NEV.alto=true;nevoaRevelar(ARC.x,ARC.z,ARC.r+14);for(const q of ARC.corr||[])nevoaRevelar(q[0],q[1],24);}}});
/* a máscara: um pixel por quadradinho (transparente no que você viu), desenhada esticada e desfocada por cima do mapa */
function nevoaMascara(){if(NEV.mC&&NEV.mVer===NEV.ver)return NEV.mC;const w=NEV.w,h=NEV.h,c=NEV.mC||(NEV.mC=document.createElement('canvas'));
  if(c.width!==w||c.height!==h){c.width=w;c.height=h;}const q=c.getContext('2d'),im=q.createImageData(w,h),d=im.data;
  for(let b=0;b<h;b++)for(let a=0;a<w;a++){const o=(b*w+a)*4;d[o]=NEV_COR[0];d[o+1]=NEV_COR[1];d[o+2]=NEV_COR[2];d[o+3]=nevoaVistoC(a,b)?0:255;}
  q.putImageData(im,0,0);NEV.mVer=NEV.ver;return c;}
function mapaNevoa(g,X,Y,k,dp){if(!nevoaAtiva())return;const m=nevoaMascara();
  g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.filter='blur('+Math.max(2,Math.round(3*dp))+'px)';
  g.drawImage(m,X(NEV.x0),Y(NEV.z0),NEV.w*NEV.c*k,NEV.h*NEV.c*k);g.restore();
  /* o nome das regiões em que você já entrou vai por cima da névoa (com névoa, o 61y não desenha os nomes: ver mapaAlto abaixo) */
  if(typeof REGIOES==='undefined'||typeof regD!=='function')return;let D=null;try{D=regD();}catch(e){}if(!D)return;
  g.save();g.font=`600 italic ${Math.max(11,Math.round(g.canvas.width/78))}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';
  for(const r of REGIOES){if(r.id==='mata'||r.id==='estrada'||!D[r.id]||!D[r.id].descoberta)continue;const wz=r.z+(r.id==='alto'?-r.r*0.55:r.r*0.62);
    let tx=X(r.x);const ty=Y(wz);{const mm=g.measureText(r.nome).width/2+4;tx=Math.max(mm,Math.min(g.canvas.width-mm,tx));}
    g.lineWidth=3;g.strokeStyle='rgba(7,10,9,.7)';g.strokeText(r.nome,tx,ty);g.fillStyle='rgba(232,214,160,.92)';g.fillText(r.nome,tx,ty);}
  g.restore();}
/* a névoa entra antes da grade (as letras, os números e a escala ficam por cima dela); o "% explorado" vai no título, depois da grade */
{const i=MAPA_SOBRE.findIndex(f=>f.name==='mapaGrade'),grade=i>=0?MAPA_SOBRE.splice(i,1)[0]:null;MAPA_SOBRE.push(mapaNevoa);if(grade)MAPA_SOBRE.push(grade);
 MAPA_SOBRE.push(function mapaExplorado(){const el=$('mapa-onde');if(el&&nevoaAtiva())el.textContent+=' · '+nevoaPct()+'% explorado';});}
/* legenda do mapa grande */
{const lg=document.querySelector('#t-mapa .mapa-leg');if(lg&&!lg.querySelector('.leg-nevoa'))lg.insertAdjacentHTML('beforeend',
  '<span class="leg-nevoa"><i class="leg-q" style="background:rgb('+NEV_COR.join(',')+');border-color:rgba(236,228,210,.4)"></i>Não explorado</span>');}
/* com névoa, o desenho do Alto (61y) não escreve os nomes das regiões embaixo dela: eles vêm inteiros por cima (mapaNevoa) */
{const i=MAPA_DESENHOS.findIndex(f=>f.name==='mapaAlto');if(i>=0){const f0=MAPA_DESENHOS[i];
  MAPA_DESENHOS[i]=function mapaAlto(g,X,Y,k,n,range){return f0.call(this,g,X,Y,k,n,range>=1e3&&nevoaAtiva()?999:range);};}}
