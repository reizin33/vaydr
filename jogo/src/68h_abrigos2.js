/* ================= Mais abrigos: Vila São José e Porto Velho (v10.8.4) =================
   Himalaia (19/11/2026): "faltam coisas para fazer, coisas que se conectam". A rede de abrigos cresce para quatro (Matriz,
   Sabiá, São José e Cais), cada um com o seu jeito de acender, e todos ligados pela viagem entre abrigos acesos:
   · Abrigo de São José: acampamento no largo da igreja da Vila, com gerador a gasolina (2 galões e 1 óleo de motor);
   · Abrigo do Cais: acampamento no cais do Porto Velho, aceso com uma bateria de veículo (1 bateria e 2 fios).
   O acampamento é o mesmo desenho do Sabiá, num sistema local (u para a direita, v para a frente aberta da lona). */
const ABR2={campos:[],malha:null};
/* monta um acampamento: o={id,nome,onde,x,z,y,yaw,custo,ligarT,ligarDica,luz:'gerador'|'bateria',r,ok} */
function acampNovo(o){const c=Math.cos(o.yaw),s=Math.sin(o.yaw),y=o.y,W=(u,v)=>[o.x+u*c+v*s,o.z-u*s+v*c],pt=(u,v,h)=>{const w=W(u,v);return{x:w[0],y:y+(h||0),z:w[1]};};
  const K={o,W,c,s,y,cama:pt(-1.1,-1.2),bau:pt(1.65,-1.85),banc:pt(-2.45,0.7),quadro:o.luz==='gerador'?pt(3.75,-1.2):pt(2.9,0.9),
    luzes:[[0.4,-0.1,1.9,false],[-2.9,2.55,2.55,true],[0,2.55,2.55,true],[2.9,2.55,2.55,true]].map(([u,v,h,poste],i)=>{const w=W(u,v);return{i,x:w[0],y:y+h,z:w[1],poste};})};
  K.abrigo=abrigoNovo({id:o.id,nome:o.nome,onde:o.onde,x:o.x,z:o.z,y,r:o.r||22,ok:o.ok,custo:o.custo,ligarT:o.ligarT,ligarDica:o.ligarDica,
    quadro:K.quadro,cama:K.cama,bau:K.bau,bancada:K.banc,luzes:K.luzes});
  /* colisão: baú, bancada e a máquina de luz */
  const yaw=o.yaw;colBox(K.bau.x,K.bau.z,0.5,0.32,yaw,{solid:true,y0:y-0.2,y1:y+0.62});colBox(K.banc.x,K.banc.z,0.32,0.9,yaw,{solid:true,y0:y-0.2,y1:y+0.92});
  if(o.luz==='gerador')colBox(K.quadro.x,K.quadro.z,0.45,0.32,yaw,{solid:true,y0:y-0.2,y1:y+0.8});else colBox(K.quadro.x,K.quadro.z,0.3,0.3,yaw,{solid:true,y0:y-0.2,y1:y+0.55});
  ABR2.campos.push(K);return K;}
