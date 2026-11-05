/* ================= cidade ampliada: bairros, casas, posto, praça, estacionamento, pátio industrial e os prédios novos =================
   Os 6 prédios da área de teste continuam nos mesmos índices (0 a 5); os novos entram depois. */
const BAIRROS=[
  {nome:'Bairro Residencial Sul',x0:172,x1:305,z0:-84,z1:-44,risco:0.75,desc:'Bairro Residencial Sul: casas de um e dois andares, padaria e praça. Menos zumbis, saque mais miúdo.'},
  {nome:'Bairro Residencial Norte',x0:172,x1:305,z0:58,z1:94,risco:0.75,desc:'Bairro Residencial Norte: casas, uma mercearia e um estacionamento cheio de carros largados.'},
  {nome:'Distrito Industrial',x0:305,x1:336,z0:-84,z1:94,risco:1.25,desc:'Distrito Industrial: galpões com material de construção em quantidade. À noite é o pior lugar da cidade.'},
  {nome:'Entrada da cidade',x0:172,x1:205,z0:-44,z1:58,risco:0.9,desc:'Entrada da cidade: posto com loja, oficina e uma boca do metrô.'},
  {nome:'Centro',x0:205,x1:305,z0:-44,z1:58,risco:1.0,desc:'Centro: prédios altos, hotel, torre, hospital e delegacia. Muito saque, muito risco.'}];
function bairroEm(x,z){if(!dentroCidade(x,z,0))return null;for(const b of BAIRROS)if(x>=b.x0&&x<b.x1&&z>=b.z0&&z<b.z1)return b;return null;}

/* ---------- prédios novos (centro, entrada, indústria) e casas ---------- */
CID_LISTA.push(
  {nome:'Hotel Imperial',tipo:'hotel',x0:263,x1:281,z0:19,z1:41,frente:'S',andares:6,esconderijo:4,
   desc:'Hotel Imperial: 6 andares de quartos com malas esquecidas. Na suíte do último andar tem cofre. Os elevadores pararam no meio.'},
  {nome:'Torre Atlântica',tipo:'escritorio',x0:285,x1:297,z0:19,z1:33,frente:'S',andares:8,cobertura:true,cores:[0x5d6b78,0xc9ccc8,0x6d6f6c,0x26323c],
   desc:'Torre Atlântica: 8 andares de escritórios e uma cobertura de luxo lá no alto. É o prédio mais alto da cidade.'},
  {nome:'Delegacia do 4º Distrito',tipo:'policia',x0:263,x1:279,z0:-36,z1:-20,frente:'N',andares:2,risco:true,
   desc:'Delegacia: ALTO RISCO. O arsenal fica trancado (a chave estava com o delegado, no 1º andar). Tem gente presa nas celas até hoje.'},
  {nome:'Farmácia Popular',tipo:'farmacia',x0:285,x1:297,z0:-36,z1:-26,frente:'N',andares:1,placa:'FARMACIA',
   desc:'Farmácia Popular: remédios nas prateleiras; o estoque dos fundos está trancado e a porta de trás tem alarme.'},
  {nome:'Posto Avenida — loja',tipo:'conveniencia',x0:174,x1:186,z0:-34,z1:-24,frente:'N',andares:1,placa:'LOJA',
   desc:'Loja do posto: comida de prateleira e bebida. A bomba manual do posto ainda tira um galão por dia.'},
  {nome:'Armazém Sul',tipo:'armazem',x0:313,x1:334,z0:-33,z1:-15,frente:'N',andares:1,placa:'ARMAZEM',
   desc:'Armazém: prateleiras de material de construção. A porta dos fundos tem alarme.'},
  {nome:'Armazém Norte',tipo:'armazem',x0:313,x1:334,z0:19,z1:37,frente:'S',andares:1,placa:'ARMAZEM',
   desc:'Armazém: prateleiras de material de construção. A porta dos fundos tem alarme.'},
  {nome:'Padaria Pão Dourado',tipo:'padaria',x0:237,x1:248,z0:-63.5,z1:-53.5,frente:'N',andares:1,placa:'PADARIA'},
  {nome:'Mercearia do Bairro',tipo:'conveniencia',x0:237,x1:248,z0:80,z1:90,frente:'N',andares:1,placa:'MERCEARIA'});
