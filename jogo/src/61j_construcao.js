/* ================= Etapa 16: construção =================
   TELHADO DA CASA (aba Casa): um telhado só cobrindo o andar de cima inteiro. Em cima de uma plataforma, ele pega todas as
   plataformas encostadas na mesma altura (o piso tem que formar um retângulo: 1×1, 2×1, 2×2...) e fica na altura das paredes
   de cima. Modelos: duas águas (reto), pontudo (quatro águas; no piso quadrado vira um cone de quatro lados) e plano. Segure E
   embaixo dele, no andar de cima, para trocar o modelo e a cobertura (telha de barro, palha ou chapa). Custa por módulo coberto. */
iconesNovos({
  'i-telhado-casa':'<path d="M2.5 12.5 12 5l9.5 7.5"/><path d="M5 11v8.5h14V11"/><path d="M4 13.5h16"/>',
  'i-telhado-cone':'<path d="M3 16 12 4l9 12z"/><path d="M12 4v12M7.5 16v4M16.5 16v4"/>'});
const TETO_CFG={beiral:0.45,inc:0.62,cores:{barro:0x9a4e34,palha:0xb8995a,chapa:0x7d858a},custo:{tabuas:6,fibra:6,pregos:2}};
Object.assign(OBRAS,{
  telhadoCasa:{nome:'Telhado da casa',icon:'i-telhado-casa',custo:TETO_CFG.custo,hp:360,hw:2,hd:2,solid:false,alto:'tetoCasa',etapa:2,estilo:'duas',
    desc:'Um telhado só, de duas águas, cobrindo o andar de cima inteiro (todas as plataformas da casa). Custa por módulo coberto. Segure E embaixo dele para trocar o modelo.'},
  telhadoCone:{nome:'Telhado pontudo',icon:'i-telhado-cone',custo:TETO_CFG.custo,hp:360,hw:2,hd:2,solid:false,alto:'tetoCasa',etapa:2,estilo:'quatro',
    desc:'Telhado de quatro águas cobrindo a casa inteira; no piso quadrado vira um cone pontudo. Custa por módulo coberto.'}});
{const cs=OBRA_CATS.find(c=>c.id==='casa');if(cs){const i=cs.t.indexOf('telhado');cs.t.splice(i>=0?i+1:cs.t.length,0,'telhadoCasa','telhadoCone');}
  for(const k of['telhadoCasa','telhadoCone']){if(!OBRA_ORDEM.includes(k))OBRA_ORDEM.push(k);if(!OBRAS_ALTO.includes(k))OBRAS_ALTO.push(k);}}
/* plataformas da mesma casa: encostadas, na mesma altura e no mesmo giro (a grade da casa) */
function grupoPlats(p0){const L=ALTO_CFG.lado,k0=modK(p0),c=Math.cos(p0.yaw),s=Math.sin(p0.yaw),G2=[p0],vis=new Set([p0]),cel=new Map();
  const loc=q=>{const dx=q.x-p0.x,dz=q.z-p0.z;return[(dx*c-dz*s)/(L*k0),(dx*s+dz*c)/(L*k0)];};
  for(let i=0;i<G2.length;i++){const a=G2[i];for(const q of OB){if(q.tipo!=='plataforma'||vis.has(q)||Math.abs(q.y-a.y)>0.3||Math.abs(modK(q)-k0)>0.01)continue;
    const dy=((q.yaw-p0.yaw)%(Math.PI/2)+Math.PI/2)%(Math.PI/2);if(Math.min(dy,Math.PI/2-dy)>0.05)continue;
    const d=Math.hypot(q.x-a.x,q.z-a.z);if(Math.abs(d-L*k0)>0.4)continue;vis.add(q);G2.push(q);}}
  let i0=1e9,i1=-1e9,j0=1e9,j1=-1e9;for(const q of G2){const[u,v]=loc(q),i=Math.round(u),j=Math.round(v);cel.set(i+','+j,q);i0=Math.min(i0,i);i1=Math.max(i1,i);j0=Math.min(j0,j);j1=Math.max(j1,j);}
  const ni=i1-i0+1,nj=j1-j0+1,cu=(i0+i1)/2*L*k0,cv=(j0+j1)/2*L*k0;
  return{ps:G2,ni,nj,cheio:cel.size===ni*nj,x:p0.x+cu*c+cv*s,z:p0.z-cu*s+cv*c,yaw:p0.yaw,y:p0.y,k:k0,kh:modKH(p0)};}
function alvoTetoCasa(D){let p0=null;{const s=supEm(P.x,P.z,P.y,0.3);if(s&&s.dono&&s.dono.tipo==='plataforma')p0=s.dono;}
  if(!p0){let bd=4.5*4.5;for(const o of OB){if(o.tipo!=='plataforma'||Math.abs(o.y-P.y)>0.8)continue;const d=d2(o.x,o.z,P.x,P.z);if(d<bd){bd=d;p0=o;}}}
  if(!p0)return{x:P.x,z:P.z,y:P.y+2.5,yaw:P.yaw,ok:false,motivo:'Suba no andar de cima: o telhado da casa vai em cima das plataformas'};
  const g=grupoPlats(p0),Lm=ALTO_CFG.lado*g.k,ext={m:g.k>1.01?4:undefined,ni:g.ni,nj:g.nj,hw:+(g.ni*Lm/2).toFixed(3),hd:+(g.nj*Lm/2).toFixed(3),estilo:D.estilo,cor:'barro',n:g.ps.length};
  if(!ext.m)delete ext.m;
  const r={x:g.x,z:g.z,y:g.y+2.5*g.kh+0.02,yaw:g.yaw,ext},no=m=>Object.assign(r,{ok:false,motivo:m});
  if(!g.cheio)return no('O telhado da casa cobre um piso retangular: complete as plataformas que faltam (ou use o telhado de cada plataforma)');
  if(g.ps.length>12)return no('Grande demais para um telhado só (até 12 plataformas)');
  if(OB.some(o=>OBRAS[o.tipo]&&OBRAS[o.tipo].alto==='tetoCasa'&&d2(o.x,o.z,r.x,r.z)<0.5&&Math.abs(o.y-r.y)<0.6))return no('Essa casa já tem telhado');
  if(OB.some(o=>o.tipo==='telhado'&&g.ps.some(p=>d2(p.x,p.z,o.x,o.z)<0.3&&Math.abs(p.y-o.y)<0.3)))return no('Tire antes os telhados de cada plataforma dessa casa');
  for(const p of g.ps)for(const q of OB)if(OBRAS[q.tipo]&&OBRAS[q.tipo].alto==='plat'&&q!==p&&q.y>p.y+0.5&&q.y<r.y+0.5&&noRet(q.x,q.z,p.x,p.z,p.yaw,1.5*g.k,1.5*g.k,0))return no('Tem outro andar em cima: o telhado vai no último andar');
  r.ok=true;return r;}
{const _oa=obraAlvoAlto;obraAlvoAlto=function(D){if(D.alto!=='tetoCasa')return _oa.apply(this,arguments);const r=alvoTetoCasa(D);
  OBRA.x=r.x;OBRA.z=r.z;OBRA.y=r.y;OBRA.yaw=r.yaw;OBRA.ext=r.ext||null;OBRA.motivo=r.ok?'':(r.motivo||'Não cabe aqui');OBRA.ok=!!r.ok&&invHas(custoObra(OBRA.tipo));};}
/* custo: por módulo coberto */
{const _co=custoObra;custoObra=function(k){const c=_co.apply(this,arguments);if(OBRAS[k]&&OBRAS[k].alto==='tetoCasa'){const n=(OBRA.ativo&&OBRA.tipo===k&&OBRA.ext&&OBRA.ext.n)||1;const o={};for(const q in c)o[q]=c[q]*n;return o;}return c;};}
{const _ma=montarAlto;montarAlto=function(o,D,e){_ma.apply(this,arguments);if(D.alto==='tetoCasa'){o.ext.estilo=o.ext.estilo||D.estilo||'duas';o.mesh=litMesh(geoTelhadoCasa(o.ext));}};}
/* malha do telhado (no sistema dele: x ao longo das colunas, z ao longo das linhas, base na origem) */
function geoTelhadoCasa(e){const g=new GB(8192,8),R=rng(Math.round((e.hw*7+e.hd*13)*100)),B=TETO_CFG.beiral,W=e.hw*2+B*2,D=e.hd*2+B*2,o={j:0.06,rnd:R};
  const telha=lin(TETO_CFG.cores[e.cor]||TETO_CFG.cores.barro),telha2=mixc(telha,lin(0x2a2018),0.25),mad=lin(0x6e5235),esc=lin(0x4a3424);
  const est=e.estilo||'duas';
  {const kh=e.m===4?CASA_KH:1,hp=2.5*kh+0.02,ni=e.ni||1,nj=e.nj||1,P_=new Set();   // esteios nos cantos dos módulos da beirada: o telhado não fica solto sem parede em cima
    for(let i=0;i<=ni;i++)for(let j=0;j<=nj;j++){if(i>0&&i<ni&&j>0&&j<nj)continue;const x=-e.hw+e.hw*2*i/ni,z=-e.hd+e.hd*2*j/nj,k=x.toFixed(2)+','+z.toFixed(2);if(P_.has(k))continue;P_.add(k);
      add(g,boxTris(0.15,hp,0.15),mat(x-Math.sign(x)*0.08,-hp/2,z-Math.sign(z)*0.08),esc,o);}}
  if(est==='plano'){add(g,boxTris(W,0.16,D),mat(0,0.08,0),telha,o);for(const s of[1,-1]){add(g,boxTris(W,0.22,0.12),mat(0,0.2,s*(D/2-0.06)),telha2,o);add(g,boxTris(0.12,0.22,D),mat(s*(W/2-0.06),0.2,0),telha2,o);}
    add(g,boxTris(W-0.3,0.04,0.06),mat(0,-0.02,0),esc,o);return g.data();}
  const xL=W>=D;   // a cumeeira corre no lado mais comprido
  const vao=(xL?D:W)/2,H=Math.max(0.9,vao*TETO_CFG.inc),Lc=(xL?W:D);
  if(est==='duas'){const S=Math.hypot(vao,H),a=Math.atan2(H,vao),wi=(xL?e.hd:e.hw)*2,off=H*(vao-wi/2)/vao;
    // empenas de tábua na linha das paredes: faixa embaixo e triângulo até a cumeeira, colados por baixo das telhas
    for(const s2 of[1,-1]){if(xL){add(g,boxTris(0.1,off,wi),mat(s2*e.hw,off/2,0),mad,o);add(g,roofTris(wi,H-off,0.1),mat(s2*e.hw,off,0,0,Math.PI/2,0),mad,o);}
      else{add(g,boxTris(wi,off,0.1),mat(0,off/2,s2*e.hd),mad,o);add(g,roofTris(wi,H-off,0.1),mat(0,off,s2*e.hd),mad,o);}}
    for(const s2 of[1,-1]){const m=xL?mat(0,H/2,s2*vao/2,s2*a,0,0):mat(s2*vao/2,H/2,0,0,0,-s2*a);add(g,xL?boxTris(Lc,0.09,S+0.05):boxTris(S+0.05,0.09,Lc),m,telha,o);}
    add(g,xL?boxTris(Lc+0.05,0.12,0.2):boxTris(0.2,0.12,Lc+0.05),mat(0,H+0.03,0),telha2,o);
    return g.data();}
  // quatro águas: sólido com a cumeeira no meio (vira pirâmide no piso quadrado)
  const r=Math.max(0,Lc-(xL?D:W))/2,A=[-W/2,0,-D/2],Bq=[W/2,0,-D/2],Cq=[W/2,0,D/2],Dq=[-W/2,0,D/2],R1=xL?[-r,H,0]:[0,H,-r],R2=xL?[r,H,0]:[0,H,r];
  const T=xL?[[A,Bq,R2],[A,R2,R1],[Cq,Dq,R1],[Cq,R1,R2],[Dq,A,R1],[Bq,Cq,R2],[A,Dq,Cq],[A,Cq,Bq]]:[[A,Bq,R1],[Bq,Cq,R2],[Bq,R2,R1],[Cq,Dq,R2],[Dq,A,R1],[Dq,R1,R2],[A,Dq,Cq],[A,Cq,Bq]];
  add(g,T,mat(0,0,0),telha,{j:0.05,rnd:R,flat:true});
  add(g,xL?boxTris(Math.max(0.2,2*r)+0.1,0.1,0.16):boxTris(0.16,0.1,Math.max(0.2,2*r)+0.1),mat(0,H+0.02,0),telha2,o);
  return g.data();}
