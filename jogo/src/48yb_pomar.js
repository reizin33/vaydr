/* ================= pomar: árvores de fruta =================
   As árvores de fruta das casas da vila e dos sítios (laranja, manga e acerola) dão fruta: segure E perto do tronco para colher.
   Depois de colher, a fruta volta em uns 2 dias de jogo.
   Plantar: no menu de construção (B) tem macieira, laranjeira, mangueira e aceroleira; cada uma gasta 1 fruta da mesma
   (a maçã aparece no mercado, nas casas e no celeiro). A muda vira árvore em uns 3 dias de jogo e depois dá fruta a cada
   2 dias, sem replantar. Tudo fica no save (as plantadas junto com as outras construções). */
Object.assign(ITEMS,{
  maca:{nome:'Maçã',icon:'i-maca',max:20,tipo:'comida',fome:8,sede:4,desc:'Plante uma no acampamento (menu de construção) para nascer uma macieira.'},
  laranja:{nome:'Laranja',icon:'i-laranja',max:20,tipo:'comida',fome:6,sede:9,desc:'Mata bem a sede. Plante uma no acampamento para nascer uma laranjeira.'},
  manga:{nome:'Manga',icon:'i-manga',max:20,tipo:'comida',fome:10,sede:5,desc:'Doce e grande. Plante uma no acampamento para nascer uma mangueira.'},
  acerola:{nome:'Acerola',icon:'i-acerola',max:30,tipo:'comida',fome:3,sede:5,desc:'Frutinha azeda. Plante uma no acampamento para nascer uma aceroleira.'}});
iconesNovos({
  'i-muda':'<path d="M5 20h14"/><path d="M12 20v-9"/><path d="M12 13c-3.2 0-5-2.2-5-5 3 0 5 2 5 5z"/><path d="M12 11c0-3 2-5 5-5 0 3-2 5-5 5z"/>',
  'i-maca':'<path d="M12 8.2c-1.6-1.3-4.7-1.5-6.2 1-1.9 3.1.3 8.9 3 10.7 1.3.9 2.2.5 3.2 0 1 .5 1.9.9 3.2 0 2.7-1.8 4.9-7.6 3-10.7-1.5-2.5-4.6-2.3-6.2-1z"/><path d="M12 8c0-1.7.5-3.1 1.8-4.2"/><path d="M13.4 5.6c1.3-1.2 3-1.4 4.3-.8-.9 1.4-2.6 1.9-4.3.8z"/>',
  'i-laranja':'<circle cx="12" cy="13.5" r="7"/><path d="M12 6.5c0-1.4.6-2.4 1.8-3"/><path d="M12.6 5.2c1.4-1 3.1-1 4.2-.2-1.1 1.2-2.8 1.3-4.2.2z"/><path d="M9.2 11.2h.01M14.6 12h.01M11.4 15.6h.01M15.4 16h.01"/>',
  'i-manga':'<path d="M7.6 7.2c3.8-2.3 10.6.2 11.2 6.4.4 4.1-2.4 7-6.6 6.9-4.4-.1-7.9-3.3-7.8-7.6.1-2.5 1.2-4.5 3.2-5.7z"/><path d="M8.5 6.8c-.3-1.3-1.1-2.3-2.3-2.8"/><path d="M8 5.2c1.4-.9 3.2-.8 4.3.2-1.3 1-3 1-4.3-.2z"/>',
  'i-acerola':'<circle cx="7.5" cy="16" r="3.2"/><circle cx="15.8" cy="16.5" r="3.2"/><circle cx="12" cy="11.2" r="2.8"/><path d="M12 8.4c0-2 .8-3.6 2.4-4.4M7.5 12.8c.6-3 2.6-5.6 6.9-8.8M15.8 13.3c.2-3.5-.4-6.6-1.4-9.3"/>'});
for(const[t,e]of[['mercado',['maca',1,3,0.3]],['mercado',['laranja',1,3,0.2]],['casa',['maca',1,2,0.12]],['celeiro',['maca',1,2,0.15]]])if(LOOT[t])LOOT[t].push(e);
for(const[t,e]of[['ap_cozinha',['maca',.1,1,2]],['estoque',['maca',.12,1,3]]])if(CID_LOOT[t])CID_LOOT[t].push(e);
const POMAR={macieira:{fruta:'maca',nome:'Macieira',folha:0x3f6a2a,cor:[0xb8322a,0xa83026,0xb0a038],r:0.075,n:16},
  laranjeira:{fruta:'laranja',nome:'Laranjeira',folha:0x3a6628,cor:[0xe08a20,0xe8962a,0xd07a18],r:0.075,n:16},
  mangueira:{fruta:'manga',nome:'Mangueira',folha:0x2f5a24,cor:[0xd8a030,0xc8b040,0xd07a30],r:0.085,n:14},
  aceroleira:{fruta:'acerola',nome:'Aceroleira',folha:0x426e2c,cor:[0xc0201c,0xd0301c,0xa81818],r:0.045,n:28}};
