/* ================= armas que dá para fabricar, munição equilibrada e itens no chão com cara própria =================
   Armas de fogo: pistola, espingarda e rifle saem da oficina (bancada nível 2) e gastam barra e chapa de ferro (da forja);
   a besta sai da bancada depois de você ter barra de ferro. Munição também sai da oficina, poucas de cada vez, com carvão
   no lugar da pólvora. As armas aparecem um pouco mais no mundo (pistola em casas e carros, espingarda em sítios, celeiros e
   na delegacia, rifle em caixas militares e arsenais) e, quando você pega munição sem ter a arma, uma dica diz onde procurar.
   Itens no chão: cada um com um modelo (a arma deitada, caixinha de munição, lata, fruta, kit, tábuas, toras, rolo de corda,
   pano dobrado...) e, perto, uma etiqueta com o ícone, o nome e a quantidade. */
/* ---------- receitas ---------- */
{const m=RECIPES.find(r=>r.faz==='municao9');if(m){m.n=4;m.custo={sucata:2,carvao:1};}}
RECIPES.push(
  {faz:'pistola',n:1,nome:'Pistola (artesanal)',custo:{barraFerro:2,chapaFerro:1,pregos:4,sucata:3},cat:'armas',etapa:3,est:2,desb:{oficina:true}},
  {faz:'espingarda',n:1,nome:'Espingarda (cano forjado)',custo:{barraFerro:3,chapaFerro:1,tabuas:2,pregos:4},cat:'armas',etapa:3,est:2,desb:{oficina:true}},
  {faz:'rifle',n:1,nome:'Rifle com luneta',custo:{barraFerro:4,chapaFerro:3,tabuas:2,pregos:6,lanterna:1},cat:'armas',etapa:3,est:2,desb:{oficina:true}});
// besta, cartucho, bala de rifle e virote já tinham receita (48d_armas3)
/* ---------- onde achar ---------- */
{const L=(t,e)=>{if(!LOOT[t])return;const i=LOOT[t].findIndex(x=>x[0]===e[0]);if(i>=0)LOOT[t][i]=e;else LOOT[t].push(e);};
  L('casa',['pistola',1,1,0.06]);L('casa',['espingarda',1,1,0.02]);L('casa',['cartucho',2,4,0.08]);
  L('carro',['pistola',1,1,0.05]);L('carro',['cartucho',2,4,0.08]);
  L('celeiro',['espingarda',1,1,0.06]);L('celeiro',['cartucho',2,5,0.25]);L('celeiro',['virote',2,4,0.08]);
  L('suprimentos',['cartucho',4,8,0.4]);L('suprimentos',['balaRifle',3,6,0.2]);L('suprimentos',['rifle',1,1,0.05]);}
{const C=(t,e)=>{if(CID_LOOT[t])CID_LOOT[t].push(e);};
  C('arsenal',['espingarda',.25,1,1]);C('arsenal',['cartucho',.5,4,10]);C('arsenal',['rifle',.08,1,1]);C('arsenal',['balaRifle',.3,3,8]);
  C('arsenal_caixa',['cartucho',.45,4,10]);C('arsenal_caixa',['balaRifle',.25,3,8]);C('cofre_pol',['espingarda',.15,1,1]);C('cofre_pol',['cartucho',.4,3,8]);}
/* ---------- munição sem a arma: diz onde procurar (uma vez) ---------- */
const MUN_ARMA={municao9:{arma:'pistola',txt:'Munição 9mm serve na pistola. Pistola aparece em casas, carros, cofres e na delegacia; na oficina (bancada nível 2) dá para fabricar uma.'},
  cartucho:{arma:'espingarda',txt:'Cartucho calibre 12 serve na espingarda. Espingarda aparece em sítios, celeiros e na delegacia; na oficina dá para fabricar.'},
  balaRifle:{arma:'rifle',txt:'Bala de rifle serve no rifle com luneta. Ele aparece em caixas militares e arsenais; na oficina dá para fabricar (precisa de uma lanterna para a luneta).'},
  virote:{arma:'besta',txt:'Virote serve na besta. A besta sai da oficina (bancada nível 2) com madeira, corda, sucata e pregos.'}};
let munAntes=null;
PASSOS.push(function avisoMunicao(){if(!G.dicas)return;const m={};for(const k in MUN_ARMA)m[k]=invCount(k);
  if(munAntes)for(const k in m)if(m[k]>munAntes[k]&&!invCount(MUN_ARMA[k].arma))dica('mun_'+k,'corpo',MUN_ARMA[k].txt);munAntes=m;});
