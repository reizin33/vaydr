/* ================= Personalizado: o personagem do MakeHuman (14/11/2026, etapa do personagem aprovada pelo dono) =================
   Na criação, o corpo "Personalizado" passa a ser um personagem de verdade montado com as peças do MakeHuman (CC0,
   tools/mh_personagem.py -> 21m_mh_dados.js): homem ou mulher, pele (rosto e corpo inteiros), olhos, sobrancelha, cabelo e
   barba. O boneco de partes de antes continua como "Clássico" (os jogos e perfis antigos ficam como eram).
   · Mesmo esqueleto de 22 ossos e as mesmas animações do sobrevivente (andar, correr, pular, agachar, ferido...): o corpo novo
     usa a locomoção do sobrevivente (ch.surv) e só troca a malha.
   · A malha é feita em peças com a mesma pele de ossos: o corpo e cada peça com a sua textura; cabelo, barba, sobrancelha, cílios e a córnea dos
     olhos recortam pela transparência da textura (uUseMask = 2 no shader da pele).
   · As peças, texturas e corpos ficam guardados depois da primeira vez (trocar de opção na criação não refaz o que já existe).
   · A aparência guarda ap.corpo = 'mh' e ap.mh = {g, pele, olhos, sobr, cabelo, barba}: vai no perfil e no jogo.
   · 14/11 (pedido do dono): o personagem começa sem roupa: o homem de cueca e a mulher de biquíni (pintados na pele pelo
     tools/mh_personagem.py); a roupa e o sapato saem da criação. As roupas do jogo (bermuda, calça, camisa, casaco, botas, gorro,
     luvas, cinto) vestem por cima e trocam de verdade: as de pano, couro e as botas são roupas 3D (veja MH_CASCAS); gorro, luvas e
     cinto são cascas do próprio corpo. A barba é opcional
     (o padrão é sem). O Sobrevivente virou um Personalizado pronto (MH_SOBREVIVENTE): o modelo antigo tinha calça e botas no
     próprio corpo, e a bermuda não trocava. */
const MH_ALT={homem:1.76,mulher:1.64};   // altura com a escolha do meio da criação
const MH_CAMPOS=['g','pele','olhos','sobr','cabelo','barba'];
const MH_CAT={sobr:'sobrancelha',cabelo:'cabelo',barba:'barba'};
const mhOk=()=>typeof MHP!=='undefined'&&!!MHP.corpos&&!!MHP.corpos.homem;
function mhLista(campo,g){if(!mhOk())return[];if(campo==='pele')return Object.keys(MHP.peles).filter(k=>MHP.peles[k].corpo===g);
  if(campo==='olhos')return Object.keys(MHP.olhos);const c=MH_CAT[campo];return Object.keys(MHP.pecas).filter(k=>MHP.pecas[k].cat===c&&MHP.pecas[k][g]);}
/* cabelo e barba podem ficar sem nada (careca, sem barba); o corpo nunca fica nu: a roupa de baixo está na própria pele */
const MH_VAZIO={cabelo:'Careca',barba:'Sem barba'};
function mhPadrao(g){return g==='mulher'?{g,pele:'m_adulta_clara',olhos:'castanho',sobr:'sobr5',cabelo:'rabo',barba:''}
  :{g:'homem',pele:'h_adulto_clara',olhos:'castanho',sobr:'sobr3',cabelo:'curto_castanho',barba:''};}
/* o Sobrevivente: um personalizado pronto (homem de cueca, cabelo grisalho, sem barba) */
const MH_SOBREVIVENTE={g:'homem',pele:'h_adulto_clara',olhos:'castanho',sobr:'sobr3',cabelo:'curto_grisalho',barba:''};
const mhDe=ap=>ap&&ap.corpo==='sobrevivente'?mhLimpa(MH_SOBREVIVENTE):mhLimpa(ap&&ap.mh);
const mhUsa=ap=>{const c=corpoDe(ap);return mhOk()&&(c==='mh'||c==='sobrevivente');};   // os dois corpos desenhados com o MakeHuman
function mhLimpa(m){const g=m&&m.g==='mulher'?'mulher':'homem',o=mhPadrao(g);if(!m||typeof m!=='object'||!mhOk())return o;
  for(const k of MH_CAMPOS){if(k==='g')continue;const v=m[k];if(v===''&&MH_VAZIO[k]&&!(k==='barba'&&g==='mulher'))o[k]='';else if(typeof v==='string'&&mhLista(k,g).includes(v))o[k]=v;}
  if(g==='mulher')o.barba='';return o;}