/* casas: [x0,x1,z0,z1,frente,andares,rua,número] */
const CASAS=[
  [174,183,-63.5,-53.5,'N',2,'Rua das Acácias',12],[187,196,-63.5,-53.5,'N',1,'Rua das Acácias',18],[174,183,-77,-67,'S',1,'Rua das Acácias',13],[187,196,-77,-67,'S',2,'Rua das Acácias',19],
  [213.5,222.5,-63.5,-53.5,'N',1,'Rua das Acácias',30],[226,235,-63.5,-53.5,'N',2,'Rua das Acácias',36],[213.5,222.5,-77,-67,'S',2,'Rua das Acácias',31],[226,235,-77,-67,'S',1,'Rua das Acácias',37],[238,247,-77,-67,'S',2,'Rua das Acácias',41],
  [174,183,67.5,77.5,'S',1,'Rua dos Ipês',5],[187,196,67.5,77.5,'S',2,'Rua dos Ipês',11],[174,183,80,89,'N',2,'Rua dos Ipês',6],[187,196,80,89,'N',1,'Rua dos Ipês',10],
  [213.5,222.5,67.5,77.5,'S',2,'Rua dos Ipês',23],[226,235,67.5,77.5,'S',1,'Rua dos Ipês',29],[238.5,247.5,67.5,77.5,'S',2,'Rua dos Ipês',35],[213.5,222.5,80,89,'N',1,'Rua dos Ipês',24],[226,235,80,89,'N',2,'Rua dos Ipês',30]];
const CASAS_PORAO=new Set([18,36,11,24]);
for(const[x0,x1,z0,z1,frente,andares,rua,num]of CASAS)CID_LISTA.push({nome:'Casa nº '+num+' ('+rua+')',tipo:'casa',casa:true,x0,x1,z0,z1,frente,andares,H:2.9,temPorao:CASAS_PORAO.has(num)});

/* ---------- casa de 1 ou 2 andares ----------
   Térreo: sala na frente (com a escada encostada na parede direita, se tiver 2 andares), cozinha e quarto/lavabo nos fundos.
   2º andar: dois quartos e um corredor ao lado da escada. Telhado de duas águas (só desenho), quintal com mureta baixa (passa por cima). */