/* trocar o modelo e a cobertura: segure E embaixo dele, no andar de cima */
INTERS.push(function tetoCasaInter(tryIt){if(!P.alive||CARRO.ativo)return;for(const o of OB){if(!OBRAS[o.tipo]||OBRAS[o.tipo].alto!=='tetoCasa'||o.hp<=0)continue;const e=o.ext||{};
  if(o.y-P.y<1.2||o.y-P.y>3.6||!noRet(P.x,P.z,o.x,o.z,o.yaw,e.hw||2,e.hd||2,0))continue;tryIt({k:'tetoCasa',o:{x:P.x+Math.sin(P.yaw)*0.3,z:P.z+Math.cos(P.yaw)*0.3,y:P.y,teto:o}},P.x,P.z,1,0.4,-2,P.y);}});
INTER_K.tetoCasa={texto:q=>({t:'Telhado da casa',s:'segure: trocar o modelo e a cobertura',hold:true,dur:0.6}),usar:(q,seg)=>{if(!seg)return;const o=q.teto;o.estTipo='tetoCasa';o.nome='Telhado da casa';abrirEstacao(o);}};
ESTACOES.tetoCasa={nome:'Telhado da casa',icon:'i-telhado-casa',ir:'',chip:'Telhado'};
const TETO_ESTILOS=[['duas','Duas águas','reto, com cumeeira'],['quatro','Pontudo','quatro águas (cone no piso quadrado)'],['plano','Plano','laje com mureta']];
const TETO_CORES=[['barro','Telha de barro'],['palha','Palha'],['chapa','Chapa de metal']];
ESTACAO_UI.tetoCasa={resumo:o=>(TETO_ESTILOS.find(q=>q[0]===o.ext.estilo)||TETO_ESTILOS[0])[1],
  render(o){const e=o.ext,A=[];for(const[id,t,s]of TETO_ESTILOS)A.push({id:'e_'+id,t,s,ok:e.estilo!==id,prim:false});for(const[id,t]of TETO_CORES)A.push({id:'c_'+id,t,s:e.cor===id?'atual':'troca de graça',ok:e.cor!==id});
    return{sub:'Cobre '+(e.ni*e.nj)+' módulo'+(e.ni*e.nj>1?'s':'')+' ('+(e.hw*2).toFixed(0)+' × '+(e.hd*2).toFixed(0)+' m)',corpo:'<p class="es-info">Modelo: <b>'+ESTACAO_UI.tetoCasa.resumo(o)+'</b> · cobertura: <b>'+(TETO_CORES.find(q=>q[0]===e.cor)||TETO_CORES[0])[1].toLowerCase()+'</b>. Trocar não gasta material.</p>',acoes:A};},
  acao(o,id){const e=o.ext;if(id.startsWith('e_'))e.estilo=id.slice(2);else if(id.startsWith('c_'))e.cor=id.slice(2);else return'';if(o.mesh)liberarMesh(o.mesh);o.mesh=litMesh(geoTelhadoCasa(e));sfx('construir');return'Telhado trocado';}};
Object.assign(BASE_DICAS,{telhadoCasa:'Telhado da casa pronto: cobre o andar de cima inteiro. Segure E embaixo dele (no andar de cima) para trocar o modelo e a cobertura.',
  telhadoCone:'Telhado pontudo pronto. Segure E embaixo dele (no andar de cima) para trocar o modelo e a cobertura.'});

/* ---------- MARCO DA BASE (aba Base): marca a área da base, como o armário de ferramentas do Rust, mas do nosso jeito: um
   totem de pedra e madeira com a placa da base e a bandeira na cor do nível. O que fica a até 34 m dele conta para os pontos e
   o nível da base, entra no "Consertar tudo", e os sobreviventes passam a morar e trabalhar em volta dele (em volta da
   fogueira mais perto do marco, se houver). Só existe um; para mudar de lugar, mova (Z no modo de construção). Sem marco, a base
   continua sendo a clareira da fogueira. ---------- */
iconesNovos({'i-marco':'<path d="M7 21h10M8.5 21l1-4h5l1 4"/><path d="M12 17V3"/><path d="M12 4h7l-2 2.5 2 2.5h-7"/><path d="M9 11h6v3H9z"/>'});
OBRAS.marcoBase={nome:'Marco da base',icon:'i-marco',custo:{madeira:6,pedra:10,corda:2,tabuas:4,pregos:2},hp:900,hw:0.45,hd:0.45,solid:true,hCol:2.4,etapa:1,pts:6,alvo:alvoMarco,
  desc:'Marca o centro da sua base: o que estiver a até 34 m conta para o nível da base e para o "Consertar tudo", e os sobreviventes moram e trabalham em volta dele. Só um por mundo.'};
{const b=OBRA_CATS.find(c=>c.id==='base');if(b&&!b.t.includes('marcoBase'))b.t.unshift('marcoBase');if(!OBRA_ORDEM.includes('marcoBase'))OBRA_ORDEM.push('marcoBase');if(!OBRAS_CHAO.includes('marcoBase'))OBRAS_CHAO.push('marcoBase');}
const MARCO_R=34;
function marcoBase(){for(const o of OB)if(o.tipo==='marcoBase'&&o.hp>0)return o;return null;}
function baseCentro(){const m=marcoBase();return m?[m.x,m.z]:[FIRE[0],FIRE[2]];}
/* fogo da base: a fogueira (ou fogareiro) mais perto do marco, até 16 m; sem nenhum, o próprio marco */
function baseFogo(){const m=marcoBase();if(!m)return[FIRE[0],FIRE[2]];let best=null,bd=16*16;for(const f of FIRES){if(f.lamp||f.eletrica)continue;const d=d2(f.x,f.z,m.x,m.z);if(d<bd){bd=d;best=f;}}
  if(!best&&d2(FIRE[0],FIRE[2],m.x,m.z)<bd)return[FIRE[0],FIRE[2]];return best?[best.x,best.z]:[m.x+1.6,m.z+1.6];}
function alvoMarco(x,z,yaw){const r={x,z,y:ground(x,z),yaw};const m=marcoBase();if(m)return Object.assign(r,{ok:false,motivo:'Já existe um marco da base: desmonte o outro antes'});
  for(const[lx,lz]of[[0,0],[0.45,0.45],[-0.45,0.45],[0.45,-0.45],[-0.45,-0.45]]){const w=localW(r,lx,lz);if(bloqueadoChao(w[0],w[1],0.12,r.y))return Object.assign(r,{ok:false,motivo:'Tem coisa no caminho'});}
  if(Math.hypot(P.x-x,P.z-z)<0.9)return Object.assign(r,{ok:false,motivo:'Perto demais de você'});if(!dentroMapa(x,z,3))return Object.assign(r,{ok:false,motivo:'Longe demais'});
  r.ok=true;return r;}
INIT_MALHAS.push(function marcoMalhas(){const R=rng(1616),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());},o={j:0.08,rnd:R};
  const pedra=lin(0x76736b),pedra2=lin(0x8f8b81),mad=lin(0x6e5235),esc=lin(0x4a3424),placa=lin(0x8e6a46);
  MESH.obra.marcoBase=mk(g=>{add(g,bvTris(0.9,0.36,0.9),mat(0,0.18,0),pedra,o);for(let i=0;i<9;i++){const a=i/9*6.283;add(g,icoTris(0.16+R()*0.07,0.3,R),mat(Math.cos(a)*0.42,0.42+R()*0.1,Math.sin(a)*0.42),R()<0.5?pedra:pedra2,o);}
    add(g,bvTris(0.6,0.24,0.6),mat(0,0.5,0),pedra2,o);add(g,boxTris(0.18,2.3,0.18),mat(0,1.55,0),esc,o);for(const y of[0.95,2.15])add(g,cylTris(0.13,0.13,0.05,8),mat(0,y,0),lin(0x8a7650),o);
    add(g,boxTris(0.78,0.42,0.06),mat(0,1.45,0.12),placa,o);add(g,boxTris(0.84,0.06,0.08),mat(0,1.69,0.12),esc,o);add(g,boxTris(0.84,0.06,0.08),mat(0,1.21,0.12),esc,o);
    for(let i=0;i<3;i++)add(g,boxTris(0.5-i*0.12,0.035,0.02),mat(0,1.52-i*0.09,0.16),lin(0x2a2018),o);   // letreiro entalhado
    add(g,boxTris(0.05,0.05,0.62),mat(0,2.62,0.3),esc,o);add(g,icoTris(0.07,0.2,R),mat(0,2.72,0),lin(0xb08a40),o);});
  MESH.marcoPano=mk(g=>{add(g,boxTris(0.03,0.42,0.58),mat(0,2.38,0.3),lin(0xffffff),{j:0.04,rnd:R});add(g,boxTris(0.03,0.2,0.2),mat(0,2.27,0.68,0.6,0,0),lin(0xffffff),{j:0.04,rnd:R});});});
