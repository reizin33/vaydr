"""p81: rolamento (esquiva com invulnerabilidade), subir em carro e contêiner, chegada no topo da escada, zumbi morto deitado,
zumbi dormindo deitado que levanta antes de atacar, zumbi saindo da terra; fotos no meio de cada movimento."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,r2=v=>Math.round(v*100)/100;"
     "const cam=(dx,dy,dz,tx,ty,tz)=>{G.camFix={pos:[P.x+dx,P.y+dy,P.z+dz],tgt:[P.x+tx,P.y+ty,P.z+tz]};};"
     "const lado=(o,hw,dist)=>{const c=Math.cos(o.yaw),s=Math.sin(o.yaw);P.x=o.x+c*(hw+dist);P.z=o.z-s*(hw+dist);P.y=n.chaoEm(P.x,P.z,0.5);P.vy=0;P.vx=P.vz=0;const a=Math.atan2(-c,s);P.yaw=a;P.body=a;P.noChao=true;};")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.0):
    return [js(c), ["gwait", antes] if antes else ["wait", 0.01], js("G.modo='pausa';window.__turbo=1;window.__semRender=false;"), ["wait", 3], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;__nnc.G.modo='jogo';"]]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("G.hora=11;G.chuva=0;n.Z.length=0;document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';P.x=n.FIRE[0]+6;P.z=n.FIRE[2]-6;P.y=n.chaoEm(P.x,P.z,1);P.yaw=0;P.body=0;"), ["gwait", 0.3],
 # ---------- rolamento ----------
 js("window.__turbo=1;P.energia=100;window.__x0=P.x;window.__z0=P.z;"),
 ["down", "ShiftLeft"], ["down", "w"], ["wait", 0.6], ["press", "c"],
 ev("rola_inicio", "return{rola:!!P.rola,energia:Math.round(P.energia),dur:P.rola&&r2(P.rola.dur)};"),
 ["wait", 0.35],
]
steps += foto("230_rolamento.png", "cam(2.6,1.2,1.2,0,0.5,0.6);")
# o rolamento dura 1,14 s de jogo; com a foto no meio (desenho por software) o tempo de jogo anda devagar, então espera ele acabar
steps += [["wait", 1.2], ["up", "w"], ["up", "ShiftLeft"], js("window.__turbo=6;"), ["until", "!__nnc.P.rola", 60], ["gwait", 0.4],
 ev("rola_fim", "return{rola:!!P.rola,andou:r2(Math.hypot(P.x-window.__x0,P.z-window.__z0)),invul:P.invul||0};"),
 # invulnerável no meio do giro: zumbi que acerta durante o rolamento não tira vida
 js("P.vida=100;P.energia=100;P.vx=0;P.vz=4;P.yaw=0;P.body=0;n.rolar&&0;"),
 ev("rola_invul", "P.vx=0;P.vz=5;P.noChao=true;const ok=n.rolar();P.rola.t=P.rola.dur*0.4;const v0=P.vida;n.ferirJogador(30,{x:P.x,z:P.z});return{rolou:ok,vidaAntes:v0,vidaDepois:Math.round(P.vida)};"),
 ["gwait", 1.5],
 # ---------- subir no carro ----------
 js("G.camFix=null;n.Z.length=0;const car=C.props.find(p=>p.k==='carro');window.__car=car;lado(car,0.95,0.45);P.energia=100;"), ["gwait", 0.3],
 ev("carro_alvo", "const a=n.alvoMuro();return a?{dh:r2(a.dh),y:r2(a.y)}:null;"),
 js("n.pular();"),
 ev("carro_comecou", "return{muro:!!P.muro,clip:P.muro&&P.muro.clip};"),
 ["gwait", 0.5],
]
steps += foto("231_muro.png", "cam(2.8,1.6,-1.2,0,0.9,0.4);")
steps += [["gwait", 2.5],
 ev("carro_fim", "const car=window.__car;return{muro:!!P.muro,y:r2(P.y),noChao:P.noChao,dCarro:r2(Math.hypot(P.x-car.x,P.z-car.z))};"),
 # ---------- contêiner (2,6 m) ----------
 js("G.camFix=null;const ct=C.props.find(p=>p.k==='conteiner'&&p.nivel===0&&!C.props.some(q=>q.k==='conteiner'&&q.nivel===1&&Math.hypot(q.x-p.x,q.z-p.z)<0.1));window.__ct=ct;lado(ct,1.25,0.45);P.energia=100;"), ["gwait", 0.3],
 ev("cont_alvo", "const a=n.alvoMuro();return a?{dh:r2(a.dh),y:r2(a.y)}:null;"),
 js("n.pular();"), ["gwait", 3.0],
 ev("cont_fim", "return{muro:!!P.muro,y:r2(P.y)};"),
 # parede de prédio (alta demais) não sobe
 js("const p=C.predios[0];const w=[p.ox+p.uc*p.c+(-0.6)*p.s,p.oz-p.uc*p.s+(-0.6)*p.c];P.x=w[0];P.z=w[1];P.y=n.chaoEm(P.x,P.z,1);const a=Math.atan2(p.s,p.c);P.yaw=a;P.body=a;"), ["gwait", 0.2],
 ev("parede_alvo", "return n.alvoMuro();"),
 # ---------- chegada no topo da escada de mão do mercado ----------
 js("const e=C.escadasExt[0];window.__via=e.via;P.x=e.via.base.x;P.z=e.via.base.z;P.y=e.via.base.y;n.comecarEscalada({v:e.via,u:0});P.escala.u=0.97;"),
 ["down", "w"], ["gwait", 0.6], ["up", "w"],
 ev("topo_comecou", "return{muro:!!P.muro,clip:P.muro&&P.muro.clip,esc:!!P.escala};"),
 ["gwait", 2.5],
 ev("topo_fim", "const v=window.__via;return{muro:!!P.muro,y:r2(P.y),topoY:r2(v.topo.y),d:r2(Math.hypot(P.x-v.topo.x,P.z-v.topo.z))};"),
 # ---------- zumbis ----------
 js("G.camFix=null;n.Z.length=0;P.x=n.FIRE[0]+6;P.z=n.FIRE[2]-6;P.y=n.chaoEm(P.x,P.z,1);P.yaw=0;P.body=0;P.vida=100;"
    "const a=n.criarZ('walker',P.x-1.2,P.z+4.5,{});const b=n.criarZ('runner',P.x+1.4,P.z+5.2,{});n.ferirZ(a,999,0,0,1);n.ferirZ(b,999,0,0,1);"
    "const c=n.criarZ('emboscada',P.x+4,P.z+3,{st:'dorme'});window.__zd=c;const d=n.zLevantar('walker',P.x-3.5,P.z+3.5);window.__zl=d;"), ["gwait", 0.9],
]
steps += foto("232_zumbis_chao.png", "cam(0.4,2.2,-1.6,0,0.2,4.0);")
steps += [
 ev("z_estado", "const zd=window.__zd,zl=window.__zl;return{mortos:n.Z.filter(z=>!z.vivo).map(z=>z.st+':'+(z.ch.sk&&z.ch.sk.clip?z.ch.sk.clip.nome:'-')).join(','),dorme:zd.st+':'+(zd.ch.sk.clip?zd.ch.sk.clip.nome:'-'),sobe:zl.st};"),
 # acordar a emboscada: chega perto, ela levanta antes de atacar
 js("const zd=window.__zd;P.x=zd.x;P.z=zd.z-2.2;P.y=n.chaoEm(P.x,P.z,1);P.vida=100;"), ["gwait", 0.35],
 ev("z_acordou", "const zd=window.__zd;return{st:zd.st,levanta:r2(zd.levanta||0),vida:Math.round(P.vida)};"),
 ["gwait", 2.0],
 ev("z_atacou", "const zd=window.__zd;return{st:zd.st,levanta:r2(zd.levanta||0),vida:Math.round(P.vida)};"),
 js("G.camFix=null;"),
]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p81.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