function acampGeo(){const g=new GB(1<<14,8),R=rng(61991);
  for(const K of ABR2.campos){const{o,W,y}=K,yaw=o.yaw,M=mat(o.x,0,o.z,0,yaw,0),B=(u0,u1,y0,y1,v0,v1,cor,op)=>add(g,boxTris(u1-u0,y1-y0,v1-v0),mm(M,mat((u0+u1)/2,(y0+y1)/2,(v0+v1)/2)),lin(cor),op);
    /* lona: paus baixos atrás (v = -2,3) e altos na frente aberta (v = +2,3) */
    for(const[u,v,h]of[[-2.8,-2.3,1.95],[2.8,-2.3,1.95],[-2.8,2.3,2.35],[2.8,2.3,2.35]])B(u-0.04,u+0.04,y,y+h,v-0.04,v+0.04,0x6b4e30);
    {const a=-Math.atan2(0.4,4.6),len=Math.hypot(0.4,4.6);add(g,boxTris(5.9,0.03,len),mm(M,mat(0,y+2.17,0,a,0,0)),lin(o.lona||0x3d6b3a),{j:0.04,rnd:R});}
    /* colchão, cobertor e travesseiro (deitado ao longo de u) */
    const cu=-1.1,cv=-1.2;B(cu-1.0,cu+1.0,y,y+0.2,cv-0.45,cv+0.45,0x5a6a7a);B(cu-0.2,cu+1.02,y+0.2,y+0.27,cv-0.47,cv+0.47,0x8a4a3a);B(cu-0.95,cu-0.5,y+0.2,y+0.33,cv-0.3,cv+0.3,0xe8e2d4);
    /* baú */
    const bu=1.65,bv=-1.85;B(bu-0.45,bu+0.45,y,y+0.55,bv-0.3,bv+0.3,0x6b4e30);B(bu-0.48,bu+0.48,y+0.55,y+0.62,bv-0.32,bv+0.32,0x4a3424);B(bu-0.05,bu+0.05,y+0.35,y+0.5,bv+0.3,bv+0.33,0xc8a428);
    /* bancada com a morsa */
    const nu=-2.45,nv=0.7;B(nu-0.32,nu+0.32,y,y+0.9,nv-0.9,nv+0.9,0x7a5a3a);B(nu-0.36,nu+0.36,y+0.9,y+0.96,nv-0.95,nv+0.95,0x5a4028);B(nu-0.08,nu+0.08,y+0.96,y+1.1,nv+0.3,nv+0.55,0x3a4450);
    /* a máquina de luz: gerador (caixa amarela com tanque, escape e rodas) ou bateria de veículo num caixote */
    if(o.luz==='gerador'){const qu=3.75,qv=-1.2;B(qu-0.42,qu+0.42,y+0.12,y+0.62,qv-0.3,qv+0.3,0xc89a1e);B(qu-0.3,qu+0.1,y+0.62,y+0.74,qv-0.22,qv+0.22,0x8a6a14);
      B(qu+0.18,qu+0.26,y+0.62,y+0.9,qv+0.12,qv+0.2,0x3a3a3a);for(const sv of[-1,1])add(g,cylTris(0.11,0.11,0.06,8),mm(M,mat(qu-0.3,y+0.11,qv+sv*0.33,Math.PI/2,0,0)),lin(0x1a1a1a));
      B(qu-0.42,qu-0.36,y,y+0.12,qv-0.25,qv+0.25,0x3a3a3a);}
    else{const qu=2.9,qv=0.9;B(qu-0.3,qu+0.3,y,y+0.38,qv-0.3,qv+0.3,0x8a6a42);B(qu-0.17,qu+0.17,y+0.38,y+0.58,qv-0.12,qv+0.12,0x1e1e1e);
      for(const su of[-1,1])B(qu+su*0.1-0.025,qu+su*0.1+0.025,y+0.58,y+0.62,qv-0.025,qv+0.025,su<0?0xb3261e:0x2a2a2a);}
    /* fio da máquina até o varal e as lâmpadas */
    const q0=K.quadro;for(const q of K.luzes){if(q.poste)add(g,boxTris(0.07,2.75,0.07),mat(q.x,y+1.375,q.z),lin(0x4a4a46));else add(g,boxTris(0.012,y+2.17-q.y-0.06,0.012),mat(q.x,(q.y+0.06+y+2.17)/2,q.z),lin(0x151515));
      add(g,icoTris(0.09,0.05,R),mat(q.x,q.y,q.z),lin(0xf4e8c0),{e:0.6});}
    const fio=(a,b,ya,yb,cai)=>{const n=7;let px=a[0],py=ya,pz=a[1];for(let i=1;i<=n;i++){const t=i/n,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t),yy=lerp(ya,yb,t)-Math.sin(t*Math.PI)*cai;
        const dx=x-px,dy=yy-py,dz=z-pz,len=Math.hypot(dx,dy,dz);add(g,boxTris(0.015,0.015,len),mat((x+px)/2,(yy+py)/2,(z+pz)/2,-Math.asin(dy/len),Math.atan2(dx,dz),0),lin(0x151515));px=x;py=yy;pz=z;}};
    const P1=K.luzes.filter(q=>q.poste);for(let k=0;k<P1.length-1;k++)fio([P1[k].x,P1[k].z],[P1[k+1].x,P1[k+1].z],P1[k].y+0.12,P1[k+1].y+0.12,0.28);
    fio([q0.x,q0.z],[P1[P1.length-1].x,P1[P1.length-1].z],y+0.3,P1[P1.length-1].y+0.1,0.05);}
  return g.data();}
etapaMalha('fim','abrigos2',1,()=>{if(!ABR2.campos.length)return;try{ABR2.malha=litMesh(acampGeo());}catch(e){console.error('abrigos (desenho)',e);ABR2.malha=null;}});
DESENHO.opaco.push(function abrigos2Desenho(Pg){if(!ABR2.malha)return;let perto=false;for(const K of ABR2.campos)if(d2(K.o.x,K.o.z,cam.pos[0],cam.pos[2])<260*260)perto=true;if(perto)drawStat(Pg,ABR2.malha,ID);});
/* os dois acampamentos: montados no fim do mundo (depois da vila e do porto) */
function abrigos2Montar(){if(ABR2.campos.length)return;
  /* Vila: na frente da Igreja de São José, entre os muros dos quintais (rua de uns 6 m): a lona deitada ao longo da rua,
     aberta para o leste, e o gerador no pé da igreja, ao lado da porta */
  {const ig=typeof VILA!=='undefined'&&VILA.igreja;if(ig){const x=61.0,z=ig.z1+5.2,y=ground(x,z);
    acampNovo({id:'saojose',nome:'Abrigo de São José',onde:'Vila São José',x,z,y,yaw:Math.PI/2,luz:'gerador',lona:0x3d6b3a,r:22,ok:()=>true,
      custo:{gasolina:2,oleoMotor:1},ligarT:'Abastecer e ligar o gerador do abrigo',ligarDica:'o gerador funciona com gasolina e óleo de motor'});}}
  /* Porto: no cais, perto da guarita (ajustado ao lugar livre) */
  {const P0=typeof PORTO_LUGARES!=='undefined'&&PORTO_LUGARES[0];if(P0&&ABR2_CAIS){const q=ABR2_CAIS;
    acampNovo({id:'cais',nome:'Abrigo do Cais',onde:'Porto Velho',x:q.x,z:q.z,y:chaoEm(q.x,q.z,6),yaw:q.yaw,luz:'bateria',lona:0x8a3a2a,r:20,ok:()=>true,
      custo:{bateriaVeic:1,fio:2},ligarT:'Ligar as lâmpadas na bateria',ligarDica:'a luz vem de uma bateria de veículo'});}}}
const ABR2_CAIS={x:345.5,z:3.2,yaw:0};   // no deque do cais (y 0,35), do lado sul da avenida que entra no porto, aberto para ela
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{abrigos2Montar();}catch(e){console.error('abrigos 2',e);}return r;};}