DESENHO.opaco.push(function marcoPano(Pg){const m=marcoBase();if(!m||!MESH.marcoPano||d2(m.x,m.z,cam.pos[0],cam.pos[2])>140*140)return;const b=BASE_NIVEIS[(G.baseNv||1)-1]||BASE_NIVEIS[0],c=b.cor;
  gl.uniform3f(Pg.u.uTint,((c>>16)&255)/255*1.2,((c>>8)&255)/255*1.2,(c&255)/255*1.2);drawStat(Pg,MESH.marcoPano,mat(m.x,m.y,m.z,0,m.yaw+Math.sin(G.t*0.8)*0.15,0));gl.uniform3f(Pg.u.uTint,1,1,1);});
/* painel do marco: nível, pontos, o que tem na base e o consertar tudo */
OBRAS.marcoBase.estacao='marcoBase';
ESTACOES.marcoBase={nome:'Marco da base',icon:'i-marco',ir:'o marco da base',chip:'Marco'};
ESTACAO_UI.marcoBase={resumo:o=>{const b=baseNivel();return b.n.nome+' · '+b.pts+' pontos';},
  render(o){const b=baseNivel(),L=OB.filter(q=>q!==o&&sobBase(q.x,q.z,MARCO_R)),dan=L.filter(q=>q.hp<q.hpMax-0.5).length,sob=typeof SOBREV!=='undefined'?SOBREV.filter(s=>s.st==='base').length:0,r=consertarTudo(true);
    const c='<div class="es-lista">'+cavMedidor('Nível '+b.n.n+' · '+b.n.nome,b.prox?Math.min(1,(b.pts-b.n.pts)/Math.max(1,b.prox.pts-b.n.pts)):1,b.pts+' pontos'+(b.prox?' · '+b.prox.nome+' com '+b.prox.pts:' · nível máximo'))+'</div>'+
      '<p class="es-info">Área da base: '+MARCO_R+' m em volta do marco. Construções: <b>'+L.length+'</b>'+(dan?' ('+dan+' danificada'+(dan>1?'s':'')+')':'')+'. Sobreviventes morando aqui: <b>'+sob+'</b>.<br>Eles dormem e cozinham em volta da fogueira mais perto do marco.</p>';
    return{sub:'O centro da sua base',corpo:c,acoes:[{id:'consertar',t:'Consertar tudo',s:r.total?r.total+' danificada'+(r.total>1?'s':''):'nada danificado',ok:r.total>0,prim:r.total>0}]};},
  acao(o,id){if(id==='consertar'){const r=consertarTudoUI();return r&&r.n?'Consertou '+r.n:'';}return'';}};
MAPA_DESENHOS.push((g,X,Y,k,n)=>{const m=marcoBase();if(!m)return;g.strokeStyle=n>0.5?'rgba(240,200,120,.45)':'rgba(200,120,40,.55)';g.lineWidth=1.5;g.setLineDash([4,4]);
  g.beginPath();g.arc(X(m.x),Y(m.z),MARCO_R*k,0,6.283);g.stroke();g.setLineDash([]);g.fillStyle='#d8902a';g.beginPath();g.arc(X(m.x),Y(m.z),4,0,6.283);g.fill();});
BASE_DICAS.marcoBase='Marco da base no lugar! O que estiver a até 34 m dele conta para o nível da base e para o Consertar tudo, e os sobreviventes vêm morar aqui (em volta da fogueira mais perto). Toque E no marco para ver a base.';

/* ---------- ESTABILIDADE: cada peça de estrutura tem uma porcentagem. Pilar e parede no chão: 100%. Plataforma em cima de pilares
   espalhados (cantos opostos): 100%; pilares só numa beirada: 80%; um pilar só: 60% a 85%; em galho grosso: 85%; no tronco: 95%;
   presa só na vizinha (balanço): 70% da vizinha,
   e o peso em cima (paredes, telhado, baú, bancada, cama) tira um pouco. Peça danificada segura menos. Parede, janela, parapeito
   e telhado do andar de cima valem o piso embaixo deles. No modo de construção a mira mostra a estabilidade da peça nova; abaixo
   de 30% não deixa construir; se um apoio quebra e o piso fica abaixo de 25%, ele desaba (e leva o que estava em cima). ---------- */
const EST_CFG={balanco:0.7,umPilar:0.85,galho:0.85,tronco:0.95,minimo:0.3,desaba:0.25,peso:{paredeAlta:0.05,janelaAlta:0.05,parapeito:0.02,telhado:0.06,bau:0.03,bancadaTrab:0.05,camaMadeira:0.03,cama:0.02,estante:0.03,armarioFerro:0.06}};
const vidaK=o=>0.6+0.4*clamp(o.hp/(o.hpMax||1),0,1);
function pilaresSob(p){const k=modK(p);return OB.filter(o=>o.tipo==='pilar'&&o.hp>0&&Math.abs(o.ext.top-p.y)<0.3&&noRet(o.x,o.z,p.x,p.z,p.yaw,1.5*k+0.2,1.5*k+0.2,0));}
function pesoEm(p){let s=0;const k=modK(p);for(const q of OB){const w=EST_CFG.peso[q.tipo];if(!w||Math.abs(q.y-p.y)>0.4)continue;if(noRet(q.x,q.z,p.x,p.z,p.yaw,1.5*k+0.1,1.5*k+0.1,0))s+=w;}return s;}
/* estabilidade de todas as plataformas de uma vez: apoio próprio e depois o balanço a partir das vizinhas (algumas voltas) */
let estCache=null,estCacheK='';
/* pilares: quanto mais espalhados embaixo do piso, mais firme. Quatro cantos (ou dois em cantos opostos): 100%; dois na mesma
   beirada (piso só de um lado): 80%; um só: 85% no meio, 60% num canto. Pilar danificado segura menos. */
function apoioPilares(p,ps){const h=1.5*modK(p),c=Math.cos(p.yaw),s=Math.sin(p.yaw),L=ps.map(o=>{const dx=o.x-p.x,dz=o.z-p.z;return[dx*c-dz*s,dx*s+dz*c];});
  const vk=ps.reduce((a,o)=>a+vidaK(o),0)/ps.length;
  if(ps.length===1){const d=Math.min(1,Math.hypot(L[0][0],L[0][1])/(h*1.414));return(EST_CFG.umPilar-0.25*d)*vk;}
  const sx=Math.max(...L.map(q=>q[0]))-Math.min(...L.map(q=>q[0])),sz=Math.max(...L.map(q=>q[1]))-Math.min(...L.map(q=>q[1])),cob=(Math.min(1,sx/(2*h))+Math.min(1,sz/(2*h)))/2;
  return Math.min(1,0.6+0.4*cob)*vk;}
function apoioProprio(p){const ap=p.apoio||'galho';let e=ap==='chao'?1:ap==='tronco'?EST_CFG.tronco:ap==='galho'?EST_CFG.galho:0;
  const ps=pilaresSob(p);if(ps.length)e=Math.max(e,apoioPilares(p,ps));
  return{e:clamp(e*(ap==='chao'||ps.length?1:vidaK(p)),0,1),pil:ps.length};}
function estMapa(){const ps=OB.filter(o=>o.tipo==='plataforma'),k=ps.length+':'+Math.floor(G.t*2)+':'+OB.length;if(estCache&&k===estCacheK)return estCache;
  const M=new Map(),base=new Map();for(const p of ps){const a=apoioProprio(p);base.set(p,a);M.set(p,a.e);}
  for(let it=0;it<5;it++){let mudou=false;for(const p of ps){if(M.get(p)>=1)continue;const L=ALTO_CFG.lado*modK(p),pe=pesoEm(p);
    for(const q of ps){if(q===p||Math.abs(q.y-p.y)>0.35||Math.abs(Math.hypot(q.x-p.x,q.z-p.z)-L)>0.45)continue;const v=clamp(M.get(q)*EST_CFG.balanco-pe,0,1);if(v>M.get(p)+1e-4){M.set(p,v);mudou=true;}}}if(!mudou)break;}
  estCache=M;estCacheK=k;return M;}
function estPlat(p){const M=estMapa();if(M.has(p))return M.get(p);return apoioProprio(p).e;}
function estabilidade(o){if(!o||!OBRAS[o.tipo])return null;const D=OBRAS[o.tipo];
  if(o.tipo==='plataforma')return estPlat(o);
  if(D.alto==='borda'||o.tipo==='telhado'){const p=platEmbaixo(o);return p?estPlat(p)*0.97:null;}
  if(D.alto==='tetoCasa'){let e=1;for(const p of OB)if(p.tipo==='plataforma'&&Math.abs(o.y-(p.y+2.5*modKH(p)))<0.4&&noRet(p.x,p.z,o.x,o.z,o.yaw,(o.ext.hw||2)+0.1,(o.ext.hd||2)+0.1,0))e=Math.min(e,estPlat(p));return e*0.97;}
  if(o.tipo==='pilar'||PAREDES.has(o.tipo)||o.tipo==='palicada'||o.tipo==='muralha')return vidaK(o);
  return null;}
