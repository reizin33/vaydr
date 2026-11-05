"""p82d: diagnóstico da mata (235) — liga/desliga raios, AO, bloom."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.4):
    return [js(c), ["gwait", antes], js("window.__turbo=1;window.__semRender=false;"), ["wait", 3.0], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
cena = "G.hora=17.2;n.Z.length=0;P.x=n.FIRE[0]-10;P.z=n.FIRE[2]-30;P.y=n.chaoEm(P.x,P.z,1);G.camFix=null;P.pitch=0.12;const s=n.E().sun;const a=Math.atan2(s[0],s[2]);P.yaw=a;P.body=a;"
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='ultra';n.aplicarCfg&&n.aplicarCfg();G.chuva=0;n.Z.length=0;document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';"), ["gwait", 0.3]]
steps += foto("d1_tudo.png", cena)
steps += [ev("env", "const e=n.E();return{sun:e.sun,sunV:e.sunV,fogD:e.fogD,exp:e.exp,fog:e.fog,cloud:e.cloud};")]
steps += foto("d2_semraios.png", "n.GRAF.ultra.raios=0;" + cena)
steps += foto("d3_semao.png", "n.GRAF.ultra.raios=0;n.GRAF.ultra.ssao=0;" + cena)
steps += foto("d4_sembloom.png", "n.GRAF.ultra.raios=0;n.GRAF.ultra.ssao=0;n.GRAF.ultra.bloom=0;" + cena)
plan = [["desk", {"viewport": {"width": 1280, "height": 720}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p82d.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
