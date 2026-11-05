"""p86: arco em primeira pessoa (descansado e puxado) e flecha fincada no chão."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,Z=n.Z;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes], js("window.__turbo=1;window.__semRender=false;"), ["wait", 3.0], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
prep = ("G.hora=11;G.chuva=0;Z.length=0;P.x=n.FIRE[0]+6;P.z=n.FIRE[2]+14;P.y=n.chaoEm(P.x,P.z,5);P.vx=P.vz=0;P.yaw=0;P.body=0;P.pitch=-0.02;P.alive=true;"
        "P.inv.fill(null);P.inv[0]={id:'arco',n:1,dur:140};P.inv[6]={id:'flecha',n:20};P.sel=0;n.hudBarra();P.energia=100;P.vida=100;")
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='1';"), js(prep), ["gwait", 0.5]]
steps += foto("257_arco_1p_parado.png", "", 0.05)
steps += [js("n.IN.attack=true;n.IN.atkQ=true;"), ["gwait", 0.9]]
steps += foto("258_arco_1p_puxado.png", "", 0.02)
steps += [js("n.IN.attack=false;n.cfg.cam='3';P.yaw=0.4;P.body=0.4;P.pitch=-0.5;"), ["gwait", 0.3], js("n.IN.attack=true;n.IN.atkQ=true;"), ["gwait", 0.9], js("n.IN.attack=false;"), ["gwait", 1.0],
          ev("chao", "const f=n.FLECHAS.find(f=>!f.voa&&f.onde==='chao');window.__fc=f;return f?{dy:+f.dy.toFixed(2),onde:f.onde}:null;")]
steps += foto("259_flecha_fincada.png", "const f=window.__fc;if(f)G.camFix={pos:[f.x+1.1,f.y+0.8,f.z-1.0],tgt:[f.x,f.y+0.15,f.z]};", 0.05)
steps += [js("G.camFix=null;")]
plan = [["desk", {"viewport": {"width": 1280, "height": 720}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p86.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
