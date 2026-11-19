/* ================= Abrigo do Sabiá (v10.8.2) =================
   Um segundo abrigo, no alto do Morro do Sabiá: um acampamento no Largo (lona azul esticada no canto, colchão, baú, bancada
   e um varal de lâmpadas). Aqui não tem fusível: a luz vem de um "gato" no poste da esquina, com 3 fios e 2 fitas. Limpo e
   aceso, é igual ao da Matriz: cama (dormir e voltar aqui se cair), baú, bancada e luz que segura os zumbis na beira.
   Corrida "Subida do Sabiá": do pé da Feira, rua acima, pelo buraco do tapume, a Escadaria do Sabiá inteira, o Largo e a
   escada da caixa-d'água até o alto (cronômetro e medalhas; a prata dá o material do gato do abrigo). */
const SAB={abrigo:null,malha:null,pos:null};
function sabMontar(){if(typeof MOR==='undefined'||!MOR.ok||!MOR.largo||SAB.abrigo)return;const L=MOR.largo,y=L.y;
  /* canto sudoeste do Largo (à esquerda de quem chega pela escadaria, longe das portas do Mercadinho e do Bar): a lona fica
     entre x0 e x0+5,6 e entre z0 e z0+4,6, aberta para o meio do Largo */
  const xa=L.x0+0.6,za=L.z0+0.6;
  const cama={x:xa+1.4,y,z:za+0.95},bau={x:xa+4.15,y,z:za+0.4},banc={x:L.x0+0.72,y,z:za+2.9},quadro={x:L.x0+0.35,y,z:za+6.6},poste={x:L.x0-0.45,z:za+5.8};
  /* lâmpadas: uma pendurada debaixo da lona e um varal na beira sul (de um lado e do outro da chegada da escadaria) e outra no alto */
  const luzes=[[xa+2.6,za+2.2,1.9,false],[L.x0+6.8,L.z0+0.5,2.55,true],[MORRO.esc+3.6,L.z0+0.5,2.55,true],[L.x1-0.6,L.z0+0.5,2.55,true],[MORRO.esc-2.5,L.z1-0.6,2.55,true]]
    .map(([x,z,h,poste],i)=>({i,x,y:y+h,z,poste}));
  SAB.pos={xa,za,cama,bau,banc,quadro,poste,luzes};
  SAB.abrigo=abrigoNovo({id:'sabia',nome:'Abrigo do Sabiá',onde:'Morro do Sabiá',x:(L.x0+L.x1)/2,z:(L.z0+L.z1)/2,y,r:22,ok:()=>MOR.ok,
    custo:{fio:3,fita:2},ligarT:'Fazer o gato no poste e acender o abrigo',ligarDica:'a luz vem de um gato no poste',quadro,cama,bau,bancada:banc,luzes});
  /* colisão: baú, bancada e o poste do gato */
  colBox(bau.x,bau.z,0.5,0.32,0,{solid:true,y0:y-0.2,y1:y+0.62,morro:true});colBox(banc.x,banc.z,0.32,0.9,0,{solid:true,y0:y-0.2,y1:y+0.92,morro:true});
  colCircle(poste.x,poste.z,0.14,{solid:true,y0:y-1,y1:y+6.5,morro:true});
  sabCorrida();}
