/* ================= Etapa 4 · passo 5: o portal do túnel da serra com as peças do kit (v10.2.7, 17/11/2026) =================
   Plano da etapa 4 (aprovado em 14/11/2026), passo 5. A frente de concreto do túnel do trem (48r_ferrovia: o portão que só abre
   por dentro, a linha que desce até a estação dos militares) ganha o que um túnel de serviço teria e o que ficou da saída:
   · na face: o quadro de luz com as caixinhas e o conduíte subindo até o alto, o extintor ao lado do portão, um respiro lá em
     cima, chapas rebitadas tapando o concreto quebrado e tábuas encostadas;
   · no chão, dos dois lados da linha: tambores com lona e a caçamba (com colisão); os muros de sacos de areia e as barreiras de
     concreto são os modelos da Base Militar (62u_lugares, 'pt_');
   · a linha continua livre: nada fica em cima dos trilhos nem na frente do portão.
   As peças entram como um grupo a mais do desenho do kit (62zc: some de longe, com sombra), montado quando a linha do trem já
   tem a altura do portal; refeito junto com a cidade. */
const KITP={feito:false,erro:null,n:0};
function kitPortal(){const F=FERRO.portal,yy=F.y,fx=F.x+0.05,pz=F.z,Y=Math.PI/2,R=rng(4242);
  const P0={nome:'Portal do túnel',yaw:0,ox:fx,oz:pz,c:1,s:0},ctx={p:P0,R,itens:[]};
  /* na face (de frente para +x, as costas da peça em x = fx): z é o ao longo da face, y a altura da base da peça */
  const face=(m,z,y,o,e,rz)=>{if(!KITX.pecas[m])return;ctx.itens.push({m,M:kitM(fx+(o||0),y,pz+z,Y,e||[1,1,1],0,rz||0),p:P0.nome,pp:P0});};
  face('quadroLuz',3.3,yy+1.0,0.01);face('caixaLuz',2.45,yy+1.3,0.01);face('caixaLuz',2.7,yy+1.42,0.01);face('extintor',2.3,yy+0.35,0.01);
  for(let i=0;i<3;i++){face('canoReto',3.9,yy+1.72+i*1.3,0.02);if(i)face('canoLuva',3.9,yy+1.72+i*1.3-0.17,0.02);}   // conduíte do quadro até o alto
  face('respiro',-3.4,yy+4.4,0.01);
  face('chapa',-3.3,yy+0.3,0.015,[1,1,1],0.04);face('chapa2',-3.0,yy+1.95,0.015,[1,1,1],-0.07);face('chapa',3.2,yy+3.0,0.015,[0.8,0.8,1],0.1);
  {const z=-2.95,y=ground(fx+0.4,pz+z);if(KITX.pecas.tabuas)ctx.itens.push({m:'tabuas',M:kitM(fx+0.42,y-0.02,pz+z,Y,[0.8,1.3,1],-0.24,0),p:P0.nome,pp:P0});}   // encostadas no concreto
  /* no chão, fora da linha (|z| > 3) */
  const chao=(m,u,v,gi,col)=>{const x=fx+u,z=pz+v;kitChao(ctx,m,u,v,ground(x,z)-0.04,gi,[1,1,1],col);};
  chao('tambores',2.7,4.3,0.25+R()*0.3,true);chao('lona',4.4,5.6,-0.4,true);chao('cacamba',3.3,-5.2,0.3,true);
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const it of ctx.itens){x0=Math.min(x0,it.M[12]);x1=Math.max(x1,it.M[12]);z0=Math.min(z0,it.M[14]);z1=Math.max(z1,it.M[14]);}
  KIT.itens.push(...ctx.itens);
  KIT.grupos.push({q:null,ps:new Set(),itens:ctx.itens,cabos:[],manchas:[],x0:x0-3,x1:x1+3,z0:z0-3,z1:z1+3,m:null,mp:null,mc:null,mm:null,portal:true});
  KITP.n=ctx.itens.length;}
PASSOS.push(function kitPortalPasso(){if(KITP.feito||!kitOk()||!KIT.on||typeof FERRO==='undefined'||!FERRO.portal||FERRO.portal.y===undefined)return;KITP.feito=true;
  try{kitPortal();}catch(e){KITP.erro=String(e);console.error('kit (portal do túnel)',e);}});
{const _gc=gerarCidade;gerarCidade=function(){KITP.feito=false;return _gc.apply(this,arguments);};}
