/* ================= Cada coisa com o seu menu (pedido do Himalaia) =================
   · Tab abre só a mochila (antes, com itens no chão por perto, abria direto na aba Chão, junto com a mochila e a fabricação).
   · Pilha no chão: toque E pega tudo (como antes); segure E abre o menu do chão, sozinho (sem as abas da mochila).
   · De frente para uma porta, E é da porta, mesmo com uma pilha de itens no pé (a pilha ganhava por estar mais perto).
   · Baú ou chão aberto mostram só o menu deles (o Tab fecha). */
let DROP_DIRETO=false;
{const _ti=textoInter;textoInter=function(a){const r=_ti.apply(this,arguments);
  if(a&&a.k==='drop'&&r&&!DROP_DIRETO)return Object.assign({},r,{s:(r.s?r.s+' · ':'')+'segure: ver o chão',alt:true,dur:0.55});return r;};}
INTER_K.drop={texto:null,curto:o=>{DROP_DIRETO=true;const antes=alvoInter;alvoInter={k:'drop',o};try{interagir(true);}finally{DROP_DIRETO=false;alvoInter=antes;}}};
delete INTER_K.drop.texto;   /* só o toque curto: o texto e o pegar continuam os de antes (40_game) */
{const _it=interagir;interagir=function(seg){const a=alvoInter;
  if(a&&a.k==='drop'&&seg&&!DROP_DIRETO){abrirMochila('chao');return;}   // segurou E na pilha: abre o menu do chão
  return _it.apply(this,arguments);};}
{const _ia=interAtual;interAtual=function(){const a=_ia.apply(this,arguments);if(!a||a.k!=='drop'||CARRO.ativo)return a;
  const fx=Math.sin(cfg.cam==='1'?P.yaw:P.body),fz=Math.cos(cfg.cam==='1'?P.yaw:P.body);let best=null,bd=9;
  const ver=(o,k,x,z,y,r)=>{if(y!==undefined&&Math.abs(y-P.y)>1.7)return;const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);if(d>r)return;if(d>0.3&&(dx*fx+dz*fz)/d<0.5)return;if(d<bd){bd=d;best={k,o};}};
  if(typeof CID!=='undefined'&&CID.portas)for(const d of CID.portas){if(d.estado==='quebrada'||d.tipo==='elevador')continue;ver(d,'porta',d.x,d.z,d.y,1.8);}
  for(const o of OB)if(o.tipo==='portaMadeira')ver(o,'portaMad',o.x,o.z,o.y,2.2);
  return best||a;};}
/* janela quebrada do térreo: de frente para ela, o Espaço pula (o aviso mostra Espaço; segurar E não pula mais) */
function janelaNaFrente(){if(typeof CID==='undefined'||!CID.janelas)return null;const fx=Math.sin(cfg.cam==='1'?P.yaw:P.body),fz=Math.cos(cfg.cam==='1'?P.yaw:P.body);let best=null,bd=1.6;
  for(const j of CID.janelas){if(!j.quebrada||j.f>0||Math.abs(j.x-P.x)>2||Math.abs(j.z-P.z)>2||janelaTapada(j))continue;const dx=j.x-P.x,dz=j.z-P.z,d=Math.hypot(dx,dz);
    if(d>1.6||(d>0.3&&(dx*fx+dz*fz)/d<0.55))continue;if(d<bd){bd=d;best=j;}}return best;}
{const _pu=pular;pular=function(){if(P.alive&&!P.escala&&!P.muro&&!P.rola&&!CARRO.ativo&&!P.nada&&P.y>-20){const j=janelaNaFrente();if(j){pularJanela(j);return;}}return _pu.apply(this,arguments);};}
/* dentro do veículo: o painel mostra a tecla de sair (a dica só aparecia na primeira vez) e por que não dá, quando não dá */
HUDS.push(function hudSairVeic(){const el=$('painel-carro');if(!el||el.hidden||!CARRO||!CARRO.ativo)return;let h=el.querySelector('.pc-sair');
  if(!h){h=document.createElement('small');h.className='pc-sair';h.style.cssText='display:block;margin-top:4px;opacity:.85;font-size:11px;letter-spacing:.02em';el.appendChild(h);}
  const c=CARRO,T=VT(c);let t=nomeTecla(teclaDe('usar'))+': sair';if(T&&T.voa&&c.alt>0.6)t='Pouse para sair';else if(T&&Math.abs(c.v)>4&&!T.agua)t='Diminua para sair';
  if(h.textContent!==t)h.textContent=t;});