function predioCasa(p){const YQ=p.yq??QUADRA_Y,W=p.W,D=p.D,E=0.2,I=0.1,n=p.andares,C=p.cores||CID_COR.casa,cF=C[0],cI=C[1],cP=C[2],cT=C[3],dois=n>1,vM=dois?D*0.62:D*0.55;p.uc=W/2;
  const R=rng(7000+p.id*13);const esc=dois?{u0:W-E-1.05,u1:W-E,v0:1.1,v1:vM-1.0}:null;if(esc)p.vedado=[[esc.u0-0.25,esc.u1,esc.v0-1.1,esc.v1+0.7]];
  // pisos e forro (o 2º andar tem o vão da escada)
  const hp=p.temPorao?{u0:W*0.55-1.25,u1:W*0.55-0.35,v0:D-E-0.95,v1:D-E-0.05}:null;   // alçapão do porão no canto da cozinha, encostado na parede dos fundos
  if(hp)p.vedado=(p.vedado||[]).concat([[hp.u0-0.3,hp.u1+0.3,hp.v0-0.8,hp.v1]]);
  for(let f=0;f<=n;f++){const y=p.y0+f*p.H,yb=f===0?YQ:y-0.2;
    const lajes=f>0&&f<n&&esc?[[0,esc.u0,0,D],[esc.u0,W,0,esc.v0],[esc.u0,W,esc.v1,D]]:f===0&&hp?[[0,W,0,hp.v0],[0,W,hp.v1,D],[0,hp.u0,hp.v0,hp.v1],[hp.u1,W,hp.v0,hp.v1]]:[[0,W,0,D]];
    for(const r of lajes){if(f<n)retL(p,r[0],r[1],r[2],r[3],y);peca(p,r[0],r[1],yb,y,r[2],r[3],f===n?cI:cP,0.62);if(f>0)peca(p,r[0],r[1],y-0.22,y-0.2,r[2],r[3],cI,0.62);}}
  const yT=p.y0+n*p.H,ya=p.y0,yb0=ya+p.H;
  // salas do térreo
  const sala=salaNova(p,0,E,W-E,E,vM,'sala_casa'),coz=salaNova(p,0,E,W*0.55,vM,D-E,'cozinha_casa'),fundo=salaNova(p,0,W*0.55,W-E,vM,D-E,dois?'lavabo':'quarto');
  // portas: frente, fundos, internas
  const uF=W*0.33,oF=portaNova(p,0,'u',E/2,uF-0.5,uF+0.5,'fora',sala,'madeira',R()<0.4?'trancada':'fechada');
  const fora=noNovo(...pw(p,uF,-1.6).flatMap((v,i)=>i?[YQ,v]:[v]),'fora',{entrada:p});ligar(fora,oF.porta.nA,0.5);oF.porta.nA.sala='fora';p.entradas=[fora];ligar(sala.no,oF.porta.nB);
  const uB=W*0.25,oB=portaNova(p,0,'u',D-E/2,uB-0.45,uB+0.45,coz,'fora','madeira',R()<0.5?'trancada':'fechada');
  const fb=noNovo(...pw(p,uB,D+1.6).flatMap((v,i)=>i?[YQ,v]:[v]),'fora',{entrada:p});ligar(fb,oB.porta.nB,0.5);oB.porta.nB.sala='fora';p.entradas.push(fb);
  const o1=portaNova(p,0,'u',vM,W*0.25-0.45,W*0.25+0.45,sala,coz,'madeira',R()<0.6?'aberta':'fechada'),o2=portaNova(p,0,'u',vM,W*0.72-0.42,W*0.72+0.42,sala,fundo,'madeira',R()<0.5?'aberta':'fechada');
  // janelas e paredes do térreo
  const jf=janelasEm(E+0.4,uF-0.8,ya).concat(janelasEm(uF+0.8,W-E-0.4,ya)),jb=janelasEm(uB+0.8,W-E-0.4,ya),jl=janelasEm(E+0.6,D-E-0.6,ya),jr=dois?janelasEm(esc.v1+0.4,D-E-0.6,ya):janelasEm(E+0.6,D-E-0.6,ya);
  regJanelas(p,0,'u',E/2,-1,jf);regJanelas(p,0,'u',D-E/2,1,jb);regJanelas(p,0,'v',E/2,-1,jl);regJanelas(p,0,'v',W-E/2,1,jr);
  paredeL(p,'u',E/2,0,W,E,ya,yb0,[oF,...jf],cI,0.62,-1,cF);paredeL(p,'u',D-E/2,0,W,E,ya,yb0,[oB,...jb],cI,0.62,1,cF);
  paredeL(p,'v',E/2,E,D-E,E,ya,yb0,jl,cI,0.62,-1,cF);paredeL(p,'v',W-E/2,E,D-E,E,ya,yb0,jr,cI,0.62,1,cF);
  paredeL(p,'u',vM,E,W-E,I,ya,yb0,[o1,o2],cI,0.62);paredeL(p,'v',W*0.55,vM,D-E,I,ya,yb0,[],cI,0.62);
  if(dois){const y1=yb0;
    // escada reta: rampa, degraus, bloqueio embaixo da parte alta, corrimão
    ramL(p,esc.u0+0.04,esc.u1,esc.v0,esc.v1,ya,y1);const nd=12,L=esc.v1-esc.v0;
    for(let i=0;i<nd;i++){const v0=esc.v0+i*L/nd,h=ya+(i+1)*(y1-ya)/nd;peca(p,esc.u0+0.04,esc.u1,h-0.06,h,v0,v0+L/nd,0x8d7a62,0.62);peca(p,esc.u0+0.04,esc.u1,ya,h-0.06,v0,v0+L/nd,cI,0.62);}
    for(let v=esc.v0+1.2;v<esc.v1-0.05;v+=0.5){const yr=ya+(v-esc.v0)/L*(y1-ya);boxL(p,esc.u0+0.04,esc.u1,v,Math.min(esc.v1,v+0.5),ya,yr-0.35,{sobEscada:true});}   // bem abaixo da rampa: quem sobe não esbarra
    peca(p,esc.u0,esc.u0+0.05,ya+0.9,ya+0.95,esc.v0,esc.v1,0x5a3a2a,0.62);
    // 2º andar: corredor ao lado da escada, quarto da frente e quarto dos fundos
    const cor=salaNova(p,1,esc.u0,W-E,esc.v1,D-E,'corredor'),q1=salaNova(p,1,E,esc.u0,E,vM,'quarto'),q2=salaNova(p,1,E,esc.u0,vM,D-E,'quarto');cor.fragil=q1.fragil=q2.fragil=true;   // assoalho de madeira
    const p1=portaNova(p,1,'v',esc.u0,esc.v1+0.15,esc.v1+0.95,q1,cor,'madeira',R()<0.5?'aberta':'fechada');
    const p2=portaNova(p,1,'v',esc.u0,vM+0.4,vM+1.2,q2,cor,'madeira',R()<0.5?'aberta':'fechada');
    // nós da escada: pé no térreo, topo no corredor de cima
    const pe=noNovo(...pw(p,(esc.u0+esc.u1)/2,esc.v0-0.4).flatMap((v,i)=>i?[ya,v]:[v]),sala),topo=noNovo(...pw(p,(esc.u0+esc.u1)/2,esc.v1+0.45).flatMap((v,i)=>i?[y1,v]:[v]),cor);
    ligar(pe,topo,L+4);ligar(sala.no,pe);ligar(topo,cor.no);ligar(p1.porta.nB,cor.no);ligar(p2.porta.nB,cor.no);
    const j2f=janelasEm(E+0.4,esc.u0-0.3,y1,1.0),j2b=janelasEm(E+0.4,esc.u0-0.3,y1,1.0),j2l=janelasEm(E+0.6,D-E-0.6,y1),j2r=janelasEm(esc.v1+0.3,D-E-0.4,y1,0.9);
    regJanelas(p,1,'u',E/2,-1,j2f);regJanelas(p,1,'u',D-E/2,1,j2b);regJanelas(p,1,'v',E/2,-1,j2l);regJanelas(p,1,'v',W-E/2,1,j2r);
    paredeL(p,'u',E/2,0,W,E,y1,yT,j2f,cI,0.62,-1,cF);paredeL(p,'u',D-E/2,0,W,E,y1,yT,j2b,cI,0.62,1,cF);
    paredeL(p,'v',E/2,E,D-E,E,y1,yT,j2l,cI,0.62,-1,cF);paredeL(p,'v',W-E/2,E,D-E,E,y1,yT,j2r,cI,0.62,1,cF);
    paredeL(p,'v',esc.u0,E,D-E,I,y1,yT,[p1,p2],cI,0.62);paredeL(p,'u',vM,E,esc.u0,I,y1,yT,[],cI,0.62);
    // mureta na beira do vão da escada (lado de cima)
    boxL(p,esc.u0,esc.u1,esc.v0-0.06,esc.v0,y1,y1+1.0);peca(p,esc.u0,esc.u1,y1,y1+1.0,esc.v0-0.06,esc.v0,0x5a3a2a,0.62);}
  if(hp)poraoMontar(p,hp,coz);
  // telhado de duas águas (cumeeira paralela à fachada) e oitões em degraus
  {const hr=1.5,run=D/2+0.45,th=Math.atan2(hr,run),L=Math.hypot(run,hr);
    peca(p,-0.4,W+0.4,yT+hr/2-0.06,yT+hr/2+0.06,(-0.45+D/2)/2-L/2,(-0.45+D/2)/2+L/2,cT,0,0,0,-th);
    peca(p,-0.4,W+0.4,yT+hr/2-0.06,yT+hr/2+0.06,(D/2+D+0.45)/2-L/2,(D/2+D+0.45)/2+L/2,cT,0,0,0,th);
    for(let k=0;k<10;k++){const hw=Math.max(0.04,(D/2+0.45)*(1-(k+1)/10)-0.1);for(const[a,b]of[[0,0.2],[W-0.2,W]])peca(p,a,b,yT+k*hr/10,yT+(k+1)*hr/10,D/2-hw,D/2+hw,cF,0);}
    peca(p,-0.4,W+0.4,yT+hr-0.02,yT+hr+0.1,D/2-0.12,D/2+0.12,0x5a3a2a,0);}
  // faixa da base, soleira e caminho até o portão; quintal com mureta baixa (dá para passar por cima)
  peca(p,-0.04,W+0.04,YQ-(p.rural?0.6:0),ya+0.5,-0.04,D+0.04,p.corBase??0x7a6e5e,0);peca(p,uF-0.6,uF+0.6,YQ,YQ+0.01,-(p.frenteQ??3.0),0,0x8a877e,0);if(R()<0.6)trepadeiras(p);
  {const mg=p.margem??1.4,qu0=-mg,qu1=W+mg,qv0=-(p.frenteQ??3.0),qv1=D+(p.fundoQ??1.6),h=p.alturaMureta??0.45,yb=YQ,cerca=p.corMureta??0xd8d0c0,gu0=uF-0.7,gu1=uF+0.7;p.uF=uF;p.uB=uB;
    const mureta=(u0,u1,v0,v1)=>{retL(p,u0,u1,v0,v1,yb+h);peca(p,u0,u1,yb,yb+h,v0,v1,cerca,0);};
    if(!p.semMureta){mureta(qu0,gu0,qv0-0.08,qv0+0.08);mureta(gu1,qu1,qv0-0.08,qv0+0.08);mureta(qu0,qu1,qv1-0.08,qv1+0.08);mureta(qu0-0.08,qu0+0.08,qv0,qv1);mureta(qu1-0.08,qu1+0.08,qv0,qv1);}
    p.quintal=[qu0,qu1,qv0,qv1];}}

