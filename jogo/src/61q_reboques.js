/* ================= Etapa 18: reboques e transporte =================
   · Reboque de barco (leva o barco a motor ou a jangada) e plataforma de reboque (leva carro, moto ou triciclo). Um de cada já
     existe no mapa: o reboque de barco perto do cais do Lago Serra Azul e a plataforma no sítio do triciclo. Dá para construir
     mais na aba Oficina (precisa da oficina).
   · Engate: pare o veículo com a traseira na lança do reboque, desça e toque E na lança. Puxam: caminhonete (tudo), carro
     (reboque de barco com barco, plataforma com moto ou triciclo) e triciclo (reboque vazio ou com a jangada). Moto não tem engate.
   · Com reboque, o veículo acelera menos, corre menos, freia mais longe, vira mais devagar e gasta mais; o reboque segue o engate
     (em ré ele dobra e trava se passar do ponto).
   · Guincho: o reboque puxa o barco (da água ou do chão) ou o veículo (mesmo quebrado) para cima dele. A caminhonete pode ganhar
     um guincho na frente (oficina do veículo) para arrastar outro veículo até ela.
   · Carga presa: com 2 cordas a carga fica amarrada. Solta, ela escorrega numa freada forte, numa curva rápida ou numa batida e
     cai do reboque.
   · Descarregar: a plataforma desce o veículo pela rampa de trás; o reboque de barco põe o barco na água (traseira na beira).
   · Salvar e carregar guardam o reboque, quem puxa e o que vai em cima (o veículo continua um só). */
iconesNovos({'i-reboque':'<path d="M3 15h13v-4H3zM16 13h5"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="12" cy="17.5" r="1.8"/><path d="M5 11V8h6l2 3"/>',
  'i-platReboque':'<path d="M2 14h16l3-2M2 14l-1 3M18 14v3"/><circle cx="6" cy="17.5" r="1.6"/><circle cx="10" cy="17.5" r="1.6"/><path d="M5 14v-3h7l2 3"/>',
  'i-guincho':'<circle cx="8" cy="12" r="4"/><path d="M8 8v8M4 12h8"/><path d="M12 12h6l3 4M21 16v3"/>'});
const RTIPOS={
  reboqueBarco:{nome:'Reboque de barco',art:'o',hw:0.95,hd:2.55,lanca:2.75,eixo:-0.65,deck:0.62,peso:0.15,aceita:['barco','jangada'],ri:0.33,
    rodas:[[0.92,0.33,-0.65,0.78],[-0.92,0.33,-0.65,0.78]],carga:{barco:[0,0.7,-0.35],jangada:[0,0.7,-0.4]},guincho:[0,1.05,1.75],rampa:-2.55,lanTampa:0.48},
  plataformaReboque:{nome:'Plataforma de reboque',art:'a',hw:1.15,hd:3.0,lanca:3.45,eixo:-1.15,deck:0.8,peso:0.25,aceita:['sedan','moto','triciclo'],ri:0.36,
    rodas:[[1.08,0.36,-0.7,0.86],[-1.08,0.36,-0.7,0.86],[1.08,0.36,-1.6,0.86],[-1.08,0.36,-1.6,0.86]],carga:{sedan:[0,0.83,-0.3],moto:[0,0.83,-0.2],triciclo:[0,0.83,-0.3]},guincho:[0,1.15,2.45],rampa:-2.8,lanTampa:0.5}};
const PESO_VEIC={jangada:0.1,barco:0.3,moto:0.15,triciclo:0.25,sedan:0.45,caminhonete:0.6};
/* quem tem engate e quanto aguenta puxar; o ponto do engate (atrás) */
const ENGATE={caminhonete:{forca:1.0,y:0.55,z:-2.62},sedan:{forca:0.6,y:0.5,z:-2.3},triciclo:{forca:0.35,y:0.5,z:-1.45}};
const REBOQUES=[];
const RT=r=>RTIPOS[r.tipo];
const rbArt=(T,o)=>T.art==='a'?'a':'o';
const vNome=v=>VTIPOS[v.tipo].nome.toLowerCase(),vArt=v=>VTIPOS[v.tipo].art==='a'?'a':'o';
function rbLocal(r,lx,ly,lz){const c=Math.cos(r.yaw),s=Math.sin(r.yaw);return[r.x+lx*c+lz*s,r.y+ly*Math.cos(r.pitch||0)-lz*Math.sin(r.pitch||0),r.z-lx*s+lz*c];}
function rbNovo(tipo,x,z,yaw,o){o=o||{};const r={id:o.id||tipo+'_'+Math.random().toString(36).slice(2,7),tipo,x,z,y:chaoVeic(x,z),yaw,pitch:0,roll:0,hp:o.hp??100,eng:null,carga:null,presa:false,giro:0,col:null,rampa:0,solta:0,gu:null};
  REBOQUES.push(r);rbPousar(r);rbColisor(r);return r;}
function rbRemover(r){const i=REBOQUES.indexOf(r);if(i>=0)REBOQUES.splice(i,1);if(r.col){colRemove(r.col);r.col=null;}if(r.carga){r.carga.sobre=null;veicColisor(r.carga);}}
/* parado e sem veículo: a lança descansa no pé de apoio */
function rbPousar(r){const T=RT(r),c=Math.cos(r.yaw),s=Math.sin(r.yaw),ax=r.x+T.eixo*s,az=r.z+T.eixo*c,lx=r.x+T.lanca*s,lz=r.z+T.lanca*c,gA=chaoVeic(ax,az),gL=chaoVeic(lx,lz);
  const sp=clamp(-((gL+T.lanTampa)-gA-T.lanTampa)/(T.lanca-T.eixo),-0.45,0.45);r.pitch=Math.asin(sp);r.y=gA+T.eixo*sp;
  const rx=c,rz=-s,gl=chaoVeic(r.x+rx*T.hw,r.z+rz*T.hw),gr=chaoVeic(r.x-rx*T.hw,r.z-rz*T.hw);r.roll=Math.atan2(gl-gr,T.hw*2);}
function rbColisor(r){if(r.col){colRemove(r.col);r.col=null;}if(r.eng&&r.eng.ativo)return;const T=RT(r);r.col=colBox(r.x,r.z,T.hw,T.hd,r.yaw,{reboque:r,y0:r.y-0.2,y1:r.y+(r.carga?2.2:1.2)});}
const rbDe=v=>v?REBOQUES.find(r=>r.eng===v)||null:null;
function rbPeso(r){return RT(r).peso+(r.carga?PESO_VEIC[r.carga.tipo]||0.3:0);}
/* quem pode puxar: devolve '' ou o motivo */
function rbPodePuxar(v,r,cargaExtra){const E=ENGATE[v.tipo],T=RT(r);if(!E)return VTIPOS[v.tipo].nome+' não tem engate';
  const peso=rbPeso(r)+(cargaExtra?PESO_VEIC[cargaExtra.tipo]||0.3:0);if(peso>E.forca+1e-6){const c=cargaExtra||r.carga;return VTIPOS[v.tipo].nome+' não aguenta puxar '+(T.art==='a'?'a ':'o ')+T.nome.toLowerCase()+(c?' com '+(vArt(c)==='a'?'a ':'o ')+vNome(c):'')+': use a caminhonete';}
  return'';}