function platEmbaixo(o){let best=null,bd=1e9;for(const p of OB){if(p.tipo!=='plataforma'||Math.abs(p.y-o.y)>0.4)continue;const k=modK(p);if(!noRet(o.x,o.z,p.x,p.z,p.yaw,1.5*k+0.3,1.5*k+0.3,0))continue;const d=d2(o.x,o.z,p.x,p.z);if(d<bd){bd=d;best=p;}}return best;}
/* estabilidade prevista da peça que está na mira */
function estPrevista(){const t=OBRA.tipo,D=OBRAS[t],e=OBRA.ext||{};if(!D)return null;
  if(t==='plataforma'){const fake={tipo:'plataforma',x:OBRA.x,z:OBRA.z,y:OBRA.y,yaw:OBRA.yaw,ext:e,apoio:e.apoio,hp:1,hpMax:1};
    if(e.apoio==='vizinha'){let best=0;const L=ALTO_CFG.lado*modK(fake);for(const q of OB)if(q.tipo==='plataforma'&&Math.abs(q.y-OBRA.y)<0.35&&Math.abs(Math.hypot(q.x-OBRA.x,q.z-OBRA.z)-L)<0.45)best=Math.max(best,estPlat(q)*EST_CFG.balanco);return best;}
    return estPlat(fake);}
  if(D.alto==='borda'||t==='telhado'){const p=platEmbaixo({x:OBRA.x,z:OBRA.z,y:OBRA.y});if(!p)return null;let v=estPlat(p);if(!pilaresSob(p).length&&p.apoio!=='chao'&&p.apoio!=='tronco')v-=EST_CFG.peso[t]||0;return Math.max(0,v*0.97);}
  if(D.alto==='tetoCasa'){const s=supEm(P.x,P.z,P.y,0.3);return s&&s.dono&&s.dono.tipo==='plataforma'?estPlat(s.dono)*0.97:null;}
  if(t==='pilar'||PAREDES.has(t))return 1;
  if((D.bau||D.peq)&&EST_CFG.peso[t]){const s=supEm(OBRA.x,OBRA.z,OBRA.y,0.3);if(s&&s.dono&&s.dono.tipo==='plataforma'){const p=s.dono;let v=estPlat(p);if(!pilaresSob(p).length&&p.apoio!=='chao'&&p.apoio!=='tronco')v-=EST_CFG.peso[t];return Math.max(0,v);}}
  return null;}
{const _oa=obraAlvo;obraAlvo=function(){_oa.apply(this,arguments);if(!OBRA.ok)return;const e=estPrevista();OBRA.est=e;
  if(e!==null&&e<EST_CFG.minimo){OBRA.ok=false;OBRA.motivo='Instável demais ('+Math.round(e*100)+'%): '+(OBRA.tipo==='plataforma'?'ponha um pilar embaixo':'peso demais para esse piso sem pilar embaixo');hudMotivo();}};}
{let estMostrada=null;const _hm=hudMotivo;hudMotivo=function(){const e=OBRA.ok&&OBRA.est!==null&&OBRA.est!==undefined?Math.round(OBRA.est*100):null,k=(OBRA.ok?'':OBRA.motivo||'')+'|'+e+'|'+OBRA.tipo;
  if(k===estMostrada)return;estMostrada=k;motivoMostrado=null;_hm.apply(this,arguments);
  if(e!==null){const el=$('item-nome');if(el)el.insertAdjacentHTML('beforeend','<span class="cc'+(e<50?' f':'')+'" title="Estabilidade da peça">'+svgUse('i-pilar')+'estabilidade '+e+'%</span>');}};}
/* depois que uma peça quebra: piso que ficou instável demais desaba (e o que estava em cima cai junto) */
function conferirDesabamento(x,z){let caiu=0;for(let it=0;it<4;it++){const L=OB.filter(p=>p.tipo==='plataforma'&&d2(p.x,p.z,x,z)<20*20&&estPlat(p)<EST_CFG.desaba);if(!L.length)break;
  for(const p of L)if(OB.includes(p)){destruirObra(p);caiu++;}}
  if(caiu&&Math.hypot(P.x-x,P.z-z)<40)toast('perigo',caiu>1?caiu+' pisos desabaram: perderam o apoio.':'Um piso desabou: perdeu o apoio.');return caiu;}
{const _do=destruirObra;let dentro=false;destruirObra=function(o){const r=_do.apply(this,arguments);if(!dentro&&o&&(o.tipo==='pilar'||o.tipo==='plataforma')){dentro=true;try{conferirDesabamento(o.x,o.z);}finally{dentro=false;}}return r;};}
/* ---------- o que está em cima do piso que caiu também cai: paredes, porta, janela e pilar do andar de cima; e o telhado da casa
   cai se perder apoio demais (menos de 3/4 das plataformas embaixo dele) ---------- */
function sobrePlat(o,q){const Dq=OBRAS[q.tipo];if(!Dq||q.tipo==='plataforma'||Dq.alto||Dq.bau||Dq.peq)return false;
  if(Math.abs(q.y-o.y)>=0.35||q.y-ground(q.x,q.z)<0.35)return false;const k=modK(o);if(!noRet(q.x,q.z,o.x,o.z,o.yaw,1.5*k,1.5*k,0.15))return false;
  return!OB.some(p=>p!==o&&p.tipo==='plataforma'&&Math.abs(p.y-q.y)<0.35&&noRet(q.x,q.z,p.x,p.z,p.yaw,1.5*modK(p),1.5*modK(p),0.15));}
const tetoApoia=(q,p)=>p.tipo==='plataforma'&&Math.abs(q.y-(p.y+2.5*modKH(p)+0.02))<0.4&&noRet(p.x,p.z,q.x,q.z,q.yaw,(q.ext.hw||2)+0.1,(q.ext.hd||2)+0.1,0);
const tetoApoios=q=>OB.filter(p=>tetoApoia(q,p)).length;
{const _q=quedaEmCadeia;quedaEmCadeia=function(o){_q.apply(this,arguments);if(o.tipo!=='plataforma')return;const cair=[];
  for(const q of OB){const Dq=OBRAS[q.tipo];if(!Dq)continue;if(Dq.alto==='tetoCasa'){if(tetoApoia(q,o)&&tetoApoios(q)<0.75*(q.ext.n||1))cair.push(q);}else if(sobrePlat(o,q))cair.push(q);}
  for(const q of cair)if(OB.includes(q))destruirObra(q);};}

/* ---------- MOVER e DESMONTAR (modo de construção): mire numa peça sua. Z (ou o botão Mover) pega a peça: ela vira o fantasma,
   com a vida, o que tem dentro e o jeito dela (cadeado, persiana, modelo do telhado...); clique para pôr no lugar novo, sem gastar
   material. Z de novo, B ou Cancelar devolve ao lugar de antes. Y (ou Desmontar, duas vezes para confirmar) tira a peça e devolve
   parte do material: 30% a 60% conforme a vida dela, +15% com o kit de ferramentas na mochila; pregos, fibra e pano voltam menos.
   Peça que segura outra (pilar com piso em cima, piso com parede, baú, escada ou telhado em cima) não sai: tire antes o que está em cima. ---------- */
iconesNovos({'i-mover':'<path d="M12 3v18M3 12h18"/><path d="M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>'});
ACOES_TECLA.splice(ACOES_TECLA.findIndex(a=>a.id==='consertarTudo')+1,0,{id:'moverPeca',nome:'Mover peça (construindo)',pad:'KeyZ'},{id:'desmontarPeca',nome:'Desmontar peça (construindo)',pad:'KeyY'});
montarTraducao();
{const i=PAD_AJUDA.findIndex(a=>a[0]==='Construindo');if(i>=0)PAD_AJUDA[i][1]+=' · X move a peça mirada · LT desmonta';}
{const _rt=rotulosTeclas;rotulosTeclas=function(){_rt.apply(this,arguments);const k=id=>nomeTecla(teclaDe(id));
  for(const[sel,id]of[['#o-mover kbd','moverPeca'],['#o-desmontar kbd','desmontarPeca']]){const e=document.querySelector(sel);if(e)e.textContent=k(id);}OBRA.miraK='';};}
rotulosTeclas();
/* caixas da peça (colisores e pisos dela) para a mira achar o que você está olhando */
function raioCaixa(O,V0,cx,cz,yaw,hw,hd,y0,y1){const c=Math.cos(yaw),s=Math.sin(yaw),rx=O[0]-cx,rz=O[2]-cz;
  const p=[rx*c-rz*s,O[1],rx*s+rz*c],v=[V0[0]*c-V0[2]*s,V0[1],V0[0]*s+V0[2]*c],mn=[-hw,y0,-hd],mx=[hw,y1,hd];let t0=0,t1=1e9;
  for(let a=0;a<3;a++){if(Math.abs(v[a])<1e-9){if(p[a]<mn[a]||p[a]>mx[a])return-1;continue;}let ta=(mn[a]-p[a])/v[a],tb=(mx[a]-p[a])/v[a];if(ta>tb){const q=ta;ta=tb;tb=q;}
    if(ta>t0)t0=ta;if(tb<t1)t1=tb;if(t0>t1)return-1;}
  return t0;}
function caixasDaObra(o){const D=OBRAS[o.tipo],B=[],k=modK(o),kh=modKH(o),yt=o.y+Math.max(0.6,(D.hCol||2.2)*kh);
  for(const c of[o.col,...(o.cols||[])]){if(!c||!c.cells)continue;const y0=c.y0!==undefined?c.y0:o.y-0.3,y1=c.y1!==undefined?c.y1:yt;
    if(c.t===0)B.push([c.x,c.z,0,c.r,c.r,y0,y1]);else B.push([c.x,c.z,c.yaw!==undefined?c.yaw:Math.atan2(c.s,c.c),c.hw,c.hd,y0,y1]);}
  for(const s of[o.sup,...(o.sups||[])]){if(!s||!s.cells)continue;
    if(s.t==='ret')B.push([s.x,s.z,s.yaw,s.hw,s.hd,s.y-0.25,s.y+0.06]);
    else if(s.t==='ram')B.push([s.x,s.z,s.yaw,s.hw,s.hd,Math.min(s.ya,s.yb)-0.25,Math.max(s.ya,s.yb)+0.06]);
    else if(s.t==='seg'){const dx=s.bx-s.ax,dz=s.bz-s.az,L=Math.hypot(dx,dz)||1;B.push([(s.ax+s.bx)/2,(s.az+s.bz)/2,Math.atan2(dx,dz),s.r0*(s.larg||0.9),L/2,Math.min(s.ay,s.by)-0.5,Math.max(s.ay,s.by)+0.15]);}}
  if(!B.length)B.push([o.x,o.z,o.yaw,Math.max(0.25,(D.hw||0.4)*k),Math.max(0.25,(D.hd||0.4)*k),o.y-0.1,o.y+Math.max(0.5,(D.hCol||1)*kh)]);
  return B;}
function obraNaMira(){if(!P.alive||!cam||!cam.pos)return null;const O=cam.pos,V=cam.fwd,lim=Math.hypot(O[0]-P.x,O[1]-P.y,O[2]-P.z)+6.5;let best=null,bt=lim;
  for(const o of OB){if(!OBRAS[o.tipo]||d2(o.x,o.z,P.x,P.z)>16*16)continue;for(const b of caixasDaObra(o)){const t=raioCaixa(O,V,b[0],b[1],b[2],b[3],b[4],b[5],b[6]);if(t>=0&&t<bt){bt=t;best=o;}}}
  if(best){const hx=O[0]+V[0]*bt,hz=O[2]+V[2]*bt;if(Math.hypot(hx-P.x,hz-P.z)>6.5)return null;}
  return best;}
