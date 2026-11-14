/* ================= Objetos de verdade no mapa (v10.2.2, 13/11/2026) =================
   Pedido do Himalaia: "tudo no jogo quero o modelo 3D igual às árvores". Os móveis das casas e dos prédios, os armários e as
   caixas de saque, os objetos da rua (postes, lixeiras, bancos, barreiras e parte dos carros parados) e as caixas de saque da
   mata e do avião passam a ser modelos escaneados da Poly Haven (CC0), convertidos por tools/props_banco.py para o
   21k_props_dados.js (PROPS3D: cada modelo com o pé no chão, centrado, simplificado, textura WebP).
   · O lugar, o tamanho da colisão, o saque e o uso continuam os de antes: só o desenho muda. Cada modelo é encaixado na caixa
     do móvel antigo, com a mesma frente (+z do modelo), esticado um pouco quando precisa (até 30% num eixo).
   · O que ainda não tem modelo parecido (geladeira, cofre, maca, empilhadeira, balcão, fogão a lenha, pia, privada, arquivo
     de aço, armário de remédios...) continua com o desenho de antes até chegar modelo.
   · Dentro das casas: desenhados só perto (distância de detalhe da cidade, no máximo 38 m) e escurecidos como interior, igual
     ao resto da casa. Na rua: até a distância dos objetos do nível de gráfico, com sombra.
   · Sem o arquivo de dados, fica tudo como antes. */
const PRP={m:{},rua:[],mundo:[]};   // rua: objetos da cidade (refeitos com a malha da cidade); mundo: fora da cidade (acampamento...)
const PRP_W=M4(),PRP_GIRO=[0,Math.PI,Math.PI/2,-Math.PI/2];
function prpOk(){return typeof PROPS3D!=='undefined'&&!!PROPS3D;}
function prpTem(id){return prpOk()&&!!PROPS3D[id];}
function prpHash(a,b){const s=Math.sin(a*127.1+b*311.7)*43758.5453;return s-Math.floor(s);}
/* malhas do modelo (uma por material), feitas na primeira vez que ele aparece */
function prpMalha(id){let X=PRP.m[id];if(X!==undefined)return X;const A=prpOk()?PROPS3D[id]:null;if(!A)return PRP.m[id]=null;
  try{X={id,ps:[]};for(const d of A.partes){const g=mod3dDecodificar(d);X.ps.push(texMesh(g.f,g.uv,texModelo('prp_'+id+'_'+d.mat,A.tex[d.mat],false)));}}
  catch(e){console.error('objeto 3D',id,e);X=null;}
  return PRP.m[id]=X;}
function prpDesenhar(Pg,id,M,k){const X=prpMalha(id);if(!X)return;for(const m of X.ps){if(k>0)drawStatI(Pg,m,M,k);else drawStat(Pg,m,M);}}
/* escala para caber na caixa (largura x, altura, fundo z, no espaço do modelo): 'u' por igual; 'l' livre (cada eixo no seu
   tamanho: mesas e prateleiras); 'q' (padrão) por igual pelo eixo mais justo e os outros esticados até lim (1,3 = 30%) */
function prpEscala(id,W,H,D,modo,lim){const A=PROPS3D[id],m=[A.hi[0]-A.lo[0],A.hi[1]-A.lo[1],A.hi[2]-A.lo[2]],t=[W/m[0],H/m[1],D/m[2]];
  if(typeof modo==='number')return[modo,modo,modo];if(modo==='l')return t;const k=Math.min(t[0],t[1],t[2]);if(modo==='u')return[k,k,k];
  const L=k*(lim||1.3);return t.map(v=>Math.min(v,L));}

/* ---------- dentro dos prédios (geoPredio, de perto): o móvel vira modelo; matriz no espaço do prédio (u, y, v) ---------- */
function prpPorPredio(p,id,u,y,v,yaw,s,k,rx,rz){if(!prpTem(id))return false;const L=p.props3d||(p.props3d=[]),w=pw(p,u,v);
  L.push({id,M:trs(M4(),u,y,v,rx||0,yaw,rz||0,s[0],s[1],s[2]),x:w[0],z:w[1],y,k:k||0});return true;}
