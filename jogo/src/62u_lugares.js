/* ================= Lugares escaneados (v10.1) — pedido do Himalaia =================
   Modelos de verdade (escaneados ou feitos para jogo) que o Himalaia baixou do Fab e do Sketchfab, convertidos por
   tools/lugares_banco.py (21h_lugares_dados.js: LUGX). Cada um entra num lugar fixo do mapa (LUGARES abaixo); o mesmo
   modelo pode aparecer em mais de um lugar (o carro destruído, por exemplo), e a malha é uma só.
   · O chão embaixo de cada um é aplainado (só o terreno, sem mexer na lista de lugares, para os jogos salvos continuarem
     valendo), com uma beirada plana em volta (plano) e depois a volta suave ao terreno natural (blend).
   · O que nasceu lá dentro (árvore, pedra, moita, capim, coletável) sai de vez, do mesmo jeito que a ferrovia faz
     (marca .agua: não volta a crescer, não reaparece ao recomeçar o mundo e não vira toco).
   · Colisão: caixas geradas do próprio modelo (paredes, colunas, entulho na altura do corpo); o que o corpo não alcança
     vindo de fora (frestas, cômodos fechados) já vem sólido.
   · Piso andável (galpão): o terreno desce um pouco embaixo do piso escaneado e uma superfície plana na altura do piso
     segura os pés, para o mato não aparecer pelas rachaduras do concreto.
   · Desenha com sombra; enquanto a textura não carrega, não aparece (nada de bloco branco).
   Giro (yaw) na mesma convenção de mat()/colBox: o eixo x do modelo vai para (cos, -sen) no mundo. */
const LUGARES=[
  // lugares achados pela sonda (tools/p249_sonda_lugares.py): chão quase plano, longe do que já existe, frente (+z do modelo) para a estrada
  {id:'galpao',m:'galpao',nome:'Galpão de trens',x:152,z:60,yaw:Math.PI/2,blend:9,plano:3,limpa:3,dist:260,piso:true,afunda:0.15},
  {id:'bunker',m:'bunker',nome:'Bunker',x:4,z:-68,yaw:0.35,blend:6,plano:1,limpa:1.5,dist:170},
  {id:'casaAbandonada',m:'casaAbandonada',nome:'Casa abandonada',x:40,z:-13,yaw:Math.PI/2,blend:7,plano:2,limpa:6,dist:200},     // na esquina da estrada com a da vila
  {id:'predioDestruido',m:'predioDestruido',nome:'Prédio destruído',x:157,z:20,yaw:Math.PI,blend:7,plano:2,limpa:5,dist:240},    // na entrada da cidade, sul da estrada
  {id:'predioAbandonado',m:'predioAbandonado',nome:'Prédio abandonado',x:160,z:-6,yaw:-Math.PI/2,blend:6,plano:1.5,limpa:4,dist:320}, // 9 andares na entrada da cidade, norte da estrada; a fachada (+x do modelo) dá para a estrada
  {id:'ruinaMata',m:'ruinaMata',nome:'Ruína na mata',x:64,z:62,yaw:Math.PI/2,blend:10,plano:2,limpa:7,dist:240},                  // na mata entre o rio e o Sítio Boa Vista
  // carros destruídos no acostamento (o mesmo modelo, um pouco tortos)
  {id:'carro1',m:'carroDestruido',nome:'Carro destruído',x:59.5,z:11,yaw:0.33,semChao:true,dist:150},
  {id:'carro2',m:'carroDestruido',nome:'Carro destruído',x:130.4,z:8.4,yaw:Math.PI-0.38,semChao:true,dist:150},
  {id:'carro3',m:'carroDestruido',nome:'Carro destruído',x:-22.2,z:-36.2,yaw:3.35,semChao:true,dist:150},
  {id:'carro4',m:'carroDestruido',nome:'Carro destruído',x:-40.5,z:63.5,yaw:-1.86,semChao:true,dist:150},
  {id:'carro5',m:'carroDestruido',nome:'Carro destruído',x:111.3,z:33.7,yaw:-1.27,semChao:true,dist:150},
];
const LUG={malhas:{},info:{},col:0};
/* meia-largura e meia-profundidade do modelo (com folga f) e o giro */
function lugRet(L,f){const t=LUGX[L.m].tam,c=Math.cos(L.yaw),s=Math.sin(L.yaw),hx=t[0]/2+f,hz=t[2]/2+f;return{c,s,hx,hz};}
/* do espaço do modelo para o mundo, e de volta */
function lugMundo(L,lx,lz){const c=Math.cos(L.yaw),s=Math.sin(L.yaw);return[L.x+lx*c+lz*s,L.z-lx*s+lz*c];}
function lugLocal(L,x,z){const c=Math.cos(L.yaw),s=Math.sin(L.yaw),dx=x-L.x,dz=z-L.z;return[dx*c-dz*s,dx*s+dz*c];}
/* distância de um ponto até o retângulo girado do lugar (0 dentro) */
function lugDist(L,x,z,f=0){const R=lugRet(L,f),q=lugLocal(L,x,z);
  return Math.hypot(Math.max(Math.abs(q[0])-R.hx,0),Math.max(Math.abs(q[1])-R.hz,0));}