/* ---------- posto de combustível: cobertura, duas ilhas de bomba e a bomba manual que ainda funciona ---------- */
function gerarPosto(){const P=CID.props,x0=174.5,x1=188.5,z0=-16,z1=-7,y=QUADRA_Y;CID.bombas=[];
  P.push({k:'cobertura',x0,x1,z0,z1,h:4.6,cor:0xd94a1a});for(const[x,z]of[[x0+0.6,z0+0.6],[x1-0.6,z0+0.6],[x0+0.6,z1-0.6],[x1-0.6,z1-0.6]])colCircle(x,z,0.22,{y0:-0.2,y1:4.6});
  for(const x of[178,185]){P.push({k:'ilha',x,z:(z0+z1)/2});colBox(x,(z0+z1)/2,0.5,1.6,0,{solid:true,y0:-0.2,y1:1.6});CID.bombas.push({id:CID.bombas.length,x:x+0.9,z:(z0+z1)/2,y,bx:x});}
  P.push({k:'placaPosto',x:x1+1.8,z:z1+1.0});colCircle(x1+1.8,z1+1.0,0.2,{y0:-0.2,y1:6});}

/* ---------- objetos de rua da cidade ampliada ---------- */
function gerarRua2(){const R=rng(4242),P=CID.props;
  const carro=(x,z,yaw,cor,aberto)=>{P.push({k:'carro',x,z,yaw,cor,aberto});colBox(x,z,0.95,2.15,yaw,{solid:true,y0:-0.2,y1:1.6,carro2:true});supAdd({t:'ret',x,z,hw:0.7,hd:1.05,yaw,y:1.6,dono:'carro'});
    if(aberto){const t=fwd(yaw,-2.75);CID.conts.push({id:'rc'+P.length,p:null,sala:null,tipo:'portaMalas',tabela:'carro',x:x+t[0],z:z+t[1],y:0,yaw,hw:0.8,hd:0.3,h:0.9,estado:'fechado',itens:null,t:0,rua:true});}};
  // viaturas na frente da delegacia, ambulância no hospital
  for(const[x,z,yaw]of[[266,-14,0.1],[271,-13,-0.15],[276,-15,0.05]]){P.push({k:'viatura',x,z,yaw});colBox(x,z,0.95,2.15,yaw,{solid:true,y0:-0.2,y1:1.7,carro2:true});supAdd({t:'ret',x,z,hw:0.7,hd:1.05,yaw,y:1.7,dono:'carro'});}
  P.push({k:'ambulancia',x:232,z:2.5,yaw:Math.PI/2+0.08});colBox(232,2.5,1.1,2.8,Math.PI/2+0.08,{solid:true,y0:-0.2,y1:2.6,carro2:true});supAdd({t:'ret',x:232,z:2.5,hw:0.95,hd:2.6,yaw:Math.PI/2+0.08,y:2.6,dono:'carro'});
  // estacionamento do bairro norte: fileiras de carros largados (alguns com porta-malas aberto)
  const cores=[0x6b6f74,0x2f3e5c,0x7a1f1a,0x8d8a80,0x3a4a3a,0xb0a690,0x2a2c2e,0x5a3a2c,0xd9d6cc];
  for(let i=0;i<7;i++)for(const z of[69,82]){if(R()<0.35)continue;carro(265+i*4.6,z,(z<75?0:Math.PI)+(R()-0.5)*0.15,cores[(i*3+(z>75?1:0))%cores.length],R()<0.4);}
  // pátio industrial: caminhões e contêineres empilhados
  for(const[x,z,yaw]of[[320,-8,0.05],[328,10,Math.PI/2],[318,44,-0.1]]){P.push({k:'caminhao',x,z,yaw,cor:[0x8a2a22,0x3d5a73,0xc9a227][P.length%3]});colBox(x,z,1.25,4.1,yaw,{solid:true,y0:-0.2,y1:3.2,carro2:true});}
  const cont=(x,z,yaw,nivel,cor)=>{P.push({k:'conteiner',x,z,yaw,nivel,cor});colBox(x,z,1.25,3.05,yaw,{solid:true,y0:-0.2+nivel*2.6,y1:2.6+nivel*2.6});supAdd({t:'ret',x,z,hw:1.25,hd:3.05,yaw,y:2.6+nivel*2.6,dono:'conteiner'});};
  const cc=[0x2e6a8a,0x8a3a2a,0x3a6a3a,0xc98a27,0x6a6a6a];
  for(let i=0;i<4;i++){cont(316+i*3.2,-62,0,0,cc[i%5]);if(i%2===0)cont(316+i*3.2,-62,0,1,cc[(i+2)%5]);}
  for(let i=0;i<3;i++)cont(318+i*3.2,-72,0,0,cc[(i+1)%5]);for(let i=0;i<4;i++){cont(316+i*3.2,72,0,0,cc[(i+3)%5]);if(i===1)cont(316+i*3.2,72,0,1,cc[4]);}
  // caixa d'água elevada no distrito industrial (marco que se vê de longe)
  P.push({k:'caixaDagua',x:326,z:46});for(const[dx,dz]of[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])colCircle(326+dx,46+dz,0.2,{y0:-0.2,y1:14});
  // semáforos apagados nos cruzamentos e outdoors na avenida
  for(const e of RUAS_EW)for(const n of RUAS_NS){P.push({k:'semaforo',x:n.x+n.a+0.6,z:e.z+e.a+0.6,yaw:Math.PI});colCircle(n.x+n.a+0.6,e.z+e.a+0.6,0.12,{y0:-0.2,y1:5});}
  for(const[x,z,yaw]of[[248,-0.6,0],[299.5,16.5,Math.PI]]){P.push({k:'outdoor',x,z,yaw});for(const s of[-2.5,2.5])colCircle(x+Math.cos(yaw)*s,z-Math.sin(yaw)*s,0.15,{y0:-0.2,y1:4});}
  // praça do bairro sul: árvores, bancos, coreto e chafariz seco
  for(let i=0;i<14;i++){const x=264+R()*32,z=-76+R()*23;if(Math.hypot(x-280,z-64)<6)continue;P.push({k:'arvore',x,z,s:0.8+R()*0.5,seed:R()});colCircle(x,z,0.3,{y0:-0.2,y1:6,tree:true});}
  for(const[x,z,yaw]of[[274,-60,0],[286,-60,0],[274,-68,Math.PI],[286,-68,Math.PI],[280,-55,Math.PI/2]]){P.push({k:'banco',x,z,yaw});colBox(x,z,0.8,0.25,yaw,{solid:true,y0:-0.2,y1:0.8});}
  P.push({k:'chafariz',x:280,z:-64});colCircle(280,-64,2.2,{y0:-0.2,y1:0.6});
  // mais entulho fechando trechos (força caminho alternativo) e lixeiras
  for(const[x,z,r]of[[305,-20,1.6],[307,-17,1.2],[205,-60,1.4],[255,70,1.5],[258,74,1.1]]){P.push({k:'entulho',x,z,r,seed:R()});colCircle(x,z,r*0.8,{entulho:true,y0:-0.3,y1:1.4+r*0.3});}
  for(let i=0;i<10;i++){const x=180+R()*150,z=-70+R()*150;const q=quadraEm(x,z);if(!q||CID.predios.some(p=>x>p.x0-1.5&&x<p.x1+1.5&&z>p.z0-3.5&&z<p.z1+2)||pointBlocked(x,z,0.6))continue;P.push({k:'lixeira',x,z});colCircle(x,z,0.3,{y0:-0.2,y1:0.9});}}

