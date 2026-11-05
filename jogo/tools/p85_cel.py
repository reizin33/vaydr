"""p85: celular deitado com o arco puxado pelo botão e o Colosso por perto (barra de vida); PC com folhas caindo e campo de visão."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,Z=n.Z;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3, w=3.0):
    return [js(c), ["gwait", antes], js("window.__turbo=1;window.__semRender=false;"), ["wait", w], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
prep = ("G.chuva=0;Z.length=0;P.x=n.FIRE[0]+6;P.z=n.FIRE[2]+16;P.y=n.chaoEm(P.x,P.z,5);P.vx=P.vz=0;P.yaw=0;P.body=0;P.pitch=0.05;P.alive=true;P.vida=100;P.energia=100;"
        "P.inv.fill(null);P.inv[0]={id:'arco',n:1,dur:140};P.inv[1]={id:'molotov',n:4};P.inv[6]={id:'flecha',n:20};P.sel=0;n.hudBarra();")
cel = [["wait", 2], ["tap", "#m-novo"], ["wait", 1.5],
       js(prep + "G.hora=22.2;G.noite=true;G.luaSangue=true;G.chefeVeio=true;n.criarChefe(P.x+2,P.z+14);"), ["gwait", 0.5],
       js("const b=n.chefeVivo();b.chefe.cdPisao=99;b.chefe.cdInv=99;b.chefe.cdRug=99;b.st='atordoado';b.t=60;")]
cel += [["eval", "botao", "(()=>{const b=document.getElementById('a-atacar').getBoundingClientRect();window.__ab=[b.x+b.width/2,b.y+b.height/2];return{rot:document.getElementById('a-atacar-l').textContent,ico:document.getElementById('a-atacar-i').getAttribute('href'),x:Math.round(window.__ab[0]),y:Math.round(window.__ab[1])};})()"]]
cel += foto("255_cel_chefe.png", "", 0.1)
pc = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
      js("n.cfg.graf='ultra';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';n.cfg.fov=1.2;"),
      js(prep + "G.hora=16.8;P.inv.fill(null);n.hudBarra();"), ["gwait", 4.0],
      ev("folhas", "return{folhas:n.FOLHAS?n.FOLHAS.length:-1,fov:+n.cam.fov.toFixed(3)};")]
pc += foto("256_folhas_fov.png", "", 0.1)
plan = [["cel", {"viewport": {"width": 844, "height": 390}, "has_touch": True, "is_mobile": True, "device_scale_factor": 2}, cel],
        ["desk", {"viewport": {"width": 1280, "height": 720}}, pc]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p85.json'), 'w'), ensure_ascii=False)
print('ok', len(cel) + len(pc))
