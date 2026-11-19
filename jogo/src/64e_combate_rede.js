/* ================= Combate na partida em rede (v10.7.1, 19/11/2026) =================
   A voadora, o pisão e a derrubada (64b_combate) só valiam no jogo de quem abriu a partida: no convidado a voadora passava reto
   pelos zumbis (lá eles são bonecos que repetem o que o anfitrião manda) e o zumbi derrubado aparecia de pé, deslizando.
   · convidado: a voadora acerta os bonecos (o dano vai para o anfitrião, como o golpe) e pede ao anfitrião para derrubar; a arma
     pesada também pode pedir. O anfitrião derruba o zumbi de verdade, com as mesmas regras (chefe e brutamontes não caem);
   · o estado "derrubado" vai para os convidados: o boneco cai de costas, fica no chão e levanta quando o anfitrião levanta o
     zumbi; o pisão no boneco caído vale (o dano vai para o anfitrião). */
LAN_ST_MANDA.add('derrubado');
/* convidado: em vez de derrubar o boneco, pede ao anfitrião */
{const _dz=derrubarZ;derrubarZ=function(z,kx,kz,t){if(z&&z.lan){if(!LAN.on||!z.vivo)return false;lanMandar({t:'derrZ',id:z.lanId,kx:+(kx||0).toFixed(2),kz:+(kz||0).toFixed(2)});return true;}
  return _dz.apply(this,arguments);};}
/* anfitrião: o pedido do convidado derruba o zumbi de verdade */
{const _lr=lanReceber;lanReceber=function(m){if(m&&m.t==='derrZ'){if(LAN.papel==='anfitriao'){const z=Z.find(q=>q.id===m.id);if(z&&z.vivo&&!z.lan){LAN.info.derr=(LAN.info.derr||0)+1;derrubarZ(z,clamp(+m.kx||0,-8,8),clamp(+m.kz||0,-8,8));}}return;}
  return _lr.apply(this,arguments);};}
/* convidado: golpe de arma pesada num boneco também pode derrubar (a mesma conta do 64b, sem a combinação com o empurrão) */
{const _fz=ferirZ;ferirZ=function(z,dmg,kx,kz,forte){const golpe=!!(ZHIT&&ZHIT.k==='golpe'),a=P.acao,s=golpe&&a&&a.arma;const r=_fz.apply(this,arguments);
  if(z&&z.lan&&LAN.on&&z.vivo&&s&&dmg>0&&z.st!=='derrubado'){const d=ITEMS[s.id];const ch=d?Math.max(0,(d.empurra||0)-1.0)*0.45+(d.vertical&&d.corpo&&(d.dano||0)>=30?0.15:0):0;
    if(ch>0&&Math.random()<ch){const l=Math.hypot(kx||0,kz||0)||1;derrubarZ(z,(kx||0)/l*3,(kz||0)/l*3);}}
  return r;};}
/* convidado: o boneco cai, fica no chão e levanta junto com o zumbi do anfitrião */
{const _zb=lanZBoneco;lanZBoneco=function(z,dt){const h=z.lanH,ant=z.lanStAnt;
  if(h&&h.vivo&&h.st==='derrubado'){if(!z.vivo){z.vivo=true;z.sink=0;}
    if(ant!=='derrubado'){z.derrT=0;z.levanta=0;z.flinch=0;if(z.ch&&z.ch.sk)skTocar(z.ch,'zLevantar',{ext:true,ini:0,peso:1,mix:8,rot:0,reinicia:true});}
    z.st='derrubado';z.t=999;z.kx=z.kz=0;z.lanStAnt='derrubado';
    if(Math.hypot(h.x-z.x,h.z-z.z)>0.04){z.x+=(h.x-z.x)*Math.min(1,(dt||0.016)*8);z.z+=(h.z-z.z)*Math.min(1,(dt||0.016)*8);}return;}
  const r=_zb.apply(this,arguments);
  if(ant==='derrubado'&&z.lanStAnt!=='derrubado'&&z.vivo&&z.ch){z.ch.pitch=0;if(z.ch.sk){z.levanta=CB.levanta;z.levantaD=CB.levanta;}}
  return r;};}
