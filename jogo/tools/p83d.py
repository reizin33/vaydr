"""p83d: o que mata o jogador entre a 2ª e a 3ª flecha do p83 (registra cada dano)."""
import json
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,Z=n.Z,X=s=>n.ev(s),r2=v=>Math.round(v*100)/100;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
prep = ("G.hora=11;G.chuva=0;Z.length=0;P.x=n.FIRE[0]+6;P.z=n.FIRE[2]+14;P.y=n.chaoEm(P.x,P.z,5);P.vx=P.vz=0;P.yaw=0;P.body=0;P.pitch=-0.02;P.alive=true;"
        "P.inv.fill(null);P.inv[0]={id:'arco',n:1,dur:140};P.inv[1]={id:'molotov',n:4};P.inv[6]={id:'flecha',n:20};P.sel=0;n.hudBarra();P.energia=100;P.vida=100;")
mira_z = ("const zz=window.__zz,dx=zz.x-n.cam.pos[0],dz=zz.z-n.cam.pos[2],dy=(zz.y+(zz.st==='dorme'?0.9:1.25))-n.cam.pos[1];P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=Math.atan2(dy,Math.hypot(dx,dz));")
GANCHO = ("n.ev(\"window.__D=[];window.__fj0=ferirJogador;ferirJogador=function(d,src){const v0=P.vida;window.__fj0(d,src);window.__D.push({t:Math.round(G.t*100)/100,d:Math.round(d*10)/10,perdeu:Math.round((v0-P.vida)*10)/10,vida:Math.round(P.vida),src:src?(src.tipo||'?')+(src.st?':'+src.st:''):null,stack:(new Error().stack||'').split('\\\\n').slice(2,5).map(s=>s.trim().slice(0,60))});};"
          "window.__mo0=morrer;morrer=function(){window.__D.push({t:Math.round(G.t*100)/100,morreu:true,vida:Math.round(P.vida),fome:Math.round(P.fome),sede:Math.round(P.sede),stack:(new Error().stack||'').split('\\\\n').slice(2,6).map(s=>s.trim().slice(0,60))});return window.__mo0.apply(this,arguments);};\");")
LOG = "window.__V=window.__V||[];const zz=window.__zz;window.__V.push({t:r2(G.t),vida:Math.round(P.vida),alive:P.alive,zst:zz&&zz.st,zd:zz&&r2(Math.hypot(zz.x-P.x,zz.z-P.z))});"
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';"),
         js("window.__turbo=6;window.__semRender=true;"), ["gwait", 0.3], js(prep), ["gwait", 0.5], js(GANCHO),
         js("const zz=n.criarZ('walker',P.x,P.z+16,{st:'dorme'});zz.hp=150;zz.hpMax=150;window.__zz=zz;"), ["gwait", 0.3], js(mira_z), ["gwait", 0.3], js(mira_z), ["gwait", 0.1]]
for k in range(3):
    steps += [js(mira_z + LOG), ["gwait", 0.05], js("n.IN.attack=true;n.IN.atkQ=true;"), ["gwait", 0.85], js(mira_z + LOG), ["gwait", 0.05], js("n.IN.attack=false;"), ["gwait", 0.35], js(LOG), ["gwait", 0.35], js(LOG)]
steps += [ev("danos", "return{danos:window.__D,vida:window.__V,dif:n.cfg.dif};")]
json.dump([["desk", {"viewport": {"width": 1280, "height": 720}}, steps]], open('p83d.json', 'w'))
print('ok', len(steps))