function mhNome(campo,v,g){if(!v)return MH_VAZIO[campo]||'';if(campo==='g')return v==='mulher'?'Mulher':'Homem';if(campo==='pele')return MHP.peles[v]?MHP.peles[v].nome:v;
  if(campo==='olhos')return MHP.olhos[v]?MHP.olhos[v].nome:v;return MHP.pecas[v]?MHP.pecas[v].nome:v;}

/* ---------- o tipo de corpo "mh" ---------- */
corpoDe=function(ap){const c=ap&&ap.corpo;return c==='sobrevivente'||c==='personalizado'||(c==='mh'&&mhOk())?c:(cfg&&cfg.personagem==='classico'?'personalizado':cfg&&cfg.personagem==='mh'&&mhOk()?'mh':'sobrevivente');};
CORPOS.mh='Personalizado';CORPOS.personalizado='Clássico';
{const _al=aparLimpa;aparLimpa=function(ap){const o=_al.apply(this,arguments);if(ap&&ap.corpo==='mh'&&mhOk())o.corpo='mh';if(ap&&ap.mh)o.mh=mhLimpa(ap.mh);else if(o.corpo==='mh')o.mh=mhPadrao('homem');return o;};}
survLigado=function(){if(typeof SKT==='undefined'||!SKT.surv||!SKT.surv.pronto)return false;
  const ap=G.modo==='criacao'?CRIA.ap:(G.aparencia||(MESH.jogador&&MESH.jogador.ap)),c=corpoDe(ap);return c==='sobrevivente'||c==='mh';};
const mhAp=()=>G.modo==='criacao'?CRIA.ap:(G.aparencia||(MESH.jogador&&MESH.jogador.ap));

/* ---------- GPU: corpo, peças e texturas (guardados) ---------- */
const MHG={vb:{},vbb:{},peca:{},tex:{},tipos:new Map(),esq:{}};
/* as roupas do jogo no corpo do MakeHuman: as mesmas cascas do sobrevivente e a bermuda do começo (do meio da coxa à cintura) */
const MH_CASCAS=Object.assign({},typeof SURV_CASCAS!=='undefined'?SURV_CASCAS:{},{bermuda:[{sub:'pernasCurtas',inf:0.007,cor:0x5a6470,pelo:0}]});
/* 14/11 (o dono achou feio: as cascas marcavam o corpo): camiseta, camisas, colete, casacos, calças, bermuda e botas são roupas 3D
   de verdade (partes das roupas prontas do MakeHuman, tingidas na cor da peça: tools/mh_personagem.py, ROUPAS3D). Só gorro, boné,
   luvas e cinto continuam cascas (são peças justas). O corpo some por baixo da roupa (os triângulos que ela cobre). */
if(mhOk())for(const k in MHP.pecas)if(MHP.pecas[k].cat==='roupa')delete MH_CASCAS[k];
/* as roupas 3D vestidas, na ordem das camadas; na criação o personagem fica só de roupa de baixo. A camiseta fica por baixo da camisa
   e do casaco (some para não atravessar); com o colete ela aparece */
const MH_COBRE_CAMISETA={camisaLeve:1,camisaCouro:1,casacoPele:1,casacoGrande:1};
function mhRoupas(g){if(!mhOk()||G.modo==='criacao'||!P.roupa)return[];const R=P.roupa,o=[];
  for(const sl of ['pes','pernas','camiseta','tronco']){const id=R[sl];if(!id||!MHP.pecas[id]||MHP.pecas[id].cat!=='roupa'||!MHP.pecas[id][g])continue;
    if(sl==='camiseta'&&MH_COBRE_CAMISETA[R.tronco])continue;o.push(id);}
  return o;}