/* móveis (CID.moveis). Os antigos (cama, sofá, mesa...) ficam alinhados com a sala; os das casas de fora (MOVEIS_NOVOS) têm
   a frente em +z girada para a parede (m.f). Devolve true quando o desenho de caixinha não entra mais. */
function prpMovel(p,m,b,g,R){if(!prpOk()||!m)return false;
  const N=MOVEIS_NOVOS[m.k],ang=N?PRP_GIRO[m.f||0]:0,w=m.u1-m.u0,d=m.v1-m.v0,cu=(m.u0+m.u1)/2,cv=(m.v0+m.v1)/2,y=m.y,s=m.s;
  const W=N?N[0]:w,D=N?N[1]:d,H=N?N[2]:m.h,h=prpHash(p.id*3.7+cu,cv*1.9+y);
  const por=(id,ox,oy,oz,giro,esc)=>{const c=Math.cos(ang),sn=Math.sin(ang);return prpPorPredio(p,id,cu+ox*c+oz*sn,y+oy,cv-ox*sn+oz*c,ang+giro,esc,b);};
  /* mesa de comer com duas cadeiras empurradas para baixo dela (a colisão continua a da mesa) */
  const mesaComer=(MW,MD,MH)=>{const id=h<0.5?'mesaJantar':'mesaToalha';if(!prpTem(id))return false;por(id,0,0,0,0,prpEscala(id,MW,MH,MD,'l'));
    const c=prpHash(h*9.1,cu)<0.5?'cadeira':'cadeiraPintada';por(c,-MW*0.22,0,-MD/2+0.08,(h-0.5)*0.3,[1,1,1]);por(c,MW*0.22,0,MD/2-0.08,Math.PI+(h-0.5)*0.4,[1,1,1]);return true;};
  switch(m.k){
    case'cama':if(h<0.6&&prpTem('camaDia')){const enc=(cu-s.u0)<(s.u1-cu)?1:-1;return por('camaDia',0,0,0,enc*Math.PI/2,prpEscala('camaDia',d,1.15,w,'q',1.2));}   // encosto na parede mais perto
      return prpTem('camaFerro')&&por('camaFerro',0,0,0,0,prpEscala('camaFerro',w,1.2,d,'q'));   // cabeceira em -v, como o travesseiro de antes
    case'sofa':{const id=h<0.55?'sofa':'sofaMadeira';return prpTem(id)&&por(id,0,0,0,Math.PI,prpEscala(id,w,0.95,d,'q',1.25));}   // encosto em +v
    case'mesa':if(s&&/escritorio|portaria|recepcao/.test(s.tipo||'')){if(!prpTem('mesaEscritorio'))return false;const gi=h<0.5?0:Math.PI;
        por('mesaEscritorio',0,0,0,gi,prpEscala('mesaEscritorio',w,H,d,'l'));por('cadeiraEscola',0.12,0,(gi?-1:1)*(d/2+0.1),gi+Math.PI+(h-0.5)*0.5,[1,1,1]);return true;}
      return mesaComer(w,d,0.78);
    case'bancada':return prpTem('mesaEscritorio')&&por('mesaEscritorio',0,0,0,0,prpEscala('mesaEscritorio',w,H,d,'l'));
    case'gerador':return prpTem('gerador')&&por('gerador',0,0,0,h<0.5?0:Math.PI,prpEscala('gerador',w,H,d,'u'));
    case'carro':return prpTem('carroCoberto')&&por('carroCoberto',0,0,0,h<0.5?0:Math.PI,prpEscala('carroCoberto',w,H,d,'u'));
    case'palete':{if(!prpTem('caixaPapelao'))return false;add(g,bvTris(w,0.14,d),mat(cu,y+0.07,cv),lin(m.c1),{b,j:0.06,rnd:R});
      for(const[su,sy,sv]of[[-0.26,0,-0.22],[0.26,0,-0.22],[-0.26,0,0.22],[0.26,0.41,-0.22]])por('caixaPapelao',su,0.14+sy,sv,(prpHash(su+h,sv)-0.5)*0.3,[1.25,1.2,0.85]);return true;}
    /* casas de fora da cidade */
    case'rack':if(!prpTem('mesaBaixa'))return false;por('mesaBaixa',0,0,0,0,prpEscala('mesaBaixa',W,H,D,'l'));por('televisao',0,H,-D/2+0.2,0,[1.35,1.35,1.35]);return true;
    case'poltrona':{const id=h<0.6?'poltrona':'cadeiraBalanco';return prpTem(id)&&por(id,0,0,0,0,prpEscala(id,W,1.05,D,'q'));}
    case'estante':return prpTem('estante')&&por('estante',0,0,0,0,prpEscala('estante',W,H,D,'q'));
    case'criado':return prpTem('criadoMudo')&&por('criadoMudo',0,0,0,0,prpEscala('criadoMudo',W,H,D,'q'));
    case'mesinha':return prpTem('mesaCentro')&&por('mesaCentro',0,0,0,0,prpEscala('mesaCentro',W,H,D,'l'));
    case'mesaC':return mesaComer(W,D,H||0.76);
    case'escrivaninha':if(!prpTem('mesaEscritorio'))return false;por('mesaEscritorio',0,0,0,0,prpEscala('mesaEscritorio',W,H,D,'l'));por('cadeiraEscola',0.12,0,D/2+0.12,Math.PI+(h-0.5)*0.5,[1,1,1]);return true;
    case'banco':if(!prpTem('bancoPraca'))return false;for(const sx of[-1,1])por('bancoPraca',sx*W/4,0,0,0,prpEscala('bancoPraca',W/2,0.9,D,'q'));return true;
    case'planta':return prpTem('vaso')&&por('vaso',0,0,0,h*6.28,[0.9,0.9,0.9]);
    case'caixasP':if(!prpTem('caixaPapelao'))return false;por('caixaPapelao',-0.17,0,0.02,0.08,[0.95,1,0.95]);por('caixaPapelao',0.17,0,-0.03,-0.15,[0.9,0.95,0.9]);
      por('caixaPapelao',0,0.33,0,0.5+h,[0.85,0.85,0.85]);return true;
    case'comoda':return prpTem('armario')&&por('armario',0,0,0,0,prpEscala('armario',W,H,D,'q'));
    case'cadeira':{const id=h<0.5?'cadeira':'cadeiraPintada';return prpTem(id)&&por(id,0,0,0,(h-0.5)*1.4,[1,1,1]);}
    case'lixeira':{const id=h<0.5?'lixeira':'lixeiraVelha';return prpTem(id)&&por(id,0,0,0,h*9,[0.5,0.5,0.5]);}}
  return false;}
