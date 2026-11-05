/* ================= plantio: plantar e colher na plantação da fazenda e nas hortas dos sítios =================
   Cada fileira de terra (na fazenda, cada terço de fileira) é um canteiro. Seis culturas: milho, batata, abóbora, tomate,
   cenoura e feijão verde. No canteiro vazio, com sementes na mochila: toque E para escolher a cultura e segure E para
   plantar (gasta 1 semente). Cresce sozinho em mais ou menos um dia de jogo (a chuva acelera; à noite e no frio cresce mais
   devagar; dormindo, o tempo passa e a plantação cresce junto). Pronto: segure E para colher. Quase sempre volta uma semente
   (às vezes duas), então dá para manter a roça. Na fazenda abandonada os canteiros começam vazios; nas hortas dos sítios a
   maioria ainda tem o que colher. Tudo fica no save. */
Object.assign(ITEMS,{
  tomate:{nome:'Tomate',icon:'i-tomate',max:20,tipo:'comida',fome:6,sede:6,desc:'Do canteiro. Mata um pouco a fome e a sede.'},
  cenoura:{nome:'Cenoura',icon:'i-cenoura',max:20,tipo:'comida',fome:8,desc:'Do canteiro. Boa crua.'},
  feijaoVerde:{nome:'Feijão verde',icon:'i-vagem',max:20,tipo:'comida',fome:9,desc:'Vagens colhidas no canteiro.'}});
iconesNovos({
  'i-tomate':'<path d="M12 7.5c-4.3 0-7.5 2.7-7.5 6.4 0 3.8 3.4 6.6 7.5 6.6s7.5-2.8 7.5-6.6c0-3.7-3.2-6.4-7.5-6.4z"/><path d="M12 7.5 9.4 5.5l1.2 2.6-3.2.2 3 1.1M12 7.5l2.6-2-1.2 2.6 3.2.2-3 1.1M12 7.5V4"/>',
  'i-cenoura':'<path d="M15.6 8.4c-2.1-2.1-5.2-1.6-6.6.8L3.6 19.6c-.4.8.4 1.6 1.2 1.2l10.4-5.4c2.4-1.4 2.9-4.5.4-7z"/><path d="M15.6 8.4l3.6-3.6M16.2 7.8c.9-2.3 2.5-3.4 4.6-3.6M16.2 7.8c2.3-.9 3.4-2.5 3.6-4.6"/><path d="M8.8 13.2l1.6 1.6M6.6 16.6l1.4 1.4"/>',
  'i-vagem':'<path d="M5 18.5c4.8.6 10.9-2.4 13.6-8.2.7-1.5.9-3 .6-4.3"/><path d="M5 18.5c-.9-1.1-.6-2.5.6-3.2 4.4-1.4 8.1-4.6 10.1-8.4.8-1.3 2.4-1.6 3.5-.9"/><circle cx="8.6" cy="15.6" r=".9"/><circle cx="11.6" cy="13.8" r=".9"/><circle cx="14.3" cy="11.3" r=".9"/>'});
const PLANTIO_CFG={horas:24,chuva:1.8,noite:0.7};
const PLANTIO_CULT=[{id:'milho',nome:'milho',min:1,max:2},{id:'batata',nome:'batata',min:1,max:2},{id:'abobora',nome:'abóbora',min:1,max:1},
  {id:'tomate',nome:'tomate',min:2,max:3},{id:'cenoura',nome:'cenoura',min:1,max:3},{id:'feijaoVerde',nome:'feijão verde',min:1,max:3}];
const plantioMai=s=>s[0].toUpperCase()+s.slice(1);
let plantioRef=null,plantioN=-1;
function plantioD(){let S=G.plantio;if(!S||typeof S!=='object')S=G.plantio={};
  if(S!==plantioRef||plantioN!==PLANTIO_DEF.length){PLANTIO_DEF.forEach((d,i)=>{if(!Number.isFinite(S[d.id]))S[d.id]=d.tipo==='sitio'&&i%3!==2?1:-1;});plantioRef=S;plantioN=PLANTIO_DEF.length;}
  return S;}