/* a corrida: pé da Feira -> fim da Feira -> pé da Escadaria -> meio da Escadaria -> Largo -> pé da caixa-d'água -> alto */
function sabCorrida(){if(SAB.corrida||typeof FEIRA==='undefined'||!FEIRA.ok||!MOR.torre)return;const L=MOR.largo,T=MOR.torre,E=MOR.escadas.find(q=>q.nome==='Escadaria do Sabiá');if(!E||!T.via)return;
  const g=(x,z)=>ground(x,z),x=MORRO.esc,pt=(px,pz,py,r,h)=>({x:px,z:pz,y:py??g(px,pz),r:r||3.2,h:h||3.2}),zm=(E.z0+E.z1)/2;
  const ini={x:x+2.4,z:FEIRA.z0-1.2,y:g(x+2.4,FEIRA.z0-1.2)};
  const pts=[pt(x,FEIRA.z1-0.5),pt(x,E.z0+1.6,E.yEm(E.z0+1.6),2.6),pt(x,zm,E.yEm(zm),2.6),pt(x,L.z0+3,L.y,4),pt(T.x,T.zl-0.75,T.g0,2.2),pt(T.x,T.z,T.top,2.2,3.0)];
  let len=Math.hypot(pts[0].x-ini.x,pts[0].z-ini.z);for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z)+Math.max(0,pts[i].y-pts[i-1].y)*0.35;
  const sobe=T.top-T.g0,base=len/6.2+sobe/ESC_CFG.vel;   // correndo direto e subindo a escada sem parar
  SAB.corrida=corridaNova({id:'sabia-subida',nome:'Subida do Sabiá',onde:'Morro do Sabiá',ok:()=>MOR.ok&&FEIRA.ok,ini,
    dica:'Rua acima pela Feira, Escadaria do Sabiá até o Largo e a escada da caixa-d\'água até o alto (segure E no pé da escada).',
    pts,tempos:{ouro:Math.ceil(base+6),prata:Math.ceil(base*1.3+8),bronze:Math.ceil(base*1.7+14)},xp:{bronze:35,prata:60,ouro:110},
    premios:{bronze:[['bandagem',2]],prata:[['fio',2],['fita',1]],ouro:[['fusivel',1],['municao9',12]]}});
  SAB.ini=ini;colCircle(ini.x+0.9,ini.z,0.1,{solid:true,y0:ini.y-0.5,y1:ini.y+3.3});}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{sabMontar();}catch(e){console.error('Abrigo do Sabiá',e);}return r;};}