const POMAR_PLURAL={maca:'maçãs',laranja:'laranjas',manga:'mangas',acerola:'acerolas'};
const POMAR_CFG={cresce:72,fruto:48};   // horas de jogo: da muda até a árvore, e da colheita até a fruta voltar
for(const t in POMAR){const p=POMAR[t];OBRAS[t]={nome:p.nome,icon:'i-muda',custo:{[p.fruta]:1},hp:140,hw:0.3,hd:0.3,solid:true,etapa:1,pomar:p.fruta};
  BASE_DICAS[t]=p.nome+' plantada. A muda vira árvore em uns 3 dias de jogo e depois dá fruta a cada 2 dias, sem replantar. Segure E perto dela para colher.';}
OBRA_ORDEM.push(...Object.keys(POMAR));OBRAS_CHAO.push(...Object.keys(POMAR));
/* fruta das árvores dos sítios e das casas: 1 = madura; depois de colher volta devagar */
let pomarRef=null,pomarN=-1;
function pomarD(){let W=G.pomar;if(!W||typeof W!=='object')W=G.pomar={};
  if(W!==pomarRef||pomarN!==FRUTEIRAS.length){for(const f of FRUTEIRAS)if(!Number.isFinite(W[f.id]))W[f.id]=1;pomarRef=W;pomarN=FRUTEIRAS.length;}return W;}
V8.novo.pomar=()=>{G.pomar={};pomarD();};
V8.salvar.pomar=()=>{const W=pomarD(),o={};for(const k in W)o[k]=+(+W[k]).toFixed(3);return o;};
V8.carregar.pomar=s=>{const W={};if(s&&typeof s==='object')for(const k in s){const v=+s[k];if(Number.isFinite(v))W[k]=clamp(v,0,1);}G.pomar=W;pomarD();};
const pomarExt=o=>{const e=o.ext||(o.ext={});if(!(e.cresce>=0))e.cresce=0;if(!(e.fruto>=0))e.fruto=0;return e;};
PASSOS.push(function pomarCresce(dt){const hs=dt/30*((G.chuva||0)>0.3?1.5:1)*(G.hora>=6&&G.hora<20?1:0.7)*(typeof climaHorta==='function'?climaHorta():1);if(!(hs>0))return;
  const W=pomarD();for(const k in W)if(W[k]<1)W[k]=Math.min(1,W[k]+hs/POMAR_CFG.fruto);
  for(const o of OB){const D=OBRAS[o.tipo];if(!D||!D.pomar)continue;const e=pomarExt(o);
    if(e.cresce<1)e.cresce=Math.min(1,e.cresce+hs/POMAR_CFG.cresce);else if(e.fruto<1)e.fruto=Math.min(1,e.fruto+hs/POMAR_CFG.fruto);}});
/* colher: perto do tronco */
INTERS.push(tryIt=>{if(P.y<SUB_FUNDO||(CARRO&&CARRO.ativo))return;
  for(const f of FRUTEIRAS)if(Math.abs(f.x-P.x)<4&&Math.abs(f.z-P.z)<4)tryIt({k:'fruteira',o:f},f.x,f.z,2.1,1.1,-0.5,f.y);
  for(const o of OB){const D=OBRAS[o.tipo];if(D&&D.pomar&&Math.abs(o.x-P.x)<4&&Math.abs(o.z-P.z)<4)tryIt({k:'pomarObra',o},o.x,o.z,1.9,1.5,-0.5,o.y);}});
function colherFruta(fruta){const n=fruta==='acerola'?5+Math.floor(Math.random()*5):2+Math.floor(Math.random()*3);ganhar(fruta,n);ganharXP(3);
  if(typeof progresso==='function')progresso('colheita');sfx('pegar');
  if(typeof dica==='function')dica('pomar','corpo','A fruta volta em uns 2 dias. Também dá para plantar a fruta no acampamento: no menu de construção (B) tem macieira, laranjeira, mangueira e aceroleira.');}
const pomarHoras=h=>'umas '+Math.max(1,Math.ceil(h))+' h';
INTER_K.fruteira={
  texto:f=>{const v=pomarD()[f.id],nm=ITEMS[f.fruta]?ITEMS[f.fruta].nome.toLowerCase():f.fruta;
    return v>=1?{t:'Colher '+(POMAR_PLURAL[f.fruta]||nm),s:'pé de '+nm+' · segure E',hold:true,dur:1.0}:{t:'Pé de '+nm+' sem fruta',s:'volta em '+pomarHoras((1-v)*POMAR_CFG.fruto)};},
  usar:f=>{const W=pomarD();if(!(W[f.id]>=1)){feed('Ainda sem fruta madura',true);return;}W[f.id]=0;colherFruta(f.fruta);}};
