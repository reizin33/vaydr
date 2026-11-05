"""p83: arco e flecha, molotov e fogo."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,Z=n.Z;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes], js("window.__turbo=1;window.__semRender=false;"), ["wait", 3.0], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
prep = ("G.hora=11;G.chuva=0;Z.length=0;P.x=n.FIRE[0]+6;P.z=n.FIRE[2]+14;P.y=n.chaoEm(P.x,P.z,5);P.vx=P.vz=0;P.yaw=0;P.body=0;P.pitch=-0.02;P.alive=true;"
        "P.inv.fill(null);P.inv[0]={id:'arco',n:1,dur:140};P.inv[1]={id:'molotov',n:4};P.inv[6]={id:'flecha',n:20};P.sel=0;n.hudBarra();P.energia=100;P.vida=100;")
mira_z = ("const zz=window.__zz,dx=zz.x-n.cam.pos[0],dz=zz.z-n.cam.pos[2],dy=(zz.y+(zz.st==='dorme'?0.9:1.25))-n.cam.pos[1];P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=Math.atan2(dy,Math.hypot(dx,dz));")
vivo = ev("vivo%d", "return{alive:P.alive,vida:Math.round(P.vida),fl:n.invCount('flecha')};")
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';"),
         js(prep), ["gwait", 0.5]]
# 0) arco puxado (sem zumbi), vista de lado e de trás
steps += [js("n.IN.attack=true;n.IN.atkQ=true;"), ["gwait", 0.3], ev("puxando", "return{acao:P.acao&&P.acao.tipo,puxa:P.acao&&+P.acao.puxa.toFixed(2),aim:+P.aim.toFixed(2)};"), ["gwait", 0.6]]
steps += foto("240_arco_lado.png", "G.camFix={pos:[P.x+2.6,P.y+1.6,P.z+1.0],tgt:[P.x,P.y+1.3,P.z+0.3]};", 0.05)
steps += foto("240b_arco_tras.png", "G.camFix={pos:[P.x-0.9,P.y+1.9,P.z-2.6],tgt:[P.x,P.y+1.3,P.z+2]};", 0.05)
steps += [js("G.camFix=null;n.IN.attack=false;"), ["gwait", 0.6], ev("chao0_log", "return n.FLOG.slice(-3);")]
# 1) zumbi deitado a 16 m: três flechas
steps += [js("const zz=n.criarZ('walker',P.x,P.z+16,{st:'dorme'});zz.hp=150;zz.hpMax=150;window.__zz=zz;"), ["gwait", 0.3], js(mira_z), ["gwait", 0.3], js(mira_z), ["gwait", 0.1]]
for k in range(3):
    # o teste mede as flechas, não a sobrevivência: entre um passo e outro o tempo de jogo pode correr bem mais que o pedido
    # (o zumbi chegava e matava o jogador parado), então a vida volta a 100 a cada flecha
    steps += [js(mira_z + "P.vida=100;"), ["gwait", 0.05], js("n.IN.attack=true;n.IN.atkQ=true;"), ["gwait", 0.85], js(mira_z + "P.vida=100;"), ["gwait", 0.05], js("n.IN.attack=false;"), ["gwait", 0.7],
              ev("tiro%d" % k, "const zz=window.__zz;return{hp:Math.round(zz.hp),vivo:zz.vivo,st:zz.st,dist:+Math.hypot(zz.x-P.x,zz.z-P.z).toFixed(1),cravadas:(zz.flechas||[]).length,flechas:n.invCount('flecha'),alive:P.alive,log:n.FLOG.slice(-2).map(e=>e.m)};")]
steps += [["gwait", 0.6], ev("mata", "const zz=window.__zz;return{vivo:zz.vivo,drops:n.DROPS.map(d=>d.itens.map(i=>i[0]+':'+i[1]).join(',')),flechas:n.invCount('flecha')};")]
# 2) flecha no chão: atira para baixo, anda até ela e recolhe
steps += [js("Z.length=0;P.yaw=0.4;P.body=0.4;P.pitch=-0.42;"), ["gwait", 0.2], js("n.IN.attack=true;n.IN.atkQ=true;"), ["gwait", 0.9], js("n.IN.attack=false;"), ["gwait", 1.2],
          ev("chao", "const f=n.FLECHAS.find(f=>!f.voa);window.__fc=f;return{cravadas:n.FLECHAS.filter(f=>!f.voa).length,onde:f&&f.onde,dist:f&&+Math.hypot(f.x-P.x,f.z-P.z).toFixed(1),quebrou:f&&!!f.quebrou,flechas:n.invCount('flecha'),log:n.FLOG.slice(-2)};")]
steps += foto("245_flecha_chao.png", "const f=window.__fc;if(f)G.camFix={pos:[f.x+1.2,f.y+1.0,f.z-1.2],tgt:[f.x,f.y+0.2,f.z]};", 0.05)
steps += [js("G.camFix=null;const f=window.__fc;if(f){f.quebrou=false;P.x=f.x+0.3;P.z=f.z;P.y=n.chaoEm(P.x,P.z,f.y+1);}"), ["gwait", 0.3],
          ev("recolhe", "return{flechas:n.invCount('flecha'),restam:n.FLECHAS.length};")]
# 3) primeira pessoa com o arco puxado
steps += [js(prep + "n.cfg.cam='1';P.pitch=0;"), ["gwait", 0.2], js("n.IN.attack=true;n.IN.atkQ=true;"), ["gwait", 0.9]]
steps += foto("241_arco_1p.png", "", 0.02)
steps += [js("n.IN.attack=false;n.cfg.cam='3';"), ["gwait", 0.5]]
# 4) molotov: quatro zumbis dormindo a 11 m; o arco do voo aparece; joga
steps += [js(prep + "P.sel=1;n.hudBarra();Z.length=0;n.FLECHAS.length=0;for(let i=0;i<4;i++){const z=n.criarZ('walker',P.x+(i%2)*1.2-0.6,P.z+11+Math.floor(i/2)*1.1,{st:'dorme'});z.hp=60;z.hpMax=60;}window.__zz=Z[0];"),
          ["gwait", 0.3], js(mira_z + "P.pitch-=0.02;"), ["gwait", 0.3], js(mira_z + "P.pitch-=0.02;n.IN.aim=true;"), ["gwait", 0.4]]
steps += foto("242_molotov_mira.png", "", 0.02)
steps += [js("n.IN.attack=true;n.IN.atkQ=true;"), ["gwait", 0.1], js("n.IN.attack=false;n.IN.aim=false;"), ["gwait", 0.35],
          ev("voando", "return{garrafas:n.ARREMESSOS.length,molotov:n.invCount('molotov'),acao:P.acao&&P.acao.tipo};"), ["gwait", 1.0],
          ev("fogo", "const c=n.CHAMAS[0];return{chamas:n.CHAMAS.length,queimando:Z.filter(z=>z.queima>0).length,hp:Z.map(z=>Math.round(z.hp)),c:c&&{dz:+(c.z-P.z).toFixed(1),dx:+(c.x-P.x).toFixed(1)}};")]
steps += foto("243_fogo.png", "G.camFix={pos:[P.x+4,P.y+3.0,P.z+4],tgt:[P.x,P.y+0.8,P.z+11]};", 0.2)
steps += [js("G.camFix=null;"), ["gwait", 4.0], ev("queima", "return{hp:Z.map(z=>Math.round(z.hp)),vivos:Z.filter(z=>z.vivo).length,queimando:Z.filter(z=>z.queima>0).length,alive:P.alive,vida:Math.round(P.vida)};")]
# 5) o jogador entra no fogo e depois rola para apagar
steps += [js("Z.length=0;P.alive=true;n.quebrarMolotov(P.x,P.y,P.z+3);"), ["gwait", 0.6], js("const c=n.CHAMAS[n.CHAMAS.length-1];P.x=c.x;P.z=c.z;P.y=n.chaoEm(P.x,P.z,c.y+1);P.vida=100;"), ["gwait", 1.2],
          ev("jogador", "return{queima:+(P.queima||0).toFixed(2),vida:Math.round(P.vida)};"),
          js("P.x+=7;P.y=n.chaoEm(P.x,P.z,P.y+1);P.queima=1.4;P.vx=0;P.vz=4;P.yaw=0;P.body=0;n.IN.mz=1;n.IN.run=true;"), ["gwait", 0.1],
          js("n.rolar();"), ["gwait", 0.3], ev("rolou", "return{queima:+(P.queima||0).toFixed(2),rola:!!P.rola,vida:Math.round(P.vida)};"), js("n.IN.mz=0;n.IN.run=false;")]
# 6) noite: fogo iluminando a mata
steps += [js("G.hora=21.5;n.CHAMAS.length=0;"), ["gwait", 0.2], js("n.quebrarMolotov(P.x+2,P.y,P.z+6);const z=n.criarZ('walker',P.x+2.5,P.z+6.5,{st:'dorme'});z.hp=999;"), ["gwait", 0.8]]
steps += foto("244_fogo_noite.png", "G.camFix={pos:[P.x-3,P.y+2.6,P.z-2],tgt:[P.x+2,P.y+0.6,P.z+6]};", 0.1)
steps += [js("G.camFix=null;G.hora=11;")]
plan = [["desk", {"viewport": {"width": 1280, "height": 720}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p83.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