/* o que cairia se a peça saísse (mesma regra de quando ela quebra) */
function quemCai(o){const i=OB.indexOf(o);if(i<0)return[];const cair=new Set();OB.splice(i,1);estCache=null;
  try{if(o.tipo==='plataforma'){const k=modK(o);
      for(const q of OB){const Dq=OBRAS[q.tipo];if(!Dq||q.tipo==='plataforma')continue;
        if(q.tipo==='escadaMadeira'){if(!pontaApoiada(q.x-Math.sin(q.yaw)*0.3,q.z-Math.cos(q.yaw)*0.3,q.y))cair.add(q);continue;}
        if(q.tipo==='escadaInterna'){if(!platDaEscada(q))cair.add(q);continue;}
        if(q.tipo==='ponteCorda'){const e=q.ext;if(!pontaApoiada(e.ax,e.az,e.ay)||!pontaApoiada(e.bx,e.bz,e.by))cair.add(q);continue;}
        if(Dq.alto==='tetoCasa'){if(tetoApoia(q,o))cair.add(q);continue;}
        if((Dq.alto||Dq.bau||Dq.peq)&&Math.abs(q.y-o.y)<0.35&&noRet(q.x,q.z,o.x,o.z,o.yaw,1.5*k,1.5*k,0.15)&&!OB.some(p=>p.tipo==='plataforma'&&Math.abs(p.y-q.y)<0.35&&noRet(q.x,q.z,p.x,p.z,p.yaw,1.5*modK(p),1.5*modK(p),0.15)))cair.add(q);
        else if(sobrePlat(o,q))cair.add(q);}}
    if(o.tipo==='plataforma'||o.tipo==='pilar'){for(const p of revalidarPlats())cair.add(p);for(const p of OB)if(p.tipo==='plataforma'&&d2(p.x,p.z,o.x,o.z)<400&&estPlat(p)<EST_CFG.desaba)cair.add(p);}
    if(PAREDE_LAMP.has(o.tipo))for(const q of OB)if(q.tipo==='lampParede'&&d2(q.x,q.z,o.x,o.z)<9&&!lampHost(q))cair.add(q);}
  finally{OB.splice(i,0,o);estCache=null;revalidarPlats();}
  return[...cair];}
function pluralPt(t){const w=t.split(' '),p=w[0];w[0]=/ão$/.test(p)?p.replace(/ão$/,'ões'):/[rz]$/.test(p)?p+'es':/l$/.test(p)?p.replace(/l$/,'is'):/m$/.test(p)?p.replace(/m$/,'ns'):/s$/.test(p)?p:p+'s';return w.join(' ');}
function nomesPecas(L){const c={};for(const q of L){const n=OBRAS[q.tipo].nome.toLowerCase();c[n]=(c[n]||0)+1;}return listaE(Object.entries(c).map(([n,k])=>k>1?k+' '+pluralPt(n):n));}
function podeMexer(o,acao){const D=o&&OBRAS[o.tipo];if(!D||!OB.includes(o))return{ok:false,motivo:'Mire numa peça sua'};
  if(acao==='mover'&&/^tabuas/.test(o.tipo))return{ok:false,motivo:'Tábuas pregadas na porta ou na janela não mudam de lugar: desmonte (Y)'};
  if(acao==='mover'&&D.pomar)return{ok:false,motivo:'Árvore plantada não muda de lugar'};
  {const s=supEm(P.x,P.z,P.y,0.3);if(s&&s.dono===o)return{ok:false,motivo:'Você está em cima dela'};}
  if(P.escala&&o.via&&P.escala.v===o.via)return{ok:false,motivo:'Você está nessa escada'};
  const dep=quemCai(o);if(dep.length)return{ok:false,motivo:(dep.length>1?dep.length+' peças dependem':'Uma peça depende')+' dela ('+nomesPecas(dep)+'): '+(acao==='mover'?'mova':'desmonte')+' antes o que está em cima'};
  return{ok:true};}
/* tira a peça do mundo sem quebrar (sem poeira, sem aviso, sem derrubar nada) */
function tirarDoMundo(o){const i=OB.indexOf(o);if(i>=0)OB.splice(i,1);colRemove(o.col);o.col=null;desmontarAlto(o);desmontarBase(o);
  for(let j=FIRES.length-1;j>=0;j--){const f=FIRES[j];if(f.obra===o||f.poste===o||f.bio===o)FIRES.splice(j,1);}
  if(o.tipo==='escadaInterna'){const p=platDaEscada(o);if(p)remontarPlat(p);}
  aguaSujo=true;estCache=null;}
/* põe a mesma peça (o mesmo objeto: quem aponta para ela continua apontando) num lugar novo */
const LUGAR_EXT=new Set(['a','b','inc','solto','apoio','nivel','ax','ay','az','bx','by','bz','h','L','fg','lado','top','m','px','py','pz','d','k','porta','janela','lc','wA','wB','tA','tB','hw','hd','n','ni','nj']);
function extMovida(velho,novo){const e=Object.assign({},novo||{});for(const k in velho||{})if(!LUGAR_EXT.has(k))e[k]=velho[k];return e;}
function porNoMundo(o,x,z,y,yaw,ext){for(const k of['col','cols','sup','sups','via','mesh','intK','colTampa'])delete o[k];
  const n=criarObra(o.tipo,x,z,yaw,o.hp,o.aberto,y,ext),FICA={id:1,hp:1,hpMax:1,itens:1};
  for(const k of Object.keys(n))if(!FICA[k])o[k]=n[k];
  for(const L of[COLL,SUPS,VIAS,FIRES])for(const e of L){if(!e||typeof e!=='object')continue;for(const k in e)if(e[k]===n)e[k]=o;}
  const i=OB.indexOf(n);if(i>=0)OB[i]=o;else OB.push(o);estCache=null;aguaSujo=true;return o;}
/* pegar, pôr e devolver */
OBRA.mov=null;OBRA.mira=null;OBRA.desm=null;OBRA.miraK='';
function pegarPeca(o){const r=podeMexer(o,'mover');if(!r.ok){feed(r.motivo,true);sfx('vazio');return false;}
  OBRA.mov={o,tipo:o.tipo,x:o.x,z:o.z,y:o.y,yaw:o.yaw,ext:JSON.parse(JSON.stringify(o.ext||{})),rot0:OBRA.rot,tipo0:OBRA.tipo};
  tirarDoMundo(o);OBRA.tipo=o.tipo;OBRA.rot=o.yaw-P.yaw;OBRA.mira=null;OBRA.desm=null;motivoMostrado=null;hudObras();hudObraAlvo(true);
  feed('Movendo: '+OBRAS[o.tipo].nome.toLowerCase()+'. '+(cfg.tela==='pc'?'Clique para pôr no lugar novo; '+nomeTecla(teclaDe('moverPeca'))+' devolve.':'Toque em Construir para pôr; Devolver põe de volta.'));sfx('clique');
  dica('moverPeca','corpo','Movendo uma peça: ela vai com a vida e o que tem dentro, e não gasta material. Se desistir, ela volta para onde estava.');return true;}
function devolverPeca(msg){const M=OBRA.mov;if(!M)return;OBRA.mov=null;porNoMundo(M.o,M.x,M.z,M.y,M.yaw,M.ext);OBRA.tipo=M.tipo0||M.tipo;OBRA.rot=M.rot0||0;motivoMostrado=null;
  if(OBRA.ativo)hudObras();if(msg!==false)feed(OBRAS[M.tipo].nome+' voltou para o lugar');}
function porPecaMovida(){const M=OBRA.mov;obraAlvo();if(OBRA.tipo!==M.tipo){devolverPeca();return;}
  if(!OBRA.ok){feed(OBRA.motivo||'Não cabe aqui',true);sfx('vazio');return;}
  const custo=custoObra(OBRA.tipo);if(!invHas(custo)){feed('Faltam materiais para o telhado maior',true);sfx('vazio');return;}invPay(custo);
  const o=porNoMundo(M.o,OBRA.x,OBRA.z,OBRA.y??ground(OBRA.x,OBRA.z),OBRA.yaw,extMovida(M.ext,OBRA.ext));OBRA.mov=null;OBRA.tipo=M.tipo0&&OBRAS[M.tipo0]?M.tipo0:M.tipo;OBRA.rot=M.rot0||0;
  sfx('construir');poeira(o.x,o.y+0.3,o.z,5);feed(OBRAS[o.tipo].nome+' no lugar novo');motivoMostrado=null;hudObras();hudBarra();}
/* desmontar: devolve parte do material */
function qtdNome(k,n){let t=ITEMS[k].nome.toLowerCase();if(n===1){const w=t.split(' ');if(/ões$/.test(w[0]))w[0]=w[0].replace(/ões$/,'ão');else if(/[^s]s$/.test(w[0])&&!/(á|é|ê|í|ó|ú|i|u)s$/.test(w[0])&&w[0].length>3)w[0]=w[0].slice(0,-1);t=w.join(' ');}return n+' '+t;}
const qtdLista=c=>listaE(Object.entries(c).map(([k,n])=>qtdNome(k,n)));
const VOLTA_MENOS=new Set(['pregos','fibra','pano','graveto','linha','cola','fita','sementes']);
function devolucaoObra(o){const D=OBRAS[o.tipo],e=o.ext||{};let base=Object.assign({},D.custo||{});
  if(o.tipo==='portaMadeira'&&e.reforco&&OBRAS.portaReforcada)base=Object.assign({},OBRAS.portaReforcada.custo);
  if(D.alto==='tetoCasa'){const n=e.n||1;for(const q in base)base[q]*=n;}
  const vida=clamp(o.hp/(o.hpMax||1),0,1),kit=typeof kitNaMochila==='function'&&kitNaMochila(),f=0.3+0.3*vida+(kit?0.15:0),out={};let tot=0;
  for(const[q,n]of Object.entries(base)){if(!ITEMS[q])continue;const v=Math.floor(n*(VOLTA_MENOS.has(q)?f*0.5:f)+0.5);if(v>0){out[q]=v;tot+=v;}}
  if(!tot){const m=Object.entries(base).filter(([q])=>ITEMS[q]).sort((a,b)=>b[1]-a[1])[0];if(m)out[m[0]]=1;}
  if(e.cad)out.sucata=(out.sucata||0)+1;
  if(e.tab&&typeof TAB_JAN!=='undefined'&&TAB_JAN[e.tab])out.tabuas=(out.tabuas||0)+Math.floor(TAB_JAN[e.tab].custo.tabuas/2);
  return out;}
function guardadoNaObra(o){const e=o.ext||{},L=[];if(o.tipo==='composteira'&&e.pronto)L.push(['adubo',e.pronto]);if(o.tipo==='galinheiro'&&e.ovos)L.push(['ovo',e.ovos]);
  if(o.tipo==='colmeia'){if(e.mel)L.push(['mel',e.mel]);if(e.cera)L.push(['cera',e.cera]);}return L.filter(([k])=>ITEMS[k]);}
