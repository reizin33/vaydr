/* ================= Carcaças: ônibus, caminhões e ambulância (v10.2.6, 17/11/2026) =================
   Himalaia: "a cidade está muito quadrada, as coisas, os veículos... torne o ambiente mais pós-apocalíptico de cidade destruída
   mesmo". Os carros já viraram a carcaça escaneada (62yf); o ônibus, os caminhões e a ambulância eram caixas pintadas. Agora
   são carcaças montadas peça por peça, com a lataria gasta (textura de pintura com escorridos de ferrugem, 62zf):
   · ônibus queimado: sem pneus (assentou nos aros), sem vidros, colunas tortas, a porta caída, o teto cedendo e furado pelo
     fogo (os arcos aparecem), o esqueleto dos bancos lá dentro, cinza no chão, fuligem e um resto da tinta amarela embaixo;
   · caminhão baú: cabine com para-brisa inclinado e quebrado, grade, para-lamas, retrovisores, baú com nervuras e a porta de
     trás aberta (o escuro lá dentro); a cor da cabine continua a de cada um (vermelho, azul, amarelo);
   · ambulância: furgão branco sujo com a faixa vermelha, giroflex quebrado, as duas portas de trás abertas e a maca caída.
   A colisão e o piso continuam os de antes (14_cidade, 14b_cidade2): só o desenho muda. Uma malha por tipo, desenhada pelo
   mesmo caminho dos objetos da rua (PRP.rua, 'G:tipo'), com sombra. Sem a textura, fica só a cor. */