/* ---------- primeira noite mais clara: no fim da tarde do 1º dia, o que fazer antes de escurecer (uma vez) ---------- */
PASSOS.push(function avisoNoite1(){if(G.dia===1&&G.hora>=16.5&&G.hora<20&&G.dicas&&!G.dicas.noite1aviso)
  dica('noite1aviso','corpo','A primeira noite começa às 20h: saem zumbis noturnos que andam até você. Antes de escurecer, levante barricadas perto da fogueira (B), deixe a lanterna à mão (F) e tenha comida e água na mochila. Agachado (C) eles enxergam menos.');});
/* ---------- itens no chão: modelo de cada um ---------- */
const CHAO_VIS={maca:['fruta',0xb8322a],laranja:['fruta',0xe08a20],manga:['fruta',0xd8a030],acerola:['fruta',0xc0201c],tomate:['fruta',0xc8321e],frutas:['fruta',0x8a2a4a],
  batata:['fruta',0xb08a58],abobora:['fruta',0xd9771e],cogumelo:['fruta',0xc8b8a0],milho:['espiga',0xd9b84a],cenoura:['espiga',0xd9771e],feijaoVerde:['espiga',0x7aa040],
  feijao:['lata',0xb84a2a],sopa:['lata',0xc08a3a],biscoito:['caixinha',0xd0a040],racao:['caixinha',0x5a6a3a],
  carneCrua:['carne',0xa83a3a],carneAssada:['carne',0x7a4a2a],carneDefumada:['carne',0x6a3a24],carneSeca:['carne',0x7a4630],carneEstragada:['carne',0x5a6a3a],
  peixeCru:['peixe',0x8a9aa0],peixeAssado:['peixe',0x9a7a4a],peixeDefumado:['peixe',0x7a5a3a],
  agua:['garrafa',0x7aa8c8],refri:['garrafa',0xb83a2a],garrafa:['garrafa',0xa8c0c8],
  bandagem:['rolo',0xe8e2d8],remedios:['caixinha',0xe8e8f0],kit:['kit',0xffffff],
  municao9:['caixa',0xb89a4a],cartucho:['caixa',0xb83a2a],balaRifle:['caixa',0x6a7a3a],virote:['feixe',0x8a6a44],flecha:['feixe',0x9a7a54],
  tabuas:['tabuas',0xa07a50],madeira:['toras',0x6b4a2e],graveto:['feixe',0x7a5a3a],pedra:['pedras',0x8a8880],minerioFerro:['pedras',0x7a5a4a],carvao:['pedras',0x2a2a2a],
  sucata:['sucata',0x8d969f],pregos:['caixinha',0x9aa1a6],barraFerro:['barras',0x7a8288],chapaFerro:['chapa',0x8d969f],
  corda:['rolo',0xb89a6a],fibra:['rolo',0x6a8a3a],linha:['rolo',0xd8d0c0],tendao:['rolo',0xc8a8a0],pano:['pano',0x8a7a6a],couro:['pano',0x7a5030],peleCoelho:['pano',0xb8a890],la:['pano',0xe0d8c8],remendo:['pano',0x7a5030],
  gasolina:['galao',0xb8352a],sementes:['saquinho',0xc8b088],sal:['saquinho',0xf0f0f0],ossos:['feixe',0xe8e0c8],gordura:['caixinha',0xe8dcb0]};
const CHAO_TIPO={municao:['caixa',0xb89a4a],comida:['lata',0xa86a3a],bebida:['garrafa',0x8ab0c0],cura:['kit',0xffffff],material:['caixinha',0x9a8a70],roupa:['pano',0x6a6a5a]};
function chaoVis(id){const d=ITEMS[id];if(!d)return null;if((d.tipo==='arma'||d.mao)&&MESH.arma&&MESH.arma[id])return{arma:true,m:MESH.arma[id],c:[1,1,1]};
  const v=CHAO_VIS[id]||CHAO_TIPO[d.tipo];if(!v||!MESH['chao_'+v[0]])return null;if(!v.c)v.c=v[1]===0xffffff?[1,1,1]:Array.from(lin(v[1]),x=>x/0.578);/* os modelos são cinza claro (0xc8c8c8): o tom vira a cor do item */return{m:MESH['chao_'+v[0]],c:v.c};}