/* armários e caixas de saque (CID.conts): a caixa antiga é hw*2 x h x hd*2, frente em +z girada por yawL */
function prpCont(p,c,b,g,R){if(!prpOk()||!c)return false;const D=CONT_DEF[c.tipo];if(!D)return false;
  const W=D.hw*2,H=D.h,F=D.hd*2,cs=Math.cos(c.yawL),sn=Math.sin(c.yawL),h=prpHash(c.u*1.3+p.id,c.v*0.7+c.y);
  const por=(id,ox,oy,oz,giro,esc)=>prpPorPredio(p,id,c.u+ox*cs+oz*sn,c.y+oy,c.v-ox*sn+oz*cs,c.yawL+giro,esc,b);
  switch(c.tipo){
    case'armario':return prpTem('gaveteiro')&&por('gaveteiro',0,0,0,0,prpEscala('gaveteiro',W,H,F,'q'));
    case'guardaRoupa':return prpTem('guardaRoupa')&&por('guardaRoupa',0,0,0,0,prpEscala('guardaRoupa',W,H,F,'q',1.4));
    case'gaveta':return prpTem('comoda')&&por('comoda',0,0,0,0,prpEscala('comoda',W,H,F,'q'));
    case'mesa':return prpTem('mesaEscritorio')&&por('mesaEscritorio',0,0,0,0,prpEscala('mesaEscritorio',W,H,F,'l'));
    case'caixaFerr':return prpTem('baulFerramentas')&&por('baulFerramentas',0,0,0,0,prpEscala('baulFerramentas',W,H,F,'q'));
    case'prateleira':{if(!prpTem('prateleiraMetal'))return false;const s=prpEscala('prateleiraMetal',W/2,H,F,'l'),pr=[0.43,0.91,1.41].map(v=>v*s[1]);
      for(const sx of[-1,1]){const x0=sx*W/4;por('prateleiraMetal',x0,0,0,0,s);
        /* o que sobrou nas prateleiras: caixas de papelão e engradados (sem o saque, que continua no menu) */
        const r=prpHash(x0+h*5,c.v);por('caixaPapelao',x0-0.2,pr[0],0,(r-0.5)*0.4,[0.9,0.9,0.9]);if(r<0.7)por(r<0.35?'caixaPlastico':'caixaPlastico2',x0+0.22,pr[0],0.02,(r-0.3)*0.5,[0.9,0.9,0.9]);
        if(r>0.25)por('caixaPapelao',x0+(r-0.5)*0.4,pr[1],0,(r-0.5)*0.8,[0.8,0.8,0.8]);if(r>0.5)por('caixaPlastico',x0-0.15,pr[2],0,0.2,[0.9,0.9,0.9]);}return true;}
    case'caixas':{if(!prpTem('caixaPapelao'))return false;const s=[1.4,1.3,0.95];
      for(const[x,yy,z,gi]of[[-0.29,0,-0.25,0.05],[0.29,0,-0.25,-0.04],[-0.29,0,0.25,0.02],[0.29,0,0.25,0.06],[-0.27,0.44,-0.2,0.12],[0.3,0.44,0.15,-0.1],[0.05,0.88,-0.05,0.4+h]])por('caixaPapelao',x,yy,z,gi,s);return true;}
    case'mala':{if(!prpTem('mala'))return false;for(const sz of[-1,1])por('mala',0,0,sz*F/4,sz>0?0:Math.PI,prpEscala('mala',W,H,F/2,'q'));return true;}}
  return false;}