function lugEm(x,z,f=0){for(const L of LUGARES)if(LUGX[L.m]&&lugDist(L,x,z,f)<=0)return L;return null;}
/* 1) chão: a altura do lugar é a média do terreno embaixo; dentro (e na beirada plana) fica plano, e na volta (blend) volta ao
   natural. Com piso andável, o terreno fica um pouco abaixo (afunda) só embaixo do modelo */
(function lugAplainar(){if(typeof LUGX==='undefined')return;
  for(const L of LUGARES){if(!LUGX[L.m])continue;let s=0,n=0;const R=lugRet(L,0);
    for(let u=-0.5;u<=0.5;u+=0.1)for(let v=-0.5;v<=0.5;v+=0.1){const p=lugMundo(L,u*2*R.hx,v*2*R.hz);s+=ground(p[0],p[1]);n++;}
    L.y=s/n;if(L.semChao){LUG.info[L.id]={x:L.x,z:L.z,y:+L.y.toFixed(2)};continue;}   // carro: fica no chão como está
    const pl=L.plano||0,af=L.afunda||0;
    for(let j=0;j<=T_N;j++)for(let i=0;i<=T_N;i++){const d=lugDist(L,GX[i],GX[j]);if(d>pl+L.blend)continue;
      const k=1-smooth(pl,pl+L.blend,d),o=j*TW+i,alvo=L.y-(d<=0?af:af*(1-smooth(0,pl||1,d)));TH[o]=TH[o]+(alvo-TH[o])*k;}
    LUG.info[L.id]={x:L.x,z:L.z,y:+L.y.toFixed(2),tam:LUGX[L.m].tam};}})();
/* 2) colisão e piso: caixas do modelo, giradas junto; superfície plana na altura do piso onde ele é andável */
(function lugColisao(){if(typeof LUGX==='undefined')return;
  for(const L of LUGARES){const X=LUGX[L.m];if(!X)continue;
    for(const b of X.col||[]){const p=lugMundo(L,b[0],b[1]);colBox(p[0],p[1],b[2],b[3],L.yaw,{lugar:L.id});LUG.col++;}
    if(L.piso){const t=X.tam;supAdd({t:'ret',x:L.x,z:L.z,hw:t[0]/2-0.3,hd:t[2]/2-0.3,yaw:L.yaw,y:L.y,lugar:L.id});}}})();
/* 3) depois que a mata nasce: sai de vez o que ficou dentro de cada lugar (sem mudar a ordem de nada: os ids continuam os
   mesmos, e o jogo salvo continua valendo) */