function rbEngatePt(v){const E=ENGATE[v.tipo];return carroLocal(0,E.y,E.z,v);}
function rbLancaPt(r){return rbLocal(r,0,RT(r).lanTampa,RT(r).lanca);}
/* veículo parado com a traseira perto da lança */
function rbVeicPerto(r,raio){const L=rbLancaPt(r);let best=null,bd=raio||3.0;for(const v of VEICS){if(!ENGATE[v.tipo]||v.ativo||v.sobre||v.hp<=0||rbDe(v))continue;const H=rbEngatePt(v),d=Math.hypot(H[0]-L[0],H[2]-L[2]);if(d<bd){bd=d;best=v;}}return best;}
function rbEngatar(r,v,silencio){if(r.eng)return'Já está engatad'+rbArt(RT(r))+' n'+vArt(r.eng)+' '+vNome(r.eng);if(!v)return'Pare a traseira de um veículo na lança do reboque (caminhonete, carro ou triciclo)';
  if(r.hp<=0)return RT(r).nome+' está quebrad'+rbArt(RT(r))+': conserte antes (segure E nele)';if(v.sobre)return VTIPOS[v.tipo].nome+' está em cima de um reboque';if(rbDe(v))return VTIPOS[v.tipo].nome+' já puxa um reboque';const m=rbPodePuxar(v,r);if(m)return m;
  const T=RT(r),H=rbEngatePt(v),c=Math.cos(r.yaw),s=Math.sin(r.yaw),ax=r.x+T.eixo*s,az=r.z+T.eixo*c;let yaw=Math.atan2(H[0]-ax,H[2]-az);
  if(Math.abs(angDiff(v.yaw,yaw))>1.0)return'Encoste a traseira d'+vArt(v)+' '+vNome(v)+' na lança, alinhad'+vArt(v)+' com o reboque';
  r.eng=v;r.solta=0;rbSeguir(r,v,0,true);rbColisor(r);if(!silencio){sfx('clique',r.x,r.z,0.8);sfx('madeira',r.x,r.z,0.4);}progresso('reboqueEngatou');
  dica('reboque','corpo','Reboque engatado: o veículo acelera e freia menos e vira mais devagar. Em ré, o reboque dobra e trava se passar do ponto. Carga solta cai numa freada forte: prenda com corda (segure E no reboque).');
  return'';}
function rbDesengatar(r){if(!r.eng)return'Não está engatad'+rbArt(RT(r));if(r.eng.ativo)return'Desça do veículo antes';r.eng=null;r.solta=0;rbPousar(r);rbColisor(r);rbCargaPose(r);sfx('clique',r.x,r.z,0.8);return'';}
/* o reboque segue o engate: o eixo vai atrás da lança (como uma barra puxada); passou do ponto em ré, trava */
function rbSeguir(r,v,dt,snap){const T=RT(r),H=rbEngatePt(v),Lta=T.lanca-T.eixo,c=Math.cos(r.yaw),s=Math.sin(r.yaw);let ax=r.x+T.eixo*s,az=r.z+T.eixo*c;
  let yaw=Math.atan2(H[0]-ax,H[2]-az),trava=false;const d=angDiff(v.yaw,yaw),lim=1.2;if(Math.abs(d)>lim){yaw=v.yaw+Math.sign(d)*lim;trava=true;}
  const fx=Math.sin(yaw),fz=Math.cos(yaw),ox=r.x,oz=r.z;ax=H[0]-fx*Lta;az=H[2]-fz*Lta;r.x=ax-fx*T.eixo;r.z=az-fz*T.eixo;r.yaw=yaw;
  /* batida do reboque: empurra e freia o veículo */
  if(!snap&&dt>0){for(const k of[T.hd*0.55,-T.hd*0.55]){const e={x:r.x+fx*k,z:r.z+fz*k,y:r.y},x0=e.x,z0=e.z,h=collide(e,T.hw*0.85,q=>!q.portao&&q.veic!==v&&q.reboque!==r&&!(q.veic&&q.veic.sobre===r));
      if(h){const px=e.x-x0,pz=e.z-z0;r.x+=px;r.z+=pz;const sp=Math.abs(v.v);if(sp>5){r.hp=Math.max(0,r.hp-(sp-5)*1.5);if(r.carga&&!r.presa)rbCargaCai(r,'batida');}if(v.v<0)v.v=0;else v.v*=0.6;}}
    if(r.hp<=0){r.eng=null;rbPousar(r);feed(RT(r).nome+' quebrou e soltou do engate: conserte (segure E nele)',true);sfx('quebrar',r.x,r.z,1);return;}
    const yaw2=Math.atan2(H[0]-(r.x+T.eixo*Math.sin(r.yaw)),H[2]-(r.z+T.eixo*Math.cos(r.yaw)));r.yaw=yaw2;const f2x=Math.sin(yaw2),f2z=Math.cos(yaw2);r.x=H[0]-f2x*Lta-f2x*T.eixo;r.z=H[2]-f2z*Lta-f2z*T.eixo;}
  const mov=Math.hypot(r.x-ox,r.z-oz);r.giro+=mov/T.ri*Math.sign(v.v||1);
  /* altura: o eixo no chão e a lança no engate */
  const gA=chaoVeic(ax,az),sp=clamp(-(H[1]-gA-T.lanTampa)/Lta,-0.45,0.45);r.pitch=Math.asin(sp);r.y=gA+T.eixo*sp;
  const rx=Math.cos(r.yaw),rz=-Math.sin(r.yaw),gl=chaoVeic(r.x+rx*T.hw,r.z+rz*T.hw),gr=chaoVeic(r.x-rx*T.hw,r.z-rz*T.hw);r.roll=lerp(r.roll,Math.atan2(gl-gr,T.hw*2),dt>0?Math.min(1,dt*8):1);
  if(!snap&&dt>0&&v.v<-0.2&&RIO.ok){const w=rbLocal(r,0,0,T.rampa+0.3);if(aguaProfVeic(w[0],w[2])>1.1){v.v=0;if(!r.avisouA||G.t>r.avisouA){r.avisouA=G.t+4;feed('Fundo demais para o reboque: daqui o barco já sai (segure E no reboque)',true);}}}
  if(trava&&!snap&&dt>0){if(v.v<-0.3){v.v=0;if(!r.avisouT||G.t>r.avisouT){r.avisouT=G.t+4;feed('O reboque dobrou e travou: ande para a frente para endireitar',true);sfx('madeira',r.x,r.z,0.5);}}}
  /* zumbis na frente do reboque: empurra; rápido, machuca */
  if(!snap&&Math.abs(v.v)>0.3)for(const z of Z){if(!z.vivo)continue;const dx=z.x-r.x,dz=z.z-r.z;if(dx*dx+dz*dz>(T.hd+1)**2)continue;const lz=dx*fx+dz*fz,lx=dx*fz-dz*fx;if(Math.abs(lz)>T.hd||Math.abs(lx)>T.hw+0.3)continue;
    const p=T.hw+0.35-Math.abs(lx),sg=lx>=0?1:-1;z.x+=fz*sg*p*0.6;z.z+=-fx*sg*p*0.6;if(Math.abs(v.v)>4&&!(z.rbT>G.t)){z.rbT=G.t+0.6;ferirZ(z,Math.abs(v.v)*4,fz*sg*1.5,-fx*sg*1.5,false);}}
  if(r.col&&!snap){colRemove(r.col);r.col=null;}}