function mhVB(d){const vb=b64bytes(d.vb),b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,vb,gl.STATIC_DRAW);return b;}
function mhVAO(vbuf,idx,i32){const vao=gl.createVertexArray();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vbuf);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(5);gl.vertexAttribPointer(5,3,gl.BYTE,true,28,12);
  gl.enableVertexAttribArray(6);gl.vertexAttribPointer(6,2,gl.UNSIGNED_SHORT,true,28,16);gl.enableVertexAttribArray(7);gl.vertexAttribIPointer(7,4,gl.UNSIGNED_BYTE,28,20);
  gl.enableVertexAttribArray(8);gl.vertexAttribPointer(8,4,gl.UNSIGNED_BYTE,true,28,24);
  const e=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,e);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);gl.bindVertexArray(null);
  return{vao,ebo:e,count:idx.length,tipo:i32?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT};}
function mhTex(chave,url){return MHG.tex[chave]||(MHG.tex[chave]=skTextura(url,true));}
/* a textura de uma roupa 3D: a luz do tecido (cinza, dividida pelas peças que saem da mesma roupa pronta) tingida na cor da peça
   do jogo; até a imagem chegar, a peça fica na cor lisa */
function mhTexRoupa(id,g){const d=MHP.pecas[id],e=d[g],src=e.texf&&MHP.roupasTex&&MHP.roupasTex[e.texf];if(!src)return mhTex('p_'+id+'_'+g,e.tex||d.tex);
  const c=d.cor|0,k='r_'+e.texf+'_'+c;if(MHG.tex[k])return MHG.tex[k];const cr=(c>>16)&255,cg=(c>>8)&255,cb=c&255,t=gl.createTexture();MHG.tex[k]=t;
  skNaUnidade(()=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([cr,cg,cb,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);});
  const im=new Image();im.onload=()=>{if(!gl)return;try{const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const x=cv.getContext('2d');x.drawImage(im,0,0);
    const px=x.getImageData(0,0,cv.width,cv.height),D=px.data;for(let i=0;i<D.length;i+=4){const f=D[i]*(1.45/255);D[i]=Math.min(255,cr*f);D[i+1]=Math.min(255,cg*f);D[i+2]=Math.min(255,cb*f);D[i+3]=255;}
    x.putImageData(px,0,0);skNaUnidade(()=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.SRGB8_ALPHA8,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);});}catch(err){console.error('personalizado: tingir roupa',err);}};
  im.src=src;return t;}
function mhPeca(id,g){const k=id+'|'+g;if(MHG.peca[k])return MHG.peca[k];const d=MHP.pecas[id][g],ib=b64bytes(d.ib);
  const m=mhVAO(mhVB(d),d.i32?new Uint32Array(ib.buffer):new Uint16Array(ib.buffer),d.i32);m.alfa=!!MHP.pecas[id].alfa;return MHG.peca[k]=m;}
/* o esqueleto de cada corpo (o SKD dele e o skTipo com o alinhamento das poses do jogo), feito uma vez */
function mhEsq(g){if(MHG.esq[g])return MHG.esq[g];const c=MHP.corpos[g],nome='mh_'+g;
  SKD[nome]={ossos:c.ossos,pai:c.pai,t:c.t,qb:c.qb,inv:c.inv,quadril:c.quadril,altura:c.altura,maoA:c.maoA};const t=skTipo(nome);
  const ib=b64bytes(c.ib);t.mhIdx=c.i32?new Uint32Array(ib.buffer):new Uint16Array(ib.buffer);t.mhI32=c.i32;t.mhVB=mhVB(c);return MHG.esq[g]=t;}
