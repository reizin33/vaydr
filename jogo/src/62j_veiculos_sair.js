/* ================= Sair do veículo sempre (pedido do Himalaia: "quando você está num veículo não tem como sair dele") =================
   · O triciclo da fazenda nascia dentro do celeiro (o celeiro é um bloco sólido): dava para entrar nele pelo lado de fora, mas
     na hora de descer todos os lugares de descida caíam dentro do celeiro ("Sem espaço para descer"). Agora todo veículo de
     terra que estiver dentro de parede, casa ou outra construção (no jogo novo e ao carregar um jogo salvo) vai para o lugar
     livre mais perto, com espaço em volta para descer.
   · Ao descer, se nenhum dos lugares de sempre (lados, frente e trás) estiver livre, o jogo procura o lugar livre mais perto em
     volta do veículo, até 7 m, antes de dizer que não tem espaço (47_carro: sairCarro). */
function bloqSem(x,z,r,ign){for(const c of colQuery(x,z,r+1)){if(!c.solid||c.sub||c===ign)continue;
  if(c.t===0){if(Math.hypot(x-c.x,z-c.z)<r+c.r)return c;}
  else{const dx=x-c.x,dz=z-c.z,lx=dx*c.c-dz*c.s,lz=dx*c.s+dz*c.c,cx=clamp(lx,-c.hw,c.hw),cz=clamp(lz,-c.hd,c.hd);if(Math.hypot(lx-cx,lz-cz)<r)return c;}}return null;}
/* o veículo (parado) está enfiado em alguma coisa sólida? confere o meio e os quatro cantos */
function veicPresoEm(v){const T=VT(v);if(!T||T.agua||(T.voa&&v.alt>0.5))return false;const c=Math.cos(v.yaw),s=Math.sin(v.yaw);
  for(const[lx,lz]of[[0,0],[T.hw*0.7,T.hd*0.7],[-T.hw*0.7,T.hd*0.7],[T.hw*0.7,-T.hd*0.7],[-T.hw*0.7,-T.hd*0.7]])if(bloqSem(v.x+lx*c+lz*s,v.z-lx*s+lz*c,0.2,v.col))return true;
  return false;}
let VEIC_DESENC=[];
function veicDesencalhar(v){if(!v||v.ativo||!veicPresoEm(v))return false;const T=VT(v),x0=v.x,z0=v.z,y0=v.y,folga=Math.max(T.hw,T.hd)+0.9;
  for(let r=1;r<=18;r+=0.5)for(let k=0;k<24;k++){const a=k/24*6.283,x=x0+Math.sin(a)*r,z=z0+Math.cos(a)*r;
    if(!dentroMapa(x,z,-2)||(RIO.ok&&aguaNivel(x,z)!==null)||(typeof marEm==='function'&&marEm(x,z))||bloqSem(x,z,folga,v.col))continue;
    const y=veicChao(v,x,z);if(Math.abs(y-y0)>3)continue;
    v.x=x;v.z=z;v.y=y;veicColisor(v);VEIC_DESENC.push({id:v.id,de:[+x0.toFixed(1),+z0.toFixed(1)],para:[+x.toFixed(1),+z.toFixed(1)]});return true;}
  return false;}
function veicDesencalharTodos(){for(const v of VEICS){try{veicDesencalhar(v);}catch(e){console.error('veículo preso',v&&v.id,e);}}}
{const _vp=veicPadrao;veicPadrao=function(){const r=_vp.apply(this,arguments);veicDesencalharTodos();return r;};}
{const _vc=veicCarregar;veicCarregar=function(){const r=_vc.apply(this,arguments);veicDesencalharTodos();return r;};}