const plantioC=()=>G.plantioC&&typeof G.plantioC==='object'?G.plantioC:(G.plantioC={});   // a cultura que você plantou em cada canteiro
/* cultura do canteiro: a que você plantou; nos que já vêm plantados (sítios), milho, batata ou abóbora */
function cultIdx(d){const c=plantioC()[d.id];if(c>=0&&c<PLANTIO_CULT.length)return c;
  if(d.cult===undefined){let h=7;for(let i=0;i<d.id.length;i++)h=(h*31+d.id.charCodeAt(i))>>>0;const r=h%5;d.cult=r<2?0:r<4?1:2;}return d.cult;}
const culturaDe=d=>PLANTIO_CULT[cultIdx(d)];
const plantioSel=()=>{const s=G.plantioSel|0;return s>=0&&s<PLANTIO_CULT.length?s:0;};
V8.novo.plantio=()=>{G.plantio={};G.plantioC={};G.plantioSel=0;plantioD();};
V8.salvar.plantio=()=>{const S=plantioD(),o={};for(const k in S)o[k]=+(+S[k]).toFixed(3);return{s:o,c:Object.assign({},plantioC()),sel:plantioSel()};};
V8.carregar.plantio=s=>{const S={},C={},src=s&&typeof s==='object'?(s.s&&typeof s.s==='object'?s.s:s):null;
  if(src)for(const k in src){if(k==='c'||k==='sel')continue;const v=+src[k];if(Number.isFinite(v))S[k]=clamp(v,-1,1);}
  if(s&&s.c&&typeof s.c==='object')for(const k in s.c){const v=s.c[k]|0;if(v>=0&&v<PLANTIO_CULT.length)C[k]=v;}
  G.plantio=S;G.plantioC=C;G.plantioSel=s&&s.sel?s.sel|0:0;plantioD();};
const plantioRitmo=()=>((G.chuva||0)>0.3?PLANTIO_CFG.chuva:1)*(G.hora>=6&&G.hora<20?1:PLANTIO_CFG.noite)*(typeof climaHorta==='function'?climaHorta():1);
PASSOS.push(function plantioCresce(dt){const S=plantioD(),r=dt/(PLANTIO_CFG.horas*30)*plantioRitmo();if(!(r>0))return;
  for(const k in S){const c=S[k];if(c>=0&&c<1)S[k]=Math.min(1,c+r);}});
/* alvo: o ponto do canteiro mais perto de você (x/z ficam nele: a ação de segurar E confere a distância por ali) */
INTERS.push(tryIt=>{if(P.y<SUB_FUNDO||(CARRO&&CARRO.ativo))return;for(const d of PLANTIO_DEF){if(Math.abs((d.ax+d.bx)/2-P.x)>8||Math.abs((d.az+d.bz)/2-P.z)>8)continue;
  const vx=d.bx-d.ax,vz=d.bz-d.az,L2=vx*vx+vz*vz||1,t=clamp(((P.x-d.ax)*vx+(P.z-d.az)*vz)/L2,0,1);d.x=d.ax+vx*t;d.z=d.az+vz*t;tryIt({k:'canteiro',o:d},d.x,d.z,1.9,1,-0.4,d.y);}});