/* o tipo de um personagem: o esqueleto do corpo + o corpo (com as regiões das roupas do jogo) + as peças escolhidas */
function mhTipo(ap){const m=mhDe(ap),rp=mhRoupas(m.g),k=MH_CAMPOS.map(c=>m[c]).join('|')+'|'+rp.join(',');let t=MHG.tipos.get(k);if(t){MHG.tipos.delete(k);MHG.tipos.set(k,t);return t;}
  const e=mhEsq(m.g),g=m.g,ids=['olhos',m.cabelo,m.barba,m.sobr,g==='mulher'?'cilios_m':'cilios_h',...rp].filter(x=>x&&MHP.pecas[x]&&MHP.pecas[x][g]);
  /* corpo: tira os triângulos escondidos pelas peças que cobrem o corpo (as roupas 3D) */
  const bits=ids.map(id=>MHP.pecas[id][g].oculta).filter(Boolean).map(b64bytes),I=e.mhIdx,n=I.length/3;let out=I;
  if(bits.length){const tmp=new (e.mhI32?Uint32Array:Uint16Array)(I.length);let o=0;
    for(let i=0;i<n;i++){let esc=false;for(const b of bits)if((b[i>>3]>>(i&7))&1){esc=true;break;}if(esc)continue;tmp[o++]=I[i*3];tmp[o++]=I[i*3+1];tmp[o++]=I[i*3+2];}out=tmp.subarray(0,o);}
  /* as roupas do jogo: as regiões do corpo (tronco, mangas, pernas, bermuda, pés, cabeça, mãos, cinto) vão no fim dos índices */
  let S={};try{S=skSubconjuntos(e,MHG.vbb[g]||(MHG.vbb[g]=b64bytes(MHP.corpos[g].vb)),I,MHP.corpos[g].maoA);}catch(err){console.error('personalizado: roupas',err);}
  let tot=out.length;for(const k in S)tot+=S[k].length;const todos=new (e.mhI32?Uint32Array:Uint16Array)(tot);todos.set(out);
  let o=out.length;const sub={},bpe=e.mhI32?4:2;for(const k in S){todos.set(S[k],o);sub[k]={off:o*bpe,n:S[k].length};o+=S[k].length;}
  const corpo=mhVAO(e.mhVB,todos,e.mhI32);corpo.count=out.length;
  /* peças: as opacas primeiro (olhos), depois as recortadas */
  const partes=ids.map(id=>{const p=mhPeca(id,g),d=MHP.pecas[id];return{vao:p.vao,count:p.count,tipo:p.tipo,alfa:p.alfa,
      tex:id==='olhos'?mhTex('olho_'+m.olhos,MHP.olhos[m.olhos].tex):d.cat==='roupa'?mhTexRoupa(id,g):mhTex('p_'+id,d.tex)};})
    .sort((a,b)=>a.alfa-b.alfa);
  t=Object.assign(Object.create(e),{nome:'mh',mesh:corpo,tex:mhTex('pele_'+m.pele,MHP.peles[m.pele].tex),mask:null,nrm:null,rug:null,partes,sub,cascas:MH_CASCAS,pronto:true,mh:m});
  MHG.tipos.set(k,t);
  /* guarda poucos tipos (o corpo filtrado de cada um é pequeno; peças e texturas são de todos) */
  while(MHG.tipos.size>8){const[k0,t0]=MHG.tipos.entries().next().value;if(P.ch&&P.ch.sk&&P.ch.sk.t===t0)break;MHG.tipos.delete(k0);try{gl.deleteVertexArray(t0.mesh.vao);gl.deleteBuffer(t0.mesh.ebo);}catch(_){}}
  return t;}
/* troca o corpo do jogador (sobrevivente, personalizado do MakeHuman ou o clássico) */
survAplicar=function(){const ch=P.ch;if(!ch)return;const quer=survLigado(),ap=mhAp(),apJ=MESH.jogador&&MESH.jogador.ap,mh=quer&&mhUsa(ap);
  if(quer){let tipo=SKT.surv;if(mh){try{tipo=mhTipo(ap);}catch(e){console.error('personalizado',e);tipo=SKT.surv;}}
    if(!ch.surv||!ch.sk||ch.sk.t!==tipo){ch.sk=skNovo(tipo);ch.proc=false;ch.surv=true;ch.procOmbro=0;if(tipo===SKT.surv)SKT.surv.cascas=SURV_CASCAS;SURV.estado='';}
    ch.mh=tipo!==SKT.surv;
    const alt=apJ?APAR.alturas[apJ.altura]:1;ch.s=ch.mh?alt*MH_ALT[tipo.mh.g]/(tipo.alt||1.8):alt*SURV_ALT/(SKT.surv.alt||1.82);}
  else if(ch.surv){const a=apJ;ch.sk=skNovo(SKT.akai);ch.proc=true;ch.surv=false;ch.mh=false;ch.procOmbro=a?APAR.portes[a.porte].ombro:0;ch.s=a?APAR.alturas[a.altura]:1;}};

