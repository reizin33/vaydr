/* ================= prova de estilo (10/11): texturas realistas (Poly Haven, licença CC0) =================
   O chão ganha textura de verdade, com relevo: grama nos campos (puxada para o verde do jogo), chão de mata e folhas em manchas
   dentro da mata, terra onde o chão é batido e rocha nas encostas. A madeira das paredes do lado de fora (base, casas, cercas)
   ganha a textura de tábua velha. Estrada, asfalto, concreto e areia continuam como antes. Liga e desliga em Ajustes
   ("Texturas realistas"), do nível Médio para cima; no Baixo fica o desenho de antes. As imagens vêm de 21f_texturas_dados.js
   (gerado por ferramentas/texturas.py) e vão para duas texturas em camadas (cor e relevo), nas unidades 6 e 7. */
const TEXR={cor:null,rel:null,pronta:false,erro:null,med:new Float32Array(15)};
function texRealLigada(){return cfg.texReal!==false&&TEXR.pronta&&!!GRAF[cfg.graf]&&GRAF[cfg.graf].detalhe>0.5;}
function texRealMontar(){if(typeof TEXREAL_DADOS==='undefined'||!gl||TEXR.cor)return;
  const D=TEXREAL_DADOS,N=D.length,S=1024,niveis=Math.floor(Math.log2(S))+1;let falta=N*2;
  D.forEach((d,i)=>TEXR.med.set(d.med,i*3));
  const nova=srgb=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D_ARRAY,t);gl.texStorage3D(gl.TEXTURE_2D_ARRAY,niveis,srgb?gl.SRGB8_ALPHA8:gl.RGBA8,S,S,N);return t;};
  TEXR.cor=nova(true);TEXR.rel=nova(false);gl.bindTexture(gl.TEXTURE_2D_ARRAY,null);
  const pronto=()=>{const an=gl.getExtension('EXT_texture_filter_anisotropic');
    for(const t of[TEXR.cor,TEXR.rel]){gl.bindTexture(gl.TEXTURE_2D_ARRAY,t);gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_T,gl.REPEAT);
      if(an)gl.texParameterf(gl.TEXTURE_2D_ARRAY,an.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));}
    gl.bindTexture(gl.TEXTURE_2D_ARRAY,null);TEXR.pronta=true;};
  D.forEach((d,i)=>{for(const[k,t]of[['cor',TEXR.cor],['rel',TEXR.rel]]){const im=new Image();
    im.onload=()=>{if(!gl)return;gl.bindTexture(gl.TEXTURE_2D_ARRAY,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_ALIGNMENT,4);
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY,0,0,0,i,S,S,1,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.bindTexture(gl.TEXTURE_2D_ARRAY,null);if(--falta===0)pronto();};
    im.onerror=()=>{TEXR.erro='não abriu a imagem '+d.id+' ('+k+')';};im.src=d[k];}});
  /* os amostradores das camadas ficam sempre nas unidades 6 e 7 (na 0 está a sombra, que é de outro tipo) */
  for(const q of[PL,PLS,PLI,PTER])if(q&&q.u.uTR){gl.useProgram(q.p);gl.uniform1i(q.u.uTR,6);gl.uniform1i(q.u.uTN,7);}}
INIT_MALHAS.push(texRealMontar);
{const _sl=setLit;setLit=function(Pg){_sl.apply(this,arguments);const u=Pg.u;if(!u.uTR)return;const on=texRealLigada();
  gl.uniform1i(u.uTR,6);gl.uniform1i(u.uTN,7);gl.uniform1f(u.uTexOn,on?1:0);if(!on)return;
  gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D_ARRAY,TEXR.cor);gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D_ARRAY,TEXR.rel);gl.activeTexture(gl.TEXTURE0);
  if(u.uTexTam){const D=TEXREAL_DADOS;gl.uniform4f(u.uTexTam,1/D[0].tam,1/D[1].tam,1/D[2].tam,1/D[3].tam);}
  if(u.uTexMed)gl.uniform3fv(u.uTexMed,TEXR.med);};}
/* o mapa de pisos ganha, no canal que sobrava (alfa), o quanto o lugar é aberto (campo e clareira = 1, mata = 0): é o mesmo
   valor que decide a cor do chão (groundCol), e o terreno usa para escolher entre a grama e o chão de mata */
{const _sd=splatData;splatData=function(){const D=_sd.apply(this,arguments),S=SPLAT_S,H=SPLAT_H,ts=2*H/S;
  for(let j=0;j<S;j+=2)for(let i=0;i<S;i+=2){const a=Math.round((1-mata(-H+(i+1)*ts,-H+(j+1)*ts))*255);
    D[(j*S+i)*4+3]=a;D[(j*S+i+1)*4+3]=a;D[((j+1)*S+i)*4+3]=a;D[((j+1)*S+i+1)*4+3]=a;}
  return D;};}
/* Ajustes: liga e desliga (fica salvo); no Baixo não tem efeito */
{const g=$('aj-graf'),op=g&&g.closest('.opcao');
  if(op&&!$('aj-tex'))op.insertAdjacentHTML('afterend','<div class="opcao"><span class="rot">Texturas realistas (teste)</span><div class="segs" id="aj-tex"><button type="button" data-v="1">Sim</button><button type="button" data-v="0">Não</button></div></div>');}
{const _aj=ajustesUI;ajustesUI=function(){const r=_aj.apply(this,arguments);const el=$('aj-tex');if(el)el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===(cfg.texReal===false?'0':'1'))));return r;};
  const el=$('aj-tex');if(el)el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cfg.texReal=b.dataset.v==='1';saveCfg();ajustesUI();sfx('clique');});}
