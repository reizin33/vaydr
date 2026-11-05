"""p68b: refaz as fotos com enquadramento melhor: fumaça (de dentro), painel solto (antes e depois), prancha entre telhados (vista de cima)."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],"
     "por=(p,u,v,y)=>{const w=W(p,u,v);P.x=w[0];P.z=w[1];P.y=y;P.vy=0;P.vx=P.vz=0;P.escala=null;P.noChao=true;},"
     "mira=(x,z,pit)=>{const a=Math.atan2(x-P.x,z-P.z);P.yaw=a;P.body=a;P.pitch=pit||0;},"
     "au=C.predios[0],of=C.predios[4],ce=C.predios[1];")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes], js("n.Z.length=0;window.__turbo=0;window.__semRender=false;"), ["wait", 3], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("G.hora=10;n.Z.length=0;for(const[k,q]of[['tabuas',20],['pregos',20],['corda',4]])n.invAdd(k,q);document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);"), ["gwait", 0.3]]
steps += foto("199_fumaca.png", "n.cfg.cam='1';const f=C.fumacas[0];por(of,f.u-1.6,f.v-1.1,of.y0);mira(f.x,f.z,-0.12);P.lanterna=true;", antes=6)
steps += foto("200_painel.png", "P.fumaca=0;n.cfg.cam='1';const c=au.esconderijoC,fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);P.x=c.x+fx*1.3;P.z=c.z+fz*1.3;P.y=c.sala.y;P.vy=0;mira(c.x,c.z,-0.25);P.lanterna=true;")
steps += foto("200b_painel_aberto.png", "const c=au.esconderijoC;n.painelExaminar(c);")
steps += [js("P.lanterna=false;n.cfg.cam='3';P.x=241.5;P.z=33.4;P.y=ce.yTopo;P.vy=0;P.yaw=0;P.body=0;n.modoObra(true);n.OBRA.tipo='prancha';n.OBRA.ctx=n.contextoObra();n.obraAlvo();n.colocarObra();n.modoObra(false);"), ["gwait", 0.3]]
steps += foto("201_prancha.png", "P.x=241.5;P.z=36.6;P.y=n.chaoEm(241.5,36.6,ce.yTopo+1.4);P.vy=0;P.yaw=0;P.body=0;G.camFix={pos:[236.4,18.2,29.6],tgt:[241.6,14.0,37.2]};")
steps += [js("G.camFix=null;")]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p68b.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
