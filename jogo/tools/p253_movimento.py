"""p253 (v10.8.1, Himalaia 19/11: "aproxime o jogo o máximo do real... movimentação, está muito sintético"): movimento com peso.
1 arrancada na disparada (Shift + W): chega em 90% da velocidade entre 0,3 e 0,8 s; o sobrevivente inclina para a frente
2 parada: para em menos de 0,7 s, deslizando entre 0,4 e 1,5 m; inclina para trás
3 andar devagar com a tecla de verdade (Caps Lock): ~1,75 m/s; aperta de novo e volta ao passo normal (4,2)
4 giro parado: a câmera vira 1,6 rad de uma vez e o corpo acompanha sem passar de 3,7 rad/s
5 pouso de 3 m correndo: amortece (perde velocidade)
6 Ajustes > Movimento > Ágil: volta ao jeito de antes (arrancada e parada secas)
7 zumbis caçando (andarilho, corredor, brutamonte): aceleram aos poucos, andam para onde olham, inclinam para a frente e
  chegam no jogador; cada um com seu jeito (velocidade, manco, balanço)"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
REC = ("window.__rec=[];window.__cadaPasso=(dt)=>{const P=__nnc.P;P.fome=100;P.sede=100;if(P.vida<80)P.vida=100;"
       "if(window.__rec.length<6000)window.__rec.push([__nnc.G.t,Math.hypot(P.vx,P.vz),P.ch.pitch,P.ch.roll,P.body,P.yaw,P.y,P.amortece||0,P.noChao?1:0,P.x,P.z,dt]);};")
CORTA = "const r=window.__rec;window.__rec=[];"
# acha um trecho plano e livre de 40 m perto do começo e vira o jogador para ele
# na estrada do começo (a mesma do p235), olhando para +x: reta plana e livre
LUGAR = "const rz=x=>5.6+Math.sin(x*0.045)*3.2;vai(14,rz(14));P.yaw=P.body=Math.PI/2;P.pitch=-0.1;window.__yaw0=P.yaw;"
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;G.hora=10;n.cfg.movimento='realista';" + REC + LUGAR), ["gwait", 0.6]]
# 1 arrancada
s += [js(CORTA + "P.energia=100;"), ["down", "Shift"], ["down", "w"], ["gwait", 1.5],
      ev("arrancada", CORTA + "let i0=r.findIndex(q=>q[1]>0.3);if(i0<0)i0=0;const t0=r[i0][0];let t90=null,pmax=0;for(const q of r){if(t90===null&&q[1]>=6.12)t90=q[0]-t0;pmax=Math.max(pmax,q[2]);}"
         "return{t90:t90===null?null:r2(t90),vmax:r2(Math.max(...r.map(q=>q[1]))),inclinaFrente:r2(pmax),sobrevivente:!!P.ch.surv,quadros:r.length};")]
# 2 parada
s += [["up", "w"], ["up", "Shift"], ["gwait", 1.0],
      ev("parada", CORTA + "let i0=r.findIndex(q=>q[1]<6.6);if(i0<0)i0=0;const t0=r[i0][0];let tp=null,ip=null;for(let i=i0;i<r.length;i++)if(tp===null&&r[i][1]<0.3){tp=r[i][0]-t0;ip=i;}"
         "const d=ip===null?null:Math.hypot(r[ip][9]-r[i0][9],r[ip][10]-r[i0][10]);return{tPara:tp===null?null:r2(tp),desliza:d===null?null:r2(d),inclinaTras:r2(Math.min(...r.map(q=>q[2])))};")]
# 3 andar devagar (Caps Lock)
s += [js("P.yaw=P.body=window.__yaw0+Math.PI;" + CORTA), ["press", "CapsLock"], ["down", "w"], ["gwait", 1.6],
      ev("devagar", CORTA + "const v=r.slice(-20).map(q=>q[1]);return{ligado:!!P.devagar,vel:r2(v.reduce((a,b)=>a+b,0)/v.length),estado:X('SURV').estado};"),
      ["press", "CapsLock"], ["gwait", 1.2],
      ev("normal", CORTA + "const v=r.slice(-20).map(q=>q[1]);return{ligado:!!P.devagar,vel:r2(v.reduce((a,b)=>a+b,0)/v.length)};"), ["up", "w"], ["gwait", 1.0]]
# 4 giro parado
s += [js(CORTA + "P.yaw+=1.6;"), ["gwait", 1.2],
      ev("giro", CORTA + "let w=0;for(let i=1;i<r.length;i++){const dt=r[i-1][11];if(dt>0.004)w=Math.max(w,Math.abs(X('angDiff')(r[i-1][4],r[i][4]))/dt);}"
         "return{wMax:r2(w),falta:r2(Math.abs(X('angDiff')(P.body,P.yaw)))};")]
# 5 pouso de 3 m correndo
s += [js("P.yaw=P.body=window.__yaw0;P.energia=100;"), ["down", "Shift"], ["down", "w"], ["gwait", 1.0], js(CORTA + "P.y+=3;P.noChao=false;P.vy=0;"), ["gwait", 0.9],
      ev("pouso", CORTA + "let L=null;for(let i=1;i<r.length;i++)if(r[i][8]&&!r[i-1][8]){L=i;break;}if(L===null)return{pousou:false};"
         "return{pousou:true,vAntes:r2(r[L-1][1]),vDepois:r2(r[L][1]),amortece:r2(r[L][7]),vMin:r2(Math.min(...r.slice(L,L+25).map(q=>q[1])))};"),
      ["up", "w"], ["up", "Shift"], ["gwait", 1.0]]
# 6 Ágil
s += [js("n.cfg.movimento='agil';P.yaw=P.body=window.__yaw0+Math.PI;P.energia=100;" + CORTA), ["down", "Shift"], ["down", "w"], ["gwait", 1.2],
      ev("agilArrancada", CORTA + "let i0=r.findIndex(q=>q[1]>0.3);if(i0<0)i0=0;const t0=r[i0][0];let t90=null;for(const q of r)if(t90===null&&q[1]>=6.12)t90=q[0]-t0;return{t90:t90===null?null:r2(t90)};"),
      ["up", "w"], ["up", "Shift"], ["gwait", 0.8],
      ev("agilParada", CORTA + "let i0=r.findIndex(q=>q[1]<6.6);if(i0<0)i0=0;const t0=r[i0][0];let tp=null;for(let i=i0;i<r.length;i++)if(tp===null&&r[i][1]<0.3)tp=r[i][0]-t0;return{tPara:tp===null?null:r2(tp)};"),
      js("n.cfg.movimento='realista';")]
# 7 zumbis caçando
s += [js("window.__cadaPasso=(dt)=>{const P=__nnc.P;P.fome=100;P.sede=100;P.vida=100;const R=window.__zrec;if(!R)return;for(const z of __nnc.Z){const a=R[z.id];if(a&&a.length<2000)a.push([__nnc.G.t,z.x,z.z,z.ch.yaw,z.ch.pitch,dt]);}};"
         "Z.length=0;P.invul=999;const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw),rx=-Math.cos(P.yaw),rz=Math.sin(P.yaw);window.__zrec={};"
         "['walker','runner','brute','walker','walker'].forEach((t,i)=>{const x=P.x+fx*14+rx*(i-2)*2.4,z=P.z+fz*14+rz*(i-2)*2.4;const q=ZZ(t,x,z);if(q){q.st='caca';q.viu=0;q.lx=P.x;q.lz=P.z;q.ly=P.y;window.__zrec[q.id]=[];}});"),
      ["gwait", 2.4],
      ev("zumbisCacando", "const R=window.__zrec,o=[];for(const z of Z){const a=R[z.id];if(!a||a.length<10)continue;let des=0,nd=0,pmax=0;const v=[];"
         "for(let i=1;i<a.length;i++){const dt=a[i-1][5];if(!(dt>0.004))continue;const vx=(a[i][1]-a[i-1][1])/dt,vz=(a[i][2]-a[i-1][2])/dt,sp=Math.hypot(vx,vz);v.push(sp);"
         "if(sp>0.5){des+=Math.abs(X('angDiff')(a[i][3],Math.atan2(vx,vz)));nd++;}pmax=Math.max(pmax,a[i][4]);}"
         "const g=z.gait||{};o.push({tipo:z.tipo,st:z.st,v0:r2(v.slice(0,6).reduce((s,q)=>s+q,0)/Math.max(1,Math.min(6,v.length))),vMeio:r2(v.slice(40,70).reduce((s,q)=>s+q,0)/Math.max(1,v.slice(40,70).length)),"
         "desalinho:nd?r2(des/nd):null,inclina:r2(pmax),dist:r2(Math.hypot(z.x-P.x,z.z-P.z)),jeito:{k:r2(g.k||0),manca:r2(g.manca||0),balanca:r2(g.balanca||0)}});}return o;"),
      ["gwait", 6.0],
      ev("zumbisChegaram", "return Z.filter(z=>window.__zrec[z.id]).map(z=>({tipo:z.tipo,st:z.st,dist:r2(Math.hypot(z.x-P.x,z.z-P.z))}));"),
      js("P.invul=0;window.__cadaPasso=null;window.__zrec=null;Z.length=0;")]
salvar('tools/p253_movimento.json', s)