/* desenho: lona, colchão, baú, bancada, quadro no poste com o fio do gato, varal de lâmpadas */
function sabGeo(){const g=new GB(1<<13,8),P0=SAB.pos;if(!P0)return g.data();const L=MOR.largo,y=L.y,R=rng(61771),
    B=(x0,x1,y0,y1,z0,z1,cor,o)=>add(g,boxTris(x1-x0,y1-y0,z1-z0),mat((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),typeof cor==='number'?lin(cor):cor,o);
  const{xa,za,cama,bau,banc,quadro,poste,luzes}=P0;
  /* lona: quatro paus e o pano azul caído para trás */
  /* lona: paus altos do lado aberto (norte) e baixos do lado da beira (sul) */
  const lx0=xa-0.2,lx1=xa+5.4,lz0=za-0.2,lz1=za+4.4;
  for(const[x,z,h]of[[lx0,lz0,1.95],[lx1,lz0,1.95],[lx0,lz1,2.35],[lx1,lz1,2.35]])B(x-0.04,x+0.04,y,y+h,z-0.04,z+0.04,0x6b4e30);
  {const a=-Math.atan2(0.4,lz1-lz0),len=Math.hypot(0.4,lz1-lz0);add(g,boxTris(lx1-lx0+0.3,0.03,len),mat((lx0+lx1)/2,y+2.17,(lz0+lz1)/2,a,0,0),lin(0x2f6fa8),{j:0.04,rnd:R});}
  /* colchão, cobertor e travesseiro */
  B(cama.x-1.0,cama.x+1.0,y,y+0.2,cama.z-0.45,cama.z+0.45,0x5a6a7a);B(cama.x-0.2,cama.x+1.02,y+0.2,y+0.27,cama.z-0.47,cama.z+0.47,0x8a4a3a);B(cama.x-0.95,cama.x-0.5,y+0.2,y+0.33,cama.z-0.3,cama.z+0.3,0xe8e2d4);
  /* baú */
  B(bau.x-0.45,bau.x+0.45,y,y+0.55,bau.z-0.3,bau.z+0.3,0x6b4e30);B(bau.x-0.48,bau.x+0.48,y+0.55,y+0.62,bau.z-0.32,bau.z+0.32,0x4a3424);B(bau.x-0.05,bau.x+0.05,y+0.35,y+0.5,bau.z-0.33,bau.z-0.3,0xc8a428);
  /* bancada (cavaletes e tampo) com a morsa */
  B(banc.x-0.32,banc.x+0.32,y,y+0.9,banc.z-0.9,banc.z+0.9,0x7a5a3a);B(banc.x-0.36,banc.x+0.36,y+0.9,y+0.96,banc.z-0.95,banc.z+0.95,0x5a4028);
  B(banc.x-0.08,banc.x+0.08,y+0.96,y+1.1,banc.z+0.3,banc.z+0.55,0x3a4450);
  /* poste de madeira com a caixa do quadro e o fio do gato subindo até o alto */
  add(g,cylTris(0.12,0.15,6.4,8),mat(poste.x,y-0.6,poste.z),lin(0x5a4632));B(poste.x-0.5,poste.x+0.5,y+5.4,y+5.5,poste.z-0.06,poste.z+0.06,0x5a4632);
  B(quadro.x-0.12,quadro.x+0.04,y+1.0,y+1.9,quadro.z-0.35,quadro.z+0.35,0x5a6670);B(quadro.x+0.04,quadro.x+0.06,y+1.1,y+1.8,quadro.z-0.28,quadro.z+0.28,0x3a4450);
  {const x0=quadro.x-0.04,z0=quadro.z,x1=poste.x,z1=poste.z,n=7;let px=x0,py=y+1.9,pz=z0;for(let i=1;i<=n;i++){const t=i/n,x=lerp(x0,x1,t),z=lerp(z0,z1,t),yy=lerp(y+1.9,y+5.35,t)-Math.sin(t*Math.PI)*0.35;
      const dx=x-px,dy=yy-py,dz=z-pz,len=Math.hypot(dx,dy,dz);add(g,boxTris(0.02,0.02,len),mat((x+px)/2,(yy+py)/2,(z+pz)/2,-Math.asin(dy/len),Math.atan2(dx,dz),0),lin(0x151515));px=x;py=yy;pz=z;}}
  /* varal de lâmpadas: paus nas pontas e fio caído entre as lâmpadas */
  for(const q of luzes){if(q.poste)B(q.x-0.035,q.x+0.035,y,y+2.75,q.z-0.035,q.z+0.035,0x4a4a46);else B(q.x-0.006,q.x+0.006,q.y+0.06,y+2.17,q.z-0.006,q.z+0.006,0x151515);
    add(g,icoTris(0.09,0.05,R),mat(q.x,q.y,q.z),lin(0xf4e8c0),{e:0.6});}
  for(let k=0;k<luzes.length-1;k++){const a=luzes[k],b=luzes[k+1],n=6;if(!a.poste||!b.poste||Math.abs(a.z-b.z)>0.5)continue;let px=a.x,py=a.y+0.12,pz=a.z;for(let i=1;i<=n;i++){const t=i/n,x=lerp(a.x,b.x,t),z=lerp(a.z,b.z,t),yy=lerp(a.y,b.y,t)+0.12-Math.sin(t*Math.PI)*0.28;
      const dx=x-px,dy=yy-py,dz=z-pz,len=Math.hypot(dx,dy,dz);add(g,boxTris(0.015,0.015,len),mat((x+px)/2,(yy+py)/2,(z+pz)/2,-Math.asin(dy/len),Math.atan2(dx,dz),0),lin(0x151515));px=x;py=yy;pz=z;}}
  /* placa da corrida no pé da Feira */
  if(SAB.ini){const q=SAB.ini;add(g,cylTris(0.06,0.07,3.3,7),mat(q.x+0.9,q.y,q.z),lin(0x2a2c2e));add(g,boxTris(1.5,0.8,0.06),mat(q.x+0.9,q.y+2.8,q.z),lin(0xd8a020));
    textoBlocos(g,mat(q.x+0.9,q.y+2.62,q.z+0.04),'CORRIDA',0.045,0x1a1a1a);textoBlocos(g,mat(q.x+0.9,q.y+2.62,q.z-0.04,0,Math.PI,0),'CORRIDA',0.045,0x1a1a1a);}
  return g.data();}
etapaMalha('fim','abrigoSabia',1,()=>{if(!SAB.pos)return;try{SAB.malha=litMesh(sabGeo());}catch(e){console.error('Abrigo do Sabiá (desenho)',e);SAB.malha=null;}});
DESENHO.opaco.push(function sabDesenho(Pg){if(!SAB.malha||!SAB.pos)return;if(d2(SAB.pos.xa,SAB.pos.za,cam.pos[0],cam.pos[2])>260*260)return;drawStat(Pg,SAB.malha,ID);});