/* a carga em cima do reboque */
function rbCargaPose(r){const v=r.carga;if(!v)return;const T=RT(r),q=(T.carga[v.tipo]||[0,T.deck,-0.3]),w=rbLocal(r,q[0],q[1],q[2]);v.x=w[0];v.y=w[1];v.z=w[2];v.yaw=r.yaw;v.pitch=r.pitch;v.roll=r.roll;v.v=0;
  if(v.col){colRemove(v.col);v.col=null;}}
/* efeito no jeito de dirigir: quanto mais peso para a força do veículo, pior */
function rbEfeito(v,r){const E=ENGATE[v.tipo]||{forca:1},q=clamp(rbPeso(r)/E.forca,0,1.3);return{v:1-0.35*q,a:1-0.5*q,c:1+0.9*q,f:1-0.4*q,g:1-0.25*q,q};}
{const _uv=updateVeic;updateVeic=function(v,dt){if(v&&v.sobre){rbCargaPose(v.sobre);return;}if(v&&v.guinchando)return;const r=rbDe(v);if(!r)return _uv.apply(this,arguments);
  if(r.gu)rbGuinchoCancela(r);
  const T=VT(v),k=rbEfeito(v,r),guarda={maxV:T.maxV,ace:T.ace,cons:T.cons},v0=v.v,y0=v.yaw;T.maxV*=k.v;T.ace*=k.a;T.cons*=k.c;
  try{_uv.apply(this,arguments);}finally{T.maxV=guarda.maxV;T.ace=guarda.ace;T.cons=guarda.cons;}
  /* freia mais longe e vira mais devagar */
  if(v0>0.3&&v.v<v0)v.v=v0-(v0-v.v)*k.f;else if(v0<-0.3&&v.v>v0)v.v=v0+(v.v-v0)*k.f;
  const dy=angDiff(y0,v.yaw)*k.g;v.yaw=y0+dy;
  rbSeguir(r,v,dt,false);
  /* carga solta: freada forte ou curva rápida fazem escorregar */
  if(r.carga&&!r.presa&&dt>0){const freia=Math.max(0,(Math.abs(v0)-Math.abs(v.v))/dt),lado=Math.abs(v.v*dy/dt);r.solta=(r.solta||0)*Math.exp(-dt*0.3)+dt*(Math.max(0,freia-5.5)*0.3+Math.max(0,lado-4)*0.25);
    if(!r.avisouS&&Math.abs(v.v)>2){r.avisouS=true;toast('corpo','A carga do reboque está solta: numa freada forte ela cai. Desça e prenda com 2 cordas (segure E no reboque).');}
    if(r.solta>=1)rbCargaCai(r,'freada');}
  if(r.carga)rbCargaPose(r);};}
/* batida forte com o veículo: carga solta cai; presa, só se machuca */
var veicCarga;   /* 47_carro chama veicCarga(veículo, velocidade) quando bate forte */
{veicCarga=function(c,hitV){const r=rbDe(c);if(!r||!r.carga)return;
  if(!r.presa)rbCargaCai(r,'batida');else if(hitV>12){r.carga.hp=Math.max(0,r.carga.hp-(hitV-12)*2);}};}
function rbCargaCai(r,porque){const v=r.carga;if(!v)return;const T=RT(r);let alvo=null;
  for(const[lx,lz]of[[T.hw+1.6,-0.4],[-T.hw-1.6,-0.4],[0,T.rampa-2.4],[T.hw+1.8,-1.8],[-T.hw-1.8,-1.8]]){const w=rbLocal(r,lx,0,lz);if(!pointBlocked(w[0],w[2],0.9)){alvo=w;break;}}
  if(!alvo)alvo=rbLocal(r,T.hw+1.6,0,-0.4);r.carga=null;r.presa=false;r.solta=0;v.sobre=null;v.x=alvo[0];v.z=alvo[2];v.y=veicChao(v,v.x,v.z);v.pitch=0;v.roll=0;v.v=0;
  v.hp=Math.max(0,v.hp-(VTIPOS[v.tipo].agua?8:15));veicColisor(v);sfx('quebrar',v.x,v.z,0.8);P.shake=Math.max(P.shake||0,0.4);
  feed((vArt(v)==='a'?'A ':'O ')+vNome(v)+' caiu do reboque'+(porque==='batida'?' na batida':'')+'! Prenda a carga com corda.',true);if(r.col)rbColisor(r);}
/* a carga em cima não anda, não entra nem tem colisão própria */
{const _vcol=veicColisor;veicColisor=function(v){if(v&&v.sobre){if(v.col){colRemove(v.col);v.col=null;}return;}return _vcol.apply(this,arguments);};}
{const _ev=entrarVeic;entrarVeic=function(v){if(v&&v.sobre){feed((vArt(v)==='a'?'A ':'O ')+vNome(v)+' está no reboque: descarregue antes (segure E no reboque)',true);sfx('vazio');return;}
  if(v&&v.guinchando){feed('Espere o guincho terminar',true);return;}return _ev.apply(this,arguments);};}
{const K=INTER_K.veic,_t=K.texto,_u=K.usar,_c=K.curto;K.texto=function(v){if(v&&v.sobre)return{t:VTIPOS[v.tipo].nome+' no reboque',s:'segure: oficina do veículo (dá para consertar em cima)',alt:true,dur:0.6};return _t.apply(this,arguments);};
  K.usar=function(v,seg){if(v&&v.sobre){if(seg)abrirVeiculo(v);else entrarVeic(v);return;}return _u.apply(this,arguments);};K.curto=function(v){if(v&&v.sobre){entrarVeic(v);return;}return _c.apply(this,arguments);};}