function desmontarPeca(o){const r=podeMexer(o,'desmontar');if(!r.ok){feed(r.motivo,true);sfx('vazio');return false;}
  const D=OBRAS[o.tipo],volta=devolucaoObra(o),y=o.y;tirarDoMundo(o);quedaEmCadeia(o);
  const chao=[];for(const[k,n]of Object.entries(volta)){const l=invAdd(k,n);if(l>0)chao.push([k,l]);}
  for(const[k,n]of guardadoNaObra(o)){const l=invAdd(k,n);if(l>0)chao.push([k,l]);}
  const guard=o.itens?o.itens.filter(Boolean):[];if(guard.length)soltarItens(guard.map(s=>[s.id,s.n,(s.dur!==undefined||s.mun!==undefined)?{dur:s.dur,mun:s.mun}:null]),o.x,o.z,y);
  if(chao.length)soltarItens(chao,o.x,o.z,y);
  poeira(o.x,y+0.5,o.z,8);sfx('madeira',o.x,o.z,0.8);OBRA.mira=null;OBRA.desm=null;
  feed('Desmontou '+D.nome.toLowerCase()+': voltou '+qtdLista(volta)+(chao.length?' (parte ficou no chão: mochila cheia)':'')+(guard.length?'. O que estava dentro ficou no chão':''));
  hudObras();hudBarra();return true;}
/* teclas e botões */
function moverAcao(){if(!OBRA.ativo)return;if(OBRA.mov){devolverPeca();sfx('clique');return;}const o=OBRA.mira;
  if(!o){feed('Mire numa peça sua para mover',true);sfx('vazio');return;}pegarPeca(o);}
function desmontarAcao(){if(!OBRA.ativo)return;if(OBRA.mov){feed('Ponha a peça no lugar antes (ou devolva)',true);sfx('vazio');return;}const o=OBRA.mira;
  if(!o){feed('Mire numa peça sua para desmontar',true);sfx('vazio');return;}
  if(OBRA.desm&&OBRA.desm.o===o&&G.t<OBRA.desm.ate){desmontarPeca(o);return;}
  const r=podeMexer(o,'desmontar');if(!r.ok){feed(r.motivo,true);sfx('vazio');OBRA.desm=null;return;}
  OBRA.desm={o,ate:G.t+4};OBRA.miraK='';sfx('clique');}
window.addEventListener('keydown',e=>{if(G.modo!=='jogo'||!OBRA.ativo||e.repeat||(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName||'')))return;
  if(e.code==='KeyZ'){e.preventDefault();moverAcao();}else if(e.code==='KeyY'){e.preventDefault();desmontarAcao();}});
{const bm=$('o-mover'),bd=$('o-desmontar');if(bm)bm.addEventListener('click',()=>moverAcao());if(bd)bd.addEventListener('click',()=>desmontarAcao());}
{const _lc=lerControle;lerControle=function(dt){if(GP.ativo&&G.modo==='jogo'&&OBRA.ativo){const gp=padAtual();if(gp){const A=GP.ant,b=i=>!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>0.5));
    if(b(2)&&!A[2])moverAcao();if(b(6)&&!A[6])desmontarAcao();}}return _lc.apply(this,arguments);};}
/* enquanto move: só a peça movida aparece no menu, sem custo; o rótulo diz o que fazer */
{const _oo=obrasOrdem;obrasOrdem=function(){if(OBRA.mov&&OBRA.ativo)return[OBRA.mov.tipo];return _oo.apply(this,arguments);};}
{const _cu=custoObra;custoObra=function(k){const c=_cu.apply(this,arguments),M=OBRA.mov;if(!M||!OBRA.ativo||k!==M.tipo)return c;
  if(OBRAS[k]&&OBRAS[k].alto==='tetoCasa'){const n0=M.ext.n||1,n=(OBRA.ext&&OBRA.ext.n)||n0,b=OBRAS[k].custo,o={};if(n>n0)for(const q in b)o[q]=b[q]*(n-n0);return o;}return{};};}
{const _on=obraNomeHTML;obraNomeHTML=function(k){const M=OBRA.mov;if(!M||!OBRA.ativo||k!==M.tipo)return _on.apply(this,arguments);const c=custoObra(k);
  return'<b>Movendo: '+OBRAS[k].nome.toLowerCase()+'</b><span class="cc vida" title="Vida da peça">'+svgUse('i-escudo')+Math.round(M.o.hp)+'</span>'+(Object.keys(c).length?'<span class="cc">'+svgUse('i-telhado-casa')+'telhado maior: +'+custoTxt(c)+'</span>':'')+
    '<span class="cc">'+svgUse('i-mover')+(cfg.tela==='pc'?'clique põe · '+nomeTecla(teclaDe('moverPeca'))+' devolve':'Construir põe · Devolver volta ao lugar')+'</span>';};}
{const _co=colocarObra;colocarObra=function(){if(OBRA.ativo&&OBRA.mov)return porPecaMovida();return _co.apply(this,arguments);};}
{const _mo=modoObra;modoObra=function(on){const ia=on===undefined?!OBRA.ativo:on;if(!ia&&OBRA.mov)devolverPeca();if(!ia){OBRA.mira=null;OBRA.desm=null;}const r=_mo.apply(this,arguments);hudObraAlvo(true);return r;};}
{const _oa=obraAlvo;obraAlvo=function(){if(OBRA.mov){OBRA.tipo=OBRA.mov.tipo;OBRA.ctx=contextoObra();}_oa.apply(this,arguments);
  OBRA.mira=OBRA.mov?null:obraNaMira();if(OBRA.desm&&(OBRA.desm.o!==OBRA.mira||G.t>OBRA.desm.ate))OBRA.desm=null;hudObraAlvo();};}
function hudObraAlvo(forcar){const el=$('obra-alvo'),bm=$('o-mover'),bd=$('o-desmontar');if(!el)return;const o=OBRA.ativo?OBRA.mira:null,M=OBRA.ativo?OBRA.mov:null,ds=OBRA.desm&&OBRA.desm.o===o?OBRA.desm:null;
  const k=(o?o.id+':'+Math.round(o.hp/(o.hpMax||1)*20):'-')+'|'+(M?1:0)+'|'+(ds?1:0)+'|'+cfg.tela;if(k===OBRA.miraK&&!forcar)return;OBRA.miraK=k;
  if(bm){bm.hidden=!(o||M);const t=$('o-mover-t');if(t)t.textContent=M?'Devolver':'Mover';}
  if(bd){bd.hidden=!o||!!M;bd.classList.toggle('perigo',!!ds);const t=$('o-desmontar-t');if(t)t.textContent=ds?'Confirmar':'Desmontar';}
  if(!o){el.classList.add('escondido');return;}
  const D=OBRAS[o.tipo],v=Math.round(o.hp/(o.hpMax||1)*100),es=estabilidade(o),pc=cfg.tela==='pc',kz=nomeTecla(teclaDe('moverPeca')),ky=nomeTecla(teclaDe('desmontarPeca'));
  let h;if(ds)h='<b>Desmontar '+D.nome.toLowerCase()+'?</b><small>volta '+qtdLista(devolucaoObra(o))+'</small>'+(pc?'<kbd>'+ky+'</kbd><small>confirma</small>':'');
  else h='<b>'+D.nome+'</b><small>vida '+v+'%'+(es!==null&&es!==undefined?' · estabilidade '+Math.round(es*100)+'%':'')+'</small>'+(pc?'<kbd>'+kz+'</kbd><small>mover</small><kbd>'+ky+'</kbd><small>desmontar</small>':'');
  el.innerHTML=h;el.classList.toggle('perigo',!!ds);el.classList.remove('escondido');}
HUDS.push(function hudMoverPeca(){if(OBRA.mov&&(!P.alive||!OBRA.ativo))devolverPeca(false);if(!OBRA.ativo&&OBRA.miraK!=='off'){OBRA.mira=null;OBRA.miraK='off';const el=$('obra-alvo');if(el)el.classList.add('escondido');}});
/* salvar no meio de uma mudança: a peça vai no save no lugar de antes; carregar outro jogo esquece a mudança */
{const _sj=salvarJogo;salvarJogo=function(){const M=OBRA.mov;if(!M)return _sj.apply(this,arguments);const o=M.o,b={x:o.x,z:o.z,y:o.y,yaw:o.yaw,ext:o.ext};Object.assign(o,{x:M.x,z:M.z,y:M.y,yaw:M.yaw,ext:M.ext});OB.push(o);
  try{return _sj.apply(this,arguments);}finally{const i=OB.indexOf(o);if(i>=0)OB.splice(i,1);Object.assign(o,b);}};}
{const _rm=resetMundo;resetMundo=function(){OBRA.mov=null;OBRA.mira=null;OBRA.desm=null;return _rm.apply(this,arguments);};}
/* ---------- ESCADA CARACOL (aba Casa): na casa de 4 m, num canto de dentro, embaixo do piso de cima (mire o canto). Sobe girando
   em volta de um poste, uns 40° (a reta da casa de 4 m tem 50°), com corrimão por fora. O piso de cima ganha uma abertura
   quadrada com guarda-corpo e uma passagem do lado de dentro da casa. É a mesma peça da escada interna (modelo 'caracol'):
   segure E no pé ou no alto de qualquer escada interna para trocar o modelo (reta ou caracol) ou inverter o sentido, de graça. ---------- */
iconesNovos({'i-escada-caracol':'<circle cx="12" cy="12" r="1.6"/><path d="M12 3.5a8.5 8.5 0 1 1-8 5.6"/><path d="M12 6.5V3.5M16.8 8.3l2-2M17.5 12h3M16.8 15.7l2 2M12 17.5v3M7.2 15.7l-2 2"/>'});
const CAR={R:1.1,rin:0.13,rout:1.06,trilho:1.09,ang:6.02,pat:0.785,n:16,N:28,abre:0.45};
OBRAS.escadaCaracol={nome:'Escada caracol',icon:'i-escada-caracol',custo:{tabuas:12,pregos:8,madeira:2},hp:240,hw:1.0,hd:1.0,solid:true,etapa:2,alvo:alvoEscadaCaracol,
  desc:'Escada que sobe girando em volta de um poste, num canto da casa de 4 m: mais confortável que a reta. Abre o piso de cima sozinha.'};
