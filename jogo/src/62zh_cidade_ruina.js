/* ================= Cidade destruída: fumaça dos prédios que queimaram (v10.2.6, 17/11/2026) =================
   Himalaia: "torne o ambiente mais pós-apocalíptico de cidade destruída mesmo". Junto com as carcaças de carro (62yf_props),
   o ônibus queimado (15_cidade_geo), as janelas tapadas em dobro e a fuligem subindo das janelas (62zc_kit), três prédios altos
   do Centro ainda soltam fumaça escura pelo telhado: uma coluna que sobe devagar e se inclina com o vento, vista de longe
   (até 280 m da câmera). Sempre os mesmos prédios (escolhidos pela altura), sem colisão e sem custo quando longe. */
const RUINA={fumacas:[],t:0,pronto:false};
function ruinaMontar(){RUINA.fumacas.length=0;if(typeof CID==='undefined'||!CID.predios||!CID.predios.length)return;
  const altos=CID.predios.filter(p=>!p.casa&&!p.rural&&p.andares>=3&&p.W).sort((a,b)=>(b.yTopo||0)-(a.yTopo||0));
  for(const i of[0,2,5]){const p=altos[i];if(!p)continue;const k=(p.id*0.618)%1;
    RUINA.fumacas.push({x:(p.x0+p.x1)/2+(k-0.5)*p.W*0.4,z:(p.z0+p.z1)/2+((k*7)%1-0.5)*p.D*0.4,y:(p.yTopo||10)+1.2,acc:0,taxa:1.6+k});}
  RUINA.pronto=true;}
{const _g=gerarCidade;gerarCidade=function(){const r=_g.apply(this,arguments);try{ruinaMontar();}catch(e){console.error('fumaça da cidade',e);}return r;};}
PASSOS.push(function ruinaPasso(dt){if(!RUINA.fumacas.length||G.modo!=='jogo')return;dt=Math.min(dt,0.1);
  const w=(typeof E!=='undefined'&&E.wind)?E.wind:[0.6,0.2];
  for(const f of RUINA.fumacas){if(d2(f.x,f.z,cam.pos[0],cam.pos[2])>280*280)continue;f.acc+=dt*f.taxa;
    while(f.acc>=1){f.acc-=1;const g=0.1+Math.random()*0.06;
      part(f.x+(Math.random()-0.5)*1.6,f.y+Math.random()*0.6,f.z+(Math.random()-0.5)*1.6,w[0]*0.7+(Math.random()-0.5)*0.4,1.1+Math.random()*0.8,w[1]*0.7+(Math.random()-0.5)*0.4,
        8+Math.random()*4,1.7+Math.random()*1.4,[g,g*0.95,g*0.9,0.3],false,-0.18);}}});