function lugLimpar(){if(typeof LUGX==='undefined')return;let n=0;
  /* árvore e pedra saem também da volta (limpa: o quintal da casa, a clareira da ruína); o resto, só de dentro */
  const dentro=(x,z,f,arv)=>{for(const L of LUGARES)if(LUGX[L.m]&&lugDist(L,x,z,f+(arv?(L.limpa??0):0))<=0)return true;return false;};
  for(const t of TREES)if(!t.agua&&dentro(t.x,t.z,1.5,true)){t.agua=true;t.alive=false;colRemove(COLL.find(c=>c.tree===t));n++;}
  for(const r of ROCKS)if(!r.agua&&dentro(r.x,r.z,1,true)){r.agua=true;r.alive=false;colRemove(COLL.find(c=>c.rock===r));n++;}
  for(const b of BUSHES)if(!b.agua&&dentro(b.x,b.z,0.8,true)){b.agua=true;b.frutas=false;n++;}
  for(const p of PICKS)if(!p.agua&&dentro(p.x,p.z,0.5)){p.agua=true;p.alive=false;n++;}
  for(const L2 of [GRASS,FLORES])for(const b of L2)if(b.y>-900&&dentro(b.x,b.z,0.5)){b.y=-999;n++;}
  if(typeof SAMAMBAIAS!=='undefined')for(const b of SAMAMBAIAS)if(b.y>-900&&dentro(b.x,b.z,0.5)){b.y=-999;n++;}
  if(typeof TRONCOS!=='undefined')for(const b of TRONCOS)if(b.y>-900&&dentro(b.x,b.z,1)){b.y=-999;n++;}
  LUG.info.limpos=(LUG.info.limpos||0)+n;vegDirty=true;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{lugLimpar();}catch(e){console.error('lugares (limpar)',e);}return r;};}
/* 4) malhas (as partes de cada modelo; uma só por modelo, mesmo que ele apareça em vários lugares). Só monta quando alguém
   chega perto (a textura de um escaneado grande pesa na memória de vídeo; quem nunca passa lá não paga). Parte com textura
   espera a textura carregar; parte sem textura (só cor) entra na hora, com o relevo de detalhe do jogo por cima */
function lugMontar(id){if(LUG.malhas[id]!==undefined)return LUG.malhas[id];LUG.malhas[id]=null;
  try{LUG.malhas[id]=LUGX[id].partes.map((p,i)=>{const g=mod3dDecodificar(p);
    if(p.t)return texMesh(g.f,g.uv,texModelo('lug_'+id+'_'+i,p.t,p.rep));
    const c=p.cor||[0.5,0.5,0.5];for(let k=3;k<g.f.length;k+=11){g.f[k]*=c[0];g.f[k+1]*=c[1];g.f[k+2]*=c[2];}return litMesh(g.f);});}
  catch(e){console.error('lugar '+id,e);}
  return LUG.malhas[id];}
function lugM(L){return L.M||(L.M=mat(L.x,L.y,L.z,0,L.yaw,0));}
function lugDesenhar(Pg,sombra,perto){if(typeof LUGX==='undefined')return;const ox=sombra?P.x:cam.pos[0],oz=sombra?P.z:cam.pos[2],py=sombra?P.y:cam.pos[1];if(py<SUB_FUNDO)return;
  const cf=gl.isEnabled(gl.CULL_FACE);if(cf)gl.disable(gl.CULL_FACE);   // escaneado não tem "lado de trás" confiável: desenha os dois lados
  for(const L of LUGARES){if(!LUGX[L.m])continue;const d=lugDist(L,ox,oz);
    if(!sombra&&d<L.dist+40)lugMontar(L.m);
    const ms=LUG.malhas[L.m];if(!ms)continue;const R=sombra?(perto?90:180):L.dist;if(d>R)continue;
    const M=lugM(L);for(const m of ms)if(!m.tex||m.tex.pronta)drawStat(Pg,m,M);}
  if(cf)gl.enable(gl.CULL_FACE);}
DESENHO.opaco.push(Pg=>lugDesenhar(Pg,false));
DESENHO.sombra.push((Pg,perto)=>lugDesenhar(Pg,true,perto));