/* trocou de roupa no jogo (vestiu, tirou, achou outra): o corpo é refeito com as roupas 3D novas */
{let rk=null;HUDS.push(()=>{if(G.modo!=='jogo'||!P.ch||!P.ch.mh)return;const R=P.roupa||{},k=(R.pes||'')+'|'+(R.pernas||'')+'|'+(R.camiseta||'')+'|'+(R.tronco||'');
  if(k===rk)return;rk=k;try{survAplicar();}catch(e){console.error('personalizado: roupa',e);}});}
/* a camisa de couro agora tem manga comprida no corpo: na 1ª pessoa também */
if(typeof MANGAS_FP!=='undefined'&&!MANGAS_FP.camisaCouro)MANGAS_FP.camisaCouro={t:'longa',cor:0x8a5a36,punho:0x5a3820};
/* na criação, o personalizado aparece só de roupa de baixo (a bermuda do começo veste quando o jogo começa) */
{const _sc=skCascas;skCascas=function(){if(G.modo==='criacao'&&P.ch&&P.ch.mh)return;return _sc.apply(this,arguments);};}
/* ---------- desenho: as peças vão depois do corpo, com a mesma pele de ossos ---------- */
{const _du=skDesenharUm;skDesenharUm=function(Pg,c){_du.apply(this,arguments);const L=c.sk&&c.sk.t&&c.sk.t.partes;if(!L)return;const somb=Pg===PDSK;
  for(const p of L){if(somb&&p.alfa)continue;
    if(!somb){gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,p.tex);if(Pg.u.uUseMask)gl.uniform1f(Pg.u.uUseMask,p.alfa?2:0);}
    gl.bindVertexArray(p.vao);gl.drawElements(gl.TRIANGLES,p.count,p.tipo,0);}
  if(!somb){if(Pg.u.uUseMask)gl.uniform1f(Pg.u.uUseMask,0);gl.activeTexture(gl.TEXTURE0);}};}

/* ---------- braço da 1ª pessoa: o tom da pele escolhida ---------- */
/* 1ª pessoa: a mulher usa o braço dela (mais fino, mão menor) */
if(typeof brfConj==='function'){const _bc=brfConj;brfConj=function(){const ch=P.ch;
  if(ch&&ch.mh&&ch.sk&&ch.sk.t.mh&&ch.sk.t.mh.g==='mulher'&&typeof BRF_F!=='undefined'&&brfMalha(BRF_F))return BRF_F;return _bc.apply(this,arguments);};}
{const _bt=brfTom;brfTom=function(){const ch=P.ch;if(!ch||!ch.mh||!ch.sk||!ch.sk.t.mh)return _bt.apply(this,arguments);const m=ch.sk.t.mh,pl=MHP.peles[m.pele];
  if(!pl||!pl.media)return _bt.apply(this,arguments);
  /* a razão inteira (sem a raiz do clássico): a média da pele escolhida sobre a da textura do braço em uso, as duas medidas do mesmo jeito */
  const S=brfConj(),ref=S.media||MHP.pele_ref||0xb0907c,k=m.pele+'|'+ref;
  if(BRF.tomMH!==k){BRF.tomMH=k;const L=lin(pl.media),R=lin(ref);BRF.tomMHv=[0,1,2].map(i=>clamp(L[i]/Math.max(1e-4,R[i]),0.05,1.3));}
  return BRF.tomMHv;};}

