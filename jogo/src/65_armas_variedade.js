/* ================= Variedade de armas: qualidade e armas brancas novas (v10.7.0, 19/11/2026) =================
   Pedido do Himalaia: "não tem as variedades de itens" (direção: a variedade do Dying Light, sem copiar nomes nem modelos).
   · Qualidade: toda arma achada (gaveta, armário, caixa, porta-malas, saque de zumbi) vem com uma qualidade: Baixa, Comum, Boa
     ou Excepcional. Ela muda o dano (−12%, normal, +12%, +25%) e a durabilidade (o mesmo QUAL_DUR das roupas: −25%, normal,
     +25%, +50%). O nome mostra a qualidade (a comum fica só com o nome) e a vaga da mochila ganha um ponto verde (Boa) ou
     dourado (Excepcional). As armas que você já tem continuam comuns.
   · Seis armas brancas novas, cada uma com o seu jeito, nos lugares onde fazem sentido:
       cano de ferro (duro, quase não quebra, empurra) · chave de roda (rápida e firme, no porta-malas)
       martelo (curto e rápido, golpe de cima) · marreta (lenta e cansativa, derruba quase sempre)
       foice (alcança longe, nos sítios e celeiros) · cutelo (rápido, esfola bicho, nas cozinhas e no açougue do mercado). */
const QUAL_DANO=[0.88,1,1.12,1.25];
const armaComQual=d=>!!d&&d.tipo==='arma'&&!!(d.corpo||d.fogo||d.arco||d.besta)&&!d.semQual;
/* ---------- armas novas ---------- */
iconesNovos({'i-cano':'<path d="M5 19L18 6"/><path d="M15.5 3.5l5 5"/><path d="M3.5 16.5l4 4"/>',
  'i-chave-roda':'<path d="M5 19l10-10"/><path d="M12.5 6.5l5 5"/><path d="M15 9l4-4"/><circle cx="19.5" cy="4.5" r="1.5"/>',
  'i-martelo':'<path d="M6 20l7.5-7.5"/><path d="M10.5 6.5l7 7"/><path d="M12 5l2.5-2.5 6 6L18 11"/>',
  'i-marreta':'<path d="M4 21l9-9"/><path d="M9.5 8.5l6 6 5-5-6-6z"/>',
  'i-foice':'<path d="M4 21l6-6"/><path d="M10 15c5 0 10-4 9-11-2 4-6 7-11 7"/>',
  'i-cutelo':'<path d="M4 21l4.5-4.5"/><path d="M8.5 16.5l2 2L20 9V4h-5z"/>'});
Object.assign(ITEMS,{
  canoFerro:{nome:'Cano de ferro',icon:'i-cano',max:1,tipo:'arma',corpo:true,dano:25,alcance:2.2,tempo:0.6,durMax:260,empurra:1.25,desc:'Pedaço de cano galvanizado. Pesado e duro: quase não quebra e empurra os zumbis.'},
  chaveRoda:{nome:'Chave de roda',icon:'i-chave-roda',max:1,tipo:'arma',corpo:true,dano:23,alcance:2.0,tempo:0.48,durMax:280,empurra:1.0,desc:'A chave de roda do porta-malas. Rápida, firme e quase não quebra.'},
  martelo:{nome:'Martelo',icon:'i-martelo',max:1,tipo:'arma',corpo:true,dano:27,alcance:1.85,tempo:0.44,durMax:210,vertical:true,desc:'Martelo de carpinteiro. Curto e rápido; o golpe de cima pega na cabeça.'},
  marreta:{nome:'Marreta',icon:'i-marreta',max:1,tipo:'arma',corpo:true,dano:50,alcance:2.3,tempo:0.95,durMax:170,vertical:true,empurra:2.0,desc:'Marreta de obra. Lenta e cansativa, mas esmaga o que acerta e derruba quase sempre.'},
  foice:{nome:'Foice',icon:'i-foice',max:1,tipo:'arma',corpo:true,dano:33,alcance:2.4,tempo:0.56,durMax:150,desc:'Foice de roçar mato. A lâmina curva alcança longe.'},
  cutelo:{nome:'Cutelo',icon:'i-cutelo',max:1,tipo:'arma',corpo:true,dano:31,alcance:1.85,tempo:0.42,durMax:180,esfola:true,desc:'Cutelo de açougue. Rápido e pesado na ponta; também tira a pele dos bichos.'}});