INIT_MALHAS.push(()=>{const R=rng(4141),mk=f=>{const g=new GB(1024,8);f(g);return litMesh(g.data());},cl=lin(0xc8c8c8),esc=scl(cl,0.6);
  const M=(n,f)=>{MESH['chao_'+n]=mk(f);};
  M('fruta',g=>{add(g,icoSubTris(0.07,0.12,R,1),mat(0,0.065,0),cl,{crease:70});add(g,cylTris(0.004,0.006,0.03,4),mat(0.005,0.13,0),scl(cl,0.35));});
  M('espiga',g=>add(g,icoTris(0.05,0.12,R),mat(0,0.04,0,0,0,0,2.4,0.7,0.8),cl,{crease:70}));
  M('lata',g=>{add(g,cylTris(0.045,0.045,0.11,10),ID,cl);add(g,cylTris(0.046,0.046,0.012,10),mat(0,0.11,0),scl(cl,1.25));});
  M('caixinha',g=>add(g,bvTris(0.15,0.06,0.1),mat(0,0.03,0),cl));
  M('caixa',g=>{add(g,bvTris(0.2,0.1,0.13),mat(0,0.05,0),scl(cl,0.85));add(g,boxTris(0.205,0.012,0.135),mat(0,0.085,0),cl);});
  M('kit',g=>{add(g,bvTris(0.26,0.1,0.18),mat(0,0.05,0),lin(0xe8e6e0));add(g,boxTris(0.12,0.012,0.035),mat(0,0.104,0),lin(0xc82020));add(g,boxTris(0.035,0.012,0.12),mat(0,0.104,0),lin(0xc82020));});
  M('garrafa',g=>{add(g,cylTris(0.035,0.035,0.16,8),mat(0,0.035,0,0,0,Math.PI/2),cl);add(g,cylTris(0.012,0.02,0.06,6),mat(-0.16,0.035,0,0,0,Math.PI/2),cl);});
  M('rolo',g=>{for(let i=0;i<10;i++){const a=i*0.628;add(g,cylTris(0.018,0.018,0.05,5),mm(mat(Math.cos(a)*0.075,0.02,Math.sin(a)*0.075,0,-a,0),mat(0,0,-0.025,Math.PI/2,0,0)),cl);}});
  M('feixe',g=>{for(let i=0;i<5;i++)add(g,cylTris(0.012,0.012,0.5,5),mat(-0.25,0.014+(i%2)*0.02,(i-2)*0.025,0,(R()-0.5)*0.12,-Math.PI/2),scl(cl,0.9+R()*0.2));add(g,boxTris(0.03,0.05,0.13),mat(0,0.03,0),scl(cl,0.5));});
  M('tabuas',g=>{for(let i=0;i<3;i++)add(g,bvTris(0.62,0.028,0.12),mat(0,0.016+i*0.03,(i-1)*0.02,0,i*0.5-0.5,0),scl(cl,0.85+R()*0.25));});
  M('toras',g=>{for(const[x,y]of[[-0.065,0.06],[0.065,0.06],[0,0.165]])add(g,cylTris(0.06,0.065,0.5,7),mat(-0.25,y,x,0,0,-Math.PI/2),scl(cl,0.85+R()*0.25),{j:0.08,rnd:R});});
  M('pedras',g=>{for(let i=0;i<3;i++)add(g,icoTris(0.055+R()*0.03,0.3,R),mat((R()-0.5)*0.16,0.04,(R()-0.5)*0.16,R(),R()*3,R(),1,0.75,1),scl(cl,0.85+R()*0.3),{j:0.12,rnd:R});});
  M('sucata',g=>{for(let i=0;i<4;i++)add(g,bvTris(0.08+R()*0.1,0.02+R()*0.03,0.05+R()*0.08),mat((R()-0.5)*0.18,0.03,(R()-0.5)*0.18,R()*0.6,R()*3,R()*0.6),scl(cl,0.8+R()*0.35),{j:0.1,rnd:R});});
  M('barras',g=>{for(let i=0;i<3;i++)add(g,bvTris(0.5,0.04,0.04),mat(0,0.02+(i===2?0.04:0),(i===2?0:(i-0.5)*0.05),0,0,0),scl(cl,0.9+R()*0.2));});
  M('chapa',g=>add(g,bvTris(0.4,0.025,0.3),mat(0,0.013,0,0,0.3,0.03),cl));
  M('pano',g=>{add(g,bvTris(0.3,0.045,0.24),mat(0,0.023,0),cl);add(g,bvTris(0.28,0.04,0.2),mat(0.01,0.065,0.01,0,0.12,0),scl(cl,1.08));});
  M('galao',g=>{add(g,bvTris(0.24,0.3,0.12),mat(0,0.15,0),cl);add(g,boxTris(0.12,0.04,0.025),mat(0,0.32,0),scl(cl,0.6));add(g,cylTris(0.02,0.02,0.05,6),mat(0.09,0.3,0),scl(cl,0.4));});
  M('saquinho',g=>{add(g,icoTris(0.085,0.18,R),mat(0,0.08,0,0,0,0,1,1.15,1),cl,{crease:60});add(g,cylTris(0.025,0.035,0.05,6),mat(0,0.17,0),scl(cl,0.8));});
  M('carne',g=>add(g,icoTris(0.09,0.2,R),mat(0,0.04,0,0,0,0,1.4,0.5,1),cl,{crease:60}));
  M('peixe',g=>{add(g,icoTris(0.06,0.1,R),mat(0,0.04,0,0,0,0,2.6,0.7,0.9),cl,{crease:60});add(g,boxTris(0.06,0.07,0.012),mat(-0.17,0.04,0,0,0,0.3),scl(cl,0.85));});});