/* ---------- guincho: puxa o veículo (ou o barco) até o reboque, ou até a frente da caminhonete ---------- */
function rbCandidatos(r){const T=RT(r),A=rbLocal(r,0,0,T.rampa);return VEICS.filter(v=>T.aceita.includes(v.tipo)&&!v.ativo&&!v.sobre&&!rbDe(v)&&!v.guinchando&&Math.hypot(v.x-A[0],v.z-A[2])<16)
  .sort((a,b)=>Math.hypot(a.x-A[0],a.z-A[2])-Math.hypot(b.x-A[0],b.z-A[2]));}
function rbGuinchar(r,v){const T=RT(r);if(r.carga)return'Já tem carga em cima';if(r.gu)return'O guincho já está puxando';if(r.eng&&r.eng.ativo)return'Desça do veículo para usar o guincho';
  if(!v)return T.aceita.includes('barco')?'Nenhum barco ou jangada a até 16 m da traseira':'Nenhum carro, moto ou triciclo a até 16 m da traseira';
  if(r.eng){const m=rbPodePuxar(r.eng,r,v);if(m)return m;}
  const q=T.carga[v.tipo]||[0,T.deck,-0.3],fim=rbLocal(r,q[0],q[1],q[2]),rp=rbLocal(r,0,0.05,T.rampa-1.2),meio=[rp[0],Math.max(rp[1],veicChao(v,rp[0],rp[2])),rp[2]];
  const pts=[[v.x,v.y,v.z,v.yaw],[meio[0],meio[1],meio[2],r.yaw],[fim[0],fim[1],fim[2],r.yaw]],L1=Math.hypot(pts[1][0]-pts[0][0],pts[1][2]-pts[0][2]),L2=Math.hypot(pts[2][0]-pts[1][0],pts[2][2]-pts[1][2]);
  r.gu={v,pts,L:[L1,L2],t:0,dur:(L1+L2)/1.6+0.6,tipo:'carregar'};v.guinchando=true;if(v.col){colRemove(v.col);v.col=null;}v.v=0;sfx('clique',r.x,r.z,0.8);return'';}
function rbDescarregar(r){const T=RT(r),v=r.carga;if(!v)return'Não tem carga';if(r.gu)return'Espere o guincho';if(r.eng&&r.eng.ativo)return'Desça do veículo antes';
  let alvo=null;if(VTIPOS[v.tipo].agua){for(let d=1;d<=11;d+=0.5){const w=rbLocal(r,0,0,T.rampa-d),n=RIO.ok?aguaNivel(w[0],w[2]):null;if(n!==null&&n-ground(w[0],w[2])>(v.tipo==='jangada'?0.5:0.7)){alvo=[w[0],n-0.22,w[2]];break;}}
      if(!alvo)return'Encoste a traseira do reboque na beira da água (até 10 m)';}
  else{const w=rbLocal(r,0,0,T.rampa-2.6),agua=RIO.ok?aguaProfVeic(w[0],w[2]):0;if(pointBlocked(w[0],w[2],0.9)||agua>0.4)return'Atrás da rampa não tem espaço livre para descer '+(vArt(v)==='a'?'a ':'o ')+vNome(v);alvo=[w[0],chaoVeic(w[0],w[2]),w[2]];}
  const q=T.carga[v.tipo]||[0,T.deck,-0.3],ini=rbLocal(r,q[0],q[1],q[2]),rp=rbLocal(r,0,0.05,T.rampa-1.2);
  const pts=[[ini[0],ini[1],ini[2],r.yaw],[rp[0],Math.max(rp[1],chaoVeic(rp[0],rp[2])),rp[2],r.yaw],[alvo[0],alvo[1],alvo[2],r.yaw]];
  if(r.presa){invAdd('corda',2);r.presa=false;}r.carga=null;v.sobre=null;r.gu={v,pts,L:[Math.hypot(pts[1][0]-pts[0][0],pts[1][2]-pts[0][2]),Math.hypot(pts[2][0]-pts[1][0],pts[2][2]-pts[1][2])],t:0,dur:2.6,tipo:'descer'};
  v.guinchando=true;sfx('clique',r.x,r.z,0.8);return'';}
function rbGuinchoCancela(r){const g=r.gu;if(!g)return;r.gu=null;const v=g.v;v.guinchando=false;v.y=veicChao(v,v.x,v.z);v.pitch=0;veicColisor(v);feed('O guincho soltou: o reboque andou',true);}
/* passo do guincho (anima o veículo pelo caminho; o cabo aparece enquanto puxa) */
function rbGuinchoPasso(r,dt){const g=r.gu;if(!g)return;const v=g.v;g.t+=dt;const f=clamp(g.t/g.dur,0,1),Lt=g.L[0]+g.L[1]||1,d=f*Lt;let a,b,u;
  if(d<=g.L[0]){a=g.pts[0];b=g.pts[1];u=g.L[0]?d/g.L[0]:1;}else{a=g.pts[1];b=g.pts[2];u=g.L[1]?(d-g.L[0])/g.L[1]:1;}
  v.x=lerp(a[0],b[0],u);v.z=lerp(a[2],b[2],u);v.y=lerp(a[1],b[1],u);v.yaw=a[3]+angDiff(a[3],b[3])*u;v.pitch=d>g.L[0]&&g.tipo==='carregar'?-0.12*(1-u):0;v.roll=0;
  g.som=(g.som||0)-dt;if(g.som<=0){g.som=0.3;sfx('clique',r.x,r.z,0.45);}
  if(f>=1){v.guinchando=false;r.gu=null;if(g.tipo==='carregar'){r.carga=v;v.sobre=r;r.presa=false;r.solta=0;r.avisouS=false;rbCargaPose(r);if(r.col)rbColisor(r);
      feed((vArt(v)==='a'?'A ':'O ')+vNome(v)+' subiu no reboque. Prenda com 2 cordas antes de andar.');progresso('guincho');ganharXP(4);}
    else{v.y=veicChao(v,v.x,v.z);veicColisor(v);if(r.col)rbColisor(r);feed((vArt(v)==='a'?'A ':'O ')+vNome(v)+(VTIPOS[v.tipo].agua?' está na água.':' desceu do reboque.'));}}}
/* guincho da caminhonete: puxa outro veículo até a frente dela */
function gcCandidatos(c){const F=carroLocal(0,0,VTIPOS[c.tipo].hd+0.3,c);return VEICS.filter(v=>v!==c&&!v.ativo&&!v.sobre&&!v.guinchando&&!VTIPOS[v.tipo].voa&&Math.hypot(v.x-F[0],v.z-F[2])<18&&Math.hypot(v.x-F[0],v.z-F[2])>2.5)
  .sort((a,b)=>Math.hypot(a.x-F[0],a.z-F[2])-Math.hypot(b.x-F[0],b.z-F[2]));}