const CARC={geo:{}};
function carcGB(seed){const g=new GB(1<<13,8),R=rng(seed);return{g,R,A:(t,m,c,o)=>add(g,t,m,c,Object.assign({j:0.1,rnd:R},o||{}))};}
/* roda deitada no eixo x (cylTris sobe em y; girada vai de x0-h a x0): centro em (x, y, z) */
function carcRoda(A,x,y,z,r,h,c,seg){A(cylTris(r,r,h,seg||12),mat(x+h/2,y,z,0,0,Math.PI/2),c);}
CARC.geo.onibus=function(){const{g,R,A}=carcGB(4401);
  const fuligem=lin(0x15120f),queimado=lin(0x4a3b30),ferrugem=lin(0x7a4628),ferrugem2=lin(0x93603a),cinza=lin(0x8c877e),tinta=lin(0xa98a3a),aro=lin(0x5b5650),banco=lin(0x2b2621);
  const casca=()=>{const r=R();return r<0.35?queimado:r<0.65?ferrugem:r<0.85?ferrugem2:cinza;};
  /* aros sem pneu: o ônibus assentou */
  for(const wz of[3.6,-3.8])for(const s of[-1,1]){carcRoda(A,s*1.05,0.42,wz,0.42,0.22,aro);carcRoda(A,s*1.08,0.42,wz,0.16,0.26,fuligem,8);}
  for(const s of[-1,1])A(boxTris(0.16,0.22,10.6),mat(s*0.55,0.6,0),fuligem);   // longarinas
  A(boxTris(2.44,0.1,11.3),mat(0,0.78,0),cinza);   // piso com cinza
  /* laterais: a faixa de baixo das janelas e a saia com os vãos das rodas; do lado direito, o vão da porta da frente */
  for(const s of[-1,1]){const x=s*1.235;
    if(s>0){A(boxTris(0.05,0.62,10.0),mat(x,1.29,-0.75),casca());A(boxTris(0.05,0.62,0.5),mat(x,1.29,5.5),casca());}
    else A(boxTris(0.05,0.62,11.5),mat(x,1.29,0),casca());
    for(const[z0,z1]of[[-5.75,-4.45],[-3.15,2.95],[4.25,5.75]]){if(s>0&&z0>4){A(boxTris(0.05,0.5,0.5),mat(x,0.73,5.5),tinta);continue;}
      A(boxTris(0.05,0.5,z1-z0),mat(x,0.73,(z0+z1)/2),z0<-5?mixc(tinta,queimado,0.3):casca());}
    /* colunas das janelas (uma ou outra caída, algumas tortas pelo calor) */
    for(let z=-5.3;z<=5.0;z+=1.17){if(s>0&&z>4.1)continue;const t=R();if(t<0.08)continue;
      A(boxTris(0.07,0.98,0.1),mat(x,2.09,z,(R()-0.5)*0.12,0,s*(R()<0.25?0.12+R()*0.15:0)),t<0.5?fuligem:queimado);}
    A(boxTris(0.08,0.07,11.5),mat(x,1.62,0),queimado);   // friso da janela
    A(boxTris(0.09,0.14,11.5),mat(x,2.6,0),fuligem);     // calha de cima, preta da fumaça
    for(let i=0;i<5;i++){const z=-5+R()*10;A(boxTris(0.02,0.3+R()*0.35,0.4+R()*0.8),mat(x+s*0.03,1.2+R()*0.3,z),R()<0.5?ferrugem2:cinza);}}   // descascados
  A(boxTris(0.04,1.7,0.5),mat(1.46,0.92,4.8,0,0.55,0.22),queimado);   // a porta, caída para fora
  /* teto cedendo no meio, com um pedaço queimado de fora a fora (aparecem os arcos) */
  const N=6,L=11.5/N;
  for(let k=0;k<N;k++){const zc=-5.75+(k+0.5)*L,y=2.69-0.2*Math.sin(Math.PI*(k+0.5)/N),dy=-0.2*Math.PI/11.5*Math.cos(Math.PI*(k+0.5)/N);
    if(k===3){A(boxTris(2.3,0.04,0.8),mat(0.1,y-0.22,zc-0.45,0.55,0.1,0.06),queimado);continue;}   // pedaço pendurado para dentro
    A(boxTris(2.5,0.06,L+0.02),mat(0,y,zc,-Math.atan(dy),0,(R()-0.5)*0.03),k%2?queimado:ferrugem);}
  for(let z=-5.2;z<=5.2;z+=1.17)A(boxTris(2.4,0.05,0.06),mat(0,2.6-0.2*Math.sin(Math.PI*(z+5.75)/11.5),z),fuligem);   // arcos do teto
  /* frente e traseira */
  A(boxTris(2.5,0.95,0.08),mat(0,1.18,5.76),mixc(tinta,queimado,0.35));
  A(boxTris(2.56,0.24,0.2),mat(0,0.66,5.85),fuligem);   // para-choque
  for(const s of[-1,1])A(boxTris(0.3,0.18,0.04),mat(s*0.85,0.98,5.81),fuligem);   // faróis vazios
  for(const x of[-1.22,0,1.22])A(boxTris(0.09,1.0,0.09),mat(x,2.1,5.76,0,0,x?0:0.06),x?queimado:fuligem);   // colunas do para-brisa
  A(boxTris(2.5,0.3,0.1),mat(0,2.5,5.75),fuligem);   // letreiro
  A(boxTris(2.5,1.75,0.08),mat(0,1.45,-5.76),casca());A(boxTris(2.5,0.35,0.1),mat(0,2.5,-5.76),fuligem);
  for(let i=0;i<5;i++)A(boxTris(1.6,0.05,0.03),mat(0,0.9+i*0.12,-5.81),fuligem);   // grade do motor
  /* lá dentro: o aço dos bancos e montes de cinza */
  for(let z=-4.6;z<=3.9;z+=0.92)for(const s of[-1,1]){const x=s*0.62;if(R()<0.12)continue;
    A(boxTris(0.86,0.05,0.42),mat(x,1.22,z),banco);A(boxTris(0.86,0.52,0.05),mat(x,1.5,z-0.22,-0.18+(R()-0.5)*0.3,0,0),banco);A(boxTris(0.05,0.4,0.05),mat(x-s*0.35,1.0,z),banco);}
  for(let i=0;i<9;i++)A(icoTris(0.18+R()*0.2,0.5,R),mat((R()-0.5)*1.6,0.86,(R()-0.5)*9,0,R()*6,0,1,0.35,1),mixc(cinza,fuligem,R()*0.5));
  /* a marca do fogo no asfalto: duas manchas irregulares (a de fora mais clara) */
  for(const[k,y,c]of[[1,0.045,lin(0x22201d)],[0.72,0.05,lin(0x0c0b0a)]]){const N=22,pt=[];for(let i=0;i<N;i++){const a=i/N*Math.PI*2,r=k*(0.85+R()*0.3);pt.push([Math.cos(a)*2.9*r,y,Math.sin(a)*7.6*r]);}
    const t=[];for(let i=0;i<N;i++)t.push([[0,y,0],pt[(i+1)%N],pt[i]]);A(t,mat(0,0,0),c,{j:0.25,rnd:R});}
  return g.data();};