/* ---------- criação ---------- */
{const st=document.createElement('style');st.textContent=`.cr-ops.tres{grid-template-columns:repeat(3,1fr)}
.cr-op.mhm{padding:0;overflow:hidden;display:grid;grid-template-rows:1fr auto;align-items:stretch}
.cr-op.mhm img{display:block;width:100%;aspect-ratio:1;object-fit:cover;background:#111}
.cr-op.mhm b{display:block;padding:4px 3px 5px;font:600 11.5px/1.15 var(--f-ui);color:inherit;text-align:center;overflow-wrap:anywhere}
.cr-op.mhm.vazio{place-items:center}.cr-op.mhm.vazio b{overflow-wrap:normal;font-size:10.5px}.cr-op.mhm.vazio svg{width:46%;height:auto;opacity:.6;margin:16% auto 0}`;document.head.appendChild(st);}
const MH_SEM='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 18 18 6" stroke="currentColor" stroke-width="2"/></svg>';
function mhOpcao(campo,v,m){const g=m.g,sel=(m[campo]||'')===v,nome=mhNome(campo,v,g),at=`data-mh="${campo}" data-v="${v}" aria-pressed="${sel}" aria-label="${nome}" title="${nome}"`;
  const mini=!v?null:campo==='pele'?MHP.peles[v].mini:campo==='olhos'?MHP.olhos[v].mini:MHP.pecas[v]&&MHP.pecas[v].mini;
  return`<button type="button" class="cr-op mhm${v?'':' vazio'}" ${at}>${mini?`<img src="${mini}" alt="">`:MH_SEM}<b>${nome}</b></button>`;}
function mhSecao(titulo,campo,m){const L=mhLista(campo,m.g),vz=MH_VAZIO[campo]&&!(campo==='barba'&&m.g==='mulher')?['']:[];
  return`<div class="cr-sec"><h3>${titulo}<small>${mhNome(campo,m[campo],m.g)}</small></h3><div class="cr-ops" role="group" aria-label="${titulo}">${vz.concat(L).map(v=>mhOpcao(campo,v,m)).join('')}</div></div>`;}
function mhPainel(aba){const el=$('cr-opcoes');if(!el||!CRIA.ap)return;const surv=corpoDe(CRIA.ap)==='sobrevivente',m=surv?mhDe(CRIA.ap):(CRIA.ap.mh=mhLimpa(CRIA.ap.mh));let h='';
  if(aba==='rosto')h=mhSecao('Pele e rosto','pele',m)+mhSecao('Olhos','olhos',m)+mhSecao('Sobrancelhas','sobr',m)+(m.g==='homem'?mhSecao('Barba','barba',m):'');
  else if(aba==='cabelo')h=mhSecao('Cabelo','cabelo',m);
  else if(aba==='corpo'){h=`<div class="cr-sec"><h3>Corpo<small>${mhNome('g',m.g)}</small></h3><div class="cr-ops dois" role="group" aria-label="Corpo">`
      +['homem','mulher'].map(g=>`<button type="button" class="cr-op txt" data-mh="g" data-v="${g}" aria-pressed="${m.g===g}">${criaCorpoSvg('sobrevivente')}<b>${mhNome('g',g)}</b></button>`).join('')+'</div></div>';
    const n=APAR.alturas.length;h+=`<div class="cr-sec"><h3>Altura<small>${criaNomeOp('altura',CRIA.ap.altura)}</small></h3><div class="cr-ops" role="group" aria-label="Altura">`;for(let i=0;i<n;i++)h+=criaOpcao('altura',i);h+='</div></div>';}
  else if(aba==='roupas')h=`<div class="cr-sec"><h3>Roupas<small>${m.g==='mulher'?'biquíni':'cueca'}</small></h3><p class="cr-texto">${m.g==='mulher'?'Ela começa de biquíni':'Ele começa de cueca'} e com a bermuda simples do começo do jogo. Calça, camisa, casaco, botas, gorro, luvas e cinto você acha ou fabrica no jogo, e aparecem no corpo quando vestidos.</p></div>`;
  else return;
  el.innerHTML=h;}