const GC=[];
function gcPuxar(c,v){if(!c.guincho)return'A caminhonete não tem guincho';if(!v)return'Nenhum veículo a até 18 m da frente';if(c.ativo)return'Desça para usar o guincho';
  const T=VTIPOS[c.tipo],TV=VTIPOS[v.tipo],F=carroLocal(0,0,T.hd+0.4+TV.hd,c),y=TV.agua&&RIO.ok&&aguaNivel(F[0],F[2])!==null?aguaNivel(F[0],F[2])-0.22:chaoVeic(F[0],F[2]);
  const r=rbDe(v);if(r){r.eng=null;rbPousar(r);rbColisor(r);}
  GC.push({c,v,x0:v.x,z0:v.z,y0:v.y,yaw0:v.yaw,x1:F[0],z1:F[2],y1:y,yaw1:Math.atan2(c.x-F[0],c.z-F[2]),t:0,dur:Math.hypot(F[0]-v.x,F[2]-v.z)/1.4+0.5});v.guinchando=true;if(v.col){colRemove(v.col);v.col=null;}sfx('motor',c.x,c.z,0.5);return'';}
PASSOS.push(function reboquesPasso(dt){
  for(const r of REBOQUES){if(r.eng&&!VEICS.includes(r.eng)){r.eng=null;rbPousar(r);}if(r.gu)rbGuinchoPasso(r,dt);
    if(r.eng&&!r.eng.ativo&&!r.col&&Math.abs(r.eng.v)<0.05)rbColisor(r);if(r.carga)rbCargaPose(r);
    r.rampa=approach(r.rampa||0,r.gu||(!r.eng&&!r.carga)?1:0,dt*1.5);}
  for(let i=GC.length-1;i>=0;i--){const g=GC[i],v=g.v;g.t+=dt;const u=clamp(g.t/g.dur,0,1);v.x=lerp(g.x0,g.x1,u);v.z=lerp(g.z0,g.z1,u);v.y=lerp(g.y0,g.y1,u);v.yaw=g.yaw0+angDiff(g.yaw0,g.yaw1)*u*0.6;
    g.som=(g.som||0)-dt;if(g.som<=0){g.som=0.3;sfx('clique',g.c.x,g.c.z,0.45);}if(g.c.ativo||Math.hypot(g.c.v||0)>0.2){GC.splice(i,1);v.guinchando=false;veicColisor(v);continue;}
    if(u>=1){GC.splice(i,1);v.guinchando=false;v.y=veicChao(v,v.x,v.z);veicColisor(v);feed((vArt(v)==='a'?'A ':'O ')+vNome(v)+' chegou na frente da caminhonete.');progresso('guincho');}}});
/* ---------- interação: na lança engata e desengata; segurando, o painel do reboque ---------- */
ESTACOES.reboque={nome:'Reboque',icon:'i-reboque',ir:'',chip:'Reboque'};
INTERS.push(function rbInter(tryIt){if(!P.alive||CARRO&&CARRO.ativo)return;for(const r of REBOQUES){if(Math.abs(r.x-P.x)>7||Math.abs(r.z-P.z)>7)continue;const T=RT(r),c=Math.cos(r.yaw),s=Math.sin(r.yaw),dx=P.x-r.x,dz=P.z-r.z;
  const lx=clamp(dx*c-dz*s,-T.hw,T.hw),lz=clamp(dx*s+dz*c,T.rampa,T.lanca);tryIt({k:'reboque',o:r},r.x+lx*c+lz*s,r.z-lx*s+lz*c,1.9,1.9,-0.6,r.y);}});
function rbResumo(r){const T=RT(r);return r.carga?(vArt(r.carga)==='a'?'com a ':'com o ')+vNome(r.carga)+(r.presa?' (presa)':' (solta)'):'vazi'+rbArt(T);}
INTER_K.reboque={texto:r=>{const T=RT(r);if(r.gu)return{t:'Guincho puxando…',s:T.nome};
    if(r.eng)return{t:'Desengatar d'+vArt(r.eng)+' '+vNome(r.eng),s:T.nome+' '+rbResumo(r)+' · segure: carga e guincho',alt:true,dur:0.6};
    const v=rbVeicPerto(r);if(v)return{t:'Engatar n'+vArt(v)+' '+vNome(v),s:T.nome+' '+rbResumo(r)+' · segure: carga e guincho',alt:true,dur:0.6};
    return{t:T.nome,s:rbResumo(r)+' · toque: carga e guincho'};},
  usar:(r,seg)=>{if(seg||(!r.eng&&!rbVeicPerto(r))){rbAbrir(r);return;}INTER_K.reboque.curto(r);},
  curto:r=>{if(r.gu)return;let m='';if(r.eng)m=rbDesengatar(r);else{const v=rbVeicPerto(r);if(!v){rbAbrir(r);return;}m=rbEngatar(r,v);if(!m)feed(RT(r).nome+' engatad'+rbArt(RT(r))+' n'+vArt(v)+' '+vNome(v));}
    if(m){feed(m,true);sfx('vazio');}else if(!r.eng)feed(RT(r).nome+' desengatad'+rbArt(RT(r)));}};