/* desenha cada monte: o modelo do primeiro item (a arma deitada) e, se tiver mais coisa, um saquinho do lado */
const _MCH=new Float32Array(16);
function desenharChao(Pg){let tint=false;
  for(const d of DROPS){if(d2(d.x,d.z,P.x,P.z)>70*70)continue;const it=d.itens[0],v=it&&chaoVis(it[0]),ry=d.x*3;
    if(!v){trs(_MCH,d.x,d.y,d.z,0,ry,0,1,1,1);if(tint){gl.uniform3f(Pg.u.uTint,1,1,1);tint=false;}drawStat(Pg,MESH.saco,_MCH);continue;}
    gl.uniform3fv(Pg.u.uTint,v.c);tint=true;
    if(v.arma)trs(_MCH,d.x,d.y+0.04,d.z,0,ry,Math.PI/2,1,1,1);else trs(_MCH,d.x,d.y,d.z,0,ry,0,1,1,1);drawStat(Pg,v.m,_MCH);
    if(d.itens.length>1){gl.uniform3f(Pg.u.uTint,1,1,1);tint=false;trs(_MCH,d.x+0.28,d.y,d.z+0.12,0,ry+1,0,0.7,0.7,0.7);drawStat(Pg,MESH.saco,_MCH);}}
  if(tint)gl.uniform3f(Pg.u.uTint,1,1,1);}
/* etiquetas: ícone, nome e quantidade dos montes perto de você */
let chaoTagsEl=null;const chaoTagsPool=[];
const CSS_CHAO='.chao-tags{position:absolute;inset:0;pointer-events:none;z-index:4}.chao-tag{position:absolute;left:0;top:0;display:flex;align-items:center;gap:5px;padding:3px 8px 3px 5px;border-radius:999px;background:rgba(10,13,12,.72);border:1px solid rgba(236,228,210,.18);color:#ece4d2;font:700 12px/1.1 system-ui,sans-serif;white-space:nowrap;will-change:transform}.chao-tag .ico{width:15px;height:15px;flex:none}.chao-tag i{font-style:normal;opacity:.75;font-weight:600}';
HUDS.push(function hudChao(){if(!chaoTagsEl){const pr=$('prompt');if(!pr||!pr.parentNode)return;const st=document.createElement('style');st.textContent=CSS_CHAO;document.head.appendChild(st);
    chaoTagsEl=document.createElement('div');chaoTagsEl.className='chao-tags';chaoTagsEl.setAttribute('aria-hidden','true');pr.parentNode.insertBefore(chaoTagsEl,pr);}
  const L=[];if(G.modo==='jogo'&&P.y>-200)for(const d of DROPS){const dd=d2(d.x,d.z,P.x,P.z);if(dd<7.5*7.5&&Math.abs((d.y??P.y)-P.y)<2.6&&d.itens.length)L.push([dd,d]);}
  L.sort((a,b)=>a[0]-b[0]);let k=0;
  for(const[,d]of L.slice(0,6)){const pt=project([d.x,(d.y??ground(d.x,d.z))+0.42,d.z]);if(!pt)continue;let el=chaoTagsPool[k];
    if(!el){el=document.createElement('div');el.className='chao-tag';chaoTagsEl.appendChild(el);chaoTagsPool.push(el);}
    const it=d.itens[0],D=ITEMS[it[0]],chave=d.itens.map(x=>x[0]+':'+x[1]).join('|');
    if(el.dataset.k!==chave){el.dataset.k=chave;el.innerHTML=svgUse(D?D.icon:'i-mochila')+'<b>'+(D?D.nome:it[0])+(it[1]>1?' ×'+it[1]:'')+'</b>'+(d.itens.length>1?'<i>+'+(d.itens.length-1)+(d.itens.length>2?' itens':' item')+'</i>':'');}
    el.hidden=false;el.style.transform='translate('+pt[0].toFixed(0)+'px,'+pt[1].toFixed(0)+'px) translate(-50%,-100%)';k++;}
  for(;k<chaoTagsPool.length;k++)chaoTagsPool[k].hidden=true;});