/* desenho: chamado logo depois da malha de perto do prédio (B = matriz do prédio) */
function prpPredio(Pg,p,B){const L=p.props3d;if(!L||!L.length)return;const cx=cam.pos[0],cy=cam.pos[1],cz=cam.pos[2],R=Math.min(38,GF().cidLod||60),R2=R*R;
  for(const q of L){if(Math.abs(q.y-cy)>12||d2(q.x,q.z,cx,cz)>R2)continue;mul(PRP_W,B,q.M);prpDesenhar(Pg,q.id,PRP_W,q.k);}}

/* ---------- rua da cidade (geoCidadeProps): o objeto vira modelo, no mundo ---------- */
function prpRua(o){if(!prpOk()||!o)return false;const y=quadraEm(o.x,o.z)?QUADRA_Y:0,h=prpHash(o.x*0.37,o.z*0.71);let id=null,s=[1,1,1],yaw=o.yaw||0,r=0.6;
  switch(o.k){
    case'poste':id='poste';s=[1.3,1.3,1.3];r=1;break;
    case'lixeira':id=h<0.5?'lixeira':'lixeiraVelha';yaw=h*40;break;
    case'banco':id='bancoPraca';s=[1.38,1,1];break;   // encosto em -z, como o de antes
    case'barreira':id='barreiraConcreto';s=[1.11,1,1];r=0.8;break;
    case'jersey':id='barreiraConcreto';s=[1.27,0.92,1.2];r=0.8;break;
    case'carro':if(o.aberto||h>0.4)return false;id='carroCoberto';s=[1,1.1,0.98];r=1;if(h<0.2)yaw+=Math.PI;break;   // carro parado coberto com lona (4 em cada 10)
    case'entulho':prpEntulho(o,y);return false;   // o monte continua; em volta, tralha de verdade
    case'p3d':if(!prpTem(o.id))return true;s=o.s||s;PRP.rua.push({id:o.id,x:o.x,z:o.z,M:trs(M4(),o.x,y+(o.dy||0),o.z,o.rx||0,yaw,o.rz||0,s[0],s[1],s[2]),r:0.35,L:o.L||55});return true;   // tralha da calçada (prpLixoCidade)
    default:return false;}
  if(!prpTem(id))return false;PRP.rua.push({id,x:o.x,z:o.z,M:trs(M4(),o.x,y,o.z,0,yaw,0,s[0],s[1],s[2]),r});return true;}