function rbAbrir(r){if(G.modo!=='jogo')return;abrirEstacao({estTipo:'reboque',r,ext:{},nome:RT(r).nome});}
ESTACAO_UI.reboque={resumo:st=>rbResumo(st.r),
  render(st){const r=st.r,T=RT(r),v=r.carga,A=[];let c='<div class="es-lista">';
    c+='<div class="es-vaga'+(r.eng?' pronta':'')+'">'+svgUse(r.tipo==='plataformaReboque'?'i-platReboque':'i-reboque')+'<span><b>'+(r.eng?'Engatad'+rbArt(T)+' n'+vArt(r.eng)+' '+vNome(r.eng):'Solt'+rbArt(T))+'</b><small>Estado '+Math.round(r.hp)+'% · peso '+Math.round(rbPeso(r)*100)+'</small></span></div>';
    c+='<div class="es-vaga'+(v&&r.presa?' pronta':'')+'">'+svgUse(v?(VTIPOS[v.tipo].agua?'i-barco':'i-carro'):'i-guincho')+'<span><b>'+(v?(vArt(v)==='a'?'A ':'O ')+vNome(v):'Sem carga')+'</b><small>'+(v?(r.presa?'presa com corda':'SOLTA: cai numa freada forte'):'leva: '+T.aceita.map(t=>VTIPOS[t].nome.toLowerCase()).join(', '))+'</small></span></div></div>';
    const puxa=Object.keys(ENGATE).map(t=>{const m=rbPodePuxar({tipo:t},r);return VTIPOS[t].nome.toLowerCase()+(m?' (não)':'');}).join(', ');
    c+='<p class="es-info">Quem puxa assim: '+puxa+'. Engate: pare a traseira do veículo na lança e toque E nela.</p>';
    if(r.gu)A.push({id:'nada',t:'Guincho puxando…',s:'espere',ok:false});
    else{const veic=r.eng||rbVeicPerto(r);A.push(r.eng?{id:'desengatar',t:'Desengatar',s:'d'+vArt(r.eng)+' '+vNome(r.eng),ok:!r.eng.ativo}:{id:'engatar',t:'Engatar',s:veic?'n'+vArt(veic)+' '+vNome(veic):'encoste a traseira de um veículo na lança',ok:!!veic});
      if(!v){const cand=rbCandidatos(r)[0];A.push({id:'guincho',t:'Puxar com o guincho',s:cand?(vArt(cand)==='a'?'a ':'o ')+vNome(cand)+' a '+Math.round(Math.hypot(cand.x-r.x,cand.z-r.z))+' m':'nada a até 16 m da traseira',ok:!!cand,prim:!!cand});}
      else{A.push(r.presa?{id:'soltar',t:'Soltar a carga',s:'as 2 cordas voltam',ok:true}:{id:'prender',t:'Prender a carga',s:'2 cordas (tem '+invCount('corda')+')',ok:invCount('corda')>=2,prim:true});
        A.push({id:'descarregar',t:VTIPOS[v.tipo].agua?'Pôr na água':'Descer pela rampa',s:VTIPOS[v.tipo].agua?'traseira na beira da água':'precisa de espaço atrás',ok:true});}
      A.push({id:'oficinaCarga',t:'Oficina d'+(v?vArt(v)+' '+vNome(v):'a carga'),s:v?'consertar em cima do reboque':'sem carga',ok:!!v});
      if(r.hp<100)A.push({id:'consertar',t:'Consertar o reboque',s:'2 sucata e 2 pregos: +40%',ok:invCount('sucata')>=2&&invCount('pregos')>=2});}
    return{sub:T.nome+' · '+rbResumo(r),corpo:c,acoes:A};},
  acao(st,id){const r=st.r;let m='';
    switch(id){case'engatar':{m=rbEngatar(r,rbVeicPerto(r));if(!m)return'Engatado.';return m;}
      case'desengatar':m=rbDesengatar(r);return m||'Desengatado.';
      case'guincho':{m=rbGuinchar(r,rbCandidatos(r)[0]);if(m)return m;fecharEstacao();feed('O guincho está puxando…');return'';}
      case'prender':if(invCount('corda')<2)return'Precisa de 2 cordas.';invRemove('corda',2);r.presa=true;r.solta=0;sfx('pegar');return'Carga presa com corda.';
      case'soltar':invAdd('corda',2);r.presa=false;sfx('pegar');return'Carga solta (as cordas voltaram).';
      case'descarregar':{m=rbDescarregar(r);if(m)return m;fecharEstacao();return'';}
      case'oficinaCarga':if(r.carga){const v=r.carga;fecharEstacao();abrirVeiculo(v);}return'';
      case'consertar':if(invCount('sucata')<2||invCount('pregos')<2)return'Faltam materiais.';invRemove('sucata',2);invRemove('pregos',2);r.hp=Math.min(100,r.hp+40);sfx('construir');return'Reboque em '+Math.round(r.hp)+'%.';}
    return'';}};
/* ---------- guincho da caminhonete (melhoria na oficina do veículo) ---------- */
var veicMelhorias,veicMelhoriaAcao;   /* 47_carro mostra as melhorias na oficina do veículo, se existirem */
{const _vm=null,_va=null;
  veicMelhorias=function(v){const L=_vm?_vm.apply(this,arguments)||[]:[];{const r=rbDe(v);if(r)L.push({id:'rbSoltar',t:'Desengatar o reboque',s:RT(r).nome.toLowerCase(),ok:true});}if(v.tipo!=='caminhonete')return L;const kit=invCount('kitFerramentas')>0;
    if(!v.guincho)L.push({id:'gcInstalar',t:'Instalar guincho na frente',s:'4 sucata, 2 corda e 1 peça de motor'+(kit?'':' (precisa do kit de ferramentas)'),ok:kit&&invHas({sucata:4,corda:2,pecaVeiculo:1})});
    else{const c=gcCandidatos(v)[0];L.push({id:'gcPuxar',t:'Puxar com o guincho',s:c?(vArt(c)==='a'?'a ':'o ')+vNome(c)+' a '+Math.round(Math.hypot(c.x-v.x,c.z-v.z))+' m':'nenhum veículo a até 18 m da frente',ok:!!c});}
    return L;};
  veicMelhoriaAcao=function(v,id){if(id==='gcInstalar'){const kit=P.inv.find(s=>s&&s.id==='kitFerramentas');if(!kit||!invHas({sucata:4,corda:2,pecaVeiculo:1}))return'Faltam materiais ou o kit.';
      invPay({sucata:4,corda:2,pecaVeiculo:1});gastar(kit,2);v.guincho=true;sfx('construir');return'Guincho instalado: puxa outro veículo (mesmo quebrado) até a frente da caminhonete.';}
    if(id==='gcPuxar'){const m=gcPuxar(v,gcCandidatos(v)[0]);if(m)return m;fecharVeiculo();feed('O guincho está puxando…');return'';}
    if(id==='rbSoltar'){const r=rbDe(v);if(r){const m=rbDesengatar(r);return m||'Reboque desengatado.';}return'';}
    return _va?_va.apply(this,arguments):'';};}
/* outras melhorias de outros tipos de veículo continuam: a oficina usa só quem chama primeiro */
{const _vs=veicSalvar,_vca=veicCarregar;veicSalvar=function(){const L=_vs.apply(this,arguments);for(const s of L){const v=VEICS.find(q=>q.id===s.id);if(v&&v.guincho)s.guincho=true;}return L;};
  veicCarregar=function(lista){const r=_vca.apply(this,arguments);if(Array.isArray(lista))for(const s of lista){const v=s&&VEICS.find(q=>q.id===s.id);if(v)v.guincho=!!s.guincho;}return r;};
  V8.salvar.veiculos=veicSalvar;V8.carregar.veiculos=s=>{if(Array.isArray(s))veicCarregar(s);};}