const sementesTxt=n=>n+(n>1?' sementes':' semente');
INTER_K.canteiro={
  texto:d=>{const c=plantioD()[d.id];
    if(!(c>=0)){const n=invCount('sementes');return n?{t:'Plantar '+PLANTIO_CULT[plantioSel()].nome+' aqui',s:'toque E: trocar · segure E: plantar ('+sementesTxt(n)+')',alt:true,dur:1.0}:{t:'Canteiro vazio',s:'precisa de sementes para plantar'};}
    const C=culturaDe(d);
    if(c<1){const h=Math.max(1,Math.ceil((1-c)*PLANTIO_CFG.horas/Math.max(0.1,plantioRitmo())));return{t:plantioMai(C.nome)+' crescendo · '+Math.floor(c*100)+'%',s:'pronto em umas '+h+' h'+((G.chuva||0)>0.3?' · a chuva ajuda':'')};}
    return{t:'Colher '+C.nome,s:'segure E para colher',hold:true,dur:0.9};},
  /* toque rápido no canteiro vazio: passa para a próxima cultura */
  curto:d=>{if(plantioD()[d.id]>=0||!invCount('sementes'))return;G.plantioSel=(plantioSel()+1)%PLANTIO_CULT.length;sfx('clique');feed('Vai plantar: '+PLANTIO_CULT[G.plantioSel].nome);},
  usar:d=>{const S=plantioD(),c=S[d.id];
    if(!(c>=0)){if(!invCount('sementes')){feed('Precisa de sementes: procure no celeiro, nas casas e no mercado, ou troque com sobreviventes',true);sfx('vazio');return;}
      const ci=plantioSel(),C=PLANTIO_CULT[ci];invRemove('sementes',1);S[d.id]=0;plantioC()[d.id]=ci;sfx('pegar');feed('Plantou '+C.nome+': fica pronto em mais ou menos um dia');hudBarra();
      if(typeof diarioConta==='function')diarioConta('plantou',1);
      if(typeof dica==='function')dica('canteiro','corpo','Plantou! O canteiro cresce sozinho em mais ou menos um dia (a chuva ajuda). No canteiro vazio, toque E para trocar o que vai plantar: milho, batata, abóbora, tomate, cenoura ou feijão.');return;}
    const C=culturaDe(d);
    if(c<1){feed(plantioMai(C.nome)+' ainda crescendo ('+Math.floor(c*100)+'%)',true);return;}
    const R=Math.random;ganhar(C.id,C.min+Math.floor(R()*(C.max-C.min+1)));const sem=(R()<0.8?1:0)+(R()<0.2?1:0);if(sem)ganhar('sementes',sem);
    S[d.id]=-1;delete plantioC()[d.id];ganharXP(4);if(typeof progresso==='function')progresso('colheita');if(typeof diarioConta==='function')diarioConta('colheu',1);sfx('pegar');}};