/* tralha nas calçadas da cidade (pedido do Himalaia: "cidade limpa demais"): sacos de lixo, caixas de papelão, pneus, lixeira
   tombada, cadeira de plástico e caixas de luz encostados nas paredes dos prédios (mais nos becos e nos fundos que na
   frente), longe das portas e do que já tem colisão; hidrantes em algumas esquinas. Gerado junto com a cidade, com semente
   fixa (fica sempre igual); só a caixa de luz e o hidrante têm colisão (o resto é baixo e se atravessa, como o capim). */
function prpLixoCidade(){if(!prpOk())return;const R=rng(51515),P=CID.props,ini=P.length;
  const livre=(x,z,r)=>!pointBlocked(x,z,r)&&!P.some(o=>Math.abs(o.x-x)<4&&Math.abs(o.z-z)<4&&d2(o.x,o.z,x,z)<(o.k==='carro'||o.k==='onibus'||o.k==='caminhao'||o.k==='viatura'||o.k==='ambulancia'?12:o.k==='p3d'?1.2:2.6));
  const poe=(id,x,z,yaw,o)=>P.push(Object.assign({k:'p3d',id,x,z,yaw},o||{}));
  for(const p of CID.predios){if(p.rural)continue;
    const portas=CID.portas.filter(d=>d.p===p&&(d.sA==='fora'||d.sB==='fora')).map(d=>{const l=plc(p,d.x,d.z);return[l[0],l[1],d.larg||1];});
    /* os quatro lados: [comprimento, ponto (ao longo, para fora) -> (u, v), giro de quem olha para fora, chance] */
    const lados=[[p.W,(a,f)=>[a,-f],p.yaw+Math.PI,0.24],[p.W,(a,f)=>[a,p.D+f],p.yaw,0.34],[p.D,(a,f)=>[-f,a],p.yaw-Math.PI/2,0.3],[p.D,(a,f)=>[p.W+f,a],p.yaw+Math.PI/2,0.3]];
    for(const[L,uv,giro,ch]of lados)for(let a=1.1;a<L-1.1;a+=3.2){if(R()>ch)continue;const a0=a+(R()-0.5)*1.2;
      const q=uv(a0,0.4);if(portas.some(([pu,pv,lg])=>Math.abs(pu-q[0])<lg/2+1.3&&Math.abs(pv-q[1])<2.4))continue;
      const em=(da,f)=>{const t=uv(a0+da,f);return pw(p,t[0],t[1]);},c=em(0,0.42);if(!quadraEm(c[0],c[1])||!livre(c[0],c[1],0.4))continue;
      const r=R();
      if(r<0.42){const k=2+Math.floor(R()*2);for(let i=0;i<k;i++){const w=em((i-(k-1)/2)*0.42+(R()-0.5)*0.15,0.3+R()*0.2),e=0.8+R()*0.3;poe('sacoLixo',w[0],w[1],R()*6.28,{s:[e,e*(0.85+R()*0.3),e]});}}
      else if(r<0.56){poe('caixaPapelao',c[0],c[1],giro+(R()-0.5)*0.6);if(R()<0.6){const w=em(0.5,0.35);poe('caixaPapelao',w[0],w[1],R()*6.28,{s:[1,0.35,1],dy:0}); }}   // uma em pé e uma amassada
      else if(r<0.66){if(R()<0.5)poe('pneuVelho',c[0],c[1],R()*6.28,{rx:Math.PI/2,dy:0.08});else{const w=em(0,0.22);poe('pneuVelho',w[0],w[1],giro+(R()-0.5)*0.3,{rx:-0.22});}}   // deitado ou encostado na parede (a face para a parede, o alto inclinado para ela)
      else if(r<0.76){poe('lixeiraVelha',c[0],c[1],R()*6.28,{rz:Math.PI/2,dy:0.3});const w=em(0.6,0.35);poe('sacoLixo',w[0],w[1],R()*6.28);}   // lixeira tombada e o saco que caiu dela
      else if(r<0.84){const tomb=R()<0.35;poe('cadeiraPlastico',c[0],c[1],R()*6.28,tomb?{rx:-Math.PI/2,dy:0.32}:{});}
      else if(r<0.94){const w=em(0,0.24),id=R()<0.5?'caixaLuz':'caixaLuz2';if(!prpTem(id))continue;poe(id,w[0],w[1],giro,{L:80});colBox(w[0],w[1],id==='caixaLuz'?0.27:0.47,0.22,giro,{solid:true,y0:-0.2,y1:1.2});}
      else{poe('tamborVelho',c[0],c[1],R()*6.28,{L:80});colCircle(c[0],c[1],0.32,{y0:-0.2,y1:0.95});}}}
  /* hidrantes: em metade das esquinas das quadras, na beira da calçada */
  for(const q of CID.quadras){for(const[x,z]of[[q.x0+0.7,q.z0+0.7],[q.x1-0.7,q.z0+0.7],[q.x0+0.7,q.z1-0.7],[q.x1-0.7,q.z1-0.7]]){if(R()>0.5||!livre(x,z,0.5))continue;
    poe('hidrante',x,z,R()*6.28,{L:90});colCircle(x,z,0.16,{y0:-0.2,y1:0.85});}}
  PRP.lixo=P.length-ini;}
{const _gc=gerarCidade;gerarCidade=function(){const r=_gc.apply(this,arguments);try{prpLixoCidade();}catch(e){console.error('tralha da cidade',e);}return r;};}
function prpEntulho(o,y){const RR=rng(Math.floor((o.seed||0.5)*1e6)+77),L=['pneuVelho','sacoLixo','sacoCimento','caixaPapelao','sacoLixo','tamborVelho'],n=2+Math.floor(RR()*3);
  for(let i=0;i<n;i++){const id=L[Math.floor(RR()*L.length)],a=RR()*6.283,rr=(0.45+RR()*0.5)*(o.r||1),x=o.x+Math.cos(a)*rr,z=o.z+Math.sin(a)*rr,gi=RR()*6.283;
    if(!prpTem(id))continue;let rx=0,rz=0,dy=0;
    if(id==='tamborVelho'){rz=Math.PI/2;dy=0.31;}else if(id==='pneuVelho'&&RR()<0.6){rx=Math.PI/2;dy=0.08;}   // tambor deitado; pneu deitado ou em pé
    PRP.rua.push({id,x,z,M:trs(M4(),x,y+dy,z,rx,gi,rz,1,1,1),r:0.45});}}