Object.assign(BALANCO.brancas,{canoFerro:{dano:25,tempo:0.6,alcance:2.2},chaveRoda:{dano:23,tempo:0.48,alcance:2.0},martelo:{dano:27,tempo:0.44,alcance:1.85},
  marreta:{dano:50,tempo:0.95,alcance:2.3},foice:{dano:33,tempo:0.56,alcance:2.4},cutelo:{dano:31,tempo:0.42,alcance:1.85}});
Object.assign(REPARO,{canoFerro:{sucata:1},chaveRoda:{sucata:1},martelo:{madeira:1,sucata:1},marreta:{madeira:1,sucata:2},foice:{sucata:1,madeira:1},cutelo:{sucata:1}});
Object.assign(DESMONTE_FIXO,{canoFerro:{sucata:2},chaveRoda:{sucata:2},martelo:{sucata:1,madeira:1},marreta:{sucata:3,madeira:1},foice:{sucata:1,madeira:1},cutelo:{sucata:1}});
/* onde achar */
{const L=(t,e)=>{if(LOOT[t])LOOT[t].push(e);},C=(t,e)=>{if(CID_LOOT[t])CID_LOOT[t].push(e);};
  L('carro',['chaveRoda',1,1,0.1]);L('oficina',['canoFerro',1,1,0.14]);L('oficina',['martelo',1,1,0.12]);L('oficina',['marreta',1,1,0.05]);L('oficina',['chaveRoda',1,1,0.08]);
  L('celeiro',['foice',1,1,0.16]);L('celeiro',['martelo',1,1,0.08]);L('celeiro',['marreta',1,1,0.05]);L('casa',['cutelo',1,1,0.03]);L('casa',['martelo',1,1,0.03]);L('casa',['foice',1,1,0.015]);
  L('lixo',['canoFerro',1,1,0.03]);
  if(LOOT.morroFerramentas){L('morroFerramentas',['martelo',1,1,0.1]);L('morroFerramentas',['canoFerro',1,1,0.06]);L('morroFerramentas',['marreta',1,1,0.03]);}
  if(LOOT.morroLixo)L('morroLixo',['canoFerro',1,1,0.06]);
  C('deposito',['canoFerro',.05,1,1]);C('deposito',['martelo',.05,1,1]);C('deposito',['marreta',.02,1,1]);C('lixo',['canoFerro',.02,1,1]);
  C('oficina',['chaveRoda',.12,1,1]);C('oficina',['martelo',.1,1,1]);C('oficina',['canoFerro',.08,1,1]);C('pecas',['chaveRoda',.1,1,1]);
  C('armazem',['marreta',.05,1,1]);C('armazem',['canoFerro',.06,1,1]);C('armazem_caixa',['martelo',.06,1,1]);C('porao',['foice',.05,1,1]);C('porao',['martelo',.05,1,1]);
  C('ap_cozinha',['cutelo',.04,1,1]);C('mercado',['cutelo',.05,1,1]);C('padaria',['cutelo',.03,1,1]);C('metro_manut',['canoFerro',.1,1,1]);C('metro_ferr',['chaveRoda',.06,1,1]);}