OBRA_ORDEM.push('escadaCaracol');{const i=OBRAS_CHAO.indexOf('escadaInterna');OBRAS_CHAO.splice(i>=0?i+1:OBRAS_CHAO.length,0,'escadaCaracol');}
{const cs=OBRA_CATS.find(c=>c.id==='casa');if(cs&&!cs.t.includes('escadaCaracol')){const i=cs.t.indexOf('escadaInterna');cs.t.splice(i>=0?i+1:cs.t.length,0,'escadaCaracol');}}
BASE_DICAS.escadaCaracol='Escada caracol pronta: suba girando em volta do poste; lá em cima a passagem fica do lado de dentro da casa. Segure E no pé dela para trocar o modelo.';
{const _cr=criarObra;criarObra=function(tipo,x,z,yaw,hp,aberto,y,ext){if(tipo==='escadaCaracol'){tipo='escadaInterna';ext=Object.assign({},ext||{},{mod:'caracol'});}return _cr.call(this,tipo,x,z,yaw,hp,aberto,y,ext);};}
{const _bc=baseColocada;baseColocada=function(o){if(o&&o.tipo==='escadaInterna'&&o.ext&&o.ext.mod==='caracol'){dica('obra_escadaCaracol','corpo',BASE_DICAS.escadaCaracol);return;}return _bc.apply(this,arguments);};}
{const _oe=obraEsc;obraEsc=function(o){if(o&&o.ext&&o.ext.mod==='caracol')return null;return _oe.apply(this,arguments);};}
/* ângulos: a subida começa em f0 e gira 300° (sentido s); depois vem o patamar de 45°, centrado no lado de dentro da casa (-cu) */
function carAng(e){const su=e.cu||1,s=e.s||1,fL=su>0?Math.PI:0,fEnd=fL+s*CAR.pat/2,f0=fEnd-s*CAR.ang;return{s,fL,fEnd,f0,sub:CAR.ang-CAR.pat};}
function caracolEm(p,su,sv,s){const kp=modK(p),H=1.5*kp,co=H-0.2-CAR.R,c=localW(p,su*co,sv*co),fg=ground(c[0],c[1]),h=p.y-fg;
  const r={x:c[0],z:c[1],y:p.y,yaw:p.yaw,ext:{mod:'caracol',px:+p.x.toFixed(2),pz:+p.z.toFixed(2),py:+p.y.toFixed(2),cu:su,cv:sv,s,h:+h.toFixed(2),m:4}},no=m=>Object.assign(r,{ok:false,motivo:m});
  if(kp<1.01)return no('A escada caracol só cabe na casa de 4 m (use a escada interna reta)');
  if(h<2.2)return no('Baixo demais para escada');if(h>3.4)return no('Alto demais para a escada caracol');
  if(OB.some(q=>q.tipo==='escadaInterna'&&platDaEscada(q)===p))return no('Essa casa já tem escada interna');
  for(const q of OB){if(q.tipo!=='portaMadeira'&&q.tipo!=='portao'&&q.tipo!=='portaoFerro'&&q.tipo!=='portaoGrande')continue;if(Math.abs(q.y-fg)>1)continue;const l=paraLocal(p,q.x,q.z);
    if((Math.abs(l[0]-su*H)<0.45&&Math.abs(l[1]-sv*co)<CAR.R+0.5)||(Math.abs(l[1]-sv*H)<0.45&&Math.abs(l[0]-su*co)<CAR.R+0.5))return no('A porta está nesse canto: mire outro canto');}
  for(const q of OB){const Dq=OBRAS[q.tipo];if(q===p||!Dq||!(Dq.bau||Dq.peq||q.tipo==='lamparina'||q.tipo==='armarioFerro'))continue;if(Math.abs(q.y-p.y)>0.4)continue;const l=paraLocal(p,q.x,q.z);
    if(Math.abs(l[0]-su*co)<CAR.R+0.3&&Math.abs(l[1]-sv*co)<CAR.R+0.3)return no('Tire o que está em cima, no lugar da abertura');}
  {const l=paraLocal(p,P.x,P.z);if(Math.hypot(l[0]-su*co,l[1]-sv*co)<CAR.trilho+0.32)return no('Saia da frente: a escada vai onde você está');}
  const ign=q=>q.obra&&(q.obra.tipo==='plataforma'||q.obra.tipo==='pilar');
  for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){const w=localW(p,su*co+i*0.46,sv*co+j*0.46),gy=ground(w[0],w[1]);
    if(gy>fg+0.35)return no('O chão sobe no lugar da escada');if(bloqueadoChao(w[0],w[1],0.08,gy,ign))return no('Tem coisa no caminho da escada');}
  r.ok=true;return r;}
function platDaCasa(){const gP=ground(P.x,P.z);for(const o of OB){if(o.tipo!=='plataforma')continue;const hh=o.y-gP;if(hh<1.4||hh>3.4*modKH(o))continue;if(noRet(P.x,P.z,o.x,o.z,o.yaw,1.5*modK(o),1.5*modK(o),0))return o;}return null;}
function alvoEscadaCaracol(x,z,yaw){const p=platDaCasa();if(!p)return{x,z,y:ground(x,z),yaw,ok:false,motivo:'Entre na casa: a escada caracol vai num canto, embaixo do piso de cima'};
  const l=paraLocal(p,x,z),s=(Math.round(OBRA.rot/(Math.PI/4))&1)?-1:1;return caracolEm(p,l[0]>=0?1:-1,l[1]>=0?1:-1,s);}
OBRAS.escadaCaracol.alvo=alvoEscadaCaracol;
/* malha: no sistema da escada (centro do giro, altura do piso de cima, eixos da plataforma) */
function geoEscadaCaracol(e){const g=new GB(8192,8),R=rng(Math.round((e.h||3)*100)+91),C=k=>lin(COR_CASA[k]),h=e.h||3,A=carAng(e),s=A.s,n=CAR.n,ri=CAR.rin,ro=CAR.rout,rm=(ri+ro)/2,
    Pf=(f,r)=>[r*Math.cos(f),r*Math.sin(f)],seg=(a,b,t,c)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz)||1e-3;add(g,boxTris(t,t,L),mat((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,-Math.asin(dy/L),Math.atan2(dx,dz),0),c);};
  add(g,boxTris(0.18,h+1.0,0.18),mat(0,(1.0-h)/2,0),C('esc'),{j:0.05,rnd:R});add(g,boxTris(0.24,0.08,0.24),mat(0,1.02,0),C('mad'));add(g,boxTris(0.32,0.1,0.32),mat(0,-h+0.05,0),C('pedra'));
  const dF=A.sub/n;
  for(let i=0;i<n;i++){const fc=A.f0+s*dF*(i+0.5),y=-h+h*(i+1)/n,cor=mixc(C('mad'),C('mad2'),R());
    for(const[r0,r1]of[[ri,rm],[rm,ro]]){const p=Pf(fc,(r0+r1)/2);add(g,boxTris(r1-r0+0.02,0.06,r1*dF*1.08),mat(p[0],y-0.03,p[1],0,-fc,0),cor,{j:0.08,rnd:R});}
    const p=Pf(fc,rm);add(g,boxTris(ro-ri,0.14,0.05),mat(p[0],y-0.13,p[1],0,-fc,0),C('esc'));}
  for(let i=0;i<3;i++){const fc=A.fEnd-s*CAR.pat*(i+0.5)/3,p=Pf(fc,rm);add(g,boxTris(ro-ri+0.02,0.07,ro*CAR.pat/3*1.08),mat(p[0],-0.035,p[1],0,-fc,0),mixc(C('mad'),C('mad2'),R()),{j:0.08,rnd:R});}
  const pts=[];for(let i=2;i<=n;i+=2){const f=A.f0+s*dF*i,p=Pf(f,ro+0.02),y=-h+h*i/n;add(g,boxTris(0.05,0.9,0.05),mat(p[0],y+0.45,p[1]),C('esc2'));pts.push([p[0],y+0.9,p[1]]);}
  for(let i=1;i<pts.length;i++)seg(pts[i-1],pts[i],0.055,C('mad'));
  const Q=CAR.R-0.04,su=e.cu||1,sv=e.cv||1,ab=CAR.abre,lado=(a,b)=>{seg([a[0],0.95,a[1]],[b[0],0.95,b[1]],0.06,C('mad'));seg([a[0],0.5,a[1]],[b[0],0.5,b[1]],0.05,C('mad2'));for(const q of[a,b])add(g,boxTris(0.06,1.0,0.06),mat(q[0],0.5,q[1]),C('esc2'));};
  lado([su*Q,-Q],[su*Q,Q]);lado([-Q,sv*Q],[Q,sv*Q]);lado([-Q,-sv*Q],[Q,-sv*Q]);lado([-su*Q,-Q],[-su*Q,-ab]);lado([-su*Q,ab],[-su*Q,Q]);
  return g.data();}
/* montagem: rampas curtas seguindo o giro (pisáveis), patamar, poste, corrimão por fora (fecha embaixo também, menos a entrada),
   trava no fim do patamar e guarda-corpo na beira da abertura de cima */