function prpRuaDesenhar(Pg,sombra,perto){if(!PRP.rua.length&&!PRP.mundo.length)return;const cx=sombra?P.x:cam.pos[0],cz=sombra?P.z:cam.pos[2];
  const D=sombra?(perto?60:130):Math.min(170,Math.max(90,GF().obDist||140));
  for(const Lq of[PRP.rua,PRP.mundo])for(const q of Lq){if(sombra&&!perto&&q.r<1)continue;const L=q.L?Math.min(q.L,D):D*(q.r>=1?1:q.r+0.3);if(Math.abs(q.x-cx)>L||Math.abs(q.z-cz)>L||d2(q.x,q.z,cx,cz)>L*L)continue;prpDesenhar(Pg,q.id,q.M,0);}}
/* ---------- acampamento do jogador (clareira: clearingProps, 10_world.js): devolve true quando a peça virou modelo ---------- */
function prpAcamp(k,a){if(!prpOk())return false;const M=(id,x,y,z,yaw,s,rx,rz)=>{if(prpTem(id))PRP.mundo.push({id,x,z,M:trs(M4(),x,y,z,rx||0,yaw||0,rz||0,s[0],s[1],s[2]),r:0.6,L:90});};
  const loc=(lx,lz)=>{const c=Math.cos(a.yaw||0),s=Math.sin(a.yaw||0);return[a.x+lx*c+lz*s,a.z-lx*s+lz*c];};
  switch(k){
    case'fogueira':if(!prpTem('fogueiraPedras'))return false;M('fogueiraPedras',a.x,a.y-0.17,a.z,0.4,[1.03,1,1.03]);return true;   // o anel de pedras (o fogo e as lenhas continuam)
    case'banco':if(!prpTem('troncoCaido'))return false;M('troncoCaido',a.x,a.y-0.05,a.z,a.yaw,[0.42,0.48,0.42]);return true;     // tronco caído de sentar
    case'bancada':if(!prpTem('mesaPintada'))return false;M('mesaPintada',a.x,a.y,a.z,a.yaw,prpEscala('mesaPintada',1.7,0.92,0.72,'l'));return true;
    case'radio':{if(!prpTem('radioVelho'))return false;const p=loc(-0.28,0.1);M('radioVelho',p[0],a.y+0.92,p[1],a.yaw,[0.72,0.72,0.72]);return true;}
    case'caixas':{if(!prpTem('caixaMilitar')||!prpTem('caixaMadeira2'))return false;const g=(x,z)=>ground(x,z);
      M('caixaMilitar',5.6,g(5.6,0.2),0.2,0.3,[0.85,1.15,1.1]);M('caixaMadeira2',5.68,g(5.6,0.2)+0.53,0.22,-0.2,[0.8,1.2,1.2]);M('caixaMadeira',6.35,g(6.35,-0.6),-0.6,1.4,[1,1,0.9]);return true;}
    case'barril':if(!prpTem('tamborVelho'))return false;M('tamborVelho',a.x,a.y,a.z,0.7,[1,1,1]);return true;   // o barril de água (azul)
    case'lampiao':if(!prpTem('lampiao'))return false;M('lampiao',a.x+0.48,a.y+1.653,a.z,0.3,[1.3,1.3,1.3]);return true;   // pendurado no braço do poste (a chama fica dentro)
    case'toco':if(!prpTem('tocoCorte'))return false;M('tocoCorte',a.x,a.y+0.02,a.z,0.8,[0.6,0.75,0.6]);return true;}
  return false;}
{const _bw=buildWorld;buildWorld=function(){PRP.mundo.length=0;return _bw.apply(this,arguments);};}
DESENHO.opaco.push(function propsRua(Pg){if(cam.pos[1]<SUB_FUNDO)return;prpRuaDesenhar(Pg,false);});
DESENHO.sombra.push(function propsRuaSombra(Pg,perto){if(P.y<SUB_FUNDO)return;prpRuaDesenhar(Pg,true,perto);});