INTER_K.pomarObra={
  texto:o=>{const e=pomarExt(o),D=OBRAS[o.tipo];
    if(e.cresce<1)return{t:D.nome+' crescendo · '+Math.floor(e.cresce*100)+'%',s:'vira árvore em '+pomarHoras((1-e.cresce)*POMAR_CFG.cresce)};
    return e.fruto>=1?{t:'Colher '+POMAR_PLURAL[D.pomar],s:D.nome.toLowerCase()+' · segure E',hold:true,dur:1.0}:{t:D.nome+' sem fruta',s:'volta em '+pomarHoras((1-e.fruto)*POMAR_CFG.fruto)};},
  usar:o=>{const e=pomarExt(o),D=OBRAS[o.tipo];if(e.cresce<1){feed(D.nome+' ainda crescendo',true);return;}if(e.fruto<1){feed('Ainda sem fruta madura',true);return;}e.fruto=0;colherFruta(D.pomar);}};
/* malhas: a muda (fica na construção, e é o que aparece ao escolher o lugar), a árvore crescida e as frutas na beira da copa */
INIT_MALHAS.push(()=>{const R=rng(8282),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());};const tronco=lin(0x5a4330),terra=lin(0x3d3127);
  // centros dos bolos de folha da copa (os mesmos das árvores de fruta dos sítios)
  const B=[];for(let i=1;i<5;i++){const a=i*1.3;B.push([Math.cos(a)*0.65,2.5,Math.sin(a)*0.65]);}
  for(const t in POMAR){const p=POMAR[t],fo=lin(p.folha);
    MESH.obra[t]=mk(g=>{add(g,icoTris(0.34,0.25,R),mat(0,0,0,0,0,0,1,0.22,1),terra,{j:0.12,rnd:R});add(g,cylTris(0.012,0.02,0.5,4),mat(0,0.02,0),tronco);
      for(let k=0;k<4;k++){const a=k*1.57+0.4;add(g,boxTris(0.02,0.16,0.08,{tx:0.2}),mm(mat(0,0.3+k*0.05,0,0,a,0),mat(0,0.08,0.03,-0.9,0,0)),fo,{j:0.12,rnd:R});}});
    MESH['pomarArv_'+t]=mk(g=>{add(g,cylTris(0.14,0.2,1.6,7),mat(0,0,0),tronco,{j:0.1,rnd:R});
      for(const a of[0.6,2.4,4.3])add(g,cylTris(0.05,0.08,1.0,5),mat(Math.sin(a)*0.15,1.4,Math.cos(a)*0.15,0.6*Math.cos(a),0,-0.6*Math.sin(a)),tronco);
      for(let i=0;i<5;i++){const a=i*1.3,r=i?0.65:0;add(g,icoTris(0.8+R()*0.3,0.3,R),mat(Math.cos(a)*r,2.3+(i?R()*0.4:0.5),Math.sin(a)*r,R(),R()*3,R(),1.1,0.85,1.1),mixc(fo,lin(0x4f7a2f),R()*0.5),{j:0.15,rnd:R});}});
    MESH['pomarFruta_'+p.fruta]=mk(g=>{for(let i=0;i<p.n;i++){const b=B[i%4],ol=Math.hypot(b[0],b[2])||1;let dx=0,dy=0,dz=0;
      for(let tt=0;tt<10;tt++){const a=R()*6.283,ph=-0.95+R()*1.2;dx=Math.cos(a)*Math.cos(ph);dy=Math.sin(ph);dz=Math.sin(a)*Math.cos(ph);if((dx*b[0]+dz*b[2])/ol>0.05)break;}
      add(g,icoTris(p.r,0.15,R),mat(b[0]+dx*1.0,b[1]+dy*0.78,b[2]+dz*1.0,0,R()*3,0,1,p.fruta==='manga'?1.35:1,1),lin(p.cor[Math.floor(R()*p.cor.length)]),{e:0.04});}});}});
const _MPO=new Float32Array(16);
const pomarArvM=(o,k)=>trs(_MPO,o.x,o.y,o.z,0,o.yaw,0,k,k,k);
DESENHO.opaco.push(Pg=>{if(P.y<SUB_FUNDO||!MESH.pomarFruta_maca)return;const W=pomarD();
  for(const f of FRUTEIRAS){if(!(W[f.id]>=1)||d2(f.x,f.z,P.x,P.z)>90*90)continue;const m=MESH['pomarFruta_'+f.fruta];if(m)drawStat(Pg,m,f.M);}
  for(const o of OB){const D=OBRAS[o.tipo];if(!D||!D.pomar||d2(o.x,o.z,P.x,P.z)>100*100)continue;const e=pomarExt(o);if(e.cresce<0.1)continue;
    drawStat(Pg,MESH['pomarArv_'+o.tipo],pomarArvM(o,0.22+0.78*e.cresce));if(e.cresce>=1&&e.fruto>=1)drawStat(Pg,MESH['pomarFruta_'+D.pomar],_MPO);}});
DESENHO.sombra.push((Pg,perto)=>{if(!MESH.pomarFruta_maca)return;for(const o of OB){const D=OBRAS[o.tipo];if(!D||!D.pomar||d2(o.x,o.z,P.x,P.z)>(perto?60:120)**2)continue;const e=pomarExt(o);if(e.cresce<0.1)continue;
  drawStat(Pg,MESH['pomarArv_'+o.tipo],pomarArvM(o,0.22+0.78*e.cresce));}});