/* modelos na mão (cabo ao longo de +z a partir da mão; a lâmina, a cabeça ou a ponta para −y) */
{const _wg=weaponGeometry;weaponGeometry=function(){const W=_wg.apply(this,arguments),R=rng(6501),mk=f=>{const g=new GB(1024,8);f(g);return g.data();};
  const aco=lin(0x9aa1a8),ferro=lin(0x5f666d),galv=lin(0x8f969b),mad=lin(0x8a6440),preto=lin(0x1d2023),fita=lin(0x2a2d31),verm=lin(0x8a2a22);
  const ao=(x,y,z,a,b,c)=>mat(x,y,z,a||0,b||0,c||0);
  W.canoFerro=mk(g=>{add(g,cylTris(0.023,0.023,0.84,10),ao(0,0,0.74,-Math.PI/2),galv,{j:0.05,rnd:R});add(g,cylTris(0.031,0.031,0.075,10),ao(0,0,0.74,-Math.PI/2),lin(0x6f7579),{j:0.04,rnd:R});
    add(g,cylTris(0.027,0.027,0.16,10),ao(0,0,0.08,-Math.PI/2),fita,{j:0.08,rnd:R});add(g,cylTris(0.03,0.03,0.04,10),ao(0,0,-0.07,-Math.PI/2),lin(0x6f7579));});
  W.chaveRoda=mk(g=>{add(g,cylTris(0.012,0.012,0.46,8),ao(0,0,0.42,-Math.PI/2),ferro,{j:0.04,rnd:R});add(g,cylTris(0.013,0.013,0.15,8),ao(0,0.0,0.42,Math.PI),ferro);
    add(g,cylTris(0.021,0.019,0.055,8),ao(0,-0.15,0.42,Math.PI),lin(0x4a5056));add(g,cylTris(0.016,0.012,0.04,6),ao(0,0,-0.045,-Math.PI/2),lin(0x4a5056));});
  W.martelo=mk(g=>{add(g,cylTris(0.016,0.019,0.36,8),ao(0,0,0.3,-Math.PI/2),mad,{j:0.06,rnd:R});add(g,bvTris(0.034,0.06,0.042),ao(0,-0.05,0.31),aco,{j:0.03,rnd:R});
    add(g,cylTris(0.02,0.02,0.035,8),ao(0,-0.08,0.31,Math.PI),aco);add(g,bvTris(0.03,0.07,0.025,{tx:0.6}),ao(0,0.06,0.31,0.25),ferro);});
  W.marreta=mk(g=>{add(g,cylTris(0.019,0.021,0.86,9),ao(0,0,0.76,-Math.PI/2),mad,{j:0.06,rnd:R});add(g,bvTris(0.075,0.21,0.085),ao(0,0,0.79),ferro,{j:0.04,rnd:R});
    for(const s of[-1,1])add(g,bvTris(0.08,0.02,0.09),ao(0,s*0.105,0.79),lin(0x4a5056));add(g,cylTris(0.024,0.024,0.12,9),ao(0,0,0.02,-Math.PI/2),preto);});
  W.foice=mk(g=>{add(g,cylTris(0.017,0.019,0.4,8),ao(0,0,0.36,-Math.PI/2),mad,{j:0.06,rnd:R});add(g,cylTris(0.02,0.02,0.04,8),ao(0,0,0.38,-Math.PI/2),ferro);
    /* a lâmina em arco: sai do alto do cabo, vai para −y e volta */
    const cy=-0.17,cz=0.43,r=0.17,n=9;let p0=null;for(let i=0;i<=n;i++){const a=(i/n)*Math.PI*1.18,p=[cy+Math.cos(a)*r,cz+Math.sin(a)*r*1.05];
      if(p0){const dy=p[0]-p0[0],dz=p[1]-p0[1],L=Math.hypot(dy,dz),w=0.036*(1-i/(n+3));add(g,boxTris(0.004,w,L+0.006),ao(0,(p[0]+p0[0])/2,(p[1]+p0[1])/2,Math.atan2(-dy,dz)),aco);}p0=p;}});
  W.cutelo=mk(g=>{add(g,bvTris(0.028,0.034,0.13),ao(0,0,0.0),lin(0x3a2a20),{j:0.06,rnd:R});for(const z of[-0.03,0.03])add(g,cylTris(0.005,0.005,0.03,5),ao(0.0,0,z,0,0,Math.PI/2),aco);
    add(g,boxTris(0.005,0.105,0.21),ao(0,-0.035,0.17),aco,{j:0.03,rnd:R});add(g,boxTris(0.006,0.012,0.21),ao(0,0.012,0.17),lin(0x7d848a));
    add(g,cylTris(0.011,0.011,0.007,8),ao(0,0.0,0.24,0,0,Math.PI/2),preto);});
  return W;};}