function caracolMontar(o){const e=o.ext,h=e.h,A=carAng(e),s=A.s,fg=o.y-h,N=CAR.N,ri=CAR.rin,ro=CAR.rout,rc=(ri+ro)/2,W=(lx,lz)=>localW(o,lx,lz),
    yawT=f=>{const tx=-Math.sin(f)*s,tz=Math.cos(f)*s,c=Math.cos(o.yaw),sn=Math.sin(o.yaw);return Math.atan2(tx*c+tz*sn,-tx*sn+tz*c);};
  o.sups=[];const dF=A.sub/N,hd=ro*dF/2+0.03,inc=(h/N)/(0.6*dF);
  for(let j=0;j<N;j++){const fm=A.f0+s*dF*(j+0.5),ym=fg+h*(j+0.5)/N,p=W(rc*Math.cos(fm),rc*Math.sin(fm));o.sups.push(supAdd({t:'ram',x:p[0],z:p[1],hw:(ro-ri)/2,hd,yaw:yawT(fm),ya:ym-inc*hd,yb:ym+inc*hd,dono:o}));}
  for(let i=0;i<3;i++){const fm=A.fEnd-s*CAR.pat*(i+0.5)/3,p=W(rc*Math.cos(fm),rc*Math.sin(fm));o.sups.push(supAdd({t:'ret',x:p[0],z:p[1],hw:(ro-ri)/2,hd:ro*CAR.pat/6+0.03,yaw:yawT(fm),y:o.y,dono:o}));}
  o.cols=[];{const c0=W(0,0);o.cols.push(colCircle(c0[0],c0[1],0.11,{solid:true,obra:o,y0:fg-0.3,y1:o.y+1.0}));}
  const rt=CAR.trilho,arco=(fa,fb,y0,y1)=>{const fm=(fa+fb)/2,p=W(rt*Math.cos(fm),rt*Math.sin(fm)),L=rt*Math.abs(Math.sin((fb-fa)/2))+0.05;o.cols.push(colBox(p[0],p[1],0.04,L,yawT(fm),{solid:true,obra:o,y0,y1}));};
  const t0=0.12,nS=10;for(let i=0;i<nS;i++){const ta=t0+(1-t0)*i/nS,tb=t0+(1-t0)*(i+1)/nS;arco(A.f0+s*A.sub*ta,A.f0+s*A.sub*tb,fg-0.3,fg+h*tb+1.0);}
  for(let i=0;i<3;i++)arco(A.fEnd-s*CAR.pat*i/3,A.fEnd-s*CAR.pat*(i+1)/3,fg-0.3,o.y-0.35);
  arco(A.fEnd,A.fEnd+s*(2*Math.PI-CAR.ang),fg-0.3,o.y-0.35);
  {const f=A.fEnd+s*0.06,r2_=(ri+CAR.R)/2,p=W(r2_*Math.cos(f),r2_*Math.sin(f));o.cols.push(colBox(p[0],p[1],(CAR.R-ri)/2,0.04,yawT(f),{solid:true,obra:o,y0:o.y-0.3,y1:o.y+1.0}));}
  const Q=CAR.R-0.04,su=e.cu||1,sv=e.cv||1,ab=CAR.abre,reta=(ax,az,bx,bz)=>{const a=W(ax,az),b=W(bx,bz),dx=b[0]-a[0],dz=b[1]-a[1];o.cols.push(colBox((a[0]+b[0])/2,(a[1]+b[1])/2,0.04,Math.hypot(dx,dz)/2,Math.atan2(dx,dz),{solid:true,obra:o,y0:o.y,y1:o.y+1.0}));};
  reta(su*Q,-Q,su*Q,Q);reta(-Q,sv*Q,Q,sv*Q);reta(-Q,-sv*Q,Q,-sv*Q);reta(-su*Q,-Q,-su*Q,-ab);reta(-su*Q,ab,-su*Q,Q);
  o.mesh=litMesh(geoEscadaCaracol(e));}
{const _em=escadaIntMontar;escadaIntMontar=function(o){if(o.ext&&o.ext.mod==='caracol')return caracolMontar(o);return _em.apply(this,arguments);};OBRAS.escadaInterna.montar=escadaIntMontar;}
{const _ge=geoEscadaInt;geoEscadaInt=function(e){if(e&&e.mod==='caracol')return geoEscadaCaracol(e);return _ge.apply(this,arguments);};}
/* abertura no piso de cima: o quadrado da caracol (no sistema da plataforma, sem a escala do módulo) */
{const _fe=furoDaEscada;furoDaEscada=function(p,e){if(!e||e.mod!=='caracol')return _fe.apply(this,arguments);const kp=modK(p),co=1.5*kp-0.2-CAR.R,cu=(e.cu||1)*co,cv=(e.cv||1)*co,R=CAR.R;
  return[(cu-R)/kp,(cu+R)/kp,(cv-R)/kp,(cv+R)/kp];};}
{const _fa=fantasmaAlto;fantasmaAlto=function(){if(OBRA.tipo==='escadaCaracol'&&OBRA.ext&&OBRA.ext.h){const e=OBRA.ext,k='c'+e.h.toFixed(2)+'_'+e.cu+e.cv+e.s;
  if(k!==fantasmaK){if(fantasmaM)liberarMesh(fantasmaM);fantasmaM=meshAlto(geoEscadaCaracol(e));fantasmaK=k;}return fantasmaM;}return _fa.apply(this,arguments);};}
INIT_MALHAS.push(function malhasEtapa16(){MESH.obra.escadaCaracol=litMesh(geoEscadaCaracol({h:3,cu:1,cv:1,s:1}));
  for(const k in OBRAS)if(!MESH.obra[k]){const g=new GB(256,8);add(g,boxTris(0.6,0.6,0.6),mat(0,0.3,0),lin(0x8a7650));MESH.obra[k]=litMesh(g.data());}});
/* ---------- editar a escada interna: trocar o modelo (reta ou caracol) e inverter o sentido, sem gastar material ---------- */
function retaEm(p,k,d){const kk=modK(p),F={x:p.x,z:p.z,yaw:p.yaw+k*Math.PI/2},w=localW(F,-0.2*kk,-d*0.9*kk),sv={x:P.x,z:P.z,y:P.y,yaw:P.yaw,rot:OBRA.rot};
  P.x=w[0];P.z=w[1];P.y=ground(w[0],w[1]);P.yaw=p.yaw+k*Math.PI/2+Math.PI/2;OBRA.rot=0;let r;try{r=alvoEscadaInterna(0,0,0);}finally{P.x=sv.x;P.z=sv.z;P.y=sv.y;P.yaw=sv.yaw;OBRA.rot=sv.rot;}return r;}
function escadaPisa(o){for(const c of o.cols||[]){if(!c||!c.cells)continue;if(c.y1!==undefined&&(P.y>=c.y1-0.05||P.y+1.7<=c.y0))continue;
  if(c.t===0){if(Math.hypot(P.x-c.x,P.z-c.z)<c.r+0.3)return true;continue;}if(noRet(P.x,P.z,c.x,c.z,c.yaw,c.hw,c.hd,0.3))return true;}
  for(const s of o.sups||[]){const a=alturaSup(s,P.x,P.z);if(a!==null&&a>P.y+0.6&&a<P.y+1.9)return true;}return false;}
function escadaTrocar(o,mod,inv){const p=platDaEscada(o);if(!p)return'Sem o piso de cima';const e0=Object.assign({},o.ext),velho=[o.x,o.z,o.y,o.yaw],car=e0.mod==='caracol',kk=modK(p);
  const cand=[];
  if(mod==='caracol'){let su,sv,s=e0.s||1;if(car){su=e0.cu;sv=e0.cv;}else{const l=paraLocal(p,o.x,o.z);su=l[0]>=0?1:-1;sv=l[1]>=0?1:-1;}
    if(inv&&car)cand.push([su,sv,-s]);else for(const[a,b]of[[su,sv],[su,-sv],[-su,sv],[-su,-sv]])for(const q of[s,-s])cand.push([a,b,q]);}
  else{if(!car){const k=e0.k||0,d=e0.d||1;if(inv)cand.push([k,-d]);else cand.push([k,d]);}
    else{const ks=[e0.cu>0?0:2,e0.cv>0?3:1];for(const k of[...ks,...[0,1,2,3].filter(q=>!ks.includes(q))])for(const d of[1,-1])cand.push([k,d]);}}
  tirarDoMundo(o);let r=null;
  for(const c of cand){r=mod==='caracol'?caracolEm(p,c[0],c[1],c[2]):retaEm(p,c[0],c[1]);if(r&&r.ok)break;}
  if(!r||!r.ok){porNoMundo(o,velho[0],velho[1],velho[2],velho[3],e0);return(r&&r.motivo)||'Não cabe aqui';}
  porNoMundo(o,r.x,r.z,r.y,r.yaw,r.ext);
  if(escadaPisa(o)){tirarDoMundo(o);porNoMundo(o,velho[0],velho[1],velho[2],velho[3],e0);return'Saia da frente: a escada nova vai onde você está';}
  sfx('construir');poeira(o.x,o.y-1,o.z,6);return mod==='caracol'?(inv?'Agora a caracol gira para o outro lado':'Escada trocada para caracol'):(inv?'O pé da escada foi para o outro lado':'Escada trocada para reta');}
function escadaPontos(o){const e=o.ext||{},h=e.h||2.6,fg=o.y-h;
  if(e.mod==='caracol'){const A=carAng(e),f=A.f0+A.s*0.25,a=localW(o,Math.cos(A.fL)*0.2,Math.sin(A.fL)*0.2),b=localW(o,0.62*Math.cos(f),0.62*Math.sin(f));return[[b[0],b[1],fg],[a[0],a[1],o.y]];}
  const m=escadaIntMedidas(h,eiL(e)),kk=modK(o),pe=localW(o,0,(m.L+0.3)*kk),to=localW(o,0,0.25*kk);return[[pe[0],pe[1],fg],[to[0],to[1],o.y]];}
INTERS.push(function escadaEditInter(tryIt){if(!P.alive||CARRO.ativo)return;for(const o of OB){if(o.tipo!=='escadaInterna'||o.hp<=0||Math.abs(o.x-P.x)>6||Math.abs(o.z-P.z)>6)continue;
  for(const q of escadaPontos(o))tryIt({k:'escadaEdit',o},q[0],q[1],1.5,0.2,-0.6,q[2]);}});
INTER_K.escadaEdit={texto:o=>({t:o.ext&&o.ext.mod==='caracol'?'Escada caracol':o.ext&&o.ext.mod==='alcapao'?'Alçapão com escada':'Escada interna',s:'segure: trocar o modelo',hold:true,dur:0.6}),
  usar:(o,seg)=>{if(!seg)return;o.estTipo='escadaInt';o.nome=o.ext&&o.ext.mod==='caracol'?'Escada caracol':o.ext&&o.ext.mod==='alcapao'?'Alçapão com escada':'Escada interna';abrirEstacao(o);}};
ESTACOES.escadaInt={nome:'Escada interna',icon:'i-escada-int',ir:'',chip:'Escada'};
ESTACAO_UI.escadaInt={resumo:o=>o.ext&&o.ext.mod==='caracol'?'Caracol':'Reta',
  render(o){const e=o.ext||{},car=e.mod==='caracol',k4=modK(o)>1.01;
    return{sub:'Sobe '+(e.h||2.6).toFixed(1).replace('.',',')+' m · modelo '+(car?'caracol':'reto'),
      corpo:'<p class="es-info">'+(car?'Gira em volta do poste num canto da casa (uns 40°). ':'Encostada numa parede, sobe em linha reta (uns '+(k4?50:56)+'°). ')+'Trocar o modelo ou o sentido não gasta material: a escada é refeita no mesmo andar, e a abertura no piso de cima muda junto.</p>',
      acoes:[{id:'m_reta',t:'Reta',s:car?'encostada numa parede':'atual',ok:car,prim:false},{id:'m_caracol',t:'Caracol',s:!k4?'só na casa de 4 m':car?'atual':'num canto, em volta de um poste',ok:!car&&k4,prim:false},
        {id:'inv',t:'Inverter o sentido',s:car?'gira para o outro lado':'o pé vai para o outro lado',ok:true}]};},
  acao(o,id){const car=o.ext&&o.ext.mod==='caracol';if(id==='m_reta')return escadaTrocar(o,'reta',false);if(id==='m_caracol')return escadaTrocar(o,'caracol',false);if(id==='inv')return escadaTrocar(o,car?'caracol':'reta',true);return'';}};