criaCorpoPainel=(function(_cp){return function(aba){if(!CRIA.ap)return;const c=corpoDe(CRIA.ap),mh=mhUsa(CRIA.ap);
  if(mh&&(aba==='rosto'||aba==='cabelo'||aba==='corpo'||aba==='roupas'))mhPainel(aba);else{_cp.apply(this,arguments);}
  /* o seletor de corpo: as três escolhas */
  const el=$('cr-opcoes'),sec=el&&el.querySelector('.cr-corpo');const txt={sobrevivente:mhOk()?'Pronto para jogar: homem de cueca, cabelo grisalho, sem barba. Mexendo no rosto, no cabelo ou no corpo, ele vira Personalizado.':'Rosto, cabelo grisalho, barba, calça jeans e botas do próprio sobrevivente. Você escolhe o nome e a altura.',
    mh:'Um personagem de verdade montado do seu jeito: homem ou mulher, pele, olhos, sobrancelha, cabelo e barba. Começa de cueca ou biquíni; as roupas vêm do jogo.',personalizado:'O boneco de partes de antes, com rosto, pele, olhos, cabelo, barba, altura e porte.'};
  const topo=`<div class="cr-sec cr-corpo"><h3>Tipo de corpo<small>${CORPOS[c]}</small></h3><div class="cr-ops tres" role="group" aria-label="Tipo de corpo">`
    +['sobrevivente','mh','personalizado'].filter(k=>k!=='mh'||mhOk()).map(k=>`<button type="button" class="cr-op txt" data-corpo="${k}" aria-pressed="${k===c}" title="${CORPOS[k]}">${criaCorpoSvg(k==='personalizado'?'personalizado':'sobrevivente')}<b>${CORPOS[k]}</b></button>`).join('')
    +`</div><p class="cr-texto">${txt[c]}</p></div>`;
  if(!el||!(aba==='rosto'||aba==='cabelo'||aba==='corpo'||(mh&&aba==='roupas')))return;
  if(sec)sec.outerHTML=topo;else el.insertAdjacentHTML('afterbegin',topo);};})(criaCorpoPainel);
{const el=$('cr-opcoes');if(el)el.addEventListener('click',e=>{const b=e.target.closest('[data-mh]');if(!b||!CRIA.ap)return;const k=b.dataset.mh,v=b.dataset.v;
  if(corpoDe(CRIA.ap)==='sobrevivente'){const p=mhDe(CRIA.ap);if((p[k]||'')===v)return;CRIA.ap.corpo='mh';CRIA.ap.mh=Object.assign({},p);}   // mexeu no pronto: vira personalizado
  const m=CRIA.ap.mh=mhLimpa(CRIA.ap.mh);
  if(k==='g'){if(m.g===v)return;CRIA.ap.mh=mhPadrao(v);}else{if((m[k]||'')===v)return;m[k]=v;}
  aplicarAparencia(CRIA.ap);const y=el.scrollTop;criaAba(CRIA.aba);el.scrollTop=y;criaResumo();CRIA.sujo=G.t;sfx('clique');
  const nb=el.querySelector('[data-mh="'+k+'"][data-v="'+v+'"]');if(nb)nb.focus({preventScroll:true});});}
/* altura em metros com o corpo do MakeHuman */
{const _no=criaNomeOp;criaNomeOp=function(k,i){if(k==='altura'&&G.modo==='criacao'&&CRIA.ap&&mhUsa(CRIA.ap))return(APAR.alturas[i]*MH_ALT[mhDe(CRIA.ap).g]).toFixed(2).replace('.',',')+' m';return _no.apply(this,arguments);};}
/* o resumo do lado */
{const _cr=criaResumoHTML;criaResumoHTML=function(ap){if(!mhUsa(ap))return _cr.apply(this,arguments);const m=mhDe(ap),n=(c)=>mhNome(c,m[c],m.g).toLowerCase();
  const alt=(APAR.alturas[ap.altura]*MH_ALT[m.g]).toFixed(2).replace('.',',')+' m';
  return[['rosto','Rosto',n('pele')+' · olhos '+n('olhos')+(m.g==='homem'?' · '+n('barba'):'')],['cabelo','Cabelo',n('cabelo')],['corpo','Corpo',mhNome('g',m.g).toLowerCase()+' · '+alt],
    ['roupas','Roupas',(m.g==='mulher'?'biquíni':'cueca')+' · bermuda do começo'],['acess','Acessórios','nenhum']].map(([a,t,v])=>`<li>${criaIcoAba(a)}<div>${t} <span>${v}</span></div></li>`).join('');};}
