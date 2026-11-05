/* ================= vida no ar: folhas caindo na mata e poeira brilhando no sol =================
   folhas: de dia e sem chuva, caem devagar das copas perto do jogador, rodando e balançando com o vento
   poeira: grãos claros flutuando no ar quando o sol está baixo (tarde e começo da manhã) */
const FOLHAS=[];let folhaT=0,poeiraT=0,cinzaT=0;
const FOLHA_COR=[[0.28,0.42,0.12],[0.42,0.48,0.14],[0.55,0.42,0.12],[0.46,0.28,0.1],[0.32,0.36,0.1]];
function updateAmbiente(dt){const n=E.n||0,chuva=E.r||0,dia=1-n;
  const fk=typeof folhaRitmo==='function'?folhaRitmo():1;
  if(dia>0.4&&chuva<0.3&&!CARRO.ativo&&FOLHAS.length<70*Math.max(1,fk)){folhaT-=dt;
    if(folhaT<=0){folhaT=(0.12+Math.random()*0.25)/Math.max(0.2,fk);const a=Math.random()*6.283,r=3+Math.random()*16,x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;
      if(mata(x,z)>0.6&&!dentroCidade(x,z,4)&&perto(TREES,x,z,4.5,t=>t.alive)){const g=ground(x,z);
        FOLHAS.push({x,z,y:g+5+Math.random()*5,g,vy:-(0.45+Math.random()*0.4),ph:Math.random()*6.28,f:1.4+Math.random()*1.6,r:0.25+Math.random()*0.35,c:typeof folhaCor==='function'?folhaCor():FOLHA_COR[Math.floor(Math.random()*FOLHA_COR.length)],t:0,chao:0});}}}
  const w=E.wind||[0.6,0.2];
  for(let i=FOLHAS.length-1;i>=0;i--){const f=FOLHAS[i];f.t+=dt;
    if(f.chao>0){f.chao+=dt;if(f.chao>5)FOLHAS.splice(i,1);continue;}
    f.ph+=dt*f.f;f.y+=f.vy*dt;f.x+=(w[0]*0.6+Math.cos(f.ph)*f.r)*dt;f.z+=(w[1]*0.6+Math.sin(f.ph*0.7)*f.r)*dt;
    const g=ground(f.x,f.z);if(f.y<=g+0.03){f.y=g+0.03;f.chao=0.01;}
    if(f.t>25||d2(f.x,f.z,P.x,P.z)>30*30)FOLHAS.splice(i,1);}
  // poeira no sol baixo
  const baixo=(E.sun&&E.sun[1]>0.02&&E.sun[1]<0.45)?(1-chuva)*dia:0;
  if(baixo>0.2&&!dentroCidade(P.x,P.z,-4)){poeiraT-=dt;if(poeiraT<=0){poeiraT=0.08;const a=Math.random()*6.283,r=1.5+Math.random()*7;
    part(P.x+Math.cos(a)*r,P.y+0.6+Math.random()*2.4,P.z+Math.sin(a)*r,(Math.random()-0.5)*0.12+w[0]*0.1,(Math.random()-0.5)*0.05,(Math.random()-0.5)*0.12+w[1]*0.1,4+Math.random()*3,0.018,[1,0.92,0.7,0.5*baixo],true,0);}}
  // cinza e fuligem no ar da cidade (de dia, sem chuva, fora dos prédios): flocos cinzentos descendo devagar com o vento
  if(dia>0.3&&chuva<0.3&&P.y>-20&&dentroCidade(P.x,P.z,-2)&&!salaEm(P.x,P.y+0.3,P.z)){cinzaT-=dt;if(cinzaT<=0){cinzaT=0.16;
    const a=Math.random()*6.283,r=2+Math.random()*12,x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r,y=P.y+1.5+Math.random()*5;
    if(!salaEm(x,y,z))part(x,y,z,w[0]*0.35+(Math.random()-0.5)*0.15,-0.1-Math.random()*0.08,w[1]*0.35+(Math.random()-0.5)*0.15,10+Math.random()*5,0.02,[0.6,0.58,0.55,0.5*dia],false,0);}}}
function bbAmbiente(){for(const f of FOLHAS){const al=f.chao>0?Math.max(0,1-f.chao/5):Math.min(1,f.t*2),s=0.06+0.016*Math.sin(f.ph*2);bb(f.x,f.y,f.z,s,f.c[0],f.c[1],f.c[2],0.95*al);}}
function resetAmbiente(){FOLHAS.length=0;}