CARC.geo.caminhao=function(v){const{g,R,A}=carcGB(5501+v*77);
  const cab=lin([0x7a2a22,0x34506a,0xb89a3a][v]||0x7a2a22),cab2=mixc(cab,lin(0x3a2a20),0.35),pneu=lin(0x121212),aro=lin(0x6a6660),chassi=lin(0x1d1b19),
    vidro=lin(0x0e1216),ferrugem=lin(0x7a4628),bau=lin(0xb3ada0),bau2=lin(0x9c968a),escuro=lin(0x0f0d0b),cromo=lin(0x77736c);
  for(const wz of[3.0,-0.6,-2.8])for(const s of[-1,1]){carcRoda(A,s*1.12,0.5,wz,0.5,0.34,pneu,14);carcRoda(A,s*1.13,0.5,wz,0.26,0.36,aro,10);}
  for(const s of[-1,1])A(boxTris(0.18,0.24,8.0),mat(s*0.5,0.62,0),chassi);   // longarinas
  /* cabine: a parte de baixo (portas), a de cima com a frente e o fundo inclinados, vidros quebrados (escuros) */
  A(bvTris(2.3,1.05,2.1),mat(0,1.28,3.0),cab);
  A(boxTris(2.24,0.95,1.7,{tz:0.78}),mat(0,2.28,2.86),cab2);
  A(boxTris(1.9,0.66,0.05),mat(0,2.26,3.645,-0.19,0,0),vidro);
  for(const s of[-1,1])A(boxTris(0.04,0.55,0.95),mat(s*1.13,2.32,2.9),vidro);
  A(boxTris(1.7,0.55,0.06),mat(0,1.25,4.07),escuro);for(let i=0;i<4;i++)A(boxTris(1.6,0.05,0.04),mat(0,1.05+i*0.14,4.11),cromo);   // grade
  A(bvTris(2.4,0.26,0.22),mat(0,0.72,4.12),chassi);   // para-choque
  for(const s of[-1,1]){A(boxTris(0.32,0.2,0.05),mat(s*0.85,1.25,4.08),escuro);   // farol quebrado
    A(bvTris(0.5,0.12,1.1),mat(s*1.05,1.05,3.0),cab2);   // para-lama
    A(boxTris(0.04,0.3,0.18),mat(s*1.33,2.3,3.55),chassi);A(boxTris(0.25,0.03,0.03),mat(s*1.2,2.3,3.55),chassi);}   // retrovisor
  for(let i=0;i<6;i++)A(boxTris(0.02,0.2+R()*0.4,0.2+R()*0.5),mat((R()<0.5?-1:1)*1.16,0.9+R()*0.7,2.2+R()*1.6),ferrugem);   // ferrugem
  /* baú: nervuras, quinas, a porta de trás da direita aberta e o fundo escuro */
  const bz=-1.2;A(boxTris(2.5,2.7,5.6),mat(0,2.15,bz),bau);
  for(const s of[-1,1])for(let i=0;i<=9;i++)A(boxTris(0.04,2.6,0.09),mat(s*1.265,2.15,bz-2.75+i*0.611),bau2);
  A(boxTris(2.56,0.1,5.66),mat(0,3.52,bz),bau2);A(boxTris(2.56,0.14,5.66),mat(0,0.82,bz),chassi);
  for(let i=0;i<5;i++)A(boxTris(0.02,0.4+R()*0.8,0.3+R()*0.9),mat((R()<0.5?-1:1)*1.29,1.3+R()*1.6,bz-2.2+R()*4.4),R()<0.6?ferrugem:mixc(bau,escuro,0.5));   // escorridos e manchas
  A(boxTris(2.36,2.5,0.02),mat(0,2.15,bz-2.81),escuro);
  A(boxTris(1.2,2.5,0.05),mat(-0.62,2.15,bz-2.84),bau2);
  A(boxTris(1.2,2.5,0.05),mm(mat(1.25,2.15,bz-2.84,0,-2.3,0),mat(-0.6,0,0)),bau2);
  return g.data();};