/* ---------- malhas ---------- */
INIT_MALHAS.push(function malhasReboques(){const R=rng(1818),mk=f=>{const g=new GB(4096,8);f(g);return litMesh(g.data());},aco=lin(0x5d6468),aco2=lin(0x3e4447),esc=lin(0x232526),mad=lin(0x6e5235),mad2=lin(0x5b432b),
    am=lin(0xc9a227),ve=lin(0x9a1a14),ve2=lin(0x7a2e2a),A=(g,t,m,c,o)=>add(g,t,m,c,o||{j:0.03,rnd:R});
  const lanca=(g,z0,z1,x0,y)=>{const L=Math.hypot(z1-z0,x0),a=Math.atan2(x0,z1-z0);for(const s of[1,-1])A(g,boxTris(0.08,0.09,L),mat(s*x0/2,y,(z0+z1)/2,0,-s*a,0),aco);A(g,boxTris(0.14,0.12,0.26),mat(0,y+0.02,z1),esc);
    A(g,cylTris(0.04,0.04,0.4,6),mat(0.14,y-0.2,z1-0.35),aco2);A(g,cylTris(0.07,0.07,0.04,8),mat(0.14,y-0.42,z1-0.35),esc);};
  MESH.reboqueBarco=mk(g=>{const y=0.5;for(const s of[1,-1])A(g,boxTris(0.09,0.11,4.55),mat(s*0.48,y,-0.2),aco);for(const z of[-2.2,-0.65,0.8,1.6])A(g,boxTris(1.05,0.08,0.09),mat(0,y,z),aco);
    lanca(g,1.6,2.75,0.96,y);A(g,cylTris(0.05,0.05,1.9,7),mat(0,0.33,-0.65,0,0,Math.PI/2),aco2);
    for(const s of[1,-1]){A(g,boxTris(0.16,0.06,3.3),mat(s*0.36,0.64,-0.45,0,0,s*0.38),mad);A(g,boxTris(0.34,0.04,0.86),mat(s*0.92,0.74,-0.65),aco2);A(g,boxTris(0.2,0.08,0.05),mat(s*0.75,0.5,-2.47),ve,{e:1.0});}
    A(g,boxTris(0.1,0.6,0.1),mat(0,0.8,1.75),aco);A(g,cylTris(0.08,0.08,0.24,9),mat(0,1.02,1.75,0,0,Math.PI/2),esc);A(g,boxTris(0.03,0.2,0.03),mat(0.15,0.95,1.75),aco2);
    A(g,boxTris(0.3,0.16,0.08),mat(0,0.62,1.78),mad2);});
  MESH.plataformaReboque=mk(g=>{const y=0.68;for(const s of[1,-1])A(g,boxTris(0.12,0.14,5.4),mat(s*0.62,y,-0.2),aco2);for(let i=0;i<11;i++)A(g,boxTris(2.2,0.08,0.48),mat(0,0.8,-2.55+i*0.5),i%2?mad:mad2);
    for(const s of[1,-1]){A(g,boxTris(0.07,0.12,5.4),mat(s*1.1,0.88,-0.2),aco);A(g,boxTris(0.32,0.04,1.95),mat(s*1.08,0.86,-1.15),aco2);A(g,boxTris(0.22,0.08,0.05),mat(s*0.9,0.74,-2.82),ve,{e:1.0});}
    lanca(g,2.4,3.45,1.24,0.6);for(const z of[-0.7,-1.6])A(g,cylTris(0.05,0.05,2.2,7),mat(0,0.36,z,0,0,Math.PI/2),aco2);
    A(g,boxTris(0.9,0.3,0.4),mat(0,1.0,2.4),aco);A(g,cylTris(0.12,0.12,0.7,10),mat(0,1.18,2.4,0,0,Math.PI/2),esc);A(g,boxTris(0.25,0.22,0.3),mat(0.6,1.0,2.4),am,{e:0.15});});
  MESH.rbRampa=mk(g=>{A(g,boxTris(0.45,0.06,1.3),mat(0,0,-0.65),aco);for(let i=0;i<5;i++)A(g,boxTris(0.45,0.03,0.04),mat(0,0.04,-0.15-i*0.25),aco2);});
  MESH.rbCabo=mk(g=>{add(g,boxTris(1,1,1),mat(0,0,0.5),esc);});
  MESH.gcGuincho=mk(g=>{A(g,boxTris(1.3,0.28,0.25),mat(0,0.62,2.62),aco2);A(g,cylTris(0.11,0.11,0.6,9),mat(0,0.66,2.7,0,0,Math.PI/2),esc);A(g,boxTris(0.12,0.12,0.12),mat(0,0.66,2.86),aco);});
  MESH.obra.reboqueBarco=MESH.reboqueBarco;MESH.obra.plataformaReboque=MESH.plataformaReboque;});
const _RB=M4(),_RB2=M4(),_RB3=M4();
function rbDesenhar(Pg){for(const r of REBOQUES){if(d2(r.x,r.z,cam.pos[0],cam.pos[2])>150*150)continue;const T=RT(r),m=MESH[r.tipo];if(!m)continue;trs(_RB,r.x,r.y,r.z,r.pitch,r.yaw,r.roll,1,1,1);
    if(Pg===PL)gl.uniform3f(PL.u.uTint,r.hp>30?1:0.6,r.hp>30?1:0.55,r.hp>30?1:0.5);drawStat(Pg,m,_RB);
    for(const w of T.rodas){const dr=w[0]<0;trs(_RB2,w[0],w[1],w[2],dr?-r.giro:r.giro,dr?Math.PI:0,0,w[3]*0.6,w[3],w[3]);mul(_RB3,_RB,_RB2);drawStat(Pg,MESH.roda,_RB3);}
    if(r.tipo==='plataformaReboque'&&MESH.rbRampa)for(const s of[1,-1]){const a=lerp(1.45,-0.62,r.rampa||0);trs(_RB2,s*0.65,0.8,T.rampa,a,0,0,1,1,1);mul(_RB3,_RB,_RB2);drawStat(Pg,MESH.rbRampa,_RB3);}
    if(Pg===PL)gl.uniform3f(PL.u.uTint,1,1,1);
    /* cabo do guincho */
    if(r.gu&&MESH.rbCabo){const a=rbLocal(r,T.guincho[0],T.guincho[1],T.guincho[2]),v=r.gu.v,b=carroLocal(0,0.5,VTIPOS[v.tipo].hd*0.9,v);if(r.gu.tipo==='carregar')rbCabo(Pg,a,b);}}
  for(const g of GC){const a=carroLocal(0,0.66,VTIPOS[g.c.tipo].hd+0.3,g.c),b=carroLocal(0,0.5,-VTIPOS[g.v.tipo].hd*0.9,g.v);rbCabo(Pg,a,b);}
  for(const v of VEICS)if(v.guincho&&MESH.gcGuincho&&d2(v.x,v.z,cam.pos[0],cam.pos[2])<120*120&&!(v.ativo&&cfg.cam==='1')){trs(_RB,v.x,v.y,v.z,v.pitch,v.yaw,v.roll,1,1,1);drawStat(Pg,MESH.gcGuincho,_RB);}}
