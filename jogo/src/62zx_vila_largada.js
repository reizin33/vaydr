/* ================= Vila São José largada (v10.3.4, 18/11/2026) =================
   Etapa 3 (mundo largado). A vila estava arrumada demais (casas de cor viva, quintal aparado, rua limpa):
   · as cores das casas e das muretas desbotaram e sujaram (sol, chuva e fuligem), as telhas escureceram;
   · o mato tomou os quintais (moitas encostadas nas paredes e nos cantos) e a terra da rua (capim na beira e no meio);
   · tralha largada na rua e na calçada: sacos de lixo, pneus, caixas, tambores e lixeiras tombadas, galões, uma cadeira caída;
   · duas carcaças queimadas, uma na rua principal e outra na rua de baixo (com o porta-malas para revistar).
   Nada some do que já tinha. As moitas novas entram no fim da lista (os números das outras não mudam) e o resto entra depois
   da mata nascer: os jogos salvos continuam valendo. */
const VILA_LARG={info:null};
/* cores: mistura no espaço de cor da tela (hex) */
function vlMix(a,b,t){const ch=(h,s)=>(h>>s)&255,m=s=>Math.round(ch(a,s)+(ch(b,s)-ch(a,s))*t);return(m(16)<<16)|(m(8)<<8)|m(0);}
(function vlCores(){if(typeof CASA_CORES==='undefined')return;
  for(const c of CASA_CORES){c[0]=vlMix(c[0],0x857f73,0.4);c[3]=vlMix(c[3],0x3d3833,0.32);}
  if(typeof MURETA_CORES!=='undefined')for(let i=0;i<MURETA_CORES.length;i++)MURETA_CORES[i]=vlMix(MURETA_CORES[i],0x8a8478,0.35);})();
function vlLivre(x,z,r){if(pointBlocked(x,z,r))return false;if(typeof ruralCasaEm==='function'&&ruralCasaEm(x,z,r))return false;
  for(const id in VILA){const p=VILA[id];if((p.entradas||[]).some(e=>Math.hypot(e.x-x,e.z-z)<1.7))return false;}return true;}
function vlMontar(){const R=rng(60060),info={tralha:0,moitas:0,capim:0,carcacas:0};if(typeof VILA==='undefined'||!VILA.v1)return info;
  const ids=['sacoLixo','sacoLixo','pneuVelho','caixaPapelao','lixeiraVelha','tambor','tamborVelho','galaoVerde','caixaMadeira2','cadeiraPlastico','mala'],tomba=new Set(['lixeiraVelha','tambor','tamborVelho','cadeiraPlastico']);
  const prop=(x,z)=>{if(!prpOk()||!vlLivre(x,z,0.45))return;const id=ids[Math.floor(R()*ids.length)];if(!prpTem(id))return;const t=tomba.has(id)&&R()<0.6;
    prpReg(PRP.mundo,id,x,ground(x,z)+(t?(id==='cadeiraPlastico'?0.25:0.3):0),z,R()*6.283,[1,1,1],t?Math.PI/2:0,0,0.5,70);info.tralha++;};
  // na beira das duas ruas (a principal, norte-sul em x = 61,5, e a de baixo, leste-oeste em z = -79)
  for(let z=-58;z>-104;z-=2.5+R()*4){if(R()<0.45)continue;const s=R()<0.5?-1:1;prop(61.5+s*(2.2+R()*1.6),z);}
  for(let x=30;x<96;x+=2.5+R()*4){if(R()<0.45)continue;const s=R()<0.5?-1:1;prop(x,-79+s*(2.0+R()*1.5));}
  // montinhos de saco de lixo na frente do mercadinho e do bar
  for(const id of['v6','v7']){const p=VILA[id];if(!p)continue;for(let k=0;k<3;k++){const w=pw(p,p.W*(0.15+R()*0.2),-1.4-R()*0.6);if(prpOk()&&prpTem('sacoLixo')&&vlLivre(w[0],w[1],0.35)){prpReg(PRP.mundo,'sacoLixo',w[0],ground(w[0],w[1]),w[1],R()*6.283,[1,1,1],0,0,0.5,70);info.tralha++;}}}
  // carcaças queimadas (com colisão e o porta-malas para revistar)
  if(prpOk()&&prpTem('L:carroDestruido'))for(const[x,z,yaw,id]of[[60.0,-95.5,0.12,'vila-carc1'],[80.5,-77.4,Math.PI/2+0.14,'vila-carc2']]){if(!vlLivre(x,z,1.6))continue;
    prpReg(PRP.mundo,'L:carroDestruido',x,ground(x,z),z,yaw+Math.PI/2,[1,1,1],0,0,1,150);colBox(x,z,0.95,2.15,yaw,{solid:true,y0:-0.2,y1:1.5,carro2:true});
    const t=fwd(yaw,-2.7);interAdd({id,kind:'bau',x:x+t[0],z:z+t[1],label:'Revistar o porta-malas',tabela:'carro',respawn:4});info.carcacas++;}
  // mato: moitas encostadas nas paredes e nos cantos dos quintais (no fim da lista das moitas)
  for(const id in VILA){const p=VILA[id];if(!p||!p.W)continue;const k=3+Math.floor(R()*3);for(let i=0;i<k;i++){const lado=Math.floor(R()*4),a=R(),u=lado<2?a*p.W:lado===2?-0.7:p.W+0.7,v=lado<2?(lado===0?-0.7-(p.varanda||0):p.D+0.7):a*p.D;
      const w=pw(p,u,v);if(!vlLivre(w[0],w[1],0.4))continue;if(BUSHES.some(b=>Math.abs(b.x-w[0])<1.3&&Math.abs(b.z-w[1])<1.3))continue;
      BUSHES.push({id:BUSHES.length,x:w[0],z:w[1],y:ground(w[0],w[1]),s:0.7+R()*0.45,r:R()*6.283,frutas:R()<0.3,cresce:0,t:0.85+R()*0.3,cidade:true});info.moitas++;}}
  // capim na terra das ruas (beira e meio)
  for(const r of ROADS){if(!r.vila)continue;for(let s=0;s<r.pts.length-1;s++){const a=r.pts[s],b=r.pts[s+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
      for(let t=0;t<L;t+=0.8+R()*1.4){const q=R(),o=q<0.6?(R()<0.5?-1:1)*(r.w/2-0.2+R()*0.7):(R()-0.5)*r.w*0.8,x=a[0]+(b[0]-a[0])*t/L+nx*o,z=a[1]+(b[1]-a[1])*t/L+nz*o;
        if(pointBlocked(x,z,0.25))continue;GRASS.push({x,z,y:ground(x,z)-0.02,r:R()*6.283,s:0.45+R()*0.5,t:0.7+R()*0.35});info.capim++;}}}
  return info;}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{VILA_LARG.info=vlMontar();}catch(e){console.error('vila largada',e);}return r;};}