/* plantas: muda (começo) e o pé formado de cada cultura, numa fileira esticada no comprimento do canteiro */
INIT_MALHAS.push(()=>{const R=rng(7171),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());};
  const folha=(g,x,y,a,inc,l,w,c)=>add(g,boxTris(0.03,l,w,{tx:0.2}),mm(mat(x,y,0,0,a,0),mat(0,l/2,w*0.35,-inc,0,0)),c,{j:0.15,rnd:R});
  const verde=(a,b)=>mixc(lin(a),lin(b),R());
  const tufo=(g,x,y,z,r,c,sy)=>add(g,icoTris(r,0.35,R),mat(x,y,z,0,R()*3,0,1,sy,1),c,{j:0.12,rnd:R});   // bolo de folhas
  MESH.plantioBroto=mk(g=>{for(let i=0;i<9;i++){const x=-2.6+i*0.65+(R()-0.5)*0.12;for(let k=0;k<4;k++)folha(g,x,0,k*1.57+R()*0.6,0.4,0.3,0.1,verde(0x4a7a2c,0x6a8a34));}});
  MESH.plantioMilho=mk(g=>{for(let i=0;i<9;i++){const x=-2.6+i*0.65+(R()-0.5)*0.12,h=1.25+R()*0.3;add(g,cylTris(0.018,0.03,h,5),mat(x,0,0),lin(0x6a7a34));
    for(let k=0;k<6;k++)folha(g,x,0.2+k*0.16,k*1.9+R()*0.5,0.85,0.55,0.11,verde(0x5a7a2c,0x7a8a38));
    add(g,cylTris(0.035,0.045,0.24,6),mat(x+0.05,0.62,0.03,0.35,0,0.2),lin(0xd9b84a));add(g,cylTris(0.004,0.02,0.2,4),mat(x,h,0),lin(0xb89a4a));}});
  MESH.plantioBatata=mk(g=>{for(let i=0;i<9;i++){const x=-2.6+i*0.65+(R()-0.5)*0.12;
    for(let k=0;k<4;k++){const a=k*1.6+R()*0.5,r=k?0.1:0;tufo(g,x+Math.cos(a)*r,0.13+(k?0:0.08)+R()*0.04,Math.sin(a)*r,0.15+R()*0.04,verde(0x46722a,0x62883a),0.65);}
    for(let k=0;k<3;k++)folha(g,x+(R()-0.5)*0.2,0.05,R()*6.28,0.9,0.22,0.09,verde(0x4f7a2f,0x6a8a3a));
    if(i%2===0)for(let k=0;k<2;k++)add(g,icoTris(0.03,0.2,R),mat(x+(R()-0.5)*0.16,0.33+R()*0.04,(R()-0.5)*0.12),lin(k?0xe6e0ee:0xc9b8e0));}});
  MESH.plantioAbobora=mk(g=>{for(let i=0;i<5;i++){const x=-2.4+i*1.2+(R()-0.5)*0.15;
    for(let k=0;k<5;k++){const a=k*1.26+R()*0.5;add(g,boxTris(0.26,0.012,0.24),mat(x+Math.cos(a)*0.22,0.12+R()*0.05,Math.sin(a)*0.18,0,a,0.1),verde(0x4a7a2c,0x5f8a34),{j:0.15,rnd:R});}
    add(g,boxTris(1.0,0.03,0.04),mat(x+0.3,0.03,0.1,0,0.4,0),lin(0x5a7a2c));
    add(g,icoTris(0.17,0.15,R),mat(x+0.05,0.14,0.04,0,0,0,1.25,0.85,1.25),lin(0xd9771e),{j:0.08,rnd:R,crease:80});add(g,cylTris(0.015,0.02,0.07,5),mat(x+0.05,0.27,0.04),lin(0x6a5a2a));}});
  MESH.plantioTomate=mk(g=>{for(let i=0;i<7;i++){const x=-2.55+i*0.85+(R()-0.5)*0.1;add(g,boxTris(0.03,1.15,0.03),mat(x+0.1,0.575,0.02),lin(0x7a5a3a));
    for(let k=0;k<4;k++)tufo(g,x+(R()-0.5)*0.12,0.25+k*0.19,(R()-0.5)*0.1,0.14+R()*0.04,verde(0x3f6a2a,0x557a32),0.8);
    for(let k=0;k<5;k++){const a=R()*6.28,y=0.22+R()*0.6;add(g,icoTris(0.045,0.15,R),mat(x+Math.cos(a)*0.15,y,Math.sin(a)*0.15),lin(k%3?0xc8321e:0xd85a24));}}});
  MESH.plantioCenoura=mk(g=>{for(let i=0;i<12;i++){const x=-2.7+i*0.49+(R()-0.5)*0.1;
    for(let k=0;k<7;k++)folha(g,x,0.02,k*0.9+R()*0.4,0.3+R()*0.3,0.26+R()*0.08,0.06,verde(0x4a7a2c,0x6a9a3a));
    add(g,cylTris(0.025,0.032,0.05,6),mat(x,-0.02,0),lin(0xd9771e));}});
  MESH.plantioFeijao=mk(g=>{for(let i=0;i<6;i++){const x=-2.5+i*1.0+(R()-0.5)*0.1;add(g,cylTris(0.014,0.02,1.45,5),mat(x,0,0),lin(0x7a5a3a));
    for(let k=0;k<6;k++){const a=k*2.1+R()*0.5;tufo(g,x+Math.cos(a)*0.09,0.2+k*0.2,Math.sin(a)*0.09,0.1+R()*0.03,verde(0x4a7a2c,0x62903a),0.6);}
    for(let k=0;k<6;k++){const a=R()*6.28;add(g,boxTris(0.02,0.17,0.025),mat(x+Math.cos(a)*0.14,0.3+R()*0.8,Math.sin(a)*0.14,0.15,0,0.1),lin(0x7aa040));}}});});
const _MPL=new Float32Array(16);
DESENHO.opaco.push(Pg=>{if(!MESH.plantioBroto||P.y<SUB_FUNDO)return;const S=plantioD(),M6=[MESH.plantioMilho,MESH.plantioBatata,MESH.plantioAbobora,MESH.plantioTomate,MESH.plantioCenoura,MESH.plantioFeijao];
  for(const d of PLANTIO_DEF){const c=S[d.id];if(!(c>=0))continue;const mx=(d.ax+d.bx)/2,mz=(d.az+d.bz)/2;if(d2(mx,mz,P.x,P.z)>80*80)continue;
    const L=Math.hypot(d.bx-d.ax,d.bz-d.az),ry=Math.atan2(-(d.bz-d.az),d.bx-d.ax),k=c>=1?1:c<0.45?0.5+c:0.45+0.5*c;
    drawStat(Pg,c<0.45?MESH.plantioBroto:M6[cultIdx(d)],trs(_MPL,mx,d.y,mz,0,ry,0,L/5.8,k,1));}});
