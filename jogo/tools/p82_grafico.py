"""p82: gráficos de PC — sombras em cascata na cidade, oclusão de ambiente, raios de sol na mata, interior."""
import json, os, sys
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.4):
    return [js(c), ["gwait", antes], js("window.__turbo=1;window.__semRender=false;"), ["wait", 3.5], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
graf = sys.argv[1] if len(sys.argv) > 1 else 'ultra'
suf = '' if graf == 'ultra' else '_' + graf
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='%s';n.aplicarCfg&&n.aplicarCfg();G.chuva=0;n.Z.length=0;document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';" % graf), ["gwait", 0.3],
         ev("cfg", "return{graf:n.cfg.graf};")]
steps += foto("234_cidade%s.png" % suf, "G.hora=16.3;n.Z.length=0;P.x=198;P.z=8;P.y=n.chaoEm(198,8,1);P.yaw=Math.PI/2;P.body=P.yaw;G.camFix={pos:[201,2.4,-4.2],tgt:[262,1.5,-2]};")
steps += foto("235_mata_raios%s.png" % suf, "G.hora=17.2;n.Z.length=0;P.x=n.FIRE[0]-10;P.z=n.FIRE[2]-30;P.y=n.chaoEm(P.x,P.z,1);G.camFix=null;P.pitch=0.12;const s=n.E?n.E.sun:null;if(s){const a=Math.atan2(s[0],s[2]);P.yaw=a;P.body=a;}")
steps += foto("236_interior%s.png" % suf, "G.hora=12;G.camFix=null;n.cfg.cam='1';const p=C.predios[0],s=p.salas[1].find(q=>q.tipo==='apartamento');const w=[p.ox+(s.u0+0.4)*p.c+(s.v0+0.4)*p.s,p.oz-(s.u0+0.4)*p.s+(s.v0+0.4)*p.c];P.x=w[0];P.z=w[1];P.y=s.y;P.vy=0;const t=[p.ox+s.u1*p.c+s.v1*p.s,p.oz-s.u1*p.s+s.v1*p.c];const a=Math.atan2(t[0]-P.x,t[1]-P.z);P.yaw=a;P.body=a;P.pitch=-0.15;")
steps += [ev("hora","return{h:G.hora};"),js("G.camFix=null;n.cfg.cam='3';")]
plan = [["desk", {"viewport": {"width": 1280, "height": 720}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p82%s.json' % suf), 'w'), ensure_ascii=False)
print('ok', len(steps))
