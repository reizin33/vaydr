"""p84: o Colosso (chefão da lua de sangue)."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,Z=n.Z;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes], js("window.__turbo=1;window.__semRender=false;"), ["wait", 3.0], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
prep = ("G.chuva=0;Z.length=0;P.x=n.FIRE[0]+6;P.z=n.FIRE[2]+16;P.y=n.chaoEm(P.x,P.z,5);P.vx=P.vz=0;P.yaw=0;P.body=0;P.pitch=0.05;P.alive=true;P.vida=100;P.energia=100;"
        "P.inv.fill(null);P.inv[0]={id:'arco',n:1,dur:140};P.inv[1]={id:'molotov',n:4};P.inv[6]={id:'flecha',n:20};P.sel=0;n.hudBarra();")
B = "const b=n.chefeVivo();"
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';"),
         js(prep + "G.hora=22.2;G.noite=true;G.luaSangue=true;G.chefeVeio=false;G.ondas=[];"), ["gwait", 0.6],
         ev("nasceu", B + "return{ok:!!b,dist:b&&+Math.hypot(b.x-P.x,b.z-P.z).toFixed(1),hp:b&&b.hp,s:b&&b.ch.s,barra:!document.getElementById('chefe').hidden,fase:b&&b.chefe.fase};"),
         ["gwait", 1.0], ev("rugiu", B + "return{fase:b&&b.chefe.fase,cdRug:b&&+b.chefe.cdRug.toFixed(1),aneis:n.RINGS.length};")]
# trazer para 12 m na frente e fotografar
steps += [js(B + "b.x=P.x+1.5;b.z=P.z+12;b.y=n.chaoEm(b.x,b.z,P.y+2);b.chefe.cdPisao=99;b.chefe.cdInv=99;b.chefe.cdRug=99;b.chefe.fase=null;b.st='caca';"), ["gwait", 0.3]]
steps += foto("250_colosso.png", "const b=n.chefeVivo();P.yaw=Math.atan2(b.x-P.x,b.z-P.z);P.body=P.yaw;P.pitch=0.12;", 0.2)
# pisão com o jogador no chão perto
steps += [js(B + "b.x=P.x;b.z=P.z+3.2;b.y=n.chaoEm(b.x,b.z,P.y+2);b.st='caca';b.chefe.fase=null;b.chefe.cdPisao=0;b.chefe.cdInv=99;b.chefe.cdRug=99;P.vida=100;P.noChao=true;window.__turbo=1;"),
          ["gwait", 0.6, 60], ev("pisao_ini", B + "return{fase:b.chefe.fase,t:+b.chefe.t.toFixed(2)};"), js("G.modo='pausa';")]
steps += foto("251_pisao_prep.png", "const b=n.chefeVivo();G.camFix={pos:[P.x+5,P.y+2.5,P.z-1],tgt:[b.x,b.y+2,b.z]};", 0.05)
steps += foto("253_olhos.png", "const b=n.chefeVivo();G.camFix={pos:[b.x+Math.sin(b.ch.yaw)*4,b.y+4.2,b.z+Math.cos(b.ch.yaw)*4],tgt:[b.x,b.y+3.6,b.z]};", 0.02)
steps += [js("G.camFix=null;G.modo='jogo';window.__turbo=1;"), ["until", "__nnc.chefeVivo()&&__nnc.chefeVivo().chefe.bateu", 60], ev("pisao_dano", B + "return{vida:Math.round(P.vida),fase:b.chefe.fase,dist:+Math.hypot(b.x-P.x,b.z-P.z).toFixed(1)};"),
          js(B + "P.x-=8;P.y=n.chaoEm(P.x,P.z,P.y+1);b.chefe.cdPisao=99;window.__turbo=6;")]
# pisão pulando na hora certa
steps += [js(B + "b.x=P.x;b.z=P.z+3.2;b.y=n.chaoEm(b.x,b.z,P.y+2);b.chefe.fase='pisao';b.chefe.t=0;b.chefe.bateu=false;P.vida=100;P.vx=P.vz=0;"),
          js("window.__turbo=1;window.__pulou=0;window.__cadaPasso=()=>{const b=n.chefeVivo();if(b&&b.chefe.fase==='pisao'&&b.chefe.t>0.86&&P.noChao&&!window.__pulou){window.__pulou=1;P.vy=4.8;P.noChao=false;}};"),
          ["until", "__nnc.chefeVivo()&&__nnc.chefeVivo().chefe.bateu", 90], js("window.__cadaPasso=null;window.__turbo=6;"),
          ev("pisao_pulo", B + "return{vida:Math.round(P.vida),bateu:b.chefe.bateu};")]
# investida: jogador a 16 m em campo aberto
steps += [js(B + "P.alive=true;b.chefe.fase=null;b.chefe.cdPisao=99;b.chefe.cdRug=99;b.chefe.cdInv=0;b.st='caca';b.viu=0;b.x=P.x;b.z=P.z+16;b.y=n.chaoEm(b.x,b.z,P.y+2);P.vida=100;"), ["gwait", 0.4],
          ev("inv_ini", B + "return{fase:b.chefe.fase,dist:+Math.hypot(b.x-P.x,b.z-P.z).toFixed(1)};"), ["gwait", 2.4],
          ev("inv_fim", B + "return{fase:b.chefe.fase,st:b.st,dist:+Math.hypot(b.x-P.x,b.z-P.z).toFixed(1),vida:Math.round(P.vida)};")]
# fogo machuca mais
steps += [js(B + "b.chefe.fase=null;b.chefe.cdPisao=99;b.chefe.cdInv=99;b.st='atordoado';b.t=5;b.x=P.x+3;b.z=P.z+20;b.y=n.chaoEm(b.x,b.z,P.y+2);window.__hp0=b.hp;n.acender(b,3);"), ["gwait", 1.0],
          ev("fogo", B + "return{perdeu:Math.round(window.__hp0-b.hp),queima:+(b.queima||0).toFixed(1)};")]
# derrubar: vida baixa e uma flecha
steps += [js(B + "P.alive=true;P.vida=100;b.hp=40;b.queima=0;b.st='atordoado';b.t=5;const dx=b.x-n.cam.pos[0],dz=b.z-n.cam.pos[2],dy=(b.y+2.2)-n.cam.pos[1];P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=Math.atan2(dy,Math.hypot(dx,dz));"),
          ["gwait", 0.3], js(B + "const dx=b.x-n.cam.pos[0],dz=b.z-n.cam.pos[2],dy=(b.y+2.2)-n.cam.pos[1];P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=Math.atan2(dy,Math.hypot(dx,dz));n.IN.attack=true;n.IN.atkQ=true;"),
          ["gwait", 0.9], js("n.IN.attack=false;"), ["gwait", 1.5], js("const b=Z.find(z=>z.tipo==='colosso');if(b&&b.vivo)n.ferirZ(b,200,0,0,0);"), ["gwait", 0.5],
          ev("morto", "const b=Z.find(z=>z.tipo==='colosso');return{vivo:b&&b.vivo,st:b&&b.st,drops:n.DROPS.map(d=>d.itens.map(i=>i[0]+':'+i[1]).join(',')),barra:!document.getElementById('chefe').hidden,log:n.FLOG.slice(-2).map(e=>e.m)};")]
plan = [["desk", {"viewport": {"width": 1280, "height": 720}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p84.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