function rbCabo(Pg,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz);if(L<0.05)return;trs(_RB2,a[0],a[1],a[2],-Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(dx,dz),0,0.025,0.025,L);drawStat(Pg,MESH.rbCabo,_RB2);}
{const _dc=desenharCarro;desenharCarro=function(Pg){_dc.apply(this,arguments);rbDesenhar(Pg);};}
/* ---------- no mapa ---------- */
MAPA_DESENHOS.push((g,X,Y,k)=>{for(const r of REBOQUES){const T=RT(r);g.save();g.translate(X(r.x),Y(r.z));g.rotate(-r.yaw);g.fillStyle=r.eng?'#e0c77e':'#b49a6a';g.fillRect(-T.hw*k,-T.hd*k,T.hw*2*k,T.hd*2*k);g.restore();}});
/* ---------- HUD: dirigindo com reboque ---------- */
HUDS.push(()=>{const c=CARRO,el=$('pc-extra');if(!el||!c||!c.ativo)return;const r=rbDe(c);if(!r||el.textContent.includes('Reboque'))return;
  el.textContent+=' · Reboque'+(r.carga?': '+vNome(r.carga)+(r.presa?' (presa)':' (SOLTA)'):' vazio');});
/* ---------- construir mais reboques (aba Oficina) ---------- */
Object.assign(OBRAS,{reboqueBarco:{nome:'Reboque de barco',icon:'i-reboque',custo:{sucata:8,tabuas:4,pneu:2,pregos:4},hp:200,hw:0.95,hd:2.6,solid:true,etapa:3,desb:'oficina',reboque:true,
    desc:'Leva o barco a motor ou a jangada. Engate na caminhonete, no carro ou no triciclo (só com a jangada).'},
  plataformaReboque:{nome:'Plataforma de reboque',icon:'i-platReboque',custo:{sucata:14,chapaFerro:3,pneu:4,corda:2,tabuas:6},hp:260,hw:1.15,hd:3.0,solid:true,etapa:3,desb:'oficina',reboque:true,
    desc:'Leva carro, moto ou triciclo, mesmo quebrado: o guincho puxa para cima. Engate na caminhonete (ou no carro, com moto ou triciclo).'}});
OBRA_ORDEM.push('reboqueBarco','plataformaReboque');for(const k of['reboqueBarco','plataformaReboque'])if(!OBRAS_CHAO.includes(k))OBRAS_CHAO.push(k);
{const of=OBRA_CATS.find(c=>c.id==='oficina');if(of)of.t.push('reboqueBarco','plataformaReboque');}
Object.assign(BASE_DICAS,{reboqueBarco:'Reboque de barco: encoste a traseira da caminhonete (ou do carro) na lança e toque E na lança para engatar.',plataformaReboque:'Plataforma: o guincho puxa um veículo (mesmo quebrado) para cima. Prenda com 2 cordas antes de andar.'});
{const _co=colocarObra;colocarObra=function(){const t=OBRA.ativo&&!OBRA.mov?OBRA.tipo:null,n0=OB.length,r=_co.apply(this,arguments);
  if(t&&RTIPOS[t]&&OB.length>n0){const o=OB[OB.length-1];if(o&&o.tipo===t){const x=o.x,z=o.z,yaw=o.yaw;destruirObraSilenciosa(o);const rb=rbNovo(t,x,z,yaw);feed(RT(rb).nome+' pronto: engate num veículo (traseira na lança, E).');}}return r;};}
/* ---------- onde ficam no começo ---------- */
function rbLugar(cx,cz,raio,longeDe){let best=null,bs=1e9;for(let r=0;r<=raio;r+=1.5)for(let a=0;a<6.28;a+=0.4){const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(!dentroMapa(x,z,6))continue;
    if(RIO.ok&&(aguaNivel(x,z)!==null||aguaPerto(x,z,2.5)))continue;if(typeof aguaPoi==='function'&&aguaPoi(x,z))continue;let ok=true;const g0=ground(x,z);
    for(const[dx,dz]of[[0,0],[2.6,0],[-2.6,0],[0,2.6],[0,-2.6],[1.6,1.6],[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6]]){if(pointBlocked(x+dx,z+dz,0.6)||Math.abs(ground(x+dx,z+dz)-g0)>0.9){ok=false;break;}}
    if(!ok)continue;const s=r+(longeDe?Math.max(0,8-Math.hypot(x-longeDe[0],z-longeDe[1])):0);if(s<bs){bs=s;best=[x,z];}}return best;}
function rbPadrao(){for(const r of REBOQUES.slice())rbRemover(r);REBOQUES.length=0;GC.length=0;
  const b=VEICS.find(v=>v.id==='barcoCais'),pb=rbLugar(72,78,14,b?[b.x,b.z]:null);if(pb){const yaw=Math.atan2(pb[0]-LAGO.x,pb[1]-LAGO.z);rbNovo('reboqueBarco',pb[0],pb[1],yaw,{id:'reboqueCais'});}
  const t=VEICS.find(v=>v.id==='triFazenda'),pp=rbLugar(t?t.x+6:-73,t?t.z-5:58,14,t?[t.x,t.z]:null);if(pp)rbNovo('plataformaReboque',pp[0],pp[1],0.6,{id:'plataformaSitio'});}
/* ---------- salvar ---------- */
V8.novo.reboques=()=>rbPadrao();
V8.salvar.reboques=()=>REBOQUES.map(r=>({id:r.id,tipo:r.tipo,x:+r.x.toFixed(2),z:+r.z.toFixed(2),yaw:+r.yaw.toFixed(3),hp:Math.round(r.hp),eng:r.eng?r.eng.id:null,carga:r.carga?r.carga.id:null,presa:!!r.presa}));
V8.carregar.reboques=s=>{for(const r of REBOQUES.slice())rbRemover(r);REBOQUES.length=0;GC.length=0;for(const v of VEICS){v.sobre=null;v.guinchando=false;}
  if(!Array.isArray(s)){rbPadrao();return;}
  for(const q of s){if(q&&q.tipo==='plataforma')q.tipo='plataformaReboque';if(!q||!RTIPOS[q.tipo])continue;   // saves da Etapa 18 (nome antigo)
    const r=rbNovo(q.tipo,+q.x||0,+q.z||0,+q.yaw||0,{id:q.id,hp:q.hp});
    const v=q.carga?VEICS.find(x=>x.id===q.carga):null;if(v&&RTIPOS[q.tipo].aceita.includes(v.tipo)&&!REBOQUES.some(o=>o!==r&&o.carga===v)){r.carga=v;v.sobre=r;r.presa=!!q.presa;}
    const e=q.eng?VEICS.find(x=>x.id===q.eng):null;if(e&&ENGATE[e.tipo]&&!rbDe(e)&&!e.sobre){r.eng=e;rbSeguir(r,e,0,true);}else rbPousar(r);
    rbCargaPose(r);rbColisor(r);if(r.carga)veicColisor(r.carga);}};
