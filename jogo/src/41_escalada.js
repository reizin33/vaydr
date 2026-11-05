/* ================= subir e descer: gravidade com chão elevado, queda com dano e escalada em rotas marcadas ================= */
const ESC_CFG={vel:1.5,energia:2.2,danoQueda:10,danoPorMs:7,degrau:0.55};
/* vertical do jogador: pisa no chão mais alto alcançável (terreno, raiz, galho, plataforma, ponte); se não houver, cai */
function fisicaVertical(dt){const chao=chaoEm(P.x,P.z,P.y);
  if(P.vy>0||P.y>chao+0.002){
    if(P.vy<=0&&P.noChao&&P.y-chao<0.32){P.y=chao;P.vy=0;}             // descer degrau e ladeira sem pular
    else{P.vy-=14*dt;P.y+=P.vy*dt;if(P.y<=chao)pousar(chao);}}
  else if(!P.noChao&&P.vy<0)pousar(chao);                              // caindo em diagonal e o chão "subiu" sob os pés: também é pouso (com dano)
  else{P.y=chao;P.vy=0;}
  const antes=P.noChao;P.noChao=P.y<=chao+0.002;P.air=P.y-chao;if(antes&&!P.noChao&&P.vy<=0)P.coyote=0.18;else if(P.noChao)P.coyote=0;else P.coyote=Math.max(0,(P.coyote||0)-dt);}
function pousar(chao){const imp=-P.vy;P.y=chao;P.vy=0;if(imp>3.5)P.pouso=Math.min(0.16,(imp-3)*0.025);if(imp>ESC_CFG.danoQueda)queda(imp);else if(imp>6)sfx('passo',undefined,undefined,0.5,'terra');}
function queda(v){const d=(v-ESC_CFG.danoQueda)*ESC_CFG.danoPorMs;P.shake=0.8;sfx('dor');ferirJogador(d/Math.max(0.3,DIF[cfg.dif].dano*(1-protecao())));feed('Queda feia',true);if(v>ESC_CFG.danoQueda+6||(v>ESC_CFG.danoQueda+3.5&&Math.random()<0.55))lesao('perna');
  dica('queda','corpo','Cair do alto machuca. Desça pelos cipós ou por uma escada de corda (segure E perto da saída).');}
const altoDoChao=()=>P.y-ground(P.x,P.z);
/* começar a escalar: perto da saída de baixo (sobe) ou de cima (desce) de uma rota */
function viaPerto(){let best=null,bd=1.35;for(const v of VIAS){if(v.recolhida)continue;
    const b=v.base,t=v.topo;let d=Math.hypot(b.x-P.x,b.z-P.z);if(d<bd&&Math.abs(b.y-P.y)<0.9){bd=d;best={v,u:0};}
    d=Math.hypot(t.x-P.x,t.z-P.z);if(d<bd&&Math.abs(t.y-P.y)<0.9){bd=d;best={v,u:1};}}return best;}
function comecarEscalada(vp){if(!vp||CARRO.ativo||!P.alive)return;P.escala={v:vp.v,u:vp.u,ph:0};P.acao=null;P.vy=0;P.vx=P.vz=0;
  if(OBRA.ativo)modoObra(false);sfx('passo',undefined,undefined,0.4,'terra');
  dica('escalar','corpo','Escalando: W sobe, S desce (no celular, o joystick). No topo, siga em frente para sair no galho. Pulo solta.');}
function sairEscalada(onde){const e=P.escala;if(!e)return;const p=onde==='topo'?e.v.topo:onde==='base'?e.v.base:null;P.escala=null;
  if(p&&onde==='topo'&&P.ch.sk){P.y=Math.min(P.y,p.y)-0.45;comecarMuro({x:p.x,z:p.z,y:p.y+0.02,yaw:p.rumo!==undefined?p.rumo:P.body},'chegada');if(p.rumo!==undefined)P.yaw=p.rumo;return;}
  if(p){P.x=p.x;P.z=p.z;P.y=p.y+0.02;P.vy=0;if(p.rumo!==undefined&&onde==='topo'){P.yaw=p.rumo;P.body=p.rumo;}P.travaAnda=0.45;}else{const pos=e.v.pos(e.u),r=e.v.rumo(e.u);P.x=pos[0]-Math.sin(r)*0.7;P.z=pos[2]-Math.cos(r)*0.7;P.y=pos[1];P.vy=1.5;}
  P.noChao=false;}
function updateEscalada(dt){const e=P.escala,v=e.v,H=Math.max(0.5,v.altura());let mz=IN.mz;
  if(mz>0.2&&P.energia<=0.5){mz=0;dica('cansado','corpo','Sem energia para subir. Segure firme e espere recuperar, ou desça.');}
  const du=mz*ESC_CFG.vel*dt/H;e.u=clamp(e.u+du,0,1);if(Math.abs(mz)>0.2){e.ph+=dt*6;P.energia=Math.max(0,P.energia-ESC_CFG.energia*dt);}else P.energia=Math.min(100,P.energia+4*dt);
  if(e.u>=1&&mz>0.3)return sairEscalada('topo');
  if(e.u<=0&&mz<-0.3)return sairEscalada('base');
  const p=v.pos(e.u),r=v.rumo(e.u);P.x=p[0];P.z=p[2];P.y=p[1];P.body=r;P.vy=0;P.vx=P.vz=0;P.air=0.5;P.amp=0;
  const ch=P.ch;ch.x=P.x;ch.z=P.z;ch.y=P.y;ch.yaw=P.body;ch.pitch=0;poseEscalar(ch.r,e.ph);}
/* pose provisória de escalada (enquanto não entram as animações dos arquivos): braços alternando para cima, pernas dobrando */
function poseEscalar(o,ph){o.fill(0);const s=Math.sin(ph),c=Math.cos(ph);
  S3(o,1,0.15,0,0);S3(o,2,-0.3,0,0);
  S3(o,3,-2.5-0.35*s,0,-0.25);S3(o,4,-0.5+0.3*s,0,0);S3(o,5,-2.5+0.35*s,0,0.25);S3(o,6,-0.5-0.3*s,0,0);
  S3(o,7,-0.9-0.4*c,0,0);S3(o,8,1.2+0.4*c,0,0);S3(o,9,-0.9+0.4*c,0,0);S3(o,10,1.2-0.4*c,0,0);}