CARC.geo.ambulancia=function(){const{g,R,A}=carcGB(6601);
  const branco=lin(0xcfcac0),branco2=lin(0xb5b0a6),verm=lin(0x8a2a24),vidro=lin(0x0e1216),pneu=lin(0x121212),aro=lin(0x6a6660),escuro=lin(0x0f0d0b),
    chassi=lin(0x1d1b19),ferrugem=lin(0x7a4628),azul=lin(0x1f3a7a),maca=lin(0x6a3a2a);
  for(const wz of[1.8,-1.9])for(const s of[-1,1]){carcRoda(A,s*1.0,0.4,wz,0.4,0.28,pneu,14);carcRoda(A,s*1.01,0.4,wz,0.2,0.3,aro,10);}
  A(bvTris(2.1,2.0,3.7),mat(0,1.58,-1.05),branco);A(boxTris(2.12,0.24,3.72),mat(0,1.3,-1.05),verm);   // baú e a faixa
  A(bvTris(2.0,0.9,1.9),mat(0,1.0,1.7),branco2);   // capô e portas
  A(boxTris(1.96,0.75,1.25,{tz:0.62}),mat(0,1.82,1.32),branco);A(boxTris(1.75,0.55,0.05),mat(0,1.82,1.85,-0.31,0,0),vidro);
  for(const s of[-1,1])A(boxTris(0.04,0.45,0.6),mat(s*0.99,1.85,1.3),vidro);
  A(bvTris(2.1,0.22,0.2),mat(0,0.6,2.67),chassi);A(boxTris(1.4,0.35,0.05),mat(0,1.05,2.66),escuro);
  for(const s of[-1,1])A(boxTris(0.28,0.16,0.05),mat(s*0.75,1.15,2.66),escuro);
  /* giroflex quebrado: a base torta, um lado caído */
  A(boxTris(1.1,0.12,0.28),mat(0,2.26,1.25,0,0,0.08),chassi);A(boxTris(0.45,0.12,0.26),mat(-0.28,2.35,1.25,0,0,0.08),verm);A(boxTris(0.4,0.12,0.26),mat(0.36,2.36,1.25,0,0,0.3),azul);
  for(let i=0;i<7;i++){const s=R()<0.5?-1:1;A(boxTris(0.02,0.25+R()*0.6,0.25+R()*0.7),mat(s*1.06,0.9+R()*1.3,-2.6+R()*3.2),R()<0.6?ferrugem:mixc(branco,escuro,0.55));}   // ferrugem e sujeira
  /* portas de trás abertas, o fundo escuro e a maca caída para fora */
  A(boxTris(1.9,1.8,0.02),mat(0,1.6,-2.91),escuro);
  for(const s of[-1,1])A(boxTris(0.98,1.8,0.05),mm(mat(s*1.05,1.6,-2.93,0,-2*s,0),mat(-s*0.49,0,0)),branco2);
  A(boxTris(0.55,0.08,1.9),mat(0.1,0.52,-3.55,-0.44,0.12,0),maca);
  for(const z of[-0.7,0.7])A(boxTris(0.5,0.35,0.04),mm(mat(0.1,0.52,-3.55,-0.44,0.12,0),mat(0,-0.2,z)),chassi);
  return g.data();};
/* malha de cada tipo ('onibus', 'ambulancia', 'caminhao0'..'caminhao2'): partes por material, como os veículos (62zf) */
function carcMalha(nome){const m=/^([a-z]+)(\d*)$/.exec(nome),fn=m&&CARC.geo[m[1]];if(!fn)return null;const f=fn(+(m[2]||0));
  const c=typeof itxMalha==='function'&&typeof ITX_DADOS!=='undefined'?itxMalha('carc_'+m[1],f,0.5,true):null;
  return c?c.partes:[litMesh(f)];}
{const _pt=prpTem;prpTem=function(id){if(id&&id.startsWith('G:'))return!!CARC.geo[id.slice(2).replace(/\d+$/,'')];return _pt(id);};}
{const _pm=prpMalha;prpMalha=function(id){if(!id||!id.startsWith('G:'))return _pm(id);let X=PRP.m[id];if(X!==undefined)return X;
  try{const ps=carcMalha(id.slice(2));X=ps&&ps.length?{id,ps}:null;}catch(e){console.error('carcaça',id,e);X=null;}return PRP.m[id]=X;};}
{const _pr=prpRua;prpRua=function(o){if(o&&(o.k==='onibus'||o.k==='caminhao'||o.k==='ambulancia')&&prpOk()&&prpTem('G:'+o.k)){
    const y=quadraEm(o.x,o.z)?QUADRA_Y:0,v=o.k==='caminhao'?Math.max(0,[0x8a2a22,0x3d5a73,0xc9a227].indexOf(o.cor)):0;
    prpReg(PRP.rua,'G:'+o.k+(o.k==='caminhao'?v:''),o.x,y,o.z,o.yaw||0,[1,1,1],0,o.k==='caminhao'&&v===2?0.035:0,1,160);return true;}   // o amarelo com um pneu murcho
  return _pr(o);};}