/* ---------- caixas de saque da mata e caixa do avião/evento: malha única com a escala já aplicada ---------- */
function prpUnica(id,s,giro){const A=prpOk()?PROPS3D[id]:null;if(!A||A.partes.length!==1)return null;const d=A.partes[0],g=mod3dDecodificar(d),f=g.f,n=f.length/11,c=Math.cos(giro||0),sn=Math.sin(giro||0);
  for(let i=0;i<n;i++){const a=i*11,x=f[a]*s[0],y=f[a+1]*s[1],z=f[a+2]*s[2];f[a]=x*c+z*sn;f[a+1]=y;f[a+2]=-x*sn+z*c;
    let nx=f[a+8]/s[0],ny=f[a+9]/s[1],nz=f[a+10]/s[2];const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;f[a+8]=nx*c+nz*sn;f[a+9]=ny;f[a+10]=-nx*sn+nz*c;}
  return texMesh(f,g.uv,texModelo('prp_'+id+'_'+d.mat,A.tex[d.mat],false));}
function prpCaixas(){if(!prpOk())return;try{
  const troca=(o,k,id,s)=>{if(!o||!o[k]||!prpTem(id))return;const m=prpUnica(id,s,0);if(!m)return;const velho=o[k];o[k]=m;if(typeof liberarMesh==='function'&&velho&&!velho.tex)liberarMesh(velho);};
  troca(MESH,'caixa','caixaMilitar',prpEscala('caixaMilitar',1.1,0.8,0.8,'q'));   // caixa que desce de paraquedas e a do evento
  troca(MESH.obra,'cx_comum','caixaMadeira2',prpEscala('caixaMadeira2',0.62,0.5,0.5,'q',1.35));   // caixa de madeira da mata
  troca(MESH.obra,'cx_suprimentos','caixaMilitarVelha',prpEscala('caixaMilitarVelha',0.78,0.36,0.42,'q'));   // caixa de suprimentos (militar)
}catch(e){console.error('caixas 3D',e);}}
etapaMalha('fim','props',1,prpCaixas);