/* ---------- tipos de lote (cor do chão do quarteirão) ---------- */
function tiposDeLote(){for(const q of CID.quadras){const cx=(q.x0+q.x1)/2,cz=(q.z0+q.z1)/2;
  q.tipoLote=cz<-44||cz>58?(cx>259&&cx<301?(cz<0?'praca':'estacionamento'):(cx>305?'patio':'quintal')):cx>305?'patio':'predio';}}

/* ---------- porão embaixo da cozinha: alçapão de madeira no piso, escada de mão, escuro total, caixa guardada (e às vezes um deles) ---------- */
function poraoMontar(p,hp,coz){const W=p.W,D=p.D,E=0.2,yC=p.y0-2.6,u0=E,u1=W*0.55,v0=p.D*0.55+0.2,v1=D-E,yt=p.y0-0.2;
  const sala={id:CID.salas.length,p,f:0,u0,u1,v0,v1,y:yC,tipo:'porao',nome:'porão',x:0,z:0,conts:[],escura:0.97,porao:true};const c=pw(p,(u0+u1)/2,(v0+v1)/2);sala.x=c[0];sala.z=c[1];CID.salas.push(sala);
  retL(p,u0,u1,v0,v1,yC);peca(p,u0,u1,yC-0.15,yC,v0,v1,0x4a463e,0.97);
  for(const q of[[u0-0.15,u0,v0-0.15,v1+0.15],[u1,u1+0.15,v0-0.15,v1+0.15],[u0,u1,v0-0.15,v0],[u0,u1,v1,v1+0.15]]){peca(p,q[0],q[1],yC-0.15,yt,q[2],q[3],0x5a564c,0.97);boxL(p,q[0],q[1],q[2],q[3],yC-0.3,p.y0);}
  {const a=pw(p,hp.u0,hp.v0),b=pw(p,hp.u1,hp.v1);BURACOS.push({x0:Math.min(a[0],b[0]),x1:Math.max(a[0],b[0]),z0:Math.min(a[1],b[1]),z1:Math.max(a[1],b[1])});
    const a2=pw(p,u0,v0),b2=pw(p,u1,v1);BURACOS.push({x0:Math.min(a2[0],b2[0]),x1:Math.max(a2[0],b2[0]),z0:Math.min(a2[1],b2[1]),z1:Math.max(a2[1],b2[1]),porao:true});}
  // prateleira velha, sacos e a caixa guardada
  peca(p,u0+0.1,u0+0.5,yC,yC+1.6,v0+0.3,v1-0.3,0x5a3a2a,0.97);for(let k=0;k<3;k++)peca(p,u0+0.12,u0+0.48,yC+0.4+k*0.5,yC+0.43+k*0.5,v0+0.35,v1-0.35,0x6b4e30,0.97);
  const cx=contExtra(p,sala,'caixas','porao',u1-0.75,v0+0.7,yC,0,'po');
  // escada de mão do porão até a cozinha, embaixo do alçapão
  const hu=(hp.u0+hp.u1)/2,hv=(hp.v0+hp.v1)/2,wv=pw(p,hu,hp.v1-0.25),b=pw(p,hu,hp.v0-0.35),t=pw(p,hu,hp.v0-0.5);
  const via=viaReta(wv[0],wv[1],yC,p.y0,p.yaw,{x:b[0],y:yC,z:b[1]},{x:t[0],y:p.y0,z:t[1],rumo:p.yaw+Math.PI},p);via.tipo='escada';via.recolhida=true;VIAS.push(via);
  for(const uu of[hu-0.22,hu+0.22])peca(p,uu-0.025,uu+0.025,yC,p.y0+0.5,hp.v1-0.08,hp.v1-0.03,0x5a3a2a,0.97);for(let y=yC+0.3;y<p.y0;y+=0.32)peca(p,hu-0.22,hu+0.22,y-0.02,y+0.02,hp.v1-0.08,hp.v1-0.03,0x6b4e30,0.97);
  const hc=pw(p,hu,hv);const ab={id:CID.poroes.length,p,x:hc[0],z:hc[1],y:p.y0,u:hu,v:hv,aberto:false,via,sala,cont:cx,r:[hp.u0,hp.v0,hp.u1,hp.v1]};
  ab.sup=retL(p,hp.u0,hp.u1,hp.v0,hp.v1,p.y0);CID.poroes.push(ab);p.porao=ab;}
