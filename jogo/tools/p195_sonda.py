import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=1;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};"),
      ev("cols", "const L=X('colQuery')(336,8,3).filter(c=>c.solid).map(c=>({t:c.t,x:Math.round(c.x*10)/10,z:Math.round(c.z*10)/10,hw:c.hw,hd:c.hd,r:c.r,y0:c.y0,y1:c.y1,k:Object.keys(c).filter(k=>c[k]===true&&k!=='solid').join(',')}));"
         "return{n:L.length,L:L.slice(0,12),dm:[X('dentroMapa')(335.8,8),X('dentroMapa')(336.3,8),X('dentroMapa')(337,8)],chao:[X('chaoEm')(335.8,8,0.3),X('chaoEm')(336.5,8,0.3),X('chaoEm')(337.5,8,0.3)],g:[X('ground')(335.8,8),X('ground')(336.5,8)]};"),
      js("vai(333,8);P.yaw=Math.PI/2;P.body=P.yaw;window.__xs=[];window.__cadaPasso=()=>{window.__xs.push(Math.round(__nnc.P.x*100)/100+':'+Math.round(__nnc.P.y*100)/100);};"),
      ["down", "KeyW"], ["gwait", 1.5], ["up", "KeyW"],
      ev("andou", "return window.__xs.slice(-25);"),
      js("n.invAdd('vara',1);sel('vara');vai(374,-3.4,0.35);P.yaw=Math.PI;P.body=P.yaw;window.__xs=[];window.__cadaPasso=()=>{const p=__nnc.P.pesca;window.__xs.push(p?('t'+Math.round(p.t*100)/100+' m'+Math.round(p.morde*100)/100+' '+p.mordeu):'nulo:'+Math.round(__nnc.P.x*10)/10+','+Math.round(__nnc.P.z*10)/10+','+__nnc.G.modo);};"),
      ev("pesca", "const a=X('interAtual')();window.__a=a;X('alvoInter=window.__a');X('interagir')(true);const p=P.pesca;if(p)p.morde=0.05;return{a:a&&a.k,p:!!p};"),
      ["gwait", 0.5],
      ev("pescaDepois", "return window.__xs.slice(0,20);")]
salvar('p195.json', s, vp=(960, 540))
