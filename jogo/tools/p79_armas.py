"""p79: Akai segurando armas (machado parado, golpe congelado, pistola mirando) — confere o encaixe da mão."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G;"
     "const cam=(dx,dy,dz,tx,ty,tz)=>{G.camFix={pos:[P.x+dx,P.y+dy,P.z+dz],tgt:[P.x+tx,P.y+ty,P.z+tz]};};")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3, congela=False):
    s=[js(c), ["gwait", antes]]
    if congela: s+=[js("G.modo='pausa';")]
    s+=[js("window.__turbo=1;window.__semRender=false;"), ["wait", 3], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
    if congela: s+=[js("G.modo='jogo';")]
    return s
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("G.hora=11;n.Z.length=0;P.x=n.FIRE[0]+4;P.z=n.FIRE[2]-5;P.y=n.chaoEm(P.x,P.z,1);P.vy=0;P.yaw=0;P.body=0;document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';"
            "P.inv[0]={id:'machado',n:1,dur:170};P.inv[1]={id:'pistola',n:1,mun:8};P.sel=0;"), ["gwait", 0.5]]
steps += foto("224_machado.png", "P.yaw=0;P.body=0;cam(2.4,1.3,1.0,0,1.0,0);")
steps += foto("225_golpe.png", "P.acao={tipo:'golpe',t:0.18,dur:0.56,vertical:true,arma:P.inv[0],mira:null};", antes=0.05, congela=True)
steps += foto("226_pistola.png", "P.acao=null;P.sel=1;P.aim=1;cam(2.2,1.5,-1.2,0,1.2,1.5);", antes=0.3, congela=True)
steps += [js("G.camFix=null;")]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p79.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
