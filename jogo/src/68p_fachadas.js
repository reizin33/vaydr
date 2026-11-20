/* ================= Fachadas da cidade: grades no térreo e ar-condicionado (v10.8.7) =================
   Himalaia (19/11/2026): "aproxime o jogo o máximo do real ... prédios e casas". Nas janelas dos prédios da cidade:
   · grade de ferro nas janelas do térreo (barras e travessas; menos na vitrine e na janela quebrada), como nas ruas daqui;
   · ar-condicionado de janela em parte das janelas dos andares de cima: caixa bege ou cinza com a grade de ventilação, as
     duas mãos-francesas de ferro embaixo e o escorrido escuro do pingo na parede;
   Tudo numa malha só, montada das janelas da cidade (CID.janelas) e desenhada perto da cidade. A parede de fora tem 25 cm:
   a janela fica no meio da parede, então a face de fora está a 12,5 cm do ponto da janela. */
const FACH={malha:null,n:0,ac:0};
function fachGeo(){const g=new GB(1<<17,8),R=rng(80811),F=0.125;
  for(const j of CID.janelas){if(!j||!j.p||j.p.rural||!isFinite(j.x)||!isFinite(j.y))continue;const c=Math.cos(j.yaw),s=Math.sin(j.yaw);
    const M=(u,y,v)=>mat(j.x+c*u+s*v,y,j.z-s*u+c*v,0,j.yaw,0);   // u ao longo da parede, v para fora
    const L=j.larg||1.2,y0=j.y+(isFinite(j.peit)?j.peit:1.0),y1=j.y+2.2;
    if(j.f===0){if(j.vitrine||j.quebrada)continue;const nb=Math.max(4,Math.round(L/0.14)),v=F+0.075;
      for(let i=0;i<=nb;i++)add(g,boxTris(0.02,y1-y0+0.1,0.02),M(-L/2+L*i/nb,(y0+y1)/2,v),lin(0x23262a));
      for(const yy of[y0+0.04,(y0+y1)/2,y1-0.04])add(g,boxTris(L+0.05,0.028,0.028),M(0,yy,v),lin(0x23262a));
      for(const su of[-1,1])add(g,boxTris(0.03,0.03,0.08),M(su*(L/2+0.01),y0+0.04,F+0.04),lin(0x23262a));   // chumbadores
      FACH.n++;continue;}
    if(R()>0.24)continue;const u=(R()-0.5)*Math.max(0,L-0.8),ya=y0-0.34,cor=R()<0.62?0xd8d2c4:0xb4b0a6;
    add(g,boxTris(0.72,0.42,0.42),M(u,ya,F+0.21),lin(cor),{j:0.05,rnd:R});
    for(let k=0;k<6;k++)add(g,boxTris(0.52,0.018,0.02),M(u,ya-0.16+k*0.064,F+0.425),lin(0x56555a));   // grade da ventilação
    for(const su of[-0.28,0.28]){add(g,boxTris(0.03,0.03,0.38),M(u+su,ya-0.225,F+0.2),lin(0x2f3032));add(g,boxTris(0.03,0.3,0.03),M(u+su,ya-0.36,F+0.02),lin(0x2f3032));}   // mãos-francesas
    add(g,boxTris(0.05+R()*0.04,0.5+R()*0.9,0.006),M(u+0.24,ya-0.21-0.35,F+0.004),lin(0x3e3c38));   // escorrido do pingo
    FACH.ac++;}
  return g.data();}
etapaMalha('fim','fachadas',2,()=>{if(typeof CID==='undefined'||!CID.janelas||!CID.janelas.length)return;try{FACH.n=0;FACH.ac=0;FACH.malha=litMesh(fachGeo());}catch(e){console.error('fachadas',e);FACH.malha=null;}});
DESENHO.opaco.push(function fachadasDesenho(Pg){if(FACH.malha&&distCidade(cam.pos[0],cam.pos[2])<170)drawStat(Pg,FACH.malha,ID);});