/* ---------- qualidade das armas ---------- */
for(const id in ITEMS)if(armaComQual(ITEMS[id]))ITEMS[id].qual=true;
{const _du=danoUp;danoUp=function(s){const r=_du.apply(this,arguments);if(!s||s.q===undefined)return r;return armaComQual(ITEMS[s.id])?r*QUAL_DANO[s.q]:r;};}
/* arma achada: sorteia a qualidade (e o estado continua sendo de 45% a 85% da durabilidade dessa qualidade) */
function qualSorteia(R){const x=(R||Math.random)();return x<0.18?0:x<0.72?1:x<0.93?2:3;}
{const _li=lootItem;lootItem=function(id,n,R){const r=_li.apply(this,arguments);const d=ITEMS[id];if(!armaComQual(d)||n!==1)return r;
  const q=qualSorteia(R),ex=Object.assign({},r[2]||{},{q});if(d.durMax)ex.dur=Math.round(durMaxDe({id,q})*(0.45+(R||Math.random)()*0.4));r[2]=ex;return r;};}
/* o nome: a comum fica só com o nome; as outras dizem a qualidade */
{const _ni=nomeItem;nomeItem=function(s){const d=s&&ITEMS[s.id];if(armaComQual(d)&&s.q===1)return d.nome;return _ni.apply(this,arguments);};}
/* a vaga da mochila e da barra: ponto verde (Boa) ou dourado (Excepcional) */
{const _sh=slotHTML;slotHTML=function(s,i,key){const h=_sh.apply(this,arguments);if(!s||s.q===undefined||s.q<2||!armaComQual(ITEMS[s.id]))return h;return h+'<span class="qual-arma q'+s.q+'" aria-hidden="true"></span>';};}
{const st=document.createElement('style');st.id='qual-arma-css';
  st.textContent='.slot .qual-arma{position:absolute;top:5px;right:5px;width:7px;height:7px;border-radius:50%;pointer-events:none}.slot .qual-arma.q2{background:#86c86a;box-shadow:0 0 0 1px rgba(0,0,0,.45)}.slot .qual-arma.q3{background:#f0c050;box-shadow:0 0 0 1px rgba(0,0,0,.45),0 0 7px rgba(240,192,80,.8)}';
  (document.head||document.body).appendChild(st);}
/* aviso quando entra na mochila uma arma boa ou excepcional (por qualquer caminho: achados, chão, baú) */
let qualAvisoT=0;
PASSOS.push(function avisoQualidade(dt){qualAvisoT-=dt;if(qualAvisoT>0)return;qualAvisoT=0.7;if(!P.inv||!P.alive)return;
  for(const s of P.inv){if(!s||s.q===undefined||s.q<2||s.qv||!armaComQual(ITEMS[s.id]))continue;s.qv=1;feed(ITEMS[s.id].nome+(s.q===3?' excepcional!':' boa!'));
    dica('qualArma','corpo','Arma '+(s.q===3?'excepcional':'boa')+': as armas achadas vêm em 4 qualidades (baixa, comum, boa e excepcional). A boa bate 12% mais e dura 25% mais; a excepcional, 25% e 50%. O ponto colorido na mochila mostra qual é.');}});
/* ---------- melhorias novas na bancada de armas: fiação elétrica (choque que atordoa) e ponta de fogo (põe fogo no zumbi) ---------- */
Object.assign(MELHORIAS,{
  eletro:{nome:'Fiação elétrica',desc:'choque: 35% de chance de atordoar o zumbi por 1,5 s',custo:{fio:2,pilhas:2,fita:1},serve:d=>!!d.corpo},
  brasa:{nome:'Ponta de fogo',desc:'30% de chance de pôr fogo no zumbi',custo:{gasolina:1,pano:2,fita:1},serve:d=>!!d.corpo}});
{const _fz=ferirZ;ferirZ=function(z,dmg,kx,kz,forte){const a=P.acao,s=ZHIT&&ZHIT.k==='golpe'&&a&&a.arma;const r=_fz.apply(this,arguments);
  if(s&&s.up&&z&&z.vivo&&!z.lan){const chefe=z.chefe||z.chefeR||z.tipo==='colosso';
    if(s.up.eletro&&Math.random()<0.35){faiscas(z.x,z.y+1.1,z.z);faiscas(z.x,z.y+0.7,z.z);sfx('estalo',z.x,z.z,0.8);z.flash=0.3;if(!chefe&&z.st!=='derrubado'&&z.st!=='morrendo'){z.st='atordoado';z.t=Math.max(z.t||0,1.5);}}
    if(s.up.brasa&&Math.random()<0.3&&typeof acender==='function')acender(z,4);}
  return r;};}