/* o "Aleatório" com o corpo do MakeHuman: sorteia as peças (mantém homem ou mulher) */
{const _aa=aparAleatoria;aparAleatoria=function(){const o=_aa.apply(this,arguments);if(G.modo==='criacao'&&CRIA.ap&&corpoDe(CRIA.ap)==='mh'){const g=mhLimpa(CRIA.ap.mh).g,m={g},pick=L=>L[Math.floor(Math.random()*L.length)];
    for(const k of MH_CAMPOS){if(k==='g')continue;const L=mhLista(k,g);m[k]=L.length?pick(L):'';}
    if(Math.random()<0.25)m.barba='';if(Math.random()<0.08)m.cabelo='';o.mh=mhLimpa(m);}return o;};}
/* câmera do palco e das fotos: a altura do corpo que está no palco (a do sobrevivente servia só para ele) */
{const _cm=criaCamera;criaCamera=function(modo,hN){const ch=P.ch;if(!ch||!ch.mh)return _cm.apply(this,arguments);const s0=SKT.surv.alt;SKT.surv.alt=ch.sk.t.alt*1.06;   // + o volume do cabelo
  try{return _cm.apply(this,arguments);}finally{SKT.surv.alt=s0;}};}
/* Ajustes: o corpo do personagem com as três escolhas */
{const el=$('aj-personagem');if(el&&mhOk()&&!el.querySelector('[data-v="mh"]')){el.insertAdjacentHTML('beforeend','<button type="button" data-v="mh">Personalizado</button>');
  const bc=el.querySelector('[data-v="classico"]');if(bc)bc.textContent='Clássico';
  el.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;
    if(b.dataset.v==='mh')for(const ap of[G.aparencia,MESH.jogador&&MESH.jogador.ap])if(ap){ap.corpo='mh';ap.mh=mhLimpa(ap.mh);}
    survMarcaAjuste();try{survAplicar();}catch(err){console.error('personalizado',err);}});}}   // troca o corpo na hora (entre sobrevivente e personalizado o skPose não percebe)
/* o rostinho do perfil: o rosto da pele escolhida */
if(typeof pfAvatar==='function'){const _pa=pfAvatar;pfAvatar=function(p){const ap=p&&p.ap;if(!ap||!mhUsa(ap))return _pa.apply(this,arguments);
  const m=mhDe(ap),pl=MHP.peles[m.pele];return pl&&pl.mini?`<img class="av-mh" src="${pl.mini}" alt="">`:_pa.apply(this,arguments);};
  const st=document.createElement('style');st.textContent='.av-mh{display:block;width:100%;height:100%;border-radius:50%;object-fit:cover}';document.head.appendChild(st);}
/* o retrato de verdade: ao salvar o personagem no perfil, guarda o retrato da tela de criação (o rosto do personagem, com cabelo e
   roupa) e o login e o menu mostram ele, para qualquer corpo. Perfis de antes continuam com o desenho de antes */
const PF_RETRATO_OK=/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/;
if(typeof pfSalvarAparencia==='function'){const _sa=pfSalvarAparencia;pfSalvarAparencia=function(){const r=_sa.apply(this,arguments);
  try{const cv=$('cr-retrato');if(PERFIL&&cv&&cv.width>8&&G.modo==='criacao'){if(CRIA.sujo!==null&&typeof criaCapturar==='function')criaCapturar('retrato');
    const pq=document.createElement('canvas');pq.width=pq.height=128;pq.getContext('2d').drawImage(cv,0,0,128,128);   // 128 px bastam para o cartão (uns 5 KB)
    const u=pq.toDataURL('image/jpeg',0.84);if(PF_RETRATO_OK.test(u)&&u.length<120000){PERFIL.retrato=u;pfGravar();}}}catch(e){console.error('retrato do perfil',e);}
  return r;};}
if(typeof pfAvatar==='function'){const _pr=pfAvatar;pfAvatar=function(p){const u=p&&p.retrato;
  return typeof u==='string'&&PF_RETRATO_OK.test(u)?`<img class="av-mh" src="${u}" alt="">`:_pr.apply(this,arguments);};}
{const _sm=survMarcaAjuste;survMarcaAjuste=function(){_sm.apply(this,arguments);const el=$('aj-personagem');if(!el)return;const c=corpoDe(G.aparencia||(MESH.jogador&&MESH.jogador.ap));
  el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.v==='classico'?'personalizado':b.dataset.v)===c)));};}
